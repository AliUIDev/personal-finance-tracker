import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import IncomeSourceCard from "../IncomeSourceCard/IncomeSourceCard.jsx";
import "./AdditionalIncomeSection.css";

const workTypes = [
  "Freelance",
  "Part-time",
  "Gig/Task-based",
  "Remote/Online job",
  "Passive Income",
];

const workModes = ["Offline", "Online", "Hybrid"];
const paymentFrequencies = ["Weekly", "Monthly", "Per Project"];

function AdditionalIncomeSection({
  additionalIncome,
  emptyAdditionalIncome,
  currency,
  activeSources,
  isUsingDemoData,
  onSaveAdditionalIncome,
  onDeleteAdditionalIncome,
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyAdditionalIncome);

  useEffect(() => {
    if (!isFormOpen) {
      setEditingId(null);
      setFormData(emptyAdditionalIncome);
    }
  }, [isFormOpen, emptyAdditionalIncome]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSaveAdditionalIncome(formData, editingId);
    setIsFormOpen(false);
  }

  function handleEdit(income) {
    setEditingId(income.id);
    setFormData({
      companyName: income.companyName || "",
      workType: income.workType || "",
      workMode: income.workMode || "",
      monthlyIncome: income.monthlyIncome || "",
      paymentFrequency: income.paymentFrequency || "",
      startDate: income.startDate || "",
      endDate: income.endDate || "",
      description: income.description || "",
    });
    setIsFormOpen(true);
  }

  return (
    <section className="income-panel additional-income-section">
      <div className="income-section-heading">
        <div>
          <p className="income-section-kicker">Additional Income</p>
          <h2>Your Extra Income Sources</h2>
          <p>
            Keep this section clean unless you earn from freelance work, side
            jobs, passive income, or project-based payments.
          </p>
        </div>

        <span className="income-section-pill">{activeSources} active</span>
      </div>

      {isFormOpen && (
        <form className="income-form additional-income-form" onSubmit={handleSubmit}>
          <div className="additional-income-form-top">
            <strong>
              {editingId ? "Edit Additional Income" : "Add Additional Income"}
            </strong>

            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close additional income form"
            >
              <X size={18} />
            </button>
          </div>

          <label>
            Company / Platform Name
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Upwork, Fiverr, Airbnb..."
              required
            />
          </label>

          <label>
            Income Type
            <select
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              required
            >
              <option value="">Select income type</option>
              {workTypes.map((type) => (
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
              placeholder="500"
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
              placeholder="Describe work details or client notes..."
            />
          </label>

          <div className="income-form-actions">
            <button type="submit" className="income-primary-btn">
              <Plus size={18} />
              {editingId ? "Save Changes" : "Add Income Source"}
            </button>

            <button
              type="button"
              className="income-ghost-btn"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!isFormOpen && (
        <>
          <button
            type="button"
            className="additional-income-open-btn"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus size={18} />
            Add Additional Income
          </button>

          <div className="additional-income-grid">
            {additionalIncome.length > 0 ? (
              additionalIncome.map((income) => (
                <IncomeSourceCard
                  key={income.id}
                  income={income}
                  currency={currency}
                  isDemo={isUsingDemoData}
                  onEdit={handleEdit}
                  onDelete={onDeleteAdditionalIncome}
                />
              ))
            ) : (
              <div className="additional-income-empty">
                <h3>No additional income added yet</h3>
                <p>
                  Add side income only if you have freelance work, passive
                  income, or project-based payments.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default AdditionalIncomeSection;