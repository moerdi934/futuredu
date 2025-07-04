import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import NavigationBar from '../../components/layout/NavigationBar';
import TryOutClient from './TryOutClient';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Trophy, BookOpen, Star, Target } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

/* ---------- SSR: ambil daftar jadwal SNBT sekali setiap request ---------- */
export const getServerSideProps: GetServerSideProps = async () => {
  let initialSchedules: unknown[] = [];
  try {
    const res = await fetch(`${apiUrl}/exam-schedules/type/SNBT`, {
      // disable cache di sisi Next.js
      headers: { 'cache-control': 'no-store' },
    });
    initialSchedules = await res.json();
  } catch (err) {
    console.error('SSR fetch try-out failed:', err);
  }

  return { props: { initialSchedules } };
};

/* ---------- komponen halaman ---------- */
function TryOutPage(
  { initialSchedules }
    : InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return (
    <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '125vh'}}>
      <NavigationBar />
      
      <div className="tw-relative tw-overflow-hidden tw-pb-12" style={{minHeight: '125vh'}}>
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
        <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
        
        <div className="tw-w-full tw-px-3 sm:tw-px-6 lg:tw-px-8 xl:tw-px-12 2xl:tw-px-16 tw-py-12 tw-relative tw-z-10">
          <Row className="justify-content-center mb-5">
            <Col lg={10} className="text-center">
              <div className="tw-mb-6">
                <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-4 tw-shadow-lg">
                  <Trophy className="tw-w-10 tw-h-10 tw-text-yellow-300" />
                </div>
                <h1 className="tw-text-5xl md:tw-text-6xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
                  Simulasi UTBK
                </h1>
                <p className="tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow">
                  Latih diri dan wujudkan mimpi masuk PTN impian! ✨
                </p>
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={10} className="mx-auto">
              <Card className="tw-border-0 tw-shadow-2xl tw-bg-white/95 tw-backdrop-blur-sm">
                <Card.Body className="tw-p-0">
                  <Button 
                    className="w-100 tw-bg-gradient-to-r tw-from-violet-600 tw-to-purple-600 tw-text-white tw-font-bold tw-py-4 tw-px-6 
                               tw-text-lg tw-border-0 tw-transition-all tw-duration-300 tw-hover:from-violet-700 tw-hover:to-purple-700 
                               tw-hover:shadow-xl tw-hover:scale-105 tw-flex tw-items-center tw-justify-center tw-gap-3"
                    style={{borderRadius: '0'}}
                    onClick={() => window.location.href = '/my-try-outs'}
                  >
                    <BookOpen className="tw-w-6 tw-h-6" />
                    Lihat Try Out Saya
                    <Star className="tw-w-5 tw-h-5 tw-text-yellow-300" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="justify-content-center mb-12 lg:tw-mb-16">
            <Col lg={10} className="text-center">
              <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                <h3 className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-white tw-mb-2 tw-flex tw-items-center tw-justify-center tw-gap-3">
                  <Target className="tw-w-8 tw-h-8 tw-text-yellow-300" />
                  Ready to Fight?
                </h3>
                <p className="tw-text-white/90 tw-text-lg tw-font-medium">
                  Temukan potensi terbaikmu melalui simulasi yang menantang dan terstruktur!
                </p>
              </div>
            </Col>
          </Row>

          {/* CLIENT-SIDE section (grid + interaksi) -------------------- */}
          <TryOutClient initialSchedules={initialSchedules} />
        </div>
      </div>
    </div>
  );
}

export default TryOutPage;