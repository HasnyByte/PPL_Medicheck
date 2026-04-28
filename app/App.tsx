"use client";

import { useState, useCallback, useEffect } from "react";
import "@/styles/fonts.css";
import { Navbar } from "@/components/Navbar";
import { LandingPage } from "@/components/LandingPage";
import { ChatSection } from "@/components/ChatSection";
import { ResultSection } from "@/components/ResultSection";
import { AuthModal } from "@/components/AuthModal";
import { BookingFlow } from "@/components/BookingFlow";
import { SuccessSection } from "@/components/SuccessSection";
import { Dashboard } from "@/components/Dashboard";

export type AppView =
  | "landing"
  | "chat"
  | "result"
  | "booking"
  | "success"
  | "dashboard";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
}

export interface ScreeningResult {
  disease: string;
  confidence: number;
  tips: string[];
  specialist: string;
  specialistCode: string;
  isEmergency: boolean;
  symptoms: string;
  timestamp: Date;
}

export interface BookingData {
  id: string;
  doctor: {
    name: string;
    title: string;
    hospital: string;
    hospitalAddress: string;
  };
  date: Date;
  time: string;
  disease: string;
  status: "Menunggu" | "Terkonfirmasi" | "Selesai" | "Dibatalkan";
}

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    mode: "login" | "register";
  }>({ open: false, mode: "login" });
  const [screeningResult, setScreeningResult] =
    useState<ScreeningResult | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const navigate = useCallback((v: AppView) => {
    setView(v);
    // Use setTimeout to ensure this runs on client side only
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  }, []);

  const handleScreeningComplete = useCallback(
    (result: ScreeningResult) => {
      setScreeningResult(result);
      navigate("result");
    },
    [navigate],
  );

  const handleBookingIntent = useCallback(() => {
    if (!user) {
      setPendingAction("booking");
      setAuthModal({ open: true, mode: "login" });
    } else {
      navigate("booking");
    }
  }, [user, navigate]);

  const handleAuthSuccess = useCallback(
    (loggedInUser: User) => {
      setUser(loggedInUser);
      setAuthModal({ open: false, mode: "login" });
      if (pendingAction === "booking") {
        setPendingAction(null);
        navigate("booking");
      }
    },
    [pendingAction, navigate],
  );

  const handleBookingSuccess = useCallback(
    (booking: BookingData) => {
      setBookingData(booking);
      navigate("success");
    },
    [navigate],
  );

  return (
    <div
      style={{
        fontFamily: "'Outfit', sans-serif",
        minHeight: "100vh",
        background: "#ffffff",
      }}
    >
      <Navbar
        user={user}
        onLogin={() => setAuthModal({ open: true, mode: "login" })}
        onRegister={() => setAuthModal({ open: true, mode: "register" })}
        onLogout={() => {
          setUser(null);
          navigate("landing");
        }}
        onDashboard={() => navigate("dashboard")}
        onHome={() => navigate("landing")}
      />

      <main>
        {view === "landing" && (
          <LandingPage
            onStartChat={() => navigate("chat")}
            onLogin={() => setAuthModal({ open: true, mode: "login" })}
          />
        )}

        {view === "chat" && (
          <ChatSection
            onComplete={handleScreeningComplete}
            onBack={() => navigate("landing")}
          />
        )}

        {view === "result" && screeningResult && (
          <ResultSection
            result={screeningResult}
            onBook={handleBookingIntent}
            onRetry={() => navigate("chat")}
            onHome={() => navigate("landing")}
          />
        )}

        {view === "booking" && screeningResult && user && (
          <BookingFlow
            result={screeningResult}
            user={user}
            onSuccess={handleBookingSuccess}
            onBack={() => navigate("result")}
          />
        )}

        {view === "success" && bookingData && (
          <SuccessSection
            booking={bookingData}
            onDashboard={() => navigate("dashboard")}
            onHome={() => navigate("landing")}
          />
        )}

        {view === "dashboard" && user && (
          <Dashboard
            user={user}
            screeningResult={screeningResult}
            bookingData={bookingData}
            onStartChat={() => navigate("chat")}
          />
        )}

        {view === "dashboard" && !user && (
          <div
            style={{
              minHeight: "calc(100vh - 64px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 16, color: "#5a7870", marginBottom: 16 }}>
                Anda perlu masuk untuk mengakses dashboard.
              </p>
              <button
                onClick={() => setAuthModal({ open: true, mode: "login" })}
                style={{
                  padding: "12px 28px",
                  borderRadius: 12,
                  background: "#2a6e5e",
                  border: "none",
                  color: "white",
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Masuk ke Akun
              </button>
            </div>
          </div>
        )}
      </main>

      <AuthModal
        open={authModal.open}
        mode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
        onSuccess={handleAuthSuccess}
        onSwitchMode={(mode) => setAuthModal((prev) => ({ ...prev, mode }))}
      />
    </div>
  );
}
