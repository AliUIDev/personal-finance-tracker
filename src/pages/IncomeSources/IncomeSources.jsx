import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser, setCurrentUser } from "../../services/storage.js";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import mockMainIncomeSources from "../../data/mockMainIncomeSources.json";
import mockAdditionalIncome from "../../data/mockAdditionalIncome.json";
import IncomeSummaryCards from "./components/IncomeSummaryCards/IncomeSummaryCards.jsx";
import PrimaryIncomeSection from "./components/PrimaryIncomeSection/PrimaryIncomeSection.jsx";
import AdditionalIncomeSection from "./components/AdditionalIncomeSection/AdditionalIncomeSection.jsx";
import "./IncomeSources.css";

const emptyPrimaryIncome = {
  sourceName: "",
  incomeType: "",
  workMode: "",
  monthlyIncome: "",
  paymentFrequency: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptyAdditionalIncome = {
  companyName: "",
  workType: "",
  workMode: "",
  monthlyIncome: "",
  paymentFrequency: "",
  startDate: "",
  endDate: "",
  description: "",
};

function IncomeSources() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const currency = currentUser?.currency || "USD";

  const [primaryIncome, setPrimaryIncome] = useState(null);
  const [additionalIncome, setAdditionalIncome] = useState([]);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  useEffect(() => {
    const storedUser = getCurrentUser();
    const currentUserId = storedUser?.id || "default";

    const userMainIncome = mockMainIncomeSources.find(
      (income) => income.userId === currentUserId
    );

    const userAdditionalIncome = mockAdditionalIncome.filter(
      (income) => income.userId === currentUserId
    );

    const defaultMainIncome = mockMainIncomeSources.find(
      (income) => income.userId === "default"
    );

    const defaultAdditionalIncome = mockAdditionalIncome.filter(
      (income) => income.userId === "default"
    );

    const hasSavedPrimaryIncome = Boolean(storedUser?.primaryIncome);
    const hasSavedAdditionalIncome = Array.isArray(storedUser?.additionalIncome);

    const selectedPrimaryIncome = hasSavedPrimaryIncome
      ? storedUser.primaryIncome
      : userMainIncome || defaultMainIncome || null;

    const selectedAdditionalIncome = hasSavedAdditionalIncome
      ? storedUser.additionalIncome
      : userAdditionalIncome.length > 0
        ? userAdditionalIncome
        : defaultAdditionalIncome;

    setPrimaryIncome(selectedPrimaryIncome);
    setAdditionalIncome(selectedAdditionalIncome);
    setIsUsingDemoData(!hasSavedPrimaryIncome && !hasSavedAdditionalIncome);
  }, []);

  function syncIncomeData(nextPrimaryIncome, nextAdditionalIncome, nextDemoState) {
    const user = getCurrentUser() || {};

    setCurrentUser({
      ...user,
      primaryIncome: nextPrimaryIncome,
      mainIncomeSources: nextPrimaryIncome ? [nextPrimaryIncome] : [],
      additionalIncome: nextAdditionalIncome,
    });

    setPrimaryIncome(nextPrimaryIncome);
    setAdditionalIncome(nextAdditionalIncome);
    setIsUsingDemoData(nextDemoState);

    window.dispatchEvent(new Event("budgetbee:user-updated"));
  }

  function handleSavePrimaryIncome(formData) {
    const user = getCurrentUser() || {};
    const nextPrimaryIncome = {
      ...formData,
      id: primaryIncome?.id || Date.now(),
      userId: user.id || "default",
      monthlyIncome: Number(formData.monthlyIncome || 0),
    };

    const nextAdditionalIncome = isUsingDemoData ? [] : additionalIncome;

    syncIncomeData(nextPrimaryIncome, nextAdditionalIncome, false);
  }

  function handleSaveAdditionalIncome(formData, editingId) {
    const user = getCurrentUser() || {};
    const cleanAdditionalIncome = isUsingDemoData ? [] : additionalIncome;

    const nextIncome = {
      ...formData,
      id: editingId || Date.now(),
      userId: user.id || "default",
      monthlyIncome: Number(formData.monthlyIncome || 0),
    };

    const nextAdditionalIncome = editingId
      ? cleanAdditionalIncome.map((income) =>
        income.id === editingId ? nextIncome : income
      )
      : [...cleanAdditionalIncome, nextIncome];

    const nextPrimaryIncome = isUsingDemoData ? null : primaryIncome;

    syncIncomeData(nextPrimaryIncome, nextAdditionalIncome, false);
  }

  function handleDeleteAdditionalIncome(id) {
    const nextAdditionalIncome = additionalIncome.filter(
      (income) => income.id !== id
    );

    syncIncomeData(primaryIncome, nextAdditionalIncome, false);
  }

  const mainMonthlyIncome = Number(primaryIncome?.monthlyIncome || 0);

  const additionalMonthlyIncome = useMemo(() => {
    return additionalIncome.reduce(
      (total, income) => total + Number(income.monthlyIncome || 0),
      0
    );
  }, [additionalIncome]);

  const totalMonthlyIncome = mainMonthlyIncome + additionalMonthlyIncome;

  const activeAdditionalSources = useMemo(() => {
    return additionalIncome.filter((income) => !income.endDate).length;
  }, [additionalIncome]);

  return (
    <main className="income-page">
      <section className="income-shell">
        <button
          type="button"
          className="income-back-btn"
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={22} strokeWidth={2.4} />
        </button>

        <header className="income-header">
          <p className="income-label">Earnings Overview</p>
          <h1>
            Income <span>Sources</span>
          </h1>
          <p>
            Set your primary income first, then add freelance, side work, or
            passive income only when you need it.
          </p>
        </header>

        {isUsingDemoData && (
          <div className="income-demo-notice">
            Demo income is shown for preview. Add your own income to personalize
            this page.
          </div>
        )}

        <IncomeSummaryCards
          totalMonthlyIncome={totalMonthlyIncome}
          mainMonthlyIncome={mainMonthlyIncome}
          additionalMonthlyIncome={additionalMonthlyIncome}
          currency={currency}
        />

        <PrimaryIncomeSection
          primaryIncome={primaryIncome}
          emptyPrimaryIncome={emptyPrimaryIncome}
          currency={currency}
          onSavePrimaryIncome={handleSavePrimaryIncome}
        />

        <AdditionalIncomeSection
          additionalIncome={additionalIncome}
          emptyAdditionalIncome={emptyAdditionalIncome}
          currency={currency}
          activeSources={activeAdditionalSources}
          isUsingDemoData={isUsingDemoData}
          onSaveAdditionalIncome={handleSaveAdditionalIncome}
          onDeleteAdditionalIncome={handleDeleteAdditionalIncome}
        />
      </section>
    </main>
  );
}

export default IncomeSources;