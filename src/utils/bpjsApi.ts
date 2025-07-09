// BPJS API utilities for signature generation and API calls

interface BpjsCredentials {
  consId: string;
  userKey: string;
  secretKey: string;
}

interface BpjsRequest {
  cardNumber: string;
  serviceDate: string;
}

// Generate HMAC SHA256 signature as per BPJS documentation
async function generateSignature(data: string, timestamp: string, secretKey: string): Promise<string> {
  const message = `${data}&${timestamp}`;
  
  // Using Web Crypto API to generate HMAC SHA256
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

// Generate timestamp as per BPJS documentation
function generateTimestamp(): string {
  const now = new Date();
  const epoch = new Date('1970-01-01T00:00:00Z');
  const timestamp = Math.floor((now.getTime() - epoch.getTime()) / 1000);
  return timestamp.toString();
}

// Generate required headers for BPJS API
export async function generateBpjsHeaders(credentials: BpjsCredentials): Promise<Record<string, string>> {
  const timestamp = generateTimestamp();
  const signature = await generateSignature(credentials.consId, timestamp, credentials.secretKey);
  
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'X-cons-id': credentials.consId,
    'X-timestamp': timestamp,
    'X-signature': signature,
    'user_key': credentials.userKey
  };
}

// Construct BPJS API endpoint URL
export function buildBpjsEndpoint(request: BpjsRequest): string {
  const baseUrl = 'https://apijkn.bpjs-kesehatan.go.id';
  const serviceName = 'vclaim-rest';
  return `${baseUrl}/${serviceName}/Peserta/nokartu/${request.cardNumber}/tglSEP/${request.serviceDate}`;
}

// Make API call to BPJS
export async function callBpjsApi(
  credentials: BpjsCredentials, 
  request: BpjsRequest
): Promise<any> {
  const endpoint = buildBpjsEndpoint(request);
  const headers = await generateBpjsHeaders(credentials);
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
    mode: 'cors', // This might cause CORS issues in browser
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
