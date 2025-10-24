#!/usr/bin/env python3
"""
Test script to verify dedalus_agent integration with recording_agent output.
This script tests the complete flow from recording_agent screenshots to JSON output.
"""

import asyncio
import json
import sys
from pathlib import Path
from main import process_screenshots_with_runner


async def test_integration():
    """Test the complete integration flow."""
    print("="*60)
    print("TESTING DEDALUS_AGENT INTEGRATION")
    print("="*60)
    
    # Test 1: Check if we can find recording_agent output
    recording_agent_path = Path("../recording_agent/recordings")
    if recording_agent_path.exists():
        print(f"✅ Found recording_agent output directory: {recording_agent_path}")
        
        # Look for screenshot directories
        screenshot_dirs = [d for d in recording_agent_path.iterdir() 
                          if d.is_dir() and d.name.endswith('_screenshots')]
        
        if screenshot_dirs:
            print(f"✅ Found {len(screenshot_dirs)} screenshot directories:")
            for dir in screenshot_dirs:
                jpg_files = list(dir.glob("*.jpg"))
                print(f"   - {dir.name}: {len(jpg_files)} screenshots")
            
            # Test with the most recent directory
            latest_dir = max(screenshot_dirs, key=lambda x: x.stat().st_mtime)
            print(f"\n🔄 Testing with latest directory: {latest_dir}")
            
            # Process the screenshots
            output_path = "test_output.json"
            try:
                result = await process_screenshots_with_runner(str(latest_dir), output_path)
                
                # Verify output format matches sample.json
                print(f"\n📋 Verifying output format...")
                with open(output_path, 'r') as f:
                    output_data = json.load(f)
                
                # Check required fields
                required_fields = ["task_id", "task_name", "steps"]
                missing_fields = [field for field in required_fields if field not in output_data]
                
                if missing_fields:
                    print(f"❌ Missing required fields: {missing_fields}")
                    return False
                
                # Check steps format
                steps = output_data.get("steps", [])
                if not isinstance(steps, list):
                    print(f"❌ Steps should be a list, got: {type(steps)}")
                    return False
                
                for i, step in enumerate(steps):
                    if not isinstance(step, dict):
                        print(f"❌ Step {i} should be a dict, got: {type(step)}")
                        return False
                    
                    if "step_id" not in step or "step_name" not in step:
                        print(f"❌ Step {i} missing step_id or step_name")
                        return False
                
                print(f"✅ Output format verification passed!")
                print(f"   Task: {output_data['task_name']}")
                print(f"   Steps: {len(output_data['steps'])}")
                
                # Compare with sample.json format
                sample_path = Path("../browser_agent/sample.json")
                if sample_path.exists():
                    with open(sample_path, 'r') as f:
                        sample_data = json.load(f)
                    
                    print(f"\n📊 Comparing with sample.json:")
                    print(f"   Sample task_id: {sample_data.get('task_id')}")
                    print(f"   Output task_id: {output_data.get('task_id')}")
                    print(f"   Sample steps count: {len(sample_data.get('steps', []))}")
                    print(f"   Output steps count: {len(output_data.get('steps', []))}")
                    
                    # Check if structure matches
                    if (output_data.get('task_id') and 
                        output_data.get('task_name') and 
                        isinstance(output_data.get('steps'), list)):
                        print(f"✅ Structure matches sample.json format!")
                    else:
                        print(f"❌ Structure doesn't match sample.json format")
                        return False
                
                return True
                
            except Exception as e:
                print(f"❌ Error processing screenshots: {e}")
                import traceback
                traceback.print_exc()
                return False
        else:
            print(f"❌ No screenshot directories found in {recording_agent_path}")
            return False
    else:
        print(f"❌ Recording agent output directory not found: {recording_agent_path}")
        print(f"   Please run recording_agent first to generate screenshots")
        return False


async def main():
    """Main test function."""
    success = await test_integration()
    
    print("\n" + "="*60)
    if success:
        print("✅ INTEGRATION TEST PASSED")
        print("   dedalus_agent correctly processes recording_agent output")
        print("   JSON output format matches browser_agent/sample.json")
    else:
        print("❌ INTEGRATION TEST FAILED")
        print("   Check the errors above and fix the issues")
    print("="*60)
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
