import "./ChannelBody.css";

import * as api from "../../api";

import { forwardRef, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";

import { AuthenticationContext } from "../..";
import { RemoveScroll } from "react-remove-scroll";
import { useGatewayContext } from "../../gateway";

type ChannelBodyProps = {
  channel: api.Channel | undefined;
};

function formatDate(date: Date | string): string {
  if (date instanceof Date) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } else {
    date = new Date(date);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
}

const ChannelBody = forwardRef(function ChannelBody(
  { channel }: ChannelBodyProps,
  ref: any
) {
  const queryClient = useQueryClient();

  const channelController = api.useChannelController();
  const messageController = api.useMessageController();

  const messagesQuery = useQuery({
    queryKey: ["messages", channel],
    queryFn: () =>
      channel ? channelController.getMessages(channel?.id!)! : [],
    keepPreviousData: true,
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
            ["messages", channel],
            (messages: api.Message[] | undefined) => {
              if (!messages) return [message];

              return [...messages, message];
            }
          );
        });
      },
      UpdateMessageContentEvent: (event) => {
        queryClient.setQueriesData(
          ["messages", channel],
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
          ["messages", channel],
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
    (event) => channel != null && event.channelId == channel.id
  );

  if (!channel) {
    return <div></div>;
  }

  return (
    <RemoveScroll shards={ref} forwardProps>
      <div className="channelBody">
        {messagesQuery.data?.map((message) => (
          <div className="messageContainer">
            <div
              className={
                message.user?.id == self?.id
                  ? "message messageRight"
                  : "message messageLeft"
              }
            >
              {channel.type != api.ChannelTypeEnum.PrivateChat &&
                channel.type != api.ChannelTypeEnum.Channel && (
                  <div className="user">{message.user?.displayName}</div>
                )}
              <div className="inner">
                <div className="content">{message.content}</div>
                <div className="timestamp">{formatDate(message.timestamp)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </RemoveScroll>
  );
});

export default ChannelBody;
