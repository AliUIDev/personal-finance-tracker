import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, Settings, UserRound } from "lucide-react";
import { getCurrentUser, clearCurrentUser } from "../../../../services/storage";
import "./ProfileMenu.css";

export default function ProfileMenu({ onClose }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const displayName =
    user?.name || user?.displayName || user?.email?.split("@")[0] || "Guest User";

  const displayEmail = user?.email || "No email";

  const profileImage =
    user?.profileImage ||
    user?.avatarUrl ||
    user?.photoURL ||
    user?.picture ||
    null;

  const goTo = (path) => {
    onClose?.();
    navigate(path);
  };

  const handleLogout = () => {
    clearCurrentUser();
    onClose?.();
    navigate("/");
  };

  return (
    <div className="profile-menu">
      <div className="profile-menu-user">
        <div className="profile-menu-avatar">
          {profileImage ? (
            <img src={profileImage} alt={displayName} />
          ) : (
            <UserRound size={23} strokeWidth={2.15} />
          )}
        </div>

        <div className="profile-menu-user-info">
          <h2>{displayName}</h2>
          <p>{displayEmail}</p>
        </div>
      </div>

      <div className="profile-menu-list">
        <button type="button" onClick={() => goTo("/settings/profile")}>
          <span className="profile-menu-text">
            <strong>Profile Settings</strong>
            <small>Manage account and profile image</small>
          </span>

          <Settings size={18} strokeWidth={2.15} />
        </button>

        <button type="button" className="logout-item" onClick={handleLogout}>
          <span className="profile-menu-text">
            <strong>Log Out</strong>
          </span>

          <LogOut size={18} strokeWidth={2.15} />
        </button>
      </div>

      <div className="profile-menu-footer">
        <button type="button" onClick={() => goTo("/privacy-policy")}>
          Privacy Policy
        </button>
        <button type="button" onClick={() => goTo("/terms-of-use")}>
          Terms of Use
        </button>
      </div>
    </div>
  );
}