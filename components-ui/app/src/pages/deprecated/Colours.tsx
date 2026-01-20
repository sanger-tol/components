/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Widgets } from "../../tol-ui/src";

const ColourBox = ({ colourClass }: { colourClass: string }) => (
  <div style={{ boxSizing: "border-box", padding: "10px" }}>
    <p style={{ wordBreak: "break-word", paddingBottom: 6 }}>{colourClass}</p>
    <div
      key={colourClass}
      className={`${colourClass}`}
      style={{
        width: "100%",
        height: "100px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        borderRadius: 6,
      }}
    ></div>
  </div>
);

const ColourBoxes = ({
  title,
  colourClasses,
}: {
  title: string;
  colourClasses: string[];
}) => (
  <div style={{ boxSizing: "border-box" }}>
    <h5>{title}</h5>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
      }}
    >
      {colourClasses.map((colourClass) => (
        <ColourBox key={colourClass} colourClass={colourClass} />
      ))}
    </div>
  </div>
);

export function Colours() {
  const basicColourClasses = [
    "tol-bg-bg",
    "tol-bg-dark-bg",
    "tol-text-bg",
    "tol-emphasis-bg",
    "tol-grey-bg",
    "tol-grey-translucent-bg",
    "tol-grey-subtle-bg",
  ];

  const actualColourClasses = [
    "tol-primary-bg",
    "tol-primary-translucent-bg",
    "tol-primary-light-bg",
    "tol-primary-dark-bg",
    "tol-info-bg",
    "tol-info-translucent-bg",
    "tol-info-light-bg",
    "tol-info-dark-bg",
    "tol-success-bg",
    "tol-success-translucent-bg",
    "tol-success-light-bg",
    "tol-success-dark-bg",
    "tol-warning-bg",
    "tol-warning-translucent-bg",
    "tol-warning-light-bg",
    "tol-warning-dark-bg",
    "tol-danger-bg",
    "tol-danger-translucent-bg",
    "tol-danger-light-bg",
    "tol-danger-dark-bg",
    "tol-royal-bg",
    "tol-royal-translucent-bg",
    "tol-royal-light-bg",
    "tol-royal-dark-bg",
  ];

  const components = [
    {
      component: <h1>Colours</h1>,
      type: "full",
    },
    {
      component: (
        <ColourBoxes title="Greyscale" colourClasses={basicColourClasses} />
      ),
      type: "full",
    },
    {
      component: (
        <ColourBoxes title="Spectrum" colourClasses={actualColourClasses} />
      ),
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}
