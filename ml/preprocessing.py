import pandas as pd
import re
from datetime import datetime

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    # Remove extra whitespace
    text = " ".join(text.split())
    return text

def normalize_date(date_str):
    formats = ["%Y-%m-%d", "%d/%m/%Y", "%m-%d-%Y", "%b %d, %Y"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return date_str # Fallback if no format matches

def process_pipeline():
    print("Starting preprocessing pipeline...")
    
    # Load raw data
    try:
        df = pd.read_csv("data/raw_expenses.csv")
    except FileNotFoundError:
        print("Raw data not found. Please run data_generator.py first.")
        return

    # 1. Text Cleaning
    print("Cleaning descriptions...")
    df['description_cleaned'] = df['description'].apply(clean_text)
    
    # 2. Date Normalization
    print("Normalizing dates...")
    df['date_normalized'] = df['date'].apply(normalize_date)
    
    # 3. Basic Typos/Abbreviations (Simple Rule-based for common cases)
    typo_map = {
        'strbucks': 'starbucks',
        'cofee': 'coffee',
        'sttarbucks': 'starbucks',
        'amzn': 'amazon',
        'amzon': 'amazon',
        'electcity': 'electricity',
        'walmrt': 'walmart',
        'grocceries': 'grocery'
    }
    
    def fix_common_typos(text):
        words = text.split()
        fixed_words = [typo_map.get(w, w) for w in words]
        return " ".join(fixed_words)
    
    df['description_cleaned'] = df['description_cleaned'].apply(fix_common_typos)
    
    # Save cleaned data
    output_path = "data/cleaned_expenses.csv"
    df.to_csv(output_path, index=False)
    print(f"Pipeline complete. Saved cleaned data to {output_path}")
    
    # Return a snippet for verification
    return df.head()

if __name__ == "__main__":
    snippet = process_pipeline()
    print("\nSample Output:")
    print(snippet[['description', 'description_cleaned', 'date', 'date_normalized']])
