import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function BrandMark({ size = 18 }) {
  return (
    <span className="brand-mark">
      <GraduationCap size={size} />
    </span>
  );
}

export default function Brand({ to = "/" }) {
  return (
    <Link to={to} className="brand">
      <BrandMark />
      <span>EduTrack</span>
    </Link>
  );
}
