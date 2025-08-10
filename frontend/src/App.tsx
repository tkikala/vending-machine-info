import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MachineList from './components/MachineList';
import MachinePage from './components/MachinePage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import AdminClaims from './components/AdminClaims';
import ProtectedRoute from './components/ProtectedRoute';
import MyMachines from './components/MyMachines';
import OperatorReviews from './components/OperatorReviews';
import LeadForm from './components/LeadForm';
import AddMachineForm from './components/AddMachineForm';
import EditMachineForm from './components/EditMachineForm';
import ProductsManagement from './components/ProductsManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<MachineList />} />
          <Route path="/machine/:id" element={<MachinePage />} />
          <Route path="/machines/:id" element={<MachinePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/claims" element={
            <ProtectedRoute requireAdmin>
              <AdminClaims />
            </ProtectedRoute>
          } />
          <Route path="/admin/machines/new" element={
            <ProtectedRoute>
              <AddMachineForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/machines/:id/edit" element={
            <ProtectedRoute>
              <EditMachineForm />
            </ProtectedRoute>
          } />
          <Route path="/add-machine" element={
            <ProtectedRoute>
              <AddMachineForm />
            </ProtectedRoute>
          } />
          <Route path="/edit-machine/:id" element={
            <ProtectedRoute>
              <EditMachineForm />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductsManagement />
            </ProtectedRoute>
          } />
          <Route path="/my-machines" element={
            <ProtectedRoute>
              <MyMachines />
            </ProtectedRoute>
          } />
          <Route path="/operator/reviews" element={
            <ProtectedRoute>
              <OperatorReviews />
            </ProtectedRoute>
          } />
          <Route path="/request-machine" element={<LeadForm />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
