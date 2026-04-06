import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Trophy, Crown, Plus, Trash2, Pencil, X, Check, Lock,
  Swords, TrendingUp, Shield, Zap, Target, Activity, ChevronRight
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Cell, PieChart, Pie
} from "recharts";

const API = (process.env.REACT_APP_API || "") + "/api";
const PIECES = ["♔", "♕", "♖", "♗", "♘", "♙"];

// ── Chess Loader ──────────────────────────────────────────────────────────────
function ChessLoader() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % PIECES.length), 380);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#050505" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)",
        backgroundSize: "48px 48px"
      }} />
      <div className="absolute w-96 h-96 rounded-full" style={{
        background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)"
      }} />
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-end gap-4 mb-6 h-24">
          {PIECES.map((piece, i) => (
            <motion.span key={i} animate={{
              y: active === i ? -28 : 0,
              scale: active === i ? 1.5 : 0.9,
              opacity: active === i ? 1 : 0.15,
              filter: active === i ? "drop-shadow(0 0 12px #22c55e)" : "none"
            }} transition={{ type: "spring", damping: 10, stiffness: 220 }}
              style={{ fontSize: 36, fontFamily: "serif", color: active === i ? "#22c55e" : "#fff", display: "block" }}>
              {piece}
            </motion.span>
          ))}
        </div>
        <div className="flex gap-1.5 mb-6">
          {PIECES.map((_, i) => (
            <motion.div key={i} animate={{ width: active === i ? 28 : 6, background: active === i ? "#22c55e" : "#1c1c1c" }}
              transition={{ type: "spring", damping: 18 }} className="h-1 rounded-full" />
          ))}
        </div>
        <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}
          style={{ color: "#2a2a2a", fontSize: 11, letterSpacing: "0.2em", fontFamily: "'DM Sans',sans-serif" }}>
          LOADING CHESS ARENA
        </motion.p>
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
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" }} onClick={onCancel}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", damping: 22 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6"
        style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}>
        <div className="w-8 h-1 rounded-full mx-auto mb-5 sm:hidden" style={{ background: "#222" }} />
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "linear-gradient(135deg,#0f2d1a,#1a4a2a)" }}>
          <Lock size={18} color="#22c55e" />
        </div>
        <p className="text-white font-black text-xl mb-1" style={{ fontFamily: "'Syne',sans-serif" }}>{title}</p>
        {subtitle && <p className="text-sm mb-5" style={{ color: "#444" }}>{subtitle}</p>}
        <input ref={ref} type="password" placeholder="Enter password…" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && onConfirm(pw)}
          className="w-full rounded-2xl px-4 py-3 text-white text-sm mb-4 outline-none"
          style={{ background: "#111", border: "1px solid #222", caretColor: "#22c55e" }} />
        <div className="flex gap-2">
          <button onClick={() => onConfirm(pw)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold transition active:scale-95"
            style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#000" }}>Confirm</button>
          <button onClick={onCancel} className="px-5 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: "#111", color: "#555", border: "1px solid #1a1a1a" }}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Custom Graph Tooltip ──────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl px-4 py-3" style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
      <p className="text-xs mb-2" style={{ color: "#444" }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-xs" style={{ color: "#666" }}>{p.name}</span>
          <span className="text-sm font-black ml-auto pl-6" style={{ color: p.color, fontFamily: "'Syne',sans-serif" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ value, color }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) { setDisplay(end); return; }
    const step = Math.ceil(end / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span style={{ color }}>{display}</span>;
}

// ── Ticker Row ────────────────────────────────────────────────────────────────
function TickerRow({ stats }) {
  const items = stats ? [
    { label: "TOTAL MATCHES", value: stats.total_matches, color: "#fff" },
    { label: "YASH WINS", value: stats.yash_wins, color: "#22c55e" },
    { label: "NISHANT WINS", value: stats.nishant_wins, color: "#818cf8" },
    { label: "DRAWS", value: stats.draws, color: "#facc15" },
    { label: "YASH POINTS", value: stats.yash_total_points, color: "#22c55e" },
    { label: "NISHANT POINTS", value: stats.nishant_total_points, color: "#818cf8" },
  ] : [];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden mb-5 rounded-2xl" style={{ background: "#0a0a0a", border: "1px solid #111" }}>
      <motion.div className="flex gap-8 py-3 px-4"
        animate={{ x: ["0%", "-50%"] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold" style={{ color: "#2a2a2a", letterSpacing: "0.08em" }}>{item.label}</span>
            <span className="text-xs font-black" style={{ color: item.color, fontFamily: "'Syne',sans-serif" }}>{item.value}</span>
            <span className="text-xs" style={{ color: "#1a1a1a" }}>◆</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Win Rate Bar ──────────────────────────────────────────────────────────────
function WinRateBar({ yashWins, nishantWins, draws, total }) {
  if (!total) return null;
  const yp = Math.round((yashWins / total) * 100);
  const np = Math.round((nishantWins / total) * 100);
  const dp = 100 - yp - np;
  return (
    <div className="mb-5 rounded-3xl p-5" style={{ background: "#0a0a0a", border: "1px solid #111" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold" style={{ color: "#333", letterSpacing: "0.12em" }}>WIN DISTRIBUTION</p>
        <p className="text-xs" style={{ color: "#2a2a2a" }}>{total} matches</p>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
        <motion.div initial={{ width: 0 }} animate={{ width: `${yp}%` }} transition={{ duration: 1, delay: 0.3 }}
          style={{ background: "linear-gradient(90deg,#16a34a,#22c55e)", borderRadius: "9999px 0 0 9999px" }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${dp}%` }} transition={{ duration: 1, delay: 0.5 }}
          style={{ background: "#1a1400" }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${np}%` }} transition={{ duration: 1, delay: 0.7 }}
          style={{ background: "linear-gradient(90deg,#4f46e5,#818cf8)", borderRadius: "0 9999px 9999px 0" }} />
      </div>
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
          <span style={{ color: "#444" }}>Yash {yp}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#facc15" }} />
          <span style={{ color: "#444" }}>Draw {dp}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#818cf8" }} />
          <span style={{ color: "#444" }}>Nishant {np}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Best Streak ───────────────────────────────────────────────────────────────
function getStreaks(matches) {
  if (!matches.length) return { yash: 0, nishant: 0, current: null, currentCount: 0 };
  const sorted = [...matches].sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
  let yBest = 0, nBest = 0, cur = null, curCount = 0, tmpY = 0, tmpN = 0;
  sorted.forEach(m => {
    if (m.winner === "Yash") { tmpY++; tmpN = 0; yBest = Math.max(yBest, tmpY); }
    else if (m.winner === "Nishant") { tmpN++; tmpY = 0; nBest = Math.max(nBest, tmpN); }
    else { tmpY = 0; tmpN = 0; }
  });
  const last = sorted[sorted.length - 1];
  cur = last.winner;
  let streak = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    if (sorted[i].winner === cur) streak++;
    else break;
  }
  return { yash: yBest, nishant: nBest, current: cur === "Draw" ? null : cur, currentCount: streak };
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ m, i, onEdit, onDelete }) {
  const isYash = m.winner === "Yash", isDraw = m.winner === "Draw";
  const clr = isYash ? "#22c55e" : isDraw ? "#facc15" : "#818cf8";
  const bg = isYash ? "#0a1a0f" : isDraw ? "#141000" : "#0d0d1a";
  const bdr = isYash ? "#0f2d1a" : isDraw ? "#1f1800" : "#151528";
  const icon = isYash ? "♔" : isDraw ? "♞" : "♛";
  return (
    <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }} transition={{ delay: i * 0.04, type: "spring", damping: 20 }}
      whileHover={{ scale: 1.01, borderColor: clr }}
      className="rounded-2xl p-4 mb-2 flex items-center gap-3 cursor-default transition-all"
      style={{ background: bg, border: `1px solid ${bdr}` }}>
      <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
        style={{ background: "rgba(0,0,0,0.3)", fontFamily: "serif", filter: `drop-shadow(0 0 8px ${clr}44)` }}>
        {icon}
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold text-sm" style={{ color: clr }}>
            {m.winner === "Draw" ? "Draw" : `${m.winner} won`}
          </p>
          <div className="flex-1 h-px" style={{ background: bdr }} />
          <p className="text-xs" style={{ color: "#2a2a2a" }}>{m.match_date}</p>
        </div>
        {m.notes && <p className="text-xs truncate mb-1" style={{ color: "#333" }}>{m.notes}</p>}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-lg font-bold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>Y {m.yash_points}</span>
          <span className="text-xs" style={{ color: "#222" }}>vs</span>
          <span className="text-xs px-2 py-0.5 rounded-lg font-bold" style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8" }}>N {m.nishant_points}</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onEdit(m)}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "#111", border: "1px solid #1a1a1a" }}>
          <Pencil size={11} color="#444" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onDelete(m)}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <Trash2 size={11} color="#ef4444" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState({ match_date: today(), winner: "Yash", notes: "" });
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  function today() { return new Date().toISOString().split("T")[0]; }

  const START = new Date("2026-04-04"), TOTAL = 21;
  const diff = Math.floor((new Date() - START) / 86400000) + 1;
  const day = Math.max(1, Math.min(diff, TOTAL));
  const pct = Math.round((day / TOTAL) * 100);

  const loadData = async (first = false) => {
    if (first) setLoading(true);
    try {
      const [m, s] = await Promise.all([axios.get(`${API}/matches`), axios.get(`${API}/stats`)]);
      setStats(s.data);
      const unique = Array.from(new Map(m.data.map(i => [i.id, i])).values());
      setMatches(unique);
      let y = 0, n = 0;
      setGraphData(unique.slice().sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
        .map(x => { y += x.yash_points; n += x.nishant_points; return { date: x.match_date, Yash: y, Nishant: n }; }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(true); }, []);

  const openAddModal = () => setModal({ action: "auth-add", title: "Add Match", subtitle: "Enter password to record a new match" });
  const openEditModal = m => setModal({ action: "auth-edit", payload: m, title: "Edit Match", subtitle: "Confirm your password to edit" });
  const openDeleteModal = m => setModal({ action: "auth-delete", payload: m, title: "Delete Match", subtitle: `Remove match on ${m.match_date}?` });

  const handleModalConfirm = async (pw) => {
    if (!pw) return;
    const { action, payload } = modal;
    if (action === "auth-add") {
      setModal(null); setEditTarget(null);
      setFormData({ match_date: today(), winner: "Yash", notes: "" });
      setShowForm({ mode: "add", pw });
    } else if (action === "auth-edit") {
      setModal(null); setEditTarget(payload);
      setFormData({ match_date: payload.match_date, winner: payload.winner, notes: payload.notes || "" });
      setShowForm({ mode: "edit", pw });
    } else if (action === "auth-delete") {
      try {
        await axios.delete(`${API}/matches/${payload.id}`, { headers: { "x-password": pw } });
        setModal(null); loadData();
      } catch { alert("Wrong password."); setModal(null); }
    }
  };

  const handleFormSave = async () => {
    try {
      if (showForm.mode === "add")
        await axios.post(`${API}/matches`, formData, { headers: { "x-password": showForm.pw } });
      else
        await axios.put(`${API}/matches/${editTarget.id}`, formData, { headers: { "x-password": showForm.pw } });
      setShowForm(false); setEditTarget(null); loadData();
    } catch { alert("Server error."); }
  };

  const leader = stats
    ? stats.yash_total_points > stats.nishant_total_points ? "Yash"
    : stats.nishant_total_points > stats.yash_total_points ? "Nishant" : "tie"
    : null;

  const streaks = getStreaks(matches);

  const inp = "w-full rounded-2xl px-4 py-3 text-white text-sm mb-3 outline-none";
  const inpS = { background: "#0f0f0f", border: "1px solid #1a1a1a", caretColor: "#22c55e" };

  const TABS = ["overview", "history"];

  return (
    <div className="min-h-screen" style={{ background: "#050505", fontFamily: "'DM Sans',sans-serif", color: "white" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 99px; }
        option { background: #0f0f0f; color: white; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.3); }
      `}</style>

      <AnimatePresence>{loading && <ChessLoader />}</AnimatePresence>
      <AnimatePresence>
        {modal && <PasswordModal title={modal.title} subtitle={modal.subtitle}
          onConfirm={handleModalConfirm} onCancel={() => setModal(null)} />}
      </AnimatePresence>

      {/* ── Top Nav ── */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(5,5,5,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid #0f0f0f" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#0f2d1a,#16a34a)" }}>
            <span style={{ fontSize: 16, fontFamily: "serif" }}>♟</span>
          </div>
          <div>
            <p className="text-xs leading-none mb-0.5" style={{ color: "#333", letterSpacing: "0.1em" }}>TOURNAMENT</p>
            <p className="font-black text-sm leading-none" style={{ fontFamily: "'Syne',sans-serif" }}>Chess Arena</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition"
              style={{
                background: activeTab === t ? "#111" : "transparent",
                color: activeTab === t ? "#22c55e" : "#333",
                border: activeTab === t ? "1px solid #1a1a1a" : "1px solid transparent"
              }}>{t}</button>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl ml-1"
            style={{ background: "#0a0a0a", border: "1px solid #0f0f0f" }}>
            <Swords size={12} color="#22c55e" />
            <span className="text-xs font-bold" style={{ color: "#22c55e" }}>D{day}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-28">

        {/* ── Ticker ── */}
        <TickerRow stats={stats} />

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* ── Hero Cards Row ── */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Yash Card */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="relative overflow-hidden rounded-3xl p-5"
                  style={{ background: "linear-gradient(145deg,#0a1f12,#061209)", border: "1px solid #0f2d1a" }}>
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle,rgba(34,197,94,0.1) 0%,transparent 70%)" }} />
                  <p className="text-xs mb-1 font-semibold" style={{ color: "#1a4a2a", letterSpacing: "0.1em" }}>YASH</p>
                  <p className="text-4xl font-black mb-1" style={{ fontFamily: "'Syne',sans-serif", color: "#22c55e" }}>
                    {stats ? <Counter value={stats.yash_total_points} color="#22c55e" /> : "—"}
                  </p>
                  <p className="text-xs" style={{ color: "#1a3a22" }}>pts · {stats?.yash_wins ?? 0}W</p>
                  <div className="mt-3 flex items-center gap-1">
                    {leader === "Yash" && (
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                        ♔ LEADING
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* Nishant Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                  className="relative overflow-hidden rounded-3xl p-5"
                  style={{ background: "linear-gradient(145deg,#0d0d1f,#080812)", border: "1px solid #1a1a3a" }}>
                  <div className="absolute top-0 left-0 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle,rgba(129,140,248,0.08) 0%,transparent 70%)" }} />
                  <p className="text-xs mb-1 font-semibold" style={{ color: "#2a2a5a", letterSpacing: "0.1em" }}>NISHANT</p>
                  <p className="text-4xl font-black mb-1" style={{ fontFamily: "'Syne',sans-serif", color: "#818cf8" }}>
                    {stats ? <Counter value={stats.nishant_total_points} color="#818cf8" /> : "—"}
                  </p>
                  <p className="text-xs" style={{ color: "#2a2a4a" }}>pts · {stats?.nishant_wins ?? 0}W</p>
                  <div className="mt-3">
                    {leader === "Nishant" && (
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}>
                        ♛ LEADING
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* ── Progress Banner ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-3xl p-5 mb-4 relative overflow-hidden"
                style={{ background: "#080808", border: "1px solid #111" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target size={14} color="#22c55e" />
                    <p className="text-xs font-semibold" style={{ color: "#333", letterSpacing: "0.1em" }}>TOURNAMENT PROGRESS</p>
                  </div>
                  <p className="text-xs font-black" style={{ color: "#22c55e", fontFamily: "'Syne',sans-serif" }}>{pct}%</p>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "#111" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#166534,#22c55e,#4ade80)" }} />
                </div>
                <div className="flex justify-between text-xs" style={{ color: "#2a2a2a" }}>
                  <span>Apr 4, 2026</span>
                  <span>Day {day} of {TOTAL}</span>
                  <span>Apr 24, 2026</span>
                </div>
              </motion.div>

              {/* ── Streak + Stats Row ── */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: <Zap size={14} color="#facc15" />, label: "Current Streak", value: streaks.current ? `${streaks.currentCount} ${streaks.current === "Draw" ? "draws" : streaks.current}` : "—", color: "#facc15" },
                  { icon: <Shield size={14} color="#22c55e" />, label: "Best Y Streak", value: `${streaks.yash}W`, color: "#22c55e" },
                  { icon: <Activity size={14} color="#818cf8" />, label: "Best N Streak", value: `${streaks.nishant}W`, color: "#818cf8" },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                    className="rounded-2xl p-3" style={{ background: "#080808", border: "1px solid #111" }}>
                    <div className="flex items-center gap-1.5 mb-2">{s.icon}<p className="text-xs" style={{ color: "#2a2a2a" }}>{s.label}</p></div>
                    <p className="font-black text-base" style={{ fontFamily: "'Syne',sans-serif", color: s.color }}>{s.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* ── Win Distribution ── */}
              {stats && <WinRateBar yashWins={stats.yash_wins} nishantWins={stats.nishant_wins} draws={stats.draws} total={stats.total_matches} />}

              {/* ── Graph ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-3xl p-5 mb-4" style={{ background: "#080808", border: "1px solid #111" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} color="#22c55e" />
                    <p className="text-xs font-semibold" style={{ color: "#333", letterSpacing: "0.1em" }}>CUMULATIVE POINTS</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} /><span className="text-xs" style={{ color: "#333" }}>Yash</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: "#818cf8" }} /><span className="text-xs" style={{ color: "#333" }}>Nishant</span></div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={graphData}>
                    <defs>
                      <linearGradient id="gy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 8" stroke="#0f0f0f" />
                    <XAxis dataKey="date" tick={{ fill: "#222", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#222", fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Yash" stroke="#22c55e" strokeWidth={2} fill="url(#gy)" dot={false} activeDot={{ r: 4, fill: "#22c55e" }} />
                    <Area type="monotone" dataKey="Nishant" stroke="#818cf8" strokeWidth={2} fill="url(#gn)" dot={false} activeDot={{ r: 4, fill: "#818cf8" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* ── Recent Matches (last 3) ── */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold" style={{ color: "#333", letterSpacing: "0.1em" }}>RECENT MATCHES</p>
                  <button onClick={() => setActiveTab("history")} className="flex items-center gap-1 text-xs"
                    style={{ color: "#22c55e" }}>View all <ChevronRight size={12} /></button>
                </div>
                {matches.slice(0, 3).map((m, i) => (
                  <MatchCard key={m.id} m={m} i={i} onEdit={openEditModal} onDelete={openDeleteModal} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold" style={{ color: "#333", letterSpacing: "0.1em" }}>ALL MATCHES</p>
                <span className="text-xs px-2 py-1 rounded-xl" style={{ background: "#0a0a0a", color: "#333", border: "1px solid #111" }}>{matches.length} total</span>
              </div>
              {matches.length === 0 && (
                <div className="text-center py-20">
                  <span className="text-6xl block mb-4" style={{ filter: "grayscale(1) opacity(0.1)", fontFamily: "serif" }}>♟</span>
                  <p className="text-sm" style={{ color: "#222" }}>No matches recorded yet</p>
                </div>
              )}
              <AnimatePresence>
                {matches.map((m, i) => (
                  <MatchCard key={m.id} m={m} i={i} onEdit={openEditModal} onDelete={openDeleteModal} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Add / Edit Form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
              style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
              onClick={() => { setShowForm(false); setEditTarget(null); }}>
              <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 22 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6"
                style={{ background: "#080808", border: "1px solid #111" }}>
                <div className="w-8 h-1 rounded-full mx-auto mb-4 sm:hidden" style={{ background: "#1a1a1a" }} />
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "#333", letterSpacing: "0.1em" }}>{showForm.mode === "edit" ? "EDITING" : "NEW MATCH"}</p>
                    <p className="font-black" style={{ fontFamily: "'Syne',sans-serif" }}>{showForm.mode === "edit" ? editTarget?.match_date : "Record Result"}</p>
                  </div>
                  <button onClick={() => { setShowForm(false); setEditTarget(null); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#111" }}>
                    <X size={14} color="#444" />
                  </button>
                </div>
                <input type="date" value={formData.match_date}
                  onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                  className={inp} style={inpS} />
                <select value={formData.winner}
                  onChange={e => setFormData({ ...formData, winner: e.target.value })}
                  className={inp} style={{ ...inpS, color: "white" }}>
                  <option value="Yash">♔ Yash wins</option>
                  <option value="Nishant">♛ Nishant wins</option>
                  <option value="Draw">♞ Draw</option>
                </select>
                <textarea placeholder="Notes (optional)" value={formData.notes} rows={2}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className={inp} style={{ ...inpS, resize: "none" }} />
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleFormSave}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#000" }}>
                  <Check size={15} /> {showForm.mode === "edit" ? "Save Changes" : "Add Match"}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FAB ── */}
      <AnimatePresence>
        {!showForm && !modal && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={openAddModal}
            className="fixed bottom-6 right-5 w-14 h-14 rounded-2xl flex items-center justify-center z-40"
            style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", boxShadow: "0 0 0 1px #22c55e33, 0 0 30px rgba(34,197,94,0.35)" }}>
            <Plus size={22} color="#000" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}