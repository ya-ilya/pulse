import { Element } from "../channels/Channels"
import './ChannelTopBar.css'

type ChannelTopBarProps = { element: Element | null }

function ChannelTopBar({ element }: ChannelTopBarProps) {
  if (!element) {
    return <div></div>
  }

  return (
    <div className="channelTopBar">
      {element?.name}
    </div>
  )
}

export default ChannelTopBar