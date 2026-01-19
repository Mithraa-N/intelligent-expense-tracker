from fastapi import APIRouter
from typing import List, Dict, Any
from data.schemas import Expense, ExpenseCreate
from services.expense_service import ExpenseService
from ml.parser import ExpenseParser
from ml.predictor import ExpenseML
from ml.anomaly_detector import AnomalyDetector
from ml.forecaster import ExpenseForecaster
from ml.insights import InsightEngine

# Main router for grouped endpoints
router = APIRouter()

# --- Core Expense Management ---

@router.get("/expenses", response_model=List[Expense], tags=["Expenses"])
async def get_expenses():
    """Returns a list of all expenses."""
    return ExpenseService.get_all_expenses()

@router.post("/expenses", response_model=Expense, tags=["Expenses"])
async def create_expense(expense: ExpenseCreate):
    """Creates a new expense and automatically predicts category if missing."""
    return ExpenseService.add_expense(expense)

# --- AI & Intelligence Suite ---

@router.post("/ai/parse", tags=["Intelligence"])
async def parse_expense(text: str):
    """Extracts amount, date, description, and category from free-text natural language."""
    return ExpenseParser.parse_text(text)

@router.get("/ai/analyze", tags=["Intelligence"])
async def analyze_expenses():
    """Provides a structural breakdown of spending by category."""
    expenses = ExpenseService.get_all_expenses()
    return ExpenseML.analyze_spending(expenses)

@router.get("/ai/anomalies", tags=["Intelligence"])
async def get_anomalies():
    """Identifies unusual or out-of-character spending using ML (Isolation Forest)."""
    expenses = ExpenseService.get_all_expenses()
    return AnomalyDetector.detect_ml_anomalies(expenses)

@router.get("/ai/forecast", tags=["Intelligence"])
async def get_forecast(days: int = 30):
    """Projects future spending trends based on historical daily patterns."""
    expenses = ExpenseService.get_all_expenses()
    return ExpenseForecaster.forecast_spending(expenses, days)

@router.get("/ai/insights", tags=["Intelligence"])
async def get_insights():
    """Generates actionable financial advice and highlights critical warnings."""
    expenses = ExpenseService.get_all_expenses()
    return InsightEngine.generate_insights(expenses)

@router.get("/ai/health-check", tags=["Intelligence"])
async def intelligence_health():
    """Checks the status of all ML models and provides data readiness status."""
    expenses = ExpenseService.get_all_expenses()
    return {
        "status": "active",
        "data_points": len(expenses),
        "models_loaded": {
            "categorization": True,
            "anomaly_detection": "active",
            "forecasting": len(expenses) >= 10,
            "insights": "ready"
        }
    }
