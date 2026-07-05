import React, { useEffect, useState, useRef } from "react";
import { Modal, Button } from "antd";
import {
  doLogout as logOutUser,
  userDetails
} from "./auth/auth";

const INACTIVITY_LIMIT = 43 * 60 * 1000; // 5 minutes
const WARNING_TIME = 41 * 60 * 1000; // 2 minutes before logout
const COUNTDOWN_SECONDS = 600000; // countdown for modal

const InactivityHandler = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const modalVisibleRef = useRef(false);
  const countdownRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  // Format mm:ss
  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Logout user + notify other tabs
  const logout = () => {
    clearTimers();
     localStorage.clear();
    
    // azureLogout();

    logOutUser(() => {
        window.location.reload();
    });
  };

  // Show modal + start countdown
  const showWarningModal = () => {
    modalVisibleRef.current = true;
    setIsModalVisible(true);
    setCountdown(COUNTDOWN_SECONDS);

    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clear timers + close modal
  const clearTimers = () => {
    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);
    clearInterval(countdownRef.current);
    modalVisibleRef.current = false;
    setIsModalVisible(false);
  };

  // Reset inactivity timer on user activity
  const resetTimer = () => {
    if (modalVisibleRef.current) return; // don’t reset if modal is showing
    clearTimers();

    inactivityTimerRef.current = setTimeout(logout, INACTIVITY_LIMIT);
    warningTimerRef.current = setTimeout(
      showWarningModal,
      INACTIVITY_LIMIT - WARNING_TIME
    );

    localStorage.setItem("lastActivity", Date.now());
  };

  // Handle "Stay Logged In"
  const handleStay = () => {
    clearInterval(countdownRef.current);
    modalVisibleRef.current = false;
    setIsModalVisible(false);
    localStorage.setItem("staySignedIn", Date.now()); // notify other tabs
    resetTimer();
  };

  // Cross-tab sync
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "forceLogout") logout();
      if (e.key === "staySignedIn") {
        clearTimers();
        resetTimer();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Start timers + listen to activity
  useEffect(() => {
    resetTimer();
    const events = ["mousemove", "keydown", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      clearTimers();
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return (
    <Modal
      title="⚠️ Session Timeout Warning"
      open={isModalVisible}
      footer={null}
      closable={false}
      centered
    >
      <p>You will be logged out in <b>{formatTime(countdown)}</b>.</p>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Button type="primary" onClick={handleStay}>
          Stay Logged In
        </Button>
        <Button danger style={{ marginLeft: 10 }} onClick={logout}>
          Logout Now
        </Button>
      </div>
    </Modal>
  );
};

export default InactivityHandler;
