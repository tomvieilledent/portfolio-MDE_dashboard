// Mock data for conversations and messages
const conversations = [
    {
        id: 1,
        name: "Sophie Dubois",
        role: "CEO",
        company: "Tech Innovators",
        avatar: "SD",
        lastMessage: "Merci pour l'aide !",
        lastMessageTime: "10:30",
        unread: 2,
        online: true
    },
    {
        id: 2,
        name: "Marc Laurent",
        role: "Directeur Marketing",
        company: "Digital Solutions",
        avatar: "ML",
        lastMessage: "La réunion est confirmée pour demain à 14h",
        lastMessageTime: "09:15",
        unread: 0,
        online: true
    },
    {
        id: 3,
        name: "Julie Martin",
        role: "CTO",
        company: "Green Energy Co.",
        avatar: "JM",
        lastMessage: "Nouvelle formation disponible : Marketing Digital",
        lastMessageTime: "Hier",
        unread: 0,
        online: false
    },
    {
        id: 4,
        name: "Innovation Hub",
        role: "Groupe",
        company: "",
        avatar: "IH",
        lastMessage: "Nouvelle formation disponible : Marketing Digital",
        lastMessageTime: "Hier",
        unread: 0,
        online: null
    }
];

const messages = {
    1: [
        {
            id: 1,
            sender: "Sophie Dubois",
            senderRole: "CEO",
            senderCompany: "Tech Innovators",
            avatar: "SD",
            text: "Bonjour, avez-vous reçu les documents pour la formation ?",
            time: "10:15",
            status: "Livré",
            isSent: false
        },
        {
            id: 2,
            sender: "You",
            text: "Oui, j'ai bien reçu. Très complet comme contenu !",
            time: "10:20",
            status: "Livré",
            isSent: true
        },
        {
            id: 3,
            sender: "Sophie Dubois",
            senderRole: "CEO",
            senderCompany: "Tech Innovators",
            avatar: "SD",
            text: "C'est super ! Les modules sont bien structurés selon vous ?",
            time: "10:25",
            status: "Livré",
            isSent: false
        },
        {
            id: 4,
            sender: "You",
            text: "Absolument, c'est vraiment bien organisé. Les participants vont beaucoup apprendre.",
            time: "10:28",
            status: "Livré",
            isSent: true
        },
        {
            id: 5,
            sender: "Sophie Dubois",
            senderRole: "CEO",
            senderCompany: "Tech Innovators",
            avatar: "SD",
            text: "Merci pour l'aide !",
            time: "10:30",
            status: "Livré",
            isSent: false
        }
    ],
    2: [
        {
            id: 1,
            sender: "Marc Laurent",
            senderRole: "Directeur Marketing",
            senderCompany: "Digital Solutions",
            avatar: "ML",
            text: "Bonjour, la réunion de demain est confirmée ?",
            time: "09:10",
            status: "Livré",
            isSent: false
        },
        {
            id: 2,
            sender: "You",
            text: "Oui, c'est confirmé à 14h",
            time: "09:12",
            status: "Livré",
            isSent: true
        },
        {
            id: 3,
            sender: "Marc Laurent",
            senderRole: "Directeur Marketing",
            senderCompany: "Digital Solutions",
            avatar: "ML",
            text: "La réunion est confirmée pour demain à 14h",
            time: "09:15",
            status: "Livré",
            isSent: false
        }
    ],
    3: [
        {
            id: 1,
            sender: "Julie Martin",
            senderRole: "CTO",
            senderCompany: "Green Energy Co.",
            avatar: "JM",
            text: "Nouvelle formation disponible : Marketing Digital",
            time: "Hier",
            status: "Livré",
            isSent: false
        }
    ]
};

let selectedConversationId = 1;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderConversations();
    selectConversation(1);
    setupEventListeners();
});

function renderConversations() {
    const listContainer = document.getElementById('conversationsList');
    listContainer.innerHTML = '';

    conversations.forEach(conv => {
        const element = document.createElement('div');
        element.className = `conversation-item group ${selectedConversationId === conv.id ? 'active' : ''}`;
        element.onclick = () => selectConversation(conv.id);

        element.innerHTML = `
            <div class="conversation-item-header">
                <div class="flex items-center space-x-3 flex-1">
                    <div class="relative">
                        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-700">
                            ${conv.avatar}
                        </div>
                        ${conv.online !== null ? `
                            <div class="absolute bottom-0 right-0 w-3 h-3 ${conv.online ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white"></div>
                        ` : ''}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900">${conv.name}</div>
                        <div class="text-xs text-gray-500">${conv.role}</div>
                    </div>
                </div>
                ${conv.unread > 0 ? `<span class="conversation-item-unread">${conv.unread}</span>` : ''}
            </div>
            <div class="conversation-item-preview">${conv.lastMessage}</div>
            <div class="text-xs text-gray-500 mt-1">${conv.lastMessageTime}</div>
        `;

        listContainer.appendChild(element);
    });
}

function selectConversation(conversationId) {
    selectedConversationId = conversationId;

    // Update header
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
        document.getElementById('headerAvatar').src = `https://via.placeholder.com/40?text=${conv.avatar}`;
        document.getElementById('headerName').textContent = conv.name;
        document.getElementById('headerStatus').textContent = `${conv.role} at ${conv.company}`;
    }

    // Render messages
    renderMessages(conversationId);

    // Update UI
    renderConversations();
}

function renderMessages(conversationId) {
    const messagesArea = document.getElementById('messagesArea');
    const msgs = messages[conversationId] || [];
    
    messagesArea.innerHTML = '';

    msgs.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `group flex items-start gap-2.5 ${msg.isSent ? 'justify-end' : ''}`;

        if (msg.isSent) {
            messageDiv.innerHTML = `
                <div class="flex flex-col items-end max-w-xs">
                    <div class="bg-green-500 text-white rounded-2xl rounded-tr-none px-4 py-2">
                        <p class="text-sm">${msg.text}</p>
                    </div>
                    <div class="flex items-center space-x-1.5 mt-1">
                        <span class="text-xs text-gray-500">${msg.time}</span>
                        <span class="text-xs text-gray-500">${msg.status}</span>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <img src="https://via.placeholder.com/32?text=${msg.avatar}" alt="${msg.sender}" class="w-8 h-8 rounded-full">
                <div class="flex flex-col max-w-xs">
                    <div class="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2">
                        <div class="flex items-center space-x-1.5 mb-1">
                            <span class="text-sm font-semibold text-gray-900">${msg.sender}</span>
                            <span class="text-xs text-gray-500">${msg.time}</span>
                        </div>
                        <p class="text-sm text-gray-700">${msg.text}</p>
                    </div>
                    <span class="text-xs text-gray-500 mt-1">${msg.status}</span>
                </div>
                <button class="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-gray-600 p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                </button>
            `;
        }

        messagesArea.appendChild(messageDiv);
    });

    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function setupEventListeners() {
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');

    sendButton.onclick = sendMessage;
    messageInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();

    if (!text) return;

    // Add message to mock data
    const newMessage = {
        id: (messages[selectedConversationId]?.length || 0) + 1,
        sender: "You",
        text: text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: "Envoyé",
        isSent: true
    };

    if (!messages[selectedConversationId]) {
        messages[selectedConversationId] = [];
    }

    messages[selectedConversationId].push(newMessage);

    // Clear input
    messageInput.value = '';

    // Re-render messages
    renderMessages(selectedConversationId);

    // Update last message in conversation list
    const conv = conversations.find(c => c.id === selectedConversationId);
    if (conv) {
        conv.lastMessage = text;
        conv.lastMessageTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    renderConversations();
}
