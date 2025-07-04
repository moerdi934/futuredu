'use client';

import React from 'react';
import { Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip } from 'recharts';
import { Target, Activity } from 'lucide-react';

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

interface ExamData {
  radarData: RadarData[];
  topicData: { [key: string]: TopicData[] };
}

type ExamType = 'SNBT' | 'SIMAK' | 'Quiz' | 'CPNS';

interface TopicAnalysisProps {
  examType: ExamType;
  currentExamData: ExamData;
  selectedSubject: string | null;
  setSelectedSubject: (subject: string | null) => void;
  getTopicData: (subject: string) => TopicData[];
  getColorForScore: (score: number) => string;
  getProgressColor: (score: number) => string;
}

// Legend component for chart
const Legend: React.FC = () => {
  return (
    <div className="tw-flex tw-justify-center tw-mt-4">
      <div className="tw-flex tw-items-center tw-mr-4">
        <div className="tw-w-3 tw-h-3 tw-rounded-full tw-bg-purple-500 tw-mr-1"></div>
        <span className="tw-text-xs tw-text-gray-600">Nilai Kamu</span>
      </div>
      <div className="tw-flex tw-items-center">
        <div className="tw-w-3 tw-h-3 tw-rounded-full tw-bg-green-500 tw-mr-1"></div>
        <span className="tw-text-xs tw-text-gray-600">Rata-rata</span>
      </div>
    </div>
  );
};

const TopicAnalysis: React.FC<TopicAnalysisProps> = ({ 
  examType, 
  currentExamData, 
  selectedSubject, 
  setSelectedSubject,
  getTopicData,
  getColorForScore,
  getProgressColor
}) => {
  return (
    <>
      <Row className="tw-mb-4">
        <Col>
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4">Pilih Mata Pelajaran untuk Analisis Topik</h5>
              <div className="tw-flex tw-flex-wrap tw-gap-3">
                {currentExamData.radarData.map(subject => (
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
                        {currentExamData.topicData[selectedSubject]?.length || 0} topik
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart outerRadius={130} data={currentExamData.topicData[selectedSubject] || []}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="topic" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Nilai Kamu" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Rata-rata" dataKey="avg" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="tw-border-0 tw-shadow-sm">
                <Card.Body>
                  <h5 className="tw-font-bold tw-mb-4">Detail Topik {selectedSubject}</h5>
                  <div className="tw-space-y-3">
                    {currentExamData.topicData[selectedSubject]?.map((topic, idx) => (
                      <div key={idx} className="tw-bg-white tw-border tw-border-gray-100 tw-rounded-lg tw-p-3 hover:tw-shadow-sm tw-cursor-pointer tw-transition-all">
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-font-medium">{topic.topic}</span>
                          <span className={getColorForScore(topic.score)}>{topic.score}/100</span>
                        </div>
                        <ProgressBar 
                          now={topic.score} 
                          variant={getProgressColor(topic.score)} 
                          className="tw-h-2 tw-my-2" 
                        />
                        <div className="tw-flex tw-justify-between tw-items-center tw-text-xs tw-text-gray-500">
                          <span>Rata-rata: {topic.avg}</span>
                          <span>{((topic.score - topic.avg) >= 0 ? '+' : '')}{(topic.score - topic.avg).toFixed(1)} poin dari rata-rata</span>
                        </div>
                        <div className="tw-flex tw-justify-between tw-items-center tw-text-xs tw-text-gray-500 tw-mt-1">
                          <span>Progress:</span>
                          <span>{topic.completed}/{topic.total} latihan diselesaikan</span>
                        </div>
                      </div>
                    ))}
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
                    {currentExamData.topicData[selectedSubject]?.sort((a, b) => a.score - b.score).slice(0, 3).map((topic, idx) => (
                      <div key={idx} className="tw-bg-white tw-border tw-border-gray-100 tw-rounded-lg tw-p-4 tw-shadow-sm hover:tw-shadow-md tw-transition-all">
                        <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                          <div className="tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-red-50 tw-h-8 tw-w-8">
                            <Target size={16} className="tw-text-red-500" />
                          </div>
                          <span className="tw-font-medium">{topic.topic}</span>
                        </div>
                        <div className="tw-mb-2">
                          <div className="tw-flex tw-justify-between tw-mb-1">
                            <span className="tw-text-gray-500 tw-text-sm">Skor kamu</span>
                            <span className="tw-font-bold">{topic.score}/100</span>
                          </div>
                          <ProgressBar now={topic.score} variant={getProgressColor(topic.score)} className="tw-h-2" />
                        </div>
                        <div className="tw-text-sm tw-text-gray-600 tw-mb-3">
                          {topic.score < topic.avg 
                            ? `${(topic.avg - topic.score).toFixed(1)} poin di bawah rata-rata` 
                            : `${(topic.score - topic.avg).toFixed(1)} poin di atas rata-rata`}
                        </div>
                        <Button variant="purple" size="sm" className="tw-bg-purple-600 tw-border-0 tw-w-full">
                          Latih Sekarang
                        </Button>
                      </div>
                    ))}
                  </div>
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