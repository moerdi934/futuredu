'use client';

/**
 * ./AddExamScheduleModal.tsx
 * --------------------------------------------------------------------------
 * Modal "Tambah Jadwal Ujian" – Complete Fixed Version
 * Menggunakan ModalTemplate dan enhanced FormComponentLayout components
 * --------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import {
  Form,
  Row,
  Col,
  Card,
  Alert
} from 'react-bootstrap';
import axios from 'axios';
import debounce from 'lodash/debounce';

import {
  SearchSingleField,
  SearchMultipleField,
  DateRangeField,
  ShortFormField,
  WideFormField,
  YesNoField
} from '../../../../components/form/FormComponentLayout';

import {
  FileText,
  AlignLeft,
  Calendar,
  BookOpen,
  List,
  Zap,
  Check,
  X,
  Settings,
  Shuffle,
  Award,
  PlusCircle,
  Trash2,
  RotateCcw,
  XCircle,
  CheckCircle,
  Gift,
  AlertCircle
} from 'lucide-react';

import { LearningModal, ModalButton } from '../../../../components/modal/ModalTemplate';
import CreateExamModal, { SelectOption } from './AddExamModal';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
interface AddExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
}

interface FormErrors {
  name?: string;
  examType?: string;
  examGroup?: string;
  exams?: string;
  dateRange?: string;
  api?: string;
  [k: string]: string | undefined;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
const AddExamScheduleModal: React.FC<AddExamScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  /* -------------------------- State ---------------------------------- */
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');

  const [examGroup, setExamGroup]     = useState<SelectOption | null>(null);
  const [examType,  setExamType]      = useState<SelectOption | null>(null);

  const [isFree,  setIsFree]          = useState(false);
  const [isValid, setIsValid]         = useState(true);

  const [selectedExams, setSelected]  = useState<SelectOption[]>([]);
  const [customExams,   setCustom]    = useState<any[]>([]);

  const [startTime, setStart]         = useState<Date | null>(null);
  const [endTime,   setEnd]           = useState<Date | null>(null);
  const [anytime,   setAnytime]       = useState(false);

  const [autoSwitchExam,  setAuto]    = useState(false);
  const [randomExamOrder, setRandom]  = useState(false);
  const [weightedScore,   setWeighted]= useState(false);

  /* opsi dropdown */
  const [examGroups, setExamGroups]   = useState<SelectOption[]>([]);
  const [examTypes,  setExamTypes]    = useState<SelectOption[]>([]);
  const [examOptions,setExamOptions]  = useState<SelectOption[]>([]);

  const [lg,setLG] = useState(false);
  const [lt,setLT] = useState(false);
  const [le,setLE] = useState(false);

  const [errors, setErrors]           = useState<FormErrors>({});
  const [saving, setSaving]           = useState(false);

  const [showCreate, setShowCreate]   = useState(false);
  
  // Track changes for modal
  const [hasChanges, setHasChanges]   = useState(false);

  /* ---------------------- Check for changes --------------------------- */
  useEffect(() => {
    const hasData = name.trim() || 
                   description.trim() || 
                   examGroup !== null || 
                   examType !== null ||
                   selectedExams.length > 0 ||
                   customExams.length > 0 ||
                   startTime !== null ||
                   endTime !== null ||
                   !isValid || // default true, so false means changed
                   isFree || // default false, so true means changed
                   autoSwitchExam ||
                   randomExamOrder ||
                   weightedScore;
    setHasChanges(hasData);
  }, [name, description, examGroup, examType, selectedExams, customExams, 
      startTime, endTime, isValid, isFree, autoSwitchExam, randomExamOrder, weightedScore]);

  /* ---------------------- Clear specific error when field changes ----- */
  useEffect(() => {
    if (examType && errors.examType) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.examType;
        return newErrors;
      });
    }
  }, [examType]);

  useEffect(() => {
    if (examGroup && errors.examGroup) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.examGroup;
        return newErrors;
      });
    }
  }, [examGroup]);

  useEffect(() => {
    if (name.trim() && errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  }, [name]);

  useEffect(() => {
    if ((selectedExams.length > 0 || customExams.length > 0) && errors.exams) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.exams;
        return newErrors;
      });
    }
  }, [selectedExams, customExams]);

  useEffect(() => {
    if ((anytime || (startTime && endTime)) && errors.dateRange) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dateRange;
        return newErrors;
      });
    }
  }, [anytime, startTime, endTime]);

  /* ---------------------- Fetch helpers ------------------------------ */
  const fetchGroups = async (q='') => {
    setLG(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?kind=0`,
        { params: { search: q, limit: 10 } }
      );
      const raw = data.data || data.examTypes || [];
      const groups = raw.map((g:any):SelectOption=>({
        value: g.id,
        label: g.name || g.exam_type || `Grup #${g.id}`,
        _raw : g
      }));
      setExamGroups(groups);
      console.log('✅ Fetched exam groups:', groups);
    } catch (error) {
      console.error('❌ Failed to fetch exam groups:', error);
      setExamGroups([]);
    } finally { 
      setLG(false); 
    }
  };

  const fetchTypes = async (q='') => {
    setLT(true);
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}` : '';
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/productType/filters/exam_type${qs}`
      );
      const types = (data.examTypes || []).map((t:any):SelectOption=>({
        value: t.id,
        label: t.name ?? t.exam_type,
        _raw: t
      }));
      setExamTypes(types);
      console.log('✅ Fetched exam types:', types);
    } catch (error) {
      console.error('❌ Failed to fetch exam types:', error);
      setExamTypes([]);
    } finally { 
      setLT(false); 
    }
  };

  const fetchExams = async (q='') => {
    setLE(true);
    try {
      // Build URL with search and selected_ids parameters
      const selectedIds = selectedExams.map(exam => exam.value).filter(Boolean);
      const params = new URLSearchParams();
      
      if (q.trim()) {
        params.set('query', q.trim());
      }
      
      if (selectedIds.length > 0) {
        params.set('selected_ids', selectedIds.join(','));
      }
      
      params.set('limit', '20');
      
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/exam/search?${params.toString()}`
      );
      
      const exams = (data.data || []).map((e:any):SelectOption=>({
        value: e.id,
        label: `${e.id} - ${e.name}`,
        _raw : e
      }));
      setExamOptions(exams);
      console.log('✅ Fetched exams:', exams.length);
    } catch (error) {
      console.error('❌ Failed to fetch exams:', error);
      setExamOptions([]);
    } finally { 
      setLE(false); 
    }
  };

  const dFetchGroups = debounce(fetchGroups, 300);
  const dFetchTypes  = debounce(fetchTypes,  300);
  const dFetchExams  = debounce(fetchExams,  500);

  /* initial load setiap kali modal dibuka */
  useEffect(() => {
    if (isOpen) {
      console.log('📂 Modal opened, fetching initial data...');
      fetchGroups('');
      fetchTypes('');
      fetchExams('');
    } else {
      // Reset saat modal ditutup
      console.log('🚪 Modal closed');
    }
  }, [isOpen]);

  // Refetch exams when selectedExams changes
  useEffect(() => {
    if (isOpen && selectedExams.length > 0) {
      console.log('🔄 Selected exams changed, refetching...');
      fetchExams('');
    }
  }, [selectedExams.length, isOpen]);

  /* ------------------------- Reset helper ---------------------------- */
  const resetForm = () => {
    console.log('🔄 Resetting form...');
    setName(''); 
    setDescription('');
    setExamGroup(null); 
    setExamType(null);
    setIsFree(false); 
    setIsValid(true);
    setSelected([]); 
    setCustom([]);
    setStart(null); 
    setEnd(null); 
    setAnytime(false);
    setAuto(false); 
    setRandom(false); 
    setWeighted(false);
    setErrors({}); 
    setSaving(false);
    setHasChanges(false);
  };

  /* --------------------------- Validation ---------------------------- */
  const validateForm = (): FormErrors => {
    const v: FormErrors = {};
    
    if (!name.trim()) {
      v.name = 'Nama Jadwal wajib diisi';
    }
    
    if (!examGroup) {
      v.examGroup = 'Grup Ujian wajib dipilih';
    }
    
    if (!examType) {
      v.examType = 'Tipe ujian wajib dipilih';
    }
    
    if (selectedExams.length === 0 && customExams.length === 0) {
      v.exams = 'Minimal satu ujian dipilih / dibuat';
    }
    
    if (!anytime && (!startTime || !endTime)) {
      v.dateRange = 'Rentang waktu wajib diisi';
    }
    
    if (!anytime && startTime && endTime && startTime >= endTime) {
      v.dateRange = 'Waktu mulai harus lebih awal dari waktu selesai';
    }
    
    return v;
  };

  /* --------------------------- Submit ------------------------------- */
  const handleSubmit = async () => {
    console.log('📤 Starting form submission...');
    
    // Clear previous API errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.api;
      return newErrors;
    });
    
    // Validate form
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    console.log('✅ Validation passed');

    /* -------- id ujian unik (tanpa duplikat) -------- */
    const examIds = Array.from(new Set([
      ...selectedExams.map(e => e.value),
      ...customExams.map(e => e.id)
    ]));

    console.log('📋 Exam IDs:', examIds);

    setSaving(true);
    
    try {
      // Pastikan exam_type dalam format yang benar
      const examTypeValue = typeof examType!.value === 'number' 
        ? examType!.value 
        : parseInt(String(examType!.value), 10);

      // Pastikan exam_group_id dalam format yang benar
      const examGroupValue = typeof examGroup!.value === 'number' 
        ? examGroup!.value 
        : parseInt(String(examGroup!.value), 10);

      const payload = {
        name           : name.trim(),
        description    : description.trim(),
        exam_type      : examTypeValue,
        exam_group_id  : examGroupValue,
        isfree         : isFree,
        is_valid       : isValid,
        type           : anytime ? 1999 : 3,
        start_time     : anytime ? null : startTime!.toISOString(),
        end_time       : anytime ? null : endTime!.toISOString(),
        exam_id_list   : examIds,
        is_auto_move          : autoSwitchExam,
        is_need_order_exam    : randomExamOrder,
        is_need_weighted_score: weightedScore
      };

      // Debug log untuk melihat payload yang dikirim
      console.log('📦 Submitting payload:', payload);
      console.log('📝 Exam Type details:', {
        original: examType,
        value: examTypeValue,
        type: typeof examTypeValue
      });
      console.log('👥 Exam Group details:', {
        original: examGroup,
        value: examGroupValue,
        type: typeof examGroupValue
      });

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/exam-schedules`, 
        payload
      );
      
      console.log('✅ Success! Response:', data);
      
      onSave(data);
      resetForm(); 
      onClose();
    } catch (error: any) { 
      console.error('❌ Submit error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Extract error message
      let errorMessage = 'Gagal menyimpan jadwal ujian. Silakan coba lagi.';
      
      if (error.response?.data) {
        const responseData = error.response.data;
        errorMessage = responseData.message || 
                      responseData.error || 
                      responseData.msg ||
                      JSON.stringify(responseData);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ 
        api: errorMessage
      });
    } finally { 
      setSaving(false); 
    }
  };

  /* gabungkan opsi server + ujian kustom */
  const allExamOptions: SelectOption[] = [
    ...examOptions,
    ...customExams.map((ex:any):SelectOption=>({
      value: ex.id,
      label: `[BARU] ${ex.id} - ${ex.name}`,
      _raw : ex
    }))
  ];

  // Total selected exams count
  const totalSelectedExams = selectedExams.length + customExams.length;

  /* ---------------------- Modal Buttons ------------------------------- */
  const topButtons: ModalButton[] = [
    {
      action: 'reset',
      text: 'Reset Form',
      icon: <RotateCcw className="tw-w-4 tw-h-4" />,
      onClick: () => {
        if (hasChanges) {
          if (window.confirm('Yakin ingin mereset form? Semua perubahan akan hilang.')) {
            resetForm();
          }
        } else {
          resetForm();
        }
      },
      disabled: !hasChanges || saving,
      size: 'sm',
      customColors: {
        primary: '#F59E0B',
        secondary: '#D97706',
        gradient1: '#F59E0B',
        gradient2: '#FBBF24',
        text: '#FFFFFF'
      }
    }
  ];

  const bottomButtons: ModalButton[] = [
    ...(hasChanges ? [{
      action: 'cancel' as const,
      text: 'Batal',
      icon: <X className="tw-w-4 tw-h-4" />,
      onClick: () => {
        if (window.confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup?')) {
          resetForm();
          onClose();
        }
      },
      disabled: saving,
      customColors: {
        primary: '#6B7280',
        secondary: '#4B5563',
        gradient1: '#6B7280',
        gradient2: '#9CA3AF',
        text: '#FFFFFF'
      }
    }] : [{
      action: 'cancel' as const,
      text: 'Tutup',
      icon: <X className="tw-w-4 tw-h-4" />,
      onClick: onClose,
      disabled: saving,
      customColors: {
        primary: '#6B7280',
        secondary: '#4B5563',
        gradient1: '#6B7280',
        gradient2: '#9CA3AF',
        text: '#FFFFFF'
      }
    }]),
    {
      action: 'save',
      text: saving ? 'Menyimpan...' : 'Simpan Jadwal',
      icon: <Check className="tw-w-4 tw-h-4" />,
      onClick: handleSubmit,
      disabled: saving,
      loading: saving,
      customColors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        gradient1: '#8B5CF6',
        gradient2: '#A855F7',
        text: '#FFFFFF'
      }
    }
  ];

  /* ----------------------- Render ----------------------------------- */
  return (
    <>
      <LearningModal
        show={isOpen}
        onHide={hasChanges ? () => {
          if (window.confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup?')) {
            resetForm();
            onClose();
          }
        } : onClose}
        title="Buat Jadwal Ujian Baru"
        subtitle={`${totalSelectedExams} ujian dipilih • ${hasChanges ? 'Ada perubahan' : 'Belum ada perubahan'}`}
        icon={<Calendar className="tw-w-5 tw-h-5" />}
        size="xl"
        width="110vw"
        height="120vh"
        scrollable={true}
        topButtons={topButtons}
        bottomButtons={bottomButtons}
        preventCloseOnOutsideClick={hasChanges}
      >
        <div className="tw-space-y-6">
          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="danger" className="tw-mb-4">
              <div className="tw-flex tw-items-start tw-gap-3">
                <XCircle className="tw-w-5 tw-h-5 tw-text-red-500 tw-flex-shrink-0 tw-mt-0.5" />
                <div className="tw-flex-1">
                  <div className="tw-font-semibold tw-text-red-700 tw-mb-2">
                    Terdapat kesalahan pada form:
                  </div>
                  <ul className="tw-list-disc tw-list-inside tw-space-y-1">
                    {Object.entries(errors).map(([key, value], i) => (
                      <li key={i} className="tw-text-red-700 tw-text-sm">
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Alert>
          )}

          <Form>
            {/* -------- Nama, Grup, Tipe -------- */}
            <Row className="tw-mb-6">
              <Col md={4}>
                <ShortFormField
                  label="Nama Jadwal"
                  value={name}
                  onChange={(e) => {
                    console.log('📝 Name changed:', e.target.value);
                    setName(e.target.value);
                  }}
                  error={errors.name}
                  required
                  placeholder="Masukkan nama jadwal..."
                />
              </Col>

              <Col md={4}>
                <SearchSingleField
                  label="Grup Ujian"
                  value={examGroup}
                  options={examGroups}
                  onChange={(newValue) => {
                    console.log('👥 Exam group changed:', newValue);
                    setExamGroup(newValue);
                  }}
                  onInputChange={dFetchGroups}
                  isLoading={lg}
                  icon={<Award size={16}/>}
                  required
                  error={errors.examGroup}
                  placeholder="Pilih grup ujian..."
                />
              </Col>

              <Col md={4}>
                <SearchSingleField
                  label="Tipe Ujian"
                  value={examType}
                  options={examTypes}
                  onChange={(newValue) => {
                    console.log('📚 Exam type changed:', newValue);
                    setExamType(newValue);
                  }}
                  onInputChange={dFetchTypes}
                  isLoading={lt}
                  icon={<BookOpen size={16}/>}
                  required
                  error={errors.examType}
                  placeholder="Pilih tipe ujian..."
                />
              </Col>
            </Row>

            {/* Debug Info - Hapus setelah testing */}
            {(examGroup || examType) && (
              <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-3 tw-mb-4">
                <div className="tw-text-xs tw-text-blue-700 tw-font-mono">
                  <div className="tw-font-semibold tw-mb-1">Debug Info:</div>
                  {examGroup && (
                    <div>Grup: {examGroup.label} (ID: {examGroup.value}, Type: {typeof examGroup.value})</div>
                  )}
                  {examType && (
                    <div>Tipe: {examType.label} (ID: {examType.value}, Type: {typeof examType.value})</div>
                  )}
                </div>
              </div>
            )}

            {/* -------- Deskripsi -------- */}
            <WideFormField
              label="Deskripsi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi jadwal (opsional)..."
            />

            {/* -------- Waktu -------- */}
            <DateRangeField
              label="Waktu Pelaksanaan"
              startDate={startTime}
              endDate={endTime}
              onStartDateChange={(date) => {
                console.log('📅 Start time changed:', date);
                setStart(date);
              }}
              onEndDateChange={(date) => {
                console.log('📅 End time changed:', date);
                setEnd(date);
              }}
              anytime={anytime}
              onAnytimeChange={(checked) => {
                console.log('⏰ Anytime changed:', checked);
                setAnytime(checked);
              }}
              error={errors.dateRange}
              required
              icon={<Calendar size={16}/>}
            />

            {/* -------- Enhanced Option Cards using YesNoField -------- */}
            <div className="tw-mb-6">
              <h4 className="tw-text-purple-700 tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-gap-2">
                <Settings size={16}/> Pengaturan Jadwal
              </h4>
              <Row className="tw-g-3">
                <Col md={6} lg={4}>
                  <YesNoField
                    label="Gratis"
                    checked={isFree}
                    onChange={(checked) => {
                      console.log('💰 Free status changed:', checked);
                      setIsFree(checked);
                    }}
                    icon={<Gift size={16} />}
                    color="tw-text-purple-700"
                    selectedColor="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 tw-text-white"
                    yesText="Gratis"
                    noText="Berbayar"
                    variant="card"
                    description="Apakah jadwal ujian ini gratis atau berbayar?"
                  />
                </Col>
                <Col md={6} lg={4}>
                  <YesNoField
                    label="Status Aktif"
                    checked={isValid}
                    onChange={(checked) => {
                      console.log('✅ Valid status changed:', checked);
                      setIsValid(checked);
                    }}
                    icon={<CheckCircle size={16} />}
                    color="tw-text-purple-700"
                    selectedColor="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 tw-text-white"
                    yesText="Aktif"
                    noText="Nonaktif"
                    variant="card"
                    description="Status ketersediaan jadwal ujian"
                  />
                </Col>
                <Col md={6} lg={4}>
                  <YesNoField
                    label="Berpindah Ujian Otomatis"
                    checked={autoSwitchExam}
                    onChange={(checked) => {
                      console.log('⚡ Auto switch changed:', checked);
                      setAuto(checked);
                    }}
                    icon={<Zap size={16} />}
                    color="tw-text-purple-700"
                    selectedColor="tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-500 tw-text-white"
                    yesText="Otomatis"
                    noText="Manual"
                    variant="card"
                    description="Berpindah ke ujian berikutnya secara otomatis"
                  />
                </Col>
                <Col md={6} lg={4}>
                  <YesNoField
                    label="Acak Urutan Ujian"
                    checked={randomExamOrder}
                    onChange={(checked) => {
                      console.log('🔀 Random order changed:', checked);
                      setRandom(checked);
                    }}
                    icon={<Shuffle size={16} />}
                    color="tw-text-purple-700"
                    selectedColor="tw-bg-gradient-to-r tw-from-orange-500 tw-to-red-500 tw-text-white"
                    yesText="Acak"
                    noText="Berurutan"
                    variant="card"
                    description="Mengacak urutan ujian untuk setiap peserta"
                  />
                </Col>
                <Col md={6} lg={4}>
                  <YesNoField
                    label="Pembobotan Nilai"
                    checked={weightedScore}
                    onChange={(checked) => {
                      console.log('⚖️ Weighted score changed:', checked);
                      setWeighted(checked);
                    }}
                    icon={<Award size={16} />}
                    color="tw-text-purple-700"
                    selectedColor="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-text-white"
                    yesText="Ya"
                    noText="Tidak"
                    variant="card"
                    description="Menggunakan pembobotan dalam penilaian"
                  />
                </Col>
              </Row>
            </div>

            {/* --------- Pilih Ujian --------- */}
            <SearchMultipleField
              label="Ujian Terkait"
              value={selectedExams}
              options={allExamOptions}
              onChange={(selected) => {
                console.log('📝 Selected exams changed:', selected);
                setSelected(selected);
              }}
              onInputChange={dFetchExams}
              isLoading={le}
              error={errors.exams}
              required
              icon={<List size={16}/>}
              placeholder="Cari dan pilih ujian..."
            />

            {/* --------- Custom Ujian --------- */}
            <div className="tw-mb-6">
              <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-0 tw-flex tw-items-center tw-gap-2">
                  <PlusCircle size={16}/> Buat Ujian Baru
                </Form.Label>
                <button
                  type="button"
                  onClick={() => {
                    console.log('➕ Opening create exam modal...');
                    setShowCreate(true);
                  }}
                  className="tw-px-4 tw-py-2 tw-bg-gradient-to-r tw-from-green-600 tw-to-emerald-600 tw-text-white tw-rounded-lg tw-font-semibold tw-shadow-lg hover:tw-scale-105 tw-transition-transform tw-flex tw-items-center tw-gap-2"
                  disabled={saving}
                >
                  <PlusCircle size={16}/> Buat Ujian
                </button>
              </div>

              {customExams.length > 0 && (
                <div className="tw-bg-green-50 tw-border-2 tw-border-green-200 tw-rounded-lg tw-p-4">
                  <div className="tw-font-semibold tw-text-green-700 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                    <CheckCircle size={16} className="tw-text-green-600" />
                    Ujian yang Dibuat ({customExams.length}):
                  </div>
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
                    {customExams.map((ex:any,idx:number)=>{
                      const total = ex.question_id_list?.length ??
                                    ex.question_ids?.length ??
                                    ex.questions?.length ?? 0;
                      return (
                        <div key={idx} className="tw-bg-white tw-border tw-border-green-300 tw-rounded-lg tw-p-3 tw-flex tw-items-center tw-justify-between tw-shadow-sm">
                          <div>
                            <div className="tw-font-semibold tw-text-green-800">{ex.name}</div>
                            <div className="tw-text-sm tw-text-green-600">
                              {ex.duration} menit • {total} soal
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('🗑️ Removing custom exam:', ex.name);
                              setCustom(prev=>prev.filter((_,i)=>i!==idx));
                            }}
                            className="tw-p-2 tw-text-red-500 hover:tw-bg-red-50 tw-rounded-lg tw-transition-colors"
                            disabled={saving}
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Section */}
            {totalSelectedExams > 0 && (
              <div className="tw-bg-purple-50 tw-border tw-border-purple-200 tw-rounded-lg tw-p-4 tw-mb-6">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3">
                  <CheckCircle className="tw-w-5 tw-h-5 tw-text-purple-600" />
                  <span className="tw-font-semibold tw-text-purple-700">
                    Ringkasan Jadwal
                  </span>
                </div>
                <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-text-sm tw-mb-3">
                  <div>
                    <span className="tw-text-purple-600">Total Ujian:</span>
                    <div className="tw-font-semibold tw-text-purple-800">{totalSelectedExams}</div>
                  </div>
                  <div>
                    <span className="tw-text-purple-600">Ujian Existing:</span>
                    <div className="tw-font-semibold tw-text-purple-800">{selectedExams.length}</div>
                  </div>
                  <div>
                    <span className="tw-text-purple-600">Ujian Baru:</span>
                    <div className="tw-font-semibold tw-text-purple-800">{customExams.length}</div>
                  </div>
                  <div>
                    <span className="tw-text-purple-600">Status:</span>
                    <div className={`tw-font-semibold ${isValid ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                      {isValid ? 'Aktif' : 'Tidak Aktif'}
                    </div>
                  </div>
                </div>
                
                {/* Display selected details */}
                {(examGroup || examType) && (
                  <div className="tw-pt-3 tw-border-t tw-border-purple-200">
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3 tw-text-sm">
                      {examGroup && (
                        <div>
                          <span className="tw-text-purple-600">Grup Ujian:</span>
                          <div className="tw-font-semibold tw-text-purple-800">{examGroup.label}</div>
                        </div>
                      )}
                      {examType && (
                        <div>
                          <span className="tw-text-purple-600">Tipe Ujian:</span>
                          <div className="tw-font-semibold tw-text-purple-800">{examType.label}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Changes indicator */}
            {hasChanges && (
              <div className="tw-bg-orange-50 tw-border tw-border-orange-200 tw-rounded-lg tw-p-3">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-orange-700">
                  <AlertCircle className="tw-w-4 tw-h-4" />
                  <span className="tw-font-medium tw-text-sm">
                    Ada perubahan yang belum disimpan
                  </span>
                </div>
              </div>
            )}
          </Form>
        </div>
      </LearningModal>

      {/* ------------ Modal Buat Ujian ------------ */}
      <CreateExamModal
        show={showCreate}
        onClose={() => {
          console.log('🚪 Closing create exam modal...');
          setShowCreate(false);
        }}
        onAddExam={(exam:any) => {
          console.log('✅ New exam created:', exam);
          /* tambahkan ke dropdown & daftar jika belum ada */
          setSelected(prev=>{
            if (prev.some(o => o.value === exam.id)) {
              console.log('⚠️ Exam already in selected list');
              return prev;
            }
            console.log('➕ Adding exam to selected list');
            return [
              ...prev,
              { value: exam.id, label: `[BARU] ${exam.id} - ${exam.name}`, _raw: exam }
            ];
          });
          setCustom(prev => {
            console.log('➕ Adding exam to custom list');
            return [...prev, exam];
          });
        }}
      />
    </>
  );
};

export default AddExamScheduleModal;