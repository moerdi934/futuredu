'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../../../context/AuthContext';   // sesuaikan path-nya

// ── lazy load komponen supaya bundle awal ringan ──
const StudentExamDashboard = dynamic(
  () => import('./StudentExamDashboard'),        // ganti dengan path relatifmu
  { ssr: false }
);

const AdminExamDashboard = dynamic(
  () => import('./AdminExamDashboard'),          // ganti dengan path relatifmu
  { ssr: false }
);

export default function CourseDashboardPage() {
  const { role, isAuthenticated } = useAuth();

  // cegah hydration mismatch: render baru setelah client mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;                       // atau spinner kecil

  if (!isAuthenticated) {
    return <div className="tw-text-center tw-py-20">Silakan login dulu…</div>;
  }

  if (role === 'student') {
    return <StudentExamDashboard />;
  }

  // anggap admin & teacher share dashboard yang sama
  if (role === 'admin' || role === 'teacher') {
    return <AdminExamDashboard />;
  }

  // fallback kalau role tak dikenal
  return (
    <div className="tw-text-center tw-py-20">
      Role <code>{role ?? '(unknown)'}</code> belum didukung.
    </div>
  );
}
