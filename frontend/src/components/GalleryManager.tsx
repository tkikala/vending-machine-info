import { useState } from 'react';
import FileUpload from './FileUpload';

interface GalleryItem {
  id?: number;
  url: string;
  caption?: string;
  fileType: 'image' | 'video';
  originalName?: string;
  fileSize?: number;
  file?: File; // For new uploads before saving
}

interface GalleryManagerProps {
  initialGallery?: GalleryItem[];
  onGalleryChange: (gallery: GalleryItem[]) => void;
  machineId?: string; // For existing machines
  disabled?: boolean;
}

function GalleryManager({ 
  initialGallery = [], 
  onGalleryChange, 
  machineId: _machineId, 
  disabled = false 
}: GalleryManagerProps) {
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [uploading, _setUploading] = useState(false);

  const handleFileSelect = async (files: File[]) => {
    const newItems: GalleryItem[] = files.map(file => ({
      url: URL.createObjectURL(file), // Temporary URL for preview
      fileType: file.type.startsWith('video/') ? 'video' : 'image',
      originalName: file.name,
      fileSize: file.size,
      file: file
    }));

    const updatedGallery = [...gallery, ...newItems];
    setGallery(updatedGallery);
    onGalleryChange(updatedGallery);
  };

  const handleRemoveItem = (index: number) => {
    const item = gallery[index];
    
    // Revoke object URL if it's a temporary one
    if (item.file && item.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }

    const updatedGallery = gallery.filter((_, i) => i !== index);
    setGallery(updatedGallery);
    onGalleryChange(updatedGallery);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updatedGallery = gallery.map((item, i) => 
      i === index ? { ...item, caption } : item
    );
    setGallery(updatedGallery);
    onGalleryChange(updatedGallery);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  const renderMediaPreview = (item: GalleryItem) => {
    if (item.fileType === 'video') {
      return (
        <video 
          src={item.url} 
          className="gallery-preview"
          controls
          muted
          preload="metadata"
        />
      );
    } else {
      return (
        <img 
          src={item.url} 
          alt={item.caption || 'Gallery item'} 
          className="gallery-preview"
        />
      );
    }
  };

  return (
    <div className="gallery-manager">
      <div className="gallery-upload">
        <FileUpload
          onFileSelect={handleFileSelect}
          multiple={true}
          maxFiles={10}
          maxSize={50}
          label="Add Photos & Videos"
          disabled={disabled || uploading}
        />
      </div>

      {gallery.length > 0 && (
        <div className="gallery-items">
          <h4>Gallery Items ({gallery.length})</h4>
          <div className="gallery-grid">
            {gallery.map((item, index) => (
              <div key={index} className="gallery-item">
                <div className="gallery-preview-container">
                  {renderMediaPreview(item)}
                  <div className="gallery-item-overlay">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="btn btn-danger btn-sm"
                      disabled={disabled}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="gallery-item-info">
                  <div className="gallery-item-details">
                    <span className="file-type-badge">
                      {item.fileType === 'video' ? '🎥' : '🖼️'} 
                      {item.fileType}
                    </span>
                    {item.fileSize && (
                      <span className="file-size">
                        {formatFileSize(item.fileSize)}
                      </span>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Add caption (optional)"
                    value={item.caption || ''}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    className="gallery-caption-input"
                    disabled={disabled}
                  />
                  
                  {item.originalName && (
                    <div className="original-name">
                      {item.originalName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gallery.length === 0 && (
        <div className="gallery-empty">
          <p>No gallery items yet. Upload some photos and videos to showcase your vending machine!</p>
        </div>
      )}
    </div>
  );
}

export default GalleryManager; 