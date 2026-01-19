from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router

app = FastAPI(
    title="Intelligent Expense Tracker API",
    description="A powerful AI-driven financial backend with categorization, forecasting, and anomaly detection.",
    version="1.0.0"
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include consolidated routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["General"])
async def root():
    return {
        "message": "Welcome to Intelligent Expense Tracker API",
        "documentation": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Intelligent Backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
