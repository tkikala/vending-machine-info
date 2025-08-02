import { useState, useRef } from 'react';
import { uploadSingleFile } from '../api';

interface ProductPhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string | undefined, file?: File) => void;
  disabled?: boolean;
}

function ProductPhotoUpload({ currentPhoto, onPhotoChange, disabled = false }: ProductPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      setError('File size must be less than 4MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const result = await uploadSingleFile(file);
      onPhotoChange(result.file.url, file);
      console.log('Product photo uploaded successfully:', result.file.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
      console.error('Product photo upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label>Product Photo</label>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem', 
        alignItems: 'center' 
      }}>
        {currentPhoto ? (
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid var(--border-color)'
          }}>
            <img 
              src={currentPhoto} 
              alt="Product" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={disabled || uploading}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'rgba(255, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{
            width: '120px',
            height: '120px',
            border: '2px dashed var(--border-color)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-secondary)',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Click to upload photo
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          style={{ display: 'none' }}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          style={{
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            opacity: disabled || uploading ? 0.5 : 1
          }}
        >
          {uploading ? 'Uploading...' : currentPhoto ? 'Change Photo' : 'Upload Photo'}
        </button>
      </div>
      
      {error && (
        <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default ProductPhotoUpload; 