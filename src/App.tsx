import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./components/dashboard/Dashboard";
import Assignments from "./components/dashboard/Assignment/Assignments";
import CreateAssignment from "./components/dashboard/Assignment/CreateAssignment";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import "./App.css";
import Home from "./components/Home";
import Generate from "./components/dashboard/Assignment/Generate";
import { AuthProvider } from "./context/AuthContext";
import AssignmentDetails from "./components/dashboard/Assignment/AssignmentDetails";
import EditAssignment from "./components/dashboard/Assignment/EditAssignment";
import ClassRoom from "./components/dashboard/Classroom/ClassRoom";
import CoursesPage from "./components/dashboard/Courses/Courses";
import CourseDetails from "./components/dashboard/Courses/CourseDetails";
import CreateCoursePage from "./components/dashboard/Courses/CoursesCreate";

import EditSyllabus from "./components/dashboard/Courses/EditSyllabus";

function App() {
  return (
    <AuthProvider>
      {/* <AssignmentProvider> */}
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
              <Route
                path="/dashboard/create-assignment"
                element={<CreateAssignment />}
              />
              <Route path="/dashboard/generate" element={<Generate />} />
              <Route
                path="/dashboard/assignments/:id"
                element={<AssignmentDetails />}
              />
              <Route
                path="/dashboard/assignments/:id/edit"
                element={<EditAssignment />}
              />
              <Route path="/dashboard/classroompage" element={<ClassRoom />} />
              <Route path="/dashboard/courses" element={<CoursesPage />} />
              <Route
                path="/dashboard/courses/:id"
                element={<CourseDetails />}
              />
              <Route
                path="/dashboard/courses/create"
                element={<CreateCoursePage />}
              />
              <Route
                path="/dashboard/edit-syllabus"
                element={<EditSyllabus />}
              />
            </Route>
          </Route>

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      {/* </AssignmentProvider> */}
    </AuthProvider>
  );
}

export default App;
