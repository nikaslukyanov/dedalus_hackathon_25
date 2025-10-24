"""Simple screenshot recorder - captures every 100ms"""
from threading import Thread
import time
import pyautogui
from datetime import datetime
from pynput import mouse
import io
from PIL import Image
import os


class SessionRecorder:
    def __init__(self):
        self.screenshots = []
        self.events = []
        self.running = False
        self.start_time = None
        self.pending_event_count = 0  # Count screenshots after click

    def start_recording(self):
        """Start capturing screenshots every 100ms"""
        self.running = True
        self.start_time = time.time()

        # Background thread: screenshots every 100ms
        self.capture_thread = Thread(target=self._continuous_capture, daemon=True)
        self.capture_thread.start()

        # Mouse click listener
        self.mouse_listener = mouse.Listener(on_click=self._on_click)
        self.mouse_listener.start()

    def stop_recording(self):
        """Stop recording and save all screenshots"""
        self.running = False
        self.mouse_listener.stop()
        time.sleep(0.2)  # Wait for last screenshot
        self._save_screenshots()

    def _continuous_capture(self):
        """Capture screenshots at 10 fps (every 100ms)"""
        while self.running:
            screenshot = self._capture_screen()
            timestamp = time.time() - self.start_time

            # Check if we have a pending event
            has_event = self.pending_event
            if has_event:
                self.pending_event = False  # Clear flag after marking

            self.screenshots.append({
                "image": screenshot,
                "timestamp": timestamp,
                "has_event": has_event
            })

            time.sleep(0.1)  # 100ms = 10 fps

    def _capture_screen(self):
        """Capture and compress screenshot"""
        screenshot = pyautogui.screenshot()

        # Convert RGBA to RGB (JPEG doesn't support transparency)
        if screenshot.mode == 'RGBA':
            screenshot = screenshot.convert('RGB')

        # Compress to JPEG 70% quality
        buffer = io.BytesIO()
        screenshot.save(buffer, format='JPEG', quality=70)
        return buffer.getvalue()

    def _on_click(self, x, y, button, pressed):
        """Log mouse clicks with timestamp"""
        if pressed:
            timestamp = time.time() - self.start_time
            self.events.append({
                "type": "click",
                "x": x,
                "y": y,
                "button": str(button),
                "timestamp": timestamp
            })
            # Set flag so next screenshot gets marked
            self.pending_event = True

    def _save_screenshots(self):
        """Save all screenshots to files"""
        output_dir = "recordings"
        os.makedirs(output_dir, exist_ok=True)

        session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        screenshot_dir = f"{output_dir}/{session_id}_screenshots"
        os.makedirs(screenshot_dir, exist_ok=True)

        print(f"Saving {len(self.screenshots)} screenshots...")

        for i, shot in enumerate(self.screenshots):
            # Add _event suffix if this screenshot has an event
            if shot.get("has_event"):
                screenshot_path = f"{screenshot_dir}/screenshot_{i:04d}_event.jpg"
            else:
                screenshot_path = f"{screenshot_dir}/screenshot_{i:04d}.jpg"

            with open(screenshot_path, 'wb') as f:
                f.write(shot["image"])

        # Save events (clicks)
        import json
        events_path = f"{output_dir}/{session_id}_events.json"
        with open(events_path, 'w') as f:
            json.dump(self.events, f, indent=2)

        # Save metadata
        metadata = {
            "total_screenshots": len(self.screenshots),
            "total_events": len(self.events),
            "duration_seconds": self.screenshots[-1]["timestamp"] if self.screenshots else 0,
            "fps": 10,
            "session_id": session_id
        }

        metadata_path = f"{output_dir}/{session_id}_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        print(f"✅ Saved {len(self.screenshots)} screenshots to {screenshot_dir}/")
        print(f"✅ Saved {len(self.events)} events to {events_path}")
        print(f"   Duration: {metadata['duration_seconds']:.1f} seconds")