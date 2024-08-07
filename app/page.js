'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the cosmically delicious support assistant. How can I help you today?"
    },
  ])
  const [message, setMessage] = useState('')
  //Kit:add loading state...
  const [isLoading, setIsLoading] = useState(false) 

  const sendMessage = async () => {
    //if (!message.trim()) return;  // Don't send empty messages- version 1
    if (!message.trim() || isLoading) return; //add loading state...
    setIsLoading(true)//version 2

    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },  // Add the user's message to the chat
      { role: 'assistant', content: '' },  // Add a placeholder for the assistant's response
    ])
    //upgrade: add try/catch
    try {
    // Send the message to the server
    const response = await fetch('/api/chat', { //when in try statement add await before fetching
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    })

    //detect network response for rejections
    if (!response.ok) {
        throw new Error('Network response was not ok')
    }

    //Version 2: refactor into try statement re: reader/decoder and stage while loop
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
    const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1]
        let otherMessages = messages.slice(0, messages.length - 1)
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ]
      })
    }
    //then stage catch to handle err
    } catch(error) {
        console.error('Error:', error)
        setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
        ])
    }
    //Kit:change the loading state to false after the program runs
    setIsLoading(false)
    }

  //Kit:handle and track key presses
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  //Add-auto scrolling
  const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

  //final code snippet psuedocode
  /*
  return (
    <Box
      // ... (rest of the Box props)
    >
      <Stack
        // ... (rest of the Stack props)
      >
        <Stack
          // ... (rest of the messages Stack props)
        >
          {messages.map((message, index) => (
            // ... (message rendering code)
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
  */

  return (
      // ... (rest of the Box props)
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >   
    {/* ... (rest of the Stack props) */}
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
            {/* ... (rest of the messages Stack props) */}
          {messages.map((message, index) => (
            // ... (message rendering code)
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          {/* adding a div at the end of the message stack */}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            //Kit:add for key presses
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button variant="contained" onClick={sendMessage} disabled={isLoading}> 
            {/* Kit: update the button to reflect the disabled state, change from send to using a ternary operator */}
            {/* Send */}
            {isLoading ? 'Sending...' : 'Send'}

          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

//Version 1: without try catch statement within sendMessage
/*   
.then(async (res) => {
    const reader = res.body.getReader()  // Get a reader to read the response body
    const decoder = new TextDecoder()  // Create a decoder to decode the response text

    let result = ''
    // Function to process the text from the response
    return reader.read().then(function processText({ done, value }) {
    if (done) {
        return result
    }
    const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
    setMessages((messages) => {
        let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
        let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
        return [
        ...otherMessages,
        { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
        ]
    })
    return reader.read().then(processText)  // Continue reading the next chunk of the response
    })
})
}
*/