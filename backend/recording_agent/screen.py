# echotwin/recorder/session_recorder.py
from collections import deque
from threading import Thread
import time
import pyautogui
from pynput import mouse, keyboard
import json
from datetime import datetime
import io
from PIL import Image
import os

class SessionRecorder:
    def __init__(self, buffer_seconds=5):
        self.screenshot_buffer = deque(maxlen=buffer_seconds * 20)  # 20 fps
        self.events = []
        self.running = False
        self.last_move_time = 0

    def start_recording(self):
        self.running = True

        # Background thread: screenshots every 50ms (20 fps)
        self.capture_thread = Thread(target=self._continuous_capture, daemon=True)
        self.capture_thread.start()

        # Event listeners
        self.mouse_listener = mouse.Listener(
            on_click=self._on_click,
            on_move=self._on_move
        )
        self.keyboard_listener = keyboard.Listener(
            on_press=self._on_key
        )

        self.mouse_listener.start()
        self.keyboard_listener.start()

    def stop_recording(self):
        self.running = False
        self.mouse_listener.stop()
        self.keyboard_listener.stop()

        # Save events to file
        self._save_events()

    def _continuous_capture(self):
        """Capture screenshots at 20 fps (every 50ms)"""
        while self.running:
            screenshot = self._capture_screen()
            self.screenshot_buffer.append({
                "image": screenshot,
                "timestamp": time.time()
            })
            time.sleep(0.05)  # 50ms = 20 fps

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

    def _get_screenshots_around_event(self, before_count, after_count, lookback_ms):
        """Get screenshots before and after the event"""
        event_time = time.time()
        target_time = event_time - (lookback_ms / 1000)

        # Collect screenshots that occurred before the event
        before_screenshots = []
        for shot in reversed(self.screenshot_buffer):
            if shot["timestamp"] <= target_time:
                before_screenshots.append(shot["image"])
                if len(before_screenshots) >= before_count:
                    break

        # Reverse to get chronological order (oldest to newest)
        before_screenshots = list(reversed(before_screenshots))

        # Wait for 'after' screenshots to be captured
        # At 20 fps, we need 50ms * after_count
        time.sleep((after_count * 0.05) + 0.02)  # Small buffer

        # Collect screenshots after the event
        after_screenshots = []
        for shot in reversed(self.screenshot_buffer):
            if shot["timestamp"] > event_time:
                after_screenshots.append(shot["image"])
                if len(after_screenshots) >= after_count:
                    break

        # Reverse to get chronological order
        after_screenshots = list(reversed(after_screenshots))

        # Combine before and after
        return before_screenshots + after_screenshots

    def _on_click(self, x, y, button, pressed):
        if pressed:
            screenshots = self._get_screenshots_around_event(before_count=5, after_count=3, lookback_ms=50)

            self.events.append({
                "type": "click",
                "x": x,
                "y": y,
                "button": str(button),
                "screenshots": screenshots,
                "timestamp": datetime.now().isoformat()
            })

    def _on_move(self, x, y):
        # Optional: only log significant moves (> 50px from last)
        # to avoid spam
        pass

    def _on_key(self, key):
        pass
        # try:
        #     char = key.char
        # except AttributeError:
        #     char = str(key)

        # screenshots = self._get_screenshots_around_event(before_count=2, after_count=2, lookback_ms=50)

        # self.events.append({
        #     "type": "keystroke",
        #     "key": char,
        #     "screenshots": screenshots,
        #     "timestamp": datetime.now().isoformat()
        # })

    def _save_events(self):
        """Save events (without screenshots embedded) to JSON"""
        output_dir = "recordings"
        os.makedirs(output_dir, exist_ok=True)

        session_id = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Save screenshots separately
        screenshot_dir = f"{output_dir}/{session_id}_screenshots"
        os.makedirs(screenshot_dir, exist_ok=True)

        events_light = []
        for i, event in enumerate(self.events):
            # Save screenshots to files
            if event.get("screenshots"):
                screenshot_paths = []
                for j, screenshot in enumerate(event["screenshots"]):
                    screenshot_path = f"{screenshot_dir}/event_{i}_frame_{j}.jpg"
                    with open(screenshot_path, 'wb') as f:
                        f.write(screenshot)
                    screenshot_paths.append(screenshot_path)

                # Reference in JSON instead of embedding
                event_copy = event.copy()
                event_copy["screenshot_paths"] = screenshot_paths
                del event_copy["screenshots"]
                events_light.append(event_copy)
            else:
                events_light.append(event)

        # Save JSON
        with open(f"{output_dir}/{session_id}_events.json", 'w') as f:
            json.dump(events_light, f, indent=2)

        print(f"Saved {len(events_light)} events to {output_dir}/{session_id}_events.json")