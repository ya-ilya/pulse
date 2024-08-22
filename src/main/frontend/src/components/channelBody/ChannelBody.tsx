import "./ChannelBody.css";

import * as api from "../../api";

import { forwardRef, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";

import { AuthenticationContext } from "../..";
import { RemoveScroll } from "react-remove-scroll";
import { formatDate } from "../../utils/DateUtils";
import { useGatewayContext } from "../../gateway";

type ChannelBodyProps = {
  channel?: api.Channel;
};

const ChannelBody = forwardRef((props: ChannelBodyProps, ref: any) => {
  const queryClient = useQueryClient();
  const channelController = api.useChannelController();
  const messageController = api.useMessageController();

  const messagesQuery = useQuery({
    queryKey: ["messages", props.channel],
    queryFn: () =>
      props.channel ? channelController.getMessages(props.channel?.id!)! : []
  });

  const self = useContext(AuthenticationContext);

  function scrollToBottom() {
    const messageContainers =
      document.getElementsByClassName("messageContainer");

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
        messageController.getMessageById(event.messageId).then((message) => {
          queryClient.setQueriesData(
            ["messages", props.channel],
            (messages: api.Message[] | undefined) => {
              if (!messages) return [message];

              return [...messages, message];
            }
          );
        });
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
    <RemoveScroll className="channelBody" shards={[ref]}>
      {messagesQuery.data?.map((message) => (
        <div className="messageContainer">
          <div
            className={`message ${
              message.user?.id == self?.id
                ? "--message-right"
                : "--message-left"
            }`}
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
});

export default ChannelBody;
