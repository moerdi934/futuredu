// pages/api/cache/clear.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as cache from '../../../lib/cache';

/**
 * Clear cache
 * POST /api/cache/clear
 * 
 * Body (optional):
 * { pattern: "questions:*" } - Clear specific pattern
 * {} - Clear all cache
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pattern } = req.body || {};

    if (pattern) {
      // Clear specific pattern
      const deletedCount = cache.delPattern(pattern);
      return res.status(200).json({
        success: true,
        message: `Cleared ${deletedCount} cache keys matching pattern: ${pattern}`,
        deletedCount,
        pattern,
      });
    } else {
      // Clear all cache
      cache.flush();
      return res.status(200).json({
        success: true,
        message: 'All cache cleared',
      });
    }
  } catch (error: any) {
    console.error('[Cache Clear] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to clear cache',
      details: error.message 
    });
  }
}
