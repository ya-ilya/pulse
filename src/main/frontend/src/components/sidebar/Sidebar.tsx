import "./Sidebar.css";

import { GrGroup } from "react-icons/gr";
import { LuMegaphone } from "react-icons/lu";
import { useIsMobile } from "../../hooks";

type SidebarProps = {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  setShowCreateChannelDialog: (showCreateChannelDialog: boolean) => void;
  setShowCreateGroupDialog: (showCreateGroupDialog: boolean) => void;
};

function Sidebar(props: SidebarProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={`sidebar ${isMobile ? "--sidebar-mobile" : ""}`}
      style={{ left: props.showSidebar ? "0" : "-100%" }}
    >
      <div
        className="element"
        onClick={() => {
          props.setShowSidebar(false);
          props.setShowCreateGroupDialog(true);
        }}
      >
        <GrGroup />
        <div className="text">Create group</div>
      </div>
      <div
        className="element"
        onClick={() => {
          props.setShowSidebar(false);
          props.setShowCreateChannelDialog(true);
        }}
      >
        <LuMegaphone />
        <div className="text">Create channel</div>
      </div>
    </div>
  );
}

export default Sidebar;
