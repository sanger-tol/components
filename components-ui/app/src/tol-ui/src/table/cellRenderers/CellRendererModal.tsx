import { Dispatch, SetStateAction, useState } from "react";

import { AttributeTitle, CellRendererParamOptions, FieldMeta, IconTooltip, IRemoteTarget, Modal } from "../..";

export interface PCellRendererModal extends IRemoteTarget {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta,
  setFieldMeta: (fieldMeta: FieldMeta) => void,
}

export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, objectType, dataSource, attributeId, fieldMeta, setFieldMeta } = props;

  const [selectedParameter, setSelectedParameter] = useState<string | undefined>()

  const TooltipHelp = (
    <ul>
      <li>
        {"When using text inputs, if you want to reference an attribute on the current Data Object, use the syntax ${attribute}"}
      </li>
      <li>
        {"Alternatively, if you would like to access attributes on the parent, prefix the attribute with a '~'. For example, ${~attribute}"}
      </li>
    </ul>
  );

  const Header = (
    <>
      <h5>
        Configure Cell Renderer for
        <AttributeTitle
          objectType={objectType}
          dataSource={dataSource}
          attributeId={attributeId}
        />
      </h5>
      <span>
        Please be aware that the selected Cell Renderer works on a current Data Object. Find out more:
      </span>
      <span className="tol-data-point-renderer-info">
        <IconTooltip contents={TooltipHelp} />
      </span>
    </>
  );

  const CellRendererSelector = <></>;

  const FirstPage = (
    <>
      {CellRendererSelector}
      <hr />
      <p>Params</p>
    </>
  );
  const SecondPage = <CellRendererParamOptions param={selectedParameter || ""} />;

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      header={Header}
      size={selectedParameter ? "sm" : "xs"}
    >
      {selectedParameter ? SecondPage : FirstPage}
    </Modal>
  )
}
