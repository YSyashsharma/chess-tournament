import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Plus, Trash2, Pencil, X, Check, Lock, ChevronRight } from "lucide-react";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API = (process.env.REACT_APP_API || "") + "/api";
const PIECES = ["♔","♕","♖","♗","♘","♙"];

// ── Animated Number ───────────────────────────────────────────────────────────
function AnimNum({ value, duration = 1200 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const end = parseInt(value) || 0;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setV(Math.round(ease * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{v}</>;
}

// ── Chess Loader ──────────────────────────────────────────────────────────────
function ChessLoader() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % PIECES.length), 380);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#F0F4F0" }}>
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle, #c8d4c8 1px, transparent 1px)",
        backgroundSize: "28px 28px", opacity: 0.5
      }} />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-end gap-4 h-20">
          {PIECES.map((p, i) => (
            <motion.span key={i}
              animate={{ y: active === i ? -22 : 0, scale: active === i ? 1.4 : 0.85, opacity: active === i ? 1 : 0.18 }}
              transition={{ type: "spring", damping: 12, stiffness: 240 }}
              style={{ fontSize: 34, fontFamily: "serif", color: active === i ? "#1a1a1a" : "#888", display: "block" }}>
              {p}
            </motion.span>
          ))}
        </div>
        <div className="flex gap-1.5">
          {PIECES.map((_, i) => (
            <motion.div key={i}
              animate={{ width: active === i ? 24 : 5, background: active === i ? "#1a1a1a" : "#ccc" }}
              transition={{ type: "spring", damping: 16 }}
              style={{ height: 2, borderRadius: 99 }} />
          ))}
        </div>
        <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "#999", fontFamily: "'DM Mono',monospace" }}>INITIALIZING ARENA</p>
      </div>
    </motion.div>
  );
}

// ── Password Modal ────────────────────────────────────────────────────────────
function PasswordModal({ title, subtitle, onConfirm, onCancel }) {
  const [pw, setPw] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(240,244,240,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onCancel}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }} transition={{ type: "spring", damping: 22 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm p-7"
        style={{ background: "#fff", borderTop: "3px solid #1a1a1a" }}>
        <div className="w-6 h-0.5 mx-auto mb-6 sm:hidden" style={{ background: "#ddd" }} />
        <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#aaa", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>ACCESS REQUIRED</p>
        <p className="font-black text-2xl mb-1" style={{ fontFamily: "'Syne',sans-serif", color: "#1a1a1a" }}>{title}</p>
        {subtitle && <p className="mb-6 text-sm" style={{ color: "#888" }}>{subtitle}</p>}
        <input ref={ref} type="password" placeholder="ENTER PASSWORD"
          value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onConfirm(pw)}
          className="w-full px-4 py-3 text-sm mb-4 outline-none font-mono"
          style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", letterSpacing: "0.15em", color: "#1a1a1a" }} />
        <div className="flex gap-2">
          <button onClick={() => onConfirm(pw)}
            className="flex-1 py-3 text-sm font-black transition active:scale-95"
            style={{ background: "#1a1a1a", color: "#fff", letterSpacing: "0.08em" }}>CONFIRM</button>
          <button onClick={onCancel}
            className="px-5 py-3 text-sm font-semibold"
            style={{ background: "transparent", color: "#aaa", border: "1px solid #e0e0e0" }}>CANCEL</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Graph Tooltip ─────────────────────────────────────────────────────────────
function GraphTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: "10px 14px" }}>
      <p style={{ fontSize: 9, letterSpacing: "0.15em", color: "#aaa", marginBottom: 6, fontFamily: "'DM Mono',monospace" }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, background: p.color }} />
          <span style={{ fontSize: 11, color: "#888" }}>{p.name}</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#1a1a1a", marginLeft: "auto", paddingLeft: 16, fontFamily: "'Syne',sans-serif" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Scanline Label ────────────────────────────────────────────────────────────
function Label({ children, accent }) {
  return (
    <p style={{ fontSize: 9, letterSpacing: "0.22em", color: accent || "#aaa", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>
      {children}
    </p>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider({ vertical, style }) {
  return <div style={{ background: "#ddd", width: vertical ? 1 : "100%", height: vertical ? "100%" : 1, flexShrink: 0, ...style }} />;
}

// ── Match Row ─────────────────────────────────────────────────────────────────
function MatchRow({ m, i, onEdit, onDelete }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const isY = m.winner === "Yash", isDraw = m.winner === "Draw";
  const accent = isY ? "#2d6a3f" : isDraw ? "#b8860b" : "#4a3a8a";
  const accentLight = isY ? "#e8f5ec" : isDraw ? "#fdf8e3" : "#eeebf8";
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: i * 0.05, duration: 0.4 }}
      style={{ borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "stretch" }}>
      {/* Index */}
      <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #e8e8e8", flexShrink: 0, padding: "14px 0" }}>
        <span style={{ fontSize: 10, color: "#ccc", fontFamily: "'DM Mono',monospace" }}>{String(i + 1).padStart(2, "0")}</span>
      </div>
      {/* Piece */}
      <div style={{ width: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #e8e8e8", flexShrink: 0, background: accentLight }}>
        <span style={{ fontSize: 22, fontFamily: "serif", color: accent }}>{isY ? "♔" : isDraw ? "♞" : "♛"}</span>
      </div>
      {/* Info */}
      <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#1a1a1a", fontFamily: "'Syne',sans-serif" }}>
            {m.winner === "Draw" ? "DRAW" : `${m.winner.toUpperCase()} WON`}
          </span>
          <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "#aaa", fontFamily: "'DM Mono',monospace" }}>{m.match_date}</span>
        </div>
        {m.notes && <p style={{ fontSize: 11, color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.notes}</p>}
        <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
          <span style={{ fontSize: 10, padding: "2px 7px", background: "#e8f5ec", color: "#2d6a3f", fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>Y:{m.yash_points}</span>
          <span style={{ fontSize: 10, padding: "2px 7px", background: "#eeebf8", color: "#4a3a8a", fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>N:{m.nishant_points}</span>
        </div>
      </div>
      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, borderLeft: "1px solid #e8e8e8", flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onEdit(m)}
          style={{ width: 44, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", borderRight: "1px solid #e8e8e8" }}>
          <Pencil size={12} color="#bbb" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onDelete(m)}
          style={{ width: 44, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
          <Trash2 size={12} color="#e57373" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState({ match_date: td(), winner: "Yash", notes: "" });
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("overview");

  function td() { return new Date().toISOString().split("T")[0]; }
  const START = new Date("2026-04-04"), TOTAL = 21;
  const day = Math.max(1, Math.min(Math.floor((new Date() - START) / 86400000) + 1, TOTAL));
  const pct = Math.round((day / TOTAL) * 100);

  const load = async (first = false) => {
    if (first) setLoading(true);
    try {
      const [m, s] = await Promise.all([axios.get(`${API}/matches`), axios.get(`${API}/stats`)]);
      setStats(s.data);
      const u = Array.from(new Map(m.data.map(i => [i.id, i])).values());
      setMatches(u);
      let y = 0, n = 0;
      setGraphData(u.slice().sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
        .map(x => { y += x.yash_points; n += x.nishant_points; return { date: x.match_date, Yash: y, Nishant: n }; }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(true); }, []);

  const openAdd = () => setModal({ action: "auth-add", title: "Add Match", subtitle: "Password required to record a match" });
  const openEdit = m => setModal({ action: "auth-edit", payload: m, title: "Edit Match", subtitle: "Password required to edit" });
  const openDelete = m => setModal({ action: "auth-delete", payload: m, title: "Delete Match", subtitle: `Remove match on ${m.match_date}?` });

  const confirmModal = async (pw) => {
    if (!pw) return;
    const { action, payload } = modal;
    if (action === "auth-add") {
      setModal(null); setEditTarget(null);
      setFormData({ match_date: td(), winner: "Yash", notes: "" });
      setShowForm({ mode: "add", pw });
    } else if (action === "auth-edit") {
      setModal(null); setEditTarget(payload);
      setFormData({ match_date: payload.match_date, winner: payload.winner, notes: payload.notes || "" });
      setShowForm({ mode: "edit", pw });
    } else if (action === "auth-delete") {
      try {
        await axios.delete(`${API}/matches/${payload.id}`, { headers: { "x-password": pw } });
        setModal(null); load();
      } catch { alert("Wrong password."); setModal(null); }
    }
  };

  const saveForm = async () => {
    try {
      if (showForm.mode === "add") await axios.post(`${API}/matches`, formData, { headers: { "x-password": showForm.pw } });
      else await axios.put(`${API}/matches/${editTarget.id}`, formData, { headers: { "x-password": showForm.pw } });
      setShowForm(false); setEditTarget(null); load();
    } catch { alert("Server error."); }
  };

  const leader = stats
    ? stats.yash_total_points > stats.nishant_total_points ? "Yash"
    : stats.nishant_total_points > stats.yash_total_points ? "Nishant" : "Tied"
    : "—";

  const getStreaks = () => {
    if (!matches.length) return { yBest: 0, nBest: 0 };
    const sorted = [...matches].sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
    let yBest = 0, nBest = 0, ty = 0, tn = 0;
    sorted.forEach(m => {
      if (m.winner === "Yash") { ty++; tn = 0; yBest = Math.max(yBest, ty); }
      else if (m.winner === "Nishant") { tn++; ty = 0; nBest = Math.max(nBest, tn); }
      else { ty = 0; tn = 0; }
    });
    return { yBest, nBest };
  };
  const { yBest, nBest } = getStreaks();

  const inp = { background: "#f5f5f5", border: "none", borderBottom: "2px solid #1a1a1a", padding: "12px 14px", fontSize: 13, color: "#1a1a1a", width: "100%", outline: "none", fontFamily: "'DM Sans',sans-serif", marginBottom: 14, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4F0", fontFamily: "'DM Sans',sans-serif", color: "#1a1a1a" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        option { background: #fff; color: #1a1a1a; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.3; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #f0f4f0; }
        ::-webkit-scrollbar-thumb { background: #ccc; }
        @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
      `}</style>

      <AnimatePresence>{loading && <ChessLoader />}</AnimatePresence>
      <AnimatePresence>
        {modal && <PasswordModal title={modal.title} subtitle={modal.subtitle} onConfirm={confirmModal} onCancel={() => setModal(null)} />}
      </AnimatePresence>

      {/* ── TOP NAV ── */}
      <div style={{ borderBottom: "1px solid #d8ddd8", background: "#F0F4F0", position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "stretch", height: 48 }}>
        {/* Logo cell */}
        <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: 10, borderRight: "1px solid #d8ddd8" }}>
          <span style={{ fontSize: 20, fontFamily: "serif" }}>♟</span>
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "#aaa", fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>SYSTEM</p>
            <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", fontFamily: "'Syne',sans-serif", lineHeight: 1.2 }}>CHESS ARENA</p>
          </div>
        </div>
        {/* Tabs */}
        {["OVERVIEW", "HISTORY"].map(t => (
          <button key={t} onClick={() => setTab(t.toLowerCase())}
            style={{
              padding: "0 20px", fontSize: 10, letterSpacing: "0.18em", fontFamily: "'DM Mono',monospace",
              color: tab === t.toLowerCase() ? "#1a1a1a" : "#aaa",
              borderRight: "1px solid #d8ddd8", borderBottom: tab === t.toLowerCase() ? "2px solid #1a1a1a" : "2px solid transparent",
              background: "transparent", cursor: "pointer", transition: "all 0.2s"
            }}>{t}</button>
        ))}
        {/* Spacer */}
        <div style={{ flex: 1 }} />
        {/* Day cell */}
        <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: 10, borderLeft: "1px solid #d8ddd8" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "#aaa", fontFamily: "'DM Mono',monospace" }}>DAY</p>
          <p style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{day}</p>
          <p style={{ fontSize: 9, color: "#ccc", fontFamily: "'DM Mono',monospace" }}>/{TOTAL}</p>
        </div>
        {/* Add button */}
        <button onClick={openAdd}
          style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid #d8ddd8", background: "#1a1a1a", color: "#fff", cursor: "pointer", fontSize: 10, letterSpacing: "0.18em", fontFamily: "'DM Mono',monospace" }}>
          <Plus size={13} /> ADD MATCH
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {tab === "overview" && (
          <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

            {/* ── ROW 1: Hero section ── */}
            <div style={{ display: "flex", borderBottom: "1px solid #d8ddd8", minHeight: 220 }}>
              {/* Left: Day counter (like 27B) */}
              <div style={{ flex: "0 0 260px", borderRight: "1px solid #d8ddd8", padding: "28px 28px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Label>TOURNAMENT DAY</Label>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
                    style={{ fontSize: 96, fontWeight: 900, lineHeight: 0.9, fontFamily: "'Syne',sans-serif", color: "#1a1a1a", letterSpacing: "-4px" }}>
                    {day}
                  </motion.p>
                </div>
                <div>
                  <Divider style={{ marginBottom: 10 }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div><Label>PROGRESS</Label><p style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{pct}%</p></div>
                    <div style={{ textAlign: "right" }}><Label>REMAINING</Label><p style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{TOTAL - day} days</p></div>
                  </div>
                  <div style={{ width: "100%", height: 3, background: "#e0e0e0", marginTop: 10, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: "100%", background: "#1a1a1a" }} />
                  </div>
                </div>
              </div>

              {/* Center: Score display */}
              <div style={{ flex: 1, display: "flex" }}>
                {/* Yash score */}
                <div style={{ flex: 1, borderRight: "1px solid #d8ddd8", padding: "28px 28px 24px", background: leader === "Yash" ? "#e8f5ec" : "#F0F4F0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <Label accent={leader === "Yash" ? "#2d6a3f" : undefined}>PLAYER 01</Label>
                    <p style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Syne',sans-serif", marginBottom: 6, letterSpacing: "0.04em" }}>YASH</p>
                    <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring", damping: 14 }}
                      style={{ fontSize: 72, fontWeight: 900, fontFamily: "'Syne',sans-serif", lineHeight: 1, color: leader === "Yash" ? "#2d6a3f" : "#1a1a1a" }}>
                      {stats ? <AnimNum value={stats.yash_total_points} /> : "—"}
                    </motion.p>
                  </div>
                  <div>
                    <Divider style={{ marginBottom: 10 }} />
                    <div style={{ display: "flex", gap: 20 }}>
                      <div><Label>WINS</Label><p style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{stats?.yash_wins ?? "—"}</p></div>
                      <div><Label>STREAK</Label><p style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{yBest}</p></div>
                      {leader === "Yash" && <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end" }}><span style={{ fontSize: 24, fontFamily: "serif" }}>♔</span></div>}
                    </div>
                  </div>
                </div>

                {/* VS column */}
                <div style={{ width: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: "1px solid #d8ddd8", gap: 6 }}>
                  <div style={{ width: 1, flex: 1, background: "#d8ddd8" }} />
                  <p style={{ fontSize: 11, fontWeight: 900, fontFamily: "'Syne',sans-serif", letterSpacing: "0.05em", color: "#888" }}>VS</p>
                  <div style={{ width: 1, flex: 1, background: "#d8ddd8" }} />
                </div>

                {/* Nishant score */}
                <div style={{ flex: 1, padding: "28px 28px 24px", background: leader === "Nishant" ? "#eeebf8" : "#F0F4F0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <Label accent={leader === "Nishant" ? "#4a3a8a" : undefined}>PLAYER 02</Label>
                    <p style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Syne',sans-serif", marginBottom: 6, letterSpacing: "0.04em" }}>NISHANT</p>
                    <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25, type: "spring", damping: 14 }}
                      style={{ fontSize: 72, fontWeight: 900, fontFamily: "'Syne',sans-serif", lineHeight: 1, color: leader === "Nishant" ? "#4a3a8a" : "#1a1a1a" }}>
                      {stats ? <AnimNum value={stats.nishant_total_points} /> : "—"}
                    </motion.p>
                  </div>
                  <div>
                    <Divider style={{ marginBottom: 10 }} />
                    <div style={{ display: "flex", gap: 20 }}>
                      <div><Label>WINS</Label><p style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{stats?.nishant_wins ?? "—"}</p></div>
                      <div><Label>STREAK</Label><p style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{nBest}</p></div>
                      {leader === "Nishant" && <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end" }}><span style={{ fontSize: 24, fontFamily: "serif" }}>♛</span></div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Leader panel */}
              <div style={{ flex: "0 0 180px", borderLeft: "1px solid #d8ddd8", padding: "28px 20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Label>CURRENT LEADER</Label>
                  <motion.p initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                    style={{ fontSize: 38, fontWeight: 900, fontFamily: "'Syne',sans-serif", lineHeight: 1.1, letterSpacing: "-1px" }}>
                    {leader}
                  </motion.p>
                </div>
                <div>
                  <Divider style={{ marginBottom: 10 }} />
                  <Label>TOTAL MATCHES</Label>
                  <p style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{stats?.total_matches ?? "—"}</p>
                  <Label style={{ marginTop: 8 }}>DRAWS</Label>
                  <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{stats?.draws ?? "—"}</p>
                </div>
              </div>
            </div>

            {/* ── ROW 2: Win bar + meta ── */}
            <div style={{ display: "flex", borderBottom: "1px solid #d8ddd8", height: 56 }}>
              <div style={{ display: "flex", alignItems: "center", padding: "0 20px", borderRight: "1px solid #d8ddd8", gap: 10, flexShrink: 0 }}>
                <Label>WIN SPLIT</Label>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 20px", gap: 4 }}>
                {stats && stats.total_matches > 0 && (() => {
                  const yp = Math.round((stats.yash_wins / stats.total_matches) * 100);
                  const np = Math.round((stats.nishant_wins / stats.total_matches) * 100);
                  const dp = 100 - yp - np;
                  return (
                    <div style={{ flex: 1, display: "flex", height: 6, gap: 2, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${yp}%` }} transition={{ duration: 1, delay: 0.4 }}
                        style={{ background: "#2d6a3f", height: "100%", borderRadius: 0 }} />
                      <motion.div initial={{ width: 0 }} animate={{ width: `${dp}%` }} transition={{ duration: 1, delay: 0.6 }}
                        style={{ background: "#c8b400", height: "100%", borderRadius: 0 }} />
                      <motion.div initial={{ width: 0 }} animate={{ width: `${np}%` }} transition={{ duration: 1, delay: 0.8 }}
                        style={{ background: "#4a3a8a", height: "100%", borderRadius: 0 }} />
                    </div>
                  );
                })()}
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "0 16px", borderLeft: "1px solid #d8ddd8", gap: 16 }}>
                {[["Y", "#2d6a3f", `${stats ? Math.round((stats.yash_wins / (stats.total_matches || 1)) * 100) : 0}%`],
                  ["D", "#c8b400", `${stats ? Math.round((stats.draws / (stats.total_matches || 1)) * 100) : 0}%`],
                  ["N", "#4a3a8a", `${stats ? Math.round((stats.nishant_wins / (stats.total_matches || 1)) * 100) : 0}%`]
                ].map(([l, c, v]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, background: c }} />
                    <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "#aaa", fontFamily: "'DM Mono',monospace" }}>{l} {v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ROW 3: Graph ── */}
            <div style={{ display: "flex", borderBottom: "1px solid #d8ddd8" }}>
              <div style={{ flex: 1, padding: "20px 0 0" }}>
                <div style={{ padding: "0 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Label>CUMULATIVE POINTS — MATCH TIMELINE</Label>
                  <div style={{ display: "flex", gap: 16 }}>
                    {[["YASH", "#2d6a3f"], ["NISHANT", "#4a3a8a"]].map(([n, c]) => (
                      <div key={n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 16, height: 2, background: c }} />
                        <span style={{ fontSize: 9, letterSpacing: "0.15em", fontFamily: "'DM Mono',monospace", color: "#aaa" }}>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={graphData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2d6a3f" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#2d6a3f" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4a3a8a" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#4a3a8a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="1 8" stroke="#e8e8e8" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#bbb", fontSize: 9, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#bbb", fontSize: 9, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<GraphTooltip />} />
                    <Area type="monotone" dataKey="Yash" stroke="#2d6a3f" strokeWidth={2} fill="url(#gy)" dot={false} activeDot={{ r: 3, fill: "#2d6a3f", strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="Nishant" stroke="#4a3a8a" strokeWidth={2} fill="url(#gn)" dot={false} activeDot={{ r: 3, fill: "#4a3a8a", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Right panel: graph meta */}
              <div style={{ width: 160, borderLeft: "1px solid #d8ddd8", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div><Label>Y MAX PTS</Label><p style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{graphData.length ? graphData[graphData.length - 1]?.Yash : "—"}</p></div>
                <Divider />
                <div><Label>N MAX PTS</Label><p style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{graphData.length ? graphData[graphData.length - 1]?.Nishant : "—"}</p></div>
                <Divider />
                <div><Label>MATCHES</Label><p style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{matches.length}</p></div>
              </div>
            </div>

            {/* ── ROW 4: Recent matches header ── */}
            <div style={{ display: "flex", borderBottom: "1px solid #d8ddd8", height: 40, alignItems: "center" }}>
              <div style={{ padding: "0 20px", borderRight: "1px solid #d8ddd8" }}>
                <Label>RECENT MATCHES</Label>
              </div>
              <div style={{ flex: 1 }} />
              <button onClick={() => setTab("history")}
                style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: 6, background: "transparent", cursor: "pointer", borderLeft: "1px solid #d8ddd8", height: "100%", fontSize: 9, letterSpacing: "0.18em", fontFamily: "'DM Mono',monospace", color: "#888" }}>
                VIEW ALL <ChevronRight size={11} />
              </button>
            </div>

            {/* ── Match column headers ── */}
            <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", height: 32, alignItems: "center" }}>
              <div style={{ width: 44, borderRight: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: "#ccc", fontFamily: "'DM Mono',monospace" }}>#</span>
              </div>
              <div style={{ width: 48, borderRight: "1px solid #e8e8e8" }} />
              <div style={{ flex: 1, padding: "0 14px" }}><span style={{ fontSize: 8, letterSpacing: "0.18em", color: "#bbb", fontFamily: "'DM Mono',monospace" }}>RESULT · DATE · NOTES</span></div>
              <div style={{ width: 88, borderLeft: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: "#ccc", fontFamily: "'DM Mono',monospace" }}>ACTIONS</span>
              </div>
            </div>

            <AnimatePresence>
              {matches.slice(0, 5).map((m, i) => (
                <MatchRow key={m.id} m={m} i={i} onEdit={openEdit} onDelete={openDelete} />
              ))}
            </AnimatePresence>

            {matches.length === 0 && !loading && (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <span style={{ fontSize: 48, fontFamily: "serif", opacity: 0.1, display: "block", marginBottom: 12 }}>♟</span>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#bbb", fontFamily: "'DM Mono',monospace" }}>NO MATCHES RECORDED</p>
              </div>
            )}

          </motion.div>
        )}

        {/* ══════════════ HISTORY TAB ══════════════ */}
        {tab === "history" && (
          <motion.div key="hist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {/* Header row */}
            <div style={{ display: "flex", borderBottom: "1px solid #d8ddd8", height: 56, alignItems: "center" }}>
              <div style={{ padding: "0 20px", borderRight: "1px solid #d8ddd8" }}>
                <Label>ALL MATCHES</Label>
                <p style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{matches.length} RECORDED</p>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ padding: "0 20px", borderLeft: "1px solid #d8ddd8" }}>
                <Label>APR 4 – APR 24, 2026</Label>
              </div>
            </div>
            {/* Column headers */}
            <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", height: 32, alignItems: "center" }}>
              <div style={{ width: 44, borderRight: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: "#ccc", fontFamily: "'DM Mono',monospace" }}>#</span>
              </div>
              <div style={{ width: 48, borderRight: "1px solid #e8e8e8" }} />
              <div style={{ flex: 1, padding: "0 14px" }}><span style={{ fontSize: 8, letterSpacing: "0.18em", color: "#bbb", fontFamily: "'DM Mono',monospace" }}>RESULT · DATE · NOTES</span></div>
              <div style={{ width: 88, borderLeft: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: "#ccc", fontFamily: "'DM Mono',monospace" }}>ACTIONS</span>
              </div>
            </div>
            <AnimatePresence>
              {matches.map((m, i) => <MatchRow key={m.id} m={m} i={i} onEdit={openEdit} onDelete={openDelete} />)}
            </AnimatePresence>
            {matches.length === 0 && (
              <div style={{ padding: "80px 20px", textAlign: "center" }}>
                <span style={{ fontSize: 64, fontFamily: "serif", opacity: 0.07, display: "block", marginBottom: 16 }}>♟</span>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#bbb", fontFamily: "'DM Mono',monospace" }}>NO MATCHES RECORDED YET</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form Drawer ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(240,244,240,0.9)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            onClick={() => { setShowForm(false); setEditTarget(null); }}>
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 480, background: "#fff", borderTop: "3px solid #1a1a1a" }}>
              {/* Form header */}
              <div style={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid #e8e8e8" }}>
                <div style={{ flex: 1, padding: "16px 20px" }}>
                  <Label>{showForm.mode === "edit" ? "EDITING MATCH" : "NEW MATCH"}</Label>
                  <p style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>
                    {showForm.mode === "edit" ? editTarget?.match_date : "RECORD RESULT"}
                  </p>
                </div>
                <button onClick={() => { setShowForm(false); setEditTarget(null); }}
                  style={{ width: 56, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #e8e8e8", background: "transparent", cursor: "pointer" }}>
                  <X size={16} color="#bbb" />
                </button>
              </div>
              <div style={{ padding: 20 }}>
                <Label>MATCH DATE</Label>
                <input type="date" value={formData.match_date}
                  onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                  style={{ ...inp }} />
                <Label>WINNER</Label>
                <select value={formData.winner}
                  onChange={e => setFormData({ ...formData, winner: e.target.value })}
                  style={{ ...inp }}>
                  <option value="Yash">♔ YASH WINS</option>
                  <option value="Nishant">♛ NISHANT WINS</option>
                  <option value="Draw">♞ DRAW</option>
                </select>
                <Label>NOTES (OPTIONAL)</Label>
                <textarea placeholder="Match notes…" value={formData.notes} rows={2}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  style={{ ...inp, resize: "none" }} />
                <motion.button whileTap={{ scale: 0.98 }} onClick={saveForm}
                  style={{ width: "100%", padding: "14px 0", background: "#1a1a1a", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "'DM Mono',monospace", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none" }}>
                  <Check size={14} /> {showForm.mode === "edit" ? "SAVE CHANGES" : "RECORD MATCH"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}