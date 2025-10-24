from pynput import keyboard
from pynput.keyboard import Key, KeyCode
from screen import SessionRecorder
import time

class RecorderController:
    def __init__(self):
        self.recorder = None
        self.is_recording = False

    def start_recording(self):
        if not self.is_recording:
            print("\n🔴 Recording STARTED - Press Ctrl+C to stop")
            self.recorder = SessionRecorder(buffer_seconds=5)
            self.recorder.start_recording()
            self.is_recording = True

    def stop_recording(self):
        if self.is_recording:
            print("\n⏹️  Recording STOPPED - Saving files...")
            self.recorder.stop_recording()
            self.is_recording = False
            print("✅ Files saved to 'recordings/' folder")

def main():
    controller = RecorderController()

    print("📹 Screen Recorder Test")
    print("=" * 50)
    print("Press Ctrl+A to START recording")
    print("Press Ctrl+C to STOP recording and save")
    print("=" * 50)

    # Track which keys are currently pressed
    current_keys = set()

    def on_press(key):
        current_keys.add(key)

        # Check for Ctrl+A (start recording)
        if (Key.ctrl_l in current_keys or Key.ctrl_r in current_keys or Key.ctrl in current_keys):
            if hasattr(key, 'char') and key.char == 'a':
                controller.start_recording()

    def on_release(key):
        try:
            current_keys.remove(key)
        except KeyError:
            pass

        # Check for Ctrl+C (stop recording)
        if key == KeyCode.from_char('c'):
            if (Key.ctrl_l in current_keys or Key.ctrl_r in current_keys or Key.ctrl in current_keys):
                controller.stop_recording()
                return False  # Stop listener

    # Start keyboard listener
    with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
        listener.join()

    print("\n👋 Exiting...")

if __name__ == "__main__":
    main()