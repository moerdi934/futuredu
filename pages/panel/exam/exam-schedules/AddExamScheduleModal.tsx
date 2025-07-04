'use client';

/**
 * ./AddExamScheduleModal.tsx
 * --------------------------------------------------------------------------
 * Modal "Tambah Jadwal Ujian" – ID ujian unik & tanpa duplikat
 * --------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  Spinner
} from 'react-bootstrap';
import axios from 'axios';
import debounce from 'lodash/debounce';

import {
  SearchSingleField,
  SearchMultipleField,
  DateRangeField
} from '../../../../components/layout/FormComponentLayout';

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
  Trash2
} from 'lucide-react';

import CreateExamModal, { SelectOption } from './CreateExamModal';

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
  const [customExams,   setCustom]    = useState<any[]>([]);   // simpan detail untuk tampilan

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
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/exam/search`,
        { params: { query: q, limit: 10 } }
      );
      setExamOptions(
        (data.data || []).map((e:any):SelectOption=>({
          value: e.id,
          label: `${e.id} - ${e.name}`,
          _raw : e
        }))
      );
    } finally { setLE(false); }
  };

  const dFetchGroups = debounce(fetchGroups, 300);
  const dFetchTypes  = debounce(fetchTypes,  300);
  const dFetchExams  = debounce(fetchExams,  300);

  /* initial load setiap kali modal dibuka */
  useEffect(() => {
    if (isOpen) {
      fetchGroups('');
      fetchTypes('');
      fetchExams('');
    }
  }, [isOpen]);

  /* ------------------------- Reset helper ---------------------------- */
  const resetForm = () => {
    setName(''); setDescription('');
    setExamGroup(null); setExamType(null);
    setIsFree(false); setIsValid(true);
    setSelected([]); setCustom([]);
    setStart(null); setEnd(null); setAnytime(false);
    setAuto(false); setRandom(false); setWeighted(false);
    setErrors({}); setSaving(false);
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
    const examIds = Array.from(new Set(selectedExams.map(e => e.value)));

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
        exam_id_list   : examIds,           // ← hanya ID unik
        is_auto_move          : autoSwitchExam,
        is_need_order_exam    : randomExamOrder,
        is_need_weighted_score: weightedScore
      };

      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/exam-schedules`, payload);
      onSave(data);
      resetForm(); onClose();
    } catch { /* TODO: tampilkan error detail */ }
    finally { setSaving(false); }
  };

  /* -------------------------- UI helpers ---------------------------- */
  const OptionCard = ({
    title, icon:Icon, state, setState
  }: {
    title: string;
    icon : React.ComponentType<{ size?: number }>;
    state: boolean;
    setState: (val: boolean) => void;
  }) => (
    <Card className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-shadow-sm">
      <Card.Body className="tw-p-4">
        <div className="tw-flex tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-2">
            <div className="tw-bg-purple-100 tw-p-1 tw-rounded">
              <Icon size={16} className="tw-text-purple-600" />
            </div>
            <span className="tw-font-semibold tw-text-purple-700">{title}</span>
          </div>
          <div className="tw-flex tw-gap-2">
            <Button
              size="sm"
              variant={state ? 'success' : 'outline-secondary'}
              onClick={() => setState(true)}
              className={`tw-rounded-lg tw-font-medium ${
                state
                  ? 'tw-bg-green-500 tw-border-green-500'
                  : 'tw-border-purple-300 tw-text-purple-600'
              }`}
            >
              Ya
            </Button>
            <Button
              size="sm"
              variant={!state ? 'success' : 'outline-secondary'}
              onClick={() => setState(false)}
              className={`tw-rounded-lg tw-font-medium ${
                !state
                  ? 'tw-bg-green-500 tw-border-green-500'
                  : 'tw-border-purple-300 tw-text-purple-600'
              }`}
            >
              Tidak
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  /* gabungkan opsi server + ujian kustom */
  const allExamOptions: SelectOption[] = [
    ...examOptions,
    ...customExams.map((ex:any):SelectOption=>({
      value: ex.id,
      label: `[BARU] ${ex.id} - ${ex.name}`,
      _raw : ex
    }))
  ];

  /* ----------------------- Render ----------------------------------- */
  if (!isOpen) return null;

  return (
    <>
      {/* ========================= Modal ========================= */}
      <Modal
        show={isOpen}
        onHide={() => { resetForm(); onClose(); }}
        size="xl"
        centered
        backdrop="static"
        className="tw-font-sans"
      >
        <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-50 tw-rounded-lg tw-shadow-2xl tw-overflow-hidden">
          {/* ---------- HEADER ---------- */}
          <Modal.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-py-4">
            <div className="tw-flex tw-items-center tw-gap-3">
              <div className="tw-bg-white/20 tw-p-2 tw-rounded-lg">
                <Calendar size={24} />
              </div>
              <Modal.Title className="tw-font-bold tw-text-xl">
                Buat Jadwal Ujian Baru
              </Modal.Title>
            </div>
          </Modal.Header>

          {/* ---------- BODY ---------- */}
          <Modal.Body className="tw-p-6 tw-max-h-[75vh] tw-overflow-y-auto">
            {/* error list */}
            {Object.keys(errors).length > 0 && (
              <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4 tw-mb-4 tw-flex tw-items-center">
                <X className="tw-text-red-500 tw-mr-2" />
                <div className="tw-text-red-700">
                  {Object.values(errors).map((e,i)=><div key={i}>{e}</div>)}
                </div>
              </div>
            )}

            <Form>
              {/* -------- Nama, Grup, Tipe -------- */}
              <Row className="tw-mb-6">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="tw-flex tw-items-center tw-gap-2 tw-text-purple-700 tw-font-semibold">
                      <FileText size={16}/> Nama Jadwal <span className="tw-text-red-500">*</span>
                    </Form.Label>
                    <Form.Control
                      value={name}
                      onChange={e=>setName(e.target.value)}
                      placeholder="Nama jadwal ujian"
                      className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg"
                    />
                  </Form.Group>
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
                  />
                </Col>
              </Row>

              {/* -------- Deskripsi -------- */}
              <Form.Group className="tw-mb-6">
                <Form.Label className="tw-flex tw-items-center tw-gap-2 tw-text-purple-700 tw-font-semibold">
                  <AlignLeft size={16}/> Deskripsi
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={e=>setDescription(e.target.value)}
                  className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg"
                  placeholder="Deskripsi jadwal ujian"
                />
              </Form.Group>

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

              {/* -------- Option Cards -------- */}
              <Row className="tw-mb-6">
                <Col md={4}><OptionCard title="Gratis" icon={Check} state={isFree} setState={setIsFree}/></Col>
                <Col md={4}><OptionCard title="Status Aktif" icon={Check} state={isValid} setState={setIsValid}/></Col>
                <Col md={4}><OptionCard title="Berpindah Ujian Otomatis" icon={Zap} state={autoSwitchExam} setState={setAuto}/></Col>
                <Col md={4} className="tw-mt-4"><OptionCard title="Acak Urutan Ujian" icon={Shuffle} state={randomExamOrder} setState={setRandom}/></Col>
                <Col md={4} className="tw-mt-4"><OptionCard title="Pembobotan Nilai" icon={Settings} state={weightedScore} setState={setWeighted}/></Col>
              </Row>

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
                <Button
                  variant="outline-primary"
                  onClick={()=>setShowCreate(true)}
                  className="tw-flex tw-items-center tw-gap-2 tw-font-medium tw-mb-2"
                >
                  <PlusCircle size={16}/> Buat Ujian
                </Button>

                {customExams.length>0 && (
                  <>
                    <div className="tw-font-semibold tw-text-purple-700 tw-mb-1">
                      Ujian yang Dibuat:
                    </div>
                    <ul className="tw-list-disc tw-ml-6">
                      {customExams.map((ex:any,idx:number)=>{
                        const total = ex.question_id_list?.length ??
                                      ex.question_ids?.length ??
                                      ex.questions?.length ?? 0;
                        return (
                          <li key={idx} className="tw-flex tw-items-center tw-gap-2">
                            <span>
                              <b>{ex.name}</b> ({ex.duration} m) – {total} soal
                            </span>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={()=>setCustom(prev=>prev.filter((_,i)=>i!==idx))}
                            >
                              <Trash2 size={14}/>
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            </Form>
          </Modal.Body>

          {/* ---------- FOOTER ---------- */}
          <Modal.Footer className="tw-bg-gray-50 tw-border-0 tw-p-6">
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-w-full">
              <Button
                variant="outline-secondary"
                onClick={()=>{resetForm(); onClose();}}
                disabled={saving}
                className="tw-flex-1 tw-border-gray-300"
              >
                <X size={16} className="tw-mr-2"/> Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={saving}
                className="tw-flex-1 tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-shadow-lg"
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="tw-mr-2"/>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check size={16} className="tw-mr-2"/> Simpan Jadwal
                  </>
                )}
              </Button>
            </div>
          </Modal.Footer>
        </div>
      </Modal>

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