import "./CreateChannelDialog.css";

import * as api from "../../api";

import { useCallback, useState } from "react";

import { useKey } from "../../hooks/useKey";

type CreateChannelDialogProps = {
  showCreateChannelDialog: boolean;
  setShowCreateChannelDialog: (showCreateChannelDialog: boolean) => void;
};

function CreateChannelDialog(props: CreateChannelDialogProps) {
  const channelController = api.useChannelController();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(() => {
    if (name.length <= 2) {
      return;
    }

    setLoading(true);
    channelController?.createChannel({ name: name }).then(() => {
      props.setShowCreateChannelDialog(false);
      setLoading(false);
    });
  }, [name, channelController, props]);

  useKey("Escape", () => {
    props.setShowCreateChannelDialog(false);
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
