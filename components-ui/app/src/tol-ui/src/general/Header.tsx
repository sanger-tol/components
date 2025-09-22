/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useEffect } from "react";

export interface PHeader {
  title?: string;
  subTitle?: string;
  element?: ReactNode;
  height?: number;
  backgroundImageLink?: string;
}

export function Header(props: PHeader) {
  const { title, subTitle, element, height, backgroundImageLink } = props;

  return (
    <>
      <header
        className="masthead text-white"
        style={{
          backgroundImage: backgroundImageLink ? `url(${backgroundImageLink})` : undefined,
          height: height ? height : undefined
        }}
      >
        <div className="masthead-content">
          {!backgroundImageLink &&
            <>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </>
          }
        </div>
      </header>
      <div className="masthead-content text-center">
        <h1 className="masthead-heading">{title}</h1>
        <h2 className="masthead-subheading">{subTitle}</h2>
        {element}
      </div>
    </>
  );
}
