/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
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
      <div
        className="tol-image-list"
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "10px",
          padding: "10px 0",
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
