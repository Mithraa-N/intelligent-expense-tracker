from typing import List
from data.schemas import Expense, ExpenseCreate

# In-memory storage for demonstration
expenses_db = []
id_counter = 1

class ExpenseService:
    @staticmethod
    def get_all_expenses() -> List[Expense]:
        return expenses_db

    @staticmethod
    def add_expense(expense: ExpenseCreate) -> Expense:
        global id_counter
        new_expense = Expense(id=id_counter, **expense.model_dump())
        expenses_db.append(new_expense)
        id_counter += 1
        return new_expense
