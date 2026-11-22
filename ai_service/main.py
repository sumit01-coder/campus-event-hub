#!/usr/bin/env python3
"""
CampusAI Python Microservice
============================
A FastAPI microservice that provides advanced NLP, semantic search,
TF-IDF ranking, and event intelligence for CampusEventHub WebMCP.

Endpoints:
  POST /analyze          — Deep NLP analysis (intent + entities + confidence)
  POST /rank             — TF-IDF ranking of events against a query
  POST /recommend        — Content-based event recommendation
  POST /insights         — Statistical insights from event data
  POST /sentiment        — Sentiment analysis on text
  GET  /health           — Health check
"""

import re
import math
import json
import time
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from collections import Counter, defaultdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

# ML Imports (lazy-loaded inside functions if needed, but we init globally for speed)
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_ML = True
except ImportError:
    HAS_ML = False


# ─── LOGGING ────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("campus_ai")

# ─── APP ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="CampusAI Python NLP Service",
    description="Advanced NLP, TF-IDF ranking, and event intelligence for CampusEventHub",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── INTENT MODEL ─────────────────────────────────────────────────────────────

INTENT_PATTERNS: Dict[str, Dict] = {
    "SEARCH_EVENTS": {
        "patterns": [
            r"\b(find|search|show|list|display|get|look for|any)\b.{0,15}\bevent",
            r"\bwhat events?\b",
            r"\bevents?\s+(happening|available|on|today|this week|this month)",
            r"\bexplore events?\b",
        ],
        "keywords": ["find", "search", "show events", "list events", "any events", "what events", "browse"],
        "weight": 1.0,
    },
    "REGISTER": {
        "patterns": [
            r"\b(register|sign up|join|enroll|book|participate|apply)\b",
            r"\bregister (me|for|in)\b",
            r"\bsign me up\b",
            r"\bi want to (join|attend|go)\b",
        ],
        "keywords": ["register", "sign up", "join", "enroll", "book", "participate"],
        "weight": 1.3,
    },
    "CANCEL": {
        "patterns": [
            r"\b(cancel|unregister|withdraw|drop|remove me)\b",
        ],
        "keywords": ["cancel", "unregister", "withdraw", "drop out"],
        "weight": 1.2,
    },
    "MY_EVENTS": {
        "patterns": [
            r"\bmy (past |upcoming )?(events?|schedule|registrations?|tickets?)\b",
            r"\bwhat (am i|have i registered)\b",
            r"\bshow my (past |upcoming )?(events?|schedule)\b",
        ],
        "keywords": ["my events", "my schedule", "my registrations", "what am i attending", "past events", "upcoming events"],
        "weight": 1.0,
    },
    "RECOMMEND": {
        "patterns": [
            r"\b(recommend|suggest|what should i|any good)\b",
            r"\bwhat('s| is) (good|popular|worth attending)\b",
            r"\bbest events?\b",
            r"\bi (like|enjoy|love|am interested in)\b",
        ],
        "keywords": ["recommend", "suggest", "best events", "interested in"],
        "weight": 1.1,
    },
    "CREATE_EVENT": {
        "patterns": [
            r"\b(create|host|organize|set up|make|add)\b.{0,20}\b(event|workshop|seminar|hackathon|tournament|meetup)\b",
            r"\bnew event\b",
        ],
        "keywords": ["create event", "host an event", "organize an event", "set up an event"],
        "weight": 1.4,
    },
    "TRENDING": {
        "patterns": [
            r"\b(trending|popular|most registered|top events?|hot events?)\b",
            r"\bmost attended\b",
        ],
        "keywords": ["trending", "popular", "top events", "most registered"],
        "weight": 1.0,
    },
    "ANALYTICS": {
        "patterns": [
            r"\b(how many|stats?|statistics?|seats? (left|available|remaining)|capacity|attendees?)\b",
            r"\bhow full\b",
        ],
        "keywords": ["how many", "stats", "seats left", "capacity", "attendees"],
        "weight": 1.0,
    },
    "HELP": {
        "patterns": [
            r"\b(help|how do i|what can you|commands|capabilities|guide me)\b",
        ],
        "keywords": ["help", "how do I", "what can you do", "commands"],
        "weight": 0.8,
    },
    "HOSTED_EVENTS": {
        "patterns": [
            r"\bmy (hosted|created|organized) events?\b",
            r"\b(events? i (host|hosted|created|organized))\b",
            r"\b(last|previous) host(ed)? event\b",
            r"\bshows? previous host event\b",
        ],
        "keywords": ["hosted events", "my hosted event", "events i host", "events i created", "last host event", "previous host event"],
        "weight": 1.2,
    },
}

CATEGORY_VOCAB: Dict[str, List[str]] = {
    "technology": ["tech", "technology", "coding", "programming", "software", "computer", "ai", "ml",
                   "data", "cyber", "hackathon", "it", "digital", "developer", "engineering"],
    "cultural": ["cultural", "culture", "art", "music", "dance", "performance", "festival",
                 "theatre", "drama", "fest", "film", "literary"],
    "sports": ["sports", "sport", "game", "tournament", "athletics", "cricket", "football",
               "basketball", "gym", "fitness", "marathon", "race"],
    "workshop": ["workshop", "hands-on", "practical", "lab", "training", "bootcamp", "session", "skill"],
    "seminar": ["seminar", "talk", "lecture", "speaker", "presentation", "conference", "webinar", "panel"],
    "hackathon": ["hackathon", "hack", "build", "innovate", "competition", "challenge", "project", "sprint"],
}

DATE_RESOLVERS = [
    (re.compile(r"\btoday\b", re.I),   lambda: datetime.now().date().isoformat()),
    (re.compile(r"\btomorrow\b", re.I), lambda: (datetime.now() + timedelta(days=1)).date().isoformat()),
    (re.compile(r"\bthis week\b", re.I), lambda: "THIS_WEEK"),
    (re.compile(r"\bnext week\b", re.I), lambda: "NEXT_WEEK"),
    (re.compile(r"\bthis weekend\b", re.I), lambda: "THIS_WEEKEND"),
    (re.compile(r"\bthis month\b", re.I), lambda: "THIS_MONTH"),
    # General fallback for "next X" (e.g., next friday)
    (re.compile(r"\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", re.I), lambda m: _resolve_next_weekday(m.group(1))),
    (re.compile(r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", re.I), lambda m: _resolve_next_weekday(m.group(1))),
]

def _resolve_next_weekday(day_name: str) -> str:
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    target_idx = days.index(day_name.lower())
    today_idx = datetime.now().weekday()
    days_ahead = target_idx - today_idx
    if days_ahead <= 0:
        days_ahead += 7
    return (datetime.now() + timedelta(days=days_ahead)).date().isoformat()


# ─── PYDANTIC MODELS ──────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict]] = []
    user_interests: Optional[List[str]] = []
    current_path: Optional[str] = None

class RankRequest(BaseModel):
    query: str
    events: List[Dict[str, Any]]
    top_k: Optional[int] = 10

class RecommendRequest(BaseModel):
    user_interests: Optional[List[str]] = []
    registered_categories: Optional[List[str]] = []
    events: List[Dict[str, Any]]
    top_k: Optional[int] = 5

class InsightsRequest(BaseModel):
    events: List[Dict[str, Any]]
    registrations: Optional[List[Dict]] = []

class SentimentRequest(BaseModel):
    text: str


# ─── NLP CORE ────────────────────────────────────────────────────────────────

class NLPCore:
    """Lightweight NLP without heavy dependencies."""

    STOPWORDS = {
        "i", "me", "my", "the", "a", "an", "is", "are", "was", "were", "be",
        "to", "of", "and", "or", "in", "on", "at", "for", "with", "this",
        "that", "it", "by", "as", "do", "can", "will", "would", "could",
        "should", "if", "but", "not", "no", "so", "up", "out", "any", "all",
    }

    POSITIVE_WORDS = {
        "good", "great", "amazing", "excellent", "fantastic", "awesome", "love",
        "enjoy", "interested", "excited", "happy", "wonderful", "best", "perfect",
    }

    NEGATIVE_WORDS = {
        "bad", "poor", "terrible", "awful", "boring", "not", "cancel", "drop",
        "withdraw", "hate", "dislike", "worst", "refuse", "no",
    }

    @staticmethod
    def tokenize(text: str) -> List[str]:
        """Simple word tokenizer — removes punctuation and lowercases."""
        return [w.lower() for w in re.findall(r"\b[a-z]{2,}\b", text.lower())]

    @staticmethod
    def remove_stopwords(tokens: List[str]) -> List[str]:
        return [t for t in tokens if t not in NLPCore.STOPWORDS]

    @staticmethod
    def tf(tokens: List[str]) -> Dict[str, float]:
        """Compute term frequency."""
        freq = Counter(tokens)
        total = len(tokens) or 1
        return {term: count / total for term, count in freq.items()}

    @staticmethod
    def compute_idf(documents: List[List[str]]) -> Dict[str, float]:
        """Compute inverse document frequency across corpus."""
        N = len(documents)
        df: Dict[str, int] = defaultdict(int)
        for doc in documents:
            for term in set(doc):
                df[term] += 1
        return {term: math.log((N + 1) / (count + 1)) + 1 for term, count in df.items()}

    @staticmethod
    def tfidf_score(query_tokens: List[str], doc_tokens: List[str], idf: Dict[str, float]) -> float:
        """Compute TF-IDF dot product similarity between query and document."""
        doc_tf = NLPCore.tf(doc_tokens)
        score = 0.0
        for term in query_tokens:
            if term in doc_tf:
                score += doc_tf.get(term, 0) * idf.get(term, 0)
        return score

    @staticmethod
    def cosine_sim(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        """Cosine similarity between two TF-IDF vectors."""
        common = set(vec_a) & set(vec_b)
        if not common:
            return 0.0
        dot = sum(vec_a[k] * vec_b[k] for k in common)
        mag_a = math.sqrt(sum(v**2 for v in vec_a.values()))
        mag_b = math.sqrt(sum(v**2 for v in vec_b.values()))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    @classmethod
    def sentiment(cls, text: str) -> Dict[str, Any]:
        """Rule-based sentiment analysis."""
        tokens = cls.tokenize(text)
        pos = sum(1 for t in tokens if t in cls.POSITIVE_WORDS)
        neg = sum(1 for t in tokens if t in cls.NEGATIVE_WORDS)
        score = (pos - neg) / max(len(tokens), 1)

        if score > 0.05:
            label = "positive"
        elif score < -0.05:
            label = "negative"
        else:
            label = "neutral"

        return {
            "label": label,
            "score": round(score, 4),
            "positive_signals": pos,
            "negative_signals": neg,
        }


# ─── INTENT CLASSIFIER ───────────────────────────────────────────────────────

class IntentClassifier:
    def classify(self, text: str) -> Dict[str, Any]:
        # Split text by common conjunctions for multi-intent parsing
        # "find events and register me" -> ["find events", "register me"]
        clauses = re.split(r'\b(and|then|also)\b', text, flags=re.IGNORECASE)
        # Filter out the conjunctions themselves
        clauses = [c.strip() for c in clauses if c.strip().lower() not in ["and", "then", "also"] and c.strip()]
        
        if not clauses:
            clauses = [text]

        intents_found = []
        all_scores = {}
        
        for clause in clauses:
            scores: Dict[str, float] = {}

            # 1. Regex and Keyword Matching
            for intent, spec in INTENT_PATTERNS.items():
                score = 0.0
                for pat in spec["patterns"]:
                    if re.search(pat, clause, re.IGNORECASE):
                        score += 2.0 * spec["weight"]
                lower = clause.lower()
                for kw in spec["keywords"]:
                    if kw.lower() in lower:
                        score += 1.0 * spec["weight"]
                if score > 0:
                    scores[intent] = score

            # 2. Semantic Similarity using SentenceTransformer (Fuzzy Intent Matching)
            global embedding_model
            if embedding_model is not None and clause.strip():
                text_emb = embedding_model.encode([clause])[0]
                
                for intent, spec in INTENT_PATTERNS.items():
                    if not spec["keywords"]:
                        continue
                    # Encode all keywords for this intent
                    kw_embs = embedding_model.encode(spec["keywords"])
                    # Calculate similarities
                    similarities = []
                    for kw_emb in kw_embs:
                        # Cosine similarity
                        dot = sum(text_emb * kw_emb)
                        mag_a = math.sqrt(sum(v**2 for v in text_emb))
                        mag_b = math.sqrt(sum(v**2 for v in kw_emb))
                        sim = dot / (mag_a * mag_b) if mag_a > 0 and mag_b > 0 else 0
                        similarities.append(sim)
                    
                    # Boost score if a keyword is semantically very similar (> 0.55)
                    max_sim = max(similarities) if similarities else 0.0
                    if max_sim > 0.55:
                        boost = (max_sim - 0.5) * 5.0 * spec["weight"] # Scale up the boost
                        scores[intent] = scores.get(intent, 0.0) + boost

            if not scores:
                continue

            sorted_scores = sorted(scores.items(), key=lambda x: -x[1])
            top_intent, top_score = sorted_scores[0]
            
            # Record the highest score for this intent across all clauses
            for k, v in scores.items():
                all_scores[k] = max(all_scores.get(k, 0.0), v)
                
            if top_score > 0 and top_intent not in intents_found:
                intents_found.append(top_intent)

        if not intents_found:
            return {"intent": "UNKNOWN", "intents": ["UNKNOWN"], "confidence": 0.0, "all_scores": {}}

        # Calculate overall confidence based on the highest score found
        top_overall_score = max(all_scores.values()) if all_scores else 0
        confidence = round(min(top_overall_score / 10.0, 1.0), 3)

        return {
            "intent": intents_found[0],  # Primary intent for legacy support
            "intents": intents_found,    # New: List of all detected intents
            "confidence": confidence,
            "all_scores": {k: round(v, 3) for k, v in all_scores.items()},
        }


# ─── ENTITY EXTRACTOR ────────────────────────────────────────────────────────

class EntityExtractor:
    def extract(self, text: str) -> Dict[str, Any]:
        lower = text.lower()
        entities: Dict[str, Any] = {
            "categories": [],
            "date_ref": None,
            "event_name_hint": None,
            "number_ref": None,
            "location_ref": None,
            "time_ref": None,
        }

        # Categories
        for cat, kws in CATEGORY_VOCAB.items():
            if any(kw in lower for kw in kws):
                entities["categories"].append(cat)

        # Date refs
        for pattern, resolver in DATE_RESOLVERS:
            m = pattern.search(text)
            if m:
                # pass match object if resolver accepts it (inspect signature safely)
                import inspect
                sig = inspect.signature(resolver)
                if len(sig.parameters) == 1:
                    entities["date_ref"] = resolver(m)
                else:
                    entities["date_ref"] = resolver()
                break

        # Event Name Extraction (Advanced NLP)
        # 1. Quoted text (e.g. "Hackathon 2026")
        quote_match = re.search(r'["\'](.*?)["\']', text)
        if quote_match:
            entities["event_name_hint"] = quote_match.group(1).strip()
        else:
            # 2. Title Cased phrases (e.g. AI Bootcamp)
            # Find sequences of words starting with capital letters
            title_case_matches = re.findall(r'\b[A-Z][a-z0-9]*(?:\s+[A-Z][a-z0-9]*)*\b', text)
            if title_case_matches:
                # Filter out single words that are common sentence starters if there are multiple matches
                valid_names = [m for m in title_case_matches if m.lower() not in NLPCore.STOPWORDS]
                if valid_names:
                    # Pick the longest title cased match as the event name
                    entities["event_name_hint"] = max(valid_names, key=len).strip()

        # Explicit date fallback for "DD Month" (e.g. "14 september" or typos like "14 setempber")
        if not entities["date_ref"]:
            explicit_date = re.search(r"\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,10})\b", lower)
            if explicit_date:
                day_str, month_str = explicit_date.groups()
                months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
                month_idx = -1
                for i, m in enumerate(months):
                    if month_str.startswith(m) or m in month_str:
                        month_idx = i + 1
                        break
                if month_idx > 0:
                    try:
                        yr = datetime.now().year
                        # if date is in the past, assume next year
                        d = datetime(yr, month_idx, int(day_str)).date()
                        if d < datetime.now().date():
                            d = datetime(yr + 1, month_idx, int(day_str)).date()
                        entities["date_ref"] = d.isoformat()
                    except ValueError:
                        pass

        # Time (HH:MM or "10am", "5 pm", "14:30", "9:30 mornig")
        time_match = re.search(r"\b(\d{1,2}):?(\d{2})?\s*(am|pm|morn|eve|night)?\b", lower)
        if time_match:
            hr, min_part, ampm = time_match.groups()
            hr_int = int(hr)
            if ampm:
                if (ampm == 'pm' or 'eve' in ampm or 'night' in ampm) and hr_int < 12: hr_int += 12
                if ampm == 'am' and hr_int == 12: hr_int = 0
            min_part = min_part if min_part else "00"
            entities["time_ref"] = f"{hr_int:02d}:{min_part}"

        # Capacity / Number
        cap_match = re.search(r"(?:for|capacity of|limit of)\s*\b(\d{2,4})\b|\b(\d{2,4})\b\s*(?:people|students|participants|seats|capacity)", lower)
        if cap_match:
            entities["number_ref"] = int(cap_match.group(1) or cap_match.group(2))

        # Quoted event name or semantic title extraction
        quoted = re.search(r'["\']([^"\']+)["\']', text)
        if quoted:
            entities["event_name_hint"] = quoted.group(1).title()
        else:
            # Fallback for "create a tech workshop called Advanced Python" or "host a Advanced Python workshop"
            called_match = re.search(r"called\s+([\w\s]+?)(?=\s+(?:on|at|in|for|next|tomorrow|today)|$)", text, re.I)
            if called_match:
                entities["event_name_hint"] = called_match.group(1).strip().title()

        # Location hints ("in the Computer Lab", "at Room 302")
        loc_match = re.search(r"(?:in|at) (?:the )?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*(?:Lab|Auditorium|Hall|Room|Ground|Center)\b|Room \d+)", text)
        if loc_match:
            entities["location_ref"] = loc_match.group(1).strip()
        else:
            for loc_kw in ["auditorium", "hall", "room", "campus", "ground", "lab", "library"]:
                if loc_kw in lower:
                    entities["location_ref"] = loc_kw.title()
                    break

        return entities


# ─── SINGLETON INSTANCES ──────────────────────────────────────────────────────
classifier = IntentClassifier()
extractor = EntityExtractor()
nlp = NLPCore()

# Load Embedding Model (Downloads ~80MB on first run)
embedding_model = None
if HAS_ML:
    log.info("Loading SentenceTransformer (all-MiniLM-L6-v2)...")
    try:
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        log.info("SentenceTransformer loaded successfully.")
    except Exception as e:
        log.warning(f"Failed to load SentenceTransformer: {e}")
        embedding_model = None


# ─── ROUTES ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "CampusAI Python NLP Service",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    """
    Deep NLP analysis of a user message.
    Returns intent, confidence, entities, sentiment, and context signals.
    """
    start = time.perf_counter()

    intent_result = classifier.classify(req.message)
    entity_result = extractor.extract(req.message)
    sentiment_result = nlp.sentiment(req.message)

    # Context enrichment from conversation history
    inherited_category = None
    last_mentioned_event = None
    if req.conversation_history:
        for turn in reversed(req.conversation_history[-6:]):
            turn_entities = turn.get("entities", {})
            if turn_entities.get("categories") and not entity_result["categories"]:
                inherited_category = turn_entities["categories"][0]
            if turn.get("mentioned_events"):
                last_mentioned_event = turn["mentioned_events"][0]
            if inherited_category or last_mentioned_event:
                break

    # Detect pronoun reference
    PRONOUNS = ["it", "that one", "that event", "this event", "the event", "that"]
    has_pronoun = any(p in req.message.lower() for p in PRONOUNS)

    elapsed = round((time.perf_counter() - start) * 1000, 2)

    return {
        "intent": intent_result["intent"],
        "intents": intent_result.get("intents", [intent_result["intent"]]),
        "confidence": intent_result["confidence"],
        "all_intent_scores": intent_result["all_scores"],
        "entities": entity_result,
        "context": {
            "last_mentioned_event": last_mentioned_event,
            "inherited_category": inherited_category,
        },
        "sentiment": sentiment_result,
        "needs_clarification": intent_result["confidence"] < 0.4,
        "current_path": req.current_path,
        "processing_ms": round((time.perf_counter() - start) * 1000, 2),
    }


@app.post("/rank")
def rank_events(req: RankRequest):
    """
    Rank a list of events against a search query using Vector Semantic Search.
    Falls back to TF-IDF if the ML model isn't available.
    """
    if not req.events:
        return {"ranked_events": [], "query_tokens": []}

    def event_to_text(e: Dict) -> str:
        return " ".join(filter(None, [
            e.get("title", ""),
            e.get("description", ""),
            e.get("category", ""),
            e.get("venue", ""),
        ]))

    scored = []

    if embedding_model is not None:
        # --- VECTOR SEMANTIC SEARCH ---
        texts = [event_to_text(e) for e in req.events]
        event_embeddings = embedding_model.encode(texts)
        query_embedding = embedding_model.encode([req.query])
        
        sims = cosine_similarity(query_embedding, event_embeddings)[0]
        
        for i, event in enumerate(req.events):
            base_score = float(sims[i])
            
            # Recency boost
            recency_boost = 0.0
            if event.get("date"):
                try:
                    event_date = datetime.fromisoformat(event["date"].replace("Z", "+00:00"))
                    days_until = (event_date.replace(tzinfo=None) - datetime.now()).days
                    if 0 <= days_until <= 30:
                        recency_boost = 0.1
                    elif 0 <= days_until <= 7:
                        recency_boost = 0.2
                except Exception:
                    pass

            popularity_boost = min((event.get("registeredCount", 0) or 0) * 0.005, 0.2)
            final_score = base_score + recency_boost + popularity_boost
            
            scored.append({**event, "_relevance_score": round(final_score, 4)})
    else:
        # --- FALLBACK: TF-IDF ---
        query_tokens = nlp.remove_stopwords(nlp.tokenize(req.query))
        docs = [nlp.remove_stopwords(nlp.tokenize(event_to_text(e))) for e in req.events]
        idf = nlp.compute_idf(docs)

        for event, doc_tokens in zip(req.events, docs):
            tfidf_s = nlp.tfidf_score(query_tokens, doc_tokens, idf)

            recency_boost = 0.0
            if event.get("date"):
                try:
                    event_date = datetime.fromisoformat(event["date"].replace("Z", "+00:00"))
                    days_until = (event_date.replace(tzinfo=None) - datetime.now()).days
                    if 0 <= days_until <= 30:
                        recency_boost = 0.2
                    elif 0 <= days_until <= 7:
                        recency_boost = 0.5
                except Exception:
                    pass

            popularity_boost = min((event.get("registeredCount", 0) or 0) * 0.01, 0.3)
            final_score = tfidf_s + recency_boost + popularity_boost
            scored.append({**event, "_relevance_score": round(final_score, 4)})

    scored.sort(key=lambda x: x["_relevance_score"], reverse=True)

    return {
        "ranked_events": scored[: req.top_k],
        "engine": "vector_embeddings" if embedding_model else "tf-idf",
        "total_events": len(scored),
    }


@app.post("/recommend")
def recommend_events(req: RecommendRequest):
    """
    Content-based event recommendation using Vector Embeddings.
    Falls back to TF-IDF Cosine Similarity if model is missing.
    """
    if not req.events:
        return {"recommended_events": []}

    interest_text = " ".join(req.user_interests + req.registered_categories)

    def event_to_text(e: Dict) -> str:
        return " ".join(filter(None, [
            e.get("title", ""), e.get("description", ""),
            e.get("category", ""), e.get("tags", ""),
        ]))

    scored = []

    if embedding_model is not None and interest_text.strip():
        # --- VECTOR RECOMMENDATIONS ---
        texts = [event_to_text(e) for e in req.events]
        event_embeddings = embedding_model.encode(texts)
        query_embedding = embedding_model.encode([interest_text])
        
        sims = cosine_similarity(query_embedding, event_embeddings)[0]
        
        for i, event in enumerate(req.events):
            sim = float(sims[i])
            category_boost = 0.0
            event_cat = (event.get("category") or "").lower()
            if event_cat in req.user_interests or event_cat in req.registered_categories:
                category_boost = 0.2

            recency = 0.0
            if event.get("date"):
                try:
                    ev_date = datetime.fromisoformat(event["date"].replace("Z", "+00:00"))
                    days_until = (ev_date.replace(tzinfo=None) - datetime.now()).days
                    if 0 <= days_until <= 14:
                        recency = 0.2
                except Exception:
                    pass

            final = sim + category_boost + recency
            scored.append({**event, "_recommendation_score": round(final, 4)})

    else:
        # --- TF-IDF FALLBACK ---
        interest_tokens = nlp.remove_stopwords(nlp.tokenize(interest_text)) if interest_text.strip() else []
        interest_tf = nlp.tf(interest_tokens) if interest_tokens else {}

        docs = [nlp.remove_stopwords(nlp.tokenize(event_to_text(e))) for e in req.events]
        idf = nlp.compute_idf(docs)

        for event, doc_tokens in zip(req.events, docs):
            if interest_tokens:
                doc_tf = nlp.tf(doc_tokens)
                query_tfidf = {t: interest_tf.get(t, 0) * idf.get(t, 1) for t in interest_tokens}
                doc_tfidf = {t: doc_tf.get(t, 0) * idf.get(t, 1) for t in doc_tokens}
                sim = nlp.cosine_sim(query_tfidf, doc_tfidf)
            else:
                sim = 0.0

            category_boost = 0.0
            event_cat = (event.get("category") or "").lower()
            if event_cat in req.user_interests or event_cat in req.registered_categories:
                category_boost = 0.4

            recency = 0.0
            if event.get("date"):
                try:
                    ev_date = datetime.fromisoformat(event["date"].replace("Z", "+00:00"))
                    days_until = (ev_date.replace(tzinfo=None) - datetime.now()).days
                    if 0 <= days_until <= 14:
                        recency = 0.3
                except Exception:
                    pass

            final = sim + category_boost + recency
            scored.append({**event, "_recommendation_score": round(final, 4)})

    scored.sort(key=lambda x: x["_recommendation_score"], reverse=True)

    # Filter to only upcoming events
    now = datetime.now()
    upcoming = []
    for e in scored:
        if e.get("date"):
            try:
                ev_date = datetime.fromisoformat(e["date"].replace("Z", "+00:00"))
                if ev_date.replace(tzinfo=None) >= now:
                    upcoming.append(e)
            except Exception:
                upcoming.append(e)

    return {
        "recommended_events": upcoming[: req.top_k],
        "user_interests_used": req.user_interests,
        "engine": "vector_embeddings" if embedding_model else "tf-idf",
        "total_candidates": len(scored),
    }


@app.post("/insights")
def event_insights(req: InsightsRequest):
    """
    Generate statistical insights from a list of events and registrations.
    """
    events = req.events
    if not events:
        return {"insights": {}, "summary": "No events to analyze."}

    now = datetime.now()

    upcoming = []
    past = []
    for e in events:
        if e.get("date"):
            try:
                ev_date = datetime.fromisoformat(e["date"].replace("Z", "+00:00"))
                if ev_date.replace(tzinfo=None) >= now:
                    upcoming.append(e)
                else:
                    past.append(e)
            except Exception:
                upcoming.append(e)

    # Category distribution
    cat_count: Counter = Counter()
    for e in events:
        cat = (e.get("category") or "other").lower()
        cat_count[cat] += 1

    # Fill rates
    fill_rates = []
    for e in events:
        cap = e.get("capacity", 0) or 0
        reg = e.get("registeredCount", 0) or 0
        if cap > 0:
            fill_rates.append(round(reg / cap * 100, 1))

    avg_fill = round(sum(fill_rates) / len(fill_rates), 1) if fill_rates else 0

    # Most popular events
    most_popular = sorted(events, key=lambda e: (e.get("registeredCount", 0) or 0), reverse=True)[:3]
    most_popular_summary = [{"title": e.get("title"), "registered": e.get("registeredCount", 0)} for e in most_popular]

    # Total seats analysis
    total_capacity = sum(e.get("capacity", 0) or 0 for e in events)
    total_registered = sum(e.get("registeredCount", 0) or 0 for e in events)

    return {
        "insights": {
            "total_events": len(events),
            "upcoming_events": len(upcoming),
            "past_events": len(past),
            "category_distribution": dict(cat_count.most_common()),
            "most_popular_category": cat_count.most_common(1)[0][0] if cat_count else "unknown",
            "average_fill_rate_percent": avg_fill,
            "total_capacity": total_capacity,
            "total_registered": total_registered,
            "overall_fill_rate_percent": round(total_registered / max(total_capacity, 1) * 100, 1),
            "most_popular_events": most_popular_summary,
            "events_with_seats_available": sum(1 for e in upcoming if (e.get("registeredCount", 0) or 0) < (e.get("capacity", 0) or 1)),
        },
        "summary": (
            f"There are {len(upcoming)} upcoming events across {len(cat_count)} categories. "
            f"Overall platform fill rate is {round(total_registered / max(total_capacity, 1) * 100, 1)}%. "
            f"Most popular category: {cat_count.most_common(1)[0][0] if cat_count else 'N/A'}."
        ),
    }


@app.post("/sentiment")
def analyze_sentiment(req: SentimentRequest):
    """Lightweight sentiment analysis."""
    result = nlp.sentiment(req.text)
    return {"text": req.text, **result}


# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    log.info("Starting CampusAI Python NLP Service on port 8001...")
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True, log_level="info")
