import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Landing from "./pages/Landing/Landing.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import ProfileSettings from "./pages/Settings/Profile/ProfileSettings.jsx";
import IncomeSources from "./pages/IncomeSources/IncomeSources.jsx";
import Categories from "./pages/Categories/Categories.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import About from "./pages/About/About.jsx";
import Support from "./pages/Support/Support";
import Contact from "./pages/Contact/Contact";
import TermsOfUse from "./pages/TermsOfUse/TermsOfUse.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy.jsx";
import BudgetPlanning from "./pages/BudgetPlanning/BudgetPlanning.jsx"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budget-planning" element={<BudgetPlanning />} />

        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route path="/settings/income-sources" element={<IncomeSources />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;