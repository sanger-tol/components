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
   * Optional className for the close button
   */
  closeButtonClassName?: string;
  /**
   * Optional style overrides for the close button
   */
  closeButtonStyle?: React.CSSProperties;
  /**
   * Optional content for the close button
   */
  closeButtonContent?: React.ReactNode;
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
    modalSize = "xl",
    modalClassName,
    contentStyle,
    closeButtonClassName,
    closeButtonStyle,
    closeButtonContent,
  } = props;

  const contentStyles: React.CSSProperties = {
    ...(contentStyle?.minHeight ? {} : { ["--tol-image-modal-content-min-height" as string]: "600px" }),
    ...contentStyle,
  };

  const closeButtonStyles: React.CSSProperties = {
    ...closeButtonStyle,
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      size={modalSize}
      className={`tol-image-modal${modalClassName ? ` ${modalClassName}` : ""}`}
      closeButton={false}
    >
      <div className="tol-image-modal__content" style={contentStyles}>
        <button
          onClick={() => setOpen(false)}
          style={closeButtonStyles}
          className={`tol-image-modal__close${closeButtonClassName ? ` ${closeButtonClassName}` : ""}`}
          aria-label="Close"
        >
          {closeButtonContent ?? "×"}
        </button>
        <ImageCarouselComponent links={links} link={link} height={height} fill={fill} setLink={setLink} />
      </div>
    </Modal>
  );
}
