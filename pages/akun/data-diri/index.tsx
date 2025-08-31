// Updated Account.tsx - Fixed z-index for dropdown positioning

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav } from 'react-bootstrap';
import { 
  User, 
  Edit3, 
  MapPin, 
  GraduationCap, 
  Phone, 
  Calendar, 
  Users, 
  Heart, 
  Sparkles,
  Save,
  Eye,
  EyeOff,
  Star,
  Trophy,
  Target,
  Zap,
  BookOpen,
  Award,
  Settings,
  Lock,
  Shield
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import NavigationBar from '../../../components/layout/NavigationBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SearchSingleField } from '../../../components/form/FormComponentLayout';
import { SelectOption } from '../../../components/form/FormComponentLayout';
import { SingleValue, ActionMeta } from 'react-select';

interface FormData {
  username?: string;
  nama_lengkap: string;
  nama_panggilan: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  nomor_whatsapp: string;
  nomor_whatsapp_ortu: string;
  provinsi: string;
  provinsi_id: number | null;
  kota: string;
  kota_id: number | null;
  kecamatan: string;
  kecamatan_id: number | null;
  kelurahan: string;
  kelurahan_id: number | null;
  pendidikan_sekarang: string;
  sekolah: string;
  sekolah_id: number | null;
  kelas: string;
  jurusan: string;
  tahun_lulus_sma_smk: string;
  strata: string;
  universitas: string;
  universitas_id: number | null;
  program_studi: string;
  program_studi_id: number | null;
  tahun_masuk: string;
  pendidikan_terakhir: string;
  tahun_lulus: string;
  detail_sekolah_terakhir: string;
  detail_sekolah_terakhir_id: number | null;
  detail_universitas_terakhir: string;
  detail_universitas_terakhir_id: number | null;
  detail_program_studi_terakhir: string;
  detail_program_studi_terakhir_id: number | null;
  detail_strata_terakhir: string;
  [key: string]: string | number | null | undefined;
}

// Location state interface
interface LocationState {
  provinsi: SelectOption | null;
  kota: SelectOption | null;
  kecamatan: SelectOption | null;
  kelurahan: SelectOption | null;
}

// Education state interface
interface EducationState {
  sekolah: SelectOption | null;
  universitas: SelectOption | null;
  program_studi: SelectOption | null;
  detail_sekolah_terakhir: SelectOption | null;
  detail_universitas_terakhir: SelectOption | null;
  detail_program_studi_terakhir: SelectOption | null;
}

type PendidikanSekarang = 'SD' | 'SMP' | 'SMA/SMK' | 'Gap Year' | 'Kuliah' | 'Mencari Pekerjaan';
type PendidikanTerakhir = 'SD' | 'SMP' | 'SMA' | 'S1' | 'S2' | 'S3';

interface MandatoryFields {
  [key: string]: string[];
}

const Account: React.FC = () => {
  const router = useRouter();
  const { username } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: username,
    nama_lengkap: '',
    nama_panggilan: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    nomor_whatsapp: '',
    nomor_whatsapp_ortu: '',
    provinsi: '',
    provinsi_id: null,
    kota: '',
    kota_id: null,
    kecamatan: '',
    kecamatan_id: null,
    kelurahan: '',
    kelurahan_id: null,
    pendidikan_sekarang: '',
    sekolah: '',
    sekolah_id: null,
    kelas: '',
    jurusan: '',
    tahun_lulus_sma_smk: '',
    strata: '',
    universitas: '',
    universitas_id: null,
    program_studi: '',
    program_studi_id: null,
    tahun_masuk: '',
    pendidikan_terakhir: '',
    tahun_lulus: '',
    detail_sekolah_terakhir: '',
    detail_sekolah_terakhir_id: null,
    detail_universitas_terakhir: '',
    detail_universitas_terakhir_id: null,
    detail_program_studi_terakhir: '',
    detail_program_studi_terakhir_id: null,
    detail_strata_terakhir: ''
  });

  // Location state for SearchSingleField
  const [locationState, setLocationState] = useState<LocationState>({
    provinsi: null,
    kota: null,
    kecamatan: null,
    kelurahan: null
  });

  // Education state for SearchSingleField
  const [educationState, setEducationState] = useState<EducationState>({
    sekolah: null,
    universitas: null,
    program_studi: null,
    detail_sekolah_terakhir: null,
    detail_universitas_terakhir: null,
    detail_program_studi_terakhir: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Jenjang Prodi options
  const jenjangProdiOptions = [
    { value: 'S2 Terapan', label: 'S2 Terapan' },
    { value: 'Profesi', label: 'Profesi' },
    { value: 'D4', label: 'D4' },
    { value: 'Sp-2', label: 'Sp-2' },
    { value: 'Sp-1', label: 'Sp-1' },
    { value: 'S3', label: 'S3' },
    { value: 'D1', label: 'D1' },
    { value: 'D2', label: 'D2' },
    { value: 'D3', label: 'D3' },
    { value: 'S1', label: 'S1' },
    { value: 'S3 Terapan', label: 'S3 Terapan' },
    { value: 'S2', label: 'S2' }
  ];

  // Field wajib berdasarkan pendidikan_sekarang
  const mandatoryFields: MandatoryFields = {
    SD: ['sekolah'],
    SMP: ['sekolah'],
    'SMA/SMK': ['sekolah', 'kelas', 'jurusan'],
    'Gap Year': ['sekolah', 'jurusan', 'tahun_lulus_sma_smk'],
    Kuliah: ['strata', 'universitas', 'program_studi', 'tahun_masuk'],
    'Mencari Pekerjaan': ['pendidikan_terakhir', 'tahun_lulus'],
  };

  useEffect(() => {
    const fetchUserId = async (): Promise<string | undefined> => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/username/${username}`, 
          { withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
          });
        setUserId(response.data.user_id);
        return response.data.user_id;
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    const fetchData = async (user_id: string): Promise<void> => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user-accounts/${user_id}`, { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
         });
         
        if (response.data) {
          const userData = response.data;
          
          const mappedData = {
            ...userData,
            username: username,
            kota_id: userData.city_id || userData.kota_id,
            universitas_id: userData.university_id || userData.universitas_id,
            program_studi_id: userData.prodi_id || userData.program_studi_id,
            // Add "0" prefix to WhatsApp numbers if they don't start with "0"
            nomor_whatsapp: userData.nomor_whatsapp && !userData.nomor_whatsapp.startsWith('0') 
              ? `0${userData.nomor_whatsapp}` 
              : userData.nomor_whatsapp,
            nomor_whatsapp_ortu: userData.nomor_whatsapp_ortu && !userData.nomor_whatsapp_ortu.startsWith('0') 
              ? `0${userData.nomor_whatsapp_ortu}` 
              : userData.nomor_whatsapp_ortu
          }
          
          setFormData(prevFormData => ({
            ...prevFormData,
            ...mappedData
          }));

          const newLocationState: LocationState = {
            provinsi: userData.provinsi ? {
              value: userData.provinsi_id || userData.provinsi,
              label: userData.provinsi
            } : null,
            kota: userData.kota ? {
              value: userData.city_id || userData.kota_id || userData.kota,
              label: userData.kota
            } : null,
            kecamatan: userData.kecamatan ? {
              value: userData.kecamatan_id || userData.kecamatan,
              label: userData.kecamatan
            } : null,
            kelurahan: userData.kelurahan ? {
              value: userData.kelurahan_id || userData.kelurahan,
              label: userData.kelurahan
            } : null
          };
          
          setLocationState(newLocationState);

          const newEducationState: EducationState = {
            sekolah: userData.sekolah ? {
              value: userData.sekolah_id || userData.sekolah,
              label: userData.sekolah
            } : null,
            universitas: userData.universitas ? {
              value: userData.university_id || userData.universitas_id || userData.universitas,
              label: userData.universitas
            } : null,
            program_studi: userData.program_studi ? {
              value: userData.prodi_id || userData.program_studi_id || userData.program_studi,
              label: userData.program_studi
            } : null,
            detail_sekolah_terakhir: userData.detail_sekolah_terakhir ? {
              value: userData.detail_sekolah_terakhir_id || userData.detail_sekolah_terakhir,
              label: userData.detail_sekolah_terakhir
            } : null,
            detail_universitas_terakhir: userData.detail_universitas_terakhir ? {
              value: userData.detail_universitas_terakhir_id || userData.detail_universitas_terakhir,
              label: userData.detail_universitas_terakhir
            } : null,
            detail_program_studi_terakhir: userData.detail_program_studi_terakhir ? {
              value: userData.detail_program_studi_terakhir_id || userData.detail_program_studi_terakhir,
              label: userData.detail_program_studi_terakhir
            } : null
          };
          
          setEducationState(newEducationState);
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        setDataLoaded(true);
      }
    };

    if (username) {
      setFormData(prevFormData => ({
        ...prevFormData,
        username: username
      }));
      fetchUserId().then(user_id => {
        if (user_id) {
          fetchData(user_id);
        }
      });
    }
  }, [username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    if (e.target.type === 'date') {
      const date = new Date(value);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({
        ...formData,
        [name]: formattedDate
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });

      // Reset dependent fields when pendidikan_sekarang changes
      if (name === 'pendidikan_sekarang') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          sekolah: '',
          sekolah_id: null,
          kelas: '',
          jurusan: '',
          tahun_lulus_sma_smk: '',
          strata: '',
          universitas: '',
          universitas_id: null,
          program_studi: '',
          program_studi_id: null,
          tahun_masuk: ''
        }));
        
        setEducationState(prev => ({
          ...prev,
          sekolah: null,
          universitas: null,
          program_studi: null
        }));
      }

      if (name === 'pendidikan_terakhir') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          detail_sekolah_terakhir: '',
          detail_sekolah_terakhir_id: null,
          detail_universitas_terakhir: '',
          detail_universitas_terakhir_id: null,
          detail_program_studi_terakhir: '',
          detail_program_studi_terakhir_id: null,
          detail_strata_terakhir: ''
        }));
        
        setEducationState(prev => ({
          ...prev,
          detail_sekolah_terakhir: null,
          detail_universitas_terakhir: null,
          detail_program_studi_terakhir: null
        }));
      }

      if (name === 'strata') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          program_studi: '',
          program_studi_id: null
        }));
        
        setEducationState(prev => ({
          ...prev,
          program_studi: null
        }));
      }

      if (name === 'detail_strata_terakhir') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          detail_program_studi_terakhir: '',
          detail_program_studi_terakhir_id: null
        }));
        
        setEducationState(prev => ({
          ...prev,
          detail_program_studi_terakhir: null
        }));
      }
    }
  };

  const findLocationIdByName = async (name: string, endpoint: string): Promise<number | null> => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        params: { search: name },
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const locations = Array.isArray(response.data) ? response.data : [];
      const found = locations.find((loc: any) => 
        loc.label.toLowerCase() === name.toLowerCase()
      );
      
      return found ? found.value : null;
    } catch (error) {
      console.error('Error finding location ID:', error);
      return null;
    }
  };

  // Location handlers
  const handleProvinsiChange = async (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    const newLocationState = {
      provinsi: newValue,
      kota: null,
      kecamatan: null,
      kelurahan: null
    };
    
    setLocationState(newLocationState);
    
    if (newValue) {
      let provinsiId = newValue.value;
      if (typeof provinsiId === 'string') {
        const foundId = await findLocationIdByName(provinsiId, '/locations/provinces');
        provinsiId = foundId || provinsiId;
      }
      
      setFormData(prev => ({
        ...prev,
        provinsi: newValue.label,
        provinsi_id: typeof provinsiId === 'number' ? provinsiId : null,
        kota: '',
        kota_id: null,
        kecamatan: '',
        kecamatan_id: null,
        kelurahan: '',
        kelurahan_id: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        provinsi: '',
        provinsi_id: null,
        kota: '',
        kota_id: null,
        kecamatan: '',
        kecamatan_id: null,
        kelurahan: '',
        kelurahan_id: null
      }));
    }
  };

  const handleKotaChange = async (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    const newLocationState = {
      ...locationState,
      kota: newValue,
      kecamatan: null,
      kelurahan: null
    };
    
    setLocationState(newLocationState);
    
    if (newValue) {
      let kotaId = newValue.value;
      if (typeof kotaId === 'string' && locationState.provinsi) {
        const foundId = await findLocationIdByName(kotaId, `/locations/cities/${locationState.provinsi.value}`);
        kotaId = foundId || kotaId;
      }
      
      setFormData(prev => ({
        ...prev,
        kota: newValue.label,
        kota_id: typeof kotaId === 'number' ? kotaId : null,
        kecamatan: '',
        kecamatan_id: null,
        kelurahan: '',
        kelurahan_id: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        kota: '',
        kota_id: null,
        kecamatan: '',
        kecamatan_id: null,
        kelurahan: '',
        kelurahan_id: null
      }));
    }
  };

  const handleKecamatanChange = async (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    const newLocationState = {
      ...locationState,
      kecamatan: newValue,
      kelurahan: null
    };
    
    setLocationState(newLocationState);
    
    if (newValue) {
      let kecamatanId = newValue.value;
      if (typeof kecamatanId === 'string' && locationState.kota) {
        const foundId = await findLocationIdByName(kecamatanId, `/locations/districts/${locationState.kota.value}`);
        kecamatanId = foundId || kecamatanId;
      }
      
      setFormData(prev => ({
        ...prev,
        kecamatan: newValue.label,
        kecamatan_id: typeof kecamatanId === 'number' ? kecamatanId : null,
        kelurahan: '',
        kelurahan_id: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        kecamatan: '',
        kecamatan_id: null,
        kelurahan: '',
        kelurahan_id: null
      }));
    }
  };

  const handleKelurahanChange = async (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    setLocationState(prev => ({
      ...prev,
      kelurahan: newValue
    }));
    
    if (newValue) {
      let kelurahanId = newValue.value;
      if (typeof kelurahanId === 'string' && locationState.kecamatan) {
        const foundId = await findLocationIdByName(kelurahanId, `/locations/villages/${locationState.kecamatan.value}`);
        kelurahanId = foundId || kelurahanId;
      }
      
      setFormData(prev => ({
        ...prev,
        kelurahan: newValue.label,
        kelurahan_id: typeof kelurahanId === 'number' ? kelurahanId : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        kelurahan: '',
        kelurahan_id: null
      }));
    }
  };

  // Education handlers
  const handleSekolahChange = (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    setEducationState(prev => ({
      ...prev,
      sekolah: newValue
    }));
    
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        sekolah: newValue.label,
        sekolah_id: typeof newValue.value === 'number' ? newValue.value : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sekolah: '',
        sekolah_id: null
      }));
    }
  };

  const handleUniversitasChange = (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    setEducationState(prev => ({
      ...prev,
      universitas: newValue,
      program_studi: null
    }));
    
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        universitas: newValue.label,
        universitas_id: typeof newValue.value === 'number' ? newValue.value : null,
        program_studi: '',
        program_studi_id: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        universitas: '',
        universitas_id: null,
        program_studi: '',
        program_studi_id: null
      }));
    }
  };

  const handleProgramStudiChange = (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    setEducationState(prev => ({
      ...prev,
      program_studi: newValue
    }));
    
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        program_studi: newValue.label,
        program_studi_id: typeof newValue.value === 'number' ? newValue.value : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        program_studi: '',
        program_studi_id: null
      }));
    }
  };

  const handleDetailSekolahTerakhirChange = (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    setEducationState(prev => ({
      ...prev,
      detail_sekolah_terakhir: newValue
    }));
    
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        detail_sekolah_terakhir: newValue.label,
        detail_sekolah_terakhir_id: typeof newValue.value === 'number' ? newValue.value : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        detail_sekolah_terakhir: '',
        detail_sekolah_terakhir_id: null
      }));
    }
  };

  const handleDetailUniversitasTerakhirChange = (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    setEducationState(prev => ({
      ...prev,
      detail_universitas_terakhir: newValue,
      detail_program_studi_terakhir: null
    }));
    
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        detail_universitas_terakhir: newValue.label,
        detail_universitas_terakhir_id: typeof newValue.value === 'number' ? newValue.value : null,
        detail_program_studi_terakhir: '',
        detail_program_studi_terakhir_id: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        detail_universitas_terakhir: '',
        detail_universitas_terakhir_id: null,
        detail_program_studi_terakhir: '',
        detail_program_studi_terakhir_id: null
      }));
    }
  };

  const handleDetailProgramStudiTerakhirChange = (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    setEducationState(prev => ({
      ...prev,
      detail_program_studi_terakhir: newValue
    }));
    
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        detail_program_studi_terakhir: newValue.label,
        detail_program_studi_terakhir_id: typeof newValue.value === 'number' ? newValue.value : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        detail_program_studi_terakhir: '',
        detail_program_studi_terakhir_id: null
      }));
    }
  };

  const getSekolahApiEndpoint = (level: string): string => {
    switch (level) {
      case 'SD':
        return '/sekolah/sd';
      case 'SMP':
        return '/sekolah/smp';
      case 'SMA/SMK':
      case 'Gap Year':
        return '/sekolah/sma';
      default:
        return '/sekolah/sd';
    }
  };

  const getDetailSekolahApiEndpoint = (level: string): string => {
    switch (level) {
      case 'SD':
        return '/sekolah/sd';
      case 'SMP':
        return '/sekolah/smp';
      case 'SMA':
        return '/sekolah/sma';
      default:
        return '/sekolah/sd';
    }
  };

  const getProgramStudiApiEndpoint = (universityId: number | string, jenjang?: string): string => {
    let endpoint = `/universities/${universityId}/prodi`;
    
    if (jenjang && jenjang.trim() !== '') {
      endpoint += `?jenjang=${encodeURIComponent(jenjang.trim())}`;
    }
    console.log(endpoint)
    return endpoint;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    const pendidikanSekarang = formData.pendidikan_sekarang as PendidikanSekarang;
    const fieldsToValidate = mandatoryFields[pendidikanSekarang] || [];

    for (const field of fieldsToValidate) {
      if (!formData[field]) {
        alert(`Field ${field} tidak boleh kosong!`);
        setIsLoading(false);
        return;
      }
    }

    if (pendidikanSekarang === 'Mencari Pekerjaan') {
      const pendidikanTerakhir = formData.pendidikan_terakhir as PendidikanTerakhir;
      
      if (['SD', 'SMP', 'SMA'].includes(pendidikanTerakhir)) {
        if (!formData.detail_sekolah_terakhir) {
          alert('Detail sekolah terakhir tidak boleh kosong!');
          setIsLoading(false);
          return;
        }
      } else if (['S1', 'S2', 'S3'].includes(pendidikanTerakhir)) {
        if (!formData.detail_universitas_terakhir || !formData.detail_program_studi_terakhir) {
          alert('Detail universitas dan program studi terakhir tidak boleh kosong!');
          setIsLoading(false);
          return;
        }
      }
    }
    
    if (userId) {
      try {
        const dataToSend = {
          user_id: userId,
          ...formData,
          city_id: formData.kota_id,
          university_id: formData.universitas_id,
          prodi_id: formData.program_studi_id
        };

        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user-accounts/save-account`, 
          dataToSend, { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
          });

        setIsLoading(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        router.push('/');

      } catch (error) {
        console.error('Error saving account:', error);
        setIsLoading(false);
      }
    }
  };

  const renderAdditionalFields = (): JSX.Element | null => {
    switch (formData.pendidikan_sekarang) {
      case 'SD':
        return (
          <>
            <Form.Group as={Col} md={12} controlId="formSchool" className="mb-3">
              <SearchSingleField
                label="Sekolah SD"
                value={educationState.sekolah}
                options={[]}
                onChange={handleSekolahChange}
                apiEndpoint={getSekolahApiEndpoint('SD')}
                required={true}
              />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="formClass" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <GraduationCap className="tw-w-4 tw-h-4" />
                Kelas
              </Form.Label>
              <Form.Select 
                name="kelas" 
                value={formData.kelas} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
              >
                <option value="">Pilih Kelas</option>
                <option value="Kelas 1">Kelas 1</option>
                <option value="Kelas 2">Kelas 2</option>
                <option value="Kelas 3">Kelas 3</option>
                <option value="Kelas 4">Kelas 4</option>
                <option value="Kelas 5">Kelas 5</option>
                <option value="Kelas 6">Kelas 6</option>
              </Form.Select>
            </Form.Group>
          </>
        );
      case 'SMP':
        return (
          <>
            <Form.Group as={Col} md={12} controlId="formSchool" className="mb-3">
              <SearchSingleField
                label="Sekolah SMP"
                value={educationState.sekolah}
                options={[]}
                onChange={handleSekolahChange}
                apiEndpoint={getSekolahApiEndpoint('SMP')}
                required={true}
              />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="formClass" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <GraduationCap className="tw-w-4 tw-h-4" />
                Kelas
              </Form.Label>
              <Form.Select 
                name="kelas" 
                value={formData.kelas} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
              >
                <option value="">Pilih Kelas</option>
                <option value="Kelas 7">Kelas 7</option>
                <option value="Kelas 8">Kelas 8</option>
                <option value="Kelas 9">Kelas 9</option>
              </Form.Select>
            </Form.Group>
          </>
        );
      case 'SMA/SMK':
        return (
          <>
            <Form.Group as={Col} md={8} controlId="formSchool" className="mb-3">
              <SearchSingleField
                label="Sekolah SMA/SMK"
                value={educationState.sekolah}
                options={[]}
                onChange={handleSekolahChange}
                apiEndpoint={getSekolahApiEndpoint('SMA/SMK')}
                required={true}
              />
            </Form.Group>
            <Form.Group as={Col} md={2} controlId="formClass" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <GraduationCap className="tw-w-4 tw-h-4" />
                Kelas
              </Form.Label>
              <Form.Select 
                name="kelas" 
                value={formData.kelas} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
              >
                <option value="">Pilih Kelas</option>
                <option value="Kelas 10">Kelas 10</option>
                <option value="Kelas 11">Kelas 11</option>
                <option value="Kelas 12">Kelas 12</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={2} controlId="formMajor" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <Target className="tw-w-4 tw-h-4" />
                Jurusan
              </Form.Label>
              <Form.Select 
                name="jurusan" 
                value={formData.jurusan} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
              >
                <option value="">Pilih Jurusan</option>
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="Bahasa">Bahasa</option>
                <option value="Keagamaan">Keagamaan</option>
              </Form.Select>
            </Form.Group>
          </>
        );
      case 'Gap Year':
        return (
          <>
            <Form.Group as={Col} md={6} controlId="formSchool" className="mb-3">
              <SearchSingleField
                label="Sekolah SMA/SMK"
                value={educationState.sekolah}
                options={[]}
                onChange={handleSekolahChange}
                apiEndpoint={getSekolahApiEndpoint('Gap Year')}
                required={true}
              />
            </Form.Group>
            <Form.Group as={Col} md={3} controlId="formMajor" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <Target className="tw-w-4 tw-h-4" />
                Jurusan SMA/SMK
              </Form.Label>
              <Form.Select 
                name="jurusan" 
                value={formData.jurusan} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
              >
                <option value="">Pilih Jurusan</option>
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="Bahasa">Bahasa</option>
                <option value="Keagamaan">Keagamaan</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={3} controlId="formGraduationYear" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <Calendar className="tw-w-4 tw-h-4" />
                Tahun Lulus SMA/SMK
              </Form.Label>
              <Form.Control 
                type="number" 
                name="tahun_lulus_sma_smk" 
                value={formData.tahun_lulus_sma_smk} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
                placeholder="2024"
              />
            </Form.Group>
          </>
        );
      case 'Kuliah':
        return (
          <>
            <Form.Group as={Col} md={3} controlId="formStrata" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <Award className="tw-w-4 tw-h-4" />
                Jenjang Prodi
              </Form.Label>
              <Form.Select 
                name="strata" 
                value={formData.strata} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
              >
                <option value="">Pilih Jenjang</option>
                {jenjangProdiOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="formUniversity" className="mb-3">
              <SearchSingleField
                label="Universitas"
                value={educationState.universitas}
                options={[]}
                onChange={handleUniversitasChange}
                apiEndpoint="/universities"
                required={true}
              />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="formStudyProgram" className="mb-3">
              <SearchSingleField
                label="Program Studi"
                value={educationState.program_studi}
                options={[]}
                onChange={handleProgramStudiChange}
                apiEndpoint={educationState.universitas && formData.strata ? 
                  getProgramStudiApiEndpoint(educationState.universitas.value, formData.strata) : 
                  undefined}
                required={true}
                preserveExistingParams={true}
              />
            </Form.Group>
            <Form.Group as={Col} md={3} controlId="formEntryYear" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <Calendar className="tw-w-4 tw-h-4" />
                Tahun Masuk
              </Form.Label>
              <Form.Control 
                type="number" 
                name="tahun_masuk" 
                value={formData.tahun_masuk} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
                placeholder="2023"
              />
            </Form.Group>
          </>
        );
      case 'Mencari Pekerjaan':
        return (
          <>
            <Form.Group as={Col} md={6} controlId="formLastEducation" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <GraduationCap className="tw-w-4 tw-h-4" />
                Pendidikan Terakhir
              </Form.Label>
              <Form.Select 
                name="pendidikan_terakhir" 
                value={formData.pendidikan_terakhir} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
              >
                <option value="">Pilih Pendidikan Terakhir</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="formGraduationYear" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <Calendar className="tw-w-4 tw-h-4" />
                Tahun Lulus
              </Form.Label>
              <Form.Control 
                type="number" 
                name="tahun_lulus" 
                value={formData.tahun_lulus} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
                placeholder="2023"
              />
            </Form.Group>
            
            {formData.pendidikan_terakhir && (
              <Col md={12}>
                <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20 tw-mt-4" style={{ position: 'relative', zIndex: 1 }}>
                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                    <Sparkles className="tw-w-5 tw-h-5 tw-text-yellow-300" />
                    <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-0">
                      Detail {formData.pendidikan_terakhir}
                    </h5>
                  </div>
                  <Row>
                    {renderDetailPendidikanTerakhir()}
                  </Row>
                </div>
              </Col>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const renderDetailPendidikanTerakhir = (): JSX.Element | null => {
    const pendidikanTerakhir = formData.pendidikan_terakhir as PendidikanTerakhir;
    
    switch (pendidikanTerakhir) {
      case 'SD':
        return (
          <Form.Group as={Col} md={12} controlId="formDetailSekolahSD" className="mb-3">
            <SearchSingleField
              label="Nama Sekolah SD"
              value={educationState.detail_sekolah_terakhir}
              options={[]}
              onChange={handleDetailSekolahTerakhirChange}
              apiEndpoint={getDetailSekolahApiEndpoint('SD')}
              required={true}
            />
          </Form.Group>
        );
      case 'SMP':
        return (
          <Form.Group as={Col} md={12} controlId="formDetailSekolahSMP" className="mb-3">
            <SearchSingleField
              label="Nama Sekolah SMP"
              value={educationState.detail_sekolah_terakhir}
              options={[]}
              onChange={handleDetailSekolahTerakhirChange}
              apiEndpoint={getDetailSekolahApiEndpoint('SMP')}
              required={true}
            />
          </Form.Group>
        );
      case 'SMA':
        return (
          <Form.Group as={Col} md={12} controlId="formDetailSekolahSMA" className="mb-3">
            <SearchSingleField
              label="Nama Sekolah SMA"
              value={educationState.detail_sekolah_terakhir}
              options={[]}
              onChange={handleDetailSekolahTerakhirChange}
              apiEndpoint={getDetailSekolahApiEndpoint('SMA')}
              required={true}
            />
          </Form.Group>
        );
      case 'S1':
      case 'S2':
      case 'S3':
        return (
          <>
            <Form.Group as={Col} md={3} controlId="formDetailStrata" className="mb-3">
              <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <Award className="tw-w-4 tw-h-4" />
                Jenjang Prodi
              </Form.Label>
              <Form.Select 
                name="detail_strata_terakhir" 
                value={formData.detail_strata_terakhir} 
                onChange={handleInputChange}
                className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
              >
                <option value="">Pilih Jenjang</option>
                {jenjangProdiOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="formDetailUniversity" className="mb-3">
              <SearchSingleField
                label="Universitas"
                value={educationState.detail_universitas_terakhir}
                options={[]}
                onChange={handleDetailUniversitasTerakhirChange}
                apiEndpoint="/universities"
                required={true}
              />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="formDetailStudyProgram" className="mb-3">
              <SearchSingleField
                label="Program Studi"
                value={educationState.detail_program_studi_terakhir}
                options={[]}
                onChange={handleDetailProgramStudiTerakhirChange}
                apiEndpoint={educationState.detail_universitas_terakhir && formData.detail_strata_terakhir ? 
                  getProgramStudiApiEndpoint(educationState.detail_universitas_terakhir.value, formData.detail_strata_terakhir) : 
                  undefined}
                required={true}
                preserveExistingParams={true}
              />
            </Form.Group>
          </>
        );
      default:
        return null;
    }
  };

  if (!dataLoaded) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="tw-text-center">
          <div className="tw-animate-spin tw-rounded-full tw-h-16 tw-w-16 tw-border-b-4 tw-border-white tw-mx-auto tw-mb-4"></div>
          <p className="tw-text-white tw-text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <NavigationBar />
      <div className="tw-absolute tw-inset-0 tw-overflow-hidden">
        <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
        <div className="tw-absolute tw-top-1/2 tw-left-1/2 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-lg tw-animate-pulse tw-delay-500"></div>
      </div>

      <div className="tw-relative tw-z-10 tw-py-8">
        <Container className="tw-max-w-6xl">
          <div className="tw-text-center tw-mb-8">
            <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-lg">
              <User className="tw-w-10 tw-h-10 tw-text-white" />
            </div>
            <h1 className="tw-text-4xl md:tw-text-5xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
              Profile Setup
            </h1>
            <p className="tw-text-lg md:tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-3xl tw-mx-auto">
              Lengkapi data dirimu untuk pengalaman belajar yang lebih personal!
            </p>
          </div>

          <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-3xl tw-p-6 tw-border tw-border-white/20 tw-shadow-2xl">
            
            <Nav variant="tabs" className="tw-flex tw-flex-wrap md:tw-flex-nowrap tw-border-0 tw-mb-8 tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-2xl tw-p-2">
              <Nav.Item className="tw-flex-1">
                <Nav.Link 
                  active
                  className="tw-text-white tw-font-bold tw-py-3 tw-px-4 tw-bg-gradient-to-r tw-from-white tw-to-gray-100 tw-text-purple-700 tw-border-0 tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-300 tw-w-full tw-text-center tw-hover:scale-105 tw-hover:shadow-xl"
                  style={{ color: '#5B21B6 !important' }}
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-purple-700">
                    <User className="tw-w-5 tw-h-5" />
                    <span className="tw-text-sm md:tw-text-base tw-font-bold">Data Diri</span>
                    <Sparkles className="tw-w-4 tw-h-4" />
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="tw-flex-1 tw-ml-2">
                <Nav.Link 
                  as={Link}
                  href="/akun/data-seleksi"
                  className="tw-text-white/90 tw-bg-white/10 tw-backdrop-blur-sm tw-font-semibold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-hover:bg-white/20 tw-hover:scale-105 tw-hover:text-white tw-text-center tw-w-full"
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                    <Settings className="tw-w-5 tw-h-5" />
                    <span className="tw-text-sm md:tw-text-base">Pendaftaran Seleksi</span>
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
                    <span className="tw-text-sm md:tw-text-base">Ganti Password</span>
                  </div>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Form onSubmit={handleSubmit} className="tw-text-white">
              <div className="tw-bg-gradient-to-br tw-from-purple-500/20 tw-to-pink-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mb-6 tw-border tw-border-white/20 tw-shadow-lg" style={{ position: 'relative', zIndex: 2 }}>
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                  <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-purple-400 tw-to-pink-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                    <User className="tw-w-6 tw-h-6 tw-text-white" />
                  </div>
                  <div>
                    <h4 className="tw-text-xl tw-font-bold tw-text-white tw-mb-1">
                      Data Pribadi
                    </h4>
                    <p className="tw-text-white/80 tw-text-sm">Informasi dasar tentang dirimu</p>
                  </div>
                </div>
                
                <Row>
                  <Col md={4}>
                    <Form.Group controlId="formUsername" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <Users className="tw-w-4 tw-h-4" />
                        Username
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="username" 
                        value={username || ''} 
                        readOnly 
                        className="tw-bg-white/20 tw-border-0 tw-rounded-xl tw-text-white tw-py-3 tw-backdrop-blur-sm" 
                        style={{ '::placeholder': { color: 'rgba(255,255,255,0.6)' } }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="formFullName" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <Edit3 className="tw-w-4 tw-h-4" />
                        Nama Lengkap
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="nama_lengkap" 
                        value={formData.nama_lengkap} 
                        onChange={handleInputChange} 
                        placeholder="Masukkan nama lengkap"
                        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="formNickname" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <Heart className="tw-w-4 tw-h-4" />
                        Nama Panggilan
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="nama_panggilan" 
                        value={formData.nama_panggilan} 
                        onChange={handleInputChange} 
                        placeholder="Masukkan nama panggilan"
                        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={4}>
                    <Form.Group controlId="formGender" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <Users className="tw-w-4 tw-h-4" />
                        Jenis Kelamin
                      </Form.Label>
                      <Form.Select 
                        name="jenis_kelamin" 
                        value={formData.jenis_kelamin} 
                        onChange={handleInputChange}
                        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="formBirthDate" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <Calendar className="tw-w-4 tw-h-4" />
                        Tanggal Lahir
                      </Form.Label>
                      <Form.Control 
                        type="date" 
                        name="tanggal_lahir" 
                        value={formData.tanggal_lahir ? formData.tanggal_lahir.split('T')[0] : ''} 
                        onChange={handleInputChange}
                        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="formWhatsApp" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <Phone className="tw-w-4 tw-h-4" />
                        Nomor WhatsApp
                      </Form.Label>
<Form.Control 
                        type="text" 
                        name="nomor_whatsapp" 
                        value={formData.nomor_whatsapp} 
                        onChange={handleInputChange} 
                        placeholder="Contoh: 08123456789"
                        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="formParentWhatsApp" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <Shield className="tw-w-4 tw-h-4" />
                        Nomor WhatsApp Orang Tua
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="nomor_whatsapp_ortu" 
                        value={formData.nomor_whatsapp_ortu} 
                        onChange={handleInputChange} 
                        placeholder="Contoh: 08123456789"
                        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Address Section with HIGH z-index untuk dropdown wilayah */}
              <div className="tw-bg-gradient-to-br tw-from-blue-500/20 tw-to-cyan-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mb-6 tw-border tw-border-white/20 tw-shadow-lg" style={{ position: 'relative', zIndex: 100 }}>
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                  <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-blue-400 tw-to-cyan-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                    <MapPin className="tw-w-6 tw-h-6 tw-text-white" />
                  </div>
                  <div>
                    <h4 className="tw-text-xl tw-font-bold tw-text-white tw-mb-1">
                      Alamat Tempat Tinggal
                    </h4>
                    <p className="tw-text-white/80 tw-text-sm">Lokasi domisili saat ini</p>
                  </div>
                </div>
                
                <Row>
                  <Col md={3}>
                    <SearchSingleField
                      label="Provinsi"
                      value={locationState.provinsi}
                      options={[]}
                      onChange={handleProvinsiChange}
                      apiEndpoint="/locations/provinces"
                      required={true}
                    />
                  </Col>
                  <Col md={3}>
                    <SearchSingleField
                      label="Kota"
                      value={locationState.kota}
                      options={[]}
                      onChange={handleKotaChange}
                      apiEndpoint={locationState.provinsi ? `/locations/cities/${locationState.provinsi.value}` : undefined}
                      required={true}
                    />
                  </Col>
                  <Col md={3}>
                    <SearchSingleField
                      label="Kecamatan"
                      value={locationState.kecamatan}
                      options={[]}
                      onChange={handleKecamatanChange}
                      apiEndpoint={locationState.kota ? `/locations/districts/${locationState.kota.value}` : undefined}
                      required={true}
                    />
                  </Col>
                  <Col md={3}>
                    <SearchSingleField
                      label="Kelurahan"
                      value={locationState.kelurahan}
                      options={[]}
                      onChange={handleKelurahanChange}
                      apiEndpoint={locationState.kecamatan ? `/locations/villages/${locationState.kecamatan.value}` : undefined}
                      required={true}
                    />
                  </Col>
                </Row>
              </div>
              
              {/* Education Section dengan z-index rendah */}
              <div className="tw-bg-gradient-to-br tw-from-green-500/20 tw-to-emerald-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mb-6 tw-border tw-border-white/20 tw-shadow-lg" style={{ position: 'relative', zIndex: 1 }}>
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                  <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-green-400 tw-to-emerald-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                    <GraduationCap className="tw-w-6 tw-h-6 tw-text-white" />
                  </div>
                  <div>
                    <h4 className="tw-text-xl tw-font-bold tw-text-white tw-mb-1">
                      Informasi Pendidikan
                    </h4>
                    <p className="tw-text-white/80 tw-text-sm">Jenjang pendidikan yang sedang kamu jalani</p>
                  </div>
                </div>
                
                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Group controlId="formEducation">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-3 tw-flex tw-items-center tw-gap-2">
                        <GraduationCap className="tw-w-5 tw-h-5" />
                        Pendidikan Sekarang
                      </Form.Label>
                      <Form.Select 
                        name="pendidikan_sekarang" 
                        value={formData.pendidikan_sekarang} 
                        onChange={handleInputChange}
                        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3 tw-text-lg"
                      >
                        <option value="">Pilih Pendidikan</option>
                        <option value="SD">SD (Sekolah Dasar)</option>
                        <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                        <option value="SMA/SMK">SMA/SMK (Sekolah Menengah Atas)</option>
                        <option value="Gap Year">Gap Year</option>
                        <option value="Kuliah">Kuliah (Perguruan Tinggi)</option>
                        <option value="Mencari Pekerjaan">Mencari Pekerjaan</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                {formData.pendidikan_sekarang && (
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20 tw-mt-4" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                      <Sparkles className="tw-w-5 tw-h-5 tw-text-yellow-300" />
                      <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-0">
                        Detail {formData.pendidikan_sekarang}
                      </h5>
                    </div>
                    <Row>
                      {renderAdditionalFields()}
                    </Row>
                  </div>
                )}
              </div>

              {/* Success Message */}
              {showSuccess && (
                <div className="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600 tw-rounded-2xl tw-p-4 tw-mb-6 tw-text-white tw-text-center tw-shadow-lg tw-animate-pulse">
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                    <Trophy className="tw-w-6 tw-h-6" />
                    <span className="tw-font-bold tw-text-lg">Data berhasil disimpan! Profile kamu sudah update!</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="tw-text-center tw-mt-8">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600 tw-border-0 tw-px-8 tw-py-4 tw-rounded-xl tw-font-bold tw-text-lg tw-shadow-lg tw-transition-all tw-duration-300 hover:tw-shadow-xl hover:tw-scale-105 tw-text-white"
                  style={{ minWidth: '250px' }}
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                    {isLoading ? (
                      <>
                        <div className="tw-animate-spin tw-rounded-full tw-h-5 tw-w-5 tw-border-b-2 tw-border-white"></div>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="tw-w-5 tw-h-5" />
                        <span>Simpan Data</span>
                        <Sparkles className="tw-w-5 tw-h-5" />
                      </>
                    )}
                  </div>
                </Button>
              </div>

              {/* Tips Section */}
              <div className="tw-bg-gradient-to-br tw-from-yellow-500/20 tw-to-orange-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mt-8 tw-border tw-border-white/20 tw-shadow-lg" style={{ position: 'relative', zIndex: 1 }}>
                <div className="tw-text-center tw-mb-4">
                  <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-yellow-400 tw-to-orange-500 tw-rounded-full tw-mb-3 tw-shadow-lg">
                    <Zap className="tw-w-6 tw-h-6 tw-text-white" />
                  </div>
                  <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-2">
                    Tips Profile
                  </h5>
                </div>
                
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-text-2xl tw-mb-2">📝</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-1">Lengkapi Semua</h6>
                    <p className="tw-text-white/80 tw-text-sm">Data lengkap = rekomendasi kursus yang lebih akurat</p>
                  </div>
                  
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-text-2xl tw-mb-2">🎯</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-1">Update Berkala</h6>
                    <p className="tw-text-white/80 tw-text-sm">Perbarui info pendidikan saat naik jenjang</p>
                  </div>
                  
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-text-2xl tw-mb-2">🔒</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-1">Privasi Aman</h6>
                    <p className="tw-text-white/80 tw-text-sm">Data pribadi kamu terlindungi dengan baik</p>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Account;