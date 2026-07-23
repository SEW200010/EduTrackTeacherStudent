import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';

export default function Login1() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      user_id: userId,
      password: password
    };

    if (role === 'parent') {
      payload.student_id = studentId;
    }

    try {
      const res = await API.post('/login', payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const userRole = res.data.user.role;
      if (userRole === 'parent') {
        navigate('/parent-dashboard');
      } else if (userRole === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Login Credentials!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', padding: '20px' }}>
      <div style={{ background: '#FFF', padding: '32px', borderRadius: '20px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', color: '#0F172A', fontWeight: '800', marginBottom: '6px' }}>Sign In</h2>
        <p style={{ textAlign: 'center', color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>EduTrack Management System</p>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>I am a</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '395px',
           padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none' }}>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>{role.toUpperCase()} ID</label>
            <input type="text" placeholder="Enter ID" value={userId} onChange={(e) => setUserId(e.target.value.toUpperCase())} style={{ width: '370px', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none' }} required />
          </div>

          {role === 'parent' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E3A8A', marginBottom: '6px' }}>Child's Student ID *</label>
              <input type="text" placeholder="e.g. S1001" value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())} style={{ width: '370px', padding: '12px', borderRadius: '10px', border: '2px solid #2563EB', outline: 'none', background: '#EFF6FF' }} required />
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '370px', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none' }} required />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/forgot-password" style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600' }}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} style={{ width: '400px', padding: '14px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748B' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2563EB', fontWeight: '700' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}