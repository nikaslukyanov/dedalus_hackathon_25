import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProcessCard from './ProcessCard';
import NewProcessModal from './NewProcessModal';
import ProcessingOverlay from './ProcessingOverlay';
import EmptyState from './EmptyState';
import { useProcesses } from '../hooks/useProcesses';

const ProcessDashboard = () => {
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { processes } = useProcesses();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N to open new process modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsNewProcessModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewProcess = () => {
    setIsNewProcessModalOpen(true);
  };


  const handleProcessingComplete = () => {
    setIsProcessing(false);
    toast.success('Process analysis complete!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EchoTwin</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewProcess}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Process</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {processes.length === 0 ? (
          <EmptyState onNewProcess={handleNewProcess} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {processes.map((process, index) => (
              <ProcessCard key={process.id} process={process} index={index} />
            ))}
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <NewProcessModal
        isOpen={isNewProcessModalOpen}
        onClose={() => setIsNewProcessModalOpen(false)}
      />

      <ProcessingOverlay
        isVisible={isProcessing}
        onComplete={handleProcessingComplete}
      />
    </div>
  );
};

export default ProcessDashboard;
