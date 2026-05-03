import { useEffect, useState } from "react";

import { getCurrentUser } from "../../services/authService.js";
import {
  clearAccessToken,
  getAccessToken,
} from "../../services/tokenStorage.js";

function loginPath() {
  const next = `${window.location.pathname}${window.location.search}`;
  return `/login?next=${encodeURIComponent(next)}`;
}

export function ProtectedPage({ children }) {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!getAccessToken()) {
      window.location.replace(loginPath());
      return undefined;
    }

    getCurrentUser()
      .then(() => {
        if (isMounted) setIsAllowed(true);
      })
      .catch(() => {
        clearAccessToken();
        window.location.replace(loginPath());
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAllowed) {
    return (
      <main className="auth-check-page" aria-live="polite">
        <p>Verificando sua sessão...</p>
      </main>
    );
  }

  return children;
}
