import { useState } from 'react';
import { MessageCircle, X, Send, Search } from 'lucide-react';
import { Badge } from '@mui/material';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  unread: boolean;
}

export function MessageBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Sophie Dubois",
      content: "Bonjour, avez-vous reçu les documents pour la formation ?",
      timestamp: "10:30",
      unread: true
    },
    {
      id: 2,
      sender: "Marc Laurent",
      content: "La réunion est confirmée pour demain à 14h",
      timestamp: "09:15",
      unread: true
    },
    {
      id: 3,
      sender: "Innovation Hub",
      content: "Nouvelle formation disponible : Marketing Digital",
      timestamp: "Hier",
      unread: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => m.unread).length;

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        sender: "Vous",
        content: newMessage,
        timestamp: "À l'instant",
        unread: false
      }]);
      setNewMessage('');
    }
  };

  return (
    <>
      {/* Bulle de messagerie flottante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                right: -3,
                top: -3,
                border: '2px solid white',
                padding: '0 4px',
              }
            }}
          >
            <MessageCircle size={28} strokeWidth={2.5} />
          </Badge>
        </button>
      </div>

      {/* Fenêtre de messagerie popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-white" size={24} />
              <div>
                <h3 className="text-white font-semibold">Messagerie</h3>
                <p className="text-blue-100 text-xs">{unreadCount} nouveau{unreadCount > 1 ? 'x' : ''} message{unreadCount > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Liste des messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer ${
                  message.unread
                    ? 'bg-teal-50 border-l-4 border-teal-500'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`font-semibold text-sm ${message.unread ? 'text-teal-700' : 'text-gray-700'}`}>
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
              </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search size={48} className="mb-2" />
                <p className="text-sm">Aucun résultat trouvé</p>
              </div>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Écrivez un message..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-2.5 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
