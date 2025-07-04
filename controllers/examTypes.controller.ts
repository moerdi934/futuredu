// controllers/examTypes.controller.ts
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
    const { name, description, code, kind, master_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const examType = await examTypesModel.createExamType({
      name,
      description,
      code,
      kind,
      master_id,
      create_user_id: req.user?.id,
    });
    res.status(201).json(examType);
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Code must be unique' });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateExamType = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { name, description, code, kind, master_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const examType = await examTypesModel.updateExamType(req.query.id as string, {
      name,
      description,
      code,
      kind,
      master_id,
      edit_user_id: req.user?.id,
    });

    if (!examType) {
      return res.status(404).json({ error: 'Exam type not found' });
    }
    res.json(examType);
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
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
    res.status(500).json({ error: error.message });
  }
};

const searchExamTypes = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { search, kind, sortField, sortOrder, page, limit, masterId } = req.query;
    console.log(kind)
    if (kind === undefined) {               // ⬅️ cek “tidak ada” BUKAN falsy
      return res.status(400).json({ error: 'Kind parameter is requiredc' });
    }

    const kindNum = Number(kind);
    if (Number.isNaN(kindNum)) {
      return res.status(400).json({ error: 'Kind must be a number' });
    }
    const examTypes = await examTypesModel.searchExamTypes({
      search: search as string,
      kind: parseInt(kind as string),
      sortField: sortField as string,
      sortOrder: sortOrder as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      masterId: masterId as string
    });
    res.json(examTypes);
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
};