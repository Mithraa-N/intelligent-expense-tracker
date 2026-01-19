import re
import dateparser
from datetime import datetime
from typing import Dict, Any, Optional

class ExpenseParser:
    @staticmethod
    def parse_text(text: str) -> Dict[str, Any]:
        result = {
            "amount": None,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "description": text.strip(),
            "currency": None
        }

        # 1. Extract Amount and Currency
        # Support various currency symbols and formats: ₹250, $15, 50 euro, etc.
        # This regex looks for numbers preceded or followed by common currency symbols or words
        pattern = r'([₹$€£]\s?(\d+(?:\.\d+)?))|((\d+(?:\.\d+)?)\s?(?:₹|\$|€|£|euro|rs|inr|usd)\b)|(\b\d+(?:\.\d+)?\b)'
        
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        if matches:
            # We take the first match as the amount
            match = matches[0]
            groups = match.groups()
            
            if groups[1]: # Part like ₹250
                result["amount"] = float(groups[1])
                result["currency"] = groups[0].strip()[0]
            elif groups[3]: # Part like 250 rs
                result["amount"] = float(groups[3])
                # Find currency if possible
                curr_match = re.search(r'(?:₹|\$|€|£|euro|rs|inr|usd)', match.group(0), re.IGNORECASE)
                if curr_match:
                    result["currency"] = curr_match.group(0)
            elif groups[4]: # Bare number
                result["amount"] = float(groups[4])
            
            # Remove ONLY the specific amount match from description
            temp_desc = text[:match.start()] + text[match.end():]
        else:
            temp_desc = text

        # 2. Extract Date using dateparser
        # We search for date-related words or patterns
        # dateparser is very powerful but can be greedy
        date_keywords = r'\b(yesterday|today|last\s\w+|on\s\d{1,2}[/-]\d{1,2}[/-]?\d{0,4})\b'
        date_match = re.search(date_keywords, temp_desc, re.IGNORECASE)
        
        parsed_date = dateparser.parse(temp_desc, settings={'PREFER_DATES_FROM': 'past'})
        
        if parsed_date:
            # Basic validation: ensure it's not some random number parsed as date
            # Check if any part of the text suggests a date
            if date_match or re.search(r'\d{1,2}[/-]\d{1,2}', temp_desc):
                result["date"] = parsed_date.strftime("%Y-%m-%d")
                if date_match:
                   temp_desc = temp_desc[:date_match.start()] + temp_desc[date_match.end():]

        # 3. Final Description Cleaning
        # Remove common filler words
        clean_desc = re.sub(r'\b(spent|paid|on|for|at|bought|gave)\b', '', temp_desc, flags=re.IGNORECASE)
        # Remove multiple spaces and strip
        clean_desc = " ".join(clean_desc.split())
        
        description = clean_desc if clean_desc else text.strip()
        result["description"] = description
        
        # 4. Predict Category
        from ml.predictor import ExpenseML
        prediction = ExpenseML.predict_category(description)
        result["category"] = prediction.get("category", "Uncategorized")
        result["confidence"] = prediction.get("confidence", 0.0)
        
        return result

if __name__ == "__main__":
    # Test cases
    test_inputs = [
        "Spent ₹250 on lunch yesterday",
        "Paid $15 for netflix sub today",
        "50 euro for transport",
        "Bought coffee for 5.50 on 12/01/2026"
    ]
    
    parser = ExpenseParser()
    for inp in test_inputs:
        print(f"Input: {inp}")
        print(f"Output: {parser.parse_text(inp)}\n")
