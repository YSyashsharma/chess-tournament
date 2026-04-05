import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Trophy, Crown, Plus, Trash2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const API = process.env.REACT_APP_API;

export default function App() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [graphData, setGraphData] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    match_date: new Date().toISOString().split("T")[0],
    winner: "Yash",
    notes: ""
  });
  const [password, setPassword] = useState("");

  // START DATE
  const START_DATE = new Date("2026-04-04"); // adjust if needed
  const TOTAL_DAYS = 21;

  const getDayText = () => {
    const now = new Date();
    const diff = Math.floor((now - START_DATE) / (1000 * 60 * 60 * 24)) + 1;
    const day = Math.min(diff, TOTAL_DAYS);
    return `Day ${day} of ${TOTAL_DAYS}`;
  };

  // LOAD DATA
  const loadData = async () => {
    try {
      const m = await axios.get(`${API}/matches`);
      const s = await axios.get(`${API}/stats`);

      setStats(s.data);

      const uniqueMatches = Array.from(new Map(m.data.map(item => [item.id, item])).values());
      setMatches(uniqueMatches);

      let yash = 0;
      let nishant = 0;
      const g = uniqueMatches
        .slice()
        .sort((a,b)=> new Date(a.match_date)-new Date(b.match_date))
        .map(match => {
          yash += match.yash_points;
          nishant += match.nishant_points;
          return {
            date: match.match_date,
            Yash: yash,
            Nishant: nishant
          };
        });
      setGraphData(g);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD MATCH
  const handleAddMatch = async () => {
    if (!password) {
      alert("Enter password to add match");
      return;
    }
    try {
      await axios.post(`${API}/matches`, formData, {
        headers: { "Authorization": `Bearer ${password}` }
      });
      setShowForm(false);
      setFormData({
        match_date: new Date().toISOString().split("T")[0],
        winner: "Yash",
        notes: ""
      });
      setPassword("");
      loadData();
    } catch {
      alert("Error adding match. Check password or backend.");
    }
  };

  // DELETE MATCH
  const handleDelete = async (id) => {
    if (!password) {
      alert("Enter password to delete match");
      return;
    }
    if (!window.confirm("Delete this match?")) return;
    try {
      await axios.delete(`${API}/matches/${id}`, {
        headers: { "Authorization": `Bearer ${password}` }
      });
      setPassword("");
      loadData();
    } catch {
      alert("Error deleting match. Check password or backend.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="flex items-center gap-2 text-xl">
          <Trophy /> Chess Arena
        </h1>
      </div>

      {/* DAY */}
      <motion.div
        animate={{ scale: [0.95, 1] }}
        className="p-6 mb-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-black text-center"
      >
        <Crown className="mx-auto mb-2" size={40} />
        <h2 className="text-lg font-bold">{getDayText()}</h2>
      </motion.div>

      {/* SCORE */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            key={stats.yash_total_points}
            animate={{ scale: [1.2, 1] }}
            className="p-4 bg-green-600 rounded-xl text-center"
          >
            <h2 className="text-2xl font-bold">{stats.yash_total_points}</h2>
            <p>Yash</p>
          </motion.div>

          <motion.div
            key={stats.nishant_total_points}
            animate={{ scale: [1.2, 1] }}
            className="p-4 bg-gray-700 rounded-xl text-center"
          >
            <h2 className="text-2xl font-bold">{stats.nishant_total_points}</h2>
            <p>Nishant</p>
          </motion.div>
        </div>
      )}

      {/* GRAPH */}
      <div className="bg-white/10 p-4 rounded-xl mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={graphData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="Yash" stroke="#22c55e" />
            <Line type="monotone" dataKey="Nishant" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PASSWORD INPUT */}
      {showForm && (
        <input
          type="password"
          placeholder="Enter password to save"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 bg-white/20 rounded text-black"
        />
      )}

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-green-600 px-4 py-2 rounded mb-4 flex items-center gap-2"
      >
        <Plus size={16} /> Add Match
      </button>

      {/* FORM */}
      {showForm && (
        <div className="bg-white/10 p-4 rounded mb-4">
          <input
            type="date"
            value={formData.match_date}
            onChange={(e) =>
              setFormData({ ...formData, match_date: e.target.value })
            }
            className="w-full mb-2 p-2 bg-white/20 rounded"
          />
          <select
            value={formData.winner}
            onChange={(e) =>
              setFormData({ ...formData, winner: e.target.value })
            }
            className="w-full mb-2 p-2 bg-white/20 rounded"
          >
            <option value="Yash">Yash</option>
            <option value="Nishant">Nishant</option>
            <option value="Draw">Draw</option>
          </select>
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full mb-2 p-2 bg-white/20 rounded"
          />
          <button
            onClick={handleAddMatch}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      )}

      {/* MATCH LIST */}
      {matches.map((m) => (
        <motion.div
          key={m.id}
          whileHover={{ scale: 1.02 }}
          className="p-3 mb-2 bg-white/10 rounded flex justify-between items-center"
        >
          <div>
            <p>{m.match_date}</p>
            <p className="text-sm text-gray-400">{m.notes}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* RESULT + POINTS */}
            <div className="flex flex-col items-end">
              <span
                className={`px-2 py-1 rounded ${
                  m.winner === "Yash"
                    ? "bg-green-500"
                    : m.winner === "Nishant"
                    ? "bg-gray-500"
                    : "bg-yellow-500"
                }`}
              >
                {m.winner}
              </span>
              <span className="text-sm text-gray-300 mt-1">
                Y: {m.yash_points} | N: {m.nishant_points}
              </span>
            </div>

            {/* DELETE BUTTON */}
            <Trash2
              size={18}
              className="cursor-pointer text-red-400"
              onClick={() => handleDelete(m.id)}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}