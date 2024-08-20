import { useState } from "react";
import "./ChannelBottomBar.css"
import { IoSend } from "react-icons/io5";
import { Channel, ChannelTypeEnum, createChannelController } from "../../api";

type ChannelBottomBarProps = {
  channel: Channel | undefined
}

function ChannelBottomBar({ channel }: ChannelBottomBarProps) {
  const [message, setMessage] = useState("")

  if (!channel) {
    return <div></div>
  }

  function createMessage() {
    if (message.length <= 2) {
      return
    }

    createChannelController()
      .createMessage(channel?.id!, { content: message })
      .then(() => setMessage(""))
  }

  return channel?.type != ChannelTypeEnum.Channel ? (
    <div className="channelBottomBar">
      <input className="messageInput" type='text' placeholder='Search' onKeyDown={(event) => event.key == "Enter" && createMessage()} value={message} onChange={(event) => setMessage(event.target.value)}/>
      <div className="icon" onClick={createMessage}><IoSend/></div>
    </div>
  ) : <div></div>
}

export default ChannelBottomBar