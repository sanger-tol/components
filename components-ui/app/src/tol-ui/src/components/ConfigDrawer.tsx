/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Drawer } from "../general";
import { IConfigDrawer } from "./interfaces";
import { AttributeSelector } from "./index";
import { Button, Icon, env } from "../index";
import { normaliseCaps } from "../general/Utils";
import { getFlattenedMetaData } from "./Utils";
import { getSourceColour } from "../table/Utils";

function ConfigDrawer(props: IConfigDrawer) {
  const { open, setOpen, title } = props;
  const [attribute, setAttribute] = useState<string[]>([]);
  const [entityMeta, setEntityMeta] = useState<any>({});
  const [recentlyMoved, setRecentlyMoved] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  // const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log(attribute);
  }, [attribute]);

  const moveAttributeUp = (index: number) => {
    if (index === 0) return;
    const newAttributes = [...attribute];
    [newAttributes[index - 1], newAttributes[index]] = [
      newAttributes[index],
      newAttributes[index - 1],
    ];
    setAttribute(newAttributes);
    setRecentlyMoved(index - 1);
    setTimeout(() => setRecentlyMoved(null), 300);
  };

  const moveAttributeDown = (index: number) => {
    if (index === attribute.length - 1) return;
    const newAttributes = [...attribute];
    [newAttributes[index + 1], newAttributes[index]] = [
      newAttributes[index],
      newAttributes[index + 1],
    ];
    setAttribute(newAttributes);
    setRecentlyMoved(index + 1);
    setTimeout(() => setRecentlyMoved(null), 300);
  };

  const removeAttribute = (index: number) => {
    setDeletingIndex(index);
    setTimeout(() => {
      setAttribute(attribute.filter((_, i) => i !== index));
      setDeletingIndex(null);
    }, 300);
  };

  const selectedColumn = (att: string, index: number) => {
    //TODO: Add endpoint instead of fixed type
    const source = getFlattenedMetaData(entityMeta, "run_data", att)["source"];
    const sourceColour = getSourceColour(source);
    return (
      <div
        className={`config-drawer-selected-column ${
          recentlyMoved === index ? "highlight" : ""
        } ${deletingIndex === index ? "deleting" : ""}`}
        key={att}
        style={{ transition: "all 0.3s ease" }}
      >
        {normaliseCaps(att)}
        <div style={{ display: "flex" }}>
          {source && (
            <div
              className="customise-config-source-no-float"
              // @ts-ignore
              style={{
                "--config-source-bg-color": sourceColour,
              }}
            >
              {normaliseCaps(source)}
            </div>
          )}
          <div
            className="active-column-remove-btn"
            onClick={() => moveAttributeDown(index)}
          >
            <Icon icon="arrow-down" size="lg" />
          </div>
          <div
            className="active-column-remove-btn"
            onClick={() => moveAttributeUp(index)}
          >
            <Icon icon="arrow-up" size="lg" />
          </div>
          <div
            className="active-column-remove-btn"
            onClick={() => removeAttribute(index)}
          >
            <Icon icon="close" size="lg" />
          </div>
        </div>
      </div>
    );
  };

  const attSelector = (
    <div>
      <div>
        <AttributeSelector
          endpoint={"run_data"}
          placeholder="Select columns to display"
          baseUrl={env.TOL_DATA} //TODO: REMOVE!
          attribute={attribute}
          setAttribute={setAttribute}
          disabledValues={null}
          numPopulatedFields={0}
          setEntityMeta={setEntityMeta}
        />
      </div>
      <div>
        <h6 style={{ borderBottom: "1px solid grey", paddingBottom: "5px" }}>
          Active Columns:
        </h6>
        {attribute.map((att, index) => (
          <div
            key={index}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            {selectedColumn(att, index)}
          </div>
        ))}
      </div>
      <div>
        <Button
          text="Save Columns"
          onClick={() => setOpen(!open)}
          type="success"
          className="config-drawer-save-button"
        />
      </div>
    </div>
  );

  return (
    <div>
      <Drawer
        title={title}
        open={open}
        setOpen={setOpen}
        children={attSelector}
      />
    </div>
  );
}

export default ConfigDrawer;
