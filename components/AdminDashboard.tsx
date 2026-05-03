import { useState, useRef } from "react";
import {
  Users,
  Activity,
  Calendar,
  Settings,
  FileText,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  TrendingUp,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Bell,
  Lock,
  Mail,
  Phone,
  Save,
  X,
  RotateCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { User as UserType } from "../app/App";

interface AdminDashboardProps {
  user: UserType;
}

// ──────────── TYPES ────────────
type UserRole = "patient" | "doctor" | "admin";
type AppStatus = "Menunggu" | "Terkonfirmasi" | "Selesai" | "Dibatalkan";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "Aktif" | "Nonaktif";
  joinDate: string;
  lastActive: string;
  appointments?: number;
}

interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  status: AppStatus;
  disease: string;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: "info" | "warning" | "success" | "error";
}

// ──────────── MOCK DATA ────────────
const INITIAL_USERS: SystemUser[] = [
  {
    id: "USR001",
    name: "Budi Santoso",
    email: "budi@example.com",
    phone: "0821-3456-7890",
    role: "patient",
    status: "Aktif",
    joinDate: "15 Jan 2026",
    lastActive: "2 jam lalu",
    appointments: 5,
  },
  {
    id: "USR002",
    name: "Siti Aminah",
    email: "siti@example.com",
    phone: "0856-7891-2340",
    role: "patient",
    status: "Aktif",
    joinDate: "20 Jan 2026",
    lastActive: "1 hari lalu",
    appointments: 3,
  },
  {
    id: "USR003",
    name: "Ahmad Fauzi",
    email: "ahmad@example.com",
    phone: "0812-9087-6543",
    role: "patient",
    status: "Aktif",
    joinDate: "5 Feb 2026",
    lastActive: "3 jam lalu",
    appointments: 7,
  },
  {
    id: "USR004",
    name: "Rina Kartika",
    email: "rina@example.com",
    phone: "0878-2345-6789",
    role: "patient",
    status: "Nonaktif",
    joinDate: "12 Feb 2026",
    lastActive: "5 hari lalu",
    appointments: 1,
  },
  {
    id: "DOC001",
    name: "Dr. Sari Dewi",
    email: "dokter@example.com",
    phone: "0811-2233-4455",
    role: "doctor",
    status: "Aktif",
    joinDate: "1 Jan 2026",
    lastActive: "30 menit lalu",
    appointments: 45,
  },
  {
    id: "DOC002",
    name: "Dr. Budi Hartono",
    email: "budi.dr@medicheck.com",
    phone: "0822-3344-5566",
    role: "doctor",
    status: "Aktif",
    joinDate: "1 Jan 2026",
    lastActive: "1 jam lalu",
    appointments: 38,
  },
  {
    id: "DOC003",
    name: "Dr. Maya Indira",
    email: "maya.dr@medicheck.com",
    phone: "0833-4455-6677",
    role: "doctor",
    status: "Aktif",
    joinDate: "10 Jan 2026",
    lastActive: "15 menit lalu",
    appointments: 29,
  },
  {
    id: "ADM001",
    name: "Admin MediCheck",
    email: "admin@medicheck.com",
    phone: "0800-1234-5678",
    role: "admin",
    status: "Aktif",
    joinDate: "1 Jan 2026",
    lastActive: "Sekarang",
    appointments: 0,
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "APT001",
    patient: "Budi Santoso",
    doctor: "Dr. Sari Dewi",
    date: "14 Apr 2026",
    time: "10:00",
    status: "Terkonfirmasi",
    disease: "Sakit Kepala",
  },
  {
    id: "APT002",
    patient: "Siti Aminah",
    doctor: "Dr. Budi Hartono",
    date: "14 Apr 2026",
    time: "11:00",
    status: "Menunggu",
    disease: "Demam",
  },
  {
    id: "APT003",
    patient: "Ahmad Fauzi",
    doctor: "Dr. Maya Indira",
    date: "14 Apr 2026",
    time: "14:00",
    status: "Terkonfirmasi",
    disease: "Batuk",
  },
  {
    id: "APT004",
    patient: "Rina Kartika",
    doctor: "Dr. Sari Dewi",
    date: "15 Apr 2026",
    time: "09:00",
    status: "Menunggu",
    disease: "Influenza",
  },
  {
    id: "APT005",
    patient: "Budi Santoso",
    doctor: "Dr. Budi Hartono",
    date: "15 Apr 2026",
    time: "13:00",
    status: "Selesai",
    disease: "Gastritis",
  },
  {
    id: "APT006",
    patient: "Ahmad Fauzi",
    doctor: "Dr. Maya Indira",
    date: "13 Apr 2026",
    time: "10:00",
    status: "Dibatalkan",
    disease: "Migrain",
  },
];

const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "LOG001",
    user: "Budi Santoso",
    action: "Membuat janji temu baru dengan Dr. Sari Dewi",
    timestamp: "2 jam lalu",
    type: "success",
  },
  {
    id: "LOG002",
    user: "Dr. Sari Dewi",
    action: "Mengkonfirmasi janji temu APT001",
    timestamp: "3 jam lalu",
    type: "info",
  },
  {
    id: "LOG003",
    user: "Siti Aminah",
    action: "Menyelesaikan screening gejala",
    timestamp: "5 jam lalu",
    type: "success",
  },
  {
    id: "LOG004",
    user: "Ahmad Fauzi",
    action: "Membatalkan janji temu APT006",
    timestamp: "1 hari lalu",
    type: "warning",
  },
  {
    id: "LOG005",
    user: "Admin MediCheck",
    action: "Memperbarui pengaturan sistem",
    timestamp: "2 hari lalu",
    type: "info",
  },
  {
    id: "LOG006",
    user: "Dr. Maya Indira",
    action: "Login ke sistem",
    timestamp: "3 hari lalu",
    type: "info",
  },
  {
    id: "LOG007",
    user: "Rina Kartika",
    action: "Gagal login — kata sandi salah",
    timestamp: "3 hari lalu",
    type: "error",
  },
  {
    id: "LOG008",
    user: "Budi Santoso",
    action: "Memperbarui profil pengguna",
    timestamp: "4 hari lalu",
    type: "info",
  },
  {
    id: "LOG009",
    user: "Dr. Budi Hartono",
    action: "Menambahkan slot jadwal baru",
    timestamp: "4 hari lalu",
    type: "success",
  },
  {
    id: "LOG010",
    user: "Admin MediCheck",
    action: "Menonaktifkan akun Rina Kartika",
    timestamp: "5 hari lalu",
    type: "warning",
  },
];

const CHART_COLORS = {
  primary: "#2a6e5e",
  secondary: "#5ecfb1",
  tertiary: "#3d9e86",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
};

const roleColors: Record<UserRole, { bg: string; color: string }> = {
  patient: { bg: "#eff6ff", color: "#3b82f6" },
  doctor: { bg: "#f3e8ff", color: "#8b5cf6" },
  admin: { bg: "#fee2e2", color: "#ef4444" },
};

const roleLabels: Record<UserRole, string> = {
  patient: "Pasien",
  doctor: "Dokter",
  admin: "Admin",
};

// ──────────── TOAST COMPONENT ────────────
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  const colors = {
    success: {
      bg: "#d1fae5",
      border: "#a7f3d0",
      color: "#065f46",
      icon: CheckCircle,
    },
    error: {
      bg: "#fee2e2",
      border: "#fecaca",
      color: "#991b1b",
      icon: XCircle,
    },
    info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", icon: Bell },
  };
  const c = colors[type];
  const Icon = c.icon;
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        color: c.color,
        padding: "14px 20px",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Outfit', sans-serif",
        minWidth: 280,
      }}
    >
      <Icon size={18} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 2,
        }}
      >
        <X size={16} color={c.color} />
      </button>
    </div>
  );
}

// ──────────── CONFIRM DIALOG ────────────
function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  danger,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 400,
          background: "rgba(15,36,32,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          zIndex: 401,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "100%",
          maxWidth: 400,
          background: "white",
          borderRadius: 20,
          padding: "28px 32px",
          boxShadow: "0 32px 80px rgba(15,36,32,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: danger ? "#fee2e2" : "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={22} color={danger ? "#ef4444" : "#d97706"} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f2420" }}>
            {title}
          </h3>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#5a7870",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 12,
              border: "1.5px solid #e5f0ed",
              background: "white",
              color: "#5a7870",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 12,
              border: "none",
              background: danger ? "#ef4444" : "#2a6e5e",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </>
  );
}

// ──────────── MAIN COMPONENT ────────────
export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "appointments" | "settings" | "logs"
  >("overview");
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [appointments, setAppointments] =
    useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Data berhasil diperbarui", "success");
    }, 1200);
  };

  const tabs = [
    { id: "overview", label: "Ringkasan Sistem", icon: Activity },
    { id: "users", label: "Kelola Pengguna", icon: Users },
    { id: "appointments", label: "Kelola Janji Temu", icon: Calendar },
    { id: "settings", label: "Pengaturan", icon: Settings },
    { id: "logs", label: "Log Aktivitas", icon: FileText },
  ];

  const totalUsers = users.length;
  const totalPatients = users.filter((u) => u.role === "patient").length;
  const totalDoctors = users.filter((u) => u.role === "doctor").length;
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(
    (a) => a.status === "Menunggu",
  ).length;
  const confirmedAppointments = appointments.filter(
    (a) => a.status === "Terkonfirmasi",
  ).length;
  const completedAppointments = appointments.filter(
    (a) => a.status === "Selesai",
  ).length;

  const appointmentStatusData = [
    {
      name: "Menunggu",
      value: pendingAppointments,
      color: CHART_COLORS.warning,
    },
    {
      name: "Terkonfirmasi",
      value: confirmedAppointments,
      color: CHART_COLORS.primary,
    },
    {
      name: "Selesai",
      value: completedAppointments,
      color: CHART_COLORS.secondary,
    },
    {
      name: "Dibatalkan",
      value: appointments.filter((a) => a.status === "Dibatalkan").length,
      color: CHART_COLORS.danger,
    },
  ];

  const weeklyActivityData = [
    { day: "Sen", screenings: 12, appointments: 8 },
    { day: "Sel", screenings: 15, appointments: 10 },
    { day: "Rab", screenings: 18, appointments: 12 },
    { day: "Kam", screenings: 14, appointments: 9 },
    { day: "Jum", screenings: 20, appointments: 15 },
    { day: "Sab", screenings: 10, appointments: 6 },
    { day: "Min", screenings: 8, appointments: 4 },
  ];

  const userGrowthData = [
    { month: "Jan", patients: 45, doctors: 3 },
    { month: "Feb", patients: 58, doctors: 5 },
    { month: "Mar", patients: 72, doctors: 6 },
    { month: "Apr", patients: totalPatients + 85, doctors: totalDoctors + 4 },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f8fcfa" }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f2420 0%, #1a4035 100%)",
          padding: "28px 24px 0",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>
                  Admin Dashboard
                </div>
                <div style={{ fontSize: 13, color: "#5ecfb1", marginTop: 2 }}>
                  Selamat datang, {user.name.split(" ")[0]}
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
              }
            >
              <RefreshCw
                size={14}
                style={{
                  transition: "transform 0.6s",
                  transform: isRefreshing ? "rotate(360deg)" : "rotate(0deg)",
                }}
              />
              {isRefreshing ? "Memperbarui..." : "Refresh Data"}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "12px 20px",
                    border: "none",
                    background: "transparent",
                    color:
                      activeTab === t.id ? "white" : "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    fontWeight: activeTab === t.id ? 600 : 400,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    borderBottom:
                      activeTab === t.id
                        ? "2px solid #5ecfb1"
                        : "2px solid transparent",
                    transition: "all .15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 32px" }}>
        {activeTab === "overview" && (
          <OverviewTab
            totalUsers={totalUsers}
            totalPatients={totalPatients}
            totalDoctors={totalDoctors}
            totalAppointments={totalAppointments}
            pendingAppointments={pendingAppointments}
            appointmentStatusData={appointmentStatusData}
            weeklyActivityData={weeklyActivityData}
            userGrowthData={userGrowthData}
          />
        )}
        {activeTab === "users" && (
          <UsersTab users={users} setUsers={setUsers} showToast={showToast} />
        )}
        {activeTab === "appointments" && (
          <AppointmentsTab
            appointments={appointments}
            setAppointments={setAppointments}
            showToast={showToast}
          />
        )}
        {activeTab === "settings" && <SettingsTab showToast={showToast} />}
        {activeTab === "logs" && <LogsTab logs={MOCK_ACTIVITY_LOGS} />}
      </div>
    </div>
  );
}

// ──────────── OVERVIEW TAB ────────────
function OverviewTab({
  totalUsers,
  totalPatients,
  totalDoctors,
  totalAppointments,
  pendingAppointments,
  appointmentStatusData,
  weeklyActivityData,
  userGrowthData,
}: {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  appointmentStatusData: any[];
  weeklyActivityData: any[];
  userGrowthData: any[];
}) {
  const stats = [
    {
      label: "Total Pengguna",
      value: totalUsers,
      change: "+12%",
      icon: Users,
      color: "#2a6e5e",
      bg: "#e8f5f1",
    },
    {
      label: "Total Pasien",
      value: totalPatients,
      change: "+8%",
      icon: UserCheck,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      label: "Total Dokter",
      value: totalDoctors,
      change: "+2",
      icon: Activity,
      color: "#8b5cf6",
      bg: "#f3e8ff",
    },
    {
      label: "Total Janji Temu",
      value: totalAppointments,
      change: "+15%",
      icon: Calendar,
      color: "#f59e0b",
      bg: "#fef3c7",
    },
    {
      label: "Menunggu Konfirmasi",
      value: pendingAppointments,
      change: "-3",
      icon: Clock,
      color: "#ef4444",
      bg: "#fee2e2",
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                border: "1px solid #e5f0ed",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: stat.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={stat.color} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: stat.change.startsWith("+") ? "#10b981" : "#ef4444",
                    background: stat.change.startsWith("+")
                      ? "#d1fae5"
                      : "#fee2e2",
                    padding: "3px 8px",
                    borderRadius: 6,
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#0f2420",
                  marginBottom: 6,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 15, color: "#7a9e96" }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "28px 30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #e5f0ed",
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#0f2420",
              marginBottom: 20,
            }}
          >
            Status Janji Temu
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={appointmentStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {appointmentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "24px 26px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #e5f0ed",
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#0f2420",
              marginBottom: 18,
            }}
          >
            Aktivitas Mingguan
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5f0ed" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#7a9e96" }} />
              <YAxis tick={{ fontSize: 12, fill: "#7a9e96" }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="screenings"
                name="Screening"
                fill={CHART_COLORS.primary}
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="appointments"
                name="Janji Temu"
                fill={CHART_COLORS.secondary}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: "24px 26px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e5f0ed",
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#0f2420",
            marginBottom: 18,
          }}
        >
          Pertumbuhan Pengguna
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5f0ed" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a9e96" }} />
            <YAxis tick={{ fontSize: 12, fill: "#7a9e96" }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="patients"
              name="Pasien"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="doctors"
              name="Dokter"
              stroke={CHART_COLORS.info}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ──────────── USERS TAB ────────────
function UsersTab({
  users,
  setUsers,
  showToast,
}: {
  users: SystemUser[];
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | UserRole>("all");
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SystemUser | null>(null);
  const [editForm, setEditForm] = useState<Partial<SystemUser>>({});
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "patient" as UserRole,
  });

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openEdit = (u: SystemUser) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
    });
    setSelectedUser(null);
  };

  const saveEdit = () => {
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...u, ...editForm } : u)),
    );
    setEditingUser(null);
    showToast(
      `Data ${editForm.name || editingUser.name} berhasil diperbarui`,
      "success",
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
    setSelectedUser(null);
    showToast(`Pengguna ${deleteTarget.name} telah dihapus`, "info");
  };

  const handleAddUser = () => {
    if (!addForm.name || !addForm.email) {
      showToast("Nama dan email wajib diisi", "error");
      return;
    }
    const prefix =
      addForm.role === "doctor"
        ? "DOC"
        : addForm.role === "admin"
          ? "ADM"
          : "USR";
    const newId = `${prefix}${String(users.filter((u) => u.role === addForm.role).length + 1).padStart(3, "0")}`;
    const newUser: SystemUser = {
      id: newId,
      name: addForm.name,
      email: addForm.email,
      phone: addForm.phone || "-",
      role: addForm.role,
      status: "Aktif",
      joinDate: "15 Apr 2026",
      lastActive: "Baru saja",
      appointments: 0,
    };
    setUsers((prev) => [...prev, newUser]);
    setShowAddModal(false);
    setAddForm({ name: "", email: "", phone: "", role: "patient" });
    showToast(`Pengguna ${newUser.name} berhasil ditambahkan`, "success");
  };

  const toggleStatus = (u: SystemUser) => {
    setUsers((prev) =>
      prev.map((x) =>
        x.id === u.id
          ? { ...x, status: x.status === "Aktif" ? "Nonaktif" : "Aktif" }
          : x,
      ),
    );
    showToast(
      `Status ${u.name} diubah menjadi ${u.status === "Aktif" ? "Nonaktif" : "Aktif"}`,
      "info",
    );
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #e5f0ed",
    fontSize: 14,
    color: "#0f2420",
    background: "white",
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div>
      {/* Header Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flex: 1,
            minWidth: 300,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "white",
              border: "1.5px solid #e5f0ed",
              borderRadius: 12,
              padding: "10px 14px",
            }}
          >
            <Search size={16} color="#7a9e96" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email..."
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
          <div style={{ position: "relative" }}>
            <select
              value={filterRole}
              onChange={(e) =>
                setFilterRole(e.target.value as typeof filterRole)
              }
              style={{
                padding: "10px 36px 10px 14px",
                borderRadius: 12,
                border: "1.5px solid #e5f0ed",
                background: "white",
                fontSize: 14,
                color: "#1a2e28",
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                appearance: "none",
              }}
            >
              <option value="all">Semua Role</option>
              <option value="patient">Pasien</option>
              <option value="doctor">Dokter</option>
              <option value="admin">Admin</option>
            </select>
            <Filter
              size={14}
              color="#7a9e96"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            borderRadius: 12,
            background: "#2a6e5e",
            border: "none",
            color: "white",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <Plus size={14} /> Tambah Pengguna
        </button>
      </div>

      {/* Users Table */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e5f0ed",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fcfa",
                  borderBottom: "1px solid #e5f0ed",
                }}
              >
                {[
                  "ID",
                  "Nama",
                  "Kontak",
                  "Role",
                  "Status",
                  "Bergabung",
                  "Aktif Terakhir",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 18px",
                      textAlign: h === "Aksi" ? "center" : "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#7a9e96",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom:
                      i < filteredUsers.length - 1
                        ? "1px solid #f0f9f6"
                        : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fcfa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td
                    style={{
                      padding: "16px 18px",
                      fontSize: 13,
                      color: "#3d6058",
                      fontWeight: 500,
                    }}
                  >
                    {u.id}
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0f2420",
                        marginBottom: 2,
                      }}
                    >
                      {u.name}
                    </div>
                    {u.appointments !== undefined && (
                      <div style={{ fontSize: 11, color: "#7a9e96" }}>
                        {u.appointments} janji temu
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#3d6058",
                        marginBottom: 2,
                      }}
                    >
                      {u.email}
                    </div>
                    <div style={{ fontSize: 12, color: "#7a9e96" }}>
                      {u.phone}
                    </div>
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        background: roleColors[u.role].bg,
                        color: roleColors[u.role].color,
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <button
                      onClick={() => toggleStatus(u)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background:
                          u.status === "Aktif" ? "#d1fae5" : "#fee2e2",
                        color: u.status === "Aktif" ? "#10b981" : "#ef4444",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {u.status === "Aktif" ? (
                        <CheckCircle size={11} />
                      ) : (
                        <XCircle size={11} />
                      )}
                      {u.status}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: "16px 18px",
                      fontSize: 13,
                      color: "#5a7870",
                    }}
                  >
                    {u.joinDate}
                  </td>
                  <td
                    style={{
                      padding: "16px 18px",
                      fontSize: 13,
                      color: "#7a9e96",
                    }}
                  >
                    {u.lastActive}
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={() => setSelectedUser(u)}
                        title="Lihat Detail"
                        style={{
                          padding: 7,
                          borderRadius: 8,
                          border: "none",
                          background: "#e8f5f1",
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={14} color="#2a6e5e" />
                      </button>
                      <button
                        onClick={() => openEdit(u)}
                        title="Edit Pengguna"
                        style={{
                          padding: 7,
                          borderRadius: 8,
                          border: "none",
                          background: "#eff6ff",
                          cursor: "pointer",
                        }}
                      >
                        <Edit size={14} color="#3b82f6" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        title="Hapus Pengguna"
                        style={{
                          padding: 7,
                          borderRadius: 8,
                          border: "none",
                          background: "#fee2e2",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "40px 18px",
                      textAlign: "center",
                      color: "#7a9e96",
                      fontSize: 14,
                    }}
                  >
                    Tidak ada pengguna yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      {selectedUser && (
        <>
          <div
            onClick={() => setSelectedUser(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(15,36,32,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 301,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "100%",
              maxWidth: 500,
              background: "white",
              borderRadius: 20,
              padding: "28px 32px",
              boxShadow: "0 32px 80px rgba(15,36,32,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f2420" }}>
                Detail Pengguna
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  border: "none",
                  background: "#f0f9f6",
                  padding: 8,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <X size={16} color="#5a7870" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 16,
                  background: "#f8fcfa",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${roleColors[selectedUser.role].color}, ${roleColors[selectedUser.role].color}dd)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {selectedUser.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div
                    style={{ fontSize: 18, fontWeight: 600, color: "#0f2420" }}
                  >
                    {selectedUser.name}
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 4,
                      background: roleColors[selectedUser.role].bg,
                      color: roleColors[selectedUser.role].color,
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {roleLabels[selectedUser.role]}
                  </span>
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={selectedUser.email}
                />
                <DetailRow
                  icon={Phone}
                  label="Telepon"
                  value={selectedUser.phone}
                />
                <DetailRow
                  icon={Calendar}
                  label="Bergabung"
                  value={selectedUser.joinDate}
                />
                <DetailRow
                  icon={Clock}
                  label="Aktif Terakhir"
                  value={selectedUser.lastActive}
                />
                {selectedUser.appointments !== undefined && (
                  <DetailRow
                    icon={Activity}
                    label="Total Janji Temu"
                    value={selectedUser.appointments.toString()}
                  />
                )}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => openEdit(selectedUser)}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: 12,
                    background: "#2a6e5e",
                    border: "none",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Edit size={14} /> Edit Pengguna
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget(selectedUser);
                    setSelectedUser(null);
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "#fee2e2",
                    border: "none",
                    color: "#ef4444",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <>
          <div
            onClick={() => setEditingUser(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(15,36,32,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 301,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "100%",
              maxWidth: 480,
              background: "white",
              borderRadius: 20,
              padding: "28px 32px",
              boxShadow: "0 32px 80px rgba(15,36,32,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f2420" }}>
                Edit Pengguna
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  border: "none",
                  background: "#f0f9f6",
                  padding: 8,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <X size={16} color="#5a7870" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#7a9e96",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Nama Lengkap
                </label>
                <input
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  style={inputStyle}
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#7a9e96",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <input
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, email: e.target.value }))
                  }
                  style={inputStyle}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#7a9e96",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Nomor Telepon
                </label>
                <input
                  value={editForm.phone || ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  style={inputStyle}
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#7a9e96",
                      fontWeight: 500,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Role
                  </label>
                  <select
                    value={editForm.role || "patient"}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        role: e.target.value as UserRole,
                      }))
                    }
                    style={{ ...inputStyle }}
                  >
                    <option value="patient">Pasien</option>
                    <option value="doctor">Dokter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#7a9e96",
                      fontWeight: 500,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Status
                  </label>
                  <select
                    value={editForm.status || "Aktif"}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        status: e.target.value as "Aktif" | "Nonaktif",
                      }))
                    }
                    style={{ ...inputStyle }}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => setEditingUser(null)}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: 12,
                    border: "1.5px solid #e5f0ed",
                    background: "white",
                    color: "#5a7870",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={saveEdit}
                  style={{
                    flex: 2,
                    padding: "12px 0",
                    borderRadius: 12,
                    background: "#2a6e5e",
                    border: "none",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Save size={14} /> Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <>
          <div
            onClick={() => setShowAddModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(15,36,32,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 301,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "100%",
              maxWidth: 480,
              background: "white",
              borderRadius: 20,
              padding: "28px 32px",
              boxShadow: "0 32px 80px rgba(15,36,32,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f2420" }}>
                Tambah Pengguna Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  border: "none",
                  background: "#f0f9f6",
                  padding: 8,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <X size={16} color="#5a7870" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#7a9e96",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, name: e.target.value }))
                  }
                  style={inputStyle}
                  placeholder="Nama lengkap pengguna"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#7a9e96",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Email <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, email: e.target.value }))
                  }
                  style={inputStyle}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#7a9e96",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Nomor Telepon
                </label>
                <input
                  value={addForm.phone}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  style={inputStyle}
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#7a9e96",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Role
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) =>
                    setAddForm((p) => ({
                      ...p,
                      role: e.target.value as UserRole,
                    }))
                  }
                  style={{ ...inputStyle }}
                >
                  <option value="patient">Pasien</option>
                  <option value="doctor">Dokter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  background: "#f8fcfa",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#7a9e96",
                  marginTop: 2,
                }}
              >
                Password default akan dikirim ke email pengguna setelah akun
                dibuat.
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: 12,
                    border: "1.5px solid #e5f0ed",
                    background: "white",
                    color: "#5a7870",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleAddUser}
                  style={{
                    flex: 2,
                    padding: "12px 0",
                    borderRadius: 12,
                    background: "#2a6e5e",
                    border: "none",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={14} /> Tambah Pengguna
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Hapus Pengguna"
          message={`Apakah Anda yakin ingin menghapus akun ${deleteTarget.name}? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#e8f5f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} color="#2a6e5e" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#7a9e96", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#0f2420" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ──────────── APPOINTMENTS TAB ────────────
function AppointmentsTab({
  appointments,
  setAppointments,
  showToast,
}: {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [filterStatus, setFilterStatus] = useState<"all" | AppStatus>("all");
  const [viewApt, setViewApt] = useState<Appointment | null>(null);
  const [editApt, setEditApt] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState<AppStatus>("Menunggu");

  const statusColors: Record<
    AppStatus,
    { bg: string; color: string; icon: any }
  > = {
    Menunggu: { bg: "#fef3c7", color: "#d97706", icon: Clock },
    Terkonfirmasi: { bg: "#e8f5f1", color: "#2a6e5e", icon: CheckCircle },
    Selesai: { bg: "#d1fae5", color: "#10b981", icon: CheckCircle },
    Dibatalkan: { bg: "#fee2e2", color: "#ef4444", icon: XCircle },
  };

  const filteredAppointments =
    filterStatus === "all"
      ? appointments
      : appointments.filter((a) => a.status === filterStatus);

  const handleExport = () => {
    const header = "ID,Pasien,Dokter,Keluhan,Tanggal,Waktu,Status";
    const rows = appointments.map(
      (a) =>
        `${a.id},${a.patient},${a.doctor},${a.disease},${a.date},${a.time},${a.status}`,
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appointments_medicheck.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data janji temu berhasil diekspor", "success");
  };

  const saveStatusChange = () => {
    if (!editApt) return;
    setAppointments((prev) =>
      prev.map((a) => (a.id === editApt.id ? { ...a, status: newStatus } : a)),
    );
    showToast(`Status ${editApt.id} diubah menjadi "${newStatus}"`, "success");
    setEditApt(null);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterStatus("all")}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border:
                filterStatus === "all"
                  ? "1.5px solid #2a6e5e"
                  : "1.5px solid #e5f0ed",
              background: filterStatus === "all" ? "#e8f5f1" : "white",
              color: filterStatus === "all" ? "#2a6e5e" : "#7a9e96",
              fontSize: 13,
              fontWeight: filterStatus === "all" ? 600 : 400,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Semua ({appointments.length})
          </button>
          {(
            [
              "Menunggu",
              "Terkonfirmasi",
              "Selesai",
              "Dibatalkan",
            ] as AppStatus[]
          ).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border:
                  filterStatus === status
                    ? "1.5px solid #2a6e5e"
                    : "1.5px solid #e5f0ed",
                background: filterStatus === status ? "#e8f5f1" : "white",
                color: filterStatus === status ? "#2a6e5e" : "#7a9e96",
                fontSize: 13,
                fontWeight: filterStatus === status ? 600 : 400,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {status} ({appointments.filter((a) => a.status === status).length}
              )
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 12,
            background: "white",
            border: "1.5px solid #e5f0ed",
            color: "#5a7870",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e5f0ed",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fcfa",
                  borderBottom: "1px solid #e5f0ed",
                }}
              >
                {[
                  "ID",
                  "Pasien",
                  "Dokter",
                  "Keluhan",
                  "Jadwal",
                  "Status",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 18px",
                      textAlign: h === "Aksi" ? "center" : "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#7a9e96",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt, i) => {
                const statusInfo = statusColors[apt.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <tr
                    key={apt.id}
                    style={{
                      borderBottom:
                        i < filteredAppointments.length - 1
                          ? "1px solid #f0f9f6"
                          : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fcfa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <td
                      style={{
                        padding: "16px 18px",
                        fontSize: 13,
                        color: "#3d6058",
                        fontWeight: 500,
                      }}
                    >
                      {apt.id}
                    </td>
                    <td
                      style={{
                        padding: "16px 18px",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0f2420",
                      }}
                    >
                      {apt.patient}
                    </td>
                    <td
                      style={{
                        padding: "16px 18px",
                        fontSize: 14,
                        color: "#5a7870",
                      }}
                    >
                      {apt.doctor}
                    </td>
                    <td
                      style={{
                        padding: "16px 18px",
                        fontSize: 13,
                        color: "#5a7870",
                      }}
                    >
                      {apt.disease}
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#0f2420",
                        }}
                      >
                        {apt.date}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#7a9e96", marginTop: 2 }}
                      >
                        {apt.time} WIB
                      </div>
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          padding: "5px 11px",
                          borderRadius: 7,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        <StatusIcon size={11} /> {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <button
                          onClick={() => setViewApt(apt)}
                          title="Lihat Detail"
                          style={{
                            padding: 7,
                            borderRadius: 8,
                            border: "none",
                            background: "#e8f5f1",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={14} color="#2a6e5e" />
                        </button>
                        <button
                          onClick={() => {
                            setEditApt(apt);
                            setNewStatus(apt.status);
                          }}
                          title="Ubah Status"
                          style={{
                            padding: 7,
                            borderRadius: 8,
                            border: "none",
                            background: "#eff6ff",
                            cursor: "pointer",
                          }}
                        >
                          <Edit size={14} color="#3b82f6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px 18px",
                      textAlign: "center",
                      color: "#7a9e96",
                      fontSize: 14,
                    }}
                  >
                    Tidak ada janji temu ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Appointment Modal */}
      {viewApt && (
        <>
          <div
            onClick={() => setViewApt(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(15,36,32,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 301,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "100%",
              maxWidth: 480,
              background: "white",
              borderRadius: 20,
              padding: "28px 32px",
              boxShadow: "0 32px 80px rgba(15,36,32,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f2420" }}>
                  Detail Janji Temu
                </h3>
                <p style={{ fontSize: 12, color: "#7a9e96", marginTop: 2 }}>
                  {viewApt.id}
                </p>
              </div>
              <button
                onClick={() => setViewApt(null)}
                style={{
                  border: "none",
                  background: "#f0f9f6",
                  padding: 8,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <X size={16} color="#5a7870" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: Users, label: "Pasien", value: viewApt.patient },
                { icon: Activity, label: "Dokter", value: viewApt.doctor },
                {
                  icon: FileText,
                  label: "Keluhan / Diagnosa",
                  value: viewApt.disease,
                },
                { icon: Calendar, label: "Tanggal", value: viewApt.date },
                { icon: Clock, label: "Waktu", value: `${viewApt.time} WIB` },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: "#f8fcfa",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#e8f5f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <row.icon size={16} color="#2a6e5e" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#7a9e96",
                        marginBottom: 2,
                      }}
                    >
                      {row.label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#0f2420",
                      }}
                    >
                      {row.value}
                    </div>
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: "12px 14px",
                  background: statusColors[viewApt.status].bg,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {viewApt.status === "Dibatalkan" ? (
                  <XCircle
                    size={16}
                    color={statusColors[viewApt.status].color}
                  />
                ) : (
                  <CheckCircle
                    size={16}
                    color={statusColors[viewApt.status].color}
                  />
                )}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: statusColors[viewApt.status].color,
                  }}
                >
                  Status: {viewApt.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditApt(viewApt);
                setNewStatus(viewApt.status);
                setViewApt(null);
              }}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                background: "#2a6e5e",
                border: "none",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Edit size={14} /> Ubah Status
            </button>
          </div>
        </>
      )}

      {/* Edit Status Modal */}
      {editApt && (
        <>
          <div
            onClick={() => setEditApt(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(15,36,32,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 301,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "100%",
              maxWidth: 420,
              background: "white",
              borderRadius: 20,
              padding: "28px 32px",
              boxShadow: "0 32px 80px rgba(15,36,32,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f2420" }}>
                Ubah Status Janji
              </h3>
              <button
                onClick={() => setEditApt(null)}
                style={{
                  border: "none",
                  background: "#f0f9f6",
                  padding: 8,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <X size={16} color="#5a7870" />
              </button>
            </div>
            <p style={{ fontSize: 13, color: "#7a9e96", marginBottom: 18 }}>
              {editApt.patient} — {editApt.doctor} — {editApt.date}{" "}
              {editApt.time}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {(
                [
                  "Menunggu",
                  "Terkonfirmasi",
                  "Selesai",
                  "Dibatalkan",
                ] as AppStatus[]
              ).map((s) => {
                const sInfo = statusColors[s];
                const SIcon = sInfo.icon;
                return (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: 12,
                      cursor: "pointer",
                      border:
                        newStatus === s
                          ? `2px solid ${sInfo.color}`
                          : "2px solid #e5f0ed",
                      background: newStatus === s ? sInfo.bg : "white",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: sInfo.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SIcon size={16} color={sInfo.color} />
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: newStatus === s ? 600 : 400,
                        color: newStatus === s ? sInfo.color : "#5a7870",
                      }}
                    >
                      {s}
                    </span>
                    {newStatus === s && (
                      <CheckCircle
                        size={16}
                        color={sInfo.color}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setEditApt(null)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "1.5px solid #e5f0ed",
                  background: "white",
                  color: "#5a7870",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Batal
              </button>
              <button
                onClick={saveStatusChange}
                style={{
                  flex: 2,
                  padding: "12px 0",
                  borderRadius: 12,
                  background: "#2a6e5e",
                  border: "none",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Save size={14} /> Simpan Status
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ──────────── SETTINGS TAB ────────────
function SettingsTab({
  showToast,
}: {
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const defaultSettings = {
    emailNotifications: true,
    smsNotifications: false,
    autoConfirm: false,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
  };
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    showToast("Pengaturan sistem berhasil disimpan", "success");
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSaved(false);
    showToast("Pengaturan telah direset ke nilai default", "info");
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: "28px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e5f0ed",
          marginBottom: 20,
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#0f2420",
            marginBottom: 6,
          }}
        >
          Pengaturan Sistem
        </h3>
        <p style={{ fontSize: 13, color: "#7a9e96", marginBottom: 28 }}>
          Kelola konfigurasi dan preferensi sistem MediCheck
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SettingItem
            icon={Bell}
            label="Notifikasi Email"
            description="Kirim notifikasi penting ke email pengguna"
            checked={settings.emailNotifications}
            onChange={() => toggleSetting("emailNotifications")}
          />
          <SettingItem
            icon={Mail}
            label="Notifikasi SMS"
            description="Kirim reminder janji temu via SMS"
            checked={settings.smsNotifications}
            onChange={() => toggleSetting("smsNotifications")}
          />
          <SettingItem
            icon={CheckCircle}
            label="Konfirmasi Otomatis"
            description="Konfirmasi janji temu secara otomatis tanpa verifikasi dokter"
            checked={settings.autoConfirm}
            onChange={() => toggleSetting("autoConfirm")}
          />
          <SettingItem
            icon={AlertCircle}
            label="Mode Maintenance"
            description="Nonaktifkan akses publik untuk maintenance"
            checked={settings.maintenanceMode}
            onChange={() => toggleSetting("maintenanceMode")}
          />
          <SettingItem
            icon={Users}
            label="Izinkan Registrasi"
            description="Izinkan pengguna baru untuk mendaftar"
            checked={settings.allowRegistration}
            onChange={() => toggleSetting("allowRegistration")}
          />
          <SettingItem
            icon={Lock}
            label="Verifikasi Email Wajib"
            description="Wajibkan verifikasi email saat registrasi"
            checked={settings.requireEmailVerification}
            onChange={() => toggleSetting("requireEmailVerification")}
          />
        </div>

        {saved && (
          <div
            style={{
              marginTop: 20,
              padding: "12px 16px",
              background: "#d1fae5",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle size={16} color="#10b981" />
            <span style={{ fontSize: 13, color: "#065f46", fontWeight: 500 }}>
              Pengaturan tersimpan pada{" "}
              {new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}

        <div
          style={{
            marginTop: 28,
            paddingTop: 24,
            borderTop: "1px solid #e5f0ed",
            display: "flex",
            gap: 12,
          }}
        >
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 12,
              background: "#2a6e5e",
              border: "none",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Save size={14} /> Simpan Perubahan
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: "13px 24px",
              borderRadius: 12,
              background: "white",
              border: "1.5px solid #e5f0ed",
              color: "#5a7870",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: "28px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e5f0ed",
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#0f2420",
            marginBottom: 20,
          }}
        >
          Informasi Sistem
        </h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <InfoItem label="Versi Aplikasi" value="v1.0.0" />
          <InfoItem label="Database" value="PostgreSQL 15.2" />
          <InfoItem label="Server Status" value="Online" badge />
          <InfoItem label="Terakhir Update" value="14 Apr 2026" />
        </div>
      </div>
    </div>
  );
}

function SettingItem({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: any;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: 16,
        background: "#f8fcfa",
        borderRadius: 12,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color="#2a6e5e" />
        </div>
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#0f2420",
              marginBottom: 3,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 12, color: "#7a9e96", lineHeight: 1.5 }}>
            {description}
          </div>
        </div>
      </div>
      <label
        style={{
          position: "relative",
          display: "inline-block",
          width: 48,
          height: 26,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 26,
            background: checked ? "#2a6e5e" : "#cbd5e1",
            transition: "background 0.2s",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: checked ? 24 : 2,
            top: 2,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          }}
        />
      </label>
    </div>
  );
}

function InfoItem({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#7a9e96", marginBottom: 6 }}>
        {label}
      </div>
      {badge ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#d1fae5",
            color: "#10b981",
            padding: "5px 12px",
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <CheckCircle size={12} /> {value}
        </span>
      ) : (
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f2420" }}>
          {value}
        </div>
      )}
    </div>
  );
}

// ──────────── LOGS TAB ────────────
function LogsTab({ logs }: { logs: ActivityLog[] }) {
  const [filterType, setFilterType] = useState<"all" | ActivityLog["type"]>(
    "all",
  );
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const typeColors: Record<
    ActivityLog["type"],
    { bg: string; color: string; icon: any; label: string }
  > = {
    info: { bg: "#eff6ff", color: "#3b82f6", icon: Bell, label: "Info" },
    success: {
      bg: "#d1fae5",
      color: "#10b981",
      icon: CheckCircle,
      label: "Sukses",
    },
    warning: {
      bg: "#fef3c7",
      color: "#d97706",
      icon: AlertCircle,
      label: "Peringatan",
    },
    error: { bg: "#fee2e2", color: "#ef4444", icon: XCircle, label: "Error" },
  };

  const filtered =
    filterType === "all" ? logs : logs.filter((l) => l.type === filterType);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter = (t: typeof filterType) => {
    setFilterType(t);
    setPage(1);
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e5f0ed",
          padding: "24px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f2420" }}>
            Riwayat Aktivitas
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => handleFilter("all")}
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                border:
                  filterType === "all"
                    ? "1.5px solid #2a6e5e"
                    : "1.5px solid #e5f0ed",
                background: filterType === "all" ? "#e8f5f1" : "white",
                color: filterType === "all" ? "#2a6e5e" : "#7a9e96",
                fontSize: 12,
                fontWeight: filterType === "all" ? 600 : 400,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Semua
            </button>
            {(Object.keys(typeColors) as ActivityLog["type"][]).map((t) => {
              const tc = typeColors[t];
              return (
                <button
                  key={t}
                  onClick={() => handleFilter(t)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 9,
                    border:
                      filterType === t
                        ? `1.5px solid ${tc.color}`
                        : "1.5px solid #e5f0ed",
                    background: filterType === t ? tc.bg : "white",
                    color: filterType === t ? tc.color : "#7a9e96",
                    fontSize: 12,
                    fontWeight: filterType === t ? 600 : 400,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {tc.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {paginated.map((log) => {
            const typeInfo = typeColors[log.type];
            const Icon = typeInfo.icon;
            return (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: 16,
                  background: "#f8fcfa",
                  borderRadius: 12,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e8f5f1")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f8fcfa")
                }
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: typeInfo.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={typeInfo.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#0f2420",
                      marginBottom: 4,
                    }}
                  >
                    {log.action}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 12,
                      color: "#7a9e96",
                    }}
                  >
                    <span style={{ fontWeight: 500, color: "#5a7870" }}>
                      {log.user}
                    </span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        background: typeInfo.bg,
                        color: typeInfo.color,
                        padding: "2px 8px",
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {typeInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {paginated.length === 0 && (
            <div
              style={{
                padding: "32px 0",
                textAlign: "center",
                color: "#7a9e96",
                fontSize: 14,
              }}
            >
              Tidak ada log dengan filter ini
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid #e5f0ed",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1.5px solid #e5f0ed",
                background: page === 1 ? "#f8fcfa" : "white",
                color: page === 1 ? "#c4d9d3" : "#5a7870",
                fontSize: 13,
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <ChevronLeft size={14} style={{ verticalAlign: "middle" }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  border:
                    page === p ? "1.5px solid #2a6e5e" : "1.5px solid #e5f0ed",
                  background: page === p ? "#2a6e5e" : "white",
                  color: page === p ? "white" : "#5a7870",
                  fontSize: 13,
                  fontWeight: page === p ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1.5px solid #e5f0ed",
                background: page === totalPages ? "#f8fcfa" : "white",
                color: page === totalPages ? "#c4d9d3" : "#5a7870",
                fontSize: 13,
                cursor: page === totalPages ? "not-allowed" : "pointer",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <ChevronRight size={14} style={{ verticalAlign: "middle" }} />
            </button>
            <span style={{ fontSize: 12, color: "#7a9e96", marginLeft: 4 }}>
              Menampilkan {(page - 1) * PER_PAGE + 1}–
              {Math.min(page * PER_PAGE, filtered.length)} dari{" "}
              {filtered.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
