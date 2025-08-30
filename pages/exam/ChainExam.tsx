'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import SingleChoice from './SingleChoice';
import MultipleChoice from './MultipleChoice';
import NumberInput from './NumberInput';
import TextInput from './TextInput';
import TrueFalse from './TrueFalse';
import ExamNotAccessibleModal from '../try-out/ExamNotAccessibleModal';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { Container, Row, Col, ProgressBar, Card, Button, Modal, Alert, Toast } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Clock, Loader2, Check, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';
import examDbService from '../../utils/ExamDBService';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  statements?: string[];
}

interface Answers {
  [key: number]: any;
}

interface ExamOrder {
  exam_string: string;
  name: string;
  exam_id?: number;
  examType: string;
}

interface ExamSession {
  id: number;
  exam_id: string | number;
  start_time: string;
  end_time: string;
  answers: Answers;
  name: string;
  is_auto_move: boolean;
  question_elapsed_times?: Record<number, number>;
}

const ChainExam: React.FC = () => {
  const params = useParams();
  const exam_string = params?.exam_string as string;
  
  const [examId, setExamId] = useState<number | null>(null);
  const [examScheduleId, setExamScheduleId] = useState<string | null>(null);
  const [examName, setExamName] = useState<string | null>(null);
  const [examType, setExamType] = useState<string>('Try-Out');
  const router = useRouter();
  const { username } = useAuth();

  // Get data from context
  const {
    topicId: selectedTopicId,
    examScheduleId: contextExamScheduleId,
    examOrder: contextExamOrder,
    examSessions: contextExamSessions,
    activeSession: contextActiveSession,
    selectedSchedule: contextSelectedSchedule,
    examType: contextExamType,
    originPath: contextOriginPath,
    clearExamData
  } = useExam();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [showModalNext, setShowModalNext] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [nextExam, setNextExam] = useState<string | null>(null);
  const [showCheckpointToast, setShowCheckpointToast] = useState<boolean>(false);
  const [autoSaving, setAutoSaving] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [isExamAccessible, setIsExamAccessible] = useState<boolean>(true);
  const [showNotAccessibleModal, setShowNotAccessibleModal] = useState(false);
  const [examStartTime, setExamStartTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [lastServerSync, setLastServerSync] = useState<number>(0);

  // Origin path from context instead of localStorage
  const originPath = contextOriginPath || '/';

  const timerRef = useRef<NodeJS.Timeout>();
  const lastTickRef = useRef<number>(Date.now());
  const autoSaveRef = useRef<NodeJS.Timeout>();
  const timerSyncRef = useRef<NodeJS.Timeout>();

  // Use context data instead of localStorage
  const examOrder = contextExamOrder || [];
  const currentExamIndex = examOrder.findIndex((exam: ExamOrder) => exam.exam_string === exam_string);
  
  // Check if this is the last exam
  const isLastExam = currentExamIndex === examOrder.length - 1;
  
  useEffect(() => {
    // Set data from context
    if (contextExamScheduleId) {
      setExamScheduleId(contextExamScheduleId.toString());
    }
    
    if (contextExamType) {
      setExamType(contextExamType);
    }
  }, [contextExamScheduleId, contextExamType]);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      if (exam_string) {
        examDbService.updateQuestionElapsedTime(exam_string, questions[currentQuestion].id);
      }
    }
  }, [loading, questions, currentQuestion, exam_string]);

  // Add question timer logging effect
  useEffect(() => {
    if (!loading && questions.length > 0) {
      const logQuestionTimer = async () => {
        const currentQuestionId = questions[currentQuestion].id;
        const elapsedTimes = await examDbService.getQuestionElapsedTimes(exam_string);
        
        console.log('📋 QUESTION TIMER STATUS');
        console.log('Active Question ID:', currentQuestionId);
        console.log('Active Question Number:', currentQuestion + 1);
        console.log('Question Elapsed Times:', elapsedTimes);
        console.log('Current Question Time (seconds):', elapsedTimes[currentQuestionId] || 0);
        console.log('---');
      };

      const timer = setInterval(logQuestionTimer, 5000); // Log every 5 seconds
      
      return () => clearInterval(timer);
    }
  }, [loading, questions, currentQuestion, exam_string]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      if (timerSyncRef.current) clearInterval(timerSyncRef.current);
      
      if (exam_string && questions.length > 0) {
        examDbService.finalizeCurrentQuestionTime(exam_string);
      }
    };
  }, [exam_string, questions]);

  useEffect(() => {
    if (!isExamAccessible && examStartTime) {
      const timer = setInterval(() => {
        const now = new Date();
        const startTime = new Date(examStartTime);
        const diff = startTime.getTime() - now.getTime();
        
        if (diff <= 0) {
          clearInterval(timer);
          handleRetryAccess();
          return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isExamAccessible, examStartTime]);

  const decryptData = (encryptedData: string) => {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encryptionKeyString = process.env.NEXT_PUBLIC_EXAM_ENCRYPTION_KEY;
    
    if (!encryptionKeyString) {
      console.error('Encryption key not found in environment variables');
      throw new Error('Encryption configuration error');
    }
    
    let key;
    if (encryptionKeyString.length >= 32) {
      key = CryptoJS.enc.Utf8.parse(encryptionKeyString.substring(0, 32));
    } else {
      const paddedKey = encryptionKeyString.padEnd(32, '0');
      key = CryptoJS.enc.Utf8.parse(paddedKey);
    }
    
    const decryptParams = {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    };
    
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encrypted,
        key,
        decryptParams
      );
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  };

  const findLatestUnfinishedExam = useCallback(async () => {
    if (!exam_string && examOrder.length > 0) {
      setLoading(true);
      
      for (let i = examOrder.length - 1; i >= 0; i--) {
        const hasData = await examDbService.hasExamData(examOrder[i].exam_string);
        if (hasData) {
          router.push(`/exam/${examOrder[i].exam_string}`);
          return true;
        }
      }
      setLoading(false);
    }
    return false;
  }, [examOrder, exam_string, router]);

  const fetchQuestions = async () => {
    try {
      const currentExam = examOrder.find((exam) => exam.exam_string === exam_string);
      
      if (currentExam && currentExam.exam_id) {
        setExamId(currentExam.exam_id);
      }

      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(
        `${apiUrl}/questions/byExamString?exam_string=${exam_string}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
  
      const decryptedData = decryptData(response.data.encryptedData);
      const parsedData = JSON.parse(decryptedData);
      
      const examDurationInMinutes = parsedData.duration;
      setQuestions(parsedData.questions);
      setDuration(examDurationInMinutes);
      
      await loadExistingSession(currentExam?.exam_id);
      setLoading(false);
      setError(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(true);
      setLoading(false);
    }
  };
  
  const handleSubmit = useCallback((e?: React.FormEvent, skipConfirmation = false) => {
    if (e) e.preventDefault();
    
    if (isTimeExpired || skipConfirmation) {
      directSubmit();
    } else {
      setShowConfirmationModal(true);
    }
  }, [isTimeExpired]);

  const directSubmit = useCallback(() => {
    // For the last exam, there's no next exam
    if (isLastExam) {
      setNextExam(null);
    } else {
      const nextExamIndex = currentExamIndex + 1;
      setNextExam(examOrder[nextExamIndex]?.name || null);
    }
    
    setShowConfirmationModal(false);
    setShowModalNext(true);
  }, [currentExamIndex, examOrder, isLastExam]);

  const confirmSubmit = useCallback(() => {
    setShowConfirmationModal(false);
    directSubmit();
  }, [directSubmit]);

  useEffect(() => {
    if (exam_string && contextExamOrder.length > 0) {
      const currentExam = contextExamOrder.find((exam: ExamOrder) => exam.exam_string === exam_string);
      if (currentExam && currentExam.exam_id) {
        setExamId(currentExam.exam_id);
      }
      
      if (contextExamScheduleId) {
        setExamScheduleId(contextExamScheduleId.toString());
      }
    }
  }, [exam_string, contextExamOrder, contextExamScheduleId]);

  useEffect(() => {
    const initializeExam = async () => {
      setIsInitializing(true);
      
      if (!exam_string) {
        await findLatestUnfinishedExam();
      } else {
        await fetchQuestions();
      }
      
      setIsInitializing(false);
    };
    
    initializeExam();
  }, []);

  useEffect(() => {
    if (exam_string && !isInitializing) {
      setLoading(true);
      setQuestions([]);
      setDuration(0);
      setTimeLeft(0);
      setAnswers({});
      setError(false);
      setSubmitError(false);
      setCurrentQuestion(0);
      setShowModalNext(false);
      setShowConfirmationModal(false);
      setExamSession(null);
      setIsTimeExpired(false);
      
      const currentExam = examOrder.find((exam) => exam.exam_string === exam_string);
      
      if (currentExam && currentExam.exam_id) {
        setExamId(currentExam.exam_id);
      }
      
      if (contextExamScheduleId) {
        setExamScheduleId(contextExamScheduleId.toString());
      }
      
      fetchQuestions();
    }
  }, [exam_string, isInitializing]);

  useEffect(() => {
    if (error && !isInitializing) {
      const retryTimeout = setTimeout(() => {
        fetchQuestions();
      }, 5000);
  
      return () => clearTimeout(retryTimeout);
    }
  }, [error, isInitializing]);

  useEffect(() => {
    if (!loading && timeLeft > 0) {
      const updateTimer = () => {
        const now = Date.now();
        const deltaTime = Math.floor((now - lastTickRef.current) / 1000);
        
        if (deltaTime >= 1) {
          setTimeLeft(prevTime => {
            const newTime = Math.max(0, prevTime - deltaTime);
            if (newTime <= 0) {
              setIsTimeExpired(true);
              handleSubmit(undefined, true);
              return 0;
            }
            return newTime;
          });
          lastTickRef.current = now;
        }
      };

      timerRef.current = setInterval(updateTimer, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [loading, timeLeft, handleSubmit]);

  useEffect(() => {
    if (!loading && timeLeft > 0 && timeLeft % 120 === 0) {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
      
      autoSaveRef.current = setInterval(() => {
        if (Object.keys(answers).length > 0) {
          saveExamSession();
        }
      }, 1000);

      return () => {
        if (autoSaveRef.current) {
          clearInterval(autoSaveRef.current);
        }
      };
    }
  }, [loading, answers, timeLeft]);

  // Periodic timer sync every 5 minutes
  useEffect(() => {
    if (!loading && examSession && examScheduleId && examId) {
      const startPeriodicSync = () => {
        timerSyncRef.current = setInterval(() => {
          performTimerSync();
        }, 5 * 60 * 1000); // Every 5 minutes
      };

      startPeriodicSync();

      return () => {
        if (timerSyncRef.current) {
          clearInterval(timerSyncRef.current);
        }
      };
    }
  }, [loading, examSession, examScheduleId, examId]);

  const performTimerSync = async () => {
    if (!examScheduleId || !examId) return;

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(
        `${apiUrl}/examSession/active`,
        {
          params: {
            exam_schedule_id: examScheduleId,
            exam_id: examId
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === 'success' && response.data.data) {
        const serverData = response.data.data;
        syncTimerWithServer(serverData.start_time, serverData.end_time);
        setLastServerSync(Date.now());
      }
    } catch (error) {
      console.error('Timer sync failed:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      if (timerSyncRef.current) clearInterval(timerSyncRef.current);
    };
  }, []);

  const saveExamSession = async () => {
    setAutoSaving(true);
    
    try {
      const questionElapsedTimes = await examDbService.getQuestionElapsedTimes(exam_string);
      const authToken = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${apiUrl}/examSession/save`,
        { 
          exam_schedule_id: examScheduleId,
          exam_id: examId,
          answers: answers,
          question_elapsed_times: questionElapsedTimes
        },
        { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      // Sync timer with server response
      if (response.data.status === 'success' && response.data.data) {
        const serverData = response.data.data;
        syncTimerWithServer(serverData.start_time, serverData.end_time);
      }
      
      setAutoSaving(false);
      setShowCheckpointToast(true);
      return true;
    } catch (error) {
      setAutoSaving(false);
      return false;
    }
  };

  const syncTimerWithServer = (serverStartTime: string, serverEndTime: string) => {
    const serverEndTimeMs = new Date(serverEndTime).getTime();
    const currentTime = Date.now();
    const serverRemainingTime = Math.max(0, Math.floor((serverEndTimeMs - currentTime) / 1000));
    
    // Calculate time difference between client and server
    const clientTimeLeft = timeLeft;
    const timeDifference = Math.abs(clientTimeLeft - serverRemainingTime);
    
    console.log('🔄 TIMER SYNC');
    console.log('Server End Time:', serverEndTime);
    console.log('Current Client Time Left:', clientTimeLeft);
    console.log('Server Remaining Time:', serverRemainingTime);
    console.log('Time Difference:', timeDifference, 'seconds');
    
    // If difference is more than 5 seconds, sync with server
    if (timeDifference > 5) {
      console.log('⚠️ Timer desync detected, syncing with server...');
      setTimeLeft(serverRemainingTime);
      lastTickRef.current = Date.now();
      
      // Update session data
      setExamSession(prev => prev ? {
        ...prev,
        start_time: serverStartTime,
        end_time: serverEndTime
      } : null);
      
      // Check if time has expired
      if (serverRemainingTime <= 0) {
        setIsTimeExpired(true);
        handleSubmit(undefined, true);
      }
    }
    
    console.log('---');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleChange = async (id: number, value: any) => {
    const updatedAnswers = {
      ...answers,
      [id]: value
    };
    setAnswers(updatedAnswers);
    await examDbService.saveAnswers(exam_string, updatedAnswers);
  };

  const handleTrueFalseChange = async (id: number, index: number, value: any) => {
    const updatedAnswers = [...(answers[id] || [])];
    updatedAnswers[index] = value;
    const newAnswers = {
      ...answers,
      [id]: updatedAnswers
    };
    setAnswers(newAnswers);
    await examDbService.saveAnswers(exam_string, newAnswers);
  };

  const isAnswerFilled = (answer: any): boolean => {
    if (answer === undefined || answer === null || answer === '') {
      return false;
    }
    
    if (Array.isArray(answer)) {
      return answer.some(value => value !== undefined && value !== null && value !== '');
    }
    
    return true;
  };

  const getFilledAnswersCount = (): number => {
    return Object.values(answers).filter(answer => isAnswerFilled(answer)).length;
  };

  const handleNextExam = async () => {
    const shouldScore = isLastExam; // Score on last exam only
    const success = await submitToServer(shouldScore);
    
    if (success) {
      if (!isLastExam && nextExam) {
        // Go to next exam
        const nextExamString = examOrder[currentExamIndex + 1].exam_string;
        setShowModalNext(false);
        
        setCurrentQuestion(0);
        setQuestions([]);
        setAnswers({});
        setExamSession(null);
        
        router.push(`/exam/${nextExamString}`);
      } else {
        // This is the last exam, go back to origin
        clearExamData();
        router.push(originPath);
      }
    }
  };

  const handleRetrySubmit = () => {
    handleNextExam();
  };

  const handleNavigation = async (index: number) => {
    if (exam_string) {
      await examDbService.updateQuestionElapsedTime(exam_string, questions[currentQuestion].id);
    }
    
    setCurrentQuestion(index);
  };

  const isAnswered = (id: number) => {
    return answers[id] !== undefined && isAnswerFilled(answers[id]);
  };

  const submitToServer = async (shouldScore = false): Promise<boolean> => {
    setSubmitLoading(true);
    setSubmitError(false);
    
    try {
      const finalElapsedTimes = await examDbService.finalizeCurrentQuestionTime(exam_string);
      const authToken = localStorage.getItem('authToken');
      
      await axios.post(
        `${apiUrl}/examSession/submit`,
        { 
          exam_schedule_id: examScheduleId,
          exam_id: examId,
          answers: answers,
          question_elapsed_times: finalElapsedTimes
        },
        { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      // Update user course only on last exam
      if (isLastExam && selectedTopicId) {
        try {
          await axios.post(
            `${apiUrl}/userCourse/`,
            {
              topic_id: selectedTopicId,
              quiz_id: examScheduleId
            },
            { 
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            }
          );
        } catch (error) {
          console.error('Error updating user course:', error);
        }
      }
      
      // Score only on last exam
      if (shouldScore && isLastExam) {
        try {
          await axios.post(
            `${apiUrl}/score/schedule/${examScheduleId}`,
            {},
            { 
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            }
          );
        } catch (scoreError) {
          console.error('Error submitting for scoring:', scoreError);
        }
      }
  
      await examDbService.deleteExamData(exam_string);
      setSubmitLoading(false);
      return true;
    } catch (error) {
      setSubmitLoading(false);
      setSubmitError(true);
      return false;
    }
  };

  const renderQuestion = (q: Question) => {
    switch (q.type) {
      case 'single-choice':
        return (
          <div className="single-choice-container">
            <SingleChoice 
              question={<Latex>{q.question}</Latex>} 
              options={q.options} 
              onChange={(value) => handleChange(q.id, value)} 
              selectedAnswers={answers[q.id] || []} 
            />
          </div>
        );
      
      case 'multiple-choice':
        return (
          <div className="multiple-choice-container">
            <MultipleChoice 
              question={<Latex>{q.question}</Latex>} 
              options={q.options} 
              selectedAnswers={answers[q.id] || []} 
              onChange={(value) => handleChange(q.id, value)} 
            />
          </div>
        );
        
      case 'number':
        return (
          <div className="number-input-container">
            <NumberInput 
              question={q.question} 
              onChange={(value) => handleChange(q.id, value)}
              value={answers[q.id]} 
            />
          </div>
        );
        
      case 'text':
        return (
          <div className="text-input-container">
            <TextInput 
              question={q.question} 
              onChange={(value) => handleChange(q.id, value)}
              value={answers[q.id]} 
            />
          </div>
        );
        
      case 'true-false':
        return (
          <div className="true-false-container">
            <TrueFalse 
              question={q.question} 
              statements={q.statements} 
              selectedAnswers={answers[q.id] || []} 
              onChange={(index, value) => handleTrueFalseChange(q.id, index, value)} 
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  const handleClose = async () => {
    const shouldScore = isLastExam;
    const success = await submitToServer(shouldScore);
    if (success) {
      clearExamData();
      router.push(originPath);
    }
  };

  const loadExistingSession = async (currentExamId: number | undefined) => {
    const examIdToUse = currentExamId || examId;
    
    if (!examScheduleId || !examIdToUse) return;
    
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(
        `${apiUrl}/examSession/active`,
        {
          params: {
            exam_schedule_id: examScheduleId,
            exam_id: examIdToUse
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
        
      if (response.data.status === 'success' && response.data.data) {
        const sessionData = response.data.data;
        
        const startTime = new Date(sessionData.start_time);
        const endTime = new Date(sessionData.end_time);
        const now = new Date();
        
        setExamName(sessionData.name);
        
        // Check if exam time has expired
        if (now > endTime) {
          setIsTimeExpired(true);
          setTimeLeft(0);
          // Set minimal data to allow submit process
          setAnswers(sessionData.answers || {});
          setExamSession(sessionData);
          // Auto submit immediately
          setTimeout(() => {
            handleSubmit(undefined, true);
          }, 1000);
          return;
        }
        
        if (!sessionData.is_auto_move && now < startTime) {
          setExamStartTime(sessionData.start_time);
          setShowNotAccessibleModal(true);
          setIsExamAccessible(false);
          return;
        }
        
        setIsExamAccessible(true);
        
        setAnswers(sessionData.answers || {});
        await examDbService.saveAnswers(exam_string, sessionData.answers || {});
        
        if (sessionData.question_elapsed_times) {
          const examData = await examDbService.getExamData(exam_string) || { 
            answers: sessionData.answers || {}, 
            startTime: Date.now(),
            questionElapsedTimes: {},
            lastQuestionVisit: null
          };
          examData.questionElapsedTimes = sessionData.question_elapsed_times;
          const db = await examDbService.db;
          await db.put('examData', examData, exam_string);
        }
        
        const nowTimestamp = Date.now();
        const endTimeTimestamp = endTime.getTime();
        const remainingTime = Math.max(0, Math.floor((endTimeTimestamp - nowTimestamp) / 1000));
        
        setTimeLeft(remainingTime);
        lastTickRef.current = nowTimestamp;
        
        setExamSession(sessionData);
        
        if (remainingTime <= 0) {
          setIsTimeExpired(true);
          handleSubmit(undefined, true);
        }
        
        return;
      }
    } catch (error) {
      console.error('Error fetching exam session:', error);
      
      const savedAnswers = await examDbService.getAnswers(exam_string);
      if (savedAnswers) {
        setAnswers(savedAnswers);
      }
      
      if (duration > 0) {
        setTimeLeft(duration * 60);
        lastTickRef.current = Date.now();
      }
    }
  };

  const handleRetryAccess = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(
        `${apiUrl}/examSession/active`,
        {
          params: {
            exam_schedule_id: examScheduleId,
            exam_id: examId
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      if (response.data.status === 'success' && response.data.data) {
        const sessionData = response.data.data;
        
        if (!sessionData.is_auto_move && new Date() >= new Date(sessionData.start_time)) {
          setShowNotAccessibleModal(false);
          setIsExamAccessible(true);
          fetchQuestions();
        } else {
          setExamStartTime(sessionData.start_time);
          setIsExamAccessible(false);
        }
      }
    } catch (error) {
      console.error('Error checking exam accessibility:', error);
      if (examStartTime && new Date() >= new Date(examStartTime)) {
        setIsExamAccessible(true);
        setShowNotAccessibleModal(false);
        fetchQuestions();
      }
    }
  };

  if (loading) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Loading Exam...</h2>
          <p className="tw-text-violet-600 tw-mt-2">Please wait while we prepare your questions</p>
        </div>
      </div>
    );
  }
  
  if (!isExamAccessible) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Clock className="tw-h-12 tw-w-12 tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Exam Not Available Yet</h2>
          <p className="tw-text-violet-600 tw-mt-2">Please wait until the scheduled start time</p>
          
          {examStartTime && (
            <div className="tw-mt-4">
              <p className="tw-text-violet-600">Available in:</p>
              <div className="tw-text-3xl tw-font-mono tw-font-bold tw-text-violet-700 tw-mt-2">
                {countdown}
              </div>
              <p className="tw-text-sm tw-text-violet-500 tw-mt-2">
                Scheduled at: {new Date(examStartTime).toLocaleString()}
              </p>
            </div>
          )}
          
          <Button 
            variant="primary" 
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
            onClick={handleRetryAccess}
          >
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-violet-50">
      <div className="tw-bg-violet-600 tw-text-white tw-py-4 tw-shadow-lg tw-mb-6">
        <Container>
          <div className="tw-flex tw-justify-between tw-items-center">
            <div className="tw-flex-1 tw-min-w-0">
              <h1 className="tw-text-2xl tw-font-bold tw-mb-1 tw-break-words tw-pr-4">
                {examName}
              </h1>
              {examSession && (
                <p className="tw-text-sm tw-text-violet-200">
                  End time: {new Date(examSession.end_time).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="tw-flex tw-items-center tw-gap-3 tw-bg-violet-700 tw-rounded-lg tw-px-6 tw-py-3 tw-flex-shrink-0">
              <Clock size={28} className="tw-text-violet-200" />
              <div className="tw-flex tw-flex-col tw-items-start">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <span className="tw-text-violet-200 tw-text-sm">Time Remaining</span>
                  {lastServerSync && Date.now() - lastServerSync < 10 * 60 * 1000 && (
                    <div className="tw-flex tw-items-center tw-text-xs tw-text-violet-300">
                      <div className="tw-w-2 tw-h-2 tw-bg-green-400 tw-rounded-full tw-mr-1 tw-animate-pulse"></div>
                      Synced
                    </div>
                  )}
                </div>
                <span className="tw-text-3xl tw-font-mono tw-font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div 
        className="tw-fixed tw-top-4 tw-right-4 tw-z-50"
        style={{ display: showCheckpointToast ? 'block' : 'none' }}
      >
        <Toast 
          onClose={() => setShowCheckpointToast(false)} 
          show={showCheckpointToast} 
          delay={3000} 
          autohide
          className="tw-bg-violet-100 tw-border-violet-300 tw-border"
        >
          <Toast.Header className="tw-bg-violet-200 tw-text-violet-800">
            <Check className="tw-mr-2 tw-text-violet-600" size={16} />
            <strong className="tw-mr-auto">Checkpoint Saved</strong>
          </Toast.Header>
          <Toast.Body className="tw-text-violet-700">
            Your answers have been saved to the server.
          </Toast.Body>
        </Toast>
      </div>

      <Container className="tw-mb-8">
        <Row>
          <Col lg={8} className="tw-mb-4">
            <Card className="tw-shadow-md tw-border-0 tw-rounded-xl
              [&_p_img]:tw-max-w-full 
              [&_p_img]:tw-h-auto 
              [&_p_img]:tw-block 
              [&_p_img]:tw-mx-auto 
              [&_p_img]:tw-my-4
              [&_img]:tw-max-w-full 
              [&_img]:tw-h-auto 
              [&_img]:tw-block 
              [&_img]:tw-mx-auto 
              [&_img]:tw-my-4">
              <Card.Body className="tw-p-6">
                {questions.length > 0 && (
                  <>
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
                      <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">
                        Question {currentQuestion + 1} of {questions.length}
                      </h2>
                      {autoSaving && (
                        <div className="tw-flex tw-items-center tw-text-violet-600">
                          <Loader2 className="tw-h-4 tw-w-4 tw-animate-spin tw-mr-2" />
                          <span className="tw-text-sm">Saving...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="tw-mb-6">
                      {renderQuestion(questions[currentQuestion])}
                    </div>

                    <div className="tw-flex tw-justify-between tw-mt-8">
                      <Button
                        variant="outline-secondary"
                        className="tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50"
                        disabled={currentQuestion === 0}
                        onClick={() => handleNavigation(currentQuestion - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700"
                        disabled={currentQuestion === questions.length - 1}
                        onClick={() => handleNavigation(currentQuestion + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="tw-hidden md:tw-block">
            <Card className="tw-shadow-md tw-border-0 tw-rounded-xl tw-sticky tw-top-4">
              <Card.Body className="tw-p-4">
                <h3 className="tw-text-lg tw-font-semibold tw-text-violet-800 tw-mb-4">Question Navigator</h3>
                <div className="tw-grid tw-grid-cols-5 tw-gap-2 tw-mb-6">
                  {questions.map((q, index) => (
                    <Button
                      key={q.id}
                      variant={currentQuestion === index ? "primary" : "outline-secondary"}
                      className={`tw-w-10 tw-h-10 tw-rounded-lg tw-flex tw-items-center tw-justify-center 
                        ${currentQuestion === index 
                          ? 'tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700' 
                          : 'tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50'}
                        ${isAnswered(q.id) ? 'tw-bg-violet-200' : ''}`}
                      onClick={() => handleNavigation(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>

                <div className="tw-mb-4">
                  <div className="tw-flex tw-justify-between tw-text-sm tw-text-gray-600 tw-mb-2">
                    <span>Progress</span>
                    <span>{getFilledAnswersCount()}/{questions.length} Questions</span>
                  </div>
                  <ProgressBar 
                    now={(getFilledAnswersCount() / questions.length) * 100} 
                    className="tw-h-2 tw-bg-violet-100"
                  >
                    <ProgressBar 
                      now={(getFilledAnswersCount()/ questions.length) * 100} 
                      className="tw-bg-violet-600"
                    />
                  </ProgressBar>
                </div>

                {currentQuestion === questions.length - 1 && (
                  <Button 
                    variant="primary" 
                    className="tw-w-full tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
                    onClick={handleSubmit}
                  >
                    {isLastExam ? 'Selesaikan Ujian' : 'Submit Exam'}
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <div className="tw-block md:tw-hidden tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white tw-shadow-lg tw-border-t tw-border-gray-200 tw-z-50">
        <div className="tw-p-4">
          <div className="tw-mb-3">
            <div className="tw-flex tw-justify-between tw-text-sm tw-text-gray-600 tw-mb-2">
              <span>Progress</span>
              <span>{getFilledAnswersCount()}/{questions.length} Questions</span>
            </div>
            <ProgressBar 
              now={(getFilledAnswersCount() / questions.length) * 100} 
              className="tw-h-2 tw-bg-violet-100"
            >
              <ProgressBar 
                now={(getFilledAnswersCount() / questions.length) * 100} 
                className="tw-bg-violet-600"
              />
            </ProgressBar>
          </div>
          
          <div className="tw-overflow-x-auto tw-pb-2">
            <div className="tw-flex tw-gap-2 tw-min-w-max">
              {questions.map((q, index) => (
                <Button
                  key={q.id}
                  variant={currentQuestion === index ? "primary" : "outline-secondary"}
                  className={`tw-w-10 tw-h-10 tw-rounded-lg tw-flex-shrink-0 tw-flex tw-items-center tw-justify-center 
                    ${currentQuestion === index 
                      ? 'tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700' 
                      : 'tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50'}
                    ${isAnswered(q.id) ? 'tw-bg-violet-200' : ''}`}
                  onClick={() => handleNavigation(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>

          {currentQuestion === questions.length - 1 && (
            <Button 
              variant="primary" 
              className="tw-w-full tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
              onClick={handleSubmit}
            >
              {isLastExam ? 'Selesaikan Ujian' : 'Submit Exam'}
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        show={showConfirmationModal} 
        onHide={() => setShowConfirmationModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header className="tw-bg-violet-50">
          <Modal.Title className="tw-text-violet-800 tw-flex tw-items-center">
            <AlertCircle className="tw-mr-2 tw-text-violet-600" size={20} />
            Confirm Submission
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="tw-p-2">
            <p className="tw-text-lg tw-font-medium tw-mb-3 tw-text-violet-900">
              {isLastExam ? 'Apakah Anda yakin ingin menyelesaikan seluruh ujian?' : 'Are you sure you want to end this exam?'}
            </p>
            
            <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
              <div className="tw-flex tw-items-center tw-mb-2">
                <FileCheck className="tw-text-violet-600 tw-mr-2" size={18} />
                <span className="tw-font-medium tw-text-violet-800">Exam Summary</span>
              </div>
              <p className="tw-text-violet-700 tw-mb-2">
                <span className="tw-font-medium">Completed:</span> {getFilledAnswersCount()} of {questions.length} questions
              </p>
              {getFilledAnswersCount() < questions.length && (
                <div className="tw-bg-amber-50 tw-p-2 tw-rounded tw-border tw-border-amber-200 tw-text-amber-800 tw-text-sm">
                  Warning: You have {questions.length - getFilledAnswersCount()} unanswered questions.
                </div>
              )}
            </div>
            
            <p className="tw-text-gray-600 tw-text-sm">
              {isLastExam 
                ? 'Setelah diselesaikan, Anda tidak dapat mengubah jawaban lagi.'
                : 'Once submitted, you won\'t be able to change your answers for this section.'
              }
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowConfirmationModal(false)}
            className="tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50"
          >
            {isLastExam ? 'Lanjut Ujian' : 'Continue Exam'}
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmSubmit}
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
          >
            <ArrowRight className="tw-mr-1" size={16} /> 
            {isLastExam ? 'Selesaikan' : 'End Exam'}
          </Button>
        </Modal.Footer>
      </Modal>
    
      {/* Next Exam / Completion Modal */}
      <Modal 
        show={showModalNext} 
        onHide={() => {}}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="tw-bg-violet-50">
          <Modal.Title className="tw-text-violet-800">
            {submitLoading ? (
              <div className="tw-flex tw-items-center">
                <Loader2 className="tw-h-5 tw-w-5 tw-animate-spin tw-mr-2 tw-text-violet-600" />
                Menyimpan Jawaban...
              </div>
            ) : isTimeExpired ? (
              "Waktu Telah Habis"
            ) : isLastExam ? (
              "Ujian Selesai"
            ) : nextExam ? (
              "Lanjut ke Ujian Berikutnya?"
            ) : (
              "Selesai"
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitLoading ? (
            <div className="tw-text-center tw-py-4">
              <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
              <p className="tw-text-lg tw-font-medium">Sedang menyimpan jawaban...</p>
              <p className="tw-text-gray-600">Mohon tunggu sebentar</p>
            </div>
          ) : submitError ? (
            <div className="tw-py-2">
              <Alert variant="danger" className="tw-mb-4">
                <p className="tw-font-bold tw-mb-2">Gagal menyimpan jawaban</p>
                <p>
                  {isLastExam 
                    ? 'Jangan khawatir, sistem akan tetap mencoba menyimpan jawaban Anda.'
                    : 'Jangan khawatir, soal selanjutnya akan dimulai setelah selesai mengirim jawaban kamu saat ini.'
                  }
                </p>
              </Alert>
              <p>Silakan coba kirim ulang jawaban.</p>
            </div>
          ) : isTimeExpired ? (
            <div className="tw-p-2 tw-text-center">
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                <Clock className="tw-h-16 tw-w-16 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                <p className="tw-text-xl tw-font-medium tw-text-violet-800 tw-mb-2">Waktu ujian telah habis!</p>
                <p className="tw-text-violet-700">
                  Jawaban Anda akan diproses secara otomatis.
                </p>
              </div>
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                <div className="tw-flex tw-items-center tw-mb-2">
                  <FileCheck className="tw-text-violet-600 tw-mr-2" size={18} />
                  <span className="tw-font-medium tw-text-violet-800">Ringkasan Ujian</span>
                </div>
                <p className="tw-text-violet-700 tw-mb-2">
                  <span className="tw-font-medium">Terjawab:</span> {getFilledAnswersCount()} dari {questions.length} pertanyaan
                </p>
              </div>
            </div>
          ) : isLastExam ? (
            <div className="tw-p-2 tw-text-center">
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                <Check className="tw-h-16 tw-w-16 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                <p className="tw-text-xl tw-font-medium tw-text-violet-800 tw-mb-2">Selamat!</p>
                <p className="tw-text-violet-700">
                  Anda telah menyelesaikan semua ujian dengan baik.
                </p>
              </div>
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                <div className="tw-flex tw-items-center tw-mb-2">
                  <FileCheck className="tw-text-violet-600 tw-mr-2" size={18} />
                  <span className="tw-font-medium tw-text-violet-800">Ringkasan Ujian</span>
                </div>
                <p className="tw-text-violet-700 tw-mb-2">
                  <span className="tw-font-medium">Terjawab:</span> {getFilledAnswersCount()} dari {questions.length} pertanyaan
                </p>
              </div>
              <p className="tw-text-gray-600">Terima kasih atas partisipasinya!</p>
            </div>
          ) : nextExam ? (
            <div className="tw-p-2">
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4 tw-text-center">
                <FileCheck className="tw-h-12 tw-w-12 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                <p className="tw-text-lg tw-font-medium tw-text-violet-800 tw-mb-2">Bagian ini telah selesai!</p>
                <p className="tw-text-violet-700">
                  Anda akan melanjutkan ke <span className="tw-font-semibold">{nextExam}</span>.
                </p>
              </div>
              <p className="tw-text-center tw-text-gray-600">Apakah Anda siap untuk melanjutkan?</p>
            </div>
          ) : (
            <div className="tw-p-2 tw-text-center">
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                <Check className="tw-h-16 tw-w-16 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                <p className="tw-text-xl tw-font-medium tw-text-violet-800 tw-mb-2">Selamat!</p>
                <p className="tw-text-violet-700">
                  Anda telah menyelesaikan semua ujian dengan baik.
                </p>
              </div>
              <p className="tw-text-gray-600">Terima kasih atas partisipasinya!</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {submitLoading ? null : (
            <>
              {submitError ? (
                <Button 
                  variant="primary" 
                  className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700"
                  onClick={handleRetrySubmit}
                >
                  Kirim Ulang
                </Button>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    onClick={handleClose}
                  >
                    Kembali ke Home
                  </Button>
                  {!isLastExam && nextExam && !isTimeExpired && (
                    <Button 
                      variant="primary" 
                      className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
                      onClick={handleNextExam}
                    >
                      Lanjut <ArrowRight className="tw-ml-1" size={16} />
                    </Button>
                  )}
                  {!isLastExam && isTimeExpired && nextExam && (
                    <Button 
                      variant="primary" 
                      className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
                      onClick={handleNextExam}
                    >
                      Lanjut ke Ujian Berikutnya <ArrowRight className="tw-ml-1" size={16} />
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>
      
      <ExamNotAccessibleModal 
        show={showNotAccessibleModal} 
        startTime={examStartTime} 
        onRetry={handleRetryAccess} 
      />
    </div>
  );
};

export default ChainExam;