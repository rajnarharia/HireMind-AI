export default function StatCard({
  title,
  value,
  color = "text-cyan-400",
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <h3 className="text-slate-400 text-sm">{title}</h3>

      <h2 className={`mt-3 text-3xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}