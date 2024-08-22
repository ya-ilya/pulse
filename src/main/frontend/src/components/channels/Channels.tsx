import "./Channels.css";

import * as api from "../../api";

import { forwardRef, useState } from "react";
import { useQuery, useQueryClient } from "react-query";

import { FiMenu } from "react-icons/fi";
import { useGatewayContext } from "../../gateway";
import { useIsMobile } from "../../hooks";
import useViewportSize from "../../hooks/useViewportSize";

type ChannelsProps = {
  channel?: api.Channel;
  setChannel: (channel: api.Channel | undefined) => void;
  setShowSidebar: (showSidebar: boolean) => void;
  showChannel: boolean;
  setShowChannel: (showChannel: boolean) => void;
};

const Channels = forwardRef((props: ChannelsProps, ref: any) => {
  const queryClient = useQueryClient();
  const channelController = api.useChannelController();

  const [filter, setFilter] = useState("");

  const channelsQuery = useQuery({
    queryKey: ["channels"],
    queryFn: () => channelController.getChannels(),
  });

  const [, viewportHeight] = useViewportSize() ?? [];
  const isMobile = useIsMobile();

  useGatewayContext({
    CreateChannelEvent: (event) => {
      channelController.getChannelById(event.channelId).then((channel) => {
        queryClient.setQueriesData(
          ["channels"],
          (channels: api.Channel[] | undefined) => {
            if (!channels) return [channel];

            return [...channels, channel];
          }
        );
      });
    },
    UpdateChannelNameEvent: (event) => {
      queryClient.setQueriesData(
        ["channels"],
        (channels: api.Channel[] | undefined) => {
          if (!channels) return [];

          const newElements = [...channels];
          newElements[
            channels.findIndex((value) => value.id == event.channelId)
          ].name = event.name;
          return newElements;
        }
      );
    },
    DeleteChannelEvent: (event) => {
      queryClient.setQueriesData(
        ["channels"],
        (channels: api.Channel[] | undefined) => {
          if (!channels) return [];

          const newElements = [...channels];
          newElements.splice(
            channels.findIndex((value) => value.id == event.channelId),
            1
          );
          return newElements;
        }
      );
    },
  });

  return (
    <div
      className={`channels ${isMobile ? "--channels-mobile" : ""}`}
      style={{
        visibility: isMobile
          ? props.showChannel
            ? "hidden"
            : "visible"
          : "visible",
        maxHeight: viewportHeight,
      }}
    >
      <div className="top-bar">
        <FiMenu onClick={() => props.setShowSidebar(true)} />
        <div className="search">
          <input
            className="input"
            type="text"
            placeholder="Search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
      </div>
      <div className="list" ref={ref}>
        {channelsQuery.data
          ?.filter((value) => value.name?.includes(filter))
          .map((value) => (
            <div
              className={`channel ${
                value.id == props.channel?.id ? "--selected-channel" : ""
              }`}
              onClick={() => {
                props.setChannel(value);
                props.setShowChannel(true);
              }}
            >
              {value.name}
            </div>
          ))}
      </div>
    </div>
  );
});

export default Channels;
