import HoverOverlay from "./HoverOverlay";
import { Progress } from "rsuite";

// type TRow = Array<IWell>;

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
  id: string;
  well: IWell;
  onWellClick?: (id: string) => void;
  WellHoverContents?: (props: IWellHoverContents) => JSX.Element;
}

function WellComponent(props: Props) {
    const {
    well,
    onWellClick,
    WellHoverContents
  } = props;


  <>
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
    ;
  </>;
}
