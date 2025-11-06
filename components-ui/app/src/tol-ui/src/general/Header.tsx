/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useState } from "react";
import { resizeListener } from "..";

export interface PHeader {
  title?: string;
  subTitle?: string;
  image?: string;
  video?: string;
  overlayStyle?: React.CSSProperties;
  textLeft?: boolean;
  fullHeight?: boolean;
  children?: ReactNode;
}

export function Header(props: PHeader) {
  const {
    title,
    subTitle,
    image,
    video,
    overlayStyle = {},
    textLeft = false,
    fullHeight = false,
    children
  } = props;

  const [navbarOffset, setNavbarOffset] = useState<number>(0);
  const [mastheadOffset, setMastheadOffset] = useState<number>(0);

  resizeListener(() => {
    const navbar = document.getElementById("tol-navbar");
    const masthead = document.getElementById("tol-masthead");
    if (navbar) setNavbarOffset(navbar.offsetHeight);
    if (masthead) setMastheadOffset(masthead.offsetHeight);
  });

  const Backing = (
    <div>
      <div className="masthead-fade" style={overlayStyle} />
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
    </div>
  )

  return (
    <div
      className="masthead-offset"
      // if full height ignore masthead offset as no content required below header
      style={{ height: (fullHeight ? 0 : mastheadOffset) - navbarOffset }}
    >
      <header
        id="tol-masthead"
        className="masthead"
        style={{
          height: `${fullHeight ? "100vh" : ""}`,
          // need blank background if video is loading in
          background: `${image || video ? "black" : ""}`,
        }}
      >
        <div style={{ height: navbarOffset }}></div>
        <div className={`masthead-content ${textLeft ? "" : "text-center"}`}>
          <h1 className="masthead-heading">{title}</h1>
          <h2 className="masthead-subheading">{subTitle}</h2>
          {children}
        </div>
        {Backing}
      </header>
    </div>
  );
}
