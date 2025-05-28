import "./ChannelBottomBar.css";

import * as api from "../../api";

import { AuthenticationContext, queryClient } from "../..";
import { LegacyRef, forwardRef, useCallback, useContext, useRef } from "react";
import { MdCancel, MdEdit } from "react-icons/md";

import { IoSend } from "react-icons/io5";
import ReactTextareaAutosize from "react-textarea-autosize";
import { sendGatewayEvent } from "../../api";
import { useIsMobile } from "../../hooks";
import { useQuery } from "react-query";

const TYPING_EVENT_DELAY = 300;

const TEXTAREA_MIN_ROWS = 1;
const TEXTAREA_MAX_ROWS_MOBILE = 6;
const TEXTAREA_MAX_ROWS_PC = 12;

type ChannelBottomBarProps = {
  channel?: api.Channel;
};

const ChannelBottomBar = forwardRef((props: ChannelBottomBarProps, ref: LegacyRef<HTMLTextAreaElement>) => {
  const channelController = api.useChannelController();
  const messageController = api.useMessageController();

  const lastTypingEventTime = useRef(Date.now());

  const isMobile = useIsMobile();

  const [session] = useContext(AuthenticationContext);

  const messageQuery = useQuery({
    queryKey: ["message_drafts", props.channel],
    queryFn: () => "",
  });

  const editMessageQuery = useQuery<number | null>({
    queryKey: ["edit_message", props.channel],
    queryFn: () => null,
  });

  const createMessage = useCallback(() => {
    const message = messageQuery.data ?? "";

    if (message.length <= 2) {
      return;
    }

    queryClient.setQueriesData(["message_drafts", props.channel], () => "");

    if (editMessageQuery.data) {
      messageController?.updateMessage(editMessageQuery.data, {
        content: message,
      });

      queryClient.setQueriesData(["edit_message", props.channel], () => null);
    } else {
      channelController?.createMessage(props.channel?.id!, {
        content: message,
      });
    }
  }, [props.channel, messageQuery.data, channelController, messageController, editMessageQuery.data]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (isMobile || event.key !== "Enter" || event.shiftKey) {
        return;
      }

      event.preventDefault();

      createMessage();
    },
    [isMobile, createMessage]
  );

  return (
    props.channel &&
    (props.channel?.type !== api.ChannelType.Channel || props.channel.admin?.id === session?.userId) && (
      <div className="channel-bottom-bar">
        <ReactTextareaAutosize
          minRows={TEXTAREA_MIN_ROWS}
          maxRows={isMobile ? TEXTAREA_MAX_ROWS_MOBILE : TEXTAREA_MAX_ROWS_PC}
          className="message-input"
          placeholder="Message"
          onKeyDown={handleKeyDown}
          value={messageQuery.data ?? ""}
          onChange={(event) => {
            queryClient.setQueriesData(["message_drafts", props.channel], () => event.target.value);

            const currentTime = Date.now();
            if (
              props.channel &&
              event.target.value.length > 0 &&
              currentTime - lastTypingEventTime.current > TYPING_EVENT_DELAY
            ) {
              sendGatewayEvent("TypingC2SEvent", {
                channelId: props.channel?.id!,
              });
              lastTypingEventTime.current = currentTime;
            }
          }}
          ref={ref}
        />
        <div
          className="send-icon"
          onClick={createMessage}
        >
          {editMessageQuery.data ? <MdEdit /> : <IoSend />}
        </div>
        {editMessageQuery.data && (
          <div
            className="cancel-edit-icon"
            onClick={() => {
              queryClient.setQueriesData(["edit_message", props.channel], () => null);
              queryClient.setQueriesData(["message_drafts", props.channel], () => "");
            }}
          >
            <MdCancel />
          </div>
        )}
      </div>
    )
  );
});

export default ChannelBottomBar;
