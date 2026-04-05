import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Plus, Trash2, Pencil, X, Check, Lock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const API = (process.env.REACT_APP_API || "") + "/api";

// ─── Password Modal ───────────────────────────────────────────────────────────
function PasswordModal({ title, onConfirm, onCancel }) {
  const [pw, setPw] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="w-80 rounded-2xl p-6"
        style={{ background: "#111", border: "1px solid #1f1f1f" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-green-400" />
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        <input
          ref={inputRef}
          type="password"
          placeholder="Enter password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onConfirm(pw)}
          className="w-full rounded-xl px-4 py-3 text-white text-sm mb-4 outline-none"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(pw)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition"
            style={{ background: "#22c55e", color: "#000" }}
          >Confirm</button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition"
            style={{ background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}
          >Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-2 text-sm" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [graphData, setGraphData] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editMatch, setEditMatch] = useState(null); // match object being edited
  const [formData, setFormData] = useState({
    match_date: new Date().toISOString().split("T")[0],
    winner: "Yash",
    notes: ""
  });

  // Modal state: { action: "add"|"delete"|"edit", payload: any }
  const [modal, setModal] = useState(null);

  const START_DATE = new Date("2026-04-04");
  const TOTAL_DAYS = 21;

  const getDayInfo = () => {
    const now = new Date();
    const diff = Math.floor((now - START_DATE) / (1000 * 60 * 60 * 24)) + 1;
    const day = Math.max(1, Math.min(diff, TOTAL_DAYS));
    const pct = Math.round((day / TOTAL_DAYS) * 100);
    return { day, pct };
  };

  const loadData = async () => {
    try {
      const [m, s] = await Promise.all([
        axios.get(`${API}/matches`),
        axios.get(`${API}/stats`)
      ]);
      setStats(s.data);
      const unique = Array.from(new Map(m.data.map(i => [i.id, i])).values());
      setMatches(unique);
      let y = 0, n = 0;
      const g = unique.slice()
        .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
        .map(match => {
          y += match.yash_points;
          n += match.nishant_points;
          return { date: match.match_date, Yash: y, Nishant: n };
        });
      setGraphData(g);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Action handlers (called after password confirmed) ──
  const doAdd = async (pw) => {
    try {
      await axios.post(`${API}/matches`, formData, { headers: { "x-password": pw } });
      setShowForm(false);
      setFormData({ match_date: new Date().toISOString().split("T")[0], winner: "Yash", notes: "" });
      setModal(null);
      loadData();
    } catch { alert("Wrong password or server error."); setModal(null); }
  };

  const doEdit = async (pw) => {
    try {
      await axios.put(`${API}/matches/${editMatch.id}`, formData, { headers: { "x-password": pw } });
      setEditMatch(null);
      setShowForm(false);
      setModal(null);
      loadData();
    } catch { alert("Wrong password or server error."); setModal(null); }
  };

  const doDelete = async (pw, id) => {
    try {
      await axios.delete(`${API}/matches/${id}`, { headers: { "x-password": pw } });
      setModal(null);
      loadData();
    } catch { alert("Wrong password or server error."); setModal(null); }
  };

  const handleModalConfirm = (pw) => {
    if (!pw) { alert("Password required"); return; }
    if (modal.action === "add") doAdd(pw);
    else if (modal.action === "edit") doEdit(pw);
    else if (modal.action === "delete") doDelete(pw, modal.payload);
  };

  const openEdit = (m) => {
    setEditMatch(m);
    setFormData({ match_date: m.match_date, winner: m.winner, notes: m.notes || "" });
    setShowForm(true);
  };

  const { day, pct } = getDayInfo();

  const leader = stats
    ? stats.yash_total_points > stats.nishant_total_points ? "Yash"
    : stats.nishant_total_points > stats.yash_total_points ? "Nishant"
    : "tie"
    : null;

  const inputCls = "w-full rounded-xl px-4 py-3 text-white text-sm mb-3 outline-none transition";
  const inputStyle = { background: "#1a1a1a", border: "1px solid #2a2a2a" };

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* ── Password Modal ── */}
      <AnimatePresence>
        {modal && (
          <PasswordModal
            title={modal.action === "delete" ? "Confirm Delete" : modal.action === "edit" ? "Confirm Edit" : "Add Match"}
            onConfirm={handleModalConfirm}
            onCancel={() => setModal(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto px-4 py-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#22c55e" }}>
              <Trophy size={16} color="#000" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Chess Arena</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#1a1a1a", color: "#666", border: "1px solid #1f1f1f" }}>
            {stats?.total_matches ?? 0} matches
          </span>
        </div>

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6 mb-6"
          style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)" }}
        >
          {/* decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: "#4ade80" }} />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10" style={{ background: "#86efac" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={20} color="#86efac" />
              <span className="text-green-300 text-sm font-medium">Day {day} of {TOTAL_DAYS}</span>
            </div>

            {leader && leader !== "tie" ? (
              <>
                <p className="text-green-200 text-sm mb-1">Currently leading</p>
                <h2 className="text-4xl font-black text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{leader} 👑</h2>
              </>
            ) : (
              <h2 className="text-4xl font-black text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>It's a Tie ⚖️</h2>
            )}

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-green-300 mb-1">
                <span>Tournament Progress</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "#4ade80" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Score Cards ── */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { name: "Yash", pts: stats.yash_total_points, wins: stats.yash_wins, color: "#22c55e", bg: "#0f2d1a", border: "#166534" },
              { name: "Nishant", pts: stats.nishant_total_points, wins: stats.nishant_wins, color: "#818cf8", bg: "#1a1a2e", border: "#312e81" }
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-4"
                style={{ background: p.bg, border: `1px solid ${p.border}` }}
              >
                <p className="text-xs mb-2" style={{ color: p.color }}>{p.name}</p>
                <p className="text-4xl font-black mb-1" style={{ fontFamily: "'Syne', sans-serif", color: p.color }}>{p.pts}</p>
                <p className="text-xs" style={{ color: "#555" }}>{p.wins}W · {stats.draws}D</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Graph ── */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
          <p className="text-xs font-semibold mb-4" style={{ color: "#555", letterSpacing: "0.1em" }}>CUMULATIVE POINTS</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Yash" stroke="#22c55e" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Nishant" stroke="#818cf8" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Add / Edit Form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="rounded-2xl p-4" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">{editMatch ? "Edit Match" : "New Match"}</span>
                  <button onClick={() => { setShowForm(false); setEditMatch(null); }}>
                    <X size={16} className="text-gray-500 hover:text-white transition" />
                  </button>
                </div>
                <input
                  type="date"
                  value={formData.match_date}
                  onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                />
                <select
                  value={formData.winner}
                  onChange={e => setFormData({ ...formData, winner: e.target.value })}
                  className={inputCls}
                  style={{ ...inputStyle, color: "white" }}
                >
                  <option value="Yash">🟢 Yash wins</option>
                  <option value="Nishant">🟣 Nishant wins</option>
                  <option value="Draw">🟡 Draw</option>
                </select>
                <textarea
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className={inputCls}
                  style={{ ...inputStyle, resize: "none" }}
                />
                <button
                  onClick={() => setModal({ action: editMatch ? "edit" : "add" })}
                  className="w-full py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                  style={{ background: "#22c55e", color: "#000" }}
                >
                  <Check size={16} /> {editMatch ? "Save Changes" : "Add Match"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Add Button ── */}
        {!showForm && (
          <button
            onClick={() => { setEditMatch(null); setFormData({ match_date: new Date().toISOString().split("T")[0], winner: "Yash", notes: "" }); setShowForm(true); }}
            className="w-full py-3 rounded-xl text-sm font-bold mb-6 flex items-center justify-center gap-2 transition"
            style={{ background: "#111", border: "1px solid #1f1f1f", color: "#22c55e" }}
          >
            <Plus size={16} /> Add Match
          </button>
        )}

        {/* ── Match List ── */}
        <div>
          <p className="text-xs font-semibold mb-3" style={{ color: "#555", letterSpacing: "0.1em" }}>MATCH HISTORY</p>
          {matches.length === 0 && (
            <p className="text-center text-gray-600 py-8">No matches yet. Add one!</p>
          )}
          <AnimatePresence>
            {matches.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4 mb-3 flex items-center justify-between"
                style={{ background: "#111", border: "1px solid #1f1f1f" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{
                      background: m.winner === "Yash" ? "#0f2d1a" : m.winner === "Nishant" ? "#1a1a2e" : "#2a2000",
                      color: m.winner === "Yash" ? "#22c55e" : m.winner === "Nishant" ? "#818cf8" : "#facc15"
                    }}
                  >
                    {m.winner === "Yash" ? "Y" : m.winner === "Nishant" ? "N" : "="}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{m.winner === "Draw" ? "Draw" : `${m.winner} won`}</p>
                    <p className="text-xs" style={{ color: "#555" }}>{m.match_date}{m.notes ? ` · ${m.notes}` : ""}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#444" }}>
                      <span style={{ color: "#22c55e" }}>Y {m.yash_points}</span>
                      {" — "}
                      <span style={{ color: "#818cf8" }}>N {m.nishant_points}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                    style={{ background: "#1a1a1a" }}
                  >
                    <Pencil size={13} color="#666" />
                  </button>
                  <button
                    onClick={() => setModal({ action: "delete", payload: m.id })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                    style={{ background: "#1a1a1a" }}
                  >
                    <Trash2 size={13} color="#ef4444" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}