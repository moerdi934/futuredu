// Updated pages/panel/users/account/target.tsx
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
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../../../components/layout/NavigationBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SearchSingleField, SelectOption } from '../../../../components/form/FormComponentLayout';

interface ProductType {
  id: number;
  description: string;
  series?: string;
  group_product?: string;
}

interface ExamScoreMapping {
  id: number;
  product_type_id: number;
  university_id?: number;
  score_position: number;
  score_label: string;
  score_description?: string;
  max_score?: number;
  is_active: boolean;
}

interface UserTargetData {
  id?: number;
  product_type_id: number;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TargetSelection: React.FC = () => {
  const router = useRouter();
  const { username } = useAuth();
  
  // State management
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<number | null>(null);
  const [selectedProductTypeData, setSelectedProductTypeData] = useState<ProductType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [examScoreMapping, setExamScoreMapping] = useState<ExamScoreMapping[]>([]);
  
  // University handling
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
    product_type_id: 0,
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

  // Fetch product types on mount
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/target/product-types`);
        setProductTypes(response.data);
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };

    fetchProductTypes();
  }, []);

  // Fetch exam score mapping when product type is selected
  useEffect(() => {
    const fetchExamScoreMapping = async () => {
      if (!selectedProductType) {
        setExamScoreMapping([]);
        return;
      }
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/target/exam-score-mapping/${selectedProductType}`
        );
        setExamScoreMapping(response.data);
      } catch (error) {
        console.error('Error fetching exam score mapping:', error);
        setExamScoreMapping([]);
      }
    };

    fetchExamScoreMapping();
  }, [selectedProductType]);

  // Fetch fixed university if applicable
  useEffect(() => {
    const fetchFixedUniversity = async () => {
      if (!selectedProductType) {
        setFixedUniversityId(null);
        setFixedUniversityName('');
        return;
      }

      try {
        const universityResponse = await axios.get(
          `${API_BASE_URL}/target/university/${selectedProductType}`
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
    };

    fetchFixedUniversity();
  }, [selectedProductType]);

  // Fetch existing target data
  useEffect(() => {
    const fetchExistingData = async () => {
      if (!selectedProductType) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/target/user/${selectedProductType}?includeDetails=true`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
          }
        );
        
        if (response.data.status === 'success') {
          const data = response.data.data;
          setTargetData(data);
          
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
      }
    };

    fetchExistingData();
  }, [selectedProductType]);

  const handleProductTypeChange = (value: string) => {
    const productTypeId = parseInt(value);
    setSelectedProductType(productTypeId || null);
    
    // Find and set the selected product type data
    const productType = productTypes.find(pt => pt.id === productTypeId);
    setSelectedProductTypeData(productType || null);
    
    // Reset all related state
    setTargetData(prev => ({ 
      ...prev, 
      product_type_id: productTypeId,
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
    }));
    
    setProdiSelections([{ id: '1', universitas: null, prodi: null, jenjang: 'S1' }]);
    setFormasiSelections([{ id: '1', formasi: null }]);
    setFixedUniversityId(null);
    setFixedUniversityName('');
  };

  // Prodi selection handlers
  const addProdiSelection = () => {
    if (prodiSelections.length < 4) {
      const newId = (prodiSelections.length + 1).toString();
      const newSelection: ProdiSelection = { 
        id: newId, 
        universitas: fixedUniversityName ? 
          { label: fixedUniversityName, value: fixedUniversityId! } : null, 
        prodi: null, 
        jenjang: 'S1' 
      };
      setProdiSelections([...prodiSelections, newSelection]);
    }
  };

  const removeProdiSelection = (id: string) => {
    if (prodiSelections.length > 1) {
      const updated = prodiSelections.filter(selection => selection.id !== id);
      setProdiSelections(updated);
      updateProdiIdList(updated);
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
      const updated = formasiSelections.filter(selection => selection.id !== id);
      setFormasiSelections(updated);
      updateFormasiIdList(updated);
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

    if (!selectedProductType) {
      alert('Silakan pilih jenis seleksi terlebih dahulu!');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/target/save`, targetData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving target data:', error);
      alert('Gagal menyimpan data target. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to check if product is SNBT (by series or id)
  const isSNBTProduct = () => {
    return selectedProductTypeData?.series === 'SNBT' || selectedProductType === 3;
  };

  const getSelectionIcon = (series?: string) => {
    switch (series) {
      case 'SNBT': return <Brain className="tw-w-6 tw-h-6" />;
      case 'SNBP': return <Trophy className="tw-w-6 tw-h-6" />;
      case 'UM': return <Target className="tw-w-6 tw-h-6" />;
      case 'CPNS': return <Shield className="tw-w-6 tw-h-6" />;
      case 'BUMN': return <Building className="tw-w-6 tw-h-6" />;
      default: return <Star className="tw-w-6 tw-h-6" />;
    }
  };

  const getSelectionColor = (series?: string) => {
    switch (series) {
      case 'SNBT': return 'tw-from-blue-500/20 tw-to-cyan-500/20';
      case 'SNBP': return 'tw-from-green-500/20 tw-to-emerald-500/20';
      case 'UM': return 'tw-from-orange-500/20 tw-to-red-500/20';
      case 'CPNS': return 'tw-from-purple-500/20 tw-to-pink-500/20';
      case 'BUMN': return 'tw-from-indigo-500/20 tw-to-purple-500/20';
      default: return 'tw-from-gray-500/20 tw-to-slate-500/20';
    }
  };

  const getProgramStudiApiEndpoint = (universityId: number | string, jenjang?: string): string => {
    const actualUniversityId = fixedUniversityId || universityId;
    
    // Untuk SNBT Exam (series='SNBT' atau product_type_id=3), gunakan endpoint khusus
    if (isSNBTProduct()) {
      let endpoint = `/target/prodi-snbt/${actualUniversityId}`;
      
      if (jenjang && jenjang.trim() !== '') {
        const params = new URLSearchParams();
        params.append('jenjang', jenjang.trim());
        endpoint += `?${params.toString()}`;
      }
      
      return endpoint;
    }
      
    let endpoint = `/universities/${actualUniversityId}/prodi`;
    
    if (jenjang && jenjang.trim() !== '') {
      const params = new URLSearchParams();
      params.append('jenjang', jenjang.trim());
      endpoint += `?${params.toString()}`;
    }
    
    return endpoint;
  };

  const getUniversityApiEndpoint = (): string => {
    // Untuk SNBT, gunakan endpoint khusus yang filter dari history_utbk_result
    if (isSNBTProduct()) {
      return '/target/universities-snbt';
    }
    
    const series = selectedProductTypeData?.series;
    const isStatePTN = ['SNBP', 'UM'].includes(series || '');
    
    if (isStatePTN) {
      return '/universities?jenis_pt=Negeri';
    }
    
    return '/universities';
  };

  const getJenjangOptions = () => {
    const series = selectedProductTypeData?.series;
    const isStatePTN = ['SNBT', 'SNBP', 'UM'].includes(series || '');
    return isStatePTN ? jenjangPTNOptions : jenjangAllOptions;
  };

  const getJenjangOptionsForChoice = (index: number) => {
    // Untuk SNBT Exam (series='SNBT' atau product_type_id=3): pilihan 1-2 bisa S1/D4/D3, pilihan 3-4 hanya D4/D3
    if (isSNBTProduct()) {
      if (index <= 1) {
        // Pilihan 1 dan 2: S1, D4, D3
        return [
          { value: 'S1', label: 'S1' },
          { value: 'D4', label: 'D4' },
          { value: 'D3', label: 'D3' }
        ];
      } else {
        // Pilihan 3 dan 4: D4, D3 saja
        return [
          { value: 'D4', label: 'D4' },
          { value: 'D3', label: 'D3' }
        ];
      }
    }
    
    const isStatePTN = ['SNBP', 'UM'].includes(series || '');
    return isStatePTN ? jenjangPTNOptions : jenjangAllOptions;
  };

  const renderUniversityField = (selection: ProdiSelection, index: number) => {
    if (fixedUniversityName) {
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
              * Universitas sudah ditentukan untuk {selectedProductTypeData?.description}
            </small>
          </Form.Group>
        </Col>
      );
    }

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

  const getNotesPlaceholder = () => {
    if (selectedProductTypeData) {
      return `Tulis motivasi khusus untuk ${selectedProductTypeData.description}. Misalnya: "Aku akan belajar ekstra keras untuk lolos ${selectedProductTypeData.description} dan masuk jurusan impian!"`;
    }
    return "Tulis kata-kata motivasi untuk dirimu sendiri...";
  };

  const renderTargetSelection = () => {
    if (!selectedProductType || !selectedProductTypeData) return null;

    const series = selectedProductTypeData.series;
    // Check by series name OR specific product_type_id for SNBT
    const isProdiBasedSelection = ['SNBT', 'SNBP', 'UM'].includes(series || '') || selectedProductType === 3;
    const isFormasiBasedSelection = ['CPNS', 'BUMN'].includes(series || '');

    return (
      <div className={`tw-bg-gradient-to-br ${getSelectionColor(series)} tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20 tw-shadow-lg tw-mb-6`} style={{ position: 'relative', zIndex: 100 }}>
        <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
          <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-purple-400 tw-to-pink-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg">
            {getSelectionIcon(series)}
          </div>
          <div>
            <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-1">
              Target Selection - {selectedProductTypeData.description}
            </h5>
            <p className="tw-text-white/80 tw-text-sm">Tentukan target dan tujuan seleksimu</p>
          </div>
        </div>

        {/* University & Prodi Selection */}
        {isProdiBasedSelection && (
          <div className="tw-mb-6" style={{ position: 'relative', zIndex: 90 }}>
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <div>
                <h6 className="tw-font-bold tw-text-white tw-mb-0">Target Prodi & Universitas</h6>
                {isSNBTProduct() && (
                  <small className="tw-text-yellow-200 tw-block tw-mt-1">
                    * Pilihan 1-2: S1/D4/D3 | Pilihan 3-4: D4/D3 saja | Prodi dari data UTBK historis
                  </small>
                )}
              </div>
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
                        {getJenjangOptionsForChoice(index).map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Form.Select>
                      {isSNBTProduct() && index >= 2 && (
                        <small className="tw-text-yellow-200 tw-mt-1 tw-block">
                          * Pilihan {index + 1}: Hanya D4 atau D3
                        </small>
                      )}
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
                        (fixedUniversityId || selection.universitas?.value) && selection.jenjang ? 
                          getProgramStudiApiEndpoint(
                            fixedUniversityId || selection.universitas!.value, 
                            selection.jenjang
                          ) : 
                          undefined
                      }
                      preserveExistingParams={true}
                      disabled={!fixedUniversityId && !selection.universitas}
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
                  apiEndpoint={`/target/formasi/${selectedProductType}`}
                  preserveExistingParams={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* Score Targets */}
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

        {/* Motivational Notes */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3">
            <Edit3 className="tw-w-5 tw-h-5 tw-text-white" />
            <label className="tw-font-semibold tw-text-white tw-mb-0">
              Catatan Motivasi untuk {selectedProductTypeData.description}
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
                    value={selectedProductType || ''} 
                    onChange={(e) => handleProductTypeChange(e.target.value)}
                    className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3 tw-text-lg"
                  >
                    <option value="">Pilih Jenis Seleksi</option>
                    {productTypes.map(pt => (
                      <option key={pt.id} value={pt.id}>
                        {pt.description}
                      </option>
                    ))}
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
              {selectedProductType && (
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

              {/* Progress Tracking Info */}
              {selectedProductType && (
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