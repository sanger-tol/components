/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect, useRef, useState } from "react";
import { Image } from "./Image";
import type { PImageCarousel } from "./ImageCarousel";
import { ImagesModal } from "./ImagesModal";

export interface PImageList extends Omit<PImageCarousel, "onImageClick"> {
  /**
   * Optional callback to keep parent state in sync with selected image
   */
  setLink: (link: string) => void;
  /**
   * Optional className for the list container
   */
  className?: string;
  /**
   * Optional style overrides for the list container
   */
  style?: React.CSSProperties;
  /**
   * If true, clicking an image will open it in a larger modal view with navigation. Default is true.
   */
  enableModal?: boolean;
}

/**
 * Formats the images 1 after. Overflow will be auto when the list of images will
 * become larger the component width. Use the Image pointer. This will be used
 * to go to the right image for the ImageModal.
 *
 */
export function ImageList(props: PImageList) {
  const {
    links,
    height = "100%",
    fill = false,
    link,
    setLink,
    alt,
    enableModal = true,
    className,
    style,
  } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!links || links.length === 0) {
      setModalOpen(false);
      return;
    }
    const nextLink = links[0];
    if (link && links.includes(link)) return;
    setLink(nextLink);
  }, [links, link, setLink]);

  // Add mouse wheel horizontal scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, []);

  if (!links || links.length === 0) {
    return <div className="tol-image-list">No images available</div>;
  }

  const handleImageClick = (link: string) => {
    if (enableModal) {
      setLink(link);
      setModalOpen(true);
    }
  };

  return (
    <>
      <div
        ref={scrollContainerRef}
        className={`tol-image-list${className ? ` ${className}` : ""}`}
        style={{
          ["--tol-image-list-item-height" as string]: height,
          ...style,
        }}
      >
        {links.map((link, index) => (
          <div
            key={link || `image-${index}`}
            className={`tol-image-list__item${enableModal ? " tol-image-list__item--clickable" : ""}`}
          >
            <Image
              link={link}
              height={height}
              fill={fill}
              alt={alt ?? `Image ${index + 1}`}
              onClick={enableModal ? () => handleImageClick(link) : undefined}
            />
          </div>
        ))}
      </div>
      {enableModal && (
        <ImagesModal
          open={modalOpen}
          setOpen={setModalOpen}
          links={links}
          link={link}
          setLink={setLink}
        />
      )}
    </>
  );
}
