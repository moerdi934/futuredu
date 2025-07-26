// pages/api/time.ts - Enhanced Time API with Better Error Handling
import type { NextApiRequest, NextApiResponse } from 'next';

interface ServerTimeResponse {
  serverTime: number;
  requestTime: number;
  responseTime: number;
  iso: string;
  timezone: string;
  utcOffset: number;
  success: boolean;
  networkInfo: {
    requestId: string;
    processingTime: number;
    serverLoad: number;
  };
}

interface ErrorResponse {
  error: string;
  success: false;
  timestamp?: number;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServerTimeResponse | ErrorResponse>
) {
  // Add CORS headers for better compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-request-id, x-client-time, Cache-Control, Pragma');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed - only GET requests are supported',
      success: false,
      timestamp: Date.now()
    });
  }

  try {
    const requestStartTime = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || `req_${requestStartTime}_${Math.random().toString(36).substring(2)}`;
    const clientTime = req.headers['x-client-time'] ? parseInt(req.headers['x-client-time'] as string) : null;
    
    // Simulate variable server processing time (real-world scenario)
    const processingDelay = Math.random() * 10; // 0-10ms random delay
    await new Promise(resolve => setTimeout(resolve, processingDelay));
    
    const serverTime = Date.now();
    const serverDate = new Date(serverTime);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcOffset = serverDate.getTimezoneOffset(); // in minutes (negative for UTC+)
    
    const responseTime = Date.now();
    const processingTime = responseTime - requestStartTime;
    
    // Calculate approximate server load (simulation)
    const serverLoad = Math.min(100, Math.max(0, Math.random() * 15 + processingTime * 2));

    const response: ServerTimeResponse = {
      serverTime: serverTime,
      requestTime: requestStartTime,
      responseTime: responseTime,
      iso: serverDate.toISOString(),
      timezone: timezone,
      utcOffset: utcOffset,
      success: true,
      networkInfo: {
        requestId: requestId,
        processingTime: Math.round(processingTime * 100) / 100,
        serverLoad: Math.round(serverLoad * 100) / 100
      }
    };

    // Add debug info if in development
    if (process.env.NODE_ENV === 'development') {
      (response as any).debug = {
        clientTime: clientTime,
        serverLocalTime: serverDate.toLocaleString(),
        timezoneAbbr: serverDate.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop(),
        requestHeaders: {
          userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
          clientTime: clientTime
        }
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Server time API error:', error);
    
    const errorResponse: ErrorResponse = {
      error: 'Internal server error occurred while fetching time',
      success: false,
      timestamp: Date.now()
    };

    // Add error details in development
    if (process.env.NODE_ENV === 'development') {
      (errorResponse as any).errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined
      };
    }

    return res.status(500).json(errorResponse);
  }
}