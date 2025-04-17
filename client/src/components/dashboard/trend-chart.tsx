import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface TrendChartProps {
  jobId?: number;
  type?: "line" | "bar" | "pie";
  title: string;
  endpoint: string;
  height?: number;
}

const COLORS = ["#3f51b5", "#ff9800", "#4caf50", "#f44336", "#9c27b0"];

export default function TrendChart({ 
  jobId, 
  type = "line", 
  title, 
  endpoint,
  height = 300 
}: TrendChartProps) {
  // Fetch chart data
  const { data, isLoading } = useQuery({
    queryKey: [jobId ? `/api/jobs/${jobId}/${endpoint}` : `/api/${endpoint}`],
  });

  const renderChart = () => {
    if (isLoading || !data) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-neutral-500">Loading chart data...</p>
        </div>
      );
    }

    if (type === "line") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3f51b5"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (type === "bar") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3f51b5" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === "pie") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        {data?.stats && (
          <div className="mt-4 space-y-2">
            {Object.entries(data.stats).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{key}</span>
                <span className="font-medium text-neutral-800">{value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
