"use client";
import { useState } from "react";
import type { ElementType } from "react";
import { X, Eye, EyeOff, User, Mail, Lock, Phone, Stethoscope, Building, BookOpen, Award } from "lucide-react";
import type { User as UserType } from "../app/App";
import { auth, setToken, saveUser } from "@/lib/api";

interface AuthModalProps {
  open: boolean;
  mode: "login" | "register" | "register-doctor";
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  onSwitchMode: (mode: "login" | "register" | "register-doctor") => void;
}

function InputField({
  label, value, onChange, type = "text", placeholder, icon: Icon, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder: string; icon: ElementType; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3d6058", marginBottom: 5 }}>
        {label}{required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fcfa", border: "1.5px solid #c8dfd8", borderRadius: 10, padding: "9px 12px" }}
        onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#2a6e5e")}
        onBlurCapture={(e) => (e.currentTarget.style.borderColor = "#c8dfd8")}
      >
        <Icon size={14} color="#7a9e96" />
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1a2e28", fontFamily: "'Outfit', sans-serif" }}
        />
      </div>
    </div>
  );
}

const SPECIALIST_OPTIONS = [
  { label: "Dokter Umum", code: "umum" },
  { label: "Dokter Anak (Sp.A)", code: "anak" },
  { label: "Dokter Jantung (Sp.JP)", code: "jantung" },
  { label: "Dokter Saraf (Sp.N)", code: "saraf" },
  { label: "Dokter Penyakit Dalam (Sp.PD)", code: "penyakit_dalam" },
  { label: "Dokter Paru (Sp.P)", code: "paru" },
  { label: "Dokter THT (Sp.THT)", code: "tht" },
  { label: "Dokter Mata (Sp.M)", code: "mata" },
  { label: "Dokter Kulit (Sp.KK)", code: "kulit" },
  { label: "Dokter Bedah (Sp.B)", code: "bedah" },
  { label: "Dokter Ortopedi (Sp.OT)", code: "ortopedi" },
  { label: "Dokter Kandungan (Sp.OG)", code: "kandungan" },
  { label: "Dokter Psikiatri (Sp.KJ)", code: "psikiatri" },
  { label: "Dokter Gigi", code: "gigi" },
];

export function AuthModal({ open, mode, onClose, onSuccess, onSwitchMode }: AuthModalProps) {
  const [showPass, setShowPass] = useState(false);
  // common
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // doctor specific
  const [specialist, setSpecialist] = useState("");
  const [specialistCode, setSpecialistCode] = useState("");
  const [hospital, setHospital] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [education, setEducation] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const reset = () => {
    setEmail(""); setPassword(""); setName(""); setPhone("");
    setSpecialist(""); setSpecialistCode(""); setHospital("");
    setHospitalAddress(""); setEducation(""); setLicenseNumber("");
    setExperience(""); setError("");
  };

  const handleSpecialistChange = (label: string) => {
    setSpecialist(label);
    const opt = SPECIALIST_OPTIONS.find((o) => o.label === label);
    if (opt) setSpecialistCode(opt.code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let resp;
      if (mode === "login") {
        if (!email || !password) { setError("Email dan password wajib diisi"); setLoading(false); return; }
        resp = await auth.login({ email, password });
      } else if (mode === "register") {
        if (!name || !email || !password) { setError("Nama, email, dan password wajib diisi"); setLoading(false); return; }
        resp = await auth.register({ name, email, password, phone: phone || undefined });
      } else {
        // register-doctor
        if (!name || !email || !password || !specialist) {
          setError("Nama, email, password, dan spesialis wajib diisi");
          setLoading(false); return;
        }
        resp = await auth.registerDoctor({
          name, email, password, phone: phone || undefined,
          specialist, specialistCode,
          hospital: hospital || undefined,
          hospitalAddress: hospitalAddress || undefined,
          education: education || undefined,
          licenseNumber: licenseNumber || undefined,
          experience: experience ? parseInt(experience) : undefined,
        });
      }
      setToken(resp.token);
      saveUser(resp.user);
      const appUser: UserType = {
        id: resp.user.id, name: resp.user.name, email: resp.user.email,
        role: resp.user.role as "patient" | "doctor" | "admin",
        phone: resp.user.phone,
        specialist: resp.user.specialist,
        specialistCode: resp.user.specialistCode,
        hospital: resp.user.hospital,
      };
      reset();
      onSuccess(appUser);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: "Selamat Datang Kembali",
    register: "Buat Akun Pasien",
    "register-doctor": "Daftar Akun Dokter",
  };
  const subtitles = {
    login: "Masuk untuk melanjutkan.",
    register: "Daftar sebagai pasien.",
    "register-doctor": "Daftar sebagai dokter profesional.",
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,36,32,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", zIndex: 201, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "100%", maxWidth: mode === "register-doctor" ? 560 : 440, background: "white", borderRadius: 24, padding: "32px 32px 28px", boxShadow: "0 32px 80px rgba(15,36,32,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#2a6e5e,#3d9e86)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 16 }}>M</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f2420" }}>MediCheck</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: "#0f2420", lineHeight: 1.2 }}>
              {titles[mode]}
            </h2>
            <p style={{ fontSize: 12, color: "#7a9e96", marginTop: 4 }}>{subtitles[mode]}</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#f0f9f6", cursor: "pointer", padding: 7, borderRadius: 9, display: "flex" }}>
            <X size={15} color="#5a7870" />
          </button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: "flex", background: "#f0f9f6", borderRadius: 12, padding: 3, marginBottom: 20, gap: 2 }}>
          {(["login", "register", "register-doctor"] as const).map((m) => (
            <button key={m} onClick={() => { onSwitchMode(m); setError(""); reset(); }}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: "none", background: mode === m ? "white" : "transparent", color: mode === m ? "#0f2420" : "#7a9e96", fontSize: 11, fontWeight: mode === m ? 600 : 400, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}>
              {m === "login" ? "Masuk" : m === "register" ? "Daftar Pasien" : "Daftar Dokter"}
            </button>
          ))}
        </div>

        {mode === "login" && (
          <div style={{ background: "#e8f5f1", borderRadius: 10, padding: "9px 13px", fontSize: 11.5, color: "#3d6058", marginBottom: 18, lineHeight: 1.8 }}>
            <strong>Admin:</strong> admin@mail.com / admin123<br />
            <strong>Dokter (contoh):</strong> sari.dewi@medicheck.id / dokter123<br />
            <strong>Pasien:</strong> daftar akun baru
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode !== "login" && (
            <InputField label="Nama Lengkap" value={name} onChange={setName} placeholder="cth. Dr. Budi Santoso" icon={User} required />
          )}

          {mode === "register-doctor" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3d6058", marginBottom: 5 }}>
                Spesialis <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fcfa", border: "1.5px solid #c8dfd8", borderRadius: 10, padding: "9px 12px" }}>
                <Stethoscope size={14} color="#7a9e96" />
                <select value={specialist} onChange={(e) => handleSpecialistChange(e.target.value)}
                  style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: specialist ? "#1a2e28" : "#9ca3af", fontFamily: "'Outfit',sans-serif", cursor: "pointer" }}>
                  <option value="">-- Pilih Spesialis --</option>
                  {SPECIALIST_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.label}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <InputField label="Alamat Email" value={email} onChange={setEmail} type="email" placeholder="nama@email.com" icon={Mail} required />
          <InputField label="Nomor HP" value={phone} onChange={setPhone} placeholder="0812-xxxx-xxxx" icon={Phone} />

          {mode === "register-doctor" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <InputField label="Rumah Sakit / Klinik" value={hospital} onChange={setHospital} placeholder="RS Medika Utama" icon={Building} />
                <InputField label="Pengalaman (tahun)" value={experience} onChange={setExperience} type="number" placeholder="cth. 8" icon={Award} />
              </div>
              <InputField label="Alamat RS / Klinik" value={hospitalAddress} onChange={setHospitalAddress} placeholder="Jl. Sudirman No. 12, Jakarta" icon={Building} />
              <InputField label="Pendidikan / Universitas" value={education} onChange={setEducation} placeholder="FK Universitas Indonesia" icon={BookOpen} />
              <InputField label="Nomor SIP (Surat Izin Praktik)" value={licenseNumber} onChange={setLicenseNumber} placeholder="SIP-001-2020" icon={Award} />
            </>
          )}

          {/* Password */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3d6058", marginBottom: 5 }}>
              Kata Sandi <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fcfa", border: "1.5px solid #c8dfd8", borderRadius: 10, padding: "9px 12px" }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#2a6e5e")}
              onBlurCapture={(e) => (e.currentTarget.style.borderColor = "#c8dfd8")}>
              <Lock size={14} color="#7a9e96" />
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan kata sandi"
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1a2e28", fontFamily: "'Outfit',sans-serif" }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}>
                {showPass ? <EyeOff size={14} color="#7a9e96" /> : <Eye size={14} color="#7a9e96" />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "#fee2e2", borderRadius: 10, padding: "9px 13px", fontSize: 12, color: "#dc2626", marginBottom: 14 }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: loading ? "#7a9e96" : "#2a6e5e", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif" }}>
            {loading ? "Memproses..." : mode === "login" ? "Masuk ke Akun" : mode === "register" ? "Buat Akun Pasien" : "Daftar sebagai Dokter"}
          </button>
        </form>
      </div>
    </>
  );
}
