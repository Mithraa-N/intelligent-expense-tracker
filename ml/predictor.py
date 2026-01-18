import pandas as pd
from typing import List
from data.schemas import Expense

class ExpenseML:
    @staticmethod
    def analyze_spending(expenses: List[Expense]):
        if not expenses:
            return {"message": "No data to analyze"}
        
        df = pd.DataFrame([e.model_dump() for e in expenses])
        category_totals = df.groupby('category')['amount'].sum().to_dict()
        
        return {
            "category_breakdown": category_totals,
            "total_spending": df['amount'].sum(),
            "highest_category": max(category_totals, key=category_totals.get) if category_totals else None
        }
