import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import api from "../api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import toast from "react-hot-toast";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController
);

export default function AdminDashboard() {
  const { darkMode, toggleTheme } = useTheme();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth >= 768
  );

  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 10;

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  /* =========================
     FETCH DASHBOARD
  ========================= */

  const fetchDashboard = async () => {
    try {
      const response = await api.get(
        "complaints/admin/dashboard/",
        getAuthHeaders()
      );
      setStats(response.data);
    } catch (error) {
      console.error(
        "Dashboard error:",
        error.response?.data || error.message
      );
    }
  };

  /* =========================
     FETCH COMPLAINTS
  ========================= */

  const fetchComplaints = async () => {
    try {
      const params = new URLSearchParams();

      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (search.trim()) params.append("search", search.trim());
      if (ordering) params.append("ordering", ordering);

      const query = params.toString();
      const url = query
        ? `complaints/admin/?${query}`
        : "complaints/admin/";

      const response = await api.get(url, getAuthHeaders());

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setComplaints(data);
    } catch (error) {
      console.error(
        "Complaints error:",
        error.response?.data || error.message
      );
      setComplaints([]);
    }
  };

  /* =========================
     INITIAL / FILTER FETCH
  ========================= */

  useEffect(() => {
    fetchDashboard();
    fetchComplaints();

    const onResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, priorityFilter, search, ordering]);

  /* =========================
     RESET PAGE WHEN FILTER CHANGES
  ========================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, priorityFilter, search, ordering]);

  /* =========================
     UPDATE STATUS
  ========================= */

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(
        `complaints/admin/${id}/`,
        { status: newStatus },
        getAuthHeaders()
      );

      await fetchComplaints();
      await fetchDashboard();

      toast.success("Complaint status updated");
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error("Unable to update complaint status");
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");

    window.location.replace("/");
  };

  /* =========================
     EXPORT CSV
  ========================= */

  const exportToCSV = () => {
    if (!complaints.length) {
      toast.error("No complaints available to export.");
      return;
    }

    const headers = [
      "Title",
      "Category",
      "Priority",
      "Status",
      "Student",
      "Created At",
    ];

    const rows = complaints.map((complaint) => [
      complaint.title,
      complaint.category,
      complaint.priority,
      complaint.status,
      complaint.student,
      complaint.created_at
        ? new Date(complaint.created_at).toLocaleString()
        : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `campus_complaints_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================
     PAGINATION
  ========================= */

  const totalPages = Math.max(
    1,
    Math.ceil(complaints.length / complaintsPerPage)
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(page, 1), totalPages));
  }, [totalPages]);

  const currentComplaints = useMemo(() => {
    const start = (currentPage - 1) * complaintsPerPage;

    return complaints.slice(start, start + complaintsPerPage);
  }, [complaints, currentPage]);

  /* =========================
     PIE CHART (STATUS DISTRIBUTION)
  ========================= */

/* =========================
   BAR CHART OPTIONS
========================= */

/* =========================
   STATUS DISTRIBUTION
========================= */

const pieData = useMemo(() => {
  const pending = Number(stats?.pending ?? 0);
  const inProgress = Number(stats?.in_progress ?? 0);
  const resolved = Number(stats?.resolved ?? 0);

  return {
    labels: [
      "Pending",
      "In Progress",
      "Resolved",
    ],

    datasets: [
      {
        label: "Complaints",

        data: [
          pending,
          inProgress,
          resolved,
        ],

        backgroundColor: [
          "#f59e0b",
          "#06b6d4",
          "#16a34a",
        ],

        borderColor: darkMode
          ? "#111827"
          : "#ffffff",

        borderWidth: 4,

        hoverOffset: 10,
      },
    ],
  };
}, [stats, darkMode]);


/* =========================
   COMPLAINTS BY CATEGORY
========================= */

const histogramData = useMemo(() => {
  const categoryCounts = {};

  complaints.forEach((complaint) => {
    const category =
      complaint.category || "Other";

    categoryCounts[category] =
      (categoryCounts[category] || 0) + 1;
  });

  const labels = Object.keys(categoryCounts);

  return {
    labels,

    datasets: [
      {
        label: "Complaints Count",

        data: labels.map(
          (category) => categoryCounts[category]
        ),

        backgroundColor: [
          "#2563eb",
          "#06b6d4",
          "#8b5cf6",
          "#ec4899",
          "#f59e0b",
          "#10b981",
          "#ef4444",
        ],

        borderRadius: 8,

        borderSkipped: false,

        borderWidth: 0,

        categoryPercentage: 0.7,

        barPercentage: 0.8,
      },
    ],
  };
}, [complaints]);


/* =========================
   PIE CHART OPTIONS
========================= */

const pieChartOptions = useMemo(
  () => ({
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          color: darkMode
            ? "#e5e7eb"
            : "#334155",

          padding: 18,

          usePointStyle: true,

          pointStyle: "circle",

          font: {
            size: 13,
            weight: "600",
          },
        },
      },

      tooltip: {
        enabled: true,

        callbacks: {
          label: (context) => {
            const value =
              Number(context.raw) || 0;

            const total =
              context.dataset.data.reduce(
                (sum, item) =>
                  sum + Number(item || 0),
                0
              );

            const percentage =
              total > 0
                ? (
                    (value / total) *
                    100
                  ).toFixed(1)
                : "0.0";

            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },

    animation: {
      duration: 900,
    },
  }),
  [darkMode]
);


/* =========================
   BAR CHART OPTIONS
========================= */

const histogramOptions = useMemo(
  () => ({
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: true,

        callbacks: {
          label: (context) =>
            ` Complaints: ${context.raw || 0}`,
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: darkMode
            ? "#cbd5e1"
            : "#475569",

          font: {
            size: 12,
            weight: "600",
          },

          maxRotation: 45,
          minRotation: 0,
        },

        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          color: darkMode
            ? "#cbd5e1"
            : "#475569",

          precision: 0,

          stepSize: 1,
        },

        grid: {
          color: darkMode
            ? "rgba(148,163,184,0.10)"
            : "rgba(15,23,42,0.08)",
        },
      },
    },

    animation: {
      duration: 900,
    },
  }),
  [darkMode]
);
  return (
    <div className={`admin-dashboard ${darkMode ? "dark" : "light"}`}>
      <style>{`
        :root {
          --bg: #f3f6fb;
          --surface: #ffffff;
          --text: #0f172a;
          --muted: #64748b;
          --border: #e2e8f0;
          --accent: #2563eb;
        }

        .dark {
          --bg: #0b1220;
          --surface: #111827;
          --text: #f8fafc;
          --muted: #94a3b8;
          --border: #1f2937;
        }

        * {
          box-sizing: border-box;
        }

        .admin-dashboard {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: Inter, system-ui, sans-serif;
        }

        .layout {
          max-width: 1440px;
          margin: auto;
          padding: 28px;
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 24px;
        }

        .sidebar-wrap {
          position: sticky;
          top: 24px;
          height: fit-content;
        }

        .sidebar {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 8px 25px rgba(15,23,42,.06);
        }

        .main {
          min-width: 0;
        }

        .header-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 30px;
          margin-bottom: 24px;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #4f46e5,
            #06b6d4
          );
          color: white;
          box-shadow: 0 15px 40px rgba(37,99,235,.2);
        }

        .header-title {
          font-size: 36px;
          font-weight: 800;
          line-height: 1.1;
        }

        .header-sub {
          margin-top: 6px;
          font-size: 14px;
          opacity: .9;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
        }

        .btn-ghost {
          background: rgba(255,255,255,.12);
          color: white;
          border: 1px solid rgba(255,255,255,.2);
        }

        .btn-light {
          background: white;
          color: #111827;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          min-height: 145px;
          padding: 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: 0 8px 25px rgba(15,23,42,.06);
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          transition: .2s ease;
        }

        .stat-label {
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 800;
          margin-top: 15px;
        }

        .stat-description {
          color: var(--muted);
          font-size: 12px;
          margin-top: 8px;
        }

.charts-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  box-sizing: border-box;
}

.chart-card {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--surface);
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--card-border);
  box-shadow: 0 12px 30px rgba(15,23,42,0.06);
  display: flex;
  flex-direction: column;
}

.chart-card h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.chart-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 260px;
  min-width: 0;
  box-sizing: border-box;
}
        

        .filters-grid {
          display: grid;
          grid-template-columns: 1fr 160px 160px 140px 160px;
          gap: 12px;
          margin-bottom: 20px;
        }

        .filter-control {
          width: 100%;
          padding: 11px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          outline: none;
        }

        .filter-control:focus {
          border-color: #2563eb;
        }

        .complaint-list {
          display: grid;
          gap: 14px;
        }

        .complaint-card {
          padding: 18px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          cursor: pointer;
          box-shadow: 0 7px 20px rgba(15,23,42,.04);
        }

        .complaint-card:hover {
          transform: translateY(-3px);
          transition: .2s ease;
          box-shadow: 0 15px 35px rgba(15,23,42,.08);
        }

        .complaint-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .complaint-title {
          font-weight: 750;
          font-size: 16px;
        }

        .complaint-desc {
          margin-top: 5px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.5;
        }

        .status-select {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          cursor: pointer;
          height: fit-content;
        }

        .tags-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .category-badge {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .priority-low {
          background: #dcfce7;
          color: #15803d;
        }

        .priority-medium {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .priority-high {
          background: #fef3c7;
          color: #b45309;
        }

        .priority-urgent {
          background: #fee2e2;
          color: #b91c1c;
        }

        .student {
          margin-left: auto;
          color: var(--muted);
          font-size: 12px;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
          padding-bottom: 30px;
        }

        .page-btn {
          padding: 9px 13px;
          border-radius: 9px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          cursor: pointer;
        }

        .page-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2,6,23,.65);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
        }

        .modal {
          width: 100%;
          max-width: 760px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 16px;
          background: var(--surface);
          color: var(--text);
          box-shadow: 0 30px 80px rgba(0,0,0,.35);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          color: var(--muted);
        }

      @media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    max-width: 100%;
    gap: 18px;
  }

  .filters,
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }

  .layout {
    padding: 12px;
  }

  .sidebar-wrap {
    display: none;
  }

  .chart-container {
    height: 250px;
  }
}
@media (max-width: 768px) {
  .layout {
    display: block;
    width: 100%;
    max-width: 100%;
    padding: 14px;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .sidebar-wrap {
    display: none;
  }

  .main {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .header-banner {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: 22px;
    flex-direction: column;
    align-items: flex-start;
  }

  .header-title {
    font-size: 28px;
  }

  .header-actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }

  .header-actions button {
    flex: 1;
    min-width: 100px;
  }

  /* =========================
     STATS
  ========================= */

  .stats-grid {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 100%;
  }

  .stat-card {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  /* =========================
     CHARTS
  ========================= */

  .charts-grid {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 100%;
    gap: 16px;
    margin: 0;
    box-sizing: border-box;
  }

  .chart-card {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    padding: 14px;
  }

  .chart-card h3 {
    font-size: 19px;
    margin-bottom: 10px;
  }

  .chart-container {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: 240px;
    box-sizing: border-box;
  }

  /* =========================
     FILTERS
  ========================= */

  .filters-grid {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 100%;
  }

  .filter-control {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  /* =========================
     COMPLAINTS
  ========================= */

  .complaint-list {
    width: 100%;
    max-width: 100%;
  }

  .complaint-card {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .complaint-top {
    flex-direction: column;
  }

  .status-select {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  /* =========================
     PAGINATION
  ========================= */

  .pagination {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .pagination > div:last-child {
    justify-content: center;
    flex-wrap: wrap;
  }
}


@media (max-width: 480px) {
  .layout {
    padding: 10px;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  .main {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  /* =========================
     HEADER
  ========================= */

  .header-banner {
    width: 100%;
    padding: 18px;
    border-radius: 16px;
  }

  .header-title {
    font-size: 24px;
  }

  .header-sub {
    font-size: 13px;
  }

  .header-actions {
    width: 100%;
    gap: 8px;
  }

  .header-actions button {
    flex: 1;
    min-width: 0;
    padding: 8px;
    font-size: 12px;
  }

  /* =========================
     STATS
  ========================= */

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .stat-card {
    min-height: 125px;
    padding: 15px;
  }

  /* =========================
     CHARTS
  ========================= */

  .charts-grid {
    width: 100%;
    max-width: 100%;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .chart-card {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding: 12px;
    border-radius: 12px;
    overflow: hidden;
  }

  .chart-card h3 {
    font-size: 17px;
    margin-bottom: 8px;
  }

  .chart-container {
    width: 100%;
    max-width: 100%;
    height: 210px;
    min-width: 0;
    box-sizing: border-box;
  }

  /* =========================
     FILTERS
  ========================= */

  .filters-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .filter-control {
    width: 100%;
    max-width: 100%;
    font-size: 13px;
  }

  /* =========================
     COMPLAINTS
  ========================= */

  .complaint-card {
    padding: 14px;
    border-radius: 14px;
  }

  .complaint-title {
    font-size: 15px;
  }

  .complaint-desc {
    font-size: 13px;
  }

  /* =========================
     PAGINATION
  ========================= */

  .pagination {
    gap: 12px;
  }

  .pagination > div:last-child {
    width: 100%;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .page-btn {
    padding: 8px 10px;
    font-size: 13px;
  }

  /* =========================
     MODAL
  ========================= */

  .modal {
    width: calc(100% - 20px);
    max-width: calc(100% - 20px);
    padding: 16px;
    box-sizing: border-box;
  }
}
      `}</style>

      <div className="layout">
        {/* SIDEBAR */}
        <div className="sidebar-wrap">
          <div className="sidebar">
            <div style={{ marginBottom: 10, fontWeight: 800 }}>
              Admin Menu
            </div>
            <Sidebar role="admin" />
          </div>
        </div>

        {/* MAIN */}
        <main className="main">
          {/* NAVBAR */}
          <Navbar
            title="Admin Dashboard"
            role="admin"
            onLogout={handleLogout}
          />

          {/* HEADER */}
          <section className="header-banner">
            <div>
              <div className="header-title">Admin Dashboard</div>
              <div className="header-sub">Administrator Panel</div>
            </div>

            <div className="header-actions">
              <button className="btn btn-ghost" onClick={exportToCSV}>
                Export
              </button>
              <button className="btn btn-ghost" onClick={toggleTheme}>
                {darkMode ? "☀ Light" : "🌙 Dark"}
              </button>
              <button className="btn btn-light" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </section>

          {/* STATS */}
          <section className="stats-grid">
            <div className="stat-card">
              <div
                style={{
                  height: 4,
                  background: "#2563eb",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              />
              <div className="stat-label">Total Complaints</div>
              <div className="stat-value">{stats?.total ?? "-"}</div>
              <div className="stat-description">All complaints submitted</div>
            </div>

            <div className="stat-card">
              <div
                style={{
                  height: 4,
                  background: "#f59e0b",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              />
              <div className="stat-label">Pending</div>
              <div className="stat-value">{stats?.pending ?? "-"}</div>
              <div className="stat-description">Waiting for action</div>
            </div>

            <div className="stat-card">
              <div
                style={{
                  height: 4,
                  background: "#06b6d4",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              />
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{stats?.in_progress ?? "-"}</div>
              <div className="stat-description">Currently being worked on</div>
            </div>

            <div className="stat-card">
              <div
                style={{
                  height: 4,
                  background: "#16a34a",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              />
              <div className="stat-label">Resolved</div>
              <div className="stat-value">{stats?.resolved ?? "-"}</div>
              <div className="stat-description">Successfully resolved</div>
            </div>
          </section>

          {/* CHARTS */}
          <section className="charts-grid">
            {/* PIE CHART FOR STATUS DISTRIBUTION */}
            <div className="chart-card">
              <h3>Status Distribution</h3>
              <div className="chart-container">
                <Pie data={pieData} options={pieChartOptions} />
              </div>
            </div>

            {/* HISTOGRAM FOR COMPLAINTS BY CATEGORY */}
            <div className="chart-card">
              <h3>Complaints by Category </h3>
              <div className="chart-container">
                <Bar data={histogramData} options={histogramOptions} />
              </div>
            </div>
          </section>

          {/* FILTERS */}
          <section className="filters-grid">
            <input
              className="filter-control"
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="filter-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              className="filter-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Water">Water</option>
              <option value="Hostel">Hostel</option>
              <option value="Internet">Internet</option>
              <option value="Mess">Mess</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="filter-control"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>

            <select
              className="filter-control"
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
            </select>
          </section>

          {/* COMPLAINTS */}
          <section className="complaint-list">
            {currentComplaints.length === 0 ? (
              <div className="empty-state">No complaints found.</div>
            ) : (
              currentComplaints.map((complaint) => {
                const priorityClass =
                  complaint.priority === "Urgent"
                    ? "priority-urgent"
                    : complaint.priority === "High"
                    ? "priority-high"
                    : complaint.priority === "Medium"
                    ? "priority-medium"
                    : "priority-low";

                return (
                  <article
                    key={complaint.id}
                    className="complaint-card"
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setShowModal(true);
                    }}
                  >
                    <div className="complaint-top">
                      <div>
                        <div className="complaint-title">
                          {complaint.title}
                        </div>
                        <div className="complaint-desc">
                          {complaint.description}
                        </div>
                      </div>

                      <select
                        className="status-select"
                        value={complaint.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          updateStatus(complaint.id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    <hr
                      style={{
                        border: "none",
                        borderTop: "1px solid var(--border)",
                        margin: "14px 0",
                      }}
                    />

                    <div className="tags-row">
                      <span className="badge category-badge">
                        {complaint.category}
                      </span>
                      <span className={`badge ${priorityClass}`}>
                        {complaint.priority}
                      </span>
                      <span className="student">{complaint.student}</span>
                    </div>
                  </article>
                );
              })
            )}
          </section>

          {/* PAGINATION */}
          <div className="pagination">
            <div
              style={{
                color: "var(--muted)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Showing{" "}
              <strong style={{ color: "var(--text)" }}>
                {complaints.length === 0
                  ? 0
                  : (currentPage - 1) * complaintsPerPage + 1}
              </strong>{" "}
              -{" "}
              <strong style={{ color: "var(--text)" }}>
                {Math.min(
                  currentPage * complaintsPerPage,
                  complaints.length
                )}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "var(--text)" }}>
                {complaints.length}
              </strong>{" "}
              complaints
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                className="page-btn"
                disabled={currentPage === 1 || complaints.length === 0}
                onClick={() => setCurrentPage(1)}
              >
                « First
              </button>

              <button
                className="page-btn"
                disabled={currentPage === 1 || complaints.length === 0}
                onClick={() =>
                  setCurrentPage((page) => Math.max(page - 1, 1))
                }
              >
                ← Previous
              </button>

              <div
                style={{
                  minWidth: 110,
                  padding: "9px 14px",
                  borderRadius: 10,
                  textAlign: "center",
                  background: darkMode ? "#0f172a" : "#eff6ff",
                  border: `1px solid ${darkMode ? "#334155" : "#bfdbfe"}`,
                }}
              >
                <span
                  style={{
                    color: darkMode ? "#e2e8f0" : "#1d4ed8",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button
                className="page-btn"
                disabled={
                  currentPage === totalPages || complaints.length === 0
                }
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
              >
                Next →
              </button>

              <button
                className="page-btn"
                disabled={
                  currentPage === totalPages || complaints.length === 0
                }
                onClick={() => setCurrentPage(totalPages)}
              >
                Last »
              </button>
            </div>
          </div>

          {/* MODAL */}
          {showModal && selectedComplaint && (
            <div
              className="modal-overlay"
              onClick={() => setShowModal(false)}
            >
              <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 15,
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>
                      {selectedComplaint.title}
                    </h2>
                    <p style={{ color: "var(--muted)" }}>
                      Submitted by {selectedComplaint.student}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      width: 40,
                      height: 40,
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 20,
                    }}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    margin: "15px 0",
                  }}
                >
                  <span className="badge category-badge">
                    {selectedComplaint.category}
                  </span>
                  <span
                    className={`badge ${
                      selectedComplaint.priority === "Urgent"
                        ? "priority-urgent"
                        : selectedComplaint.priority === "High"
                        ? "priority-high"
                        : selectedComplaint.priority === "Medium"
                        ? "priority-medium"
                        : "priority-low"
                    }`}
                  >
                    {selectedComplaint.priority}
                  </span>
                  <span className="badge category-badge">
                    {selectedComplaint.status}
                  </span>
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h4>Description</h4>
                  <p
                    style={{
                      color: "var(--muted)",
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedComplaint.description}
                  </p>
                </div>

                {selectedComplaint.image && (
                  <div style={{ marginTop: 18 }}>
                    <h4>Attached Image</h4>
                    <img
                      src={selectedComplaint.image}
                      alt="Complaint"
                      style={{
                        width: "100%",
                        maxHeight: 400,
                        objectFit: "contain",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 18,
                  }}
                >
                  <div
                    style={{
                      padding: 15,
                      borderRadius: 12,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <strong>Created</strong>
                    <p style={{ color: "var(--muted)" }}>
                      {selectedComplaint.created_at
                        ? new Date(
                            selectedComplaint.created_at
                          ).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: 15,
                      borderRadius: 12,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <strong>Assigned To</strong>
                    <p style={{ color: "var(--muted)" }}>
                      {selectedComplaint.assigned_to || "Not assigned"}
                    </p>
                  </div>
                </div>

                <div
                  className="modal-actions"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    marginTop: 20,
                  }}
                >
                  <button
                    onClick={() => setShowModal(false)}
                    className="page-btn"
                  >
                    Close
                  </button>

                  <button
                    onClick={async () => {
                      await updateStatus(
                        selectedComplaint.id,
                        "Resolved"
                      );
                      setShowModal(false);
                    }}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: "#16a34a",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    ✓ Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}