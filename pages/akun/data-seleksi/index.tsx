'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../../components/layout/NavigationBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  jenis_seleksi: string;
  // SNBT Fields
  pilihan_pertama: string;
  pilihan_kedua: string;
  pilihan_ketiga: string;
  pilihan_keempat: string;
  // SNBP Fields
  snbp_jurusan1: string;
  snbp_kampus1: string;
  snbp_jurusan2: string;
  snbp_kampus2: string;
  snbp_jurusan3: string;
  snbp_kampus3: string;
  // Ujian Mandiri Fields
  um_kampus: string;
  um_jurusan: string;
  // CPNS Fields
  cpns_formasi: string;
  // BUMN Fields
  bumn_formasi: string;
}

type JenisSeleksi = 'SNBT' | 'SNBP' | 'Ujian Mandiri' | 'CPNS' | 'BUMN' | '';

const Seleksi: React.FC = () => {
  const router = useRouter();
  const { username } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [jenisSeleksi, setJenisSeleksi] = useState<JenisSeleksi>('');
  
  const [formData, setFormData] = useState<FormData>({
    jenis_seleksi: '',
    // SNBT Fields
    pilihan_pertama: '',
    pilihan_kedua: '',
    pilihan_ketiga: '',
    pilihan_keempat: '',
    // SNBP Fields
    snbp_jurusan1: '',
    snbp_kampus1: '',
    snbp_jurusan2: '',
    snbp_kampus2: '',
    snbp_jurusan3: '',
    snbp_kampus3: '',
    // Ujian Mandiri Fields
    um_kampus: '',
    um_jurusan: '',
    // CPNS Fields
    cpns_formasi: '',
    // BUMN Fields
    bumn_formasi: ''
  });

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
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user-seleksi/${user_id}`, { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
         });
        if (response.data) {
          setFormData(response.data);
          setJenisSeleksi(response.data.jenis_seleksi as JenisSeleksi);
        }
      } catch (error) {
        console.error('Error fetching seleksi data:', error);
      }
    };

    if (username) {
      fetchUserId().then(user_id => {
        if (user_id) {
          fetchData(user_id);
        }
      });
    }
  }, [username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'jenis_seleksi') {
      setJenisSeleksi(value as JenisSeleksi);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!jenisSeleksi) {
      alert('Silakan pilih jenis seleksi terlebih dahulu!');
      return;
    }
    
    // Validasi form berdasarkan jenis seleksi
    if (userId) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user-seleksi/save`, 
          { user_id: userId, ...formData }, { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
          });

        alert('Data seleksi berhasil disimpan!');
        router.push('/');

      } catch (error) {
        console.error('Error saving seleksi data:', error);
      }
    }
  };

  const renderSeleksiForm = (): JSX.Element => {
    switch (jenisSeleksi) {
      case 'SNBT':
        return (
          <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
            <p className="tw-text-sm tw-text-purple-600 tw-mb-4">Pilih jurusan yang akan Anda ambil pada SNBT (Seleksi Nasional Berbasis Tes)</p>
            <Row>
              <Form.Group as={Col} md={6} controlId="formPilihanPertama" className="mb-3">
                <Form.Label className="tw-font-medium">Pilihan Pertama</Form.Label>
                <Form.Select 
                  name="pilihan_pertama" 
                  value={formData.pilihan_pertama} 
                  onChange={handleInputChange}
                  className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                >
                  <option value="">Pilih Jurusan</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Kedokteran">Kedokteran</option>
                  <option value="Ekonomi">Ekonomi</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="formPilihanKedua" className="mb-3">
                <Form.Label className="tw-font-medium">Pilihan Kedua</Form.Label>
                <Form.Select 
                  name="pilihan_kedua" 
                  value={formData.pilihan_kedua} 
                  onChange={handleInputChange}
                  className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                >
                  <option value="">Pilih Jurusan</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Kedokteran">Kedokteran</option>
                  <option value="Ekonomi">Ekonomi</option>
                </Form.Select>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group as={Col} md={6} controlId="formPilihanKetiga" className="mb-3">
                <Form.Label className="tw-font-medium">Pilihan Ketiga</Form.Label>
                <Form.Select 
                  name="pilihan_ketiga" 
                  value={formData.pilihan_ketiga} 
                  onChange={handleInputChange}
                  className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                >
                  <option value="">Pilih Jurusan</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Kedokteran">Kedokteran</option>
                  <option value="Ekonomi">Ekonomi</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="formPilihanKeempat" className="mb-3">
                <Form.Label className="tw-font-medium">Pilihan Keempat</Form.Label>
                <Form.Select 
                  name="pilihan_keempat" 
                  value={formData.pilihan_keempat} 
                  onChange={handleInputChange}
                  className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                >
                  <option value="">Pilih Jurusan</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Kedokteran">Kedokteran</option>
                  <option value="Ekonomi">Ekonomi</option>
                </Form.Select>
              </Form.Group>
            </Row>
          </div>
        );
      case 'SNBP':
        return (
          <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
            <p className="tw-text-sm tw-text-purple-600 tw-mb-4">Pilih jurusan dan kampus untuk SNBP (Seleksi Nasional Berbasis Prestasi)</p>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formJurusan1">
                  <Form.Label className="tw-font-medium">Jurusan Pilihan 1</Form.Label>
                  <Form.Select 
                    name="snbp_jurusan1" 
                    value={formData.snbp_jurusan1} 
                    onChange={handleInputChange}
                    className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                  >
                    <option value="">Pilih Jurusan</option>
                    <option value="Ilmu Komputer">Ilmu Komputer</option>
                    <option value="Akuntansi">Akuntansi</option>
                    <option value="Manajemen">Manajemen</option>
                    <option value="Psikologi">Psikologi</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formKampus1">
                  <Form.Label className="tw-font-medium">Kampus Pilihan 1</Form.Label>
                  <Form.Select 
                    name="snbp_kampus1" 
                    value={formData.snbp_kampus1} 
                    onChange={handleInputChange}
                    className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                  >
                    <option value="">Pilih Kampus</option>
                    <option value="UI">Universitas Indonesia</option>
                    <option value="ITB">Institut Teknologi Bandung</option>
                    <option value="UGM">Universitas Gadjah Mada</option>
                    <option value="ITS">Institut Teknologi Sepuluh Nopember</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formJurusan2">
                  <Form.Label className="tw-font-medium">Jurusan Pilihan 2</Form.Label>
                  <Form.Select 
                    name="snbp_jurusan2" 
                    value={formData.snbp_jurusan2} 
                    onChange={handleInputChange}
                    className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                  >
                    <option value="">Pilih Jurusan</option>
                    <option value="Ilmu Komputer">Ilmu Komputer</option>
                    <option value="Akuntansi">Akuntansi</option>
                    <option value="Manajemen">Manajemen</option>
                    <option value="Psikologi">Psikologi</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formKampus2">
                  <Form.Label className="tw-font-medium">Kampus Pilihan 2</Form.Label>
                  <Form.Select 
                    name="snbp_kampus2" 
                    value={formData.snbp_kampus2} 
                    onChange={handleInputChange}
                    className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                  >
                    <option value="">Pilih Kampus</option>
                    <option value="UI">Universitas Indonesia</option>
                    <option value="ITB">Institut Teknologi Bandung</option>
                    <option value="UGM">Universitas Gadjah Mada</option>
                    <option value="ITS">Institut Teknologi Sepuluh Nopember</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formJurusan3">
                  <Form.Label className="tw-font-medium">Jurusan Pilihan 3</Form.Label>
                  <Form.Select 
                    name="snbp_jurusan3" 
                    value={formData.snbp_jurusan3} 
                    onChange={handleInputChange}
                    className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                  >
                    <option value="">Pilih Jurusan</option>
                    <option value="Ilmu Komputer">Ilmu Komputer</option>
                    <option value="Akuntansi">Akuntansi</option>
                    <option value="Manajemen">Manajemen</option>
                    <option value="Psikologi">Psikologi</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formKampus3">
                  <Form.Label className="tw-font-medium">Kampus Pilihan 3</Form.Label>
                  <Form.Select 
                    name="snbp_kampus3" 
                    value={formData.snbp_kampus3} 
                    onChange={handleInputChange}
                    className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                  >
                    <option value="">Pilih Kampus</option>
                    <option value="UI">Universitas Indonesia</option>
                    <option value="ITB">Institut Teknologi Bandung</option>
                    <option value="UGM">Universitas Gadjah Mada</option>
                    <option value="ITS">Institut Teknologi Sepuluh Nopember</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>
        );
      case 'Ujian Mandiri':
        return (
          <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
            <p className="tw-text-sm tw-text-purple-600 tw-mb-4">Pilih kampus dan jurusan untuk Ujian Mandiri</p>
            <Row>
              <Form.Group as={Col} md={6} controlId="formUMKampus" className="mb-3">
                <Form.Label className="tw-font-medium">Kampus</Form.Label>
                <Form.Select 
                  name="um_kampus" 
                  value={formData.um_kampus} 
                  onChange={handleInputChange}
                  className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                >
                  <option value="">Pilih Kampus</option>
                  <option value="UI">Universitas Indonesia</option>
                  <option value="ITB">Institut Teknologi Bandung</option>
                  <option value="UGM">Universitas Gadjah Mada</option>
                  <option value="ITS">Institut Teknologi Sepuluh Nopember</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="formUMJurusan" className="mb-3">
                <Form.Label className="tw-font-medium">Jurusan</Form.Label>
                <Form.Select 
                  name="um_jurusan" 
                  value={formData.um_jurusan} 
                  onChange={handleInputChange}
                  className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                >
                  <option value="">Pilih Jurusan</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Kedokteran">Kedokteran</option>
                  <option value="Ekonomi">Ekonomi</option>
                </Form.Select>
              </Form.Group>
            </Row>
          </div>
        );
      case 'CPNS':
        return (
          <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
            <p className="tw-text-sm tw-text-purple-600 tw-mb-4">Pilih formasi CPNS yang akan Anda daftar</p>
            <Row>
              <Form.Group as={Col} md={12} controlId="formCPNSFormasi" className="mb-3">
                <Form.Label className="tw-font-medium">Formasi CPNS</Form.Label>
                <Form.Select 
                  name="cpns_formasi" 
                  value={formData.cpns_formasi} 
                  onChange={handleInputChange}
                  className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                >
                  <option value="">Pilih Formasi</option>
                  <option value="Dosen">Dosen</option>
                  <option value="Guru">Guru</option>
                  <option value="Dokter">Dokter</option>
                  <option value="Perawat">Perawat</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Pranata Komputer">Pranata Komputer</option>
                </Form.Select>
              </Form.Group>
            </Row>
          </div>
        );
      case 'BUMN':
        return (
          <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
            <p className="tw-text-sm tw-text-purple-600 tw-mb-4">Pilih formasi BUMN yang akan Anda daftar</p>
            <Row>
              <Form.Group as={Col} md={12} controlId="formBUMNFormasi" className="mb-3">
                <Form.Label className="tw-font-medium">Formasi BUMN</Form.Label>
                <Form.Select 
                  name="bumn_formasi" 
                  value={formData.bumn_formasi} 
                  onChange={handleInputChange}
                  className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                >
                  <option value="">Pilih Formasi</option>
                  <option value="IT Specialist">IT Specialist</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </Form.Select>
              </Form.Group>
            </Row>
          </div>
        );
      default:
        return (
          <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-200 tw-text-center tw-text-gray-500">
            Silakan pilih jenis seleksi terlebih dahulu
          </div>
        );
    }
  };

  return (
    <>
      <Navbar />
      <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-white tw-min-h-screen tw-py-8">
        <Container className="tw-bg-white tw-shadow-lg tw-rounded-xl tw-p-6 tw-max-w-5xl">
          <div className="tw-text-center tw-mb-6">
            <h2 className="tw-text-3xl tw-font-bold tw-text-purple-800 tw-mb-2">Informasi Pendaftaran Seleksi</h2>
            <div className="tw-h-1 tw-w-24 tw-bg-purple-600 tw-mx-auto tw-rounded-full"></div>
          </div>
          
          <Nav variant="tabs" className="tw-flex tw-flex-wrap md:tw-flex-nowrap tw-border-b tw-border-indigo-200 tw-mb-6">
            <Nav.Item className="tw-mr-1 md:tw-mr-3 tw-mb-1 md:tw-mb-0 tw-flex-1 md:tw-flex-none">
              <Nav.Link 
                as={Link} 
                href="/akun/data-diri" 
                className="tw-text-indigo-800 tw-bg-gradient-to-br tw-from-blue-600/30 tw-to-indigo-700/30 hover:tw-from-indigo-700 hover:tw-to-purple-600 tw-font-medium tw-py-2 md:tw-py-2.5 tw-px-3 md:tw-px-5 tw-rounded-t-lg tw-border-0 tw-shadow-md tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105 tw-text-sm md:tw-text-base tw-w-full tw-text-center"
              >
                <span className="tw-flex tw-items-center tw-justify-center">
                  Data Diri
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="tw-mr-1 md:tw-mr-3 tw-mb-1 md:tw-mb-0 tw-flex-1 md:tw-flex-none">
              <Nav.Link 
                as={Link} 
                href="/akun/data-seleksi" 
                active
                className="tw-text-indigo-900 tw-font-semibold tw-py-2 md:tw-py-2.5 tw-px-3 md:tw-px-5 tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-border-0 tw-rounded-t-lg tw-shadow-md tw-transition-all tw-w-full tw-text-center tw-text-sm md:tw-text-base"
              >
                <span className="tw-text-white tw-relative tw-z-10">Pendaftaran Seleksi</span>
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
                <i className="bi bi-clipboard-check tw-mr-2"></i>
                Jenis Seleksi
              </h4>
              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group controlId="formJenisSeleksi">
                    <Form.Label className="tw-font-medium">Pilih Jenis Seleksi</Form.Label>
                    <Form.Select 
                      name="jenis_seleksi" 
                      value={formData.jenis_seleksi} 
                      onChange={handleInputChange}
                      className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm"
                    >
                      <option value="">Pilih Jenis Seleksi</option>
                      <option value="SNBT">SNBT (Seleksi Nasional Berbasis Tes)</option>
                      <option value="SNBP">SNBP (Seleksi Nasional Berbasis Prestasi)</option>
                      <option value="Ujian Mandiri">Ujian Mandiri</option>
                      <option value="CPNS">CPNS</option>
                      <option value="BUMN">BUMN</option>
                    </Form.Select>
                    <small className="tw-text-purple-600 tw-block tw-mt-1">Pilih jenis seleksi yang akan Anda ikuti</small>
                  </Form.Group>
                </Col>
              </Row>
              
              {renderSeleksiForm()}
            </div>

            <div className="tw-text-center tw-mt-6">
              <Button
                type="submit"
                className="tw-bg-purple-600 tw-border-purple-700 tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium tw-shadow-md hover:tw-bg-purple-700 tw-transition-all"
                style={{ minWidth: '200px' }}
              >
                <i className="bi bi-check-circle tw-mr-2"></i>
                Simpan Data Seleksi
              </Button>
            </div>
          </Form>
        </Container>
      </div>
    </>
  );
};

export default Seleksi;