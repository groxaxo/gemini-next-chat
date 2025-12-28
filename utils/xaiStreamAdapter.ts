// Adapter to convert xAI/OpenAI SSE stream to Gemini-compatible format
export async function* convertXAIStreamToGemini(stream: ReadableStream) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim() || line.startsWith(':')) continue
        
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') {
            return
          }

          try {
            const json = JSON.parse(data)
            const choice = json.choices?.[0]
            
            if (!choice) continue

            const delta = choice.delta
            const content = delta?.content || ''
            
            // Convert to Gemini-like format
            if (content) {
              yield {
                candidates: [{
                  content: {
                    parts: [{ text: content }]
                  },
                  finishReason: choice.finish_reason || null
                }],
                functionCalls: () => null // xAI doesn't use Gemini's function calling format
              }
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
