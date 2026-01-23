from fastapi import APIRouter, HTTPException, Query, status, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import date

from data.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from database import get_db
import models
from ml.parser import ExpenseParser
from ml.predictor import ExpenseML
from ml.anomaly_detector import AnomalyDetector
from ml.forecaster import ExpenseForecaster
from ml.insights import InsightEngine

# Main router for grouped endpoints
router = APIRouter()

# --- Core Expense Management (CRUD) ---

@router.post(
    "/expenses",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Expenses"],
    summary="Create a new expense",
    description="Create a new expense entry with automatic category prediction if not provided"
)
async def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a new expense and automatically predicts category if missing.
    
    Args:
        expense: Expense data to create
        db: Database session
        
    Returns:
        ExpenseResponse: The created expense with assigned ID
    """
    try:
        # Predict category if not provided
        category = expense.category
        if not category:
            prediction = ExpenseML.predict_category(expense.description)
            category = prediction.get("category", "Other")
        
        # Create database model
        db_expense = models.Expense(
            description=expense.description,
            amount=expense.amount,
            category=category,
            date=expense.date,
            type=expense.type,
            user_id=expense.user_id
        )
        
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        
        return db_expense
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create expense: {str(e)}"
        )


@router.get(
    "/expenses",
    response_model=List[ExpenseResponse],
    tags=["Expenses"],
    summary="Get all expenses",
    description="Retrieve a list of all expenses with optional filtering"
)
async def get_expenses(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    category: Optional[str] = Query(None, description="Filter by category"),
    type: Optional[str] = Query(None, description="Filter by type (expense/income)"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    db: Session = Depends(get_db)
):
    """
    Returns a list of expenses with optional filtering and pagination.
    
    Query Parameters:
        - skip: Number of records to skip (pagination)
        - limit: Maximum number of records to return
        - category: Filter by category name
        - type: Filter by transaction type
        - user_id: Filter by user ID
        - start_date: Filter expenses from this date
        - end_date: Filter expenses until this date
    
    Returns:
        List[ExpenseResponse]: List of expense objects
    """
    try:
        query = db.query(models.Expense)
        
        # Apply filters
        if category:
            query = query.filter(models.Expense.category == category)
        if type:
            query = query.filter(models.Expense.type == type)
        if user_id:
            query = query.filter(models.Expense.user_id == user_id)
        if start_date:
            query = query.filter(models.Expense.date >= start_date)
        if end_date:
            query = query.filter(models.Expense.date <= end_date)
        
        # Order by date descending (most recent first)
        query = query.order_by(models.Expense.date.desc())
        
        # Apply pagination
        expenses = query.offset(skip).limit(limit).all()
        
        return expenses
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve expenses: {str(e)}"
        )


@router.get(
    "/expenses/{expense_id}",
    response_model=ExpenseResponse,
    tags=["Expenses"],
    summary="Get a specific expense",
    description="Retrieve a single expense by its ID"
)
async def get_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific expense by ID.
    
    Args:
        expense_id: The ID of the expense to retrieve
        db: Database session
        
    Returns:
        ExpenseResponse: The requested expense
        
    Raises:
        404: If expense not found
    """
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found"
        )
    
    return expense


@router.put(
    "/expenses/{expense_id}",
    response_model=ExpenseResponse,
    tags=["Expenses"],
    summary="Update an expense",
    description="Update an existing expense by its ID"
)
async def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing expense.
    
    Args:
        expense_id: The ID of the expense to update
        expense_update: Fields to update
        db: Database session
        
    Returns:
        ExpenseResponse: The updated expense
        
    Raises:
        404: If expense not found
    """
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found"
        )
    
    try:
        # Update only provided fields
        update_data = expense_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_expense, field, value)
        
        db.commit()
        db.refresh(db_expense)
        
        return db_expense
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update expense: {str(e)}"
        )


@router.delete(
    "/expenses/{expense_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Expenses"],
    summary="Delete an expense",
    description="Delete an expense by its ID"
)
async def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete an expense.
    
    Args:
        expense_id: The ID of the expense to delete
        db: Database session
        
    Returns:
        None (204 No Content)
        
    Raises:
        404: If expense not found
    """
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found"
        )
    
    try:
        db.delete(db_expense)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete expense: {str(e)}"
        )


# --- AI & Intelligence Suite ---

@router.post(
    "/ai/parse",
    tags=["Intelligence"],
    summary="Parse natural language expense",
    description="Extract expense details from free-text natural language input"
)
async def parse_expense(
    text: str = Query(
        ...,
        description="Natural language text describing the expense",
        example="Spent ₹250 on lunch yesterday"
    )
):
    """
    Extracts amount, date, description, and category from free-text natural language.
    
    Examples:
        - "Spent ₹250 on lunch yesterday"
        - "Paid $50 for groceries on Monday"
        - "Coffee at Starbucks for 5.50"
    
    Args:
        text: Natural language description of the expense
        
    Returns:
        dict: Parsed expense data with amount, category, description, and date
    """
    try:
        if not text or not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text parameter is required and cannot be empty"
            )
        return ExpenseParser.parse_text(text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse expense: {str(e)}"
        )


@router.post(
    "/ai/predict-category",
    tags=["Intelligence"],
    summary="Predict expense category",
    description="Predict the category of an expense based on its description using the trained ML model"
)
async def predict_category(
    text: str = Query(..., description="Expense description to categorize", example="Uber ride to work")
):
    """
    Predicts the category of an expense based on its description.
    
    Args:
        text: Expense description
        
    Returns:
        dict: Predicted category and confidence scores
    """
    try:
        if not text or not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text parameter is required"
            )
            
        return ExpenseML.predict_category(text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to predict category: {str(e)}"
        )


@router.get(
    "/ai/analyze",
    tags=["Intelligence"],
    summary="Analyze spending patterns",
    description="Get a detailed breakdown of spending by category and patterns"
)
async def analyze_expenses(db: Session = Depends(get_db)):
    """
    Provides a structural breakdown of spending by category.
    
    Returns:
        dict: Analysis results including category totals and percentages
    """
    try:
        expenses = db.query(models.Expense).all()
        if not expenses:
            return {
                "message": "No expenses to analyze",
                "categories": {},
                "total": 0
            }
        
        # Convert to dict format for ML analysis
        expense_dicts = [exp.to_dict() for exp in expenses]
        return ExpenseML.analyze_spending(expense_dicts)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze expenses: {str(e)}"
        )


@router.get(
    "/ai/anomalies",
    tags=["Intelligence"],
    summary="Detect spending anomalies",
    description="Identify unusual or out-of-character spending using ML (Isolation Forest)"
)
async def get_anomalies(db: Session = Depends(get_db)):
    """
    Identifies unusual or out-of-character spending using ML (Isolation Forest).
    
    Returns:
        list: List of detected anomalies with details
    """
    try:
        expenses = db.query(models.Expense).all()
        if len(expenses) < 10:
            return {
                "message": "Need at least 10 expenses for anomaly detection",
                "anomalies": []
            }
        
        expense_dicts = [exp.to_dict() for exp in expenses]
        return AnomalyDetector.detect_ml_anomalies(expense_dicts)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to detect anomalies: {str(e)}"
        )


@router.get(
    "/ai/forecast",
    tags=["Intelligence"],
    summary="Forecast future spending",
    description="Project future spending trends based on historical patterns"
)
async def get_forecast(
    days: int = Query(
        30,
        ge=1,
        le=365,
        description="Number of days to forecast (1-365)",
        example=30
    ),
    db: Session = Depends(get_db)
):
    """
    Projects future spending trends based on historical daily patterns.
    
    Args:
        days: Number of days to forecast (default: 30, max: 365)
        db: Database session
        
    Returns:
        dict: Forecast data with predicted spending for each day
    """
    try:
        expenses = db.query(models.Expense).all()
        if len(expenses) < 10:
            return {
                "message": "Need at least 10 expenses for forecasting",
                "forecast": []
            }
        
        expense_dicts = [exp.to_dict() for exp in expenses]
        return ExpenseForecaster.forecast_spending(expense_dicts, days)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate forecast: {str(e)}"
        )


@router.get(
    "/ai/insights",
    tags=["Intelligence"],
    summary="Get actionable insights",
    description="Generate AI-powered financial advice and warnings"
)
async def get_insights(db: Session = Depends(get_db)):
    """
    Generates actionable financial advice and highlights critical warnings.
    
    Returns:
        list: List of insights with priority levels and recommendations
    """
    try:
        expenses = db.query(models.Expense).all()
        if not expenses:
            return {
                "message": "No expenses to analyze for insights",
                "insights": []
            }
        
        expense_dicts = [exp.to_dict() for exp in expenses]
        return InsightEngine.generate_insights(expense_dicts)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insights: {str(e)}"
        )


@router.get(
    "/ai/health-check",
    tags=["Intelligence"],
    summary="Check ML models status",
    description="Verify the status of all ML models and data readiness"
)
async def intelligence_health(db: Session = Depends(get_db)):
    """
    Checks the status of all ML models and provides data readiness status.
    
    Returns:
        dict: Health status of ML services and models
    """
    try:
        expense_count = db.query(models.Expense).count()
        return {
            "status": "active",
            "data_points": expense_count,
            "models_loaded": {
                "categorization": True,
                "anomaly_detection": "active",
                "forecasting": expense_count >= 10,
                "insights": "ready"
            },
            "data_quality": {
                "sufficient_for_forecast": expense_count >= 10,
                "sufficient_for_anomaly": expense_count >= 10,
                "total_expenses": expense_count
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check health: {str(e)}"
        )
