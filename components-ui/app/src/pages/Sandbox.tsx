/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import { useState } from "react";
import { ColourPicker, UtilityBar, Widgets } from "../tol-ui/src";

export function Sandbox() {
  const [primaryHex, setPrimaryHex] = useState("#4A90E2");
  const [accentHex, setAccentHex] = useState("#F5A623");

  const withTitle = (title: string, component: JSX.Element) => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <UtilityBar title={{ text: title }} />
      <div style={{ flex: 1, minHeight: 0, padding: 12 }}>{component}</div>
    </div>
  );

  const components = [
    {
      component: withTitle(
        "ColourPicker - Block Style",
        <>
          <ColourPicker hex={primaryHex} onHexChange={setPrimaryHex} />
          <div style={{ marginTop: 12 }}>Selected: {primaryHex}</div>
        </>
      ),
      type: "sm",
    },
    {
      component: withTitle(
        "ColourPicker - Custom Presets",
        <>
          <ColourPicker
            hex={accentHex}
            onHexChange={setAccentHex}
            presetHexes={[
              "#D0021B",
              "#F5A623",
              "#F8E71C",
              "#7ED321",
              "#50E3C2",
              "#4A90E2",
              "#9013FE",
              "#B8E986",
            ]}
            label="Accent colour"
          />
          <div style={{ marginTop: 12 }}>Selected: {accentHex}</div>
        </>
      ),
      type: "sm",
    },
  ];

  return <Widgets components={components} />;
}
