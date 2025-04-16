import Widget from './Widget';
import Chart from './Chart';
import Table from './Table';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Widget title="Total Exams" value="12" />
        <Widget title="Faculty" value="18" />
        <Widget title="Students" value="302" />
        <Widget title="Available Rooms" value="10" />
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Chart />
        {/* Optional second chart or stats block */}
        <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-center text-gray-500 text-sm">
          Placeholder for another chart/stat card
        </div>
      </div>

      {/* Table */}
      <Table />
    </div>
  );
}
