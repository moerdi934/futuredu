'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  data?: any;
}

interface Exam {
  id: number;
  name: string;
}

interface ExamSchedule {
  id: number;
  name: string;
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

const EditExamScheduleModalProps: React.FC<EditExamScheduleModalProps> = ({ isOpen, onClose, onSave, data }) => {
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
  
  // Loading states
  const [isLoadingSchedule, setIsLoadingSchedule] = useState<boolean>(false);
  const [isSearchingSchedules, setIsSearchingSchedules] = useState<boolean>(false);
  const [isSearchingExams, setIsSearchingExams] = useState<boolean>(false);
  
  // Error state
  const [errors, setErrors] = useState<{ name?: string; exams?: string; time?: string }>({});

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && data) {
      // Initialize form with data
      setName(data.schedule_name || '');
      setDescription(data.description || '');
      
      // Handle exam_type - create custom option if not in predefined options
      const matchingExamType = examTypeOptions.find(opt => opt.value === data.exam_type);
      if (matchingExamType) {
        setExamType(matchingExamType);
      } else if (data.exam_type) {
        setExamType({ value: data.exam_type, label: data.exam_type });
      }
      
      setIsFree(data.isfree || false);
      setIsValid(data.is_valid || false);
      setSelectedScheduleId(data.id || null);

      if (data.start_time && data.end_time) {
        setStartTime(new Date(data.start_time));
        setEndTime(new Date(data.end_time));
        setAnytime(false);
      } else {
        setAnytime(true);
        setStartTime(null);
        setEndTime(null);
      }

      // Parse exam_id and exam_name if they exist
      if (data.exam_id && data.exam_name) {
        // Parse exam_id and exam_name from string format "{1,2,3,4}" and "Name1.Name2.Name3.Name4"
        try {
          // Parse exam_id - remove curly braces and split by comma
          const examIdString = data.exam_id.replace('{', '').replace('}', '');
          const examIds = examIdString.split(',').map((id: string) => parseInt(id.trim(), 10));
          
          // Parse exam_name - split by dot
          const examNames = data.exam_name.split('.');
          
          // Create selectedExams array matching ids with names
          if (examIds.length === examNames.length) {
            const exams = examIds.map((id: number, index: number) => ({
              value: id,
              label: `${id} - ${examNames[index]}`
            }));
            setSelectedExams(exams);
          }
        } catch (error) {
          console.error('Error parsing exam_id and exam_name:', error);
        }
      }
    }
  }, [isOpen, data]);

  // Debounced exam search
  const handleExamSearch = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim() === '') {
      setExamOptions([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
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
      }
      setIsSearchingExams(false);
    }, 500); // 500ms debounce delay
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
        {(!isLoadingSchedule) && (
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
              allowCustomValue={true}
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
              onInputChange={handleExamSearch}
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
          disabled={isLoadingSchedule}
        >
          {isLoadingSchedule ? 'Saving...' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditExamScheduleModalProps;