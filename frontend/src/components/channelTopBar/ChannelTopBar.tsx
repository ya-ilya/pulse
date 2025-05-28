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
  const [typingList, setTypingList] = useState<Set<string>>(new Set());
  const timeout = useRef<NodeJS.Timeout>();

  const isMobile = useIsMobile();

  const [session] = useContext(AuthenticationContext);

  api.onGatewayEvent(
    {
      TypingS2CEvent: (event) => {
        setIsTyping(true);

        setTypingList((prev) => {
          const newSet = new Set(prev);
          newSet.add(event.username);
          return newSet;
        });

        if (timeout.current) {
          clearTimeout(timeout.current);
        }

        timeout.current = setTimeout(() => {
          setIsTyping(false);
        }, 1000);

        setTimeout(() => {
          setTypingList((prev) => {
            const newSet = new Set(prev);
            newSet.delete(event.username);
            return newSet;
          });
        }, 1000);
      },
    },
    (event) => {
      return props.channel != null && event.channelId == props.channel.id && event.userId != session?.userId;
    }
  );

  return (
    props.channel && (
      <div className="channel-top-bar">
        {isMobile && <BiArrowBack onClick={() => props.setShowChannel(false)} />}
        <div className="name">{props.channel?.name}</div>
        <div
          className="loader"
          style={{ visibility: isTyping ? "visible" : "hidden" }}
        >
          {props.channel?.type === api.ChannelType.PrivateChat
            ? "Typing"
            : `${Array.from(typingList).join(", ")} typing`}
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </div>
      </div>
    )
  );
}

export default ChannelTopBar;
