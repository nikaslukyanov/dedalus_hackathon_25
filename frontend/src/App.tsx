import { Toaster } from 'react-hot-toast';
import ProcessDashboard from './components/ProcessDashboard';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <ProcessDashboard />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#171717',
            color: '#FAFAFA',
            borderRadius: '0.75rem',
            padding: '12px 16px',
            fontSize: '0.875rem',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#FAFAFA',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#FAFAFA',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
