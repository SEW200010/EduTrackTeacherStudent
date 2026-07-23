import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Front() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>

      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '80px 20px 40px 20px', 
        textAlign: 'center' 
      }}>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          padding: '6px 14px',
          borderRadius: '20px',
          color: '#2563EB',
          fontSize: '12px',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          <Sparkles size={14} color="#2563EB" />
          <span>EduTrack Performance Portal</span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(30px, 4vw, 46px)', 
          fontWeight: '800', 
          color: '#0F172A', 
          marginBottom: '12px',
          letterSpacing: '-1px',
          maxWidth: '700px',
          lineHeight: 1.2
        }}>
          Smart Academic Analytics & Student Insights
        </h1>

        <p style={{ color: '#64748B', maxWidth: '500px', fontSize: '15px', marginBottom: '28px', lineHeight: 1.5 }}>
          Track grades, identify at-risk students, and publish class notices seamlessly.
        </p>

        <button 
          onClick={() => navigate('/options')}
          style={{
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '40px',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>

        <div style={{
          width: '100%',
          maxWidth: '680px',
          background: '#F8FAFC',
          borderRadius: '24px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}>
          <img 
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80" 
            alt="Student Analytics System" 
            style={{ 
              width: '100%', 
              height: '320px', 
              objectFit: 'cover', 
              borderRadius: '16px' 
            }} 
          />

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#334155', fontWeight: '600' }}>
              <CheckCircle2 size={15} color="#10B981" /> CSV Marks Upload
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#334155', fontWeight: '600' }}>
              <CheckCircle2 size={15} color="#10B981" /> Risk Identification
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#334155', fontWeight: '600' }}>
              <CheckCircle2 size={15} color="#10B981" /> Class Notice Board
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}