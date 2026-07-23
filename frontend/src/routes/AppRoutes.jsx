import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Front from '../pages/Front';
import Option from '../pages/Option';
import Login1 from '../pages/auth/Login1';
import Register1 from '../pages/auth/Register1';
import ForgotPassword1 from '../pages/auth/ForgotPassword1';

import Student from '../pages/dashboards/Student';
import Teacher from '../pages/dashboards/Teacher';

import ProtectedRoutes from './ProtectedRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Front />} />
      <Route path="/option" element={<Option />} />
      <Route path="/login" element={<Login1 />} />
      <Route path="/register" element={<Register1 />} />
      <Route path="/forgot-password" element={<ForgotPassword1 />} />
      <Route element={<ProtectedRoutes allowedRoles={['student']} />}>
        <Route path="/student" element={<Student />} />
      </Route>

      <Route element={<ProtectedRoutes allowedRoles={['teacher']} />}>
        <Route path="/teacher" element={<Teacher />} />
      </Route>
    </Routes>
  );
}