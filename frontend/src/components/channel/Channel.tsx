import "./Channel.css";

import * as api from "../../api";

import { MutableRefObject, useRef } from "react";

import ChannelBody from "../channelBody/ChannelBody";
import ChannelBottomBar from "../channelBottomBar/ChannelBottomBar";
import ChannelTopBar from "../channelTopBar/ChannelTopBar";
import { useIsMobile } from "../../hooks";
import useViewportSize from "../../hooks/useViewportSize";

type ChannelProps = {
  channel?: api.Channel;
  showChannel: boolean;
  setShowChannel: (showChannel: boolean) => void;
  shards: MutableRefObject<HTMLDivElement | undefined>[];
};

function Channel(props: ChannelProps) {
  const [, viewportHeight] = useViewportSize() ?? [];
  const isMobile = useIsMobile();

  const channelBottomBarRef = useRef();

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
