import { useEffect, useState } from 'react'
import { ChannelElement } from '../channels/Channels'
import './ChannelBody.css'
import { useGatewayContext } from '../..'
import { createMeController, createChannelController, Post, ChannelTypeEnum, Message, createMessageController, createPostController } from '../../api'

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
  const [messageController] = useState(createMessageController())
  const [postController] = useState(createPostController())
  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const lastEvent = useGatewayContext()

  useEffect(() => {
    if (!element) return

    if (lastEvent?.type == "CreateMessageEvent" && lastEvent?.channelId == element?.id) {
      messageController.getMessageById(lastEvent.messageId).then(message => {
        setMessages(messages => [ ...messages, message ])
      })
    }

    if (lastEvent?.type == "UpdateMessageEvent" && lastEvent?.channelId == element?.id) {
      messageController.getMessageById(lastEvent.messageId).then(message => {
        setMessages(messages => {
          const newMessages = [ ...messages ]
          newMessages[messages.findIndex(value => value.id == message.id)] = message
          return newMessages
        })
      })
    }

    if (lastEvent?.type == "DeleteMessageEvent" && lastEvent?.channelId == element?.id) {
      setMessages(messages => {
        const newMessages = [ ...messages ]
        newMessages.splice(messages.findIndex(value => value.id == lastEvent.messageId), 1)
        return newMessages
      })
    }

    if (lastEvent?.type == "CreatePostEvent" && lastEvent?.channelId == element?.id) {
      postController.getPostById(lastEvent.postId).then(post => {
        setPosts(posts => [ ...posts, post ])
      })
    }

    if (lastEvent?.type == "UpdatePostEvent" && lastEvent?.channelId == element?.id) {
      postController.getPostById(lastEvent.postId).then(post => {
        setPosts(posts => {
          const newPosts = [ ...posts ]
          newPosts[posts.findIndex(value => value.id == post.id)] = post
          return newPosts
        })
      })
    }

    if (lastEvent?.type == "DeletePostEvent" && lastEvent?.channelId == element?.id) {
      setPosts(posts => {
        const newPosts = [ ...posts ]
        newPosts.splice(posts.findIndex(value => value.id == lastEvent.postId), 1)
        return newPosts
      })
    }
  }, [lastEvent])

  useEffect(() => {
    if (!element) return

    if (element?.type == ChannelTypeEnum.Channel) {
      channelController.getPosts(element?.id!).then(posts => {
        setPosts(posts)
      })
    } else {
      meController.getUser().then(user => { setUserId(user.id!) })
      channelController.getMessages(element?.id!).then(messages => {
        setMessages(messages)
      })
    }
  }, [element])

  if (!element) {
    return <div></div>
  }

  return (
    <div className='channelBody'>
      { element.type == ChannelTypeEnum.Channel ? (
        posts.map(post => (
          <div className='messageContainer'>
            <div className='message messageLeft'>
              <div className='content'>{post.content}</div>
              <div className='timestamp'>{formatDate(post.timestamp)}</div>
            </div>
          </div>
        ))
      ) : (
        messages.map(message => (
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