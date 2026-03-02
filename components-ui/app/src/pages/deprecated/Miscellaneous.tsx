/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Button,
  CenterContent,
  Modal,
  ObjectDetail,
  IconTooltip,
  createTextGeneratorFactory
} from "../../tol-ui/src";
import { useState } from "react";

const jsonData = {
  "Common name": "Human",
  Family: "Hominidae",
  Genus: "Homo",
  Order: "Primates",
  "Scientific Name": "Homo sapiens",
  "STS Species ID": 5443,
};

const markdownString = `# Observe a heading!!!

_This_ is some **information**!`;

export function Miscellaneous() {
  const [modalOpen, setModalOpen] = useState(false);
  const text = createTextGeneratorFactory();

  return (
    <div>
      <CenterContent>
        <h2>Modal</h2>
        <Modal size="full" open={modalOpen} setOpen={setModalOpen}>
          <h2>Test Modal</h2>
          <p>
            {text.generateParagraphs(2)}
          </p>
        </Modal>
        <Button onClick={() => setModalOpen(true)} text="Example Modal" />

        <h2 className="mt-5">Info Tooltip</h2>
        <IconTooltip contents={markdownString} />

        <h2 className="mt-5">Tooltip (with markdown disabled)</h2>
        <IconTooltip contents={markdownString} disableMarkdown={true} />

        <h2 className="mt-5">Object Detail</h2>
        <ObjectDetail data={jsonData} />
      </CenterContent>
    </div>
  );
}
