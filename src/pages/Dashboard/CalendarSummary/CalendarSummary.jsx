import { useState, useEffect } from "react";
import "./CalendarSummary.css";
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

  const formatDayAmount = (amount) => {
    const value = Number(amount) || 0;

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
    }

    return Math.round(value).toString();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

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
          <button onClick={goPrevMonth}>←</button>

          <h3>
            {currentMonth.toLocaleString("default", { month: "long" })} {year}
          </h3>

          <button onClick={goNextMonth}>→</button>
        </div>

        <div className="calendar-grid">
          {daysArray.map((day) => {
            const isSelected = day === selectedDate.getDate();

            const dayTotal = allTransactions
              .filter((transaction) => {
                const date = new Date(`${transaction.date}T00:00:00`);

                return (
                  date.getFullYear() === year &&
                  date.getMonth() === month &&
                  date.getDate() === day
                );
              })
              .reduce(
                (sum, transaction) => sum + Number(transaction.amount || 0),
                0
              );

            return (
              <div
                key={day}
                className={`calendar-day ${isSelected ? "active" : ""} ${day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear()
                    ? "today"
                    : ""
                  }`}
                onClick={() => setSelectedDate(new Date(year, month, day))}
              >
                <div className="day-number">{day}</div>

                {dayTotal > 0 && (
                  <div className="day-amount">
                    {formatDayAmount(dayTotal)}
                  </div>
                )}
              </div>
            );
          })}
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
              width: `${budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0
                }%`,
            }}
          />
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