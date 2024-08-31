import "./ChannelBody.css";

import * as api from "../../api";

import {
  getTimestampHoursAndMinutes,
  getTimestampYearAndMonthAndDay,
  isDifferentDays,
} from "../../utils/DateUtils";
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

  if (!previousMessage) {
    return [message];
  }

  if (isDifferentDays(previousMessage.timestamp, message.timestamp)) {
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
      props.channel
        ? getMessagesAndSplitByDates(channelController, props.channel.id!)
        : [],
  });

  const isMobile = useIsMobile();

  const self = useContext(AuthenticationContext);

  useEffect(() => {
    scrollToBottom();
  }, [messagesQuery.data]);

  api.useGatewayContext(
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
                message.user?.id == self?.id
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
