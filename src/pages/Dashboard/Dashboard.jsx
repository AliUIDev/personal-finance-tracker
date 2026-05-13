import { useState, useEffect } from "react";
import Header from "./Header/Header";
import Budget from "../Dashboard/Budget/Budget";
import RecentTransactions from "../Dashboard/RecentTransactions/RecentTransactions";
import Summary from "../Dashboard/Summary/Summary";
import Footer from "./Footer/Footer";
import CalendarSummary from "./CalendarSummary/CalendarSummary";
import SpendingTrendChart from "./SpendingTrendChart/SpendingTrendChart";
import CategoryTrendChart from "./CategoryTrendChart/CategoryTrendChart";
import Sidebar from "./Sidebar/Sidebar";
import { getCurrentUser, getTransactions } from "../../services/storage";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { formatCurrency } from "../../utils/currency";
import mockTransactions from "../../data/mock_transactions.json";
import "./Dashboard.css";

function Dashboard() {
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userBudget, setUserBudget] = useState(0);
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState(0);

  useEffect(() => {
    const getFilteredTransactions = () => {
      const storedTransactions = getTransactions();
      const allTransactions = [...mockTransactions, ...storedTransactions];

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      return allTransactions.filter((t) => {
        const date = new Date(`${t.date}T00:00:00`);

        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth &&
          date <= today
        );
      });
    };

    const loadUserFinancials = () => {
      const user = getCurrentUser();

      const monthlyBudget = Number(user?.monthlyBudget ?? 0);

      const mainIncomeTotal = (user?.mainIncomeSources || []).reduce(
        (total, income) => total + Number(income.monthlyIncome || 0),
        0
      );

      const additionalIncomeTotal = (user?.additionalIncome || []).reduce(
        (total, income) => total + Number(income.monthlyIncome || 0),
        0
      );

      setUserBudget(monthlyBudget);
      setTotalMonthlyIncome(mainIncomeTotal + additionalIncomeTotal);
    };

    const calculateCurrentMonthExpenses = () => {
      const transactions = getFilteredTransactions();

      const total = transactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        0
      );

      setCurrentMonthExpenses(total);
    };

    const handleUpdate = () => {
      loadUserFinancials();
      calculateCurrentMonthExpenses();
    };

    const handleStorageChange = (event) => {
      if (event.key === "currentUser" || event.key === "transactions") {
        handleUpdate();
      }
    };

    handleUpdate();

    window.addEventListener("budgetbee:user-updated", handleUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("budgetbee:user-updated", handleUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard">
      <Header onMenuClick={openSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <main className="dashboard-content">
        <section className="charts">
          <div className="line-chart">
            <SpendingTrendChart userBudget={userBudget} />
          </div>

          <div className="mobile-recent-panel">
            <RecentTransactions />
          </div>

          <div className="mobile-budget-panel">
            <Budget budget={userBudget} />
          </div>

          <div className="category-section">
            <CategoryTrendChart />

            <div className="category-bottom">
              <CalendarSummary />
            </div>
          </div>
        </section>

        <aside className="side-content">
          <div className="budget-panel">
            <div className="summary-boxes">
              <Summary
                title="Total Income"
                value={formatCurrency(totalMonthlyIncome, currency)}
                type="income"
              />
              <Summary
                title="Total Expenses"
                value={formatCurrency(currentMonthExpenses, currency)}
                type="expenses"
              />
            </div>

            <div className="desktop-budget-panel">
              <Budget budget={userBudget} />
            </div>
          </div>

          <div className="aside-down-panel">
            <RecentTransactions />
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;