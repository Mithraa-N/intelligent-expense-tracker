import requests
import json
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost:8000/api/v1"

def seed_data():
    print("Seeding backend with sample data...")
    
    categories = ['Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Entertainment']
    start_date = datetime.now() - timedelta(days=30)
    
    # 1. Add some normal expenses to build a profile
    for i in range(25):
        date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        cat = random.choice(categories)
        amount = random.uniform(10, 50)
        
        payload = {
            "amount": amount,
            "category": cat,
            "description": f"Standard {cat} expense {i}",
            "date": date
        }
        requests.post(f"{BASE_URL}/expenses", json=payload)

    # 2. Add an anomaly
    payload = {
        "amount": 1500.0,
        "category": "Shopping",
        "description": "Luxury Watch (Anomaly)",
        "date": datetime.now().strftime("%Y-%m-%d")
    }
    requests.post(f"{BASE_URL}/expenses", json=payload)
    
    print("Seeding complete.")

if __name__ == "__main__":
    try:
        seed_data()
    except Exception as e:
        print(f"Error seeding: {e}")
