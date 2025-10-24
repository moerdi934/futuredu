// controllers/examTypes.controller.ts - Updated
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import * as examTypesModel from '../models/examTypes.model';

const getAllExamTypes = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { sortField, sortOrder, page, limit } = req.query;
    const examTypes = await examTypesModel.getAllExamTypes({
      sortField: sortField as string,
      sortOrder: sortOrder as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    });
    res.json(examTypes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const getExamTypeById = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const examType = await examTypesModel.getExamTypeById(req.query.id as string);
    if (!examType) {
      return res.status(404).json({ error: 'Exam type not found' });
    }
    res.json(examType);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const createExamType = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { name, description, code, kind, master_id, mix_master_id, grade } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (kind === undefined) {
      return res.status(400).json({ error: 'Kind is required' });
    }

    const examType = await examTypesModel.createExamType({
      name,
      description,
      code,
      kind: parseInt(kind),
      master_id,
      mix_master_id,
      grade,
      create_user_id: req.user?.id,
    });
    res.status(201).json(examType);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Code must be unique' });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateExamType = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { name, description, code, kind, master_id, mix_master_id, grade } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const examType = await examTypesModel.updateExamType(req.query.id as string, {
      name,
      description,
      code,
      kind: kind !== undefined ? parseInt(kind) : undefined,
      master_id,
      mix_master_id,
      grade,
      edit_user_id: req.user?.id,
    });

    if (!examType) {
      return res.status(404).json({ error: 'Exam type not found' });
    }
    res.json(examType);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Code must be unique' });
    }
    res.status(500).json({ error: error.message });
  }
};

const deleteExamType = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const examType = await examTypesModel.deleteExamType(req.query.id as string);
    if (!examType) {
      return res.status(404).json({ error: 'Exam type not found' });
    }
    res.json({ message: 'Exam type deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('being used')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const searchExamTypes = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { search, kind, sortField, sortOrder, page, limit, masterId, grade } = req.query;
    
    const examTypes = await examTypesModel.searchExamTypes({
      search: search as string,
      kind: kind !== undefined ? parseInt(kind as string) : undefined,
      sortField: sortField as string,
      sortOrder: sortOrder as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      masterId: masterId as string,
      grade: grade !== undefined ? parseInt(grade as string) : undefined
    });
    res.json(examTypes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const getPagedExamTypes = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { search, kind, sortField, sortOrder, page, limit, masterId, grade } = req.query;
    
    // Parse kind - support both single (1) and comma-separated (1,2,3)
    let kinds: number[] | undefined;
    if (kind) {
      const kindString = kind as string;
      if (kindString.includes(',')) {
        // Multiple kinds: "1,2,3"
        kinds = kindString.split(',').map(k => parseInt(k.trim())).filter(k => !isNaN(k));
      } else {
        // Single kind: "1"
        const parsed = parseInt(kindString);
        kinds = isNaN(parsed) ? undefined : [parsed];
      }
    }
    
    // Parse sort parameter if it comes as "field:order,field2:order2"
    let parsedSortField = sortField as string;
    let parsedSortOrder = sortOrder as string;
    
    // If sort parameter exists in different format
    const sortParam = req.query.sort as string;
    if (sortParam) {
      // Parse "kind:asc,name:asc" format
      const sortParts = sortParam.split(',')[0].split(':'); // Take first sort
      if (sortParts.length === 2) {
        parsedSortField = sortParts[0];
        parsedSortOrder = sortParts[1];
      }
    }
    
    const result = await examTypesModel.getPagedExamTypes({
      search: search as string,
      kinds: kinds, // Pass array instead of single kind
      sortField: parsedSortField,
      sortOrder: parsedSortOrder,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      masterId: masterId as string,
      grade: grade !== undefined ? parseInt(grade as string) : undefined
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const getKindOptions = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { kind } = req.query;
    if (kind === undefined) {
      return res.status(400).json({ error: 'Kind parameter is required' });
    }
    
    const options = await examTypesModel.getKindOptions(parseInt(kind as string));
    res.json(options);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllExamTypes,
  getExamTypeById,
  createExamType,
  updateExamType,
  deleteExamType,
  searchExamTypes,
  getPagedExamTypes,
  getKindOptions
};