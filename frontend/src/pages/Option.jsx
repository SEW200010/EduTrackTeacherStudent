import React from "react";
import { GraduationCap, Presentation, Users, ArrowRight } from "lucide-react";
import StandardHeader from "../components/StandardHeader";
import Footer1 from "../components/Footer1";
import { Link } from "react-router-dom";

const options = [
  {
    name: "Student",
    icon: <GraduationCap size={20} />,
    role: "student",
    color: "primary",
    desc: "View your grades, performance insights and class notices.",
  },
  {
    name: "Teacher",
    icon: <Presentation size={20} />,
    role: "teacher",
    color: "teal",
    desc: "Manage marks and attendance, and publish announcements.",
  },
  {
    name: "Parent",
    icon: <Users size={20} />,
    role: "parent",
    color: "violet",
    desc: "Follow your child's academic progress and fee status.",
  },
];

const Option = () => {
  return (
    <div className="app-shell">
      <StandardHeader />

      <main className="app-main option-main">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="page-title" style={{ fontSize: 28 }}>Choose your portal</h1>
          <p className="page-subtitle">Select your role to sign in to the right dashboard.</p>
        </div>

        <div className="grid-3" style={{ gap: 20 }}>
          {options.map((opt) => (
            <Link key={opt.role} to={`/login?role=${opt.role}`} className={`card role-card accent accent-${opt.color}`}>
              <div className={`stat-icon ${opt.color}`}>{opt.icon}</div>
              <h3>{opt.name}</h3>
              <p>{opt.desc}</p>
              <span className="role-cta">
                Continue as {opt.name.toLowerCase()} <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <Footer1 />
    </div>
  );
};

export default Option;
