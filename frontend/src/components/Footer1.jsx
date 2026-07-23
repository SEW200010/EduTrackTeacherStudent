import React from 'react';

export default function Footer1() {
  return (
    <footer style={{
      width: '100%',
      padding: '16px 20px',
      background: '#FFFFFF',
      borderTop: '1px solid #E2E8F0',
      textAlign: 'center',
      fontSize: '12.5px',
      color: '#64748B',
      marginTop: 'auto'
    }}>
      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} <strong>EduTrack Student Performance Analytics</strong>. All Rights Reserved.
      </p>
    </footer>
  );
}