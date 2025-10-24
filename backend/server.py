#!/usr/bin/env python3
"""
FastAPI server to handle process execution requests from the frontend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
from pathlib import Path
from browser_agent.main import execute_task_from_json

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunProcessRequest(BaseModel):
    process_id: str
    process_name: str
    task_json_path: str
    website_url: str


class RunProcessResponse(BaseModel):
    success: bool
    message: str
    result: dict | None = None


@app.get("/")
async def root():
    return {"status": "ok", "message": "EchoTwin Backend API"}


@app.post("/api/run-process", response_model=RunProcessResponse)
async def run_process(request: RunProcessRequest):
    """
    Execute a browser automation task using browser_agent.

    Args:
        process_id: Unique identifier for the process
        process_name: Human-readable name
        task_json_path: Path to the JSON file containing task steps
        website_url: The URL to navigate to

    Returns:
        RunProcessResponse with execution results
    """
    try:
        # Validate that the JSON file exists
        json_path = Path(request.task_json_path)
        if not json_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Task JSON file not found: {request.task_json_path}"
            )

        # Load the task data
        with open(json_path, 'r') as f:
            task_data = json.load(f)

        # Execute the browser automation task
        print(f"🚀 Starting process: {request.process_name}")
        print(f"   Task JSON: {request.task_json_path}")
        print(f"   Website: {request.website_url}")

        result = await execute_task_from_json(task_data, request.website_url)

        print(f"✅ Process completed: {request.process_name}")

        return RunProcessResponse(
            success=True,
            message=f"Process '{request.process_name}' completed successfully",
            result={"output": str(result)}
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
    except Exception as e:
        print(f"❌ Error running process: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error executing process: {str(e)}")


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
