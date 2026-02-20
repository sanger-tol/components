/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Icon, IHeight } from "..";
import { ImageComponent } from "./ImageComponent";

/**
 * A list of images that can be looked through using arrows. When you reach the last
 * image you should be able to go back to the start. Use our Icon component for the
 * arrows. The arrows should be fixed. If there's only 1 image, arrows should not show.
 * Use the Image onClick to set the link pointer.
 *
 */

export interface PImageCarousel extends IHeight {
  /**
   * Array of hrefs for the images, in order
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
}

export function ImageCarousel(props: PImageCarousel) {
  const { links, link, height, fill = false } = props;
  
  const currentIndex = links.indexOf(link);
  const [index, setIndex] = useState(currentIndex >= 0 ? currentIndex : 0);

  const showArrows = links.length > 1;

  const handlePrevious = () => {
    setIndex((prevIndex) => (prevIndex === 0 ? links.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex === links.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="tol-image-carousel" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: height || "100%" }}>
      {showArrows && (
        <Icon
          icon="caret-left"
          onClick={handlePrevious}
          size="2x"
          className="tol-image-carousel-arrow tol-image-carousel-arrow-left"
        />
      )}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ImageComponent link={links[index]} height={height} fill={fill} />
      </div>
      {showArrows && (
        <Icon
          icon="caret-right"
          onClick={handleNext}
          size="2x"
          className="tol-image-carousel-arrow tol-image-carousel-arrow-right"
        />
      )}
    </div>
  );
}
