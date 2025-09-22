/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";

export interface PHeader {
  title?: string;
  subTitle?: string;
  element?: ReactNode;
  image?: string;
  video?: string;
  fade?: number;
  landingPage?: boolean;
}

export function Header(props: PHeader) {
  const { title, subTitle, element, landingPage, image, video } = props;

  return (
    <>
      <header
        className="masthead"
        style={{
          height: landingPage ? "100vh" : undefined
        }}
      >
        {image && <img className="masthead-media" src={image} alt="background" />}
        {video && (
          <video className="masthead-media" autoPlay loop muted>
            <source src={video} type="video/mp4" />
          </video>
        )}
        <div className="masthead-default">
          {!image && !video &&
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
