import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import frontImage from '../../assets/hero.png';
import Footer1 from '../../components/Footer1';
import API from '../../api';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ 
        width: '100%', 
        height: '220px', 
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)', 
        borderBottomLeftRadius: '36px', 
        borderBottomRightRadius: '36px',
        padding: '20px 30px'
      }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)'
          }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
      </div>

      <div style={{
        marginTop: '-120px',
        width: '90%',
        maxWidth: '430px',
        margin: '-120px auto 40px auto',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '36px 30px',
        boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.12)',
        border: '1px solid #E2E8F0',
        zIndex: 10
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px auto',
            borderRadius: '20px',
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #DBEAFE'
          }}>
            <img src={frontImage} alt="Logo" style={{ width: '58px', height: '58px', objectFit: 'contain' }} />
          </div>

          <h2 style={{ color: '#0F172A', fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Reset Password
          </h2>
          <p style={{ color: '#64748B', fontSize: '13.5px', margin: 0, lineHeight: 1.5 }}>
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 14px', borderRadius: '14px', fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#DC2626" />
            <span>{errorMsg}</span>
          </div>
        )}

        {message && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 14px', borderRadius: '14px', fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="#10B981" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleResetRequest} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Registered Email Address
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '0 14px' }}>
              <Mail size={18} color="#64748B" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#0F172A' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px',
              borderRadius: '14px',
              fontWeight: '800',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            {loading ? "Sending Link..." : (
              <>
                <Send size={18} /> Send Reset Link
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #F1F5F9' }}>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Remembered your password?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: '#2563EB', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign In
            </span>
          </p>
        </div>

      </div>

      <Footer1 />
    </div>
  );
}