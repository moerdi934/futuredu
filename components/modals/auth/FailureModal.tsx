'use client';

import { Modal, Button } from 'react-bootstrap';
import type { FC } from 'react';

interface FailureModalProps {
  show: boolean;
  message: string | null;
  onClose: () => void;
}

const FailureModal: FC<FailureModalProps> = ({ show, message, onClose }) => (
  <Modal
    show={show}
    onHide={onClose}
    centered
    contentClassName="tw-rounded-2xl tw-border-0 tw-overflow-hidden"
    backdropClassName="tw-bg-purple-900/40 tw-backdrop-blur-sm"
  >
    <div className="tw-bg-gradient-to-br tw-from-red-500 tw-to-red-700 tw-py-3 tw-px-4">
      <Modal.Header closeButton className="tw-border-0 tw-p-0">
        <Modal.Title className="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
          <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-white/20 tw-flex tw-items-center tw-justify-center">
            {/* X icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="tw-text-white"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0-3.293l2.646 2.647.708-.708L8.707 11l2.647-2.646-.708-.708L8 10.293 5.354 7.646l-.708.708L7.293 11l-2.647 2.646.708.708L8 11.707z" />
            </svg>
          </div>
          <span>Gagal</span>
        </Modal.Title>
      </Modal.Header>
    </div>

    <Modal.Body className="tw-bg-white tw-p-5">
      <div className="tw-text-gray-700">{message}</div>
    </Modal.Body>

    <Modal.Footer className="tw-border-0 tw-bg-gray-50 tw-p-4">
      <Button
        onClick={onClose}
        className="tw-bg-gray-600 tw-border-0 tw-rounded-xl tw-px-6 tw-py-2 tw-font-medium tw-shadow-md hover:tw-shadow-lg"
      >
        OK
      </Button>
    </Modal.Footer>
  </Modal>
);

export default FailureModal;
