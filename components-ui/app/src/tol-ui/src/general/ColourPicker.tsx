/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";

export interface PColourPicker {
  /**
   * Controlled hex value. Accepted formats: #RGB or #RRGGBB.
   */
  hex: string;
  /**
   * Called whenever a valid hex value changes.
   */
  onHexChange: (hex: string) => void;
  /**
   * Optional preset colours rendered as block chips.
   */
  presetHexes?: string[];
  /**
   * Optional label shown above the controls.
   */
  label?: string;
  /**
   * Disables all picker controls.
   */
  disabled?: boolean;
  /**
   * Optional className for the root wrapper.
   */
  className?: string;
  /**
   * Optional style override for the root wrapper.
   */
  style?: React.CSSProperties;
}

const DEFAULT_PRESETS = [
  "#D0021B",
  "#F5A623",
  "#F8E71C",
  "#7ED321",
  "#50E3C2",
  "#4A90E2",
  "#9013FE",
  "#B8E986",
  "#000000",
  "#4A4A4A",
  "#9B9B9B",
  "#FFFFFF",
];

function normalizeHex(value: string): string | null {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return null;
  }

  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const body = withHash.slice(1);

  if (/^[A-Fa-f0-9]{3}$/.test(body)) {
    const expanded = body
      .split("")
      .map((ch) => `${ch}${ch}`)
      .join("");
    return `#${expanded.toUpperCase()}`;
  }

  if (/^[A-Fa-f0-9]{6}$/.test(body)) {
    return `#${body.toUpperCase()}`;
  }

  return null;
}

export function ColourPicker(props: PColourPicker) {
  const {
    hex,
    onHexChange,
    presetHexes = DEFAULT_PRESETS,
    label = "Colour",
    disabled = false,
    className,
    style,
  } = props;

  const normalisedHex = useMemo(() => normalizeHex(hex), [hex]);
  const safeColourInputValue = normalisedHex || "#000000";
  const [inputValue, setInputValue] = useState(normalisedHex || hex || "");

  useEffect(() => {
    setInputValue(normalisedHex || hex || "");
  }, [hex, normalisedHex]);

  const handleTextInput = (value: string) => {
    setInputValue(value);
    const next = normalizeHex(value);
    if (next) {
      onHexChange(next);
    }
  };

  const handleNativePicker = (value: string) => {
    const next = normalizeHex(value);
    if (next) {
      onHexChange(next);
    }
  };

  return (
    <div
      className={`tol-colour-picker${className ? ` ${className}` : ""}`}
      style={style}
    >
      <div className="tol-colour-picker__label">{label}</div>

      <div className="tol-colour-picker__controls">
        <div className={`tol-colour-picker__picker${disabled ? " tol-colour-picker__picker--disabled" : ""}`}>
          <HexColorPicker
            color={safeColourInputValue}
            onChange={handleNativePicker}
          />
        </div>
        <input
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={(event) => handleTextInput(event.target.value)}
          placeholder="#RRGGBB"
          className="tol-colour-picker__hex"
          aria-label="Hex colour code"
        />
      </div>

      <div className="tol-colour-picker__swatches" role="list" aria-label="Preset colours">
        {presetHexes.map((preset) => {
          const swatchHex = normalizeHex(preset);
          if (!swatchHex) {
            return null;
          }

          const selected = swatchHex === normalisedHex;
          return (
            <button
              key={swatchHex}
              type="button"
              disabled={disabled}
              className={`tol-colour-picker__swatch${selected ? " tol-colour-picker__swatch--selected" : ""}`}
              style={{ backgroundColor: swatchHex }}
              onClick={() => onHexChange(swatchHex)}
              aria-label={`Use colour ${swatchHex}`}
            />
          );
        })}
      </div>
    </div>
  );
}
