//GoLiveModal.tsx - Updated with free exam logic
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FaTimes, FaRocket, FaTag, FaDollarSign, FaCalendarAlt, FaSave, FaLayerGroup, FaGift } from 'react-icons/fa';

interface ExamScheduleGoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  examScheduleData: {
    id: number;
    name: string;
    description: string;
    creator_name?: string;
    exam_type?: string;
    isfree?: boolean; // Added isfree property
  } | null;
}

interface ProductType {
  id: number;
  value: number;
  label: string;
  description: string;
  series: string;
  group_product: string;
}

interface GoLiveFormData {
  product_type_id: number;
  price: number;
  stock: number;
  features: string[];
  classtype: string;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  effective_start: string;
  effective_end?: string;
}

const ExamScheduleGoLiveModal: React.FC<ExamScheduleGoLiveModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  examScheduleData 
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [productTypeSearch, setProductTypeSearch] = useState('');
  const [formData, setFormData] = useState<GoLiveFormData>({
    product_type_id: 0,
    price: 0,
    stock: 999999,
    features: [],
    classtype: 'online',
    is_promo: false,
    no_promo_price: undefined,
    promo_description: '',
    effective_start: new Date().toISOString().slice(0, 16),
    effective_end: ''
  });
  const [featureInput, setFeatureInput] = useState('');

  // Check if exam is free
  const isFreeExam = examScheduleData?.isfree === true;

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen && examScheduleData) {
      setFormData(prev => ({
        ...prev,
        // Auto-set price to 0 if exam is free
        price: isFreeExam ? 0 : prev.price,
        is_promo: false, // Reset promo for free exams
        no_promo_price: undefined,
        promo_description: '',
        effective_start: new Date().toISOString().slice(0, 16)
      }));
      loadProductTypes();
    }
  }, [isOpen, examScheduleData, isFreeExam]);

  // Load product types
  const loadProductTypes = async (search: string = '') => {
    setLoadingProductTypes(true);
    try {
      const response = await fetch(`/api/product-types?search=${encodeURIComponent(search)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProductTypes(result.data || []);
      } else {
        console.error('Failed to load product types');
        setProductTypes([]);
      }
    } catch (error) {
      console.error('Error loading product types:', error);
      setProductTypes([]);
    } finally {
      setLoadingProductTypes(false);
    }
  };

  // Handle product type search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (productTypeSearch !== '') {
        loadProductTypes(productTypeSearch);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productTypeSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examScheduleData) return;

    // Validation
    if (!formData.product_type_id) {
      alert('Product type harus dipilih');
      return;
    }
    
    // Skip price validation for free exams
    if (!isFreeExam) {
      if (formData.price <= 0) {
        alert('Harga harus lebih dari 0');
        return;
      }
      if (formData.is_promo && (!formData.no_promo_price || formData.no_promo_price <= formData.price)) {
        alert('Harga sebelum promo harus lebih tinggi dari harga promo');
        return;
      }
    }

    setLoading(true);

    try {
      // Ensure price is 0 for free exams
      const submitData = {
        ...formData,
        price: isFreeExam ? 0 : formData.price,
        is_promo: isFreeExam ? false : formData.is_promo,
        no_promo_price: isFreeExam ? undefined : formData.no_promo_price,
        promo_description: isFreeExam ? undefined : formData.promo_description
      };

      const response = await fetch(`/api/exam-schedules/go-live/${examScheduleData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok) {
        const examType = isFreeExam ? 'gratis' : 'berbayar';
        alert(`Jadwal ujian ${examType} "${examScheduleData.name}" berhasil go-live!`);
        onSave();
        onClose();
      } else {
        alert('Error: ' + (result.message || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error('Go live error:', error);
      alert('Terjadi kesalahan saat melakukan go-live');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const classtypeOptions = [
    { value: 'online', label: 'Online' },
    { value: '12', label: 'Kelas 12' },
    { value: '11', label: 'Kelas 11' },
    { value: '10', label: 'Kelas 10' },
    { value: 'utbk', label: 'UTBK' },
    { value: 'sbmptn', label: 'SBMPTN' },
    { value: 'cpns', label: 'CPNS' },
    { value: 'toefl', label: 'TOEFL' },
    { value: 'ielts', label: 'IELTS' }
  ];

  if (!examScheduleData) return null;

  const selectedProductType = productTypes.find(pt => pt.id === formData.product_type_id);

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header className={`tw-bg-gradient-to-r ${isFreeExam ? 'tw-from-emerald-500 tw-to-green-600' : 'tw-from-blue-500 tw-to-indigo-600'} tw-text-white`}>
        <Modal.Title className="tw-flex tw-items-center tw-gap-3">
          <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
            {isFreeExam ? <FaGift className="tw-w-4 tw-h-4" /> : <FaRocket className="tw-w-4 tw-h-4" />}
          </div>
          Go Live {isFreeExam ? 'Free' : 'Paid'} Exam Schedule
        </Modal.Title>
        <button
          onClick={onClose}
          className="tw-text-white hover:tw-text-gray-200 tw-transition-colors tw-border-0 tw-bg-transparent tw-text-2xl tw-leading-none"
          disabled={loading}
        >
          <FaTimes />
        </button>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body className="tw-max-h-96 tw-overflow-y-auto">
          <div className="tw-space-y-6">
            {/* Exam Schedule Info with Free Status */}
            <div className={`tw-bg-gradient-to-r ${isFreeExam ? 'tw-from-emerald-50 tw-to-green-50 tw-border-emerald-200' : 'tw-from-blue-50 tw-to-indigo-50 tw-border-blue-200'} tw-rounded-lg tw-p-4 tw-border`}>
              <h5 className={`tw-font-bold tw-mb-2 tw-flex tw-items-center tw-gap-2 ${isFreeExam ? 'tw-text-emerald-900' : 'tw-text-blue-900'}`}>
                {isFreeExam && <FaGift className="tw-w-4 tw-h-4" />}
                Exam Schedule Information
                {isFreeExam && (
                  <span className="tw-bg-emerald-100 tw-text-emerald-800 tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium">
                    GRATIS
                  </span>
                )}
              </h5>
              <div className={`tw-text-sm ${isFreeExam ? 'tw-text-emerald-800' : 'tw-text-blue-800'}`}>
                <div><strong>Name:</strong> {examScheduleData.name}</div>
                <div><strong>Type:</strong> {examScheduleData.exam_type || 'Unknown'}</div>
                <div><strong>Creator:</strong> {examScheduleData.creator_name || 'Unknown'}</div>
                <div><strong>Status:</strong> {isFreeExam ? 'Ujian Gratis' : 'Ujian Berbayar'}</div>
              </div>
            </div>

            {/* Product Type Selection */}
            <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-indigo-50 tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
              <h6 className="tw-font-bold tw-text-purple-900 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                <FaLayerGroup className="tw-w-4 tw-h-4" />
                Product Type Configuration
              </h6>

              <div className="tw-space-y-3">
                <div>
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    Search Product Type *
                  </label>
                  <input
                    type="text"
                    value={productTypeSearch}
                    onChange={(e) => setProductTypeSearch(e.target.value)}
                    placeholder="Cari product type..."
                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500"
                    disabled={loading}
                  />
                  {loadingProductTypes && (
                    <div className="tw-text-xs tw-text-gray-500 tw-mt-1">Loading product types...</div>
                  )}
                </div>

                <div>
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    Select Product Type *
                  </label>
                  <select
                    value={formData.product_type_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_type_id: parseInt(e.target.value) || 0 }))}
                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500"
                    required
                    disabled={loading || loadingProductTypes}
                  >
                    <option value={0}>-- Pilih Product Type --</option>
                    {productTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.description} {type.series ? `(${type.series})` : ''} - {type.group_product || 'General'}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProductType && (
                  <div className="tw-bg-white tw-p-3 tw-border tw-border-purple-200 tw-rounded">
                    <h6 className="tw-font-semibold tw-text-purple-800 tw-mb-2">Selected Product Type:</h6>
                    <div className="tw-text-sm tw-space-y-1">
                      <div><strong>Description:</strong> {selectedProductType.description}</div>
                      <div><strong>Series:</strong> {selectedProductType.series || 'N/A'}</div>
                      <div><strong>Group:</strong> {selectedProductType.group_product || 'General'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Configuration */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Kategori Kelas
                </label>
                <select
                  value={formData.classtype}
                  onChange={(e) => setFormData(prev => ({ ...prev, classtype: e.target.value }))}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                  disabled={loading}
                >
                  {classtypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Stok
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 999999 }))}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                  min="1"
                  disabled={loading}
                />
                <small className="tw-text-gray-500">Default: 999999 (unlimited)</small>
              </div>
            </div>

            {/* Pricing Section - Hidden for Free Exams */}
            {!isFreeExam && (
              <div className="tw-bg-gradient-to-r tw-from-yellow-50 tw-to-orange-50 tw-rounded-lg tw-p-4 tw-border tw-border-yellow-200">
                <h6 className="tw-font-bold tw-text-orange-900 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                  <FaDollarSign className="tw-w-4 tw-h-4" />
                  Pengaturan Harga
                </h6>

                <div className="tw-space-y-4">
                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                      min="1"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Promo Settings */}
                  <div className="tw-space-y-3">
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <input
                        type="checkbox"
                        id="is_promo"
                        checked={formData.is_promo}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          is_promo: e.target.checked,
                          no_promo_price: e.target.checked ? prev.price * 1.5 : undefined
                        }))}
                        className="tw-rounded focus:tw-ring-2 focus:tw-ring-blue-500"
                        disabled={loading}
                      />
                      <label htmlFor="is_promo" className="tw-text-sm tw-font-medium tw-text-gray-700 tw-flex tw-items-center tw-gap-1">
                        <FaTag className="tw-w-3 tw-h-3 tw-text-red-500" />
                        Ada Promo/Diskon
                      </label>
                    </div>

                    {formData.is_promo && (
                      <div className="tw-space-y-3 tw-pl-6 tw-border-l-2 tw-border-orange-300">
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                          <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                              Harga Normal (Sebelum Diskon) *
                            </label>
                            <input
                              type="number"
                              value={formData.no_promo_price || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, no_promo_price: parseInt(e.target.value) || undefined }))}
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                              min={formData.price + 1}
                              required={formData.is_promo}
                              disabled={loading}
                            />
                          </div>

                          <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                              Persentase Diskon
                            </label>
                            <div className="tw-px-3 tw-py-2 tw-bg-gray-100 tw-border tw-border-gray-300 tw-rounded-md tw-text-green-600 tw-font-bold">
                              {formData.no_promo_price && formData.price ? 
                                Math.round(((formData.no_promo_price - formData.price) / formData.no_promo_price) * 100) : 0}%
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                            Deskripsi Promo
                          </label>
                          <input
                            type="text"
                            value={formData.promo_description}
                            onChange={(e) => setFormData(prev => ({ ...prev, promo_description: e.target.value }))}
                            placeholder="Contoh: Promo Ujian Mandiri, Diskon UTBK 2025, dll"
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Free Exam Notice */}
            {isFreeExam && (
              <div className="tw-bg-gradient-to-r tw-from-emerald-50 tw-to-green-50 tw-rounded-lg tw-p-4 tw-border tw-border-emerald-200">
                <h6 className="tw-font-bold tw-text-emerald-900 tw-mb-2 tw-flex tw-items-center tw-gap-2">
                  <FaGift className="tw-w-4 tw-h-4" />
                  Ujian Gratis
                </h6>
                <p className="tw-text-sm tw-text-emerald-800">
                  Ini adalah ujian gratis. Harga otomatis akan diset ke Rp 0 dan tidak ada pengaturan promo.
                </p>
              </div>
            )}

            {/* Schedule */}
            <div className="tw-bg-gradient-to-r tw-from-green-50 tw-to-emerald-50 tw-rounded-lg tw-p-4 tw-border tw-border-green-200">
              <h6 className="tw-font-bold tw-text-green-900 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                <FaCalendarAlt className="tw-w-4 tw-h-4" />
                Jadwal Penjualan
              </h6>

              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div>
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    Mulai Dijual *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.effective_start}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_start: e.target.value }))}
                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    Berakhir (Opsional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.effective_end}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_end: e.target.value }))}
                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                    min={formData.effective_start}
                    disabled={loading}
                  />
                  <small className="tw-text-gray-500">Kosongkan jika tidak ada batas waktu</small>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                Fitur Produk
              </label>
              <div className="tw-flex tw-gap-2 tw-mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Tambah fitur produk..."
                  className="tw-flex-1 tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="tw-px-4 tw-py-2 tw-bg-blue-500 tw-text-white tw-rounded-md hover:tw-bg-blue-600 tw-transition-colors"
                  disabled={loading}
                >
                  Tambah
                </button>
              </div>
              
              {formData.features.length > 0 && (
                <div className="tw-flex tw-flex-wrap tw-gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="tw-inline-flex tw-items-center tw-gap-1 tw-px-3 tw-py-1 tw-bg-blue-100 tw-text-blue-800 tw-rounded-full tw-text-sm"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="tw-text-blue-600 hover:tw-text-blue-800 tw-ml-1"
                        disabled={loading}
                      >
                        <FaTimes className="tw-w-3 tw-h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="tw-bg-gray-50">
          <div className="tw-flex tw-gap-2 tw-w-full">
            <button
              type="button"
              onClick={onClose}
              className="tw-flex-1 tw-px-4 tw-py-2 tw-text-gray-700 tw-bg-white tw-border tw-border-gray-300 tw-rounded-md hover:tw-bg-gray-50 tw-transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`tw-flex-1 tw-px-4 tw-py-2 tw-bg-gradient-to-r ${isFreeExam ? 'tw-from-emerald-500 tw-to-green-600 hover:tw-from-emerald-600 hover:tw-to-green-700' : 'tw-from-blue-500 tw-to-indigo-600 hover:tw-from-blue-600 hover:tw-to-indigo-700'} tw-text-white tw-rounded-md tw-transition-colors tw-flex tw-items-center tw-justify-center tw-gap-2`}
              disabled={loading || !formData.product_type_id}
            >
              {loading ? (
                <>
                  <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaSave className="tw-w-4 tw-h-4" />
                  Go Live {isFreeExam ? 'Free' : 'Paid'} Exam Schedule
                </>
              )}
            </button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ExamScheduleGoLiveModal;