import { useState } from "react";
import { RotateCcw, Save, SlidersHorizontal, X } from "lucide-react";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { formatCurrency } from "../../../../utils/currency";
import "./EditBudgetModal.css";

const EditBudgetModal = ({ limits, recommendedLimits, onClose, onSave }) => {
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const [formLimits, setFormLimits] = useState(limits);

  const handleChange = (category, value) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setFormLimits((prev) => ({
        ...prev,
        [category]: value,
      }));
    }
  };

  const handleResetRecommended = () => {
    if (!recommendedLimits) return;
    setFormLimits(recommendedLimits);
  };

  const handleSave = () => {
    const cleanedLimits = Object.fromEntries(
      Object.entries(formLimits).map(([category, value]) => [
        category,
        Number(value) > 0 ? Number(value) : 1,
      ])
    );

    onSave(cleanedLimits);
  };

  return (
    <div className="budget-modal-overlay">
      <div className="budget-modal">
        <div className="budget-modal-header">
          <div className="budget-modal-title-row">
            <span className="budget-modal-icon">
              <SlidersHorizontal size={18} />
            </span>

            <div>
              <p>Edit Limits</p>
              <h3>Category Spending Limits</h3>
              <span>Adjust how much you plan to spend in each category.</span>
            </div>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="budget-modal-fields">
          {Object.entries(formLimits).map(([category, value]) => (
            <label key={category}>
              <span>{category}</span>
              <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(event) => handleChange(category, event.target.value)}
                placeholder={formatCurrency(
                  recommendedLimits?.[category] || 0,
                  currency
                )}
              />
            </label>
          ))}
        </div>

        <div className="budget-modal-actions">
          <button
            type="button"
            className="modal-reset-btn"
            onClick={handleResetRecommended}
          >
            <RotateCcw size={15} />
            Reset Recommended
          </button>

          <div className="modal-action-group">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="button" className="modal-save-btn" onClick={handleSave}>
              <Save size={15} />
              Save Limits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBudgetModal;