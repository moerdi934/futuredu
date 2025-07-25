// pages/api/time/index.ts - IMPROVED VERSION
import type { NextApiRequest, NextApiResponse } from 'next';

interface ServerTimeResponse {
  serverTime: number;
  requestTime: number;        // NEW: When request was received
  responseTime: number;       // NEW: When response is sent
  timezone: string;
  utcOffset: number;         // NEW: Server UTC offset in minutes
  success: boolean;
  networkInfo: {             // NEW: Network timing info
    requestId: string;
    processingTime: number;
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServerTimeResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      success: false
    });
  }

  try {
    const requestTime = Date.now();
    const requestId = req.headers['x-request-id'] || Date.now().toString();
    
    // Simulate some processing
    const processingStart = Date.now();
    
    const serverTime = Date.now();
    const serverDate = new Date(serverTime);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcOffset = serverDate.getTimezoneOffset(); // in minutes
    
    const responseTime = Date.now();
    const processingTime = responseTime - processingStart;

    return res.status(200).json({
      serverTime: serverTime,
      requestTime: requestTime,
      responseTime: responseTime,
      iso: serverDate.toISOString(),
      timezone: timezone,
      utcOffset: utcOffset,
      success: true,
      networkInfo: {
        requestId: requestId,
        processingTime: processingTime
      }
    });

  } catch (error) {
    console.error('Server time API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      success: false
    });
  }
}