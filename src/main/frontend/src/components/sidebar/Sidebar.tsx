import { LuMegaphone } from 'react-icons/lu'
import './Sidebar.css'
import { GrGroup } from 'react-icons/gr'

export type SidebarProps = { showSidebar: boolean, setShowSidebar: (showSidebar: boolean) => void }

export function Sidebar({ showSidebar }: SidebarProps) {
  return (
    <div className="sidebar" style={{ left: showSidebar ? "0" : "-100%" }}>
      <div className="element">
        <GrGroup/>
        <div className="text">Create group</div>
      </div>
      <div className="element">
        <LuMegaphone/>
        <div className="text">Create channel</div>
      </div>
    </div>
  )
}