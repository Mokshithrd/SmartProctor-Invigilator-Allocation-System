import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";

const colors = ["#6366F1", "#14B8A6", "#F59E0B", "#EF4444"]; // Faculty, Rooms, Exams, Students

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg rounded-lg px-4 py-2 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-base text-indigo-600">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const Chart = ({ data }) => {
  const chartData = [
    { name: "Faculty", count: data.totalFaculty },
    { name: "Rooms", count: data.totalRooms },
    { name: "Exams", count: data.totalExams },
    { name: "Students", count: data.totalStudents },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          barCategoryGap={32}
          margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 14 }}
            stroke="#94a3b8"
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            allowDecimals={false}
            stroke="#94a3b8"
            axisLine={{ stroke: "#cbd5e1" }}
            tick={{ fontSize: 14 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[12, 12, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
