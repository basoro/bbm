import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, KeyRound, Shield, Save, Eye, EyeOff } from "lucide-react";

interface Credentials {
  consId: string;
  userKey: string;
  secretKey: string;
}

interface CredentialsSettingsProps {
  triggerClassName?: string;
}

export default function CredentialsSettings({ triggerClassName }: CredentialsSettingsProps) {
  const [credentials, setCredentials] = useState<Credentials>({
    consId: "",
    userKey: "",
    secretKey: ""
  });
  const [showConsId, setShowConsId] = useState(false);
  const [showUserKey, setShowUserKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedCredentials = localStorage.getItem('bpjs_credentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setCredentials(parsed);
        setIsConnected(!!parsed.consId && !!parsed.userKey && !!parsed.secretKey);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof Credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!credentials.consId || !credentials.userKey || !credentials.secretKey) {
      toast({
        title: "Error",
        description: "Semua field credentials harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem('bpjs_credentials', JSON.stringify(credentials));
      setIsConnected(true);
      toast({
        title: "Berhasil",
        description: "Credentials berhasil disimpan di localStorage",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan credentials",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    localStorage.removeItem('bpjs_credentials');
    setCredentials({ consId: "", userKey: "", secretKey: "" });
    setIsConnected(false);
    toast({
      title: "Berhasil",
      description: "Credentials berhasil dihapus",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={triggerClassName}>
          <Settings className="h-4 w-4 mr-2" />
          Pengaturan Credentials
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] shadow-elegant animate-fade-in">
      <DialogHeader className="bg-gradient-primary rounded-t-lg p-4">
        <DialogTitle className="text-primary-foreground flex items-center gap-2">
          <Settings className="h-5 w-5" />
          BPJS API Credentials Settings
          {isConnected && (
            <Badge variant="outline" className="ml-auto bg-success text-white border-success/20">
              Connected
            </Badge>
          )}
        </DialogTitle>
      </DialogHeader>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Consumer ID */}
          <div className="space-y-2">
            <Label htmlFor="consId" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              Consumer ID
            </Label>
            <div className="relative">
              <Input
                id="consId"
                type={showConsId ? "text" : "password"}
                value={credentials.consId}
                onChange={(e) => handleInputChange("consId", e.target.value)}
                placeholder="Consumer ID"
                className="transition-smooth focus:shadow-glow pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowConsId(!showConsId)}
              >
                {showConsId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* User Key */}
          <div className="space-y-2">
            <Label htmlFor="userKey" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-secondary" />
              User Key
            </Label>
            <div className="relative">
              <Input
                id="userKey"
                type={showUserKey ? "text" : "password"}
                value={credentials.userKey}
                onChange={(e) => handleInputChange("userKey", e.target.value)}
                placeholder="User Key"
                className="transition-smooth focus:shadow-glow pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowUserKey(!showUserKey)}
              >
                {showUserKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Secret Key */}
          <div className="space-y-2">
            <Label htmlFor="secretKey" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              Secret Key
            </Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecretKey ? "text" : "password"}
                value={credentials.secretKey}
                onChange={(e) => handleInputChange("secretKey", e.target.value)}
                placeholder="Secret Key"
                className="transition-smooth focus:shadow-glow pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSave}
            className="bg-gradient-primary hover:shadow-glow transition-smooth flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Simpan Credentials
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleClear}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          >
            Hapus Credentials
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Info:</strong> Credentials disimpan di localStorage browser Anda untuk keamanan. 
            Data tidak dikirim ke server dan hanya digunakan untuk autentikasi API BPJS.
          </p>
        </div>
      </div>
    </DialogContent>
    </Dialog>
  );
}
