// pages/panel/users/account/index.tsx - Data Diri (Account Page)
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { 
  User, 
  Edit3, 
  MapPin, 
  GraduationCap, 
  Phone, 
  Calendar, 
  Users, 
  Heart, 
  Save,
  CheckCircle,
  Shield,
  Mail
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import MainLayout from '../../../../components/layout/DashboardLayout';
import { SearchSingleField } from '../../../../components/form/FormComponentLayout';
import { SelectOption } from '../../../../components/form/FormComponentLayout';
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

interface LocationState {
  provinsi: SelectOption | null;
  kota: SelectOption | null;
  kecamatan: SelectOption | null;
  kelurahan: SelectOption | null;
}

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

  const [locationState, setLocationState] = useState<LocationState>({
    provinsi: null,
    kota: null,
    kecamatan: null,
    kelurahan: null
  });

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
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Kelas
              </Form.Label>
              <Form.Select 
                name="kelas" 
                value={formData.kelas} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
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
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Kelas
              </Form.Label>
              <Form.Select 
                name="kelas" 
                value={formData.kelas} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
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
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Kelas
              </Form.Label>
              <Form.Select 
                name="kelas" 
                value={formData.kelas} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
              >
                <option value="">Pilih Kelas</option>
                <option value="Kelas 10">Kelas 10</option>
                <option value="Kelas 11">Kelas 11</option>
                <option value="Kelas 12">Kelas 12</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={2} controlId="formMajor" className="mb-3">
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Jurusan
              </Form.Label>
              <Form.Select 
                name="jurusan" 
                value={formData.jurusan} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
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
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Jurusan SMA/SMK
              </Form.Label>
              <Form.Select 
                name="jurusan" 
                value={formData.jurusan} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
              >
                <option value="">Pilih Jurusan</option>
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="Bahasa">Bahasa</option>
                <option value="Keagamaan">Keagamaan</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={3} controlId="formGraduationYear" className="mb-3">
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Tahun Lulus SMA/SMK
              </Form.Label>
              <Form.Control 
                type="number" 
                name="tahun_lulus_sma_smk" 
                value={formData.tahun_lulus_sma_smk} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
                placeholder="2024"
              />
            </Form.Group>
          </>
        );
      case 'Kuliah':
        return (
          <>
            <Form.Group as={Col} md={3} controlId="formStrata" className="mb-3">
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Jenjang Prodi
              </Form.Label>
              <Form.Select 
                name="strata" 
                value={formData.strata} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
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
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Tahun Masuk
              </Form.Label>
              <Form.Control 
                type="number" 
                name="tahun_masuk" 
                value={formData.tahun_masuk} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
                placeholder="2023"
              />
            </Form.Group>
          </>
        );
      case 'Mencari Pekerjaan':
        return (
          <>
            <Form.Group as={Col} md={6} controlId="formLastEducation" className="mb-3">
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Pendidikan Terakhir
              </Form.Label>
              <Form.Select 
                name="pendidikan_terakhir" 
                value={formData.pendidikan_terakhir} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
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
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Tahun Lulus
              </Form.Label>
              <Form.Control 
                type="number" 
                name="tahun_lulus" 
                value={formData.tahun_lulus} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
                placeholder="2023"
              />
            </Form.Group>
            
            {formData.pendidikan_terakhir && (
              <Col md={12}>
                <Card className="tw-border tw-border-slate-200 tw-shadow-sm tw-mt-3 tw-bg-slate-50">
                  <Card.Header className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-b tw-border-slate-200">
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <GraduationCap className="tw-w-5 tw-h-5 tw-text-blue-600" />
                      <h6 className="tw-font-semibold tw-text-slate-700 tw-mb-0 tw-text-sm">
                        Detail {formData.pendidikan_terakhir}
                      </h6>
                    </div>
                  </Card.Header>
                  <Card.Body className="tw-bg-white">
                    <Row>
                      {renderDetailPendidikanTerakhir()}
                    </Row>
                  </Card.Body>
                </Card>
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
              <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                Jenjang Prodi
              </Form.Label>
              <Form.Select 
                name="detail_strata_terakhir" 
                value={formData.detail_strata_terakhir} 
                onChange={handleInputChange}
                className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
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
      <MainLayout>
        <div className="tw-flex tw-items-center tw-justify-center tw-min-h-[400px]">
          <div className="tw-text-center">
            <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-blue-600 tw-mx-auto tw-mb-4"></div>
            <p className="tw-text-slate-600">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container fluid className="tw-px-4 tw-py-6">
        {/* Header */}
        <div className="tw-mb-6">
          <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
            <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-blue-600 tw-p-3 tw-rounded-xl tw-shadow-md">
              <User className="tw-w-6 tw-h-6 tw-text-white" />
            </div>
            <div>
              <h2 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-mb-1">Data Diri</h2>
              <p className="tw-text-slate-600 tw-text-sm">Lengkapi informasi pribadi kamu</p>
            </div>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Success Alert */}
          {showSuccess && (
            <Alert variant="success" className="tw-mb-4 tw-border-0 tw-bg-green-50 tw-border-l-4 tw-border-green-500">
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-green-700">
                <CheckCircle className="tw-w-5 tw-h-5" />
                <span className="tw-font-semibold">Data berhasil disimpan!</span>
              </div>
            </Alert>
          )}

          {/* Personal Info Card */}
          <Card className="tw-border tw-border-slate-200 tw-shadow-sm tw-mb-4 tw-bg-white">
            <Card.Header className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-blue-50 tw-border-b tw-border-slate-200">
              <div className="tw-flex tw-items-center tw-gap-2">
                <User className="tw-w-5 tw-h-5 tw-text-purple-600" />
                <h5 className="tw-font-semibold tw-text-slate-700 tw-mb-0 tw-text-sm">Informasi Pribadi</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="formUsername" className="mb-3">
                    <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                      Username
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="username" 
                      value={username || ''} 
                      readOnly 
                      className="tw-bg-slate-100 tw-border-slate-200 tw-rounded-lg tw-text-slate-600"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="formFullName" className="mb-3">
                    <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                      Nama Lengkap
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nama_lengkap" 
                      value={formData.nama_lengkap} 
                      onChange={handleInputChange} 
                      placeholder="Masukkan nama lengkap"
                      className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="formNickname" className="mb-3">
                    <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                      Nama Panggilan
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nama_panggilan" 
                      value={formData.nama_panggilan} 
                      onChange={handleInputChange} 
                      placeholder="Masukkan nama panggilan"
                      className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={4}>
                  <Form.Group controlId="formGender" className="mb-3">
                    <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                      Jenis Kelamin
                    </Form.Label>
                    <Form.Select 
                      name="jenis_kelamin" 
                      value={formData.jenis_kelamin} 
                      onChange={handleInputChange}
                      className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="formBirthDate" className="mb-3">
                    <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                      Tanggal Lahir
                    </Form.Label>
                    <Form.Control 
                      type="date" 
                      name="tanggal_lahir" 
                      value={formData.tanggal_lahir ? formData.tanggal_lahir.split('T')[0] : ''} 
                      onChange={handleInputChange}
                      className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="formWhatsApp" className="mb-3">
                    <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                      Nomor WhatsApp
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nomor_whatsapp" 
                      value={formData.nomor_whatsapp} 
                      onChange={handleInputChange} 
                      placeholder="Contoh: 08123456789"
                      className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group controlId="formParentWhatsApp" className="mb-3">
                    <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                      Nomor WhatsApp Orang Tua
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nomor_whatsapp_ortu" 
                      value={formData.nomor_whatsapp_ortu} 
                      onChange={handleInputChange} 
                      placeholder="Contoh: 08123456789"
                      className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Address Card */}
          <Card className="tw-border tw-border-slate-200 tw-shadow-sm tw-mb-4 tw-bg-white">
            <Card.Header className="tw-bg-gradient-to-r tw-from-green-50 tw-to-teal-50 tw-border-b tw-border-slate-200">
              <div className="tw-flex tw-items-center tw-gap-2">
                <MapPin className="tw-w-5 tw-h-5 tw-text-green-600" />
                <h5 className="tw-font-semibold tw-text-slate-700 tw-mb-0 tw-text-sm">Alamat Tempat Tinggal</h5>
              </div>
            </Card.Header>
            <Card.Body>
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
            </Card.Body>
          </Card>
          
          {/* Education Card */}
          <Card className="tw-border tw-border-slate-200 tw-shadow-sm tw-mb-4 tw-bg-white">
            <Card.Header className="tw-bg-gradient-to-r tw-from-orange-50 tw-to-amber-50 tw-border-b tw-border-slate-200">
              <div className="tw-flex tw-items-center tw-gap-2">
                <GraduationCap className="tw-w-5 tw-h-5 tw-text-orange-600" />
                <h5 className="tw-font-semibold tw-text-slate-700 tw-mb-0 tw-text-sm">Informasi Pendidikan</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="formEducation">
                    <Form.Label className="tw-font-medium tw-text-slate-700 tw-mb-2 tw-text-sm">
                      Pendidikan Sekarang
                    </Form.Label>
                    <Form.Select 
                      name="pendidikan_sekarang" 
                      value={formData.pendidikan_sekarang} 
                      onChange={handleInputChange}
                      className="tw-bg-slate-50 tw-border-slate-200 tw-rounded-lg tw-text-slate-700 focus:tw-border-blue-400 focus:tw-ring-2 focus:tw-ring-blue-100"
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
                <Card className="tw-border tw-border-slate-200 tw-bg-slate-50 tw-shadow-sm tw-mt-3">
                  <Card.Header className="tw-bg-slate-100 tw-border-b tw-border-slate-200">
                    <h6 className="tw-font-semibold tw-text-slate-700 tw-mb-0 tw-text-sm">
                      Detail {formData.pendidikan_sekarang}
                    </h6>
                  </Card.Header>
                  <Card.Body className="tw-bg-white">
                    <Row>
                      {renderAdditionalFields()}
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>

          {/* Submit Button */}
          <div className="tw-flex tw-justify-end tw-gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-700 hover:tw-from-blue-700 hover:tw-to-blue-800 tw-border-0 tw-px-6 tw-py-2.5 tw-rounded-lg tw-font-semibold tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-text-white"
            >
              <div className="tw-flex tw-items-center tw-gap-2">
                {isLoading ? (
                  <>
                    <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="tw-w-4 tw-h-4" />
                    <span>Simpan Data</span>
                  </>
                )}
              </div>
            </Button>
          </div>
        </Form>
      </Container>
    </MainLayout>
  );
};

export default Account;