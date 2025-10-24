# EchoTwin - Setup and Run Instructions

## Overview
When you click "Run" on a process in the frontend, it now triggers the backend browser automation (`backend/browser_agent/main.py`).

## Installation

### Backend Dependencies
```bash
pip install fastapi uvicorn browser-use langchain-openai dedalus-labs python-dotenv pyautogui pynput Pillow
```

### Frontend Dependencies
```bash
cd frontend
npm install
```

## Running the Application

You need to run **two servers**:

### 1. Backend API Server
```bash
# From the project root
python backend/server.py
```
This starts the FastAPI server on `http://localhost:8000`

### 2. Frontend Development Server
```bash
# In a separate terminal
cd frontend
npm run dev
```
This starts the Vite dev server on `http://localhost:5173`

## How It Works

1. **Create a Process**: Click "New Process" in the frontend and fill in the details
2. **Click "Run"**: When you click the "Run" button on a process card:
   - Frontend sends a POST request to `http://localhost:8000/api/run-process`
   - Backend loads the task JSON from `backend/browser_agent/sample.json`
   - Executes browser automation using browser_agent/main.py
   - Process status updates in real-time

## API Endpoints

- `POST /api/run-process` - Execute a browser automation task
  - Body: `{ process_id, process_name, task_json_path, website_url }`
- `GET /api/health` - Health check endpoint

## Notes

- Currently hardcoded to use `backend/browser_agent/sample.json` and `https://wuandnussbaumnyc.com/`
- Browser automation runs with `headless: False` so you can see what's happening
- Process status shows "running" during execution, then returns to "ready"
- Check browser console for detailed logs
