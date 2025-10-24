import { useProcessStore } from '../store/processStore';
import { Process } from '../types';

export const useProcesses = () => {
  const {
    processes,
    addProcess,
    updateProcess,
    deleteProcess,
    runProcess,
    pauseProcess,
  } = useProcessStore();

  const createProcess = (name: string, description: string, recording: Blob | null) => {
    addProcess({
      name,
      description,
      recording,
      status: 'ready',
      lastRun: null,
    });
  };

  const updateProcessStatus = (id: string, status: Process['status']) => {
    updateProcess(id, { status });
  };

  const formatLastRun = (date: Date | null) => {
    if (!date) return 'Never run';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return {
    processes,
    createProcess,
    updateProcess,
    updateProcessStatus,
    deleteProcess,
    runProcess,
    pauseProcess,
    formatLastRun,
  };
};
