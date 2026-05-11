import { Pencil, SlidersHorizontal, WalletCards, Gauge } from "lucide-react";
import "./BudgetProgress.css";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { formatCurrency } from "../../../../utils/currency";

const BudgetProgress = ({ categories, onEditLimits }) => {
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const totalLimit = categories.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const remainingLimit = totalLimit - totalSpent;

  return (
    <div className="budget-progress-card">
      <div className="budget-progress-header">
        <div className="budget-progress-title-row">
          <span className="budget-progress-icon">
            <SlidersHorizontal size={18} />
          </span>

          <div>
            <p className="budget-progress-label">Spending Limits</p>
            <h3>Category Limit Progress</h3>
            <span>Track monthly spending against your planned category limits</span>
          </div>
        </div>

        <button type="button" className="edit-limits-btn" onClick={onEditLimits}>
          <Pencil size={14} />
          Edit Limits
        </button>
      </div>

      <div className="budget-progress-list">
        {categories.map((item) => (
          <div key={item.category} className="progress-item">
            <div className="progress-top">
              <div>
                <h4>{item.category}</h4>
                <p>
                  {formatCurrency(item.spent, currency)} /{" "}
                  {formatCurrency(item.limit, currency)}
                </p>
              </div>

              <span
                className={`progress-percent ${
                  item.percentage >= 90 ? "danger" : ""
                }`}
              >
                {Math.round(item.percentage)}%
              </span>
            </div>

            <div className="progress-bar">
              <div
                className={`progress-fill ${
                  item.percentage >= 90 ? "danger" : ""
                }`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="budget-progress-footer">
        <div>
          <span className="budget-footer-icon">
            <WalletCards size={16} />
          </span>
          <p>Total category limits</p>
          <strong>{formatCurrency(totalLimit, currency)}</strong>
        </div>

        <div>
          <span className="budget-footer-icon">
            <Gauge size={16} />
          </span>
          <p>Remaining category limit</p>
          <strong>{formatCurrency(remainingLimit, currency)}</strong>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;