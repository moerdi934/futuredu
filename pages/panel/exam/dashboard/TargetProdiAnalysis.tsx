// pages/panel/exam/dashboard/TargetProdiAnalysis.tsx

import React from 'react';
import { Card, Row, Col, Badge, ProgressBar, Alert } from 'react-bootstrap';
import { Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface TargetProdiAnalysisData {
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

interface Props {
  data: TargetProdiAnalysisData[];
}

const TargetProdiAnalysisComponent: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="tw-mb-4 tw-shadow-lg tw-border-0">
        <Card.Body className="tw-p-6">
          <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
            <Target className="tw-text-primary" size={24} />
            <h5 className="tw-mb-0 tw-font-bold">Analisis Target Prodi</h5>
          </div>
          <Alert variant="info" className="tw-mb-0">
            <Info className="tw-inline tw-mr-2" size={16} />
            Belum ada target prodi yang ditentukan. Silakan set target di menu <strong>Target Seleksi</strong>.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aman':
        return (
          <Badge bg="success" className="tw-text-sm">
            <CheckCircle size={14} className="tw-inline tw-mr-1" />
            Aman
          </Badge>
        );
      case 'Perlu Ditingkatkan':
        return (
          <Badge bg="warning" className="tw-text-sm">
            <TrendingUp size={14} className="tw-inline tw-mr-1" />
            Perlu Ditingkatkan
          </Badge>
        );
      case 'Tidak Aman':
        return (
          <Badge bg="danger" className="tw-text-sm">
            <AlertCircle size={14} className="tw-inline tw-mr-1" />
            Tidak Aman
          </Badge>
        );
      case 'No Historical Data':
        return (
          <Badge bg="secondary" className="tw-text-sm">
            <Info size={14} className="tw-inline tw-mr-1" />
            Data Belum Tersedia
          </Badge>
        );
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aman': return 'success';
      case 'Perlu Ditingkatkan': return 'warning';
      case 'Tidak Aman': return 'danger';
      default: return 'secondary';
    }
  };

  const calculateSafetyPercentage = (item: TargetProdiAnalysisData): number => {
    if (!item.has_historical_data || item.status === 'No Historical Data') return 0;
    
    // Calculate based on rank position and score relative to minimum
    const rankPercentage = item.safe_zone_rank 
      ? Math.min((item.safe_zone_rank / item.user_rank) * 50, 50)
      : 0;
    
    const scorePercentage = item.min_score_reference 
      ? Math.min((item.user_score / item.min_score_reference) * 50, 50)
      : 0;
    
    return Math.round(rankPercentage + scorePercentage);
  };

  return (
    <Card className="tw-mb-4 tw-shadow-lg tw-border-0">
      <Card.Body className="tw-p-6">
        <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <div className="tw-flex tw-items-center tw-gap-3">
            <Target className="tw-text-primary" size={24} />
            <div>
              <h5 className="tw-mb-0 tw-font-bold">Analisis Target Prodi</h5>
              <small className="tw-text-muted">Berdasarkan data historis UTBK tahun sebelumnya</small>
            </div>
          </div>
          <Badge bg="info" className="tw-text-sm">
            {data.length} Target
          </Badge>
        </div>

        <Row className="g-3">
          {data.map((item, index) => {
            const safetyPercentage = calculateSafetyPercentage(item);
            const statusColor = getStatusColor(item.status);
            const borderClass = `tw-border-${statusColor} tw-border-2`;

            return (
              <Col key={index} xs={12}>
                <Card className={borderClass}>
                  <Card.Body className="tw-p-4">
                    {/* Header */}
                    <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                      <div className="tw-flex-1">
                        <h6 className="tw-mb-1 tw-font-bold tw-text-lg">{item.nama_prodi}</h6>
                        <p className="tw-text-muted tw-mb-2 tw-text-sm">{item.nama_ptn}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Status Message */}
                    <Alert variant={statusColor} className="tw-mb-3 tw-py-2 tw-px-3 tw-text-sm">
                      {item.status_message}
                    </Alert>

                    {/* Metrics Grid */}
                    {item.has_historical_data && (
                      <>
                        <Row className="tw-mb-3">
                          <Col xs={6} md={3} className="tw-mb-2">
                            <div className="tw-text-center tw-p-2 tw-bg-light tw-rounded">
                              <div className="tw-text-xs tw-text-muted">Score Kamu</div>
                              <div className="tw-font-bold tw-text-primary tw-text-lg">{item.user_score}</div>
                            </div>
                          </Col>
                          <Col xs={6} md={3} className="tw-mb-2">
                            <div className="tw-text-center tw-p-2 tw-bg-light tw-rounded">
                              <div className="tw-text-xs tw-text-muted">Rank Kamu</div>
                              <div className="tw-font-bold tw-text-info tw-text-lg">#{item.user_rank}</div>
                            </div>
                          </Col>
                          <Col xs={6} md={3} className="tw-mb-2">
                            <div className="tw-text-center tw-p-2 tw-bg-light tw-rounded">
                              <div className="tw-text-xs tw-text-muted">Min Score</div>
                              <div className="tw-font-bold tw-text-warning tw-text-lg">
                                {item.min_score_reference || 'N/A'}
                              </div>
                            </div>
                          </Col>
                          <Col xs={6} md={3} className="tw-mb-2">
                            <div className="tw-text-center tw-p-2 tw-bg-light tw-rounded">
                              <div className="tw-text-xs tw-text-muted">Safe Zone</div>
                              <div className="tw-font-bold tw-text-success tw-text-lg">
                                #{item.safe_zone_rank || 'N/A'}
                              </div>
                            </div>
                          </Col>
                        </Row>

                        {/* Additional Info */}
                        <Row className="tw-mb-3 tw-text-sm">
                          <Col xs={6}>
                            <div className="tw-flex tw-items-center tw-gap-2">
                              <span className="tw-text-muted">Peminat (2025):</span>
                              <strong>{item.peminat?.toLocaleString() || 'N/A'}</strong>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="tw-flex tw-items-center tw-gap-2">
                              <span className="tw-text-muted">Daya Tampung:</span>
                              <strong>{item.daya_tampung?.toLocaleString() || 'N/A'}</strong>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="tw-flex tw-items-center tw-gap-2">
                              <span className="tw-text-muted">Kompetisi:</span>
                              <strong>{item.competition_ratio ? `${item.competition_ratio}:1` : 'N/A'}</strong>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="tw-flex tw-items-center tw-gap-2">
                              <span className="tw-text-muted">Avg Score (2024):</span>
                              <strong>{item.average_score_reference || 'N/A'}</strong>
                            </div>
                          </Col>
                        </Row>

                        {/* Safety Progress Bar */}
                        <div className="tw-mb-2">
                          <div className="tw-flex tw-justify-between tw-text-xs tw-mb-1">
                            <span className="tw-text-muted">Tingkat Keamanan</span>
                            <span className="tw-font-bold">{safetyPercentage}%</span>
                          </div>
                          <ProgressBar 
                            now={safetyPercentage} 
                            variant={statusColor}
                            className="tw-h-2"
                          />
                        </div>

                        {/* Gap Analysis */}
                        {item.score_gap_to_minimum !== null && item.score_gap_to_minimum > 0 && (
                          <div className="tw-bg-danger-subtle tw-p-2 tw-rounded tw-text-sm">
                            <TrendingDown size={14} className="tw-inline tw-mr-1 tw-text-danger" />
                            <strong>Gap ke Minimum:</strong> {item.score_gap_to_minimum} poin
                          </div>
                        )}
                        {item.score_gap_to_average !== null && item.score_gap_to_average < 0 && (
                          <div className="tw-bg-success-subtle tw-p-2 tw-rounded tw-text-sm tw-mt-2">
                            <TrendingUp size={14} className="tw-inline tw-mr-1 tw-text-success" />
                            <strong>Di atas Average:</strong> {Math.abs(item.score_gap_to_average)} poin
                          </div>
                        )}
                      </>
                    )}

                    {/* No Historical Data */}
                    {!item.has_historical_data && (
                      <div className="tw-text-center tw-text-muted tw-py-3">
                        <Info size={32} className="tw-mb-2" />
                        <p className="tw-mb-0 tw-text-sm">Data historis belum tersedia untuk prodi ini.</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Legend/Info Box */}
        <Card className="tw-mt-3 tw-bg-light tw-border-0">
          <Card.Body className="tw-p-3">
            <h6 className="tw-text-sm tw-font-bold tw-mb-2">📊 Penjelasan:</h6>
            <ul className="tw-mb-0 tw-text-xs tw-list-disc tw-pl-4">
              <li><strong>Safe Zone:</strong> Rank dalam 25% dari daya tampung (asumsi: 25% dari bimbel, 75% dari luar)</li>
              <li><strong>Min Score:</strong> Score minimum yang diterima tahun lalu (2024)</li>
              <li><strong>Status Aman:</strong> Rank ≤ Safe Zone DAN Score ≥ Min Score</li>
              <li><strong>Status Perlu Ditingkatkan:</strong> Score ≥ Min Score tapi Rank  Safe Zone</li>
              <li><strong>Status Tidak Aman:</strong> Score  Min Score (berapapun ranknya)</li>
            </ul>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
};

export default TargetProdiAnalysisComponent;
