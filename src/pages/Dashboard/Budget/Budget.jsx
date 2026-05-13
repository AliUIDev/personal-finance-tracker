import { useEffect, useState } from "react";
import {
  getAllTransactions,
  getBudgetPlan,
  saveBudgetPlan,
} from "../../../services/storage";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { formatCurrency } from "../../../utils/currency";
import { isCurrentMonthToDate } from "../../../utils/dateFilters";
import "./Budget.css";

const categoryWeights = {
  Essentials: 0.28,
  Lifestyle: 0.14,
  Health: 0.08,
  Education: 0.1,
  Travel: 0.1,
  Family: 0.08,
  Other: 0.02,
};

const createDefaultBudgetPlan = (monthlyBudget) => ({
  baseMonthlyBudget: monthlyBudget,
  categoryLimits: Object.fromEntries(
    Object.entries(categoryWeights).map(([category, weight]) => [
      category,
      Math.round(monthlyBudget * weight),
    ])
  ),
});

function Budget({ budget = 0 }) {
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const [currentMonthTransactions, setCurrentMonthTransactions] = useState([]);
  const [categoryLimits, setCategoryLimits] = useState({});

  useEffect(() => {
    const storedPlan = getBudgetPlan();

    if (!storedPlan || storedPlan.baseMonthlyBudget !== budget) {
      const newPlan = createDefaultBudgetPlan(budget);
      saveBudgetPlan(newPlan);
      setCategoryLimits(newPlan.categoryLimits);
    } else {
      setCategoryLimits(storedPlan.categoryLimits || {});
    }

    const allTransactions = getAllTransactions();

    const filteredTransactions = allTransactions.filter((transaction) =>
      isCurrentMonthToDate(transaction.date)
    );

    setCurrentMonthTransactions(filteredTransactions);
  }, [budget]);

  const totalSpent = currentMonthTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );

  const remainingBudget = Math.max(budget - totalSpent, 0);

  const overallUsedPercentage =
    budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  const categoriesOverview = Object.keys(categoryLimits).map((categoryName) => {
    const categorySpent = currentMonthTransactions
      .filter((transaction) => transaction.category === categoryName)
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    const categoryBudget = Number(categoryLimits[categoryName]) || 1;

    const spentPercentage = Math.min(
      (categorySpent / categoryBudget) * 100,
      100
    );

    let statusClass = "safe";

    if (spentPercentage >= 90) {
      statusClass = "danger";
    } else if (spentPercentage >= 70) {
      statusClass = "warning";
    }

    return {
      categoryName,
      categorySpent,
      categoryBudget,
      spentPercentage,
      statusClass,
    };
  });

  return (
    <div className="budget-container budget">
      <div className="budget-header">
        <div>
          <h3>Budget Overview</h3>
          <p>{formatCurrency(remainingBudget, currency)} left this month</p>
        </div>

        <span className="budget-health-badge">
          {Math.round(overallUsedPercentage)}% used
        </span>
      </div>

      <div className="budget-summary">
        <div className="budget-summary-item">
          <span className="budget-summary-label">Budget</span>
          <strong>{formatCurrency(budget, currency)}</strong>
        </div>

        <div className="budget-summary-item">
          <span className="budget-summary-label">Spent</span>
          <strong>{formatCurrency(totalSpent, currency)}</strong>
        </div>

        <div className="budget-summary-item">
          <span className="budget-summary-label">Remaining</span>
          <strong>{formatCurrency(remainingBudget, currency)}</strong>
        </div>
      </div>

      <div className="budget-list">
        {categoriesOverview.map((categoryData) => (
          <div className="budget-item" key={categoryData.categoryName}>
            <div className="budget-item-top">
              <div>
                <span className="budget-category">
                  {categoryData.categoryName}
                </span>
                <small>
                  {formatCurrency(categoryData.categoryBudget, currency)} limit
                </small>
              </div>

              <span className="budget-spent">
                {formatCurrency(categoryData.categorySpent, currency)}
              </span>
            </div>

            <div className="progress-bar">
              <div
                className={`progress-fill ${categoryData.statusClass}`}
                style={{ width: `${categoryData.spentPercentage}%` }}
              ></div>
            </div>

            <div className="budget-item-bottom">
              <span className="budget-percent">
                {Math.round(categoryData.spentPercentage)}% used
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Budget;