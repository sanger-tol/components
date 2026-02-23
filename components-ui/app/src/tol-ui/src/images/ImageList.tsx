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
   * If true, clicking an image will open it in a larger modal view with navigation. Default is true.
   */
  enableModal?: boolean;
}

export function ImageListComponent(props: PImageListComponent) {
  const { links, height = "150px", enableModal = true } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(links[0] || "");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!links || links.length === 0) {
      setSelectedLink("");
      setModalOpen(false);
      return;
    }
    if (!links.includes(selectedLink)) {
      setSelectedLink(links[0]);
    }
  }, [links, selectedLink]);

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
      setSelectedLink(link);
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
          background: ç;
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
          link={selectedLink}
          onLinkChange={setSelectedLink}
        />
      )}
    </>
  );
}
