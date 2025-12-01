import { Checkbox } from "rsuite";
import { useState, Dispatch, SetStateAction } from "react";
import {
  Button,
  Modal,
} from "../..";


export interface PInitialBoardsTourModal {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function InitialBoardsTourModal(props: PInitialBoardsTourModal) {
  const {
    open,
    setOpen,
  } = props;

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
      <Button text="OK" onClick={() => setOpen(false)} />
    </span>
  );

  return (
    <Modal
      className="tol-initial-boards-tour-modal"
      open={open}
      setOpen={setOpen}
      closeButton={false}
      actionButton={ActionButton}
      header={Header}
      size="sm"
      children={Content}
    />
  )
}
