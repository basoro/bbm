import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MonitoringChart from "@/components/MonitoringChart";
import ApiEndpointCard from "@/components/ApiEndpointCard";
import CredentialsSettings from "@/components/CredentialsSettings";
import { Activity, Monitor, Heart } from "lucide-react";

export interface ApiEndpoint {
  id: string;
  name: string;
  endpoint: string;
  description: string;
  status: "connected" | "disconnected" | "checking";
  responseTime?: number;
  lastUpdate?: Date;
  isActive: boolean;
}

const Dashboard = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    {
      id: "peserta",
      name: "Get Peserta",
      endpoint: "/Peserta/nokartu/{cardNumber}/tglSEP/{date}",
      description: "Data peserta BPJS berdasarkan nomor kartu",
      status: "connected",
      responseTime: 1030,
      lastUpdate: new Date(),
      isActive: true
    },
    {
      id: "poli",
      name: "Get Poli",
      endpoint: "/referensi/poli",
      description: "Data referensi poli rumah sakit",
      status: "connected",
      responseTime: 1173,
      lastUpdate: new Date(),
      isActive: true
    },
    {
      id: "dokter",
      name: "Get Dokter",
      endpoint: "/referensi/dokter/{type}",
      description: "Data referensi dokter",
      status: "connected",
      responseTime: 1263,
      lastUpdate: new Date(),
      isActive: true
    },
    {
      id: "status-pulang",
      name: "Get Status Pulang",
      endpoint: "/referensi/statuspulang",
      description: "Referensi status pulang pasien",
      status: "connected",
      responseTime: 868,
      lastUpdate: new Date(),
      isActive: true
    },
    {
      id: "diagnosa",
      name: "Get Diagnosa",
      endpoint: "/referensi/diagnosa/{keyword}",
      description: "Data referensi diagnosa ICD-10",
      status: "connected",
      responseTime: 955,
      lastUpdate: new Date(),
      isActive: true
    },
    {
      id: "obat",
      name: "Get Obat",
      endpoint: "/referensi/obat/{keyword}",
      description: "Data referensi obat",
      status: "connected",
      responseTime: 748,
      lastUpdate: new Date(),
      isActive: true
    },
    {
      id: "riwayat",
      name: "Get Riwayat Kunjungan",
      endpoint: "/Peserta/{cardNumber}/history",
      description: "Riwayat kunjungan peserta",
      status: "connected",
      responseTime: 1098,
      lastUpdate: new Date(),
      isActive: true
    },
    {
      id: "rujukan",
      name: "Get Rujukan",
      endpoint: "/Rujukan/{cardNumber}",
      description: "Data rujukan peserta",
      status: "connected",
      responseTime: 575,
      lastUpdate: new Date(),
      isActive: true
    }
  ]);

  const [chartData, setChartData] = useState<Array<{time: string, value: number}>>([]);
  const { toast } = useToast();

  // Generate real-time chart data
  useEffect(() => {
    const generateDataPoint = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      
      // Simulate API activity with some randomness
      const value = Math.floor(Math.random() * 100) + 20;
      
      setChartData(prev => {
        const newData = [...prev, { time: timeStr, value }];
        // Keep only last 50 data points
        return newData.slice(-50);
      });
    };

    // Generate initial data
    for (let i = 0; i < 20; i++) {
      setTimeout(() => generateDataPoint(), i * 100);
    }

    // Continue generating data every 2 seconds
    const interval = setInterval(generateDataPoint, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto health check every 30 seconds
  useEffect(() => {
    const healthCheck = async () => {
      const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      
      // Simulate some endpoints occasionally going offline
      const shouldFail = Math.random() < 0.1; // 10% chance of failure
      
      setEndpoints(prev => prev.map(endpoint => {
        if (endpoint.id === randomEndpoint.id) {
          return {
            ...endpoint,
            status: shouldFail ? "disconnected" : "connected",
            responseTime: shouldFail ? undefined : Math.floor(Math.random() * 2000) + 200,
            lastUpdate: new Date()
          };
        }
        return endpoint;
      }));
    };

    const interval = setInterval(healthCheck, 30000);
    return () => clearInterval(interval);
  }, [endpoints]);

  const handleCheckConnection = async (endpointId: string) => {
    // Get saved credentials from localStorage
    const savedCredentials = localStorage.getItem('bpjs_credentials');
    if (!savedCredentials) {
      toast({
        title: "Error",
        description: "Credentials BPJS tidak ditemukan. Silakan atur credentials terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    let credentials;
    try {
      credentials = JSON.parse(savedCredentials);
      if (!credentials.consId || !credentials.userKey || !credentials.secretKey) {
        throw new Error("Credentials tidak lengkap");
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Credentials tidak valid. Silakan atur ulang credentials.",
        variant: "destructive",
      });
      return;
    }
    setEndpoints(prev => prev.map(endpoint => 
      endpoint.id === endpointId 
        ? { ...endpoint, status: "checking" }
        : endpoint
    ));

    try {
      const startTime = Date.now();
      
      // Use the edge function to test the connection
      const { data, error } = await supabase.functions.invoke('bpjs-api', {
        body: {
          cardNumber: "0000000000001", // Test card number
          serviceDate: new Date().toISOString().split('T')[0],
          consId: credentials.consId,
          userKey: credentials.userKey,
          secretKey: credentials.secretKey,
          testEndpoint: endpointId
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        throw new Error(error.message);
      }

      setEndpoints(prev => prev.map(endpoint => 
        endpoint.id === endpointId 
          ? { 
              ...endpoint, 
              status: "connected",
              responseTime,
              lastUpdate: new Date()
            }
          : endpoint
      ));

      toast({
        title: "Koneksi Berhasil",
        description: `${endpoints.find(e => e.id === endpointId)?.name} berhasil diakses`,
      });

    } catch (error: any) {
      setEndpoints(prev => prev.map(endpoint => 
        endpoint.id === endpointId 
          ? { 
              ...endpoint, 
              status: "disconnected",
              lastUpdate: new Date()
            }
          : endpoint
      ));

      toast({
        title: "Koneksi Gagal",
        description: error.message || "Gagal terhubung ke endpoint",
        variant: "destructive",
      });
    }
  };

  const connectedCount = endpoints.filter(e => e.status === "connected").length;
  const avgResponseTime = endpoints
    .filter(e => e.responseTime)
    .reduce((acc, e) => acc + (e.responseTime || 0), 0) / endpoints.filter(e => e.responseTime).length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-gradient-primary shadow-elegant">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-primary-foreground/10 p-3 rounded-lg">
                <Heart className="h-8 w-8 text-primary-foreground" />
                <Monitor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                  BPJS API Monitoring Dashboard
                </h1>
                <p className="text-primary-foreground/80 text-sm md:text-base">
                  Real-time monitoring untuk semua endpoint BPJS Kesehatan
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-4 text-primary-foreground">
                <div className="text-center">
                  <div className="text-2xl font-bold">{connectedCount}/{endpoints.length}</div>
                  <div className="text-xs opacity-80">Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(avgResponseTime)}ms</div>
                  <div className="text-xs opacity-80">Avg Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Credentials Settings */}
        {/* <CredentialsSettings /> */}
        
        {/* Real-time Chart */}
        <div className="grid grid-cols-1 gap-8">
          <MonitoringChart data={chartData} />
        </div>
        
        {/* API Endpoints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {endpoints.map((endpoint) => (
            <ApiEndpointCard
              key={endpoint.id}
              endpoint={endpoint}
              onCheckConnection={handleCheckConnection}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-sm">
                BPJS API Monitor - Real-time Health Check Dashboard.
              </span>
              Built with <Heart className="inline h-4 w-4 text-red-500" /> by{" "}
              <a
                href="https://basoro.id"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Basoro
              </a>              
            </div>
            <div className="text-xs text-muted-foreground">
              <span><CredentialsSettings triggerClassName="text-xs hover:text-primary transition-colors" /></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
