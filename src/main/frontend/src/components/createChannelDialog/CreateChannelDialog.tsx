import "./CreateChannelDialog.css";

import * as api from "../../api";

import { useEffect, useState } from "react";

type CreateChannelDialogProps = {
  showCreateChannelDialog: boolean;
  setShowCreateChannelDialog: (showCreateChannelDialog: boolean) => void;
};

function CreateChannelDialog(props: CreateChannelDialogProps) {
  const channelController = api.useChannelController();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit() {
    if (name.length <= 2) {
      return;
    }

    setLoading(true);
    channelController?.createChannel({ name: name }).then(() => {
      props.setShowCreateChannelDialog(false);
      setLoading(false);
    });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        props.setShowCreateChannelDialog(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <div
      className="create-channel-dialog"
      style={{
        visibility: props.showCreateChannelDialog ? "visible" : "hidden",
      }}
    >
      <div className="header">Create channel</div>
      <input
        type="text"
        className="name-input"
        placeholder="Channel name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
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

export default CreateChannelDialog;
