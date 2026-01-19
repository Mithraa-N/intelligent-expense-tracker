from typing import List
from data.schemas import Expense, ExpenseCreate
from ml.predictor import ExpenseML

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
        
        expense_dict = expense.model_dump()
        
        # Automatically predict category if not provided
        if not expense_dict.get('category'):
            prediction = ExpenseML.predict_category(expense_dict['description'])
            if "category" in prediction:
                expense_dict['category'] = prediction['category']
            else:
                expense_dict['category'] = "Uncategorized"

        new_expense = Expense(id=id_counter, **expense_dict)
        expenses_db.append(new_expense)
        id_counter += 1
        return new_expense
