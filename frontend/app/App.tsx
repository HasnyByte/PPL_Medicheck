"use client";
import { useState, useCallback, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { LandingPage } from "@/components/LandingPage";
import { ChatSection } from "@/components/ChatSection";
import { ResultSection } from "@/components/ResultSection";
import { AuthModal } from "@/components/AuthModal";
import { BookingFlow } from "@/components/BookingFlow";
import { SuccessSection } from "@/components/SuccessSection";
import { Dashboard } from "@/components/Dashboard";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { getSavedUser, removeToken } from "@/lib/api";

export type AppView = "landing" | "chat" | "result" | "booking" | "success" | "dashboard";
export type AuthMode = "login" | "register" | "register-doctor";

export interface User {
  id: string; name: string; email: string;
  role: "patient" | "doctor" | "admin";
  phone?: string | null; specialist?: string | null; specialistCode?: string | null;
  hospital?: string | null; hospitalAddress?: string | null; bio?: string | null;
  photoUrl?: string | null; experience?: number | null; education?: string | null;
  licenseNumber?: string | null; consultationFee?: number | null; isVerified?: boolean;
}

export interface ScreeningResult {
  disease: string; confidence: number; tips: string[];
  specialist: string; specialistCode: string;
  isEmergency: boolean; symptoms: string; timestamp: Date;
}

export interface BookingData {
  id: string;
  doctor: { id: string; name: string; specialist?: string | null; hospital?: string | null; hospitalAddress?: string | null };
  date: Date; time: string; disease: string;
  status: "Menunggu" | "Terkonfirmasi" | "Selesai" | "Dibatalkan";
}

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: AuthMode }>({ open: false, mode: "login" });
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedUser<User>();
    if (saved) setUser(saved);
  }, []);

  const navigate = useCallback((v: AppView) => {
    setView(v);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }, []);

  const openAuth = useCallback((mode: AuthMode) => {
    setAuthModal({ open: true, mode });
  }, []);

  const handleScreeningComplete = useCallback((result: ScreeningResult) => {
    setScreeningResult(result);
    navigate("result");
  }, [navigate]);

  const handleBookingIntent = useCallback(() => {
    if (!user) {
      setPendingAction("booking");
      openAuth("login");
    } else {
      navigate("booking");
    }
  }, [user, navigate, openAuth]);

  const handleAuthSuccess = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    setAuthModal({ open: false, mode: "login" });
    if (pendingAction === "booking") {
      setPendingAction(null);
      navigate("booking");
    } else if (loggedInUser.role === "doctor" || loggedInUser.role === "admin") {
      navigate("dashboard");
    } else {
      // patient — stay on current page or go to landing
    }
  }, [pendingAction, navigate]);

  const handleBookingSuccess = useCallback((booking: BookingData) => {
    setBookingData(booking);
    navigate("success");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    removeToken();
    setUser(null);
    setScreeningResult(null);
    navigate("landing");
  }, [navigate]);

  const renderDashboard = () => {
    if (!user) return null;
    if (user.role === "doctor") return <DoctorDashboard user={user} onUserUpdate={setUser} />;
    if (user.role === "admin") return <AdminDashboard user={user} />;
    return (
      <Dashboard
        user={user}
        onUserUpdate={setUser}
        onStartScreening={() => navigate("chat")}
        onBookDoctor={() => navigate("booking")}
      />
    );
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: "100vh", background: "#ffffff" }}>
      <Navbar
        user={user}
        onLogin={() => openAuth("login")}
        onRegister={() => openAuth("register")}
        onLogout={handleLogout}
        onDashboard={() => navigate("dashboard")}
        onHome={() => navigate("landing")}
        onSwitchMode={openAuth}
      />
      <main>
        {view === "landing" && (
          <LandingPage
            onStartChat={() => navigate("chat")}
            onLogin={() => openAuth("login")}
          />
        )}
        {view === "chat" && (
          <ChatSection
            onComplete={handleScreeningComplete}
            onBack={() => navigate("landing")}
            user={user}
          />
        )}
        {view === "result" && screeningResult && (
          <ResultSection
            result={screeningResult}
            user={user}
            onBook={handleBookingIntent}
            onBack={() => navigate("landing")}
            onNewScreening={() => navigate("chat")}
          />
        )}
        {view === "booking" && (
          <BookingFlow
            user={user}
            result={screeningResult}
            onSuccess={handleBookingSuccess}
            onBack={() => navigate(screeningResult ? "result" : "landing")}
          />
        )}
        {view === "success" && bookingData && (
          <SuccessSection
            booking={bookingData}
            user={user}
            onHome={() => navigate("landing")}
            onDashboard={() => navigate("dashboard")}
          />
        )}
        {view === "dashboard" && user && renderDashboard()}
      </main>

      {authModal.open && (
        <AuthModal
          open={authModal.open}
          mode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: "login" })}
          onSuccess={handleAuthSuccess}
          onSwitchMode={openAuth}
        />
      )}
    </div>
  );
}
