// pages/panel/exam/dashboard/Achievement.tsx
'use client';

import React from 'react';
import { Row, Col, Card, ProgressBar, Badge } from 'react-bootstrap';
import { Award, Trophy, Star, Target, Zap, TrendingUp } from 'lucide-react';

// Type definitions
interface Achievement {
  title: string;
  description: string;
  progress: number;
  completed: boolean;
}

interface ExamData {
  achievements?: Achievement[];
}

type ExamType = 'SNBT' | 'SNBT Exam' | 'SIMAK' | 'Quiz' | 'CPNS';

interface AchievementProps {
  examType: ExamType;
  currentExamData?: ExamData;
  maxScore: number;
  metrics: string;
}

interface AchievementCategory {
  title: string;
  icon: React.ReactNode;
  color: string;
  achievements: Achievement[];
}

const Achievement: React.FC<AchievementProps> = ({ 
  examType, 
  currentExamData,
  maxScore,
  metrics 
}) => {
  if (!currentExamData || !currentExamData.achievements) {
    return (
      <Row className="tw-mb-4">
        <Col>
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <div className="tw-text-center tw-py-20">
                <div className="tw-text-gray-500">Loading achievements data...</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  // Categorize achievements
  const categorizeAchievements = (): AchievementCategory[] => {
    const categories: AchievementCategory[] = [
      {
        title: 'Pencapaian Akademik',
        icon: <Trophy className="tw-text-yellow-500" size={24} />,
        color: 'tw-bg-yellow-50',
        achievements: []
      },
      {
        title: 'Konsistensi Belajar',
        icon: <Target className="tw-text-blue-500" size={24} />,
        color: 'tw-bg-blue-50',
        achievements: []
      },
      {
        title: 'Peningkatan Skor',
        icon: <TrendingUp className="tw-text-green-500" size={24} />,
        color: 'tw-bg-green-50',
        achievements: []
      }
    ];

    currentExamData.achievements.forEach(achievement => {
      if (achievement.title.toLowerCase().includes('master') || 
          achievement.title.toLowerCase().includes('ready')) {
        categories[0].achievements.push(achievement);
      } else if (achievement.title.toLowerCase().includes('konsisten') || 
                 achievement.title.toLowerCase().includes('berturut')) {
        categories[1].achievements.push(achievement);
      } else {
        categories[2].achievements.push(achievement);
      }
    });

    return categories;
  };

  const achievementCategories = categorizeAchievements();
  const completedCount = currentExamData.achievements.filter(a => a.completed).length;
  const totalCount = currentExamData.achievements.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  return (
    <>
      {/* Achievement Summary */}
      <Row className="tw-mb-4">
        <Col md={12}>
          <Card className="tw-border-0 tw-shadow-sm tw-bg-gradient-to-r tw-from-purple-500 tw-to-purple-700">
            <Card.Body className="tw-text-white">
              <Row className="tw-align-items-center">
                <Col md={8}>
                  <div className="tw-flex tw-items-center tw-mb-3">
                    <Award size={40} className="tw-mr-3" />
                    <div>
                      <h4 className="tw-font-bold tw-mb-1">Pencapaian {examType}</h4>
                      <p className="tw-mb-0 tw-opacity-90">
                        Kamu telah menyelesaikan {completedCount} dari {totalCount} pencapaian
                      </p>
                    </div>
                  </div>
                  <ProgressBar 
                    now={completionPercentage} 
                    className="tw-h-3"
                    style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  />
                  <div className="tw-text-sm tw-mt-2 tw-opacity-90">
                    {completionPercentage.toFixed(0)}% Complete
                  </div>
                </Col>
                <Col md={4} className="tw-text-center">
                  <div className="tw-bg-white tw-bg-opacity-20 tw-rounded-lg tw-p-4">
                    <div className="tw-text-5xl tw-font-bold">{completedCount}</div>
                    <div className="tw-text-sm tw-opacity-90">Achievements Unlocked</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Achievement Categories */}
      {achievementCategories.map((category, catIdx) => (
        category.achievements.length > 0 && (
          <Row key={catIdx} className="tw-mb-4">
            <Col md={12}>
              <Card className="tw-border-0 tw-shadow-sm">
                <Card.Body>
                  <div className="tw-flex tw-items-center tw-mb-4">
                    <div className={`tw-rounded-full tw-p-2 tw-mr-3 ${category.color}`}>
                      {category.icon}
                    </div>
                    <h5 className="tw-font-bold tw-mb-0">{category.title}</h5>
                  </div>
                  <Row>
                    {category.achievements.map((achievement, idx) => (
                      <Col md={6} key={idx} className="tw-mb-3">
                        <Card className={`tw-border ${achievement.completed ? 'tw-border-green-300 tw-bg-green-50' : 'tw-border-gray-200'} tw-h-full`}>
                          <Card.Body>
                            <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                              <div className="tw-flex-1">
                                <h6 className="tw-font-bold tw-mb-1">
                                  {achievement.title}
                                  {achievement.completed && (
                                    <Badge bg="success" className="tw-ml-2">
                                      <Star size={12} className="tw-inline tw-mb-1" /> Completed
                                    </Badge>
                                  )}
                                </h6>
                                <p className="tw-text-sm tw-text-gray-600 tw-mb-0">
                                  {achievement.description}
                                </p>
                              </div>
                              {achievement.completed && (
                                <div className="tw-ml-2">
                                  <div className="tw-bg-green-500 tw-rounded-full tw-p-2">
                                    <Zap size={20} className="tw-text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="tw-flex tw-justify-between tw-text-sm tw-mb-1">
                                <span className="tw-text-gray-600">Progress</span>
                                <span className="tw-font-medium">{achievement.progress}%</span>
                              </div>
                              <ProgressBar 
                                now={achievement.progress} 
                                variant={achievement.completed ? 'success' : 'primary'}
                                className="tw-h-2"
                              />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )
      ))}

      {/* Upcoming Achievements */}
      <Row>
        <Col md={12}>
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4">Pencapaian Selanjutnya</h5>
              <div className="tw-space-y-3">
                {currentExamData.achievements
                  .filter(a => !a.completed)
                  .slice(0, 3)
                  .map((achievement, idx) => (
                    <div key={idx} className="tw-border-l-4 tw-border-purple-500 tw-pl-4 tw-py-2 tw-bg-purple-50 tw-rounded-r-lg">
                      <div className="tw-font-medium tw-mb-1">{achievement.title}</div>
                      <div className="tw-text-sm tw-text-gray-600 tw-mb-2">{achievement.description}</div>
                      <div className="tw-flex tw-items-center">
                        <ProgressBar 
                          now={achievement.progress} 
                          className="tw-flex-1 tw-h-2 tw-mr-2"
                          variant="purple"
                        />
                        <span className="tw-text-sm tw-font-medium tw-text-purple-600">
                          {achievement.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                {currentExamData.achievements.filter(a => !a.completed).length === 0 && (
                  <div className="tw-text-center tw-py-8">
                    <Trophy size={48} className="tw-text-green-500 tw-mx-auto tw-mb-3" />
                    <h6 className="tw-font-bold">Selamat!</h6>
                    <p className="tw-text-gray-600">Kamu telah menyelesaikan semua pencapaian!</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Achievement;