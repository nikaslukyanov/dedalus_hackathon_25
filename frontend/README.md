# EchoTwin Frontend

A modern React frontend for EchoTwin Process Recording, built with TypeScript, Tailwind CSS, and Framer Motion.

## Features

- 🎯 **Process Dashboard** - Clean, minimal interface for managing processes
- 🎙️ **Screen Recording** - Capture workflows with audio and video
- 🎨 **Modern UI** - Beautiful animations and micro-interactions
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- ⌨️ **Keyboard Shortcuts** - Cmd/Ctrl+N for new process, Escape to close modals
- 🔄 **Real-time Processing** - Live feedback during recording and analysis
- 💾 **Local Storage** - Persistent process storage

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # React components
│   ├── ProcessDashboard.tsx
│   ├── NewProcessModal.tsx
│   ├── RecordButton.tsx
│   ├── ProcessingOverlay.tsx
│   ├── ProcessCard.tsx
│   └── EmptyState.tsx
├── hooks/              # Custom React hooks
│   ├── useRecording.ts
│   └── useProcesses.ts
├── store/              # Zustand store
│   └── processStore.ts
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Keyboard Shortcuts

- `Cmd/Ctrl + N` - Open new process modal
- `Escape` - Close any modal
- `Space` - Start/stop recording (when modal is open)

## Recording Features

The app uses the MediaRecorder API to capture:
- Screen recording
- Audio recording
- Real-time feedback with animations
- Automatic processing simulation

## Responsive Design

- **Mobile**: Full-screen modals, single column grid
- **Tablet**: 2-column grid, 60% width modals
- **Desktop**: 3-column grid, 40% width modals

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```
