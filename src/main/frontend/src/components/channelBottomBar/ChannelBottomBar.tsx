import "./ChannelBottomBar.css";

import * as api from "../../api";

import { useContext, useState } from "react";

import { AuthenticationContext } from "../..";
import { IoSend } from "react-icons/io5";

type ChannelBottomBarProps = {
  channel: api.Channel | undefined;
};

function ChannelBottomBar({ channel }: ChannelBottomBarProps) {
  const channelController = api.useChannelController();

  const [message, setMessage] = useState("");

  const self = useContext(AuthenticationContext);

  if (!channel) {
    return <div></div>;
  }

  function createMessage() {
    if (message.length <= 2) {
      return;
    }

    channelController
      .createMessage(channel?.id!, { content: message })
      .then(() => setMessage(""));
  }

  return channel?.type != api.ChannelTypeEnum.Channel ||
    channel.admin?.id == self!.id ? (
    <div className="channelBottomBar">
      <input
        className="messageInput"
        type="text"
        placeholder="Message"
        onKeyDown={(event) => event.key == "Enter" && createMessage()}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="icon" onClick={createMessage}>
        <IoSend />
      </div>
    </div>
  ) : (
    <div></div>
  );
}

export default ChannelBottomBar;
