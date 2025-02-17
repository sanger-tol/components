/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Widgets } from "../tol-ui/src";

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

function Colours() {
  const basicColourClasses = [
    "tol-bg",
    "tol-bg-dark",
    "tol-text",
    "tol-emphasis",
    "tol-grey",
    "tol-grey-translucent",
    "tol-grey-subtle",
  ];

  const actualColourClasses = [
    "tol-primary",
    "tol-primary-translucent",
    "tol-primary-light",
    "tol-primary-dark",
    "tol-info",
    "tol-info-translucent",
    "tol-info-light",
    "tol-info-dark",
    "tol-success",
    "tol-success-translucent",
    "tol-success-light",
    "tol-success-dark",
    "tol-warning",
    "tol-warning-translucent",
    "tol-warning-light",
    "tol-warning-dark",
    "tol-danger",
    "tol-danger-translucent",
    "tol-danger-light",
    "tol-danger-dark",
    "tol-royal",
    "tol-royal-translucent",
    "tol-royal-light",
    "tol-royal-dark",
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

export default Colours;
