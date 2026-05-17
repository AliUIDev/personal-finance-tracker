import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { getCurrentUser, clearCurrentUser } from "../../../../services/storage";
import UserAvatar from "../../../../components/UserAvatar/UserAvatar";
import "./ProfileMenu.css";

export default function ProfileMenu({ onClose }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => setUser(getCurrentUser());

    loadUser();

    window.addEventListener("budgetbee:user-updated", loadUser);

    return () => {
      window.removeEventListener("budgetbee:user-updated", loadUser);
    };
  }, []);

  const displayName =
    user?.name || user?.displayName || user?.email?.split("@")[0] || "Guest User";

  const displayEmail = user?.email || "No email";

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
        <UserAvatar user={user} size="sm" />

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