import { Icon } from "..";

export interface PInitiateTourButton {
  onClick: () => void;
}

export function InitiateTourButton(props: PInitiateTourButton) {
  const { onClick } = props;

  return (
    <button className="InitiateTourButton" onClick={onClick}>
      <Icon icon="circle-question" size="lg" />
    </button>
  )
}
