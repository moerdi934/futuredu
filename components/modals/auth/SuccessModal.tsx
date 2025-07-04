'use client';

import { Modal, Button } from 'react-bootstrap';
import type { FC } from 'react';

interface SuccessModalProps {
  show: boolean;
  message: string | null;
  onClose: () => void;
}

const SuccessModal: FC<SuccessModalProps> = ({ show, message, onClose }) => (
  <Modal
    show={show}
    onHide={onClose}
    centered
    contentClassName="tw-rounded-2xl tw-border-0 tw-overflow-hidden"
    backdropClassName="tw-bg-purple-900/40 tw-backdrop-blur-sm"
  >
    <div className="tw-bg-gradient-to-br tw-from-purple-600 tw-to-purple-800 tw-py-3 tw-px-4">
      <Modal.Header closeButton className="tw-border-0 tw-p-0">
        <Modal.Title className="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
          <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-white/20 tw-flex tw-items-center tw-justify-center">
            {/* check icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="tw-text-white"
              viewBox="0 0 16 16"
            >
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
            </svg>
          </div>
          <span>Registrasi Berhasil</span>
        </Modal.Title>
      </Modal.Header>
    </div>

    <Modal.Body className="tw-bg-white tw-p-5">
      <div className="tw-text-gray-700">{message}</div>
    </Modal.Body>

    <Modal.Footer className="tw-border-0 tw-bg-gray-50 tw-p-4">
      <Button
        onClick={onClose}
        className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-800 tw-border-0 tw-rounded-xl tw-px-6 tw-py-2 tw-font-medium tw-shadow-md hover:tw-shadow-lg"
      >
        OK
      </Button>
    </Modal.Footer>
  </Modal>
);

export default SuccessModal;
