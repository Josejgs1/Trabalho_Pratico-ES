import {
  CalendarBlank,
  CheckCircle,
  EnvelopeSimple,
  SignOut,
  UserCircle,
  X,
} from "@phosphor-icons/react";

function formatDate(value) {
  if (!value) return "Indisponível";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Indisponível";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function UserInfoRow({ icon, label, value }) {
  return (
    <div className="user-drawer-info-row">
      <span className="user-drawer-info-icon">{icon}</span>
      <span className="user-drawer-info-copy">
        <span className="user-drawer-info-label">{label}</span>
        <span className="user-drawer-info-value">{value}</span>
      </span>
    </div>
  );
}

export default function UserDrawerContent({
  open,
  user,
  loading,
  error,
  onClose,
  onSignOut,
}) {
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <aside
      className={`user-drawer${open ? " user-drawer--open" : ""}`}
      aria-hidden={!open}
      aria-label="Perfil do usuário"
      {...(!open ? { inert: "" } : {})}
    >
      <div className="user-drawer-header">
        <h2 className="user-drawer-title">Perfil</h2>
        <button
          className="user-drawer-close"
          type="button"
          aria-label="Fechar perfil"
          title="Fechar"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className="user-drawer-body">
        {loading && <p className="user-drawer-status">Carregando perfil...</p>}

        {error && !loading && (
          <p className="user-drawer-status user-drawer-error">{error}</p>
        )}

        {user && !loading && (
          <>
            <div className="user-drawer-identity">
              <div className="user-drawer-avatar" aria-hidden="true">
                {initial}
              </div>
              <div className="user-drawer-identity-copy">
                <h3 className="user-drawer-name">{user.name}</h3>
                <p className="user-drawer-email">{user.email}</p>
              </div>
            </div>

            <div className="user-drawer-info">
              <UserInfoRow
                icon={<EnvelopeSimple size={18} />}
                label="E-mail"
                value={user.email}
              />
              <UserInfoRow
                icon={<CalendarBlank size={18} />}
                label="Membro desde"
                value={formatDate(user.created_at)}
              />
              <UserInfoRow
                icon={<CheckCircle size={18} />}
                label="Status"
                value={user.is_active ? "Conta ativa" : "Conta inativa"}
              />
            </div>
          </>
        )}

        {!user && !loading && !error && (
          <div className="user-drawer-empty">
            <UserCircle size={32} />
            <p>Perfil indisponível.</p>
          </div>
        )}
      </div>

      <div className="user-drawer-footer">
        <button
          className="user-drawer-sign-out"
          type="button"
          aria-label="Sair"
          title="Sair"
          onClick={onSignOut}
        >
          <SignOut size={20} weight="regular" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
