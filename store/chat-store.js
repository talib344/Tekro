import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useChatStore = create(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      updateLastMessage: (content) => set((state) => {
        const messages = [...state.messages]
        messages[messages.length - 1].content = content
        return { messages }
      }),
      clearMessages: () => set({ messages: [] }),
    }),
    { name: 'tekro-chat' }
  )
)
