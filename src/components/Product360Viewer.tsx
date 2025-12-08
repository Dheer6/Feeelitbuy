import { useState, useRef, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';

interface Product360ViewerProps {
  images: string[];
  productName: string;
}

export function Product360Viewer({ images, productName }: Product360ViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // If no rotation images, don't render
  if (!images || images.length === 0) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const sensitivity = 5; // Pixels to move before changing image
    
    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? -1 : 1;
      const newIndex = (currentImageIndex + direction + images.length) % images.length;
      setCurrentImageIndex(newIndex);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const sensitivity = 5;
    
    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? -1 : 1;
      const newIndex = (currentImageIndex + direction + images.length) % images.length;
      setCurrentImageIndex(newIndex);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const ViewerContent = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div
      ref={containerRef}
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${
        fullscreen ? 'w-full h-[80vh]' : 'aspect-square'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={images[currentImageIndex]}
        alt={`${productName} - 360° view ${currentImageIndex + 1}`}
        className="w-full h-full object-contain select-none"
        draggable={false}
      />
      
      {/* 360° Badge */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
        360° View
      </div>

      {/* Fullscreen Button */}
      {!fullscreen && (
        <Button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          size="sm"
          variant="outline"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      )}

      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
        {currentImageIndex + 1} / {images.length}
      </div>

      {/* Drag Instruction */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-xs animate-pulse">
        ← Drag to rotate →
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 mt-8">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === currentImageIndex
                ? 'w-6 bg-white'
                : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-4">
        <ViewerContent />
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl p-6">
          <div className="relative">
            <Button
              onClick={() => setIsFullscreen(false)}
              className="absolute -top-2 -right-2 z-10"
              size="sm"
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
            <ViewerContent fullscreen />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
