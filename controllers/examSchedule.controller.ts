// controllers/examSchedule.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as examScheduleModel from '../models/examSchedule.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Parse comma-separated multiple values
const parseMultipleValues = (value: string | string[]): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(',').map(v => v.trim()).filter(v => v);
};

// Parse sort parameter (format: "key:direction,key2:direction")
const parseSortParam = (sortParam: string) => {
  if (!sortParam) return { sortKey: 'es.id', sortOrder: 'asc' };
  
  const sorts = sortParam.split(',');
  const firstSort = sorts[0].split(':');
  
  return {
    sortKey: firstSort[0] || 'es.id',
    sortOrder: firstSort[1] || 'asc'
  };
};

// Get exam schedules with comprehensive filters, sorting, and pagination
export const getExamSchedules = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Parse pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Parse global search
    const search = (req.query.search as string) || '';
    
    // Parse filters
    const exam_type = (req.query.exam_type as string) || 'All';
    const group_product = (req.query.group_product as string) || 'All';
    const series = (req.query.series as string) || 'All';
    const isfree = (req.query.isfree as string) || 'All';
    const is_valid = (req.query.is_valid as string) || 'All';
    
    // Parse date filters
    const start_time = (req.query.start_time as string) || null;
    const end_time = (req.query.end_time as string) || null;
    
    // Parse multiple creator filters
    const schedule_creator = parseMultipleValues(req.query.schedule_creator as string);
    const exam_creator = parseMultipleValues(req.query.exam_creator as string);
    
    // Parse name filter (for direct name searching)
    const schedule_name = (req.query.schedule_name as string) || '';
    
    // Parse sort parameter
    const { sortKey, sortOrder } = parseSortParam(req.query.sort as string);
    
    // Parse user filter
    const userId = (req.query.userId as string) || null;

    // Build filters object
    const filters = {
      page,
      limit,
      search,
      schedule_name,
      exam_type,
      group_product,
      series,
      isfree,
      is_valid,
      start_time,
      end_time,
      schedule_creator,
      exam_creator,
      sortKey,
      sortOrder,
      userId,
    };

    console.log('Controller filters:', filters);

    const result = await examScheduleModel.getExamSchedules(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching exam schedules:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const searchExamSchedules = async (req: NextApiRequest, res: NextApiResponse) => {
  const { 
    search = '', 
    limit = '10', 
    userId = null 
  } = req.query;
  
  console.log(req.query);
  try {
    const schedules = await examScheduleModel.searchExamSchedules(
      search as string, 
      parseInt(limit as string, 10), 
      userId as string
    );
    res.status(200).json({ data: schedules });
  } catch (error) {
    console.error('Error searching exam schedules:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const searchExamSchedulesByExamType = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search, exam_type } = req.query;
    const examSchedules = await examScheduleModel.searchExamScheduleByExamType(
      search as string, 
      exam_type as string
    );
    
    return res.status(200).json({
      success: true,
      data: examSchedules,
      message: 'Exam schedules retrieved successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all valid exam schedules (is_valid = true)
export const getValidExamSchedules = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const schedules = await examScheduleModel.getValidExamSchedules();
    res.status(200).json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get exam schedule by ID
export const getExamScheduleById = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  try {
    const schedule = await examScheduleModel.getExamScheduleById(id as string);
    if (!schedule) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get exam schedules by exam type
export const getExamSchedulesByType = async (req: NextApiRequest, res: NextApiResponse) => {
  const { examtype } = req.query;
  try {
    const schedules = await examScheduleModel.getExamSchedulesByType(examtype as string);
    if (!schedules.length) {
      return res.status(404).json({ message: `No schedules found for exam type: ${examtype}` });
    }
    res.status(200).json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new exam schedule
export const createExamSchedule = async (req: NextApiRequest, res: NextApiResponse) => {
  const { 
    name, 
    description, 
    exam_id_list, 
    start_time, 
    end_time, 
    isfree, 
    is_valid, 
    created_by, 
    exam_type, 
    is_auto_move, 
    is_need_order_exam, 
    is_need_weighted_score 
  } = req.body;
  
  try {
    const newSchedule = await examScheduleModel.createExamSchedule(
      name, 
      description, 
      exam_id_list, 
      start_time, 
      end_time, 
      isfree, 
      is_valid, 
      created_by, 
      exam_type,
      is_auto_move, 
      is_need_order_exam, 
      is_need_weighted_score
    );
    res.status(201).json(newSchedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing exam schedule
export const updateExamSchedule = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { 
    name, 
    description, 
    exam_id_list, 
    start_time, 
    end_time, 
    is_valid, 
    updated_by, 
    exam_type 
  } = req.body;
  
  try {
    const updatedSchedule = await examScheduleModel.updateExamSchedule(
      id as string, 
      name, 
      description, 
      exam_id_list, 
      start_time, 
      end_time, 
      is_valid, 
      updated_by, 
      exam_type
    );
    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    res.status(200).json(updatedSchedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an exam schedule
export const deleteExamSchedule = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  try {
    const deletedSchedule = await examScheduleModel.deleteExamSchedule(id as string);
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    res.status(200).json({ message: 'Exam schedule deleted', schedule: deletedSchedule });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchExamTypeController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    let { search } = req.query;
    
    if (!search) {
      search = '';
    }

    const examTypes = await examScheduleModel.getExamScheduleTypes(search as string);
    
    res.status(200).json({
      examTypes: examTypes.map(row => ({ exam_type: row.exam_type }))
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
};

export const checkExamAccess = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const userId = req.user?.id;
  const { examId } = req.body;
  try {
    const access = await examScheduleModel.checkAccess(userId!, examId);

    if (access.accessGranted) {
      return res.status(200).json({ message: 'Access granted to the exam' });
    } else {
      return res.status(403).json({ message: 'Access denied. Purchase required.' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// New endpoints for form dropdowns
export const getExamTypesController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search = '' } = req.query;
    const examTypes = await examScheduleModel.getExamTypes(search as string);
    
    res.status(200).json(examTypes.map(item => ({
      value: item.exam_type,
      label: item.exam_type
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSeriesController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search = '' } = req.query;
    const series = await examScheduleModel.getSeries(search as string);
    
    res.status(200).json(series.map(item => ({
      value: item.series,
      label: item.series
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getScheduleCreatorsController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search = '' } = req.query;
    const creators = await examScheduleModel.getScheduleCreators(search as string);
    
    res.status(200).json(creators.map(item => ({
      value: item.id,
      label: item.name
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getExamCreatorsController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search = '' } = req.query;
    const creators = await examScheduleModel.getExamCreators(search as string);
    
    res.status(200).json(creators.map(item => ({
      value: item.id,
      label: item.name
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};