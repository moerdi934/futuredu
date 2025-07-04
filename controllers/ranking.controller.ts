// controllers/ranking.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import {
  getPagedRankingsBySchedule,
  getUserCenteredRankings,
  getUserExamScheduleRankings,
  RankingFilters,
  UserCenteredFilters,
  UserExamRankingFilters
} from '../models/ranking.model';

// Types
export interface RankingResponse {
  success: boolean;
  data?: any[];
  total?: number;
  totalPages?: number;
  currentPage?: number;
  userRanking?: any;
  message?: string;
}

export const getPagedRankings = async (
  req: AuthenticatedRequest,
  res: NextApiResponse<RankingResponse>
) => {
  const { examScheduleId } = req.query;
  
  const filters: RankingFilters = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 50,
    search: (req.query.search as string) || '',
    kota: (req.query.kota as string) || null,
    provinsi: (req.query.provinsi as string) || null,
    sekolah: (req.query.sekolah as string) || null,
    sortKey: (req.query.sortKey as string) || 'rank',
    sortOrder: (req.query.sortOrder as string) || 'asc'
  };

  try {
    const result = await getPagedRankingsBySchedule(parseInt(examScheduleId as string), filters);
    if (result.data.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No rankings found for this exam schedule' 
      });
    }
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getUserCenteredRankings = async (
  req: AuthenticatedRequest,
  res: NextApiResponse<RankingResponse>
) => {
  const { examScheduleId } = req.query;
  const userId = req.user?.id; // Get user ID from authenticated request
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  const filters: UserCenteredFilters = {
    limit: parseInt(req.query.limit as string) || 10,
    page: req.query.page ? parseInt(req.query.page as string) : undefined, // If page is undefined, we'll calculate it based on user rank
    search: (req.query.search as string) || '',
    kota: (req.query.kota as string) || null,
    provinsi: (req.query.provinsi as string) || null,
    sekolah: (req.query.sekolah as string) || null,
    sortKey: (req.query.sortKey as string) || 'rank',
    sortOrder: (req.query.sortOrder as string) || 'asc'
  };
  
  try {
    const result = await getUserCenteredRankings(
      parseInt(examScheduleId as string), 
      parseInt(userId), 
      filters
    );
    if (!result) {
      return res.status(404).json({ 
        success: false,
        message: 'No rankings or user data found for this exam schedule' 
      });
    }
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getUserExamRankings = async (
  req: AuthenticatedRequest,
  res: NextApiResponse<RankingResponse>
) => {
  // Get the user ID from the request object (assuming authentication middleware sets this)
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  // Get filters from query parameters
  const filters: UserExamRankingFilters = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 50,
    search: (req.query.search as string) || '',
    examType: (req.query.exam_type as string) || null,
    sortKey: (req.query.sortKey as string) || 'exam_schedule_name',
    sortOrder: (req.query.sortOrder as string) || 'asc'
  };

  try {
    const result = await getUserExamScheduleRankings(parseInt(userId), filters);
    
    if (result.data.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No exam rankings found for this user' 
      });
    }
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error in getUserExamRankings:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};