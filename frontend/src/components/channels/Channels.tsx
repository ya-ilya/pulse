import "./Channels.css";

import * as api from "../../api";

import { ContextMenuButton, useContextMenu } from "../contextMenu/ContextMenu";
import { LegacyRef, forwardRef, useCallback, useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";

import { AuthenticationContext } from "../..";
import { FiMenu } from "react-icons/fi";
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

const Channels = forwardRef((props: ChannelsProps, ref: LegacyRef<HTMLDivElement>) => {
  const queryClient = useQueryClient();
  const channelController = api.useChannelController();

  const [filter, setFilter] = useState("");

  const [session] = useContext(AuthenticationContext);

  const channelsQuery = useQuery({
    queryKey: ["channels", session?.userId],
    queryFn: () => channelController?.getChannels() ?? [],
  });

  const [, viewportHeight] = useViewportSize() ?? [];
  const isMobile = useIsMobile();

  const leaveChannel = useCallback(
    async (channel: api.Channel) => await channelController?.leaveChannel(channel.id!),
    [channelController]
  );
  const deleteChannel = useCallback(
    async (channel: api.Channel) => await channelController?.deleteChannel(channel.id!),
    [channelController]
  );

  const buttons = useMemo<ContextMenuButton<api.Channel>[]>(
    () => [
      {
        text: "Leave group",
        handleClick: leaveChannel,
        style: { color: "red" },
        condition: (channel) =>
          channel.type == api.ChannelType.GroupChat && channel.admin?.id != session?.userId,
      },
      {
        text: "Delete group",
        handleClick: deleteChannel,
        style: { color: "red" },
        condition: (channel) =>
          channel.type == api.ChannelType.GroupChat && channel.admin?.id == session?.userId,
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
          channel.type == api.ChannelType.Channel && channel.admin?.id != session?.userId,
      },
      {
        text: "Delete channel",
        handleClick: deleteChannel,
        style: { color: "red" },
        condition: (channel) =>
          channel.type == api.ChannelType.Channel && channel.admin?.id == session?.userId,
      },
    ],
    [leaveChannel, deleteChannel, session?.userId]
  );

  const [handleContextMenu, contextMenu] = useContextMenu<api.Channel>({
    width: CONTEXT_MENU_WIDTH,
    buttons: buttons,
  });

  api.onGatewayEvent({
    CreateChannelS2CEvent: (event) => {
      queryClient.setQueriesData(["channels", session?.userId], (channels: api.Channel[] | undefined) => {
        if (!channels) return [event.channel];

        return [...channels, event.channel];
      });
    },
    UpdateChannelNameS2CEvent: (event) => {
      queryClient.setQueriesData(["channels", session?.userId], (channels: api.Channel[] | undefined) => {
        if (!channels) return [];

        const newElements = [...channels];
        newElements[channels.findIndex((value) => value.id == event.channelId)].name = event.name;
        return newElements;
      });
    },
    DeleteChannelS2CEvent: (event) => {
      queryClient.setQueriesData(["channels", session?.userId], (channels: api.Channel[] | undefined) => {
        if (!channels) return [];

        const newElements = [...channels];
        newElements.splice(
          channels.findIndex((value) => value.id == event.channelId),
          1
        );
        return newElements;
      });
    },
    UpdateChannelMembersS2CEvent: (event) => {
      queryClient.setQueriesData(["channels", session?.userId], (channels: api.Channel[] | undefined) => {
        if (!channels) return [];

        const newElements = [...channels];

        if (event.action == "Leave" && event.user.id == session?.userId) {
          newElements.splice(
            channels.findIndex((value) => value.id == event.channelId),
            1
          );

          if (event.channelId == props.channel?.id) {
            props.setChannel(undefined);
          }
        }

        return newElements;
      });
    },
  });

  const filteredChannels = useMemo(
    () => channelsQuery.data?.filter((value) => value.name?.includes(filter)) ?? [],
    [channelsQuery.data, filter]
  );

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
        {filteredChannels.length > 0
          ? filteredChannels.map((value) => (
              <div
                className={`channel ${value.id === props.channel?.id ? "--selected-channel" : ""}`}
                key={value.id}
                onContextMenu={(event) => handleContextMenu(event, value)}
                onClick={() => {
                  props.setChannel(value);
                  props.setShowChannel(true);
                }}
              >
                {value.name}
              </div>
            ))
          : filter !== "" && <div className="nothing-found">Nothing found</div>}
      </div>
      {contextMenu}
    </div>
  );
});

export default Channels;
