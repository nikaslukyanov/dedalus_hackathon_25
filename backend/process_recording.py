#!/usr/bin/env python3
"""
Wrapper script to process recording_agent output with dedalus_agent.
This script automates the complete flow from screenshots to JSON output.
"""

import asyncio
import sys
from pathlib import Path
from dedalus_agent.main import process_screenshots_with_runner


async def process_latest_recording(output_path: str = None):
    """
    Process the latest recording from recording_agent.
    
    Args:
        output_path: Path to save JSON output (default: auto-generated)
    """
    # Find the latest recording directory
    recordings_path = Path("recording_agent/recordings")
    
    if not recordings_path.exists():
        print("❌ No recordings found. Please run recording_agent first.")
        return False
    
    # Find screenshot directories
    screenshot_dirs = [d for d in recordings_path.iterdir() 
                      if d.is_dir() and d.name.endswith('_screenshots')]
    
    if not screenshot_dirs:
        print("❌ No screenshot directories found in recordings.")
        return False
    
    # Get the latest directory
    latest_dir = max(screenshot_dirs, key=lambda x: x.stat().st_mtime)
    print(f"🔄 Processing latest recording: {latest_dir.name}")
    
    # Generate output path if not provided
    if output_path is None:
        session_id = latest_dir.name.replace('_screenshots', '')
        output_path = f"output/{session_id}_task.json"
    
    # Ensure output directory exists
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    try:
        # Process the screenshots
        result = await process_screenshots_with_runner(str(latest_dir), output_path)
        
        print(f"\n✅ Successfully processed recording!")
        print(f"   Input: {latest_dir}")
        print(f"   Output: {output_path}")
        print(f"   Task: {result['task_name']}")
        print(f"   Steps: {len(result['steps'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing recording: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Main function."""
    if len(sys.argv) > 1:
        output_path = sys.argv[1]
    else:
        output_path = None
    
    print("="*60)
    print("PROCESSING RECORDING_AGENT OUTPUT")
    print("="*60)
    
    success = await process_latest_recording(output_path)
    
    if success:
        print("\n✅ Recording processed successfully!")
        print("   The JSON output is ready for browser_agent or frontend use.")
    else:
        print("\n❌ Failed to process recording.")
        print("   Check the errors above and try again.")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
