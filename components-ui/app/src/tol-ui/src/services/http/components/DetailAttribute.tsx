/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IRemoteTarget } from "../../../models";
import { Loader } from "../../..";
import { useState } from "react";

interface Props extends IRemoteTarget {
  id: string;
  attribute: string;
}

export function DetailAttribute(props: Props) {
  const { id, objectType, dataSource, attribute } = props;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  dataSource.getOne({
    objectType,
    id
  }).then((res: any) => {
    setText(res[attribute] || "");
    setLoading(false);
  });

  return (
    <div className="loading-cell">
      {loading ? <Loader size="sm" role="status" aria-hidden /> : text}
    </div>
  );
}
