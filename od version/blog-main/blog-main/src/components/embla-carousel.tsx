"use client";

import React, { useEffect } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

type ImageType = {
  src: string;
  alt: string;
};

type PropType = {
  slides?: number[];
  images?: ImageType[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, images, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  // Ensure embla reInit after images are loaded and on mount
  useEffect(() => {
    if (emblaApi) {
      // Force a reInit to ensure proper sizing
      const timer = setTimeout(() => {
        emblaApi.reInit();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [emblaApi, images]);

  // Use images if provided, otherwise fall back to slides
  const renderSlides = () => {
    if (images && images.length > 0) {
      return images.map((image, index) => (
        <div className="embla__slide" key={index}>
          <div className="embla__slide__content">
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={600}
              className="embla__slide__img"
              priority={index === 0} // Add priority to first image
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
              onLoad={() => {
                // Trigger reInit after image loads to ensure proper sizing
                if (emblaApi) {
                  emblaApi.reInit();
                }
              }}
            />
          </div>
        </div>
      ));
    } else if (slides && slides.length > 0) {
      return slides.map((index) => (
        <div className="embla__slide" key={index}>
          <div className="embla__slide__number">{index + 1}</div>
        </div>
      ));
    }
    return null;
  };

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">{renderSlides()}</div>
      </div>
    </section>
  );
};

export default EmblaCarousel;
