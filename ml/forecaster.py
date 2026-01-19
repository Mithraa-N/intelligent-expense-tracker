import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List, Dict, Any
from data.schemas import Expense
from datetime import datetime, timedelta

class ExpenseForecaster:
    @staticmethod
    def forecast_spending(expenses: List[Expense], periods: int = 30) -> Dict[str, Any]:
        """
        Forecasts daily spending for the next 'periods' days using Linear Regression.
        """
        if len(expenses) < 10:
            return {"error": "Not enough data for forecasting (minimum 10 records required)"}

        df = pd.DataFrame([e.model_dump() for e in expenses])
        df['date'] = pd.to_datetime(df['date'])
        
        # Aggregate spending by date
        daily_spend = df.groupby('date')['amount'].sum().reset_index()
        daily_spend = daily_spend.sort_values('date')

        # Fill missing dates with 0 to have a continuous time series
        all_dates = pd.date_range(start=daily_spend['date'].min(), end=daily_spend['date'].max(), freq='D')
        daily_spend = daily_spend.set_index('date').reindex(all_dates, fill_value=0).reset_index()
        daily_spend.columns = ['date', 'amount']

        # Feature engineering: days since start
        start_date = daily_spend['date'].min()
        daily_spend['day_num'] = (daily_spend['date'] - start_date).dt.days
        
        # Train Linear Regression model
        X = daily_spend[['day_num']].values
        y = daily_spend['amount'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Forecast for next N days
        last_day = daily_spend['day_num'].max()
        forecast_days = np.array(range(last_day + 1, last_day + 1 + periods)).reshape(-1, 1)
        predictions = model.predict(forecast_days)
        
        # Ensure no negative forecasts
        predictions = np.maximum(predictions, 0)
        
        forecast_dates = [start_date + timedelta(days=int(d)) for d in forecast_days.flatten()]
        
        results = [
            {"date": d.strftime("%Y-%m-%d"), "forecasted_amount": float(a)}
            for d, a in zip(forecast_dates, predictions)
        ]
        
        total_forecasted = sum(predictions)
        
        # Trend analysis
        slope = model.coef_[0]
        trend = "increasing" if slope > 0.01 else "decreasing" if slope < -0.01 else "stable"

        return {
            "forecast": results,
            "total_forecasted_spend": float(total_forecasted),
            "trend": trend,
            "days_ahead": periods
        }

if __name__ == "__main__":
    # Test
    from data.schemas import Expense
    from datetime import date
    
    test_expenses = [
        Expense(id=i, amount=10.0 + i * 0.5, category="Food", description="Lunch", date=date(2026,1, (i % 28) + 1))
        for i in range(20)
    ]
    
    forecaster = ExpenseForecaster()
    result = forecaster.forecast_spending(test_expenses)
    print(f"Trend: {result['trend']}")
    print(f"Total Forecasted (30 days): {result['total_forecasted_spend']:.2f}")
    print(f"Next 3 days: {result['forecast'][:3]}")
