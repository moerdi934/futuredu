// pages/exam/index.tsx - Main TryOut Page
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import NavigationBar from '../../components/layout/NavigationBar';
import TryOutClient from './TryOutClient';
import { Row, Col } from 'react-bootstrap';
import { Trophy, Target } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

/* ---------- SSR: ambil daftar jadwal dari public endpoint ---------- */
export const getServerSideProps: GetServerSideProps = async () => {
  let initialSchedules: unknown[] = [];
  try {
    const res = await fetch(`${apiUrl}/exam-schedules/public?includeDeleted=false&approvalStatus=approved&is_valid=true`, {
      headers: { 
        'cache-control': 'no-store',
        'pragma': 'no-cache'
      },
    });
    
    if (res.ok) {
      const data = await res.json();
      initialSchedules = data?.data || [];
      console.log('SSR: Fetched schedules successfully:', initialSchedules.length);
    } else {
      console.error('SSR: Failed to fetch schedules:', res.status, res.statusText);
    }
  } catch (err) {
    console.error('SSR fetch try-out failed:', err);
  }

  return { 
    props: { 
      initialSchedules: JSON.parse(JSON.stringify(initialSchedules))
    } 
  };
};

/* ---------- komponen halaman ---------- */
function TryOutPage(
  { initialSchedules }
    : InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return (
    <div className="tw-min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <NavigationBar />
      
      <div className="tw-relative tw-overflow-hidden tw-pb-12">
        {/* Background decorations */}
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
        <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
        
        <div className="tw-w-full tw-px-3 sm:tw-px-6 lg:tw-px-8 xl:tw-px-12 2xl:tw-px-16 tw-py-8 tw-relative tw-z-10">
          {/* Header Section */}
          <Row className="justify-content-center tw-mb-8">
            <Col lg={10} className="text-center">
              <div className="tw-mb-6">
                {/* Icon Circle */}
                <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-4 tw-shadow-lg">
                  <Trophy className="tw-w-10 tw-h-10 tw-text-yellow-300" />
                </div>
                
                {/* Title */}
                <h1 className="tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-text-white tw-mb-3 tw-drop-shadow-lg">
                  Simulasi UTBK
                </h1>
                
                {/* Subtitle */}
                <p className="tw-text-lg md:tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-2xl tw-mx-auto">
                  Latih diri dan wujudkan mimpi masuk PTN impian! ✨
                </p>
              </div>
            </Col>
          </Row>

          {/* Call to Action Banner */}
          <Row className="justify-content-center tw-mb-8">
            <Col lg={10} className="text-center">
              <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-4 md:tw-p-6 tw-border tw-border-white/20 tw-shadow-xl">
                <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-center tw-gap-3">
                  <Target className="tw-w-7 tw-h-7 md:tw-w-8 md:tw-h-8 tw-text-yellow-300 tw-flex-shrink-0" />
                  <div className="tw-text-center md:tw-text-left">
                    <h3 className="tw-text-xl md:tw-text-2xl lg:tw-text-3xl tw-font-bold tw-text-white tw-mb-1">
                      Ready to Fight?
                    </h3>
                    <p className="tw-text-white/90 tw-text-sm md:tw-text-base lg:tw-text-lg tw-font-medium">
                      Temukan potensi terbaikmu melalui simulasi yang menantang dan terstruktur!
                    </p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* CLIENT-SIDE section (grouped accordions + my try-outs) */}
          <TryOutClient initialSchedules={initialSchedules} />
        </div>
      </div>
    </div>
  );
}

export default TryOutPage;