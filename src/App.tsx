import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { JSX } from 'react/jsx-runtime';

interface Message {
  type: 'user' | 'bot' | 'image';
  text?: string;
  src?: string;
}

interface ApiResponse {
  response?: string[];
}

export default function SemanticChat(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      text: 'Hi. I am Dwarakesh. Ask me anything.'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isLoading && input.trim().length > 0) {
      handleSubmit();
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });
      const data: ApiResponse = await res.json();
      
      // Add bot responses
      if (data.response && Array.isArray(data.response)) {
        data.response.forEach((responseText: string) => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = responseText;
          
          const textContent = tempDiv.innerText.trim();
          if (textContent) {
            setMessages(prev => [...prev, { type: 'bot', text: textContent }]);
          }
          
          const images = tempDiv.querySelectorAll('img');
          images.forEach((img: HTMLImageElement) => {
            setMessages(prev => [...prev, { type: 'image', src: img.src }]);
          });
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, something went wrong.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-teal-600 text-white p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center font-bold">
            D
          </div>
          <div>
            <h1 className="font-semibold text-lg">Dwarakesh</h1>
            <p className="text-xs text-teal-100">Online</p>
          </div>
        </div>
      </div>

      {/* Chat messages container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-100"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.02) 10px, rgba(0,0,0,.02) 20px)`
        }}
      >
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.map((msg, idx) => (
            <React.Fragment key={idx}>
              {msg.type === 'user' && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-green-500 text-white px-4 py-2 rounded-lg rounded-tr-sm shadow-sm">
                    <div>{msg.text}</div>
                    <div className="text-xs text-green-100 mt-1 text-right">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )}
              
              {msg.type === 'bot' && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] bg-white text-gray-800 px-4 py-2 rounded-lg rounded-tl-sm shadow-sm">
                    <div className="font-semibold text-teal-600 text-sm mb-1">Dwarakesh</div>
                    <div>{msg.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )}
              
              {msg.type === 'image' && (
                <div className="flex justify-start">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <img src={msg.src} alt="Response" className="max-w-[250px] rounded" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="bg-gray-200 p-3 border-t border-gray-300">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-full bg-white border-none focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || input.trim().length === 0}
            className="w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}