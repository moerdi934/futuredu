// pages/api/time.ts - FIXED VERSION WITH PROPER TIMEZONE HANDLING
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
    timezoneCalculation: {
      serverUtcOffset: number;
      serverLocalTime: string;
      utcTime: string;
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
    await new Promise(resolve => setTimeout(resolve, processingDelay));
    
    // CRITICAL FIX: Always use UTC time for consistency
    const serverTime = Date.now(); // This is always UTC timestamp
    const utcDate = new Date(serverTime);
    
    // FIXED: Get server's UTC offset correctly
    // getTimezoneOffset() returns offset in minutes, negative for UTC+ timezones
    const serverUtcOffsetMinutes = utcDate.getTimezoneOffset();
    
    // CRITICAL: Don't include timezone offset in the main serverTime
    // serverTime should always be UTC timestamp for consistency
    
    let timezone: string;
    
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      timezone = 'UTC';
      console.warn('Timezone detection failed, using UTC fallback:', error);
    }
    
    const responseTime = Date.now();
    const processingTime = responseTime - requestStartTime;
    
    // Calculate approximate server load (simulation)
    const serverLoad = Math.min(100, Math.max(0, Math.random() * 15 + processingTime * 2));

    const response: ServerTimeResponse = {
      // CRITICAL: serverTime is always UTC timestamp
      serverTime: serverTime,
      requestTime: requestStartTime,
      responseTime: responseTime,
      iso: utcDate.toISOString(),
      timezone: timezone,
      // FIXED: Return UTC offset in minutes (standard format)
      utcOffset: serverUtcOffsetMinutes,
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
      const timezoneString = utcDate.toLocaleString('en', { timeZoneName: 'short' });
      const timezoneAbbr = timezoneString.split(' ').pop();
      
      response.debug = {
        clientTime: clientTime,
        serverLocalTime: utcDate.toLocaleString(),
        timezoneAbbr: timezoneAbbr,
        requestHeaders: {
          userAgent: userAgent ? userAgent.substring(0, 50) + '...' : 'Unknown',
          clientTime: clientTime
        },
        timezoneCalculation: {
          serverUtcOffset: serverUtcOffsetMinutes,
          serverLocalTime: new Date(serverTime - (serverUtcOffsetMinutes * 60 * 1000)).toISOString(),
          utcTime: utcDate.toISOString()
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

export type { ServerTimeResponse, ErrorResponse };