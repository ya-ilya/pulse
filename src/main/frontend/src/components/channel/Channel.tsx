import "./Channel.css";

import * as api from "../../api";

import ChannelBody from "../channelBody/ChannelBody";
import ChannelBottomBar from "../channelBottomBar/ChannelBottomBar";
import ChannelTopBar from "../channelTopBar/ChannelTopBar";
import { forwardRef } from "react";
import { useIsMobile } from "../../hooks";
import useViewportSize from "../../hooks/useViewportSize";

type ChannelProps = {
  channel: api.Channel | undefined;
  showChannel: boolean;
  setShowChannel: (showChannel: boolean) => void;
};

const Channel = forwardRef(function Channel(
  { channel, showChannel, setShowChannel }: ChannelProps,
  ref: any
) {
  const [, viewportHeight] = useViewportSize() ?? [];
  const isMobile = useIsMobile();

  return (
    <div
      className={isMobile ? "channelMobile" : "channel"}
      style={{
        right: !isMobile || showChannel ? "0%" : "100%",
        maxHeight: viewportHeight,
      }}
    >
      <ChannelTopBar channel={channel} setShowChannel={setShowChannel} />
      <ChannelBody ref={ref} channel={channel} />
      <ChannelBottomBar channel={channel} />
    </div>
  );
});

export default Channel;
