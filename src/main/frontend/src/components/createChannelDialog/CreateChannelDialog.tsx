import { useState } from "react"
import { createChannelController } from "../../api"
import './CreateChannelDialog.css'

type CreateChannelDialogProps = {
 showCreateChannelDialog: boolean,
 setShowCreateChannelDialog: (showCreateChannelDialog: boolean) => void
}

function CreateChannelDialog({ showCreateChannelDialog, setShowCreateChannelDialog }: CreateChannelDialogProps) {
  const [channelController] = useState(createChannelController())

  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit() {
    if (name.length <= 2) {
      return
    }

    setLoading(true)
    channelController.createChannel({ name: name }).then(() => {
      setShowCreateChannelDialog(false)
      setLoading(false)
    })
  }

  return (
    <div className="createChannelDialog" style={{ visibility: showCreateChannelDialog ? "visible" : "hidden" }}>
      <div className="header">Create channel</div>
      <input type="text" className="nameInput" placeholder="Channel name" value={name} onChange={(event) => setName(event.target.value)}/>
      <button type="button" className="submit" onClick={handleSubmit} disabled={loading}>Done</button>
    </div>
  )
}

export default CreateChannelDialog