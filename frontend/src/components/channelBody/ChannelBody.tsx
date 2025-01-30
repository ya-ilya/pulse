import "./ChannelBody.css";

import * as api from "../../api";

import { useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";

import { AuthenticationContext } from "../..";
import { RemoveScroll } from "react-remove-scroll";
import { useIsMobile } from "../../hooks";

function scrollToBottom() {
  const messageContainers =
    document.getElementsByClassName("message-container");

  if (messageContainers.length > 0) {
    messageContainers[messageContainers.length - 1].scrollIntoView({
      behavior: "instant",
      block: "end",
    });
  }
}

async function getMessagesAndSplitByDates(
  channelController: api.ChannelController,
  channelId: number
) {
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
    channel: previousMessage.channel,
  });
  result.push(previousMessage);

  for (let i = 1; i < messages.length; i++) {
    const message = messages[i];

    if (isDifferentDays(previousMessage.timestamp, message.timestamp)) {
      result.push({
        timestamp: message.timestamp,
        type: api.MessageType.Date,
        content: getTimestampYearAndMonthAndDay(message.timestamp),
        channel: message.channel,
      });
    }

    result.push(message);
    previousMessage = message;
  }

  return result;
}

function pushToMessagesAndSplitByDates(
  messages: api.Message[],
  message: api.Message
) {
  const result = [...messages];

  let offset = 1;
  let previousMessage = messages[messages.length - offset];

  while (typeof previousMessage === "string") {
    offset++;
    previousMessage = messages[messages.length - offset];
  }

  if (
    !previousMessage ||
    isDifferentDays(previousMessage.timestamp, message.timestamp)
  ) {
    result.push({
      timestamp: message.timestamp,
      type: api.MessageType.Date,
      content: getTimestampYearAndMonthAndDay(message.timestamp),
      channel: message.channel,
    });
  }

  result.push(message);

  return result;
}

type ChannelBodyProps = {
  channel?: api.Channel;
  shards: any[];
};

function ChannelBody(props: ChannelBodyProps) {
  const queryClient = useQueryClient();
  const channelController = api.useChannelController();

  const messagesQuery = useQuery({
    queryKey: ["messages", props.channel],
    queryFn: () =>
      props.channel && channelController
        ? getMessagesAndSplitByDates(channelController, props.channel.id!)
        : [],
  });

  const isMobile = useIsMobile();

  const [authenticationData] = useContext(AuthenticationContext);

  useEffect(() => {
    scrollToBottom();
  }, [messagesQuery.data]);

  api.onGatewayEvent(
    {
      CreateMessageS2CEvent: (event) => {
        queryClient.setQueriesData(
          ["messages", props.channel],
          (messages: api.Message[] | undefined) => {
            if (!messages) return [event.message];

            return pushToMessagesAndSplitByDates(messages, event.message);
          }
        );
      },
      UpdateMessageContentS2CEvent: (event) => {
        queryClient.setQueriesData(
          ["messages", props.channel],
          (messages: api.Message[] | undefined) => {
            if (!messages) return [];

            const newMessages = [...messages];
            newMessages[
              messages.findIndex((value) => value.id == event.messageId)
            ].content = event.content;
            return newMessages;
          }
        );
      },
      DeleteMessageS2CEvent: (event) => {
        queryClient.setQueriesData(
          ["messages", props.channel],
          (messages: api.Message[] | undefined) => {
            if (!messages) return [];

            const newMessages = [...messages];
            newMessages.splice(
              messages.findIndex((value) => value.id == event.messageId),
              1
            );
            return newMessages;
          }
        );
      },
    },
    (event) => {
      return props.channel != null && event.channelId == props.channel.id;
    }
  );

  return (
    <RemoveScroll className="channel-body" shards={props.shards}>
      {messagesQuery.data?.map((message) =>
        message.type == api.MessageType.Date ? (
          <div className="date-container">{message.content}</div>
        ) : (
          <div className="message-container">
            <div
              className={`message ${
                message.user?.id == authenticationData?.user?.id
                  ? "--message-right"
                  : "--message-left"
              } ${isMobile ? "--message-mobile" : ""}`}
            >
              {props.channel?.type != api.ChannelType.PrivateChat &&
                props.channel?.type != api.ChannelType.Channel && (
                  <div className="user">{message.user?.displayName}</div>
                )}
              <div className="inner">
                <div className="content">{message.content}</div>
                <div className="timestamp">
                  {getTimestampHoursAndMinutes(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </RemoveScroll>
  );
}

export default ChannelBody;

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
