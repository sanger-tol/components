/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useState, useEffect, useRef } from "react";
import { Popover, Whisper } from "rsuite";

export interface Props {
  contents: ReactNode;
  children: JSX.Element;
  placement?: string;
  delay?: number;
  closeOnClick?: boolean;
}

export function ClickOverlay(props: Props) {
  let { contents, children, placement = "auto", delay, closeOnClick } = props;
  const overlayRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const renderTooltip = () => (
    <Popover
      onClick={() => {
        closeOnClick && setOpen(false);
      }}
    >
      {contents}
    </Popover>
  );

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
