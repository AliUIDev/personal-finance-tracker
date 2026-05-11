import { useState } from "react";
import { PiggyBank, RotateCcw, Save, X } from "lucide-react";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { formatCurrency } from "../../../../utils/currency";
import "./EditSavingsModal.css";

function EditSavingsModal({ goal, recommendedGoal, onClose, onSave }) {
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const [title, setTitle] = useState(goal?.title || "Monthly Savings");
  const [target, setTarget] = useState(
    String(goal?.target || recommendedGoal?.target || "")
  );
  const [error, setError] = useState("");

  const handleMoneyChange = (value) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setTarget(value);
      setError("");
    }
  };

  const handleResetRecommended = () => {
    setTitle(recommendedGoal?.title || "Monthly Savings");
    setTarget(String(recommendedGoal?.target || ""));
    setError("");
  };

  const handleSave = () => {
    const cleanTitle = title.trim();
    const numericTarget = Number(target);

    if (!cleanTitle) {
      setError("Goal name is required.");
      return;
    }

    if (!target || numericTarget <= 0) {
      setError("Target amount must be greater than 0.");
      return;
    }

    onSave({
      title: cleanTitle,
      target: numericTarget,
    });
  };

  return (
    <div className="savings-modal-overlay">
      <div className="savings-modal">
        <div className="savings-modal-header">
          <div className="savings-modal-title-row">
            <span className="savings-modal-icon">
              <PiggyBank size={18} />
            </span>

            <div>
              <p className="modal-label">Edit Goal</p>
              <h3>Monthly Savings Target</h3>
              <span>Set the amount you want to keep aside this month.</span>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="savings-modal-fields">
          <label>
            <span>Goal Name</span>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="Enter savings goal name"
            />
          </label>

          <label>
            <span>Target Amount</span>
            <input
              type="text"
              inputMode="decimal"
              value={target}
              onChange={(e) => handleMoneyChange(e.target.value)}
              placeholder={formatCurrency(recommendedGoal?.target || 0, currency)}
            />
          </label>
        </div>

        {error && <p className="modal-error-text">{error}</p>}

        <div className="savings-modal-actions">
          <button
            type="button"
            className="modal-secondary-btn"
            onClick={handleResetRecommended}
          >
            <RotateCcw size={15} />
            Reset Recommended
          </button>

          <div className="savings-modal-action-group">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="button" className="modal-save-btn" onClick={handleSave}>
              <Save size={15} />
              Save Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditSavingsModal;