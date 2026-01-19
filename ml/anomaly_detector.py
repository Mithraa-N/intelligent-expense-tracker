import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from typing import List, Dict, Any
from data.schemas import Expense

class AnomalyDetector:
    @staticmethod
    def detect_statistical_outliers(expenses: List[Expense], z_threshold: float = 2.0) -> List[Dict[str, Any]]:
        """Detects anomalies using Z-score (Category-wise)."""
        if len(expenses) < 3:
            return []

        df = pd.DataFrame([e.model_dump() for e in expenses])
        results = []
        for category, group in df.groupby('category'):
            if len(group) < 3: continue
            mean, std = group['amount'].mean(), group['amount'].std()
            if std == 0: continue
            group = group.copy()
            group['z_score'] = (group['amount'] - mean) / std
            outliers = group[np.abs(group['z_score']) > z_threshold]
            for _, row in outliers.iterrows():
                results.append({
                    "expense_id": int(row['id']),
                    "amount": float(row['amount']),
                    "category": category,
                    "description": row['description'],
                    "score": float(row['z_score']),
                    "type": "statistical",
                    "reason": f"Amount is {row['z_score']:.1f} standard deviations from the {category} average"
                })
        return results

    @staticmethod
    def detect_ml_anomalies(expenses: List[Expense], contamination: float = 0.05) -> List[Dict[str, Any]]:
        """
        Sophisticated ML-based anomaly detection using Isolation Forest with feature engineering.
        Uses: amount, category, and day of week.
        """
        if len(expenses) < 10:
            return []

        df = pd.DataFrame([e.model_dump() for e in expenses])
        
        # Feature Engineering: 1. Day of Week
        df['date'] = pd.to_datetime(df['date'])
        df['day_of_week'] = df['date'].dt.dayofweek
        
        # Prepare features
        features = ['amount', 'category', 'day_of_week']
        X = df[features]

        # Define preprocessing for numerical and categorical features
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), ['amount', 'day_of_week']),
                ('cat', OneHotEncoder(handle_unknown='ignore'), ['category'])
            ])

        # Pipeline: Preprocessing -> Isolation Forest
        # Note: IsolationForest doesn't support pipelines directly in fit() for score_samples 
        # so we transform first.
        X_transformed = preprocessor.fit_transform(X)
        if hasattr(X_transformed, "toarray"):
            X_transformed = X_transformed.toarray()

        model = IsolationForest(contamination=contamination, random_state=42)
        model.fit(X_transformed)
        
        # Predictions (-1 for anomaly, 1 for normal)
        predictions = model.predict(X_transformed)
        scores = model.decision_function(X_transformed) # Lower is more anomalous

        anomalies = []
        for i, (pred, score) in enumerate(zip(predictions, scores)):
            if pred == -1:
                anomalies.append({
                    "expense_id": int(df.iloc[i]['id']),
                    "amount": float(df.iloc[i]['amount']),
                    "category": df.iloc[i]['category'],
                    "description": df.iloc[i]['description'],
                    "score": float(score),
                    "type": "ml_isolation_forest",
                    "reason": "Multivariate anomaly (unusual combination of amount, category, and timing)"
                })
        
        return anomalies

if __name__ == "__main__":
    # Test with mockup data
    from datetime import date
    
    test_expenses = [
        Expense(id=i, amount=10.0 + i, category="Food", description="Daily Lunch", date=date(2026,1, (i % 28) + 1)) 
        for i in range(20)
    ]
    # Add some anomalies
    test_expenses.append(Expense(id=101, amount=1000.0, category="Food", description="Big Feast", date=date(2026,1,15)))
    test_expenses.append(Expense(id=102, amount=5.0, category="Utilities", description="Small Tip", date=date(2026,1,20)))
    
    detector = AnomalyDetector()
    print("--- ML-based Anomalies ---")
    anomalies = detector.detect_ml_anomalies(test_expenses)
    for a in anomalies:
        print(f"ID: {a['expense_id']}, Amount: {a['amount']}, Reason: {a['reason']}")
