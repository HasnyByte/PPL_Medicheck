"use client";
import { useState, useEffect, useCallback } from "react";
import {
  auth as authApi, bookings as bookingsApi, screenings as screeningsApi,
  medicalRecords as medicalApi, notifications as notifApi,
  type Booking, type Screening, type MedicalRecord, type Notification, type AuthUser,
} from "@/lib/api";
import {
  Calendar, Clock, User, FileText, Bell, Search, Activity, Heart,
  ChevronRight, LogOut, Edit3, Save, X, Phone, Mail, MapPin, Award, RefreshCw,
} from "lucide-react";
import type { User as UserType } from "../app/App";

interface DashboardProps {
  user: UserType;
  onUserUpdate?: (user: UserType) => void;
  onStartScreening?: () => void;
  onBookDoctor?: () => void;
}

type Tab = "overview" | "bookings" | "screenings" | "records" | "profile";

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "white", borderRadius: 20, padding: "20px 22px", border: "1px solid #e8f5f1", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", ...style }}>{children}</div>;
}

const STATUS_COLOR: Record<string, string> = {
  Menunggu: "#d97706", Terkonfirmasi: "#2a6e5e", Selesai: "#6b7280", Dibatalkan: "#dc2626",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] || "#6b7280";
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: `${color}18`, color, display: "inline-block" }}>{status}</span>;
}

function formatDate(d: string | Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export function Dashboard({ user, onUserUpdate, onStartScreening, onBookDoctor }: DashboardProps) {
  const G = "#2a6e5e";
  const [tab, setTab] = useState<Tab>("overview");
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [screeningsList, setScreeningsList] = useState<Screening[]>([]);
  const [recordsList, setRecordsList] = useState<MedicalRecord[]>([]);
  const [notifList, setNotifList] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user.name, phone: user.phone || "", email: user.email });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bk, sc, me, notifs] = await Promise.all([
        bookingsApi.list().catch(() => []),
        screeningsApi.my().catch(() => []),
        authApi.me().catch(() => null),
        notifApi.list().catch(() => []),
      ]);
      setBookingsList(bk);
      setScreeningsList(sc);
      setNotifList(notifs);
      if (me) {
        setProfile(me);
        setProfileForm({ name: me.name, phone: me.phone || "", email: me.email });
      }
      if (bk.some(b => b.medicalRecord)) {
        const recs = await medicalApi.list().catch(() => []);
        setRecordsList(recs);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const unreadNotifs = notifList.filter(n => !n.isRead).length;

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError("");
    try {
      const updated = await authApi.updateProfile(profileForm);
      setProfile(updated);
      onUserUpdate?.({ ...user, name: updated.name, phone: updated.phone });
      setEditingProfile(false);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notifApi.markAllRead();
      setNotifList(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Ringkasan", icon: Activity },
    { key: "bookings", label: "Booking Saya", icon: Calendar },
    { key: "screenings", label: "Riwayat Screening", icon: Heart },
    { key: "records", label: "Rekam Medis", icon: FileText },
    { key: "profile", label: "Profil", icon: User },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0f9f6,#e8f5f1)", paddingTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#0f2420", margin: 0 }}>
              Halo, {user.name.split(" ")[0]} 👋
            </h1>
            <p style={{ fontSize: 13, color: "#7a9e96", marginTop: 4 }}>Dashboard Pasien — {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={loadData} style={{ background: "white", border: "1px solid #e8f5f1", borderRadius: 10, padding: 8, cursor: "pointer" }}>
              <RefreshCw size={14} color={G} />
            </button>
            {unreadNotifs > 0 && (
              <div style={{ position: "relative" }}>
                <Bell size={20} color={G} />
                <span style={{ position: "absolute", top: -6, right: -6, background: "#dc2626", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{unreadNotifs}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "white", padding: 6, borderRadius: 14, border: "1px solid #e8f5f1", flexWrap: "wrap" }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ flex: 1, minWidth: 80, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 10, border: "none", background: active ? G : "transparent", color: active ? "white" : "#5a7870", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}>
                <Icon size={13} />{t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#7a9e96" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 12 }} />
            <div>Memuat data...</div>
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {[
                    { label: "Total Booking", value: bookingsList.length, sub: "Semua status", color: G },
                    { label: "Riwayat Screening", value: screeningsList.length, sub: "Pemeriksaan AI", color: "#d97706" },
                    { label: "Rekam Medis", value: recordsList.length, sub: "Dari dokter", color: "#6366f1" },
                  ].map((s, i) => (
                    <Card key={i}>
                      <div style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: "'Cormorant Garamond',serif" }}>{s.value}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2420", marginTop: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: "#7a9e96" }}>{s.sub}</div>
                    </Card>
                  ))}
                </div>

                {/* Quick actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <button onClick={onStartScreening} style={{ background: G, color: "white", border: "none", borderRadius: 16, padding: "20px 24px", cursor: "pointer", textAlign: "left", fontFamily: "'Outfit',sans-serif" }}>
                    <Heart size={24} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Mulai Pemeriksaan</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Screening AI gratis sekarang</div>
                  </button>
                  <button onClick={onBookDoctor} style={{ background: "white", color: G, border: `2px solid ${G}`, borderRadius: 16, padding: "20px 24px", cursor: "pointer", textAlign: "left", fontFamily: "'Outfit',sans-serif" }}>
                    <Calendar size={24} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Buat Janji Dokter</div>
                    <div style={{ fontSize: 12, color: "#7a9e96", marginTop: 4 }}>Pilih dokter & jadwal</div>
                  </button>
                </div>

                {/* Recent bookings */}
                <Card>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 12 }}>Booking Terbaru</div>
                  {bookingsList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "#7a9e96", fontSize: 13 }}>Belum ada booking. Buat janji temu pertama Anda!</div>
                  ) : bookingsList.slice(0, 4).map(b => (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f9f6" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2420" }}>{b.doctor?.name || "Dokter"}</div>
                        <div style={{ fontSize: 11, color: "#7a9e96" }}>{b.doctor?.specialist} · {formatDate(b.date)} {b.time}</div>
                        <div style={{ fontSize: 11, color: "#5a7870" }}>{b.disease}</div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </Card>

                {/* Notifications */}
                {notifList.filter(n => !n.isRead).length > 0 && (
                  <Card>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420" }}>Notifikasi</div>
                      <button onClick={handleMarkAllRead} style={{ fontSize: 11, color: G, border: "none", background: "none", cursor: "pointer" }}>Tandai semua dibaca</button>
                    </div>
                    {notifList.filter(n => !n.isRead).slice(0, 3).map(n => (
                      <div key={n.id} style={{ padding: "10px 12px", background: "#f0f9f6", borderRadius: 10, marginBottom: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2420" }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: "#5a7870" }}>{n.message}</div>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* BOOKINGS */}
            {tab === "bookings" && (
              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 16 }}>Semua Booking ({bookingsList.length})</div>
                {bookingsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#7a9e96" }}>Belum ada booking</div>
                ) : bookingsList.map(b => (
                  <div key={b.id} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e8f5f1", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420" }}>{b.doctor?.name}</div>
                        <div style={{ fontSize: 12, color: "#5a7870" }}>{b.doctor?.specialist}</div>
                        <div style={{ fontSize: 12, color: "#7a9e96", marginTop: 4 }}>{formatDate(b.date)} pukul {b.time}</div>
                        <div style={{ fontSize: 12, color: "#1a2e28", marginTop: 2 }}>Keluhan: {b.disease}</div>
                        {b.notes && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Catatan: {b.notes}</div>}
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* SCREENINGS */}
            {tab === "screenings" && (
              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 16 }}>Riwayat Pemeriksaan AI ({screeningsList.length})</div>
                {screeningsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#7a9e96" }}>
                    <div style={{ marginBottom: 16 }}>Belum ada riwayat pemeriksaan</div>
                    <button onClick={onStartScreening} style={{ background: G, color: "white", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 13 }}>Mulai Pemeriksaan</button>
                  </div>
                ) : screeningsList.map(s => (
                  <div key={s.id} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e8f5f1", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420" }}>{s.disease}</div>
                        <div style={{ fontSize: 12, color: "#5a7870" }}>Spesialis: {s.specialist}</div>
                        <div style={{ fontSize: 12, color: "#7a9e96" }}>Gejala: {s.symptoms}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: G, fontFamily: "'Cormorant Garamond',serif" }}>{s.confidence}%</div>
                        <div style={{ fontSize: 10, color: "#7a9e96" }}>Kepercayaan</div>
                        {s.isEmergency && <div style={{ fontSize: 10, color: "#dc2626", fontWeight: 600, marginTop: 2 }}>⚠️ DARURAT</div>}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, color: "#9ca3af" }}>{formatDate(s.createdAt)}</div>
                  </div>
                ))}
              </Card>
            )}

            {/* RECORDS */}
            {tab === "records" && (
              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 16 }}>Rekam Medis ({recordsList.length})</div>
                {recordsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#7a9e96" }}>Belum ada rekam medis dari dokter</div>
                ) : recordsList.map(r => (
                  <div key={r.id} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e8f5f1", marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420", marginBottom: 6 }}>Diagnosis: {r.diagnosis}</div>
                    <div style={{ fontSize: 12, color: "#5a7870" }}>Dokter: {r.doctor?.name} ({r.doctor?.specialist})</div>
                    {r.prescription && <div style={{ fontSize: 12, color: "#1a2e28", marginTop: 4 }}>Resep: {r.prescription}</div>}
                    {r.notes && <div style={{ fontSize: 11, color: "#7a9e96", marginTop: 2 }}>Catatan: {r.notes}</div>}
                    {r.followUpDate && <div style={{ fontSize: 11, color: G, marginTop: 4, fontWeight: 500 }}>Follow-up: {formatDate(r.followUpDate)}</div>}
                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 6 }}>{formatDate(r.createdAt)}</div>
                  </div>
                ))}
              </Card>
            )}

            {/* PROFILE */}
            {tab === "profile" && (
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
                <Card style={{ textAlign: "center" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg,${G},#5ecfb1)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 26, fontWeight: 700, color: "white" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#0f2420" }}>{profile?.name || user.name}</div>
                  <div style={{ fontSize: 12, color: "#7a9e96", marginTop: 2 }}>Pasien</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                    {[
                      { icon: Mail, value: profile?.email || user.email },
                      { icon: Phone, value: profile?.phone || user.phone || "-" },
                    ].map(({ icon: Icon, value }, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f8fcfa", borderRadius: 10 }}>
                        <Icon size={13} color={G} />
                        <span style={{ fontSize: 12, color: "#5a7870" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f2420" }}>Edit Profil</div>
                    <button onClick={() => setEditingProfile(!editingProfile)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${editingProfile ? "#dc2626" : G}`, background: "white", color: editingProfile ? "#dc2626" : G, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                      {editingProfile ? <><X size={12} /> Batal</> : <><Edit3 size={12} /> Edit</>}
                    </button>
                  </div>
                  {editingProfile ? (
                    <div>
                      {[
                        { label: "Nama Lengkap", key: "name" as const },
                        { label: "Nomor HP", key: "phone" as const },
                      ].map(({ label, key }) => (
                        <div key={key} style={{ marginBottom: 14 }}>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3d6058", marginBottom: 5 }}>{label}</label>
                          <input value={profileForm[key] || ""} onChange={e => setProfileForm(p => ({ ...p, [key]: e.target.value }))}
                            style={{ width: "100%", border: "1.5px solid #c8dfd8", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "'Outfit',sans-serif", boxSizing: "border-box" }} />
                        </div>
                      ))}
                      {profileError && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "9px 13px", fontSize: 12, color: "#dc2626", marginBottom: 12 }}>{profileError}</div>}
                      <button onClick={handleSaveProfile} disabled={savingProfile}
                        style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: savingProfile ? "#7a9e96" : G, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                        {savingProfile ? "Menyimpan..." : "Simpan Profil"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { label: "Nama", value: profile?.name || user.name },
                        { label: "Email", value: profile?.email || user.email },
                        { label: "Telepon", value: profile?.phone || user.phone || "-" },
                        { label: "Bergabung", value: profile?.createdAt ? formatDate(profile.createdAt) : "-" },
                      ].map(({ label, value }, i) => (
                        <div key={i} style={{ background: "#f8fcfa", borderRadius: 12, padding: "12px 14px" }}>
                          <div style={{ fontSize: 11, color: "#7a9e96", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 13, color: "#0f2420", fontWeight: 500 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
