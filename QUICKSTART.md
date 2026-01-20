# 🚀 Quick Start Guide - Intelligent Expense Tracker

This guide will help you get the Intelligent Expense Tracker up and running in under 5 minutes.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.8 or higher (`python --version`)
- ✅ Node.js 16 or higher (`node --version`)
- ✅ npm or yarn (`npm --version`)

## Step 1: Clone or Download

If you haven't already, navigate to the project directory:
```bash
cd "intelligent expense tracker"
```

## Step 2: Backend Setup (2 minutes)

### 2.1 Create Virtual Environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 2.2 Install Dependencies
```bash
pip install -r requirements.txt
```

### 2.3 Start the Backend
```bash
python main.py
```

You should see:
```
============================================================
🏠 Intelligent Expense Tracker Backend
============================================================
🚀 Starting Intelligent Expense Tracker API...
📅 Started at: 2026-01-21 00:16:47
📊 API Documentation: http://localhost:8000/docs
```

**✅ Backend is running!** Keep this terminal open.

## Step 3: Frontend Setup (2 minutes)

Open a **new terminal** in the same directory.

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Start the Frontend
```bash
npm run dev
```

You should see:
```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Frontend is running!**

## Step 4: Access the Application

1. **Open your browser** and navigate to: http://localhost:5173
2. **Login** with any name and email (no authentication required for demo)
3. **Start tracking expenses!**

## Step 5: Explore Features

### Try Natural Language Input
In the "Quick Add" bar, type:
```
Spent ₹250 on lunch yesterday
```
Press Enter and watch it automatically parse!

### View API Documentation
Visit http://localhost:8000/docs to see interactive API documentation.

### Check System Health
Visit http://localhost:8000/health to see backend status.

## Common Issues & Solutions

### Issue: Port 8000 already in use
**Solution:** Change the port in `config.py` or `.env`:
```env
PORT=8001
```

### Issue: Module not found errors
**Solution:** Ensure virtual environment is activated:
```bash
# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

### Issue: Frontend not connecting to backend
**Solution:** Check that backend is running on port 8000 and CORS is enabled.

## Next Steps

1. **Add Sample Data**: Run `python seed_backend.py` to populate with test data
2. **Customize Categories**: Click the user icon → Add custom categories
3. **Add Household Members**: Click the + icon next to user avatars
4. **View Reports**: Click "Reports" button for detailed analytics
5. **Explore AI Features**: Try the anomaly detection and forecasting endpoints

## Stopping the Application

1. **Frontend**: Press `Ctrl+C` in the frontend terminal
2. **Backend**: Press `Ctrl+C` in the backend terminal
3. **Deactivate venv**: Type `deactivate` in the backend terminal

## Development Mode

Both servers run in development mode with auto-reload:
- **Backend**: Changes to `.py` files automatically restart the server
- **Frontend**: Changes to `.jsx` files trigger hot module replacement

## Production Deployment

For production deployment, see the main README.md file.

## Need Help?

- 📚 **Full Documentation**: See README.md
- 🔧 **API Docs**: http://localhost:8000/docs
- 💡 **Examples**: Check the `/examples` folder (if available)

---

**Happy Tracking! 🎉**
