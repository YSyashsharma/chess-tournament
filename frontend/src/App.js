import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Plus, Trash2, Pencil, X, Check, Lock, Swords, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const API = (process.env.REACT_APP_API || "") + "/api";

// ── Chess Loading Screen ──────────────────────────────────────────────────────
const PIECES = ["♔", "♕", "♖", "♗", "♘", "♙"];

function ChessLoader() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % PIECES.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#080808" }}
    >
      {/* Board pattern background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)",
        backgroundSize: "60px 60px"
      }} />

      {/* Glow */}
      <div className="absolute w-64 h-64 rounded-full pointer-events-none" style={{
        background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)"
      }} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Pieces row */}
        <div className="flex items-end gap-3 mb-8 h-20">
          {PIECES.map((piece, i) => (
            <motion.div
              key={i}
              animate={{
                y: active === i ? -24 : 0,
                scale: active === i ? 1.4 : 1,
                color: active === i ? "#22c55e" : "#222",
                textShadow: active === i ? "0 0 20px rgba(34,197,94,0.6)" : "none",
              }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="text-4xl select-none cursor-default"
              style={{ color: "#222", fontFamily: "serif" }}
            >
              {piece}
            </motion.div>
          ))}
        </div>

        {/* Shuffling bar */}
        <div className="flex gap-1.5 mb-8">
          {PIECES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: active === i ? 24 : 6,
                background: active === i ? "#22c55e" : "#1a1a1a",
              }}
              transition={{ type: "spring", damping: 15 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-medium"
          style={{ color: "#333", letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}
        >
          LOADING ARENA
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
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6"
        style={{ background: "#0f0f0f", border: "1px solid #222", borderBottom: "none" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5 sm:hidden" style={{ background: "#333" }} />
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#0f2d1a" }}>
          <Lock size={18} color="#22c55e" />
        </div>
        <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</p>
        {subtitle && <p className="text-sm mb-4" style={{ color: "#555" }}>{subtitle}</p>}
        <input
          ref={ref}
          type="password"
          placeholder="Enter password…"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onConfirm(pw)}
          className="w-full rounded-2xl px-4 py-3 text-white text-sm mb-4 outline-none"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", caretColor: "#22c55e" }}
        />
        <div className="flex gap-2">
          <button onClick={() => onConfirm(pw)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold transition active:scale-95"
            style={{ background: "#22c55e", color: "#000" }}>Confirm</button>
          <button onClick={onCancel}
            className="px-5 py-3 rounded-2xl text-sm font-semibold transition"
            style={{ background: "#1a1a1a", color: "#666" }}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl px-4 py-3 text-sm shadow-xl" style={{ background: "#111", border: "1px solid #222" }}>
      <p className="text-xs mb-2" style={{ color: "#555" }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: "#888" }}>{p.name}</span>
          <span className="font-bold ml-auto pl-4" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-2xl" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
      <span className="text-lg font-black" style={{ fontFamily: "'Syne',sans-serif", color }}>{value}</span>
      <span className="text-xs" style={{ color: "#444" }}>{label}</span>
    </div>
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

  function today() { return new Date().toISOString().split("T")[0]; }

  const START_DATE = new Date("2026-04-04");
  const TOTAL_DAYS = 21;
  const dayInfo = () => {
    const diff = Math.floor((new Date() - START_DATE) / 86400000) + 1;
    const day = Math.max(1, Math.min(diff, TOTAL_DAYS));
    return { day, pct: Math.round((day / TOTAL_DAYS) * 100) };
  };
  const { day, pct } = dayInfo();

  const loadData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const [m, s] = await Promise.all([axios.get(`${API}/matches`), axios.get(`${API}/stats`)]);
      setStats(s.data);
      const unique = Array.from(new Map(m.data.map(i => [i.id, i])).values());
      setMatches(unique);
      let y = 0, n = 0;
      setGraphData(unique.slice()
        .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
        .map(x => { y += x.yash_points; n += x.nishant_points; return { date: x.match_date, Yash: y, Nishant: n }; })
      );
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(true); }, []);

  const handleEditClick = (m) => {
    setModal({ action: "auth-edit", payload: m, title: "Edit Match", subtitle: "Confirm your password to edit this match" });
  };

  const handleDeleteClick = (m) => {
    setModal({ action: "auth-delete", payload: m, title: "Delete Match", subtitle: `Delete match on ${m.match_date}? This can't be undone.` });
  };

  const handleAddClick = () => {
    setModal({ action: "auth-add", title: "Add Match", subtitle: "Enter password to record a new match" });
  };

  const handleModalConfirm = async (pw) => {
    if (!pw) { alert("Password required"); return; }
    const { action, payload } = modal;
    if (action === "auth-add") {
      setModal(null);
      setEditTarget(null);
      setFormData({ match_date: today(), winner: "Yash", notes: "" });
      setShowForm({ mode: "add", pw });
    } else if (action === "auth-edit") {
      setModal(null);
      setEditTarget(payload);
      setFormData({ match_date: payload.match_date, winner: payload.winner, notes: payload.notes || "" });
      setShowForm({ mode: "edit", pw });
    } else if (action === "auth-delete") {
      try {
        await axios.delete(`${API}/matches/${payload.id}`, { headers: { "x-password": pw } });
        setModal(null);
        loadData();
      } catch { alert("Wrong password or server error."); setModal(null); }
    }
  };

  const handleFormSave = async () => {
    const { mode, pw } = showForm;
    try {
      if (mode === "add") {
        await axios.post(`${API}/matches`, formData, { headers: { "x-password": pw } });
      } else {
        await axios.put(`${API}/matches/${editTarget.id}`, formData, { headers: { "x-password": pw } });
      }
      setShowForm(false);
      setEditTarget(null);
      loadData();
    } catch { alert("Wrong password or server error."); }
  };

  const leader = stats
    ? stats.yash_total_points > stats.nishant_total_points ? "Yash"
    : stats.nishant_total_points > stats.yash_total_points ? "Nishant" : "tie"
    : null;

  const inp = "w-full rounded-2xl px-4 py-3 text-white text-sm mb-3 outline-none";
  const inpStyle = { background: "#161616", border: "1px solid #222", caretColor: "#22c55e" };

  return (
    <div className="min-h-screen" style={{ background: "#080808", fontFamily: "'DM Sans', sans-serif", color: "white" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        option { background: #1a1a1a; color: white; }
      `}</style>

      {/* ── Chess Loader ── */}
      <AnimatePresence>
        {loading && <ChessLoader />}
      </AnimatePresence>

      {/* ── Password Modal ── */}
      <AnimatePresence>
        {modal && (
          <PasswordModal
            title={modal.title}
            subtitle={modal.subtitle}
            onConfirm={handleModalConfirm}
            onCancel={() => setModal(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto px-4 pt-8 pb-28">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: "#444", letterSpacing: "0.12em" }}>TOURNAMENT</p>
            <h1 className="text-2xl font-black leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>Chess Arena ♟</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
            <Swords size={14} color="#22c55e" />
            <span className="text-xs font-semibold" style={{ color: "#22c55e" }}>Day {day}/{TOTAL_DAYS}</span>
          </div>
        </motion.div>

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl p-6 mb-5"
          style={{ background: "linear-gradient(145deg, #0d2218 0%, #0a1f14 40%, #091a11 100%)", border: "1px solid #1a3a26" }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)" }} />
          <div className="relative z-10">
            {leader && leader !== "tie" ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={16} color="#22c55e" />
                  <span className="text-xs font-semibold" style={{ color: "#22c55e", letterSpacing: "0.08em" }}>LEADING</span>
                </div>
                <h2 className="text-5xl font-black mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>{leader}</h2>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold" style={{ color: "#22c55e", letterSpacing: "0.08em" }}>STANDING</span>
                </div>
                <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>It's a Tie ⚖️</h2>
              </>
            )}
            {stats && (
              <div className="flex items-center gap-4 mb-5">
                <div>
                  <p className="text-3xl font-black" style={{ fontFamily: "'Syne',sans-serif", color: "#22c55e" }}>{stats.yash_total_points}</p>
                  <p className="text-xs" style={{ color: "#386b4a" }}>Yash</p>
                </div>
                <div className="flex-1 h-px" style={{ background: "#1a3a26" }} />
                <p className="text-lg font-bold" style={{ color: "#2a5a38" }}>VS</p>
                <div className="flex-1 h-px" style={{ background: "#1a3a26" }} />
                <div className="text-right">
                  <p className="text-3xl font-black" style={{ fontFamily: "'Syne',sans-serif", color: "#818cf8" }}>{stats.nishant_total_points}</p>
                  <p className="text-xs" style={{ color: "#4a4a7a" }}>Nishant</p>
                </div>
              </div>
            )}
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: "#386b4a" }}>
                <span>{pct}% complete</span>
                <span>{TOTAL_DAYS - day} days left</span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "#1a3a26" }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #16a34a, #22c55e)" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Pills ── */}
        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-4 gap-2 mb-5">
            <StatPill label="Matches" value={stats.total_matches} color="#fff" />
            <StatPill label="Y Wins" value={stats.yash_wins} color="#22c55e" />
            <StatPill label="N Wins" value={stats.nishant_wins} color="#818cf8" />
            <StatPill label="Draws" value={stats.draws} color="#facc15" />
          </motion.div>
        )}

        {/* ── Graph ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-3xl p-5 mb-5"
          style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} color="#22c55e" />
            <p className="text-xs font-semibold" style={{ color: "#444", letterSpacing: "0.1em" }}>POINTS OVER TIME</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={graphData}>
              <defs>
                <linearGradient id="gy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#141414" />
              <XAxis dataKey="date" tick={{ fill: "#333", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#333", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Yash" stroke="#22c55e" strokeWidth={2.5} fill="url(#gy)" dot={false} />
              <Area type="monotone" dataKey="Nishant" stroke="#818cf8" strokeWidth={2.5} fill="url(#gn)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Add/Edit Form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4"
            >
              <div className="rounded-3xl p-5" style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "#444", letterSpacing: "0.1em" }}>{showForm.mode === "edit" ? "EDITING MATCH" : "NEW MATCH"}</p>
                    <p className="font-bold text-sm">{showForm.mode === "edit" ? editTarget?.match_date : "Record result"}</p>
                  </div>
                  <button onClick={() => { setShowForm(false); setEditTarget(null); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#1a1a1a" }}>
                    <X size={14} color="#666" />
                  </button>
                </div>
                <input type="date" value={formData.match_date}
                  onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                  className={inp} style={inpStyle} />
                <select value={formData.winner}
                  onChange={e => setFormData({ ...formData, winner: e.target.value })}
                  className={inp} style={{ ...inpStyle, color: "white" }}>
                  <option value="Yash">🟢 Yash wins</option>
                  <option value="Nishant">🟣 Nishant wins</option>
                  <option value="Draw">🟡 Draw</option>
                </select>
                <textarea placeholder="Notes (optional)" value={formData.notes} rows={2}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className={inp} style={{ ...inpStyle, resize: "none" }} />
                <button onClick={handleFormSave}
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95"
                  style={{ background: "#22c55e", color: "#000" }}>
                  <Check size={15} /> {showForm.mode === "edit" ? "Save Changes" : "Add Match"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Match History ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold" style={{ color: "#444", letterSpacing: "0.1em" }}>MATCH HISTORY</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#111", color: "#555", border: "1px solid #1a1a1a" }}>{matches.length} total</span>
          </div>

          {matches.length === 0 && !loading && (
            <div className="text-center py-12" style={{ color: "#333" }}>
              <span className="text-5xl block mb-3">♟</span>
              <p className="text-sm">No matches yet. Add one!</p>
            </div>
          )}

          <AnimatePresence>
            {matches.map((m, i) => {
              const isYash = m.winner === "Yash";
              const isDraw = m.winner === "Draw";
              const clr = isYash ? "#22c55e" : isDraw ? "#facc15" : "#818cf8";
              const bg = isYash ? "#0a1f14" : isDraw ? "#1a1600" : "#0f0f1f";
              const bdr = isYash ? "#1a3a26" : isDraw ? "#2a2200" : "#1a1a30";
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}
                  className="rounded-2xl p-4 mb-2.5 flex items-center gap-3"
                  style={{ background: bg, border: `1px solid ${bdr}` }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0"
                    style={{ background: "rgba(0,0,0,0.3)", color: clr, fontFamily: "serif" }}>
                    {isYash ? "♔" : isDraw ? "♞" : "♛"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight" style={{ color: clr }}>
                      {m.winner === "Draw" ? "Draw" : `${m.winner} won`}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "#444" }}>
                      {m.match_date}{m.notes ? ` · ${m.notes}` : ""}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-bold" style={{ color: "#22c55e" }}>Y {m.yash_points}</span>
                      <span className="text-xs" style={{ color: "#333" }}>—</span>
                      <span className="text-xs font-bold" style={{ color: "#818cf8" }}>N {m.nishant_points}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEditClick(m)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #222" }}>
                      <Pencil size={12} color="#555" />
                    </button>
                    <button onClick={() => handleDeleteClick(m)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <Trash2 size={12} color="#ef4444" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Floating Add Button ── */}
      {!showForm && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}
          onClick={handleAddClick}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center z-40 active:scale-90 transition"
          style={{ background: "#22c55e", boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
        >
          <Plus size={22} color="#000" strokeWidth={2.5} />
        </motion.button>
      )}
    </div>
  );
}