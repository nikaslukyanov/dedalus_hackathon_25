import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Zap } from 'lucide-react';

interface ProcessingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const ProcessingOverlay = ({ isVisible, onComplete }: ProcessingOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);

  const steps: ProcessingStep[] = [
    {
      id: 'analyze',
      title: 'Analyzing patterns',
      description: 'Identifying key workflow patterns and user interactions',
      completed: false,
    },
    {
      id: 'create',
      title: 'Creating digital twin',
      description: 'Building your personalized process model',
      completed: false,
    },
    {
      id: 'optimize',
      title: 'Optimizing workflow',
      description: 'Finding opportunities for improvement',
      completed: false,
    },
  ];

  useEffect(() => {
    if (!isVisible) return;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 5000);

    const timeInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timeInterval);
    };
  }, [isVisible, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mb-4"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Processing your workflow...
              </h2>
              <p className="text-gray-600">
                This usually takes about 15 seconds
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-primary bg-opacity-10 border border-primary border-opacity-20'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {index < currentStep ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-success rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : index === currentStep ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Loader2 className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Time Remaining */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600">Estimated time remaining</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingOverlay;
