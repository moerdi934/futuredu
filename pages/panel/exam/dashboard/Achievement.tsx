'use client';

import React from 'react';
import { Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Trophy } from 'lucide-react';

// Type definitions
interface Achievement {
  title: string;
  description: string;
  progress: number;
  completed: boolean;
}

interface ExamData {
  achievements: Achievement[];
}

type ExamType = 'SNBT' | 'SIMAK' | 'Quiz' | 'CPNS';

interface AchievementProps {
  examType: ExamType;
  currentExamData: ExamData;
}

interface LeaderboardUser {
  name: string;
  achievements: number;
  rank: number;
  isYou?: boolean;
}

interface IconProps {
  className?: string;
  size?: number;
}

// Custom Lock component for incomplete achievements
const Lock: React.FC<IconProps> = ({ className, size = 24 }) => {
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
};

const Achievement: React.FC<AchievementProps> = ({ examType, currentExamData }) => {
  // Colors for the pie chart
  const COLORS = ['#8884d8', '#e0e0e0'];

  // Calculate completed achievements count
  const completedAchievementsCount = currentExamData.achievements.filter(a => a.completed).length;
  const totalAchievementsCount = currentExamData.achievements.length;

  // Create leaderboard data
  const leaderboardData: LeaderboardUser[] = [
    { name: 'Alex', achievements: 15, rank: 1 },
    { name: 'Budi', achievements: 12, rank: 2 },
    { name: 'Citra', achievements: 10, rank: 3 },
    { name: 'Kamu', achievements: completedAchievementsCount, rank: 4, isYou: true }
  ];

  // Pie chart data
  const pieChartData = [
    { name: 'Completed', value: completedAchievementsCount },
    { name: 'Ongoing', value: totalAchievementsCount - completedAchievementsCount }
  ];

  return (
    <>
      <Row className="tw-mb-4">
        <Col md={8}>
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0">Achievements & Badges</h5>
                <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                  {completedAchievementsCount}/{totalAchievementsCount} Achievements
                </div>
              </div>
              
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                {currentExamData.achievements.map((achievement, idx) => (
                  <div key={idx} className={`tw-border tw-border-gray-100 tw-rounded-lg tw-p-4 tw-shadow-sm 
                    ${achievement.completed ? 'tw-bg-yellow-50' : 'tw-bg-white'}`}>
                    <div className="tw-flex tw-gap-3">
                      <div className={`tw-rounded-full tw-h-12 tw-w-12 tw-flex tw-items-center tw-justify-center 
                        ${achievement.completed ? 'tw-bg-yellow-500' : 'tw-bg-gray-200'}`}>
                        {achievement.completed ? (
                          <Trophy className="tw-text-white" size={24} />
                        ) : (
                          <Lock className="tw-text-gray-500" size={24} />
                        )}
                      </div>
                      <div className="tw-flex-1">
                        <div className="tw-flex tw-justify-between">
                          <span className="tw-font-medium">{achievement.title}</span>
                          {achievement.completed && (
                            <span className="tw-bg-yellow-200 tw-text-yellow-800 tw-px-2 tw-py-0.5 tw-rounded-full tw-text-xs">
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="tw-text-sm tw-text-gray-600 tw-mb-2">{achievement.description}</div>
                        <ProgressBar 
                          now={achievement.progress} 
                          variant={achievement.completed ? "warning" : "secondary"} 
                          className="tw-h-2" 
                        />
                        <div className="tw-text-xs tw-text-right tw-mt-1 tw-text-gray-500">
                          {achievement.progress}% complete
                        </div>
                      </div>
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
              <h5 className="tw-font-bold tw-mb-4">Progress Summary</h5>
              <div className="tw-bg-purple-50 tw-rounded-xl tw-p-4 tw-text-center tw-mb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <h6 className="tw-font-medium tw-mb-3">Achievement Leaderboard</h6>
              <div className="tw-space-y-2">
                {leaderboardData.map((user, idx) => (
                  <div key={idx} className={`tw-flex tw-items-center tw-justify-between tw-p-2 tw-rounded-lg ${user.isYou ? 'tw-bg-purple-100' : 'tw-bg-gray-50'}`}>
                    <div className="tw-flex tw-items-center">
                      <div className={`tw-w-6 tw-h-6 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-2 ${
                        user.rank === 1 ? 'tw-bg-yellow-500 tw-text-white' : 
                        user.rank === 2 ? 'tw-bg-gray-400 tw-text-white' : 
                        user.rank === 3 ? 'tw-bg-orange-500 tw-text-white' : 
                        'tw-bg-purple-200 tw-text-purple-700'
                      }`}>
                        {user.rank}
                      </div>
                      <span className={`${user.isYou ? 'tw-font-medium tw-text-purple-700' : ''}`}>
                        {user.name} {user.isYou && '(Kamu)'}
                      </span>
                    </div>
                    <div className="tw-flex tw-items-center">
                      <Trophy size={14} className={`tw-mr-1 ${user.rank <= 3 ? 'tw-text-yellow-500' : 'tw-text-gray-500'}`} />
                      <span>{user.achievements}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="purple" className="tw-bg-purple-600 tw-border-0 tw-w-full tw-mt-4">
                Lihat Full Leaderboard
              </Button>
            </Card.Body>
          </Card>
          
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4">Achievement Terbaru</h5>
              {completedAchievementsCount > 0 ? (
                <div className="tw-space-y-3">
                  {currentExamData.achievements.filter(a => a.completed).map((achievement, idx) => (
                    <div key={idx} className="tw-flex tw-gap-3 tw-items-center tw-p-3 tw-bg-yellow-50 tw-rounded-lg">
                      <div className="tw-rounded-full tw-bg-yellow-500 tw-p-2">
                        <Trophy className="tw-text-white" size={20} />
                      </div>
                      <div>
                        <div className="tw-font-medium">{achievement.title}</div>
                        <div className="tw-text-xs tw-text-gray-600">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tw-text-center tw-py-5">
                  <Trophy size={36} className="tw-mx-auto tw-text-gray-400 tw-mb-2" />
                  <p className="tw-text-gray-600">Belum ada achievement yang selesai</p>
                  <p className="tw-text-sm tw-text-gray-500">Selesaikan tantangan untuk mendapatkan achievement!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Achievement;