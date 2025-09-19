// pages/panel/courses/courses-page/AddCourseModal.tsx
import React from 'react';
import { BookOpen, AlertCircle, ExternalLink, FileText, Upload } from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import type { ModalButton } from '../../../../components/modal/ModalTemplate';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const handleCreateCourse = () => {
    // Open create course page in new tab
    window.open('/panel/courses/courses-page/create', '_blank');
    
    // Close modal
    onClose();
    
    // Optional: Call onSave if provided
    onSave?.({ action: 'redirected_to_create' });
  };

  const handleImportCourse = () => {
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
          // Store the imported data in sessionStorage for the create page to pick up
          sessionStorage.setItem('importedCourseData', jsonString);
          
          // Open create course page with import flag
          window.open('/panel/courses/courses-page/create?import=true', '_blank');
          
          // Close modal
          onClose();
          onSave?.({ action: 'imported_and_redirected' });
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
      action: 'upload',
      text: 'Import dari JSON',
      onClick: handleImportCourse,
      variant: 'info',
      customColors: {
        primary: '#06B6D4',
        secondary: '#0891B2',
        gradient1: '#06B6D4',
        gradient2: '#0891B2',
        text: '#FFFFFF'
      }
    },
    {
      action: 'create',
      text: 'Buat Kursus Baru',
      onClick: handleCreateCourse,
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
      title="Buat Kursus Baru"
      subtitle="Pilih cara untuk membuat kursus pembelajaran baru"
      icon={<BookOpen className="tw-w-5 tw-h-5" />}
      size="lg"
      bottomButtons={bottomButtons}
      showCloseButton={true}
    >
      <div className="tw-space-y-6">
        {/* Alert Information */}
        <div className="tw-bg-yellow-100 tw-border-l-4 tw-border-yellow-500 tw-text-yellow-800 tw-p-4 tw-rounded-r-lg">
          <div className="tw-flex tw-items-start tw-gap-3">
            <AlertCircle className="tw-w-5 tw-h-5 tw-flex-shrink-0 tw-mt-0.5" />
            <div>
              <div className="tw-font-medium tw-mb-2">Informasi Penting</div>
              <div className="tw-text-sm tw-leading-relaxed">
                Halaman pembuatan kursus akan terbuka di tab baru. Fitur autosave akan menyimpan 
                progress Anda secara otomatis setiap 30 detik. Anda juga dapat mengexport/import 
                data kursus dalam format JSON.
              </div>
            </div>
          </div>
        </div>

        {/* Create New Course Option */}
        <div className="tw-bg-white tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-6 hover:tw-border-purple-400 tw-transition-colors">
          <div className="tw-flex tw-items-start tw-gap-4">
            <div className="tw-bg-purple-100 tw-p-3 tw-rounded-xl">
              <BookOpen className="tw-w-6 tw-h-6 tw-text-purple-600" />
            </div>
            <div className="tw-flex-1">
              <h3 className="tw-font-bold tw-text-lg tw-text-purple-800 tw-mb-2">
                Mulai dari Awal
              </h3>
              <p className="tw-text-gray-600 tw-mb-4 tw-leading-relaxed">
                Buat kursus baru dengan editor lengkap yang mencakup:
              </p>
              <ul className="tw-text-sm tw-text-gray-700 tw-space-y-2">
                <li className="tw-flex tw-items-center tw-gap-2">
                  <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full"></div>
                  Informasi dasar kursus (judul, deskripsi, gambar)
                </li>
                <li className="tw-flex tw-items-center tw-gap-2">
                  <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full"></div>
                  Learning points dan tujuan pembelajaran
                </li>
                <li className="tw-flex tw-items-center tw-gap-2">
                  <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full"></div>
                  Section dan topik terstruktur
                </li>
                <li className="tw-flex tw-items-center tw-gap-2">
                  <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full"></div>
                  Materi dengan rich text editor dan video
                </li>
                <li className="tw-flex tw-items-center tw-gap-2">
                  <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full"></div>
                  Quiz dan drill interaktif
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Import from JSON Option */}
        <div className="tw-bg-white tw-border-2 tw-border-blue-200 tw-rounded-xl tw-p-6 hover:tw-border-blue-400 tw-transition-colors">
          <div className="tw-flex tw-items-start tw-gap-4">
            <div className="tw-bg-blue-100 tw-p-3 tw-rounded-xl">
              <Upload className="tw-w-6 tw-h-6 tw-text-blue-600" />
            </div>
            <div className="tw-flex-1">
              <h3 className="tw-font-bold tw-text-lg tw-text-blue-800 tw-mb-2">
                Import dari JSON
              </h3>
              <p className="tw-text-gray-600 tw-mb-4 tw-leading-relaxed">
                Lanjutkan dari file JSON yang telah diexport sebelumnya atau gunakan 
                template kursus yang sudah ada.
              </p>
              <div className="tw-bg-blue-50 tw-p-3 tw-rounded-lg tw-border tw-border-blue-200">
                <div className="tw-text-sm tw-text-blue-700">
                  <strong>Format yang didukung:</strong> File JSON dengan struktur kursus lengkap
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-blue-50 tw-p-6 tw-rounded-xl tw-border tw-border-purple-200">
          <h4 className="tw-font-semibold tw-text-purple-800 tw-mb-3 tw-flex tw-items-center tw-gap-2">
            <FileText className="tw-w-4 tw-h-4" />
            Fitur Tersedia
          </h4>
          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-3 tw-text-sm">
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-700">
              <div className="tw-w-1.5 tw-h-1.5 tw-bg-green-500 tw-rounded-full"></div>
              Autosave otomatis setiap 30 detik
            </div>
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-700">
              <div className="tw-w-1.5 tw-h-1.5 tw-bg-green-500 tw-rounded-full"></div>
              Export/Import format JSON
            </div>
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-700">
              <div className="tw-w-1.5 tw-h-1.5 tw-bg-green-500 tw-rounded-full"></div>
              Preview mode real-time
            </div>
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-700">
              <div className="tw-w-1.5 tw-h-1.5 tw-bg-green-500 tw-rounded-full"></div>
              Sidebar navigasi terstruktur
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
            Editor akan terbuka di tab baru sehingga Anda dapat tetap mengakses halaman 
            daftar kursus ini untuk referensi.
          </div>
        </div>
      </div>
    </LearningModal>
  );
};

export default AddCourseModal;