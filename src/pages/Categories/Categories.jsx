import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import mockTransactions from "../../data/mock_transactions.json";
import { getTransactions, saveTransactions } from "../../services/storage";
import CategoryTabs from "./components/CategoryTabs/CategoryTabs";
import QuickAddTransaction from "./components/QuickAddTransaction/QuickAddTransaction";
import TransactionsTable from "./components/TransactionsTable/TransactionsTable";
import "./Categories.css";

const categoryTypes = {
  Family: ["Kids Clothes", "School Supplies", "Toys", "Pet", "Family Care"],
  Essentials: ["Groceries", "Utilities", "Internet", "Food", "Rent"],
  Lifestyle: ["Dining Out", "Shopping", "Entertainment", "Car", "Gym"],
  Education: ["Books", "Course", "Workshop", "Tuition"],
  Travel: ["Taxi", "Bus", "Flight", "Hotel", "Transport"],
  Health: ["Medical", "Dental", "Pharmacy", "Supplements", "Gym"],
  Other: ["General", "Unexpected", "Uncategorized", "Miscellaneous"],
};

const initialCategories = [
  "Family",
  "Essentials",
  "Lifestyle",
  "Education",
  "Travel",
  "Health",
  "Other",
];

const paymentMethods = ["Cash", "Apple Pay", "Google Pay", "QR Pay"];

const getTodayDate = () => new Date().toISOString().split("T")[0];

const normalizeBankTransactions = (transactions) =>
  transactions.map((transaction) => ({
    ...transaction,
    source: "bank",
    paymentMethod: "Bank Sync",
  }));

const Categories = () => {
  const navigate = useNavigate();

  const [categories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(initialCategories[0]);
  const [transactions, setTransactions] = useState([]);
  const [newTransactionType, setNewTransactionType] = useState(
    categoryTypes[initialCategories[0]][0]
  );
  const [newTransactionAmount, setNewTransactionAmount] = useState("");
  const [newTransactionDescription, setNewTransactionDescription] = useState("");
  const [newTransactionDate, setNewTransactionDate] = useState(getTodayDate());
  const [newPaymentMethod, setNewPaymentMethod] = useState("Cash");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const stored = getTransactions();
    const bankTransactions = normalizeBankTransactions(mockTransactions);

    setTransactions([...bankTransactions, ...stored]);
  }, []);

  useEffect(() => {
    setNewTransactionType(categoryTypes[selectedCategory][0]);
    setNewTransactionDate(getTodayDate());
    setNewPaymentMethod("Cash");
  }, [selectedCategory]);

  const filteredTransactions = transactions
    .filter((transaction) => transaction.category === selectedCategory)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const syncStoredTransactions = (updatedStoredTransactions) => {
    const bankTransactions = normalizeBankTransactions(mockTransactions);

    saveTransactions(updatedStoredTransactions);
    setTransactions([...bankTransactions, ...updatedStoredTransactions]);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleAddTransaction = () => {
    if (!newTransactionAmount) {
      alert("Please enter amount");
      return;
    }

    const amount = Number(newTransactionAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const storedTransactions = getTransactions();

    const newTransaction = {
      id: `manual-${Date.now()}`,
      date: newTransactionDate,
      category: selectedCategory,
      type: newTransactionType,
      amount,
      description:
        newTransactionDescription.trim() ||
        `${newTransactionType} added to ${selectedCategory}`,
      source: "manual",
      paymentMethod: newPaymentMethod,
      createdAt: Date.now(),
    };

    const updatedStoredTransactions = [...storedTransactions, newTransaction];

    syncStoredTransactions(updatedStoredTransactions);

    setNewTransactionType(categoryTypes[selectedCategory][0]);
    setNewTransactionAmount("");
    setNewTransactionDescription("");
    setNewTransactionDate(getTodayDate());
    setNewPaymentMethod("Cash");
  };

  const handleStartEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditData({
      type: transaction.type,
      amount: String(transaction.amount),
      date: transaction.date,
      description: transaction.description || "",
      paymentMethod: transaction.paymentMethod || "Cash",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  };

  const handleSaveEdit = (transactionId) => {
    const amount = Number(editData.amount);

    if (!editData.amount || Number.isNaN(amount) || amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const storedTransactions = getTransactions();

    const updatedStoredTransactions = storedTransactions.map((transaction) =>
      transaction.id === transactionId
        ? {
            ...transaction,
            type: editData.type,
            amount,
            date: editData.date,
            description:
              editData.description.trim() ||
              `${editData.type} added to ${transaction.category}`,
            paymentMethod: editData.paymentMethod,
            updatedAt: Date.now(),
          }
        : transaction
    );

    syncStoredTransactions(updatedStoredTransactions);
    handleCancelEdit();
  };

  const handleRequestDelete = (transaction) => {
    setDeleteTarget(transaction);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const storedTransactions = getTransactions();

    const updatedStoredTransactions = storedTransactions.filter(
      (transaction) => transaction.id !== deleteTarget.id
    );

    syncStoredTransactions(updatedStoredTransactions);

    if (editingId === deleteTarget.id) {
      handleCancelEdit();
    }

    setDeleteTarget(null);
  };

  return (
    <div className="categories-page">
      <div className="categories-shell">
        <div className="categories-header">
          <p className="categories-label">Spending Control</p>
          <h2 className="page-title">Categories</h2>
          <p className="categories-subtitle">
            Add spending by category and keep every transaction organized.
          </p>
        </div>

        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <section className="transactions-section">
          <div className="transactions-top-bar">
            <div className="transactions-header">
              <div>
                <span className="section-kicker">Quick Add</span>
                <h3>{selectedCategory} Transactions</h3>
                <p>
                  The selected category is applied automatically. Change the date
                  only when recording older spending.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="back-button-categories"
              onClick={handleBack}
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
          </div>

          <QuickAddTransaction
            selectedCategory={selectedCategory}
            transactionTypes={categoryTypes[selectedCategory]}
            paymentMethods={paymentMethods}
            newTransactionType={newTransactionType}
            newTransactionAmount={newTransactionAmount}
            newTransactionDate={newTransactionDate}
            newTransactionDescription={newTransactionDescription}
            newPaymentMethod={newPaymentMethod}
            todayDate={getTodayDate()}
            onTypeChange={setNewTransactionType}
            onAmountChange={setNewTransactionAmount}
            onDateChange={setNewTransactionDate}
            onDescriptionChange={setNewTransactionDescription}
            onPaymentMethodChange={setNewPaymentMethod}
            onAddTransaction={handleAddTransaction}
          />

          <div className="table-header-row">
            <div>
              <h4>Transaction History</h4>
              <p>
                {filteredTransactions.length} records in {selectedCategory}
              </p>
            </div>
          </div>

          <TransactionsTable
            transactions={filteredTransactions}
            selectedCategory={selectedCategory}
            transactionTypes={categoryTypes[selectedCategory]}
            paymentMethods={paymentMethods}
            editingId={editingId}
            editData={editData}
            todayDate={getTodayDate()}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onEditChange={handleEditChange}
            onSaveEdit={handleSaveEdit}
            onDeleteTransaction={handleRequestDelete}
          />
        </section>
      </div>

      {deleteTarget && (
        <div className="category-delete-overlay">
          <div className="category-delete-modal">
            <button
              type="button"
              className="category-delete-close"
              onClick={handleCancelDelete}
            >
              ×
            </button>

            <h3>Delete this transaction?</h3>

            <p>
              This will permanently remove this transaction from your BudgetBee
              workspace. This action cannot be undone.
            </p>

            <div className="category-delete-actions">
              <button
                type="button"
                className="category-delete-confirm"
                onClick={handleConfirmDelete}
              >
                Yes, Delete
              </button>

              <button
                type="button"
                className="category-delete-cancel"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;