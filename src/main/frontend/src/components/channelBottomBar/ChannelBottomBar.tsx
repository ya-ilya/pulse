import { useState } from "react";
import { ChannelTypeEnum, createChannelController } from "../../api";
import { Element } from "../channels/Channels";
import "./ChannelBottomBar.css"
import { IoSend } from "react-icons/io5";

type ChannelBottomBarProps = { element: Element | null }

function ChannelBottomBar({ element }: ChannelBottomBarProps) {
  const [message, setMessage] = useState("")

  if (!element) {
    return <div></div>
  }

  function createMessage() {
    createChannelController()
      .createMessage({ content: message }, element?.id!)
      .then(() => setMessage(""))
  }

  return element?.type != ChannelTypeEnum.Channel ? (
    <div className="channelBottomBar">
      <input className="messageInput"  type='text' placeholder='Search' value={message} onChange={(event) => setMessage(event.target.value)}/>
      <div className="icon" onClick={createMessage}><IoSend/></div>
    </div>
  ) : <div></div>
}

export default ChannelBottomBar