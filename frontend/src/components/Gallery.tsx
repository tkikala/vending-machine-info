import { useState } from 'react';

function Gallery({ photos }: { photos: { id: number; url: string }[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <>
      <div className="gallery">
        <h3>Gallery</h3>
        <div className="gallery-scroll">
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt="Vending Machine"
              className="gallery-photo"
              onClick={() => setSelectedPhoto(photo.url)}
            />
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto} alt="Vending Machine" className="modal-image" />
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>×</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Gallery; 