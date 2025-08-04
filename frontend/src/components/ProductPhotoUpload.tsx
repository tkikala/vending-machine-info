import { useState, useRef } from 'react';
import { uploadProductPhoto } from '../api';

interface ProductPhotoUploadProps {
  onPhotoUploaded: (photoUrl: string) => void;
  currentPhotoUrl?: string;
  disabled?: boolean;
}

function ProductPhotoUpload({ onPhotoUploaded, currentPhotoUrl, disabled = false }: ProductPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      console.log('Uploading product photo:', file.name, 'Size:', file.size);
      const result = await uploadProductPhoto(file);
      console.log('Product photo uploaded successfully:', result.file.url);
      onPhotoUploaded(result.file.url);
    } catch (uploadError) {
      console.error('Product photo upload failed:', uploadError);
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="product-photo-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />
      
      <div 
        className="upload-area"
        onClick={handleClick}
        style={{
          border: '2px dashed var(--text-muted)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center',
          cursor: disabled || uploading ? 'not-allowed' : 'pointer',
          opacity: disabled || uploading ? 0.6 : 1,
          transition: 'all 0.2s ease',
          background: 'var(--card-bg)',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {currentPhotoUrl ? (
          <div style={{ width: '100%', maxWidth: '200px' }}>
            <img 
              src={currentPhotoUrl} 
              alt="Product" 
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '6px',
                maxHeight: '100px',
                objectFit: 'cover'
              }}
            />
            <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>
              Click to change photo
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>📷</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {uploading ? 'Uploading...' : 'Click to upload product photo'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Max 50MB • JPG, PNG, GIF
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{ 
          color: '#f44336', 
          fontSize: '0.8rem', 
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {uploading && (
        <div style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.8rem', 
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          Uploading product photo...
        </div>
      )}
    </div>
  );
}

export default ProductPhotoUpload; 