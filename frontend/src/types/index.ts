export interface Process {
  id: string;
  name: string;
  description: string;
  recording: Blob | null;
  status: 'ready' | 'processing' | 'running';
  createdAt: Date;
  lastRun: Date | null;
}

export interface AppState {
  processes: Process[];
  isRecording: boolean;
  isProcessing: boolean;
  currentRecordingTime: number;
}

export interface ProcessStore {
  processes: Process[];
  isRecording: boolean;
  isProcessing: boolean;
  currentRecordingTime: number;
  addProcess: (process: Omit<Process, 'id' | 'createdAt'>) => void;
  updateProcess: (id: string, updates: Partial<Process>) => void;
  deleteProcess: (id: string) => void;
  setRecording: (isRecording: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  setRecordingTime: (time: number) => void;
  runProcess: (id: string) => void;
  pauseProcess: (id: string) => void;
}

export type RecordingState = 'idle' | 'recording' | 'processing' | 'success';

export interface RecordingHook {
  isRecording: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  recordingState: RecordingState;
}
