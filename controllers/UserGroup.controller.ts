// controllers/UserGroup.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getGroups } from '../models/UserGroup.model';
import { ApiResponse, UserGroup } from '../models/UserGroup.model';

const getAllGroups = async (req: NextApiRequest, res: NextApiResponse<ApiResponse<UserGroup[]>>) => {
  try {
    const searchName = (req.query.name as string) || null;
    const groups = await getGroups(searchName);
    
    res.status(200).json({
      status: 'success',
      data: groups
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export {
  getAllGroups
};