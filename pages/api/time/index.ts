// pages/api/time/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface ServerTimeResponse {
  serverTime: number;
  iso: string;
  timezone: string;
  success: boolean;
}

interface ErrorResponse {
  error: string;
  success: false;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServerTimeResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed. Only GET requests are supported.',
      success: false
    });
  }

  try {
    const serverTime = Date.now();
    const serverDate = new Date(serverTime);
    
    // Get server timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return res.status(200).json({
      serverTime: serverTime,
      iso: serverDate.toISOString(),
      timezone: timezone,
      success: true
    });

  } catch (error) {
    console.error('Server time API error:', error);
    
    return res.status(500).json({
      error: 'Internal server error while getting server time',
      success: false
    });
  }
}