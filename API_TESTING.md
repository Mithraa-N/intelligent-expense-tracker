# 📡 API Testing Guide - CRUD Operations

This guide demonstrates how to test all CRUD (Create, Read, Update, Delete) operations with the Intelligent Expense Tracker API.

## Base URL
```
http://localhost:8000/api/v1
```

## Prerequisites
- Backend server running (`python main.py`)
- Tool for testing: cURL, Postman, or browser

---

## 1. CREATE - Add New Expense

### Create an Expense
```bash
curl -X POST "http://localhost:8000/api/v1/expenses" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Grocery shopping",
    "amount": 150.50,
    "category": "Food",
    "date": "2026-01-20",
    "type": "expense",
    "user_id": 1
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "description": "Grocery shopping",
  "amount": 150.50,
  "category": "Food",
  "date": "2026-01-20",
  "type": "expense",
  "user_id": 1,
  "created_at": "2026-01-21T00:19:15",
  "updated_at": null
}
```

### Create with Auto-Category Prediction
```bash
curl -X POST "http://localhost:8000/api/v1/expenses" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Starbucks coffee",
    "amount": 5.50,
    "date": "2026-01-21",
    "type": "expense"
  }'
```

---

## 2. READ - Retrieve Expenses

### Get All Expenses
```bash
curl "http://localhost:8000/api/v1/expenses"
```

### Get with Pagination
```bash
curl "http://localhost:8000/api/v1/expenses?skip=0&limit=10"
```

### Filter by Category
```bash
curl "http://localhost:8000/api/v1/expenses?category=Food"
```

### Filter by Type
```bash
curl "http://localhost:8000/api/v1/expenses?type=expense"
```

### Filter by User
```bash
curl "http://localhost:8000/api/v1/expenses?user_id=1"
```

### Filter by Date Range
```bash
curl "http://localhost:8000/api/v1/expenses?start_date=2026-01-01&end_date=2026-01-31"
```

### Combined Filters
```bash
curl "http://localhost:8000/api/v1/expenses?category=Food&type=expense&limit=5"
```

### Get Single Expense by ID
```bash
curl "http://localhost:8000/api/v1/expenses/1"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "description": "Grocery shopping",
  "amount": 150.50,
  "category": "Food",
  "date": "2026-01-20",
  "type": "expense",
  "user_id": 1,
  "created_at": "2026-01-21T00:19:15",
  "updated_at": null
}
```

---

## 3. UPDATE - Modify Expense

### Update Specific Fields
```bash
curl -X PUT "http://localhost:8000/api/v1/expenses/1" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 175.00,
    "description": "Grocery shopping at Whole Foods"
  }'
```

### Update Category
```bash
curl -X PUT "http://localhost:8000/api/v1/expenses/1" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Groceries"
  }'
```

**Response (200 OK):**
```json
{
  "id": 1,
  "description": "Grocery shopping at Whole Foods",
  "amount": 175.00,
  "category": "Groceries",
  "date": "2026-01-20",
  "type": "expense",
  "user_id": 1,
  "created_at": "2026-01-21T00:19:15",
  "updated_at": "2026-01-21T00:20:30"
}
```

---

## 4. DELETE - Remove Expense

### Delete an Expense
```bash
curl -X DELETE "http://localhost:8000/api/v1/expenses/1"
```

**Response (204 No Content):**
```
(Empty response body)
```

---

## AI Features

### Parse Natural Language
```bash
curl -X POST "http://localhost:8000/api/v1/ai/parse?text=Spent%20250%20on%20lunch%20yesterday"
```

### Get Spending Analysis
```bash
curl "http://localhost:8000/api/v1/ai/analyze"
```

### Detect Anomalies
```bash
curl "http://localhost:8000/api/v1/ai/anomalies"
```

### Get Forecast
```bash
curl "http://localhost:8000/api/v1/ai/forecast?days=30"
```

### Get Insights
```bash
curl "http://localhost:8000/api/v1/ai/insights"
```

---

## Error Responses

### 404 Not Found
```json
{
  "detail": "Expense with ID 999 not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Failed to create expense: amount must be positive"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "amount"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

---

## Testing with Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Create expense
response = requests.post(
    f"{BASE_URL}/expenses",
    json={
        "description": "Test expense",
        "amount": 50.00,
        "category": "Food",
        "date": "2026-01-21",
        "type": "expense"
    }
)
print(response.json())

# Get all expenses
response = requests.get(f"{BASE_URL}/expenses")
expenses = response.json()
print(f"Total expenses: {len(expenses)}")

# Update expense
expense_id = expenses[0]["id"]
response = requests.put(
    f"{BASE_URL}/expenses/{expense_id}",
    json={"amount": 75.00}
)
print(response.json())

# Delete expense
response = requests.delete(f"{BASE_URL}/expenses/{expense_id}")
print(f"Status: {response.status_code}")
```

---

## Testing with JavaScript/Fetch

```javascript
const BASE_URL = "http://localhost:8000/api/v1";

// Create expense
async function createExpense() {
  const response = await fetch(`${BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: "Test expense",
      amount: 50.00,
      category: "Food",
      date: "2026-01-21",
      type: "expense"
    })
  });
  const data = await response.json();
  console.log(data);
}

// Get all expenses
async function getExpenses() {
  const response = await fetch(`${BASE_URL}/expenses`);
  const expenses = await response.json();
  console.log(`Total: ${expenses.length}`);
}

// Update expense
async function updateExpense(id) {
  const response = await fetch(`${BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 75.00 })
  });
  const data = await response.json();
  console.log(data);
}

// Delete expense
async function deleteExpense(id) {
  const response = await fetch(`${BASE_URL}/expenses/${id}`, {
    method: 'DELETE'
  });
  console.log(`Status: ${response.status}`);
}
```

---

## Interactive API Documentation

Visit **http://localhost:8000/docs** for interactive Swagger UI where you can:
- Test all endpoints directly in the browser
- See request/response schemas
- View example values
- Try different parameters

---

## Database Location

The SQLite database is stored at:
```
./expenses.db
```

You can inspect it using:
```bash
sqlite3 expenses.db
.tables
SELECT * FROM expenses;
```

---

**Happy Testing! 🚀**
