import { useState } from "react";
import { ChannelElement } from "../channels/Channels";
import "./ChannelBottomBar.css"
import { IoSend } from "react-icons/io5";
import { ChannelTypeEnum, createChannelController } from "../../api";

type ChannelBottomBarProps = { element: ChannelElement | null }

function ChannelBottomBar({ element }: ChannelBottomBarProps) {
  const [message, setMessage] = useState("")

  if (!element) {
    return <div></div>
  }

  function createMessage() {
    if (message.length <= 2) {
      return
    }

    createChannelController()
      .createMessage(element?.id!, { content: message })
      .then(() => setMessage(""))
  }

  return element?.type != ChannelTypeEnum.Channel ? (
    <div className="channelBottomBar">
      <input className="messageInput" type='text' placeholder='Search' onKeyDown={(event) => event.key == "Enter" && createMessage()} value={message} onChange={(event) => setMessage(event.target.value)}/>
      <div className="icon" onClick={createMessage}><IoSend/></div>
    </div>
  ) : <div></div>
}

export default ChannelBottomBar