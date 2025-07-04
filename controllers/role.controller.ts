// controllers/role.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { searchRoles } from '../models/role.model';
import { RoleSearchParams, RoleSearchResponse } from '../models/role.model';

// Types untuk API Response
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  roles?: T;
}

/**
 * Controller untuk mencari role berdasarkan nama.
 * Endpoint: POST /api/roles/search
 */
export const searchRolesController = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
): Promise<void> => {
  const { searchTerm }: RoleSearchParams = req.body;

  if (!searchTerm || typeof searchTerm !== 'string') {
    return res.status(400).json({ 
      message: 'searchTerm is required and must be a string.' 
    });
  }

  try {
    const roles = await searchRoles(searchTerm);
    console.log(roles);
    return res.status(200).json({ roles });
  } catch (error) {
    console.error('Error searching roles:', error);
    return res.status(500).json({ 
      message: 'Internal server error.' 
    });
  }
};