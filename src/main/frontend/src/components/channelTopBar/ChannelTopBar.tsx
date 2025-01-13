import "./ChannelTopBar.css";

import * as api from "../../api";

import { useContext, useRef, useState } from "react";

import { AuthenticationContext } from "../..";
import { BiArrowBack } from "react-icons/bi";
import { useIsMobile } from "../../hooks";

type ChannelTopBarProps = {
  channel?: api.Channel;
  setShowChannel: (showChannel: boolean) => void;
};

function ChannelTopBar(props: ChannelTopBarProps) {
  const [isTyping, setIsTyping] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();

  const isMobile = useIsMobile();

  const [authenticationData] = useContext(AuthenticationContext);

  api.subscribeToGateway(
    {
      TypingS2CEvent: () => {
        clearTimeout(timeout.current);
        setIsTyping(true);
        timeout.current = setTimeout(() => setIsTyping(false), 1000);
      },
    },
    (event) => {
      return (
        props.channel != null &&
        event.channelId == props.channel.id &&
        props.channel.type == api.ChannelType.PrivateChat &&
        event.userId != authenticationData?.user?.id
      );
    }
  );

  if (!props.channel) {
    return <div></div>;
  }

  return (
    <div className="channel-top-bar">
      {isMobile && <BiArrowBack onClick={() => props.setShowChannel(false)} />}
      <div className="name">{props.channel?.name}</div>
      <div
        className="loader"
        style={{ visibility: isTyping ? "visible" : "hidden" }}
      >
        Typing
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
    </div>
  );
}

export default ChannelTopBar;
