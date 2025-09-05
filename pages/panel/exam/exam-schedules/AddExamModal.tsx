'use client';

/**
 * ./AddExamModal.tsx
 * --------------------------------------------------------------------------
 * Modal "Buat Ujian" – menggunakan ModalTemplate dan ButtonTemplate
 * Dengan fitur import CSV untuk soal ujian
 * Updated to use enhanced FormComponentLayout components
 * --------------------------------------------------------------------------
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} from 'react';
import { Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { 
  PlusCircle, 
  Timer, 
  List, 
  Award, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  X,
  Check,
  RotateCcw,
  Settings
} from 'lucide-react';

import { 
  SearchSingleField, 
  SearchMultipleField,
  ShortFormField,
  NumberField,
  OptionCard
} from '../../../../components/form/FormComponentLayout';
import { LearningModal, ModalButton } from '../../../../components/modal/ModalTemplate';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export interface SelectOption {
  value: string | number;
  label: string;
  _raw?: any;
}

interface CreateExamModalProps {
  show: boolean;
  onClose: () => void;
  onAddExam: (exam: any) => void;
}

interface CSVQuestion {
  id: string;
  code: string;
  question_type: string;
  level: string;
}

interface VerifiedQuestion {
  id: string;
  code: string;
  status: string;
  found_code: string;
  is_match: boolean;
}

interface VerificationResponse {
  status: 'success' | 'partial_match' | 'error';
  message: string;
  summary: {
    total: number;
    matched: number;
    id_not_found: number;
    code_mismatched: number;
    success_rate: string;
  };
  data: {
    matched_pairs: VerifiedQuestion[];
    id_not_found: VerifiedQuestion[];
    code_mismatched: VerifiedQuestion[];
  };
}

/* -------------------------------------------------------------------------- */
const CreateExamModal: React.FC<CreateExamModalProps> = ({
  show,
  onClose,
  onAddExam
}) => {
  /* --------------------------- State ---------------------------------- */
  const [examName, setExamName]          = useState('');
  const [duration, setDuration]          = useState<number | ''>('');
  const [selectedQuestions, setSelected] = useState<SelectOption[]>([]);
  const [questionOpts, setQuestionOpts]  = useState<SelectOption[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [examGroup, setExamGroup]        = useState<SelectOption | null>(null);
  const [examGroupOpts, setExamGroupOpts]= useState<SelectOption[]>([]);
  const [loadingGroups, setLoadingGroups]= useState(false);

  const [saving, setSaving]              = useState(false);
  const [errors, setErrors]              = useState<Record<string,string>>({});

  // Question selection mode
  const [questionMode, setQuestionMode]  = useState<'manual' | 'csv'>('manual');

  // CSV Import states
  const [csvFile, setCsvFile]            = useState<File | null>(null);
  const [csvQuestions, setCsvQuestions]  = useState<CSVQuestion[]>([]);
  const [verificationResponse, setVerificationResponse] = useState<VerificationResponse | null>(null);
  const [verifyingCSV, setVerifyingCSV]  = useState(false);
  const [csvVerified, setCsvVerified]    = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  /* ----------------------- Check for changes -------------------------- */
  useEffect(() => {
    const hasData = examName.trim() || 
                   duration !== '' || 
                   examGroup !== null || 
                   selectedQuestions.length > 0 ||
                   csvFile !== null;
    setHasChanges(hasData);
  }, [examName, duration, examGroup, selectedQuestions, csvFile]);

  /* ----------------------- Fetch helpers ------------------------------ */
  const fetchQuestions = async (keyword = '') => {
    setLoadingQuestions(true);
    try {
      // Build URL with search and selected_ids parameters for exclusion
      const selectedIds = selectedQuestions.map(q => q.value).filter(Boolean);
      const params = new URLSearchParams();
      
      if (keyword.trim()) {
        params.set('search', keyword.trim());
      }
      
      if (selectedIds.length > 0) {
        params.set('selected_ids', selectedIds.join(','));
      }
      
      params.set('limit', '20'); // Increased limit for better UX
      
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/search?${params.toString()}`
      );
      
      const newOptions = (data?.data || []).map(
        (q: any): SelectOption => ({
          value: q.id,
          label: q.code
            ? `${q.code}`
            : q.question
              ? `${q.id} - ${q.question.slice(0, 40)}…`
              : String(q.id),
          _raw: q
        })
      );
      
      setQuestionOpts(newOptions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestionOpts([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchExamGroups = async (keyword = '') => {
    setLoadingGroups(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?kind=0`,
        { params: { search: keyword, limit: 10 } }
      );
      const raw = data.data || data.examTypes || [];
      setExamGroupOpts(
        raw.map(
          (g: any): SelectOption => ({
            value: g.id,
            label: g.name || g.exam_type || `Grup #${g.id}`,
            _raw : g
          })
        )
      );
    } finally {
      setLoadingGroups(false);
    }
  };

  /* ------------------------ CSV Functions ----------------------------- */
  const parseCSV = (csvText: string): CSVQuestion[] => {
    const lines = csvText.trim().split('\n');
    const questions: CSVQuestion[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [id, code, question_type, level] = line.split(',');
      if (id && code) {
        questions.push({
          id: id.trim(),
          code: code.trim(),
          question_type: question_type?.trim() || '',
          level: level?.trim() || ''
        });
      }
    }
    
    return questions;
  };

  const handleCSVFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setCsvVerified(false);
      setCsvQuestions([]);
      setVerificationResponse(null);
      setSelected([]);
      setErrors(prev => ({ ...prev, csv: '' }));
    } else {
      setErrors(prev => ({ ...prev, csv: 'File harus berformat CSV' }));
    }
  };

  const verifyCSV = async () => {
    if (!csvFile) {
      setErrors(prev => ({ ...prev, csv: 'Pilih file CSV terlebih dahulu' }));
      return;
    }

    setVerifyingCSV(true);
    setErrors(prev => ({ ...prev, csv: '' }));

    try {
      const csvText = await csvFile.text();
      const parsedQuestions = parseCSV(csvText);
      
      if (parsedQuestions.length === 0) {
        setErrors(prev => ({ ...prev, csv: 'File CSV tidak berisi data yang valid' }));
        return;
      }

      const payload = parsedQuestions.map(q => ({
        id: q.id,
        code: q.code
      }));

      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '';
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/questions/verif-csv`, payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status === 'success' || response.data.status === 'partial_match') {
        const verificationData: VerificationResponse = response.data;
        const matchedPairs = verificationData.data.matched_pairs || [];
        
        setCsvQuestions(parsedQuestions);
        setVerificationResponse(verificationData);
        setCsvVerified(true);
        
        const csvOptions: SelectOption[] = matchedPairs.map((q: VerifiedQuestion) => ({
          value: q.id,
          label: q.code,
          _raw: q
        }));
        
        setSelected(csvOptions);
        setErrors(prev => ({ ...prev, csv: '' }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          csv: response.data.message || 'Verifikasi CSV gagal' 
        }));
      }
    } catch (error: any) {
      setErrors(prev => ({ 
        ...prev, 
        csv: error.response?.data?.message || 'Gagal memverifikasi CSV' 
      }));
    } finally {
      setVerifyingCSV(false);
    }
  };

  const handleQuestionModeChange = (mode: string | number) => {
    const newMode = mode as 'manual' | 'csv';
    setQuestionMode(newMode);
    setSelected([]);
    setCsvFile(null);
    setCsvQuestions([]);
    setVerificationResponse(null);
    setCsvVerified(false);
    setErrors(prev => ({ ...prev, csv: '', question: '' }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Fetch initial questions when switching to manual mode
    if (newMode === 'manual') {
      fetchQuestions('');
    }
  };

  /* ------------------------ Debounce setup ---------------------------- */
  const debouncedFetchQuestions = useMemo(() => debounce(fetchQuestions, 500), [selectedQuestions]);
  const debouncedFetchGroups    = useMemo(() => debounce(fetchExamGroups, 300), []);

  useEffect(() => () => {
    debouncedFetchQuestions.cancel();
    debouncedFetchGroups.cancel();
  }, [debouncedFetchQuestions, debouncedFetchGroups]);

  /* ------------------------- Reset form ------------------------------- */
  const resetForm = () => {
    setExamName('');
    setDuration('');
    setSelected([]);
    setExamGroup(null);
    setQuestionOpts([]);
    setExamGroupOpts([]);
    setErrors({});
    setQuestionMode('manual');
    setCsvFile(null);
    setCsvQuestions([]);
    setVerificationResponse(null);
    setCsvVerified(false);
    setHasChanges(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ------------------------- Modal lifecycle -------------------------- */
  useEffect(() => {
    if (show) {
      resetForm();
      // Initial fetch for both exam groups and questions (if not using CSV)
      fetchExamGroups('');
      if (questionMode === 'manual') {
        fetchQuestions('');
      }
    }
  }, [show]);

  // Refetch questions when selectedQuestions changes (for exclusion) - only in manual mode
  useEffect(() => {
    if (show && questionMode === 'manual' && questionOpts.length > 0) {
      // Delay to avoid too many API calls
      const timer = setTimeout(() => {
        fetchQuestions('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedQuestions, show, questionMode]);

  /* ----------------------------- Save --------------------------------- */
  const handleSave = async () => {
    const err: Record<string,string> = {};
    if (!examName.trim())      err.name     = 'Nama ujian wajib diisi';
    if (!duration)             err.duration = 'Durasi wajib diisi';
    if (!examGroup)            err.group    = 'Grup ujian wajib dipilih';
    
    if (questionMode === 'csv') {
      if (!csvVerified || selectedQuestions.length === 0) {
        err.question = 'CSV harus diverifikasi dan berisi soal yang valid';
      }
    } else {
      if (selectedQuestions.length === 0) {
        err.question = 'Minimal 1 soal dipilih';
      }
    }
    
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '';
      const payload = {
        name            : examName.trim(),
        duration        : Number(duration),
        exam_group      : examGroup!.value,
        question_id_list: selectedQuestions.map(q => q.value)
      };

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/exam`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onAddExam(data);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Save exam error:', error);
      setErrors({ 
        api: error.response?.data?.message || 'Gagal menyimpan ujian. Silakan coba lagi.' 
      });
    } finally {
      setSaving(false);
    }
  };

  /* --------------------- Event handlers ------------------------------- */
  const handleGroupInputChange = useCallback(
    (input: string) => { debouncedFetchGroups(input); },
    [debouncedFetchGroups]
  );

  const handleQuestionsInputChange = useCallback(
    (input: string) => { 
      if (questionMode === 'manual') {
        debouncedFetchQuestions(input); 
      }
    },
    [debouncedFetchQuestions, questionMode]
  );

  /* ---------------------- Modal Buttons ------------------------------- */
  const topButtons: ModalButton[] = [
    {
      action: 'reset',
      text: 'Reset Form',
      icon: <RotateCcw className="tw-w-4 tw-h-4" />,
      onClick: resetForm,
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
      text: saving ? 'Menyimpan...' : 'Simpan Ujian',
      icon: <Check className="tw-w-4 tw-h-4" />,
      onClick: handleSave,
      disabled: saving,
      loading: saving,
      customColors: {
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#34D399',
        text: '#FFFFFF'
      }
    }
  ];

  /* ---------------------- Render Verification Results ----------------- */
  const renderVerificationResults = () => {
    if (!csvVerified || !verificationResponse) return null;

    const { status, summary, data } = verificationResponse;
    const { matched_pairs, id_not_found, code_mismatched } = data;

    return (
      <div className="tw-space-y-3">
        <Alert 
          variant={status === 'success' ? 'success' : 'warning'} 
          className="tw-text-sm"
        >
          <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
            <div className="tw-flex tw-items-center tw-gap-2">
              {status === 'success' ? (
                <CheckCircle className="tw-w-4 tw-h-4 tw-text-green-600" />
              ) : (
                <AlertTriangle className="tw-w-4 tw-h-4 tw-text-orange-600" />
              )}
              <strong>Hasil Verifikasi</strong>
            </div>
            <span className="tw-font-mono tw-text-xs">
              Success Rate: {summary.success_rate}
            </span>
          </div>
          <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-xs">
            <div>Total: <strong>{summary.total}</strong></div>
            <div>Matched: <strong className="tw-text-green-600">{summary.matched}</strong></div>
            <div>ID Not Found: <strong className="tw-text-red-600">{summary.id_not_found}</strong></div>
            <div>Code Mismatch: <strong className="tw-text-orange-600">{summary.code_mismatched}</strong></div>
          </div>
        </Alert>

        {matched_pairs.length > 0 && (
          <Alert variant="success" className="tw-text-sm">
            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <CheckCircle className="tw-w-4 tw-h-4 tw-text-green-600" />
              <strong>Soal Valid ({matched_pairs.length}):</strong>
            </div>
            <div className="tw-max-h-40 tw-overflow-y-auto tw-space-y-1">
              {matched_pairs.map((q, idx) => (
                <div key={idx} className="tw-flex tw-justify-between tw-items-center tw-text-xs tw-font-mono tw-bg-green-50 tw-px-2 tw-py-1 tw-rounded">
                  <span className="tw-font-semibold tw-text-green-800">{q.code}</span>
                  <span className="tw-text-green-600">ID: {q.id}</span>
                </div>
              ))}
            </div>
          </Alert>
        )}

        {id_not_found.length > 0 && (
          <Alert variant="danger" className="tw-text-sm">
            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <XCircle className="tw-w-4 tw-h-4 tw-text-red-600" />
              <strong>ID Tidak Ditemukan ({id_not_found.length}):</strong>
            </div>
            <div className="tw-max-h-32 tw-overflow-y-auto tw-space-y-1">
              {id_not_found.map((q, idx) => (
                <div key={idx} className="tw-flex tw-justify-between tw-items-center tw-text-xs tw-font-mono tw-bg-red-50 tw-px-2 tw-py-1 tw-rounded">
                  <span className="tw-font-semibold tw-text-red-800">{q.code}</span>
                  <span className="tw-text-red-600">ID: {q.id}</span>
                </div>
              ))}
            </div>
          </Alert>
        )}

        {code_mismatched.length > 0 && (
          <Alert variant="warning" className="tw-text-sm">
            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <AlertTriangle className="tw-w-4 tw-h-4 tw-text-orange-600" />
              <strong>Code Tidak Cocok ({code_mismatched.length}):</strong>
            </div>
            <div className="tw-max-h-32 tw-overflow-y-auto tw-space-y-1">
              {code_mismatched.map((q, idx) => (
                <div key={idx} className="tw-text-xs tw-font-mono tw-bg-orange-50 tw-px-2 tw-py-1 tw-rounded">
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-font-semibold tw-text-orange-800">CSV: {q.code}</span>
                    <span className="tw-text-orange-600">ID: {q.id}</span>
                  </div>
                  <div className="tw-text-orange-700 tw-mt-1">
                    Found: <span className="tw-font-semibold">{q.found_code}</span>
                  </div>
                </div>
              ))}
            </div>
          </Alert>
        )}
      </div>
    );
  };

  /* ------------------------------ UI ---------------------------------- */
  return (
    <LearningModal
      show={show}
      onHide={hasChanges ? () => {} : onClose}
      title="Buat Ujian Baru"
      subtitle={`${selectedQuestions.length} soal dipilih • Mode: ${questionMode === 'csv' ? 'CSV Import' : 'Manual'}`}
      icon={<PlusCircle className="tw-w-5 tw-h-5" />}
      size="xl"
      width="90vw"
      height="85vh"
      scrollable={true}
      topButtons={topButtons}
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={hasChanges}
    >
      <div className="tw-space-y-6">
        {/* Error Display */}
        {Object.values(errors).filter(e => e && e.trim()).length > 0 && (
          <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4">
            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <XCircle className="tw-w-4 tw-h-4 tw-text-red-500" />
              <span className="tw-font-semibold tw-text-red-700">Error</span>
            </div>
            {Object.values(errors)
              .filter(e => e && e.trim()) // Filter out empty strings
              .map((e, i) => (
                <div key={i} className="tw-text-red-700 tw-text-sm">{e}</div>
              ))
            }
          </div>
        )}

        <Form>
          {/* Nama Ujian */}
          <ShortFormField
            label="Nama Ujian"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            error={errors.name}
            required
          />

          {/* Grup Ujian */}
          <SearchSingleField
            label="Grup Ujian"
            value={examGroup}
            options={examGroupOpts}
            onChange={setExamGroup}
            onInputChange={handleGroupInputChange}
            isLoading={loadingGroups}
            icon={<Award size={16}/>}
            required
            error={errors.group}
          />

          {/* Durasi */}
          <NumberField
            label="Durasi (menit)"
            value={duration}
            onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : '')}
            error={errors.duration}
            required
            placeholder="Masukkan durasi ujian dalam menit"
            min={1}
          />

          {/* Mode Selection using OptionCard */}
          <OptionCard
            label="Metode Pemilihan Soal"
            selectedValue={questionMode}
            options={[
              {
                value: 'manual',
                label: 'Pilih Manual',
                description: 'Pilih soal satu per satu dari database'
              },
              {
                value: 'csv',
                label: 'Import CSV',
                description: 'Upload file CSV berisi daftar soal'
              }
            ]}
            onChange={handleQuestionModeChange}
            icon={<Settings className="tw-w-4 tw-h-4" />}
            color="tw-text-purple-700"
            selectedColor="tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-500 tw-text-white"
            variant="horizontal"
            required
            error={errors.questionMode}
          />

          {/* CSV Import Section */}
          {questionMode === 'csv' && (
            <Form.Group className="tw-mb-6">
              <Form.Label className="tw-text-purple-700 tw-font-semibold tw-flex tw-items-center tw-gap-2">
                <Upload className="tw-w-4 tw-h-4" />
                Import File CSV
              </Form.Label>
              <div className="tw-space-y-4 tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border-2 tw-border-blue-200">
                <Alert variant="info" className="tw-text-sm tw-mb-3">
                  <strong>Format CSV:</strong> id,code,question_type,level<br/>
                  <strong>Contoh:</strong> 194,LOGFRPR0152,true-false,4
                </Alert>
                
                <div className="tw-flex tw-gap-3 tw-items-end">
                  <div className="tw-flex-1">
                    <Form.Control
                      type="file"
                      accept=".csv"
                      onChange={handleCSVFileChange}
                      ref={fileInputRef}
                      className="tw-border-2 tw-border-blue-200 focus:tw-border-blue-500 tw-rounded-lg tw-text-base tw-p-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyCSV}
                    disabled={!csvFile || verifyingCSV}
                    className="tw-px-4 tw-py-3 tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-text-white tw-rounded-lg tw-font-semibold tw-shadow-lg hover:tw-scale-105 tw-transition-transform disabled:tw-opacity-50 disabled:tw-scale-100 tw-whitespace-nowrap tw-flex tw-items-center tw-gap-2"
                  >
                    {verifyingCSV ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Verifikasi...
                      </>
                    ) : (
                      <>
                        <FileText className="tw-w-4 tw-h-4" />
                        Verifikasi
                      </>
                    )}
                  </button>
                </div>

                {/* Verification Results */}
                {renderVerificationResults()}
              </div>
            </Form.Group>
          )}

          {/* Manual Question Selection using SearchMultipleField */}
          {questionMode === 'manual' && (
            <SearchMultipleField
              label="Soal Ujian"
              value={selectedQuestions}
              options={questionOpts}
              onChange={setSelected}
              onInputChange={handleQuestionsInputChange}
              isLoading={loadingQuestions}
              error={errors.question}
              required
              icon={<List size={16}/>}
              placeholder="Ketik untuk mencari soal..."
            />
          )}

          {/* CSV Questions Display */}
          {questionMode === 'csv' && csvVerified && selectedQuestions.length > 0 && (
            <Form.Group className="tw-mb-6">
              <Form.Label className="tw-text-purple-700 tw-font-semibold tw-flex tw-items-center tw-gap-2">
                <CheckCircle className="tw-w-4 tw-h-4" />
                Soal Terpilih dari CSV
              </Form.Label>
              <div className="tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-4 tw-bg-blue-50 tw-min-h-[100px]">
                <div className="tw-text-sm tw-text-gray-600 tw-mb-3 tw-flex tw-items-center tw-justify-between">
                  <span>{selectedQuestions.length} soal terpilih</span>
                  <span className="tw-text-xs tw-bg-blue-200 tw-text-purple-800 tw-px-2 tw-py-1 tw-rounded-full">
                    Mode CSV - Tidak dapat diubah
                  </span>
                </div>
                <div className="tw-max-h-40 tw-overflow-y-auto">
                  <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-2">
                    {selectedQuestions.map((q, idx) => (
                      <div 
                        key={idx}
                        className="tw-bg-white tw-border tw-border-blue-300 tw-px-3 tw-py-2 tw-rounded-lg tw-text-sm tw-font-mono tw-flex tw-items-center tw-justify-between tw-shadow-sm"
                      >
                        <span className="tw-font-semibold tw-text-purple-800 tw-truncate">{q.label}</span>
                        <span className="tw-text-purple-600 tw-opacity-75 tw-text-xs tw-ml-2 tw-flex-shrink-0">#{q.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {errors.question && (
                <div className="tw-text-red-600 tw-mt-2 tw-text-sm">{errors.question}</div>
              )}
            </Form.Group>
          )}

          {/* Summary Section */}
          {selectedQuestions.length > 0 && (
            <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4 tw-mb-6">
              <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                <CheckCircle className="tw-w-5 tw-h-5 tw-text-purple-600" />
                <span className="tw-font-semibold tw-text-purple-700">
                  Ringkasan Ujian
                </span>
              </div>
              <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-text-sm">
                <div>
                  <span className="tw-text-purple-600">Nama:</span>
                  <div className="tw-font-semibold tw-text-purple-800 tw-truncate">
                    {examName || 'Belum diisi'}
                  </div>
                </div>
                <div>
                  <span className="tw-text-purple-600">Total Soal:</span>
                  <div className="tw-font-semibold tw-text-purple-800">{selectedQuestions.length}</div>
                </div>
                <div>
                  <span className="tw-text-purple-600">Durasi:</span>
                  <div className="tw-font-semibold tw-text-purple-800">
                    {duration ? `${duration} menit` : 'Belum diisi'}
                  </div>
                </div>
                <div>
                  <span className="tw-text-purple-600">Grup:</span>
                  <div className="tw-font-semibold tw-text-purple-800 tw-truncate">
                    {examGroup?.label || 'Belum dipilih'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Changes indicator */}
          {hasChanges && (
            <div className="tw-bg-orange-50 tw-border tw-border-orange-200 tw-rounded-lg tw-p-3">
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-orange-700">
                <span className="tw-w-2 tw-h-2 tw-bg-orange-400 tw-rounded-full tw-animate-pulse"></span>
                <span className="tw-font-medium tw-text-sm">
                  Ada perubahan yang belum disimpan
                </span>
              </div>
            </div>
          )}
        </Form>
      </div>
    </LearningModal>
  );
};

export default CreateExamModal;