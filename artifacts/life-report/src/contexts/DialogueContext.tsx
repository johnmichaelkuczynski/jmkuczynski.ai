import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MinimalChannelMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DialogueContextType {
  isOpen: boolean;
  openDialogue: () => void;
  closeDialogue: () => void;
  history: MinimalChannelMessage[];
  setHistory: React.Dispatch<React.SetStateAction<MinimalChannelMessage[]>>;
}

const DialogueContext = createContext<DialogueContextType | null>(null);

export function DialogueProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<MinimalChannelMessage[]>([]);

  return (
    <DialogueContext.Provider value={{
      isOpen,
      openDialogue: () => setIsOpen(true),
      closeDialogue: () => setIsOpen(false),
      history,
      setHistory
    }}>
      {children}
    </DialogueContext.Provider>
  );
}

export function useDialogue() {
  const context = useContext(DialogueContext);
  if (!context) throw new Error('useDialogue must be used within a DialogueProvider');
  return context;
}
