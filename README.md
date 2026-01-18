# Intelligent Expense Tracker

A modern, ML-powered expense tracking application with a FastAPI backend and a React frontend.

## Architecture

This project follows an **ML-first architecture** designed for scalability and intelligence:

-   **/api**: Contains FastAPI route definitions and request/response handling.
-   **/ml**: Housing for machine learning models, predictors, and data analysis logic.
-   **/services**: Core business logic and database interaction services.
-   **/data**: Data schemas (Pydantic models) and data storage configurations.
-   **/src**: The React + Vite frontend application.

## Getting Started

### Backend

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`.

### Frontend

1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Features

- **Transaction CRUD**: Full management of income and expenses.
- **ML Analysis**: Intelligent spending breakdown and category-wise analysis.
- **Responsive UI**: A sleek, modern dashboard for financial monitoring.

