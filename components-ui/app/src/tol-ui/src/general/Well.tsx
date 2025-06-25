import HoverOverlay from "./HoverOverlay";
import { Progress } from "rsuite";

import { IWellData, IWellHoverContents } from "../models";

interface IWell {
  data: IWellData;
  onClick?: (id: string) => void;
  HoverContents?: (props: IWellHoverContents) => JSX.Element;
}

export function Well(props: IWell) {
  const { data, onClick, HoverContents } = props;

  const style = {
    width: "50px",
    display: "inline-block",
    margin: "8px",
  };

  const StyledWell = () => {
    console.log(data);

    if (!data.percentage && !data.className) {
      return (
        <div className="plate-well"></div>
      );
    }
    if (data.percentage && !data.className) {
      return (
        <Progress.Circle
          percent={data.percentage}
          strokeWidth={data.className ? 12 : 20}
          trailWidth={data.className ? 12 : 20}
          showInfo={false}
        />
      );
    }
    if (!data.percentage && data.className) {
      return (
        <div className={`plate-well ${data.className}`}/>
      );
    }
    if (data.percentage && data.className) {
      return (
        <Progress.Circle
          percent={data.percentage}
          strokeWidth={data.className ? 12 : 20}
          trailWidth={data.className ? 12 : 20}
          showInfo={false}
        ><div className="${data.className}" ></div></Progress.Circle>
      );
    }
    return <></>;
  }

  return<>
    <HoverOverlay
      contents={
        HoverContents && <HoverContents id={data.id} data={data.data} />
      }
      placement="right"
    >
      <div
        className="well"
        style={style}
        onClick={onClick ? () => onClick(data.id) : undefined}
      >
        <StyledWell />
      </div>
    </HoverOverlay>
  </>;
}
