import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BpjsRequest {
  cardNumber: string;
  serviceDate: string;
  consId?: string;
  userKey?: string;
  secretKey?: string;
  testEndpoint?: string;
}

// Generate HMAC SHA256 signature
async function generateSignature(data: string, timestamp: string, secretKey: string): Promise<string> {
  const message = `${data}&${timestamp}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = new Uint8Array(signature);
  const base64String = btoa(String.fromCharCode(...signatureArray));
  
  return base64String;
}

// Generate timestamp
function generateTimestamp(): string {
  const now = new Date();
  const epoch = new Date('1970-01-01T00:00:00Z');
  const timestamp = Math.floor((now.getTime() - epoch.getTime()) / 1000);
  return timestamp.toString();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const { cardNumber, serviceDate, consId, userKey, secretKey, testEndpoint }: BpjsRequest = await req.json();

    // Use provided credentials or fallback to environment variables
    const finalConsId = consId || Deno.env.get('BPJS_CONS_ID');
    const finalUserKey = userKey || Deno.env.get('BPJS_USER_KEY');
    const finalSecretKey = secretKey || Deno.env.get('BPJS_SECRET_KEY');

    if (!finalConsId || !finalUserKey || !finalSecretKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing BPJS credentials. Please provide consId, userKey, and secretKey.' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!cardNumber || !serviceDate) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: cardNumber and serviceDate' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate BPJS headers
    const timestamp = generateTimestamp();
    const signature = await generateSignature(finalConsId, timestamp, finalSecretKey);
    
    const bpjsHeaders = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-cons-id': finalConsId,
      'X-timestamp': timestamp,
      'X-signature': signature,
      'user_key': finalUserKey
    };

    // Build BPJS endpoint based on testEndpoint
    const baseUrl = 'https://apijkn.bpjs-kesehatan.go.id';
    const serviceName = 'vclaim-rest';
    
    // Define endpoint mappings
    const endpointMap: { [key: string]: string } = {
      'peserta': `/Peserta/nokartu/${cardNumber}/tglSEP/${serviceDate}`,
      'poli': '/referensi/poli',
      'dokter': '/referensi/dokter/1', // Default type 1
      'status-pulang': '/referensi/statuspulang',
      'diagnosa': '/referensi/diagnosa/A00', // Default keyword
      'obat': '/referensi/obat/paracetamol', // Default keyword
      'riwayat': `/Peserta/${cardNumber}/history`,
      'rujukan': `/Rujukan/${cardNumber}`
    };
    
    // Use specific endpoint or default to peserta
    const apiPath = testEndpoint && endpointMap[testEndpoint] 
      ? endpointMap[testEndpoint] 
      : endpointMap['peserta'];
    
    const endpoint = `${baseUrl}/${serviceName}${apiPath}`;

    console.log(`Making BPJS API call to: ${endpoint}`);

    // Make API call to BPJS
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: bpjsHeaders,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('BPJS API Error:', responseData);
      return new Response(
        JSON.stringify({ 
          error: `BPJS API Error: ${response.status} ${response.statusText}`,
          details: responseData
        }), 
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('BPJS API Success:', responseData);

    return new Response(
      JSON.stringify(responseData), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
