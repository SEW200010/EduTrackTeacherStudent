import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';

export default function Register1() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      name,
      email,
      user_id: userId,
      password,
      role
    };

    if (role === 'parent') {
      payload.student_id = studentId;
    }

    try {
      const res = await API.post('/register', payload);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', padding: '20px' }}>
      <div style={{ background: '#FFF', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', color: '#0F172A', fontWeight: '800', marginBottom: '6px' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>Join the EduTrack System</p>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}
        {success && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Register As</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '445px', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none' }}>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>{role.toUpperCase()} ID</label>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value.toUpperCase())} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none' }} required />
          </div>

          {role === 'parent' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E3A8A', marginBottom: '6px' }}>Child's Student ID *</label>
              <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #2563EB', outline: 'none', background: '#EFF6FF' }} required />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none' }} required />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Email Address</label>
            <input type="email"  value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none' }} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', outline: 'none' }} required />
          </div>

          <button type="submit" disabled={loading} style={{ width: '445px', padding: '14px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748B' }}>
          Already registered? <Link to="/login" style={{ color: '#2563EB', fontWeight: '700' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}