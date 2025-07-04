// controllers/userExam.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { checkUserExam as checkUserExamModel } from '../models/userExam.model';
import { UserExamRequest, UserExamResponse, UserExamError } from '../models/userExam.model';

// Controller functions
const checkUserExam = async (
  req: NextApiRequest,
  res: NextApiResponse<UserExamResponse | UserExamError>
) => {
  const { userName, exam_string }: UserExamRequest = req.body;

  try {
    const exists = await checkUserExamModel(userName, exam_string);
    
    if (exists === null) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({ exists });
  } catch (error) {
    console.error('Error checking user exam:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export {
  checkUserExam,
};