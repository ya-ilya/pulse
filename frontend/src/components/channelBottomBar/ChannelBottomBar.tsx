import "./ChannelBottomBar.css";

import * as api from "../../api";

import { AuthenticationContext, queryClient } from "../..";
import { forwardRef, useCallback, useContext, useRef } from "react";

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

const ChannelBottomBar = forwardRef(
  (props: ChannelBottomBarProps, ref: any) => {
    const channelController = api.useChannelController();

    const lastTypingEventTime = useRef(Date.now());

    const isMobile = useIsMobile();

    const [authenticationData] = useContext(AuthenticationContext);

    const messageQuery = useQuery({
      queryKey: ["message_drafts", props.channel],
      queryFn: () => "",
    });

    const createMessage = useCallback(() => {
      const message = messageQuery.data!;

      if (message.length <= 2) {
        return;
      }

      queryClient.setQueriesData(["message_drafts", props.channel], () => "");

      channelController?.createMessage(props.channel?.id!, {
        content: message,
      });
    }, [props.channel, messageQuery, channelController]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (isMobile || event.key !== "Enter" || event.shiftKey) {
          return;
        }

        event.preventDefault();

        createMessage();

        queryClient.setQueriesData(["message_drafts", props.channel], () => "");
      },
      [messageQuery.data, channelController, props]
    );

    if (!props.channel) {
      return <div></div>;
    }

    return props.channel?.type != api.ChannelType.Channel ||
      props.channel.admin?.id == authenticationData?.userId ? (
      <div className="channel-bottom-bar">
        <ReactTextareaAutosize
          minRows={TEXTAREA_MIN_ROWS}
          maxRows={isMobile ? TEXTAREA_MAX_ROWS_MOBILE : TEXTAREA_MAX_ROWS_PC}
          className="message-input"
          placeholder="Message"
          onKeyDown={handleKeyDown}
          value={messageQuery.data}
          onChange={(event) => {
            queryClient.setQueriesData(
              ["message_drafts", props.channel],
              () => event.target.value
            );

            const currentTime = Date.now();
            if (
              props.channel &&
              messageQuery.data!.length > 0 &&
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
        <div className="icon" onClick={createMessage}>
          <IoSend />
        </div>
      </div>
    ) : (
      <div></div>
    );
  }
);

export default ChannelBottomBar;
