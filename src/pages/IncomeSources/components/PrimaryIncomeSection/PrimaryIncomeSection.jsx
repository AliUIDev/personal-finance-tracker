import React, { useEffect, useState } from "react";
import { Edit3, Plus } from "lucide-react";
import { formatCurrency } from "../../../../utils/currency.js";
import "./PrimaryIncomeSection.css";

const primaryIncomeTypes = [
  "Salary",
  "Contract",
  "Business Income",
  "Retainer",
  "Other Primary Income",
];

const workModes = ["Offline", "Online", "Hybrid"];
const paymentFrequencies = ["Weekly", "Monthly", "Per Project"];

function PrimaryIncomeSection({
  primaryIncome,
  emptyPrimaryIncome,
  currency,
  onSavePrimaryIncome,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyPrimaryIncome);

  useEffect(() => {
    if (primaryIncome) {
      setFormData({
        sourceName: primaryIncome.sourceName || "",
        incomeType: primaryIncome.incomeType || "",
        workMode: primaryIncome.workMode || "",
        monthlyIncome: primaryIncome.monthlyIncome || "",
        paymentFrequency: primaryIncome.paymentFrequency || "",
        startDate: primaryIncome.startDate || "",
        endDate: primaryIncome.endDate || "",
        description: primaryIncome.description || "",
      });
    } else {
      setFormData(emptyPrimaryIncome);
    }
  }, [primaryIncome, emptyPrimaryIncome]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSavePrimaryIncome(formData);
    setIsEditing(false);
  }

  function handleCancelEdit() {
    if (primaryIncome) {
      setFormData({
        sourceName: primaryIncome.sourceName || "",
        incomeType: primaryIncome.incomeType || "",
        workMode: primaryIncome.workMode || "",
        monthlyIncome: primaryIncome.monthlyIncome || "",
        paymentFrequency: primaryIncome.paymentFrequency || "",
        startDate: primaryIncome.startDate || "",
        endDate: primaryIncome.endDate || "",
        description: primaryIncome.description || "",
      });
    }

    setIsEditing(false);
  }

  const hasPrimaryIncome = Boolean(primaryIncome);

  return (
    <section className="income-panel primary-income-section">
      <div className="income-section-heading">
        <div>
          <p className="income-section-kicker">Primary Income</p>
          <h2>{hasPrimaryIncome ? "Main Work Income" : "Set Main Income"}</h2>
          <p>
            Start with your stable monthly income. This becomes the base for
            budgeting, planning, and savings calculations.
          </p>
        </div>

        {hasPrimaryIncome && !isEditing && (
          <button
            type="button"
            className="income-secondary-btn"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 size={17} />
            Edit Primary
          </button>
        )}
      </div>

      {hasPrimaryIncome && !isEditing ? (
        <article className="primary-income-card">
          <div className="primary-income-card-content">
            <span>Current Primary Income</span>
            <h3>{primaryIncome.sourceName}</h3>
            <p>{primaryIncome.description || "No notes added"}</p>
          </div>

          <div className="primary-income-meta">
            <span>{primaryIncome.incomeType}</span>
            <span>{primaryIncome.workMode}</span>
            <span>{primaryIncome.paymentFrequency}</span>
          </div>

          <strong>{formatCurrency(primaryIncome.monthlyIncome, currency)}</strong>
        </article>
      ) : (
        <form className="income-form" onSubmit={handleSubmit}>
          <label>
            Company / Income Source
            <input
              type="text"
              name="sourceName"
              value={formData.sourceName}
              onChange={handleChange}
              placeholder="Company, employer, business..."
              required
            />
          </label>

          <label>
            Income Type
            <select
              name="incomeType"
              value={formData.incomeType}
              onChange={handleChange}
              required
            >
              <option value="">Select income type</option>
              {primaryIncomeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Work Mode
            <select
              name="workMode"
              value={formData.workMode}
              onChange={handleChange}
              required
            >
              <option value="">Select work mode</option>
              {workModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <label>
            Monthly Income
            <input
              type="number"
              name="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={handleChange}
              placeholder="9000"
              min="0"
              required
            />
          </label>

          <label>
            Payment Schedule
            <select
              name="paymentFrequency"
              value={formData.paymentFrequency}
              onChange={handleChange}
              required
            >
              <option value="">Select payment schedule</option>
              {paymentFrequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </select>
          </label>

          <label>
            Start Date
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            End Date
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </label>

          <label className="income-form-wide">
            Notes
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={150}
              placeholder="Add role, salary notes, contract details..."
            />
          </label>

          <div className="income-form-actions">
            <button type="submit" className="income-primary-btn">
              <Plus size={18} />
              {hasPrimaryIncome ? "Save Primary Income" : "Set Primary Income"}
            </button>

            {hasPrimaryIncome && (
              <button
                type="button"
                className="income-ghost-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}

export default PrimaryIncomeSection;