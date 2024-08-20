import { useState } from 'react'
import './App.css'
import Channels from './components/channels/Channels'
import ChannelBody from './components/channelBody/ChannelBody'
import ChannelTopBar from './components/channelTopBar/ChannelTopBar'
import ChannelBottomBar from './components/channelBottomBar/ChannelBottomBar'
import { Sidebar } from './components/sidebar/Sidebar'
import CreateChannelDialog from './components/createChannelDialog/CreateChannelDialog'
import CreateGroupDialog from './components/createGroupDialog/CreateGroupDialog'
import { Channel } from './api'

function App() {
  const [channel, setChannel] = useState<Channel>()
  const [showSidebar, setShowSidebar] = useState<boolean>(false)
  const [showCreateChannelDialog, setShowCreateChannelDialog] = useState<boolean>(false)
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState<boolean>(false)

  function hideDialogs() {
    setShowCreateChannelDialog(false)
    setShowCreateGroupDialog(false)
  }

  function isBackgroundVisible() {
    return showSidebar || showCreateChannelDialog || showCreateGroupDialog
  }

  return (
    <div className='home'>
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} setShowCreateChannelDialog={setShowCreateChannelDialog} setShowCreateGroupDialog={setShowCreateGroupDialog}/>
      <Channels channel={channel} setChannel={setChannel} setShowSidebar={setShowSidebar}/>
      <div className='channel'>
        <ChannelTopBar channel={channel}/>
        <ChannelBody channel={channel}/>
        <ChannelBottomBar channel={channel}/>
      </div>
      <CreateChannelDialog showCreateChannelDialog={showCreateChannelDialog} setShowCreateChannelDialog={setShowCreateChannelDialog}/>
      <CreateGroupDialog showCreateGroupDialog={showCreateGroupDialog} setShowCreateGroupDialog={setShowCreateGroupDialog}/>
      <div className='background' onClick={() => { setShowSidebar(false); hideDialogs() }} style={{ visibility: isBackgroundVisible() ? "visible" : "hidden", background: "rgba(0, 0, 0, 0.5)" }}/>
    </div>
  )
}

export default App
