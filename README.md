# 🧠 Intelligent Expense Tracker

> **A Next-Gen Finance Manager powered by AI.**  
> Track, Analyze, and Optimize your household spending with Machine Learning.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/frontend-React-61DAFB.svg) ![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg) ![Status](https://img.shields.io/badge/status-Active-success.svg)

---

## 🧐 Problem Statement

Managing household finances is often tedious, manual, and reactive. Traditional trackers are just "digital ledgers"—they store data but don't help you understand it.

**We solved this by building a tracker that thinks.**
Instead of just logging numbers, this application uses AI to:
- **Parse** natural language (e.g., "Spent 20 bucks on coffee") automatically.
- **Predict** categories for your expenses so you don't have to fiddle with dropdowns.
- **Detect** spending anomalies to warn you of unusual transactions.
- **Forecast** future spending to help you plan better.

---

## ✨ Key Features

### 🚀 Smart Entry & Automation
- **AI Smart Add**: Type "Dinner at Italian place for 2000" and let NLP extract the amount, date, and category.
- **Auto-Categorization**: Our ML model predicts categories (e.g., "Transport", "Food") based on your description.
- **OCR Receipt Scanning**: Upload an image of a receipt, and we'll extract the text and numbers.
- **Excel Import**: Bulk import transactions from your bank statements.

### 📊 Visualization & insights
- **Interactive Dashboard**: Beautiful charts for daily cashflow, category distribution, and monthly momentum.
- **Efficiency Score**: A live metric showing how well you are saving relative to your income.
- **Spending Forecast**: A 30-day projection of your expenses based on historical data.
- **Anomaly Detection**: Flags transactions that deviate significantly from your normal spending habits.

### 🛠 Core Management
- **Multi-User Support**: Track spending for different family members individually.
- **Custom Categories**: Create and color-code your own expense categories.
- **Full CRUD**: Edit, delete, and manage your financial history properly.

---

## 🤖 What Makes It "Intelligent"?

This isn't just a CRUD app. It runs a dedicated ML pipeline under the hood:

1.  **NLP Parser**: Uses regex and keyword analysis to break down free-text inputs into structured data.
2.  **Category Predictor**: A **Logistic Regression** model (trained on TF-IDF vectors) that learns from transaction descriptions to classify expenses automatically.
3.  **Anomaly Detector**: Statistical models (Isolation Forest / Z-Score) to identify outliers in your spending compared to peer groups.
4.  **Forecasting Engine**: Time-series analysis to project future burn rates.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Modern CSS3 (Glassmorphism, CSS Variables, Responsive Grid)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Utilities**: Tesseract.js (OCR), XLSX (Excel), Lucide React (Icons)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (with SQLAlchemy ORM)
- **validation**: Pydantic

### Machine Learning (The Brains)
- **Libraries**: Scikit-learn, Pandas, NumPy, Joblib
- **Models**: Logistic Regression, TfidfVectorizer

---

## 🏃‍♂️ How to Run Locally

### Prerequisites
- Node.js (v16+)
- Python (3.9+)

### 1. Backend Setup
Navigate to the root directory:
```bash
# Install Python dependencies
pip install -r requirements.txt

# Train the ML Model (Required for Auto-Categorization)
python ml/data_generator.py   # Generates training data
python ml/preprocessing.py    # Cleans data
python ml/train.py            # Trains and saves model.pkl

# Start the Server
uvicorn main:app --reload
```
The API will run at `http://localhost:8000`.  
Swagger Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
Open a new terminal in the `root` directory (or where `package.json` is):
```bash
# Install Node dependencies
npm install

# Start the Dev Server
npm run dev
```
The App will run at `http://localhost:5173`.

---

## 🚢 Deployment Preparation

To deploy the frontend to production (e.g., Vercel, Netlify):

1.  **Set the API URL**:
    Create a `.env` file in the root if you need to point to a production backend.
    ```env
    VITE_API_URL=https://your-production-api.com/api/v1
    ```

2.  **Build**:
    ```bash
    npm run build
    ```
    This generates a optimized `dist/` folder ready for static hosting.

---

## 📝 License
MIT License. Built for the **Google DeepMind Agentic Coding Challenge**.
