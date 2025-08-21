// controllers/University.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getUniversities,
  getUniversityById,
  getProdiByUniversity,
  getProdiById,
  ApiResponse,
  UniversitySelectOption,
  ProdiSelectOption
} from '../models/University.model';

// Get all universities - Return direct array for SearchSingleField compatibility
const getAllUniversities = async (
  req: NextApiRequest, 
  res: NextApiResponse<UniversitySelectOption[] | ApiResponse<UniversitySelectOption[]>>
) => {
  try {
    const searchName = (req.query.search as string) || null;
    const jenisPt = (req.query.jenis_pt as string) || null;
    
    const universities = await getUniversities({ 
      searchName,
      jenisPt
    });
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(universities);
  } catch (error: any) {
    console.error('Error in getAllUniversities:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch universities'
    });
  }
};

// Get prodi by university ID - Updated with separate params
const getProdiByUniversityId = async (
  req: NextApiRequest, 
  res: NextApiResponse<ProdiSelectOption[] | ApiResponse<ProdiSelectOption[]>>
) => {
  try {
    const universityId = parseInt(req.query.universityId as string);
    
    // Handle search parameter
    let searchName: string | null = null;
    if (req.query.search && typeof req.query.search === 'string' && req.query.search.trim() !== '') {
      searchName = req.query.search.trim();
    }
    
    // Handle jenjang parameter separately
    let jenjangProdi: string | null = null;
    if (req.query.jenjang && typeof req.query.jenjang === 'string' && req.query.jenjang.trim() !== '') {
      jenjangProdi = req.query.jenjang.trim();
    }

    // Validate university ID
    if (isNaN(universityId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid university ID'
      });
    }

    console.log('API Query Params:', { 
      universityId, 
      searchName: searchName || 'null', 
      jenjangProdi: jenjangProdi || 'null' 
    });

    const prodi = await getProdiByUniversity({ 
      universityId, 
      searchName, 
      jenjangProdi 
    });
    
    console.log(`Found ${prodi.length} prodi records`);
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(prodi);
  } catch (error: any) {
    console.error('Error in getProdiByUniversityId:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch prodi'
    });
  }
};

// Get university details by ID - Keep wrapped response for this endpoint
const getUniversityDetails = async (
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<any>>
) => {
  try {
    const universityId = parseInt(req.query.universityId as string);

    if (isNaN(universityId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid university ID'
      });
    }

    const university = await getUniversityById(universityId);
    
    if (!university) {
      return res.status(404).json({
        status: 'error',
        message: 'University not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: university
    });
  } catch (error: any) {
    console.error('Error in getUniversityDetails:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch university details'
    });
  }
};

// Get prodi details by ID - Keep wrapped response for this endpoint
const getProdiDetails = async (
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<any>>
) => {
  try {
    const prodiId = parseInt(req.query.prodiId as string);

    if (isNaN(prodiId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid prodi ID'
      });
    }

    const prodi = await getProdiById(prodiId);
    
    if (!prodi) {
      return res.status(404).json({
        status: 'error',
        message: 'Prodi not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: prodi
    });
  } catch (error: any) {
    console.error('Error in getProdiDetails:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch prodi details'
    });
  }
};

export {
  getAllUniversities,
  getProdiByUniversityId,
  getUniversityDetails,
  getProdiDetails
};