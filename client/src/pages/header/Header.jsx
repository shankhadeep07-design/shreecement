import { useEffect, useState, useContext, useRef } from "react";
import { confirmAlert } from "react-confirm-alert";
import { Link, useNavigate } from "react-router-dom";
import { doLogout as logOutUser, userDetails } from "../../auth/auth";
import { FaCog, FaSun, FaMoon, FaBell, FaSignOutAlt } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { getAllNotificationListModuleWise, getNotificationCount } from "../../Services/Notification-service";
import { ThemeContext } from "../../context/ThemeContext";

export default function Header({ setSidebarState }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [userName, setUserName]         = useState("");
  const [userEmail, setUserEmail]       = useState("");
  const [notifications, setNotifications]     = useState([]);
  const [notificationCount, setNotificationCount] = useState([]);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [notiOpen, setNotiOpen]         = useState(false);

  const profileRef = useRef(null);
  const notiRef    = useRef(null);

  /* ---- Logout ---- */
  const doLogout = async () => {
    localStorage.clear();
    logOutUser(() => { window.location.reload(); });
  };

  const openLogoutModal = () => {
    setProfileOpen(false);
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-ui delete_popup_box">
          <MdLogout className="logout" />
          <h1>Are you sure?</h1>
          <p>You will be returned to the login screen</p>
          <div className="delete_button_box">
            <button className="btn btn-secondary btn-block mr-1" onClick={onClose}>Cancel</button>
            <button className="btn btn-dark" onClick={() => { onClose(); doLogout(); }}>Logout</button>
          </div>
        </div>
      ),
    });
  };

  /* ---- Notifications ---- */
  const fetchALLNotiList = async () => {
    try {
      const res = await getAllNotificationListModuleWise();
      console.log("Fetched notifications: ", res);
      if (res.status === 1 && Array.isArray(res.data)) setNotifications(res.data);
    } catch { /* silent */ }
  };

  const fetchNotiCount = async () => {
    try {
      const res = await getNotificationCount();
      if (res.status === 1 && Array.isArray(res.data)) setNotificationCount(res.data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    const data = userDetails();
    setUserName(data?.name || "");
    setUserEmail(data?.email || "");
    fetchALLNotiList();
    fetchNotiCount();
  }, []);

  /* ---- Close dropdowns on outside click ---- */
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---- Shared dropdown styles ---- */
  const dropdownMenuStyle = {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    background: "rgba(12, 18, 42, 0.95)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    zIndex: 9999,
    overflow: "hidden",
    minWidth: "240px",
    animation: "fadeInDown 0.15s ease",
  };

  console.log("Header Rendered with notifications: ", notifications, " and count: ", notificationCount);

  return (
    <header className="modern-header-pane">

      {/* ── Left: Sidebar toggle ── */}
      <button
        className="header-sidebar-toggle"
        onClick={() => setSidebarState((prev) => prev === "mini-sidebar" ? "full" : "mini-sidebar")}
        title="Toggle Sidebar"
      >
        <i className="ti ti-menu-2"></i>
      </button>

      <h5 className="header-page-title">CSR Management System</h5>

      {/* ── Spacer ── */}
      <div className="header-spacer" />

      {/* ── Right Controls ── */}
      <div className="d-flex align-items-center gap-2">

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>

        {/* ── Notification Dropdown ── */}
        <div ref={notiRef} style={{ position: "relative" }}>
          <button
            className="header-icon-btn"
            onClick={() => { setNotiOpen((p) => !p); setProfileOpen(false); }}
            title="Notifications"
          >
            <FaBell style={{ fontSize: "16px" }} />
            {notificationCount.length > 0 && <span className="header-badge" />}
          </button>

          {notiOpen && (
            <div style={{ ...dropdownMenuStyle, minWidth: "320px" }}>
              {/* Header */}
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>Notifications</span>
              </div>
              {/* List */}
              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {notifications.length > 0 ? notifications.map((obj, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(108,99,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, color: "#a78bfa", fontSize: "13px" }}>
                      {obj?.count}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>{obj?.tnot_type}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{obj?.count} pending</div>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                    No new notifications
                  </div>
                )}
              </div>
              {/* Footer */}
              <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  onClick={() => { setNotiOpen(false); navigate("/admin/all-notifications"); }}
                  style={{ background: "transparent", border: "none", color: "#a78bfa", fontSize: "13px", cursor: "pointer", width: "100%", textAlign: "center" }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Profile Dropdown ── */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div
            className="header-user-avatar"
            onClick={() => { setProfileOpen((p) => !p); setNotiOpen(false); }}
            style={{ cursor: "pointer", userSelect: "none" }}
            title={userName}
          >
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>

          {profileOpen && (
            <div style={{ ...dropdownMenuStyle, minWidth: "240px", padding: "8px" }}>
              {/* User info header */}
              <div style={{ textAlign: "center", padding: "16px 12px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "6px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: "white", margin: "0 auto 10px" }}>
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <div style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>{userName}</div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "3px" }}>{userEmail}</div>
              </div>

              {/* Change Password */}
              <Link
                to="/admin/change-password"
                onClick={() => setProfileOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderRadius: "8px", color: "#cbd5e1", fontSize: "13px", textDecoration: "none", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <FaCog style={{ flexShrink: 0, color: "#94a3b8" }} />
                Change Password
              </Link>

              {/* Logout */}
              <button
                onClick={openLogoutModal}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderRadius: "8px", color: "#f87171", fontSize: "13px", background: "transparent", border: "none", width: "100%", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <FaSignOutAlt style={{ flexShrink: 0 }} />
                Log Out
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Fade-in keyframe */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}