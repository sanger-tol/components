/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { 
  View,
  TsDataSource,
  EditableTitle,
  LoadingContent,
  Widgets
} from "../index";
import { getBoard, onTitleSave } from "./Utils";
import { useEffect, useState } from "react";

interface Props {
  id: string,
  baseUrl: string,
  user: any
}

function Board(props: Props) {
  const {baseUrl, id, user} = props;
  const [loading, setLoading] = useState(true);
  const [boardData, setBoardData] = useState<any>({});

  const ds = new TsDataSource({baseUrl: baseUrl});
  useEffect(() => {
    getBoard(id, ds, user).then((res: any) => {
      setBoardData(res);
      setLoading(false);
    });
  }, []);
  
  // returns the first view at the moment
  return (
    <>
    {loading ? 
    <LoadingContent text="Loading Board..."/>
      : 
    <div>
      <div className="tol-board-title">
        <Widgets 
          components={[{
            component: <EditableTitle title={boardData.boardTitle} onSave={(newTitle) => onTitleSave(newTitle, ds, id, 'board')} size="lg" />,
            type: 'full'
          }]}
        />
      </div>
      <View id={boardData.views[0].id} title={boardData.views[0].title} ds={ds} defaultFilter={boardData.views[0].filter}/>
    </div>
    }
    </>
  )
}

export default Board;