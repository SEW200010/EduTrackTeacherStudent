import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import StandardHeader from '../../components/StandardHeader';
import Footer1 from '../../components/Footer1';
import { BrandMark } from '../../components/Brand';
import API from '../../api';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return setErrorMsg("Please fill in both password fields!");
    }
    if (newPassword !== confirmPassword) {
      return setErrorMsg("Passwords do not match!");
    }
    if (newPassword.length < 6) {
      return setErrorMsg("Password must be at least 6 characters long!");
    }

    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const res = await API.post("/reset-password", {
        token,
        new_password: newPassword
      });

      setMessage(res.data.message || "Password updated successfully!");

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Password reset failed. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <StandardHeader showSignIn={false} />

      <div className="auth-center">
        <div className="card auth-card">
          <div className="auth-head">
            <BrandMark size={22} />
            <h1 className="auth-title">Set a new password</h1>
            <p className="auth-subtitle">Your new password must be at least 6 characters long.</p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {message && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              <CheckCircle size={16} /> <span>{message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordReset} className="form-stack">
            <div className="field">
              <label className="label" htmlFor="newPassword">New password</label>
              <div className="input-group">
                <Lock size={16} />
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="confirmPassword">Confirm new password</label>
              <div className="input-group">
                <Lock size={16} />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }}>
              {loading ? "Updating password…" : "Update password"}
            </button>
          </form>

          <p className="auth-foot">
            <Link to="/login" className="row" style={{ justifyContent: 'center', gap: 6 }}>
              <ArrowLeft size={16} /> Back to sign in
            </Link>
          </p>
        </div>
      </div>

      <Footer1 />
    </div>
  );
}
