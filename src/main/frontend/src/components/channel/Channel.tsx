import "./Channel.css";

import * as api from "../../api";

import ChannelBody from "../channelBody/ChannelBody";
import ChannelBottomBar from "../channelBottomBar/ChannelBottomBar";
import ChannelTopBar from "../channelTopBar/ChannelTopBar";
import { forwardRef } from "react";
import { useIsMobile } from "../../hooks";
import useViewportSize from "../../hooks/useViewportSize";

type ChannelProps = {
  channel?: api.Channel;
  showChannel: boolean;
  setShowChannel: (showChannel: boolean) => void;
};

const Channel = forwardRef((props: ChannelProps, ref: any) => {
  const [, viewportHeight] = useViewportSize() ?? [];
  const isMobile = useIsMobile();

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
      <ChannelBody ref={ref} channel={props.channel} />
      <ChannelBottomBar channel={props.channel} />
    </div>
  );
});

export default Channel;
