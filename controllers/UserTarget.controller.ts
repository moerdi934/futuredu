// controllers/UserTarget.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import {
  getProductTypes,
  getExamScoreMapping,
  getFormasi,
  getProdiWithUniversity,
  saveUserTarget,
  getUserTarget,
  getUserTargetWithDetails,
  deleteUserTarget,
  getUniversityForProductType,
  ApiResponse,
  ProductType,
  ExamScoreMapping,
  FormasiSelectOption,
  ProdiSelectOption,
  UserTarget,
  UserTargetInput,
} from '../models/UserTarget.model';

// Get all product types for dropdown (public endpoint)
export const getProductTypesController = async (
  req: NextApiRequest,
  res: NextApiResponse<ProductType[] | ApiResponse<ProductType[]>>
) => {
  try {
    const productTypes = await getProductTypes();
    res.status(200).json(productTypes);
  } catch (error: any) {
    console.error('Error in getProductTypesController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch product types'
    });
  }
};

// Get exam score mapping by product_type_id (public endpoint)
export const getExamScoreMappingController = async (
  req: NextApiRequest,
  res: NextApiResponse<ExamScoreMapping[] | ApiResponse<ExamScoreMapping[]>>
) => {
  try {
    const productTypeId = parseInt(req.query.productTypeId as string);

    if (!productTypeId || isNaN(productTypeId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Product type ID is required and must be a valid number'
      });
    }

    const mappings = await getExamScoreMapping(productTypeId);
    res.status(200).json(mappings);
  } catch (error: any) {
    console.error('Error in getExamScoreMappingController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch exam score mapping'
    });
  }
};

// Get formasi by product_type_id (public endpoint)
export const getFormasiController = async (
  req: NextApiRequest,
  res: NextApiResponse<FormasiSelectOption[] | ApiResponse<FormasiSelectOption[]>>
) => {
  try {
    const productTypeId = parseInt(req.query.productTypeId as string);
    const searchName = req.query.search as string;

    if (!productTypeId || isNaN(productTypeId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Product type ID is required and must be a valid number'
      });
    }

    const formasi = await getFormasi(productTypeId, searchName);
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
export const getProdiWithUniversityController = async (
  req: NextApiRequest,
  res: NextApiResponse<ProdiSelectOption[] | ApiResponse<ProdiSelectOption[]>>
) => {
  try {
    const searchName = req.query.search as string;
    const productTypeId = req.query.productTypeId ? parseInt(req.query.productTypeId as string) : undefined;

    const prodi = await getProdiWithUniversity(searchName, productTypeId);
    res.status(200).json(prodi);
  } catch (error: any) {
    console.error('Error in getProdiWithUniversityController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch prodi with university'
    });
  }
};

// Get university for product type (public endpoint)
export const getUniversityForProductTypeController = async (
  req: NextApiRequest,
  res: NextApiResponse<{university_id: number | null; university_name?: string} | ApiResponse<any>>
) => {
  try {
    const productTypeId = parseInt(req.query.productTypeId as string);

    if (!productTypeId || isNaN(productTypeId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Product type ID is required and must be a valid number'
      });
    }

    const universityData = await getUniversityForProductType(productTypeId);
    
    if (universityData) {
      res.status(200).json({ 
        university_id: universityData.university_id,
        university_name: universityData.university_name
      });
    } else {
      res.status(200).json({ university_id: null });
    }
  } catch (error: any) {
    console.error('Error in getUniversityForProductTypeController:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch university for product type'
    });
  }
};

// Save or update user target (authenticated endpoint)
export const saveUserTargetController = async (
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
    if (!targetData.product_type_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Product type ID is required'
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

// Get user target by authenticated user ID and product_type_id
export const getUserTargetController = async (
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

    const productTypeId = parseInt(req.query.productTypeId as string);

    if (!productTypeId || isNaN(productTypeId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Product type ID is required and must be a valid number'
      });
    }

    const includeDetails = req.query.includeDetails === 'true';

    let result;
    if (includeDetails) {
      result = await getUserTargetWithDetails(userId, productTypeId);
    } else {
      result = await getUserTarget(userId, productTypeId);
    }

    // Return empty structure if no target found
    if (!result) {
      const emptyTarget = {
        user_id: userId,
        product_type_id: productTypeId,
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
export const deleteUserTargetController = async (
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

    const productTypeId = parseInt(req.query.productTypeId as string);

    if (!productTypeId || isNaN(productTypeId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Product type ID is required and must be a valid number'
      });
    }

    const deleted = await deleteUserTarget(userId, productTypeId);

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