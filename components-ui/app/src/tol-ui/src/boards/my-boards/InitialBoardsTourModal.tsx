import { Checkbox } from "rsuite";
import { useState } from "react";
import {
  Button,
  Modal,
} from "../..";


export function InitialBoardsTourModal() {
  const [showTour, setShowTour] = useState(true);
  
  const Header = (
    <h3>Boards</h3>
  );

  const Content = (<>
    <p>
      A board is a user-configurable means for creating visualisations of Tree of Life data.<br/>
      To create a board, click the New Board button.
    </p>
  </>);

  const ActionButton = (
    <span style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
      <Checkbox checked={showTour} onChange={setShowTour}>
        Continue Showing Tour (1/6)
      </Checkbox>
      <Button text="OK" />
    </span>
  );

  return (
    <Modal
      className="tol-initial-boards-tour-modal"
      open={true}
      closeButton={false}
      actionButton={ActionButton}
      header={Header}
      size="sm"
      children={Content}
    />
  )
}
