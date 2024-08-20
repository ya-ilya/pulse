import { useContext, useEffect, useState } from 'react'
import './ChannelBody.css'
import { createChannelController, ChannelTypeEnum, Message, createMessageController, Channel } from '../../api'
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

  const messagesQuery = useQuery({
    queryKey: ["messages", channel],
    queryFn: () => channel ? channelController.getMessages(channel?.id!)! : [],
    keepPreviousData: true
  })

  const self = useContext(AuthenticationContext)

  function scrollToBottom() {
    const messageContainers = document.getElementsByClassName("messageContainer")

    if (messageContainers.length > 0) {
      messageContainers[messageContainers.length - 1].scrollIntoView({ behavior: "instant", block: "end" })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

  useEffect(() => {
    if (messagesQuery.isSuccess) {
      scrollToBottom()
    }
  }, [messagesQuery.isSuccess])

  useGatewayContext({
    "CreateMessageEvent": (event) => {
      messageController.getMessageById(event.messageId).then(message => {
        queryClient.setQueryData(["messages", channel], (messages: Message[] | undefined) => {
          if (!messages) return [ message ]

          return [ ...messages, message ]
        })

        scrollToBottom()
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
    }
  }, (event) => channel != null && event.channelId == channel.id)

  if (!channel) {
    return <div></div>
  }

  return (
    <div className='channelBody'>
      {
        messagesQuery.data?.map(message => (
          <div className='messageContainer'>
            <div className={message.user?.id == self?.id ? 'message messageRight' : 'message messageLeft'}>
              { (channel.type != ChannelTypeEnum.PrivateChat && channel.type != ChannelTypeEnum.Channel) && <div className='user'>{message.user?.displayName}</div> }
              <div className='inner'>
                <div className='content'>{message.content}</div>
                <div className='timestamp'>{formatDate(message.timestamp)}</div>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
}

export default ChannelBody