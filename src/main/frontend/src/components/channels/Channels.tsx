import { useEffect, useState } from "react"
import "./Channels.css"
import { FiMenu } from "react-icons/fi"
import { Channel, ChannelTypeEnum, createChannelController } from "../../api"
import { useGatewayContext } from "../../gateway"

export interface ChannelElement {
  name: string
  type: ChannelTypeEnum
  id: number
}

function channelElement(channel: Channel): ChannelElement {
  return { name: channel.name!, type: channel.type!, id: channel.id! }
}

type ChannelsProps = {
  element: ChannelElement | undefined,
  setElement: (element: ChannelElement | undefined) => void,
  setShowSidebar: (showSidebar: boolean) => void
}

function Channels({ element, setElement, setShowSidebar }: ChannelsProps) {
  const [channelController] = useState(createChannelController())

  const [query, setQuery] = useState("")
  const [elements, setElements] = useState<ChannelElement[]>([])

  useGatewayContext({
    "CreateChannelEvent": (event) => {
      channelController.getChannelById(event.channelId).then(channel => {
        setElements(elements => [ ...elements, channelElement(channel) ])
      })
    },
    "UpdateChannelEvent": (event) => {
      channelController.getChannelById(event.channelId).then(channel => {
        setElements(elements => {
          const newElements = [ ...elements ]
          newElements[elements.findIndex(value => value.id == channel.id)] = channelElement(channel)
          return newElements
        })
      })
    },
    "DeleteChannelEvent": (event) => {
      setElements(elements => {
        const newElements = [ ...elements ]
        newElements.splice(elements.findIndex(value => value.id == event.channelId), 1)
        return newElements
      })
    }
  })

  useEffect(() => {
    channelController.getChannels().then(channels => {
      setElements(channels.map(channel => channelElement(channel)))
    })
  }, [])

  return (
    <div className="channels">
      <div className="topBar">
        <FiMenu onClick={() => setShowSidebar(true)}/>
        <div className='search'>
          <input className='input' type='text' placeholder='Search' value={query} onChange={(event) => setQuery(event.target.value)}/>
        </div>
      </div>
      { elements && elements.filter(value => value.name.includes(query)).map(value => <div className={value.id == element?.id ? "channel selectedChannel" : "channel"} onClick={() => setElement(value)}>{value.name}</div>) }
    </div>
  )
}

export default Channels