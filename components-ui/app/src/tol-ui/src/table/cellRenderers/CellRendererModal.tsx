import { Dispatch, SetStateAction, useState } from "react";

import {
  AttributeTitle,
  Button,
  BUTTONS,
  CellRendererParamOptions,
  FieldMeta,
  IconTooltip,
  IRemoteTarget,
  Modal,
  TCellRenderer
} from "../..";

export interface PCellRendererModal extends IRemoteTarget {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta,
  setFieldMeta: (fieldMeta: FieldMeta) => void,
}

export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, objectType, dataSource, attributeId, fieldMeta, setFieldMeta } = props;

  // const [renderer, setRenderer] = useState<TCellRenderer>();
  const [selectedParameter, setSelectedParameter] = useState<string | undefined>();

  // Used in the Header
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

  // The header is shared between both pages
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

  // The dropdown where the cell renderer type is chosen. This determines which parameters
  // need to be shown in ParameterList
  const CellRendererSelector = <></>;

  // Each parameter associated with the selected cell renderer type
  const ParameterList = (
    <>
      <p>Parameter list here</p>
    </>
  );

  // Shown only on the first page. Needs to be added as the action button instead of at the
  // bottom of the page so that it sits alongside the close button.
  // (In contrast to the second page, which has custom buttons at the bottom)
  const AddCellRendererButton = (
    <Button
      {...BUTTONS.ADD}
      // disabled={!rendererHasPendingChanges || requiredParamsCount > filledParamsCount}
      // onClick={onAddNewRenderer}
    />
  );

  // The first page of the modal where the cell renderer type is selected and its parameters
  // shown. Some parameters can be edited directly, while others take you to the second page
  // to edit them
  const FirstPage = (
    <>
      {CellRendererSelector}
      <hr />
      {ParameterList}
    </>
  );
  // The second page of the modal: a dedicated space to edit a specific parameter
  const SecondPage = <CellRendererParamOptions param={selectedParameter || ""} />;

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      header={Header}
      size={selectedParameter ? "sm" : "xs"}
      closeButton={!selectedParameter}
      actionButton={selectedParameter ? undefined : AddCellRendererButton}
    >
      {selectedParameter ? SecondPage : FirstPage}
    </Modal>
  )
}
