// controllers/Sekolah.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getSekolahSD,
  getSekolahSMP,
  getSekolahSMA,
  getSekolahById,
  getSekolah,
  ApiResponse,
  SekolahSelectOption
} from '../models/Sekolah.model';

// Get SD schools - Return direct array for SearchSingleField compatibility
const getAllSekolahSD = async (
  req: NextApiRequest, 
  res: NextApiResponse<SekolahSelectOption[] | ApiResponse<SekolahSelectOption[]>>
) => {
  try {
    const searchName = (req.query.search as string) || null;
    const sekolah = await getSekolahSD(searchName);
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(sekolah);
  } catch (error: any) {
    console.error('Error in getAllSekolahSD:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch SD schools'
    });
  }
};

// Get SMP schools - Return direct array for SearchSingleField compatibility
const getAllSekolahSMP = async (
  req: NextApiRequest, 
  res: NextApiResponse<SekolahSelectOption[] | ApiResponse<SekolahSelectOption[]>>
) => {
  try {
    const searchName = (req.query.search as string) || null;
    const sekolah = await getSekolahSMP(searchName);
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(sekolah);
  } catch (error: any) {
    console.error('Error in getAllSekolahSMP:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch SMP schools'
    });
  }
};

// Get SMA schools - Return direct array for SearchSingleField compatibility
const getAllSekolahSMA = async (
  req: NextApiRequest, 
  res: NextApiResponse<SekolahSelectOption[] | ApiResponse<SekolahSelectOption[]>>
) => {
  try {
    const searchName = (req.query.search as string) || null;
    const sekolah = await getSekolahSMA(searchName);
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(sekolah);
  } catch (error: any) {
    console.error('Error in getAllSekolahSMA:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch SMA schools'
    });
  }
};

// Get sekolah by level (generic) - Return direct array for SearchSingleField compatibility
const getSekolahByLevel = async (
  req: NextApiRequest, 
  res: NextApiResponse<SekolahSelectOption[] | ApiResponse<SekolahSelectOption[]>>
) => {
  try {
    const level = req.query.level as string;
    const searchName = (req.query.search as string) || null;

    if (!level) {
      return res.status(400).json({
        status: 'error',
        message: 'Level parameter is required'
      });
    }

    // Validate level
    const validLevels = ['SD', 'SMP', 'SMA'];
    if (!validLevels.includes(level.toUpperCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid level. Must be SD, SMP, or SMA'
      });
    }

    const sekolah = await getSekolah({ 
      searchName, 
      level: level.toUpperCase() 
    });
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(sekolah);
  } catch (error: any) {
    console.error('Error in getSekolahByLevel:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch schools'
    });
  }
};

// Get sekolah details by ID - Keep wrapped response for this endpoint
const getSekolahDetails = async (
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<any>>
) => {
  try {
    const sekolahId = parseInt(req.query.sekolahId as string);

    if (isNaN(sekolahId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid sekolah ID'
      });
    }

    const sekolah = await getSekolahById(sekolahId);
    
    if (!sekolah) {
      return res.status(404).json({
        status: 'error',
        message: 'Sekolah not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: sekolah
    });
  } catch (error: any) {
    console.error('Error in getSekolahDetails:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch sekolah details'
    });
  }
};

export {
  getAllSekolahSD,
  getAllSekolahSMP,
  getAllSekolahSMA,
  getSekolahByLevel,
  getSekolahDetails
};