import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, MapPin, Phone, Heart, AlertTriangle } from "lucide-react";

interface ParticipantData {
  response?: {
    peserta?: {
      noKartu?: string;
      nama?: string;
      nik?: string;
      noKK?: string;
      tglLahir?: string;
      jenisKelamin?: string;
      alamat?: string;
      noTelp?: string;
      email?: string;
      golDarah?: string;
      pisa?: string;
      provUmum?: {
        kdProvider?: string;
        nmProvider?: string;
      };
      jenisPeserta?: {
        kode?: string;
        keterangan?: string;
      };
      hakKelas?: {
        kode?: string;
        keterangan?: string;
      };
      statusPeserta?: {
        kode?: string;
        keterangan?: string;
      };
    };
  };
  metaData?: {
    code?: string;
    message?: string;
  };
}

interface ApiResponseDisplayProps {
  data?: ParticipantData;
  error?: string;
  loading: boolean;
}

export default function ApiResponseDisplay({ data, error, loading }: ApiResponseDisplayProps) {
  if (loading) {
    return (
      <Card className="shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Data Peserta BPJS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse-glow rounded-full bg-primary/20 p-6">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-center text-muted-foreground">Mengambil data peserta...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-elegant animate-fade-in border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium mb-2">Terjadi kesalahan</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.response?.peserta) {
    return (
      <Card className="shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Data Peserta BPJS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada data peserta</p>
              <p className="text-sm">Silakan masukkan nomor kartu dan cek data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { peserta } = data.response;
  const { metaData } = data;

  return (
    <Card className="shadow-elegant animate-fade-in">
      <CardHeader className="bg-gradient-subtle rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Data Peserta BPJS
          </CardTitle>
          {metaData?.code && (
            <Badge 
              variant={metaData.code === "200" ? "outline" : "destructive"}
              className={metaData.code === "200" ? "bg-success/10 text-success border-success/20" : ""}
            >
              {metaData.code} - {metaData.message}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informasi Pribadi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nama</label>
                <p className="font-medium">{peserta.nama || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">No. Kartu</label>
                <p className="font-mono">{peserta.noKartu || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">NIK</label>
                <p className="font-mono">{peserta.nik || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">No. KK</label>
                <p className="font-mono">{peserta.noKK || "-"}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Tanggal Lahir
                </label>
                <p>{peserta.tglLahir || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jenis Kelamin</label>
                <p>{peserta.jenisKelamin || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Golongan Darah
                </label>
                <p>{peserta.golDarah || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  No. Telepon
                </label>
                <p>{peserta.noTelp || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Address */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Alamat
          </h3>
          <p className="text-sm bg-muted/50 p-3 rounded-lg">{peserta.alamat || "-"}</p>
        </div>

        <Separator />

        {/* BPJS Information */}
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Informasi BPJS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jenis Peserta</label>
                <p>{peserta.jenisPeserta?.keterangan || "-"} ({peserta.jenisPeserta?.kode || "-"})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hak Kelas</label>
                <p>{peserta.hakKelas?.keterangan || "-"} ({peserta.hakKelas?.kode || "-"})</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status Peserta</label>
                <div className="flex items-center gap-2">
                  <p>{peserta.statusPeserta?.keterangan || "-"}</p>
                  {peserta.statusPeserta?.kode && (
                    <Badge variant="outline" className="text-xs">
                      {peserta.statusPeserta.kode}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Provider</label>
                <p className="text-sm">{peserta.provUmum?.nmProvider || "-"}</p>
                {peserta.provUmum?.kdProvider && (
                  <p className="text-xs text-muted-foreground font-mono">Kode: {peserta.provUmum.kdProvider}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}