import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import API from '../../api';
import StandardHeader from '../../components/StandardHeader';
import Footer1 from '../../components/Footer1';
import { BrandMark } from '../../components/Brand';

const ROLES = ['student', 'parent', 'teacher'];

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

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="auth-page">
      <StandardHeader showSignIn={false} />

      <div className="auth-center">
        <div className="card auth-card" style={{ maxWidth: 460 }}>
          <div className="auth-head">
            <BrandMark size={22} />
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Join EduTrack to access your dashboard.</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} /> <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              <CheckCircle size={16} /> <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field">
              <span className="label">Register as</span>
              <div className="segmented" role="tablist">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="tab"
                    aria-selected={role === r}
                    className={role === r ? 'active' : ''}
                    onClick={() => setRole(r)}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="field">
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" className="input" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="userId">{roleLabel} ID</label>
                <input id="userId" className="input" type="text" value={userId} onChange={(e) => setUserId(e.target.value.toUpperCase())} required />
              </div>

              {role === 'parent' && (
                <div className="field">
                  <label className="label" htmlFor="studentId">Child's student ID</label>
                  <input id="studentId" className="input" type="text" placeholder="e.g. S1001" value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())} required />
                </div>
              )}
            </div>

            <div className="field">
              <label className="label" htmlFor="password">Password</label>
              <input id="password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-foot">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <Footer1 />
    </div>
  );
}
