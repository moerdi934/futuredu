'use client';

/**
 * ./AddExamScheduleModal.tsx
 * --------------------------------------------------------------------------
 * Modal "Tambah Jadwal Ujian" – Updated untuk integrasi dengan AddExamModal
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
  Gift
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

  /* ---------------------- Fetch helpers ------------------------------ */
  const fetchGroups = async (q='') => {
    setLG(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?kind=0`,
        { params: { search: q, limit: 10 } }
      );
      const raw = data.data || data.examTypes || [];
      setExamGroups(
        raw.map((g:any):SelectOption=>({
          value: g.id,
          label: g.name || g.exam_type || `Grup #${g.id}`,
          _raw : g
        }))
      );
    } finally { setLG(false); }
  };

  const fetchTypes = async (q='') => {
    setLT(true);
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}` : '';
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/productType/filters/exam_type${qs}`
      );
      setExamTypes(
        (data.examTypes || []).map((t:any):SelectOption=>({
          value: t.id,
          label: t.name ?? t.exam_type
        }))
      );
    } finally { setLT(false); }
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
      
      params.set('limit', '20'); // Increased limit for better UX
      
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/exam/search?${params.toString()}`
      );
      
      setExamOptions(
        (data.data || []).map((e:any):SelectOption=>({
          value: e.id,
          label: `${e.id} - ${e.name}`,
          _raw : e
        }))
      );
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      setExamOptions([]);
    } finally { 
      setLE(false); 
    }
  };

  const dFetchGroups = debounce(fetchGroups, 300);
  const dFetchTypes  = debounce(fetchTypes,  300);
  const dFetchExams  = debounce(fetchExams,  500); // Slightly longer debounce for exams

  /* initial load setiap kali modal dibuka */
  useEffect(() => {
    if (isOpen) {
      fetchGroups('');
      fetchTypes('');
      fetchExams('');
    }
  }, [isOpen]);

  // Refetch exams when selectedExams changes
  useEffect(() => {
    if (isOpen) {
      fetchExams('');
    }
  }, [selectedExams, isOpen]);

  /* ------------------------- Reset helper ---------------------------- */
  const resetForm = () => {
    setName(''); setDescription('');
    setExamGroup(null); setExamType(null);
    setIsFree(false); setIsValid(true);
    setSelected([]); setCustom([]);
    setStart(null); setEnd(null); setAnytime(false);
    setAuto(false); setRandom(false); setWeighted(false);
    setErrors({}); setSaving(false);
    setHasChanges(false);
  };

  /* --------------------------- Submit ------------------------------- */
  const handleSubmit = async () => {
    const v: FormErrors = {};
    if (!name.trim()) v.name = 'Nama Jadwal wajib diisi';
    if (!examGroup)   v.examGroup = 'Grup Ujian wajib dipilih';
    if (!examType)    v.examType  = 'Tipe ujian wajib dipilih';
    if (selectedExams.length === 0 && customExams.length === 0)
      v.exams = 'Minimal satu ujian dipilih / dibuat';
    if (!anytime && (!startTime || !endTime))
      v.dateRange = 'Rentang waktu wajib diisi';
    if (Object.keys(v).length) { setErrors(v); return; }

    /* -------- id ujian unik (tanpa duplikat) -------- */
    const examIds = Array.from(new Set([
      ...selectedExams.map(e => e.value),
      ...customExams.map(e => e.id)
    ]));

    setSaving(true);
    try {
      const payload = {
        name           : name.trim(),
        description    : description.trim(),
        exam_type      : examType!.value,
        exam_group_id  : examGroup!.value,
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

      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/exam-schedules`, payload);
      onSave(data);
      resetForm(); 
      onClose();
    } catch (error: any) { 
      console.error('Submit error:', error);
      setErrors({ 
        api: error.response?.data?.message || 'Gagal menyimpan jadwal ujian. Silakan coba lagi.' 
      });
    }
    finally { setSaving(false); }
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
        onHide={hasChanges ? () => {} : onClose}
        title="Buat Jadwal Ujian Baru"
        subtitle={`${totalSelectedExams} ujian dipilih • ${hasChanges ? 'Ada perubahan' : 'Belum ada perubahan'}`}
        icon={<Calendar className="tw-w-5 tw-h-5" />}
        size="xl"
        width="95vw"
        height="90vh"
        scrollable={true}
        topButtons={topButtons}
        bottomButtons={bottomButtons}
        preventCloseOnOutsideClick={hasChanges}
      >
        <div className="tw-space-y-6">
          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4">
              <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                <XCircle className="tw-w-4 tw-h-4 tw-text-red-500" />
                <span className="tw-font-semibold tw-text-red-700">Error</span>
              </div>
              {Object.values(errors).map((e,i)=>(
                <div key={i} className="tw-text-red-700 tw-text-sm">{e}</div>
              ))}
            </div>
          )}

          <Form>
            {/* -------- Nama, Grup, Tipe -------- */}
            <Row className="tw-mb-6">
              <Col md={4}>
                <ShortFormField
                  label="Nama Jadwal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  required
                />
              </Col>

              <Col md={4}>
                <SearchSingleField
                  label="Grup Ujian"
                  value={examGroup}
                  options={examGroups}
                  onChange={setExamGroup}
                  onInputChange={dFetchGroups}
                  isLoading={lg}
                  icon={<Award size={16}/>}
                  required
                  error={errors.examGroup}
                />
              </Col>

              <Col md={4}>
                <SearchSingleField
                  label="Tipe Ujian"
                  value={examType}
                  options={examTypes}
                  onChange={setExamType}
                  onInputChange={dFetchTypes}
                  isLoading={lt}
                  icon={<BookOpen size={16}/>}
                  required
                  error={errors.examType}
                />
              </Col>
            </Row>

            {/* -------- Deskripsi -------- */}
            <WideFormField
              label="Deskripsi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* -------- Waktu -------- */}
            <DateRangeField
              label="Waktu Pelaksanaan"
              startDate={startTime}
              endDate={endTime}
              onStartDateChange={setStart}
              onEndDateChange={setEnd}
              anytime={anytime}
              onAnytimeChange={setAnytime}
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
                    onChange={setIsFree}
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
                    onChange={setIsValid}
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
                    onChange={setAuto}
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
                    onChange={setRandom}
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
                    onChange={setWeighted}
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
              onChange={setSelected}
              onInputChange={dFetchExams}
              isLoading={le}
              error={errors.exams}
              required
              icon={<List size={16}/>}
              placeholder="Cari ujian..."
            />

            {/* --------- Custom Ujian --------- */}
            <div className="tw-mb-6">
              <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-0 tw-flex tw-items-center tw-gap-2">
                  <PlusCircle size={16}/> Buat Ujian Baru
                </Form.Label>
                <button
                  type="button"
                  onClick={()=>setShowCreate(true)}
                  className="tw-px-4 tw-py-2 tw-bg-gradient-to-r tw-from-green-600 tw-to-emerald-600 tw-text-white tw-rounded-lg tw-font-semibold tw-shadow-lg hover:tw-scale-105 tw-transition-transform tw-flex tw-items-center tw-gap-2"
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
                            onClick={()=>setCustom(prev=>prev.filter((_,i)=>i!==idx))}
                            className="tw-p-2 tw-text-red-500 hover:tw-bg-red-50 tw-rounded-lg tw-transition-colors"
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
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <CheckCircle className="tw-w-5 tw-h-5 tw-text-purple-600" />
                  <span className="tw-font-semibold tw-text-purple-700">
                    Ringkasan Jadwal
                  </span>
                </div>
                <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-text-sm">
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

      {/* ------------ Modal Buat Ujian ------------ */}
      <CreateExamModal
        show={showCreate}
        onClose={()=>setShowCreate(false)}
        onAddExam={(exam:any)=>{
          /* tambahkan ke dropdown & daftar jika belum ada */
          setSelected(prev=>{
            if (prev.some(o => o.value === exam.id)) return prev;
            return [
              ...prev,
              { value: exam.id, label: `[BARU] ${exam.id} - ${exam.name}`, _raw: exam }
            ];
          });
          setCustom(prev=>[...prev, exam]);
        }}
      />
    </>
  );
};

export default AddExamScheduleModal;