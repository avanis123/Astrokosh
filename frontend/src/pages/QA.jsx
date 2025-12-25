import React, { useState, useRef, useEffect } from 'react'
import Loader from '../components/Loader'
import { apiEndpoints } from '../utils/api'

function QA() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleAsk = async (e) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiEndpoints.askQuestion(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      })

      if (!response.ok) throw new Error(`Request failed: ${response.statusText}`)

      const data = await response.json()
      const answer = data.answer || 'No answer available'

      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (err) {
      setError(err.message)
      setMessages((prev) =>
        prev.slice(0, -1)
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-gray-400 mb-6">Q&A Assistant</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-gray-600 rounded-lg shadow-md p-6 mb-6">
        {messages.length === 0 ? (
          <div className="text-center text-white py-12">
            <p className="text-lg">👋 Start by asking a question</p>
            <p className="text-sm mt-2">Example: "What is VELC?"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  )
}

export default QA