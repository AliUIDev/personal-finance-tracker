import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getAllTransactions } from "../../../services/storage";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { formatCurrency } from "../../../utils/currency";
import { isPastOrToday } from "../../../utils/dateFilters";
import "./SpendingTrendChart.css";

function SpendingTrendChart() {
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const allTransactions = getAllTransactions().filter((transaction) =>
    isPastOrToday(transaction.date)
  );

  const formatCompactCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(value) || 0);
  };

  const chartData = useMemo(() => {
    const monthlyMap = allTransactions.reduce((acc, transaction) => {
      const date = new Date(`${transaction.date}T00:00:00`);
      if (Number.isNaN(date.getTime())) return acc;

      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;

      if (!acc[key]) {
        acc[key] = {
          key,
          year,
          month,
          monthLabel: date.toLocaleString("en-US", { month: "short" }),
          fullMonthLabel: date.toLocaleString("en-US", { month: "long" }),
          expenses: 0,
        };
      }

      acc[key].expenses += Number(transaction.amount) || 0;
      return acc;
    }, {});

    return Object.values(monthlyMap)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
      .slice(-6)
      .map((item) => ({
        month: item.monthLabel,
        fullMonth: item.fullMonthLabel,
        expenses: Number(item.expenses.toFixed(2)),
      }));
  }, [allTransactions]);

  const hasChartData = chartData.length > 0;

  const currentMonthData = chartData[chartData.length - 1];
  const previousMonthData = chartData[chartData.length - 2];

  const currentSpending = currentMonthData?.expenses || 0;
  const previousSpending = previousMonthData?.expenses || 0;
  const spendingDifference = currentSpending - previousSpending;
  const isSpendingUp = spendingDifference > 0;
  const isSpendingDown = spendingDifference < 0;

  const highestMonth = hasChartData
    ? chartData.reduce((highest, item) =>
        item.expenses > highest.expenses ? item : highest
      )
    : null;

  const averageSpending = hasChartData
    ? chartData.reduce((sum, item) => sum + item.expenses, 0) / chartData.length
    : 0;

  const maxExpenses = hasChartData
    ? Math.max(...chartData.map((item) => item.expenses), 0)
    : 0;

  const roundedMax =
    maxExpenses > 0 ? Math.ceil(maxExpenses / 1000) * 1000 : 1000;

  const tickStep =
    roundedMax <= 4000 ? 1000 : Math.ceil(roundedMax / 4 / 1000) * 1000;

  const yAxisTicks = [0, tickStep, tickStep * 2, tickStep * 3, tickStep * 4];

  const insightText = !previousMonthData
    ? "Tracking will become more useful after another month of spending data."
    : isSpendingDown
    ? `Spending is down ${formatCurrency(
        Math.abs(spendingDifference),
        currency
      )} compared to ${previousMonthData.fullMonth}.`
    : isSpendingUp
    ? `Spending is up ${formatCurrency(
        Math.abs(spendingDifference),
        currency
      )} compared to ${previousMonthData.fullMonth}.`
    : `Spending stayed the same compared to ${previousMonthData.fullMonth}.`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="spending-trend-tooltip">
        <p className="spending-trend-tooltip-month">{label}</p>
        <p>{formatCurrency(payload[0].value, currency)} spent</p>
      </div>
    );
  };

  return (
    <div className="spending-trend-chart">
      <div className="spending-trend-header">
        <div>
          <span className="spending-trend-eyebrow">Spending analytics</span>
          <h2>Monthly Spending Trend</h2>
          <p>Track how your expenses move across recent months.</p>
        </div>

        {hasChartData && (
          <div className="spending-trend-current">
            <span>{currentMonthData.fullMonth}</span>
            <strong>{formatCurrency(currentSpending, currency)}</strong>
          </div>
        )}
      </div>

      {!hasChartData ? (
        <div className="spending-trend-empty">No transaction data yet</div>
      ) : (
        <>
          <div className="spending-trend-insights">
            <div className="spending-trend-insight main">
              <span>Month change</span>
              <strong
                className={
                  isSpendingUp
                    ? "negative"
                    : isSpendingDown
                    ? "positive"
                    : "neutral"
                }
              >
                {isSpendingUp && <TrendingUp size={16} />}
                {isSpendingDown && <TrendingDown size={16} />}
                {!isSpendingUp && !isSpendingDown && <Minus size={16} />}
                {previousMonthData
                  ? formatCurrency(Math.abs(spendingDifference), currency)
                  : "Not enough data"}
              </strong>
            </div>

            <div className="spending-trend-insight">
              <span>Average</span>
              <strong>{formatCurrency(averageSpending, currency)}</strong>
            </div>

            <div className="spending-trend-insight">
              <span>Highest month</span>
              <strong>
                {highestMonth.fullMonth} ·{" "}
                {formatCompactCurrency(highestMonth.expenses)}
              </strong>
            </div>
          </div>

          <div className="spending-trend-chart-inner" tabIndex={-1}>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 310}>
              <AreaChart
                data={chartData}
                accessibilityLayer={false}
                margin={
                  isMobile
                    ? { top: 18, right: 18, left: 0, bottom: 8 }
                    : { top: 22, right: 26, left: 0, bottom: 12 }
                }
              >
                <defs>
                  <linearGradient
                    id="spendingTrendGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
                    <stop offset="58%" stopColor="#2563eb" stopOpacity={0.07} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#e8edf3"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  padding={
                    isMobile ? { left: 18, right: 18 } : { left: 28, right: 28 }
                  }
                  tick={{
                    fill: "#64748b",
                    fontSize: isMobile ? 11 : 12,
                    fontWeight: 600,
                  }}
                  interval={0}
                />

                <YAxis
                  domain={[0, yAxisTicks[yAxisTicks.length - 1]]}
                  ticks={yAxisTicks}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={isMobile ? 8 : 12}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: isMobile ? 11 : 12,
                    fontWeight: 600,
                  }}
                  tickFormatter={formatCompactCurrency}
                  width={isMobile ? 44 : 58}
                />

                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#2563eb"
                  strokeWidth={isMobile ? 2.5 : 3}
                  fill="url(#spendingTrendGradient)"
                  dot={{
                    r: isMobile ? 3 : 4,
                    stroke: "#2563eb",
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                  activeDot={{
                    r: isMobile ? 5 : 6,
                    stroke: "#ffffff",
                    strokeWidth: 3,
                    fill: "#2563eb",
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="spending-trend-footer">
            <span>{insightText}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default SpendingTrendChart;