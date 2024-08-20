import { useContext, useEffect, useState } from 'react'
import { ChannelElement } from '../channels/Channels'
import './ChannelBody.css'
import { createChannelController, Post, ChannelTypeEnum, Message, createMessageController, createPostController } from '../../api'
import { useGatewayContext } from '../../gateway'
import { AuthenticationContext } from '../..'

type ChannelBodyProps = { element: ChannelElement | undefined }

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
  const [channelController] = useState(createChannelController())
  const [messageController] = useState(createMessageController())
  const [postController] = useState(createPostController())

  const [messages, setMessages] = useState<Message[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  const self = useContext(AuthenticationContext)

  useEffect(() => {
    var channelBody = document.getElementsByClassName("channelBody")[0]

    if (!channelBody) {
      return
    }

    if (channelBody.scrollHeight - channelBody.clientHeight <= channelBody.scrollTop + 1) {
      channelBody.scrollTop = channelBody.scrollHeight - channelBody.clientHeight;
    }
  }, [messages, posts])

  useGatewayContext({
    "CreateMessageEvent": (event) => {
      messageController.getMessageById(event.messageId).then(message => {
        setMessages(messages => [ ...messages, message ])
      })
    },
    "UpdateMessageContentEvent": (event) => {
      setMessages(messages => {
        const newMessages = [ ...messages ]
        newMessages[messages.findIndex(value => value.id == event.messageId)].content = event.content
        return newMessages
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
    "UpdatePostContentEvent": (event) => {
      setPosts(posts => {
        const newPosts = [ ...posts ]
        newPosts[posts.findIndex(value => value.id == event.postId)].content = event.content
        return newPosts
      })
    },
    "DeletePostEvent": (event) => {
      setPosts(posts => {
        const newPosts = [ ...posts ]
        newPosts.splice(posts.findIndex(value => value.id == event.postId), 1)
        return newPosts
      })
    },
  }, (event) => element != null && event.channelId == element.id)

  useEffect(() => {
    if (!element) return

    setPosts([])
    setMessages([])

    if (element?.type == ChannelTypeEnum.Channel) {
      channelController.getPosts(element?.id!).then(posts => {
        setPosts(posts)
      })
    } else {
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
              <div className='inner'>
                <div className='content'>{post.content}</div>
                <div className='timestamp'>{formatDate(post.timestamp)}</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        messages.map(message => (
          <div className='messageContainer'>
            <div className={message.user.id == self?.id ? 'message messageRight' : 'message messageLeft'}>
              { element.type != ChannelTypeEnum.PrivateChat && <div className='user'>{message.user.displayName}</div> }
              <div className='inner'>
                <div className='content'>{message.content}</div>
                <div className='timestamp'>{formatDate(message.timestamp)}</div>
              </div>
            </div>
          </div>
        ))
      ) }
    </div>
  )
}

export default ChannelBody