import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Dashboard from './components/dashboard/Dashboard';
import Assignments from './components/dashboard/Assignments/Assignments';
import CreateAssignment from './components/dashboard/Assignments/CreateAssignment';
import {ProtectedRoute} from './components/ProtectedRoute';
import {PublicRoute} from './components/auth/PublicRoute';
import './App.css';
import Home from './components/Home';
import Generate from './components/dashboard/Assignments/Generate';
import { AssignmentProvider } from './context/AssignmentContext';
import { AuthProvider } from './context/AuthContext';
import AssignmentDetails from './components/dashboard/Assignments/AssignmentDetails';
import EditAssignment from './components/dashboard/Assignments/EditAssignment';

function App() {
  return (
    <AuthProvider>
      <AssignmentProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            
            {/* Auth routes - protected from authenticated users */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/assignments" element={<Assignments />} />
                <Route path="/dashboard/create-assignment" element={<CreateAssignment />} />
                <Route path="/dashboard/generate" element={<Generate />} />
                <Route path='/dashboard/assignments/:id' element={<AssignmentDetails />} />
                <Route path='/dashboard/assignments/:id/edit' element={<EditAssignment />} />
              </Route>
            </Route>

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AssignmentProvider>
    </AuthProvider>
  );
}

export default App; 
