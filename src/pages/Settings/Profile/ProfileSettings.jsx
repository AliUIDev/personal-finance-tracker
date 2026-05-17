import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Camera, Save } from "lucide-react";
import {
  getCurrentUser,
  setCurrentUser,
  getUsers,
  saveUsers,
  clearCurrentUser,
} from "../../../services/storage";
import UserAvatar from "../../../components/UserAvatar/UserAvatar";
import CurrencySelect from "./components/CurrencySelect/CurrencySelect";
import DangerZone from "./components/DangerZone/DangerZone";
import "./ProfileSettings.css";

const currencies = [
  { code: "USD", name: "US Dollar", flag: "us" },
  { code: "EUR", name: "Euro", flag: "eu" },
  { code: "GBP", name: "British Pound", flag: "gb" },
  { code: "JPY", name: "Japanese Yen", flag: "jp" },
  { code: "CNY", name: "Chinese Yuan", flag: "cn" },
  { code: "KRW", name: "South Korean Won", flag: "kr" },
  { code: "CAD", name: "Canadian Dollar", flag: "ca" },
  { code: "AUD", name: "Australian Dollar", flag: "au" },
  { code: "CHF", name: "Swiss Franc", flag: "ch" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "hk" },
  { code: "SGD", name: "Singapore Dollar", flag: "sg" },
  { code: "NZD", name: "New Zealand Dollar", flag: "nz" },
  { code: "SEK", name: "Swedish Krona", flag: "se" },
  { code: "NOK", name: "Norwegian Krone", flag: "no" },
  { code: "DKK", name: "Danish Krone", flag: "dk" },
  { code: "PLN", name: "Polish Zloty", flag: "pl" },
  { code: "CZK", name: "Czech Koruna", flag: "cz" },
  { code: "HUF", name: "Hungarian Forint", flag: "hu" },
  { code: "RON", name: "Romanian Leu", flag: "ro" },
  { code: "BGN", name: "Bulgarian Lev", flag: "bg" },
  { code: "TRY", name: "Turkish Lira", flag: "tr" },
  { code: "AZN", name: "Azerbaijani Manat", flag: "az" },
  { code: "AED", name: "UAE Dirham", flag: "ae" },
  { code: "SAR", name: "Saudi Riyal", flag: "sa" },
  { code: "QAR", name: "Qatari Riyal", flag: "qa" },
  { code: "KWD", name: "Kuwaiti Dinar", flag: "kw" },
  { code: "ILS", name: "Israeli Shekel", flag: "il" },
  { code: "INR", name: "Indian Rupee", flag: "in" },
  { code: "PKR", name: "Pakistani Rupee", flag: "pk" },
  { code: "BDT", name: "Bangladeshi Taka", flag: "bd" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "id" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "my" },
  { code: "THB", name: "Thai Baht", flag: "th" },
  { code: "PHP", name: "Philippine Peso", flag: "ph" },
  { code: "VND", name: "Vietnamese Dong", flag: "vn" },
  { code: "TWD", name: "Taiwan Dollar", flag: "tw" },
  { code: "BRL", name: "Brazilian Real", flag: "br" },
  { code: "MXN", name: "Mexican Peso", flag: "mx" },
  { code: "ARS", name: "Argentine Peso", flag: "ar" },
  { code: "CLP", name: "Chilean Peso", flag: "cl" },
  { code: "COP", name: "Colombian Peso", flag: "co" },
  { code: "PEN", name: "Peruvian Sol", flag: "pe" },
  { code: "ZAR", name: "South African Rand", flag: "za" },
  { code: "EGP", name: "Egyptian Pound", flag: "eg" },
  { code: "NGN", name: "Nigerian Naira", flag: "ng" },
  { code: "KES", name: "Kenyan Shilling", flag: "ke" },
  { code: "MAD", name: "Moroccan Dirham", flag: "ma" },
  { code: "UAH", name: "Ukrainian Hryvnia", flag: "ua" },
  { code: "GEL", name: "Georgian Lari", flag: "ge" },
  { code: "KZT", name: "Kazakhstani Tenge", flag: "kz" },
];

function ProfileSettings() {
  const navigate = useNavigate();
  const [originalEmail, setOriginalEmail] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currency: "USD",
    profileImage: "",
    profileImagePosition: "center",
  });

  const selectedCurrency = useMemo(
    () =>
      currencies.find((currency) => currency.code === formData.currency) ||
      currencies[0],
    [formData.currency]
  );

  useEffect(() => {
    const user = getCurrentUser();

    if (user) {
      setOriginalEmail(user.email || "");
      setFormData({
        name: user.name || user.displayName || "",
        email: user.email || "",
        currency: user.currency || "USD",
        profileImage:
          user.profileImage ||
          user.avatarUrl ||
          user.photoURL ||
          user.picture ||
          "",
        profileImagePosition: user.profileImagePosition || "center",
      });
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSaveStatus("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = ({ image, position }) => {
    setSaveStatus("");

    setFormData((prev) => ({
      ...prev,
      profileImage: image,
      profileImagePosition: position,
    }));
  };

  const handleCurrencyChange = (currency) => {
    setSaveStatus("");

    setFormData((prev) => ({
      ...prev,
      currency,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const users = await getUsers();

    const updatedUser = {
      ...getCurrentUser(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      currency: formData.currency,
      profileImage: formData.profileImage,
      profileImagePosition: formData.profileImagePosition,
    };

    const updatedUsers = users.map((user) =>
      user.email === originalEmail ? updatedUser : user
    );

    saveUsers(updatedUsers);
    setCurrentUser(updatedUser);
    setOriginalEmail(updatedUser.email);
    setSaveStatus("Saved");

    window.dispatchEvent(new Event("budgetbee:user-updated"));
  };

  const handleDelete = async () => {
    const users = await getUsers();
    const updatedUsers = users.filter((user) => user.email !== originalEmail);

    saveUsers(updatedUsers);
    clearCurrentUser();

    window.dispatchEvent(new Event("budgetbee:user-updated"));
    navigate("/login");
  };

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <button
          type="button"
          className="profile-back-btn"
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="profile-card">
          <header className="profile-header">
            <div>
              <p>BudgetBee Account</p>
              <h1>Your Profile</h1>
              <span>
                Manage your identity, profile image, and preferred currency for
                cleaner financial tracking.
              </span>
            </div>
          </header>

          <section className="profile-identity-card">
            <UserAvatar
              user={formData}
              size="lg"
              editable
              onImageChange={handleImageChange}
            />

            <div className="profile-identity-info">
              <div className="profile-status-row">
                <p>Personal Workspace</p>
                <span>
                  <BadgeCheck size={14} />
                  Active
                </span>
              </div>

              <h2>{formData.name || "Your profile"}</h2>
              <small>{formData.email || "No email added yet"}</small>

              <div className="profile-image-note">
                <Camera size={15} />
                Upload a custom image now. Social login images can be used
                later when backend auth is added.
              </div>
            </div>
          </section>

          <form className="profile-form" onSubmit={handleSave}>
            <section className="profile-section">
              <div className="profile-section-header">
                <h3>Profile Information</h3>
                <p>These details define your local BudgetBee workspace.</p>
              </div>

              <div className="profile-fields-grid">
                <label className="profile-field">
                  <span>Full Name</span>
                  <input
                    className="profile-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="profile-field">
                  <span>Email Address</span>
                  <input
                    className="profile-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-header">
                <h3>Financial Preferences</h3>
                <p>
                  Your dashboard, analytics, budgets, and transaction values use
                  this currency.
                </p>
              </div>

              <CurrencySelect
                label="Currency"
                value={formData.currency}
                options={currencies}
                onChange={handleCurrencyChange}
              />

              <div className="currency-preview-card">
                <p>
                  BudgetBee will format your financial workspace using{" "}
                  <strong>{selectedCurrency.name}</strong>.
                </p>
              </div>
            </section>

            <div className="profile-actions-row">
              {saveStatus && <span className="profile-save-status">Saved</span>}

              <button type="submit" className="profile-save-btn">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </form>

          <DangerZone onDelete={handleDelete} />
        </div>
      </section>
    </main>
  );
}

export default ProfileSettings;