import "./ChannelBottomBar.css";

import * as api from "../../api";

import { forwardRef, useContext, useState } from "react";

import { AuthenticationContext } from "../..";
import { IoSend } from "react-icons/io5";

type ChannelBottomBarProps = {
  channel?: api.Channel;
};

const ChannelBottomBar = forwardRef(
  (props: ChannelBottomBarProps, ref: any) => {
    const channelController = api.useChannelController();

    const [message, setMessage] = useState("");

    const self = useContext(AuthenticationContext);

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
        <textarea
          className="message-input"
          placeholder="Message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
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
