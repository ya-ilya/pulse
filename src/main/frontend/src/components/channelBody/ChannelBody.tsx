import { useEffect, useState } from 'react'
import { ChannelElement } from '../channels/Channels'
import './ChannelBody.css'
import { createMeController, createChannelController, Post, ChannelTypeEnum, Message, createMessageController, createPostController } from '../../api'
import { useGatewayContext } from '../../gateway'

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

  useGatewayContext({
    "CreateMessageEvent": (event) => {
      messageController.getMessageById(event.messageId).then(message => {
        setMessages(messages => [ ...messages, message ])
      })
    },
    "UpdateMessageEvent": (event) => {
      messageController.getMessageById(event.messageId).then(message => {
        setMessages(messages => {
          const newMessages = [ ...messages ]
          newMessages[messages.findIndex(value => value.id == message.id)] = message
          return newMessages
        })
      })
    },
    "DeleteMessageEvent": (event) => {
      setMessages(messages => {
        const newMessages = [ ...messages ]
        newMessages.splice(messages.findIndex(value => value.id == event.messageId), 1)
        return newMessages
      })
    },
    "CreatePostEvent": (event) => {
      postController.getPostById(event.postId).then(post => {
        setPosts(posts => [ ...posts, post ])
      })
    },
    "UpdatePostEvent": (event) => {
      postController.getPostById(event.postId).then(post => {
        setPosts(posts => {
          const newPosts = [ ...posts ]
          newPosts[posts.findIndex(value => value.id == post.id)] = post
          return newPosts
        })
      })
    },
    "DeletePostEvent": (event) => {
      setPosts(posts => {
        const newPosts = [ ...posts ]
        newPosts.splice(posts.findIndex(value => value.id == event.postId), 1)
        return newPosts
      })
    },
  }, () => element != null)

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