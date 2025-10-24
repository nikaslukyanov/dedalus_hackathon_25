#!/usr/bin/env python3
"""
Process screenshots using ChatGPT 4.0 through Dedalus SDK.
Outputs structured JSON with task steps.
"""

import asyncio
import base64
import json
import sys
from pathlib import Path
from dotenv import load_dotenv
from dedalus_labs import AsyncDedalus, DedalusRunner

# Load environment variables
load_dotenv()
for parent in [Path.cwd(), Path.cwd().parent, Path.cwd().parent.parent]:
    api_env = parent / "api.env"
    if api_env.exists():
        load_dotenv(api_env)
        break


VISION_PROMPT = """Analyze these food ordering website screenshots and extract the user actions as a structured task.

Return ONLY a JSON object in this exact format:
{
  "task_id": "001",
  "task_name": "Brief description of what the user is ordering",
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

Rules:
- Describe what the user is doing in each screenshot
- Each step should be a clear action (e.g., "Navigate to menu", "Select item", "Add to cart")
- Keep step descriptions concise and actionable
- Return ONLY the JSON object, no additional text"""


def load_image_base64(image_path: str) -> str:
    """Load and encode image as base64."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


async def process_screenshots_with_runner(screenshots_dir: str, output_path: str):
    """
    Process screenshots using DedalusRunner with ChatGPT 4.0.

    Args:
        screenshots_dir: Directory containing .jpg/.png screenshot files
        output_path: Path to save JSON output
    """
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    # Collect all screenshots
    screenshots_path = Path(screenshots_dir)
    image_files = sorted(
        list(screenshots_path.glob("*.jpg")) +
        list(screenshots_path.glob("*.jpeg")) +
        list(screenshots_path.glob("*.png"))
    )

    if not image_files:
        raise ValueError(f"No image files found in {screenshots_dir}")

    print(f"Found {len(image_files)} screenshots:")
    for img in image_files[:5]:  # Show first 5
        print(f"  - {img.name}")
    if len(image_files) > 5:
        print(f"  ... and {len(image_files) - 5} more")

    # Build content with images
    # Try approach 1: Content blocks format
    print("\n🔄 Attempting to send images via DedalusRunner...")

    try:
        # Build content blocks with text + images
        content_blocks = [{"type": "text", "text": VISION_PROMPT}]

        for img_file in image_files:
            img_data = load_image_base64(str(img_file))
            file_ext = img_file.suffix.lower()
            media_type = "image/jpeg" if file_ext in [".jpg", ".jpeg"] else "image/png"

            content_blocks.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{media_type};base64,{img_data}"
                }
            })

        response = await runner.run(
            input=content_blocks,
            model="openai/gpt-4o"  # GPT-4 with vision
        )

        print("✅ Success with content blocks format!")
        response_text = response.final_output

    except Exception as e:
        print(f"❌ Content blocks failed: {e}")
        print("\n🔄 Trying alternative approach...")

        # Try approach 2: Build a prompt with image references
        try:
            # Create text prompt describing images
            prompt = VISION_PROMPT + "\n\nScreenshots to analyze:\n"
            for i, img_file in enumerate(image_files, 1):
                prompt += f"{i}. {img_file.name}\n"

            # For now, try with just text to see if runner works
            response = await runner.run(
                input=prompt,
                model="openai/gpt-4o"
            )

            print("⚠️ Running with text-only (images not sent)")
            response_text = response.final_output

        except Exception as e2:
            print(f"❌ Alternative approach failed: {e2}")
            raise ValueError("Could not process screenshots through DedalusRunner. The SDK may require a different format for images.")

    # Parse JSON response
    print(f"\n📄 Response received:")
    print(response_text[:200] + "..." if len(response_text) > 200 else response_text)

    try:
        # Try to parse as JSON directly
        output_data = json.loads(response_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        if "```json" in response_text:
            json_text = response_text.split("```json")[1].split("```")[0].strip()
            output_data = json.loads(json_text)
        elif "```" in response_text:
            json_text = response_text.split("```")[1].split("```")[0].strip()
            output_data = json.loads(json_text)
        else:
            # Couldn't parse - create default structure
            print("⚠️ Could not parse JSON, creating default structure")
            output_data = {
                "task_id": "001",
                "task_name": "Task from screenshots",
                "steps": [
                    {
                        "step_id": "001",
                        "step_name": "Actions extracted from screenshots"
                    }
                ],
                "raw_response": response_text
            }

    # Ensure proper format
    if "task_id" not in output_data:
        output_data["task_id"] = "001"
    if "task_name" not in output_data:
        output_data["task_name"] = "Task from screenshots"
    if "steps" not in output_data:
        output_data["steps"] = []

    # Save output
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"\n✅ Saved output to: {output_path}")
    print(f"   Task: {output_data['task_name']}")
    print(f"   Steps: {len(output_data['steps'])}")

    return output_data


async def main():
    if len(sys.argv) != 3:
        print("Usage: python3 process_screenshots_chatgpt.py <screenshots_dir> <output.json>")
        print("\nExample:")
        print("  python3 process_screenshots_chatgpt.py test_screenshots output.json")
        print("\nThis script:")
        print("  1. Loads .jpg/.png screenshots from the directory")
        print("  2. Sends them to ChatGPT 4.0 via Dedalus SDK")
        print("  3. Extracts structured task steps")
        print("  4. Saves to JSON file")
        sys.exit(1)

    screenshots_dir = sys.argv[1]
    output_path = sys.argv[2]

    if not Path(screenshots_dir).exists():
        print(f"Error: Directory not found: {screenshots_dir}")
        sys.exit(1)

    print("="*60)
    print("CHATGPT 4.0 VISION via DEDALUS SDK")
    print("="*60)

    try:
        await process_screenshots_with_runner(screenshots_dir, output_path)

        print("\n" + "="*60)
        print("✅ COMPLETE")
        print("="*60)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
