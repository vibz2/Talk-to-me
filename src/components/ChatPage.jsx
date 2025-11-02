import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import {
    Send,
    Menu,
    X,
    MessageSquare,
    Plus,
    Home,
    Trash2,
    Sparkles
} from 'lucide-react';

const THERAPY_MODES = {
    cbt: {
        name: 'Dr. Sam',
        title: 'Cognitive Behavioral Therapy',
        subtitle: 'Let\'s explore your thoughts together',
        color: 'bg-blue-500',
        url: 'https://prod.spline.design/vpGtZv00xY6QN-B6/scene.splinecode',
        hue: 220
    },
    somatic: {
        name: 'Dr. Ava',
        title: 'Somatic Therapy',
        subtitle: 'Listen to what your body is telling you',
        color: 'bg-green-500',
        url: 'https://prod.spline.design/KjYQ0LxW-pOBH3r5/scene.splinecode',
        hue: 140
    },
    psychodynamic: {
        name: 'Dr. Leo',
        title: 'Psychodynamic Therapy',
        subtitle: 'Understanding patterns from the past',
        color: 'bg-purple-500',
        url: 'https://prod.spline.design/3pZHwWqXg-pcbvsW/scene.splinecode',
        hue: 270
    },
};

export default function ChatPage() {
    const { therapyMode } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default for immersion
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const therapist = THERAPY_MODES[therapyMode];

    useEffect(() => {
        const saved = localStorage.getItem('conversations');
        if (saved) {
            const parsed = JSON.parse(saved);
            setConversations(parsed);

            const modeConversations = parsed.filter(c => c.mode === therapyMode);
            if (modeConversations.length > 0) {
                const latest = modeConversations[0];
                setCurrentConversationId(latest.id);
                setMessages(latest.messages);
            }
        }
    }, [therapyMode]);

    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('conversations', JSON.stringify(conversations));
        }
    }, [conversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!therapist) {
        navigate('/');
        return null;
    }

    const startNewConversation = () => {
        const newId = Date.now().toString();
        const newConv = {
            id: newId,
            mode: therapyMode,
            title: `Session - ${new Date().toLocaleDateString()}`,
            messages: [],
            createdAt: new Date().toISOString()
        };
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversationId(newId);
        setMessages([]);
        setSidebarOpen(false);
    };

    const loadConversation = (convId) => {
        const conv = conversations.find(c => c.id === convId);
        if (conv) {
            setCurrentConversationId(convId);
            setMessages(conv.messages);
            setSidebarOpen(false);
        }
    };

    const deleteConversation = (convId) => {
        setConversations(prev => prev.filter(c => c.id !== convId));
        if (convId === currentConversationId) {
            setMessages([]);
            setCurrentConversationId(null);
        }
    };

    const updateCurrentConversation = (newMessages) => {
        if (!currentConversationId) {
            const newId = Date.now().toString();
            const title = `Session - ${new Date().toLocaleDateString()}`;
            const newConv = {
                id: newId,
                mode: therapyMode,
                title,
                messages: newMessages,
                createdAt: new Date().toISOString()
            };
            setConversations(prev => [newConv, ...prev]);
            setCurrentConversationId(newId);
        } else {
            setConversations(prev => prev.map(c =>
                c.id === currentConversationId
                    ? { ...c, messages: newMessages }
                    : c
            ));
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:4000/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    mode: therapyMode,
                    messages: input
                })
            });

            const data = await response.json();
            const aiMessage = { role: 'assistant', text: data.output };
            const updatedMessages = [...newMessages, aiMessage];
            setMessages(updatedMessages);
            updateCurrentConversation(updatedMessages);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                role: 'assistant',
                text: 'Sorry, I had trouble connecting. Please try again.'
            };
            const updatedMessages = [...newMessages, errorMessage];
            setMessages(updatedMessages);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const modeConversations = conversations.filter(c => c.mode === therapyMode);

    return (
        <div className="flex h-screen bg-[#FFFFFF] overflow-hidden">
            {/* Overlay Sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-0 h-full w-80 transition-transform duration-300 bg-white border-r border-[#B80F2A]/10 flex flex-col z-50 shadow-2xl`}>
                <div className="p-4 border-b border-[#B80F2A]/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-[#2B2B2B]">Your Sessions</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 hover:bg-[#FFEBEB] rounded-lg transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={startNewConversation}
                        className="w-full bg-[#B80F2A] text-white px-4 py-2 rounded-xl hover:bg-[#E63946] flex items-center gap-2 justify-center transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        New Session
                    </button>
                </div>

                <div className="p-4 border-b border-[#B80F2A]/10">
                    <p className="text-xs text-[#2B2B2B]/60 mb-2">Switch Therapist</p>
                    <div className="space-y-2">
                        {Object.entries(THERAPY_MODES).map(([mode, data]) => (
                            <button
                                key={mode}
                                onClick={() => {
                                    navigate(`/chat/${mode}`);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg transition cursor-pointer ${mode === therapyMode
                                    ? 'bg-[#B80F2A] text-white'
                                    : 'hover:bg-[#FFEBEB] text-[#2B2B2B]'
                                    }`}
                            >
                                <div className="font-semibold text-sm">{data.name}</div>
                                <div className="text-xs opacity-80">{data.title}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {modeConversations.length === 0 ? (
                        <p className="text-sm text-[#2B2B2B]/60 text-center py-8">
                            No sessions yet
                        </p>
                    ) : (
                        modeConversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`group relative p-3 rounded-lg cursor-pointer transition ${conv.id === currentConversationId
                                    ? 'bg-[#B80F2A]/10 border border-[#B80F2A]/30'
                                    : 'hover:bg-[#FFEBEB]'
                                    }`}
                                onClick={() => loadConversation(conv.id)}
                            >
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{conv.title}</p>
                                        <p className="text-xs text-[#2B2B2B]/60">
                                            {new Date(conv.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConversation(conv.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-[#B80F2A]/10">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-[#FFEBEB] text-[#2B2B2B] px-4 py-2 rounded-xl hover:bg-[#FFD6D6] flex items-center gap-2 justify-center transition cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex h-full">
                {/* LEFT: Therapist Avatar & Presence - 40% */}
                <div className="w-[40%] bg-gradient-to-br from-[#FFF5F5] via-[#FFEBEB] to-[#FFD6D6] relative flex flex-col">
                    {/* Menu button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="absolute top-6 left-6 z-10 p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition hover:scale-105 cursor-pointer"
                    >
                        <Menu className="w-5 h-5 text-[#B80F2A]" />
                    </button>

                    {/* Avatar - Centered vertically */}
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="relative">
                            <div className="w-80 h-80 relative">
                                {/* Outer glow rings */}
                                <div className={`absolute inset-0 ${loading ? 'animate-ping' : 'animate-pulse'} bg-[#B80F2A]/20 rounded-full blur-3xl`} />
                                <div className="absolute inset-4 bg-[#B80F2A]/10 rounded-full blur-2xl" />

                                {/* Orb container */}
                                <div className="relative w-full h-full">
                                    <Spline scene={therapist.url} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Therapist Info - Bottom */}
                    <div className="p-8 bg-white/60 backdrop-blur-xl border-t border-[#B80F2A]/20">
                        <div className="max-w-sm mx-auto text-center space-y-3">
                            <h2 className="text-3xl font-bold text-[#2B2B2B]">{therapist.name}</h2>
                            <p className="text-lg text-[#B80F2A] font-semibold">{therapist.title}</p>
                            <p className="text-sm text-[#2B2B2B]/70 italic leading-relaxed">
                                {therapist.subtitle}
                            </p>

                            {/* Status indicator */}
                            <div className="pt-4 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-[#B80F2A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-[#B80F2A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-[#B80F2A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-sm text-[#2B2B2B]/60">Listening & reflecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-sm text-[#2B2B2B]/60">Present and ready</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Conversation Space - 60% */}
                <div className="w-[60%] flex flex-col bg-white">
                    {/* Conversation area */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="max-w-md text-center space-y-6">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#B80F2A] to-[#E63946] rounded-full flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#2B2B2B] mb-2">
                                            Your Safe Space
                                        </h3>
                                        <p className="text-[#2B2B2B]/60 leading-relaxed">
                                            This is a judgment-free zone. Take your time, breathe,
                                            and share whatever feels right.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-2xl space-y-6">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="space-y-2">
                                        {/* Label */}
                                        <p className="text-xs font-semibold text-[#2B2B2B]/50 uppercase tracking-wider">
                                            {msg.role === 'user' ? 'You' : therapist.name}
                                        </p>

                                        {/* Message content */}
                                        <div className={`prose prose-lg max-w-none ${msg.role === 'user'
                                            ? 'text-[#2B2B2B]'
                                            : 'text-[#2B2B2B]/90'
                                            }`}>
                                            <p className="whitespace-pre-wrap leading-relaxed text-lg">
                                                {msg.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-[#2B2B2B]/50 uppercase tracking-wider">
                                            {therapist.name}
                                        </p>
                                        <div className="flex gap-2 text-[#2B2B2B]/40">
                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input area */}
                    <div className="border-t border-[#B80F2A]/10 bg-[#FFF5F5] p-6">
                        <div className="max-w-2xl">
                            <div className="bg-white rounded-2xl shadow-lg border border-[#B80F2A]/20 overflow-hidden">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="What's on your mind today?"
                                    className="w-full px-6 py-4 focus:outline-none resize-none text-[#2B2B2B] text-lg placeholder:text-[#2B2B2B]/40"
                                    rows={3}
                                    disabled={loading}
                                />
                                <div className="px-4 pb-4 flex justify-between items-center">
                                    <p className="text-xs text-[#2B2B2B]/40">
                                        Press Enter to send • Shift + Enter for new line
                                    </p>
                                    <button
                                        onClick={sendMessage}
                                        disabled={!input.trim() || loading}
                                        className="bg-gradient-to-r from-[#B80F2A] to-[#E63946] text-white px-6 py-2.5 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <span className="font-medium">Send</span>
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}