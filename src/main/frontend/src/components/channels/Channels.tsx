import { useEffect, useState } from "react"
import "./Channels.css"
import { FiMenu } from "react-icons/fi"
import { useGatewayContext } from "../.."
import { Channel, ChannelTypeEnum, createChannelController } from "../../api"

export interface ChannelElement {
  name: string
  type: ChannelTypeEnum
  id: number
}

function channelElement(channel: Channel): ChannelElement {
  return { name: channel.name!, type: channel.type!, id: channel.id! }
}

type ChannelsProps = { setElement: (element: ChannelElement | null) => void }

function Channels({ setElement }: ChannelsProps) {
  const [channelController] = useState(createChannelController())
  const [query, setQuery] = useState("")
  const [elements, setElements] = useState<ChannelElement[]>([])
  const lastEvent = useGatewayContext()

  useEffect(() => {
    if (lastEvent?.type == "CreateChannelEvent") {
      channelController.getChannelById(lastEvent.channelId).then(channel => {
        setElements(elements => [ ...elements, channelElement(channel) ])
      })
    }

    if (lastEvent?.type == "UpdateChannelEvent") {
      channelController.getChannelById(lastEvent.channelId).then(channel => {
        setElements(elements => {
          const newElements = [ ...elements ]
          newElements[elements.findIndex(value => value.id == channel.id)] = channelElement(channel)
          return newElements
        })
      })
    }

    if (lastEvent?.type == "DelteChannelEvent") {
      setElements(elements => {
        const newElements = [ ...elements ]
        newElements.splice(elements.findIndex(value => value.id == lastEvent.channelId), 1)
        return newElements
      })
    }
  }, [lastEvent])


  useEffect(() => {
    channelController.getChannels().then(channels => {
      setElements(channels.map(channel => channelElement(channel)))
    })
  }, [])

  return (
    <div className="channels">
      <div className="searchContainer">
        <FiMenu/>
        <div className='search'>
          <input className='input' type='text' placeholder='Search' value={query} onChange={(event) => setQuery(event.target.value)}/>
        </div>
      </div>
      { elements && elements.map(element => <div className="channel" onClick={() => setElement(element)}>{element.name}</div>) }
    </div>
  )
}

export default Channels