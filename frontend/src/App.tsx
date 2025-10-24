import { Toaster } from 'react-hot-toast';
import ProcessDashboard from './components/ProcessDashboard';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProcessDashboard />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;
