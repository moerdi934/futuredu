// pages/panel/courses/classes-page/EditClassModal.tsx - Updated with Class Mode Selection

import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Badge, Button as BootstrapButton } from 'react-bootstrap';
import { BookOpen, Users, Calendar, Clock, UserCheck, Video, MapPin } from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';
import { 
  ShortFormField, 
  WideFormField, 
  SearchSingleField, 
  SearchMultipleField,
  SelectOption 
} from '../../../../components/form/FormComponentLayout';
import { useAuth } from '../../../../context/AuthContext';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: any) => void;
  editingData: any;
}

interface Course {
  id: number;
  title: string;
  description?: string;
}

interface UserGroup {
  id: number;
  name: string;
  role: string;
  status: number;
  id_list: string[];
  user_names: string[];
}

const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose, onSave, editingData }) => {
  const { role: userRole, id: currentUserId } = useAuth();
  
  // Form data states
  const [formData, setFormData] = useState({
    name: '',
    course_id: 0,
    course_name: '',
    description: '',
    teacher_id: '',
    teacher_name: '',
    student_list_ids: [] as string[],
    student_list_names: [] as string[],
    start_date: '',
    end_date: '',
    class_mode: 'offline' as 'online' | 'offline',
    meeting_url: '',
    approval_status: 'approved'
  });

  // Form field states for form components
  const [selectedCourse, setSelectedCourse] = useState<SelectOption | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<SelectOption | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<SelectOption[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<UserGroup[]>([]);
  
  // Options states for dropdowns
  const [courseOptions, setCourseOptions] = useState<SelectOption[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<SelectOption[]>([]);
  const [studentOptions, setStudentOptions] = useState<SelectOption[]>([]);
  
  // Loading states for each dropdown
  const [courseLoading, setCourseLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  
  // Toggle for student vs group search
  const [isGroupSearch, setIsGroupSearch] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Populate form data when editing data changes
  useEffect(() => {
    if (editingData && isOpen) {
      console.log('Editing data:', editingData);
      
      // Convert dates to datetime-local format
      const startDate = editingData.real_start_datetime 
        ? new Date(editingData.real_start_datetime).toISOString().slice(0, 16)
        : '';
      const endDate = editingData.real_end_datetime 
        ? new Date(editingData.real_end_datetime).toISOString().slice(0, 16)
        : '';

      setFormData({
        name: editingData.name || '',
        course_id: editingData.course_id || 0,
        course_name: editingData.course_name || '',
        description: editingData.description || '',
        teacher_id: editingData.teacher_id || '',
        teacher_name: editingData.teacher_name || '',
        student_list_ids: editingData.student_list_ids?.map(String) || [],
        student_list_names: editingData.student_list_names || [],
        start_date: startDate,
        end_date: endDate,
        class_mode: editingData.class_mode || 'offline',
        meeting_url: editingData.meeting_url || '',
        approval_status: editingData.approval_status || 'approved'
      });

      // Set selected options for dropdowns
      if (editingData.course_id) {
        setSelectedCourse({
          label: editingData.course_name,
          value: editingData.course_id
        });
      }

      if (editingData.teacher_id && editingData.teacher_name) {
        setSelectedTeacher({
          label: editingData.teacher_name,
          value: editingData.teacher_id
        });
      }

      if (editingData.student_list_ids && editingData.student_list_names) {
        const studentOptions = editingData.student_list_ids.map((id: any, index: number) => ({
          label: editingData.student_list_names[index] || `Student ${id}`,
          value: String(id)
        }));
        setSelectedStudents(studentOptions);
      }
    }
  }, [editingData, isOpen]);

  // Check if user can edit this class
  const canUserEdit = () => {
    if (!editingData) return false;
    
    if (userRole === 'admin') return true;
    
    if (userRole === 'teacher') {
      return editingData.teacher_id === currentUserId || 
             editingData.create_user_id === currentUserId;
    }
    
    if (userRole === 'student') {
      return editingData.create_user_id === currentUserId && 
             editingData.approval_status === 'need_approve';
    }
    
    return false;
  };

  // Convert function for courses only
  const convertCoursesToSelectOptions = (courses: Course[]): SelectOption[] => {
    return courses.map(course => ({
      label: course.title,
      value: course.id
    }));
  };

  // Debounce hook for search input
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Search term states
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Debounced search terms
  const debouncedCourseSearch = useDebounce(courseSearchTerm, 300);
  const debouncedTeacherSearch = useDebounce(teacherSearchTerm, 300);
  const debouncedStudentSearch = useDebounce(studentSearchTerm, 300);

  // Fetch functions using new unified endpoint
  const fetchCourseOptions = async (searchTerm: string = '') => {
    setCourseLoading(true);
    try {
      const url = searchTerm.trim() 
        ? `${API_URL}/courses/search?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/courses/search`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to search courses');
      
      const data: Course[] = await response.json();
      const options = convertCoursesToSelectOptions(data);
      setCourseOptions(options);
    } catch (error) {
      console.error('Error searching courses:', error);
      setCourseOptions([]);
    } finally {
      setCourseLoading(false);
    }
  };

  const fetchTeacherOptions = async (searchTerm: string = '') => {
    if (userRole === 'student') return; // Students can't change teacher
    
    setTeacherLoading(true);
    try {
      const url = searchTerm.trim() 
        ? `${API_URL}/users/search/teacher?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/users/search/teacher`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to search teachers');
      
      const data: SelectOption[] = await response.json();
      setTeacherOptions(data);
    } catch (error) {
      console.error('Error searching teachers:', error);
      setTeacherOptions([]);
    } finally {
      setTeacherLoading(false);
    }
  };

  const fetchStudentOptions = async (searchTerm: string = '') => {
    if (isGroupSearch) {
      await fetchGroupOptions(searchTerm);
      return;
    }

    setStudentLoading(true);
    try {
      const url = searchTerm.trim() 
        ? `${API_URL}/users/search/student?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/users/search/student`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to search students');
      
      const data: SelectOption[] = await response.json();
      setStudentOptions(data);
    } catch (error) {
      console.error('Error searching students:', error);
      setStudentOptions([]);
    } finally {
      setStudentLoading(false);
    }
  };

  const fetchGroupOptions = async (searchTerm: string = '') => {
    setStudentLoading(true);
    try {
      const url = searchTerm.trim() 
        ? `${API_URL}/user-groups?name=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/user-groups`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to search groups');
      
      const data = await response.json();
      const groups = data.data || [];
      
      const options = groups.map((group: any) => ({
        label: `${group.group_data.name} (${group.group_data.user_names.length} siswa)`,
        value: group.group_data.id,
        group_data: group.group_data
      }));

      setStudentOptions(options);
    } catch (error) {
      console.error('Error searching groups:', error);
      setStudentOptions([]);
    } finally {
      setStudentLoading(false);
    }
  };

  // Effects for search
  useEffect(() => {
    if (isOpen) {
      fetchCourseOptions(debouncedCourseSearch);
    }
  }, [debouncedCourseSearch, isOpen]);

  useEffect(() => {
    if (isOpen && userRole !== 'student') {
      fetchTeacherOptions(debouncedTeacherSearch);
    }
  }, [debouncedTeacherSearch, userRole, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchStudentOptions(debouncedStudentSearch);
    }
  }, [debouncedStudentSearch, isGroupSearch, isOpen]);

  // Handle form changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, start_date: e.target.value }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, end_date: e.target.value }));
  };

  const handleMeetingUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, meeting_url: e.target.value }));
  };

  const handleCourseChange = (newValue: any) => {
    setSelectedCourse(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        course_id: newValue.value,
        course_name: newValue.label
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        course_id: 0,
        course_name: ''
      }));
    }
  };

  const handleTeacherChange = (newValue: any) => {
    if (userRole === 'student') return;
    
    setSelectedTeacher(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        teacher_id: newValue.value,
        teacher_name: newValue.label
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        teacher_id: '',
        teacher_name: ''
      }));
    }
  };

  const handleStudentChange = (newValue: any) => {
    if (isGroupSearch) {
      handleGroupSelection(newValue);
    } else {
      setSelectedStudents(newValue || []);
      const studentIds = newValue ? newValue.map((option: SelectOption) => String(option.value)) : [];
      const studentNames = newValue ? newValue.map((option: SelectOption) => option.label) : [];
      
      setFormData(prev => ({
        ...prev,
        student_list_ids: studentIds,
        student_list_names: studentNames
      }));
    }
  };

  const handleGroupSelection = async (newValue: any) => {
    if (!newValue || !Array.isArray(newValue)) return;

    const newGroups: UserGroup[] = [];
    let allStudentIds = [...formData.student_list_ids];
    let allStudentNames = [...formData.student_list_names];

    for (const groupOption of newValue) {
      if (groupOption.group_data) {
        const groupData = groupOption.group_data;
        
        const isAlreadySelected = selectedGroups.some(g => g.id === groupData.id);
        if (!isAlreadySelected) {
          newGroups.push({
            id: groupData.id,
            name: groupData.name,
            role: 'student',
            status: 1,
            id_list: groupData.id_list.map(String),
            user_names: groupData.user_names
          });

          groupData.id_list.forEach((studentId: number, index: number) => {
            const studentIdStr = String(studentId);
            if (!allStudentIds.includes(studentIdStr)) {
              allStudentIds.push(studentIdStr);
              allStudentNames.push(groupData.user_names[index]);
            }
          });
        }
      }
    }

    setSelectedGroups(prev => [...prev, ...newGroups]);
    setFormData(prev => ({
      ...prev,
      student_list_ids: allStudentIds,
      student_list_names: allStudentNames
    }));

    const newStudentOptions = allStudentIds.map((id, index) => ({
      label: allStudentNames[index],
      value: id
    }));
    setSelectedStudents(newStudentOptions);
  };

  const handleRemoveGroup = (groupId: number) => {
    const groupToRemove = selectedGroups.find(g => g.id === groupId);
    if (!groupToRemove) return;

    const otherGroupsStudents = selectedGroups
      .filter(g => g.id !== groupId)
      .flatMap(g => g.id_list);

    const studentsToKeep = formData.student_list_ids.filter(id => 
      otherGroupsStudents.includes(id) || 
      !groupToRemove.id_list.includes(id)
    );

    const namesToKeep = formData.student_list_names.filter((_, index) => 
      studentsToKeep.includes(formData.student_list_ids[index])
    );

    const updatedStudentOptions = selectedStudents.filter(student => 
      studentsToKeep.includes(String(student.value))
    );
    
    setSelectedStudents(updatedStudentOptions);
    setSelectedGroups(prev => prev.filter(g => g.id !== groupId));
    setFormData(prev => ({
      ...prev,
      student_list_ids: studentsToKeep,
      student_list_names: namesToKeep
    }));
  };

  const handleSubmit = async () => {
    if (!canUserEdit()) {
      setError('Anda tidak memiliki hak untuk mengedit kelas ini');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate form
      const requiredFields = ['name', 'course_id', 'start_date', 'end_date'];
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          const fieldNames = {
            name: 'nama kelas',
            course_id: 'mata pelajaran',
            start_date: 'waktu mulai',
            end_date: 'waktu selesai'
          };
          throw new Error(`Mohon lengkapi ${fieldNames[field]}`);
        }
      }

      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        throw new Error('Waktu selesai harus lebih besar dari waktu mulai');
      }

      // Validate meeting URL for online classes
      if (formData.class_mode === 'online' && !formData.meeting_url.trim()) {
        throw new Error('URL meeting diperlukan untuk kelas online');
      }

      if (formData.class_mode === 'online' && formData.meeting_url.trim()) {
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(formData.meeting_url.trim())) {
          throw new Error('Format URL meeting tidak valid. Harus dimulai dengan http:// atau https://');
        }
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        course_id: formData.course_id,
        description: formData.description,
        teacher_id: formData.teacher_id,
        student_list_ids: formData.student_list_ids.map(id => parseInt(id)),
        start_time: new Date(formData.start_date),
        end_time: new Date(formData.end_date),
        event_id: editingData.event_id,
        class_mode: formData.class_mode,
        meeting_url: formData.class_mode === 'online' ? formData.meeting_url.trim() : null
      };

      const response = await fetch(`${API_URL}/classes/${editingData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengupdate kelas');
      }

      const result = await response.json();
      onSave(result);
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data
    setFormData({
      name: '',
      course_id: 0,
      course_name: '',
      description: '',
      teacher_id: '',
      teacher_name: '',
      student_list_ids: [],
      student_list_names: [],
      start_date: '',
      end_date: '',
      class_mode: 'offline',
      meeting_url: '',
      approval_status: 'approved'
    });
    
    // Reset field states
    setSelectedCourse(null);
    setSelectedTeacher(null);
    setSelectedStudents([]);
    setSelectedGroups([]);
    setIsGroupSearch(false);
    
    // Reset options and search states
    setCourseOptions([]);
    setTeacherOptions([]);
    setStudentOptions([]);
    setCourseSearchTerm('');
    setTeacherSearchTerm('');
    setStudentSearchTerm('');
    
    setError('');
    onClose();
  };

  // Don't render if no editing data or user can't edit
  if (!editingData || !canUserEdit()) {
    return null;
  }

  const bottomButtons = [
    {
      action: 'cancel' as const,
      text: 'Batal',
      onClick: handleClose,
      disabled: isLoading
    },
    {
      action: 'save' as const,
      text: isLoading ? 'Menyimpan...' : 'Simpan Perubahan',
      onClick: handleSubmit,
      disabled: isLoading,
      loading: isLoading
    }
  ];

  return (
    <LearningModal
      show={isOpen}
      onHide={handleClose}
      title="Edit Kelas"
      subtitle={`Mengedit kelas "${editingData.name}"`}
      icon={<BookOpen className="tw-w-5 tw-h-5" />}
      size="lg"
      width="110vw"
      height="120vh"
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={false}
    >
      {error && (
        <Alert variant="danger" className="tw-mb-4">
          {error}
        </Alert>
      )}

      {/* Class Status Info */}
      <Alert variant="info" className="tw-mb-4">
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-2 tw-text-sm">
          <div>
            <strong>Status Kelas:</strong> 
            <span className={`tw-ml-1 tw-px-2 tw-py-1 tw-rounded tw-text-xs ${
              editingData.status === 'Started' ? 'tw-bg-green-100 tw-text-green-800' :
              editingData.status === 'Finished' ? 'tw-bg-blue-100 tw-text-blue-800' :
              'tw-bg-gray-100 tw-text-gray-800'
            }`}>
              {editingData.status}
            </span>
          </div>
          <div>
            <strong>Persetujuan:</strong>
            <span className={`tw-ml-1 tw-px-2 tw-py-1 tw-rounded tw-text-xs ${
              formData.approval_status === 'approved' ? 'tw-bg-green-100 tw-text-green-800' :
              formData.approval_status === 'need_approve' ? 'tw-bg-yellow-100 tw-text-yellow-800' :
              'tw-bg-red-100 tw-text-red-800'
            }`}>
              {formData.approval_status === 'approved' ? 'Disetujui' :
               formData.approval_status === 'need_approve' ? 'Menunggu' : 'Ditolak'}
            </span>
          </div>
          <div>
            <strong>Mode:</strong>
            <span className={`tw-ml-1 tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-flex tw-items-center tw-gap-1 tw-inline-flex ${
              formData.class_mode === 'online' ? 'tw-bg-blue-100 tw-text-blue-800' : 'tw-bg-green-100 tw-text-green-800'
            }`}>
              {formData.class_mode === 'online' ? <Video size={12} /> : <MapPin size={12} />}
              {formData.class_mode === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </Alert>

      <div className="tw-space-y-6">
        <Row>
          <Col md={6}>
            <ShortFormField
              label="Nama Kelas"
              value={formData.name}
              onChange={handleNameChange}
              required={true}
              loading={isLoading}
            />
          </Col>
          <Col md={6}>
            <SearchSingleField
              label="Mata Pelajaran"
              value={selectedCourse}
              options={courseOptions}
              onChange={handleCourseChange}
              onInputChange={(searchTerm) => {
                setCourseSearchTerm(searchTerm);
              }}
              isLoading={courseLoading}
              required={true}
              icon={<BookOpen className="tw-w-4 tw-h-4" />}
              debounceMs={300}
            />
          </Col>
        </Row>

        <WideFormField
          label="Deskripsi Kelas"
          value={formData.description}
          onChange={handleDescriptionChange}
          loading={isLoading}
        />

        {/* Class Mode Selection */}
        <div className="tw-space-y-3">
          <label className="tw-font-semibold tw-text-purple-700 tw-mb-3 tw-block">
            Mode Kelas: <span className="tw-text-red-500">*</span>
          </label>
          <div className="tw-flex tw-gap-3">
            <ButtonGradient
              action={formData.class_mode === 'offline' ? 'done' : 'custom'}
              size="md"
              customText="Offline"
              customIcon={<MapPin className="tw-w-4 tw-h-4" />}
              onClick={() => setFormData(prev => ({ ...prev, class_mode: 'offline', meeting_url: '' }))}
              disabled={isLoading}
              className={`tw-flex-1 ${formData.class_mode === 'offline' ? '' : 'tw-opacity-60'}`}
            />
            <ButtonGradient
              action={formData.class_mode === 'online' ? 'done' : 'custom'}
              size="md"
              customText="Online"
              customIcon={<Video className="tw-w-4 tw-h-4" />}
              onClick={() => setFormData(prev => ({ ...prev, class_mode: 'online' }))}
              disabled={isLoading}
              className={`tw-flex-1 ${formData.class_mode === 'online' ? '' : 'tw-opacity-60'}`}
            />
          </div>
          <small className="tw-text-gray-500 tw-text-sm">
            {formData.class_mode === 'online' 
              ? 'Kelas online dapat di-Go Live dan memerlukan URL meeting' 
              : 'Kelas offline tidak dapat di-Go Live'}
          </small>
        </div>

        {/* Meeting URL Input - Only for online classes */}
        {formData.class_mode === 'online' && (
          <div className="tw-space-y-2">
            <label className="tw-font-semibold tw-text-purple-700">
              URL Meeting <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.meeting_url}
              onChange={handleMeetingUrlChange}
              placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
              disabled={isLoading}
              required
              className="tw-w-full tw-p-3 tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800"
            />
            <small className="tw-text-gray-500 tw-text-sm">
              URL meeting untuk kelas online (Zoom, Google Meet, Microsoft Teams, dll.)
            </small>
          </div>
        )}

        {/* Teacher Selection - Only for admin and if class not started */}
        {userRole === 'admin' && editingData.status === 'Not Start' && (
          <SearchSingleField
            label="Guru/Pengajar"
            value={selectedTeacher}
            options={teacherOptions}
            onChange={handleTeacherChange}
            onInputChange={(searchTerm) => {
              setTeacherSearchTerm(searchTerm);
            }}
            isLoading={teacherLoading}
            required={true}
            icon={<UserCheck className="tw-w-4 tw-h-4" />}
            debounceMs={300}
          />
        )}

        {/* Teacher Display for other roles */}
        {(userRole !== 'admin' || editingData.status !== 'Not Start') && (
          <div className="tw-space-y-2">
            <label className="tw-font-semibold tw-text-purple-700 tw-flex tw-items-center tw-gap-2">
              <UserCheck className="tw-w-4 tw-h-4" />
              Guru/Pengajar
            </label>
            <div className="tw-p-3 tw-bg-green-50 tw-border-2 tw-border-green-200 tw-rounded-xl">
              <div className="tw-flex tw-items-center tw-gap-2">
                <div className="tw-w-8 tw-h-8 tw-bg-green-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
                  <UserCheck size={16} />
                </div>
                <span className="tw-font-medium tw-text-green-800">
                  {formData.teacher_name || 'Belum Ditentukan'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Student List Management */}
        <div className="tw-space-y-3">
          <div className="tw-flex tw-items-center tw-justify-between">
            <label className="tw-font-semibold tw-text-purple-700 tw-flex tw-items-center tw-gap-2">
              <Users className="tw-w-4 tw-h-4" />
              Daftar Siswa
            </label>
            
            <ButtonGradient
              action={isGroupSearch ? 'apply' : 'custom'}
              size="sm"
              customText={isGroupSearch ? 'Mode Grup' : 'Mode Individual'}
              onClick={() => {
                setIsGroupSearch(!isGroupSearch);
                setStudentOptions([]);
                setStudentSearchTerm('');
              }}
              disabled={isLoading}
            />
          </div>

          {/* Selected Groups Display */}
          {selectedGroups.length > 0 && (
            <div className="tw-space-y-2">
              <div className="tw-text-sm tw-text-purple-600 tw-font-medium">Grup Terpilih:</div>
              <div className="tw-flex tw-flex-wrap tw-gap-2">
                {selectedGroups.map(group => (
                  <Badge key={group.id} bg="info" className="tw-p-2 tw-flex tw-items-center tw-gap-2">
                    <span>{group.name} ({group.user_names.length} siswa)</span>
                    <BootstrapButton 
                      variant="link" 
                      className="tw-text-white tw-p-0 tw-ml-1" 
                      onClick={() => handleRemoveGroup(group.id)}
                    >
                      ×
                    </BootstrapButton>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <SearchMultipleField
            label={isGroupSearch ? "Cari Grup Siswa" : "Cari Siswa Individual"}
            value={selectedStudents}
            options={studentOptions}
            onChange={handleStudentChange}
            onInputChange={(searchTerm) => {
              setStudentSearchTerm(searchTerm);
            }}
            isLoading={studentLoading}
            placeholder={isGroupSearch ? "Ketik nama grup..." : "Ketik nama siswa..."}
            icon={<Users className="tw-w-4 tw-h-4" />}
            debounceMs={300}
          />
        </div>

        {/* Schedule */}
        <Row>
          <Col md={6}>
            <div className="tw-space-y-2">
              <label className="tw-font-semibold tw-text-purple-700 tw-flex tw-items-center tw-gap-2">
                <Calendar className="tw-w-4 tw-h-4" />
                Waktu Mulai *
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={handleStartDateChange}
                disabled={isLoading || editingData.status === 'Started' || editingData.status === 'Finished'}
                required
                className="tw-w-full tw-p-3 tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800"
              />
              {(editingData.status === 'Started' || editingData.status === 'Finished') && (
                <small className="tw-text-orange-600">Kelas yang sudah dimulai tidak dapat mengubah jadwal</small>
              )}
            </div>
          </Col>
          <Col md={6}>
            <div className="tw-space-y-2">
              <label className="tw-font-semibold tw-text-purple-700 tw-flex tw-items-center tw-gap-2">
                <Clock className="tw-w-4 tw-h-4" />
                Waktu Selesai *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={handleEndDateChange}
                disabled={isLoading || editingData.status === 'Started' || editingData.status === 'Finished'}
                required
                className="tw-w-full tw-p-3 tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800"
              />
            </div>
          </Col>
        </Row>

        {/* Summary Section */}
        <div className="tw-bg-purple-50 tw-rounded-xl tw-p-4 tw-border-2 tw-border-purple-200">
          <h4 className="tw-text-purple-700 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-gap-2">
            <BookOpen className="tw-w-4 tw-h-4" />
            Ringkasan Perubahan
          </h4>
          <div className="tw-space-y-2 tw-text-sm">
            <div><span className="tw-font-medium">Nama:</span> {formData.name}</div>
            {selectedCourse && (
              <div><span className="tw-font-medium">Mata Pelajaran:</span> {selectedCourse.label}</div>
            )}
            <div>
              <span className="tw-font-medium">Mode:</span> 
              <span className={`tw-ml-1 tw-px-2 tw-py-1 tw-rounded tw-text-xs ${
                formData.class_mode === 'online' 
                  ? 'tw-bg-blue-100 tw-text-blue-800' 
                  : 'tw-bg-green-100 tw-text-green-800'
              }`}>
                {formData.class_mode === 'online' ? (
                  <><Video size={12} className="tw-inline tw-mr-1" />Online</>
                ) : (
                  <><MapPin size={12} className="tw-inline tw-mr-1" />Offline</>
                )}
              </span>
            </div>
            {formData.class_mode === 'online' && formData.meeting_url && (
              <div><span className="tw-font-medium">URL Meeting:</span> {formData.meeting_url}</div>
            )}
            <div><span className="tw-font-medium">Guru:</span> {formData.teacher_name || 'Belum Ditentukan'}</div>
            <div><span className="tw-font-medium">Jumlah Siswa:</span> {selectedStudents.length} siswa</div>
            {selectedGroups.length > 0 && (
              <div><span className="tw-font-medium">Grup:</span> {selectedGroups.length} grup dipilih</div>
            )}
            {formData.start_date && formData.end_date && (
              <div>
                <span className="tw-font-medium">Jadwal:</span> 
                {' '}{new Date(formData.start_date).toLocaleString('id-ID')}
                {' '} - {' '}
                {new Date(formData.end_date).toLocaleString('id-ID')}
              </div>
            )}
          </div>
        </div>
      </div>
    </LearningModal>
  );
};

export default EditClassModal;