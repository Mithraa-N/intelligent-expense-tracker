import pandas as pd
import random
from datetime import datetime, timedelta

def generate_noisy_data():
    categories = ['Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Entertainment']
    
    noisy_descriptions = [
        "Strbucks cofee", "sttarbucks", "Coffee!!", 
        "Uber ridee", "UBER   123", "uberrr",
        "Amzon prime sub", "amzn mktp", "Amazon.com*123",
        "Electcity bill", "Elec Bill - Jan", "bill for power",
        "Walmrt grocceries", "WAL-MART #456", "grocery store",
        "Pfizer meds", "pharmacy - CVS", "meds...",
        "Netflix subscription", "NETFLIX.COM", "movie night"
    ]
    
    data = []
    base_date = datetime(2025, 12, 1)
    
    for i in range(100):
        desc = random.choice(noisy_descriptions)
        # Randomly jitter data
        if random.random() > 0.8:
            desc = desc.lower()
        if random.random() > 0.9:
            desc = desc.replace(' ', '  ')
            
        amt = round(random.uniform(5.0, 500.0), 2)
        cat = random.choice(categories)
        
        # Varied date formats
        d = base_date + timedelta(days=random.randint(0, 45))
        date_formats = ["%Y-%m-%d", "%d/%m/%Y", "%m-%d-%Y", "%b %d, %Y"]
        date_str = d.strftime(random.choice(date_formats))
        
        data.append({
            "id": i + 1,
            "description": desc,
            "amount": amt,
            "category": cat,
            "date": date_str
        })
        
    df = pd.DataFrame(data)
    df.to_csv("data/raw_expenses.csv", index=False)
    print("Generated 100 noisy records in data/raw_expenses.csv")

if __name__ == "__main__":
    generate_noisy_data()
