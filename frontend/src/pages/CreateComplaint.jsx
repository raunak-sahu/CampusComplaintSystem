import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function CreateComplaint() {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth >= 768
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
    image: null,
  });

  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a complaint title");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Please enter a complaint description");
      return;
    }

    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("priority", form.priority);

      if (form.image) {
        formData.append("image", form.image);
      }

      await api.post(
        "complaints/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Complaint submitted successfully!");

      setForm({
        title: "",
        description: "",
        category: "",
        priority: "Medium",
        image: null,
      });

      navigate("/my-complaints");
    } catch (err) {
      console.error(
        err.response?.data || err.message
      );

      const errorData = err.response?.data;

      if (errorData) {
        const firstError = Object.values(errorData)[0];

        if (Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else {
          toast.error(String(firstError));
        }
      } else {
        toast.error("Unable to submit complaint");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");

    window.location.replace("/");
  };

  return (
    <div
      className={`create-complaint ${
        darkMode ? "dark" : "light"
      }`}
    >
      <style>{`
        :root {
          --bg: #f3f6fb;
          --surface: #ffffff;
          --text: #0f172a;
          --muted: #64748b;
          --border: #e2e8f0;
          --primary: #2563eb;
        }

        .dark {
          --bg: #0b1220;
          --surface: #111827;
          --text: #f8fafc;
          --muted: #94a3b8;
          --border: #1f2937;
        }

        .create-complaint {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: Inter, system-ui, sans-serif;
        }

        .complaint-layout {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 28px;
          max-width: 1440px;
          margin: auto;
          padding: 28px;
          align-items: start;
        }

        .sidebar-wrap {
          position: sticky;
          top: 24px;
        }

        .sidebar {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 8px 25px rgba(15,23,42,.06);
        }

        .complaint-main {
          min-width: 0;
        }

        .page-header {
          background: linear-gradient(
            135deg,
            #2563eb,
            #4f46e5,
            #06b6d4
          );
          color: white;
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 22px;
          box-shadow: 0 18px 50px rgba(37,99,235,.2);
        }

        .page-header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
        }

        .page-header p {
          margin: 8px 0 0;
          opacity: .9;
        }

        .form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 26px;
          box-shadow: 0 12px 35px rgba(15,23,42,.06);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 14px;
          font-weight: 700;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          font-size: 14px;
          outline: none;
        }

        .field textarea {
          min-height: 150px;
          resize: vertical;
          line-height: 1.6;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }

        .image-help {
          font-size: 12px;
          color: var(--muted);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .btn {
          border: none;
          border-radius: 10px;
          padding: 12px 18px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-cancel {
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .btn-submit {
          color: white;
          background: linear-gradient(
            90deg,
            #2563eb,
            #4f46e5
          );
        }

        .btn-submit:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .info-box {
          margin-top: 20px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(37,99,235,.08);
          border: 1px solid rgba(37,99,235,.15);
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .complaint-layout {
            display: block;
            padding: 16px;
          }

          .sidebar-wrap {
            display: none;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }
        }

        @media (max-width: 600px) {
          .page-header {
            padding: 22px;
          }

          .page-header h1 {
            font-size: 26px;
          }

          .form-card {
            padding: 18px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>

      <Navbar
        title="Campus Complaint System"
        role="student"
        onLogout={handleLogout}
      />

      <div className="complaint-layout">
        <div className="sidebar-wrap">
          <div className="sidebar">
            <div
              style={{
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              Student Menu
            </div>

            <Sidebar role="student" />
          </div>
        </div>

        <main className="complaint-main">
          <div className="page-header">
            <h1>Submit a Complaint</h1>

            <p>
              Report an issue on campus and our team
              will review it.
            </p>
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">

                <div className="field full">
                  <label htmlFor="title">
                    Complaint Title
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Example: Water leakage in Hostel Block A"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>

                <div className="field">
                  <label htmlFor="category">
                    Category
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select category
                    </option>

                    <option value="Electrical">
                      Electrical
                    </option>

                    <option value="Water">
                      Water
                    </option>

                    <option value="Hostel">
                      Hostel
                    </option>

                    <option value="Internet">
                      Internet
                    </option>

                    <option value="Mess">
                      Mess
                    </option>

                    <option value="Cleaning">
                      Cleaning
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="priority">
                    Priority
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Urgent">
                      Urgent
                    </option>
                  </select>
                </div>

                <div className="field full">
                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe the problem in detail..."
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="field full">
                  <label htmlFor="image">
                    Attach Image
                  </label>

                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                  />

                  <span className="image-help">
                    You can optionally attach a photo
                    showing the problem.
                  </span>
                </div>

              </div>

              <div className="info-box">
                Your complaint will automatically be
                associated with your logged-in student
                account. You do not need to enter your
                username.
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-submit"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}