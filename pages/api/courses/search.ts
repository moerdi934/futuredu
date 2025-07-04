// pages/api/courses/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as courseController from '../../../controllers/course.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return courseController.searchAllCourses(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}