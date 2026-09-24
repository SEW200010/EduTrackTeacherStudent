import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import StandardHeader from '../components/StandardHeader';
import Footer1 from '../components/Footer1';
import heroImage from '../assets/hero-dashboard.svg';

export default function Front() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <StandardHeader />

      <main className="hero hero-full">
        <h1 className="hero-title">Student performance, <span className="text-gradient">made simple</span></h1>
        <p className="hero-text">Grades, risk alerts and notices in one place.</p>
        <div className="row hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/options')}>
            Get started <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
        <img
          src={heroImage}
          alt="EduTrack dashboard showing class statistics, subject marks chart and grade distribution"
          className="hero-image"
        />
      </main>

      <Footer1 />
    </div>
  );
}
