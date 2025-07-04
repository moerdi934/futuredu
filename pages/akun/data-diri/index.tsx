'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../../components/layout/NavigationBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  username?: string;
  nama_lengkap: string;
  nama_panggilan: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  nomor_whatsapp: string;
  nomor_whatsapp_ortu: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  pendidikan_sekarang: string;
  sekolah: string;
  kelas: string;
  jurusan: string;
  tahun_lulus_sma_smk: string;
  strata: string;
  universitas: string;
  program_studi: string;
  tahun_masuk: string;
  pendidikan_terakhir: string;
  tahun_lulus: string;
  [key: string]: string | undefined;
}

type PendidikanSekarang = 'SD' | 'SMP' | 'SMA/SMK' | 'Gap Year' | 'Kuliah' | 'Mencari Pekerjaan';

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
    kota: '',
    kecamatan: '',
    kelurahan: '',
    pendidikan_sekarang: '',
    sekolah: '',
    kelas: '',
    jurusan: '',
    tahun_lulus_sma_smk: '',
    strata: '',
    universitas: '',
    program_studi: '',
    tahun_masuk: '',
    pendidikan_terakhir: '',
    tahun_lulus: ''
  });

  // Field wajib berdasarkan pendidikan_sekarang
  const mandatoryFields: MandatoryFields = {
    SD: ['sekolah', 'kelas'],
    SMP: ['sekolah', 'kelas'],
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
          setFormData(prevFormData => ({
            ...prevFormData,
            ...response.data,
            username: username
          }));
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
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
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const pendidikanSekarang = formData.pendidikan_sekarang as PendidikanSekarang;
    const fieldsToValidate = mandatoryFields[pendidikanSekarang] || [];

    for (const field of fieldsToValidate) {
      if (!formData[field]) {
        alert(`Field ${field} tidak boleh kosong!`);
        return;
      }
    }
    
    if (userId) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user-accounts/save-account`, 
          { user_id: userId, ...formData }, { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
          });

        alert('Data berhasil disimpan!');
        router.push('/');

      } catch (error) {
        console.error('Error saving account:', error);
      }
    }
  };

  const renderAdditionalFields = (): JSX.Element | null => {
    switch (formData.pendidikan_sekarang) {
      case 'SD':
        return (
          <>
            <Form.Group as={Col} md={6} controlId="formSchool" className="mb-3">
              <Form.Label className="tw-font-medium">Sekolah</Form.Label>
              <Form.Select 
                name="sekolah" 
                value={formData.sekolah} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
              >
                <option value="">Pilih Sekolah</option>
                <option value="SD1">SD 1</option>
                <option value="SD2">SD 2</option>
                <option value="SD3">SD 3</option>
                <option value="SD4">SD 4</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="formClass" className="mb-3">
              <Form.Label className="tw-font-medium">Kelas</Form.Label>
              <Form.Select 
                name="kelas" 
                value={formData.kelas} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
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
            <Form.Group as={Col} md={6} controlId="formSchool" className="mb-3">
              <Form.Label className="tw-font-medium">Sekolah</Form.Label>
              <Form.Select 
                name="sekolah" 
                value={formData.sekolah} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
              >
                <option value="">Pilih Sekolah</option>
                <option value="SMP1">SMP 1</option>
                <option value="SMP2">SMP 2</option>
                <option value="SMP3">SMP 3</option>
                <option value="SMP4">SMP 4</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="formClass" className="mb-3">
              <Form.Label className="tw-font-medium">Kelas</Form.Label>
              <Form.Select 
                name="kelas" 
                value={formData.kelas} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
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
            <Form.Group as={Col} md={4} controlId="formSchool" className="mb-3">
              <Form.Label className="tw-font-medium">Sekolah</Form.Label>
              <Form.Select 
                name="sekolah" 
                value={formData.sekolah} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
              >
                <option value="">Pilih Sekolah</option>
                <option value="SMA1">SMA 1</option>
                <option value="SMA2">SMA 2</option>
                <option value="SMA3">SMA 3</option>
                <option value="SMA4">SMA 4</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={4} controlId="formClass" className="mb-3">
              <Form.Label className="tw-font-medium">Kelas</Form.Label>
              <Form.Select 
                name="kelas" 
                value={formData.kelas} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
              >
                <option value="">Pilih Kelas</option>
                <option value="Kelas 10">Kelas 10</option>
                <option value="Kelas 11">Kelas 11</option>
                <option value="Kelas 12">Kelas 12</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={4} controlId="formMajor" className="mb-3">
              <Form.Label className="tw-font-medium">Jurusan</Form.Label>
              <Form.Select 
                name="jurusan" 
                value={formData.jurusan} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
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
            <Form.Group as={Col} md={4} controlId="formSchool" className="mb-3">
              <Form.Label className="tw-font-medium">Sekolah SMA/SMK</Form.Label>
              <Form.Select 
                name="sekolah" 
                value={formData.sekolah} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
              >
                <option value="">Pilih Sekolah</option>
                <option value="SMA1">SMA 1</option>
                <option value="SMA2">SMA 2</option>
                <option value="SMA3">SMA 3</option>
                <option value="SMA4">SMA 4</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={4} controlId="formMajor" className="mb-3">
              <Form.Label className="tw-font-medium">Jurusan SMA/SMK</Form.Label>
              <Form.Select 
                name="jurusan" 
                value={formData.jurusan} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
              >
                <option value="">Pilih Jurusan</option>
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="Bahasa">Bahasa</option>
                <option value="Keagamaan">Keagamaan</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={4} controlId="formGraduationYear" className="mb-3">
              <Form.Label className="tw-font-medium">Tahun Lulus SMA/SMK</Form.Label>
              <Form.Control 
                type="number" 
                name="tahun_lulus_sma_smk" 
                value={formData.tahun_lulus_sma_smk} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
              />
            </Form.Group>
          </>
        );
      case 'Kuliah':
        return (
          <>
            <Form.Group as={Col} md={3} controlId="formStrata" className="mb-3">
              <Form.Label className="tw-font-medium">Strata</Form.Label>
              <Form.Select 
                name="strata" 
                value={formData.strata} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
              >
                <option value="">Pilih Strata</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
                <option value="Post Doctoral">Post Doctoral</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={3} controlId="formUniversity" className="mb-3">
              <Form.Label className="tw-font-medium">Universitas</Form.Label>
              <Form.Select 
                name="universitas" 
                value={formData.universitas} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
              >
                <option value="">Pilih Universitas</option>
                <option value="Univ1">Universitas 1</option>
                <option value="Univ2">Universitas 2</option>
                <option value="Univ3">Universitas 3</option>
                <option value="Univ4">Universitas 4</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={3} controlId="formStudyProgram" className="mb-3">
              <Form.Label className="tw-font-medium">Program Studi</Form.Label>
              <Form.Select 
                name="program_studi" 
                value={formData.program_studi} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
              >
                <option value="">Pilih Program Studi</option>
                <option value="Prodi1">Program Studi 1</option>
                <option value="Prodi2">Program Studi 2</option>
                <option value="Prodi3">Program Studi 3</option>
                <option value="Prodi4">Program Studi 4</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={3} controlId="formEntryYear" className="mb-3">
              <Form.Label className="tw-font-medium">Tahun Masuk</Form.Label>
              <Form.Control 
                type="number" 
                name="tahun_masuk" 
                value={formData.tahun_masuk} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
              />
            </Form.Group>
          </>
        );
      case 'Mencari Pekerjaan':
        return (
          <>
            <Form.Group as={Col} md={6} controlId="formLastEducation" className="mb-3">
              <Form.Label className="tw-font-medium">Pendidikan Terakhir</Form.Label>
              <Form.Select 
                name="pendidikan_terakhir" 
                value={formData.pendidikan_terakhir} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
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
              <Form.Label className="tw-font-medium">Tahun Lulus</Form.Label>
              <Form.Control 
                type="number" 
                name="tahun_lulus" 
                value={formData.tahun_lulus} 
                onChange={handleInputChange}
                className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
              />
            </Form.Group>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-white tw-min-h-screen tw-py-8">
        <Container className="tw-bg-white tw-shadow-lg tw-rounded-xl tw-p-6 tw-max-w-5xl">
          <div className="tw-text-center tw-mb-8">
            <h2 className="tw-text-3xl tw-font-bold tw-text-purple-800 tw-mb-2">Informasi Data Diri</h2>
            <div className="tw-h-1 tw-w-24 tw-bg-purple-600 tw-mx-auto tw-rounded-full"></div>
          </div>
          
          <Nav variant="tabs" className="tw-flex tw-flex-wrap md:tw-flex-nowrap tw-border-b tw-border-indigo-200 tw-mb-6">
            <Nav.Item className="tw-mr-1 md:tw-mr-3 tw-mb-1 md:tw-mb-0 tw-flex-1 md:tw-flex-none">
              <Nav.Link 
                as={Link} 
                href="/akun/data-diri" 
                active
                className="tw-text-indigo-900 tw-font-semibold tw-py-2 md:tw-py-2.5 tw-px-3 md:tw-px-5 tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-border-0 tw-rounded-t-lg tw-shadow-md tw-transition-all tw-w-full tw-text-center tw-text-sm md:tw-text-base"
              >
                <span className="tw-text-white tw-relative tw-z-10">Data Diri</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="tw-mr-1 md:tw-mr-3 tw-mb-1 md:tw-mb-0 tw-flex-1 md:tw-flex-none">
              <Nav.Link 
                as={Link} 
                href="/akun/data-seleksi" 
                className="tw-text-indigo-800 tw-bg-gradient-to-br tw-from-blue-600/30 tw-to-indigo-700/30 hover:tw-from-indigo-700 hover:tw-to-purple-600 tw-font-medium tw-py-2 md:tw-py-2.5 tw-px-3 md:tw-px-5 tw-rounded-t-lg tw-border-0 tw-shadow-md tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105 tw-text-sm md:tw-text-base tw-w-full tw-text-center"
              >
                <span className="tw-flex tw-items-center tw-justify-center">
                  Pendaftaran Seleksi
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="tw-mr-1 md:tw-mr-3 tw-mb-1 md:tw-mb-0 tw-flex-1 md:tw-flex-none">
              <Nav.Link 
                as={Link} 
                href="/akun/data-password" 
                className="tw-text-indigo-800 tw-bg-gradient-to-br tw-from-blue-600/30 tw-to-indigo-700/30 hover:tw-from-indigo-700 hover:tw-to-purple-600 tw-font-medium tw-py-2 md:tw-py-2.5 tw-px-3 md:tw-px-5 tw-rounded-t-lg tw-border-0 tw-shadow-md tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105 tw-text-sm md:tw-text-base tw-w-full tw-text-center"
              >
                <span className="tw-flex tw-items-center tw-justify-center">
                  Ganti Password
                </span>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Form onSubmit={handleSubmit} className="tw-text-gray-700">
            <div className="tw-bg-purple-100 tw-rounded-lg tw-p-4 tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-3">
                <i className="bi bi-person-circle tw-mr-2"></i>
                Data Pribadi
              </h4>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="formUsername" className="mb-3">
                    <Form.Label className="tw-font-medium">Username</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="username" 
                      value={username || ''} 
                      readOnly 
                      className="tw-bg-gray-100 tw-border-purple-300 tw-rounded-lg" 
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="formFullName" className="mb-3">
                    <Form.Label className="tw-font-medium">Nama Lengkap</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nama_lengkap" 
                      value={formData.nama_lengkap} 
                      onChange={handleInputChange} 
                      placeholder="Masukkan nama lengkap"
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="formNickname" className="mb-3">
                    <Form.Label className="tw-font-medium">Nama Panggilan</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nama_panggilan" 
                      value={formData.nama_panggilan} 
                      onChange={handleInputChange} 
                      placeholder="Masukkan nama panggilan"
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="formGender" className="mb-3">
                    <Form.Label className="tw-font-medium">Jenis Kelamin</Form.Label>
                    <Form.Select 
                      name="jenis_kelamin" 
                      value={formData.jenis_kelamin} 
                      onChange={handleInputChange}
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="formBirthDate" className="mb-3">
                    <Form.Label className="tw-font-medium">Tanggal Lahir</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="tanggal_lahir" 
                      value={formData.tanggal_lahir} 
                      onChange={handleInputChange}
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="formWhatsApp" className="mb-3">
                    <Form.Label className="tw-font-medium">Nomor WhatsApp</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nomor_whatsapp" 
                      value={formData.nomor_whatsapp} 
                      onChange={handleInputChange} 
                      placeholder="Contoh: 08123456789"
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="formParentWhatsApp" className="mb-3">
                    <Form.Label className="tw-font-medium">Nomor WhatsApp Orang Tua</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nomor_whatsapp_ortu" 
                      value={formData.nomor_whatsapp_ortu} 
                      onChange={handleInputChange} 
                      placeholder="Contoh: 08123456789"
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="tw-bg-purple-100 tw-rounded-lg tw-p-4 tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-3">
                <i className="bi bi-geo-alt tw-mr-2"></i>
                Alamat
              </h4>
              <Row>
                <Col md={3}>
                  <Form.Group controlId="formProvince" className="mb-3">
                    <Form.Label className="tw-font-medium">Provinsi</Form.Label>
                    <Form.Select 
                      name="provinsi" 
                      value={formData.provinsi} 
                      onChange={handleInputChange}
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                    >
                      <option value="">Pilih Provinsi</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Jawa Timur">Jawa Timur</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="formCity" className="mb-3">
                    <Form.Label className="tw-font-medium">Kota</Form.Label>
                    <Form.Select 
                      name="kota" 
                      value={formData.kota} 
                      onChange={handleInputChange}
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                    >
                      <option value="">Pilih Kota</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Surabaya">Surabaya</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
<Col md={3}>
                  <Form.Group controlId="formDistrict" className="mb-3">
                    <Form.Label className="tw-font-medium">Kecamatan</Form.Label>
                    <Form.Select 
                      name="kecamatan" 
                      value={formData.kecamatan} 
                      onChange={handleInputChange}
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                    >
                      <option value="">Pilih Kecamatan</option>
                      <option value="Kecamatan 1">Kecamatan 1</option>
                      <option value="Kecamatan 2">Kecamatan 2</option>
                      <option value="Kecamatan 3">Kecamatan 3</option>
                      <option value="Kecamatan 4">Kecamatan 4</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="formSubDistrict" className="mb-3">
                    <Form.Label className="tw-font-medium">Kelurahan</Form.Label>
                    <Form.Select 
                      name="kelurahan" 
                      value={formData.kelurahan} 
                      onChange={handleInputChange}
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                    >
                      <option value="">Pilih Kelurahan</option>
                      <option value="Kelurahan 1">Kelurahan 1</option>
                      <option value="Kelurahan 2">Kelurahan 2</option>
                      <option value="Kelurahan 3">Kelurahan 3</option>
                      <option value="Kelurahan 4">Kelurahan 4</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
            
            <div className="tw-bg-purple-100 tw-rounded-lg tw-p-4 tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-3">
                <i className="bi bi-book tw-mr-2"></i>
                Pendidikan
              </h4>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="formEducation">
                    <Form.Label className="tw-font-medium">Pendidikan Sekarang</Form.Label>
                    <Form.Select 
                      name="pendidikan_sekarang" 
                      value={formData.pendidikan_sekarang} 
                      onChange={handleInputChange}
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                    >
                      <option value="">Pilih Pendidikan</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="Gap Year">Gap Year</option>
                      <option value="Kuliah">Kuliah</option>
                      <option value="Mencari Pekerjaan">Mencari Pekerjaan</option>
                    </Form.Select>
                    <small className="tw-text-purple-600 tw-block tw-mt-1">Pilih pendidikan yang sedang Anda jalani saat ini</small>
                  </Form.Group>
                </Col>
              </Row>
              
              {formData.pendidikan_sekarang && (
                <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
                  <Row>
                    {renderAdditionalFields()}
                  </Row>
                </div>
              )}
            </div>

            <div className="tw-text-center tw-mt-6">
              <Button
                type="submit"
                className="tw-bg-purple-600 tw-border-purple-700 tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium tw-shadow-md hover:tw-bg-purple-700 tw-transition-all"
                style={{ minWidth: '200px' }}
              >
                <i className="bi bi-check-circle tw-mr-2"></i>
                Simpan Data
              </Button>
            </div>
          </Form>
        </Container>
      </div>
    </>
  );
};

export default Account;