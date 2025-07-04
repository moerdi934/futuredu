'use client';

/**
 * ./CreateExamModal.tsx
 * --------------------------------------------------------------------------
 * Modal "Buat Ujian" – versi sinkron dengan AddExamScheduleModal
 * Dengan fitur import CSV untuk soal ujian
 * Fixed: Added scrollable body untuk konten yang panjang
 * Improved: Better handling of partial_match responses
 * --------------------------------------------------------------------------
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import debounce from 'lodash/debounce';
import Select, { ActionMeta, MultiValue } from 'react-select';
import { PlusCircle, Timer, List, Award, Upload, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

import { SearchSingleField } from '../../../../components/layout/FormComponentLayout';

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

  // CSV Import states
  const [useCSVImport, setUseCSVImport]  = useState(false);
  const [csvFile, setCsvFile]            = useState<File | null>(null);
  const [csvQuestions, setCsvQuestions]  = useState<CSVQuestion[]>([]);
  const [verificationResponse, setVerificationResponse] = useState<VerificationResponse | null>(null);
  const [verifyingCSV, setVerifyingCSV]  = useState(false);
  const [csvVerified, setCsvVerified]    = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ----------------------- Fetch helpers ------------------------------ */
  // ─── Soal ────────────────────────────────────────────────────────────
  const fetchQuestions = async (keyword = '') => {
    setLoadingQuestions(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/search`,
        { params: { search: keyword, limit: 15 } }
      );
      setQuestionOpts(
        (data?.data || []).map(
          (q: any): SelectOption => ({
            value: q.id,
            label: q.code
              ? `${q.code}`
              : q.question
                ? `${q.id} - ${q.question.slice(0, 40)}…`
                : String(q.id),
            _raw: q
          })
        )
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  // ─── Grup Ujian ──────────────────────────────────────────────────────
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
            value: g.id,                                   // disimpan
            label: g.name || g.exam_type || `Grup #${g.id}`, // ditampilkan
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
    
    // Skip header line
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
      // Read CSV file
      const csvText = await csvFile.text();
      const parsedQuestions = parseCSV(csvText);
      
      if (parsedQuestions.length === 0) {
        setErrors(prev => ({ ...prev, csv: 'File CSV tidak berisi data yang valid' }));
        return;
      }

      // Prepare payload for verification
      const payload = parsedQuestions.map(q => ({
        id: q.id,
        code: q.code
      }));

      // Send to verification endpoint
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
        
        // Create SelectOption array for matched questions only
        // Menampilkan code, tapi menyimpan ID untuk payload
        const csvOptions: SelectOption[] = matchedPairs.map((q: VerifiedQuestion) => ({
          value: q.id,        // ID untuk disimpan ke database
          label: q.code,      // Code untuk ditampilkan
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

  const toggleImportMode = (useCSV: boolean) => {
    setUseCSVImport(useCSV);
    setSelected([]);
    setCsvFile(null);
    setCsvQuestions([]);
    setVerificationResponse(null);
    setCsvVerified(false);
    setErrors(prev => ({ ...prev, csv: '', question: '' }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ------------------------ Debounce setup ---------------------------- */
  const debouncedFetchQuestions = useMemo(() => debounce(fetchQuestions, 300), []);
  const debouncedFetchGroups    = useMemo(() => debounce(fetchExamGroups, 300), []);

  // hentikan debounce saat unmount
  useEffect(() => () => {
    debouncedFetchQuestions.cancel();
    debouncedFetchGroups.cancel();
  }, [debouncedFetchQuestions, debouncedFetchGroups]);

  /* ------------------------- Modal lifecycle -------------------------- */
  useEffect(() => {
    if (show) {
      setExamName('');
      setDuration('');
      setSelected([]);
      setExamGroup(null);
      setErrors({});
      setUseCSVImport(false);
      setCsvFile(null);
      setCsvQuestions([]);
      setVerificationResponse(null);
      setCsvVerified(false);
      fetchQuestions('');
      fetchExamGroups('');
    }
  }, [show]);

  /* ----------------------------- Save --------------------------------- */
  const handleSave = async () => {
    const err: Record<string,string> = {};
    if (!examName.trim())      err.name     = 'Nama ujian wajib diisi';
    if (!duration)             err.duration = 'Durasi wajib diisi';
    if (!examGroup)            err.group    = 'Grup ujian wajib dipilih';
    
    if (useCSVImport) {
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
        exam_group      : examGroup.value,               // ← id grup
        question_id_list: selectedQuestions.map(q => q.value) // ← array ID soal
      };

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/exam`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onAddExam(data);   // gunakan data dari server
      onClose();
    } catch {
      setErrors({ api: 'Gagal menyimpan ujian. Silakan coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  /* --------------------- Event handlers ------------------------------- */
  // agar tidak mengembalikan Promise (mencegah "[object Promise]")
  const handleGroupInputChange = useCallback(
    (input: string) => { debouncedFetchGroups(input); },
    [debouncedFetchGroups]
  );

  const onInputChangeQuestions = useCallback(
    (input: string, meta: ActionMeta<SelectOption>) => {
      if (meta.action === 'input-change') debouncedFetchQuestions(input);
      return input;
    },
    [debouncedFetchQuestions]
  );

  /* ---------------------- Option filter ------------------------------ */
  const filterOption = useCallback(
    (opt: { label: string }, raw: string) =>
      opt.label.toLowerCase().includes(raw.toLowerCase()),
    []
  );

  /* ---------------------- Render Verification Results ----------------- */
  const renderVerificationResults = () => {
    if (!csvVerified || !verificationResponse) return null;

    const { status, summary, data } = verificationResponse;
    const { matched_pairs, id_not_found, code_mismatched } = data;

    return (
      <div className="tw-space-y-3">
        {/* Summary */}
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

        {/* Matched Questions */}
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

        {/* ID Not Found */}
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

        {/* Code Mismatched */}
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
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      className="tw-font-sans"
      style={{ maxHeight: '90vh' }} // Batasi tinggi modal
    >
      <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-50 tw-rounded-lg tw-shadow-2xl tw-overflow-hidden tw-flex tw-flex-col tw-max-h-[90vh]">
        {/* ---------- Header ---------- */}
        <Modal.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-border-0 tw-py-4 tw-flex-shrink-0">
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-white/20 tw-p-2 tw-rounded-lg">
              <PlusCircle className="tw-w-6 tw-h-6" />
            </div>
            <Modal.Title className="tw-text-xl tw-font-bold">
              Buat Ujian Baru
            </Modal.Title>
          </div>
        </Modal.Header>

        {/* ---------- Body - Scrollable ---------- */}
        <Modal.Body className="tw-p-6 tw-flex-1 tw-overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {Object.keys(errors).length > 0 && (
            <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4 tw-mb-4">
              {Object.values(errors).map((e,i)=>(
                <div key={i} className="tw-text-red-700">{e}</div>
              ))}
            </div>
          )}

          <Form>
            {/* Nama */}
            <Form.Group className="tw-mb-6">
              <Form.Label className="tw-text-purple-700 tw-font-semibold">
                Nama Ujian <span className="tw-text-red-500">*</span>
              </Form.Label>
              <Form.Control
                value={examName}
                onChange={e=>setExamName(e.target.value)}
                placeholder="Nama ujian"
                className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg"
                isInvalid={!!errors.name}
              />
            </Form.Group>

            {/* Grup ujian */}
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
            <Form.Group className="tw-my-6">
              <Form.Label className="tw-text-purple-700 tw-font-semibold">
                <Timer className="tw-w-4 tw-h-4 tw-inline tw-mr-2" />
                Durasi (menit) <span className="tw-text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={duration}
                onChange={e => setDuration(e.target.value ? Number(e.target.value) : '')}
                placeholder="Durasi ujian"
                className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg"
                isInvalid={!!errors.duration}
              />
            </Form.Group>

            {/* Mode Selection */}
            <Form.Group className="tw-mb-4">
              <Form.Label className="tw-text-purple-700 tw-font-semibold">
                Metode Pemilihan Soal <span className="tw-text-red-500">*</span>
              </Form.Label>
              <div className="tw-flex tw-gap-4 tw-mt-2">
                <Form.Check
                  type="radio"
                  id="manual-select"
                  name="questionMode"
                  label="Pilih Manual"
                  checked={!useCSVImport}
                  onChange={() => toggleImportMode(false)}
                  className="tw-flex tw-items-center"
                />
                <Form.Check
                  type="radio"
                  id="csv-import"
                  name="questionMode"
                  label="Import CSV"
                  checked={useCSVImport}
                  onChange={() => toggleImportMode(true)}
                  className="tw-flex tw-items-center"
                />
              </div>
            </Form.Group>

            {/* CSV Import Section */}
            {useCSVImport && (
              <Form.Group className="tw-mb-6">
                <Form.Label className="tw-text-purple-700 tw-font-semibold">
                  <Upload className="tw-w-4 tw-h-4 tw-inline tw-mr-2" />
                  Import File CSV
                </Form.Label>
                <div className="tw-space-y-3">
                  <Alert variant="info" className="tw-text-sm">
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
                        className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg"
                      />
                    </div>
                    <Button
                      variant="outline-primary"
                      onClick={verifyCSV}
                      disabled={!csvFile || verifyingCSV}
                      className="tw-whitespace-nowrap"
                    >
                      {verifyingCSV ? (
                        <>
                          <Spinner animation="border" size="sm" className="tw-mr-2" />
                          Verifikasi...
                        </>
                      ) : (
                        <>
                          <FileText className="tw-w-4 tw-h-4 tw-mr-2" />
                          Verifikasi
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Verification Results */}
                  {renderVerificationResults()}
                </div>
              </Form.Group>
            )}

            {/* Manual Question Selection */}
            {!useCSVImport && (
              <Form.Group>
                <Form.Label className="tw-text-purple-700 tw-font-semibold">
                  Soal Ujian <span className="tw-text-red-500">*</span>
                </Form.Label>
                <Select
                  instanceId="question-select"
                  isMulti
                  placeholder="Ketik untuk mencari soal…"
                  components={{ DropdownIndicator: () => <List size={16}/> }}
                  value={selectedQuestions}
                  options={questionOpts}
                  onChange={(v: MultiValue<SelectOption>) => setSelected(v as SelectOption[])}
                  onInputChange={onInputChangeQuestions}
                  filterOption={filterOption}
                  isLoading={loadingQuestions}
                  closeMenuOnScroll={false}
                  menuPosition="fixed"
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  classNamePrefix="select"
                />
                {errors.question && (
                  <div className="tw-text-red-600 tw-mt-1">{errors.question}</div>
                )}
              </Form.Group>
            )}

            {/* CSV Questions Display (Read-only) */}
            {useCSVImport && csvVerified && selectedQuestions.length > 0 && (
              <Form.Group>
                <Form.Label className="tw-text-purple-700 tw-font-semibold">
                  Soal Terpilih dari CSV
                </Form.Label>
                <div className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-p-3 tw-bg-gray-50 tw-min-h-[100px]">
                  <div className="tw-text-sm tw-text-gray-600 tw-mb-2">
                    {selectedQuestions.length} soal terpilih (tidak dapat diubah dalam mode CSV)
                  </div>
                  <div className="tw-max-h-32 tw-overflow-y-auto">
                    <div className="tw-flex tw-flex-wrap tw-gap-2">
                      {selectedQuestions.map((q, idx) => (
                        <span 
                          key={idx}
                          className="tw-bg-purple-100 tw-text-purple-800 tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-mono tw-flex tw-items-center tw-gap-2"
                        >
                          <span className="tw-font-semibold">{q.label}</span>
                          <span className="tw-text-purple-600 tw-opacity-75">#{q.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {errors.question && (
                  <div className="tw-text-red-600 tw-mt-1">{errors.question}</div>
                )}
              </Form.Group>
            )}
          </Form>
        </Modal.Body>

        {/* ---------- Footer - Fixed at bottom ---------- */}
        <Modal.Footer className="tw-bg-gray-50 tw-border-0 tw-p-6 tw-flex-shrink-0 tw-border-t tw-border-gray-200">
          <div className="tw-flex tw-justify-end tw-gap-3 tw-w-full">
            <Button
              variant="outline-secondary"
              onClick={onClose}
              className="tw-border-gray-300"
              disabled={saving}
            >
              Batal
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="tw-mr-2"/> Menyimpan…
                </>
              ) : 'Tambahkan'}
            </Button>
          </div>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default CreateExamModal;