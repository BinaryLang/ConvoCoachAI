import React, { useState, useRef } from 'react';
import { Chat } from '@google/genai';
import { RoleSelector } from './components/RoleSelector';
import { ChatWindow } from './components/ChatWindow';
import { FeedbackReport } from './components/FeedbackReport';
import { Role, Message, ChatStatus, ConversationFeedback } from './types';
import { createChatSession, sendMessageStream, analyzeConversation } from './services/geminiService';
import { ROLES, INITIAL_GREETING } from './constants';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState<ConversationFeedback | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Keep track of the chat instance. We use a ref so it doesn't trigger re-renders
  const chatInstance = useRef<Chat | null>(null);

  const handleSelectRole = async (role: Role) => {
    setCurrentRole(role);
    setStatus('active');
    setMessages([]);
    setFeedback(null);

    // Initialize Gemini Chat
    try {
      chatInstance.current = createChatSession(role.systemInstruction);
      
      // Add initial greeting from system
      // Note: We don't actually send this to the model as a prompt, 
      // we just simulate the model starting the conversation for UX.
      // Or we can prompt the model to start. Let's prompt the model to start.
      setIsTyping(true);
      
      // We send a hidden system prompt to kickstart the conversation naturally
      const responseText = await sendMessageStream(
        chatInstance.current,
        "Start the conversation now according to your role instructions.",
        (textChunk) => {
           // We don't stream the initial setup prompt, but we could.
           // To keep it clean, we'll wait for the full response for the first message
           // or we can stream it to a temporary buffer.
           // Let's rely on the final output for the first message to avoid complex state.
        }
      );
      
      const initialMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages([initialMessage]);
      
    } catch (error) {
      console.error("Failed to start chat", error);
      // Fallback if API fails immediately
      const errorMsg: Message = {
         id: Date.now().toString(),
         role: 'model',
         text: "I'm having trouble connecting right now. Please check your API key and try again.",
         timestamp: Date.now()
      };
      setMessages([errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!chatInstance.current) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Stream Model Response
    const modelMsgId = (Date.now() + 1).toString();
    // Placeholder message for streaming updates
    const placeholderMsg: Message = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, placeholderMsg]);

    try {
      await sendMessageStream(chatInstance.current, text, (chunk) => {
         setMessages(prev => prev.map(m => 
            m.id === modelMsgId ? { ...m, text: m.text + chunk } : m
         ));
      });
    } catch (error) {
      console.error("Chat error", error);
       setMessages(prev => prev.map(m => 
          m.id === modelMsgId ? { ...m, text: "Sorry, I encountered an error. Please try again." } : m
       ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    setStatus('analyzing');
    try {
      const result = await analyzeConversation(messages);
      setFeedback(result);
      setStatus('finished');
    } catch (error) {
      console.error("Analysis failed", error);
      setStatus('active'); // Go back to chat if failed? Or show error state
    }
  };

  const handleRestart = () => {
    setStatus('idle');
    setCurrentRole(null);
    setMessages([]);
    setFeedback(null);
    chatInstance.current = null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                C
              </div>
              <span className="font-bold text-xl text-slate-800">ConvoCoach AI</span>
            </div>
            {status !== 'idle' && (
              <div className="flex items-center">
                <button 
                  onClick={handleRestart}
                  className="text-sm text-slate-500 hover:text-slate-800 font-medium"
                >
                  Exit Session
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {status === 'idle' && (
          <RoleSelector onSelectRole={handleSelectRole} />
        )}

        {status === 'active' && currentRole && (
          <div className="flex-1 max-w-4xl w-full mx-auto p-4 h-[calc(100vh-4rem)]">
            <ChatWindow 
              messages={messages}
              currentRole={currentRole}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              onEndSession={handleEndSession}
            />
          </div>
        )}

        {status === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
             <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
             <h2 className="text-xl font-semibold text-slate-700">Analyzing your conversation...</h2>
             <p className="text-slate-500">Checking for clarity, confidence, and vocabulary.</p>
          </div>
        )}

        {status === 'finished' && feedback && (
          <FeedbackReport 
            feedback={feedback}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}