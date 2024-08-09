import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API 

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = "Hello, and thank you for that question. Here is my answer..."// Use your own system prompt here

//SIMPLE POST request you can test with postman
/*
export function POST(req) {
  //code along code 
  console.log("POST api/chat")
  return NextResponse.json({message: "Hello from the server side"}) 
}
*/

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages

    //can be hardcoded like so:
    /*
     messages: [{"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What can you do?"},
      {"role": "assistant", "content": "I can provide simple yet limited responses as I am under development and maintenance."},],
    */
    model: 'gpt-4o-mini', // Specify the model to use
    stream: true, // Enable streaming responses
  })
  //console.log(completion.choices[0]);

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}

POST();