import { useState } from 'react'
import './App.css'
import Channels, { ChannelElement } from './components/channels/Channels'
import ChannelBody from './components/channelBody/ChannelBody'
import ChannelTopBar from './components/channelTopBar/ChannelTopBar'
import ChannelBottomBar from './components/channelBottomBar/ChannelBottomBar'
import { Sidebar } from './components/sidebar/Sidebar'

function App() {
  const [element, setElement] = useState<ChannelElement>()
  const [showSidebar, setShowSidebar] = useState<boolean>(false)

  return (
    <div className='home'>
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar}/>
      <Channels element={element} setElement={setElement} setShowSidebar={setShowSidebar}/>
      <div className='channel'>
        <ChannelTopBar element={element}/>
        <ChannelBody element={element}/>
        <ChannelBottomBar element={element}/>
      </div>
      <div className='background' onClick={() => setShowSidebar(false)} style={{ visibility: showSidebar ? "visible" : "hidden", background: showSidebar ? "rgba(0, 0, 0, 0.5)" : "transparent" }}/>
    </div>
  )
}

export default App
