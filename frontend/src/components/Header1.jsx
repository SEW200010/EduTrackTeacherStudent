import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext1 } from "../context/AuthContext1";
import { LogOut } from "lucide-react";
import Brand from "./Brand";

export default function Header1({ title }) {
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

  const displayName = user?.name || user?.user_id || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="row">
          <Brand />
          {title && (
            <>
              <span className="brand-divider" />
              <span className="brand-context">{title}</span>
            </>
          )}
        </div>

        <div className="row" style={{ gap: 16 }}>
          {user && (
            <div className="user-chip">
              <div className="avatar">{initials}</div>
              <div className="user-meta">
                <span className="user-name">{displayName}</span>
                <span className="user-role">{user.role || "Member"}</span>
              </div>
            </div>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} aria-label="Sign out">
            <LogOut size={15} /> <span className="hide-xs">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
