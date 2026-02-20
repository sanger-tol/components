/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { ImageComponent } from "./ImageComponent";
import { ImageModal } from "./ImageModalComponent";

/**
 * Formats the images 1 after. Overflow will be auto when the list of images will
 * become larger the component width. Use the Image pointer. This will be used
 * to go to the right image for the ImageModal.
 *
 */

export interface PImageList {
  /**
   * Array of image links
   */
  links: string[];
  /**
   * Height for the images
   */
  height?: any;
}

export function ImageList(props: PImageList) {
  const { links, height = "150px" } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(links[0] || "");

  const handleImageClick = (link: string) => {
    setSelectedLink(link);
    setModalOpen(true);
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
              cursor: "pointer",
            }}
          >
            <ImageComponent
              link={link}
              height={height}
              onClick={() => handleImageClick(link)}
            />
          </div>
        ))}
      </div>
      <ImageModal
        open={modalOpen}
        setOpen={setModalOpen}
        links={links}
        link={selectedLink}
      />
    </>
  );
}
