import "./Channels.css";

import * as api from "../../api";

import { forwardRef, useState } from "react";
import { useQuery, useQueryClient } from "react-query";

import { FiMenu } from "react-icons/fi";
import { useGatewayContext } from "../../gateway";
import { useIsMobile } from "../../hooks";

type ChannelsProps = {
  channel: api.Channel | undefined;
  setChannel: (channel: api.Channel | undefined) => void;
  setShowSidebar: (showSidebar: boolean) => void;
  setShowChannel: (showChannel: boolean) => void;
};

const Channels = forwardRef(function Channels(
  { channel, setChannel, setShowSidebar, setShowChannel }: ChannelsProps,
  ref: any
) {
  const queryClient = useQueryClient();

  const channelController = api.useChannelController();

  const [filterQuery, setFilterQuery] = useState("");

  const channelsQuery = useQuery({
    queryKey: ["channels"],
    queryFn: () => channelController.getChannels(),
    keepPreviousData: true,
  });

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
    <div className={isMobile ? "channels channelsMobile" : "channels"}>
      <div className="topBar">
        <FiMenu onClick={() => setShowSidebar(true)} />
        <div className="search">
          <input
            className="input"
            type="text"
            placeholder="Search"
            value={filterQuery}
            onChange={(event) => setFilterQuery(event.target.value)}
          />
        </div>
      </div>
      <div className="list" ref={ref}>
        {channelsQuery.data
          ?.filter((value) => value.name?.includes(filterQuery))
          .map((value) => (
            <div
              className={
                value.id == channel?.id ? "channel selectedChannel" : "channel"
              }
              onClick={() => {
                setChannel(value);
                setShowChannel(true);
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
