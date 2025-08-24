// test/dummy/generate-dummy-exam-data.js
// Run this script with: node test/dummy/generate-dummy-exam-data.js (from project root)

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Load environment variables - try multiple paths to find .env file
const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  '.env'
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    if (fs.existsSync(envPath)) {
      require('dotenv').config({ path: envPath });
      console.log(`Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    // Continue to next path
  }
}

if (!envLoaded) {
  require('dotenv').config();
  console.log('Using default dotenv search...');
}

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Database configuration
const getCA = () => {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return process.env.DATABASE_CA_CERT;
  }
  
  try {
    if (fs.existsSync('./ca.pem')) {
      return fs.readFileSync('./ca.pem').toString();
    }
  } catch (error) {
    console.warn('ca.pem file not found, using SSL without custom CA');
  }
  
  return undefined;
};

const ca = getCA();
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: ca ? {
    ca: ca,
    rejectUnauthorized: false
  } : false
};

const pool = new Pool(config);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

// Generate random answer based on question type and correct answer
const generateRandomAnswer = (question, accuracyRate) => {
  const isCorrect = Math.random() < (accuracyRate / 100);
  
  if (isCorrect) {
    return question.correct_answer;
  }
  
  // Generate wrong answers based on question type
  switch (question.question_type) {
    case 'single-choice':
      if (question.options && question.options.length > 1) {
        const wrongOptions = question.options.filter(opt => opt !== question.correct_answer[0]);
        return [wrongOptions[Math.floor(Math.random() * wrongOptions.length)]];
      }
      return ['Wrong Answer'];
      
    case 'multiple-choice':
      if (question.options && question.options.length > 1) {
        // Generate 1-3 random wrong options
        const numWrong = Math.floor(Math.random() * 3) + 1;
        const wrongOptions = question.options.filter(opt => !question.correct_answer.includes(opt));
        const shuffled = wrongOptions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(numWrong, wrongOptions.length));
      }
      return ['Wrong Option 1', 'Wrong Option 2'];
      
    case 'true-false':
      // For true-false, flip some of the correct answers
      return question.correct_answer.map(answer => {
        return Math.random() < 0.5 ? answer : !answer;
      });
      
    case 'number':
      // Generate a number close to but different from correct answer
      const correctNum = parseFloat(question.correct_answer[0]);
      const variation = correctNum * 0.1 * (Math.random() - 0.5); // ±5% variation
      return [Math.round((correctNum + variation) * 100) / 100];
      
    case 'text':
      return ['Wrong text answer'];
      
    default:
      return ['Wrong answer'];
  }
};

// Generate random elapsed time (30-300 seconds)
const generateElapsedTime = () => {
  return Math.floor(Math.random() * 270) + 30; // 30-300 seconds
};

// Format answer for storage (matching your existing format function)
const formatAnswerForStorage = (userAnswer, questionType) => {
  if (userAnswer === null || userAnswer === undefined) {
    return null;
  }
  
  // Helper function to escape strings for PostgreSQL array format
  const escapeForArray = (str) => {
    if (typeof str !== 'string') return str;
    // Escape double quotes and backslashes
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  };
  
  if (Array.isArray(userAnswer)) {
    if (questionType === 'true-false') {
      const boolArray = userAnswer.map(val => val === true || val === 'true' ? 'true' : 'false');
      return `{${boolArray.join(',')}}`;
    }
    // For other arrays, properly quote and escape each element
    const escapedArray = userAnswer.map(item => `"${escapeForArray(String(item))}"`);
    return `{${escapedArray.join(',')}}`;
  }
  
  if (questionType === 'true-false') {
    const boolValue = userAnswer === true || userAnswer === 'true' ? 'true' : 'false';
    return `{${boolValue}}`;
  }
  
  if (['single-choice', 'multiple-choice', 'text'].includes(questionType)) {
    return `{"${escapeForArray(String(userAnswer))}"}`;
  }
  
  if (questionType === 'number') {
    return `{${Number(userAnswer)}}`;
  }
  
  return `{"${escapeForArray(String(userAnswer))}"}`;
};

// Check if answer is correct (matching your existing logic)
const isAnswerCorrect = (userAnswer, correctAnswer, questionType) => {
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }
  
  try {
    let parsedCorrectAnswer = correctAnswer;
    if (typeof correctAnswer === 'string' && correctAnswer.startsWith('{') && correctAnswer.endsWith('}')) {
      parsedCorrectAnswer = correctAnswer.slice(1, -1).split(',');
    }
    
    switch (questionType) {
      case 'single-choice':
        let correctSingleAnswer = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer[0] 
          : parsedCorrectAnswer;
        return String(userAnswer).trim() === String(correctSingleAnswer).trim();
        
      case 'multiple-choice':
        const userMultipleAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        let correctMultipleAnswers = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer 
          : [parsedCorrectAnswer];
          
        if (userMultipleAnswers.length !== correctMultipleAnswers.length) {
          return false;
        }
        
        const sortedUserAnswers = [...userMultipleAnswers].map(String).sort();
        const sortedCorrectAnswers = [...correctMultipleAnswers].map(String).sort();
        
        for (let i = 0; i < sortedUserAnswers.length; i++) {
          if (sortedUserAnswers[i].trim() !== sortedCorrectAnswers[i].trim()) {
            return false;
          }
        }
        return true;
        
      case 'true-false':
        const userTrueFalse = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        let correctTrueFalse = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer 
          : [parsedCorrectAnswer];
          
        correctTrueFalse = correctTrueFalse.map(val => {
          return val === 'true' || val === true;
        });
        
        if (userTrueFalse.length < correctTrueFalse.length) {
          return false;
        }
        
        for (let i = 0; i < correctTrueFalse.length; i++) {
          const userBool = userTrueFalse[i] === true || userTrueFalse[i] === 'true';
          const correctBool = correctTrueFalse[i];
          
          if (userBool !== correctBool) {
            return false;
          }
        }
        return true;
        
      case 'number':
        let correctNumber = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer[0] 
          : parsedCorrectAnswer;
        return Number(userAnswer) === Number(correctNumber);
        
      case 'text':
        let correctText = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer[0] 
          : parsedCorrectAnswer;
        return String(userAnswer).trim().toLowerCase() === 
               String(correctText).trim().toLowerCase();
        
      default:
        return String(userAnswer) === String(correctAnswer);
    }
  } catch (error) {
    console.error('Error comparing answers:', error);
    return false;
  }
};

// Get exam schedule data
const getExamScheduleData = async (examScheduleId) => {
  try {
    const query = `
      SELECT id, exam_id_list, name, start_time, end_time, is_auto_move
      FROM exam_schedule 
      WHERE id = $1
    `;
    const result = await pool.query(query, [examScheduleId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Exam schedule ${examScheduleId} not found`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting exam schedule:', error);
    throw error;
  }
};

// Get exam details
const getExamDetails = async (examIds) => {
  try {
    const query = `
      SELECT id, name, duration, question_id_list
      FROM exams 
      WHERE id = ANY($1::int[])
      ORDER BY id
    `;
    const result = await pool.query(query, [examIds]);
    return result.rows;
  } catch (error) {
    console.error('Error getting exam details:', error);
    throw error;
  }
};

// Get questions for exams
const getQuestionsForExams = async (examIds) => {
  try {
    const query = `
      SELECT DISTINCT q.id, q.question_type, q.correct_answer, q.options, q.level
      FROM exams e
      LEFT JOIN LATERAL unnest(e.question_id_list) AS question_id ON TRUE
      LEFT JOIN questions q ON q.id = question_id
      WHERE e.id = ANY($1::int[])
      AND q.id IS NOT NULL
      ORDER BY q.id
    `;
    const result = await pool.query(query, [examIds]);
    return result.rows;
  } catch (error) {
    console.error('Error getting questions:', error);
    throw error;
  }
};

// Generate dummy exam data
const generateDummyExamData = async () => {
  const examScheduleId = 54;
  const startUserId = 42;
  const endUserId = 141;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`Starting to generate dummy exam data for users ${startUserId}-${endUserId} in exam schedule ${examScheduleId}...`);
    
    // Get exam schedule data
    const examSchedule = await getExamScheduleData(examScheduleId);
    console.log(`Exam schedule: ${examSchedule.name}`);
    console.log(`Exams in schedule: ${examSchedule.exam_id_list}`);
    
    // Get exam details
    const exams = await getExamDetails(examSchedule.exam_id_list);
    console.log(`Found ${exams.length} exams`);
    
    // Get all questions
    const questions = await getQuestionsForExams(examSchedule.exam_id_list);
    console.log(`Found ${questions.length} total questions`);
    
    // Group questions by exam
    const questionsByExam = {};
    for (const exam of exams) {
      questionsByExam[exam.id] = questions.filter(q => 
        exam.question_id_list && exam.question_id_list.includes(q.id)
      );
    }
    
    // Define accuracy rates for different performance levels
    const accuracyLevels = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
    
    let totalProcessed = 0;
    const totalUsers = endUserId - startUserId + 1;
    
    // Process each user
    for (let userId = startUserId; userId <= endUserId; userId++) {
      console.log(`Processing user ${userId} (${totalProcessed + 1}/${totalUsers})`);
      
      // Assign random accuracy level
      const accuracyRate = accuracyLevels[Math.floor(Math.random() * accuracyLevels.length)];
      console.log(`  Accuracy rate: ${accuracyRate}%`);
      
      // Process each exam for this user
      for (const exam of exams) {
        const examQuestions = questionsByExam[exam.id] || [];
        
        if (examQuestions.length === 0) {
          console.log(`  Skipping exam ${exam.id} - no questions found`);
          continue;
        }
        
        console.log(`  Processing exam ${exam.id}: ${exam.name} (${examQuestions.length} questions)`);
        
        // Calculate session times
        const sessionStartTime = new Date(examSchedule.start_time || new Date());
        const sessionEndTime = new Date(sessionStartTime);
        sessionEndTime.setMinutes(sessionEndTime.getMinutes() + (exam.duration || 60));
        
        // Create exam session
        const sessionQuery = `
          INSERT INTO "tExamSession" 
          (exam_schedule_id, exam_id, user_id, start_time, end_time, answers, question_elapsed_times, is_submitted, last_save, is_auto_move, minute_exam)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `;
        
        const sessionResult = await client.query(sessionQuery, [
          examScheduleId,
          exam.id.toString(),
          userId,
          sessionStartTime,
          sessionEndTime,
          JSON.stringify({}),
          JSON.stringify({}),
          true, // Mark as submitted
          new Date(),
          examSchedule.is_auto_move || false,
          exam.duration || 60
        ]);
        
        const sessionId = sessionResult.rows[0].id;
        
        // Generate answers for each question
        const answers = {};
        const questionElapsedTimes = {};
        let correctCount = 0;
        
        for (const question of examQuestions) {
          const userAnswer = generateRandomAnswer(question, accuracyRate);
          const elapsedTime = generateElapsedTime();
          const isCorrect = isAnswerCorrect(userAnswer, question.correct_answer, question.question_type);
          
          if (isCorrect) correctCount++;
          
          // Store for session JSON
          answers[question.id] = userAnswer;
          questionElapsedTimes[question.id] = elapsedTime;
          
          // Insert into user_answers table
          const formattedAnswer = formatAnswerForStorage(userAnswer, question.question_type);
          
          const answerQuery = `
            INSERT INTO user_answers
            (exam_id, question_id, user_answer, user_id, is_correct, elapsed_time, answer_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          
          await client.query(answerQuery, [
            exam.id,
            question.id,
            formattedAnswer,
            userId,
            isCorrect,
            elapsedTime,
            new Date()
          ]);
        }
        
        // Update session with answers
        const updateSessionQuery = `
          UPDATE "tExamSession"
          SET answers = $1, question_elapsed_times = $2
          WHERE id = $3
        `;
        
        await client.query(updateSessionQuery, [
          JSON.stringify(answers),
          JSON.stringify(questionElapsedTimes),
          sessionId
        ]);
        
        // Calculate and save exam score
        const totalQuestions = examQuestions.length;
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        
        // Check if score already exists
        const existingScoreQuery = `
          SELECT id FROM user_exam_scores 
          WHERE user_id = $1 AND exam_id = $2 AND (exam_schedule_id = $3 OR (exam_schedule_id IS NULL AND $3 IS NULL))
        `;
        const existingScore = await client.query(existingScoreQuery, [userId, exam.id, examScheduleId]);
        
        let scoreQuery, scoreParams;
        if (existingScore.rows.length > 0) {
          // Update existing score
          scoreQuery = `
            UPDATE user_exam_scores
            SET score = $1, total_questions = $2, total_correct = $3, completion_time = NOW()
            WHERE user_id = $4 AND exam_id = $5 AND (exam_schedule_id = $6 OR (exam_schedule_id IS NULL AND $6 IS NULL))
          `;
          scoreParams = [score, totalQuestions, correctCount, userId, exam.id, examScheduleId];
        } else {
          // Insert new score
          scoreQuery = `
            INSERT INTO user_exam_scores
            (user_id, exam_id, score, total_questions, total_correct, exam_schedule_id)
            VALUES ($1, $2, $3, $4, $5, $6)
          `;
          scoreParams = [userId, exam.id, score, totalQuestions, correctCount, examScheduleId];
        }
        
        await client.query(scoreQuery, scoreParams);
        
        console.log(`    Score: ${score}% (${correctCount}/${totalQuestions} correct)`);
      }
      
      totalProcessed++;
      
      if (totalProcessed % 10 === 0) {
        console.log(`Progress: ${totalProcessed}/${totalUsers} users processed`);
      }
    }
    
    await client.query('COMMIT');
    console.log(`Successfully generated dummy exam data for ${totalUsers} users!`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating dummy exam data:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Verify generated data
const verifyGeneratedData = async () => {
  try {
    console.log('\nVerifying generated data...');
    
    // Count exam sessions
    const sessionCountQuery = `
      SELECT COUNT(*) as total
      FROM "tExamSession"
      WHERE exam_schedule_id = 54 AND user_id BETWEEN 42 AND 141
    `;
    const sessionCount = await pool.query(sessionCountQuery);
    console.log(`Total exam sessions created: ${sessionCount.rows[0].total}`);
    
    // Count user answers
    const answerCountQuery = `
      SELECT COUNT(*) as total
      FROM user_answers ua
      JOIN "tExamSession" ts ON ua.exam_id = ts.exam_id::int AND ua.user_id = ts.user_id
      WHERE ts.exam_schedule_id = 54 AND ua.user_id BETWEEN 42 AND 141
    `;
    const answerCount = await pool.query(answerCountQuery);
    console.log(`Total user answers created: ${answerCount.rows[0].total}`);
    
    // Count exam scores
    const scoreCountQuery = `
      SELECT COUNT(*) as total
      FROM user_exam_scores
      WHERE exam_schedule_id = 54 AND user_id BETWEEN 42 AND 141
    `;
    const scoreCount = await pool.query(scoreCountQuery);
    console.log(`Total exam scores created: ${scoreCount.rows[0].total}`);
    
    // Show score distribution
    const scoreDistQuery = `
      SELECT 
        CASE 
          WHEN score >= 90 THEN '90-100%'
          WHEN score >= 80 THEN '80-89%'
          WHEN score >= 70 THEN '70-79%'
          WHEN score >= 60 THEN '60-69%'
          WHEN score >= 50 THEN '50-59%'
          ELSE 'Below 50%'
        END as score_range,
        COUNT(*) as count
      FROM user_exam_scores
      WHERE exam_schedule_id = 54 AND user_id BETWEEN 42 AND 141
      GROUP BY score_range
      ORDER BY score_range DESC
    `;
    const scoreDist = await pool.query(scoreDistQuery);
    console.log('\nScore distribution:');
    scoreDist.rows.forEach(row => {
      console.log(`  ${row.score_range}: ${row.count} exams`);
    });
    
  } catch (error) {
    console.error('Error verifying data:', error);
  }
};

// Cleanup function
const cleanupDummyExamData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Cleaning up dummy exam data...');
    
    // Delete user answers
    const deleteAnswersQuery = `
      DELETE FROM user_answers
      WHERE user_id BETWEEN 42 AND 141
      AND exam_id IN (
        SELECT DISTINCT exam_id::int
        FROM "tExamSession"
        WHERE exam_schedule_id = 54
      )
    `;
    const answersResult = await client.query(deleteAnswersQuery);
    
    // Delete exam scores
    const deleteScoresQuery = `
      DELETE FROM user_exam_scores
      WHERE exam_schedule_id = 54 AND user_id BETWEEN 42 AND 141
    `;
    const scoresResult = await client.query(deleteScoresQuery);
    
    // Delete exam sessions
    const deleteSessionsQuery = `
      DELETE FROM "tExamSession"
      WHERE exam_schedule_id = 54 AND user_id BETWEEN 42 AND 141
    `;
    const sessionsResult = await client.query(deleteSessionsQuery);
    
    await client.query('COMMIT');
    
    console.log(`Deleted ${answersResult.rowCount} user answers`);
    console.log(`Deleted ${scoresResult.rowCount} exam scores`);
    console.log(`Deleted ${sessionsResult.rowCount} exam sessions`);
    console.log('Cleanup completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error cleaning up dummy exam data:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Main execution
const main = async () => {
  try {
    console.log('Dummy Exam Data Generator Script');
    console.log('================================');
    
    // Test database connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('Cannot proceed without database connection');
      process.exit(1);
    }
    
    // Check command line arguments
    const args = process.argv.slice(2);
    if (args.includes('--cleanup')) {
      await cleanupDummyExamData();
      return;
    }
    
    // Generate dummy exam data
    await generateDummyExamData();
    
    // Verify generated data
    await verifyGeneratedData();
    
    console.log('\nScript completed successfully!');
    console.log('\nGenerated exam data for:');
    console.log('- Users: 42 to 141 (100 users)');
    console.log('- Exam Schedule: 54');
    console.log('- Accuracy rates: 50% to 95% (randomly distributed)');
    console.log('\nTo cleanup this data later, run:');
    console.log('node test/dummy/generate-dummy-exam-data.js --cleanup');
    
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Export functions for use in other scripts
module.exports = {
  generateDummyExamData,
  cleanupDummyExamData,
  verifyGeneratedData
};

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}