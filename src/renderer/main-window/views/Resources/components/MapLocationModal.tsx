import React, { useEffect, useState, useRef } from 'react';

interface MapLocationModalProps {
  isOpen: boolean;
  mapLocationImage: string;
  nodeName: string;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

const MapLocationModal: React.FC<MapLocationModalProps> = ({
  isOpen,
  mapLocationImage,
  nodeName,
  onClose,
  containerRef,
}) => {
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && containerRef?.current) {
      const updatePosition = () => {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          setOverlayStyle({
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          });
        }
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, containerRef]);

  if (!isOpen || !mapLocationImage) return null;

  return (
    <div 
      ref={overlayRef}
      className="map-location-modal-overlay" 
      style={overlayStyle}
      onClick={onClose}
    >
      <div className="map-location-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="map-location-modal-header">
          <h3 className="map-location-modal-title">{nodeName} - Map Location</h3>
          <button 
            className="map-location-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="map-location-modal-body">
          <img 
            src={mapLocationImage} 
            alt={`Map location for ${nodeName}`}
            className="map-location-modal-image"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MapLocationModal;
