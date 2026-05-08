import React from "react";
import { formatCurrency } from "../../../../utils/currency.js";
import "./IncomeSummaryCards.css";

function IncomeSummaryCards({
  totalMonthlyIncome,
  mainMonthlyIncome,
  additionalMonthlyIncome,
  currency,
}) {
  return (
    <section className="income-summary-grid">
      <article className="income-summary-card">
        <span>Total Monthly Income</span>
        <strong>{formatCurrency(totalMonthlyIncome, currency)}</strong>
      </article>

      <article className="income-summary-card">
        <span>Primary Income</span>
        <strong>{formatCurrency(mainMonthlyIncome, currency)}</strong>
      </article>

      <article className="income-summary-card">
        <span>Additional Income</span>
        <strong>{formatCurrency(additionalMonthlyIncome, currency)}</strong>
      </article>
    </section>
  );
}

export default IncomeSummaryCards;