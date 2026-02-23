/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal } from "..";
import { ImageCarouselComponent } from "./ImageCarouselComponent";

/**
 * Effectively just an ImageCarouselComponent in a modal to create a larger view on an image.
 * Uses our Modal component.
 *
 */

export interface PImageModalComponent {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Function to set the open state
   */
  setOpen: (open: boolean) => void;
  /**
   * Array of image links
   */
  links: string[];
  /**
   * Current selected image link
   */
  link: string;
  /**
   * Optional callback to keep parent state in sync with selected image
   */
  onLinkChange?: (link: string) => void;
}

export function ImageModalComponent(props: PImageModalComponent) {
  const { open, setOpen, links, link, onLinkChange } = props;

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      size="xl"
      className="tol-image-modal"
      closeButton={false}
    >
      <div style={{ position: "relative", textAlign: "center", minHeight: "600px" }}>
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
          }}
          aria-label="Close"
        >
          ×
        </button>
        <ImageCarouselComponent links={links} link={link} height="85vh" onLinkChange={onLinkChange} />
      </div>
    </Modal>
  );
}
