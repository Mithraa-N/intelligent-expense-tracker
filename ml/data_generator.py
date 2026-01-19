import pandas as pd
import random
from datetime import datetime, timedelta

def generate_noisy_data():
    category_map = {
        'Food': ["Strbucks cofee", "sttarbucks", "Coffee!!", "Lunch at MCD", "Subway sandwich", "Groceries", "Dinner at Palace"],
        'Transport': ["Uber ridee", "UBER   123", "uberrr", "Gas station", "Petrol refill", "Bus ticket", "Train pass"],
        'Utilities': ["Electcity bill", "Elec Bill - Jan", "bill for power", "Water bill", "Internet Comcast", "Mobile recharge"],
        'Shopping': ["Amzon prime sub", "amzn mktp", "Amazon.com*123", "Walmrt grocceries", "WAL-MART #456", "Target store"],
        'Health': ["Pfizer meds", "pharmacy - CVS", "meds...", "Doctor visit", "Gym membership", "Hospital bill"],
        'Entertainment': ["Netflix subscription", "NETFLIX.COM", "movie night", "Cinema tickets", "Steam games", "Spotify"]
    }
    
    data = []
    base_date = datetime(2025, 12, 1)
    
    for i in range(500): # Increase to 500 samples
        cat = random.choice(list(category_map.keys()))
        desc = random.choice(category_map[cat])
        
        # Randomly jitter data
        if random.random() > 0.8:
            desc = desc.lower()
        if random.random() > 0.9:
            desc = desc.replace(' ', '  ')
            
        amt = round(random.uniform(5.0, 500.0), 2)
        
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
    print(f"Generated {len(df)} records in data/raw_expenses.csv")

if __name__ == "__main__":
    generate_noisy_data()
