/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import React from "react";

interface Props {
  header: string;
  subHeader?: string;
  infoText?: string;
  containerStyle?: object;
}

function AccordionHeader(props: Props) {
  const { header, subHeader, infoText, containerStyle } = props;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        ...containerStyle,
      }}
    >
      <div>
        <div style={{fontSize: "16px", fontWeight: "500"}}>{header}</div>
        <div style={{fontSize: "14px", fontWeight: "300"}}>{subHeader}</div>
      </div>
      <div style={{ flexDirection: "row" }}>
        <span style={{ fontWeight: "300", fontSize: "14px", marginRight: "30px" }}>{infoText}</span>
      </div>
    </div>
  );
}

export default AccordionHeader;
