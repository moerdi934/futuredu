'use client';

import { Modal, Button } from 'react-bootstrap';
import type { FC } from 'react';

interface ConfirmModalProps {
  show: boolean;
  username: string;
  email: string;
  errorMessage: string | null;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  show,
  username,
  email,
  errorMessage,
  title,
  onConfirm,
  onCancel,
}) => {
  const isSuccess = title === 'Registrasi Berhasil';
  const isConfirmation = title === 'Konfirmasi Registrasi';

  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      contentClassName="tw-rounded-2xl tw-border-0 tw-overflow-hidden"
      backdropClassName="tw-bg-purple-900/40 tw-backdrop-blur-sm"
    >
      {/* header colour variant */}
      <div
        className={`tw-bg-gradient-to-br ${
          isSuccess
            ? 'tw-from-purple-600 tw-to-purple-800'
            : isConfirmation
            ? 'tw-from-blue-500 tw-to-blue-700'
            : 'tw-from-red-500 tw-to-red-700'
        } tw-py-3 tw-px-4`}
      >
        <Modal.Header closeButton className="tw-border-0 tw-p-0">
          <Modal.Title className="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
            <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-white/20 tw-flex tw-items-center tw-justify-center">
              {/* dynamic icon */}
              {isSuccess ? (
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
              ) : isConfirmation ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="tw-text-white"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14z" />
                  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                </svg>
              ) : (
                /* error icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="tw-text-white"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14z" />
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              )}
            </div>
            <span>{title}</span>
          </Modal.Title>
        </Modal.Header>
      </div>

      <Modal.Body className="tw-bg-white tw-p-5">
        {isSuccess ? (
          <>
            <p className="tw-text-gray-700 tw-mb-2">
              Akun berhasil dibuat dengan:
            </p>
            <ul className="tw-space-y-1">
              <li>
                <strong>Username:</strong> {username}
              </li>
              <li>
                <strong>Email:</strong> {email}
              </li>
            </ul>
          </>
        ) : (
          <p className="tw-text-gray-700">{errorMessage}</p>
        )}
      </Modal.Body>

      <Modal.Footer className="tw-border-0 tw-bg-gray-50 tw-p-4">
        <Button
          onClick={onCancel}
          className="tw-bg-gray-600 tw-border-0 tw-rounded-xl tw-px-6 tw-py-2 tw-font-medium tw-shadow-md hover:tw-shadow-lg"
        >
          {isConfirmation ? 'Tutup' : 'OK'}
        </Button>
        {isConfirmation && (
          <Button
            onClick={onConfirm}
            className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-800 tw-border-0 tw-rounded-xl tw-px-6 tw-py-2 tw-font-medium tw-shadow-md hover:tw-shadow-lg"
          >
            Konfirmasi
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
