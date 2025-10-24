import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { Process } from '../types';
import { useProcesses } from '../hooks/useProcesses';

interface ProcessCardProps {
  process: Process;
  index: number;
}

const ProcessCard = ({ process, index }: ProcessCardProps) => {
  const { runProcess, formatLastRun } = useProcesses();

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    runProcess(process.id);
  };

  const getStatusColor = (status: Process['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-success';
      case 'processing':
        return 'bg-yellow-400';
      case 'running':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="card p-5 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {process.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {process.description}
          </p>
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(process.status)} ml-2`} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {formatLastRun(process.lastRun)}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRun}
          className="btn-success flex items-center space-x-1 text-sm"
        >
          <Play className="w-4 h-4" />
          <span>Run</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProcessCard;
