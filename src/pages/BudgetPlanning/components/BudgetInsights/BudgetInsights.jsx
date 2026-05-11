import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Gauge,
  TrendingUp,
} from "lucide-react";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { formatCurrency } from "../../../../utils/currency";
import "./BudgetInsights.css";

const BudgetInsights = ({ totalSpent, monthlyBudget, categories }) => {
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const plannedSpending = Number(monthlyBudget) || 0;
  const spentPercentage =
    plannedSpending > 0
      ? Math.min((totalSpent / plannedSpending) * 100, 100)
      : 0;

  const activeCategories = categories.filter((item) => item.spent > 0);
  const highestCategory = [...activeCategories].sort(
    (a, b) => b.spent - a.spent
  )[0];

  const warningCategory = categories.find((item) => item.percentage >= 90);

  return (
    <div className="budget-insights-card">
      <div className="budget-insights-header">
        <span className="budget-insights-main-icon">
          <Gauge size={17} />
        </span>

        <div>
          <p className="budget-insights-label">Insights</p>
          <h3>Plan Health</h3>
          <span>Simple signals to help you manage your planned spending</span>
        </div>
      </div>

      <div className="insights-list">
        <div className="insight-item">
          <span className="insight-icon">
            <BarChart3 size={15} />
          </span>

          <div>
            <strong>{Math.round(spentPercentage)}%</strong>
            <p>of your planned monthly spending has been used.</p>
          </div>
        </div>

        {highestCategory ? (
          <div className="insight-item">
            <span className="insight-icon">
              <TrendingUp size={15} />
            </span>

            <div>
              <strong>{highestCategory.category}</strong>
              <p>
                is your highest spending category (
                {formatCurrency(highestCategory.spent, currency)}).
              </p>
            </div>
          </div>
        ) : (
          <div className="insight-item">
            <span className="insight-icon">
              <TrendingUp size={15} />
            </span>

            <div>
              <strong>No spending yet</strong>
              <p>Your highest spending category will appear after transactions.</p>
            </div>
          </div>
        )}

        {warningCategory ? (
          <div className="insight-item warning">
            <span className="insight-icon">
              <AlertTriangle size={15} />
            </span>

            <div>
              <strong>{warningCategory.category}</strong>
              <p>is close to or over its planned category limit.</p>
            </div>
          </div>
        ) : (
          <div className="insight-item success">
            <span className="insight-icon">
              <CheckCircle2 size={15} />
            </span>

            <div>
              <strong>Stable</strong>
              <p>Your category limits are currently under control.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetInsights;