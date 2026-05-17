import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import "./CurrencySelect.css";

const CurrencySelect = ({
  label = "Currency",
  value,
  options = [],
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const wrapperRef = useRef(null);

  const selectedCurrency =
    options.find((currency) => currency.code === value) || options[0];

  const filteredCurrencies = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    if (!search) return options;

    return options.filter(
      (currency) =>
        currency.code.toLowerCase().includes(search) ||
        currency.name.toLowerCase().includes(search)
    );
  }, [options, searchValue]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchValue("");
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchValue("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const getFlagUrl = (flagCode) => {
    return `https://flagcdn.com/w80/${flagCode}.png`;
  };

  const handleSelect = (currencyCode) => {
    onChange(currencyCode);
    setIsOpen(false);
    setSearchValue("");
  };

  return (
    <div className="currency-select-wrapper" ref={wrapperRef}>
      <span className="currency-select-label">{label}</span>

      <button
        type="button"
        className={`currency-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span className="currency-current">
          <span className="currency-flag">
            <img
              src={getFlagUrl(selectedCurrency.flag)}
              alt=""
              loading="lazy"
            />
          </span>

          <span className="currency-current-text">
            <strong>{selectedCurrency.code}</strong>
            <small>{selectedCurrency.name}</small>
          </span>
        </span>

        <ChevronDown size={18} className="currency-chevron" />
      </button>

      {isOpen && (
        <div className="currency-select-dropdown">
          <div className="currency-search-box">
            <Search size={17} />
            <input
              className="currency-search-input"
              type="text"
              placeholder="Search currency..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              autoFocus
            />
          </div>

          <div className="currency-options-list">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  className={`currency-option ${
                    value === currency.code ? "active" : ""
                  }`}
                  onClick={() => handleSelect(currency.code)}
                >
                  <span className="currency-option-main">
                    <span className="currency-flag">
                      <img
                        src={getFlagUrl(currency.flag)}
                        alt=""
                        loading="lazy"
                      />
                    </span>

                    <span className="currency-option-code">
                      {currency.code}
                    </span>

                    <span className="currency-option-name">
                      {currency.name}
                    </span>
                  </span>

                  {value === currency.code && <Check size={17} />}
                </button>
              ))
            ) : (
              <div className="currency-empty-state">No currency found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;