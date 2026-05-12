import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./CalendarSummary.css";
import DailyLimit from "./DailyLimit/DailyLimit";
import mockTransactions from "../../../data/mock_transactions.json";
import { getTransactions, getCurrentUser } from "../../../services/storage";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { formatCurrency } from "../../../utils/currency";
import { isPastOrToday } from "../../../utils/dateFilters";

function CalendarSummary() {
  const today = new Date();
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [allTransactions, setAllTransactions] = useState([]);
  const [budget, setBudget] = useState(0);
  const [customDailyLimit, setCustomDailyLimit] = useState(() => {
    const saved = localStorage.getItem("budgetbee:dailyLimit");
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    const loadCalendarData = () => {
      const stored = getTransactions();
      const validTransactions = [...mockTransactions, ...stored].filter(
        (transaction) => isPastOrToday(transaction.date)
      );

      setAllTransactions(validTransactions);

      const user = getCurrentUser();
      setBudget(Number(user?.monthlyBudget ?? 0));
    };

    loadCalendarData();

    window.addEventListener("budgetbee:user-updated", loadCalendarData);

    return () => {
      window.removeEventListener("budgetbee:user-updated", loadCalendarData);
    };
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const recommendedDailyLimit = budget > 0 ? budget / daysInMonth : 0;
  const dailyBudgetLimit =
    customDailyLimit > 0 ? customDailyLimit : recommendedDailyLimit;

  const handleSaveDailyLimit = (value) => {
    const cleanValue = Number(value);

    if (!cleanValue || cleanValue <= 0) {
      setCustomDailyLimit(0);
      localStorage.removeItem("budgetbee:dailyLimit");
      return;
    }

    setCustomDailyLimit(cleanValue);
    localStorage.setItem("budgetbee:dailyLimit", String(cleanValue));
  };

  const getDayTotal = (day) => {
    return allTransactions
      .filter((transaction) => {
        const date = new Date(`${transaction.date}T00:00:00`);

        return (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() === day
        );
      })
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  };

  const getSpendingLevel = (amount) => {
    if (amount <= 0 || dailyBudgetLimit <= 0) {
      return "";
    }

    const usage = amount / dailyBudgetLimit;

    if (usage >= 1) {
      return "high";
    }

    if (usage >= 0.45) {
      return "medium";
    }

    return "low";
  };

  const selectedDateEnd = new Date(selectedDate);
  selectedDateEnd.setHours(23, 59, 59, 999);

  const filteredTransactions = allTransactions.filter((transaction) => {
    const date = new Date(`${transaction.date}T00:00:00`);

    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date <= selectedDateEnd
    );
  });

  const totalSpent = filteredTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );

  const remaining = budget - totalSpent;

  const selectedDayTransactions = allTransactions.filter((transaction) => {
    const date = new Date(`${transaction.date}T00:00:00`);

    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  });

  const selectedDayTotal = selectedDayTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );

  const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const goPrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentMonth(newDate);
    setSelectedDate(newDate);
  };

  const goNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentMonth(newDate);
    setSelectedDate(newDate);
  };

  return (
    <div className="calendar-summary">
      <div className="calendar-box">
        <div className="calendar-header">
          <div className="calendar-month-nav">
            <button type="button" onClick={goPrevMonth} aria-label="Previous month">
              <ChevronLeft size={17} strokeWidth={2.5} />
            </button>

            <h3>
              {currentMonth.toLocaleString("default", { month: "long" })} {year}
            </h3>

            <button type="button" onClick={goNextMonth} aria-label="Next month">
              <ChevronRight size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {daysArray.map((day) => {
            const dayTotal = getDayTotal(day);
            const spendingLevel = getSpendingLevel(dayTotal);
            const isSelected = day === selectedDate.getDate();
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={day}
                className={`calendar-day ${isSelected ? "active" : ""} ${
                  isToday ? "today" : ""
                }`}
                onClick={() => setSelectedDate(new Date(year, month, day))}
              >
                <div className="day-marker">
                  <span className="day-number">{day}</span>

                  {dayTotal > 0 && (
                    <span
                      className={`day-spending-indicator ${spendingLevel}`}
                      title={`${formatCurrency(dayTotal, currency)} spent`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span>
            <i className="low" /> Low
          </span>
          <span>
            <i className="medium" /> Medium
          </span>
          <span>
            <i className="high" /> High
          </span>
        </div>
      </div>

      <div className="summary-box">
        <h4>{selectedDate.toLocaleDateString()}</h4>

        <div className="summary-row income">
          <span>Budget</span>
          <strong>{formatCurrency(budget, currency)}</strong>
        </div>

        <div className="summary-row expenses">
          <span>Spent</span>
          <strong>{formatCurrency(totalSpent, currency)}</strong>
        </div>

        <div className="summary-row remaining">
          <span>Left</span>
          <strong>{formatCurrency(remaining, currency)}</strong>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${
                budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0
              }%`,
            }}
          />
        </div>

        <DailyLimit
          limit={dailyBudgetLimit}
          recommendedLimit={recommendedDailyLimit}
          currency={currency}
          onSave={handleSaveDailyLimit}
        />

        <div className="selected-day-total">
          <span>Total Day Spending</span>
          <strong>{formatCurrency(selectedDayTotal, currency)}</strong>
        </div>

        <div className="day-transactions">
          <h5>Transactions</h5>

          {selectedDayTransactions.length === 0 ? (
            <p>No activity for this day</p>
          ) : (
            selectedDayTransactions.map((transaction, index) => (
              <div
                key={`${transaction.id}-${transaction.date}-${index}`}
                className="day-item"
              >
                <span>{transaction.type}</span>
                <strong>{formatCurrency(transaction.amount, currency)}</strong>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarSummary;