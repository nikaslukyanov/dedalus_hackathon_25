import { motion } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';

interface EmptyStateProps {
  onNewProcess: () => void;
}

const EmptyState = ({ onNewProcess }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center"
      >
        <Zap className="w-12 h-12 text-white" />
      </motion.div>
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Create your first process
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Start by recording a workflow to create your first digital twin. 
        EchoTwin will learn and optimize your processes automatically.
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNewProcess}
        className="btn-primary flex items-center space-x-2 mx-auto"
      >
        <Plus className="w-5 h-5" />
        <span>Create New Process</span>
      </motion.button>
    </motion.div>
  );
};

export default EmptyState;
