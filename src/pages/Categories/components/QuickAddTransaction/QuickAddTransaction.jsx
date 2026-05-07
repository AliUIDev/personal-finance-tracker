import "./QuickAddTransaction.css";

const QuickAddTransaction = ({
    transactionTypes,
    paymentMethods,
    newTransactionType,
    newTransactionAmount,
    newTransactionDate,
    newTransactionDescription,
    newPaymentMethod,
    todayDate,
    onTypeChange,
    onAmountChange,
    onDateChange,
    onDescriptionChange,
    onPaymentMethodChange,
    onAddTransaction,
}) => {
    const handleAmountChange = (event) => {
        const value = event.target.value;

        if (/^\d*\.?\d{0,2}$/.test(value)) {
            onAmountChange(value);
        }
    };

    return (
        <div className="quick-add-card">
            <div className="add-transaction-form">
                <label htmlFor="transaction-type">
                    <span>Type</span>

                    <select
                        id="transaction-type"
                        name="transactionType"
                        value={newTransactionType}
                        onChange={(event) => onTypeChange(event.target.value)}
                    >
                        {transactionTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </label>

                <label htmlFor="transaction-amount">
                    <span>Amount</span>

                    <input
                        id="transaction-amount"
                        name="transactionAmount"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={newTransactionAmount}
                        placeholder="$0.00"
                        onChange={handleAmountChange}
                    />
                </label>

                <label htmlFor="transaction-date">
                    <span>Date</span>

                    <input
                        id="transaction-date"
                        name="transactionDate"
                        type="date"
                        max={todayDate}
                        value={newTransactionDate}
                        onChange={(event) => onDateChange(event.target.value)}
                    />
                </label>

                <label htmlFor="transaction-payment">
                    <span>Payment</span>

                    <select
                        id="transaction-payment"
                        name="transactionPayment"
                        value={newPaymentMethod}
                        onChange={(event) => onPaymentMethodChange(event.target.value)}
                    >
                        {paymentMethods.map((method) => (
                            <option key={method} value={method}>
                                {method}
                            </option>
                        ))}
                    </select>
                </label>

                <label
                    htmlFor="transaction-description"
                    className="description-field"
                >
                    <span>Description</span>

                    <input
                        id="transaction-description"
                        name="transactionDescription"
                        type="text"
                        value={newTransactionDescription}
                        placeholder="Optional note"
                        onChange={(event) => onDescriptionChange(event.target.value)}
                    />
                </label>

                <button
                    type="button"
                    className="add-category-btn"
                    onClick={onAddTransaction}
                >
                    Add
                </button>
            </div>
        </div>
    );
};

export default QuickAddTransaction;