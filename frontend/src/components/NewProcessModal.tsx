import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RecordButton from './RecordButton';
import { useProcesses } from '../hooks/useProcesses';
import { Process } from '../types';

interface NewProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProcess?: Process | null;
}

const NewProcessModal = ({ isOpen, onClose, editProcess = null }: NewProcessModalProps) => {
  const [processName, setProcessName] = useState('');
  const [description, setDescription] = useState('');
  const [recording, setRecording] = useState<Blob | null>(null);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const { createProcess, updateProcess } = useProcesses();

  // Load process data when editing
  useEffect(() => {
    if (editProcess) {
      setProcessName(editProcess.name);
      setDescription(editProcess.description);
      setRecording(editProcess.recording);
      setIsRecordingComplete(!!editProcess.recording);
    } else {
      // Reset form when creating new process
      setProcessName('');
      setDescription('');
      setRecording(null);
      setIsRecordingComplete(false);
    }
  }, [editProcess, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === ' ' && isOpen) {
        e.preventDefault();
        // Handle space key for recording
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleRecordingComplete = (blob: Blob) => {
    setRecording(blob);
    setIsRecordingComplete(true);
    toast.success('Recording completed successfully!');
  };

  const handleSubmit = async () => {
    if (!processName.trim()) {
      toast.error('Please enter a process name');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!recording) {
      toast.error('Please record the process first');
      return;
    }

    if (editProcess) {
      // Update existing process
      updateProcess(editProcess.id, {
        name: processName,
        description: description,
        recording: recording,
      });
      toast.success('Process updated successfully!');
    } else {
      // Create new process with processing status
      const newProcessId = createProcess(processName, description, recording);

      toast.success('Processing your recording...');

      // After 5 seconds, update status to ready
      setTimeout(() => {
        updateProcess(newProcessId, { status: 'ready' });
        toast.success('Process is ready to run!');
      }, 5000);
    }

    // Reset form
    setProcessName('');
    setDescription('');
    setRecording(null);
    setIsRecordingComplete(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white h-full w-full md:w-2/5 lg:w-2/5 xl:w-2/5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-white">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {editProcess ? 'Edit Process' : 'Create New Process'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-neutral-50">
                {/* Process Name */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Process Name
                  </label>
                  <input
                    type="text"
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                    placeholder="e.g., Weekly Client Report"
                    maxLength={50}
                    className="input-field"
                  />
                  <div className="flex justify-end mt-1.5">
                    <span className="text-xs text-neutral-500 font-medium">
                      {processName.length}/50
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Process Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this process does..."
                    maxLength={200}
                    rows={4}
                    className="textarea-field"
                  />
                  <div className="flex justify-end mt-1.5">
                    <span className="text-xs text-neutral-500 font-medium">
                      {description.length}/200
                    </span>
                  </div>
                </div>

                {/* Recording Section */}
                <div className="text-center pt-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                    Record Your Process
                  </h3>
                  <RecordButton onRecordingComplete={handleRecordingComplete} />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 bg-white">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-neutral-700 font-medium hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isRecordingComplete}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editProcess ? 'Save Changes' : 'Create Process'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewProcessModal;
