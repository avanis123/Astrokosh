import { useState, useEffect, useContext } from 'react'
import { ApiContext } from '../context/ApiContext'

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { apiBaseUrl } = useContext(ApiContext)

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          ...options,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const result = await response.json()

        if (isMounted) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred')
          setData(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [url])

  return { data, loading, error }
}
