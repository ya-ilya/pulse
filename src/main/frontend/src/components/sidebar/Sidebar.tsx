import { LuMegaphone } from 'react-icons/lu'
import './Sidebar.css'
import { GrGroup } from 'react-icons/gr'

type SidebarProps = {
  showSidebar: boolean,
  setShowSidebar: (showSidebar: boolean) => void,
  setShowCreateChannelDialog: (showCreateChannelDialog: boolean) => void,
  setShowCreateGroupDialog: (showCreateGroupDialog: boolean) => void
}

export function Sidebar({ showSidebar, setShowSidebar, setShowCreateChannelDialog, setShowCreateGroupDialog }: SidebarProps) {
  return (
    <div className="sidebar" style={{ left: showSidebar ? "0" : "-100%" }}>
      <div className="element" onClick={() => { setShowSidebar(false); setShowCreateGroupDialog(true) }}>
        <GrGroup/>
        <div className="text">Create group</div>
      </div>
      <div className="element" onClick={() => { setShowSidebar(false); setShowCreateChannelDialog(true) }}>
        <LuMegaphone/>
        <div className="text">Create channel</div>
      </div>
    </div>
  )
}