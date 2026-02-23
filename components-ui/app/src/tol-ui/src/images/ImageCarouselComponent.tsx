/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Icon, IHeight } from "..";
import { ImageComponent } from "./ImageComponent";

/**
 * A list of images that can be looked through using arrows. When you reach the last
 * image you should be able to go back to the start. Use our Icon component for the
 * arrows. The arrows should be fixed. If there's only 1 image, arrows should not show.
 * Use the Image onClick to set the link pointer.
 *
 */

export interface PImageCarouselComponent extends IHeight {
  /**
   * Array of hrefs for the images
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
  /**
   * Optional callback to keep parent state in sync with selected image
   */
  onLinkChange?: (link: string) => void;
}

export function ImageCarouselComponent(props: PImageCarouselComponent) {
  const { links, link, height, fill = false, onLinkChange } = props;

  const currentIndex = links.indexOf(link);
  const [index, setIndex] = useState(() => (currentIndex >= 0 ? currentIndex : 0));

  useEffect(() => {
    if (links.length === 0) {
      return;
    }
    if (currentIndex >= 0) {
      setIndex(currentIndex);
      return;
    }
    setIndex(0);
  }, [currentIndex, links]);

  useEffect(() => {
    if (links.length === 0 || index < 0 || index >= links.length || !onLinkChange) {
      return;
    }
    onLinkChange(links[index]);
  }, [index, links, onLinkChange]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [links.length, index]);

  const showArrows = links.length > 1;

  const handlePrevious = () => {
    if (links.length === 0) return;
    setIndex((prevIndex) => (prevIndex === 0 ? links.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    if (links.length === 0) return;
    setIndex((prevIndex) => (prevIndex === links.length - 1 ? 0 : prevIndex + 1));
  };

  if (links.length === 0) {
    return <div className="tol-image-carousel">No images available</div>;
  }

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
