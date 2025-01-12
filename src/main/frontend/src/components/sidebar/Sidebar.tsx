import "./Sidebar.css";

import { useContext, useEffect } from "react";

import { AuthenticationContext } from "../..";
import { GrGroup } from "react-icons/gr";
import { IoMdExit } from "react-icons/io";
import { LuMegaphone } from "react-icons/lu";
import { VscAccount } from "react-icons/vsc";
import { useIsMobile } from "../../hooks";

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        props.setShowSidebar(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <div
      className={`sidebar ${isMobile ? "--sidebar-mobile" : ""}`}
      style={{ left: props.showSidebar ? "0" : "-100%" }}
      onKeyDown={(event) => {
        if (event.key === "ESC") {
          event.preventDefault();
          props.setShowSidebar(false);
        }
      }}
    >
      <div className="element account-element">
        <VscAccount />
        <div className="text">{authenticationData?.user?.username}</div>
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
