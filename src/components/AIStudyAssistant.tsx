import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  UploadCloud,
  Brain,
  Zap,
  BookOpen,
  Image as ImageIcon,
  Bot,
  User as UserIcon,
  RefreshCw,
  HelpCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import type { ChatMessage, Course } from '../types/index.ts';

interface AIStudyAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeCourse: Course | null;
}

export function AIStudyAssistant({
  isOpen,
  onClose,
  activeCourse,
}: AIStudyAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      role: 'assistant',
      content: `Hey! I'm your StudyVault AI Peer Tutor. I can help break down tricky homework steps, review essay outlines, or quiz you before an exam.\n\n${
        activeCourse
          ? `Currently focused on: **${activeCourse.name}** (${activeCourse.period}).`
          : 'Feel free to pick any subject!'
      }`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speedPreference, setSpeedPreference] = useState<'fast' | 'general' | 'pro'>('general');
  const [enableHighThinking, setEnableHighThinking] = useState(false);
  const [systemRole, setSystemRole] = useState<'peer_tutor' | 'math_physics_coach' | 'essay_rubric_critic'>('peer_tutor');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImageBase64) || isLoading) return;

    const userText = input.trim();
    const hasImage = !!selectedImageBase64;
    const currentImg = selectedImageBase64;

    const userMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: userText || (hasImage ? 'Analyze this homework problem or notes photo.' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: currentImg || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedImageBase64(null);
    setIsLoading(true);

    try {
      if (hasImage) {
        // Image Analysis API call (gemini-3.1-pro-preview)
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImg,
            mimeType: imageMimeType,
            prompt: userText || 'Carefully analyze this homework problem or study notes image. Provide step-by-step guidance.',
            courseContext: activeCourse ? `${activeCourse.name} - ${activeCourse.description}` : 'General High School',
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to analyze image');

        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: 'assistant',
            content: data.analysis,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'gemini-3.1-pro-preview (Vision)',
          },
        ]);
      } else {
        // Multi-turn chat API call with role and thinking mode
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            courseContext: activeCourse ? `${activeCourse.name} - ${activeCourse.description}` : 'General High School',
            speedPreference,
            enableHighThinking,
            systemRole,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Chat request failed');

        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: 'assistant',
            content: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: data.modelUsed,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Unable to connect to AI study service.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>AI Study Tutor</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Gemini
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {activeCourse ? activeCourse.name : 'All Subjects'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Model & Thinking Mode Bar */}
      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-2 text-xs">
        {/* Speed / Model selector */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              setSpeedPreference('fast');
              setEnableHighThinking(false);
            }}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              speedPreference === 'fast'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title="gemini-3.1-flash-lite (Instant answers)"
          >
            ⚡ Fast
          </button>
          <button
            onClick={() => setSpeedPreference('general')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              speedPreference === 'general' && !enableHighThinking
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title="gemini-3.5-flash (Balanced daily homework)"
          >
            Standard
          </button>
        </div>

        {/* High Thinking Mode Toggle (gemini-3.1-pro-preview) */}
        <button
          onClick={() => {
            const next = !enableHighThinking;
            setEnableHighThinking(next);
            if (next) setSpeedPreference('pro');
          }}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
            enableHighThinking
              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40'
              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
          title="Deep step-by-step reasoning with gemini-3.1-pro-preview ThinkingLevel.HIGH"
        >
          <Brain className="w-3.5 h-3.5" />
          <span>High Thinking {enableHighThinking ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Role Selector */}
      <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between text-[11px] text-slate-500">
        <span>Tutor Persona:</span>
        <select
          value={systemRole}
          onChange={(e) => setSystemRole(e.target.value as any)}
          className="text-[11px] bg-transparent font-semibold text-slate-700 dark:text-slate-200 border-none focus:outline-none cursor-pointer"
        >
          <option value="peer_tutor">Friendly Peer Tutor</option>
          <option value="math_physics_coach">STEM & Math Step-by-Step Coach</option>
          <option value="essay_rubric_critic">AP English Essay & Thesis Critic</option>
        </select>
      </div>

      {/* Chat Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/80 shadow-2xs'
                }`}
              >
                {msg.imageUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-white/20 max-h-48">
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded homework problem"
                      className="w-full object-cover"
                    />
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && <span className="font-mono text-[9px]">{msg.modelUsed}</span>}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-500 flex items-center space-x-2">
              <span className="animate-spin text-purple-600">✦</span>
              <span>
                {enableHighThinking ? 'Deep Reasoning & Solving (High Thinking)...' : 'Thinking...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview if selected */}
      {selectedImageBase64 && (
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={selectedImageBase64}
              alt="Preview"
              className="w-10 h-10 object-cover rounded-md border"
            />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Homework Photo Ready
              </p>
              <p className="text-[10px] text-slate-400">Will be analyzed by Gemini Pro Vision</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedImageBase64(null)}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        <div className="flex items-center space-x-2">
          {/* Photo Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex-shrink-0"
            title="Upload photo of homework problem or handwritten notes"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or explain homework problem..."
            className="flex-1 text-xs py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={(!input.trim() && !selectedImageBase64) || isLoading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
