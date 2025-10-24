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
        return newProcess.id;
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

      runProcess: async (id) => {
        const process = get().processes.find(p => p.id === id);
        if (!process) return;

        // Update UI to show running status
        set((state) => ({
          processes: state.processes.map((p) =>
            p.id === id
              ? { ...p, status: 'running', lastRun: new Date() }
              : p
          ),
        }));

        try {
          // Call backend API to execute the browser automation
          const response = await fetch('http://localhost:8000/api/run-process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              process_id: process.id,
              process_name: process.name,
              task_json_path: '/Users/alissawu/dedalus_hackathon_25/backend/browser_agent/sample.json',
              website_url: 'https://wuandnussbaumnyc.com/',
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Process completed:', result);

          // Update to ready status after completion
          set((state) => ({
            processes: state.processes.map((p) =>
              p.id === id ? { ...p, status: 'ready' } : p
            ),
          }));
        } catch (error) {
          console.error('Error running process:', error);
          // Reset to ready on error
          set((state) => ({
            processes: state.processes.map((p) =>
              p.id === id ? { ...p, status: 'ready' } : p
            ),
          }));
          throw error;
        }
      },

      pauseProcess: (id) => {
        set((state) => ({
          processes: state.processes.map((process) =>
            process.id === id
              ? { ...process, status: 'ready' }
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
