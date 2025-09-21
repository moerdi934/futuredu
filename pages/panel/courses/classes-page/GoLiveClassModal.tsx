// pages/panel/courses/classes-page/GoLiveClassModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FaTimes, FaRocket, FaUsers, FaDollarSign, FaCalendarAlt, FaSave, FaClock } from 'react-icons/fa';

interface GoLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  classData: {
    id: number;
    name: string;
    description: string;
    teacher_name?: string;
    student_list_ids?: number[];
    real_start_datetime?: string;
    class_mode: string;
    start_date: string;
    end_date: string;
  } | null;
}

interface GoLiveFormData {
  name: string;
  description: string;
  price: number;
  max_students: number;
  features: string[];
  classtype: string;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  effective_start: string;
  effective_end?: string;
}

const GoLiveClassModal: React.FC<GoLiveClassModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  classData 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GoLiveFormData>({
    name: '',
    description: '',
    price: 0,
    max_students: 30,
    features: [],
    classtype: 'online',
    is_promo: false,
    no_promo_price: undefined,
    promo_description: '',
    effective_start: new Date().toISOString().slice(0, 16),
    effective_end: ''
  });
  const [featureInput, setFeatureInput] = useState('');

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen && classData) {
      // Calculate current enrolled students
      const currentStudents = classData.student_list_ids?.length || 0;
      
      setFormData(prev => ({
        ...prev,
        name: classData.name,
        description: classData.description,
        max_students: Math.max(30, currentStudents + 5), // Ensure at least current + 5 more slots
        effective_start: new Date().toISOString().slice(0, 16),
        effective_end: classData.real_start_datetime ? 
          new Date(new Date(classData.real_start_datetime).getTime() - 60 * 60 * 1000).toISOString().slice(0, 16) : // 1 hour before class starts
          ''
      }));
    }
  }, [isOpen, classData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classData) return;

    // Validation
    if (!formData.name.trim()) {
      alert('Nama produk harus diisi');
      return;
    }
    if (!formData.description.trim()) {
      alert('Deskripsi produk harus diisi');
      return;
    }
    if (formData.price <= 0) {
      alert('Harga harus lebih dari 0');
      return;
    }
    if (formData.max_students < (classData.student_list_ids?.length || 0)) {
      alert(`Maksimal siswa harus minimal ${classData.student_list_ids?.length || 0} (jumlah siswa saat ini)`);
      return;
    }
    if (formData.is_promo && (!formData.no_promo_price || formData.no_promo_price <= formData.price)) {
      alert('Harga sebelum promo harus lebih tinggi dari harga promo');
      return;
    }

    // Check if class has already started
    if (classData.real_start_datetime) {
      alert('Kelas yang sudah dimulai tidak dapat di-go-live');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/classes/${classData.id}/go-live`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Kelas "${classData.name}" berhasil go-live!`);
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
    { value: 'sbmptn', label: 'SBMPTN' }
  ];

  if (!classData) return null;

  const currentStudents = classData.student_list_ids?.length || 0;
  const availableSlots = formData.max_students - currentStudents;

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header className="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600 tw-text-white">
        <Modal.Title className="tw-flex tw-items-center tw-gap-3">
          <div className="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
            <FaRocket className="tw-w-4 tw-h-4" />
          </div>
          Go Live Class
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
            {/* Class Info */}
            <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-rounded-lg tw-p-4 tw-border tw-border-blue-200">
              <h5 className="tw-font-bold tw-text-blue-900 tw-mb-2">Class Information</h5>
              <div className="tw-text-sm tw-text-blue-800 tw-space-y-1">
                <div><strong>Name:</strong> {classData.name}</div>
                <div><strong>Teacher:</strong> {classData.teacher_name || 'Unknown'}</div>
                <div><strong>Mode:</strong> {classData.class_mode}</div>
                <div><strong>Current Students:</strong> {currentStudents}</div>
                <div><strong>Schedule:</strong> {new Date(classData.start_date).toLocaleString('id-ID')} - {new Date(classData.end_date).toLocaleString('id-ID')}</div>
                {classData.real_start_datetime && (
                  <div className="tw-text-red-600"><strong>Status:</strong> Already Started</div>
                )}
              </div>
            </div>

            {/* Capacity Warning */}
            <div className="tw-bg-gradient-to-r tw-from-orange-50 tw-to-red-50 tw-rounded-lg tw-p-4 tw-border tw-border-orange-200">
              <h6 className="tw-font-bold tw-text-orange-900 tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <FaUsers className="tw-w-4 tw-h-4" />
                Capacity Management
              </h6>
              <div className="tw-text-sm tw-text-orange-800">
                <div>Current Enrolled: <strong>{currentStudents} students</strong></div>
                <div>Available for Purchase: <strong>{availableSlots} slots</strong></div>
                <div className="tw-text-xs tw-text-gray-600 tw-mt-2">
                  * Sales will automatically stop when class reaches maximum capacity or starts
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Class Category
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
            </div>

            {/* Description */}
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                Product Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Pricing and Capacity */}
            <div className="tw-bg-gradient-to-r tw-from-yellow-50 tw-to-orange-50 tw-rounded-lg tw-p-4 tw-border tw-border-yellow-200">
              <h6 className="tw-font-bold tw-text-orange-900 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                <FaDollarSign className="tw-w-4 tw-h-4" />
                Pricing & Capacity
              </h6>

              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-mb-4">
                <div>
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    Price (Rp) *
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

                <div>
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    Maximum Students *
                  </label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_students: parseInt(e.target.value) || 30 }))}
                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                    min={currentStudents}
                    required
                    disabled={loading}
                  />
                  <small className="tw-text-gray-500">
                    Minimum: {currentStudents} (current enrolled)
                  </small>
                </div>
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
                  <label htmlFor="is_promo" className="tw-text-sm tw-font-medium tw-text-gray-700">
                    Enable Promo/Discount
                  </label>
                </div>

                {formData.is_promo && (
                  <div className="tw-space-y-3 tw-pl-6 tw-border-l-2 tw-border-orange-300">
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                      <div>
                        <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                          Original Price (Before Discount) *
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
                          Discount Percentage
                        </label>
                        <div className="tw-px-3 tw-py-2 tw-bg-gray-100 tw-border tw-border-gray-300 tw-rounded-md tw-text-green-600 tw-font-bold">
                          {formData.no_promo_price && formData.price ? 
                            Math.round(((formData.no_promo_price - formData.price) / formData.no_promo_price) * 100) : 0}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                        Promo Description
                      </label>
                      <input
                        type="text"
                        value={formData.promo_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, promo_description: e.target.value }))}
                        placeholder="e.g., Early Bird Discount, Limited Time Offer"
                        className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sales Schedule */}
            <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-indigo-50 tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
              <h6 className="tw-font-bold tw-text-purple-900 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                <FaCalendarAlt className="tw-w-4 tw-h-4" />
                Sales Schedule
              </h6>

              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div>
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    Sales Start *
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
                    Sales End (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.effective_end}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_end: e.target.value }))}
                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                    min={formData.effective_start}
                    max={classData.start_date}
                    disabled={loading}
                  />
                  <small className="tw-text-gray-500">
                    Leave empty for auto-stop when class starts
                  </small>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                Product Features
              </label>
              <div className="tw-flex tw-gap-2 tw-mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add product feature..."
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
                  Add
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
              Cancel
            </button>
            <button
              type="submit"
              className="tw-flex-1 tw-px-4 tw-py-2 tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600 tw-text-white tw-rounded-md hover:tw-from-green-600 hover:tw-to-emerald-700 tw-transition-colors tw-flex tw-items-center tw-justify-center tw-gap-2"
              disabled={loading || !!classData.real_start_datetime}
            >
              {loading ? (
                <>
                  <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
                  Processing...
                </>
              ) : classData.real_start_datetime ? (
                <>
                  <FaClock className="tw-w-4 tw-h-4" />
                  Class Already Started
                </>
              ) : (
                <>
                  <FaSave className="tw-w-4 tw-h-4" />
                  Go Live Class
                </>
              )}
            </button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default GoLiveClassModal;