"use client";
import { useState, useEffect, useCallback } from "react";
import {
  stats as statsApi, bookings as bookingsApi, doctors as doctorsApi, notifications as notifApi,
  medicalRecords as medicalApi, auth as authApi,
  type Booking, type MedicalRecord, type DoctorStats, type AuthUser, type DoctorSchedule, type Notification,
} from "@/lib/api";
import {
  Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle,
  Search, ChevronLeft, ChevronRight, X, Bell, Phone, Mail, MapPin,
  Users, Activity, Edit3, Save, BarChart2, Stethoscope, Award,
  BookOpen, Building, RefreshCw, Plus, Eye,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { User as UserType } from "../app/App";

interface DoctorDashboardProps {
  onUserUpdate?: (user: UserType) => void;
  user: UserType;
}

type DoctorTab = "overview" | "schedule" | "patients" | "records" | "profile";
type BookingStatus = "Menunggu" | "Terkonfirmasi" | "Selesai" | "Dibatalkan";

const STATUS_COLOR: Record<BookingStatus, string> = {
  Menunggu: "#d97706",
  Terkonfirmasi: "#2a6e5e",
  Selesai: "#6b7280",
  Dibatalkan: "#dc2626",
};

const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
}
function formatDateShort(d: string | Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

// ── Reusable Card ──
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "white", borderRadius: 20, padding: "22px 24px", border: "1px solid #e8f5f1", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  );
}

// ── Status Badge ──
function StatusBadge({ status }: { status: BookingStatus }) {
  const color = STATUS_COLOR[status] || "#6b7280";
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: `${color}18`, color, display: "inline-block" }}>
      {status}
    </span>
  );
}

// ── Medical Record Modal ──
function RecordModal({
  booking, onClose, onSaved,
}: {
  booking: Booking;
  onClose: () => void;
  onSaved: () => void;
}) {
  const existing = booking.medicalRecord;
  const [diagnosis, setDiagnosis] = useState(existing?.diagnosis || "");
  const [prescription, setPrescription] = useState(existing?.prescription || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [followUpDate, setFollowUpDate] = useState(
    existing?.followUpDate ? existing.followUpDate.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!diagnosis.trim()) { setError("Diagnosis wajib diisi"); return; }
    setSaving(true);
    setError("");
    try {
      if (existing) {
        await medicalApi.update(existing.id, { diagnosis, prescription, notes, followUpDate: followUpDate || undefined });
      } else {
        await medicalApi.create({ bookingId: booking.id, diagnosis, prescription, notes, followUpDate: followUpDate || undefined });
      }
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const inp = (label: string, value: string, setValue: (v: string) => void, multiline = false) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3d6058", marginBottom: 5 }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3}
          style={{ width: "100%", border: "1.5px solid #c8dfd8", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#1a2e28", fontFamily: "'Outfit',sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      ) : (
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)}
          style={{ width: "100%", border: "1.5px solid #c8dfd8", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#1a2e28", fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,36,32,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", zIndex: 301, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "100%", maxWidth: 520, background: "white", borderRadius: 22, padding: "28px 28px 24px", boxShadow: "0 32px 80px rgba(15,36,32,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f2420", fontFamily: "'Cormorant Garamond',serif" }}>
              {existing ? "Edit Rekam Medis" : "Buat Rekam Medis"}
            </h3>
            <p style={{ fontSize: 12, color: "#7a9e96", marginTop: 2 }}>Pasien: {booking.user?.name}</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#f0f9f6", borderRadius: 10, padding: 8, cursor: "pointer" }}>
            <X size={16} color="#5a7870" />
          </button>
        </div>

        <div style={{ background: "#f0f9f6", borderRadius: 12, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#3d6058" }}>
          <strong>Keluhan:</strong> {booking.disease} | <strong>Tanggal:</strong> {formatDateShort(booking.date)} {booking.time}
        </div>

        {inp("Diagnosis *", diagnosis, setDiagnosis, true)}
        {inp("Resep / Pengobatan", prescription, setPrescription, true)}
        {inp("Catatan Dokter", notes, setNotes, true)}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3d6058", marginBottom: 5 }}>Tanggal Follow-Up</label>
          <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)}
            style={{ width: "100%", border: "1.5px solid #c8dfd8", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#1a2e28", fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box" }} />
        </div>

        {error && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "9px 13px", fontSize: 12, color: "#dc2626", marginBottom: 14 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 11, border: "1.5px solid #c8dfd8", background: "white", color: "#5a7870", fontSize: 13, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
            Batal
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: "11px 0", borderRadius: 11, border: "none", background: saving ? "#7a9e96" : "#2a6e5e", color: "white", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif" }}>
            {saving ? "Menyimpan..." : <><Save size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />Simpan Rekam Medis</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Booking Detail Panel ──
function BookingPanel({
  booking, onClose, onStatusUpdate, onOpenRecord,
}: {
  booking: Booking;
  onClose: () => void;
  onStatusUpdate: (id: string, status: BookingStatus) => void;
  onOpenRecord: (b: Booking) => void;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatus = async (status: BookingStatus) => {
    setUpdatingStatus(true);
    await onStatusUpdate(booking.id, status);
    setUpdatingStatus(false);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 250, background: "rgba(15,36,32,0.3)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", zIndex: 251, right: 0, top: 0, bottom: 0, width: 400, background: "white", boxShadow: "-8px 0 32px rgba(0,0,0,0.1)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 24px 0", borderBottom: "1px solid #e8f5f1", paddingBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f2420", fontFamily: "'Cormorant Garamond',serif" }}>Detail Janji Temu</h3>
            <button onClick={onClose} style={{ border: "none", background: "#f0f9f6", borderRadius: 10, padding: 8, cursor: "pointer" }}>
              <X size={15} color="#5a7870" />
            </button>
          </div>
          <StatusBadge status={booking.status as BookingStatus} />
        </div>

        <div style={{ padding: "20px 24px", flex: 1 }}>
          {/* Patient info */}
          <div style={{ background: "#f8fcfa", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2420", marginBottom: 10 }}>Informasi Pasien</div>
            {[
              { icon: User, label: "Nama", value: booking.user?.name || "-" },
              { icon: Mail, label: "Email", value: booking.user?.email || "-" },
              { icon: Phone, label: "Telepon", value: booking.user?.phone || "-" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Icon size={13} color="#7a9e96" />
                <span style={{ fontSize: 12, color: "#5a7870", width: 60, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 12, color: "#1a2e28", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Appointment info */}
          <div style={{ background: "#f8fcfa", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2420", marginBottom: 10 }}>Detail Kunjungan</div>
            {[
              { icon: Calendar, label: "Tanggal", value: formatDateShort(booking.date) },
              { icon: Clock, label: "Waktu", value: booking.time },
              { icon: AlertCircle, label: "Keluhan", value: booking.disease },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <Icon size={13} color="#7a9e96" style={{ marginTop: 1 }} />
                <span style={{ fontSize: 12, color: "#5a7870", width: 60, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 12, color: "#1a2e28", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            {booking.notes && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <FileText size={13} color="#7a9e96" style={{ marginTop: 1 }} />
                <span style={{ fontSize: 12, color: "#5a7870", width: 60, flexShrink: 0 }}>Catatan</span>
                <span style={{ fontSize: 12, color: "#1a2e28" }}>{booking.notes}</span>
              </div>
            )}
          </div>

          {/* Medical Record preview */}
          {booking.medicalRecord && (
            <div style={{ background: "#e8f5f1", borderRadius: 14, padding: "14px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f2420", marginBottom: 8 }}>Rekam Medis</div>
              <div style={{ fontSize: 12, color: "#3d6058", marginBottom: 4 }}><strong>Diagnosis:</strong> {booking.medicalRecord.diagnosis}</div>
              {booking.medicalRecord.prescription && <div style={{ fontSize: 12, color: "#3d6058", marginBottom: 4 }}><strong>Resep:</strong> {booking.medicalRecord.prescription}</div>}
              {booking.medicalRecord.followUpDate && <div style={{ fontSize: 12, color: "#3d6058" }}><strong>Follow-up:</strong> {formatDateShort(booking.medicalRecord.followUpDate)}</div>}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#5a7870", marginBottom: 2 }}>Ubah Status</div>
            {(["Terkonfirmasi", "Selesai", "Dibatalkan"] as BookingStatus[]).filter(s => s !== booking.status).map((s) => (
              <button key={s} onClick={() => handleStatus(s)} disabled={updatingStatus}
                style={{ padding: "10px 14px", borderRadius: 11, border: `1.5px solid ${STATUS_COLOR[s]}40`, background: `${STATUS_COLOR[s]}08`, color: STATUS_COLOR[s], fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", textAlign: "left" }}>
                → Tandai {s}
              </button>
            ))}
          </div>

          <button onClick={() => onOpenRecord(booking)}
            style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: "#2a6e5e", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <FileText size={14} />
            {booking.medicalRecord ? "Edit Rekam Medis" : "Buat Rekam Medis"}
          </button>
        </div>
      </div>
    </>
  );
}

// ──────────── MAIN DOCTOR DASHBOARD ────────────
export function DoctorDashboard({ user, onUserUpdate }: DoctorDashboardProps) {
  const [tab, setTab] = useState<DoctorTab>("overview");
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [medicalRecordsList, setMedicalRecordsList] = useState<MedicalRecord[]>([]);
  const [doctorStats, setDoctorStats] = useState<DoctorStats | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // UI state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [recordModalBooking, setRecordModalBooking] = useState<Booking | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "Semua">("Semua");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<AuthUser>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Schedule edit state
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<DoctorSchedule[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const loadAll = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [bks, notifs, recs, st, prof] = await Promise.all([
        bookingsApi.list(),
        notifApi.list().catch(() => []),
        medicalApi.list(),
        statsApi.doctor(),
        authApi.me(),
      ]);
      setBookingsList(bks);
      setMedicalRecordsList(recs);
      setDoctorStats(st);
      setDoctorProfile(prof);
      setProfileForm({
        name: prof.name, phone: prof.phone || "", specialist: prof.specialist || "",
        specialistCode: prof.specialistCode || "", hospital: prof.hospital || "",
        hospitalAddress: prof.hospitalAddress || "", bio: prof.bio || "",
        experience: prof.experience || undefined, education: prof.education || "",
        licenseNumber: prof.licenseNumber || "", consultationFee: prof.consultationFee || undefined,
      });
      setScheduleForm(prof.schedules || []);
      setNotificationsList(notifs);
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleStatusUpdate = async (id: string, status: BookingStatus) => {
    try {
      await bookingsApi.updateStatus(id, status);
      setBookingsList((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      if (selectedBooking?.id === id) setSelectedBooking((prev) => prev ? { ...prev, status } : null);
      await loadAll(true);
    } catch (e) {
      console.error("Status update failed:", e);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile(profileForm);
      setDoctorProfile(updated);
      setEditingProfile(false);
      onUserUpdate?.({ id: updated.id, name: updated.name, email: updated.email, role: updated.role as "patient" | "doctor" | "admin", phone: updated.phone, specialist: updated.specialist, hospital: updated.hospital });
    } catch (e) {
      console.error("Save profile failed:", e);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const updated = await doctorsApi.updateSchedule(
        scheduleForm.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, isActive: s.isActive }))
      );
      setScheduleForm(updated);
      setEditingSchedule(false);
    } catch (e) {
      console.error("Save schedule failed:", e);
    } finally {
      setSavingSchedule(false);
    }
  };

  const toggleScheduleDay = (dayOfWeek: number) => {
    const existing = scheduleForm.find((s) => s.dayOfWeek === dayOfWeek);
    if (existing) {
      setScheduleForm((prev) => prev.map((s) => s.dayOfWeek === dayOfWeek ? { ...s, isActive: !s.isActive } : s));
    } else {
      setScheduleForm((prev) => [...prev, { id: `new-${dayOfWeek}`, doctorId: user.id, dayOfWeek, startTime: "08:00", endTime: "17:00", isActive: true }]);
    }
  };

  const updateScheduleTime = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    setScheduleForm((prev) => prev.map((s) => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s));
  };

  // Derived
  const today = new Date();
  const todayBookings = bookingsList.filter((b) => isSameDay(new Date(b.date), today));
  const scheduleBookings = bookingsList.filter((b) => isSameDay(new Date(b.date), scheduleDate)).sort((a, b) => a.time.localeCompare(b.time));
  const pendingCount = bookingsList.filter((b) => b.status === "Menunggu").length;

  const filteredBookings = bookingsList.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (b.user?.name || "").toLowerCase().includes(q) || b.disease.toLowerCase().includes(q);
    const matchStatus = filterStatus === "Semua" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Unique patients
  const uniquePatients = Array.from(new Map(
    bookingsList.map((b) => [b.userId, b])
  ).values());

  const docName = doctorProfile?.name || user.name || "Dokter";
  const docSpecialty = doctorProfile?.specialist || user.specialist || "Dokter";
  const docHospital = doctorProfile?.hospital || user.hospital || "-";
  const docInitials = docName.split(" ").filter((w) => !w.toLowerCase().startsWith("dr")).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "DR";

  const notifList = bookingsList.filter((b) => b.status === "Menunggu").slice(0, 5);

  const TABS: { id: DoctorTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Ringkasan", icon: BarChart2 },
    { id: "schedule", label: "Jadwal", icon: Calendar },
    { id: "patients", label: "Semua Pasien", icon: Users },
    { id: "records", label: "Rekam Medis", icon: FileText },
    { id: "profile", label: "Profil Saya", icon: User },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fcfa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #e8f5f1", borderTopColor: "#2a6e5e", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#7a9e96", fontSize: 14 }}>Memuat data dokter...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f8fcfa" }}>
      {/* ── Doctor Header ── */}
      <div style={{ background: "linear-gradient(135deg, #0f2420 0%, #1a4035 100%)", padding: "28px 24px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {doctorProfile?.photoUrl ? (
                <img src={doctorProfile.photoUrl} alt={docName} style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #2a6e5e, #5ecfb1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "white", fontFamily: "'Cormorant Garamond',serif", boxShadow: "0 4px 16px rgba(42,110,94,0.3)" }}>
                  {docInitials}
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 3 }}>Dashboard Dokter</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: "'Cormorant Garamond',serif" }}>{docName}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{docSpecialty} · {docHospital}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => loadAll(true)} disabled={refreshing}
                style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 14px", color: "rgba(255,255,255,0.8)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <RefreshCw size={12} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} /> Refresh
              </button>
              <div style={{ position: "relative" }}>
                <button onClick={() => setNotifOpen(!notifOpen)}
                  style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", color: "rgba(255,255,255,0.8)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Bell size={15} />
                  {pendingCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: "#ef4444", color: "white", borderRadius: 10, padding: "1px 6px" }}>{pendingCount}</span>}
                </button>
                {notifOpen && (
                  <>
                    <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
                    <div style={{ position: "absolute", right: 0, top: 44, width: 300, background: "white", borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.15)", zIndex: 101, overflow: "hidden" }}>
                      <div style={{ padding: "14px 16px", borderBottom: "1px solid #e8f5f1", fontSize: 13, fontWeight: 600, color: "#0f2420" }}>Menunggu Konfirmasi ({pendingCount})</div>
                      {notifList.length === 0 ? (
                        <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#7a9e96" }}>Tidak ada notifikasi</div>
                      ) : notifList.map((b) => (
                        <div key={b.id} onClick={() => { setSelectedBooking(b); setNotifOpen(false); }}
                          style={{ padding: "12px 16px", borderBottom: "1px solid #f0f9f6", cursor: "pointer", background: "white" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fcfa")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2420" }}>{b.user?.name}</div>
                          <div style={{ fontSize: 11, color: "#7a9e96" }}>{b.disease} · {formatDateShort(b.date)} {b.time}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ padding: "10px 18px", borderRadius: "12px 12px 0 0", border: "none", background: tab === id ? "#f8fcfa" : "transparent", color: tab === id ? "#2a6e5e" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: tab === id ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 48px" }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div>
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { label: "Hari Ini", value: todayBookings.filter(b => b.status !== "Dibatalkan").length, icon: Calendar, color: "#2a6e5e", sub: "janji temu" },
                { label: "Menunggu", value: doctorStats?.pending || 0, icon: AlertCircle, color: "#d97706", sub: "perlu konfirmasi" },
                { label: "Total Pasien", value: doctorStats?.uniquePatients || uniquePatients.length, icon: Users, color: "#8b5cf6", sub: "pasien unik" },
                { label: "Rekam Medis", value: doctorStats?.totalRecords || medicalRecordsList.length, icon: FileText, color: "#0ea5e9", sub: "dibuat" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <Card key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} color={s.color} />
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: "#0f2420", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0f2420", marginTop: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#7a9e96", marginTop: 3 }}>{s.sub}</div>
                  </Card>
                );
              })}
            </div>

            {/* Today + Pending */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 14 }}>Janji Temu Hari Ini</div>
                {todayBookings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#7a9e96", fontSize: 13 }}>Tidak ada janji temu hari ini</div>
                ) : todayBookings.slice(0, 5).map((b) => (
                  <div key={b.id} onClick={() => setSelectedBooking(b)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 12, background: "#f8fcfa", marginBottom: 8, cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#e8f5f1")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fcfa")}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2420" }}>{b.user?.name}</div>
                      <div style={{ fontSize: 11, color: "#7a9e96" }}>{b.time} · {b.disease}</div>
                    </div>
                    <StatusBadge status={b.status as BookingStatus} />
                  </div>
                ))}
              </Card>

              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 14 }}>Status Booking</div>
                {doctorStats && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Menunggu", count: doctorStats.pending, color: "#d97706" },
                      { label: "Terkonfirmasi", count: doctorStats.confirmed, color: "#2a6e5e" },
                      { label: "Selesai", count: doctorStats.done, color: "#6b7280" },
                      { label: "Dibatalkan", count: doctorStats.cancelled, color: "#dc2626" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: "#5a7870" }}>{item.label}</span>
                          <span style={{ fontWeight: 600, color: "#0f2420" }}>{item.count}</span>
                        </div>
                        <div style={{ height: 6, background: "#f0f9f6", borderRadius: 3 }}>
                          <div style={{ height: 6, borderRadius: 3, background: item.color, width: `${doctorStats.total ? (item.count / doctorStats.total) * 100 : 0}%`, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab === "schedule" && (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
            {/* Calendar nav */}
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 16 }}>Pilih Tanggal</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <button onClick={() => { const d = new Date(scheduleDate); d.setDate(d.getDate() - 1); setScheduleDate(d); }}
                  style={{ border: "1px solid #e8f5f1", background: "white", borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}>
                  <ChevronLeft size={14} color="#5a7870" />
                </button>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0f2420" }}>{formatDateShort(scheduleDate.toISOString())}</span>
                <button onClick={() => { const d = new Date(scheduleDate); d.setDate(d.getDate() + 1); setScheduleDate(d); }}
                  style={{ border: "1px solid #e8f5f1", background: "white", borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}>
                  <ChevronRight size={14} color="#5a7870" />
                </button>
              </div>
              <button onClick={() => setScheduleDate(new Date())}
                style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "1.5px solid #2a6e5e", background: "transparent", color: "#2a6e5e", fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 16, fontFamily: "'Outfit',sans-serif" }}>
                Hari Ini
              </button>

              {/* Jadwal Praktik section */}
              <div style={{ borderTop: "1px solid #e8f5f1", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2420" }}>Jadwal Praktik</div>
                  <button onClick={() => setEditingSchedule(!editingSchedule)}
                    style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}>
                    <Edit3 size={13} color="#2a6e5e" />
                  </button>
                </div>
                {editingSchedule ? (
                  <div>
                    {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                      const sched = scheduleForm.find((s) => s.dayOfWeek === day);
                      const active = sched?.isActive || false;
                      return (
                        <div key={day} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: active ? 6 : 0 }}>
                            <div onClick={() => toggleScheduleDay(day)}
                              style={{ width: 28, height: 16, borderRadius: 8, background: active ? "#2a6e5e" : "#e8f5f1", cursor: "pointer", display: "flex", alignItems: "center", padding: "0 3px", transition: "background 0.2s" }}>
                              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white", marginLeft: active ? "auto" : 0, transition: "margin 0.2s" }} />
                            </div>
                            <span style={{ fontSize: 12, color: active ? "#0f2420" : "#9ca3af", fontWeight: active ? 600 : 400 }}>{DAY_LABELS[day]}</span>
                          </div>
                          {active && sched && (
                            <div style={{ display: "flex", gap: 6, paddingLeft: 36 }}>
                              <input type="time" value={sched.startTime} onChange={(e) => updateScheduleTime(day, "startTime", e.target.value)}
                                style={{ flex: 1, border: "1px solid #c8dfd8", borderRadius: 7, padding: "4px 6px", fontSize: 11, color: "#1a2e28", fontFamily: "'Outfit',sans-serif" }} />
                              <span style={{ fontSize: 11, color: "#7a9e96", display: "flex", alignItems: "center" }}>–</span>
                              <input type="time" value={sched.endTime} onChange={(e) => updateScheduleTime(day, "endTime", e.target.value)}
                                style={{ flex: 1, border: "1px solid #c8dfd8", borderRadius: 7, padding: "4px 6px", fontSize: 11, color: "#1a2e28", fontFamily: "'Outfit',sans-serif" }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => setEditingSchedule(false)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "1px solid #c8dfd8", background: "white", color: "#5a7870", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Batal</button>
                      <button onClick={handleSaveSchedule} disabled={savingSchedule}
                        style={{ flex: 2, padding: "8px 0", borderRadius: 9, border: "none", background: "#2a6e5e", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                        {savingSchedule ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </div>
                ) : (
                  scheduleForm.filter((s) => s.isActive).length === 0 ? (
                    <p style={{ fontSize: 12, color: "#7a9e96" }}>Belum ada jadwal praktik. Klik edit untuk menambahkan.</p>
                  ) : scheduleForm.filter((s) => s.isActive).sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((s) => (
                    <div key={s.dayOfWeek} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f9f6" }}>
                      <span style={{ fontSize: 12, color: "#3d6058" }}>{DAY_LABELS[s.dayOfWeek]}</span>
                      <span style={{ fontSize: 11, color: "#7a9e96" }}>{s.startTime} – {s.endTime}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Day appointments */}
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 4 }}>{formatDate(scheduleDate)}</div>
              <div style={{ fontSize: 12, color: "#7a9e96", marginBottom: 16 }}>{scheduleBookings.length} janji temu</div>
              {scheduleBookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#7a9e96", fontSize: 13 }}>Tidak ada janji temu pada hari ini</div>
              ) : scheduleBookings.map((b) => (
                <div key={b.id} onClick={() => setSelectedBooking(b)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #e8f5f1", marginBottom: 10, cursor: "pointer", background: "white" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a6e5e")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e8f5f1")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e8f5f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Clock size={16} color="#2a6e5e" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420" }}>{b.time}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2e28", marginTop: 1 }}>{b.user?.name}</div>
                      <div style={{ fontSize: 12, color: "#7a9e96" }}>{b.disease}</div>
                    </div>
                  </div>
                  <StatusBadge status={b.status as BookingStatus} />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── PATIENTS TAB ── */}
        {tab === "patients" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "white", border: "1.5px solid #e8f5f1", borderRadius: 12, padding: "10px 14px" }}>
                <Search size={14} color="#7a9e96" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama pasien atau keluhan..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#1a2e28", fontFamily: "'Outfit',sans-serif" }} />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as BookingStatus | "Semua")}
                style={{ padding: "10px 14px", border: "1.5px solid #e8f5f1", borderRadius: 12, fontSize: 13, color: "#1a2e28", fontFamily: "'Outfit',sans-serif", background: "white", cursor: "pointer" }}>
                <option value="Semua">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Terkonfirmasi">Terkonfirmasi</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>

            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 16 }}>
                Semua Janji Temu ({filteredBookings.length})
              </div>
              {filteredBookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#7a9e96", fontSize: 13 }}>Tidak ada data janji temu</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filteredBookings.map((b) => (
                    <div key={b.id} onClick={() => setSelectedBooking(b)}
                      style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px 120px 40px", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "1px solid #e8f5f1", cursor: "pointer", background: "white" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fcfa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2420" }}>{b.user?.name}</div>
                        <div style={{ fontSize: 11, color: "#7a9e96" }}>{b.user?.email}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "#1a2e28" }}>{b.disease}</div>
                        {b.notes && <div style={{ fontSize: 11, color: "#9ca3af" }}>{b.notes.slice(0, 40)}...</div>}
                      </div>
                      <div style={{ fontSize: 12, color: "#5a7870" }}>
                        {formatDateShort(b.date)} · {b.time}
                      </div>
                      <StatusBadge status={b.status as BookingStatus} />
                      <Eye size={14} color="#7a9e96" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── RECORDS TAB ── */}
        {tab === "records" && (
          <div>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 16 }}>
                Rekam Medis Pasien ({medicalRecordsList.length})
              </div>
              {medicalRecordsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <FileText size={40} color="#c8dfd8" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14, color: "#7a9e96", marginBottom: 6 }}>Belum ada rekam medis</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>Buat rekam medis dari halaman Jadwal atau Semua Pasien</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {medicalRecordsList.map((r) => (
                    <div key={r.id} style={{ padding: "16px", borderRadius: 14, border: "1px solid #e8f5f1", background: "white" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420" }}>{r.patient?.name}</div>
                          <div style={{ fontSize: 11, color: "#7a9e96" }}>Dibuat: {formatDateShort(r.createdAt)}</div>
                        </div>
                        {r.followUpDate && (
                          <div style={{ fontSize: 11, padding: "3px 10px", background: "#e8f5f1", borderRadius: 20, color: "#2a6e5e", fontWeight: 500 }}>
                            Follow-up: {formatDateShort(r.followUpDate)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ background: "#f8fcfa", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, color: "#7a9e96", marginBottom: 3 }}>Diagnosis</div>
                          <div style={{ fontSize: 13, color: "#0f2420", fontWeight: 500 }}>{r.diagnosis}</div>
                        </div>
                        {r.prescription && (
                          <div style={{ background: "#f8fcfa", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, color: "#7a9e96", marginBottom: 3 }}>Resep</div>
                            <div style={{ fontSize: 13, color: "#0f2420" }}>{r.prescription}</div>
                          </div>
                        )}
                      </div>
                      {r.notes && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "#5a7870", fontStyle: "italic" }}>Catatan: {r.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && doctorProfile && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
            {/* Profile card */}
            <Card style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: 22, margin: "0 auto 14px", background: "linear-gradient(135deg, #2a6e5e, #5ecfb1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white", fontFamily: "'Cormorant Garamond',serif", boxShadow: "0 8px 24px rgba(42,110,94,0.2)" }}>
                {docInitials}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f2420", marginBottom: 4 }}>{docName}</div>
              <div style={{ fontSize: 13, color: "#2a6e5e", fontWeight: 500, marginBottom: 2 }}>{docSpecialty}</div>
              <div style={{ fontSize: 12, color: "#7a9e96", marginBottom: 16 }}>{docHospital}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: Phone, value: doctorProfile.phone || "-" },
                  { icon: Mail, value: doctorProfile.email },
                  { icon: MapPin, value: doctorProfile.hospitalAddress || "-" },
                  { icon: Award, value: doctorProfile.licenseNumber || "-" },
                ].map(({ icon: Icon, value }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f8fcfa", borderRadius: 10 }}>
                    <Icon size={13} color="#2a6e5e" />
                    <span style={{ fontSize: 12, color: "#5a7870", textAlign: "left" }}>{value}</span>
                  </div>
                ))}
              </div>
              {doctorProfile.consultationFee && (
                <div style={{ marginTop: 14, padding: 14, background: "#e8f5f1", borderRadius: 14 }}>
                  <div style={{ fontSize: 11, color: "#5a7870", marginBottom: 4 }}>Biaya Konsultasi</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#0f2420", fontFamily: "'Cormorant Garamond',serif" }}>
                    {formatCurrency(doctorProfile.consultationFee)}
                  </div>
                </div>
              )}
            </Card>

            {/* Edit profile */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f2420" }}>Informasi Profil</div>
                <button onClick={() => setEditingProfile(!editingProfile)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: editingProfile ? "1.5px solid #dc2626" : "1.5px solid #2a6e5e", background: "white", color: editingProfile ? "#dc2626" : "#2a6e5e", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                  {editingProfile ? <><X size={12} /> Batal</> : <><Edit3 size={12} /> Edit Profil</>}
                </button>
              </div>

              {editingProfile ? (
                <div>
                  {([
                    { label: "Nama Lengkap", key: "name", icon: User },
                    { label: "Nomor HP", key: "phone", icon: Phone },
                    { label: "Spesialis", key: "specialist", icon: Stethoscope },
                    { label: "Kode Spesialis", key: "specialistCode", icon: Stethoscope },
                    { label: "Rumah Sakit / Klinik", key: "hospital", icon: Building },
                    { label: "Alamat RS / Klinik", key: "hospitalAddress", icon: MapPin },
                    { label: "Pendidikan", key: "education", icon: BookOpen },
                    { label: "Nomor SIP", key: "licenseNumber", icon: Award },
                    { label: "Pengalaman (tahun)", key: "experience", icon: Activity },
                    { label: "Biaya Konsultasi (IDR)", key: "consultationFee", icon: Activity },
                  ] as { label: string; key: keyof typeof profileForm; icon: React.ElementType }[]).map(({ label, key, icon: Icon }) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3d6058", marginBottom: 5 }}>{label}</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fcfa", border: "1.5px solid #c8dfd8", borderRadius: 10, padding: "9px 12px" }}>
                        <Icon size={13} color="#7a9e96" />
                        <input type={key === "experience" || key === "consultationFee" ? "number" : "text"}
                          value={(profileForm[key] as string | number | undefined) || ""}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1a2e28", fontFamily: "'Outfit',sans-serif" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3d6058", marginBottom: 5 }}>Bio / Tentang Saya</label>
                    <textarea value={profileForm.bio || ""} onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))} rows={3}
                      style={{ width: "100%", border: "1.5px solid #c8dfd8", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#1a2e28", fontFamily: "'Outfit',sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: savingProfile ? "#7a9e96" : "#2a6e5e", color: "white", fontSize: 13, fontWeight: 600, cursor: savingProfile ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif" }}>
                    {savingProfile ? "Menyimpan..." : <><Save size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />Simpan Profil</>}
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {([
                    { label: "Spesialis", value: doctorProfile.specialist },
                    { label: "Pengalaman", value: doctorProfile.experience ? `${doctorProfile.experience} tahun` : "-" },
                    { label: "Pendidikan", value: doctorProfile.education },
                    { label: "Nomor SIP", value: doctorProfile.licenseNumber },
                    { label: "Biaya Konsultasi", value: doctorProfile.consultationFee ? formatCurrency(doctorProfile.consultationFee) : "-" },
                    { label: "Bergabung", value: formatDateShort(doctorProfile.createdAt || "") },
                  ].filter(i => i.value)).map(({ label, value }, i) => (
                    <div key={i} style={{ background: "#f8fcfa", borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11, color: "#7a9e96", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, color: "#0f2420", fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                  {doctorProfile.bio && (
                    <div style={{ gridColumn: "1 / -1", background: "#f8fcfa", borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11, color: "#7a9e96", marginBottom: 4 }}>Bio</div>
                      <div style={{ fontSize: 13, color: "#0f2420" }}>{doctorProfile.bio}</div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* ── Booking Detail Panel ── */}
      {selectedBooking && (
        <BookingPanel
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusUpdate={handleStatusUpdate}
          onOpenRecord={(b) => { setSelectedBooking(null); setRecordModalBooking(b); }}
        />
      )}

      {/* ── Medical Record Modal ── */}
      {recordModalBooking && (
        <RecordModal
          booking={recordModalBooking}
          onClose={() => setRecordModalBooking(null)}
          onSaved={() => loadAll(true)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}