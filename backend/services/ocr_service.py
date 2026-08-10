import sys
import io
import json
import re
import difflib

# Redirect all stdout to hide easyocr/torch progress bars and warnings
original_stdout = sys.stdout
sys.stdout = io.StringIO()

def perform_ocr_verification(image_path, expected_name, expected_college="", expected_id=""):
    try:
        import easyocr
    except ImportError:
        return {"match": False, "error": "easyocr library not installed."}
        
    try:
        # Initialize reader (will download models on first run if missing)
        reader = easyocr.Reader(['en'], gpu=False) # CPU mode for safety
        
        # Read text from image
        result = reader.readtext(image_path, detail=0)
        full_text = " ".join(result)
        
        # 1. Match Name (fuzzy / exact parts)
        # 1. Extract Name (Fuzzy Match)
        extracted_name = None
        expected_name_upper = expected_name.upper()
        
        # Check direct inclusion first
        if expected_name_upper in full_text.upper():
            extracted_name = expected_name_upper
        else:
            # Check with difflib for fuzzy matching
            # Split full text into words, then use sliding windows of length equal to expected name words
            expected_words = expected_name_upper.split()
            full_words = full_text.upper().split()
            window_size = len(expected_words)
            
            best_ratio = 0.0
            if window_size > 0 and len(full_words) >= window_size:
                for i in range(len(full_words) - window_size + 1):
                    window_text = " ".join(full_words[i:i+window_size])
                    ratio = difflib.SequenceMatcher(None, expected_name_upper, window_text).ratio()
                    if ratio > best_ratio:
                        best_ratio = ratio
                
                # If 50% similar or higher, we consider it a match for demo purposes
                if best_ratio >= 0.50:
                    extracted_name = expected_name_upper
                    
        # If we still haven't found the name, don't fail the entire process. 
        # Just leave extracted_name as None. We will try to guess it later based on ID position.
            
        # 2. Extract ID Number 
        extracted_id = None
        if expected_id and len(expected_id) > 2:
            # Normalize confusing characters (O/0, I/L/1) for robust matching
            def norm_id(s):
                return s.lower().replace('o', '0').replace('i', '1').replace('l', '1').replace('-', '').replace(' ', '')
                
            if norm_id(expected_id) in norm_id(full_text):
                # If the normalized expected ID is found, use it!
                extracted_id = expected_id.upper()
        
        if not extracted_id:
            # Fallback to regex
            # First try alphanumeric pattern
            id_match = re.search(r'[0-9]{2}[A-Z]{2}[0-9O]{2}[A-Z]{2}[0-9O]{3}', full_text)
            if id_match:
                extracted_id = id_match.group(0)
            else:
                # Try purely numeric sequence of 11-15 digits (to avoid 10 digit mobile numbers)
                num_match = re.search(r'\b[0-9]{11,15}\b', full_text)
                if num_match:
                    extracted_id = num_match.group(0)
                else:
                    # Also try to find a sequence of 11 digits even without word boundaries, in case OCR removed spaces
                    num_match = re.search(r'[0-9]{11,15}', full_text)
                    if num_match:
                        extracted_id = num_match.group(0)
        
        # 3. Extract Mobile Number (10 digits)
        # Remove all non-digits from full text to find a 10 digit sequence easily
        digits_only = re.sub(r'\D', '', full_text)
        mobile_match = re.search(r'([0-9]{10})', digits_only)
        extracted_mobile = mobile_match.group(1) if mobile_match else None
        
        # 4. Extract University 
        extracted_uni = None
        if expected_college and len(expected_college) > 3:
            # Check if any significant word of the expected college matches (fuzzy match)
            expected_uni_words = expected_college.lower().split()
            important_words = [w for w in expected_uni_words if len(w) > 3 and w not in ["university", "college", "institute"]]
            
            for word in important_words:
                if word in full_text.lower():
                    extracted_uni = expected_college.upper()
                    break
        
        if not extracted_uni:
            # Fallback to keyword search
            keywords = ["UNIVERSITY", "COLLEGE", "INSTITUTE", "ACADEMY", "SCHOOL", "TECH", "CAMPUS"]
            for block in result:
                if any(kw in block.upper() for kw in keywords):
                    extracted_uni = block
                    break
                
        # 5. Calculate Confidence Score
        score = 0
        if extracted_name: score += 25
        if extracted_id: score += 25
        if extracted_mobile: score += 25
        if extracted_uni: score += 25
        
        # 6. Guess name if missing
        if not extracted_name and extracted_id:
            # Find the line that contains the ID, then take the line before it as the name
            for i, line in enumerate(result):
                if extracted_id in line:
                    if i > 0:
                        # Assuming the line before is the name
                        extracted_name = result[i-1]
                    break

        # Format the extracted data
        extracted_data = {
            "name": extracted_name,
            "idNumber": extracted_id or "Not Found",
            "mobile": extracted_mobile or "Not Found",
            "university": extracted_uni or "Not Found"
        }
        
        return {
            "match": True,
            "confidence": score,
            "extracted_text": "\n".join(result),
            "extracted_data": extracted_data
        }
        
    except Exception as e:
        return {"match": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.stdout = original_stdout
        print(json.dumps({"match": False, "error": "Missing arguments"}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    expected_name = sys.argv[2]
    expected_college = sys.argv[3] if len(sys.argv) > 3 else ""
    expected_id = sys.argv[4] if len(sys.argv) > 4 else ""
    
    result = perform_ocr_verification(image_path, expected_name, expected_college, expected_id)
    
    # Restore stdout to print the clean JSON payload to Node.js
    sys.stdout = original_stdout
    print(json.dumps(result))
