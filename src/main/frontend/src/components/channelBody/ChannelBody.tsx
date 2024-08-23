import "./ChannelBody.css";

import * as api from "../../api";

import { useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";

import { AuthenticationContext } from "../..";
import { RemoveScroll } from "react-remove-scroll";
import { formatDate } from "../../utils/DateUtils";
import { useGatewayContext } from "../../gateway";
import { useIsMobile } from "../../hooks";

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
      props.channel ? channelController.getMessages(props.channel?.id!)! : [],
  });

  const isMobile = useIsMobile();

  const self = useContext(AuthenticationContext);

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

  useEffect(() => {
    scrollToBottom();
  }, [messagesQuery.data]);

  useGatewayContext(
    {
      CreateMessageEvent: (event) => {
        queryClient.setQueriesData(
          ["messages", props.channel],
          (messages: api.Message[] | undefined) => {
            if (!messages) return [event.message];

            return [...messages, event.message];
          }
        );
      },
      UpdateMessageContentEvent: (event) => {
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
      DeleteMessageEvent: (event) => {
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
      {messagesQuery.data?.map((message) => (
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
              <div className="timestamp">{formatDate(message.timestamp)}</div>
            </div>
          </div>
        </div>
      ))}
    </RemoveScroll>
  );
}

export default ChannelBody;
