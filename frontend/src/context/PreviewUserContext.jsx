import { createContext, useContext } from 'react'

const PreviewUserContext = createContext(null)

export const PreviewUserProvider = ({ user, children }) => (
  <PreviewUserContext.Provider value={user}>
    {children}
  </PreviewUserContext.Provider>
)

export const usePreviewUser = () => useContext(PreviewUserContext)
