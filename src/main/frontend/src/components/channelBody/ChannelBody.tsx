import { useEffect, useState } from 'react'
import { ChannelElement } from '../channels/Channels'
import './ChannelBody.css'
import { useGatewayContext } from '../..'
import { createMeController, createChannelController, Post, ChannelTypeEnum, Message, User } from '../../api'

type ChannelBodyProps = { element: ChannelElement | null }

function formatDate(date: Date | string): string {
  if (date instanceof Date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`
  } else {
    date = new Date(date)
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`
  }
}

function ChannelBody({ element }: ChannelBodyProps) {
  const [meController] = useState(createMeController())
  const [channelController] = useState(createChannelController())
  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[] | null>(null)
  const [posts, setPosts] = useState<Post[] | null>(null)
  const lastEvent = useGatewayContext()

  function updateMessages() {
    channelController.getMessages(element?.id!).then((messages: Message[]) => {
      setMessages(messages)
    })
  }

  function updatePosts() {
    channelController.getPosts(element?.id!).then((posts: Post[]) => {
      setPosts(posts)
    })
  }

  useEffect(() => {
    if (!element) return

    if (lastEvent?.type == "CreateMessageEvent" && lastEvent?.channelId == element?.id) {
      updateMessages()
    }

    if (lastEvent?.type == "UpdateMessageEvent" && lastEvent?.channelId == element?.id) {
      updateMessages()
    }

    if (lastEvent?.type == "DeleteMessageEvent" && lastEvent?.channelId == element?.id) {
      updateMessages()
    }

    if (lastEvent?.type == "CreatePostEvent" && lastEvent?.channelId == element?.id) {
      updatePosts()
    }
  }, [lastEvent])

  useEffect(() => {
    if (!element) return

    if (element?.type == ChannelTypeEnum.Channel) {
      updatePosts()
    } else {
      meController.getUser().then((user: User) => {
        setUserId(user.id!)
      })

      updateMessages()
    }
  }, [element])

  if (!element) {
    return <div></div>
  }

  return (
    <div className='channelBody'>
      { element.type == ChannelTypeEnum.Channel ? (
        posts?.map(post => (
          <div className='messageContainer'>
            <div className='message messageLeft'>
              <div className='content'>{post.content}</div>
              <div className='timestamp'>{formatDate(post.timestamp)}</div>
            </div>
          </div>
        ))
      ) : (
        messages?.map(message => (
          <div className='messageContainer'>
            <div className={message.user.id == userId ? 'message messageRight' : 'message messageLeft'}>
              <div className='content'>{message.content}</div>
              <div className='timestamp'>{formatDate(message.timestamp)}</div>
            </div>
          </div>
        ))
      ) }
    </div>
  )
}

export default ChannelBody