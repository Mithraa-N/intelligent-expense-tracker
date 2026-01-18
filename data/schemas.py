from pydantic import BaseModel
from datetime import date
from typing import Optional

class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: str
    date: date

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int

    class Config:
        from_attributes = True
