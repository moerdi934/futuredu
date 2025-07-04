// controllers/examOrder.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as examOrderModel from '../models/examOrder.model';
import { shuffleArray } from '../utils/ArrayRandomizer';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types
export interface GetExamOrderRequest {
  userName: string;
  scheduleId: number;
}

export interface GetExamOrderResponse {
  examOrder: examOrderModel.ExamDetails[];
}

export interface GetQuestionOrderResponse {
  question_orders: examOrderModel.QuestionOrderResult[];
}

export interface ErrorResponse {
  error: string;
}

// Get or create exam order for a user based on exam names
export const getExamOrder = async (req: NextApiRequest, res: NextApiResponse<GetExamOrderResponse | ErrorResponse>) => {
  const { userName, scheduleId }: GetExamOrderRequest = req.body;

  try {
    // Fetch exam_id_list from exam_schedule based on the provided scheduleId
    const examSchedule = await examOrderModel.getExamIdListFromSchedule(scheduleId);
     
    if (!examSchedule) {
      return res.status(404).json({ error: 'Exam schedule not found' });
    }

    const examIdList = examSchedule.exam_id_list; // Get array of exam IDs
    const is_need_order_exam = examSchedule.is_need_order_exam;
  
    // Fetch the corresponding exam names based on the exam IDs
    const examNames = await examOrderModel.getExamNamesByIds(examIdList);
    let examOrder: string[];

    if (is_need_order_exam) {
      // Only shuffle if ordering is needed
      // Check if exam order exists for the user
      const existingOrder = await examOrderModel.getExamOrderByUserName(userName, scheduleId);

      if (existingOrder) {
        // If exam order exists, use it
        examOrder = existingOrder.exam_order;
      } else {
        // Shuffle the exam names
        examOrder = shuffleArray(examNames);

        // Save the new shuffled exam order (by exam names) in the database
        await examOrderModel.createExamOrder(userName, examOrder, scheduleId);
      }
    } else {
      // If no ordering is needed, use the original order from exam_id_list
      examOrder = examNames;
    }

    // Get the details of the exams (exam_string, name, and duration) using the exam names
    const examDetails = await examOrderModel.getExamDetailsByNames(examOrder, scheduleId);
    
    // Return the exam details
    res.json({ examOrder: examDetails });
  } catch (error) {
    console.error('Error getting or creating exam order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getQuestionOrder = async (req: AuthenticatedRequest, res: NextApiResponse<GetQuestionOrderResponse | ErrorResponse>) => {
  const { schedule_id } = req.query;
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!schedule_id || typeof schedule_id !== 'string') {
    return res.status(400).json({ error: 'Invalid schedule_id parameter' });
  }

  const scheduleId = parseInt(schedule_id);

  try {
    // Dapatkan exam schedule
    const examSchedule = await examOrderModel.getExamSchedule(scheduleId);
    if (!examSchedule) {
      return res.status(404).json({ error: 'Exam schedule not found' });
    }

    const examIds = examSchedule.exam_id_list;
    const existingOrders = await examOrderModel.getExistingQuestionOrders(user_id, scheduleId, examIds);
    const existingOrderMap = new Map(existingOrders.map(order => [order.exam_id, order]));

    const results: examOrderModel.QuestionOrderResult[] = [];
    const operations: Promise<any>[] = [];

    for (const examId of examIds) {
      const exam = await examOrderModel.getExamDetails(examId);
      if (!exam) continue;

      const currentQuestionIds = exam.question_id_list;
      const currentExamString = exam.exam_string;
      const existingOrder = existingOrderMap.get(examId);

      // Case 1: Tidak ada order yang tersimpan
      if (!existingOrder) {
        const newOrder = exam.is_need_order_question 
          ? shuffleArray([...currentQuestionIds]) 
          : currentQuestionIds;
        
        operations.push(
          examOrderModel.createQuestionOrder(user_id, examId, scheduleId, newOrder)
        );
        results.push({ exam_id: examId, question_id_list: newOrder });
        continue;
      }

      // Case 2: Ada order tapi perlu divalidasi
      const existingQuestionIds = new Set(existingOrder.question_id_list);
      const currentIdsSet = new Set(currentQuestionIds);

      // Periksa kesesuaian daftar soal
      const isMatch = 
        existingQuestionIds.size === currentIdsSet.size &&
        [...existingQuestionIds].every(id => currentIdsSet.has(id));

      if (isMatch) {
        results.push({ 
          exam_id: examId, 
          question_id_list: existingOrder.question_id_list, 
          exam_string: currentExamString
        });
      } else {
        // Perbarui order jika ada perubahan soal
        const updatedOrder = exam.is_need_order_question
          ? shuffleArray([...currentQuestionIds])
          : currentQuestionIds;
        
        operations.push(
          examOrderModel.updateQuestionOrder(existingOrder.id, updatedOrder)
        );
        results.push({ exam_id: examId, question_id_list: updatedOrder, exam_string: currentExamString });
      }
    }

    // Eksekusi semua operasi database sekaligus
    await Promise.all(operations);
    
    res.json({ question_orders: results });
  } catch (error) {
    console.error('Error in getQuestionOrder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};