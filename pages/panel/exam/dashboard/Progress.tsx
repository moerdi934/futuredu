'use client';

import React from 'react';
import { Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, 
  BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer } from 'recharts';
import { Medal, Target, Award, Book, Activity, BookOpen, Briefcase, Library } from 'lucide-react';

// Type definitions
interface TopicData {
  topic: string;
  score: number;
  avg: number;
  completed: number;
  total: number;
}

interface RadarData {
  subject: string;
  score: number;
}

interface CompetitiveAnalysis {
  name: string;
  score: number;
}

interface ProgressDetail {
  nama: string;
  nilai: number;
  peningkatan: number;
}

interface RecommendedProgram {
  program: string;
  match: number;
  minScore: number;
  requirement: string;
}

interface RecommendedResource {
  type: 'video' | 'quiz' | 'reading';
  title: string;
  subject: string;
  topic: string;
  duration?: string;
  questions?: number;
  pages?: number;
}

interface ExamData {
  averageScore: number;
  percentileRank: number;
  probabilitasKelulusan?: number;
  radarData: RadarData[];
  topicData: { [key: string]: TopicData[] };
  competitiveAnalysis: CompetitiveAnalysis[];
  progressDetail: ProgressDetail[];
  recommendedPrograms: RecommendedProgram[];
  recommendedResources: RecommendedResource[];
}

type ExamType = 'SNBT' | 'SIMAK' | 'Quiz' | 'CPNS';

interface ProgressProps {
  examType: ExamType;
  currentExamData: ExamData;
  selectedSubject: string | null;
  setSelectedSubject: (subject: string | null) => void;
  showTopicDetail: boolean;
  setShowTopicDetail: (show: boolean) => void;
  getTopicData: (subject: string) => TopicData[];
  getColorForScore: (score: number) => string;
  getProgressColor: (score: number) => string;
}

interface IconProps {
  className?: string;
  size?: number;
}

interface Insight {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
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

const Progress: React.FC<ProgressProps> = ({ 
  examType, 
  currentExamData, 
  selectedSubject, 
  setSelectedSubject,
  showTopicDetail,
  setShowTopicDetail,
  getTopicData,
  getColorForScore,
  getProgressColor
}) => {
  
  // Render topic radar chart for subject
  const renderTopicRadarChart = () => {
    if (!selectedSubject) return null;
    
    const topicData = getTopicData(selectedSubject);
    if (!topicData || topicData.length === 0) return null;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart outerRadius={90} data={topicData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="topic" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Nilai Kamu" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Radar name="Rata-rata" dataKey="avg" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  // Render probabilitas kelulusan gauge
  const renderProbabilitasGauge = () => {
    // Quiz tidak memiliki probabilitas kelulusan
    if (examType === 'Quiz' || !currentExamData.probabilitasKelulusan) {
      return null;
    }

    const prob = currentExamData.probabilitasKelulusan;
    let color = '#FF0000';
    if (prob >= 80) color = '#4CAF50';
    else if (prob >= 60) color = '#2196F3';
    else if (prob >= 40) color = '#FFC107';
    
    return (
      <Card className="tw-border-0 tw-shadow-sm tw-mb-4">
        <Card.Body>
          <h5 className="tw-font-bold tw-mb-3">Probabilitas Kelulusan</h5>
          <div className="tw-flex tw-justify-center">
            <div className="tw-relative tw-w-48 tw-h-48">
              <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center">
                <div className="tw-text-center">
                  <div className="tw-text-4xl tw-font-bold" style={{ color }}>
                    {prob}%
                  </div>
                  <div className="tw-text-sm tw-text-gray-600">Peluang Lulus</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Probabilitas', value: prob },
                      { name: 'Sisa', value: 100 - prob }
                    ]}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill={color} />
                    <Cell fill="#e0e0e0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="tw-mt-3 tw-text-center tw-text-sm tw-text-gray-600">
            {prob >= 80 ? 'Peluang kelulusan sangat baik!' : 
             prob >= 60 ? 'Peluang kelulusan cukup baik' : 
             prob >= 40 ? 'Perlu perbaikan untuk meningkatkan peluang' : 
             'Butuh usaha keras untuk lulus'}
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Membuat insight cards berdasarkan data
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const subjects = currentExamData.radarData;
    
    // Best subject
    const bestSubject = [...subjects].sort((a, b) => b.score - a.score)[0];
    insights.push({
      title: `Kamu unggul di ${bestSubject.subject}`,
      description: `Nilai ${bestSubject.score}`,
      icon: <Medal className="tw-text-yellow-500" />,
      color: 'tw-bg-yellow-100'
    });
    
    // Weakest subject
    const weakestSubject = [...subjects].sort((a, b) => a.score - b.score)[0];
    insights.push({
      title: `Perlu fokus di ${weakestSubject.subject}`,
      description: `Nilai ${weakestSubject.score}`,
      icon: <Target className="tw-text-red-500" />,
      color: 'tw-bg-red-100'
    });
    
    // Percentile rank
    insights.push({
      title: `Peringkat persentil ${currentExamData.percentileRank}%`,
      description: `Kamu mengalahkan ${currentExamData.percentileRank}% peserta lain`,
      icon: <Award className="tw-text-purple-500" />,
      color: 'tw-bg-purple-100'
    });
    
    return insights;
  };
  
  // Render competitive analysis chart
  const renderCompetitiveAnalysisChart = () => {
    // Urutkan data berdasarkan score, namun simpan data asli untuk referensi
    const sortedData = [...currentExamData.competitiveAnalysis]
      .sort((a, b) => b.score - a.score); // Urutkan dari tertinggi ke terendah
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={80} />
          <Tooltip />
          <Bar dataKey="score" fill="#8884d8" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.name === 'Kamu' ? '#FF8042' : '#8884D8'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <>
      <Row className="tw-mb-4">
        <Col md={6}>
          <Card className="tw-border-0 tw-shadow-sm tw-mb-4">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0">Radar Kemampuan {examType}</h5>
                <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                  Bulan Ini
                </div>
              </div>
              <div className="tw-text-center tw-mb-3">
                <p className="tw-text-sm tw-text-gray-600">Klik pada mata pelajaran untuk melihat topik-topiknya</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart outerRadius={90} data={currentExamData.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar 
                    name="Kemampuan" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                    onClick={(data: any) => {
                      setSelectedSubject(data.subject);
                      setShowTopicDetail(true);
                    }}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              {showTopicDetail && selectedSubject && (
                <div className="tw-mt-4">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                    <h6 className="tw-font-bold">Topik-topik {selectedSubject}</h6>
                    <span className="tw-text-sm tw-text-purple-600 tw-cursor-pointer"
                      onClick={() => setShowTopicDetail(false)}>
                      Tutup
                    </span>
                  </div>
                  {renderTopicRadarChart()}
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0">Trending Skor {examType}</h5>
                <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                  6 Bulan Terakhir
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart 
                  data={[
                    { month: 'Nov', score: currentExamData.averageScore - 15 },
                    { month: 'Des', score: currentExamData.averageScore - 12 },
                    { month: 'Jan', score: currentExamData.averageScore - 8 },
                    { month: 'Feb', score: currentExamData.averageScore - 5 },
                    { month: 'Mar', score: currentExamData.averageScore - 2 },
                    { month: 'Apr', score: currentExamData.averageScore }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[50, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    name="Skor Rata-rata" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          {/* Probabilitas Kelulusan Card */}
          {renderProbabilitasGauge()}
          
          <Card className="tw-border-0 tw-shadow-sm tw-mb-4">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0">Perbandingan dengan Kompetitor</h5>
                <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                  Personalized
                </div>
              </div>
              
              {renderCompetitiveAnalysisChart()}
              
              <div className="tw-bg-purple-50 tw-rounded-lg tw-p-3 tw-mt-4">
                <div className="tw-flex tw-items-center tw-text-purple-700">
                  <LightbulbIcon size={16} className="tw-mr-2" />
                  <span className="tw-font-medium tw-text-sm">Insight Kompetisi</span>
                </div>
                <p className="tw-text-sm tw-mt-2 tw-text-gray-600">
                  {currentExamData.percentileRank > 90 ? 
                    `Peringkatmu sangat baik! Kamu berada di top ${100-currentExamData.percentileRank}% peserta.` : 
                    currentExamData.percentileRank > 75 ? 
                    `Kamu berada di atas sebagian besar peserta dengan persentil ${currentExamData.percentileRank}%. Pertahankan!` : 
                    currentExamData.percentileRank > 50 ? 
                    `Kamu berada di atas rata-rata dengan persentil ${currentExamData.percentileRank}%. Masih ada ruang untuk meningkat.` : 
                    `Masih perlu ditingkatkan. Target minimal untuk masuk 50% peserta terbaik.`
                  }
                </p>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0">
                  {examType === 'SNBT' || examType === 'SIMAK' ? 'Rekomendasi Program Studi' : 
                   examType === 'CPNS' ? 'Rekomendasi Formasi' : 'Rekomendasi Topik Belajar'}
                </h5>
                <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                  AI Generated
                </div>
              </div>

              {examType !== 'Quiz' ? (
                <div className="tw-space-y-3">
                  {currentExamData.recommendedPrograms.map((program, idx) => (
                    <div key={idx} className="tw-flex tw-gap-3 tw-rounded-lg tw-p-3 tw-border tw-border-gray-200 hover:tw-shadow-sm tw-transition-all">
                      <div className="tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-purple-100 tw-h-10 tw-w-10">
                        {examType === 'CPNS' ? 
                          <Briefcase size={18} className="tw-text-purple-600" /> : 
                          <Library size={18} className="tw-text-purple-600" />
                        }
                      </div>
                      <div className="tw-flex-1">
                        <div className="tw-font-medium">{program.program}</div>
                        <div className="tw-flex tw-justify-between tw-text-sm tw-mt-1">
                          <div className="tw-text-gray-500">Match: {program.match}%</div>
                          <div className="tw-text-gray-500">Min. Score: {program.minScore}</div>
                        </div>
                        <div className="tw-text-xs tw-text-gray-600 tw-mt-1">{program.requirement}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tw-space-y-3">
                  {currentExamData.recommendedResources.map((resource, idx) => (
                    <div key={idx} className="tw-border-l-4 tw-border-purple-500 tw-pl-3 tw-py-2 hover:tw-bg-purple-50 tw-rounded-r-lg tw-transition-all">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        {resource.type === 'video' && <BookOpen size={16} className="tw-text-purple-600" />}
                        {resource.type === 'quiz' && <Activity size={16} className="tw-text-blue-600" />}
                        {resource.type === 'reading' && <Book size={16} className="tw-text-green-600" />}
                        <span className="tw-text-sm tw-font-medium">{resource.title}</span>
                      </div>
                      <div className="tw-flex tw-justify-between tw-text-xs tw-text-gray-500 tw-mt-1">
                        <span>{resource.subject}: {resource.topic}</span>
                        <span>
                          {resource.type === 'video' && resource.duration && `${resource.duration}`}
                          {resource.type === 'quiz' && resource.questions && `${resource.questions} soal`}
                          {resource.type === 'reading' && resource.pages && `${resource.pages} halaman`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Button variant="purple" className="tw-bg-purple-600 tw-border-0 tw-w-full tw-mt-4">
                {examType === 'SNBT' || examType === 'SIMAK' ? 'Eksplorasi Program Studi' : 
                examType === 'CPNS' ? 'Cari Formasi Lainnya' : 'Lihat Semua Rekomendasi'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0">Detail Perkembangan {examType}</h5>
                <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                  Semua Mata Pelajaran
                </div>
              </div>
              <div className="tw-space-y-4">
                {currentExamData.progressDetail.map((item, idx) => (
                  <div key={idx} className="tw-bg-white tw-p-3 tw-rounded-lg tw-border tw-border-gray-100 hover:tw-shadow-sm tw-transition-all">
                    <div className="tw-flex tw-justify-between">
                      <span className="tw-font-medium">{item.nama}</span>
                      <span className={getColorForScore(item.nilai)}>{item.nilai}/100</span>
                    </div>
                    <ProgressBar 
                      now={item.nilai} 
                      variant={getProgressColor(item.nilai)} 
                      className="tw-h-2 tw-my-2" 
                    />
                    <div className="tw-flex tw-justify-between tw-text-sm">
                      <span className="tw-text-gray-600">Progres terakhir</span>
                      <span className="tw-text-green-600">+{item.peningkatan} poin</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="tw-border-0 tw-shadow-sm tw-mb-4">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4">Rekomendasi Belajar</h5>
              <div className="tw-space-y-3">
                {currentExamData.recommendedResources.map((resource, idx) => (
                  <div key={idx} className="tw-border-l-4 tw-border-purple-500 tw-pl-3 tw-py-2 hover:tw-bg-purple-50 tw-rounded-r-lg tw-transition-all">
                    <div className="tw-flex tw-items-center tw-gap-2">
                      {resource.type === 'video' && <BookOpen size={16} className="tw-text-purple-600" />}
                      {resource.type === 'quiz' && <Activity size={16} className="tw-text-blue-600" />}
                      {resource.type === 'reading' && <Book size={16} className="tw-text-green-600" />}
                      <span className="tw-text-sm tw-font-medium">{resource.title}</span>
                    </div>
                    <div className="tw-flex tw-justify-between tw-text-xs tw-text-gray-500 tw-mt-1">
                      <span>{resource.subject}: {resource.topic}</span>
                      <span>
                        {resource.type === 'video' && resource.duration && `${resource.duration}`}
                        {resource.type === 'quiz' && resource.questions && `${resource.questions} soal`}
                        {resource.type === 'reading' && resource.pages && `${resource.pages} halaman`}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="purple" className="tw-bg-purple-600 tw-border-0 tw-w-full tw-mt-2">
                  Lihat Semua Rekomendasi
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4">Smart Insights</h5>
              <div className="tw-space-y-3">
                {generateInsights().map((insight, idx) => (
                  <div key={idx} className={`tw-flex tw-gap-3 tw-rounded-lg tw-p-3 ${insight.color}`}>
                    <div className="tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-white tw-h-10 tw-w-10">
                      {insight.icon}
                    </div>
                    <div>
                      <div className="tw-font-medium">{insight.title}</div>
                      <div className="tw-text-sm tw-text-gray-600">{insight.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Progress;