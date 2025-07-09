import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";

interface MonitoringChartProps {
  data: Array<{ time: string; value: number }>;
}

export default function MonitoringChart({ data }: MonitoringChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 100);
  const avgValue = data.length > 0 ? Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length) : 0;

  // Create SVG path for the line chart
  const createPath = () => {
    if (data.length === 0) return "";
    
    const width = 600;
    const height = 200;
    const padding = 40;
    
    const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);
    const yRatio = (height - padding * 2) / maxValue;
    
    let path = "";
    
    data.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (point.value * yRatio);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  return (
    <Card className="shadow-elegant animate-fade-in col-span-full">
      <CardHeader className="bg-gradient-secondary rounded-t-lg">
        <CardTitle className="text-secondary-foreground flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Real-time API Activity Monitor
          <div className="ml-auto flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Avg: {avgValue}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-64 w-full relative">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 600 200"
            className="border rounded bg-background/50"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Chart line */}
            {data.length > 0 && (
              <path
                d={createPath()}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                className="drop-shadow-sm"
              />
            )}
            
            {/* Data points */}
            {data.map((point, index) => {
              const width = 600;
              const height = 200;
              const padding = 40;
              const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);
              const yRatio = (height - padding * 2) / maxValue;
              const x = padding + index * xStep;
              const y = height - padding - (point.value * yRatio);
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="hsl(var(--primary))"
                  className="drop-shadow-sm"
                />
              );
            })}
            
            {/* Y-axis labels */}
            <text x="10" y="50" fontSize="12" fill="hsl(var(--muted-foreground))">{maxValue}ms</text>
            <text x="10" y="110" fontSize="12" fill="hsl(var(--muted-foreground))">{Math.round(maxValue/2)}ms</text>
            <text x="10" y="170" fontSize="12" fill="hsl(var(--muted-foreground))">0ms</text>
          </svg>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Real-time monitoring of BPJS API endpoints</span>
          <span>{data.length} data points</span>
        </div>
      </CardContent>
    </Card>
  );
}