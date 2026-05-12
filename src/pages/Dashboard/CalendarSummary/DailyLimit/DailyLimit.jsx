import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Edit3, Save, SlidersHorizontal, X } from "lucide-react";
import "./DailyLimit.css";
import { formatCurrency } from "../../../../utils/currency";

function DailyLimit({ limit, recommendedLimit, currency, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dailyLimitValue, setDailyLimitValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDailyLimitValue(limit > 0 ? String(Math.round(limit * 100) / 100) : "");
      document.body.classList.add("daily-limit-modal-open");
    }

    return () => {
      document.body.classList.remove("daily-limit-modal-open");
    };
  }, [isOpen, limit]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const saveLimit = () => {
    onSave(dailyLimitValue);
    closeModal();
  };

  const resetRecommended = () => {
    onSave(0);
    closeModal();
  };

  return (
    <>
      <div className="daily-limit-card">
        <div>
          <span>Daily limit</span>
          <strong>{formatCurrency(limit, currency)}</strong>
        </div>

        <button type="button" onClick={() => setIsOpen(true)}>
          <Edit3 size={13} strokeWidth={2.4} />
          Adjust
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div className="daily-limit-overlay" role="presentation">
            <div className="daily-limit-modal" role="dialog" aria-modal="true">
              <button
                type="button"
                className="daily-limit-close"
                onClick={closeModal}
                aria-label="Close daily limit modal"
              >
                <X size={19} strokeWidth={2.5} />
              </button>

              <div className="daily-limit-heading">
                <div className="daily-limit-icon">
                  <SlidersHorizontal size={18} strokeWidth={2.4} />
                </div>

                <div>
                  <span className="daily-limit-kicker">Daily control</span>
                  <h3>Daily Spending Limit</h3>
                  <p>
                    Set a daily target so BudgetBee can mark each day as low,
                    medium, or high spending.
                  </p>
                </div>
              </div>

              <div className="daily-limit-form">
                <label htmlFor="dailyLimit">Custom daily limit</label>
                <input
                  id="dailyLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={dailyLimitValue}
                  onChange={(event) => setDailyLimitValue(event.target.value)}
                  placeholder="Enter daily limit"
                />
              </div>

              <div className="daily-limit-info-grid">
                <div className="daily-limit-info-card">
                  <span>Current limit</span>
                  <strong>{formatCurrency(limit, currency)}</strong>
                </div>

                <div className="daily-limit-info-card">
                  <span>Recommended</span>
                  <strong>{formatCurrency(recommendedLimit, currency)}</strong>
                </div>
              </div>

              <div className="daily-limit-actions">
                <button
                  type="button"
                  className="daily-limit-reset"
                  onClick={resetRecommended}
                >
                  Reset Recommended
                </button>

                <div>
                  <button
                    type="button"
                    className="daily-limit-cancel"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="daily-limit-save"
                    onClick={saveLimit}
                  >
                    <Save size={15} strokeWidth={2.4} />
                    Save Limit
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default DailyLimit;