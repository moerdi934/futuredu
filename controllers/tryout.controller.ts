// controllers/tryout.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import TryOut, { Test, Subject } from '../models/tryout.model';

// Types for responses
export interface TestDetailsResponse {
  test: Test;
  subjects: Subject[];
}

export interface ErrorResponse {
  error: string;
}

export interface TryOutControllerInterface {
  getTestDetails: (req: NextApiRequest, res: NextApiResponse<TestDetailsResponse | ErrorResponse>) => Promise<void>;
}

// Controller function to get test details and subjects
const getTestDetails = async (
  req: NextApiRequest, 
  res: NextApiResponse<TestDetailsResponse | ErrorResponse>
): Promise<void> => {
  const { testName } = req.query; // Extract testName from request query parameters
  
  // Validate testName parameter
  if (!testName || typeof testName !== 'string') {
    return res.status(400).json({ error: 'Test name is required and must be a string' });
  }

  try {
    // Fetch test details using the model function
    const test = await TryOut.getTestByName(testName);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Fetch subjects for the test
    const subjects = await TryOut.getSubjectsByTestId(test.id);

    // Send the test and subjects as a response
    res.status(200).json({ test, subjects });
  } catch (error) {
    // Log and handle errors appropriately
    console.error('Error fetching test data:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const TryOutController: TryOutControllerInterface = {
  getTestDetails,
};

export default TryOutController;