import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import BpjsApiForm from "@/components/BpjsApiForm";
import ApiStatusMonitor from "@/components/ApiStatusMonitor";
import ApiResponseDisplay from "@/components/ApiResponseDisplay";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Activity, Monitor } from "lucide-react";
import CredentialsSettings from "@/components/CredentialsSettings";

interface BpjsFormData {
  consId: string;
  userKey: string;
  secretKey: string;
  cardNumber: string;
  serviceDate: string;
}

interface ApiCall {
  id: string;
  timestamp: Date;
  endpoint: string;
  status: "pending" | "success" | "error";
  responseTime?: number;
  statusCode?: number;
  error?: string;
}

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [currentCall, setCurrentCall] = useState<ApiCall>();
  const { toast } = useToast();

  const handleFormSubmit = async (formData: BpjsFormData) => {
    const callId = Date.now().toString();
    const startTime = Date.now();
    
    // Save credentials to localStorage for future use
    localStorage.setItem('bpjs_credentials', JSON.stringify({
      consId: formData.consId,
      userKey: formData.userKey,
      secretKey: formData.secretKey
    }));
    
    const endpoint = `BPJS Edge Function`;
    const apiCall: ApiCall = {
      id: callId,
      timestamp: new Date(),
      endpoint,
      status: "pending"
    };
    
    setCurrentCall(apiCall);
    setLoading(true);
    setError("");
    setApiResponse(null);

    try {
      // Call edge function instead of direct API
      const { data, error: supabaseError } = await supabase.functions.invoke('bpjs-api', {
        body: {
          cardNumber: formData.cardNumber,
          serviceDate: formData.serviceDate,
          consId: formData.consId,
          userKey: formData.userKey,
          secretKey: formData.secretKey
        }
      });

      const responseTime = Date.now() - startTime;
      
      if (supabaseError) {
        throw new Error(supabaseError.message || 'Edge function error');
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      setApiResponse(data);
      setCurrentCall({
        ...apiCall,
        status: "success",
        responseTime,
        statusCode: 200
      });

      toast({
        title: "Berhasil",
        description: "Data peserta berhasil diambil",
      });

    } catch (err: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = err.message || "Terjadi kesalahan saat mengambil data";
      
      setError(errorMessage);
      setCurrentCall({
        ...apiCall,
        status: "error",
        responseTime,
        statusCode: err.status || 500,
        error: errorMessage
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-gradient-primary shadow-elegant">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-primary-foreground/10 p-3 rounded-lg">
              <Heart className="h-8 w-8 text-primary-foreground" />
              <Monitor className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                BPJS Kesehatan API Monitor
              </h1>
              <p className="text-primary-foreground/80 text-sm md:text-base">
                Real-time monitoring dashboard untuk API Peserta BPJS Kesehatan
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* API Form */}
        <BpjsApiForm onSubmit={handleFormSubmit} loading={loading} />
        
        {/* Status Monitor and Response Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ApiStatusMonitor currentCall={currentCall} />
          <ApiResponseDisplay 
            data={apiResponse} 
            error={error} 
            loading={loading} 
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-sm">
                BPJS API Monitor - Real-time Participant Data Monitoring. 
              </span>
            </div>
              Built with <Heart className="inline h-4 w-4 text-red-500" /> by{" "}
              <a
                href="https://basoro.id"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Basoro
              </a>            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span><CredentialsSettings triggerClassName="text-xs hover:text-primary transition-colors" /></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;