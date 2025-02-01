import "./ChannelBottomBar.css";

import * as api from "../../api";

import { forwardRef, useCallback, useContext, useRef, useState } from "react";

import { AuthenticationContext } from "../..";
import { IoSend } from "react-icons/io5";
import ReactTextareaAutosize from "react-textarea-autosize";
import { sendGatewayEvent } from "../../api";
import { useIsMobile } from "../../hooks";

const TYPING_EVENT_DELAY = 300;

const TEXTAREA_MIN_ROWS = 1;
const TEXTAREA_MAX_ROWS_MOBILE = 6;
const TEXTAREA_MAX_ROWS_PC = 12;

type ChannelBottomBarProps = {
  channel?: api.Channel;
};

function createMessage(
  channelId: number,
  message: string,
  setMessage: (message: string) => void,
  controller: api.ChannelController | undefined
) {
  if (message.length <= 2) {
    return;
  }

  const temporaryMessage = `${message}`;
  setMessage("");

  controller?.createMessage(channelId, {
    content: temporaryMessage,
  });
}

const ChannelBottomBar = forwardRef(
  (props: ChannelBottomBarProps, ref: any) => {
    const channelController = api.useChannelController();

    const [message, setMessage] = useState("");
    const lastTypingEventTime = useRef(Date.now());

    const isMobile = useIsMobile();

    const [authenticationData] = useContext(AuthenticationContext);

    const handleClick = useCallback(() => {
      createMessage(props.channel?.id!, message, setMessage, channelController);
    }, [message, channelController, props]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (isMobile || event.key !== "Enter" || event.shiftKey) {
          return;
        }

        event.preventDefault();

        createMessage(
          props.channel?.id!,
          message,
          setMessage,
          channelController
        );
      },
      [message, channelController, props]
    );

    if (!props.channel) {
      return <div></div>;
    }

    return props.channel?.type != api.ChannelType.Channel ||
      props.channel.admin?.id == authenticationData?.user?.id ? (
      <div className="channel-bottom-bar">
        <ReactTextareaAutosize
          minRows={TEXTAREA_MIN_ROWS}
          maxRows={isMobile ? TEXTAREA_MAX_ROWS_MOBILE : TEXTAREA_MAX_ROWS_PC}
          className="message-input"
          placeholder="Message"
          onKeyDown={handleKeyDown}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);

            const currentTime = Date.now();
            if (
              props.channel &&
              message.length > 0 &&
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
        <div className="icon" onClick={handleClick}>
          <IoSend />
        </div>
      </div>
    ) : (
      <div></div>
    );
  }
);

export default ChannelBottomBar;
