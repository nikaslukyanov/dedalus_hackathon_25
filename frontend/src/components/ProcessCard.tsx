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
        return 'bg-warning';
      case 'running':
        return 'bg-primary';
      default:
        return 'bg-neutral-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="card p-6 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-neutral-900 mb-1.5 truncate">
            {process.name}
          </h3>
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
            {process.description}
          </p>
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(process.status)} ml-3 mt-1.5 flex-shrink-0 shadow-sm`} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-center text-sm text-neutral-500">
          <Clock className="w-4 h-4 mr-1.5" />
          <span className="font-medium">{formatLastRun(process.lastRun)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEdit}
            className="p-2 text-neutral-600 hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-150"
            title="Edit process"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="p-2 text-neutral-600 hover:text-danger hover:bg-red-50 rounded-lg transition-all duration-150"
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
