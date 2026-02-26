/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Modal } from "..";
import { ImageCarouselComponent, PImageCarouselComponent } from "./ImageCarouselComponent";

/**
 * Effectively just an ImageCarouselComponent in a modal to create a larger view on an image.
 *
 */

export interface PImagesModalComponent extends PImageCarouselComponent {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Function to set the open state
   */
  setOpen: (open: boolean) => void;
  /**
   * Optional modal size (passed to Modal)
   */
  modalSize?: string;
  /**
   * Optional className for the modal
   */
  modalClassName?: string;
  /**
   * Optional style overrides for the modal content wrapper
   */
  contentStyle?: React.CSSProperties;
  /**
   * Optional content shown above the carousel
   */
  headerContent?: React.ReactNode;
}

export function ImagesModalComponent(props: PImagesModalComponent) {
  const {
    open,
    setOpen,
    links,
    link,
    setLink,
    height = "85vh",
    fill,
    alt,
    modalSize = "xl",
    modalClassName,
    contentStyle,
    headerContent,
  } = props;

  const contentStyles: React.CSSProperties = {
    ...(contentStyle?.minHeight ? {} : { ["--tol-image-modal-content-min-height" as string]: "600px" }),
    ...contentStyle,
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      size={modalSize}
      className={`tol-image-modal${modalClassName ? ` ${modalClassName}` : ""}`}
    >
      <div className="tol-image-modal__content" style={contentStyles}>
        {headerContent}
        <ImageCarouselComponent links={links} link={link} height={height} fill={fill} alt={alt} setLink={setLink} />
      </div>
    </Modal>
  );
}
