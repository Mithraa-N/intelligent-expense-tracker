from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from ml.predictor import ExpenseML
from services.expense_service import ExpenseService
from ml.parser import ExpenseParser

app = FastAPI(title="Intelligent Expense Tracker API")

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Intelligent Expense Tracker API"}

@app.post("/api/v1/ml/parse")
async def parse_expense_text(text: str):
    return ExpenseParser.parse_text(text)

@app.get("/api/v1/ml/analyze")
async def analyze_expenses():
    expenses = ExpenseService.get_all_expenses()
    return ExpenseML.analyze_spending(expenses)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
