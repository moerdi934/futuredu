'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav, Alert } from 'react-bootstrap';
import { 
  Trophy, 
  Target, 
  Star, 
  Zap, 
  BookOpen, 
  Award,
  Settings,
  Lock,
  Shield,
  Users,
  Calendar,
  MapPin,
  GraduationCap,
  Save,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Brain,
  Heart,
  Rocket,
  Crown,
  School,
  Building,
  Plus,
  X,
  BarChart3,
  Edit3,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../../components/layout/NavigationBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SearchSingleField, SelectOption } from '../../../components/form/FormComponentLayout';
import { SingleValue, ActionMeta } from 'react-select';

interface ExamScoreMapping {
  id: number;
  jenis_seleksi: string;
  sub_jenis_seleksi?: string;
  university_id?: number;
  score_position: number;
  score_label: string;
  score_description?: string;
  max_score?: number;
  is_active: boolean;
}

interface UserTargetData {
  id?: number;
  jenis_seleksi: string;
  sub_jenis_seleksi?: string;
  notes?: string;
  prodi_id_list?: number[];
  formasi_id_list?: number[];
  score_1?: number;
  score_2?: number;
  score_3?: number;
  score_4?: number;
  score_5?: number;
  score_6?: number;
  score_7?: number;
}

interface ProdiSelection {
  id: string;
  universitas: SelectOption | null;
  prodi: SelectOption | null;
  jenjang: string;
}

interface FormasiSelection {
  id: string;
  formasi: SelectOption | null;
}

type JenisSeleksi = 'SNBT' | 'SNBP' | 'Ujian Mandiri' | 'CPNS' | 'BUMN' | '';

// Ujian Mandiri options
const ujianMandiriOptions = [
  { value: 'SIMAK UI', label: 'SIMAK UI - Universitas Indonesia' },
  { value: 'UTUL UGM', label: 'UTUL UGM - Universitas Gadjah Mada' },
  { value: 'SPMB ITB', label: 'SPMB ITB - Institut Teknologi Bandung' },
  { value: 'UM ITS', label: 'UM ITS - Institut Teknologi Sepuluh Nopember' },
  { value: 'UM UNAIR', label: 'UM UNAIR - Universitas Airlangga' },
  { value: 'UM UNDIP', label: 'UM UNDIP - Universitas Diponegoro' },
  { value: 'UM UNHAS', label: 'UM UNHAS - Universitas Hasanuddin' },
  { value: 'UM UNPAD', label: 'UM UNPAD - Universitas Padjadjaran' },
  { value: 'UM USU', label: 'UM USU - Universitas Sumatera Utara' },
  { value: 'UM UNSRI', label: 'UM UNSRI - Universitas Sriwijaya' },
  { value: 'UM UNLAM', label: 'UM UNLAM - Universitas Lambung Mangkurat' },
  { value: 'UM UNTAN', label: 'UM UNTAN - Universitas Tanjungpura' },
  { value: 'SBMPTN UNNES', label: 'SBMPTN UNNES - Universitas Negeri Semarang' },
  { value: 'UM UB', label: 'UM UB - Universitas Brawijaya' },
  { value: 'UM UNESA', label: 'UM UNESA - Universitas Negeri Surabaya' },
  { value: 'UM UNSOED', label: 'UM UNSOED - Universitas Jenderal Soedirman' },
  { value: 'UM UNS', label: 'UM UNS - Universitas Sebelas Maret' },
  { value: 'UM UNEJ', label: 'UM UNEJ - Universitas Jember' },
  { value: 'UM UNAND', label: 'UM UNAND - Universitas Andalas' },
  { value: 'UM UNRI', label: 'UM UNRI - Universitas Riau' },
  { value: 'UM UNSYIAH', label: 'UM UNSYIAH - Universitas Syiah Kuala' },
  { value: 'UM UNIMAL', label: 'UM UNIMAL - Universitas Malikussaleh' },
  { value: 'UM UNJA', label: 'UM UNJA - Universitas Jambi' },
  { value: 'UM UNIB', label: 'UM UNIB - Universitas Bengkulu' },
  { value: 'UM UNSIL', label: 'UM UNSIL - Universitas Siliwangi' },
  { value: 'UM UIN Jakarta', label: 'UM UIN Jakarta - UIN Syarif Hidayatullah' },
  { value: 'UM UIN Bandung', label: 'UM UIN Bandung - UIN Sunan Gunung Djati' },
  { value: 'UM UIN Yogyakarta', label: 'UM UIN Yogyakarta - UIN Sunan Kalijaga' },
  { value: 'UM UIN Semarang', label: 'UM UIN Semarang - UIN Walisongo' },
  { value: 'UM UIN Surabaya', label: 'UM UIN Surabaya - UIN Sunan Ampel' },
  { value: 'UM UIN Malang', label: 'UM UIN Malang - UIN Maulana Malik Ibrahim' },
  { value: 'UM UIN Makassar', label: 'UM UIN Makassar - UIN Alauddin' },
  { value: 'UM UIN Medan', label: 'UM UIN Medan - UIN Sumatera Utara' },
  { value: 'Lainnya', label: 'Ujian Mandiri Lainnya' }
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TargetSelection: React.FC = () => {
  const router = useRouter();
  const { username } = useAuth();
  const [jenisSeleksi, setJenisSeleksi] = useState<JenisSeleksi>('');
  const [subJenisSeleksi, setSubJenisSeleksi] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [examScoreMapping, setExamScoreMapping] = useState<ExamScoreMapping[]>([]);
  
  // Updated state for fixed university handling
  const [fixedUniversityId, setFixedUniversityId] = useState<number | null>(null);
  const [fixedUniversityName, setFixedUniversityName] = useState<string>('');
  
  // Selections for university-based programs
  const [prodiSelections, setProdiSelections] = useState<ProdiSelection[]>([
    { id: '1', universitas: null, prodi: null, jenjang: 'S1' }
  ]);
  
  // Selections for job-based programs
  const [formasiSelections, setFormasiSelections] = useState<FormasiSelection[]>([
    { id: '1', formasi: null }
  ]);
  
  const [targetData, setTargetData] = useState<UserTargetData>({
    jenis_seleksi: '',
    sub_jenis_seleksi: '',
    notes: '',
    prodi_id_list: [],
    formasi_id_list: [],
    score_1: undefined,
    score_2: undefined,
    score_3: undefined,
    score_4: undefined,
    score_5: undefined,
    score_6: undefined,
    score_7: undefined
  });

  // Jenjang options for PTN (State Universities)
  const jenjangPTNOptions = [
    { value: 'S1', label: 'S1' },
    { value: 'D1', label: 'D1' },
    { value: 'D2', label: 'D2' },
    { value: 'D3', label: 'D3' },
    { value: 'D4', label: 'D4' }
  ];

  // All jenjang options for other selections
  const jenjangAllOptions = [
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' },
    { value: 'S3', label: 'S3' },
    { value: 'D1', label: 'D1' },
    { value: 'D2', label: 'D2' },
    { value: 'D3', label: 'D3' },
    { value: 'D4', label: 'D4' },
    { value: 'Profesi', label: 'Profesi' },
    { value: 'Sp-1', label: 'Sp-1' },
    { value: 'Sp-2', label: 'Sp-2' },
    { value: 'S2 Terapan', label: 'S2 Terapan' },
    { value: 'S3 Terapan', label: 'S3 Terapan' }
  ];

  // Initialize data loaded state
  useEffect(() => {
    if (username) {
      setDataLoaded(true);
    }
  }, [username]);

  // Updated fetch exam score mapping - only fetch when both conditions are met
  useEffect(() => {
    const fetchExamScoreMapping = async () => {
      if (!jenisSeleksi) return;
      
      // For Ujian Mandiri, don't fetch until subJenisSeleksi is selected
      if (jenisSeleksi === 'Ujian Mandiri' && !subJenisSeleksi) {
        setExamScoreMapping([]);
        return;
      }
      
      try {
        let url = `${API_BASE_URL}/target/exam-score-mapping/${jenisSeleksi}`;
        
        // For Ujian Mandiri, include sub_jenis_seleksi
        if (jenisSeleksi === 'Ujian Mandiri' && subJenisSeleksi) {
          url += `?subJenisSeleksi=${encodeURIComponent(subJenisSeleksi)}`;
        }
        
        const response = await axios.get(url);
        setExamScoreMapping(response.data);
      } catch (error) {
        console.error('Error fetching exam score mapping:', error);
        setExamScoreMapping([]);
      }
    };

    fetchExamScoreMapping();
  }, [jenisSeleksi, subJenisSeleksi]);

  // Updated fetch fixed university - only fetch when subJenisSeleksi is selected
  useEffect(() => {
    const fetchFixedUniversity = async () => {
      if (jenisSeleksi === 'Ujian Mandiri' && subJenisSeleksi) {
        try {
          // Get the fixed university ID and name
          const universityResponse = await axios.get(
            `${API_BASE_URL}/target/ujian-mandiri-university/${encodeURIComponent(subJenisSeleksi)}`
          );
          const { university_id, university_name } = universityResponse.data;
          
          if (university_id && university_name) {
            setFixedUniversityId(university_id);
            setFixedUniversityName(university_name);
            
            // Auto-set all prodi selections to this university
            const updatedSelections = prodiSelections.map(selection => ({
              ...selection,
              universitas: {
                label: university_name,
                value: university_id
              },
              prodi: null // Reset prodi when university changes
            }));
            setProdiSelections(updatedSelections);
          } else {
            setFixedUniversityId(null);
            setFixedUniversityName('');
          }
        } catch (error) {
          console.error('Error fetching fixed university:', error);
          setFixedUniversityId(null);
          setFixedUniversityName('');
        }
      } else {
        setFixedUniversityId(null);
        setFixedUniversityName('');
      }
    };

    fetchFixedUniversity();
  }, [jenisSeleksi, subJenisSeleksi]);

  // Fetch existing target data
  useEffect(() => {
    const fetchExistingData = async () => {
      if (!jenisSeleksi) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/target/user/${jenisSeleksi}?includeDetails=true`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        if (response.data.status === 'success') {
          const data = response.data.data;
          setTargetData(data);
          setSubJenisSeleksi(data.sub_jenis_seleksi || '');
          
          // Set prodi selections
          if (data.prodi_details && data.prodi_details.length > 0) {
            const selections = data.prodi_details.map((prodi: any, index: number) => ({
              id: (index + 1).toString(),
              universitas: {
                label: `${prodi.nama_pt} (${prodi.nama_singkat})`,
                value: prodi.university_id
              },
              prodi: {
                label: `${prodi.nama_prodi} (${prodi.jenjang_prodi})`,
                value: prodi.id
              },
              jenjang: prodi.jenjang_prodi
            }));
            setProdiSelections(selections);
          }
          
          // Set formasi selections
          if (data.formasi_details && data.formasi_details.length > 0) {
            const selections = data.formasi_details.map((formasi: any, index: number) => ({
              id: (index + 1).toString(),
              formasi: {
                label: `${formasi.nama_formasi} - ${formasi.instansi || 'N/A'}`,
                value: formasi.id
              }
            }));
            setFormasiSelections(selections);
          }
        }
      } catch (error) {
        console.error('Error fetching existing target data:', error);
        // Handle error gracefully - user might not have existing data
      }
    };

    fetchExistingData();
  }, [jenisSeleksi]);

  const handleJenisSeleksiChange = (value: string) => {
    setJenisSeleksi(value as JenisSeleksi);
    setSubJenisSeleksi(''); // Reset sub jenis
    setTargetData(prev => ({ 
      ...prev, 
      jenis_seleksi: value,
      sub_jenis_seleksi: '',
      notes: '', // Reset notes when changing jenis seleksi
      prodi_id_list: [],
      formasi_id_list: [],
      score_1: undefined,
      score_2: undefined,
      score_3: undefined,
      score_4: undefined,
      score_5: undefined,
      score_6: undefined,
      score_7: undefined
    }));
    
    // Reset selections and fixed university
    setProdiSelections([{ id: '1', universitas: null, prodi: null, jenjang: 'S1' }]);
    setFormasiSelections([{ id: '1', formasi: null }]);
    setFixedUniversityId(null);
    setFixedUniversityName('');
  };

  const handleSubJenisSeleksiChange = (value: string) => {
    setSubJenisSeleksi(value);
    setTargetData(prev => ({ 
      ...prev, 
      sub_jenis_seleksi: value,
      notes: '', // Reset notes when changing sub jenis seleksi
      prodi_id_list: [],
      formasi_id_list: []
    }));
    
    // Reset selections when sub type changes
    setProdiSelections([{ id: '1', universitas: null, prodi: null, jenjang: 'S1' }]);
  };

  // Prodi selection handlers
  const addProdiSelection = () => {
    if (prodiSelections.length < 4) {
      const newId = (prodiSelections.length + 1).toString();
      const newSelection: ProdiSelection = { 
        id: newId, 
        universitas: jenisSeleksi === 'Ujian Mandiri' && fixedUniversityName ? 
          { label: fixedUniversityName, value: fixedUniversityId! } : null, 
        prodi: null, 
        jenjang: 'S1' 
      };
      setProdiSelections([...prodiSelections, newSelection]);
    }
  };

  const removeProdiSelection = (id: string) => {
    if (prodiSelections.length > 1) {
      setProdiSelections(prodiSelections.filter(selection => selection.id !== id));
      updateProdiIdList(prodiSelections.filter(selection => selection.id !== id));
    }
  };

  const updateProdiSelection = (id: string, field: keyof ProdiSelection, value: any) => {
    const updated = prodiSelections.map(selection => {
      if (selection.id === id) {
        const newSelection = { ...selection, [field]: value };
        // Reset prodi when university or jenjang changes
        if (field === 'universitas' || field === 'jenjang') {
          newSelection.prodi = null;
        }
        return newSelection;
      }
      return selection;
    });
    setProdiSelections(updated);
    updateProdiIdList(updated);
  };

  const updateProdiIdList = (selections: ProdiSelection[]) => {
    const prodiIds = selections
      .filter(selection => selection.prodi)
      .map(selection => Number(selection.prodi!.value));
    
    setTargetData(prev => ({
      ...prev,
      prodi_id_list: prodiIds
    }));
  };

  // Formasi selection handlers
  const addFormasiSelection = () => {
    if (formasiSelections.length < 3) {
      const newId = (formasiSelections.length + 1).toString();
      setFormasiSelections([...formasiSelections, { id: newId, formasi: null }]);
    }
  };

  const removeFormasiSelection = (id: string) => {
    if (formasiSelections.length > 1) {
      setFormasiSelections(formasiSelections.filter(selection => selection.id !== id));
      updateFormasiIdList(formasiSelections.filter(selection => selection.id !== id));
    }
  };

  const updateFormasiSelection = (id: string, value: SelectOption | null) => {
    const updated = formasiSelections.map(selection => 
      selection.id === id ? { ...selection, formasi: value } : selection
    );
    setFormasiSelections(updated);
    updateFormasiIdList(updated);
  };

  const updateFormasiIdList = (selections: FormasiSelection[]) => {
    const formasiIds = selections
      .filter(selection => selection.formasi)
      .map(selection => Number(selection.formasi!.value));
    
    setTargetData(prev => ({
      ...prev,
      formasi_id_list: formasiIds
    }));
  };

  const handleScoreChange = (position: number, value: string) => {
    const numValue = value === '' ? undefined : Math.max(0, parseFloat(value) || 0);
    setTargetData(prev => ({
      ...prev,
      [`score_${position}`]: numValue
    }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTargetData(prev => ({ ...prev, notes: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!jenisSeleksi) {
      alert('Silakan pilih jenis seleksi terlebih dahulu!');
      setIsLoading(false);
      return;
    }

    if (jenisSeleksi === 'Ujian Mandiri' && !subJenisSeleksi) {
      alert('Silakan pilih jenis ujian mandiri terlebih dahulu!');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/target/save`, {
        ...targetData,
        sub_jenis_seleksi: subJenisSeleksi
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error saving target data:', error);
      alert('Gagal menyimpan data target. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectionIcon = (type: string) => {
    switch (type) {
      case 'SNBT': return <Brain className="tw-w-6 tw-h-6" />;
      case 'SNBP': return <Trophy className="tw-w-6 tw-h-6" />;
      case 'Ujian Mandiri': return <Target className="tw-w-6 tw-h-6" />;
      case 'CPNS': return <Shield className="tw-w-6 tw-h-6" />;
      case 'BUMN': return <Building className="tw-w-6 tw-h-6" />;
      default: return <Star className="tw-w-6 tw-h-6" />;
    }
  };

  const getSelectionColor = (type: string) => {
    switch (type) {
      case 'SNBT': return 'tw-from-blue-500/20 tw-to-cyan-500/20';
      case 'SNBP': return 'tw-from-green-500/20 tw-to-emerald-500/20';
      case 'Ujian Mandiri': return 'tw-from-orange-500/20 tw-to-red-500/20';
      case 'CPNS': return 'tw-from-purple-500/20 tw-to-pink-500/20';
      case 'BUMN': return 'tw-from-indigo-500/20 tw-to-purple-500/20';
      default: return 'tw-from-gray-500/20 tw-to-slate-500/20';
    }
  };

  // Updated prodi API endpoint to use fixed university
  const getProgramStudiApiEndpoint = (universityId: number | string, jenjang?: string): string => {
    // For ujian mandiri, use the fixed university if available
    const actualUniversityId = jenisSeleksi === 'Ujian Mandiri' && fixedUniversityId 
      ? fixedUniversityId 
      : universityId;
      
    let endpoint = `/universities/${actualUniversityId}/prodi`;
    
    if (jenjang && jenjang.trim() !== '') {
      const params = new URLSearchParams();
      params.append('jenjang', jenjang.trim());
      endpoint += `?${params.toString()}`;
    }
    
    return endpoint;
  };

  const getUniversityApiEndpoint = (): string => {
    const isPTNSelection = ['SNBT', 'SNBP', 'Ujian Mandiri'].includes(jenisSeleksi);
    
    if (isPTNSelection) {
      return '/universities?jenis_pt=Negeri';
    }
    
    return '/universities';
  };

  const getJenjangOptions = () => {
    const isPTNSelection = ['SNBT', 'SNBP', 'Ujian Mandiri'].includes(jenisSeleksi);
    return isPTNSelection ? jenjangPTNOptions : jenjangAllOptions;
  };

  // Updated university field rendering
  const renderUniversityField = (selection: ProdiSelection, index: number) => {
    if (jenisSeleksi === 'Ujian Mandiri' && fixedUniversityName) {
      // For ujian mandiri with fixed university, show as read-only
      return (
        <Col md={5}>
          <Form.Group className="mb-3">
            <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">
              Universitas (Tetap)
            </Form.Label>
            <Form.Control
              value={fixedUniversityName}
              disabled
              className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/70 tw-backdrop-blur-sm tw-text-gray-600 tw-py-2"
            />
            <small className="tw-text-white/70 tw-mt-1">
              * Universitas sudah ditentukan untuk {subJenisSeleksi}
            </small>
          </Form.Group>
        </Col>
      );
    }

    // Normal university search for other selection types
    return (
      <Col md={5}>
        <SearchSingleField
          label="Universitas"
          value={selection.universitas}
          options={[]}
          onChange={(newValue) => updateProdiSelection(selection.id, 'universitas', newValue)}
          apiEndpoint={getUniversityApiEndpoint()}
          preserveExistingParams={true}
        />
      </Col>
    );
  };

  // Function to get motivational notes placeholder based on sub type
  const getNotesPlaceholder = () => {
    if (jenisSeleksi === 'Ujian Mandiri' && subJenisSeleksi) {
      return `Tulis motivasi khusus untuk ${subJenisSeleksi}. Misalnya: "Aku akan belajar ekstra keras untuk lolos ${subJenisSeleksi} dan masuk jurusan impian di universitas ini!"`;
    }
    return "Tulis kata-kata motivasi untuk dirimu sendiri...";
  };

  const renderTargetSelection = () => {
    if (!jenisSeleksi) return null;

    const isProdiBasedSelection = ['SNBT', 'SNBP', 'Ujian Mandiri'].includes(jenisSeleksi);
    const isFormasiBasedSelection = ['CPNS', 'BUMN'].includes(jenisSeleksi);

    return (
      <div className={`tw-bg-gradient-to-br ${getSelectionColor(jenisSeleksi)} tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20 tw-shadow-lg tw-mb-6`} style={{ position: 'relative', zIndex: 100 }}>
        <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
          <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-purple-400 tw-to-pink-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg">
            {getSelectionIcon(jenisSeleksi)}
          </div>
          <div>
            <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-1">
              Target Selection - {jenisSeleksi}
              {subJenisSeleksi && ` (${subJenisSeleksi})`}
            </h5>
            <p className="tw-text-white/80 tw-text-sm">Tentukan target dan tujuan seleksimu</p>
          </div>
        </div>

        {/* Sub Jenis Seleksi for Ujian Mandiri */}
        {jenisSeleksi === 'Ujian Mandiri' && (
          <div className="tw-mb-6" style={{ position: 'relative', zIndex: 95 }}>
            <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-border tw-border-white/20">
              <h6 className="tw-font-bold tw-text-white tw-mb-3">Pilih Jenis Ujian Mandiri</h6>
              <Form.Select 
                value={subJenisSeleksi} 
                onChange={(e) => handleSubJenisSeleksiChange(e.target.value)}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-2"
              >
                <option value="">Pilih Ujian Mandiri</option>
                {ujianMandiriOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </div>
          </div>
        )}

        {/* University & Prodi Selection - only show when conditions are met */}
        {isProdiBasedSelection && (jenisSeleksi !== 'Ujian Mandiri' || subJenisSeleksi) && (
          <div className="tw-mb-6" style={{ position: 'relative', zIndex: 90 }}>
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <h6 className="tw-font-bold tw-text-white tw-mb-0">Target Prodi & Universitas</h6>
              {prodiSelections.length < 4 && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={addProdiSelection}
                  className="tw-border tw-border-white/30 tw-text-white tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-px-3 tw-py-1"
                >
                  <Plus className="tw-w-4 tw-h-4 tw-mr-1" />
                  Tambah Pilihan
                </Button>
              )}
            </div>
            
            {prodiSelections.map((selection, index) => (
              <div key={selection.id} className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-mb-3 tw-border tw-border-white/20" style={{ position: 'relative', zIndex: 85 - index }}>
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
                  <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-br tw-from-yellow-400 tw-to-orange-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm">
                      {index + 1}
                    </div>
                    <span className="tw-font-semibold tw-text-white">Pilihan {index + 1}</span>
                  </div>
                  {prodiSelections.length > 1 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="tw-text-red-300 tw-p-1"
                      onClick={() => removeProdiSelection(selection.id)}
                    >
                      <X className="tw-w-4 tw-h-4" />
                    </Button>
                  )}
                </div>
                
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">Jenjang</Form.Label>
                      <Form.Select
                        value={selection.jenjang}
                        onChange={(e) => updateProdiSelection(selection.id, 'jenjang', e.target.value)}
                        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-2"
                      >
                        {getJenjangOptions().map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  {renderUniversityField(selection, index)}
                  <Col md={4}>
                    <SearchSingleField
                      label="Program Studi"
                      value={selection.prodi}
                      options={[]}
                      onChange={(newValue) => updateProdiSelection(selection.id, 'prodi', newValue)}
                      apiEndpoint={
                        (jenisSeleksi === 'Ujian Mandiri' ? fixedUniversityId : selection.universitas?.value) && selection.jenjang ? 
                          getProgramStudiApiEndpoint(
                            jenisSeleksi === 'Ujian Mandiri' ? fixedUniversityId! : selection.universitas!.value, 
                            selection.jenjang
                          ) : 
                          undefined
                      }
                      preserveExistingParams={true}
                      disabled={jenisSeleksi === 'Ujian Mandiri' && !fixedUniversityId}
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}

        {/* Formasi Selection */}
        {isFormasiBasedSelection && (
          <div className="tw-mb-6" style={{ position: 'relative', zIndex: 90 }}>
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <h6 className="tw-font-bold tw-text-white tw-mb-0">Target Formasi</h6>
              {formasiSelections.length < 3 && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={addFormasiSelection}
                  className="tw-border tw-border-white/30 tw-text-white tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-px-3 tw-py-1"
                >
                  <Plus className="tw-w-4 tw-h-4 tw-mr-1" />
                  Tambah Pilihan
                </Button>
              )}
            </div>
            
            {formasiSelections.map((selection, index) => (
              <div key={selection.id} className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-mb-3 tw-border tw-border-white/20" style={{ position: 'relative', zIndex: 85 - index }}>
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
                  <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-br tw-from-blue-400 tw-to-purple-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm">
                      {index + 1}
                    </div>
                    <span className="tw-font-semibold tw-text-white">Pilihan {index + 1}</span>
                  </div>
                  {formasiSelections.length > 1 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="tw-text-red-300 tw-p-1"
                      onClick={() => removeFormasiSelection(selection.id)}
                    >
                      <X className="tw-w-4 tw-h-4" />
                    </Button>
                  )}
                </div>
                
                <SearchSingleField
                  label="Formasi"
                  value={selection.formasi}
                  options={[]}
                  onChange={(newValue) => updateFormasiSelection(selection.id, newValue)}
                  apiEndpoint={`/target/formasi/${jenisSeleksi}`}
                  preserveExistingParams={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* Score Targets - only show when mapping is available */}
        {examScoreMapping.length > 0 && (
          <div className="tw-mb-6" style={{ position: 'relative', zIndex: 10 }}>
            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
              <BarChart3 className="tw-w-5 tw-h-5 tw-text-white" />
              <h6 className="tw-font-bold tw-text-white tw-mb-0">Target Skor</h6>
            </div>
            <Row>
              {examScoreMapping.map((mapping) => (
                <Col md={6} lg={4} key={mapping.id} className="tw-mb-4">
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-border tw-border-white/20">
                    <label className="tw-font-semibold tw-text-white tw-mb-2 tw-block tw-text-sm">
                      {mapping.score_label}
                    </label>
                    <p className="tw-text-white/70 tw-text-xs tw-mb-3">
                      {mapping.score_description}
                      {mapping.max_score && ` (Max: ${mapping.max_score})`}
                    </p>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={targetData[`score_${mapping.score_position}` as keyof UserTargetData] || ''}
                      onChange={(e) => handleScoreChange(mapping.score_position, e.target.value)}
                      className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-2"
                      placeholder="Target skor"
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Motivational Notes - updated placeholder based on sub type */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3">
            <Edit3 className="tw-w-5 tw-h-5 tw-text-white" />
            <label className="tw-font-semibold tw-text-white tw-mb-0">
              Catatan Motivasi {jenisSeleksi === 'Ujian Mandiri' && subJenisSeleksi && `untuk ${subJenisSeleksi}`}
            </label>
          </div>
          <Form.Control
            as="textarea"
            rows={3}
            value={targetData.notes || ''}
            onChange={handleNotesChange}
            className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
            placeholder={getNotesPlaceholder()}
          />
        </div>
      </div>
    );
  };

  if (!dataLoaded) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="tw-text-center">
          <div className="tw-animate-spin tw-rounded-full tw-h-16 tw-w-16 tw-border-b-4 tw-border-white tw-mx-auto tw-mb-4"></div>
          <p className="tw-text-white tw-text-lg tw-font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navbar />
      
      {/* Animated Background Elements */}
      <div className="tw-absolute tw-inset-0 tw-overflow-hidden">
        <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
        <div className="tw-absolute tw-top-1/2 tw-left-1/2 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-lg tw-animate-pulse tw-delay-500"></div>
      </div>

      <div className="tw-relative tw-z-10 tw-py-8">
        <Container className="tw-max-w-6xl">
          {/* Header */}
          <div className="tw-text-center tw-mb-8">
            <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-lg">
              <Target className="tw-w-10 tw-h-10 tw-text-white" />
            </div>
            <h1 className="tw-text-4xl md:tw-text-5xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
              Target Seleksi
            </h1>
            <p className="tw-text-lg md:tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-3xl tw-mx-auto">
              Tentukan target dan tujuan seleksimu dengan jelas untuk mencapai kesuksesan
            </p>
          </div>

          {/* Main Container */}
          <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-3xl tw-p-6 tw-border tw-border-white/20 tw-shadow-2xl">
            
            {/* Navigation Tabs */}
            <Nav variant="tabs" className="tw-flex tw-flex-wrap md:tw-flex-nowrap tw-border-0 tw-mb-8 tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-2xl tw-p-2">
              <Nav.Item className="tw-flex-1">
                <Nav.Link 
                  as={Link}
                  href="/akun/data-diri"
                  className="tw-text-white/90 tw-bg-white/10 tw-backdrop-blur-sm tw-font-semibold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-hover:bg-white/20 tw-hover:scale-105 tw-hover:text-white tw-text-center tw-w-full"
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                    <Users className="tw-w-5 tw-h-5" />
                    <span className="tw-text-sm md:tw-text-base">Data Diri</span>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="tw-flex-1 tw-ml-2">
                <Nav.Link 
                  active
                  className="tw-text-white tw-font-bold tw-py-3 tw-px-4 tw-bg-gradient-to-r tw-from-white tw-to-gray-100 tw-text-purple-700 tw-border-0 tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-300 tw-w-full tw-text-center tw-hover:scale-105 tw-hover:shadow-xl"
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-purple-700">
                    <Target className="tw-w-5 tw-h-5" />
                    <span className="tw-text-sm md:tw-text-base tw-font-bold">Target</span>
                    <Sparkles className="tw-w-4 tw-h-4" />
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="tw-flex-1 tw-ml-2">
                <Nav.Link 
                  as={Link}
                  href="/akun/data-password"
                  className="tw-text-white/90 tw-bg-white/10 tw-backdrop-blur-sm tw-font-semibold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-hover:bg-white/20 tw-hover:scale-105 tw-hover:text-white tw-text-center tw-w-full"
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                    <Lock className="tw-w-5 tw-h-5" />
                    <span className="tw-text-sm md:tw-text-base">Password</span>
                  </div>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Form onSubmit={handleSubmit}>
              {/* Selection Type Section */}
              <div className="tw-bg-gradient-to-br tw-from-purple-500/20 tw-to-pink-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mb-6 tw-border tw-border-white/20 tw-shadow-lg" style={{ position: 'relative', zIndex: 95 }}>
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                  <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-purple-400 tw-to-pink-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                    <Target className="tw-w-6 tw-h-6 tw-text-white" />
                  </div>
                  <div>
                    <h4 className="tw-text-xl tw-font-bold tw-text-white tw-mb-1">
                      Jenis Seleksi
                    </h4>
                    <p className="tw-text-white/80 tw-text-sm">Pilih jenis seleksi yang ingin kamu targetkan</p>
                  </div>
                </div>
                
                <Form.Group>
                  <Form.Label className="tw-font-semibold tw-text-white tw-mb-3">
                    Pilih Jenis Seleksi
                  </Form.Label>
                  <Form.Select 
                    value={jenisSeleksi} 
                    onChange={(e) => handleJenisSeleksiChange(e.target.value)}
                    className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3 tw-text-lg"
                  >
                    <option value="">Pilih Jenis Seleksi</option>
                    <option value="SNBT">SNBT (Seleksi Nasional Berbasis Tes)</option>
                    <option value="SNBP">SNBP (Seleksi Nasional Berbasis Prestasi)</option>
                    <option value="Ujian Mandiri">Ujian Mandiri</option>
                    <option value="CPNS">CPNS (Calon Pegawai Negeri Sipil)</option>
                    <option value="BUMN">BUMN (Badan Usaha Milik Negara)</option>
                  </Form.Select>
                </Form.Group>
              </div>
              
              {/* Dynamic Target Form */}
              {renderTargetSelection()}

              {/* Success Message */}
              {showSuccess && (
                <Alert variant="success" className="tw-bg-green-500 tw-text-white tw-border-0 tw-rounded-xl tw-mb-6" style={{ position: 'relative', zIndex: 1 }}>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <CheckCircle className="tw-w-5 tw-h-5" />
                    <span className="tw-font-bold">Target berhasil disimpan!</span>
                  </div>
                </Alert>
              )}

              {/* Submit Button */}
              {jenisSeleksi && (jenisSeleksi !== 'Ujian Mandiri' || subJenisSeleksi) && (
                <div className="tw-text-center tw-mt-8" style={{ position: 'relative', zIndex: 1 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600 tw-border-0 tw-px-8 tw-py-4 tw-rounded-xl tw-font-bold tw-text-lg tw-shadow-lg tw-transition-all tw-duration-300 hover:tw-shadow-xl hover:tw-scale-105 tw-text-white"
                    style={{ minWidth: '280px' }}
                  >
                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                      {isLoading ? (
                        <>
                          <div className="tw-animate-spin tw-rounded-full tw-h-5 tw-w-5 tw-border-b-2 tw-border-white"></div>
                          <span>Menyimpan Target...</span>
                        </>
                      ) : (
                        <>
                          <Save className="tw-w-5 tw-h-5" />
                          <span>Simpan Target Seleksi</span>
                          <Rocket className="tw-w-5 tw-h-5" />
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              )}

              {/* Tips Section */}
              <div className="tw-bg-gradient-to-br tw-from-yellow-500/20 tw-to-orange-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mt-8 tw-border tw-border-white/20 tw-shadow-lg" style={{ position: 'relative', zIndex: 1 }}>
                <div className="tw-text-center tw-mb-6">
                  <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-yellow-400 tw-to-orange-500 tw-rounded-full tw-mb-3 tw-shadow-lg">
                    <Zap className="tw-w-6 tw-h-6 tw-text-white" />
                  </div>
                  <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-2">
                    Tips Menentukan Target yang Realistis
                  </h5>
                </div>
                
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-text-2xl tw-mb-2">🎯</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-1">SMART Goals</h6>
                    <p className="tw-text-white/80 tw-text-sm">Specific, Measurable, Achievable, Relevant, Time-bound</p>
                  </div>
                  
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-text-2xl tw-mb-2">📊</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-1">Analisis Data</h6>
                    <p className="tw-text-white/80 tw-text-sm">Pelajari passing grade dan statistik tahun sebelumnya</p>
                  </div>
                  
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-text-2xl tw-mb-2">🔄</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-1">Fleksibilitas</h6>
                    <p className="tw-text-white/80 tw-text-sm">Siap menyesuaikan target berdasarkan progress</p>
                  </div>
                  
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-text-2xl tw-mb-2">💪</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-1">Konsistensi</h6>
                    <p className="tw-text-white/80 tw-text-sm">Evaluasi dan tingkatkan target secara berkala</p>
                  </div>
                </div>
                
                <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-mt-4 tw-border tw-border-white/20">
                  <div className="tw-text-center">
                    <h6 className="tw-font-bold tw-text-white tw-mb-2 tw-flex tw-items-center tw-justify-center tw-gap-2">
                      <Heart className="tw-w-5 tw-h-5 tw-text-red-300" />
                      Motivasi Hari Ini
                    </h6>
                    <p className="tw-text-white/90 tw-text-lg tw-italic">
                      "Target yang jelas adalah langkah pertama menuju kesuksesan. Mulailah dengan target yang realistis, lalu tingkatkan secara bertahap!"
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Tracking Info untuk Ujian Mandiri */}
              {jenisSeleksi === 'Ujian Mandiri' && subJenisSeleksi && (
                <div className="tw-bg-gradient-to-br tw-from-orange-500/20 tw-to-red-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mt-6 tw-border tw-border-white/20 tw-shadow-lg" style={{ position: 'relative', zIndex: 1 }}>
                  <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                    <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-orange-400 tw-to-red-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                      <School className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <div>
                      <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-1">
                        Tips Khusus {subJenisSeleksi}
                      </h5>
                      <p className="tw-text-white/80 tw-text-sm">Strategi sukses untuk ujian mandiri yang dipilih</p>
                    </div>
                  </div>
                  
                  <div className="tw-space-y-3">
                    <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-3">
                      <div className="tw-w-6 tw-h-6 tw-bg-orange-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm tw-flex-shrink-0 tw-mt-1">
                        1
                      </div>
                      <div>
                        <h6 className="tw-font-bold tw-text-white tw-mb-1">Pelajari Format Soal</h6>
                        <p className="tw-text-white/80 tw-text-sm">Setiap ujian mandiri memiliki format dan pola soal yang berbeda</p>
                      </div>
                    </div>
                    
                    <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-3">
                      <div className="tw-w-6 tw-h-6 tw-bg-red-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm tw-flex-shrink-0 tw-mt-1">
                        2
                      </div>
                      <div>
                        <h6 className="tw-font-bold tw-text-white tw-mb-1">Latihan Soal Spesifik</h6>
                        <p className="tw-text-white/80 tw-text-sm">Kerjakan soal-soal dari ujian mandiri yang sama di tahun sebelumnya</p>
                      </div>
                    </div>
                    
                    <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-3">
                      <div className="tw-w-6 tw-h-6 tw-bg-yellow-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm tw-flex-shrink-0 tw-mt-1">
                        3
                      </div>
                      <div>
                        <h6 className="tw-font-bold tw-text-white tw-mb-1">Kenali Passing Grade</h6>
                        <p className="tw-text-white/80 tw-text-sm">Cari tahu passing grade prodi yang dituju dan target skor minimal</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Tracking Info untuk seleksi lainnya */}
              {jenisSeleksi && jenisSeleksi !== 'Ujian Mandiri' && (
                <div className="tw-bg-gradient-to-br tw-from-blue-500/20 tw-to-cyan-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mt-6 tw-border tw-border-white/20 tw-shadow-lg" style={{ position: 'relative', zIndex: 1 }}>
                  <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                    <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-blue-400 tw-to-cyan-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                      <TrendingUp className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <div>
                      <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-1">
                        Langkah Selanjutnya
                      </h5>
                      <p className="tw-text-white/80 tw-text-sm">Setelah menetapkan target, lakukan ini:</p>
                    </div>
                  </div>
                  
                  <div className="tw-space-y-3">
                    <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-3">
                      <div className="tw-w-6 tw-h-6 tw-bg-green-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm tw-flex-shrink-0 tw-mt-1">
                        1
                      </div>
                      <div>
                        <h6 className="tw-font-bold tw-text-white tw-mb-1">Buat Jadwal Belajar</h6>
                        <p className="tw-text-white/80 tw-text-sm">Susun rencana belajar harian dan mingguan yang realistis</p>
                      </div>
                    </div>
                    
                    <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-3">
                      <div className="tw-w-6 tw-h-6 tw-bg-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm tw-flex-shrink-0 tw-mt-1">
                        2
                      </div>
                      <div>
                        <h6 className="tw-font-bold tw-text-white tw-mb-1">Pantau Progress</h6>
                        <p className="tw-text-white/80 tw-text-sm">Catat hasil try out dan evaluasi kemajuan secara berkala</p>
                      </div>
                    </div>
                    
                    <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-3">
                      <div className="tw-w-6 tw-h-6 tw-bg-purple-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm tw-flex-shrink-0 tw-mt-1">
                        3
                      </div>
                      <div>
                        <h6 className="tw-font-bold tw-text-white tw-mb-1">Adaptasi Strategy</h6>
                        <p className="tw-text-white/80 tw-text-sm">Sesuaikan metode belajar berdasarkan hasil evaluasi</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Form>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default TargetSelection;