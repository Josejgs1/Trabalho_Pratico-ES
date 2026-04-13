import RegisterPage from "./pages/registerPage.jsx";
import LoginPage from "./pages/loginPage.jsx";

export default function App() {
  if (window.location.pathname === "/login") {
    return <LoginPage />;
  }

  return <RegisterPage />;
}
