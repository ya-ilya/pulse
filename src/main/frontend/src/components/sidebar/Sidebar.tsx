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

export function Sidebar({
  showSidebar,
  setShowSidebar,
  setShowCreateChannelDialog,
  setShowCreateGroupDialog,
}: SidebarProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={isMobile ? "sidebar sidebarMobile" : "sidebar"}
      style={{ left: showSidebar ? "0" : "-100%" }}
    >
      <div
        className="element"
        onClick={() => {
          setShowSidebar(false);
          setShowCreateGroupDialog(true);
        }}
      >
        <GrGroup />
        <div className="text">Create group</div>
      </div>
      <div
        className="element"
        onClick={() => {
          setShowSidebar(false);
          setShowCreateChannelDialog(true);
        }}
      >
        <LuMegaphone />
        <div className="text">Create channel</div>
      </div>
    </div>
  );
}
