import { ChannelElement } from "../channels/Channels"
import './ChannelTopBar.css'

type ChannelTopBarProps = { element: ChannelElement | undefined }

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