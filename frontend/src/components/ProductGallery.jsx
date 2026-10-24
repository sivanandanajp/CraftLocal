
import { useEffect, useState } from 'react';

export const ProductGallery = ({
  images = [],
  productName = 'Handcrafted product',
}) => {
  const validImages = images.filter(
    (image) => typeof image === 'string' && image.trim() !== ''
  );

  const [selectedImage, setSelectedImage] = useState(
    validImages[0] || ''
  );
  const [failedImages, setFailedImages] = useState([]);

  useEffect(() => {
    setSelectedImage(validImages[0] || '');
    setFailedImages([]);
  }, [images]);

  const handleImageError = (image) => {
    setFailedImages((current) =>
      current.includes(image) ? current : [...current, image]
    );

    if (selectedImage === image) {
      const nextImage = validImages.find(
        (item) => item !== image && !failedImages.includes(item)
      );

      setSelectedImage(nextImage || '');
    }
  };

  const availableImages = validImages.filter(
    (image) => !failedImages.includes(image)
  );

  return (
    <div className="flex min-w-0 flex-col gap-3 md:sticky md:top-28">
      {/* Main product image */}
      <div className="group relative aspect-[4/5] overflow-hidden bg-[#EEE5D9] sm:aspect-square">
        {selectedImage && !failedImages.includes(selectedImage) ? (
          <img
            key={selectedImage}
            src={selectedImage}
            alt={productName}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
            onError={() => handleImageError(selectedImage)}
          />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center gap-2"
            role="img"
            aria-label={`Image unavailable for ${productName}`}
          >
            <span className="font-headline text-5xl italic text-[#A65D45]">
              Craft
            </span>
            <span className="text-xs text-[#8B776A]">
              Image unavailable
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 bg-[#FAF7F1]/90 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#604936] sm:left-4 sm:top-4">
          Made with care
        </span>
      </div>

      {/* Image thumbnails */}
      {availableImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {availableImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              aria-label={`View image ${index + 1} of ${productName}`}
              aria-pressed={selectedImage === image}
              className={`aspect-square overflow-hidden border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A65D45] focus-visible:ring-offset-2 ${
                selectedImage === image
                  ? 'border-[#A65D45] ring-1 ring-[#A65D45]'
                  : 'border-[#E5D9CA] hover:border-[#B98A70]'
              }`}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
                onError={() => handleImageError(image)}
              />
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] uppercase tracking-[0.16em] text-[#918173]">
        Each piece has its own character
      </p>
    </div>
  );
};

export default ProductGallery;
