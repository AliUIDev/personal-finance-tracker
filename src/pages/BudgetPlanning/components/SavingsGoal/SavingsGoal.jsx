import { PiggyBank, Pencil, Wallet, ShieldCheck, CalendarDays } from "lucide-react";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { formatCurrency } from "../../../../utils/currency";
import "./SavingsGoal.css";

const SavingsGoal = ({ goal, monthlyBudget, totalSpent, onEditGoal }) => {
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const target = Number(goal.target) || 0;
  const availableAfterSpending = Math.max(monthlyBudget - totalSpent, 0);
  const targetStatus =
    availableAfterSpending >= target ? "On Track" : "Needs Attention";
  const suggestedWeeklySave = Math.ceil(target / 4);

  return (
    <div className="savings-goal-card">
      <div className="savings-goal-header-row">
        <div className="savings-goal-header">
          <div className="savings-goal-title-row">
            <span className="savings-goal-icon">
              <PiggyBank size={18} />
            </span>

            <div>
              <p className="savings-goal-label">Savings Goal</p>
              <h3>{goal.title}</h3>
            </div>
          </div>
        </div>

        <button type="button" className="edit-goal-btn" onClick={onEditGoal}>
          <Pencil size={14} />
          Edit Goal
        </button>
      </div>

      <div className="savings-goal-progress-main">
        <div>
          <strong>{formatCurrency(target, currency)}</strong>
          <p>monthly savings target</p>
        </div>

        <span
          className={
            availableAfterSpending >= target
              ? "savings-status on-track"
              : "savings-status attention"
          }
        >
          <ShieldCheck size={14} />
          {targetStatus}
        </span>
      </div>

      <div className="savings-goal-stats">
        <div className="savings-stat-box">
          <span className="savings-stat-icon">
            <Wallet size={16} />
          </span>
          <p>Available After Spending</p>
          <h4>{formatCurrency(availableAfterSpending, currency)}</h4>
        </div>

        <div className="savings-stat-box">
          <span className="savings-stat-icon">
            <ShieldCheck size={16} />
          </span>
          <p>Target Status</p>
          <h4>{targetStatus}</h4>
        </div>

        <div className="savings-stat-box full">
          <span className="savings-stat-icon">
            <CalendarDays size={16} />
          </span>
          <p>Suggested Weekly Save</p>
          <h4>{formatCurrency(suggestedWeeklySave, currency)}</h4>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoal;