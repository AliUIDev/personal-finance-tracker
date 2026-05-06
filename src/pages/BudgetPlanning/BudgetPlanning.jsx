import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getAllTransactions,
  getBudgetPlan,
  saveBudgetPlan,
} from "../../services/storage";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { formatCurrency } from "../../utils/currency";
import { isCurrentMonthToDate } from "../../utils/dateFilters";
import BudgetCard from "./components/BudgetCard/BudgetCard";
import BudgetProgress from "./components/BudgetProgress/BudgetProgress";
import SavingsGoal from "./components/SavingsGoal/SavingsGoal";
import BudgetInsights from "./components/BudgetInsights/BudgetInsights";
import EditBudgetModal from "./components/EditBudgetModal/EditBudgetModal";
import EditSavingsModal from "./components/EditSavingsModal/EditSavingsModal";
import "./BudgetPlanning.css";

const categoryWeights = {
  Essentials: 0.28,
  Lifestyle: 0.14,
  Health: 0.08,
  Education: 0.1,
  Travel: 0.1,
  Family: 0.08,
  Other: 0.02,
};

const createRecommendedSavingsGoal = (monthlyBudget) => ({
  title: "Monthly Savings",
  target: Math.round(monthlyBudget * 0.2),
});

const createDefaultBudgetPlan = (monthlyBudget) => ({
  baseMonthlyBudget: monthlyBudget,
  categoryLimits: Object.fromEntries(
    Object.entries(categoryWeights).map(([category, weight]) => [
      category,
      Math.round(monthlyBudget * weight),
    ])
  ),
  savingsGoal: createRecommendedSavingsGoal(monthlyBudget),
});

const BudgetPlanning = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";
  const monthlyBudget = Number(currentUser?.monthlyBudget ?? 0);

  const recommendedSavingsGoal = createRecommendedSavingsGoal(monthlyBudget);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);

  const [budgetPlan, setBudgetPlan] = useState(() => {
    const storedPlan = getBudgetPlan();
    const defaultPlan = createDefaultBudgetPlan(monthlyBudget);

    if (
      !storedPlan ||
      storedPlan.baseMonthlyBudget !== monthlyBudget ||
      !storedPlan.categoryLimits ||
      !storedPlan.savingsGoal
    ) {
      saveBudgetPlan(defaultPlan);
      return defaultPlan;
    }

    return {
      ...defaultPlan,
      ...storedPlan,
      categoryLimits: {
        ...defaultPlan.categoryLimits,
        ...storedPlan.categoryLimits,
      },
      savingsGoal: {
        ...defaultPlan.savingsGoal,
        ...storedPlan.savingsGoal,
      },
    };
  });

  const transactions = getAllTransactions();

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((transaction) =>
      isCurrentMonthToDate(transaction.date)
    );
  }, [transactions]);

  const totalSpent = currentMonthTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );

  const remainingBudget = monthlyBudget - totalSpent;
  const availableToSave = Math.max(remainingBudget, 0);

  const savingsGoalProgress = {
    ...budgetPlan.savingsGoal,
    saved: Math.min(
      availableToSave,
      Number(budgetPlan.savingsGoal?.target || 0)
    ),
  };

  const categorySpending = Object.keys(budgetPlan.categoryLimits).map(
    (category) => {
      const spent = currentMonthTransactions
        .filter((transaction) => transaction.category === category)
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

      const limit = Number(budgetPlan.categoryLimits[category]) || 1;

      return {
        category,
        spent,
        limit,
        percentage: Math.min((spent / limit) * 100, 100),
      };
    }
  );

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleSaveLimits = (updatedLimits) => {
    const updatedPlan = {
      ...budgetPlan,
      categoryLimits: updatedLimits,
    };

    setBudgetPlan(updatedPlan);
    saveBudgetPlan(updatedPlan);
    setIsBudgetModalOpen(false);
  };

  const handleSaveSavingsGoal = (updatedGoal) => {
    const updatedPlan = {
      ...budgetPlan,
      savingsGoal: updatedGoal,
    };

    setBudgetPlan(updatedPlan);
    saveBudgetPlan(updatedPlan);
    setIsSavingsModalOpen(false);
  };

  return (
    <div className="budget-planning-page">
      <div className="budget-planning-shell">
        <button type="button" className="budget-back-btn" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>

        <header className="budget-planning-header">
          <p className="budget-planning-label">Budget Control</p>
          <h1>Budget Planning</h1>
          <p>
            Set spending limits, monitor progress, and keep your monthly
            finances under control.
          </p>
        </header>

        <section className="budget-cards-grid">
          <BudgetCard
            title="Monthly Budget"
            value={formatCurrency(monthlyBudget, currency)}
            type="budget"
          />

          <BudgetCard
            title="Spent This Month"
            value={formatCurrency(totalSpent, currency)}
            type="spent"
          />

          <BudgetCard
            title="Remaining"
            value={formatCurrency(remainingBudget, currency)}
            type="remaining"
            featured
          />
        </section>

        <section className="budget-main-grid">
          <div className="budget-left-panel">
            <BudgetProgress
              categories={categorySpending}
              onEditLimits={() => setIsBudgetModalOpen(true)}
            />
          </div>

          <div className="budget-right-panel">
            <SavingsGoal
              goal={budgetPlan.savingsGoal}
              monthlyBudget={monthlyBudget}
              totalSpent={totalSpent}
              onEditGoal={() => setIsSavingsModalOpen(true)}
            />

            <BudgetInsights
              totalSpent={totalSpent}
              monthlyBudget={monthlyBudget}
              categories={categorySpending}
              savingsGoal={savingsGoalProgress}
            />
          </div>
        </section>
      </div>

      {isBudgetModalOpen && (
        <EditBudgetModal
          limits={budgetPlan.categoryLimits}
          recommendedLimits={createDefaultBudgetPlan(monthlyBudget).categoryLimits}
          onClose={() => setIsBudgetModalOpen(false)}
          onSave={handleSaveLimits}
        />
      )}

      {isSavingsModalOpen && (
        <EditSavingsModal
          goal={budgetPlan.savingsGoal}
          recommendedGoal={recommendedSavingsGoal}
          onClose={() => setIsSavingsModalOpen(false)}
          onSave={handleSaveSavingsGoal}
        />
      )}
    </div>
  );
};

export default BudgetPlanning;