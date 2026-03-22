import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function ChartAnalytics({ data }) {
  return (
    <BarChart width={400} height={300} data={data}>
      <XAxis dataKey="topic" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="score" />
    </BarChart>
  );
}