import "../../styles/mapOverlay.css";

export default function SideDrawer({ open, children }) {
  return (
    <div className={`side-drawer${open ? " side-drawer--open" : ""}`}>
      {children}
    </div>
  );
}
