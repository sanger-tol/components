/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect, useRef, useState } from "react";
import { Icon, IHeight } from "..";
import { Image } from "./Image";

export interface PImageCarousel extends IHeight {
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
  /**
   * If true, automatically advance to the next image on a timer
   */
  autoPlay?: boolean;
  /**
   * Timer interval for autoPlay in milliseconds
   */
  autoPlayIntervalMs?: number;
  /**
   * If true, pause autoPlay while hovering the carousel
   */
  pauseOnHover?: boolean;
}

/**
 * A list of images that can be looked through using arrows. When you reach the last
 * image you should be able to go back to the start. Use our Icon component for the
 * arrows. The arrows should be fixed. If there's only 1 image, arrows should not show.
 * Use the Image onClick to set the link pointer.
 *
 */
export function ImageCarousel(props: PImageCarousel) {
  const {
    links,
    link,
    height,
    fill = false,
    setLink,
    onImageClick,
    alt,
    className,
    style,
    autoPlay = false,
    autoPlayIntervalMs = 5000,
    pauseOnHover = true,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = links.indexOf(link);
  const [index, setIndex] = useState(() => (currentIndex >= 0 ? currentIndex : 0));
  const [isHovered, setIsHovered] = useState(false);

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

  useEffect(() => {
    if (!autoPlay || links.length <= 1 || autoPlayIntervalMs <= 0) {
      return;
    }
    if (pauseOnHover && isHovered) {
      return;
    }

    const id = window.setInterval(() => {
      setIndex((prevIndex) => (prevIndex === links.length - 1 ? 0 : prevIndex + 1));
    }, autoPlayIntervalMs);

    return () => window.clearInterval(id);
  }, [autoPlay, links.length, autoPlayIntervalMs, pauseOnHover, isHovered]);

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
      onMouseEnter={() => {
        setIsHovered(true);
        containerRef.current?.focus();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        containerRef.current?.blur();
      }}
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
        <Image
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
