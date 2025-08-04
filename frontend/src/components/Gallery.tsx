import { useState, useRef, useEffect } from 'react';

function Gallery({ photos }: { photos: { id: string | number; url: string }[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextPhoto();
    }
    if (isRightSwipe) {
      previousPhoto();
    }
  };

  const nextPhoto = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousPhoto = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const openPhoto = (photoUrl: string, index: number) => {
    setSelectedPhoto(photoUrl);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          previousPhoto();
          break;
        case 'ArrowRight':
          nextPhoto();
          break;
        case 'Escape':
          closeModal();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  // Update selected photo when currentIndex changes
  useEffect(() => {
    if (selectedPhoto && photos[currentIndex]) {
      setSelectedPhoto(photos[currentIndex].url);
    }
  }, [currentIndex, selectedPhoto, photos]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="gallery">
        <h3>Gallery</h3>
        <div className="gallery-scroll">
          {photos.map((photo, index) => (
            <img
              key={photo.id}
              src={photo.url}
              alt="Vending Machine"
              className="gallery-photo"
              onClick={() => openPhoto(photo.url, index)}
            />
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div 
          className="modal-overlay" 
          onClick={closeModal}
          ref={modalRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhoto} 
              alt="Vending Machine" 
              className="modal-image" 
            />
            
            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <button 
                  className="modal-nav modal-nav-left" 
                  onClick={previousPhoto}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button 
                  className="modal-nav modal-nav-right" 
                  onClick={nextPhoto}
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}
            
            {/* Close button */}
            <button className="modal-close" onClick={closeModal}>×</button>
            
            {/* Photo counter */}
            {photos.length > 1 && (
              <div className="modal-counter">
                {currentIndex + 1} / {photos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Gallery; 