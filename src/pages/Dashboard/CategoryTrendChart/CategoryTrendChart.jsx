import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import "./CategoryTrendChart.css";
import mockTransactions from "../../../data/mock_transactions.json";
import { getTransactions } from "../../../services/storage";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { isPastOrToday } from "../../../utils/dateFilters";

const categories = [
  { name: "Essentials", color: "#22c55e" },
  { name: "Lifestyle", color: "#f59e0b" },
  { name: "Health", color: "#3b82f6" },
  { name: "Education", color: "#8b5cf6" },
  { name: "Travel", color: "#14b8a6" },
  { name: "Family", color: "#6366f1" },
  { name: "Other", color: "#94a3b8" },
];

function CategoryTrendChart() {
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";
  const [categoryData, setCategoryData] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const loadCategoryData = () => {
      const storedTransactions = getTransactions();
      const allTransactions = [...mockTransactions, ...storedTransactions].filter(
        (transaction) => isPastOrToday(transaction.date)
      );

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const currentDay = today.getDate();

      const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const previousMonth = previousMonthDate.getMonth();
      const previousYear = previousMonthDate.getFullYear();

      const currentTotals = {};
      const previousTotals = {};

      categories.forEach((category) => {
        currentTotals[category.name] = 0;
        previousTotals[category.name] = 0;
      });

      allTransactions.forEach((transaction) => {
        const date = new Date(`${transaction.date}T00:00:00`);
        const amount = Number(transaction.amount || 0);
        const category = transaction.category;

        if (!Object.prototype.hasOwnProperty.call(currentTotals, category)) {
          return;
        }

        if (
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth &&
          date.getDate() <= currentDay
        ) {
          currentTotals[category] += amount;
        }

        if (
          date.getFullYear() === previousYear &&
          date.getMonth() === previousMonth &&
          date.getDate() <= currentDay
        ) {
          previousTotals[category] += amount;
        }
      });

      const totalCurrent = Object.values(currentTotals).reduce(
        (sum, amount) => sum + amount,
        0
      );

      const nextData = categories
        .map((category) => {
          const currentAmount = currentTotals[category.name];
          const previousAmount = previousTotals[category.name];
          const difference = currentAmount - previousAmount;
          const share =
            totalCurrent > 0 ? Math.round((currentAmount / totalCurrent) * 100) : 0;

          return {
            ...category,
            currentAmount,
            previousAmount,
            difference,
            share,
          };
        })
        .sort((a, b) => b.currentAmount - a.currentAmount);

      setCategoryData(nextData);
    };

    loadCategoryData();

    window.addEventListener("budgetbee:user-updated", loadCategoryData);
    window.addEventListener("storage", loadCategoryData);

    return () => {
      window.removeEventListener("budgetbee:user-updated", loadCategoryData);
      window.removeEventListener("storage", loadCategoryData);
    };
  }, []);

  const activeCategories = categoryData.filter(
    (category) => category.currentAmount > 0
  );

  const visibleCategories = showAllCategories
    ? categoryData
    : activeCategories.slice(0, 4);

  const hasHiddenCategories = categoryData.length > 4;

  const formatCompactAmount = (amount) => {
    const value = Number(amount) || 0;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: value >= 1000 ? "compact" : "standard",
      maximumFractionDigits: value >= 1000 ? 1 : 0,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTrendAmount = (amount) => {
    const value = Number(amount) || 0;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getTrendClass = (difference) => {
    if (difference > 0) {
      return "up";
    }

    if (difference < 0) {
      return "down";
    }

    return "same";
  };

  const getTrendIcon = (difference) => {
    if (difference > 0) {
      return <ArrowUp size={13} strokeWidth={2.8} />;
    }

    if (difference < 0) {
      return <ArrowDown size={13} strokeWidth={2.8} />;
    }

    return <Minus size={13} strokeWidth={2.8} />;
  };

  const getTrendText = (difference) => {
    if (difference === 0) {
      return "No change compared to last month";
    }

    return `${formatTrendAmount(
      Math.abs(difference)
    )} compared to last month`;
  };

  return (
    <section className="category-trend-chart">
      <div className="category-trend-header">
        <div>
          <span>Category analytics</span>
          <h2>Spending Breakdown</h2>
        </div>

        <div className="category-trend-actions">
          <span>
            {showAllCategories
              ? "All categories · Month to date"
              : "Top 4 active categories · Month to date"}
          </span>

          {hasHiddenCategories && (
            <button
              type="button"
              onClick={() => setShowAllCategories((current) => !current)}
            >
              {showAllCategories ? "Show less" : "Show all"}
            </button>
          )}
        </div>
      </div>

      {activeCategories.length === 0 ? (
        <div className="category-trend-empty">
          <strong>No spending yet</strong>
          <span>Your category movement will appear after transactions are added.</span>
        </div>
      ) : (
        <div className="category-trend-list">
          {visibleCategories.map((category) => {
            const trendClass = getTrendClass(category.difference);

            return (
              <article className="category-trend-row" key={category.name}>
                <div className="category-trend-main">
                  <div className="category-trend-name">
                    <span
                      className="category-trend-dot"
                      style={{ background: category.color }}
                    />
                    <div>
                      <strong>{category.name}</strong>
                      <span>{category.share}% of this month’s spending</span>
                    </div>
                  </div>

                  <div className="category-trend-values">
                    <strong>{formatCompactAmount(category.currentAmount)}</strong>
                    <span className={`category-trend-change ${trendClass}`}>
                      {getTrendIcon(category.difference)}
                      {getTrendText(category.difference)}
                    </span>
                  </div>
                </div>

                <div className="category-trend-track">
                  <div
                    className="category-trend-fill"
                    style={{
                      width: `${category.share}%`,
                      background: category.color,
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CategoryTrendChart;