import pandas as pd
from typing import List, Dict, Any
from data.schemas import Expense
from ml.predictor import ExpenseML
from ml.anomaly_detector import AnomalyDetector
from ml.forecaster import ExpenseForecaster

class InsightEngine:
    @staticmethod
    def generate_insights(expenses: List[Expense]) -> List[Dict[str, Any]]:
        insights = []
        if not expenses:
            return [{"type": "info", "message": "No data available to generate insights."}]

        df = pd.DataFrame([e.model_dump() for e in expenses])
        
        # 1. Total Spending Insight
        total_spend = df['amount'].sum()
        insights.append({
            "type": "summary",
            "title": "Total Spending Overview",
            "message": f"You have spent a total of ₹{total_spend:,.2f} across {len(expenses)} transactions.",
            "priority": "low"
        })

        # 2. Category Concentration Insight
        category_totals = df.groupby('category')['amount'].sum()
        if not category_totals.empty:
            top_category = category_totals.idxmax()
            top_amount = category_totals.max()
            percentage = (top_amount / total_spend) * 100
            
            insights.append({
                "type": "category_focus",
                "title": f"High Spending in {top_category}",
                "message": f"{top_category} accounts for {percentage:.1f}% of your total spending (₹{top_amount:,.2f}).",
                "priority": "medium" if percentage > 40 else "low"
            })

        # 3. Anomaly Insights
        anomalies = AnomalyDetector.detect_ml_anomalies(expenses)
        if anomalies:
            insights.append({
                "type": "anomaly_alert",
                "title": "Unusual Activity Detected",
                "message": f"We found {len(anomalies)} transactions that look out of character for your spending habits.",
                "data": anomalies,
                "priority": "high"
            })

        # 4. Forecasting Insights
        if len(expenses) >= 10:
            forecast = ExpenseForecaster.forecast_spending(expenses, periods=30)
            if "total_forecasted_spend" in forecast:
                trend = forecast["trend"]
                future_spend = forecast["total_forecasted_spend"]
                
                insights.append({
                    "type": "forecast",
                    "title": f"Spending Trend: {trend.capitalize()}",
                    "message": f"Based on current trends, you are projected to spend ₹{future_spend:,.2f} over the next 30 days.",
                    "priority": "medium" if trend == "increasing" else "low"
                })

        # 5. Saving Opportunity (If trend is increasing)
        # (Simplified logic for now)
        if len(expenses) >= 10:
             forecast = ExpenseForecaster.forecast_spending(expenses, periods=30)
             if forecast.get("trend") == "increasing":
                 insights.append({
                     "type": "saving_tip",
                     "title": "Saving Opportunity",
                     "message": "Your spending is on an upward trend. High-impact areas like food and subscriptions could be optimized to save ₹200-500 next month.",
                     "priority": "medium"
                 })

        return insights

if __name__ == "__main__":
    # Test Insight Generation
    from datetime import date
    test_expenses = [
        Expense(id=i, amount=50.0 + (i*2), category="Food", description=f"Meal {i}", date=date(2026, 1, (i % 28) + 1))
        for i in range(15)
    ]
    # Add an anomaly
    test_expenses.append(Expense(id=101, amount=1000.0, category="Shopping", description="Luxury Watch", date=date(2026, 1, 15)))
    
    engine = InsightEngine()
    results = engine.generate_insights(test_expenses)
    for insight in results:
        print(f"[{insight['type'].upper()}] {insight['title']}: {insight['message']}")
