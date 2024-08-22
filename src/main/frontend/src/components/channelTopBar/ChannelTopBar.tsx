import "./ChannelTopBar.css";

import { BiArrowBack } from "react-icons/bi";
import { Channel } from "../../api";
import { useIsMobile } from "../../hooks";

type ChannelTopBarProps = {
  channel?: Channel;
  setShowChannel: (showChannel: boolean) => void;
};

function ChannelTopBar(props: ChannelTopBarProps) {
  const isMobile = useIsMobile();

  if (!props.channel) {
    return <div></div>;
  }

  return (
    <div className="channel-top-bar">
      {isMobile && <BiArrowBack onClick={() => props.setShowChannel(false)} />}
      <div className="name">{props.channel?.name}</div>
    </div>
  );
}

export default ChannelTopBar;
