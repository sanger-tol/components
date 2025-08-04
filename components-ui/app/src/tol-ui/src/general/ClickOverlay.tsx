/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useState, useEffect, useRef } from "react";
import { Popover, Whisper } from "rsuite";

interface PClickOverlay {
  contents: ReactNode;
  children: JSX.Element;
  placement?: string;
  delay?: number;
  closeOnClick?: boolean;
}

export function ClickOverlay(props: PClickOverlay) {
  let { contents, children, placement = "auto", delay, closeOnClick } = props;
  const overlayRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, []);

  const renderTooltip = () => (
    <Popover
      onClick={() => {
        closeOnClick && setOpen(false);
      }}
    >
      {contents}
    </Popover>
  );

  return (
    <div ref={overlayRef}>
      <Whisper
        // @ts-ignore
        placement={placement}
        controlId="control-id-clickable"
        trigger="click"
        speaker={renderTooltip()}
        delayOpen={delay}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
      >
        {children}
      </Whisper>
    </div>
  );
}
