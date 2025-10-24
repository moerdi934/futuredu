// pages/api/admin/coins/cleanup-status.ts - Admin endpoint for cleanup monitoring
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../../lib/middleware/auth';
import CoinCleanupService from '../../../../lib/cron/coinCleanup';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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
    
    const [history, statistics] = await Promise.all([
      cleanupService.getCleanupHistory(10),
      cleanupService.getCoinStatistics()
    ]);

    const status = {
      is_running: cleanupService.isCleanupRunning(),
      next_cleanup: cleanupService.getNextCleanupTime(),
      recent_history: history,
      coin_statistics: statistics
    };

    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Cleanup status API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}