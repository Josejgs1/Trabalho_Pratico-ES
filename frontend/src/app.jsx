import MapPage from "./pages/mapPage.jsx";
import RegisterPage from "./pages/registerPage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import PassportPage from "./pages/passportPage.jsx";

export default function App() {
  if (window.location.pathname === "/login") {
    return <LoginPage />;
  }

  if (window.location.pathname === "/register") {
    return <RegisterPage />;
  }

  if (window.location.pathname === "/passport") {
    return <PassportPage />;
  }

  return <MapPage />;
}
