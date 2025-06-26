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

  // put in class
  const style = {
    width: "50px",
    display: "inline-block",
    margin: "8px",
  };

  const PercentageCircle = (
    width: number,
    cN?: string
  ) => (
    <Progress.Circle
      percent={data.percentage}
      strokeWidth={width}
      trailWidth={width}
      showInfo={false}
      className={cN}
    />
  );

  const StyledWell = () => {
    console.log(data);

    if (!data.percentage && !data.className) {
      return <div className="plate-well" />;
    }
    if (data.percentage && !data.className) {
      return PercentageCircle(24)
    }
    if (!data.percentage && data.className) {
      return <div className={`plate-well ${data.className}`} />;
    }
    if (data.percentage && data.className) {
      return (
        <>
          {PercentageCircle(12, "plate-progress-circle")}
          <div className={`plate-well-small ${data.className}`} />
        </>
      );
    }
    return <></>;
  };

  return (
    <>
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
    </>
  );
}
