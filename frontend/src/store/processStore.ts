import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Process, ProcessStore } from '../types';

export const useProcessStore = create<ProcessStore>()(
  persist(
    (set, get) => ({
      processes: [],
      isRecording: false,
      isProcessing: false,
      currentRecordingTime: 0,

      addProcess: (processData) => {
        const newProcess: Process = {
          ...processData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set((state) => ({
          processes: [...state.processes, newProcess],
        }));
      },

      updateProcess: (id, updates) => {
        set((state) => ({
          processes: state.processes.map((process) =>
            process.id === id ? { ...process, ...updates } : process
          ),
        }));
      },

      deleteProcess: (id) => {
        set((state) => ({
          processes: state.processes.filter((process) => process.id !== id),
        }));
      },

      setRecording: (isRecording) => {
        set({ isRecording });
      },

      setProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      setRecordingTime: (time) => {
        set({ currentRecordingTime: time });
      },

      runProcess: (id) => {
        set((state) => ({
          processes: state.processes.map((process) =>
            process.id === id
              ? { ...process, status: 'running', lastRun: new Date() }
              : process
          ),
        }));
      },
    }),
    {
      name: 'echotwin-processes',
      partialize: (state) => ({ processes: state.processes }),
    }
  )
);
