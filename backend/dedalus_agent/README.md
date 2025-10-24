# Dedalus Agent - Screenshot Processing

This agent processes screenshots from `recording_agent` and outputs structured JSON in the same format as `browser_agent/sample.json`.

## 🔄 **Integration Flow**

```
recording_agent → dedalus_agent → browser_agent
     ↓              ↓              ↓
  .jpg files →  JSON output →  Task execution
```

## 📁 **File Structure**

```
backend/
├── recording_agent/
│   ├── screenshot_screen.py    # Captures screenshots
│   └── recordings/             # Output directory
│       └── YYYYMMDD_HHMMSS_screenshots/
│           ├── screenshot_0001_event_1.jpg
│           ├── screenshot_0002_event_2.jpg
│           └── ...
├── dedalus_agent/
│   ├── main.py                 # Processes screenshots → JSON
│   ├── test_integration.py     # Tests the integration
│   └── README.md              # This file
└── browser_agent/
    └── sample.json            # Target output format
```

## 🚀 **Usage**

### **1. Process Screenshots**
```bash
cd backend/dedalus_agent
python3 main.py <screenshots_dir> <output.json>
```

### **2. Test Integration**
```bash
cd backend/dedalus_agent
python3 test_integration.py
```

## 📋 **Input Format (from recording_agent)**

The `recording_agent` creates:
- **Directory**: `recordings/YYYYMMDD_HHMMSS_screenshots/`
- **Files**: `screenshot_XXXX_event_Y.jpg`
- **Events**: `YYYYMMDD_HHMMSS_events.json`

## 📤 **Output Format (matches browser_agent/sample.json)**

```json
{
  "task_id": "001",
  "task_name": "Brief description of the task",
  "steps": [
    {
      "step_id": "001",
      "step_name": "Description of first action"
    },
    {
      "step_id": "002", 
      "step_name": "Description of second action"
    }
  ]
}
```

## 🔧 **Key Features**

### **Smart File Detection**
- Automatically finds screenshots in `recording_agent` output
- Handles multiple session directories
- Supports `.jpg`, `.jpeg`, `.png` formats

### **Format Validation**
- Ensures output matches `browser_agent/sample.json` exactly
- Validates required fields: `task_id`, `task_name`, `steps`
- Formats `step_id` as "001", "002", etc.

### **Error Handling**
- Graceful fallback if images can't be sent to AI
- JSON parsing with multiple fallback strategies
- Comprehensive error reporting

## 🧪 **Testing**

Run the integration test to verify everything works:

```bash
# 1. First, run recording_agent to generate screenshots
cd ../recording_agent
python3 test_screen.py

# 2. Then test dedalus_agent integration
cd ../dedalus_agent
python3 test_integration.py
```

## 📊 **Expected Output**

```
============================================================
TESTING DEDALUS_AGENT INTEGRATION
============================================================
✅ Found recording_agent output directory: ../recording_agent/recordings
✅ Found 1 screenshot directories:
   - 20250124_144428_screenshots: 5 screenshots

🔄 Testing with latest directory: ../recording_agent/recordings/20250124_144428_screenshots
Found 5 screenshots:
  - screenshot_0001_event_1.jpg
  - screenshot_0002_event_2.jpg
  - screenshot_0003_event_3.jpg
  - screenshot_0004_event_4.jpg
  - screenshot_0005_event_5.jpg

🔄 Attempting to send images via DedalusRunner...
✅ Success with content blocks format!

📄 Response received:
{
  "task_id": "001",
  "task_name": "Order food from restaurant website",
  "steps": [
    {
      "step_id": "001",
      "step_name": "Navigate to restaurant website"
    },
    {
      "step_id": "002", 
      "step_name": "Browse menu items"
    }
  ]
}

✅ Saved output to: test_output.json
   Task: Order food from restaurant website
   Steps: 2

📋 Output format verification:
   task_id: 001
   task_name: Order food from restaurant website
   steps count: 2
     - 001: Navigate to restaurant website
     - 002: Browse menu items

📊 Comparing with sample.json:
   Sample task_id: 001
   Output task_id: 001
   Sample steps count: 2
   Output steps count: 2
✅ Structure matches sample.json format!

============================================================
✅ INTEGRATION TEST PASSED
   dedalus_agent correctly processes recording_agent output
   JSON output format matches browser_agent/sample.json
============================================================
```

## 🔗 **Integration with Frontend**

The processed JSON can be used by the frontend to:
1. **Display task steps** in the process cards
2. **Execute tasks** using browser_agent
3. **Track progress** through the workflow

## 🛠️ **Troubleshooting**

### **No screenshots found**
- Ensure `recording_agent` has been run first
- Check that screenshots are in the correct directory structure
- Verify file permissions

### **AI processing fails**
- Check API credentials in environment variables
- Verify network connectivity
- Check if images are too large or corrupted

### **JSON format issues**
- The agent automatically formats output to match `sample.json`
- Check that all required fields are present
- Verify step_id formatting (001, 002, etc.)
