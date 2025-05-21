import "./Channels.css";

import * as api from "../../api";

import { forwardRef, useContext, useState } from "react";
import { useQuery, useQueryClient } from "react-query";

import { AuthenticationContext } from "../..";
import { FiMenu } from "react-icons/fi";
import { useContextMenu } from "../contextMenu/ContextMenu";
import { useIsMobile } from "../../hooks";
import useViewportSize from "../../hooks/useViewportSize";

const CONTEXT_MENU_WIDTH = 150;

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

  const [authenticationData] = useContext(AuthenticationContext);

  const channelsQuery = useQuery({
    queryKey: ["channels", authenticationData?.userId],
    queryFn: () => channelController!.getChannels(),
  });

  const [, viewportHeight] = useViewportSize() ?? [];
  const isMobile = useIsMobile();

  const leaveChannel = async (channel: api.Channel) => await channelController?.leaveChannel(channel.id!);
  const deleteChannel = async (channel: api.Channel) => await channelController?.deleteChannel(channel.id!);

  const [handleContextMenu, contextMenu] = useContextMenu<api.Channel>({
    width: CONTEXT_MENU_WIDTH,
    buttons: [
      {
        text: "Leave group",
        handleClick: leaveChannel,
        style: { color: "red" },
        condition: (channel) =>
          channel.type == api.ChannelType.GroupChat && channel.admin?.id != authenticationData?.userId,
      },
      {
        text: "Delete group",
        handleClick: deleteChannel,
        style: { color: "red" },
        condition: (channel) =>
          channel.type == api.ChannelType.GroupChat && channel.admin?.id == authenticationData?.userId,
      },
      {
        text: "Delete chat",
        handleClick: deleteChannel,
        style: { color: "red" },
        condition: (channel) => channel.type == api.ChannelType.PrivateChat,
      },
      {
        text: "Leave channel",
        handleClick: leaveChannel,
        style: { color: "red" },
        condition: (channel) =>
          channel.type == api.ChannelType.Channel && channel.admin?.id != authenticationData?.userId,
      },
      {
        text: "Delete channel",
        handleClick: deleteChannel,
        style: { color: "red" },
        condition: (channel) =>
          channel.type == api.ChannelType.Channel && channel.admin?.id == authenticationData?.userId,
      },
    ],
  });

  api.onGatewayEvent({
    CreateChannelS2CEvent: (event) => {
      queryClient.setQueriesData(
        ["channels", authenticationData?.userId],
        (channels: api.Channel[] | undefined) => {
          if (!channels) return [event.channel];

          return [...channels, event.channel];
        }
      );
    },
    UpdateChannelNameS2CEvent: (event) => {
      queryClient.setQueriesData(
        ["channels", authenticationData?.userId],
        (channels: api.Channel[] | undefined) => {
          if (!channels) return [];

          const newElements = [...channels];
          newElements[channels.findIndex((value) => value.id == event.channelId)].name = event.name;
          return newElements;
        }
      );
    },
    DeleteChannelS2CEvent: (event) => {
      queryClient.setQueriesData(
        ["channels", authenticationData?.userId],
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
    MemberLeftS2CEvent: (event) => {
      queryClient.setQueriesData(
        ["channels", authenticationData?.userId],
        (channels: api.Channel[] | undefined) => {
          if (!channels) return [];

          const newElements = [...channels];

          if (event.user.id == authenticationData?.userId) {
            newElements.splice(
              channels.findIndex((value) => value.id == event.channelId),
              1
            );
          }

          return newElements;
        }
      );
    },
  });

  const filteredChannels = channelsQuery.data?.filter((value) => value.name?.includes(filter));

  return (
    <div
      className={`channels ${isMobile ? "--channels-mobile" : ""}`}
      style={{
        visibility: isMobile ? (props.showChannel ? "hidden" : "visible") : "visible",
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
      <div
        className="list"
        ref={ref}
      >
        {filteredChannels && filteredChannels.length > 0
          ? filteredChannels.map((value) => (
              <div
                className={`channel ${value.id == props.channel?.id ? "--selected-channel" : ""}`}
                onContextMenu={(event) => handleContextMenu(event, value)}
                onClick={() => {
                  props.setChannel(value);
                  props.setShowChannel(true);
                }}
              >
                {value.name}
              </div>
            ))
          : filter != "" && <div className="nothing-found">Nothing found</div>}
      </div>
      {contextMenu}
    </div>
  );
});

export default Channels;
