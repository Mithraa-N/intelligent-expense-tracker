from pydantic import BaseModel, Field, field_validator
from datetime import date as dt_date, datetime
from typing import Optional


class ExpenseBase(BaseModel):
    """Base expense schema with common fields"""
    description: str = Field(..., min_length=1, max_length=255, description="Expense description")
    amount: float = Field(..., gt=0, description="Expense amount (must be positive)")
    category: str = Field(..., min_length=1, max_length=100, description="Expense category")
    date: dt_date = Field(..., description="Expense date")
    type: str = Field(default="expense", description="Transaction type: 'expense' or 'income'")
    user_id: Optional[int] = Field(None, description="User ID who created the expense")

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ['expense', 'income']:
            raise ValueError("Type must be either 'expense' or 'income'")
        return v


class ExpenseCreate(BaseModel):
    """Schema for creating a new expense"""
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    date: dt_date
    type: str = Field(default="expense")
    user_id: Optional[int] = None

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ['expense', 'income']:
            raise ValueError("Type must be either 'expense' or 'income'")
        return v


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing expense"""
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    date: Optional[dt_date] = None
    type: Optional[str] = None
    user_id: Optional[int] = None

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ['expense', 'income']:
            raise ValueError("Type must be either 'expense' or 'income'")
        return v


class ExpenseResponse(ExpenseBase):
    """Schema for expense responses"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            dt_date: lambda v: v.isoformat() if v else None
        }


# Legacy alias for backward compatibility
Expense = ExpenseResponse
