import "./App.css";

import * as api from "./api";

import { useRef, useState } from "react";

import Channel from "./components/channel/Channel";
import Channels from "./components/channels/Channels";
import CreateChannelDialog from "./components/createChannelDialog/CreateChannelDialog";
import CreateGroupDialog from "./components/createGroupDialog/CreateGroupDialog";
import { Sidebar } from "./components/sidebar/Sidebar";
import useOnScreenKeyboardScrollFix from "./hooks/useOnScreenKeyboardScrollFix";

function App() {
  const [channel, setChannel] = useState<api.Channel>();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChannel, setShowChannel] = useState(false);
  const [showCreateChannelDialog, setShowCreateChannelDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);

  const channelsRef = useRef();

  useOnScreenKeyboardScrollFix();

  function hideDialogs() {
    setShowSidebar(false);
    setShowCreateChannelDialog(false);
    setShowCreateGroupDialog(false);
  }

  function isBackgroundVisible() {
    return showSidebar || showCreateChannelDialog || showCreateGroupDialog;
  }

  return (
    <div className="home">
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        setShowCreateChannelDialog={setShowCreateChannelDialog}
        setShowCreateGroupDialog={setShowCreateGroupDialog}
      />
      <Channels
        ref={channelsRef}
        channel={channel}
        setChannel={setChannel}
        setShowSidebar={setShowSidebar}
        setShowChannel={setShowChannel}
      />
      <Channel
        ref={channelsRef}
        channel={channel}
        showChannel={showChannel}
        setShowChannel={setShowChannel}
      />
      <CreateChannelDialog
        showCreateChannelDialog={showCreateChannelDialog}
        setShowCreateChannelDialog={setShowCreateChannelDialog}
      />
      <CreateGroupDialog
        showCreateGroupDialog={showCreateGroupDialog}
        setShowCreateGroupDialog={setShowCreateGroupDialog}
      />
      <div
        className="background"
        onClick={hideDialogs}
        style={{
          visibility: isBackgroundVisible() ? "visible" : "hidden",
          background: "rgba(0, 0, 0, 0.5)",
        }}
      />
    </div>
  );
}

export default App;
