import { useState } from "react";
import { Check, ImageUp, X } from "lucide-react";
import "./UserAvatar.css";

const positionLabels = [
  { label: "Center", value: "center" },
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
];

const UserAvatar = ({ user, size = "md", editable = false, onImageChange }) => {
  const name = user?.name || user?.displayName || "User";
  const image =
    user?.profileImage ||
    user?.avatarUrl ||
    user?.photoURL ||
    user?.picture ||
    "";
  const imagePosition = user?.profileImagePosition || "center";

  const [pendingImage, setPendingImage] = useState("");
  const [pendingPosition, setPendingPosition] = useState(imagePosition);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const initials = name
    .trim()
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file || !onImageChange) return;

    const reader = new FileReader();

    reader.onload = () => {
      setPendingImage(reader.result);
      setPendingPosition("center");
      setIsEditorOpen(true);
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSave = () => {
    onImageChange({
      image: pendingImage,
      position: pendingPosition,
    });

    setIsEditorOpen(false);
    setPendingImage("");
  };

  return (
    <>
      <div className={`user-avatar user-avatar-${size}`}>
        {image ? (
          <img
            src={image}
            alt={`${name} profile`}
            style={{ objectPosition: imagePosition }}
          />
        ) : (
          <span>{initials}</span>
        )}

        {editable && (
          <label className="user-avatar-upload">
            Change
            <input type="file" accept="image/*" onChange={handleUpload} />
          </label>
        )}
      </div>

      {isEditorOpen && (
        <div className="avatar-editor-overlay">
          <div className="avatar-editor-box">
            <button
              type="button"
              className="avatar-editor-close"
              onClick={() => setIsEditorOpen(false)}
            >
              <X size={18} />
            </button>

            <div className="avatar-editor-header">
              <div className="avatar-editor-icon">
                <ImageUp size={20} />
              </div>

              <h3>Adjust profile image</h3>
              <p>
                Choose which part of the image should stay visible inside the
                circular avatar.
              </p>
            </div>

            <div className="avatar-preview-ring">
              <img
                src={pendingImage}
                alt="Profile preview"
                style={{ objectPosition: pendingPosition }}
              />
            </div>

            <div className="avatar-position-grid">
              {positionLabels.map((position) => (
                <button
                  key={position.value}
                  type="button"
                  className={pendingPosition === position.value ? "active" : ""}
                  onClick={() => setPendingPosition(position.value)}
                >
                  {position.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="avatar-editor-save"
              onClick={handleSave}
            >
              <Check size={18} />
              Use This Image
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAvatar;