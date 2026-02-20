/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { ImageCarouselComponent } from "./ImageCarouselComponent";
/**
 * Combines ImageCarousel and ImagesModal to create the main images component.
 * Create the main state pair for [link, setLink] here and pass it to both
 * components to keep them in sync.
 * 
 */

export interface PImagesComponent {
  /**
   * Array of image links
   */
  links: string[];
  /**
   * Height for the carousel
   */
  height?: any;
  /**
   * Fill option for images
   */
  fill?: boolean;
}

export function ImagesComponent(props: PImagesComponent) {
  const { links, height, fill } = props;
  const [link, setLink] = useState(links[0] || "");

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
    <div className="tol-images">
      <ImageCarouselComponent
        links={links}
        link={link}
        height={height}
        fill={fill}
        onLinkChange={setLink}
      />
    </div>
  );
}
