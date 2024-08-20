import { useContext, useState } from 'react'
import { createChannelController, createUserController, User } from '../../api'
import './CreateGroupDialog.css'
import { AuthenticationContext } from '../..'
import { FaUser } from 'react-icons/fa'

type CreateGroupDialogProps = {
  showCreateGroupDialog: boolean,
  setShowCreateGroupDialog: (showCreateGroupDialog: boolean) => void
}

function CreateGroupDialog({ showCreateGroupDialog, setShowCreateGroupDialog }: CreateGroupDialogProps) {
  const [channelController] = useState(createChannelController())
  const [userController] = useState(createUserController())

  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const self = useContext(AuthenticationContext)

  function handleSubmit() {
    if (name.length <= 2) {
      return
    }

    setLoading(true)
    channelController.createGroupChat({ name: name, with: users.map(user => user.id!) }).then(() => {
      setShowCreateGroupDialog(false)
    }).finally(() => setLoading(false))
  }

  function handleAddUser() {
    if (self?.username == username) {
      return
    }

    if (users.find((user) => user.username == username)) {
      return
    }

    setLoading(true)
    userController.getUserByUsername(username).then(user => {
      setUsers(users => [ ...users, user ])
      setUsername("")
    }).finally(() => setLoading(false))
  }

  return (
    <div className="createGroupDialog" style={{ visibility: showCreateGroupDialog ? "visible" : "hidden" }}>
      <div className="header">Create group</div>
      <input type="text" className="nameInput" placeholder="Group name" value={name} onChange={(event) => setName(event.target.value)}/>
      <div className="users">
        <div className="header">Users</div>
        <div className="list">
          { users.map(user => (
            <div className="element" onClick={() => setUsers(users => users.filter(user => user != user))}>
              <FaUser/>
              <div className="username">{user.username}</div>
            </div>
          ))}
        </div>
        <div className="addUser">
          <input type="text" className="usernameInput" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)}/>
          <button type="button" className="button" onClick={handleAddUser}>+</button>
        </div>
      </div>
      <button type="button" className="submit" onClick={handleSubmit} disabled={loading}>Done</button>
    </div>
  )
}

export default CreateGroupDialog