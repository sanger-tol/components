/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from "react";
import { Accordion as Acc } from "rsuite";
import AccordionHeader from "./AccordionHeader";
import DropdownButtons from "../../general/DropdownButtons";
import ConfirmationModal from "../ConfirmationModal";
import {
  DropdownButtonProps,
  DropdownMainIconProps,
} from "../../general/DropdownButtons";
import { httpClient, TsDataSource } from "../../services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faTable } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { BOARD_ENDPOINTS, BoardObjectTypes } from "../../constants";

interface AccordionBaseProps {
  id: string;
  title: string;
  itemType?: string;
  filterItem?: string;
  endpointUrl?: string;
  subHeader?: string;
  renderChildren: (childIds: string[]) => React.ReactNode;
  infoText?: string;
  clickable?: boolean;
}

interface BoardsAccordionProps {
  boardDetails: string[];
  setBoardDetails: any;
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

// All of these functions will need to be replaced with TsDataSource ones
// When all MRs have been merged into dev
const returnViewInfo = async (viewId: string) => {
  try {
    const res: any = await httpClient().get(`/${BOARD_ENDPOINTS.VIEW}`, {
      params: {
        filter: {
          and_: {
            id: { eq: { value: viewId } },
          },
        },
      },
    });
    return res.data.data[0].attributes.title;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const returnZoneInfo = async (zoneId: string) => {
  try {
    const res: any = await httpClient().get(`/${BOARD_ENDPOINTS.ZONE}`, {
      params: {
        filter: {
          and_: {
            id: { eq: { value: zoneId } },
          },
        },
      },
    });
    return res.data.data.map((item: any) => ({
      title: item.attributes.title,
      objectType: item.attributes.object_type,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

const returnComponentInfo = async (componentId: string) => {
  try {
    const res: any = await httpClient().get(`/${BOARD_ENDPOINTS.COMPONENT}`, {
      params: {
        filter: {
          and_: {
            id: { eq: { value: componentId } },
          },
        },
      },
    });
    return res.data.data.map((item: any) => ({
      title: item.attributes.title,
      componentType: item.attributes.component_type,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchSubItemId = async (
  id: string,
  endpointUrl?: string,
  filterItem?: string,
  itemType?: any,
) => {
  try {
    const res: any = await httpClient().get(`/${endpointUrl}`, {
      params: {
        filter: {
          and_: {
            [`${filterItem}`]: { eq: { value: id } },
          },
        },
      },
    });
    return res.data.data.map((item: any) => ({
      id: item.relationships[itemType].data.id,
      order: item.attributes.order,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

const useItemData = <T,>(
  ids: string[],
  fetchFunction: (id: string) => Promise<T> | T,
) => {
  const [itemData, setItemData] = useState<{ [key: string]: T }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchItems = async () => {
      setLoading(true);

      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const data = await fetchFunction(id);
            return { [id]: data };
          }),
        );

        if (mounted) {
          setItemData(Object.assign({}, ...results));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      mounted = false;
    };
  }, [ids, fetchFunction]);

  return { itemData, loading };
};

function Accordion(props: BoardsAccordionProps) {
  const { boardDetails, setBoardDetails } = props;
  const history = useHistory();
  const [openDelete, setOpenDelete] = useState(false);
  const [boardIdToDelete, setBoardIdToDelete] = useState<string | null>(null);

  const goToBoard = (boardId: string) => {
    history.push(`/board/${boardId}`);
  };

  // @ts-ignore
  const goToView = (boardId: string, viewId: string) => {
    history.push(`/board/${boardId}`);
  };

  // @ts-ignore
  const deleteConfirmationModal = (boardId: string) => {
    if (boardId === boardIdToDelete) return (
      <ConfirmationModal
        setOpen={setOpenDelete}
        open={openDelete}
        // @ts-ignore
        onConfirmClick={deleteBoard}
        itemType={"board"}
      />
    );
    return <></>;
  };

  const deleteBoard = () => {
    if (boardIdToDelete === null) return;
    const deletedBoard = boardDetails.filter(
      (board: any) => board.id !== boardIdToDelete,
    );
    setBoardDetails(deletedBoard);
    const ds = new TsDataSource();
    ds.custom(`${BOARD_ENDPOINTS.DELETE_BOARD}/${boardIdToDelete}`, "DELETE");
    setBoardIdToDelete(null);
  };

  const handleDelete = (id: string) => {
    setBoardIdToDelete(id);
    setOpenDelete(true);
  };

  const boardOptionsButton: DropdownMainIconProps = {
    outline: true,
    type: "primary",
    icon: "ellipsis-v",
    className: "my-boards-dropdown-buttons",
  };

  const dropdownButtons = (
    boardId: string,
    viewId?: string,
  ): DropdownButtonProps[] => [
    {
      name: "View",
      action: () => {
        viewId !== undefined ? goToView(boardId, viewId!) : goToBoard(boardId);
      },
    },
    {
      name: "Delete",
      action: () => {
        handleDelete(boardId);
      },
    },
  ];

  const boardOptionsDropdownButton = (boardId: string, viewId?: string) => (
    <DropdownButtons
      mainButtonIcon={boardOptionsButton}
      placement="leftStart"
      dropdownButtons={dropdownButtons(boardId, viewId)}
      showMessages={false}
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
      filterItem,
      endpointUrl,
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
        const ids = await fetchSubItemId(id, endpointUrl, filterItem, itemType);
        setChildIds(ids.map((id: any) => id.id));
        setLoading(false);
        setExpanded(true);
      }
    };

    return (
      <Acc
        bordered
        style={{ flex: "1", overflow: "visible" }}
        onClick={handleExpand}
      >
        <Acc.Panel
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
        </Acc.Panel>
      </Acc>
    );
  };

  const Components = (props: ComponentsProps) => {
    const { componentIds } = props;
    const { itemData: componentData, loading } = useItemData(
      componentIds,
      returnComponentInfo,
    );

    if (!componentIds?.length) return null;
    if (loading)
      return <div style={{ textAlign: "center" }}>Loading views...</div>;

    const componentTitle = (title: any, componentType: string) => {
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
          const component = componentData[componentId][0];
          return (
            <div key={componentId} style={{ marginTop: "5px" }}>
              {componentTitle(component.title, component.componentType)}
            </div>
          );
        })}
      </div>
    );
  };

  const ZonesAccordion = (props: ZonesAccordionProps) => {
    const { zoneIds } = props;
    const { itemData: zoneData, loading } = useItemData(
      zoneIds,
      returnZoneInfo,
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
                endpointUrl={BOARD_ENDPOINTS.ZONE_COMPONENTS}
                filterItem={"zone.id"}
                itemType={BoardObjectTypes.COMPONENT as string}
                title={zoneData[zoneId][0].title || ""}
                subHeader={zoneData[zoneId][0].objectType}
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
    const { itemData: viewData, loading } = useItemData(
      viewIds,
      returnViewInfo,
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
                  title={viewData[viewId] || ""}
                  endpointUrl={BOARD_ENDPOINTS.VIEW_ZONES}
                  filterItem={"view.id"}
                  itemType={BoardObjectTypes.ZONE as string}
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
                {boardOptionsDropdownButton(boardId!, viewId)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {boardDetails.map((board: any) => (
        <div data-testid={board.title} key={board.id} style={{ marginTop: "20px", display: "flex" }}>
          <div style={{ flex: "1" }}>
            <AccordionBase
              id={board.id}
              title={board.title}
              endpointUrl={BOARD_ENDPOINTS.BOARD_VIEWS}
              filterItem={"board.id"}
              itemType={BoardObjectTypes.VIEW as string}
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
            {boardOptionsDropdownButton(board.id, undefined)}
          </div>
          {deleteConfirmationModal(board.id)}
        </div>
      ))}
    </div>
  );
}

export default Accordion;
