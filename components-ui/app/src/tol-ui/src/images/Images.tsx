/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect, useState } from "react";
import { ImageCarousel, PImageCarousel } from "./ImageCarousel";
import { ImagesModal } from "./ImagesModal";

export interface PImages extends Omit<PImageCarousel, "link" | "setLink" | "onImageClick"> {
  /**
   * If true, clicking an image will open it in a larger modal view. Default is true.
   */
  enableModal?: boolean;
  /**
   * Optional className for the component wrapper
   */
  className?: string;
  /**
   * Optional style overrides for the component wrapper
   */
  style?: React.CSSProperties;
}

/**
 * Combines ImageCarousel and ImagesModal to create the main images component.
 * Create the main state pair for [link, setLink] here and pass it to both
 * components to keep them in sync.
 * 
 */
export function Images(props: PImages) {
  const {
    links,
    height,
    fill,
    alt,
    enableModal = true,
    className,
    style,
    autoPlayIntervalMs = 0,
    pauseOnHover,
  } = props;
  const [link, setLink] = useState(links[0] || "");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!links || links.length === 0) {
      setLink("");
      return;
    }
    if (!links.includes(link)) {
      setLink(links[0]);
    }
  }, [links, link]);

  if (!links || links.length === 0) {
    return <div className="tol-images">No images available</div>;
  }

  return (
    <div className={`tol-images${className ? ` ${className}` : ""}`} style={style}>
      <ImageCarousel
        links={links}
        link={link}
        height={height}
        fill={fill}
        alt={alt}
        autoPlayIntervalMs={autoPlayIntervalMs}
        pauseOnHover={pauseOnHover}
        setLink={setLink}
        onImageClick={enableModal ? (selected) => {
          setLink(selected);
          setModalOpen(true);
        } : undefined}
      />
      {enableModal && (
        <ImagesModal
          open={modalOpen}
          setOpen={setModalOpen}
          links={links}
          link={link}
          alt={alt}
          setLink={setLink}
        />
      )}
    </div>
  );
}
