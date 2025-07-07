'use client';

import { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button,
  Accordion, Spinner,
} from 'react-bootstrap';
import {
  BookOpen, Clock, Star, Zap, Target
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import ExamModal from './ExamModal';

// Force dynamic rendering - disable static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

/* ---------- types ---------- */
interface ExamSchedule {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

/* ---------- props ---------- */
interface Props { 
  initialSchedules?: ExamSchedule[] | null;
}

/* ---------- component ---------- */
export default function TryOutClient({ initialSchedules = null }: Props) {
  const { username } = useAuth();
  const router = useRouter();

  /* state ------------------------------------------------------- */
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selId, setSelId] = useState<number|null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Add mounted check to prevent SSR/hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* fetch data dari client side dengan force refresh ------------ */
  useEffect(() => {
    // Only run on client side after component is mounted
    if (!isMounted || typeof window === 'undefined') return;
    
    // Jika ada initialSchedules dari props, gunakan itu
    if (initialSchedules && Array.isArray(initialSchedules) && initialSchedules.length >= 0) {
      setSchedules(initialSchedules);
      setLoading(false);
      return;
    }

    // Jika tidak ada, fetch dari client side dengan cache busting
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<ExamSchedule[]>(
          `${apiUrl}/exam-schedules/type/SNBT`,
          {
            // Disable caching untuk memastikan data fresh
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
            // Add timestamp untuk cache busting
            params: {
              _t: Date.now()
            }
          }
        );
        setSchedules(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
      } finally { 
        setLoading(false); 
      }
    })();
  }, [initialSchedules, isMounted]);

  /* helpers ---------------------------------------------------- */
  const formatTimeDisplay = (timeString: string | undefined): JSX.Element => {
    if (!timeString) return (
      <span className="tw-flex tw-items-center tw-text-violet-600 tw-font-medium">
        <Zap className="tw-w-4 tw-h-4 tw-mr-1" />
        Anytime
      </span>
    );
    
    const timeDate = new Date(timeString);
    if (isNaN(timeDate.getTime()) || timeDate.getFullYear() < 2000) {
      return (
        <span className="tw-flex tw-items-center">
          <span className="tw-text-violet-600 tw-font-semibold tw-flex tw-items-center">
            <Zap className="tw-w-4 tw-h-4 tw-mr-1" />
            Anytime
          </span>
          <span className="tw-inline-block tw-ml-2 tw-w-3 tw-h-3 tw-bg-violet-500 tw-rounded-full tw-animate-pulse"></span>
        </span>
      );
    }
    
    const now = new Date();
    const isPast = timeDate < now;
    const isFuture = timeDate > now;
    let className = "tw-font-medium tw-flex tw-items-center";
    if (isPast) className += " tw-text-red-500 tw-line-through";
    if (isFuture) className += " tw-text-green-600";
    
    return (
      <span className={className}>
        <Clock className="tw-w-4 tw-h-4 tw-mr-1" />
        {timeDate.toLocaleString('id-ID', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>
    );
  };

  const handleStart = (id: number) => {
    if (!username) { 
      router.push('/login'); 
      return; 
    }
    setSelId(id);
    setModalOpen(true);
  };

  // Auto refresh data setiap 5 menit untuk memastikan data terbaru
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && !initialSchedules) {
        // Refresh data tanpa loading state
        axios.get<ExamSchedule[]>(
          `${apiUrl}/exam-schedules/type/SNBT`,
          {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            },
            params: {
              _t: Date.now()
            }
          }
        ).then(({ data }) => {
          setSchedules(Array.isArray(data) ? data : []);
        }).catch(error => {
          console.error('Error refreshing schedules:', error);
        });
      }
    }, 5 * 60 * 1000); // 5 menit

    return () => clearInterval(interval);
  }, [initialSchedules, isMounted]);

  // Don't render anything on server side to prevent hydration mismatch
  if (!isMounted) {
    return (
      <Row className="justify-content-center">
        <Col lg={11} xl={10}>
          <div className="tw-text-center tw-py-12">
            <Spinner animation="border" className="tw-text-violet-600 tw-w-16 tw-h-16" />
            <p className="tw-mt-4 tw-text-violet-600 tw-font-medium">Memuat halaman...</p>
          </div>
        </Col>
      </Row>
    );
  }

  /* UI --------------------------------------------------------- */
  return (
    <Row className="justify-content-center">
      <Col lg={11} xl={10}>
        <Accordion className="tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden tw-border-0">
          <Accordion.Item eventKey="utbk" className="tw-border-0">
            <Accordion.Header className="tw-bg-gradient-to-r tw-from-violet-100 tw-to-purple-100">
              <div className="tw-flex tw-items-center tw-gap-3 tw-font-bold tw-text-violet-800 tw-text-xl">
                <div className="tw-w-12 tw-h-12 tw-bg-violet-600 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <BookOpen className="tw-w-6 tw-h-6 tw-text-white" />
                </div>
                Tryout UTBK 2024 - Tes Skolastik & Literasi
                <div className="tw-ml-auto tw-flex tw-items-center tw-gap-1">
                  <div className="tw-w-2 tw-h-2 tw-bg-green-500 tw-rounded-full tw-animate-pulse"></div>
                  <span className="tw-text-sm tw-font-medium tw-text-green-600">Live</span>
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body className="tw-p-8 tw-bg-gradient-to-br tw-from-gray-50 tw-to-violet-50">
              {/* loading */}
              {loading && (
                <div className="tw-text-center tw-py-12">
                  <Spinner animation="border" className="tw-text-violet-600 tw-w-16 tw-h-16" />
                  <p className="tw-mt-4 tw-text-violet-600 tw-font-medium">Memuat jadwal try out...</p>
                </div>
              )}

              {/* kosong */}
              {!loading && (!schedules || schedules.length === 0) && (
                <div className="tw-text-center tw-py-12">
                  <div className="tw-w-24 tw-h-24 tw-bg-violet-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                    <Clock className="tw-w-12 tw-h-12 tw-text-violet-600" />
                  </div>
                  <h4 className="tw-text-xl tw-font-semibold tw-text-violet-800 tw-mb-2">Belum Ada Try Out Tersedia</h4>
                  <p className="tw-text-violet-600">Try out akan segera hadir! Stay tuned 🎯</p>
                </div>
              )}

              {/* grid jadwal */}
              {!loading && schedules && schedules.length > 0 && (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 2xl:tw-grid-cols-4 tw-gap-6">
                  {schedules.map((schedule, index) => (
                    <Card key={schedule.id} className="tw-border-0 tw-shadow-lg tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-hover:scale-105 tw-bg-white">
                      <Card.Body className="tw-p-6">
                        <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                          <div className={`tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm
                                         ${index % 3 === 0 ? 'tw-bg-violet-500' : index % 3 === 1 ? 'tw-bg-purple-500' : 'tw-bg-indigo-500'}`}>
                            {index + 1}
                          </div>
                          <Star className="tw-w-5 tw-h-5 tw-text-yellow-500" />
                        </div>
                        
                        <h5 className="tw-font-bold tw-text-violet-800 tw-mb-4 tw-text-lg">
                          {schedule.name}
                        </h5>
                        
                        <div className="tw-space-y-3 tw-mb-6">
                          <div className="tw-bg-green-50 tw-p-3 tw-rounded-lg tw-border-l-4 tw-border-green-400">
                            <p className="tw-text-sm tw-font-medium tw-text-green-800 tw-mb-1">Mulai:</p>
                            <div className="tw-text-sm">
                              {formatTimeDisplay(schedule.start_time)}
                            </div>
                          </div>
                          <div className="tw-bg-red-50 tw-p-3 tw-rounded-lg tw-border-l-4 tw-border-red-400">
                            <p className="tw-text-sm tw-font-medium tw-text-red-800 tw-mb-1">Berakhir:</p>
                            <div className="tw-text-sm">
                              {formatTimeDisplay(schedule.end_time)}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          className={`tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md
                                     ${index % 3 === 0 
                                       ? 'tw-bg-gradient-to-r tw-from-violet-500 tw-to-violet-600 tw-hover:from-violet-600 tw-hover:to-violet-700' 
                                       : index % 3 === 1 
                                       ? 'tw-bg-gradient-to-r tw-from-purple-500 tw-to-purple-600 tw-hover:from-purple-600 tw-hover:to-purple-700'
                                       : 'tw-bg-gradient-to-r tw-from-indigo-500 tw-to-indigo-600 tw-hover:from-indigo-600 tw-hover:to-indigo-700'
                                     } tw-text-white tw-hover:shadow-lg tw-hover:scale-105`}
                          onClick={() => handleStart(schedule.id)}
                        >
                          <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                            <Zap className="tw-w-5 tw-h-5" />
                            Mulai Try Out
                          </div>
                        </Button>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Col>

      {/* modal ujian */}
      {selId && (
        <ExamModal
          show={modalOpen}
          onClose={() => setModalOpen(false)}
          scheduleId={selId}
        />
      )}
    </Row>
  );
}