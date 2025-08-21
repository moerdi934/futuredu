// controllers/Location.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getProvinces,
  getCitiesByProvince,
  getDistrictsByCity,
  getVillagesByDistrict,
  getLocationById,
  ApiResponse,
  LocationSelectOption
} from '../models/location.model';

// Get all provinces - Return direct array for SearchSingleField compatibility
const getAllProvinces = async (
  req: NextApiRequest, 
  res: NextApiResponse<LocationSelectOption[] | ApiResponse<LocationSelectOption[]>>
) => {
  try {
    const searchName = (req.query.search as string) || null;
    const provinces = await getProvinces(searchName);
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(provinces);
  } catch (error: any) {
    console.error('Error in getAllProvinces:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch provinces'
    });
  }
};

// Get cities by province ID - Return direct array for SearchSingleField compatibility
const getCitiesByProvinceId = async (
  req: NextApiRequest, 
  res: NextApiResponse<LocationSelectOption[] | ApiResponse<LocationSelectOption[]>>
) => {
  try {
    const provinceId = parseInt(req.query.provinceId as string);
    const searchName = (req.query.search as string) || null;

    if (isNaN(provinceId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid province ID'
      });
    }

    const cities = await getCitiesByProvince(provinceId, searchName);
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(cities);
  } catch (error: any) {
    console.error('Error in getCitiesByProvinceId:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch cities'
    });
  }
};

// Get districts by city ID - Return direct array for SearchSingleField compatibility
const getDistrictsByCityId = async (
  req: NextApiRequest, 
  res: NextApiResponse<LocationSelectOption[] | ApiResponse<LocationSelectOption[]>>
) => {
  try {
    const cityId = parseInt(req.query.cityId as string);
    const searchName = (req.query.search as string) || null;

    if (isNaN(cityId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid city ID'
      });
    }

    const districts = await getDistrictsByCity(cityId, searchName);
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(districts);
  } catch (error: any) {
    console.error('Error in getDistrictsByCityId:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch districts'
    });
  }
};

// Get villages by district ID - Return direct array for SearchSingleField compatibility
const getVillagesByDistrictId = async (
  req: NextApiRequest, 
  res: NextApiResponse<LocationSelectOption[] | ApiResponse<LocationSelectOption[]>>
) => {
  try {
    const districtId = parseInt(req.query.districtId as string);
    const searchName = (req.query.search as string) || null;

    if (isNaN(districtId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid district ID'
      });
    }

    const villages = await getVillagesByDistrict(districtId, searchName);
    
    // Return direct array for SearchSingleField compatibility
    res.status(200).json(villages);
  } catch (error: any) {
    console.error('Error in getVillagesByDistrictId:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch villages'
    });
  }
};

// Get location details by ID - Keep wrapped response for this endpoint
const getLocationDetails = async (
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<any>>
) => {
  try {
    const locationId = parseInt(req.query.locationId as string);

    if (isNaN(locationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid location ID'
      });
    }

    const location = await getLocationById(locationId);
    
    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: location
    });
  } catch (error: any) {
    console.error('Error in getLocationDetails:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch location details'
    });
  }
};

export {
  getAllProvinces,
  getCitiesByProvinceId,
  getDistrictsByCityId,
  getVillagesByDistrictId,
  getLocationDetails
};