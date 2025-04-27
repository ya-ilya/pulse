import "./CreatePrivateChatDialog.css";

import * as api from "../../api";

import { useCallback, useContext, useState } from "react";

import { AuthenticationContext } from "../..";
import { FaUser } from "react-icons/fa";
import { useKey } from "../../hooks/useKey";

type CreatePrivateChatDialogProps = {
  showCreatePrivateChatDialog: boolean;
  setShowCreatePrivateChatDialog: (
    showCreatePrivateChatDialog: boolean
  ) => void;
};

function CreatePrivateChatDialog(props: CreatePrivateChatDialogProps) {
  const channelController = api.useChannelController();
  const userController = api.useUserController();

  const [username, setUsername] = useState("");
  const [user, setUser] = useState<api.User>();
  const [loading, setLoading] = useState(false);

  const [authenticationData] = useContext(AuthenticationContext);

  useKey("Escape", () => {
    props.setShowCreatePrivateChatDialog(false);
  });

  const handleSubmit = useCallback(() => {
    setLoading(true);
    channelController
      ?.createPrivateChat({ with: user?.id! })
      ?.then(() => {
        props.setShowCreatePrivateChatDialog(false);
      })
      ?.finally(() => setLoading(false));
  }, [name, user, channelController, props]);

  const handleSetUser = useCallback(() => {
    if (authenticationData?.username == username) {
      return;
    }

    setLoading(true);
    userController
      ?.getUserByUsername(username)
      ?.then((user) => {
        setUser(user);
        setUsername("");
      })
      ?.finally(() => setLoading(false));
  }, [user, username, authenticationData, userController]);

  return (
    <div
      className="create-private-chat-dialog"
      style={{
        visibility: props.showCreatePrivateChatDialog ? "visible" : "hidden",
      }}
    >
      <div className="header">Create private chat</div>
      <div className="users">
        <div className="header">User</div>
        <div className="list">
          {user ? (
            <div className="element" onClick={() => setUser(undefined)}>
              <FaUser />
              <div className="username">{user?.username}</div>
            </div>
          ) : (
            <div />
          )}
        </div>
        {!user ? (
          <div className="set-user">
            <input
              type="text"
              className="username-input"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <button
              type="button"
              className="button"
              onClick={handleSetUser}
              disabled={loading}
            >
              +
            </button>
          </div>
        ) : (
          <div />
        )}
      </div>
      <button
        type="button"
        className="submit"
        onClick={handleSubmit}
        disabled={loading}
      >
        Done
      </button>
    </div>
  );
}

export default CreatePrivateChatDialog;
