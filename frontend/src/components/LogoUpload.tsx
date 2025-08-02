import { useState, useEffect } from 'react';
import FileUpload from './FileUpload';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string | undefined, logoFile?: File) => void;
  disabled?: boolean;
}

function LogoUpload({ currentLogo, onLogoChange, disabled = false }: LogoUploadProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogo || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, _setUploading] = useState(false);

  // Update preview when currentLogo changes
  useEffect(() => {
    if (currentLogo) {
      setLogoPreview(currentLogo);
    }
  }, [currentLogo]);

  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      onLogoChange(previewUrl, file); // Pass both preview URL and file
    }
  };

  const handleRemoveLogo = () => {
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setLogoFile(null);
    onLogoChange(undefined, undefined);
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  const getLogoDisplayName = () => {
    if (logoFile) {
      return logoFile.name;
    }
    if (currentLogo) {
      // Extract filename from URL
      const urlParts = currentLogo.split('/');
      return urlParts[urlParts.length - 1] || 'Current logo';
    }
    return 'Logo';
  };

  return (
    <div className="logo-upload">
      <label className="form-label">
        <strong>Machine Logo</strong>
        <span className="optional-text"> (optional)</span>
      </label>
      
      {logoPreview ? (
        <div className="logo-preview">
          <img 
            src={logoPreview} 
            alt="Machine logo" 
            onError={(e) => {
              console.error('Failed to load logo image:', logoPreview);
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="logo-preview-info">
            <h5>Logo Selected</h5>
            {logoFile && (
              <p>
                {logoFile.name} ({formatFileSize(logoFile.size)})
              </p>
            )}
            {!logoFile && (
              <p>{getLogoDisplayName()}</p>
            )}
          </div>
          <div className="logo-actions">
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="btn btn-danger btn-sm"
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <FileUpload
          onFileSelect={handleFileSelect}
          accept="image/*"
          multiple={false}
          maxFiles={1}
          maxSize={3} // 3MB for logo
          label="Upload Logo"
          disabled={disabled || uploading}
        />
      )}
      
      <div className="logo-help-text">
        <small>
          Upload a logo for your vending machine. Recommended size: 200x200px or larger.
          Supported formats: JPEG, PNG, GIF, WebP. Max size: 3MB.
        </small>
      </div>
    </div>
  );
}

export default LogoUpload; 