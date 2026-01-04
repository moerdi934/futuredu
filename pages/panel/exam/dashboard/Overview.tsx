// pages/panel/exam/dashboard/Overview.tsx
'use client';

import React from 'react';
import { Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, 
  ResponsiveContainer } from 'recharts';
import { Calendar, CheckCircle, AlertTriangle, Clock, TrendingUp, Target } from 'lucide-react';
import TargetProdiAnalysisComponent from './TargetProdiAnalysis';

// Type definitions
interface SubjectPerformance {
  name: string;
  nilai: number;
  target: number;
  maxScore: number;
  metrics: string;
}

interface WeeklyProgressData {
  name: string;
  nilai: number;
  target: number;
}

interface NextGoal {
  name: string;
  score: number;
  currentScore: number;
  maxScore?: number;
}

interface RecentResult {
  id: number;
  title: string;
  date: string;
  score: number;
  maxScore: number;
  metrics: string;
  numberOfExams?: number;
  averageScore?: number;
  minScore?: number;
  minExamName?: string;
  maxExamScore?: number;
  maxExamName?: string;
}

interface TargetProdiAnalysis {
  prodi_id: number;
  nama_prodi: string;
  nama_ptn: string;
  user_score: number;
  user_rank: number;
  total_bimbel_participants: number;
  peminat: number | null;
  daya_tampung: number | null;
  safe_zone_rank: number | null;
  min_score_reference: number | null;
  max_score_reference: number | null;
  average_score_reference: number | null;
  has_historical_data: boolean;
  status: 'Aman' | 'Perlu Ditingkatkan' | 'Tidak Aman' | 'No Historical Data';
  score_gap_to_minimum: number | null;
  score_gap_to_average: number | null;
  competition_ratio: number | null;
  status_message: string;
}

interface ExamData {
  nextGoal: NextGoal;
  subjectPerformanceData: SubjectPerformance[];
  weeklyProgressData: WeeklyProgressData[];
  recentResults: RecentResult[];
  targetProdiAnalysis?: TargetProdiAnalysis[];
  rank?: string;
  previousRank?: string | null;
  averageScore?: number;
  previousAverageScore?: number | null;
  totalParticipants?: string;
}

interface UpcomingExam {
  id: number;
  title: string;
  date: string;
  subject: string;
}

type ExamType = 'SNBT' | 'SNBT Exam' | 'SIMAK' | 'Quiz' | 'CPNS';

interface OverviewProps {
  examType: ExamType;
  currentExamData?: ExamData;
  upcomingExams?: UpcomingExam[];
  maxScore: number;
  metrics: string;
  getProgressColor: (score: number, maxScore?: number) => string;
  calculatePercentage: (score: number, maxScore?: number) => number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: WeeklyProgressData;
  }>;
}

interface CustomizedDotProps {
  cx?: number;
  cy?: number;
  payload?: WeeklyProgressData;
}

interface IconProps {
  className?: string;
  size?: number;
}

const LightbulbIcon: React.FC<IconProps> = ({ className, size = 16 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  );
};

const Overview: React.FC<OverviewProps> = ({ 
  examType, 
  currentExamData, 
  upcomingExams = [], 
  maxScore,
  metrics,
  getProgressColor,
  calculatePercentage
}) => {
  if (!currentExamData || !currentExamData.weeklyProgressData || !currentExamData.nextGoal || !currentExamData.recentResults) {
    return (
      <Row className="tw-mb-4">
        <Col>
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <div className="tw-text-center tw-py-20">
                <div className="tw-text-gray-500">Loading overview data...</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  // Helper function to get the display score based on metrics
  const getDisplayScore = (result: RecentResult): number => {
    switch (result.metrics) {
      case 'sum':
        return result.score;
      case 'average':
        return result.averageScore || result.score;
      case 'min':
        return result.minScore || result.score;
      case 'max':
        return result.maxExamScore || result.score;
      default:
        return result.score;
    }
  };

  // Helper function to get additional info text based on metrics
  const getAdditionalInfo = (result: RecentResult): string | null => {
    switch (result.metrics) {
      case 'min':
        return result.minExamName ? `Terendah: ${result.minExamName}` : null;
      case 'max':
        return result.maxExamName ? `Tertinggi: ${result.maxExamName}` : null;
      case 'average':
        return result.numberOfExams ? `${result.numberOfExams} ujian` : null;
      default:
        return null;
    }
  };

  // Determine the domain for Y-axis based on maxScore
  const getYAxisDomain = () => {
    if (maxScore === 1000) {
      return [0, 1000];
    }
    return [0, 100];
  };

  const renderWeeklyProgressChart = () => {
    const lastWeekData = currentExamData.weeklyProgressData[currentExamData.weeklyProgressData.length - 1];
    const comparison = lastWeekData.nilai > lastWeekData.target ? 'above' : 
                       lastWeekData.nilai < lastWeekData.target ? 'below' : 'equal';
    
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="tw-bg-white tw-p-2 tw-shadow-md tw-rounded tw-border">
            <p className="tw-text-sm tw-mb-1">{`${payload[0].payload.name}`}</p>
            <p className="tw-text-sm tw-mb-0 tw-text-blue-600">{`Nilai: ${payload[0].payload.nilai}${maxScore !== 100 ? `/${maxScore}` : ''}`}</p>
            <p className="tw-text-sm tw-mb-0 tw-text-orange-500">{`Target: ${payload[0].payload.target}${maxScore !== 100 ? `/${maxScore}` : ''}`}</p>
          </div>
        );
      }
      return null;
    };

    const CustomizedDot: React.FC<CustomizedDotProps> = (props) => {
      const { cx, cy, payload } = props;
      if (!cx || !cy || !payload) return null;
      
      const color = payload.nilai >= payload.target ? "#4ade80" : "#ef4444";
      
      return (
        <circle cx={cx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={1} />
      );
    };

    return (
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={currentExamData.weeklyProgressData}>
          <defs>
            <linearGradient id="colorAboveTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorBelowTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorEqualTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#eab308" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis domain={getYAxisDomain()} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Area 
            type="monotone" 
            dataKey="nilai"
            name="Nilai" 
            stroke={comparison === 'above' ? "#4ade80" : 
                  comparison === 'below' ? "#ef4444" : "#eab308"} 
            fill={`url(#color${comparison === 'above' ? 'Above' : 
                              comparison === 'below' ? 'Below' : 'Equal'}Target)`}
            fillOpacity={1}
            dot={<CustomizedDot />}
            activeDot={{ r: 8 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="target" 
            name="Target" 
            stroke="#eab308"
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2, fill: "#eab308" }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <>
      <Row className="tw-mb-4">
        <Col md={8}>
          {/* Quick Summary Strip */}
          {(currentExamData.totalCompleted || currentExamData.studyTime || currentExamData.averageScore) && (
            <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-blue-50 tw-rounded-lg tw-p-3 tw-mb-4 tw-flex tw-flex-wrap tw-gap-4 tw-justify-around tw-items-center">
              {currentExamData.totalCompleted !== undefined && (
                <div className="tw-text-center">
                  <div className="tw-text-2xl tw-font-bold tw-text-purple-600">{currentExamData.totalCompleted}</div>
                  <div className="tw-text-xs tw-text-gray-600">Ujian Selesai</div>
                </div>
              )}
              {currentExamData.averageScore !== undefined && (
                <div className="tw-text-center">
                  <div className="tw-text-2xl tw-font-bold tw-text-blue-600">{currentExamData.averageScore.toFixed(0)}</div>
                  <div className="tw-text-xs tw-text-gray-600">Rata-rata Skor</div>
                </div>
              )}
              {currentExamData.rank && (
                <div className="tw-text-center">
                  <div className="tw-text-2xl tw-font-bold tw-text-green-600">#{currentExamData.rank}</div>
                  <div className="tw-text-xs tw-text-gray-600">Peringkat</div>
                </div>
              )}
              {currentExamData.percentileRank !== undefined && (
                <div className="tw-text-center">
                  <div className="tw-text-2xl tw-font-bold tw-text-orange-600">{currentExamData.percentileRank}%</div>
                  <div className="tw-text-xs tw-text-gray-600">Persentil</div>
                </div>
              )}
            </div>
          )}

          <Card className="tw-border-0 tw-shadow-sm tw-mb-4">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0">Progres Mingguan {examType}</h5>
                <div className="tw-flex tw-space-x-2">
                  <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                    VS Target
                  </div>
                </div>
              </div>
              {renderWeeklyProgressChart()}
              <div className="tw-flex tw-justify-center tw-gap-6 tw-mt-3">
                <div className="tw-flex tw-items-center">
                  <div className="tw-w-3 tw-h-3 tw-bg-green-500 tw-rounded-full tw-mr-2"></div>
                  <span className="tw-text-xs tw-text-gray-600">Di atas target</span>
                </div>
                <div className="tw-flex tw-items-center">
                  <div className="tw-w-3 tw-h-3 tw-bg-red-500 tw-rounded-full tw-mr-2"></div>
                  <span className="tw-text-xs tw-text-gray-600">Di bawah target</span>
                </div>
                <div className="tw-flex tw-items-center">
                  <div className="tw-w-3 tw-h-3 tw-bg-yellow-500 tw-rounded-full tw-mr-2"></div>
                  <span className="tw-text-xs tw-text-gray-600">Sama dengan target</span>
                </div>
              </div>
              
              {/* Learning Insights inline */}
              {currentExamData.learningInsights && currentExamData.learningInsights.length > 0 && (
                <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-200">
                  <div className="tw-flex tw-flex-wrap tw-gap-2">
                    {currentExamData.learningInsights.slice(0, 2).map((insight, idx) => (
                      <div 
                        key={idx}
                        className={`tw-inline-flex tw-items-center tw-gap-1 tw-px-3 tw-py-1.5 tw-rounded-full tw-text-xs ${
                          insight.type === 'positive' 
                            ? 'tw-bg-green-100 tw-text-green-700' 
                            : 'tw-bg-red-100 tw-text-red-700'
                        }`}
                      >
                        {insight.type === 'positive' ? '✓' : '⚠'}
                        <span>{insight.insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Target Prodi Analysis - only for SNBT Exam */}
          {(examType === 'SNBT' || examType === 'SNBT Exam') && currentExamData.targetProdiAnalysis && currentExamData.targetProdiAnalysis.length > 0 && (
            <TargetProdiAnalysisComponent data={currentExamData.targetProdiAnalysis} />
          )}
        </Col>

        <Col md={4}>
          <Card className="tw-border-0 tw-shadow-sm tw-mb-4">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4">Target Belajar {examType}</h5>
              <div className="tw-text-center tw-mb-4">
                <h6 className="tw-text-gray-600">{currentExamData.nextGoal.name}</h6>
                <div className="tw-flex tw-justify-center tw-items-baseline tw-my-3">
                  <span className="tw-text-3xl tw-font-bold tw-text-purple-600">
                    {currentExamData.nextGoal.currentScore.toFixed(0)}
                  </span>
                  <span className="tw-text-xl tw-text-gray-500 tw-ml-2">
                    / {currentExamData.nextGoal.score}
                  </span>
                  {maxScore !== 100 && (
                    <span className="tw-text-sm tw-text-gray-400 tw-ml-1">
                      (max: {maxScore})
                    </span>
                  )}
                </div>
                <ProgressBar 
                  now={(currentExamData.nextGoal.currentScore / currentExamData.nextGoal.score) * 100} 
                  variant="purple" 
                  className="tw-h-2" 
                />
                <div className="tw-text-sm tw-text-gray-500 tw-mt-2">
                  {((currentExamData.nextGoal.score - currentExamData.nextGoal.currentScore) / currentExamData.nextGoal.score * 100).toFixed(1)}% lagi untuk mencapai target
                </div>
              </div>
              <div className="tw-bg-purple-50 tw-rounded-lg tw-p-3 tw-mt-4">
                <div className="tw-flex tw-items-center tw-text-purple-700">
                  <LightbulbIcon size={16} className="tw-mr-2" />
                  <span className="tw-font-medium tw-text-sm">Tips Mencapai Target</span>
                </div>
                <p className="tw-text-sm tw-mt-2 tw-text-gray-600">
                  Fokus pada topik-topik yang nilainya rendah dan latih konsistensi belajar untuk meningkatkan skor {examType}.
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4">Jadwal {examType} Mendatang</h5>
              <div className="tw-space-y-3">
                {upcomingExams && upcomingExams.length > 0 ? (
                  upcomingExams.map(exam => (
                    <div key={exam.id} className="tw-border-l-4 tw-border-purple-500 tw-pl-3 tw-py-1 hover:tw-bg-purple-50 tw-rounded-r-lg tw-transition-all">
                      <div className="tw-font-medium">{exam.title}</div>
                      <div className="tw-flex tw-justify-between tw-text-sm">
                        <span className="tw-text-gray-500">{exam.subject}</span>
                        <span className="tw-flex tw-items-center">
                          <Calendar size={14} className="tw-mr-1" />
                          {exam.date}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="tw-text-center tw-py-4">
                    <div className="tw-text-gray-500">Tidak ada jadwal upcoming</div>
                  </div>
                )}
                <Button className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0 tw-w-full tw-mt-2">
                  Lihat Semua Jadwal
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0">Hasil Try Out {examType} Terbaru</h5>
                <Button variant="outline-purple" className="tw-border-purple-500 tw-text-purple-500">
                  Lihat Semua
                </Button>
              </div>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                {currentExamData.recentResults.map(result => {
                  const displayScore = getDisplayScore(result);
                  const percentage = calculatePercentage(displayScore, result.maxScore);
                  const additionalInfo = getAdditionalInfo(result);
                  
                  // Check if min and max exams are different
                  const hasMinMaxDetails = result.minExamName && result.maxExamName && 
                                          result.minExamName !== result.maxExamName &&
                                          result.minScore !== undefined && 
                                          result.maxExamScore !== undefined;
                  
                  return (
                    <div key={result.id} className="tw-bg-white tw-border tw-border-gray-100 tw-rounded-lg tw-p-4 tw-shadow-sm hover:tw-shadow-md tw-transition-all">
                      <div className="tw-flex tw-justify-between tw-mb-2">
                        <span className="tw-font-medium tw-text-lg">{result.title}</span>
                        <span className="tw-bg-purple-100 tw-text-purple-700 tw-rounded-full tw-px-2 tw-py-1 tw-text-xs">
                          {result.date}
                        </span>
                      </div>
                      
                      {/* Metric type badge */}
                      <div className="tw-mb-2">
                        <span className="tw-bg-blue-100 tw-text-blue-700 tw-rounded-full tw-px-2 tw-py-1 tw-text-xs tw-capitalize">
                          {result.metrics === 'sum' ? 'Total' : 
                           result.metrics === 'average' ? 'Rata-rata' : 
                           result.metrics === 'min' ? 'Minimum' : 
                           result.metrics === 'max' ? 'Maximum' : result.metrics}
                        </span>
                      </div>

                      <div className="tw-mb-2">
                        <div className="tw-flex tw-justify-between tw-mb-1">
                          <span className="tw-text-gray-500 tw-text-sm">Skor Kamu</span>
                          <span className="tw-font-bold">
                            {displayScore.toFixed(2)}/{result.maxScore}
                          </span>
                        </div>
                        <ProgressBar 
                          now={percentage} 
                          variant={getProgressColor(displayScore, result.maxScore)} 
                        />
                      </div>

                      {/* Additional info based on metrics */}
                      {additionalInfo && (
                        <div className="tw-text-xs tw-text-gray-600 tw-mb-2">
                          {additionalInfo}
                        </div>
                      )}

                      {/* Display min and max exam details if available and different */}
                      {hasMinMaxDetails && (
                        <div className="tw-bg-gray-50 tw-rounded-lg tw-p-2 tw-mb-3 tw-space-y-1">
                          <div className="tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex tw-items-center">
                              <div className="tw-w-2 tw-h-2 tw-bg-red-500 tw-rounded-full tw-mr-2"></div>
                              <span className="tw-text-xs tw-text-gray-700 tw-font-medium">Terendah</span>
                            </div>
                            <span className="tw-text-xs tw-font-bold tw-text-red-600">
                              {result.minScore}/{result.maxScore}
                            </span>
                          </div>
                          <div className="tw-text-xs tw-text-gray-600 tw-pl-4 tw-truncate" title={result.minExamName}>
                            {result.minExamName}
                          </div>
                          
                          <div className="tw-border-t tw-border-gray-200 tw-my-1"></div>
                          
                          <div className="tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex tw-items-center">
                              <div className="tw-w-2 tw-h-2 tw-bg-green-500 tw-rounded-full tw-mr-2"></div>
                              <span className="tw-text-xs tw-text-gray-700 tw-font-medium">Tertinggi</span>
                            </div>
                            <span className="tw-text-xs tw-font-bold tw-text-green-600">
                              {result.maxExamScore}/{result.maxScore}
                            </span>
                          </div>
                          <div className="tw-text-xs tw-text-gray-600 tw-pl-4 tw-truncate" title={result.maxExamName}>
                            {result.maxExamName}
                          </div>
                        </div>
                      )}

                      <div className="tw-flex tw-justify-between tw-mt-3">
                        <Button variant="outline-secondary" size="sm">Detail</Button>
                        <Button variant="outline-secondary" size="sm">Pembahasan</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Overview;