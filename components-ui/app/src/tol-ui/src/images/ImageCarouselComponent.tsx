/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect, useRef, useState } from "react";
import { Icon, IHeight } from "..";
import { ImageComponent } from "./ImageComponent";

export interface PImageCarouselComponent extends IHeight {
  /**
   * Array of hrefs for the images
   */
  links: string[];
  /**
   * The current selected image link
   */
  link: string;
  /**
   * If true, the default is that the image should be 100% the height of the div, but allow for filling to the width instead
   */
  fill?: boolean;
  /**
   * Callback to keep parent state in sync with selected image
   */
  setLink: (link: string) => void;
  /**
   * Optional image alt text for accessibility
   */
  alt?: string;
  /**
   * Optional callback when the image itself is clicked
   */
  onImageClick?: (link: string) => void;
  /**
   * Optional className to apply to the carousel container
   */
  className?: string;
  /**
   * Optional style overrides for the carousel container
   */
  style?: React.CSSProperties;
}

/**
 * A list of images that can be looked through using arrows. When you reach the last
 * image you should be able to go back to the start. Use our Icon component for the
 * arrows. The arrows should be fixed. If there's only 1 image, arrows should not show.
 * Use the Image onClick to set the link pointer.
 *
 */
export function ImageCarouselComponent(props: PImageCarouselComponent) {
  const { links, link, height, fill = false, setLink, onImageClick, alt, className, style } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = links.indexOf(link);
  const [index, setIndex] = useState(() => (currentIndex >= 0 ? currentIndex : 0));

  useEffect(() => {
    if (links.length === 0) {
      return;
    }
    if (currentIndex >= 0) {
      setIndex(currentIndex);
      return;
    }
    setIndex(0);
  }, [currentIndex, links]);

  useEffect(() => {
    if (links.length === 0 || index < 0 || index >= links.length) {
      return;
    }
    setLink(links[index]);
  }, [index, links, setLink]);

  const showArrows = links.length > 1;

  const handlePrevious = () => {
    if (links.length === 0) return;
    setIndex((prevIndex) => (prevIndex === 0 ? links.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    if (links.length === 0) return;
    setIndex((prevIndex) => (prevIndex === links.length - 1 ? 0 : prevIndex + 1));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    }
  };

  const handleImageClick = () => {
    if (links.length === 0) return;
    const selected = links[index];
    setLink(selected);
    if (onImageClick) onImageClick(selected);
  };

  if (links.length === 0) {
    return <div className="tol-image-carousel">No images available</div>;
  }

  const containerStyle: React.CSSProperties = {
    ...(height ? { height } : {}),
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`tol-image-carousel tol-component-content${className ? ` ${className}` : ""}`}
      style={containerStyle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => containerRef.current?.focus()}
      onMouseLeave={() => containerRef.current?.blur()}
      aria-label="Image carousel"
    >
      {showArrows && (
        <Icon
          icon="caret-left"
          onClick={handlePrevious}
          size="2x"
          aria-label="Previous image"
          className="tol-image-carousel-arrow tol-image-carousel-arrow-left"
        />
      )}
      <div className="tol-image-carousel__viewport">
        <ImageComponent
          link={links[index]}
          height={height}
          fill={fill}
          alt={alt ?? `Image ${index + 1}`}
          onClick={handleImageClick}
        />
      </div>
      {showArrows && (
        <Icon
          icon="caret-right"
          onClick={handleNext}
          size="2x"
          aria-label="Next image"
          className="tol-image-carousel-arrow tol-image-carousel-arrow-right"
        />
      )}
    </div>
  );
}
