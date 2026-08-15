import { useTheme } from "../context/ThemeContext";

function Navbar({ title, role, onLogout }) {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header
      style={{
        background: darkMode
          ? "linear-gradient(90deg,#0f172a,#1e293b)"
          : "linear-gradient(90deg,#2563eb,#4f46e5)",
        color: "#fff",
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        borderRadius: "12px",
        marginBottom: "24px",
        transition: "0.3s",
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>{title}</h2>

        <p
          style={{
            margin: "4px 0 0",
            opacity: 0.9,
            fontSize: "14px",
          }}
        >
          {role === "admin"
            ? "Administrator Panel"
            : "Student Portal"}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            background: darkMode ? "#facc15" : "#1e293b",
            color: darkMode ? "#111827" : "#ffffff",
            transition: "0.3s",
          }}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <button
          onClick={onLogout}
          style={{
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;