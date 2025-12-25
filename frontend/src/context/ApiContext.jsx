import React, { createContext } from 'react'
import { getApiBaseUrl } from '../utils/api'

export const ApiContext = createContext()

export function ApiProvider({ children }) {
  const apiBaseUrl = getApiBaseUrl()

  return (
    <ApiContext.Provider value={{ apiBaseUrl }}>
      {children}
    </ApiContext.Provider>
  )
}