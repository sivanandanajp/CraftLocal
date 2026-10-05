export default function ProductCard({ image, alt, title, vendor, price, onFavorite, isSaved = false }) {
  return (
    <div className="min-w-[200px] md:min-w-[240px] flex-shrink-0 group cursor-pointer">
      <div className="aspect-square bg-surface-container-lowest border border-outline-variant rounded-lg mb-sm overflow-hidden relative">
        <img
          alt={alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={image}
        />
        <button
          type="button"
          aria-label={isSaved ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
          aria-pressed={isSaved}
          className={`absolute top-2 right-2 p-1 bg-surface-container-lowest/80 backdrop-blur rounded-full hover:text-primary ${isSaved ? 'text-primary' : 'text-on-surface-variant'}`}
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); onFavorite?.(); }}
        >
          <span className="material-symbols-outlined text-[18px]">{isSaved ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>
      <p className="font-label-md text-label-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{title}</p>
      <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-1 mb-1">{vendor}</p>
      <p className="font-label-md text-label-md text-primary">${price.toFixed(2)}</p>
    </div>
  );
}