# 🧠 Intelligent Expense Tracker

> **A Next-Gen Finance Manager powered by AI.**  
> Track, Analyze, and Optimize your household spending with Machine Learning.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/frontend-React-61DAFB.svg) ![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg) ![Status](https://img.shields.io/badge/status-Active-success.svg)

---

## 📸 Screenshots

### Dashboard View
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Smart Add Feature
![Smart Add](https://via.placeholder.com/800x400?text=Smart+Add+Screenshot)

### Analytics & Reports
![Reports](https://via.placeholder.com/800x400?text=Reports+Screenshot)

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

### 📊 Visualization & Insights
- **Interactive Dashboard**: Beautiful charts for daily cashflow, category distribution, and monthly momentum.
- **Efficiency Score**: A live metric showing how well you are saving relative to your income.
- **Spending Forecast**: A 30-day projection of your expenses based on historical data.
- **Anomaly Detection**: Flags transactions that deviate significantly from your normal spending habits.

### 🛠 Core Management
- **Multi-User Support**: Track spending for different family members individually.
- **Custom Categories**: Create and color-code your own expense categories.
- **Full CRUD**: Edit, delete, and manage your financial history properly.
- **Error Boundaries**: Robust error handling prevents blank screens and provides helpful debugging information.

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
- **Framework**: React 19 (Vite 7)
- **Styling**: Modern CSS3 (Glassmorphism, CSS Variables, Responsive Grid)
- **Charts**: Recharts 3.6
- **Animations**: Framer Motion 12
- **Utilities**: Tesseract.js (OCR), XLSX (Excel), Lucide React (Icons)

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: SQLite (with SQLAlchemy ORM)
- **Validation**: Pydantic
- **CORS**: Enabled for local development

### Machine Learning (The Brains)
- **Libraries**: Scikit-learn, Pandas, NumPy, Joblib
- **Models**: Logistic Regression, TfidfVectorizer

---

## 🏃‍♂️ Quick Start (5 Minutes)

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

### TL;DR
```bash
# Backend
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python main.py

# Frontend (new terminal)
npm install
npm run dev
```

Visit `http://localhost:5173` 🎉

---

## 📚 Detailed Setup Guide

### Prerequisites
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/Mithraa-N/intelligent-expense-tracker.git
cd intelligent-expense-tracker
```

### 2. Backend Setup

#### a. Create Virtual Environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

#### b. Install Dependencies
```bash
pip install -r requirements.txt
```

#### c. Train ML Model (Optional but Recommended)
```bash
python ml/data_generator.py   # Generates synthetic training data
python ml/preprocessing.py    # Cleans and prepares data
python ml/train.py            # Trains the category prediction model
```

#### d. Start Backend Server
```bash
python main.py
```

**Backend runs at:** `http://localhost:8000`  
**API Documentation:** `http://localhost:8000/docs`

### 3. Frontend Setup

Open a **new terminal** window:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

## 🚢 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. **Create `Procfile`**:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Add `.env` variables** on your platform:
   ```
   DATABASE_URL=postgresql://... (if using Postgres)
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

3. **Deploy**:
   - Connect your GitHub repo
   - Platform auto-detects Python and installs from `requirements.txt`
   - Starts server with Procfile command

### Frontend Deployment (Vercel/Netlify)

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Option 2: Netlify
```bash
npm run build
# Upload 'dist' folder to Netlify
```

#### Configure Environment Variable
Create `.env.production`:
```env
VITE_API_URL=https://your-backend-api.com/api/v1
```

---

## 🐛 Recent Bug Fixes (Latest Commit)

### Fixed Blank Screen Issue
- **Problem**: Application showed blank screen on load
- **Root Cause**: AI insights data was not always returning as an array, causing `.map()` errors
- **Solution**:
  - Added `ErrorBoundary` component to catch and display errors
  - Fixed users state initialization with fallback to `INITIAL_USERS`
  - Added `Array.isArray()` checks for all AI data (insights, anomalies)

### Enhanced Error Handling
- **Error boundaries** now show detailed error messages instead of blank screens
- **"Clear Data & Reload"** button helps recover from corrupt localStorage
- **Graceful degradation** when backend APIs are unavailable

---

## 🛠 Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Mac/Linux

# Change port in config.py or .env
PORT=8001
```

### Frontend Shows Blank Screen
1. Open browser console (F12)
2. Look for red errors
3. Check if backend is running (`http://localhost:8000/health`)
4. Clear browser localStorage: `localStorage.clear()` in console
5. Refresh the page

### Module Not Found Errors
```bash
# Make sure virtual environment is activated
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Errors
- Check that backend `config.py` has your frontend URL in `ALLOWED_ORIGINS`
- Default is `http://localhost:5173` for development

---

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[API_TESTING.md](./API_TESTING.md)** - Complete API endpoint documentation
- **[API Docs (Interactive)](http://localhost:8000/docs)** - Swagger UI (when backend is running)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - feel free to use this project for learning or personal use.

**Built with ❤️ by [Mithraa-N](https://github.com/Mithraa-N)**

---

## 🙏 Acknowledgments

- Google DeepMind for the Agentic Coding Challenge
- The amazing open-source community
- All contributors and testers

---

## 📧 Contact

- **GitHub**: [@Mithraa-N](https://github.com/Mithraa-N)
- **Project Link**: [https://github.com/Mithraa-N/intelligent-expense-tracker](https://github.com/Mithraa-N/intelligent-expense-tracker)

---

⭐ **Star this repo if you found it helpful!**
