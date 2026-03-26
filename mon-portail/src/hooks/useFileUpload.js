import { useState, useRef } from 'react';
import { UPLOAD_DRIVE_URL } from '../config/constants';

/**
 * Custom hook that manages drag-and-drop file uploads to Google Drive.
 *
 * @param {Function} onUploadSuccess – Callback invoked after a successful upload.
 * @returns Upload state & handlers.
 */
export function useFileUpload(onUploadSuccess) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    if (files?.length) uploadFilesToDrive(Array.from(files));
  };

  // ── Click-to-upload ────────────────────────────────────────────────────────
  const handleUploadZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files?.length) uploadFilesToDrive(Array.from(files));
    e.target.value = '';
  };

  // ── Core upload logic ──────────────────────────────────────────────────────
  const uploadFilesToDrive = (files) => {
    setUploadStatus('uploading');
    setUploadMessage('');
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      } else {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }
    });

    xhr.addEventListener('load', () => {
      setUploadProgress(100);
      if (xhr.status >= 200 && xhr.status < 300) {
        let data = {};
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          /* empty */
        }
        setUploadStatus('success');
        setUploadMessage(
          data.message ||
            `${files.length} fichier(s) envoyé(s) vers Google Drive`,
        );
        onUploadSuccess?.();
      } else {
        let data = {};
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          /* empty */
        }
        setUploadStatus('error');
        setUploadMessage(
          data.message || data.error || `Erreur ${xhr.status}`,
        );
      }
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
        setUploadProgress(0);
      }, 5000);
    });

    xhr.addEventListener('error', () => {
      setUploadProgress(0);
      setUploadStatus('error');
      setUploadMessage('Erreur réseau');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 5000);
    });

    xhr.open('POST', UPLOAD_DRIVE_URL);
    xhr.send(formData);
  };

  return {
    isDragOver,
    uploadStatus,
    uploadMessage,
    uploadProgress,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleUploadZoneClick,
    handleFileInputChange,
    fileInputRef,
  };
}
