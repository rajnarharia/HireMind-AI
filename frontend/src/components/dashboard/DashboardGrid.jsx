import StatCard from "./StatCard";

export default function DashboardGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Resume Score"
        value="92%"
      />

      <StatCard
        title="Skill Match"
        value="88%"
      />

      <StatCard
        title="Coding Score"
        value="85%"
      />

      <StatCard
        title="Interview Status"
        value="Pending"
        color="text-yellow-400"
      />

    </div>
  );
}