import "./ChannelBottomBar.css";

import * as api from "../../api";

import { forwardRef, useContext, useRef, useState } from "react";

import { AuthenticationContext } from "../..";
import { IoSend } from "react-icons/io5";
import ReactTextareaAutosize from "react-textarea-autosize";
import { useIsMobile } from "../../hooks";

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

    const [message, setMessage] = useState("");
    const lastTypingEventTime = useRef(Date.now());

    const isMobile = useIsMobile();

    const self = useContext(AuthenticationContext);

    const { sendEvent } = api.useGatewayContext();

    if (!props.channel) {
      return <div></div>;
    }

    function createMessage() {
      if (message.length <= 2) {
        return;
      }

      channelController
        .createMessage(props.channel?.id!, { content: message })
        .then(() => setMessage(""));
    }

    return props.channel?.type != api.ChannelType.Channel ||
      props.channel.admin?.id == self!.id ? (
      <div className="channel-bottom-bar">
        <ReactTextareaAutosize
          minRows={TEXTAREA_MIN_ROWS}
          maxRows={isMobile ? TEXTAREA_MAX_ROWS_MOBILE : TEXTAREA_MAX_ROWS_PC}
          className="message-input"
          placeholder="Message"
          onKeyDown={(event) => {
            if (!isMobile && event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              createMessage();
            }
          }}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);

            const currentTime = Date.now();
            if (
              props.channel &&
              message.length > 0 &&
              currentTime - lastTypingEventTime.current > TYPING_EVENT_DELAY
            ) {
              sendEvent("TypingC2SEvent", {
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
