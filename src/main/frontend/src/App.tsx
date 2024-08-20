import { useState } from 'react'
import './App.css'
import Channels, { ChannelElement } from './components/channels/Channels'
import ChannelBody from './components/channelBody/ChannelBody'
import ChannelTopBar from './components/channelTopBar/ChannelTopBar'
import ChannelBottomBar from './components/channelBottomBar/ChannelBottomBar'
import { Sidebar } from './components/sidebar/Sidebar'
import CreateChannelDialog from './components/createChannelDialog/CreateChannelDialog'
import CreateGroupDialog from './components/createGroupDialog/CreateGroupDialog'

function App() {
  const [element, setElement] = useState<ChannelElement>()
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
      <Channels element={element} setElement={setElement} setShowSidebar={setShowSidebar}/>
      <div className='channel'>
        <ChannelTopBar element={element}/>
        <ChannelBody element={element}/>
        <ChannelBottomBar element={element}/>
      </div>
      <CreateChannelDialog showCreateChannelDialog={showCreateChannelDialog} setShowCreateChannelDialog={setShowCreateChannelDialog}/>
      <CreateGroupDialog showCreateGroupDialog={showCreateGroupDialog} setShowCreateGroupDialog={setShowCreateGroupDialog}/>
      <div className='background' onClick={() => { setShowSidebar(false); hideDialogs() }} style={{ visibility: isBackgroundVisible() ? "visible" : "hidden", background: "rgba(0, 0, 0, 0.5)" }}/>
    </div>
  )
}

export default App
