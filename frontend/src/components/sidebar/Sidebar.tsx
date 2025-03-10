import "./Sidebar.css";

import { AuthenticationContext } from "../..";
import { GrGroup } from "react-icons/gr";
import { IoMdExit } from "react-icons/io";
import { LuMegaphone } from "react-icons/lu";
import { VscAccount } from "react-icons/vsc";
import { useContext } from "react";
import { useIsMobile } from "../../hooks";
import { useKey } from "../../hooks/useKey";

type SidebarProps = {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  setShowCreateChannelDialog: (showCreateChannelDialog: boolean) => void;
  setShowCreateGroupDialog: (showCreateGroupDialog: boolean) => void;
};

function Sidebar(props: SidebarProps) {
  const isMobile = useIsMobile();
  const [authenticationData, setAuthenticationData] = useContext(
    AuthenticationContext
  );

  useKey("Escape", () => {
    props.setShowSidebar(false);
  });

  return (
    <div
      className={`sidebar ${isMobile ? "--sidebar-mobile" : ""}`}
      style={{ left: props.showSidebar ? "0" : "-100%" }}
    >
      <div className="element account-element">
        <VscAccount />
        <div className="text">{authenticationData?.username}</div>
      </div>
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
      <div
        className="element"
        onClick={() => {
          props.setShowSidebar(false);
          setAuthenticationData(null);
        }}
        style={{ color: "red" }}
      >
        <IoMdExit />
        <div className="text">Logout</div>
      </div>
    </div>
  );
}

export default Sidebar;
