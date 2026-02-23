/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect, useRef, useState } from "react";
import { ImageComponent } from "./ImageComponent";
import type { PImageCarouselComponent } from "./ImageCarouselComponent";
import { ImagesModalComponent } from "./ImagesModalComponent";

/**
 * Formats the images 1 after. Overflow will be auto when the list of images will
 * become larger the component width. Use the Image pointer. This will be used
 * to go to the right image for the ImageModal.
 *
 */

export interface PImageListComponent extends Omit<PImageCarouselComponent, "onImageClick"> {
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

export function ImageListComponent(props: PImageListComponent) {
  const { links, height = "150px", fill = false, link, setLink, enableModal = true, className, style } = props;
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
      <style>{`
        .tol-image-list::-webkit-scrollbar {
          height: 6px;
        }
        .tol-image-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .tol-image-list::-webkit-scrollbar-thumb {
          background: var(--tol-grey-light);
          border-radius: 4px;
        }
        .tol-image-list::-webkit-scrollbar-thumb:hover {
          background: var(--tol-grey);
        }
      `}</style>
      <div
        ref={scrollContainerRef}
        className={`tol-image-list${className ? ` ${className}` : ""}`}
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "10px",
          padding: "10px 0",
          background: "transparent",
          ...style,
        }}
      >
        {links.map((link, index) => (
          <div
            key={index}
            style={{
              flexShrink: 0,
              height: height,
              cursor: enableModal ? "pointer" : "default",
            }}
          >
            <ImageComponent
              link={link}
              height={height}
              fill={fill}
              onClick={enableModal ? () => handleImageClick(link) : undefined}
            />
          </div>
        ))}
      </div>
      {enableModal && (
        <ImagesModalComponent
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
