import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext1 } from "../context/AuthContext1";
import { LogOut, User, Sparkles, ShieldCheck } from "lucide-react";

export default function Header1({ title, subtitle }) {
  const authContext = useContext(AuthContext1);
  const user = authContext?.user || JSON.parse(localStorage.getItem("user") || "null");
  const logout = authContext?.logout;

  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate("/options");
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      background: 'rgba(15, 23, 42, 0.92)', // Dark Slate Theme
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#FFFFFF',
      padding: '14px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          padding: '10px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
        }}>
          <Sparkles size={20} color="#FFFFFF" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
            {title || "EduTrack Analytics"}
          </h1>
          <p style={{ fontSize: '12px', margin: '2px 0 0 0', color: '#94A3B8', fontWeight: '500' }}>
            {subtitle || "Student Performance System"}
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '6px 14px 6px 8px',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              color: '#FFFFFF'
            }}>
              <User size={16} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#F1F5F9', lineHeight: 1.2 }}>
                {user.name || user.user_id || "User"}
              </span>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {user.role || "Member"}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#FCA5A5',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#EF4444';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
            e.currentTarget.style.color = '#FCA5A5';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <LogOut size={16} /> Logout
        </button>

      </div>
    </header>
  );
}