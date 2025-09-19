// pages/panel/courses/courses-page/EditCourseModal.tsx
import React from 'react';
import { Edit3, AlertCircle, ExternalLink, FileText, Download, Upload } from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import type { ModalButton } from '../../../../components/modal/ModalTemplate';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  editingData: any;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingData
}) => {
  const courseId = editingData?.id;
  const courseTitle = editingData?.title || 'Course';

  const handleEditCourse = () => {
    // Open edit course page in new tab
    window.open(`/panel/courses/courses-page/edit/${courseId}`, '_blank');
    
    // Close modal
    onClose();
    
    // Optional: Call onSave if provided
    onSave?.({ action: 'redirected_to_edit', courseId });
  };

  const handleExportCourse = async () => {
    try {
      // Fetch course details and export as JSON
      const authToken = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/courses/detail/${courseId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const courseData = await response.json();
        
        // Convert to export format
        const exportData = {
          courseTitle: courseData.data.title || '',
          courseDescription: courseData.data.description || '',
          courseImageUrl: courseData.data.imageurl || '',
          learningPoints: courseData.data.learningPoint || [],
          sections: courseData.data.sections || [],
          mode: 'edit' as const,
          courseId: courseId.toString(),
          exportedAt: new Date().toISOString(),
          version: '1.0'
        };
        
        // Create and download file
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `course_${courseId}_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Course berhasil diexport ke JSON!');
      } else {
        throw new Error('Failed to fetch course data');
      }
    } catch (error) {
      console.error('Error exporting course:', error);
      alert('Gagal mengexport course. Silakan coba lagi.');
    }
  };

  const handleImportToEdit = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const jsonString = event.target?.result as string;
          // Store the imported data in sessionStorage for the edit page to pick up
          sessionStorage.setItem('importedCourseData', jsonString);
          
          // Open edit course page with import flag
          window.open(`/panel/courses/courses-page/edit/${courseId}?import=true`, '_blank');
          
          // Close modal
          onClose();
          onSave?.({ action: 'imported_and_redirected_to_edit', courseId });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const bottomButtons: ModalButton[] = [
    {
      action: 'cancel',
      text: 'Batal',
      onClick: onClose,
      variant: 'secondary'
    },
    {
      action: 'download',
      text: 'Export JSON',
      onClick: handleExportCourse,
      variant: 'info',
      customColors: {
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#059669',
        text: '#FFFFFF'
      }
    },
    {
      action: 'upload',
      text: 'Import JSON',
      onClick: handleImportToEdit,
      variant: 'warning',
      customColors: {
        primary: '#F59E0B',
        secondary: '#D97706',
        gradient1: '#F59E0B',
        gradient2: '#D97706',
        text: '#FFFFFF'
      }
    },
    {
      action: 'edit',
      text: 'Edit Kursus',
      onClick: handleEditCourse,
      variant: 'primary',
      customColors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        gradient1: '#8B5CF6',
        gradient2: '#7C3AED',
        text: '#FFFFFF'
      }
    }
  ];

  return (
    <LearningModal
      show={isOpen}
      onHide={onClose}
      title="Edit Kursus"
      subtitle={`Kelola dan edit konten kursus: ${courseTitle}`}
      icon={<Edit3 className="tw-w-5 tw-h-5" />}
      size="lg"
      bottomButtons={bottomButtons}
      showCloseButton={true}
    >
      <div className="tw-space-y-6">
        {/* Course Info */}
        <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-indigo-50 tw-p-5 tw-rounded-xl tw-border tw-border-purple-200">
          <div className="tw-flex tw-items-start tw-gap-4">
            <div className="tw-bg-purple-100 tw-p-3 tw-rounded-xl">
              <FileText className="tw-w-6 tw-h-6 tw-text-purple-600" />
            </div>
            <div className="tw-flex-1">
              <h3 className="tw-font-bold tw-text-lg tw-text-purple-800 tw-mb-1">
                {courseTitle}
              </h3>
              <p className="tw-text-sm tw-text-gray-600 tw-mb-3">
                ID Course: {courseId}
              </p>
              <p className="tw-text-sm tw-text-gray-700 tw-leading-relaxed">
                {editingData?.description || 'Tidak ada deskripsi tersedia'}
              </p>
            </div>
          </div>
        </div>

        {/* Alert Information */}
        <div className="tw-bg-yellow-100 tw-border-l-4 tw-border-yellow-500 tw-text-yellow-800 tw-p-4 tw-rounded-r-lg">
          <div className="tw-flex tw-items-start tw-gap-3">
            <AlertCircle className="tw-w-5 tw-h-5 tw-flex-shrink-0 tw-mt-0.5" />
            <div>
              <div className="tw-font-medium tw-mb-2">Informasi Edit</div>
              <div className="tw-text-sm tw-leading-relaxed">
                Halaman edit akan terbuka di tab baru. Data akan disimpan otomatis setiap 30 detik. 
                Anda dapat mengexport course saat ini atau mengimport dari file JSON lain.
              </div>
            </div>
          </div>
        </div>

        {/* Edit Options */}
        <div className="tw-grid tw-grid-cols-1 tw-gap-4">
          {/* Direct Edit */}
          <div className="tw-bg-white tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-5 hover:tw-border-purple-400 tw-transition-colors">
            <div className="tw-flex tw-items-start tw-gap-4">
              <div className="tw-bg-purple-100 tw-p-3 tw-rounded-xl">
                <Edit3 className="tw-w-6 tw-h-6 tw-text-purple-600" />
              </div>
              <div className="tw-flex-1">
                <h4 className="tw-font-bold tw-text-lg tw-text-purple-800 tw-mb-2">
                  Edit Langsung
                </h4>
                <p className="tw-text-gray-600 tw-text-sm tw-leading-relaxed">
                  Buka editor untuk mengedit course yang sudah ada dengan semua fitur 
                  editing lengkap termasuk autosave dan preview.
                </p>
              </div>
            </div>
          </div>

          {/* Export Current */}
          <div className="tw-bg-white tw-border-2 tw-border-green-200 tw-rounded-xl tw-p-5 hover:tw-border-green-400 tw-transition-colors">
            <div className="tw-flex tw-items-start tw-gap-4">
              <div className="tw-bg-green-100 tw-p-3 tw-rounded-xl">
                <Download className="tw-w-6 tw-h-6 tw-text-green-600" />
              </div>
              <div className="tw-flex-1">
                <h4 className="tw-font-bold tw-text-lg tw-text-green-800 tw-mb-2">
                  Export ke JSON
                </h4>
                <p className="tw-text-gray-600 tw-text-sm tw-leading-relaxed">
                  Simpan course saat ini ke file JSON untuk backup atau sharing. 
                  File dapat diimport kembali nanti atau digunakan sebagai template.
                </p>
              </div>
            </div>
          </div>

          {/* Import to Replace */}
          <div className="tw-bg-white tw-border-2 tw-border-orange-200 tw-rounded-xl tw-p-5 hover:tw-border-orange-400 tw-transition-colors">
            <div className="tw-flex tw-items-start tw-gap-4">
              <div className="tw-bg-orange-100 tw-p-3 tw-rounded-xl">
                <Upload className="tw-w-6 tw-h-6 tw-text-orange-600" />
              </div>
              <div className="tw-flex-1">
                <h4 className="tw-font-bold tw-text-lg tw-text-orange-800 tw-mb-2">
                  Import dari JSON
                </h4>
                <p className="tw-text-gray-600 tw-text-sm tw-leading-relaxed">
                  Ganti konten course dengan data dari file JSON. Berguna untuk 
                  menerapkan template atau memulihkan dari backup.
                </p>
                <div className="tw-bg-orange-50 tw-p-3 tw-rounded-lg tw-border tw-border-orange-200 tw-mt-3">
                  <div className="tw-text-xs tw-text-orange-700">
                    <strong>Peringatan:</strong> Import akan mengganti semua data course saat ini
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Available */}
        <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg tw-border tw-border-blue-200">
          <h4 className="tw-font-semibold tw-text-blue-800 tw-mb-3">Fitur Edit yang Tersedia</h4>
          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-2 tw-text-sm">
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-700">
              <div className="tw-w-1.5 tw-h-1.5 tw-bg-green-500 tw-rounded-full"></div>
              Autosave otomatis setiap 30 detik
            </div>
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-700">
              <div className="tw-w-1.5 tw-h-1.5 tw-bg-green-500 tw-rounded-full"></div>
              Preview mode real-time
            </div>
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-700">
              <div className="tw-w-1.5 tw-h-1.5 tw-bg-green-500 tw-rounded-full"></div>
              Export/Import JSON
            </div>
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-700">
              <div className="tw-w-1.5 tw-h-1.5 tw-bg-green-500 tw-rounded-full"></div>
              Validasi data otomatis
            </div>
          </div>
        </div>

        {/* New Tab Info */}
        <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg tw-border tw-border-blue-200">
          <div className="tw-flex tw-items-center tw-gap-2 tw-text-blue-800 tw-font-medium tw-mb-2">
            <ExternalLink className="tw-w-4 tw-h-4" />
            Membuka di Tab Baru
          </div>
          <div className="tw-text-sm tw-text-blue-700">
            Editor akan terbuka di tab baru sehingga Anda dapat tetap mengakses 
            halaman manajemen kursus ini.
          </div>
        </div>
      </div>
    </LearningModal>
  );
};

export default EditCourseModal;