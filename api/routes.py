from fastapi import APIRouter, HTTPException
from typing import List
from data.schemas import Expense, ExpenseCreate
from services.expense_service import ExpenseService

router = APIRouter()

@router.get("/expenses", response_model=List[Expense])
async def get_expenses():
    return ExpenseService.get_all_expenses()

@router.post("/expenses", response_model=Expense)
async def create_expense(expense: ExpenseCreate):
    return ExpenseService.add_expense(expense)
