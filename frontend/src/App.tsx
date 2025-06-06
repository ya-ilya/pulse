import "./App.css";

import * as api from "./api";

import { useRef, useState } from "react";

import Background from "./components/background/Background";
import Channel from "./components/channel/Channel";
import Channels from "./components/channels/Channels";
import CreateChannelDialog from "./components/createChannelDialog/CreateChannelDialog";
import CreateGroupDialog from "./components/createGroupDialog/CreateGroupDialog";
import CreatePrivateChatDialog from "./components/createPrivateChatDialog/CreatePrivateChatDialog";
import Sidebar from "./components/sidebar/Sidebar";
import useOnScreenKeyboardScrollFix from "./hooks/useOnScreenKeyboardScrollFix";

function App() {
  const [channel, setChannel] = useState<api.Channel>();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChannel, setShowChannel] = useState(false);
  const [showCreatePrivateChatDialog, setShowCreatePrivateChatDialog] = useState(false);
  const [showCreateChannelDialog, setShowCreateChannelDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);

  const channelsRef = useRef<HTMLDivElement>(null);

  useOnScreenKeyboardScrollFix();

  return (
    <div className="home">
      <Channels
        ref={channelsRef}
        channel={channel}
        setChannel={setChannel}
        setShowSidebar={setShowSidebar}
        showChannel={showChannel}
        setShowChannel={setShowChannel}
      />
      <Channel
        shards={[channelsRef]}
        channel={channel}
        showChannel={showChannel}
        setShowChannel={setShowChannel}
      />
      <Background
        variables={[showSidebar, showCreatePrivateChatDialog, showCreateChannelDialog, showCreateGroupDialog]}
        setters={[
          setShowSidebar,
          setShowCreatePrivateChatDialog,
          setShowCreateChannelDialog,
          setShowCreateGroupDialog,
        ]}
      >
        <Sidebar
          showSidebar={showSidebar}
          setShowCreatePrivateChatDialog={setShowCreatePrivateChatDialog}
          setShowSidebar={setShowSidebar}
          setShowCreateChannelDialog={setShowCreateChannelDialog}
          setShowCreateGroupDialog={setShowCreateGroupDialog}
        />
        <CreatePrivateChatDialog
          showCreatePrivateChatDialog={showCreatePrivateChatDialog}
          setShowCreatePrivateChatDialog={setShowCreatePrivateChatDialog}
        />
        <CreateChannelDialog
          showCreateChannelDialog={showCreateChannelDialog}
          setShowCreateChannelDialog={setShowCreateChannelDialog}
        />
        <CreateGroupDialog
          showCreateGroupDialog={showCreateGroupDialog}
          setShowCreateGroupDialog={setShowCreateGroupDialog}
        />
      </Background>
    </div>
  );
}

export default App;
