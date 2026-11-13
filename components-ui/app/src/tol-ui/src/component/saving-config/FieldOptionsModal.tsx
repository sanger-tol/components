/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ComponentType, useState } from "react";
import {
  AttributeTitle,
  DatapointRendererConfigurer,
  FIELD_SETTINGS_TAB_STORAGE_KEY,
  Modal,
  Tabs,
} from "../..";
import type { IRemoteTarget, TFieldOptionsContent } from "../..";


/** Props for the field-specific settings modal. */
export interface PFieldOptionsModal extends IRemoteTarget, TFieldOptionsContent {
  /** Whether the modal is visible. */
  open: boolean;
  /** Updates the modal visibility, typically to close it. */
  setOpen: (open: boolean) => void;
  /** Component rendered in the Options tab for the selected field. */
  FieldOptionsContent: ComponentType<TFieldOptionsContent>;
}

/**
 * Renders field-specific settings in a modal with Renderer and Options tabs.
 */
export function FieldOptionsModal(props: PFieldOptionsModal) {
  const { setOpen: setModalOpen, ...rendererProps } = props;
  const {
    open,
    objectType,
    dataSource,
    attributeId,
    fieldMeta,
    setFieldMeta,
    FieldOptionsContent,
  } = props;

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(FIELD_SETTINGS_TAB_STORAGE_KEY) ?? "renderer";
  });

  const Header = (
    <>
      <AttributeTitle
        objectType={objectType}
        dataSource={dataSource}
        attributeId={attributeId}
        titleElement="h5"
      />
      <Tabs
        activeKey={activeTab}
        onSelect={(key) => {
          const tab = String(key);
          setActiveTab(tab);
          localStorage.setItem(FIELD_SETTINGS_TAB_STORAGE_KEY, tab);
        }}
      >
        <Tabs.Tab eventKey="renderer" title="Renderer" />
        <Tabs.Tab eventKey="options" title="Options" />
      </Tabs>
      <hr />
    </>
  );

  return (
    <Modal
      size="sm"
      open={open}
      setOpen={setModalOpen}
      header={Header}
    >
      <div className="tol-min-h-3xl">
        {activeTab === "options" ? (
          <FieldOptionsContent
            attributeId={attributeId}
            fieldMeta={fieldMeta}
            setFieldMeta={setFieldMeta}
          />
        ) : (
          <DatapointRendererConfigurer
            {...rendererProps}
          />
        )}
      </div>
    </Modal>
  );
}
