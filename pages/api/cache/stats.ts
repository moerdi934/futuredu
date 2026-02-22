// pages/api/cache/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as cache from '../../../lib/cache';

/**
 * Get cache statistics
 * GET /api/cache/stats
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = cache.getStats();
    const allKeys = cache.keys();
    
    // Group keys by prefix
    const keysByPrefix: Record<string, string[]> = {};
    allKeys.forEach(key => {
      const prefix = key.split(':')[0];
      if (!keysByPrefix[prefix]) {
        keysByPrefix[prefix] = [];
      }
      keysByPrefix[prefix].push(key);
    });

    return res.status(200).json({
      success: true,
      stats: {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits > 0 ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%' : '0%',
        ksize: stats.ksize,
        vsize: stats.vsize,
      },
      keysByPrefix,
      totalKeys: allKeys.length,
      allKeys: allKeys.sort(),
    });
  } catch (error: any) {
    console.error('[Cache Stats] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to get cache stats',
      details: error.message 
    });
  }
}
