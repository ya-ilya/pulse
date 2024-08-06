import { useState } from 'react'
import './App.css'
import Channels, { ChannelElement } from './components/channels/Channels'
import ChannelBody from './components/channelBody/ChannelBody'
import ChannelTopBar from './components/channelTopBar/ChannelTopBar'
import ChannelBottomBar from './components/channelBottomBar/ChannelBottomBar'

function App() {
  const [element, setElement] = useState<ChannelElement | null>(null)

  return (
    <div className='home'>
      <Channels setElement={setElement}/>
      <div className='channel'>
        <ChannelTopBar element={element}/>
        <ChannelBody element={element}/>
        <ChannelBottomBar element={element}/>
      </div>
    </div>
  )
}

export default App
