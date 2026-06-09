"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SlideshowImage = {
  src: string;
  alt: string;
};

type ImageSlideshowProps = {
  images: SlideshowImage[];
};

const SLIDE_INTERVAL_MS = 5000;

export function ImageSlideshow({ images }: ImageSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex];

  function goToPreviousSlide() {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function goToNextSlide() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  return (
    <section className="image-slideshow" aria-label="Wedding photo slideshow">
      <div className="slideshow-image-wrap">
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority
          sizes="(max-width: 780px) calc(100vw - 32px), 1120px"
          className="slideshow-image"
        />
        <div className="slideshow-overlay" />
        {images.length > 1 ? (
          <>
            <button
              className="slideshow-control previous"
              type="button"
              aria-label="Show previous photo"
              onClick={goToPreviousSlide}
            >
              ‹
            </button>
            <button
              className="slideshow-control next"
              type="button"
              aria-label="Show next photo"
              onClick={goToNextSlide}
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="slideshow-dots" aria-label="Choose slideshow photo">
          {images.map((image, index) => (
            <button
              className={`slideshow-dot ${index === activeIndex ? "active" : ""}`}
              type="button"
              key={image.src}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
