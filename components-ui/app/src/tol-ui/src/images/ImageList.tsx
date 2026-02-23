/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useRef, useState } from "react";
import { ImageComponent } from "./ImageComponent";
import { ImageModalComponent } from "./ImageModalComponent";

/**
 * Formats the images 1 after. Overflow will be auto when the list of images will
 * become larger the component width. Use the Image pointer. This will be used
 * to go to the right image for the ImageModal.
 *
 */

export interface PImageListComponent {
  /**
   * Array of image links
   */
  links: string[];
  /**
   * Height for the images
   */
  height?: any;
  /**
   * If true, the default is that the image should be 100% the height of the div, but allow for filling to the width instead
   */
  fill?: boolean;
  /**
   * Current selected image link
   */
  link?: string;
  /**
   * Optional callback to keep parent state in sync with selected image
   */
  onLinkChange?: (link: string) => void;
  /**
   * If true, clicking an image will open it in a larger modal view with navigation. Default is true.
   */
  enableModal?: boolean;
}

export function ImageListComponent(props: PImageListComponent) {
  const { links, height = "150px", fill = false, link, onLinkChange, enableModal = true } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(links[0] || "");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isControlled = typeof onLinkChange === "function";
  const activeLink = isControlled ? (link || "") : selectedLink;

  useEffect(() => {
    if (!links || links.length === 0) {
      if (!isControlled) setSelectedLink("");
      setModalOpen(false);
      return;
    }
    const nextLink = links[0];
    if (isControlled) {
      if (activeLink && links.includes(activeLink)) return;
      onLinkChange?.(nextLink);
      return;
    }
    if (!links.includes(selectedLink)) {
      setSelectedLink(nextLink);
    }
  }, [links, selectedLink, activeLink, isControlled, onLinkChange]);

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
      if (isControlled) {
        onLinkChange?.(link);
      } else {
        setSelectedLink(link);
      }
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
        className="tol-image-list"
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "10px",
          padding: "10px 0",
          background: "transparent",
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
        <ImageModalComponent
          open={modalOpen}
          setOpen={setModalOpen}
          links={links}
          link={activeLink}
          onLinkChange={isControlled ? onLinkChange : setSelectedLink}
        />
      )}
    </>
  );
}
