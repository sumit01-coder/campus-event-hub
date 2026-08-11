import sys
import io
import json
import re
import difflib

# Redirect all stdout to hide easyocr/torch progress bars and warnings
original_stdout = sys.stdout
sys.stdout = io.StringIO()

def check_liveness(live_photo_path):
    try:
        import cv2
    except ImportError:
        return False, "OpenCV (cv2) library not installed."
        
    try:
        # Load the image
        img = cv2.imread(live_photo_path)
        if img is None:
            return False, "Could not read live photo."
            
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Check Blurriness (Variance of Laplacian)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        if variance < 50:
            return False, "The live photo is too blurry. Please hold the camera still and ensure good lighting."
            
        # 2. Check Brightness (Overall image brightness)
        import numpy as np
        brightness = np.mean(gray)
        if brightness < 40:
            return False, "The live photo is too dark. Please move to a well-lit area."
        if brightness > 230:
            return False, "The live photo is too bright or washed out. Please avoid standing directly under harsh light."
        
        # Load Haar cascade
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Detect faces with stricter parameters for higher accuracy
        faces = face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=6, # Higher means more strict
            minSize=(100, 100) # Require the face to be a decent size
        )
        
        if len(faces) == 0:
            return False, "No clear face detected. Please look directly at the camera without accessories blocking your face."
            
        if len(faces) > 1:
            return False, "Multiple faces detected. Please ensure only you are in the frame."
            
        # 3. Check Face Area (Ensure they are close enough to the camera)
        img_h, img_w = img.shape[:2]
        img_area = img_h * img_w
        
        # Get the largest face
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face
        face_area = w * h
        
        if face_area < (img_area * 0.05): # Face must take up at least 5% of the frame
            return False, "Face is too far away. Please move closer to the camera."
            
        return True, "Face detected clearly."
    except Exception as e:
        return False, f"Face detection error: {str(e)}"

def match_name(expected, actual):
    if not expected: return False
    # Check if all parts of the expected name exist in the actual name (order independent)
    expected_words = expected.upper().split()
    actual_upper = actual.upper()
    
    matches = 0
    for word in expected_words:
        if word in actual_upper:
            matches += 1
            
    # If all expected words are found, it's a match!
    if matches == len(expected_words):
        return True
    
    # Fallback to spaceless fuzzy match
    return fuzzy_match(expected, actual, 0.80)

def fuzzy_match(expected, actual, threshold=0.85):
    if not expected:
        return False
        
    expected_upper = expected.upper()
    actual_upper = actual.upper()
    
    if expected_upper in actual_upper:
        return True
        
    # Spaceless check
    expected_spaceless = expected_upper.replace(" ", "")
    actual_spaceless = actual_upper.replace(" ", "")
    if expected_spaceless in actual_spaceless:
        return True
        
    if len(expected_spaceless) > 0 and len(actual_spaceless) >= len(expected_spaceless):
        window_size = len(expected_spaceless)
        best_ratio = 0.0
        for i in range(len(actual_spaceless) - window_size + 1):
            window_text = actual_spaceless[i:i+window_size]
            ratio = difflib.SequenceMatcher(None, expected_spaceless, window_text).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                
        if best_ratio >= threshold:
            return True
            
    return False

def perform_ocr_verification(id_card_path, live_photo_path, expected_name, expected_college, expected_id, expected_mobile):
    # 1. Liveness Check
    is_live, liveness_msg = check_liveness(live_photo_path)
    if not is_live:
        return {"match": False, "error": liveness_msg}
        
    try:
        import easyocr
    except ImportError:
        return {"match": False, "error": "easyocr library not installed."}
        
    try:
        # Initialize reader
        reader = easyocr.Reader(['en'], gpu=False)
        
        # Read text from image
        result = reader.readtext(id_card_path, detail=0)
        full_text = " ".join(result).upper()
        
        # Validation Flags
        is_name_match = match_name(expected_name, full_text)
        is_college_match = fuzzy_match(expected_college, full_text, threshold=0.75) # Reduced to 75% for typos
        
        # ID Match (Exact, but normalized)
        is_id_match = False
        if expected_id:
            def norm_id(s):
                return s.lower().replace('o', '0').replace('i', '1').replace('l', '1').replace('-', '').replace(' ', '')
            
            if norm_id(expected_id) in norm_id(full_text):
                is_id_match = True
        else:
            is_id_match = True # Ignore if empty in profile
            
        # Mobile Match (Exact)
        is_mobile_match = False
        if expected_mobile:
            digits_only = re.sub(r'\D', '', full_text)
            expected_digits = re.sub(r'\D', '', expected_mobile)
            
            if expected_digits in digits_only:
                is_mobile_match = True
        else:
            is_mobile_match = True
            
        # Compile errors for strict matching
        errors = []
        if not is_name_match:
            errors.append("Name on ID card does not match profile.")
        if not is_college_match:
            errors.append("College on ID card does not match profile.")
        if not is_id_match:
            errors.append(f"Student ID ({expected_id}) not found on ID card.")
        if not is_mobile_match:
            errors.append(f"Mobile number not found on ID card.")
            
        if len(errors) > 0:
            return {
                "match": False,
                "error": "Strict Verification Failed: " + " | ".join(errors)
            }
            
        extracted_data = {
            "name": expected_name.upper(),
            "idNumber": expected_id.upper(),
            "mobile": expected_mobile,
            "university": expected_college.upper()
        }
        
        return {
            "match": True,
            "confidence": 100, # Strict match implies high confidence
            "extracted_text": full_text,
            "extracted_data": extracted_data
        }
        
    except Exception as e:
        return {"match": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 5:
        sys.stdout = original_stdout
        print(json.dumps({"match": False, "error": "Missing arguments"}))
        sys.exit(1)
        
    id_card_path = sys.argv[1]
    live_photo_path = sys.argv[2]
    expected_name = sys.argv[3]
    expected_college = sys.argv[4] if len(sys.argv) > 4 else ""
    expected_id = sys.argv[5] if len(sys.argv) > 5 else ""
    expected_mobile = sys.argv[6] if len(sys.argv) > 6 else ""
    
    result = perform_ocr_verification(id_card_path, live_photo_path, expected_name, expected_college, expected_id, expected_mobile)
    
    # Restore stdout to print the clean JSON payload to Node.js
    sys.stdout = original_stdout
    print(json.dumps(result))
