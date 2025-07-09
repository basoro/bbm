import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface ApiCall {
  id: string;
  timestamp: Date;
  endpoint: string;
  status: "pending" | "success" | "error";
  responseTime?: number;
  statusCode?: number;
  error?: string;
}

interface ApiStatusMonitorProps {
  currentCall?: ApiCall;
}

export default function ApiStatusMonitor({ currentCall }: ApiStatusMonitorProps) {
  const [calls, setCalls] = useState<ApiCall[]>([]);

  useEffect(() => {
    if (currentCall) {
      setCalls(prev => [currentCall, ...prev.slice(0, 9)]); // Keep last 10 calls
    }
  }, [currentCall]);

  const getStatusIcon = (status: ApiCall["status"]) => {
    switch (status) {
      case "pending":
        return <Activity className="h-4 w-4 text-warning animate-pulse" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ApiCall["status"], statusCode?: number) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case "success":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Success {statusCode}</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Error {statusCode}</Badge>;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <Card className="shadow-elegant animate-fade-in">
      <CardHeader className="bg-gradient-secondary rounded-t-lg">
        <CardTitle className="text-secondary-foreground flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Real-time API Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada panggilan API</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {calls.map((call) => (
              <div 
                key={call.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border transition-smooth hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(call.status)}
                  <div>
                    <p className="font-medium text-sm">BPJS Peserta API</p>
                    <p className="text-xs text-muted-foreground">{call.endpoint}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {call.responseTime && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {call.responseTime}ms
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(call.status, call.statusCode)}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(call.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}