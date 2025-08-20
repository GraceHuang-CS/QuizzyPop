// src/components/FileUpload.jsx
import React, { useState, useRef } from "react";
import "../styles/cpns/FileUpload.css";

const FileUpload = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const acceptedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file) => {
    if (!acceptedTypes.includes(file.type)) {
      alert("Please upload a valid file type (PDF, PPTX, or image files)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      alert("File size must be less than 50MB");
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      await onFileUpload(file);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("presentation")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📁";
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isDragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.pptx,.ppt,.jpg,.jpeg,.png,.gif,.webp,.svg"
          style={{ display: "none" }}
        />

        {isUploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>Processing your file...</p>
          </div>
        ) : uploadedFile ? (
          <div className="upload-success">
            <div className="file-info">
              <span className="file-icon">
                {getFileIcon(uploadedFile.type)}
              </span>
              <div>
                <p className="file-name">{uploadedFile.name}</p>
                <p className="file-size">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <p className="success-message">File uploaded successfully!</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📁</div>
            <h3>Upload Your Study Material</h3>
            <p>Drag and drop your file here, or click to browse</p>
            <p className="supported-formats">
              Supported formats: PDF, PPTX, PPT, JPG, PNG, GIF, WebP, SVG
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
