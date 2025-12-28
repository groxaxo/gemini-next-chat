import { NextResponse, type NextRequest } from 'next/server'
import { handleError } from '../utils'

export const runtime = 'edge'
export const preferredRegion = ['cle1', 'iad1', 'pdx1', 'sfo1', 'sin1', 'syd1', 'hnd1', 'kix1']

const xaiApiKey = process.env.XAI_API_KEY as string
const xaiApiBaseUrl = process.env.XAI_API_BASE_URL as string

export async function POST(req: NextRequest) {
  const body = await req.json()
  const apiBaseUrl = xaiApiBaseUrl || 'https://api.x.ai'

  try {
    const url = `${apiBaseUrl}/v1/chat/completions`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${xaiApiKey}`,
      },
      body: JSON.stringify(body),
    })
    return new NextResponse(response.body, response)
  } catch (error) {
    if (error instanceof Error) {
      return handleError(error.message)
    }
  }
}
