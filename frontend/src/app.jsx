import MapPage from "./pages/mapPage.jsx";
import RegisterPage from "./pages/registerPage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import { getAccessToken } from "./services/tokenStorage.js";

export default function App() {
  const path = window.location.pathname;
  const loggedIn = !!getAccessToken();

  if (path === "/register") return <RegisterPage />;
  if (path === "/login") return <LoginPage />;

  if (!loggedIn) {
    window.location.replace("/login");
    return null;
  }

  return <MapPage />;
}
