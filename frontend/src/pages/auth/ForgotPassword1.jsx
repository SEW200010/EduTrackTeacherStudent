import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StandardHeader from '../../components/StandardHeader';
import Footer1 from '../../components/Footer1';
import { BrandMark } from '../../components/Brand';
import API from '../../api';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!email) return setErrorMsg("Please enter your registered email address!");

    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const res = await API.post("/forgot-password", { email });
      setMessage(res.data.message || "Password reset instructions sent to your email!");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send reset link. Please try again.");
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
            <h1 className="auth-title">Forgot your password?</h1>
            <p className="auth-subtitle">Enter your registered email and we'll send you a link to reset it.</p>
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

          <form onSubmit={handleResetRequest} className="form-stack">
            <div className="field">
              <label className="label" htmlFor="email">Email address</label>
              <div className="input-group">
                <Mail size={16} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
              {loading ? "Sending link…" : "Send reset link"}
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
