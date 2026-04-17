import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Pencil, X, Check, Lock } from "lucide-react";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API = (process.env.REACT_APP_API || "") + "/api";
window._arenaStart = window._arenaStart || Date.now();

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
// Message shown at each % range
const MSG_RANGES = [
  [0,  15,  "Running algorithms..."],
  [15, 28,  "Verifying your IP address..."],
  [28, 42,  "Verifying your MAC address..."],
  [42, 55,  "Choosing best server for you..."],
  [55, 67,  "Server selected..."],
  [67, 78,  "Connecting to backend server..."],
  [78, 89,  "Loading match data..."],
  [89, 96,  "Connecting to server..."],
  [96, 100, "Almost there..."],
];

function getMsg(p) {
  for (const [lo, hi, m] of MSG_RANGES) {
    if (p >= lo && p < hi) return m;
  }
  return "Connected!";
}

function Loader() {
  const [pct, setPct] = useState(0);
  const pctRef = useRef(0);
  const DURATION = 9000; // 9 seconds: smooth 1→100, never stops, never stucks
  const startRef = useRef(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      // Ease-in-out curve over DURATION ms → always reaches 100 at exactly 9s
      const t = Math.min(elapsed / DURATION, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const next = Math.floor(eased * 100);
      pctRef.current = next;
      setPct(next);
      if (t >= 1) clearInterval(tick);
    }, 40);
    return () => clearInterval(tick);
  }, []);

  const PIECES = ["♔","♕","♖","♗","♘","♙"];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % PIECES.length), 350);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.5 }}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "#0B0C10",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 40px" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
        {PIECES.map((p, i) => (
          <motion.span key={i}
            animate={{ y: active === i ? -16 : 0, scale: active === i ? 1.4 : 0.8,
              opacity: active === i ? 1 : 0.1, color: active === i ? "#C8F135" : "#fff" }}
            transition={{ type: "spring", damping: 10, stiffness: 220 }}
            style={{ fontSize: 26, fontFamily: "serif", display: "block",
              filter: active === i ? "drop-shadow(0 0 12px #C8F135)" : "none" }}>
            {p}
          </motion.span>
        ))}
      </div>
      <div style={{ height: 24, marginBottom: 20, overflow: "hidden", width: "100%", textAlign: "center" }}>
        <AnimatePresence mode="wait">
          <motion.p key={getMsg(pct)}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
            style={{ fontSize: 12, color: "#555", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            {getMsg(pct)}
          </motion.p>
        </AnimatePresence>
      </div>
      <div style={{ width: "100%", maxWidth: 260 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#2a2a2a", fontFamily: "monospace" }}>CHESS ARENA</span>
          <span style={{ fontSize: 9, color: "#C8F135", fontFamily: "monospace", fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ width: "100%", height: 2, background: "#1a1a1a", overflow: "hidden", borderRadius: 99 }}>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.08 }}
            style={{ height: "100%", background: "linear-gradient(90deg,#22c55e,#C8F135)", borderRadius: 99 }} />
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
          border: "1px solid #1e2028", borderBottom: "none",
          borderRadius: "24px 24px 0 0", padding: 28 }}>
        <div style={{ width: 36, height: 3, background: "#222", borderRadius: 99, margin: "0 auto 24px" }} />
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
            outline: "none", marginBottom: 14, fontFamily: "'DM Sans',sans-serif",
            caretColor: "#C8F135", display: "block" }} />
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
      padding: "10px 14px" }}>
      <p style={{ fontSize: 10, color: "#444", marginBottom: 8, fontFamily: "monospace" }}>{label}</p>
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
  const [expanded, setExpanded] = useState(false);
  const isY = m.winner === "Yash", isDraw = m.winner === "Draw";
  const accent = isY ? "#22c55e" : isDraw ? "#f59e0b" : "#818cf8";
  const bgAccent = isY ? "rgba(34,197,94,0.06)" : isDraw ? "rgba(245,158,11,0.06)" : "rgba(129,140,248,0.06)";
  const piece = isDraw ? "♞" : "♔";
  const pieceColor = isY ? "#22c55e" : isDraw ? "#f59e0b" : "#818cf8";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04, type: "spring", damping: 20 }}
      onClick={() => setExpanded(e => !e)}
      style={{ background: "#111318", border: `1px solid ${expanded ? accent + "55" : "#1e2028"}`,
        borderRadius: 18, padding: "16px 16px", marginBottom: 10, cursor: "pointer",
        transition: "border-color 0.2s" }}>
      {/* Collapsed row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: bgAccent,
          border: `1px solid ${accent}22`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24, fontFamily: "serif",
          color: pieceColor, flexShrink: 0 }}>
          {piece}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: accent, fontFamily: "'Syne',sans-serif" }}>
              {m.winner === "Draw" ? "DRAW" : `${m.winner.toUpperCase()} WON`}
            </span>
            <span style={{ fontSize: 10, color: "#333", fontFamily: "monospace" }}>{m.match_date}</span>
          </div>
          {/* Always show notes preview, truncated when collapsed */}
          {m.notes && (
            <p style={{ fontSize: 12, color: "#444", overflow: "hidden",
              textOverflow: expanded ? "unset" : "ellipsis",
              whiteSpace: expanded ? "normal" : "nowrap", marginBottom: 5,
              wordBreak: "break-word" }}>{m.notes}</p>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 7,
              background: "rgba(34,197,94,0.08)", color: "#22c55e", fontWeight: 700, fontFamily: "monospace" }}>
              Y:{m.yash_points}
            </span>
            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 7,
              background: "rgba(129,140,248,0.08)", color: "#818cf8", fontWeight: 700, fontFamily: "monospace" }}>
              N:{m.nishant_points}
            </span>
          </div>
        </div>
        <div style={{ flexShrink: 0, fontSize: 10, color: "#2a2a2a", fontFamily: "monospace",
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}>
            <div style={{ borderTop: `1px solid ${C_BORDER}`, marginTop: 14, paddingTop: 14 }}>
              {/* Full note */}
              {m.notes ? (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 9, letterSpacing: "0.18em", color: "#333",
                    fontFamily: "monospace", marginBottom: 6 }}>MATCH NOTES</p>
                  <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6, wordBreak: "break-word" }}>{m.notes}</p>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#2a2a2a", marginBottom: 14, fontFamily: "monospace" }}>No notes for this match</p>
              )}
              {/* Extra info */}
              <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 9, letterSpacing: "0.18em", color: "#333", fontFamily: "monospace", marginBottom: 4 }}>DATE</p>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>{m.match_date}</p>
                </div>
                <div>
                  <p style={{ fontSize: 9, letterSpacing: "0.18em", color: "#333", fontFamily: "monospace", marginBottom: 4 }}>RESULT</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: accent }}>{m.winner === "Draw" ? "Draw" : `${m.winner} won`}</p>
                </div>
                <div>
                  <p style={{ fontSize: 9, letterSpacing: "0.18em", color: "#333", fontFamily: "monospace", marginBottom: 4 }}>POINTS</p>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>
                    <span style={{ color: "#22c55e" }}>Y:{m.yash_points}</span>
                    <span style={{ color: "#2a2a2a", margin: "0 4px" }}>·</span>
                    <span style={{ color: "#818cf8" }}>N:{m.nishant_points}</span>
                  </p>
                </div>
              </div>
              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <motion.button whileTap={{ scale: 0.92 }}
                  onClick={e => { e.stopPropagation(); onEdit(m); }}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 12, background: "#1a1b1f",
                    border: "1px solid #222", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 6, cursor: "pointer",
                    fontSize: 12, color: "#666", fontFamily: "'DM Sans',sans-serif" }}>
                  <Pencil size={13} color="#555" /> Edit match
                </motion.button>
                <motion.button whileTap={{ scale: 0.92 }}
                  onClick={e => { e.stopPropagation(); onDelete(m); }}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 12,
                    background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 6, cursor: "pointer", fontSize: 12, color: "#ef4444",
                    fontFamily: "'DM Sans',sans-serif" }}>
                  <Trash2 size={13} color="#ef4444" /> Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const C_BORDER = "#1e2028";

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
  const [loadDone, setLoadDone] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [fd, setFd] = useState({ match_date: td(), winner: "Yash", notes: "" });
  const [tab, setTab] = useState("overview");

  function td() { return new Date().toISOString().split("T")[0]; }
  const START = new Date("2026-04-04"), TOTAL = 21;
  const day = Math.max(1, Math.min(Math.floor((new Date() - START) / 86400000) + 1, TOTAL));
  const pct = Math.round((day / TOTAL) * 100);

  const load = async () => {
    try {
      const [m, s] = await Promise.all([axios.get(`${API}/matches`), axios.get(`${API}/stats`)]);
      setStats(s.data);
      const u = Array.from(new Map(m.data.map(i => [i.id, i])).values());
      setMatches(u);
      let y = 0, n = 0;
      setGraph(u.slice().sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
        .map(x => { y += x.yash_points; n += x.nishant_points; return { d: x.match_date.slice(5), Y: y, N: n }; }));
    } catch (e) { console.error(e); }
    finally {
      setLoadDone(true);
      // give bar time to finish to 100
      // Wait minimum 9s (matching loader duration) before showing app
      const elapsed = Date.now() - window._arenaStart;
      const remaining = Math.max(9000 - elapsed, 0);
      setTimeout(() => setShowApp(true), remaining + 300);
    }
  };

  useEffect(() => { load(); }, []);

  const reload = async () => {
    try {
      const [m, s] = await Promise.all([axios.get(`${API}/matches`), axios.get(`${API}/stats`)]);
      setStats(s.data);
      const u = Array.from(new Map(m.data.map(i => [i.id, i])).values());
      setMatches(u);
      let y = 0, n = 0;
      setGraph(u.slice().sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
        .map(x => { y += x.yash_points; n += x.nishant_points; return { d: x.match_date.slice(5), Y: y, N: n }; }));
    } catch (e) { console.error(e); }
  };

  const openAdd = () => setModal({ action: "add", title: "Add Match", sub: "Password required" });
  const openEdit = m => setModal({ action: "edit", payload: m, title: "Edit Match", sub: "Password required to edit" });
  const openDel = m => setModal({ action: "del", payload: m, title: "Delete Match", sub: `Remove match on ${m.match_date}?` });

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
        setModal(null); reload();
      } catch { alert("Wrong password."); setModal(null); }
    }
  };

  const saveForm = async () => {
    try {
      if (form.mode === "add") await axios.post(`${API}/matches`, fd, { headers: { "x-password": form.pw } });
      else await axios.put(`${API}/matches/${editTarget.id}`, fd, { headers: { "x-password": form.pw } });
      setForm(false); setEditTarget(null); reload();
    } catch { alert("Server error."); }
  };

  // King goes to leader (more points), no king if tied
  const yashLeading = stats ? stats.yash_total_points > stats.nishant_total_points : false;
  const nishantLeading = stats ? stats.nishant_total_points > stats.yash_total_points : false;
  const tied = stats ? stats.yash_total_points === stats.nishant_total_points : true;

  const leader = yashLeading ? "Yash" : nishantLeading ? "Nishant" : "Tied";
  const { yBest, nBest, curWinner, curCount } = calcStreaks(matches);

  const C = {
    bg: "#0B0C10", card: "#111318", border: "#1e2028",
    yash: "#22c55e", nishant: "#818cf8", draw: "#f59e0b",
    lime: "#C8F135", text: "#fff", dim: "#555", dimmer: "#2a2a2a"
  };

  const inpStyle = {
    width: "100%", background: "#0B0C10", border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "13px 16px", fontSize: 15, color: "#fff",
    outline: "none", marginBottom: 14, fontFamily: "'DM Sans',sans-serif",
    display: "block", caretColor: C.lime
  };

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
        textarea { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Loader */}
      <AnimatePresence>
        {!showApp && <Loader />}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modal && <PwModal title={modal.title} subtitle={modal.sub} onConfirm={confirmPw} onCancel={() => setModal(null)} />}
      </AnimatePresence>

      {/* ── NAV ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 30,
        background: "rgba(11,12,16,0.95)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.border}`, padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26, fontFamily: "serif",
            filter: "drop-shadow(0 0 8px rgba(200,241,53,0.35))" }}>♟</span>
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.22em", color: C.dim,
              fontFamily: "monospace", lineHeight: 1, marginBottom: 1 }}>SYSTEM</p>
            <p style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Syne',sans-serif",
              color: C.text, lineHeight: 1.1 }}>CHESS ARENA</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["overview","history"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "9px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.08em", fontFamily: "'Syne',sans-serif", cursor: "pointer",
                background: tab === t ? C.lime : "#1a1b1f",
                color: tab === t ? "#0B0C10" : C.dim,
                border: tab === t ? "none" : `1px solid ${C.border}`,
                transition: "all 0.2s", textTransform: "uppercase" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "20px 18px 120px" }}>
        <AnimatePresence mode="wait">

          {/* ══ OVERVIEW ══ */}
          {tab === "overview" && (
            <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              {/* Day banner */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 22,
                  padding: "22px 22px 20px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${C.lime}, ${C.yash})` }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.2em", color: C.dim,
                      fontFamily: "monospace", marginBottom: 4 }}>TOURNAMENT DAY</p>
                    <p style={{ fontSize: 80, fontWeight: 900, fontFamily: "'Syne',sans-serif",
                      lineHeight: 1, color: C.lime, letterSpacing: "-3px" }}>
                      {day}
                      <span style={{ fontSize: 22, color: C.dimmer, marginLeft: 4 }}>/{TOTAL}</span>
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, letterSpacing: "0.15em", color: C.dim,
                      fontFamily: "monospace", marginBottom: 6 }}>PROGRESS</p>
                    <p style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{pct}%</p>
                    <p style={{ fontSize: 13, color: C.dim, marginTop: 2 }}>{TOTAL - day} days left</p>
                  </div>
                </div>
                <div style={{ marginTop: 18, height: 4, background: C.border,
                  borderRadius: 99, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.4, ease: [0.16,1,0.3,1] }}
                    style={{ height: "100%",
                      background: `linear-gradient(90deg, ${C.yash}, ${C.lime})`,
                      borderRadius: 99 }} />
                </div>
              </motion.div>

              {/* Score cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                {[
                  { name: "YASH", pts: stats?.yash_total_points, wins: stats?.yash_wins,
                    streak: yBest, color: C.yash, isLeader: yashLeading },
                  { name: "NISHANT", pts: stats?.nishant_total_points, wins: stats?.nishant_wins,
                    streak: nBest, color: C.nishant, isLeader: nishantLeading }
                ].map((p, idx) => (
                  <motion.div key={p.name}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + idx * 0.06 }}
                    style={{ background: p.isLeader
                        ? `linear-gradient(160deg, rgba(${p.color === C.yash ? "34,197,94" : "129,140,248"},0.1) 0%, ${C.card} 60%)`
                        : C.card,
                      border: `1px solid ${p.isLeader ? p.color + "40" : C.border}`,
                      borderRadius: 20, padding: "20px 18px", position: "relative", overflow: "hidden" }}>
                    {p.isLeader && (
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                        background: `linear-gradient(90deg, ${p.color}, ${p.color}44)` }} />
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim,
                          fontFamily: "monospace", marginBottom: 3 }}>PLAYER</p>
                        <p style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Syne',sans-serif",
                          color: p.color }}>{p.name}</p>
                      </div>
                      {/* King only for leader */}
                      {p.isLeader && (
                        <motion.span animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ fontSize: 28, fontFamily: "serif", color: p.color,
                            filter: `drop-shadow(0 0 10px ${p.color}66)` }}>♔</motion.span>
                      )}
                      {tied && (
                        <span style={{ fontSize: 22, fontFamily: "serif", color: C.dimmer }}>♟</span>
                      )}
                    </div>
                    <p style={{ fontSize: 58, fontWeight: 900, fontFamily: "'Syne',sans-serif",
                      color: p.isLeader ? p.color : C.text, lineHeight: 1,
                      letterSpacing: "-2px", marginBottom: 14 }}>
                      {stats ? <AnimNum value={p.pts} /> : "—"}
                    </p>
                    <div style={{ display: "flex", gap: 16, borderTop: `1px solid ${C.border}`,
                      paddingTop: 12 }}>
                      <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.15em", color: C.dim,
                          fontFamily: "monospace", marginBottom: 2 }}>WINS</p>
                        <p style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>
                          {p.wins ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.15em", color: C.dim,
                          fontFamily: "monospace", marginBottom: 2 }}>STREAK</p>
                        <p style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>
                          {p.streak}
                        </p>
                      </div>
                    </div>
                    {p.isLeader && (
                      <motion.div animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ marginTop: 12, display: "inline-block", padding: "4px 12px",
                          borderRadius: 99, background: `${p.color}15`,
                          border: `1px solid ${p.color}40`,
                          fontSize: 9, letterSpacing: "0.15em", color: p.color,
                          fontFamily: "monospace", fontWeight: 700 }}>
                        ● LEADING
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Stats pills */}
              {stats && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10, marginBottom: 14 }}>
                  {[
                    { label: "MATCHES", value: stats.total_matches, color: C.text },
                    { label: "DRAWS", value: stats.draws, color: C.draw },
                    { label: "HOT STREAK", value: curWinner && curWinner !== "Draw"
                        ? `${curCount}× ${curWinner === "Yash" ? "Y" : "N"}` : `${curCount}D`,
                      color: C.lime },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`,
                      borderRadius: 16, padding: "16px 14px", textAlign: "center" }}>
                      <p style={{ fontSize: 9, letterSpacing: "0.18em", color: C.dim,
                        fontFamily: "monospace", marginBottom: 6 }}>{s.label}</p>
                      <p style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif",
                        color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Win split */}
              {stats && stats.total_matches > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  style={{ background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 18, padding: "18px 20px", marginBottom: 14 }}>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim,
                    fontFamily: "monospace", marginBottom: 14 }}>WIN DISTRIBUTION</p>
                  <div style={{ display: "flex", height: 8, borderRadius: 99,
                    overflow: "hidden", gap: 2, marginBottom: 14 }}>
                    {(() => {
                      const t = stats.total_matches;
                      const yp = Math.round((stats.yash_wins / t) * 100);
                      const np = Math.round((stats.nishant_wins / t) * 100);
                      const dp = 100 - yp - np;
                      return [
                        [yp, C.yash], [dp, C.draw], [np, C.nishant]
                      ].map(([w, c], i) => (
                        <motion.div key={i} initial={{ width: 0 }} animate={{ width: `${w}%` }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                          style={{ height: "100%", background: c, borderRadius: 99 }} />
                      ));
                    })()}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {[["Yash", C.yash, stats.yash_wins],
                      ["Draw", C.draw, stats.draws],
                      ["Nishant", C.nishant, stats.nishant_wins]].map(([l, c, v]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
                        <span style={{ fontSize: 12, color: C.dim }}>
                          {l}: <strong style={{ color: C.text }}>{v}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Graph */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                style={{ background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 20, padding: "18px 0 12px", marginBottom: 14 }}>
                <div style={{ padding: "0 20px 14px", display: "flex",
                  justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace" }}>POINTS OVER TIME</p>
                  <div style={{ display: "flex", gap: 14 }}>
                    {[["YASH", C.yash], ["NISHANT", C.nishant]].map(([l, c]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 14, height: 2, background: c, borderRadius: 99 }} />
                        <span style={{ fontSize: 9, color: C.dim, fontFamily: "monospace" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={graph} margin={{ top: 0, right: 18, left: -8, bottom: 0 }}>
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
                    <XAxis dataKey="d" tick={{ fill: "#333", fontSize: 10, fontFamily: "monospace" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#333", fontSize: 10, fontFamily: "monospace" }}
                      axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<GTooltip />} />
                    <Area type="monotone" dataKey="Y" name="Yash" stroke={C.yash}
                      strokeWidth={2.5} fill="url(#gy)" dot={false}
                      activeDot={{ r: 4, fill: C.yash, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="N" name="Nishant" stroke={C.nishant}
                      strokeWidth={2.5} fill="url(#gn)" dot={false}
                      activeDot={{ r: 4, fill: C.nishant, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Recent matches */}
              <div style={{ display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 14 }}>
                <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace" }}>RECENT MATCHES</p>
                <button onClick={() => setTab("history")}
                  style={{ fontSize: 12, color: C.lime, background: "transparent",
                    border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 700, letterSpacing: "0.05em" }}>
                  VIEW ALL →
                </button>
              </div>
              <AnimatePresence>
                {matches.slice(0, 3).map((m, i) => (
                  <MatchCard key={m.id} m={m} i={i} onEdit={openEdit} onDelete={openDel} yashLeading={yashLeading} />
                ))}
              </AnimatePresence>
              {matches.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: 52, fontFamily: "serif", opacity: 0.07, marginBottom: 12 }}>♟</p>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace" }}>NO MATCHES YET</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ══ HISTORY ══ */}
          {tab === "history" && (
            <motion.div key="hist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
                padding: "18px 20px", marginBottom: 16,
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim,
                    fontFamily: "monospace", marginBottom: 4 }}>ALL MATCHES</p>
                  <p style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{matches.length}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 9, letterSpacing: "0.15em", color: C.dim,
                    fontFamily: "monospace", marginBottom: 4 }}>PERIOD</p>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>Apr 4 – Apr 24</p>
                </div>
              </div>
              <AnimatePresence>
                {matches.map((m, i) => (
                  <MatchCard key={m.id} m={m} i={i} onEdit={openEdit} onDelete={openDel} yashLeading={yashLeading} />
                ))}
              </AnimatePresence>
              {matches.length === 0 && (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <p style={{ fontSize: 60, fontFamily: "serif", opacity: 0.06, marginBottom: 16 }}>♟</p>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: C.dim, fontFamily: "monospace" }}>NO MATCHES RECORDED</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <AnimatePresence>
        {!form && !modal && (
          <motion.button initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }} whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", damping: 16 }}
            onClick={openAdd}
            style={{ position: "fixed", bottom: 28, right: 20, width: 58, height: 58,
              borderRadius: 17, background: C.lime, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40,
              boxShadow: `0 0 0 1px rgba(200,241,53,0.25), 0 8px 32px rgba(200,241,53,0.25)` }}>
            <Plus size={24} color="#0B0C10" strokeWidth={2.8} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Form sheet */}
      <AnimatePresence>
        {form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setForm(false); setEditTarget(null); }}
            style={{ position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(11,12,16,0.9)", backdropFilter: "blur(12px)",
              display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 22 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 500, background: "#111318",
                border: `1px solid ${C.border}`, borderBottom: "none",
                borderRadius: "24px 24px 0 0", padding: 26 }}>
              <div style={{ width: 36, height: 3, background: "#222",
                borderRadius: 99, margin: "0 auto 24px" }} />
              <div style={{ display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim,
                    fontFamily: "monospace", marginBottom: 3 }}>
                    {form.mode === "edit" ? "EDITING MATCH" : "NEW MATCH"}
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>
                    {form.mode === "edit" ? editTarget?.match_date : "Record Result"}
                  </p>
                </div>
                <button onClick={() => { setForm(false); setEditTarget(null); }}
                  style={{ width: 38, height: 38, borderRadius: 11,
                    background: "#1a1b1f", border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={15} color="#444" />
                </button>
              </div>
              <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim,
                fontFamily: "monospace", marginBottom: 8 }}>MATCH DATE</p>
              <input type="date" value={fd.match_date}
                onChange={e => setFd({ ...fd, match_date: e.target.value })}
                style={inpStyle} />
              <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim,
                fontFamily: "monospace", marginBottom: 8 }}>WINNER</p>
              <select value={fd.winner}
                onChange={e => setFd({ ...fd, winner: e.target.value })}
                style={{ ...inpStyle, color: "#fff" }}>
                <option value="Yash">♔ Yash wins</option>
                <option value="Nishant">♔ Nishant wins</option>
                <option value="Draw">♞ Draw</option>
              </select>
              <p style={{ fontSize: 9, letterSpacing: "0.2em", color: C.dim,
                fontFamily: "monospace", marginBottom: 8 }}>NOTES</p>
              <textarea placeholder="Match notes (optional)" value={fd.notes} rows={2}
                onChange={e => setFd({ ...fd, notes: e.target.value })}
                style={{ ...inpStyle, resize: "none" }} />
              <motion.button whileTap={{ scale: 0.97 }} onClick={saveForm}
                style={{ width: "100%", padding: "16px 0", borderRadius: 14,
                  background: C.lime, color: "#0B0C10", fontSize: 14, fontWeight: 800,
                  border: "none", cursor: "pointer", fontFamily: "'Syne',sans-serif",
                  letterSpacing: "0.08em", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8 }}>
                <Check size={16} />
                {form.mode === "edit" ? "SAVE CHANGES" : "ADD MATCH"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}