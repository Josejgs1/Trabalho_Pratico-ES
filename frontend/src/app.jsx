import { ProtectedPage } from "./components/auth/protectedPage.jsx";
import LandingPage from "./pages/landingPage.jsx";
import MapPage from "./pages/mapPage.jsx";
import RegisterPage from "./pages/registerPage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import PassportPage from "./pages/passportPage.tsx";

export default function App() {
  const path = window.location.pathname;

  if (path === "/") {
    return <LandingPage />;
  }

  if (path === "/login") {
    return <LoginPage />;
  }

  if (path === "/register") {
    return <RegisterPage />;
  }

  if (path === "/passport") {
    return (
      <ProtectedPage>
        <PassportPage />
      </ProtectedPage>
    );
  }

  if (path === "/map") {
    return (
      <ProtectedPage>
        <MapPage />
      </ProtectedPage>
    );
  }

  return <LandingPage />;
}
