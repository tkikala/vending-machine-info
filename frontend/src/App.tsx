import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import MachineList from './components/MachineList';
import MachinePage from './components/MachinePage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<MachineList />} />
        <Route path="/machine/:id" element={<MachinePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/machines/new" 
          element={
            <ProtectedRoute>
              <div>Add Machine Form (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/machines/:id/edit" 
          element={
            <ProtectedRoute>
              <div>Edit Machine Form (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
