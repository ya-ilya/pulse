import "./ChannelTopBar.css";

import * as api from "../../api";

import { useContext, useState } from "react";

import { AuthenticationContext } from "../..";
import { BiArrowBack } from "react-icons/bi";
import { useIsMobile } from "../../hooks";

type ChannelTopBarProps = {
  channel?: api.Channel;
  setShowChannel: (showChannel: boolean) => void;
};

function ChannelTopBar(props: ChannelTopBarProps) {
  const [isTyping, setIsTyping] = useState(false);

  const isMobile = useIsMobile();

  const self = useContext(AuthenticationContext);

  api.useGatewayContext(
    {
      TypingS2CEvent: (event) => {
        setIsTyping(event.state);
      },
    },
    (event) => {
      return (
        props.channel != null &&
        event.channelId == props.channel.id &&
        props.channel.type == api.ChannelType.PrivateChat &&
        event.userId != self?.id
      );
    }
  );

  if (!props.channel) {
    return <div></div>;
  }

  return (
    <div className="channel-top-bar">
      {isMobile && <BiArrowBack onClick={() => props.setShowChannel(false)} />}
      <div className="name">
        {props.channel?.name}
      </div>
      <div className="typing">
        {isTyping ? "Typing..." : ""}
      </div>
    </div>
  );
}

export default ChannelTopBar;
