import { useState } from "react"
import "./Channels.css"
import { FiMenu } from "react-icons/fi"
import { Channel, createChannelController } from "../../api"
import { useGatewayContext } from "../../gateway"
import { useQuery, useQueryClient } from "react-query"

type ChannelsProps = {
  channel: Channel | undefined,
  setChannel: (channel: Channel | undefined) => void,
  setShowSidebar: (showSidebar: boolean) => void
}

function Channels({ channel, setChannel, setShowSidebar }: ChannelsProps) {
  const queryClient = useQueryClient()

  const [channelController] = useState(createChannelController())

  const [filterQuery, setFilterQuery] = useState("")
  
  const channelsQuery = useQuery({
    queryKey: ["channels"],
    queryFn: () => channelController.getChannels(),
    keepPreviousData: true
  })

  useGatewayContext({
    "CreateChannelEvent": (event) => {
      channelController.getChannelById(event.channelId).then(channel => {
        queryClient.setQueriesData(["channels"], (channels: Channel[] | undefined) => {
          if (!channels) return [ channel ]

          return [ ...channels, channel ]
        }) 
      })
    },
    "UpdateChannelNameEvent": (event) => {
      queryClient.setQueriesData(["channels"], (channels: Channel[] | undefined) => {
        if (!channels) return []

        const newElements = [ ...channels ]
        newElements[channels.findIndex(value => value.id == event.channelId)].name = event.name
        return newElements
      })
    },
    "DeleteChannelEvent": (event) => {
      queryClient.setQueriesData(["channels"], (channels: Channel[] | undefined) => {
        if (!channels) return []

        const newElements = [ ...channels ]
        newElements.splice(channels.findIndex(value => value.id == event.channelId), 1)
        return newElements
      })
    }
  })

  return (
    <div className="channels">
      <div className="topBar">
        <FiMenu onClick={() => setShowSidebar(true)}/>
        <div className='search'>
          <input className='input' type='text' placeholder='Search' value={filterQuery} onChange={(event) => setFilterQuery(event.target.value)}/>
        </div>
      </div>
      { channelsQuery.data?.filter(value => value.name?.includes(filterQuery)).map(value => <div className={value.id == channel?.id ? "channel selectedChannel" : "channel"} onClick={() => setChannel(value)}>{value.name}</div>) }
    </div>
  )
}

export default Channels