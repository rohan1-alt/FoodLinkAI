import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Utensils, Weight, Leaf, Users, Trophy, ArrowLeft } from "lucide-react";
import StatCard from "../components/StatCard";
import { GamificationBadge } from "../components/Badges";
import { api } from "../lib/api";

/**
 * Public, no-login impact + leaderboard page (Features #4 and #5 from
 * the pitch deck). Anyone can view this to see transparent, real-time
 * proof of impact -- no auth required by design.
 */
export default function AdminDashboard() {
  const [impact, setImpact] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getImpact(), api.getLeaderboard(10)])
      .then(([impactData, leaderboardData]) => {
        setImpact(impactData);
        setLeaderboard(leaderboardData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50/60">
      <header className="bg-white border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-700">
            <ArrowLeft size={16} />
            Back home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Impact Dashboard</h1>
        <p className="text-gray-500 mb-8">
          Real-time, transparent proof of food rescued through FoodLink AI.
        </p>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              <StatCard
                icon={Utensils}
                label="Meals saved"
                value={impact?.meals_saved ?? 0}
                accent="emerald"
              />
              <StatCard
                icon={Weight}
                label="kg of food rescued"
                value={impact?.total_kg_saved ?? 0}
                accent="blue"
              />
              <StatCard
                icon={Leaf}
                label="kg CO2e avoided"
                value={impact?.co2_kg_avoided ?? 0}
                accent="emerald"
              />
              <StatCard
                icon={Trophy}
                label="Pickups completed"
                value={impact?.total_donations_completed ?? 0}
                accent="amber"
              />
              <StatCard
                icon={Users}
                label="Active donors"
                value={impact?.active_donors ?? 0}
                accent="purple"
              />
              <StatCard
                icon={Users}
                label="Active NGOs / volunteers"
                value={impact?.active_recipients ?? 0}
                accent="purple"
              />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p className="text-gray-400 text-sm">No completed pickups yet.</p>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-left">
                    <tr>
                      <th className="px-5 py-3 font-medium">#</th>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Badge</th>
                      <th className="px-5 py-3 font-medium">Pickups</th>
                      <th className="px-5 py-3 font-medium text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, i) => (
                      <tr key={entry.user_id} className="border-t border-gray-50">
                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">{entry.full_name}</td>
                        <td className="px-5 py-3 text-gray-500 capitalize">{entry.role}</td>
                        <td className="px-5 py-3">
                          <GamificationBadge badge={entry.badge} />
                        </td>
                        <td className="px-5 py-3 text-gray-500">{entry.completed_pickups}</td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-800">
                          {entry.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
