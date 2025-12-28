export type XAIChatRequestProps = {
  model: string
  systemInstruction?: string
  messages: Message[]
  apiKey?: string
  baseUrl?: string
  generationConfig: {
    topP: number
    temperature: number
    maxOutputTokens: number
  }
  stream?: boolean
}

interface XAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Convert Gemini-style messages to xAI/OpenAI format
function convertToXAIMessages(messages: Message[], systemInstruction?: string): XAIMessage[] {
  const xaiMessages: XAIMessage[] = []

  // Add system instruction if provided
  if (systemInstruction) {
    xaiMessages.push({
      role: 'system',
      content: systemInstruction,
    })
  }

  // Convert messages
  for (const message of messages) {
    let content = ''
    
    // Extract text content from parts
    for (const part of message.parts) {
      if (part.text) {
        content += part.text
      }
      // Note: xAI Grok supports multimodal, but for now we focus on text
      // Image support can be added later if needed
    }

    if (content) {
      xaiMessages.push({
        role: message.role === 'model' ? 'assistant' : message.role as 'user',
        content,
      })
    }
  }

  return xaiMessages
}

export default async function xaiChat({
  messages = [],
  systemInstruction,
  model,
  apiKey,
  baseUrl = 'https://api.x.ai',
  generationConfig,
  stream = true,
}: XAIChatRequestProps) {
  // Convert messages to xAI format
  const xaiMessages = convertToXAIMessages(messages, systemInstruction)

  const requestBody = {
    model,
    messages: xaiMessages,
    max_tokens: generationConfig.maxOutputTokens,
    temperature: generationConfig.temperature,
    top_p: generationConfig.topP,
    stream,
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`xAI API error: ${response.status} - ${errorText}`)
  }

  return response.body
}
