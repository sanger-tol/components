/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Modal } from "..";
import { ImageCarouselComponent, PImageCarouselComponent } from "./ImageCarouselComponent";

/**
 * Effectively just an ImageCarouselComponent in a modal to create a larger view on an image.
 * Uses our Modal component.
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

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      size={modalSize}
      className={`tol-image-modal${modalClassName ? ` ${modalClassName}` : ""}`}
      closeButton={false}
    >
      <div style={{ position: "relative", textAlign: "center", minHeight: "600px", ...contentStyle }}>
        <button
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "var(--tol-grey)",
            color: "var(--tol-light)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            fontSize: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 0,
            ...closeButtonStyle,
          }}
          className={closeButtonClassName}
          aria-label="Close"
        >
          {closeButtonContent ?? "×"}
        </button>
        <ImageCarouselComponent links={links} link={link} height={height} fill={fill} setLink={setLink} />
      </div>
    </Modal>
  );
}
