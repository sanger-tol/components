/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal } from "..";
import { ImageCarouselComponent } from "./ImageCarouselComponent";

/**
 * Effectively just an ImageCarouselComponent in a modal to create a larger view on an image.
 * Use our Modal component.
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
}

export function ImageModalComponent(props: PImageModalComponent) {
  const { open, setOpen, links, link } = props;

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      size="lg"
      className="tol-image-modal"
    >
      <div style={{ textAlign: "center", minHeight: "400px" }}>
        <ImageCarouselComponent links={links} link={link} height="80vh" />
      </div>
    </Modal>
  );
}
