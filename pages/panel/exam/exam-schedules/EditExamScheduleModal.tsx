'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, ListGroup, Spinner, Row, Col, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { 
  ShortFormField, 
  WideFormField, 
  SelectCustomField,
  SearchMultipleField,
  YesNoField,
  DateRangeField,
  SelectOption 
} from '../../../../components/layout/FormComponentLayout';

interface EditExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: any) => void;
  data?: any; // Optional data prop for direct editing
}

interface Exam {
  id: number;
  name: string;
}

interface ExamSchedule {
  id: number;
  name: string;
  schedule_name?: string; // Added for compatibility
  description?: string;
  exam_id_list?: number[];
  start_time?: string | null;
  end_time?: string | null;
  is_valid?: boolean;
  create_date?: string | null;
  created_by?: string | null;
  update_date?: string | null;
  updated_by?: string | null;
  exam_type?: string;
  isfree?: boolean;
  type?: number;
}

const examTypeOptions: SelectOption[] = [
  { value: 'SNBT', label: 'SNBT' },
  { value: 'SIMAK', label: 'SIMAK' },
  { value: 'UTUL', label: 'UTUL' },
  { value: 'midterm', label: 'Midterm' },
  { value: 'final', label: 'Final' },
  { value: 'quiz', label: 'Quiz' }
];

const EditExamScheduleModal: React.FC<EditExamScheduleModalProps> = ({ isOpen, onClose, onSave, data }) => {
  const { id } = useAuth();
  
  // Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [examType, setExamType] = useState<SelectOption | null>(null);
  const [isFree, setIsFree] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [anytime, setAnytime] = useState<boolean>(false);
  
  // Search and selection state
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState<string>('');
  const [scheduleSearchResults, setScheduleSearchResults] = useState<ExamSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [selectedExams, setSelectedExams] = useState<SelectOption[]>([]);
  const [examOptions, setExamOptions] = useState<SelectOption[]>([]);
  const [examSearchQuery, setExamSearchQuery] = useState<string>('');
  
  // Loading states
  const [isLoadingSchedule, setIsLoadingSchedule] = useState<boolean>(false);
  const [isSearchingSchedules, setIsSearchingSchedules] = useState<boolean>(false);
  const [isSearchingExams, setIsSearchingExams] = useState<boolean>(false);
  
  // Error state
  const [errors, setErrors] = useState<{ name?: string; exams?: string; time?: string }>({});

  // Reset form
  const resetModal = () => {
    setName('');
    setDescription('');
    setExamType(null);
    setIsFree(false);
    setIsValid(true);
    setStartTime(null);
    setEndTime(null);
    setAnytime(false);
    setSelectedExams([]);
    setExamOptions([]);
    setErrors({});
    setScheduleSearchQuery('');
    setScheduleSearchResults([]);
    setSelectedScheduleId(null);
    setExamSearchQuery('');
  };

  // Debounced exam search function
  const debouncedExamSearch = useCallback(
    (function() {
      let timer: NodeJS.Timeout | null = null;
      return function(query: string) {
        setExamSearchQuery(query);
        
        if (timer) {
          clearTimeout(timer);
        }
        
        timer = setTimeout(async () => {
          if (query.trim() === '') {
            setExamOptions([]);
            return;
          }
          
          setIsSearchingExams(true);
          try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam/search`, {
              params: { query, limit: 10 }
            });
            const options = response.data.data.map((exam: Exam) => ({
              value: exam.id,
              label: `${exam.id} - ${exam.name}`
            }));
            setExamOptions(options);
          } catch (error) {
            console.error('Error searching exams:', error);
          } finally {
            setIsSearchingExams(false);
          }
        }, 500); // 500ms debounce delay
      };
    })(),
    []
  );

  // Effect for initializing data
  useEffect(() => {
    // If direct data is provided, use it to initialize the form
    if (isOpen && data) {
      setSelectedScheduleId(data.id);
      setName(data.name || data.schedule_name || '');
      setDescription(data.description || '');
      setExamType(examTypeOptions.find(opt => opt.value === data.exam_type) || null);
      setIsFree(data.isfree || false);
      setIsValid(data.is_valid || false);

      if (data.start_time && data.end_time) {
        setStartTime(new Date(data.start_time));
        setEndTime(new Date(data.end_time));
        setAnytime(false);
      } else {
        setAnytime(true);
        setStartTime(null);
        setEndTime(null);
      }

      if (data.exam_id_list && data.exam_id_list.length > 0) {
        const loadExams = async () => {
          try {
            const ids = Array.isArray(data.exam_id_list) 
              ? data.exam_id_list.join(',') 
              : data.exam_id_list;
              
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam`, {
              params: { ids }
            });
            
            const exams = response.data.data.map((exam: any) => ({
              value: exam.id,
              label: `${exam.id} - ${exam.name}`
            }));
            
            setSelectedExams(exams);
          } catch (error) {
            console.error('Error loading exams:', error);
          }
        };
        
        loadExams();
      }
    } else if (!isOpen) {
      resetModal();
    }
  }, [isOpen, data]);

  // Handle schedule search
  const handleScheduleSearch = async (query: string) => {
    setScheduleSearchQuery(query);
    if (query.trim() === '') {
      setScheduleSearchResults([]);
      return;
    }

    setIsSearchingSchedules(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam-schedules/search`, {
        params: { search: query, limit: 5 }
      });
      setScheduleSearchResults(response.data.data);
    } catch (error) {
      console.error('Error searching schedules:', error);
    }
    setIsSearchingSchedules(false);
  };

  // Fetch schedule details
  const fetchScheduleDetails = async (scheduleId: number) => {
    setIsLoadingSchedule(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam-schedules/${scheduleId}`);
      const schedule: ExamSchedule = response.data;

      setName(schedule.name || schedule.schedule_name || '');
      setDescription(schedule.description || '');
      setExamType(examTypeOptions.find(opt => opt.value === schedule.exam_type) || null);
      setIsFree(schedule.isfree || false);
      setIsValid(schedule.is_valid || false);

      if (schedule.start_time && schedule.end_time) {
        setStartTime(new Date(schedule.start_time));
        setEndTime(new Date(schedule.end_time));
        setAnytime(false);
      } else {
        setAnytime(true);
        setStartTime(null);
        setEndTime(null);
      }

      if (schedule.exam_id_list) {
        const examsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam`, {
          params: { ids: schedule.exam_id_list }
        });
        const selectedOptions = examsResponse.data.data.map((exam: Exam) => ({
          value: exam.id,
          label: `${exam.id} - ${exam.name}`
        }));
        setSelectedExams(selectedOptions);
      }
    } catch (error) {
      console.error('Error fetching schedule details:', error);
    }
    setIsLoadingSchedule(false);
  };

  // Handle save
  const handleSave = async () => {
    // Validation
    const validationErrors: { name?: string; exams?: string; time?: string } = {};

    if (!name.trim()) {
      validationErrors.name = 'Schedule name is required';
    }

    if (selectedExams.length === 0) {
      validationErrors.exams = 'At least one exam must be selected';
    }

    if (!anytime && (!startTime || !endTime)) {
      validationErrors.time = 'Both start and end time are required when not set to Anytime';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Reset errors
    setErrors({});

    const payload = {
      name: name.trim(),
      description: description.trim(),
      exam_id_list: selectedExams.map(exam => exam.value),
      exam_type: examType?.value,
      isfree: isFree,
      is_valid: isValid,
      type: anytime ? 1999 : 3,
      start_time: anytime ? null : startTime?.toISOString(),
      end_time: anytime ? null : endTime?.toISOString(),
      updated_by: id
    };

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/exam-schedules/${selectedScheduleId}`,
        payload
      );
      onSave(response.data);
      onClose();
      resetModal();
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
    }
  };

  return (
    <Modal show={isOpen} onHide={() => { onClose(); resetModal(); }} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Exam Schedule</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!data && (
          <>
            {/* Schedule Search - only show if not directly editing */}
            <ShortFormField
              label="Search Exam Schedule"
              value={scheduleSearchQuery}
              onChange={(e) => handleScheduleSearch(e.target.value)}
              required
            />

            {isSearchingSchedules && (
              <div className="text-center my-3">
                <Spinner animation="border" size="sm" />
              </div>
            )}

            {scheduleSearchResults.length > 0 && (
              <ListGroup className="mb-3">
                {scheduleSearchResults.map((result) => (
                  <ListGroup.Item
                    key={result.id}
                    action
                    active={result.id === selectedScheduleId}
                    onClick={() => {
                      setSelectedScheduleId(result.id);
                      fetchScheduleDetails(result.id);
                      setScheduleSearchResults([]);
                      setScheduleSearchQuery('');
                    }}
                  >
                    {result.id} - {result.name || result.schedule_name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </>
        )}

        {isLoadingSchedule && (
          <div className="text-center my-3">
            <Spinner animation="border" />
          </div>
        )}

        {(selectedScheduleId || data) && !isLoadingSchedule && (
          <Form>
            {/* Error Alert */}
            {(errors.name || errors.exams || errors.time) && (
              <Alert variant="danger" onClose={() => setErrors({})} dismissible>
                {errors.name && <div>{errors.name}</div>}
                {errors.exams && <div>{errors.exams}</div>}
                {errors.time && <div>{errors.time}</div>}
              </Alert>
            )}

            <ShortFormField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            <WideFormField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <SelectCustomField
              label="Exam Type"
              value={examType}
              options={examTypeOptions}
              onChange={(newValue) => setExamType(newValue)}
              required
            />

            <YesNoField
              label="Is Free"
              checked={isFree}
              onChange={setIsFree}
            />

            <YesNoField
              label="Is Valid"
              checked={isValid}
              onChange={setIsValid}
            />

            <DateRangeField
              label="Schedule Time"
              startDate={startTime}
              endDate={endTime}
              onStartDateChange={setStartTime}
              onEndDateChange={setEndTime}
              anytime={anytime}
              onAnytimeChange={setAnytime}
              error={errors.time}
              required
            />

            <SearchMultipleField
              label="Select Exams"
              value={selectedExams}
              options={examOptions}
              onChange={(newValue) => setSelectedExams(newValue as SelectOption[])}
              onInputChange={debouncedExamSearch}
              isLoading={isSearchingExams}
              error={errors.exams}
              required
            />
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            onClose();
            resetModal();
          }}
        >
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={(!selectedScheduleId && !data) || isLoadingSchedule}
        >
          {isLoadingSchedule ? 'Saving...' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditExamScheduleModal;