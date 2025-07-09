import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Loader2, Clock, Wifi } from "lucide-react";
import type { ApiEndpoint } from "@/pages/Dashboard";

interface ApiEndpointCardProps {
  endpoint: ApiEndpoint;
  onCheckConnection: (endpointId: string) => void;
}

export default function ApiEndpointCard({ endpoint, onCheckConnection }: ApiEndpointCardProps) {
  const getStatusIcon = () => {
    switch (endpoint.status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "checking":
        return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
    }
  };

  const getStatusBadge = () => {
    switch (endpoint.status) {
      case "connected":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Connected</Badge>;
      case "disconnected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Disconnected</Badge>;
      case "checking":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Checking...</Badge>;
    }
  };

  const getProgressValue = () => {
    if (!endpoint.responseTime) return 0;
    // Convert response time to progress (max 2000ms = 100%)
    return Math.min((endpoint.responseTime / 2000) * 100, 100);
  };

  const getProgressColor = () => {
    if (!endpoint.responseTime) return "";
    if (endpoint.responseTime < 500) return "bg-success";
    if (endpoint.responseTime < 1000) return "bg-warning";
    return "bg-destructive";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('id-ID', { 
      year: '2-digit',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <Card className="shadow-elegant animate-fade-in hover:shadow-glow transition-smooth">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            {endpoint.name}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Circle */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <Progress 
              value={endpoint.status === "connected" ? 75 : endpoint.status === "checking" ? 50 : 0} 
              className="w-24 h-24 rotate-[-90deg] rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {getStatusIcon()}
            </div>
          </div>
        </div>

        {/* Response Time */}
        {endpoint.responseTime && (
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {endpoint.responseTime} milliseconds
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${getProgressValue()}%` }}
              />
            </div>
          </div>
        )}

        {/* Last Update */}
        {endpoint.lastUpdate && (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last update {formatTime(endpoint.lastUpdate)}</span>
          </div>
        )}

        {/* Check Connection Button */}
        <Button 
          variant="outline"
          className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
          onClick={() => onCheckConnection(endpoint.id)}
          disabled={endpoint.status === "checking"}
        >
          {endpoint.status === "checking" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Cek koneksi"
          )}
        </Button>

        {/* Endpoint Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <code>{endpoint.endpoint}</code>
        </div>
      </CardContent>
    </Card>
  );
}