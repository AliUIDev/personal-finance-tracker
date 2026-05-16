import { useState, useRef, useEffect } from "react";
import { Menu, UserRound } from "lucide-react";
import ProfileMenu from "./ProfileMenu/ProfileMenu";
import { getCurrentUser } from "../../../services/storage";
import "./Header.css";

function Header({ onMenuClick }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userName =
    user?.name || user?.displayName || user?.email?.split("@")[0] || "Guest";

  const profileImage =
    user?.profileImage ||
    user?.avatarUrl ||
    user?.photoURL ||
    user?.picture ||
    null;

  return (
    <header className="header">
      <div className="left">
        <button
          type="button"
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="header-icon" strokeWidth={2.35} />
        </button>
      </div>

      <div className="header-center">
        <span className="header-label">BudgetBee</span>

        <h1 className="header-title">Welcome back, {userName}</h1>

        <p className="header-subtitle">
          Track your budget, spending, and monthly progress in one place
        </p>
      </div>

      <div ref={profileMenuRef} className="profile-menu-wrapper">
        <button
          type="button"
          className={`profile-menu-button ${profileMenuOpen ? "active" : ""}`}
          onClick={() => setProfileMenuOpen((prev) => !prev)}
          aria-label="Open account menu"
          aria-expanded={profileMenuOpen}
        >
          {profileImage ? (
            <img src={profileImage} alt={userName} className="header-profile-img" />
          ) : (
            <UserRound className="header-profile-icon" strokeWidth={2.15} />
          )}
        </button>

        {profileMenuOpen && (
          <ProfileMenu onClose={() => setProfileMenuOpen(false)} />
        )}
      </div>
    </header>
  );
}

export default Header;