import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, KeyRound, User, Shield, Eye, EyeOff } from "lucide-react";

interface BpjsFormData {
  consId: string;
  userKey: string;
  secretKey: string;
  cardNumber: string;
  serviceDate: string;
}

interface BpjsApiFormProps {
  onSubmit: (data: BpjsFormData) => void;
  loading: boolean;
}

export default function BpjsApiForm({ onSubmit, loading }: BpjsApiFormProps) {
  const [showConsId, setShowConsId] = useState(false);
  const [showUserKey, setShowUserKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const [formData, setFormData] = useState<BpjsFormData>(() => {
    // Load saved credentials from localStorage
    const savedCredentials = localStorage.getItem('bpjs_credentials');
    const credentials = savedCredentials ? JSON.parse(savedCredentials) : {};
    
    return {
      consId: credentials.consId || "",
      userKey: credentials.userKey || "",
      secretKey: credentials.secretKey || "",
      cardNumber: "",
      serviceDate: new Date().toISOString().split('T')[0], // today's date
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof BpjsFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-elegant animate-fade-in">
      <CardHeader className="bg-gradient-primary rounded-t-lg">
        <CardTitle className="text-primary-foreground flex items-center gap-2">
          <Shield className="h-5 w-5" />
          BPJS API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consId" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                Consumer ID
              </Label>
              <div className="relative">
                <Input
                  id="consId"
                  type={showConsId ? "text" : "password"}
                  value={formData.consId}
                  onChange={(e) => handleInputChange("consId", e.target.value)}
                  placeholder="Consumer ID"
                  required
                  className="transition-smooth focus:shadow-glow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConsId(!showConsId)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConsId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userKey" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                User Key
              </Label>
              <div className="relative">
                <Input
                  id="userKey"
                  type={showUserKey ? "text" : "password"}
                  value={formData.userKey}
                  onChange={(e) => handleInputChange("userKey", e.target.value)}
                  placeholder="User Key"
                  required
                  className="transition-smooth focus:shadow-glow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowUserKey(!showUserKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showUserKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretKey" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Secret Key
              </Label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showSecretKey ? "text" : "password"}
                  value={formData.secretKey}
                  onChange={(e) => handleInputChange("secretKey", e.target.value)}
                  placeholder="Secret Key"
                  required
                  className="transition-smooth focus:shadow-glow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="flex items-center gap-2">
                <User className="h-4 w-4 text-secondary" />
                Nomor Kartu
              </Label>
              <Input
                id="cardNumber"
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                placeholder="Nomor Kartu BPJS"
                required
                className="transition-smooth focus:shadow-glow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-secondary" />
                Tanggal Pelayanan
              </Label>
              <Input
                id="serviceDate"
                type="date"
                value={formData.serviceDate}
                onChange={(e) => handleInputChange("serviceDate", e.target.value)}
                required
                className="transition-smooth focus:shadow-glow"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
            disabled={loading}
          >
            {loading ? "Checking..." : "Cek Data Peserta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}