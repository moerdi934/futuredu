// pages/api/users/search/[role].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT } from '../../../../lib/middleware/auth';
import { searchUsersByRoleAndName } from '../../../../models/user.model';

interface SearchUsersQuery {
  role: string;
  search?: string;
  limit?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== Search Users API Route Debug ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);

  if (req.method !== 'GET') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ 
      message: `Method not allowed. Method sekarang adalah ${req.method}`,
      allowedMethods: ['GET']
    });
  }

  try {
    // Apply JWT authentication middleware
    console.log('Applying JWT authentication...');
    await new Promise<void>((resolve, reject) => {
      authenticateJWT(req as AuthenticatedRequest, res, (error?: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    console.log('Authentication successful, processing request...');
    
    const { role, search = '', limit = '50' } = req.query as SearchUsersQuery;

    // Validate role parameter
    const validRoles = ['student', 'teacher', 'admin'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Validate limit parameter
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({ 
        message: 'Limit must be a number between 1 and 100' 
      });
    }

    console.log(`Searching users with role: ${role}, search: ${search}, limit: ${parsedLimit}`);

    // Search users
    const users = await searchUsersByRoleAndName(
      role.toLowerCase(),
      search.toString(),
      parsedLimit
    );

    console.log(`Found ${users.length} users`);

    // Transform to SelectOption format expected by frontend
    const selectOptions = users.map(user => ({
      label: user.name,
      value: user.userid
    }));

    res.status(200).json(selectOptions);
  } catch (error: any) {
    console.error('Search users error:', error);
    
    // Handle authentication errors specifically
    if (error.message === 'Unauthorized' || error.status === 401) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}