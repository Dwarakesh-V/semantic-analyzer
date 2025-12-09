import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';

interface Message {
  type: 'user' | 'bot' | 'image';
  text?: string;
  src?: string;
  timestamp?: string; // ISO string from backend
}

interface ApiResponse {
  response?: string[];
}

export default function SemanticChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      text: 'Hi. I am Dwarakesh. Ask me anything.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const formatTime = (timestamp?: string): string => {
    if (!timestamp) return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = async (): Promise<void> => {
    const userMessage = input.trim();
    const userTimestamp = new Date().toISOString();
    setInput('');
    inputRef.current?.focus();

    setMessages(prev => [...prev, { type: 'user', text: userMessage, timestamp: userTimestamp }]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });

      const data: ApiResponse = await res.json();

      if (data.response && Array.isArray(data.response)) {
        data.response.forEach((responseText: string) => {
          const htmlContent = responseText.trim();

          if (htmlContent.length > 0) {
            setMessages(prev => [
              ...prev,
              { type: 'bot', text: htmlContent + "<br>", timestamp: new Date().toISOString() }
            ]);
          }
        });
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, something went wrong.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async (): Promise<void> => {
    try {
      await fetch('http://localhost:8000/clear', {
        method: 'POST'
      });

      // Create new initial message with current timestamp
      const initialMessage = {
        type: 'bot' as const,
        text: 'Hi. I am Dwarakesh. Ask me anything.',
        timestamp: new Date().toISOString()
      };

      setMessages([initialMessage]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('http://localhost:8000/history');
        const data = await res.json();

        const mapped = data.map((msg: any) => ({
          type: msg.role,
          text: msg.text,
          src: msg.src,
          timestamp: msg.timestamp
        }));

        // Only show initial greeting if there's no history
        if (mapped.length === 0) {
          setMessages([
            {
              type: 'bot',
              text: 'Hi. I am Dwarakesh. Ask me anything.',
              timestamp: new Date().toISOString()
            }
          ]);
        } else {
          setMessages(mapped);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    }

    loadHistory();
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Documentation Section - 40% */}
      <div className="hidden md:block w-[40%] bg-white overflow-y-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Semantic Intent Routing Engine</h1>

          <p className="text-gray-700 mb-6 leading-relaxed">
            A lightweight, fast, and fully deterministic alternative to traditional intent-classification systems.
            Built with <strong>React + Vite + Tailwind</strong> on the frontend and a <strong>Python-based semantic inference engine</strong> on the backend.
          </p>

          <p className="text-gray-700 mb-8 leading-relaxed">
            This system routes user queries through a graph of intents using sentence embeddings, adaptive confidence logic, and retrieval-based fallbacks—no classifiers, training loops, or model deployments required.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deterministic Intent Resolution</h3>
              <p className="text-gray-700 leading-relaxed">
                Resolves user queries by traversing a DAG-structured intent graph with path-level scoring instead of a single classifier.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Adaptive Confidence Thresholding</h3>
              <p className="text-gray-700 leading-relaxed">
                Automatically adjusts sensitivity based on query length and phrasing, improving routing stability on ambiguous inputs.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Retrieval-Augmented Fallbacks</h3>
              <p className="text-gray-700 leading-relaxed">
                When a query doesn't clearly match any intent, the system fetches semantically similar candidates and recovers gracefully.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Turn Context Handling</h3>
              <p className="text-gray-700 leading-relaxed">
                Maintains conversational context so follow-up questions like "same as before" or "for that" route correctly without repeating selections.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hot-Swappable Intent Graph</h3>
              <p className="text-gray-700 leading-relaxed">
                Intents are defined in JSON and automatically converted into a navigable graph.
                Updates apply instantly—no retraining or redeployment required.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast and Lightweight</h3>
              <p className="text-gray-700 leading-relaxed">
                Runs entirely on CPU and maintains <strong>sub-15ms routing latency</strong> thanks to caching and optimized traversal.
              </p>
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture Overview</h2>

          <ul className="space-y-2 text-gray-700 leading-relaxed">
            <li><strong>Frontend:</strong> React + Vite + Tailwind interface for entering queries and testing the routing behavior.</li>
            <li><strong>Backend:</strong> Python engine using sentence-transformer embeddings and deterministic traversal logic.</li>
            <li><strong>Intent Graph:</strong> JSON-defined structure supporting multi-parent nodes, examples, responses, and metadata.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why This Exists</h2>

          <p className="text-gray-700 mb-4 leading-relaxed">
            Most NLU systems rely on classifiers or fine-tuned models, which brings problems like:
          </p>

          <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">
            <li>retraining loops</li>
            <li>model drift</li>
            <li>slow iteration cycles</li>
            <li>low explainability</li>
          </ul>

          <p className="text-gray-700 leading-relaxed">
            This project avoids all of that by using semantic similarity, graph traversal, and context tracking to produce stable and predictable routing—even as intents change.
          </p>
        </div>
      </div>

      {/* Chat Section - 60% */}
      <div className="w-full md:w-[60%] bg-gray-100 flex flex-col border-r border-gray-300">
        {/* Header */}
        <div className="bg-teal-600 text-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center font-bold overflow-hidden">
                <img
                  src="/static/dp.png"
                  alt="D"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Dwarakesh</h1>
                <p className="text-xs text-teal-100">
                  Semantic intent routing engine
                  <span className="inline md:hidden">
                    &nbsp; [Works best on large screens]
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-teal-700 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Clear chat"
            >
              <Trash2 size={20} />
            </button>
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
          <div className="space-y-3 px-8 py-8">
            {messages.map((msg, idx) => (
              <React.Fragment key={idx}>
                {msg.type === 'user' && (
                  <div className="flex justify-end">
                    <div className="max-w-[70%] bg-white text-gray-800 px-4 py-2 rounded-lg rounded-tr-sm shadow-sm">
                      <div className="font-semibold text-teal-600 text-sm mb-1">You</div>
                      <div>{msg.text}</div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                )}

                {msg.type === 'bot' && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] bg-white text-gray-800 px-4 py-2 rounded-lg rounded-tl-sm shadow-sm">
                      <div className="font-semibold text-teal-600 text-sm mb-1">Dwarakesh</div>
                      <div className="bot-html-content" dangerouslySetInnerHTML={{ __html: msg.text ?? "" }} />
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                )}

                {msg.type === 'image' && (
                  <>
                    <br />
                    <div className="flex justify-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <img
                          src={msg.src}
                          alt="Response"
                          className="w-[250px] rounded"
                        />
                      </div>
                    </div>
                    <br />
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="bg-gray-200 p-3 border-t border-gray-300">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message"
              className="flex-1 px-4 py-3 rounded-full bg-white border-none focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              ref={inputRef}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || input.trim().length === 0}
              className="w-12 h-12 bg-teal-600 hover:bg-teal-700 cursor-pointer text-white rounded-full flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}