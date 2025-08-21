// Updated controllers/UserTarget.controller.ts with JWT authentication

import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import {
  getExamScoreMapping,
  getFormasi,
  getProdiWithUniversity,
  saveUserTarget,
  getUserTarget,
  getUserTargetWithDetails,
  deleteUserTarget,
  ApiResponse,
  ExamScoreMapping,
  FormasiSelectOption,
  ProdiSelectOption,
  UserTarget,
  UserTargetInput,
  getUniversityForUjianMandiri
} from '../models/UserTarget.model';

// Get exam score mapping by jenis_seleksi (public endpoint)
const getExamScoreMappingController = async (
  req: NextApiRequest,
  res: NextApiResponse<ExamScoreMapping[] | ApiResponse<ExamScoreMapping[]>>
) => {
  try {
    const jenisSeleksi = req.query.jenisSeleksi as string;
    const subJenisSeleksi = req.query.subJenisSeleksi as string;

    if (!jenisSeleksi) {
      return res.status(400).json({
        status: 'error',
        message: 'Jenis seleksi is required'
      });
    }

    // For Ujian Mandiri, sub_jenis_seleksi is required
    if (jenisSeleksi === 'Ujian Mandiri' && !subJenisSeleksi) {
      return res.status(400).json({
        status: 'error',
        message: 'Sub jenis seleksi is required for Ujian Mandiri'
      });
    }

    const mappings = await getExamScoreMapping(jenisSeleksi, subJenisSeleksi);
    res.status(200).json(mappings);
  } catch (error: any) {
    console.error('Error in getExamScoreMappingController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch exam score mapping'
    });
  }
};

// Get formasi by jenis_seleksi (public endpoint)
const getFormasiController = async (
  req: NextApiRequest,
  res: NextApiResponse<FormasiSelectOption[] | ApiResponse<FormasiSelectOption[]>>
) => {
  try {
    const jenisSeleksi = req.query.jenisSeleksi as string;
    const searchName = req.query.search as string;

    if (!jenisSeleksi) {
      return res.status(400).json({
        status: 'error',
        message: 'Jenis seleksi is required'
      });
    }

    const formasi = await getFormasi(jenisSeleksi, searchName);
    res.status(200).json(formasi);
  } catch (error: any) {
    console.error('Error in getFormasiController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch formasi'
    });
  }
};

// Get prodi with university details (public endpoint)
const getProdiWithUniversityController = async (
  req: NextApiRequest,
  res: NextApiResponse<ProdiSelectOption[] | ApiResponse<ProdiSelectOption[]>>
) => {
  try {
    const searchName = req.query.search as string;
    const jenisSeleksi = req.query.jenisSeleksi as string;

    const prodi = await getProdiWithUniversity(searchName, jenisSeleksi);
    res.status(200).json(prodi);
  } catch (error: any) {
    console.error('Error in getProdiWithUniversityController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch prodi with university'
    });
  }
};

// Save or update user target (authenticated endpoint)
const saveUserTargetController = async (
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<UserTarget>>
) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed'
      });
    }

    // Get user ID from JWT token
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    const data: Omit<UserTargetInput, 'user_id'> = req.body;

    // Add user ID from JWT token
    const targetData: UserTargetInput = {
      ...data,
      user_id: userId
    };

    // Validate required fields
    if (!targetData.jenis_seleksi) {
      return res.status(400).json({
        status: 'error',
        message: 'Jenis seleksi is required'
      });
    }

    // Validate score values (must be positive if provided)
    const scoreFields = ['score_1', 'score_2', 'score_3', 'score_4', 'score_5', 'score_6', 'score_7'];
    for (const field of scoreFields) {
      const value = targetData[field as keyof UserTargetInput] as number;
      if (value !== undefined && value !== null && value < 0) {
        return res.status(400).json({
          status: 'error',
          message: `${field} must be a positive number`
        });
      }
    }

    const result = await saveUserTarget(targetData);

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'User target saved successfully'
    });
  } catch (error: any) {
    console.error('Error in saveUserTargetController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to save user target'
    });
  }
};

// Get user target by authenticated user ID and jenis_seleksi
const getUserTargetController = async (
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>
) => {
  try {
    // Get user ID from JWT token
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    const jenisSeleksi = req.query.jenisSeleksi as string;

    if (!jenisSeleksi) {
      return res.status(400).json({
        status: 'error',
        message: 'Jenis seleksi is required'
      });
    }

    const includeDetails = req.query.includeDetails === 'true';

    let result;
    if (includeDetails) {
      result = await getUserTargetWithDetails(userId, jenisSeleksi);
    } else {
      result = await getUserTarget(userId, jenisSeleksi);
    }

    // Return empty structure if no target found instead of 404
    if (!result) {
      const emptyTarget = {
        user_id: userId,
        jenis_seleksi: jenisSeleksi,
        notes: '',
        prodi_id_list: [],
        formasi_id_list: [],
        score_1: null,
        score_2: null,
        score_3: null,
        score_4: null,
        score_5: null,
        score_6: null,
        score_7: null,
        prodi_details: [],
        formasi_details: []
      };

      return res.status(200).json({
        status: 'success',
        data: emptyTarget
      });
    }

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    console.error('Error in getUserTargetController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch user target'
    });
  }
};

// Delete user target (authenticated endpoint)
const deleteUserTargetController = async (
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>
) => {
  try {
    if (req.method !== 'DELETE') {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed'
      });
    }

    // Get user ID from JWT token
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    const jenisSeleksi = req.query.jenisSeleksi as string;

    if (!jenisSeleksi) {
      return res.status(400).json({
        status: 'error',
        message: 'Jenis seleksi is required'
      });
    }

    const deleted = await deleteUserTarget(userId, jenisSeleksi);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'User target not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User target deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in deleteUserTargetController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete user target'
    });
  }
};

const getUjianMandiriUniversityController = async (
  req: NextApiRequest,
  res: NextApiResponse<{university_id: number | null; university_name?: string} | ApiResponse<any>>
) => {
  try {
    const subJenisSeleksi = req.query.subJenisSeleksi as string;

    if (!subJenisSeleksi) {
      return res.status(400).json({
        status: 'error',
        message: 'Sub jenis seleksi is required'
      });
    }

    const universityData = await getUniversityForUjianMandiri(subJenisSeleksi);
    
    if (universityData) {
      res.status(200).json({ 
        university_id: universityData.university_id,
        university_name: universityData.university_name
      });
    } else {
      res.status(200).json({ university_id: null });
    }
  } catch (error: any) {
    console.error('Error in getUjianMandiriUniversityController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch university for ujian mandiri'
    });
  }
};
export {
  getExamScoreMappingController,
  getFormasiController,
  getProdiWithUniversityController,
  saveUserTargetController,
  getUserTargetController,
  deleteUserTargetController,
  getUjianMandiriUniversityController 
};