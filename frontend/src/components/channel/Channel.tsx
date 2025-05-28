import "./Channel.css";

import * as api from "../../api";

import ChannelBody from "../channelBody/ChannelBody";
import ChannelBottomBar from "../channelBottomBar/ChannelBottomBar";
import ChannelTopBar from "../channelTopBar/ChannelTopBar";
import { useIsMobile } from "../../hooks";
import { useRef } from "react";
import useViewportSize from "../../hooks/useViewportSize";

type ChannelProps = {
  channel?: api.Channel;
  showChannel: boolean;
  setShowChannel: (showChannel: boolean) => void;
  shards: (HTMLElement | React.RefObject<any>)[];
};

function Channel(props: ChannelProps) {
  const [, viewportHeight] = useViewportSize() ?? [];
  const isMobile = useIsMobile();

  const channelBottomBarRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div
      className={`channel ${isMobile ? "--channel-mobile" : ""}`}
      style={{
        right: isMobile && !props.showChannel ? "100%" : "0",
        maxHeight: viewportHeight,
      }}
    >
      <ChannelTopBar
        channel={props.channel}
        setShowChannel={props.setShowChannel}
      />
      <ChannelBody
        channel={props.channel}
        shards={[...props.shards, channelBottomBarRef]}
      />
      <ChannelBottomBar
        channel={props.channel}
        ref={channelBottomBarRef}
      />
    </div>
  );
}

export default Channel;
