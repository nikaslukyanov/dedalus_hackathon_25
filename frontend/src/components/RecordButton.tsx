import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Check, Loader2 } from 'lucide-react';
import { useRecording } from '../hooks/useRecording';

interface RecordButtonProps {
  onRecordingComplete: (blob: Blob) => void;
}

const RecordButton = ({ onRecordingComplete }: RecordButtonProps) => {
  const { recordingTime, startRecording, stopRecording, recordingState } = useRecording(onRecordingComplete);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = async () => {
    if (recordingState === 'idle') {
      await startRecording();
    } else if (recordingState === 'recording') {
      stopRecording();
    }
  };

  const getButtonContent = () => {
    switch (recordingState) {
      case 'idle':
        return <Mic className="w-8 h-8" />;
      case 'recording':
        return <Square className="w-6 h-6" />;
      case 'processing':
        return <Loader2 className="w-8 h-8 animate-spin" />;
      case 'success':
        return <Check className="w-8 h-8" />;
      default:
        return <Mic className="w-8 h-8" />;
    }
  };

  const getButtonClass = () => {
    switch (recordingState) {
      case 'idle':
        return 'bg-danger hover:bg-danger-dark shadow-medium hover:shadow-hover';
      case 'recording':
        return 'bg-danger animate-pulse-glow';
      case 'processing':
        return 'bg-neutral-400 cursor-not-allowed';
      case 'success':
        return 'bg-success shadow-medium';
      default:
        return 'bg-danger';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Time display */}
      <AnimatePresence>
        {recordingState === 'recording' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-mono font-bold text-danger"
          >
            {formatTime(recordingTime)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound wave animation */}
      <AnimatePresence>
        {recordingState === 'recording' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-1"
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-danger rounded-full"
                style={{ height: '20px' }}
                animate={{
                  scaleY: [1, 1.5, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Record button */}
      <motion.button
        whileHover={{ scale: recordingState !== 'processing' ? 1.05 : 1 }}
        whileTap={{ scale: recordingState !== 'processing' ? 0.95 : 1 }}
        onClick={handleClick}
        disabled={recordingState === 'processing'}
        className={`
          w-20 h-20 rounded-full text-white flex items-center justify-center
          transition-all duration-200
          ${getButtonClass()}
          ${recordingState === 'processing' ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {getButtonContent()}
      </motion.button>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={recordingState}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center"
        >
          {recordingState === 'idle' && (
            <p className="text-sm text-neutral-600 font-medium">Click to start recording</p>
          )}
          {recordingState === 'recording' && (
            <p className="text-sm text-danger font-semibold">Recording... Click to stop</p>
          )}
          {recordingState === 'processing' && (
            <p className="text-sm text-neutral-600 font-medium">Processing recording...</p>
          )}
          {recordingState === 'success' && (
            <p className="text-sm text-success font-semibold">Recording uploaded successfully</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RecordButton;
