// pages/api/time.ts - Enhanced Time API with Fixed Async Handler
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
  debug?: {
    clientTime: number | null;
    serverLocalTime: string;
    timezoneAbbr: string | undefined;
    requestHeaders: {
      userAgent: string;
      clientTime: number | null;
    };
  };
}

interface ErrorResponse {
  error: string;
  success: false;
  timestamp: number;
  errorDetails?: {
    message: string;
    stack?: string[];
  };
}

// FIXED: Mark function as async
export default async function handler(
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

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
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
    const clientTime = req.headers['x-client-time'] ? parseInt(req.headers['x-client-time'] as string, 10) : null;
    
    // Simulate variable server processing time (real-world scenario)
    const processingDelay = Math.random() * 10; // 0-10ms random delay
    
    // FIXED: Now we can use await because function is async
    await new Promise(resolve => setTimeout(resolve, processingDelay));
    
    const serverTime = Date.now();
    const serverDate = new Date(serverTime);
    
    // Get timezone information safely
    let timezone: string;
    let utcOffset: number;
    
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      utcOffset = serverDate.getTimezoneOffset(); // in minutes (negative for UTC+)
    } catch (error) {
      // Fallback if Intl is not available
      timezone = 'UTC';
      utcOffset = 0;
      console.warn('Timezone detection failed, using UTC fallback:', error);
    }
    
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
      const userAgent = req.headers['user-agent'];
      const timezoneString = serverDate.toLocaleString('en', { timeZoneName: 'short' });
      const timezoneAbbr = timezoneString.split(' ').pop();
      
      response.debug = {
        clientTime: clientTime,
        serverLocalTime: serverDate.toLocaleString(),
        timezoneAbbr: timezoneAbbr,
        requestHeaders: {
          userAgent: userAgent ? userAgent.substring(0, 50) + '...' : 'Unknown',
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
      errorResponse.errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined
      };
    }

    return res.status(500).json(errorResponse);
  }
}

// Optional: Export type definitions for use in other files
export type { ServerTimeResponse, ErrorResponse };