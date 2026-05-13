import { useState, useRef, useEffect } from "react";
import { Menu, UserRound } from "lucide-react";
import SettingsMenu from "./SettingsMenu/SettingsMenu";
import { getCurrentUser } from "../../../services/storage";
import "./Header.css";

function Header({ onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
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

      <div ref={menuRef} className="settings-wrapper">
        <button
          type="button"
          className={`settings-button ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Open account menu"
          aria-expanded={menuOpen}
        >
          {profileImage ? (
            <img src={profileImage} alt={userName} className="header-profile-img" />
          ) : (
            <UserRound className="header-profile-icon" strokeWidth={2.15} />
          )}
        </button>

        {menuOpen && <SettingsMenu onClose={() => setMenuOpen(false)} />}
      </div>
    </header>
  );
}

export default Header;