export function UrgencyBadge({ score }) {
  const pct = Math.round((score ?? 0) * 100);
  let color = "bg-emerald-100 text-emerald-700";
  let label = "Low urgency";

  if (score >= 0.75) {
    color = "bg-red-100 text-red-700";
    label = "Urgent";
  } else if (score >= 0.4) {
    color = "bg-amber-100 text-amber-700";
    label = "Moderate";
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {label} · {pct}%
    </span>
  );
}

const STATUS_STYLES = {
  available: "bg-blue-100 text-blue-700",
  claimed: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>
  );
}

const BADGE_COLORS = {
  Newcomer: "bg-gray-100 text-gray-600",
  "Food Hero": "bg-emerald-100 text-emerald-700",
  "Rescue Champion": "bg-blue-100 text-blue-700",
  "Community Legend": "bg-purple-100 text-purple-700",
};

export function GamificationBadge({ badge }) {
  const style = BADGE_COLORS[badge] || "bg-gray-100 text-gray-600";
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>{badge}</span>;
}
