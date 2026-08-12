import sys
import json
import re
import traceback

def extract_problem_statements(pdf_path):
    try:
        from PyPDF2 import PdfReader
        
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        
        # Regex to find standard format:
        # 1. Title
        # Problem Description: ...
        
        pattern = re.compile(r'\n?(\d+)\.\s+([^\n]+)\s*Problem Description:\s+(.*?)(?=\n\d+\.\s+|\Z)', re.DOTALL | re.IGNORECASE)
        
        matches = pattern.findall(text)
        
        results = []
        for match in matches:
            number = match[0].strip()
            title = match[1].strip()
            description = match[2].strip()
            
            # Clean up newlines in description that might break paragraphs
            # Sometimes pdf extraction puts hard newlines inside sentences
            description = re.sub(r'([^\n])\n([^\n])', r'\1 \2', description)
            
            results.append({
                "title": title,
                "description": description,
                "maxTeams": 0
            })
            
        print(json.dumps({
            "success": True,
            "data": results,
            "count": len(results)
        }))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No PDF path provided"}))
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    extract_problem_statements(pdf_path)
