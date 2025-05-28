import "./ChannelBody.css";

import * as api from "../../api";

import { ContextMenuButton, useContextMenu } from "../contextMenu/ContextMenu";
import { MdDelete, MdEdit } from "react-icons/md";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "react-query";

import { AuthenticationContext } from "../..";
import { RemoveScroll } from "react-remove-scroll";
import { useIsMobile } from "../../hooks";

const CONTEXT_MENU_WIDTH = 150;

type ChannelBodyProps = {
  channel?: api.Channel;
  shards: (HTMLElement | React.RefObject<any>)[];
};

function ChannelBody(props: ChannelBodyProps) {
  const queryClient = useQueryClient();
  const channelController = api.useChannelController();
  const messageController = api.useMessageController();

  const messagesQuery = useQuery({
    queryKey: ["messages", props.channel],
    queryFn: () =>
      props.channel && channelController
        ? getMessagesAndSplitByDates(channelController, props.channel.id!)
        : [],
  });

  const editMessageQuery = useQuery<number | null>({
    queryKey: ["edit_message", props.channel],
    queryFn: () => null,
  });

  const isMobile = useIsMobile();

  const [session] = useContext(AuthenticationContext);

  const handleDeleteMessage = useCallback(
    async (message: api.Message) => {
      if (!messageController) return;
      const { id } = message!;
      await messageController.deleteMessage(id!);
      queryClient.setQueriesData(["messages", props.channel], (messages: api.Message[] | undefined) => {
        if (!messages) return [];
        return messages.filter((message) => message.id !== id);
      });
    },
    [messageController, queryClient, props.channel]
  );

  const handleEditMessage = useCallback(
    async (message: api.Message) => {
      const { id, content } = message!;
      queryClient.setQueriesData(["edit_message", props.channel], () => id);
      queryClient.setQueriesData(["message_drafts", props.channel], () => content);
    },
    [queryClient, props.channel]
  );

  const buttons = useMemo<ContextMenuButton<api.Message>[]>(
    () => [
      {
        icon: <MdEdit />,
        text: "Edit",
        handleClick: handleEditMessage,
        condition: (message) => message.user?.id === session?.userId,
      },
      {
        icon: <MdDelete />,
        text: "Delete",
        handleClick: handleDeleteMessage,
        style: { color: "red" },
      },
    ],
    [handleEditMessage, handleDeleteMessage]
  );

  const [handleContextMenu, contextMenu] = useContextMenu<api.Message>({
    width: CONTEXT_MENU_WIDTH,
    buttons: buttons,
  });

  useEffect(() => {
    scrollToBottom();
  }, [messagesQuery.data]);

  api.onGatewayEvent(
    {
      CreateMessageS2CEvent: (event) => {
        queryClient.setQueriesData(["messages", props.channel], (messages: api.Message[] | undefined) => {
          if (!messages) return [event.message];

          return pushToMessagesAndSplitByDates(messages, event.message);
        });
      },
      UpdateMessageContentS2CEvent: (event) => {
        queryClient.setQueriesData(["messages", props.channel], (messages: api.Message[] | undefined) => {
          if (!messages) return [];

          const newMessages = [...messages];
          newMessages[messages.findIndex((value) => value.id == event.messageId)].content = event.content;
          return newMessages;
        });
      },
      DeleteMessageS2CEvent: (event) => {
        queryClient.setQueriesData(["messages", props.channel], (messages: api.Message[] | undefined) => {
          if (!messages) return [];

          const newMessages = [...messages];
          newMessages.splice(
            messages.findIndex((value) => value.id == event.messageId),
            1
          );

          if (newMessages[newMessages.length - 1]?.type == api.MessageType.Date) {
            newMessages.splice(newMessages.length - 1, 1);
          }

          return newMessages;
        });
      },
    },
    (event) => {
      return props.channel != null && event.channelId == props.channel.id;
    }
  );

  return (
    <RemoveScroll
      className="channel-body"
      shards={props.shards}
    >
      {messagesQuery.data?.map((message) =>
        message.type === api.MessageType.Date ? (
          <div
            className="date-container"
            key={`date-${message.timestamp}`}
          >
            {message.content}
          </div>
        ) : message.type === api.MessageType.Status ? (
          <div
            className="status-container"
            key={message.id}
          >
            {message.content}
          </div>
        ) : (
          <div
            className="message-container"
            key={message.id}
          >
            <div
              className={`message ${
                message.user?.id === session?.userId ? "--message-right" : "--message-left"
              } ${isMobile ? "--message-mobile" : ""} ${
                editMessageQuery.data === message.id ? "--message-edit" : ""
              }`}
              onContextMenu={(event) => {
                const isOwn = message.user?.id === session?.userId;
                const isAdmin = props.channel?.admin === session?.userId;
                if (isOwn || isAdmin) {
                  handleContextMenu(event, message);
                }
              }}
              style={{ userSelect: isMobile ? "none" : "auto" }}
            >
              {props.channel?.type !== api.ChannelType.PrivateChat &&
                props.channel?.type !== api.ChannelType.Channel && (
                  <div className="user">{message.user?.displayName}</div>
                )}
              <div className="inner">
                <div className="content">{message.content}</div>
                <div className="timestamp">{getTimestampHoursAndMinutes(message.timestamp)}</div>
              </div>
            </div>
          </div>
        )
      )}
      {contextMenu}
    </RemoveScroll>
  );
}

export default ChannelBody;

function scrollToBottom() {
  const messageContainers = document.getElementsByClassName("message-container");

  if (messageContainers.length > 0) {
    messageContainers[messageContainers.length - 1].scrollIntoView({
      behavior: "instant",
      block: "end",
    });
  }
}

async function getMessagesAndSplitByDates(channelController: api.ChannelController, channelId: number) {
  const messages = await channelController.getMessages(channelId);
  const result: api.Message[] = [];

  let previousMessage = messages.at(0);

  if (!previousMessage) {
    return result;
  }

  result.push({
    timestamp: previousMessage.timestamp,
    type: api.MessageType.Date,
    content: getTimestampYearAndMonthAndDay(previousMessage.timestamp),
  });
  result.push(previousMessage);

  for (let i = 1; i < messages.length; i++) {
    const message = messages[i];

    if (isDifferentDays(previousMessage.timestamp, message.timestamp)) {
      result.push({
        timestamp: message.timestamp,
        type: api.MessageType.Date,
        content: getTimestampYearAndMonthAndDay(message.timestamp),
      });
    }

    result.push(message);
    previousMessage = message;
  }

  return result;
}

function pushToMessagesAndSplitByDates(messages: api.Message[], message: api.Message) {
  const result = [...messages];

  let offset = 1;
  let previousMessage = messages[messages.length - offset];

  while (typeof previousMessage === "string") {
    offset++;
    previousMessage = messages[messages.length - offset];
  }

  if (!previousMessage || isDifferentDays(previousMessage.timestamp, message.timestamp)) {
    result.push({
      timestamp: message.timestamp,
      type: api.MessageType.Date,
      content: getTimestampYearAndMonthAndDay(message.timestamp),
    });
  }

  result.push(message);

  return result;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDate(timestamp: Date | string): Date {
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
}

function getTimestampYearAndMonthAndDay(timestamp: Date | string): string {
  timestamp = toDate(timestamp);
  const year = timestamp.getFullYear();
  const month = MONTH_NAMES[timestamp.getMonth()];
  const day = timestamp.getDate();
  return `${year}, ${day} ${month}`;
}

function getTimestampHoursAndMinutes(timestamp: Date | string): string {
  timestamp = toDate(timestamp);
  const hours = timestamp.getHours().toString().padStart(2, "0");
  const minutes = timestamp.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function isDifferentDays(timestamp1: string, timestamp2: string): boolean {
  const date1 = toDate(timestamp1);
  const date2 = toDate(timestamp2);
  return (
    date1.getFullYear() !== date2.getFullYear() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getDate() !== date2.getDate()
  );
}
