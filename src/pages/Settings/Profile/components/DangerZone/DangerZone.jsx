import { useState } from "react";
import { Trash2, X } from "lucide-react";
import "./DangerZone.css";

const DangerZone = ({ onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <section className="danger-zone">
        <div className="danger-icon">
          <Trash2 size={18} />
        </div>

        <div className="danger-content">
          <span>Danger Zone</span>
          <h2>Delete BudgetBee Profile</h2>
          <p>
            Delete this profile permanently and clear its saved workspace data
            from this browser.
          </p>
        </div>

        <button
          type="button"
          className="delete-btn"
          onClick={() => setShowDeleteModal(true)}
        >
          <Trash2 size={16} />
          Delete Profile
        </button>
      </section>

      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-box" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowDeleteModal(false)}
            >
              <X size={18} />
            </button>

            <div className="modal-danger-icon">
              <Trash2 size={22} />
            </div>

            <h3>Delete this profile?</h3>
            <p>
              This will permanently remove your BudgetBee profile from this
              browser. This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-delete"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete"
                onClick={onDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DangerZone;