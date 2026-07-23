import React from 'react';
import { useNavigate } from 'react-router-dom';
import frontImage from '../assets/hero.png';
import { Sparkles } from 'lucide-react';

export default function StandardHeader() {
  const navigate = useNavigate();

  return (
    <header style={{
      width: '100%',
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '12px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div 
        onClick={() => navigate('/')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <img src={frontImage} alt="EduTrack Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
          EduTrack <span style={{ color: '#2563EB' }}>Analytics</span>
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: '700',
        color: '#10B981',
        background: '#ECFDF5',
        padding: '5px 12px',
        borderRadius: '20px',
        border: '1px solid #A7F3D0'
      }}>
        <span style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span>
        System Online
      </div>
    </header>
  );
}