import "./ChannelTopBar.css";

import { BiArrowBack } from "react-icons/bi";
import { Channel } from "../../api";
import { useIsMobile } from "../../hooks";

type ChannelTopBarProps = {
  channel: Channel | undefined;
  setShowChannel: (showChannel: boolean) => void;
};

function ChannelTopBar({ channel, setShowChannel }: ChannelTopBarProps) {
  const isMobile = useIsMobile();

  if (!channel) {
    return <div></div>;
  }

  return (
    <div className="channelTopBar">
      {isMobile && <BiArrowBack onClick={() => setShowChannel(false)} />}
      <div className="name">{channel?.name}</div>
    </div>
  );
}

export default ChannelTopBar;
