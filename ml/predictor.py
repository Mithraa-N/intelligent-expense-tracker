import pandas as pd
import joblib
import os
from typing import List, Dict, Any
from data.schemas import Expense
from ml.preprocessing import clean_text

class ExpenseML:
    _model = None
    _vectorizer = None

    @classmethod
    def load_model(cls):
        if cls._model is None or cls._vectorizer is None:
            model_path = "ml/model.pkl"
            vectorizer_path = "ml/vectorizer.pkl"
            
            if os.path.exists(model_path) and os.path.exists(vectorizer_path):
                cls._model = joblib.load(model_path)
                cls._vectorizer = joblib.load(vectorizer_path)
            else:
                return False
        return True

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

    @classmethod
    def predict_category(cls, description: str) -> Dict[str, Any]:
        """Predicts the category of an expense based on its description."""
        if not cls.load_model():
            return {"error": "Model not trained. Run ml/train.py first."}

        cleaned_desc = clean_text(description)
        X_vec = cls._vectorizer.transform([cleaned_desc])
        
        prediction = cls._model.predict(X_vec)[0]
        probabilities = cls._model.predict_proba(X_vec)[0]
        
        # Match probability with class names
        prob_dict = dict(zip(cls._model.classes_, probabilities))
        max_prob = max(probabilities)

        return {
            "category": prediction,
            "confidence": float(max_prob),
            "all_probabilities": {k: float(v) for k, v in prob_dict.items()}
        }

if __name__ == "__main__":
    # Test prediction
    test_desc = "Lunch at McDonald's"
    result = ExpenseML.predict_category(test_desc)
    print(f"Prediction for '{test_desc}':")
    print(result)
