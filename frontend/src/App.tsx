import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import MachineList from './components/MachineList';
import MachinePage from './components/MachinePage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AddMachineForm from './components/AddMachineForm';
import EditMachineForm from './components/EditMachineForm';

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
              <AddMachineForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/machines/:id/edit"
          element={
            <ProtectedRoute>
              <EditMachineForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
