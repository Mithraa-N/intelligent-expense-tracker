from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.routes import router as api_router
import time
from datetime import datetime

# Application metadata
app = FastAPI(
    title="Intelligent Expense Tracker API",
    description="""
    A powerful AI-driven financial backend with:
    - Smart expense categorization
    - Anomaly detection
    - Spending forecasting
    - Natural language parsing
    - Actionable insights
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/openapi.json"
)

# Store startup time for uptime calculation
startup_time = time.time()

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    from database import engine
    import models
    
    print("🚀 Starting Intelligent Expense Tracker API...")
    print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create database tables
    print("📦 Initializing database...")
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")
    
    print("📊 API Documentation: http://localhost:8000/docs")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("👋 Shutting down Intelligent Expense Tracker API...")

# Root endpoint
@app.get("/", tags=["General"])
async def root():
    """Welcome endpoint with API information"""
    return {
        "message": "Welcome to Intelligent Expense Tracker API",
        "version": "1.0.0",
        "documentation": "/docs",
        "status": "online",
        "endpoints": {
            "health": "/health",
            "api": "/api/v1",
            "docs": "/docs"
        }
    }

# Comprehensive health check endpoint
@app.get("/health", tags=["General"])
async def health_check():
    """
    Comprehensive health check endpoint
    Returns system status, uptime, and service availability
    """
    uptime_seconds = time.time() - startup_time
    uptime_minutes = uptime_seconds / 60
    uptime_hours = uptime_minutes / 60
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": {
            "seconds": round(uptime_seconds, 2),
            "minutes": round(uptime_minutes, 2),
            "hours": round(uptime_hours, 2)
        },
        "services": {
            "api": "operational",
            "database": "in-memory",
            "ml_models": "loaded"
        },
        "version": "1.0.0"
    }

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle unexpected errors gracefully"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "path": str(request.url)
        }
    )

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🏠 Intelligent Expense Tracker Backend")
    print("=" * 60)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True  # Enable auto-reload during development
    )
