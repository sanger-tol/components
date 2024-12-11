/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from "react";
import { Accordion as Acc } from "rsuite";
import { AccordionHeader, DropdownButtons } from "./index";
import { DropdownButtonProps, DropdownMainIconProps } from "./DropdownButtons";
import { httpClient } from "src/services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faChartSimple,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";

interface AccordionBaseProps {
  id: string;
  title: string;
  itemType?: string;
  filterItem?: string;
  endpointUrl?: string;
  subHeader?: string;
  renderChildren: (childIds: string[]) => React.ReactNode;
  infoText?: string;
}

interface BoardsAccordionProps {
  boardDetails: string[];
}

interface ViewsAccordionProps {
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
    const res = await httpClient().get(`/view`, {
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
    const res = await httpClient().get(`/zone`, {
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
    const res = await httpClient().get(`/component`, {
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
  itemType?: any
) => {
  try {
    const res = await httpClient().get(`/${endpointUrl}`, {
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
  fetchFunction: (id: string) => Promise<T> | T
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
          })
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
  const { boardDetails } = props;
  const history = useHistory();

  const goToBoard = (id: string) => {
    history.push(`/board/${id}/view/1`);
  };

  const goToView = (boardId: string, viewId: string) => {
    history.push(`/board/${boardId}/view/${viewId}`);
  };

  const boardOptionsButton: DropdownMainIconProps = {
    mainIcon: (
      <FontAwesomeIcon
        icon={faEllipsisVertical}
        size={"lg"}
        style={{ color: "#fff" }}
      />
    ),
    style: { background: "transparent" },
  };

  // Dummy actions and buttons at the moment, can be changed to the
  // real ones once the decision has been made
  const dropdownButtons: DropdownButtonProps[] = [
    {
      dropdownButtonName: "View",
      action: () => {
        console.log("View Item (will need to get item and board ID)");
      },
    },
    {
      dropdownButtonName: "Rename",
      action: () => {
        console.log("Rename Item (Still think this is a good idea)");
      },
    },
    {
      dropdownButtonName: "Share",
      action: () => {
        console.log("Share Item (Oh Yes!)");
      },
    },
    {
      dropdownButtonName: "Delete",
      action: () => {
        console.log("Helpful!");
      },
    },
  ];

  const boardOptionsDropdownButton = (
    <DropdownButtons
      mainButtonIcon={boardOptionsButton}
      placement="leftStart"
      globalDisabled={false}
      dropdownButtons={dropdownButtons}
      menuStyle={{
        position: "absolute",
        zIndex: "1050",
        top: "100%",
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
            <div>
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
      returnComponentInfo
    );

    if (!componentIds?.length) return null;
    if (loading)
      return <div style={{ textAlign: "center" }}>Loading views...</div>;

    const componentTitle = (title: any, componentType: string) => {
      return (
        <div
          onClick={() => {
            history.push("/tables");
            setTimeout(() => {
              document
                .getElementById("dbTable1")
                ?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
        >
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
        </div>
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
      returnZoneInfo
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
                endpointUrl={"component_zone"}
                filterItem={"zone.id"}
                itemType={"component"}
                title={zoneData[zoneId][0].title || ""}
                subHeader={zoneData[zoneId][0].objectType}
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
    const { viewIds } = props;
    const { itemData: viewData, loading } = useItemData(
      viewIds,
      returnViewInfo
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
                  endpointUrl={"zone_view"}
                  filterItem={"view.id"}
                  itemType={"zone"}
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
                {boardOptionsDropdownButton}
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
        <div key={board.id} style={{ marginTop: "20px", display: "flex" }}>
          <div style={{ flex: "1" }}>
            <AccordionBase
              id={board.id}
              title={board.title}
              endpointUrl={"view_board"}
              filterItem={"board.id"}
              itemType={"view"}
              renderChildren={(viewIds) => <ViewsAccordion viewIds={viewIds} />}
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
            {boardOptionsDropdownButton}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Accordion;
