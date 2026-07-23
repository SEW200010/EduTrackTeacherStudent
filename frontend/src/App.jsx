import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Front from "./pages/Front";
import Option from "./pages/Option";
import Login1 from "./pages/auth/Login1";
import Register1 from "./pages/auth/Register1";
import Teacher from "./pages/dashboards/Teacher";
import Student from "./pages/dashboards/Student";
import ForgotPassword1 from './pages/auth/ForgotPassword1';  
import ResetPassword from './pages/auth/ResetPassword';
import Parent from './pages/dashboards/Parent';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element=
        {<Front />} />
        <Route path="/options" element={<Option />} />
        <Route path="/login" element={<Login1 />} />
        <Route path="/register" element={<Register1 />} />
        <Route path="/forgot-password" element={<ForgotPassword1 />} />
        <Route path="/teacher-dashboard" element={<Teacher />} />
        <Route path="/student-dashboard" element={<Student />} />
        <Route path="/forgot-password" element={<ForgotPassword1 />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/parent-dashboard" element={<Parent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;