const colors = {
  "To Do": "bg-stone-100 text-stone-700",
  "In Progress": "bg-gold/20 text-amber-800",
  Completed: "bg-emerald-100 text-emerald-700"
};

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${colors[status] || colors["To Do"]}`}>
    {status}
  </span>
);

export default StatusBadge;
