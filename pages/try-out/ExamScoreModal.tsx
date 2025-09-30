// components/modals/ExamScoreModal.tsx - Updated with Templates
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner, Table } from 'react-bootstrap';
import {
  Trophy, CheckCircle, BookOpen, Clock
} from 'lucide-react';
import { LearningModal } from '../../components/modal/ModalTemplate';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface ExamScore {
  exam_name: string;
  score: number;
  total_correct: number;
  total_questions: number;
  completion_time: string;
}

interface ScoreResult {
  total_score: number;
  average_score: number;
  total_correct: number;
  total_questions: number;
  exam_scores: ExamScore[];
  is_need_weighted_score: boolean;
}

interface ExamScoreModalProps {
  show: boolean;
  onClose: () => void;
  scheduleId: number | null;
  scheduleName?: string;
}

export default function ExamScoreModal({
  show,
  onClose,
  scheduleId,
  scheduleName
}: ExamScoreModalProps) {
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!show || !scheduleId) return;

    const fetchScores = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) throw new Error('Not authenticated');

        const response = await axios.get(
          `${apiUrl}/exam-schedules/${scheduleId}/scores`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        
        setScoreResult(response.data);
      } catch (err: any) {
        console.error('Error fetching scores:', err);
        setError(err.response?.data?.message || 'Gagal memuat hasil ujian');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [show, scheduleId]);

  const bottomButtons = [
    {
      action: 'close' as const,
      text: 'Tutup',
      onClick: onClose
    }
  ];

  return (
    <LearningModal
      show={show}
      onHide={onClose}
      title="Hasil Try Out Anda"
      subtitle={scheduleName || 'Try Out'}
      size="xl"
      icon={<Trophy className="tw-w-5 tw-h-5" />}
      bottomButtons={bottomButtons}
    >
      {loading ? (
        <div className="tw-text-center tw-py-12">
          <Spinner animation="border" className="tw-text-purple-600 tw-w-16 tw-h-16" />
          <p className="tw-mt-4 tw-text-purple-600 tw-font-medium">Memuat hasil ujian...</p>
        </div>
      ) : error ? (
        <div className="tw-text-center tw-py-12">
          <div className="tw-w-24 tw-h-24 tw-bg-red-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
            <CheckCircle className="tw-w-12 tw-h-12 tw-text-red-600" />
          </div>
          <h4 className="tw-text-xl tw-font-semibold tw-text-red-800 tw-mb-2">Gagal Memuat Data</h4>
          <p className="tw-text-red-600 tw-mb-4">{error}</p>
        </div>
      ) : scoreResult ? (
        <>
          {/* Summary Cards */}
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-mb-6">
            <div className="tw-bg-gradient-to-br tw-from-purple-100 tw-to-purple-200 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-purple-300">
              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                <CheckCircle className="tw-w-8 tw-h-8 tw-text-purple-600" />
                <div>
                  <p className="tw-text-sm tw-text-purple-700 tw-mb-0">Skor Total</p>
                  <p className="tw-text-3xl tw-font-bold tw-text-purple-900 tw-mb-0">
                    {scoreResult.total_score}
                  </p>
                </div>
              </div>
              <p className="tw-text-xs tw-text-purple-600 tw-mb-0">
                {scoreResult.is_need_weighted_score ? 'Skor Tertimbang' : 'Skor Standar'}
              </p>
            </div>

            <div className="tw-bg-gradient-to-br tw-from-blue-100 tw-to-blue-200 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-blue-300">
              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                <Clock className="tw-w-8 tw-h-8 tw-text-blue-600" />
                <div>
                  <p className="tw-text-sm tw-text-blue-700 tw-mb-0">Rata-rata</p>
                  <p className="tw-text-3xl tw-font-bold tw-text-blue-900 tw-mb-0">
                    {scoreResult.average_score.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="tw-text-xs tw-text-blue-600 tw-mb-0">Per Ujian</p>
            </div>

            <div className="tw-bg-gradient-to-br tw-from-green-100 tw-to-green-200 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-green-300">
              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                <CheckCircle className="tw-w-8 tw-h-8 tw-text-green-600" />
                <div>
                  <p className="tw-text-sm tw-text-green-700 tw-mb-0">Benar</p>
                  <p className="tw-text-3xl tw-font-bold tw-text-green-900 tw-mb-0">
                    {scoreResult.total_correct}/{scoreResult.total_questions}
                  </p>
                </div>
              </div>
              <p className="tw-text-xs tw-text-green-600 tw-mb-0">
                {((scoreResult.total_correct / scoreResult.total_questions) * 100).toFixed(1)}% Akurasi
              </p>
            </div>
          </div>

          {/* Detail Scores Table */}
          <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
            <div className="tw-bg-gradient-to-r tw-from-violet-600 tw-to-purple-600 tw-px-6 tw-py-4">
              <h5 className="tw-text-white tw-font-bold tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <BookOpen className="tw-w-5 tw-h-5" />
                Detail Skor Per Ujian
              </h5>
            </div>
            <div className="tw-overflow-x-auto">
              <Table className="tw-mb-0" striped bordered hover>
                <thead className="tw-bg-gray-100">
                  <tr>
                    <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-700">No</th>
                    <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-700">Nama Ujian</th>
                    <th className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-font-semibold tw-text-gray-700">Skor</th>
                    <th className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-font-semibold tw-text-gray-700">Benar</th>
                    <th className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-font-semibold tw-text-gray-700">Total Soal</th>
                    <th className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-font-semibold tw-text-gray-700">Akurasi</th>
                    <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-700">Waktu Selesai</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreResult.exam_scores.map((exam, index) => {
                    const accuracy = (exam.total_correct / exam.total_questions) * 100;
                    return (
                      <tr key={index} className="tw-hover:bg-violet-50 tw-transition-colors">
                        <td className="tw-px-4 tw-py-3 tw-text-sm">{index + 1}</td>
                        <td className="tw-px-4 tw-py-3 tw-text-sm tw-font-medium tw-text-gray-900">
                          {exam.exam_name}
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-center">
                          <span className="tw-inline-block tw-px-3 tw-py-1 tw-bg-purple-100 tw-text-purple-800 tw-rounded-full tw-font-bold tw-text-sm">
                            {exam.score}
                          </span>
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-text-green-600 tw-font-semibold">
                          {exam.total_correct}
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-text-gray-700">
                          {exam.total_questions}
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-center">
                          <span className={`tw-inline-block tw-px-3 tw-py-1 tw-rounded-full tw-font-semibold tw-text-xs ${
                            accuracy >= 80 ? 'tw-bg-green-100 tw-text-green-800' :
                            accuracy >= 60 ? 'tw-bg-yellow-100 tw-text-yellow-800' :
                            'tw-bg-red-100 tw-text-red-800'
                          }`}>
                            {accuracy.toFixed(1)}%
                          </span>
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-600">
                          {new Date(exam.completion_time).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        </>
      ) : (
        <div className="tw-text-center tw-py-12">
          <p className="tw-text-gray-600">Tidak ada data hasil ujian</p>
        </div>
      )}
    </LearningModal>
  );
}