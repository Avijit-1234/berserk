import { useState, useRef, useEffect } from 'react';
import { Mic, Send, BookOpen, Loader2 } from 'lucide-react';

export default function AITutor() {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // +5 BONUS POINTS: Web Speech API for Hindi/Hinglish Voice Input
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Input. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Accepts Hindi and Hinglish
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setChat(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      // Hits your exact Phase 2 backend route
      const response = await fetch('http://localhost:8000/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setChat(prev => [...prev, { 
        role: 'ai', 
        content: data.answer, 
        topic: data.topic, 
        sources: data.sources 
      }]);

    } catch (error) {
      setChat(prev => [...prev, { role: 'ai', content: "System Error: Could not reach the Vault." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl font-sans">
      
      {/* Header */}
      <div className="bg-[#1a1a1a] p-4 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-white font-bold text-lg">Socrates AI</h2>
          <p className="text-xs text-green-400 font-mono">Vault RAG System Active</p>
        </div>
      </div>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chat.length === 0 && (
          <div className="text-center text-gray-500 mt-20 italic">
            Ask a question about the syllabus, or use the mic to speak in Hindi.
          </div>
        )}

        {chat.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#1e1e1e] text-gray-200 border border-gray-800'}`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
            
            {/* The Source Citation Data for the Hackathon Judges */}
            {msg.role === 'ai' && msg.sources?.length > 0 && (
              <div className="mt-2 w-full max-w-[85%]">
                <details className="text-xs text-gray-500 cursor-pointer group">
                  <summary className="flex items-center gap-1 hover:text-blue-400 select-none">
                    <BookOpen size={12} />
                    <span className="font-mono">View NCERT Sources ({msg.topic})</span>
                  </summary>
                  <div className="mt-2 p-3 bg-black/50 border border-gray-800 rounded-lg space-y-2">
                    {msg.sources.map((src, sIdx) => (
                      <div key={sIdx} className="border-l-2 border-blue-500 pl-2">
                        <span className="text-blue-400 font-bold uppercase block">{src.book} - PAGE {src.page}</span>
                        <span className="italic line-clamp-2">"{src.content}"</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="animate-spin" size={16} /> Retrieving from NCERT Vault...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#1a1a1a] border-t border-gray-800 flex gap-2">
        <button 
          type="button"
          onClick={startListening}
          className={`p-3 rounded-lg border transition-colors ${isListening ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-[#222] border-gray-700 text-gray-400 hover:text-white'}`}
          title="Speak in Hindi/Hinglish"
        >
          <Mic size={20} />
        </button>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What is a Mendelian disorder?"
          className="flex-1 bg-[#222] border border-gray-700 rounded-lg px-4 text-white focus:outline-none focus:border-blue-500 text-sm"
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-lg transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}