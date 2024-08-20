import { useContext, useEffect, useState } from 'react'
import './ChannelBody.css'
import { createChannelController, Post, ChannelTypeEnum, Message, createMessageController, createPostController, Channel } from '../../api'
import { useGatewayContext } from '../../gateway'
import { AuthenticationContext } from '../..'
import { useQuery, useQueryClient } from 'react-query'

type ChannelBodyProps = {
  channel: Channel | undefined
}

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

function ChannelBody({ channel }: ChannelBodyProps) {
  const queryClient = useQueryClient()

  const [channelController] = useState(createChannelController())
  const [messageController] = useState(createMessageController())
  const [postController] = useState(createPostController())

  const messagesQuery = useQuery({
    queryKey: ["messages", channel],
    queryFn: () => (channel && channel.type != ChannelTypeEnum.Channel) ? channelController.getMessages(channel?.id!)! : [],
    keepPreviousData: true
  })
  
  const postsQuery = useQuery({
    queryKey: ["posts", channel],
    queryFn: () => (channel && channel.type == ChannelTypeEnum.Channel) ? channelController.getPosts(channel?.id!)! : [],
    keepPreviousData: true
  })

  const self = useContext(AuthenticationContext)

  useEffect(() => {
    var channelBody = document.getElementsByClassName("channelBody")[0]

    if (!channelBody) {
      return
    }

    if (channelBody.scrollHeight - channelBody.clientHeight <= channelBody.scrollTop + 1) {
      channelBody.scrollTop = channelBody.scrollHeight - channelBody.clientHeight;
    }
  }, [messagesQuery.data, postsQuery.data])

  useGatewayContext({
    "CreateMessageEvent": (event) => {
      messageController.getMessageById(event.messageId).then(message => {
        queryClient.setQueryData(["messages", channel], (messages: Message[] | undefined) => {
          if (!messages) return [ message ]

          return [ ...messages, message ]
        })
      })
    },
    "UpdateMessageContentEvent": (event) => {
      queryClient.setQueriesData(["messages", channel], (messages: Message[] | undefined) => {
        if (!messages) return [ ]

        const newMessages = [ ...messages ]
        newMessages[messages.findIndex(value => value.id == event.messageId)].content = event.content
        return newMessages
      })
    },
    "DeleteMessageEvent": (event) => {
      queryClient.setQueriesData(["messages", channel], (messages: Message[] | undefined) => {
        if (!messages) return [ ]

        const newMessages = [ ...messages ]
        newMessages.splice(messages.findIndex(value => value.id == event.messageId), 1)
        return newMessages
      })
    },
    "CreatePostEvent": (event) => {
      postController.getPostById(event.postId).then(post => {
        queryClient.setQueryData(["posts", channel], (posts: Post[] | undefined) => {
          if (!posts) return [ post ]

          return [ ...posts, post ]
        })
      })
    },
    "UpdatePostContentEvent": (event) => {
      queryClient.setQueriesData(["posts", channel], (posts: Post[] | undefined) => {
        if (!posts) return [ ]

        const newPosts = [ ...posts ]
        newPosts[posts.findIndex(value => value.id == event.postId)].content = event.content
        return newPosts
      })
    },
    "DeletePostEvent": (event) => {
      queryClient.setQueriesData(["posts", channel], (posts: Post[] | undefined) => {
        if (!posts) return [ ]

        const newPosts = [ ...posts ]
        newPosts.splice(posts.findIndex(value => value.id == event.postId), 1)
        return newPosts
      })
    },
  }, (event) => channel != null && event.channelId == channel.id)

  if (!channel) {
    return <div></div>
  }

  return (
    <div className='channelBody'>
      { channel.type == ChannelTypeEnum.Channel ? (
        postsQuery.data?.map(post => (
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
        messagesQuery.data?.map(message => (
          <div className='messageContainer'>
            <div className={message.user.id == self?.id ? 'message messageRight' : 'message messageLeft'}>
              { channel.type != ChannelTypeEnum.PrivateChat && <div className='user'>{message.user.displayName}</div> }
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