import { Target, TrendingDown, Wallet } from "lucide-react";
import "./BudgetCard.css";

const icons = {
  budget: Target,
  spent: TrendingDown,
  remaining: Wallet,
};

const BudgetCard = ({ title, value, type, featured = false }) => {
  const Icon = icons[type] || Wallet;

  return (
    <div
      className={`planning-budget-card ${type} ${
        featured ? "featured-card" : ""
      }`}
    >
      <div className="planning-budget-card-icon">
        <Icon size={20} />
      </div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
};

export default BudgetCard;