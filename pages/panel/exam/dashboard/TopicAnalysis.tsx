// pages/panel/exam/dashboard/TopicAnalysis.tsx
'use client';

import React from 'react';
import { Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target, Activity } from 'lucide-react';

// Type definitions
interface TopicData {
  topic: string | null;
  score: number;
  avg: number;
  completed: number;
  total: number;
  maxScore: number;
  metrics: string;
}

interface RadarData {
  subject: string | null;
  score: number;
  maxScore: number;
}

interface ExamData {
  radarData: RadarData[];
  topicData: { [key: string]: TopicData[] };
}

type ExamType = 'SNBT' | 'SNBT Exam' | 'SIMAK' | 'Quiz' | 'CPNS';

interface TopicAnalysisProps {
  examType: ExamType;
  currentExamData?: ExamData;
  selectedSubject: string | null;
  setSelectedSubject: (subject: string | null) => void;
  maxScore: number;
  metrics: string;
  getTopicData: (subject: string) => TopicData[];
  getColorForScore: (score: number, maxScore?: number) => string;
  getProgressColor: (score: number, maxScore?: number) => string;
  calculatePercentage: (score: number, maxScore?: number) => number;
}

const TopicAnalysis: React.FC<TopicAnalysisProps> = ({ 
  examType, 
  currentExamData, 
  selectedSubject, 
  setSelectedSubject,
  maxScore,
  metrics,
  getTopicData,
  getColorForScore,
  getProgressColor,
  calculatePercentage
}) => {
  // For topic analysis, we always use 100 as maxScore since it represents percentage
  const TOPIC_MAX_SCORE = 100;

  // Helper functions specifically for topic analysis (always use 100 as max)
  const getTopicColorForScore = (score: number): string => {
    const percentage = score; // score is already a percentage (0-100)
    
    if (percentage >= 85) return 'tw-text-green-600';
    if (percentage >= 70) return 'tw-text-blue-600';
    if (percentage >= 60) return 'tw-text-yellow-600';
    return 'tw-text-red-600';
  };

  const getTopicProgressColor = (score: number): string => {
    const percentage = score; // score is already a percentage (0-100)
    
    if (percentage >= 85) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  if (!currentExamData || !currentExamData.radarData || !currentExamData.topicData) {
    return (
      <Row className="tw-mb-4">
        <Col>
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <div className="tw-text-center tw-py-20">
                <div className="tw-text-gray-500">Loading topic analysis data...</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Row className="tw-mb-4">
        <Col>
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4">Pilih Mata Pelajaran untuk Analisis Topik</h5>
              <div className="tw-flex tw-flex-wrap tw-gap-3">
                {currentExamData.radarData.filter(s => s.subject !== null).map(subject => (
                  <Button 
                    key={subject.subject}
                    variant={selectedSubject === subject.subject ? "purple" : "outline-purple"}
                    className={`${selectedSubject === subject.subject ? 'tw-bg-purple-600 tw-border-purple-600' : 'tw-border-purple-500 tw-text-purple-500'}`}
                    onClick={() => setSelectedSubject(subject.subject)}
                  >
                    {subject.subject}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {selectedSubject ? (
        <>
          <Row className="tw-mb-4">
            <Col md={8}>
              <Card className="tw-border-0 tw-shadow-sm">
                <Card.Body>
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                    <h5 className="tw-font-bold tw-mb-0">Analisis Topik: {selectedSubject}</h5>
                    <div className="tw-flex tw-gap-2">
                      <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                        {currentExamData.topicData[selectedSubject]?.filter(t => t.topic !== null).length || 0} topik
                      </div>
                      <div className="tw-bg-blue-100 tw-text-blue-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                        Persentase Benar
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart 
                      outerRadius={130} 
                      data={(currentExamData.topicData[selectedSubject] || []).filter(t => t.topic !== null)}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="topic" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Persentase Benar Kamu" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Rata-rata Kelas" dataKey="avg" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
                      <Legend />
                      <Tooltip 
                        formatter={(value: any) => `${value.toFixed(1)}%`}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  
                  {/* Info box explaining the percentage */}
                  <div className="tw-bg-blue-50 tw-rounded-lg tw-p-3 tw-mt-4">
                    <div className="tw-flex tw-items-start tw-gap-2">
                      <div className="tw-flex-shrink-0 tw-mt-0.5">
                        <svg className="tw-w-5 tw-h-5 tw-text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="tw-flex-1">
                        <p className="tw-text-sm tw-text-blue-800 tw-mb-1 tw-font-medium">
                          Tentang Persentase Benar
                        </p>
                        <p className="tw-text-xs tw-text-blue-700">
                          Nilai pada grafik ini menunjukkan persentase jawaban benar untuk setiap topik. 
                          Semakin tinggi persentase, semakin baik pemahaman kamu pada topik tersebut.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="tw-border-0 tw-shadow-sm">
                <Card.Body>
                  <h5 className="tw-font-bold tw-mb-4">Detail Topik {selectedSubject}</h5>
                  <div className="tw-space-y-3 tw-max-h-[500px] tw-overflow-y-auto">
                    {currentExamData.topicData[selectedSubject]?.filter(t => t.topic !== null).map((topic, idx) => {
                      // score and avg are already percentages (0-100)
                      const scorePercentage = topic.score;
                      const avgPercentage = topic.avg;
                      const difference = scorePercentage - avgPercentage;
                      
                      return (
                        <div key={idx} className="tw-bg-white tw-border tw-border-gray-100 tw-rounded-lg tw-p-3 hover:tw-shadow-sm tw-cursor-pointer tw-transition-all">
                          <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                            <span className="tw-font-medium tw-flex-1">{topic.topic}</span>
                            <span className={`${getTopicColorForScore(scorePercentage)} tw-font-bold tw-ml-2`}>
                              {scorePercentage.toFixed(1)}%
                            </span>
                          </div>
                          
                          <ProgressBar 
                            now={scorePercentage} 
                            variant={getTopicProgressColor(scorePercentage)} 
                            className="tw-h-2 tw-my-2" 
                          />
                          
                          <div className="tw-space-y-1">
                            <div className="tw-flex tw-justify-between tw-items-center tw-text-xs tw-text-gray-600">
                              <span>Rata-rata kelas:</span>
                              <span className="tw-font-medium">{avgPercentage.toFixed(1)}%</span>
                            </div>
                            
                            <div className="tw-flex tw-justify-between tw-items-center tw-text-xs">
                              <span className="tw-text-gray-600">Selisih:</span>
                              <span className={`tw-font-medium ${difference >= 0 ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                                {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
                              </span>
                            </div>
                            
                            <div className="tw-flex tw-justify-between tw-items-center tw-text-xs tw-text-gray-600 tw-pt-1 tw-border-t tw-border-gray-100 tw-mt-2">
                              <span>Progress latihan:</span>
                              <span className="tw-font-medium">{topic.completed}/{topic.total} soal</span>
                            </div>
                          </div>
                          
                          {/* Performance indicator */}
                          <div className="tw-mt-2 tw-pt-2 tw-border-t tw-border-gray-100">
                            {scorePercentage >= 85 ? (
                              <div className="tw-flex tw-items-center tw-gap-1 tw-text-xs tw-text-green-600">
                                <svg className="tw-w-4 tw-h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="tw-font-medium">Penguasaan Sangat Baik</span>
                              </div>
                            ) : scorePercentage >= 70 ? (
                              <div className="tw-flex tw-items-center tw-gap-1 tw-text-xs tw-text-blue-600">
                                <svg className="tw-w-4 tw-h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="tw-font-medium">Penguasaan Baik</span>
                              </div>
                            ) : scorePercentage >= 60 ? (
                              <div className="tw-flex tw-items-center tw-gap-1 tw-text-xs tw-text-yellow-600">
                                <svg className="tw-w-4 tw-h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="tw-font-medium">Perlu Perbaikan</span>
                              </div>
                            ) : (
                              <div className="tw-flex tw-items-center tw-gap-1 tw-text-xs tw-text-red-600">
                                <svg className="tw-w-4 tw-h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="tw-font-medium">Butuh Latihan Intensif</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }) || (
                      <div className="tw-text-center tw-py-4">
                        <div className="tw-text-gray-500">Tidak ada data topik tersedia</div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <Card className="tw-border-0 tw-shadow-sm">
                <Card.Body>
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                    <h5 className="tw-font-bold tw-mb-0">Rekomendasi Latihan {selectedSubject}</h5>
                    <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                      AI-Powered
                    </div>
                  </div>
                  
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                    {currentExamData.topicData[selectedSubject] && currentExamData.topicData[selectedSubject].filter(t => t.topic !== null).length > 0 ? (
                      currentExamData.topicData[selectedSubject]
                        .filter(t => t.topic !== null)
                        .sort((a, b) => a.score - b.score) // Sort by lowest percentage first
                        .slice(0, 3)
                        .map((topic, idx) => {
                          const scorePercentage = topic.score;
                          const avgPercentage = topic.avg;
                          const difference = scorePercentage - avgPercentage;
                          
                          return (
                            <div key={idx} className="tw-bg-white tw-border tw-border-gray-100 tw-rounded-lg tw-p-4 tw-shadow-sm hover:tw-shadow-md tw-transition-all">
                              <div className="tw-flex tw-items-start tw-gap-2 tw-mb-3">
                                <div className="tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-red-50 tw-h-8 tw-w-8 tw-flex-shrink-0 tw-mt-0.5">
                                  <Target size={16} className="tw-text-red-500" />
                                </div>
                                <span className="tw-font-medium tw-flex-1">{topic.topic}</span>
                              </div>
                              
                              <div className="tw-mb-3">
                                <div className="tw-flex tw-justify-between tw-mb-1">
                                  <span className="tw-text-gray-500 tw-text-sm">Persentase benar</span>
                                  <span className={`tw-font-bold ${getTopicColorForScore(scorePercentage)}`}>
                                    {scorePercentage.toFixed(1)}%
                                  </span>
                                </div>
                                <ProgressBar 
                                  now={scorePercentage} 
                                  variant={getTopicProgressColor(scorePercentage)} 
                                  className="tw-h-2" 
                                />
                              </div>
                              
                              <div className="tw-space-y-2 tw-mb-3">
                                <div className="tw-text-sm tw-text-gray-600 tw-flex tw-justify-between">
                                  <span>Rata-rata kelas:</span>
                                  <span className="tw-font-medium">{avgPercentage.toFixed(1)}%</span>
                                </div>
                                <div className="tw-text-sm tw-flex tw-justify-between">
                                  <span className="tw-text-gray-600">Selisih:</span>
                                  <span className={`tw-font-medium ${difference >= 0 ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                                    {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="tw-text-sm tw-text-gray-600 tw-flex tw-justify-between">
                                  <span>Latihan diselesaikan:</span>
                                  <span className="tw-font-medium">{topic.completed}/{topic.total}</span>
                                </div>
                              </div>
                              
                              {/* Recommendation reason */}
                              <div className="tw-bg-orange-50 tw-rounded tw-p-2 tw-mb-3">
                                <p className="tw-text-xs tw-text-orange-800">
                                  {scorePercentage < 60 ? (
                                    <><strong>Prioritas Tinggi:</strong> Perlu latihan intensif untuk meningkatkan pemahaman dasar</>
                                  ) : scorePercentage < avgPercentage ? (
                                    <><strong>Di Bawah Rata-rata:</strong> Latihan tambahan akan membantu mengejar ketinggalan</>
                                  ) : (
                                    <><strong>Perlu Peningkatan:</strong> Topik ini masih bisa ditingkatkan untuk hasil maksimal</>
                                  )}
                                </p>
                              </div>
                              
                              <Button variant="purple" size="sm" className="tw-bg-purple-600 tw-border-0 tw-w-full">
                                Latih Sekarang
                              </Button>
                            </div>
                          );
                        })
                    ) : (
                      <div className="tw-col-span-3 tw-text-center tw-py-8">
                        <div className="tw-text-gray-500">Tidak ada data topik untuk {selectedSubject}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional info box */}
                  {currentExamData.topicData[selectedSubject] && 
                   currentExamData.topicData[selectedSubject].filter(t => t.topic !== null).length > 0 && (
                    <div className="tw-mt-4 tw-bg-purple-50 tw-rounded-lg tw-p-4">
                      <div className="tw-flex tw-items-start tw-gap-2">
                        <svg className="tw-w-5 tw-h-5 tw-text-purple-600 tw-flex-shrink-0 tw-mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div>
                          <p className="tw-text-sm tw-font-medium tw-text-purple-800 tw-mb-1">
                            Tips Belajar Efektif
                          </p>
                          <p className="tw-text-xs tw-text-purple-700">
                            Fokuskan waktu belajar pada topik dengan persentase terendah. 
                            Setiap peningkatan 10% pada topik lemah akan memberikan dampak besar pada nilai keseluruhan.
                            Jangan lupa untuk tetap mengulang topik yang sudah dikuasai agar tidak lupa!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Row>
          <Col className="tw-text-center tw-py-5">
            <div className="tw-text-purple-600 tw-mb-3">
              <Activity size={64} className="tw-mx-auto" />
            </div>
            <h5 className="tw-font-bold">Pilih mata pelajaran untuk melihat analisis topik</h5>
            <p className="tw-text-gray-600">Klik salah satu mata pelajaran di atas untuk melihat detail topik dan rekomendasinya</p>
          </Col>
        </Row>
      )}
    </>
  );
};

export default TopicAnalysis;