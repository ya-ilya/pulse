import { Channel } from "../../api"
import './ChannelTopBar.css'

type ChannelTopBarProps = {
  channel: Channel | undefined
}

function ChannelTopBar({ channel }: ChannelTopBarProps) {
  if (!channel) {
    return <div></div>
  }

  return (
    <div className="channelTopBar">
      {channel?.name}
    </div>
  )
}

export default ChannelTopBar