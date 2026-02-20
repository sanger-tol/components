/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ImageCarousel } from "./ImageCarouselComponent";

/**
 * Combines ImageCarousel and ImagesModal to create the main images component.
 * Create the main state pair for [link, setLink] here and pass it to both
 * components to keep them in sync.
 * 
 */

export interface PImages {
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

export function Images(props: PImages) {
  const { links, height, fill } = props;

  return (
    <div className="tol-images">
      <ImageCarousel
        links={links}
        link={links[0]}
        height={height}
        fill={fill}
      />
    </div>
  );
}
