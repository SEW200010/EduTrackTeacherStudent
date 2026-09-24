import React from 'react';
import { Link } from 'react-router-dom';
import Brand from './Brand';

export default function StandardHeader({ showSignIn = true }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Brand />
        {showSignIn && (
          <div className="row">
            <Link to="/login" className="btn btn-ghost btn-sm hide-xs">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Create account</Link>
          </div>
        )}
      </div>
    </header>
  );
}
