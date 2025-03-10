import "./CreateGroupDialog.css";

import * as api from "../../api";

import { useCallback, useContext, useState } from "react";

import { AuthenticationContext } from "../..";
import { FaUser } from "react-icons/fa";
import { useKey } from "../../hooks/useKey";

type CreateGroupDialogProps = {
  showCreateGroupDialog: boolean;
  setShowCreateGroupDialog: (showCreateGroupDialog: boolean) => void;
};

function CreateGroupDialog(props: CreateGroupDialogProps) {
  const channelController = api.useChannelController();
  const userController = api.useUserController();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState<api.User[]>([]);
  const [loading, setLoading] = useState(false);

  const [authenticationData] = useContext(AuthenticationContext);

  useKey("Escape", () => {
    props.setShowCreateGroupDialog(false);
  });

  const handleSubmit = useCallback(() => {
    if (name.length <= 2) {
      return;
    }

    setLoading(true);
    channelController
      ?.createGroupChat({ name: name, with: users.map((user) => user.id!) })
      ?.then(() => {
        props.setShowCreateGroupDialog(false);
      })
      ?.finally(() => setLoading(false));
  }, [name, users, channelController, props]);

  const handleAddUser = useCallback(() => {
    if (authenticationData?.username == username) {
      return;
    }

    if (users.find((user) => user.username == username)) {
      return;
    }

    setLoading(true);
    userController
      ?.getUserByUsername(username)
      ?.then((user) => {
        setUsers((users) => [...users, user]);
        setUsername("");
      })
      ?.finally(() => setLoading(false));
  }, [users, username, authenticationData, userController]);

  return (
    <div
      className="create-group-dialog"
      style={{ visibility: props.showCreateGroupDialog ? "visible" : "hidden" }}
    >
      <div className="header">Create group</div>
      <input
        type="text"
        className="name-input"
        placeholder="Group name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div className="users">
        <div className="header">Users</div>
        <div className="list">
          {users.map((user) => (
            <div
              className="element"
              onClick={() =>
                setUsers((users) => users.filter((user) => user != user))
              }
            >
              <FaUser />
              <div className="username">{user.username}</div>
            </div>
          ))}
        </div>
        <div className="add-user">
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
            onClick={handleAddUser}
            disabled={loading}
          >
            +
          </button>
        </div>
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

export default CreateGroupDialog;
