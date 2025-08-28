import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import MachineList from './components/MachineList';
import MachinePage from './components/MachinePage';
import LoginPage from './components/LoginPage';
import EmailVerification from './components/EmailVerification';
import AdminDashboard from './components/AdminDashboard';
import AdminSubscriptions from './components/AdminSubscriptions';
import AdminClaims from './components/AdminClaims';
import ProtectedRoute from './components/ProtectedRoute';
import MyMachines from './components/MyMachines';
import OperatorReviews from './components/OperatorReviews';
import LeadForm from './components/LeadForm';
import BillingSuccess from './components/BillingSuccess';
import AddMachineForm from './components/AddMachineForm';
import EditMachineForm from './components/EditMachineForm';
import ProductsManagement from './components/ProductsManagement';
import VendingGame from './components/VendingGame';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/machines" element={<MachineList />} />
          <Route path="/machine/:id" element={<MachinePage />} />
          <Route path="/machines/:id" element={<MachinePage />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/subscriptions" element={
            <ProtectedRoute requireAdmin>
              <AdminSubscriptions />
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
          <Route path="/billing/success" element={<BillingSuccess />} />
          <Route path="/billing/cancel" element={<BillingSuccess canceled />} />
          <Route path="/game" element={<VendingGame />} />
        </Routes>
        <Analytics />
      </div>
    </AuthProvider>
  );
}

export default App;
