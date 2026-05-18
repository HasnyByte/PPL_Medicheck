import { useState } from "react";
import {
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import type { User as UserType } from "../app/App";

interface NavbarProps {
  onSwitchMode?: (mode: "login" | "register" | "register-doctor") => void;
  user: UserType | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onDashboard: () => void;
  onHome: () => void;
}

export function Navbar({
  user,
  onLogin,
  onRegister,
  onLogout,
  onDashboard,
  onHome,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Beranda", href: "#" },
    { label: "Fitur", href: "#fitur" },
    { label: "Dokter", href: "#dokter" },
    { label: "Tentang", href: "#tentang" },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #e8f5f1",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <button
            onClick={onHome}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #2a6e5e 0%, #3d9e86 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(42,110,94,0.3)",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                M
              </span>
            </div>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                fontSize: 18,
                color: "#0f2420",
                letterSpacing: "-0.01em",
              }}
            >
              MediCheck
            </span>
          </button>

          {/* Desktop nav links */}
          <div
            className="hidden md:flex"
            style={{ gap: 36, alignItems: "center" }}
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                style={{
                  color: "#5a7870",
                  fontSize: 14,
                  textDecoration: "none",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 400,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#2a6e5e")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5a7870")}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Auth area */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 14px",
                    borderRadius: 12,
                    background: "#e8f5f1",
                    border: "1px solid #c8dfd8",
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2a6e5e, #3d9e86)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User size={13} color="white" />
                  </div>
                  <span
                    style={{ fontSize: 13, color: "#1a2e28", fontWeight: 500 }}
                  >
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown size={13} color="#5a7870" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 0 }}
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        zIndex: 1,
                        background: "white",
                        borderRadius: 14,
                        padding: 8,
                        boxShadow: "0 8px 32px rgba(42,110,94,0.12)",
                        border: "1px solid #e8f5f1",
                        minWidth: 200,
                      }}
                    >
                      <div
                        style={{
                          padding: "8px 12px",
                          borderBottom: "1px solid #f0f9f6",
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f2420",
                          }}
                        >
                          {user.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#7a9e96" }}>
                          {user.role === "doctor" ? "Dokter" : "Pasien"}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onDashboard();
                          setDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 12px",
                          borderRadius: 10,
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#1a2e28",
                          fontFamily: "'Outfit', sans-serif",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f0f9f6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                      >
                        <LayoutDashboard size={14} color="#2a6e5e" /> Dashboard
                      </button>
                      <button
                        onClick={() => {
                          onLogout();
                          setDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 12px",
                          borderRadius: 10,
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#dc2626",
                          fontFamily: "'Outfit', sans-serif",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fff5f5")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                      >
                        <LogOut size={14} color="#dc2626" /> Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div
                className="hidden md:flex"
                style={{ gap: 10, alignItems: "center" }}
              >
                <button
                  onClick={onLogin}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    border: "1.5px solid #2a6e5e",
                    background: "transparent",
                    color: "#2a6e5e",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e8f5f1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Masuk
                </button>
                <button
                  onClick={onRegister}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    background: "#2a6e5e",
                    border: "none",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    boxShadow: "0 2px 8px rgba(42,110,94,0.3)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#235c4e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#2a6e5e";
                  }}
                >
                  Daftar
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              {mobileOpen ? (
                <X size={20} color="#1a2e28" />
              ) : (
                <Menu size={20} color="#1a2e28" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ paddingBottom: 16, borderTop: "1px solid #e8f5f1" }}>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  padding: "12px 4px",
                  color: "#3d6058",
                  fontSize: 15,
                  textDecoration: "none",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {l.label}
              </a>
            ))}
            {!user && (
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => {
                    onLogin();
                    setMobileOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "1.5px solid #2a6e5e",
                    background: "transparent",
                    color: "#2a6e5e",
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    onRegister();
                    setMobileOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    background: "#2a6e5e",
                    border: "none",
                    color: "white",
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
