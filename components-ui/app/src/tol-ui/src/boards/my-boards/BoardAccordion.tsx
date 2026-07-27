/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from "react";
import { Accordion } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faTable } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import {
  IDropdownButtonConfig,
  IDropdownMainIconProps,
  TsDataSource,
  AccordionHeader,
  DeprecatedDropdownButtons,
  ConfirmationModal,
  BOARD_ENTITIES,
  useItemData,
  fetchSubItemId,
  returnComponentInfo,
  returnZoneInfo,
  returnViewInfo,
  deleteBoardEntity,
} from "../..";

interface AccordionBaseProps {
  id: string;
  objectType: string;
  filterKey: string;
  title: string;
  itemType?: string;
  subHeader?: string;
  renderChildren: (childIds: string[]) => React.ReactNode;
  infoText?: string;
  clickable?: boolean;
}

interface BoardsAccordionProps {
  boardDetails: string[];
  setBoardDetails: any;
  boardDataSource: TsDataSource;
}

interface ViewsAccordionProps {
  boardId?: string;
  viewIds: string[];
}

interface ZonesAccordionProps {
  zoneIds: string[];
}

interface ComponentsProps {
  componentIds: string[];
}

export function BoardAccordion(props: BoardsAccordionProps) {
  const { boardDetails, setBoardDetails, boardDataSource } = props;
  const history = useHistory();
  const [openDelete, setOpenDelete] = useState(false);
  const [boardIdToDelete, setBoardIdToDelete] = useState<string | null>(null);

  const goToBoard = (boardId: string) => {
    history.push(`/${BOARD_ENTITIES.ENTITIES.BOARD}/${boardId}`);
  };

  // @ts-ignore
  const goToView = (boardId: string, viewId: string) => {
    history.push(`/${BOARD_ENTITIES.ENTITIES.BOARD}/${boardId}`);
  };

  // @ts-ignore
  const deleteConfirmationModal = (boardId: string) => {
    if (boardId === boardIdToDelete) {
      return (
        <ConfirmationModal
          setOpen={setOpenDelete}
          open={openDelete}
          onConfirmClick={deleteBoard}
          itemType={BOARD_ENTITIES.ENTITIES.BOARD}
        />
      );
    }
    return <></>;
  };

  const deleteBoard = async () => {
    if (boardIdToDelete === null) return;
    const deletedBoard = boardDetails.filter(
      (board: any) => board.id !== boardIdToDelete,
    );
    setBoardDetails(deletedBoard);
    await deleteBoardEntity(boardDataSource, boardIdToDelete)
      .then(() => {
        setOpenDelete(false);
        setBoardIdToDelete(null);
      })
  }

  const onDeleteClick = (id: string) => {
    setBoardIdToDelete(id);
    setOpenDelete(true);
  };

  const boardOptionsButton: IDropdownMainIconProps = {
    outline: true,
    type: "primary",
    icon: "ellipsis-v",
    className: "my-boards-dropdown-buttons",
  };

  const dropdownButtons = (
    boardId: string,
    viewId?: string,
  ): IDropdownButtonConfig[] => [
      {
        name: "View",
        action: () => {
          viewId !== undefined ? goToView(boardId, viewId!) : goToBoard(boardId);
        },
      },
      {
        name: "Delete",
        action: () => {
          onDeleteClick(boardId);
        },
      },
    ];

  const BoardOptionsDropdownButton = (boardId: string, viewId?: string) => (
    <DeprecatedDropdownButtons
      mainButtonIcon={boardOptionsButton}
      placement="leftStart"
      dropdownButtons={dropdownButtons(boardId, viewId)}
      menuStyle={{
        position: "absolute",
        zIndex: "1050",
        display: "inline-block",
      }}
    />
  );

  const AccordionBase = (props: AccordionBaseProps) => {
    const {
      id,
      itemType,
      filterKey,
      objectType,
      title,
      subHeader,
      renderChildren,
      infoText,
      clickable,
    } = props;

    const [childIds, setChildIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleExpand = async () => {
      if (!expanded) {
        setLoading(true);
        const ids = await fetchSubItemId(
          id,
          objectType,
          boardDataSource,
          filterKey,
          itemType,
        );
        setChildIds(ids.map((id: any) => id.id));
        setLoading(false);
        setExpanded(true);
      }
    };

    return (
      <Accordion
        bordered
        style={{ flex: "1", overflow: "visible" }}
        onClick={handleExpand}
      >
        <Accordion.Panel
          style={{ overflow: "visible", flex: "1" }}
          header={
            <div onClick={clickable ? () => goToBoard(id) : undefined}>
              <AccordionHeader
                header={title}
                subHeader={subHeader}
                infoText={infoText || `ID: ${id}`}
              />
            </div>
          }
        >
          {loading ? <div>Loading...</div> : renderChildren(childIds)}
        </Accordion.Panel>
      </Accordion>
    );
  };

  const Components = (props: ComponentsProps) => {
    const { componentIds } = props;
    const { itemData: componentData, loading } = useItemData(
      componentIds,
      (id: string) => returnComponentInfo(boardDataSource, id),
    );

    if (!componentIds?.length) return null;
    if (loading)
      return <div style={{ textAlign: "center" }}>Loading views...</div>;

    const ComponentTitle = (title: any, componentType: string) => {
      return (
        <span
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <FontAwesomeIcon
            icon={componentType === "chart" ? faChartSimple : faTable}
          />
          <p style={{ marginLeft: "20px" }}>{title}</p>
        </span>
      );
    };

    return (
      <div>
        <p style={{ marginBottom: "10px" }}>Zone Components:</p>
        {componentIds.map((componentId) => {
          if (componentData[componentId]) {
            const component = componentData[componentId][0];
            return (
              <div key={componentId} style={{ marginTop: "5px" }}>
                {ComponentTitle(component.title, component.componentType)}
              </div>
            );
          }
        })}
      </div>
    );
  };

  const ZonesAccordion = (props: ZonesAccordionProps) => {
    const { zoneIds } = props;
    const { itemData: zoneData, loading } = useItemData(zoneIds, (id: string) =>
      returnZoneInfo(boardDataSource, id),
    );

    if (!zoneIds?.length) return null;
    if (loading)
      return <div style={{ textAlign: "center" }}>Loading views...</div>;

    return (
      <div>
        {zoneIds.map((zoneId) => {
          return (
            <div key={zoneId} style={{ marginTop: "15px" }}>
              <AccordionBase
                id={zoneId}
                objectType={BOARD_ENTITIES.JOINING_ENTITIES.COMPONENT_ZONE}
                filterKey="zone.id"
                itemType={BOARD_ENTITIES.ENTITIES.COMPONENT as string}
                title={zoneData[zoneId]?.[0].title || "Untitled Zone"}
                subHeader={zoneData[zoneId]?.[0].objectType}
                clickable={false}
                renderChildren={(componentIds) => (
                  <Components componentIds={componentIds} />
                )}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const ViewsAccordion = (props: ViewsAccordionProps) => {
    const { boardId, viewIds } = props;
    const { itemData: viewData, loading } = useItemData(viewIds, (id: string) =>
      returnViewInfo(boardDataSource, id),
    );

    if (!viewIds?.length) return null;
    if (loading)
      return <div style={{ textAlign: "center" }}>Loading views...</div>;

    return (
      <div>
        {viewIds.map((viewId) => {
          return (
            <div key={viewId} style={{ marginTop: "15px", display: "flex" }}>
              <div style={{ flex: "1" }}>
                <AccordionBase
                  id={viewId}
                  title={viewData[viewId] || "Untitled View (Coming Soon)"}
                  objectType={BOARD_ENTITIES.JOINING_ENTITIES.ZONE_VIEW}
                  filterKey="view.id"
                  itemType={BOARD_ENTITIES.ENTITIES.ZONE}
                  clickable={false}
                  renderChildren={(zoneIds) => (
                    <ZonesAccordion zoneIds={zoneIds} />
                  )}
                />
              </div>
              <div
                style={{
                  top: "0",
                  marginLeft: "10px",
                  marginRight: "5px",
                  marginTop: "15px",
                }}
              >
                {BoardOptionsDropdownButton(boardId!, viewId)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {boardDetails.map((board: any) => (
        <div
          data-testid={board.title}
          key={board.id}
          className="tol-board-accordion"
        >
          <div style={{ flex: "1" }}>
            <AccordionBase
              id={board.id}
              title={board.title}
              objectType={BOARD_ENTITIES.JOINING_ENTITIES.VIEW_BOARD}
              filterKey="board.id"
              itemType={BOARD_ENTITIES.ENTITIES.VIEW}
              clickable={true}
              renderChildren={(viewIds) => (
                <ViewsAccordion boardId={board.id} viewIds={viewIds} />
              )}
            />
          </div>
          <div
            style={{
              top: "0",
              marginLeft: "10px",
              marginRight: "5px",
              marginTop: "15px",
            }}
          >
            {BoardOptionsDropdownButton(board.id, undefined)}
          </div>
          {deleteConfirmationModal(board.id)}
        </div>
      ))}
    </>
  );
}
