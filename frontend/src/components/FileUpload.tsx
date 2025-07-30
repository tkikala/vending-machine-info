import { useState, useRef, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  label?: string;
  className?: string;
  disabled?: boolean;
}

function FileUpload({
  onFileSelect,
  accept = 'image/*,video/*',
  multiple = false,
  maxFiles = 1,
  maxSize = 50, // 50MB default
  label = 'Choose files',
  className = '',
  disabled = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): File[] => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    if (files.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} file(s) allowed`);
      files = files.slice(0, maxFiles);
    }

    files.forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        newErrors.push(`${file.name} is too large (max ${maxSize}MB)`);
        return;
      }

      // Check file type
      const allowedTypes = accept.split(',').map(type => type.trim());
      const isValidType = allowedTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/');
        if (type === 'video/*') return file.type.startsWith('video/');
        return file.type === type;
      });

      if (!isValidType) {
        newErrors.push(`${file.name} is not a supported file type`);
        return;
      }

      validFiles.push(file);
    });

    setErrors(newErrors);
    return validFiles;
  }, [accept, maxFiles, maxSize]);

  const handleFileSelect = useCallback((files: File[]) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  }, [validateFiles, onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`file-upload ${className}`}>
      <div
        className={`file-upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        
        <div className="file-upload-content">
          <div className="file-upload-icon">
            📁
          </div>
          <div className="file-upload-text">
            <strong>{label}</strong>
            <br />
            <span>or drag and drop files here</span>
          </div>
          <div className="file-upload-info">
            {multiple && `Up to ${maxFiles} files, `}
            Max {maxSize}MB each
            <br />
            Supported: Images & Videos
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="file-upload-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload; 