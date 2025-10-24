import { motion } from 'framer-motion';
import { Play, Clock, Trash2, Edit2, Pause } from 'lucide-react';
import { Process } from '../types';
import { useProcesses } from '../hooks/useProcesses';
import { toast } from 'react-hot-toast';

interface ProcessCardProps {
  process: Process;
  index: number;
  onEdit: (process: Process) => void;
}

const ProcessCard = ({ process, index, onEdit }: ProcessCardProps) => {
  const { runProcess, pauseProcess, formatLastRun, deleteProcess } = useProcesses();

  const handleRunPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (process.status === 'running') {
      pauseProcess(process.id);
    } else {
      runProcess(process.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${process.name}"?`)) {
      deleteProcess(process.id);
      toast.success('Process deleted successfully');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(process);
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

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEdit}
            className="p-2 text-gray-600 hover:text-primary hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Edit process"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-danger hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete process"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunPause}
            className={`flex items-center space-x-1 text-sm ${
              process.status === 'running'
                ? 'btn-danger'
                : 'btn-success'
            }`}
          >
            {process.status === 'running' ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessCard;
