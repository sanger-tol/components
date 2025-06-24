import HoverOverlay from "./HoverOverlay";
import { Progress } from "rsuite";

interface IWell {
  id: string;
  label: string;
  className?: string;
  percentage?: number;
  data?: any;
}

export interface IWellHoverContents {
  id: string;
  data: any;
}

interface Props {
  well: IWell;
  onWellClick?: (id: string) => void;
  WellHoverContents?: (props: IWellHoverContents) => JSX.Element;
}

export function WellComponent(props: Props) {
  const { well, onWellClick, WellHoverContents } = props;

  const style = {
    width: "50px",
    display: "inline-block",
    margin: "8px",
  };

  return<>
    <HoverOverlay
      contents={
        WellHoverContents && <WellHoverContents id={well.id} data={well.data} />
      }
      placement="right"
    >
      <div
        className="well"
        style={style}
        onClick={onWellClick ? () => onWellClick(well.id) : undefined}
      >
        <Progress.Circle
          percent={well.percentage}
          strokeWidth={well.className ? 12 : 20}
          trailWidth={well.className ? 12 : 20}
          showInfo={false}
        />
      </div>
    </HoverOverlay>
  </>;
}
