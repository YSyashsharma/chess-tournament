import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Pencil, X, Check, Lock } from "lucide-react";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API = (process.env.REACT_APP_API || "") + "/api";

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimNum({ value, duration = 1000 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const end = parseInt(value) || 0;
    const s = Date.now();
    const run = () => {
      const p = Math.min((Date.now() - s) / duration, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [value, duration]);
  return <>{v}</>;
}

// ── Loader ────────────────────────────────────────────────────────────────────
function Loader() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(v + Math.random() * 5 + 1, 98);
      setPct(Math.floor(v));
    }, 100);
    return () => clearInterval(id);
  }, []);
  const PIECES = ["♔","♕","♖","♗","♘","♙"];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % PIECES.length), 350);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "#0B0C10",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* noise texture */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "200px" }} />

      {/* Pieces row */}
      <div style={{ display: "flex", gap: 18, marginBottom: 48 }}>
        {PIECES.map((p, i) => (
          <motion.span key={i}
            animate={{ y: active === i ? -18 : 0, scale: active === i ? 1.5 : 0.8, opacity: active === i ? 1 : 0.12,
              color: active === i ? "#C8F135" : "#fff" }}
            transition={{ type: "spring", damping: 10, stiffness: 220 }}
            style={{ fontSize: 28, fontFamily: "serif", display: "block",
              filter: active === i ? "drop-shadow(0 0 14px #C8F135)" : "none" }}>
            {p}
          </motion.span>
        ))}
      </div>

      {/* Bar */}
      <div style={{ width: 240, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#333", fontFamily: "monospace" }}>LOADING CHESS ARENA</span>
          <span style={{ fontSize: 9, letterSpacing: "0.1em", color: "#C8F135", fontFamily: "monospace" }}>{pct}%</span>
        </div>
        <div style={{ width: "100%", height: 2, background: "#1a1a1a", overflow: "hidden" }}>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.2 }}
            style={{ height: "100%", background: "linear-gradient(90deg, #22c55e, #C8F135)" }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Password modal ────────────────────────────────────────────────────────────
function PwModal({ title, subtitle, onConfirm, onCancel }) {
  const [pw, setPw] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(11,12,16,0.92)",
        backdropFilter: "blur(14px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 24 }}
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, background: "#111318",
          border: "1px solid #1e2028", borderBottom: "none", borderRadius: "24px 24px 0 0", padding: 28 }}>
        <div style={{ width: 36, height: 3, background: "#222", borderRadius: 99, margin: "0 auto 24px" }} />
        {/* Icon */}
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(200,241,53,0.08)",
          border: "1px solid rgba(200,241,53,0.15)", display: "flex", alignItems: "center",
          justifyContent: "center", marginBottom: 16 }}>
          <Lock size={18} color="#C8F135" />
        </div>
        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{title}</p>
        {subtitle && <p style={{ fontSize: 13, color: "#555", marginBottom: 20 }}>{subtitle}</p>}
        <input ref={ref} type="password" placeholder="Enter password"
          value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onConfirm(pw)}
          style={{ width: "100%", background: "#0B0C10", border: "1px solid #1e2028",
            borderRadius: 12, padding: "13px 16px", fontSize: 14, color: "#fff",
            outline: "none", marginBottom: 14, fontFamily: "'DM Sans',sans-serif", caretColor: "#C8F135" }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onConfirm(pw)} style={{ flex: 1, padding: "14px 0", borderRadius: 12,
            background: "#C8F135", color: "#0B0C10", fontSize: 13, fontWeight: 800,
            border: "none", cursor: "pointer", fontFamily: "'Syne',sans-serif", letterSpacing: "0.05em" }}>
            CONFIRM
          </button>
          <button onClick={onCancel} style={{ padding: "14px 20px", borderRadius: 12,
            background: "#1a1b1f", color: "#555", fontSize: 13, border: "1px solid #222",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Graph tooltip ─────────────────────────────────────────────────────────────
function GTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111318", border: "1px solid #1e2028", borderRadius: 12,
      padding: "10px 14px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
      <p style={{ fontSize: 10, color: "#444", marginBottom: 8, fontFamily: "monospace", letterSpacing: "0.1em" }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: 2, background: p.color }} />
          <span style={{ fontSize: 12, color: "#666" }}>{p.name}</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: p.color, marginLeft: "auto",
            paddingLeft: 20, fontFamily: "'Syne',sans-serif" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ m, i, onEdit, onDelete }) {
  const isY = m.winner === "Yash", isDraw = m.winner === "Draw";
  const accent = isY ? "#22c55e" : isDraw ? "#f59e0b" : "#818cf8";
  const bgAccent = isY ? "rgba(34,197,94,0.06)" : isDraw ? "rgba(245,158,11,0.06)" : "rgba(129,140,248,0.06)";
  const piece = isY ? "♔" : isDraw ? "♞" : "♛";
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04, type: "spring", damping: 20 }}
      style={{ background: "#111318", border: "1px solid #1e2028", borderRadius: 16,
        padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
      {/* Piece badge */}
      <div style={{ width: 46, height: 46, borderRadius: 12, background: bgAccent,
        border: `1px solid ${accent}22`, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 22, fontFamily: "serif",
        color: accent, flexShrink: 0, filter: `drop-shadow(0 0 8px ${accent}44)` }}>
        {piece}
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: accent,
            fontFamily: "'Syne',sans-serif", letterSpacing: "0.02em" }}>
            {m.winner === "Draw" ? "DRAW" : `${m.winner.toUpperCase()} WON`}
          </span>
          <span style={{ fontSize: 10, color: "#333", fontFamily: "monospace" }}>{m.match_date}</span>
        </div>
        {m.notes && <p style={{ fontSize: 11, color: "#444", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 5 }}>{m.notes}</p>}
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6,
            background: "rgba(34,197,94,0.08)", color: "#22c55e", fontWeight: 700, fontFamily: "monospace" }}>
            Y:{m.yash_points}
          </span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6,
            background: "rgba(129,140,248,0.08)", color: "#818cf8", fontWeight: 700, fontFamily: "monospace" }}>
            N:{m.nishant_points}
          </span>
        </div>
      </div>
      {/* Buttons */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => onEdit(m)}
          style={{ width: 34, height: 34, borderRadius: 10, background: "#1a1b1f",
            border: "1px solid #222", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer" }}>
          <Pencil size={12} color="#444" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => onDelete(m)}
          style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.12)", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer" }}>
          <Trash2 size={12} color="#ef4444" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Streak calc ───────────────────────────────────────────────────────────────
function calcStreaks(matches) {
  if (!matches.length) return { yBest: 0, nBest: 0, curWinner: null, curCount: 0 };
  const s = [...matches].sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
  let yBest = 0, nBest = 0, cy = 0, cn = 0;
  s.forEach(m => {
    if (m.winner === "Yash") { cy++; cn = 0; yBest = Math.max(yBest, cy); }
    else if (m.winner === "Nishant") { cn++; cy = 0; nBest = Math.max(nBest, cn); }
    else { cy = 0; cn = 0; }
  });
  let curWinner = s[s.length - 1].winner;
  let curCount = 1;
  for (let i = s.length - 2; i >= 0; i--) {
    if (s[i].winner === curWinner) curCount++;
    else break;
  }
  return { yBest, nBest, curWinner, curCount };
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [graph, setGraph] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [fd, setFd] = useState({ match_date: td(), winner: "Yash", notes: "" });
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
      setGraph(u.slice().sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
        .map(x => { y += x.yash_points; n += x.nishant_points; return { d: x.match_date.slice(5), Y: y, N: n }; }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(true); }, []);

  const openAdd = () => setModal({ action: "add", title: "Add Match", sub: "Password required" });
  const openEdit = m => setModal({ action: "edit", payload: m, title: "Edit Match", sub: "Password required" });
  const openDel = m => setModal({ action: "del", payload: m, title: "Delete Match", sub: `Remove ${m.match_date}?` });

  const confirmPw = async (pw) => {
    if (!pw) return;
    const { action, payload } = modal;
    if (action === "add") {
      setModal(null); setEditTarget(null);
      setFd({ match_date: td(), winner: "Yash", notes: "" });
      setForm({ mode: "add", pw });
    } else if (action === "edit") {
      setModal(null); setEditTarget(payload);
      setFd({ match_date: payload.match_date, winner: payload.winner, notes: payload.notes || "" });
      setForm({ mode: "edit", pw });
    } else if (action === "del") {
      try {
        await axios.delete(`${API}/matches/${payload.id}`, { headers: { "x-password": pw } });
        setModal(null); load();
      } catch { alert("Wrong password."); setModal(null); }
    }
  };

  const saveForm = async () => {
    try {
      if (form.mode === "add") await axios.post(`${API}/matches`, fd, { headers: { "x-password": form.pw } });
      else await axios.put(`${API}/matches/${editTarget.id}`, fd, { headers: { "x-password": form.pw } });
      setForm(false); setEditTarget(null); load();
    } catch { alert("Server error."); }
  };

  const leader = stats
    ? stats.yash_total_points > stats.nishant_total_points ? "Yash"
    : stats.nishant_total_points > stats.yash_total_points ? "Nishant" : "Tied"
    : "—";

  const { yBest, nBest, curWinner, curCount } = calcStreaks(matches);

  const C = {
    bg: "#0B0C10", card: "#111318", border: "#1e2028",
    yash: "#22c55e", nishant: "#818cf8", draw: "#f59e0b",
    lime: "#C8F135", text: "#fff", dim: "#555", dimmer: "#2a2a2a"
  };

  const inpStyle = {
    width: "100%", background: "#0B0C10", border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "13px 16px", fontSize: 14, color: "#fff",
    outline: "none", marginBottom: 14, fontFamily: "'DM Sans',sans-serif",
    display: "block", caretColor: C.lime
  };

  const tabBtn = (t, label) => (
    <button key={t} onClick={() => setTab(t)}
      style={{ padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.08em", fontFamily: "'Syne',sans-serif", cursor: "pointer",
        background: tab === t ? C.lime : "transparent",
        color: tab === t ? "#0B0C10" : C.dim,
        border: "none", transition: "all 0.2s" }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif",
      color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0B0C10; }
        ::-webkit-scrollbar-thumb { background: #1e2028; border-radius: 99px; }
        option { background: #111318; color: white; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.2); }
      `}</style>

      <AnimatePresence>{loading && <Loader />}</AnimatePresence>
      <AnimatePresence>
        {modal && <PwModal title={modal.title} subtitle={modal.sub} onConfirm={confirmPw} onCancel={() => setModal(null)} />}
      </AnimatePresence>

      {/* ── NAV ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(11,12,16,0.92)",
        backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`,
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24, fontFamily: "serif", filter: "drop-shadow(0 0 8px rgba(200,241,53,0.4))" }}>♟</span>
          <div>
            <p style={{ fontSize: 8, letterSpacing: "0.22em", color: C.dim, fontFamily: "monospace", lineHeight: 1 }}>SYSTEM</p>
            <p style={{ fontSize: 14, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: C.text, lineHeight: 1.2 }}>CHESS ARENA</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {tabBtn("overview", "OVERVIEW")}
          {tabBtn("history", "HISTORY")}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px" }}>
        <AnimatePresence mode="wait">

          {/* ══ OVERVIEW ══ */}
          {tab === "overview" && (
            <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              {/* ── Day banner ── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
                  padding: "20px 22px", marginBottom: 12, position: "relative", overflow: "hidden" }}>
                {/* Accent bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${C.lime}, ${C.yash})` }} />
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace", marginBottom: 2 }}>TOURNAMENT DAY</p>
                    <p style={{ fontSize: 72, fontWeight: 900, fontFamily: "'Syne',sans-serif",
                      lineHeight: 1, color: C.lime, letterSpacing: "-2px" }}>
                      {day}
                      <span style={{ fontSize: 20, color: C.dimmer, marginLeft: 4 }}>/{TOTAL}</span>
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, letterSpacing: "0.15em", color: C.dim, fontFamily: "monospace", marginBottom: 4 }}>PROGRESS</p>
                    <p style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: C.text }}>{pct}%</p>
                    <p style={{ fontSize: 11, color: C.dim }}>{TOTAL - day} days left</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: 16, height: 3, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: "100%", background: `linear-gradient(90deg, ${C.yash}, ${C.lime})`, borderRadius: 99 }} />
                </div>
              </motion.div>

              {/* ── Score cards ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[
                  { name: "YASH", pts: stats?.yash_total_points, wins: stats?.yash_wins, streak: yBest, color: C.yash, piece: "♔", leader: leader === "Yash" },
                  { name: "NISHANT", pts: stats?.nishant_total_points, wins: stats?.nishant_wins, streak: nBest, color: C.nishant, piece: "♛", leader: leader === "Nishant" }
                ].map((p, idx) => (
                  <motion.div key={p.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.07 }}
                    style={{ background: p.leader ? `linear-gradient(145deg, rgba(${p.color === C.yash ? "34,197,94" : "129,140,248"},0.12), ${C.card})` : C.card,
                      border: `1px solid ${p.leader ? p.color + "44" : C.border}`,
                      borderRadius: 18, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
                    {p.leader && (
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: `linear-gradient(90deg, ${p.color}, ${p.color}44)` }} />
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace", marginBottom: 2 }}>PLAYER</p>
                        <p style={{ fontSize: 14, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: p.color }}>{p.name}</p>
                      </div>
                      <span style={{ fontSize: 26, fontFamily: "serif", color: p.color, opacity: p.leader ? 1 : 0.3,
                        filter: p.leader ? `drop-shadow(0 0 10px ${p.color}66)` : "none" }}>{p.piece}</span>
                    </div>
                    <p style={{ fontSize: 52, fontWeight: 900, fontFamily: "'Syne',sans-serif",
                      color: p.color, lineHeight: 1, letterSpacing: "-2px", marginBottom: 10 }}>
                      {stats ? <AnimNum value={p.pts} /> : "—"}
                    </p>
                    <div style={{ display: "flex", gap: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                      <div>
                        <p style={{ fontSize: 8, letterSpacing: "0.15em", color: C.dim, fontFamily: "monospace" }}>WINS</p>
                        <p style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{p.wins ?? "—"}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 8, letterSpacing: "0.15em", color: C.dim, fontFamily: "monospace" }}>BEST STREAK</p>
                        <p style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{p.streak}</p>
                      </div>
                    </div>
                    {p.leader && (
                      <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
                        style={{ marginTop: 10, display: "inline-block", padding: "3px 10px", borderRadius: 99,
                          background: `${p.color}18`, border: `1px solid ${p.color}44`,
                          fontSize: 9, letterSpacing: "0.15em", color: p.color, fontFamily: "monospace", fontWeight: 700 }}>
                        ● LEADING
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* ── Stats row ── */}
              {stats && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "TOTAL", value: stats.total_matches, color: C.text },
                    { label: "DRAWS", value: stats.draws, color: C.draw },
                    { label: "STREAK", value: curWinner !== "Draw" && curWinner ? `${curCount}×${curWinner === "Yash" ? "Y" : "N"}` : `${curCount}D`, color: C.lime },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`,
                      borderRadius: 14, padding: "14px 14px 12px", textAlign: "center" }}>
                      <p style={{ fontSize: 8, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace", marginBottom: 4 }}>{s.label}</p>
                      <p style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ── Win split bar ── */}
              {stats && stats.total_matches > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
                    padding: "16px 18px", marginBottom: 12 }}>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace", marginBottom: 12 }}>WIN DISTRIBUTION</p>
                  <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 2, marginBottom: 12 }}>
                    {(() => {
                      const t = stats.total_matches;
                      const yp = Math.round((stats.yash_wins / t) * 100);
                      const np = Math.round((stats.nishant_wins / t) * 100);
                      const dp = 100 - yp - np;
                      return [
                        { w: yp, c: C.yash },
                        { w: dp, c: C.draw },
                        { w: np, c: C.nishant }
                      ].map((b, i) => (
                        <motion.div key={i} initial={{ width: 0 }} animate={{ width: `${b.w}%` }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                          style={{ height: "100%", background: b.c, borderRadius: 99 }} />
                      ));
                    })()}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {[["Y", C.yash, stats.yash_wins], ["D", C.draw, stats.draws], ["N", C.nishant, stats.nishant_wins]].map(([l, c, v]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 3, background: c }} />
                        <span style={{ fontSize: 11, color: C.dim }}>{l}: <strong style={{ color: C.text }}>{v}</strong></span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Graph ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
                  padding: "18px 0 10px", marginBottom: 12 }}>
                <div style={{ padding: "0 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace" }}>POINTS OVER TIME</p>
                  <div style={{ display: "flex", gap: 14 }}>
                    {[["Y", C.yash], ["N", C.nishant]].map(([l, c]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 14, height: 2, background: c, borderRadius: 99 }} />
                        <span style={{ fontSize: 9, color: C.dim, fontFamily: "monospace" }}>{l === "Y" ? "YASH" : "NISHANT"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={graph} margin={{ top: 0, right: 18, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.yash} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={C.yash} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.nishant} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={C.nishant} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="d" tick={{ fill: "#333", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#333", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<GTooltip />} />
                    <Area type="monotone" dataKey="Y" name="Yash" stroke={C.yash} strokeWidth={2.5} fill="url(#gy)" dot={false} activeDot={{ r: 4, fill: C.yash, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="N" name="Nishant" stroke={C.nishant} strokeWidth={2.5} fill="url(#gn)" dot={false} activeDot={{ r: 4, fill: C.nishant, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* ── Recent matches ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace" }}>RECENT MATCHES</p>
                <button onClick={() => setTab("history")}
                  style={{ fontSize: 10, color: C.lime, background: "transparent", border: "none",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}>
                  VIEW ALL →
                </button>
              </div>
              <AnimatePresence>
                {matches.slice(0, 3).map((m, i) => (
                  <MatchCard key={m.id} m={m} i={i} onEdit={openEdit} onDelete={openDel} />
                ))}
              </AnimatePresence>
              {matches.length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: 48, fontFamily: "serif", opacity: 0.08, marginBottom: 12 }}>♟</p>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace" }}>NO MATCHES YET</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ══ HISTORY ══ */}
          {tab === "history" && (
            <motion.div key="hist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {/* Summary strip */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
                padding: "16px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace", marginBottom: 2 }}>ALL MATCHES</p>
                  <p style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{matches.length}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 9, letterSpacing: "0.15em", color: C.dim, fontFamily: "monospace", marginBottom: 2 }}>DURATION</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Apr 4 – Apr 24</p>
                </div>
              </div>

              <AnimatePresence>
                {matches.map((m, i) => <MatchCard key={m.id} m={m} i={i} onEdit={openEdit} onDelete={openDel} />)}
              </AnimatePresence>
              {matches.length === 0 && (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <p style={{ fontSize: 56, fontFamily: "serif", opacity: 0.06, marginBottom: 16 }}>♟</p>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace" }}>NO MATCHES RECORDED</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FAB ── */}
      <AnimatePresence>
        {!form && !modal && (
          <motion.button initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }} whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", damping: 16 }}
            onClick={openAdd}
            style={{ position: "fixed", bottom: 28, right: 20, width: 56, height: 56,
              borderRadius: 16, background: C.lime, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40,
              boxShadow: `0 0 0 1px rgba(200,241,53,0.3), 0 8px 32px rgba(200,241,53,0.25)` }}>
            <Plus size={22} color="#0B0C10" strokeWidth={2.8} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Form sheet ── */}
      <AnimatePresence>
        {form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setForm(false); setEditTarget(null); }}
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(11,12,16,0.9)",
              backdropFilter: "blur(12px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 22 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 480, background: "#111318",
                border: `1px solid ${C.border}`, borderBottom: "none",
                borderRadius: "24px 24px 0 0", padding: 24 }}>
              <div style={{ width: 36, height: 3, background: "#222", borderRadius: 99, margin: "0 auto 24px" }} />
              {/* Form header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <div>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace", marginBottom: 2 }}>
                    {form.mode === "edit" ? "EDITING MATCH" : "NEW MATCH"}
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>
                    {form.mode === "edit" ? editTarget?.match_date : "Record Result"}
                  </p>
                </div>
                <button onClick={() => { setForm(false); setEditTarget(null); }}
                  style={{ width: 36, height: 36, borderRadius: 10, background: "#1a1b1f",
                    border: `1px solid ${C.border}`, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer" }}>
                  <X size={15} color="#444" />
                </button>
              </div>
              {/* Fields */}
              <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace", marginBottom: 6 }}>MATCH DATE</p>
              <input type="date" value={fd.match_date}
                onChange={e => setFd({ ...fd, match_date: e.target.value })}
                style={inpStyle} />
              <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace", marginBottom: 6 }}>WINNER</p>
              <select value={fd.winner} onChange={e => setFd({ ...fd, winner: e.target.value })}
                style={{ ...inpStyle, color: "#fff" }}>
                <option value="Yash">♔ Yash wins</option>
                <option value="Nishant">♛ Nishant wins</option>
                <option value="Draw">♞ Draw</option>
              </select>
              <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace", marginBottom: 6 }}>NOTES</p>
              <textarea placeholder="Match notes (optional)" value={fd.notes} rows={2}
                onChange={e => setFd({ ...fd, notes: e.target.value })}
                style={{ ...inpStyle, resize: "none" }} />
              <motion.button whileTap={{ scale: 0.97 }} onClick={saveForm}
                style={{ width: "100%", padding: "15px 0", borderRadius: 14,
                  background: C.lime, color: "#0B0C10", fontSize: 13, fontWeight: 800,
                  border: "none", cursor: "pointer", fontFamily: "'Syne',sans-serif",
                  letterSpacing: "0.08em", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8 }}>
                <Check size={15} /> {form.mode === "edit" ? "SAVE CHANGES" : "ADD MATCH"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}