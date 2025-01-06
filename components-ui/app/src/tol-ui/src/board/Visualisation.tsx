/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  BoardTable,
  Placeholder,
  TsDataSource
} from "../index";


interface Props {
  id: string;
  zone: object;
  setZone: any;
  setWidgetType: any;

  // only passed on creation
  objectType?: string;
  baseUrl?: string;
  title?: string;
  componentType?: string;
}

function Visualisation(props: Props) {
  const { id, setWidgetType } = props;

  const [objectType, setObjectType] = useState(props.objectType || "");
  const [baseUrl, setBaseUrl] = useState(props.baseUrl || undefined);
  const [title, setTitle] = useState(props.title || "");
  const [componentType, setComponentType] = useState(props.componentType || "");
  //const [filter, setFilter] = useState({});
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ds = new TsDataSource();

  useEffect(() => {
    ds.getOne({
      objectType: "component",
      id: id
    }).then((dataObject) => {
      setObjectType(dataObject!.object_type);
      setBaseUrl(dataObject!.base_url);
      setTitle(dataObject!.title);
      setComponentType(dataObject!.component_type);
      setWidgetType(id, dataObject!.widget_type);
      //setFilter(dataObject!.filter);
      setConfig(dataObject!.config);
      setLoading(false);
    }).catch(() => {
      setError('An error occured whilst trying to fetch the component config.');
    });
  }, []);

  if (error !== "") {
    return (
      <Placeholder
        errorMessage={error}
      />
    );
  }

  if (loading) {
    return (
      <Placeholder
        message={"Fetching config..."}
      />
    );
  }

  if (componentType === 'table') {
    return (
      <BoardTable
        {...props}
        config={config}
        objectType={objectType}
        baseUrl={baseUrl}
        title={title}
      />
    );
  }
}

export default Visualisation;
