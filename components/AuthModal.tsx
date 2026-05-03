import { useState } from "react";
import type { ElementType } from "react";
import { X, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import type { User as UserType } from "../app/App";

interface AuthModalProps {
  open: boolean;
  mode: "login" | "register";
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  onSwitchMode: (mode: "login" | "register") => void;
}

const MOCK_USERS: UserType[] = [
  { id: "1", name: "Budi Santoso", email: "budi@example.com", role: "patient" },
  {
    id: "2",
    name: "Dr. Sari Dewi",
    email: "dokter@example.com",
    role: "doctor",
  },
  {
    id: "3",
    name: "Admin MediCheck",
    email: "admin@medicheck.com",
    role: "admin",
  },
];

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder: string;
  icon: ElementType;
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon: Icon,
}: InputFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: "#3d6058",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#f8fcfa",
          border: "1.5px solid #c8dfd8",
          borderRadius: 12,
          padding: "10px 14px",
          transition: "border-color 0.15s",
        }}
        onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#2a6e5e")}
        onBlurCapture={(e) => (e.currentTarget.style.borderColor = "#c8dfd8")}
      >
        <Icon size={15} color="#7a9e96" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 14,
            color: "#1a2e28",
            fontFamily: "'Outfit', sans-serif",
          }}
        />
      </div>
    </div>
  );
}

export function AuthModal({
  open,
  mode,
  onClose,
  onSuccess,
  onSwitchMode,
}: AuthModalProps) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || (mode === "register" && !name)) {
      setError("Mohon lengkapi semua field yang diperlukan.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    if (mode === "login") {
      const found = MOCK_USERS.find((u) => u.email === email);
      if (found) {
        onSuccess(found);
      } else {
        // Create a new patient user
        onSuccess({
          id: Date.now().toString(),
          name: email.split("@")[0],
          email,
          role: "patient",
        });
      }
    } else {
      onSuccess({ id: Date.now().toString(), name, email, role });
    }
    setLoading(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(15, 36, 32, 0.5)",
          backdropFilter: "blur(4px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          zIndex: 201,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: 440,
          background: "white",
          borderRadius: 24,
          padding: "36px 36px 32px",
          boxShadow: "0 32px 80px rgba(15,36,32,0.18)",
          animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
            to { opacity: 1; transform: translate(-50%, -50%); }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            {/* Mini logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #2a6e5e, #3d9e86)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 700,
                    fontSize: 17,
                  }}
                >
                  M
                </span>
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#0f2420",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                MediCheck
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28,
                fontWeight: 600,
                color: "#0f2420",
                lineHeight: 1.2,
              }}
            >
              {mode === "login" ? "Selamat Datang Kembali" : "Buat Akun Baru"}
            </h2>
            <p style={{ fontSize: 13, color: "#7a9e96", marginTop: 5 }}>
              {mode === "login"
                ? "Masuk untuk melanjutkan proses booking."
                : "Daftar untuk mengakses semua fitur MediCheck."}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#f0f9f6",
              cursor: "pointer",
              padding: 8,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} color="#5a7870" />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "#f0f9f6",
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onSwitchMode(m)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                border: "none",
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "#0f2420" : "#7a9e96",
                fontSize: 13,
                fontWeight: mode === m ? 600 : 400,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {m === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        {/* Demo credentials hint */}
        {mode === "login" && (
          <div
            style={{
              background: "#e8f5f1",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              color: "#3d6058",
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            <strong>Demo Pasien:</strong> budi@example.com &nbsp;|&nbsp;{" "}
            <strong>Demo Dokter:</strong> dokter@example.com
            <br />
            <strong>Demo Admin:</strong> admin@medicheck.com &nbsp;|&nbsp;
            Password: bebas (prototype mode)
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <InputField
              label="Nama Lengkap"
              value={name}
              onChange={setName}
              placeholder="cth. Budi Santoso"
              icon={User}
            />
          )}

          <InputField
            label="Alamat Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="nama@email.com"
            icon={Mail}
          />

          {/* Password */}
          <div style={{ marginBottom: mode === "register" ? 16 : 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#3d6058",
                marginBottom: 6,
              }}
            >
              Kata Sandi
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#f8fcfa",
                border: "1.5px solid #c8dfd8",
                borderRadius: 12,
                padding: "10px 14px",
                transition: "border-color 0.15s",
              }}
              onFocusCapture={(e) =>
                (e.currentTarget.style.borderColor = "#2a6e5e")
              }
              onBlurCapture={(e) =>
                (e.currentTarget.style.borderColor = "#c8dfd8")
              }
            >
              <Lock size={15} color="#7a9e96" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: 14,
                  color: "#1a2e28",
                  fontFamily: "'Outfit', sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showPass ? (
                  <EyeOff size={15} color="#7a9e96" />
                ) : (
                  <Eye size={15} color="#7a9e96" />
                )}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#3d6058",
                  marginBottom: 8,
                }}
              >
                Daftar sebagai
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {(
                  [
                    { value: "patient", label: "Pasien" },
                    { value: "doctor", label: "Dokter" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 12,
                      border: `1.5px solid ${role === opt.value ? "#2a6e5e" : "#c8dfd8"}`,
                      background: role === opt.value ? "#e8f5f1" : "white",
                      color: role === opt.value ? "#2a6e5e" : "#5a7870",
                      fontSize: 13,
                      fontWeight: role === opt.value ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "'Outfit', sans-serif",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#fee2e2",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: "#dc2626",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 13,
              background: loading ? "#7a9e96" : "#2a6e5e",
              border: "none",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: loading ? "none" : "0 4px 16px rgba(42,110,94,0.3)",
              transition: "all 0.2s ease",
            }}
          >
            {loading
              ? "Memproses..."
              : mode === "login"
                ? "Masuk ke Akun"
                : "Buat Akun"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#7a9e96",
            marginTop: 18,
          }}
        >
          {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            onClick={() =>
              onSwitchMode(mode === "login" ? "register" : "login")
            }
            style={{
              border: "none",
              background: "none",
              color: "#2a6e5e",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
          </button>
        </p>
      </div>
    </>
  );
}
