import MapPage from "./pages/mapPage.jsx";
import RegisterPage from "./pages/registerPage.jsx";
import LoginPage from "./pages/loginPage.jsx";

export default function App() {
  if (window.location.pathname === "/login") {
    return <LoginPage />;
  }

  if (window.location.pathname === "/register") {
    return <RegisterPage />;
  }

  return <MapPage />;
}
