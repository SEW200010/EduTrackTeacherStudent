import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import API from '../../api';
import StandardHeader from '../../components/StandardHeader';
import Footer1 from '../../components/Footer1';
import { BrandMark } from '../../components/Brand';

const ROLES = ['student', 'parent', 'teacher'];

export default function Login1() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = ROLES.includes(searchParams.get('role')) ? searchParams.get('role') : 'student';

  const [role, setRole] = useState(initialRole);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="auth-page">
      <StandardHeader showSignIn={false} />

      <div className="auth-center">
        <div className="card auth-card">
          <div className="auth-head">
            <BrandMark size={22} />
            <h1 className="auth-title">Sign in to EduTrack</h1>
            <p className="auth-subtitle">Welcome back. Please enter your details.</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="form-stack">
            <div className="field">
              <span className="label">I am a</span>
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
              <label className="label" htmlFor="userId">{roleLabel} ID</label>
              <input id="userId" className="input" type="text" placeholder={`Enter your ${role} ID`} value={userId} onChange={(e) => setUserId(e.target.value.toUpperCase())} required />
            </div>

            {role === 'parent' && (
              <div className="field">
                <label className="label" htmlFor="studentId">Child's student ID</label>
                <input id="studentId" className="input" type="text" placeholder="e.g. S1001" value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())} required />
              </div>
            )}

            <div className="field">
              <div className="row-between">
                <label className="label" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="text-sm">Forgot password?</Link>
              </div>
              <div className="input-group">
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-foot">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>

      <Footer1 />
    </div>
  );
}
