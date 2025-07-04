'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Modal,
  Form,
  Row,
  Col,
  Card,
  Accordion,
  AccordionContext,
} from 'react-bootstrap';
import {
  Plus,
  BookOpen,
  FileText,
  Check,
  X,
  Bookmark,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import SuperEditor from '../../../../../components/supereditor/SuperEditor'
import { useAuth } from '../../../../../context/AuthContext';
import {
  SearchSingleField,
  SelectCustomField,
} from '../../../../../components/layout/FormComponentLayout';
import CreateBulkModal from './CreateBulkModal';

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const questionTypeOptions = [
  { label: 'Single Choice', value: 'single-choice' },
  { label: 'Multiple Choice', value: 'multiple-choice' },
  { label: 'True/False', value: 'true-false' },
  { label: 'Number', value: 'number' },
  { label: 'Text', value: 'text' },
];

const levelOptions = [
  { label: '1 - Core', value: 1 },
  { label: '2 - Intermediate', value: 2 },
  { label: '3 - Advanced', value: 3 },
  { label: '4 - Pro', value: 4 },
  { label: '5 - Expert', value: 5 },
];

const initialQuestionData = {
  bidang: null,
  topik: null,
  subTopik: null,
  bidangOptions: [],
  topikOptions: [],
  subTopikOptions: [],
  isLoadingBidang: false,
  isLoadingTopik: false,
  isLoadingSubTopik: false,
  level: null,
  hasPassage: false,
  createNewPassage: false,
  passage: null,
  passageSearchResults: [],
  isLoadingPassage: false,
  passageSearchTerm: '',
  newPassageTitle: '',
  newPassageContent: '',
  showPassageModal: false,
  questionType: 'single-choice',
  options: [''],
  correctAnswer: [] as number[],
  statements: [''],
  answer: '',
  questionText: '',
  hasExplanation: false,
  explanationContent: '',
  bidangSearchTerm: '',
  topikSearchTerm: '',
  subTopikSearchTerm: '',
};

const BulkQuestionItem: React.FC<{
  index: number;
  data: any;
  onChange: (index: number, data: any) => void;
  onRemove: (index: number) => void;
}> = ({ index, data, onChange, onRemove }) => {
  const { id } = useAuth();
  const userId = id || null;
  const dataRef = useRef(data);
  
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const debouncedSetBidangSearch = useCallback(
    debounce((val: string) => {
      const current = dataRef.current;
      onChange(index, { ...current, bidangSearchTerm: val });
    }, 300),
    [index, onChange]
  );
  
  const debouncedSetTopikSearch = useCallback(
    debounce((val: string) => {
      const current = dataRef.current;
      onChange(index, { ...current, topikSearchTerm: val });
    }, 300),
    [index, onChange]
  );
  
  const debouncedSetSubTopikSearch = useCallback(
    debounce((val: string) => {
      const current = dataRef.current;
      onChange(index, { ...current, subTopikSearchTerm: val });
    }, 300),
    [index, onChange]
  );
  
  const debouncedSetPassageSearch = useCallback(
    debounce((val: string) => {
      const current = dataRef.current;
      onChange(index, { ...current, passageSearchTerm: val });
    }, 500),
    [index, onChange]
  );

  useEffect(() => {
    const fetchBidang = async (searchTerm: string = '') => {
      const curr = dataRef.current;
      onChange(index, { ...curr, isLoadingBidang: true });
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=1`
        );
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            code: exam.code,
          }));
          const curr2 = dataRef.current;
          onChange(index, {
            ...curr2,
            bidangOptions: formattedOptions,
            isLoadingBidang: false,
          });
        } else {
          const curr2 = dataRef.current;
          onChange(index, { ...curr2, bidangOptions: [], isLoadingBidang: false });
        }
      } catch {
        const curr2 = dataRef.current;
        onChange(index, { ...curr2, bidangOptions: [], isLoadingBidang: false });
      }
    };

    fetchBidang(dataRef.current.bidangSearchTerm);
  }, [dataRef.current.bidangSearchTerm]);

  useEffect(() => {
    if (!dataRef.current.bidang) {
      const curr = dataRef.current;
      onChange(index, {
        ...curr,
        topikOptions: [],
        topik: null,
        subTopikOptions: [],
        subTopik: null,
      });
      return;
    }

    const fetchTopik = async (searchTerm: string = '') => {
      const curr = dataRef.current;
      onChange(index, { ...curr, isLoadingTopik: true });
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=2&masterId=${dataRef.current.bidang.value}`
        );
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            code: exam.code,
          }));
          const curr2 = dataRef.current;
          onChange(index, {
            ...curr2,
            topikOptions: formattedOptions,
            isLoadingTopik: false,
          });
        } else {
          const curr2 = dataRef.current;
          onChange(index, { ...curr2, topikOptions: [], isLoadingTopik: false });
        }
      } catch {
        const curr2 = dataRef.current;
        onChange(index, { ...curr2, topikOptions: [], isLoadingTopik: false });
      }
    };

    fetchTopik(dataRef.current.topikSearchTerm);
  }, [dataRef.current.bidang, dataRef.current.topikSearchTerm]);

  useEffect(() => {
    if (!dataRef.current.topik) {
      const curr = dataRef.current;
      onChange(index, {
        ...curr,
        subTopikOptions: [],
        subTopik: null,
      });
      return;
    }

    const fetchSubTopik = async (searchTerm: string = '') => {
      const curr = dataRef.current;
      onChange(index, { ...curr, isLoadingSubTopik: true });
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=3&masterId=${dataRef.current.topik.value}`
        );
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            NextID: exam.NextID,
            code: exam.code,
          }));
          const curr2 = dataRef.current;
          onChange(index, {
            ...curr2,
            subTopikOptions: formattedOptions,
            isLoadingSubTopik: false,
          });
        } else {
          const curr2 = dataRef.current;
          onChange(index, { ...curr2, subTopikOptions: [], isLoadingSubTopik: false });
        }
      } catch {
        const curr2 = dataRef.current;
        onChange(index, { ...curr2, subTopikOptions: [], isLoadingSubTopik: false });
      }
    };

    fetchSubTopik(dataRef.current.subTopikSearchTerm);
  }, [dataRef.current.topik, dataRef.current.subTopikSearchTerm]);

  useEffect(() => {
    if (!dataRef.current.hasPassage) {
      const curr = dataRef.current;
      onChange(index, {
        ...curr,
        passageSearchResults: [],
        passage: null,
      });
      return;
    }

    const fetchPassages = async (searchTerm: string = '') => {
      const curr = dataRef.current;
      onChange(index, { ...curr, isLoadingPassage: true });
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/questions/passage/search?search=${searchTerm}`
        );
        if (response.data && Array.isArray(response.data)) {
          const curr2 = dataRef.current;
          onChange(index, {
            ...curr2,
            passageSearchResults: response.data,
            isLoadingPassage: false,
          });
        } else {
          const curr2 = dataRef.current;
          onChange(index, { ...curr2, passageSearchResults: [], isLoadingPassage: false });
        }
      } catch {
        const curr2 = dataRef.current;
        onChange(index, { ...curr2, passageSearchResults: [], isLoadingPassage: false });
      }
    };

    fetchPassages(dataRef.current.passageSearchTerm);
  }, [dataRef.current.hasPassage, dataRef.current.passageSearchTerm]);

  const createPassage = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/passage`,
        {
          title: dataRef.current.newPassageTitle,
          passage: dataRef.current.newPassageContent,
          create_user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      const curr = dataRef.current;
      onChange(index, {
        ...curr,
        passage: {
          id: response.data.id,
          title: curr.newPassageTitle,
          passage: curr.newPassageContent,
        },
        showPassageModal: false,
        createNewPassage: false,
      });
    } catch {
      // Handle error if needed
    }
  };

  const context = useContext(AccordionContext);
  const isCurrentEventKey = context?.activeEventKey === String(index);

  return (
    <Accordion.Item eventKey={String(index)}>
      <Accordion.Header className="tw-flex tw-justify-between tw-items-center">
        <div className="tw-flex tw-items-center tw-space-x-2">
          {isCurrentEventKey ? (
            <ChevronUp className="tw-w-4 tw-h-4 tw-text-purple-600" />
          ) : (
            <ChevronDown className="tw-w-4 tw-h-4 tw-text-purple-600" />
          )}
          <span className="tw-font-semibold tw-text-lg tw-text-purple-700">
            Pertanyaan {index + 1}
          </span>
        </div>
        <Trash2
          className="tw-w-5 tw-h-5 tw-text-red-500 tw-cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
        />
      </Accordion.Header>
      <Accordion.Body className="tw-bg-gray-50 tw-p-4 tw-rounded-b-lg">
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-4 tw-mb-6">
          <div className="tw-space-y-2">
            <SearchSingleField
              label="Bidang"
              value={data.bidang}
              options={data.bidangOptions}
              onChange={(newValue) => {
                const updated = {
                  ...data,
                  bidang: newValue,
                  topik: null,
                  subTopik: null,
                  topikOptions: [],
                  subTopikOptions: [],
                  topikSearchTerm: '',
                  subTopikSearchTerm: '',
                };
                onChange(index, updated);
              }}
              onInputChange={(val: string) => debouncedSetBidangSearch(val)}
              isLoading={data.isLoadingBidang}
              required
            />
          </div>
          {data.bidang && (
            <div className="tw-space-y-2">
              <SearchSingleField
                label="Topik"
                value={data.topik}
                options={data.topikOptions}
                onChange={(newValue) => {
                  const updated = {
                    ...data,
                    topik: newValue,
                    subTopik: null,
                    subTopikOptions: [],
                    subTopikSearchTerm: '',
                  };
                  onChange(index, updated);
                }}
                onInputChange={(val: string) => debouncedSetTopikSearch(val)}
                isLoading={data.isLoadingTopik}
                required
              />
            </div>
          )}
          {data.topik && (
            <div className="tw-space-y-2">
              <SearchSingleField
                label="Sub Topik"
                value={
                  data.subTopik
                    ? { label: data.subTopik.label, value: data.subTopik.value }
                    : null
                }
                options={data.subTopikOptions.map((opt: any) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
                onChange={(newValue) => {
                  const selected = data.subTopikOptions.find(
                    (p: any) => p.value === newValue?.value
                  );
                  const updated = {
                    ...data,
                    subTopik: selected || null,
                  };
                  onChange(index, updated);
                }}
                onInputChange={(val: string) => debouncedSetSubTopikSearch(val)}
                isLoading={data.isLoadingSubTopik}
                required
              />
            </div>
          )}
        </div>
        <div className="tw-mb-6">
          <SelectCustomField
            label="Level"
            value={
              data.level !== null
                ? levelOptions.find((opt) => opt.value === data.level) || null
                : null
            }
            options={levelOptions}
            onChange={(newValue) => {
              const updated = { ...data, level: newValue ? newValue.value : null };
              onChange(index, updated);
            }}
            required
          />
        </div>
        <div className="tw-mb-6">
          <Form.Group>
            <div className="tw-flex tw-items-center tw-space-x-3 tw-mb-3">
              <Form.Check
                type="checkbox"
                id={`has-passage-${index}`}
                label={
                  <span className="tw-text-purple-700 tw-font-semibold">Ada Bacaan</span>
                }
                checked={data.hasPassage}
                onChange={(e) => {
                  const updated = {
                    ...data,
                    hasPassage: e.target.checked,
                    passage: e.target.checked ? data.passage : null,
                    passageSearchResults: e.target.checked
                      ? data.passageSearchResults
                      : [],
                    passageSearchTerm: '',
                  };
                  onChange(index, updated);
                }}
              />
              <Bookmark className="tw-w-4 tw-h-4 tw-text-purple-600" />
            </div>
            {data.hasPassage && (
              <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-4 tw-shadow-sm tw-mt-2">
                <div className="tw-flex tw-space-x-4 tw-mb-4">
                  <Button
                    className="tw-flex-1 tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-border-0 tw-text-white hover:tw-from-purple-700 hover:tw-to-indigo-700"
                    onClick={() => {
                      const updated = { ...data, createNewPassage: false };
                      onChange(index, updated);
                    }}
                  >
                    Pilih Bacaan
                  </Button>
                  <Button
                    className="tw-flex-1 tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-border-0 tw-text-white hover:tw-from-purple-700 hover:tw-to-indigo-700"
                    onClick={() => {
                      const updated = {
                        ...data,
                        createNewPassage: true,
                        showPassageModal: true,
                      };
                      onChange(index, updated);
                    }}
                  >
                    Buat Baru
                  </Button>
                </div>
                {!data.createNewPassage ? (
                  <div className="tw-space-y-3">
                    <SearchSingleField
                      label="Cari Bacaan"
                      value={
                        data.passage
                          ? { label: data.passage.title, value: data.passage.id }
                          : null
                      }
                      options={data.passageSearchResults.map((p: any) => ({
                        label: p.title,
                        value: p.id,
                      }))}
                      onChange={(newValue) => {
                        const selected = data.passageSearchResults.find(
                          (p: any) => p.id === newValue.value
                        );
                        const updated = { ...data, passage: selected || null };
                        onChange(index, updated);
                      }}
                      onInputChange={(val: string) => debouncedSetPassageSearch(val)}
                      isLoading={data.isLoadingPassage}
                      required
                    />
                    {data.passage && (
                      <div className="tw-mt-4">
                        <div className="tw-text-purple-700 tw-font-medium tw-mb-2">
                          Isi Bacaan:
                        </div>
                        <div
                          className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-border tw-border-gray-200 tw-prose tw-max-w-none"
                          dangerouslySetInnerHTML={{ __html: data.passage.passage }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <Modal
                    show={data.showPassageModal}
                    onHide={() => {
                      const updated = {
                        ...data,
                        showPassageModal: false,
                        createNewPassage: false,
                      };
                      onChange(index, updated);
                    }}
                    size="lg"
                    centered
                    backdrop="static"
                    className="tw-font-sans"
                  >
                    <div className="tw-bg-white tw-rounded-lg tw-shadow-2xl tw-border-0 tw-overflow-hidden">
                      <Modal.Header className="tw-bg-purple-600 tw-text-white tw-border-0 tw-py-4">
                        <div className="tw-flex tw-items-center tw-space-x-3">
                          <BookOpen className="tw-w-6 tw-h-6" />
                          <Modal.Title className="tw-text-xl tw-font-bold">
                            Buat Bacaan Baru
                          </Modal.Title>
                        </div>
                        <Button
                          variant="light"
                          className="tw-bg-white/20 tw-border-white/30 tw-text-white hover:tw-bg-white/30"
                          onClick={() => {
                            const updated = {
                              ...data,
                              showPassageModal: false,
                              createNewPassage: false,
                            };
                            onChange(index, updated);
                          }}
                        >
                          <X className="tw-w-4 tw-h-4" />
                        </Button>
                      </Modal.Header>
                      <Modal.Body className="tw-p-6 tw-max-h-[70vh] tw-overflow-y-auto">
                        <Form.Group className="tw-mb-3">
                          <Form.Label className="tw-text-purple-700 tw-font-medium">
                            Judul Bacaan <span className="tw-text-red-500">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={data.newPassageTitle}
                            onChange={(e) => {
                              const updated = {
                                ...data,
                                newPassageTitle: e.target.value,
                              };
                              onChange(index, updated);
                            }}
                            placeholder="Masukkan judul bacaan"
                            className="tw-border-purple-200 tw-rounded-lg"
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label className="tw-text-purple-700 tw-font-medium">
                            Isi Bacaan <span className="tw-text-red-500">*</span>
                          </Form.Label>
                          <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm">
                            <SuperEditor
                              onChange={(html) => {
                                const updated = { ...data, newPassageContent: html };
                                onChange(index, updated);
                              }}
                              initialValue="<p>Mulai mengetik bacaan di sini...</p>"
                            />
                          </div>
                        </Form.Group>
                      </Modal.Body>
                      <Modal.Footer className="tw-bg-gray-50 tw-border-0 tw-p-6">
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-space-y-2 sm:tw-space-y-0 sm:tw-space-x-3 tw-w-full">
                          <Button
                            variant="outline-secondary"
                            onClick={() => {
                              const updated = {
                                ...data,
                                showPassageModal: false,
                                createNewPassage: false,
                              };
                              onChange(index, updated);
                            }}
                            className="tw-flex-1 tw-border-2 tw-border-gray-300 tw-text-gray-600 hover:tw-bg-gray-100 tw-rounded-lg"
                          >
                            <X className="tw-w-4 tw-h-4 tw-me-1" />
                            <span>Batal</span>
                          </Button>
                          <Button
                            onClick={createPassage}
                            className="tw-flex-1 tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-border-0 tw-text-white hover:tw-from-purple-700 hover:tw-to-indigo-700 tw-shadow-lg"
                          >
                            {data.newPassageTitle && data.newPassageContent ? (
                              <>
                                <Check className="tw-w-4 tw-h-4 tw-me-1" />
                                <span>Simpan Bacaan</span>
                              </>
                            ) : (
                              <span>Isi Judul & Konten</span>
                            )}
                          </Button>
                        </div>
                      </Modal.Footer>
                    </div>
                  </Modal>
                )}
              </div>
            )}
          </Form.Group>
        </div>

        <div className="tw-mb-6">
          <SelectCustomField
            label="Tipe Soal"
            value={
              questionTypeOptions.find((opt) => opt.value === data.questionType) ||
              questionTypeOptions[0]
            }
            options={questionTypeOptions}
            onChange={(newValue) => {
              const updated = {
                ...data,
                questionType: newValue?.value.toString() || 'single-choice',
                options: [''],
                correctAnswer: [],
                statements: [''],
                answer: '',
              };
              onChange(index, updated);
            }}
            required
          />
        </div>

        <div className="tw-mb-6">
          <Form.Group>
            <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-space-x-2">
              <BookOpen className="tw-w-4 tw-h-4" />
              <span>
                Teks Soal <span className="tw-text-red-500">*</span>
              </span>
            </Form.Label>
            <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm">
              <SuperEditor
                onChange={(html) => {
                  const updated = { ...data, questionText: html };
                  onChange(index, updated);
                }}
                initialValue="<p>Mulai mengetik soal di sini...</p>"
              />
            </div>
          </Form.Group>
        </div>

        {(data.questionType === 'single-choice' ||
          data.questionType === 'multiple-choice') && (
          <div className="tw-mb-6">
            <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-space-x-2">
              <div className="tw-bg-purple-100 tw-p-1 tw-rounded">
                <Check className="tw-w-4 tw-h-4 tw-text-purple-600" />
              </div>
              <span>Opsi Jawaban</span>
            </Form.Label>
            <Row className="tw-g-4">
              {data.options.map((option: string, idx: number) => (
                <Col xs={12} md={6} key={idx} className="tw-mb-4">
                  <Card className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-duration-200">
                    <Card.Body className="tw-p-4">
                      <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
                        <div className="tw-flex tw-items-center tw-space-x-2">
                          <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-text-white tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm">
                            {optionLabels[idx]}
                          </div>
                          <span className="tw-text-purple-700 tw-font-medium">
                            Opsi {optionLabels[idx]}
                          </span>
                        </div>
                        <Button
                          variant={
                            Array.isArray(data.correctAnswer) &&
                            data.correctAnswer.includes(idx)
                              ? 'success'
                              : 'outline-secondary'
                          }
                          size="sm"
                          onClick={() => {
                            let updatedCorrect;
                            if (data.questionType === 'single-choice') {
                              updatedCorrect = [idx];
                            } else {
                              if (
                                Array.isArray(data.correctAnswer) &&
                                data.correctAnswer.includes(idx)
                              ) {
                                updatedCorrect = (data.correctAnswer as number[]).filter(
                                  (ans) => ans !== idx
                                );
                              } else {
                                updatedCorrect = [...(data.correctAnswer as number[]), idx];
                              }
                            }
                            const updated = { ...data, correctAnswer: updatedCorrect };
                            onChange(index, updated);
                          }}
                          className={`tw-rounded-lg tw-font-medium tw-transition-all tw-duration-200 ${
                            Array.isArray(data.correctAnswer) &&
                            data.correctAnswer.includes(idx)
                              ? 'tw-bg-green-500 tw-border-green-500 hover:tw-bg-green-600'
                              : 'tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50'
                          }`}
                        >
                          {Array.isArray(data.correctAnswer) &&
                          data.correctAnswer.includes(idx) ? (
                            <>
                              <Check className="tw-w-4 tw-h-4 tw-me-1" />Benar
                            </>
                          ) : (
                            'Tandai Benar'
                          )}
                        </Button>
                      </div>
                      <div className="tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200">
                        <SuperEditor
                          onChange={(html) => {
                            const newOptions = [...data.options];
                            newOptions[idx] = html;
                            const updated = { ...data, options: newOptions };
                            onChange(index, updated);
                          }}
                          initialValue="<p>Masukkan teks opsi...</p>"
                          height="80px"
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <Button
              variant="outline-primary"
              onClick={() => {
                const updated = { ...data, options: [...data.options, ''] };
                onChange(index, updated);
              }}
              className="tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-space-x-2"
              disabled={data.options.length >= optionLabels.length}
            >
              <Plus className="tw-w-4 tw-h-4" />
              <span>Tambah Opsi</span>
            </Button>
          </div>
        )}

        {data.questionType === 'multiple-choice' && (
          <div className="tw-mb-6">
            <Form.Label className="tw-text-sm tw-text-gray-500">
              Pilih minimal satu jawaban benar.
            </Form.Label>
          </div>
        )}

        {data.questionType === 'true-false' && (
          <div className="tw-mb-6">
            <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-space-x-2">
              <BookOpen className="tw-w-4 tw-h-4" />
              <span>Pernyataan</span>
            </Form.Label>
            <div className="tw-space-y-4">
              {data.statements.map((statement: string, idx: number) => (
                <div
                  key={idx}
                  className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-4 tw-shadow-sm"
                >
                  <Row className="tw-items-center">
                    <Col xs={12} md={8} className="tw-mb-3 md:tw-mb-0">
                      <Form.Control
                        type="text"
                        value={statement}
                        onChange={(e) => {
                          const newStatements = [...data.statements];
                          newStatements[idx] = e.target.value;
                          const updated = { ...data, statements: newStatements };
                          onChange(index, updated);
                        }}
                        placeholder={`Pernyataan ${idx + 1}`}
                        className="tw-border-purple-200 tw-rounded-lg tw-px-4 tw-py-2 tw-text-base"
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <div className="tw-flex tw-space-x-2">
                        <Button
                          variant={
                            Array.isArray(data.correctAnswer) &&
                            (data.correctAnswer as boolean[])[idx] === true
                              ? 'success'
                              : 'outline-secondary'
                          }
                          size="sm"
                          onClick={() => {
                            const newCorrect = [...(data.correctAnswer as boolean[])];
                            newCorrect[idx] = true;
                            const updated = { ...data, correctAnswer: newCorrect };
                            onChange(index, updated);
                          }}
                          className={`tw-flex-1 tw-rounded-lg tw-font-medium ${
                            Array.isArray(data.correctAnswer) &&
                            (data.correctAnswer as boolean[])[idx] === true
                              ? 'tw-bg-green-500 tw-border-green-500'
                              : 'tw-border-purple-300 tw-text-purple-600'
                          }`}
                        >
                          Benar
                        </Button>
                        <Button
                          variant={
                            Array.isArray(data.correctAnswer) &&
                            (data.correctAnswer as boolean[])[idx] === false
                              ? 'success'
                              : 'outline-secondary'
                          }
                          size="sm"
                          onClick={() => {
                            const newCorrect = [...(data.correctAnswer as boolean[])];
                            newCorrect[idx] = false;
                            const updated = { ...data, correctAnswer: newCorrect };
                            onChange(index, updated);
                          }}
                          className={`tw-flex-1 tw-rounded-lg tw-font-medium ${
                            Array.isArray(data.correctAnswer) &&
                            (data.correctAnswer as boolean[])[idx] === false
                              ? 'tw-bg-green-500 tw-border-green-500'
                              : 'tw-border-purple-300 tw-text-purple-600'
                          }`}
                        >
                          Salah
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
            <Button
              variant="outline-secondary"
              onClick={() => {
                const updated = {
                  ...data,
                  statements: [...data.statements, ''],
                  correctAnswer: [...(data.correctAnswer as boolean[]), false],
                };
                onChange(index, updated);
              }}
              className="tw-mt-4 tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-space-x-2"
            >
              <Plus className="tw-w-4 tw-h-4" />
              <span>Tambah Pernyataan</span>
            </Button>
          </div>
        )}

        {(data.questionType === 'number' || data.questionType === 'text') && (
          <div className="tw-mb-6">
            <Form.Group>
              <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-space-x-2">
                <Check className="tw-w-4 tw-h-4" />
                <span>Jawaban Benar</span>
              </Form.Label>
              <Form.Control
                type={data.questionType === 'number' ? 'number' : 'text'}
                value={data.answer}
                onChange={(e) => {
                  const updated = { ...data, answer: e.target.value };
                  onChange(index, updated);
                }}
                placeholder={
                  data.questionType === 'number'
                    ? 'Masukkan angka'
                    : 'Masukkan jawaban teks'
                }
                className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-px-4 tw-py-3 tw-text-lg focus:tw-border-purple-500 focus:tw-ring-2 focus:tw:ring-purple-200"
              />
            </Form.Group>
          </div>
        )}

        <div className="tw-mb-6">
          <Form.Group>
            <div className="tw-flex tw-items-center tw-space-x-3 tw-mb-3">
              <Form.Check
                type="checkbox"
                id={`has-explanation-${index}`}
                label={
                  <span className="tw-text-purple-700 tw-font-semibold">
                    Ada Pembahasan
                  </span>
                }
                checked={data.hasExplanation}
                onChange={(e) => {
                  const updated = { ...data, hasExplanation: e.target.checked };
                  onChange(index, updated);
                }}
              />
              <FileText className="tw-w-4 tw-h-4 tw-text-purple-600" />
            </div>
            {data.hasExplanation && (
              <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm tw-mt-2">
                <Form.Group>
                  <Form.Label className="tw-text-purple-700 tw-font-medium">
                    Isi Pembahasan <span className="tw-text-red-500">*</span>
                  </Form.Label>
                  <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2">
                    <SuperEditor
                      onChange={(html) => {
                        const updated = { ...data, explanationContent: html };
                        onChange(index, updated);
                      }}
                      initialValue="<p>Mulai mengetik pembahasan di sini...</p>"
                    />
                  </div>
                </Form.Group>
              </div>
            )}
          </Form.Group>
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );
};

const CreateQuestionBulk: React.FC = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([{ ...initialQuestionData }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [autoExport, setAutoExport] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { ...initialQuestionData }]);
  };

  const updateQuestion = (idx: number, data: any) => {
    const updated = [...questions];
    updated[idx] = data;
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
  };

  const downloadCSV = (data: any[]) => {
    if (data.length === 0) return;
    
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `${today}_${data.length}_questions.csv`;
    
    const headers = ['id', 'code', 'question_type', 'level'];
    const rows = data.map(q => [q.id, q.code, q.question_type, q.level]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n' 
      + rows.map(row => row.join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const prepared = questions.map((q) => {
      let updatedCorrectAnswer: string[] | number[] | undefined;
      
      if (q.questionType === 'true-false') {
        updatedCorrectAnswer = (q.correctAnswer as boolean[]).map((ans) => 
          ans ? 'true' : 'false'
        );
      } else if (q.questionType === 'number' || q.questionType === 'text') {
        updatedCorrectAnswer = [q.answer];
      } else if (q.questionType === 'single-choice' || q.questionType === 'multiple-choice') {
        updatedCorrectAnswer = (q.correctAnswer as number[])
          .map((index) => optionLabels[index])
          .sort();
      }

      return {
        exam_type_id: q.subTopik?.value || '',
        id_subtopik: q.subTopik?.value || '',
        question_text: q.questionText,
        question_type: q.questionType,
        options: 
          q.questionType === 'single-choice' || q.questionType === 'multiple-choice'
            ? q.options 
            : undefined,
        correct_answer: updatedCorrectAnswer,
        statements: q.questionType === 'true-false' ? q.statements : undefined,
        create_user_id: null,
        explanation: q.hasExplanation ? q.explanationContent : null,
        passage_id: q.hasPassage ? q.passage?.id || null : null,
        passage: q.hasPassage ? q.passage?.passage || null : null,
        level: q.level,
      };
    });

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/bulk`,
        { questions: prepared },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      
      setSuccessData(response.data);
      setShowSuccessModal(true);
      
      if (autoExport) {
        downloadCSV(response.data);
      }
    } catch (error) {
      console.error('Error creating questions:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setQuestions([{ ...initialQuestionData }]);
    setShowSuccessModal(false);
  };

  return (
    <div className="tw-p-6 tw-bg-gray-100 tw-min-h-screen">
      <div className="tw-max-w-screen-lg tw-mx-auto tw-bg-white tw-rounded-lg tw-shadow-lg tw-overflow-hidden">
        <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-py-4 tw-px-6 tw-flex tw-justify-between tw-items-center">
          <div className="tw-flex tw-items-center tw-space-x-3">
            <BookOpen className="tw-w-6 tw-h-6" />
            <h2 className="tw-text-xl tw-font-bold">Buat Banyak Soal</h2>
          </div>
          <Button
            variant="light"
            className="tw-bg-white/20 tw-border-white/30 tw-text-white hover:tw-bg-white/30 tw-rounded-lg tw-px-4 tw-py-2"
            onClick={() => router.back()}
          >
            <X className="tw-w-4 tw-h-4 tw-me-1" />
            <span>Kembali</span>
          </Button>
        </div>
        <div className="tw-p-6">
          <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
            <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700">
              Daftar Pertanyaan
            </h3>
          </div>
          
          <div className="tw-flex tw-items-center tw-mb-4">
            <Form.Check 
              type="switch"
              id="auto-export-switch"
              label="Auto-export saat submit"
              checked={autoExport}
              onChange={(e) => setAutoExport(e.target.checked)}
              className="tw-mr-2"
            />
            <Download className="tw-w-4 tw-h-4 tw-text-purple-600" />
          </div>
          
          <Accordion defaultActiveKey="0">
            {questions.map((q, idx) => (
              <BulkQuestionItem
                key={idx}
                index={idx}
                data={q}
                onChange={(i, d) => updateQuestion(i, d)}
                onRemove={(i) => removeQuestion(i)}
              />
            ))}
          </Accordion>
          
          <div className="tw-flex tw-justify-end tw-items-center tw-space-x-3 tw-mt-6">
            <Button
              variant="outline-primary"
              onClick={addQuestion}
              className="tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-space-x-2"
            >
              <Plus className="tw-w-4 tw-h-4" />
              <span>Tambah Pertanyaan</span>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-border-0 tw-text-white hover:tw-from-purple-700 hover:tw-to-indigo-700 tw-font-medium tw-rounded-lg tw-px-6 tw-py-3 tw-flex tw-items-center tw-space-x-2 tw-shadow-lg"
            >
              {isSubmitting ? (
                <span>Mengirim...</span>
              ) : (
                <>
                  <Check className="tw-w-5 tw-h-5" />
                  <span className="tw-text-base">Kirim Semua</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <CreateBulkModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        data={successData}
        autoExported={autoExport}
        onReset={handleReset}
        onExport={() => downloadCSV(successData)}
        onNavigate={() => router.push('/questions')}
      />
    </div>
  );
};

export default CreateQuestionBulk;