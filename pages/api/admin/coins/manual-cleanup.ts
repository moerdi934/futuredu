// pages/api/admin/coins/manual-cleanup.ts - Admin endpoint for manual cleanup
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../../lib/middleware/auth';
import CoinCleanupService from '../../../../lib/cron/coinCleanup';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }
    
    const cleanupService = CoinCleanupService.getInstance();
    const result = await cleanupService.triggerManualCleanup();
    
    res.json({
      success: result.success,
      message: result.message,
      data: {
        cleaned_count: result.cleanedCount
      }
    });
  } catch (error) {
    console.error('Manual cleanup API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}