import { useState, useCallback, useEffect } from "react";
import type { PostImage } from "../../types/image";

interface PostImageGalleryProps {
  images: PostImage[];
}

export function PostImageGallery({ images }: PostImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeImages = images
    .filter((img) => !img.deletedAt)
    .sort((a, b) => a.order - b.order);

  if (activeImages.length === 0) return null;

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % activeImages.length);
  }, [lightboxIndex, activeImages.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + activeImages.length) % activeImages.length
    );
  }, [lightboxIndex, activeImages.length]);

  // Cerrar con Escape
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  // ─── Layout según cantidad ─────────────────────────
  const renderGrid = () => {
    const count = activeImages.length;

    if (count === 1) {
      return (
        <div className="post-gallery post-gallery--single">
          <img
            src={activeImages[0].url}
            alt=""
            className="post-gallery-img"
            onClick={() => openLightbox(0)}
          />
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="post-gallery post-gallery--two">
          {activeImages.map((img, i) => (
            <img
              key={img.id}
              src={img.url}
              alt=""
              className="post-gallery-img"
              onClick={() => openLightbox(i)}
            />
          ))}
        </div>
      );
    }

    // 3+ images
    const showOverlay = count >= 5;
    const displayImages = showOverlay ? activeImages.slice(0, 4) : activeImages;
    const extraCount = showOverlay ? count - 4 : 0;

    return (
      <div
        className={`post-gallery post-gallery--grid ${
          count === 3 ? "post-gallery--three" : "post-gallery--four"
        }`}
      >
        {displayImages.map((img, i) => (
          <div key={img.id} className="post-gallery-cell">
            <img
              src={img.url}
              alt=""
              className="post-gallery-img"
              onClick={() => openLightbox(i)}
            />
            {showOverlay && i === displayImages.length - 1 && extraCount > 0 && (
              <div className="post-gallery-overlay" onClick={() => openLightbox(0)}>
                <span className="post-gallery-overlay-text">
                  +{extraCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {renderGrid()}

      {/* ─── Lightbox ─── */}
      {lightboxIndex !== null && (
        <div className="post-gallery-lightbox" onClick={closeLightbox}>
          <button
            className="post-gallery-lightbox-close"
            onClick={closeLightbox}
            aria-label="Cerrar"
          >
            ✕
          </button>

          <button
            className="post-gallery-lightbox-nav post-gallery-lightbox-nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Anterior"
          >
            ‹
          </button>

          <img
            src={activeImages[lightboxIndex].url}
            alt=""
            className="post-gallery-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="post-gallery-lightbox-nav post-gallery-lightbox-nav--next"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Siguiente"
          >
            ›
          </button>

          <div className="post-gallery-lightbox-counter">
            {lightboxIndex + 1} / {activeImages.length}
          </div>
        </div>
      )}
    </>
  );
}
