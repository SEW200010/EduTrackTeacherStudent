import React from 'react';

export default function Footer1() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>© {new Date().getFullYear()} EduTrack. All rights reserved.</span>
      </div>
    </footer>
  );
}
