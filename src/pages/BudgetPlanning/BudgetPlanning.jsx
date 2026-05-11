import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getAllTransactions, getBudgetPlan, saveBudgetPlan } from "../../services/storage";
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
  Essentials: 0.42,
  Lifestyle: 0.16,
  Health: 0.08,
  Education: 0.08,
  Travel: 0.08,
  Family: 0.08,
  Other: 0.02,
};

const getMonthlyIncome = (user) => {
  const mainIncomeTotal = (user?.mainIncomeSources || []).reduce(
    (total, income) => total + Number(income.monthlyIncome || 0),
    0
  );

  const additionalIncomeTotal = (user?.additionalIncome || []).reduce(
    (total, income) => total + Number(income.monthlyIncome || 0),
    0
  );

  return mainIncomeTotal + additionalIncomeTotal;
};

const createRecommendedSavingsGoal = (monthlyIncome, plannedSpending) => ({
  title: "Monthly Savings",
  target: Math.round((monthlyIncome || plannedSpending) * 0.2),
});

const createDefaultBudgetPlan = (plannedSpending, monthlyIncome) => ({
  baseMonthlyBudget: plannedSpending,
  baseMonthlyIncome: monthlyIncome,
  bufferTarget: Math.round(monthlyIncome * 0.1),
  categoryLimits: Object.fromEntries(
    Object.entries(categoryWeights).map(([category, weight]) => [
      category,
      Math.round(plannedSpending * weight),
    ])
  ),
  savingsGoal: createRecommendedSavingsGoal(monthlyIncome, plannedSpending),
});

const BudgetPlanning = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const monthlyIncome = getMonthlyIncome(currentUser);
  const plannedSpending = Number(currentUser?.monthlyBudget ?? 0);
  const bufferTarget = Math.round(monthlyIncome * 0.1);

  const recommendedSavingsGoal = createRecommendedSavingsGoal(
    monthlyIncome,
    plannedSpending
  );

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);

  const [budgetPlan, setBudgetPlan] = useState(() => {
    const storedPlan = getBudgetPlan();
    const defaultPlan = createDefaultBudgetPlan(plannedSpending, monthlyIncome);

    if (
      !storedPlan ||
      storedPlan.baseMonthlyBudget !== plannedSpending ||
      storedPlan.baseMonthlyIncome !== monthlyIncome ||
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

  const availableToSave = Math.max(monthlyIncome - totalSpent, 0);

  const savingsGoalProgress = {
    ...budgetPlan.savingsGoal,
    saved: Math.min(availableToSave, Number(budgetPlan.savingsGoal?.target || 0)),
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

  return (
    <div className="budget-planning-page">
      <div className="budget-planning-shell">
        <button
          type="button"
          className="budget-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={20} />
        </button>

        <header className="budget-planning-header">
          <p className="budget-planning-label">Budget Control</p>
          <h1>Budget Planning</h1>
          <p>
            Plan spending, protect savings, and keep a monthly buffer for
            flexibility.
          </p>
        </header>

        <section className="budget-cards-grid">
          <BudgetCard
            title="Planned Spending"
            value={formatCurrency(plannedSpending, currency)}
            type="budget"
          />

          <BudgetCard
            title="Savings Target"
            value={formatCurrency(budgetPlan.savingsGoal.target, currency)}
            type="spent"
          />

          <BudgetCard
            title="Monthly Buffer"
            value={formatCurrency(bufferTarget, currency)}
            type="remaining"
            featured
          />
        </section>

        <section className="budget-main-grid">
          <BudgetProgress
            categories={categorySpending}
            onEditLimits={() => setIsBudgetModalOpen(true)}
          />

          <div className="budget-right-panel">
            <SavingsGoal
              goal={budgetPlan.savingsGoal}
              monthlyBudget={plannedSpending}
              totalSpent={totalSpent}
              onEditGoal={() => setIsSavingsModalOpen(true)}
            />

            <BudgetInsights
              totalSpent={totalSpent}
              monthlyBudget={plannedSpending}
              categories={categorySpending}
              savingsGoal={savingsGoalProgress}
            />
          </div>
        </section>
      </div>

      {isBudgetModalOpen && (
        <EditBudgetModal
          limits={budgetPlan.categoryLimits}
          recommendedLimits={
            createDefaultBudgetPlan(plannedSpending, monthlyIncome)
              .categoryLimits
          }
          onClose={() => setIsBudgetModalOpen(false)}
          onSave={(updatedLimits) => {
            const updatedPlan = {
              ...budgetPlan,
              categoryLimits: updatedLimits,
            };

            setBudgetPlan(updatedPlan);
            saveBudgetPlan(updatedPlan);
            setIsBudgetModalOpen(false);
          }}
        />
      )}

      {isSavingsModalOpen && (
        <EditSavingsModal
          goal={budgetPlan.savingsGoal}
          recommendedGoal={recommendedSavingsGoal}
          onClose={() => setIsSavingsModalOpen(false)}
          onSave={(updatedGoal) => {
            const updatedPlan = {
              ...budgetPlan,
              savingsGoal: updatedGoal,
            };

            setBudgetPlan(updatedPlan);
            saveBudgetPlan(updatedPlan);
            setIsSavingsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default BudgetPlanning;