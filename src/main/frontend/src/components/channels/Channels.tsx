import { useEffect, useState } from "react"
import "./Channels.css"
import { FiMenu } from "react-icons/fi"
import { ChannelTypeEnum, createChannelController } from "../../api"
import { useGatewayContext } from "../.."

export interface Element {
  name: string
  type: ChannelTypeEnum
  lastMessage: string
  id: number
}

type ChannelsProps = { setElement: (element: Element | null) => void }

function Channels({ setElement }: ChannelsProps) {
  const [channelController] = useState(createChannelController())
  const [query, setQuery] = useState("")
  const [elements, setElements] = useState<Element[]>([])
  const lastEvent = useGatewayContext()

  function updateChannels() {
    channelController.getChannels().then(response => {
      setElements(response.data.map(channel => ({ name: channel.name, type: channel.type, id: channel.id }) as Element))
    })
  }

  useEffect(() => {
    if (lastEvent?.type == "CreateChannelEvent") {
      updateChannels()
    }

    if (lastEvent?.type == "UpdateChannelEvent") {
      updateChannels()
    }
  }, [lastEvent])


  useEffect(() => {
    updateChannels()
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