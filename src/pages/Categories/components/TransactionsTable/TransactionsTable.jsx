import { Check, Pencil, Trash2, X } from "lucide-react";
import "./TransactionsTable.css";

const getPaymentLabel = (transaction) => {
    if (transaction.source === "bank") return "Bank Sync";
    return transaction.paymentMethod || "Cash";
};

const getPaymentClass = (label) => label.toLowerCase().replace(/\s+/g, "-");

const isEditableTransaction = (transaction) =>
    transaction.source !== "bank" && String(transaction.id).startsWith("manual-");

const TransactionsTable = ({
    transactions,
    selectedCategory,
    transactionTypes,
    paymentMethods,
    editingId,
    editData,
    todayDate,
    onStartEdit,
    onCancelEdit,
    onEditChange,
    onSaveEdit,
    onDeleteTransaction,
}) => {
    const handleEditAmountChange = (event) => {
        const value = event.target.value;

        if (/^\d*\.?\d{0,2}$/.test(value)) {
            onEditChange("amount", value);
        }
    };

    return (
        <div className="transactions-table-wrapper">
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Payment Method</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => {
                            const isEditing = editingId === transaction.id;
                            const paymentLabel = getPaymentLabel(transaction);
                            const canManage = isEditableTransaction(transaction);

                            return (
                                <tr key={transaction.id}>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                className="table-edit-input"
                                                type="date"
                                                max={todayDate}
                                                value={editData.date}
                                                onChange={(event) =>
                                                    onEditChange("date", event.target.value)
                                                }
                                            />
                                        ) : (
                                            transaction.date
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <select
                                                className="table-edit-input"
                                                value={editData.type}
                                                onChange={(event) =>
                                                    onEditChange("type", event.target.value)
                                                }
                                            >
                                                {transactionTypes.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            transaction.type
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <input
                                                className="table-edit-input"
                                                type="text"
                                                inputMode="decimal"
                                                value={editData.amount}
                                                onChange={handleEditAmountChange}
                                            />
                                        ) : (
                                            `$${Number(transaction.amount).toFixed(2)}`
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <input
                                                className="table-edit-input"
                                                type="text"
                                                value={editData.description}
                                                onChange={(event) =>
                                                    onEditChange("description", event.target.value)
                                                }
                                            />
                                        ) : (
                                            transaction.description
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <select
                                                className="table-edit-input"
                                                value={editData.paymentMethod}
                                                onChange={(event) =>
                                                    onEditChange("paymentMethod", event.target.value)
                                                }
                                            >
                                                {paymentMethods.map((method) => (
                                                    <option key={method} value={method}>
                                                        {method}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span
                                                className={`source-badge ${getPaymentClass(
                                                    paymentLabel
                                                )}`}
                                            >
                                                {paymentLabel}
                                            </span>
                                        )}
                                    </td>

                                    <td>
                                        {canManage && (
                                            <div className="table-actions">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="table-action-btn save"
                                                            onClick={() => onSaveEdit(transaction.id)}
                                                            aria-label="Save transaction"
                                                        >
                                                            <Check size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="table-action-btn cancel"
                                                            onClick={onCancelEdit}
                                                            aria-label="Cancel edit"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="table-action-btn edit"
                                                            onClick={() => onStartEdit(transaction)}
                                                            aria-label="Edit transaction"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="table-action-btn delete"
                                                            onClick={() => onDeleteTransaction(transaction)}
                                                            aria-label="Delete transaction"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" className="empty-row">
                                No transactions yet for {selectedCategory}.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionsTable;