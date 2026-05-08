import React from "react";
import { Edit3, Trash2, Wallet } from "lucide-react";
import { formatCurrency } from "../../../../utils/currency.js";
import "./IncomeSourceCard.css";

function IncomeSourceCard({ income, currency, isDemo, onEdit, onDelete }) {
  return (
    <article className="income-source-card">
      <div className="income-source-top">
        <div className="income-source-icon">
          <Wallet size={20} />
        </div>

        <span className="income-category-badge">
          {isDemo ? "Demo Income" : "Additional Income"}
        </span>
      </div>

      <h3>{income.companyName}</h3>
      <p>{income.description || "No notes added"}</p>

      <div className="income-card-details">
        <span>{income.workType}</span>
        <span>{income.workMode}</span>
        <span>{income.paymentFrequency}</span>
      </div>

      <div className="income-card-footer">
        <strong>{formatCurrency(income.monthlyIncome, currency)}</strong>

        <div className="income-card-actions">
          {!isDemo && (
            <>
              <button
                type="button"
                className="income-edit-btn"
                onClick={() => onEdit(income)}
                aria-label={`Edit ${income.companyName}`}
              >
                <Edit3 size={15} />
              </button>

              <button
                type="button"
                className="income-delete-btn"
                onClick={() => onDelete(income.id)}
                aria-label={`Delete ${income.companyName}`}
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default IncomeSourceCard;