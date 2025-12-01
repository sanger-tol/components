import { Checkbox } from "rsuite";
import { useState, Dispatch, SetStateAction } from "react";
import {
  Button,
  BUTTONS,
  disableTour,
  Modal,
  registerTourStepAsSeen,
} from "../..";


export interface PInitialBoardsTourModal {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  userId: string;
}

export function InitialBoardsTourModal(props: PInitialBoardsTourModal) {
  const {
    open,
    setOpen,
    userId,
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

  const handleClose = async () => {
    // Register this specific tour step as seen
    await registerTourStepAsSeen("initial", userId);

    // Disable the whole tour if the checkbox was unchecked when the modal was closed
    if (!showTour) {
      await disableTour(userId);
    }
  };

  const ActionButton = (
    <span style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
      <Checkbox checked={showTour} onChange={() => setShowTour(prev => !prev)}>
        Continue Showing Tour (1/6)
      </Checkbox>
      <Button {...BUTTONS.OK} onClick={() => setOpen(false)} />
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
      onExited={handleClose}
    />
  )
}
