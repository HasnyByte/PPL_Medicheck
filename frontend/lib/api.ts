// lib/api.ts — MediCheck Frontend API Client v3

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("medicheck_token") : null;
export const setToken = (t: string) =>
  typeof window !== "undefined" && localStorage.setItem("medicheck_token", t);
export const removeToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("medicheck_token");
  localStorage.removeItem("medicheck_user");
};
export const saveUser = (u: object) =>
  typeof window !== "undefined" && localStorage.setItem("medicheck_user", JSON.stringify(u));
export function getSavedUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("medicheck_user");
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}, base = BASE_URL): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || data.detail || "Terjadi kesalahan");
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DoctorSchedule {
  id: string; doctorId: string; dayOfWeek: number;
  startTime: string; endTime: string; isActive: boolean;
}
export interface AuthUser {
  id: string; name: string; email: string;
  role: "patient" | "doctor" | "admin";
  phone?: string | null; specialist?: string | null; specialistCode?: string | null;
  hospital?: string | null; hospitalAddress?: string | null; bio?: string | null;
  photoUrl?: string | null; experience?: number | null; education?: string | null;
  licenseNumber?: string | null; consultationFee?: number | null;
  isVerified?: boolean; schedules?: DoctorSchedule[]; createdAt?: string;
}
export interface AuthResponse { token: string; user: AuthUser; }
export interface DoctorPublic {
  id: string; name: string; email: string; phone?: string | null;
  specialist?: string | null; specialistCode?: string | null; hospital?: string | null;
  hospitalAddress?: string | null; bio?: string | null; photoUrl?: string | null;
  experience?: number | null; education?: string | null; licenseNumber?: string | null;
  consultationFee?: number | null; schedules?: DoctorSchedule[];
}
export interface Booking {
  id: string; userId: string; doctorId: string; date: string; time: string;
  disease: string; status: "Menunggu" | "Terkonfirmasi" | "Selesai" | "Dibatalkan";
  notes?: string | null; createdAt: string; updatedAt: string;
  user?: { id: string; name: string; email: string; phone?: string | null; createdAt?: string };
  doctor?: { id: string; name: string; specialist?: string | null; hospital?: string | null; photoUrl?: string | null };
  medicalRecord?: MedicalRecord | null;
}
export interface MedicalRecord {
  id: string; bookingId: string; patientId: string; doctorId: string;
  diagnosis: string; prescription?: string | null; notes?: string | null;
  followUpDate?: string | null; createdAt: string; updatedAt: string;
  patient?: { id: string; name: string; email: string; phone?: string | null };
  doctor?: { id: string; name: string; specialist?: string | null };
  booking?: Booking;
}
export interface Screening {
  id: string; userId?: string | null; disease: string; confidence: number;
  symptoms: string; specialist: string; specialistCode: string;
  isEmergency: boolean; tips: string[]; createdAt: string;
}
export interface Notification {
  id: string; userId: string; title: string; message: string;
  type: string; isRead: boolean; createdAt: string;
}
export interface ApiUser {
  id: string; name: string; email: string; role: string;
  phone?: string | null; specialist?: string | null; specialistCode?: string | null;
  hospital?: string | null; createdAt: string; updatedAt?: string;
}
export interface DoctorStats {
  total: number; pending: number; confirmed: number; done: number; cancelled: number;
  uniquePatients: number; todayAppointments: number; totalRecords: number;
}
export interface AdminStats {
  totalUsers: number; totalBookings: number; totalScreenings: number;
  pendingBookings: number; doctors: number; patients: number;
  bookingsByStatus: { status: string; count: number }[];
  recentBookings: { createdAt: string; status: string }[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  register: (b: { name: string; email: string; password: string; phone?: string }) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(b) }),
  registerDoctor: (b: Partial<AuthUser> & { password: string }) =>
    request<AuthResponse>("/api/auth/register-doctor", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(b) }),
  me: () => request<AuthUser>("/api/auth/me"),
  updateProfile: (b: Partial<AuthUser>) =>
    request<AuthUser>("/api/auth/profile", { method: "PATCH", body: JSON.stringify(b) }),
  changePassword: (b: { oldPassword: string; newPassword: string }) =>
    request<{ message: string }>("/api/auth/change-password", { method: "PATCH", body: JSON.stringify(b) }),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const doctors = {
  list: (params?: { specialist?: string; specialistCode?: string }) => {
    const qs = new URLSearchParams();
    if (params?.specialist) qs.set("specialist", params.specialist);
    if (params?.specialistCode) qs.set("specialistCode", params.specialistCode);
    const q = qs.toString();
    return request<DoctorPublic[]>(`/api/doctors${q ? `?${q}` : ""}`);
  },
  get: (id: string) => request<DoctorPublic>(`/api/doctors/${id}`),
  myAppointments: (params?: { status?: string; date?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.date) qs.set("date", params.date);
    const q = qs.toString();
    return request<Booking[]>(`/api/doctors/me/appointments${q ? `?${q}` : ""}`);
  },
  myPatients: () => request<ApiUser[]>("/api/doctors/me/patients"),
  updateSchedule: (schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>) =>
    request<DoctorSchedule[]>("/api/doctors/me/schedule", { method: "PUT", body: JSON.stringify({ schedules }) }),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = {
  list: () => request<Booking[]>("/api/bookings"),
  get: (id: string) => request<Booking>(`/api/bookings/${id}`),
  create: (b: { doctorId: string; date: string; time: string; disease: string; notes?: string }) =>
    request<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(b) }),
  updateStatus: (id: string, status: string) =>
    request<Booking>(`/api/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  cancel: (id: string) => request<Booking>(`/api/bookings/${id}/cancel`, { method: "PATCH" }),
  delete: (id: string) => request<{ message: string }>(`/api/bookings/${id}`, { method: "DELETE" }),
};

// ─── Medical Records ──────────────────────────────────────────────────────────
export const medicalRecords = {
  list: () => request<MedicalRecord[]>("/api/medical-records"),
  get: (id: string) => request<MedicalRecord>(`/api/medical-records/${id}`),
  create: (b: { bookingId: string; diagnosis: string; prescription?: string; notes?: string; followUpDate?: string }) =>
    request<MedicalRecord>("/api/medical-records", { method: "POST", body: JSON.stringify(b) }),
  update: (id: string, b: Partial<{ diagnosis: string; prescription: string; notes: string; followUpDate: string }>) =>
    request<MedicalRecord>(`/api/medical-records/${id}`, { method: "PATCH", body: JSON.stringify(b) }),
  delete: (id: string) => request<{ message: string }>(`/api/medical-records/${id}`, { method: "DELETE" }),
};

// ─── Screenings ───────────────────────────────────────────────────────────────
export const screenings = {
  list: () => request<Screening[]>("/api/screenings"),
  my: () => request<Screening[]>("/api/screenings/my"),
  create: (b: { userId?: string; disease: string; confidence: number; symptoms: string; specialist: string; specialistCode: string; isEmergency: boolean; tips: string[] }) =>
    request<Screening>("/api/screenings", { method: "POST", body: JSON.stringify(b) }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = {
  list: () => request<Notification[]>("/api/notifications"),
  markRead: (id: string) => request<{ message: string }>(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request<{ message: string }>("/api/notifications/read-all", { method: "PATCH" }),
};

// ─── Users (admin) ────────────────────────────────────────────────────────────
export const users = {
  list: (params?: { role?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.role) qs.set("role", params.role);
    if (params?.search) qs.set("search", params.search);
    const q = qs.toString();
    return request<ApiUser[]>(`/api/users${q ? `?${q}` : ""}`);
  },
  get: (id: string) => request<ApiUser>(`/api/users/${id}`),
  create: (b: { name: string; email: string; password: string; role: string; phone?: string }) =>
    request<ApiUser>("/api/users", { method: "POST", body: JSON.stringify(b) }),
  update: (id: string, b: Partial<{ name: string; email: string; phone: string; role: string; password: string }>) =>
    request<ApiUser>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(b) }),
  delete: (id: string) => request<{ message: string }>(`/api/users/${id}`, { method: "DELETE" }),
};

// ─── Stats ────────────────────────────────────────────────────────────────────
export const stats = {
  admin: () => request<AdminStats>("/api/stats"),
  doctor: () => request<DoctorStats>("/api/stats/doctor"),
};

// ─── AI (backend-ai) ──────────────────────────────────────────────────────────
export const ai = {
  chat: (session_id: string, message: string) =>
    request<{ answer: string; session_id: string }>("/chat", {
      method: "POST", body: JSON.stringify({ session_id, message }),
    }, AI_URL),
  analyze: (payload: { complaint: string; severity: string; duration: string; additional_symptoms: string; user_id?: string }) =>
    request<{
      disease: string; confidence: number; specialist: string;
      specialistCode: string; tips: string[]; symptoms: string; isEmergency: boolean;
    }>("/api/screening/analyze", { method: "POST", body: JSON.stringify(payload) }, AI_URL),
  clearSession: (session_id: string) =>
    request<{ status: string }>(`/chat/${session_id}`, { method: "DELETE" }, AI_URL),
};
