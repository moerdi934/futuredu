import React, { useState } from 'react';
import { Modal, Button, Container, Row, Col, Form, Card, Table, Badge } from 'react-bootstrap';
import { X, Star, Heart, Sparkles, BookOpen, Users, BarChart, Settings, Home, Trophy, Gift, Music, Camera, Palette, Phone, Mail, Plus, Edit, Trash, Eye, Download, Upload, Filter, Search, Calendar, Clock, TrendingUp, Target, Award, Bell, MessageCircle, FileText, Folder, Globe,User  } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Types
interface BaseModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  width?: string;
  height?: string;
  primaryButton?: {
    text: string;
    variant?: string;
    onClick: () => void;
  };
  secondaryButton?: {
    text: string;
    variant?: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  headerColor?: string;
  scrollable?: boolean;
}

// Content Types
type ContentType = 'dashboard' | 'form' | 'analytics' | 'information' | 'settings' | 'table' | 'profile' | 'notifications';

// Sample Data
const analyticsData = [
  { name: 'Jan', students: 120, revenue: 2400, classes: 8 },
  { name: 'Feb', students: 150, revenue: 3200, classes: 12 },
  { name: 'Mar', students: 180, revenue: 4100, classes: 15 },
  { name: 'Apr', students: 220, revenue: 5200, classes: 18 },
  { name: 'May', students: 280, revenue: 6800, classes: 22 },
  { name: 'Jun', students: 320, revenue: 8200, classes: 25 },
];

const pieData = [
  { name: 'SD', value: 45, color: '#8B5CF6' },
  { name: 'SMP', value: 30, color: '#3B82F6' },
  { name: 'SMA', value: 25, color: '#06B6D4' },
];

const studentsData = [
  { id: 1, name: 'Ahmad Rizki', class: '5 SD', status: 'Aktif', score: 85 },
  { id: 2, name: 'Sari Indah', class: '3 SMP', status: 'Aktif', score: 92 },
  { id: 3, name: 'Budi Santoso', class: '2 SMA', status: 'Nonaktif', score: 78 },
  { id: 4, name: 'Maya Putri', class: '4 SD', status: 'Aktif', score: 88 },
];

// Content Components
const DashboardContent: React.FC = () => (
  <div>
    <Row className="tw-mb-6">
      <Col md={3} sm={6} className="tw-mb-3">
        <Card className="tw-h-full tw-border-0 tw-shadow-sm tw-bg-gradient-to-br tw-from-purple-100 tw-to-blue-100">
          <Card.Body className="tw-text-center">
            <Users className="tw-w-8 tw-h-8 tw-text-purple-600 tw-mx-auto tw-mb-2" />
            <h4 className="tw-text-2xl tw-font-bold tw-text-purple-700">1,234</h4>
            <p className="tw-text-purple-600 tw-mb-0">Total Siswa</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} sm={6} className="tw-mb-3">
        <Card className="tw-h-full tw-border-0 tw-shadow-sm tw-bg-gradient-to-br tw-from-blue-100 tw-to-indigo-100">
          <Card.Body className="tw-text-center">
            <BookOpen className="tw-w-8 tw-h-8 tw-text-blue-600 tw-mx-auto tw-mb-2" />
            <h4 className="tw-text-2xl tw-font-bold tw-text-blue-700">45</h4>
            <p className="tw-text-blue-600 tw-mb-0">Kelas Aktif</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} sm={6} className="tw-mb-3">
        <Card className="tw-h-full tw-border-0 tw-shadow-sm tw-bg-gradient-to-br tw-from-indigo-100 tw-to-purple-100">
          <Card.Body className="tw-text-center">
            <TrendingUp className="tw-w-8 tw-h-8 tw-text-indigo-600 tw-mx-auto tw-mb-2" />
            <h4 className="tw-text-2xl tw-font-bold tw-text-indigo-700">92%</h4>
            <p className="tw-text-indigo-600 tw-mb-0">Tingkat Kelulusan</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} sm={6} className="tw-mb-3">
        <Card className="tw-h-full tw-border-0 tw-shadow-sm tw-bg-gradient-to-br tw-from-purple-100 tw-to-pink-100">
          <Card.Body className="tw-text-center">
            <Target className="tw-w-8 tw-h-8 tw-text-purple-600 tw-mx-auto tw-mb-2" />
            <h4 className="tw-text-2xl tw-font-bold tw-text-purple-700">Rp 125M</h4>
            <p className="tw-text-purple-600 tw-mb-0">Pendapatan</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Card className="tw-border-0 tw-shadow-sm">
      <Card.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-text-white">
        <h5 className="tw-mb-0">Aktivitas Terbaru</h5>
      </Card.Header>
      <Card.Body>
        <div className="tw-space-y-3">
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full"></div>
            <span className="tw-text-sm">Ahmad Rizki menyelesaikan quiz Matematika</span>
            <Badge bg="success" className="tw-ml-auto">Baru</Badge>
          </div>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-w-2 tw-h-2 tw-bg-blue-500 tw-rounded-full"></div>
            <span className="tw-text-sm">Kelas Fisika SMA dimulai dalam 30 menit</span>
            <Badge bg="warning" className="tw-ml-auto">Pending</Badge>
          </div>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-w-2 tw-h-2 tw-bg-indigo-500 tw-rounded-full"></div>
            <span className="tw-text-sm">5 siswa baru mendaftar hari ini</span>
            <Badge bg="info" className="tw-ml-auto">Info</Badge>
          </div>
        </div>
      </Card.Body>
    </Card>
  </div>
);

const FormContent: React.FC = () => (
  <Form>
    <Row>
      <Col md={6}>
        <Form.Group className="tw-mb-4">
          <Form.Label className="tw-font-medium tw-text-purple-700">Nama Lengkap</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Masukkan nama lengkap" 
            className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg"
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group className="tw-mb-4">
          <Form.Label className="tw-font-medium tw-text-purple-700">Email</Form.Label>
          <Form.Control 
            type="email" 
            placeholder="nama@email.com" 
            className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg"
          />
        </Form.Group>
      </Col>
    </Row>
    <Row>
      <Col md={6}>
        <Form.Group className="tw-mb-4">
          <Form.Label className="tw-font-medium tw-text-purple-700">Nomor Telepon</Form.Label>
          <Form.Control 
            type="tel" 
            placeholder="08xxxxxxxxxx" 
            className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg"
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group className="tw-mb-4">
          <Form.Label className="tw-font-medium tw-text-purple-700">Jenjang</Form.Label>
          <Form.Select className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg">
            <option>Pilih jenjang</option>
            <option>SD (Sekolah Dasar)</option>
            <option>SMP (Sekolah Menengah Pertama)</option>
            <option>SMA (Sekolah Menengah Atas)</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
    <Form.Group className="tw-mb-4">
      <Form.Label className="tw-font-medium tw-text-purple-700">Mata Pelajaran Diminati</Form.Label>
      <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-3 tw-mt-2">
        {['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'Fisika'].map((subject, index) => (
          <Form.Check
            key={index}
            type="checkbox"
            label={subject}
            className="tw-text-purple-700"
          />
        ))}
      </div>
    </Form.Group>
    <Form.Group className="tw-mb-4">
      <Form.Label className="tw-font-medium tw-text-purple-700">Catatan Tambahan</Form.Label>
      <Form.Control 
        as="textarea" 
        rows={3}
        placeholder="Ceritakan tujuan belajar atau kebutuhan khusus..."
        className="tw-border-2 tw-border-purple-200 focus:tw-border-purple-500 tw-rounded-lg"
      />
    </Form.Group>
  </Form>
);

const AnalyticsContent: React.FC = () => (
  <div>
    <Row className="tw-mb-6">
      <Col lg={8}>
        <Card className="tw-border-0 tw-shadow-sm tw-h-full">
          <Card.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-text-white">
            <h5 className="tw-mb-0">Perkembangan Siswa & Pendapatan</h5>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="students" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="classes" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Card className="tw-border-0 tw-shadow-sm tw-h-full">
          <Card.Header className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-text-white">
            <h5 className="tw-mb-0">Distribusi Jenjang</h5>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Card className="tw-border-0 tw-shadow-sm">
      <Card.Header className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-500 tw-text-white">
        <h5 className="tw-mb-0">Performa Bulanan</h5>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={250}>
          <RechartsBarChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8B5CF6" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  </div>
);

const InformationContent: React.FC = () => (
  <div className="tw-space-y-6">
    <Card className="tw-border-0 tw-shadow-sm tw-bg-gradient-to-br tw-from-purple-50 tw-to-blue-50">
      <Card.Body>
        <div className="tw-flex tw-items-center tw-gap-4">
          <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-p-3 tw-rounded-full">
            <Bell className="tw-w-6 tw-h-6 tw-text-white" />
          </div>
          <div>
            <h4 className="tw-font-bold tw-text-purple-800 tw-mb-1">Pengumuman Penting</h4>
            <p className="tw-text-purple-600 tw-mb-0">Informasi terbaru tentang program bimbingan belajar</p>
          </div>
        </div>
      </Card.Body>
    </Card>

    <div className="tw-grid tw-gap-4">
      <Card className="tw-border-l-4 tw-border-purple-500 tw-shadow-sm">
        <Card.Body>
          <div className="tw-flex tw-items-start tw-gap-3">
            <Calendar className="tw-w-5 tw-h-5 tw-text-purple-500 tw-mt-1" />
            <div>
              <h6 className="tw-font-semibold tw-text-purple-800">Jadwal Try Out UTBK 2024</h6>
              <p className="tw-text-gray-600 tw-mb-2">Try Out UTBK akan diadakan pada 15 Maret 2024 pukul 08.00-12.00 WIB</p>
              <Badge bg="primary">Pendaftaran Dibuka</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="tw-border-l-4 tw-border-blue-500 tw-shadow-sm">
        <Card.Body>
          <div className="tw-flex tw-items-start tw-gap-3">
            <Award className="tw-w-5 tw-h-5 tw-text-blue-500 tw-mt-1" />
            <div>
              <h6 className="tw-font-semibold tw-text-blue-800">Program Beasiswa Prestasi</h6>
              <p className="tw-text-gray-600 tw-mb-2">Bimbel ABC membuka program beasiswa untuk siswa berprestasi dengan potongan biaya hingga 50%</p>
              <Badge bg="success">Tersedia</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="tw-border-l-4 tw-border-indigo-500 tw-shadow-sm">
        <Card.Body>
          <div className="tw-flex tw-items-start tw-gap-3">
            <MessageCircle className="tw-w-5 tw-h-5 tw-text-indigo-500 tw-mt-1" />
            <div>
              <h6 className="tw-font-semibold tw-text-indigo-800">Konsultasi Gratis dengan Tutor</h6>
              <p className="tw-text-gray-600 tw-mb-2">Dapatkan konsultasi gratis untuk memilih program yang tepat sesuai kebutuhan belajar</p>
              <Badge bg="info">Hubungi Kami</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>

    <Card className="tw-border-0 tw-shadow-sm">
      <Card.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-text-white">
        <h5 className="tw-mb-0">Kontak & Informasi</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
              <Phone className="tw-w-5 tw-h-5 tw-text-purple-500" />
              <div>
                <p className="tw-mb-0 tw-font-medium">Telepon</p>
                <p className="tw-mb-0 tw-text-gray-600">(021) 1234-5678</p>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
              <Mail className="tw-w-5 tw-h-5 tw-text-blue-500" />
              <div>
                <p className="tw-mb-0 tw-font-medium">Email</p>
                <p className="tw-mb-0 tw-text-gray-600">info@bimbel-abc.com</p>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  </div>
);

const TableContent: React.FC = () => (
  <div>
    <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
      <h5 className="tw-font-bold tw-text-purple-800">Data Siswa</h5>
      <div className="tw-flex tw-gap-2">
        <Button variant="outline-primary" size="sm">
          <Filter className="tw-w-4 tw-h-4 tw-me-1" />
          Filter
        </Button>
        <Button variant="primary" size="sm" className="tw-bg-purple-600 tw-border-purple-600">
          <Plus className="tw-w-4 tw-h-4 tw-me-1" />
          Tambah
        </Button>
      </div>
    </div>
    
    <Card className="tw-border-0 tw-shadow-sm">
      <Card.Body className="tw-p-0">
        <Table responsive hover className="tw-mb-0">
          <thead className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-text-white">
            <tr>
              <th className="tw-border-0">No</th>
              <th className="tw-border-0">Nama Siswa</th>
              <th className="tw-border-0">Kelas</th>
              <th className="tw-border-0">Status</th>
              <th className="tw-border-0">Nilai Rata-rata</th>
              <th className="tw-border-0">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {studentsData.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td className="tw-font-medium">{student.name}</td>
                <td>{student.class}</td>
                <td>
                  <Badge bg={student.status === 'Aktif' ? 'success' : 'secondary'}>
                    {student.status}
                  </Badge>
                </td>
                <td>
                  <span className={`tw-font-semibold ${student.score >= 85 ? 'tw-text-green-600' : student.score >= 70 ? 'tw-text-yellow-600' : 'tw-text-red-600'}`}>
                    {student.score}
                  </span>
                </td>
                <td>
                  <div className="tw-flex tw-gap-1">
                    <Button variant="outline-primary" size="sm" className="tw-p-1">
                      <Eye className="tw-w-3 tw-h-3" />
                    </Button>
                    <Button variant="outline-warning" size="sm" className="tw-p-1">
                      <Edit className="tw-w-3 tw-h-3" />
                    </Button>
                    <Button variant="outline-danger" size="sm" className="tw-p-1">
                      <Trash className="tw-w-3 tw-h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  </div>
);

const SettingsContent: React.FC = () => (
  <div className="tw-space-y-6">
    <Card className="tw-border-0 tw-shadow-sm">
      <Card.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-text-white">
        <h5 className="tw-mb-0">Pengaturan Umum</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="tw-mb-3">
                <Form.Label className="tw-font-medium">Nama Institusi</Form.Label>
                <Form.Control type="text" defaultValue="Bimbel ABC" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="tw-mb-3">
                <Form.Label className="tw-font-medium">Bahasa Default</Form.Label>
                <Form.Select>
                  <option>Bahasa Indonesia</option>
                  <option>English</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="tw-mb-3">
            <Form.Label className="tw-font-medium">Zona Waktu</Form.Label>
            <Form.Select>
              <option>WIB (UTC+7)</option>
              <option>WITA (UTC+8)</option>
              <option>WIT (UTC+9)</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>

    <Card className="tw-border-0 tw-shadow-sm">
      <Card.Header className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-500 tw-text-white">
        <h5 className="tw-mb-0">Notifikasi</h5>
      </Card.Header>
      <Card.Body>
        <div className="tw-space-y-3">
          <Form.Check
            type="switch"
            label="Email notifications for new students"
            defaultChecked
          />
          <Form.Check
            type="switch"
            label="SMS notifications for class reminders"
            defaultChecked
          />
          <Form.Check
            type="switch"
            label="Push notifications for assignments"
          />
          <Form.Check
            type="switch"
            label="Weekly reports via email"
            defaultChecked
          />
        </div>
      </Card.Body>
    </Card>

    <Card className="tw-border-0 tw-shadow-sm">
      <Card.Header className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-text-white">
        <h5 className="tw-mb-0">Keamanan</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="tw-mb-3">
            <Form.Label className="tw-font-medium">Password Lama</Form.Label>
            <Form.Control type="password" placeholder="Masukkan password lama" />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="tw-mb-3">
                <Form.Label className="tw-font-medium">Password Baru</Form.Label>
                <Form.Control type="password" placeholder="Masukkan password baru" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="tw-mb-3">
                <Form.Label className="tw-font-medium">Konfirmasi Password</Form.Label>
                <Form.Control type="password" placeholder="Konfirmasi password baru" />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  </div>
);

const ProfileContent: React.FC = () => (
  <div className="tw-space-y-6">
    <Card className="tw-border-0 tw-shadow-sm tw-bg-gradient-to-br tw-from-purple-50 tw-to-blue-50">
      <Card.Body className="tw-text-center">
        <div className="tw-w-24 tw-h-24 tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-rounded-full tw-mx-auto tw-mb-4 tw-flex tw-items-center tw-justify-center">
          <span className="tw-text-2xl tw-font-bold tw-text-white">AB</span>
        </div>
        <h4 className="tw-font-bold tw-text-purple-800">Ahmad Budi Santoso</h4>
        <p className="tw-text-purple-600">Administrator</p>
        <Badge bg="success">Online</Badge>
      </Card.Body>
    </Card>

    <Row>
      <Col md={6}>
        <Card className="tw-border-0 tw-shadow-sm tw-h-full">
          <Card.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-text-white">
            <h5 className="tw-mb-0">Informasi Pribadi</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="tw-mb-3">
                <Form.Label className="tw-font-medium">Nama Lengkap</Form.Label>
                <Form.Control type="text" defaultValue="Ahmad Budi Santoso" />
              </Form.Group>
              <Form.Group className="tw-mb-3">
                <Form.Label className="tw-font-medium">Email</Form.Label>
                <Form.Control type="email" defaultValue="ahmad@bimbel-abc.com" />
              </Form.Group>
              <Form.Group className="tw-mb-3">
                <Form.Label className="tw-font-medium">Nomor Telepon</Form.Label>
                <Form.Control type="tel" defaultValue="081234567890" />
              </Form.Group>
              <Form.Group className="tw-mb-3">
                <Form.Label className="tw-font-medium">Posisi</Form.Label>
                <Form.Control type="text" defaultValue="Administrator" />
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="tw-border-0 tw-shadow-sm tw-h-full">
          <Card.Header className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-500 tw-text-white">
            <h5 className="tw-mb-0">Statistik</h5>
          </Card.Header>
          <Card.Body>
            <div className="tw-space-y-4">
              <div className="tw-flex tw-justify-between tw-items-center">
                <span className="tw-font-medium">Siswa Dikelola</span>
                <Badge bg="primary" className="tw-text-lg">1,234</Badge>
              </div>
              <div className="tw-flex tw-justify-between tw-items-center">
                <span className="tw-font-medium">Kelas Aktif</span>
                <Badge bg="success" className="tw-text-lg">45</Badge>
              </div>
              <div className="tw-flex tw-justify-between tw-items-center">
                <span className="tw-font-medium">Total Login</span>
                <Badge bg="info" className="tw-text-lg">892</Badge>
              </div>
              <div className="tw-flex tw-justify-between tw-items-center">
                <span className="tw-font-medium">Rating</span>
                <div className="tw-flex tw-items-center tw-gap-1">
                  <Star className="tw-w-4 tw-h-4 tw-text-yellow-500" fill="currentColor" />
                  <Badge bg="warning" className="tw-text-lg">4.8</Badge>
                </div>
              </div>
              <div className="tw-flex tw-justify-between tw-items-center">
                <span className="tw-font-medium">Bergabung Sejak</span>
                <Badge bg="secondary" className="tw-text-lg">2022</Badge>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </div>
);

const NotificationsContent: React.FC = () => (
  <div className="tw-space-y-4">
    <div className="tw-flex tw-justify-between tw-items-center">
      <h5 className="tw-font-bold tw-text-purple-800">Notifikasi Terbaru</h5>
      <Button variant="outline-primary" size="sm">
        Tandai Semua Dibaca
      </Button>
    </div>

    <div className="tw-space-y-3">
      <Card className="tw-border-l-4 tw-border-purple-500 tw-shadow-sm tw-bg-purple-50">
        <Card.Body className="tw-py-3">
          <div className="tw-flex tw-items-start tw-gap-3">
            <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full tw-mt-2"></div>
            <div className="tw-flex-1">
              <p className="tw-mb-1 tw-font-medium">Siswa baru mendaftar</p>
              <p className="tw-text-sm tw-text-gray-600 tw-mb-1">Maya Putri telah mendaftar untuk program Matematika SD</p>
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-gray-500">
                <Clock className="tw-w-3 tw-h-3" />
                <span>5 menit yang lalu</span>
              </div>
            </div>
            <Badge bg="primary">Baru</Badge>
          </div>
        </Card.Body>
      </Card>

      <Card className="tw-border-l-4 tw-border-blue-500 tw-shadow-sm tw-bg-blue-50">
        <Card.Body className="tw-py-3">
          <div className="tw-flex tw-items-start tw-gap-3">
            <div className="tw-w-2 tw-h-2 tw-bg-blue-500 tw-rounded-full tw-mt-2"></div>
            <div className="tw-flex-1">
              <p className="tw-mb-1 tw-font-medium">Pembayaran diterima</p>
              <p className="tw-text-sm tw-text-gray-600 tw-mb-1">Pembayaran Ahmad Rizki untuk bulan Maret telah dikonfirmasi</p>
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-gray-500">
                <Clock className="tw-w-3 tw-h-3" />
                <span>1 jam yang lalu</span>
              </div>
            </div>
            <Badge bg="success">Selesai</Badge>
          </div>
        </Card.Body>
      </Card>

      <Card className="tw-border-l-4 tw-border-yellow-500 tw-shadow-sm tw-bg-yellow-50">
        <Card.Body className="tw-py-3">
          <div className="tw-flex tw-items-start tw-gap-3">
            <div className="tw-w-2 tw-h-2 tw-bg-yellow-500 tw-rounded-full tw-mt-2"></div>
            <div className="tw-flex-1">
              <p className="tw-mb-1 tw-font-medium">Jadwal kelas berubah</p>
              <p className="tw-text-sm tw-text-gray-600 tw-mb-1">Kelas Fisika SMA dipindah dari pukul 14.00 ke 16.00</p>
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-gray-500">
                <Clock className="tw-w-3 tw-h-3" />
                <span>3 jam yang lalu</span>
              </div>
            </div>
            <Badge bg="warning">Penting</Badge>
          </div>
        </Card.Body>
      </Card>

      <Card className="tw-border-l-4 tw-border-green-500 tw-shadow-sm tw-bg-green-50">
        <Card.Body className="tw-py-3">
          <div className="tw-flex tw-items-start tw-gap-3">
            <div className="tw-w-2 tw-h-2 tw-bg-green-500 tw-rounded-full tw-mt-2"></div>
            <div className="tw-flex-1">
              <p className="tw-mb-1 tw-font-medium">Target tercapai</p>
              <p className="tw-text-sm tw-text-gray-600 tw-mb-1">Target pendaftaran bulan Maret telah tercapai 120%</p>
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-gray-500">
                <Clock className="tw-w-3 tw-h-3" />
                <span>1 hari yang lalu</span>
              </div>
            </div>
            <Badge bg="success">Berhasil</Badge>
          </div>
        </Card.Body>
      </Card>

      <Card className="tw-border-l-4 tw-border-indigo-500 tw-shadow-sm tw-bg-indigo-50">
        <Card.Body className="tw-py-3">
          <div className="tw-flex tw-items-start tw-gap-3">
            <div className="tw-w-2 tw-h-2 tw-bg-indigo-500 tw-rounded-full tw-mt-2"></div>
            <div className="tw-flex-1">
              <p className="tw-mb-1 tw-font-medium">Update sistem</p>
              <p className="tw-text-sm tw-text-gray-600 tw-mb-1">Sistem telah diupdate dengan fitur-fitur terbaru</p>
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-gray-500">
                <Clock className="tw-w-3 tw-h-3" />
                <span>2 hari yang lalu</span>
              </div>
            </div>
            <Badge bg="info">Update</Badge>
          </div>
        </Card.Body>
      </Card>
    </div>
  </div>
);

// Content Mapping Function
const getContent = (type: ContentType) => {
  switch (type) {
    case 'dashboard':
      return <DashboardContent />;
    case 'form':
      return <FormContent />;
    case 'analytics':
      return <AnalyticsContent />;
    case 'information':
      return <InformationContent />;
    case 'table':
      return <TableContent />;
    case 'settings':
      return <SettingsContent />;
    case 'profile':
      return <ProfileContent />;
    case 'notifications':
      return <NotificationsContent />;
    default:
      return <div>Content not found</div>;
  }
};

// Modal Components
// Modal 1 - Kids Playful (Sparkly)
const Modal1: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Magic Modal", children, size = "lg", width, height, 
  primaryButton, secondaryButton, icon = <Sparkles className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-purple-400 tw-to-blue-400", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-lg tw-overflow-hidden">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0 tw-relative`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-white/20 tw-p-2 tw-rounded-full tw-animate-pulse">
              {icon}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-bg-white/20 hover:tw-bg-white/30 tw-p-1 tw-rounded-full tw-transition-colors">
            <X className="tw-w-5 tw-h-5" />
          </button>
          <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-pointer-events-none">
            <div className="tw-absolute tw-top-2 tw-left-4 tw-w-2 tw-h-2 tw-bg-white/40 tw-rounded-full tw-animate-ping"></div>
            <div className="tw-absolute tw-top-4 tw-right-8 tw-w-1 tw-h-1 tw-bg-white/60 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-blue-50 tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-white tw-border-t-2 tw-border-purple-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} className="tw-me-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-border-0 hover:tw-from-purple-600 hover:tw-to-blue-600">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 2 - Kids Friendly (Star Theme)
const Modal2: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Star Modal", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <Star className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-indigo-400 tw-to-purple-400", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-2xl tw-overflow-hidden tw-border-4 tw-border-purple-300">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-white tw-p-2 tw-rounded-full tw-shadow-lg">
              {React.cloneElement(icon as React.ReactElement, { className: "tw-w-5 tw-h-5 tw-text-purple-500" })}
            </div>
            <Modal.Title className="tw-font-black tw-text-xl tw-drop-shadow-lg">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-bg-red-500 hover:tw-bg-red-600 tw-p-2 tw-rounded-full tw-transition-colors tw-shadow-lg">
            <X className="tw-w-4 tw-h-4 tw-text-white" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-indigo-50 tw-to-purple-50 tw-p-6 tw-relative">
          <div className="tw-absolute tw-top-2 tw-right-4">
            <Star className="tw-w-8 tw-h-8 tw-text-purple-300 tw-animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-gradient-to-r tw-from-indigo-100 tw-to-purple-100 tw-border-0">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-primary"} onClick={secondaryButton.onClick} className="tw-me-2 tw-font-bold">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-border-0 tw-font-bold tw-shadow-lg">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 3 - Kids Cute (Heart Theme)
const Modal3: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Lovely Modal", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <Heart className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-purple-400 tw-to-indigo-400", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-3xl tw-overflow-hidden tw-shadow-2xl">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0 tw-relative`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-animate-bounce">
              {icon}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-bg-white/20 hover:tw-bg-white/30 tw-p-1 tw-rounded-full">
            <X className="tw-w-5 tw-h-5" />
          </button>
          <div className="tw-absolute tw-inset-0 tw-pointer-events-none">
            <Heart className="tw-absolute tw-top-2 tw-left-10 tw-w-3 tw-h-3 tw-text-white/30 tw-animate-pulse" />
            <Heart className="tw-absolute tw-bottom-2 tw-right-10 tw-w-2 tw-h-2 tw-text-white/40 tw-animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-50 tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-white tw-border-t-2 tw-border-purple-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} className="tw-me-2 tw-rounded-full">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-border-0 tw-rounded-full hover:tw-from-purple-600 hover:tw-to-indigo-600">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 4 - Kids Fun (Book Theme)
const Modal4: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Learning Modal", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <BookOpen className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-blue-400 tw-to-indigo-400", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-xl tw-overflow-hidden tw-border-2 tw-border-blue-300">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-white tw-p-2 tw-rounded-lg tw-shadow-md">
              {React.cloneElement(icon as React.ReactElement, { className: "tw-w-5 tw-h-5 tw-text-blue-600" })}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-bg-white/20 hover:tw-bg-white/30 tw-p-2 tw-rounded-lg">
            <X className="tw-w-4 tw-h-4" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-indigo-50 tw-p-6 tw-relative">
          <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-2 tw-bg-gradient-to-r tw-from-blue-300 tw-to-indigo-300"></div>
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-gradient-to-r tw-from-blue-100 tw-to-indigo-100">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-primary"} onClick={secondaryButton.onClick} className="tw-me-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick}
                    className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-500 tw-border-0">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 5 - Kids Trophy (Achievement Theme)
const Modal5: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Achievement Modal", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <Trophy className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-2xl tw-overflow-hidden tw-shadow-2xl tw-border-4 tw-border-purple-400">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0 tw-relative`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-white tw-p-3 tw-rounded-full tw-animate-pulse">
              {React.cloneElement(icon as React.ReactElement, { className: "tw-w-6 tw-h-6 tw-text-purple-600" })}
            </div>
            <Modal.Title className="tw-font-black tw-text-2xl tw-drop-shadow">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-bg-red-500 hover:tw-bg-red-600 tw-p-2 tw-rounded-full tw-transition-all">
            <X className="tw-w-5 tw-h-5 tw-text-white" />
          </button>
          <div className="tw-absolute tw-inset-0 tw-pointer-events-none">
            <Sparkles className="tw-absolute tw-top-3 tw-right-20 tw-w-4 tw-h-4 tw-text-white/50 tw-animate-ping" />
            <Sparkles className="tw-absolute tw-bottom-3 tw-left-20 tw-w-3 tw-h-3 tw-text-white/40 tw-animate-ping" style={{ animationDelay: '1s' }} />
          </div>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-indigo-50 tw-to-purple-50 tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-gradient-to-r tw-from-indigo-200 tw-to-purple-200 tw-border-0">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-primary"} onClick={secondaryButton.onClick} className="tw-me-2 tw-font-bold tw-border-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-border-0 tw-font-bold tw-shadow-lg tw-border-2 tw-border-purple-600">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 6 - Kids Gift (Surprise Theme)
const Modal6: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Surprise Modal", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <Gift className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-3xl tw-overflow-hidden tw-border-4 tw-border-purple-400">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0 tw-relative tw-overflow-hidden`}>
          <div className="tw-flex tw-items-center tw-gap-3 tw-relative tw-z-10">
            <div className="tw-bg-white tw-p-2 tw-rounded-full tw-shadow-lg tw-animate-bounce">
              {React.cloneElement(icon as React.ReactElement, { className: "tw-w-5 tw-h-5 tw-text-purple-600" })}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-bg-white/20 hover:tw-bg-white/30 tw-p-2 tw-rounded-full tw-relative tw-z-10">
            <X className="tw-w-4 tw-h-4" />
          </button>
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-purple-400/20 tw-to-blue-400/20 tw-animate-pulse"></div>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-blue-50 tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-white tw-border-t-4 tw-border-purple-300">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} className="tw-me-2 tw-rounded-full">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-border-0 tw-rounded-full hover:tw-from-purple-600 hover:tw-to-blue-600">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 7 - Kids Music (Creative Theme)
const Modal7: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Music Modal", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <Music className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-blue-400 tw-to-purple-400", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-2xl tw-overflow-hidden tw-shadow-2xl">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0 tw-relative`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-white tw-p-2 tw-rounded-full tw-shadow-md">
              {React.cloneElement(icon as React.ReactElement, { className: "tw-w-5 tw-h-5 tw-text-blue-600 tw-animate-pulse" })}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-bg-white/20 hover:tw-bg-white/30 tw-p-2 tw-rounded-full">
            <X className="tw-w-4 tw-h-4" />
          </button>
          <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-1 tw-bg-gradient-to-r tw-from-blue-300 tw-to-purple-300 tw-animate-pulse"></div>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-purple-50 tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-gradient-to-r tw-from-blue-100 tw-to-purple-100">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-info"} onClick={secondaryButton.onClick} className="tw-me-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "info"} onClick={primaryButton.onClick}
                    className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-purple-500 tw-border-0">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 8 - Kids Art (Palette Theme)
const Modal8: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Art Modal", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <Palette className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-indigo-400 tw-via-purple-400 tw-to-blue-400", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-3xl tw-overflow-hidden tw-border-2 tw-border-purple-300">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0 tw-relative`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-white tw-p-2 tw-rounded-full tw-shadow-lg">
              {React.cloneElement(icon as React.ReactElement, { className: "tw-w-5 tw-h-5 tw-text-indigo-500" })}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl tw-drop-shadow">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-bg-white/20 hover:tw-bg-white/30 tw-p-2 tw-rounded-full">
            <X className="tw-w-4 tw-h-4" />
          </button>
          <div className="tw-absolute tw-inset-0 tw-pointer-events-none">
            <div className="tw-absolute tw-top-2 tw-left-8 tw-w-2 tw-h-2 tw-bg-white/40 tw-rounded-full"></div>
            <div className="tw-absolute tw-bottom-2 tw-right-12 tw-w-3 tw-h-3 tw-bg-white/30 tw-rounded-full"></div>
          </div>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-indigo-50 tw-via-purple-50 tw-to-blue-50 tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-white tw-border-t-2 tw-border-purple-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} className="tw-me-2 tw-rounded-full">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-border-0 tw-rounded-full hover:tw-from-indigo-600 hover:tw-to-purple-600">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Professional Modals (9-16)
// Modal 9 - Professional Analytics
const Modal9: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Analytics Dashboard", children, size = "xl", width, height,
  primaryButton, secondaryButton, icon = <BarChart className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-slate-700 tw-to-slate-800", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-lg tw-overflow-hidden tw-shadow-xl">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-purple-600 tw-p-2 tw-rounded-md">
              {icon}
            </div>
            <Modal.Title className="tw-font-semibold tw-text-lg">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-text-gray-300 hover:tw-text-white tw-p-1">
            <X className="tw-w-5 tw-h-5" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-gray-50 tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-white tw-border-t tw-border-gray-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} className="tw-me-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-purple-600">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 10 - Professional Settings
const Modal10: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Settings", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <Settings className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-white tw-border-b tw-border-gray-200", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-lg tw-overflow-hidden tw-shadow-lg tw-border">
        <Modal.Header className={`${headerColor} tw-text-gray-800`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-purple-100 tw-text-purple-600 tw-p-2 tw-rounded-md">
              {icon}
            </div>
            <Modal.Title className="tw-font-semibold tw-text-lg">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-text-gray-500 hover:tw-text-gray-700 tw-p-1">
            <X className="tw-w-5 tw-h-5" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-white tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} className="tw-me-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-purple-600">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 11 - Professional CRM Users
const Modal11: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "User Management", children, size = "xl", width, height,
  primaryButton, secondaryButton, icon = <Users className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-lg tw-overflow-hidden tw-shadow-xl tw-border">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-white/20 tw-p-2 tw-rounded-md">
              {icon}
            </div>
            <Modal.Title className="tw-font-semibold tw-text-lg">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-text-white/80 hover:tw-text-white tw-p-1">
            <X className="tw-w-5 tw-h-5" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-white tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} className="tw-me-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-border-indigo-600">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 12 - Professional Form Modal
const Modal12: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Form Modal", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <Home className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-white tw-border-b-2 tw-border-purple-500", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-xl tw-overflow-hidden tw-shadow-lg tw-border-2 tw-border-purple-200">
        <Modal.Header className={`${headerColor} tw-text-gray-800`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-purple-600 tw-text-white tw-p-2 tw-rounded-lg">
              {icon}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl tw-text-purple-800">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-text-gray-500 hover:tw-text-gray-700 tw-p-2 tw-rounded-lg hover:tw-bg-gray-100">
            <X className="tw-w-5 tw-h-5" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-white tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-white tw-border-t-2 tw-border-purple-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} className="tw-me-2 tw-border-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-purple-600 tw-shadow-lg">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 13 - Professional Contact Modal
const Modal13: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Contact Information", children, size = "lg", width, height,
  primaryButton, secondaryButton, icon = <Phone className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-lg tw-overflow-hidden tw-shadow-2xl">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0 tw-relative`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-white/20 tw-p-2 tw-rounded-md tw-backdrop-blur">
              {icon}
            </div>
            <Modal.Title className="tw-font-semibold tw-text-lg">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-text-white/80 hover:tw-text-white tw-p-2 tw-rounded-md hover:tw-bg-white/10">
            <X className="tw-w-5 tw-h-5" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-white tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-t tw-border-blue-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-primary"} onClick={secondaryButton.onClick} className="tw-me-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-border-blue-600">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 14 - Professional Email Modal
const Modal14: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Email Management", children, size = "xl", width, height,
  primaryButton, secondaryButton, icon = <Mail className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-white tw-shadow-sm", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-2xl tw-overflow-hidden tw-shadow-xl tw-border">
        <Modal.Header className={`${headerColor} tw-text-gray-800 tw-border-b tw-border-gray-200`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-text-white tw-p-2 tw-rounded-lg tw-shadow-md">
              {icon}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl tw-bg-gradient-to-r tw-from-purple-600 tw-to-blue-600 tw-bg-clip-text tw-text-transparent">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-text-gray-400 hover:tw-text-gray-600 tw-p-2 tw-rounded-lg hover:tw-bg-gray-100 tw-transition-colors">
            <X className="tw-w-5 tw-h-5" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-gray-50 tw-to-white tw-p-6">
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-white tw-border-t tw-border-gray-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} className="tw-me-2 tw-rounded-lg">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-blue-600 tw-border-0 tw-rounded-lg hover:tw-from-purple-700 hover:tw-to-blue-700 tw-shadow-lg">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 15 - Professional Data Modal
const Modal15: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Data Management", children, size = "xl", width, height,
  primaryButton, secondaryButton, icon = <BarChart className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-gradient-to-r tw-from-gray-800 tw-to-gray-900", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-lg tw-overflow-hidden tw-shadow-2xl tw-border tw-border-gray-300">
        <Modal.Header className={`${headerColor} tw-text-white tw-border-0`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-bg-purple-600 tw-p-2 tw-rounded-md tw-shadow-lg">
              {icon}
            </div>
            <Modal.Title className="tw-font-bold tw-text-lg">{title}</Modal.Title>
          </div>
          <button onClick={onHide} className="tw-text-gray-300 hover:tw-text-white tw-p-2 tw-rounded-md hover:tw-bg-gray-700">
            <X className="tw-w-5 tw-h-5" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-white tw-p-6">
          <div className="tw-border-l-4 tw-border-purple-500 tw-pl-4 tw-mb-4">
            <div className="tw-h-1 tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-rounded tw-mb-4"></div>
          </div>
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-dark"} onClick={secondaryButton.onClick} className="tw-me-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "dark"} onClick={primaryButton.onClick} 
                    className="tw-bg-gray-800 hover:tw-bg-gray-900 tw-border-gray-800">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Modal 16 - Professional Reports Modal
const Modal16: React.FC<BaseModalProps> = ({ 
  show, onHide, title = "Reports & Analytics", children, size = "xl", width, height,
  primaryButton, secondaryButton, icon = <FileText className="tw-w-5 tw-h-5" />, 
  headerColor = "tw-bg-white tw-border-b tw-border-purple-200", scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-2xl tw-overflow-hidden tw-shadow-2xl tw-border-2 tw-border-purple-300">
        <Modal.Header className={`${headerColor} tw-text-gray-800`}>
          <div className="tw-flex tw-items-center tw-gap-4">
            <div className="tw-bg-gradient-to-br tw-from-purple-600 tw-to-blue-600 tw-text-white tw-p-3 tw-rounded-xl tw-shadow-lg">
              {icon}
            </div>
            <div>
              <Modal.Title className="tw-font-bold tw-text-2xl tw-text-purple-800">{title}</Modal.Title>
              <p className="tw-text-sm tw-text-gray-600 tw-mt-1">Professional dashboard and insights</p>
            </div>
          </div>
          <button onClick={onHide} className="tw-text-gray-500 hover:tw-text-gray-700 tw-p-2 tw-rounded-xl hover:tw-bg-purple-100 tw-transition-all">
            <X className="tw-w-6 tw-h-6" />
          </button>
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-blue-50 tw-p-8">
          <div className="tw-border-l-4 tw-border-purple-500 tw-pl-6 tw-mb-6">
            <div className="tw-flex tw-gap-2 tw-mb-4">
              <div className="tw-w-3 tw-h-3 tw-bg-purple-500 tw-rounded-full tw-animate-pulse"></div>
              <div className="tw-w-3 tw-h-3 tw-bg-blue-500 tw-rounded-full tw-animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="tw-w-3 tw-h-3 tw-bg-purple-400 tw-rounded-full tw-animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          {children}
        </Modal.Body>
        <Modal.Footer className="tw-bg-white tw-border-t-2 tw-border-purple-200">
          {secondaryButton && (
            <Button variant={secondaryButton.variant || "outline-secondary"} onClick={secondaryButton.onClick} 
                    className="tw-me-3 tw-border-2 tw-rounded-lg tw-px-6 tw-py-2">
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button variant={primaryButton.variant || "primary"} onClick={primaryButton.onClick} 
                    className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-blue-600 tw-border-0 tw-rounded-lg tw-px-6 tw-py-2 tw-shadow-lg hover:tw-from-purple-700 hover:tw-to-blue-700 tw-transition-all">
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Demo Page Component
const DemoPage: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentType>('dashboard');
  const [selectedModalType, setSelectedModalType] = useState<string>('');

  const handleClose = () => setActiveModal(null);
  const handleShow = (modalName: string) => {
    setSelectedModalType(modalName);
    setActiveModal(modalName);
  };

  const contentOptions: { value: ContentType; label: string; icon: React.ReactNode }[] = [
    { value: 'dashboard', label: 'Dashboard', icon: <BarChart className="tw-w-4 tw-h-4" /> },
    { value: 'form', label: 'Form', icon: <Edit className="tw-w-4 tw-h-4" /> },
    { value: 'analytics', label: 'Analytics', icon: <TrendingUp className="tw-w-4 tw-h-4" /> },
    { value: 'information', label: 'Information', icon: <Bell className="tw-w-4 tw-h-4" /> },
    { value: 'table', label: 'Data Table', icon: <Users className="tw-w-4 tw-h-4" /> },
    { value: 'settings', label: 'Settings', icon: <Settings className="tw-w-4 tw-h-4" /> },
    { value: 'profile', label: 'Profile', icon: <User className="tw-w-4 tw-h-4" /> },
    { value: 'notifications', label: 'Notifications', icon: <Bell className="tw-w-4 tw-h-4" /> },
  ];

  const kidsModals = [
    { name: 'Modal1', title: 'Magic Modal', icon: <Sparkles className="tw-w-4 tw-h-4" />, color: 'purple' },
    { name: 'Modal2', title: 'Star Modal', icon: <Star className="tw-w-4 tw-h-4" />, color: 'indigo' },
    { name: 'Modal3', title: 'Lovely Modal', icon: <Heart className="tw-w-4 tw-h-4" />, color: 'purple' },
    { name: 'Modal4', title: 'Learning Modal', icon: <BookOpen className="tw-w-4 tw-h-4" />, color: 'blue' },
    { name: 'Modal5', title: 'Achievement Modal', icon: <Trophy className="tw-w-4 tw-h-4" />, color: 'indigo' },
    { name: 'Modal6', title: 'Surprise Modal', icon: <Gift className="tw-w-4 tw-h-4" />, color: 'purple' },
    { name: 'Modal7', title: 'Music Modal', icon: <Music className="tw-w-4 tw-h-4" />, color: 'blue' },
    { name: 'Modal8', title: 'Art Modal', icon: <Palette className="tw-w-4 tw-h-4" />, color: 'indigo' }
  ];

  const professionalModals = [
    { name: 'Modal9', title: 'Analytics Dashboard', icon: <BarChart className="tw-w-4 tw-h-4" />, color: 'slate' },
    { name: 'Modal10', title: 'Settings Panel', icon: <Settings className="tw-w-4 tw-h-4" />, color: 'purple' },
    { name: 'Modal11', title: 'User Management', icon: <Users className="tw-w-4 tw-h-4" />, color: 'indigo' },
    { name: 'Modal12', title: 'Form Manager', icon: <Home className="tw-w-4 tw-h-4" />, color: 'purple' },
    { name: 'Modal13', title: 'Contact Center', icon: <Phone className="tw-w-4 tw-h-4" />, color: 'blue' },
    { name: 'Modal14', title: 'Email Hub', icon: <Mail className="tw-w-4 tw-h-4" />, color: 'purple' },
    { name: 'Modal15', title: 'Data Center', icon: <BarChart className="tw-w-4 tw-h-4" />, color: 'gray' },
    { name: 'Modal16', title: 'Reports Suite', icon: <FileText className="tw-w-4 tw-h-4" />, color: 'purple' }
  ];

  const renderModal = (modalName: string) => {
    const content = getContent(selectedContent);
    const commonProps = {
      show: activeModal === modalName,
      onHide: handleClose,
      children: content,
      primaryButton: { 
        text: selectedContent === 'form' ? 'Submit' : selectedContent === 'analytics' ? 'Export' : 'OK', 
        onClick: handleClose 
      },
      secondaryButton: { 
        text: 'Cancel', 
        onClick: handleClose 
      }
    };

    switch (modalName) {
      case 'Modal1': return <Modal1 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Magic Style`} />;
      case 'Modal2': return <Modal2 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Star Style`} />;
      case 'Modal3': return <Modal3 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Lovely Style`} />;
      case 'Modal4': return <Modal4 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Learning Style`} />;
      case 'Modal5': return <Modal5 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Achievement Style`} />;
      case 'Modal6': return <Modal6 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Surprise Style`} />;
      case 'Modal7': return <Modal7 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Music Style`} />;
      case 'Modal8': return <Modal8 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Art Style`} />;
      case 'Modal9': return <Modal9 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Professional Analytics`} />;
      case 'Modal10': return <Modal10 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Clean Settings`} />;
      case 'Modal11': return <Modal11 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - User Management`} />;
      case 'Modal12': return <Modal12 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Form Manager`} />;
      case 'Modal13': return <Modal13 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Contact Center`} />;
      case 'Modal14': return <Modal14 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Email Hub`} />;
      case 'Modal15': return <Modal15 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Data Center`} />;
      case 'Modal16': return <Modal16 {...commonProps} title={`${contentOptions.find(c => c.value === selectedContent)?.label} - Reports Suite`} />;
      default: return null;
    }
  };

  return (
    <Container fluid className="tw-py-8 tw-bg-gradient-to-br tw-from-purple-50 tw-to-blue-50 tw-min-h-screen">
      <Row>
        <Col>
          <div className="tw-text-center tw-mb-8">
            <h1 className="tw-text-4xl tw-font-bold tw-mb-4 tw-bg-gradient-to-r tw-from-purple-600 tw-to-blue-600 tw-bg-clip-text tw-text-transparent">
              16 Modal Templates - Bimbel App
            </h1>
            <p className="tw-text-lg tw-text-gray-600 tw-mb-6">Pilih konten dan template modal yang ingin Anda lihat</p>
            
            {/* Content Selector */}
            <Card className="tw-mb-8 tw-border-0 tw-shadow-lg">
              <Card.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-text-white">
                <h3 className="tw-text-xl tw-font-bold tw-mb-0 tw-text-center">
                  <Globe className="tw-w-5 tw-h-5 tw-inline tw-me-2" />
                  Pilih Konten Modal
                </h3>
              </Card.Header>
              <Card.Body>
                <Row className="tw-g-3">
                  {contentOptions.map((option, index) => (
                    <Col key={index} md={3} sm={6} className="tw-mb-3">
                      <Button
                        variant={selectedContent === option.value ? "primary" : "outline-primary"}
                        onClick={() => setSelectedContent(option.value)}
                        className={`tw-w-full tw-h-16 tw-border-2 tw-transition-all tw-rounded-lg ${
                          selectedContent === option.value 
                            ? 'tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-border-purple-500' 
                            : 'tw-border-purple-300 hover:tw-bg-purple-50'
                        }`}
                      >
                        <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
                          {option.icon}
                          <span className="tw-text-sm tw-font-medium">{option.label}</span>
                        </div>
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </div>
          
          {/* Kids Modals Section */}
          <div className="tw-mb-8">
            <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
              <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-p-3 tw-rounded-full">
                <Sparkles className="tw-w-6 tw-h-6 tw-text-white" />
              </div>
              <div>
                <h2 className="tw-text-3xl tw-font-bold tw-text-purple-800 tw-mb-1">Kids Modals</h2>
                <p className="tw-text-purple-600">8 Template modal dengan desain menarik untuk anak-anak</p>
              </div>
            </div>
            <Row className="tw-g-4">
              {kidsModals.map((modal, index) => (
                <Col key={index} md={3} sm={6} className="tw-mb-4">
                  <Card className={`tw-h-full tw-border-0 tw-shadow-lg tw-transition-all hover:tw-shadow-xl hover:tw-transform hover:tw-scale-105 tw-border-l-4 tw-border-${modal.color}-500`}>
                    <Card.Body className="tw-text-center tw-p-4">
                      <div className={`tw-bg-gradient-to-r tw-from-${modal.color}-100 tw-to-${modal.color}-200 tw-p-3 tw-rounded-full tw-w-16 tw-h-16 tw-mx-auto tw-mb-3 tw-flex tw-items-center tw-justify-center`}>
                        {modal.icon}
                      </div>
                      <h5 className={`tw-font-bold tw-text-${modal.color}-800 tw-mb-2`}>{modal.title}</h5>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-3">
                        Template {index + 1} dengan konten: <br />
                        <Badge bg="secondary" className="tw-text-xs">
                          {contentOptions.find(c => c.value === selectedContent)?.label}
                        </Badge>
                      </p>
                      <Button 
                        variant="primary"
                        onClick={() => handleShow(modal.name)}
                        className={`tw-w-full tw-bg-gradient-to-r tw-from-${modal.color}-500 tw-to-${modal.color}-600 tw-border-0 tw-shadow-md hover:tw-shadow-lg tw-transition-all`}
                      >
                        <Eye className="tw-w-4 tw-h-4 tw-me-1" />
                        Preview
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Professional Modals Section */}
          <div className="tw-mb-8">
            <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
              <div className="tw-bg-gradient-to-r tw-from-slate-700 tw-to-slate-800 tw-p-3 tw-rounded-full">
                <Users className="tw-w-6 tw-h-6 tw-text-white" />
              </div>
              <div>
                <h2 className="tw-text-3xl tw-font-bold tw-text-slate-800 tw-mb-1">Professional Modals</h2>
                <p className="tw-text-slate-600">8 Template modal dengan desain profesional untuk CRM dan admin</p>
              </div>
            </div>
            <Row className="tw-g-4">
              {professionalModals.map((modal, index) => (
                <Col key={index} md={3} sm={6} className="tw-mb-4">
                  <Card className={`tw-h-full tw-border-0 tw-shadow-lg tw-transition-all hover:tw-shadow-xl hover:tw-transform hover:tw-scale-105 tw-border-l-4 tw-border-${modal.color === 'slate' ? 'slate-500' : modal.color === 'gray' ? 'gray-500' : modal.color + '-500'}`}>
                    <Card.Body className="tw-text-center tw-p-4">
                      <div className={`tw-bg-gradient-to-r ${
                        modal.color === 'slate' ? 'tw-from-slate-100 tw-to-slate-200' :
                        modal.color === 'gray' ? 'tw-from-gray-100 tw-to-gray-200' :
                        `tw-from-${modal.color}-100 tw-to-${modal.color}-200`
                      } tw-p-3 tw-rounded-full tw-w-16 tw-h-16 tw-mx-auto tw-mb-3 tw-flex tw-items-center tw-justify-center`}>
                        {modal.icon}
                      </div>
                      <h5 className={`tw-font-bold ${
                        modal.color === 'slate' ? 'tw-text-slate-800' :
                        modal.color === 'gray' ? 'tw-text-gray-800' :
                        `tw-text-${modal.color}-800`
                      } tw-mb-2`}>{modal.title}</h5>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-3">
                        Template {index + 9} dengan konten: <br />
                        <Badge bg="secondary" className="tw-text-xs">
                          {contentOptions.find(c => c.value === selectedContent)?.label}
                        </Badge>
                      </p>
                      <Button 
                        variant="outline-dark"
                        onClick={() => handleShow(modal.name)}
                        className={`tw-w-full tw-border-2 ${
                          modal.color === 'slate' ? 'tw-border-slate-600 hover:tw-bg-slate-600' :
                          modal.color === 'gray' ? 'tw-border-gray-600 hover:tw-bg-gray-600' :
                          `tw-border-${modal.color}-600 hover:tw-bg-${modal.color}-600`
                        } hover:tw-text-white tw-transition-all`}
                      >
                        <Eye className="tw-w-4 tw-h-4 tw-me-1" />
                        Preview
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Usage Instructions */}
          <Card className="tw-border-0 tw-shadow-lg tw-bg-gradient-to-r tw-from-blue-50 tw-to-purple-50">
            <Card.Header className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-purple-600 tw-text-white tw-border-0">
              <h3 className="tw-text-xl tw-font-bold tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <FileText className="tw-w-5 tw-h-5" />
                Cara Penggunaan Template Modal
              </h3>
            </Card.Header>
            <Card.Body className="tw-p-6">
              <Row>
                <Col md={6}>
                  <h5 className="tw-font-bold tw-text-purple-800 tw-mb-3">🎨 Kids Modals (1-8)</h5>
                  <ul className="tw-space-y-2 tw-text-gray-700">
                    <li>• <strong>Modal 1-8:</strong> Desain colorful dan playful</li>
                    <li>• Cocok untuk: Pendaftaran siswa, profil, achievement</li>
                    <li>• Fitur: Animasi, gradient warna-warni, rounded corners</li>
                    <li>• Target: Anak-anak dan remaja</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h5 className="tw-font-bold tw-text-slate-800 tw-mb-3">💼 Professional Modals (9-16)</h5>
                  <ul className="tw-space-y-2 tw-text-gray-700">
                    <li>• <strong>Modal 9-16:</strong> Desain clean dan professional</li>
                    <li>• Cocok untuk: CRM, analytics, settings, data management</li>
                    <li>• Fitur: Clean layout, subtle shadows, business colors</li>
                    <li>• Target: Admin dan staff</li>
                  </ul>
                </Col>
              </Row>
              
              <hr className="tw-my-4" />
              
              <Row>
                <Col>
                  <h5 className="tw-font-bold tw-text-indigo-800 tw-mb-3">⚙️ Customizable Props</h5>
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
                    <div className="tw-bg-white tw-p-3 tw-rounded-lg tw-shadow-sm">
                      <strong className="tw-text-purple-600">Content:</strong>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Dashboard, Form, Analytics, Information, Table, Settings, Profile, Notifications</p>
                    </div>
                    <div className="tw-bg-white tw-p-3 tw-rounded-lg tw-shadow-sm">
                      <strong className="tw-text-blue-600">Size:</strong>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-0">sm, lg, xl + custom width/height</p>
                    </div>
                    <div className="tw-bg-white tw-p-3 tw-rounded-lg tw-shadow-sm">
                      <strong className="tw-text-indigo-600">Buttons:</strong>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Custom text, variants, onClick handlers</p>
                    </div>
                    <div className="tw-bg-white tw-p-3 tw-rounded-lg tw-shadow-sm">
                      <strong className="tw-text-purple-600">Style:</strong>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Title, icon, header color, scrollable</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Render All Modals */}
      {kidsModals.concat(professionalModals).map(modal => renderModal(modal.name))}
    </Container>
  );
};

// Export statement
export default DemoPage;