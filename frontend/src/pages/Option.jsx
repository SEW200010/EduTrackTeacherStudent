import React from "react";
import { GraduationCap, User, Presentation, ArrowRight, Sparkles } from "lucide-react";
import StandardHeader from "../components/StandardHeader";
import Footer1 from "../components/Footer1";
import { Link } from "react-router-dom";

const Option = () => {
  const options = [
    { 
      name: "Student", 
      icon: <GraduationCap size={32} color="#2563EB" />, 
      role: "student", 
      desc: "View grades, performance insights & class notices",
      badgeColor: "#2563EB",
      bgLight: "#EFF6FF",
      borderHover: "#93C5FD",
      shadowGlow: "rgba(37, 99, 235, 0.15)"
    },
    { 
      name: "Teacher", 
      icon: <Presentation size={32} color="#0D9488" />, 
      role: "teacher", 
      desc: "Manage marks, attendance & publish announcements",
      badgeColor: "#0D9488",
      bgLight: "#CCFBF1",
      borderHover: "#5EEAD4",
      shadowGlow: "rgba(13, 148, 136, 0.15)"
    },
    { 
      name: "Parent", 
      icon: <User size={32} color="#7C3AED" />, 
      role: "parent", 
      desc: "Track student academic progress & fee status",
      badgeColor: "#7C3AED",
      bgLight: "#F3E8FF",
      borderHover: "#C4B5FD",
      shadowGlow: "rgba(124, 58, 237, 0.15)"
    },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      <StandardHeader />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        padding: '60px 24px',
        textAlign: 'center'
      }}>
        
        {/* Top Feature Tag */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: '#FFFFFF', 
          padding: '6px 16px', 
          borderRadius: '30px', 
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          marginBottom: '16px'
        }}>
          <Sparkles size={16} color="#2563EB" />
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1E293B' }}>
            EduTrack Unified Access
          </span>
        </div>

        {/* Main Heading */}
        <h2 style={{ 
          color: '#0F172A', 
          fontSize: '32px', 
          fontWeight: '800', 
          margin: 0, 
          letterSpacing: '-0.8px' 
        }}>
          Select Portal Option
        </h2>
        <p style={{ 
          color: '#64748B', 
          fontSize: '15px', 
          marginTop: '8px', 
          marginBottom: '40px',
          maxWidth: '500px',
          lineHeight: '1.5'
        }}>
          Choose your dedicated user role to access tailored performance metrics and portal tools.
        </p>

        {/* Option Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          maxWidth: '960px',
          width: '100%'
        }}>
          {options.map((opt) => (
            <Link 
              key={opt.role} 
              to={`/login?role=${opt.role}`} 
              style={{ textDecoration: 'none', display: 'flex' }}
            >
              <div 
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justify: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = opt.borderHover;
                  e.currentTarget.style.boxShadow = `0 20px 35px -10px ${opt.shadowGlow}`;
                  const iconBox = e.currentTarget.querySelector('.icon-box');
                  if (iconBox) iconBox.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 23, 42, 0.03)';
                  const iconBox = e.currentTarget.querySelector('.icon-box');
                  if (iconBox) iconBox.style.transform = 'scale(1)';
                }}
              >
                <div>
                  {/* Icon Container */}
                  <div 
                    className="icon-box"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '22px',
                      backgroundColor: opt.bgLight,
                      display: 'grid',
                      placeItems:'center',
                      margin: '0 auto 20px auto',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  {React.cloneElement(opt.icon, { 
                    style: { margin: '0 auto', display: 'block' } 
                  })}
                </div>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ color: '#0F172A', fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>
                    {opt.name}
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '13.5px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                    {opt.desc}
                  </p>
                </div>

                {/* Bottom Continue Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: opt.badgeColor,
                  background: opt.bgLight,
                  padding: '8px 18px',
                  borderRadius: '30px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>

      <Footer1 />
    </div>
  );
};

export default Option;