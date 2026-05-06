import { Link } from "react-router-dom";
import budgetBeeLogo from "../../assets/images/Logo4.png";
import rightPanelImage from "../../assets/images/Logo3.png";
import "./Landing.css";

export default function Landing() {
  return (
    <main className="landing-page">
      <section className="landing-content">
        <div className="landing-left">
          <div className="landing-brand">
            <img src={budgetBeeLogo} alt="BudgetBee logo" className="landing-logo" />
            <h1>BudgetBee</h1>
          </div>

          <div className="landing-copy">
            <span className="landing-badge">Personal finance workspace</span>

            <h2>Track your money with clarity and control.</h2>

            <p>
              BudgetBee helps you organize income, expenses, categories, and monthly
              budgets in one clean dashboard. Stay aware of your spending, understand
              where your money goes, and make better financial decisions with less effort.
            </p>
          </div>

          <div className="landing-actions">
            <Link to="/login" className="landing-primary-btn">
              Login
            </Link>

            <Link to="/signup" className="landing-secondary-btn">
              Create Account
            </Link>
          </div>

          <div className="landing-highlights">
            <div>
              <strong>Monthly budget</strong>
              <span>Plan and monitor limits</span>
            </div>

            <div>
              <strong>Smart categories</strong>
              <span>Understand your spending</span>
            </div>

            <div>
              <strong>Clear reports</strong>
              <span>See progress at a glance</span>
            </div>
          </div>
        </div>

        <div className="landing-right" aria-hidden="true">
          <div className="landing-visual-card">
            <img src={rightPanelImage} alt="" className="landing-hero-image" />
          </div>
        </div>
      </section>
    </main>
  );
}