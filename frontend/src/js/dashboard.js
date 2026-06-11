// Import des données mock (from app.js)
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
let isFullscreen = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderModalConversations();
    renderFullscreenConversations();
});

function setupEventListeners() {
    // Messagerie Button
    document.getElementById('messagingBtn').addEventListener('click', () => {
        toggleMessagingModal();
    });

    // Close Modal
    document.getElementById('closeMessagingBtn').addEventListener('click', () => {
        closeMessagingModal();
    });

    // Expand Button
    document.getElementById('expandBtn').addEventListener('click', () => {
        expandToFullscreen();
    });

    // Close Fullscreen
    document.getElementById('closeFullscreenBtn').addEventListener('click', () => {
        closeFullscreen();
    });

    // Message Input - Modal
    document.querySelector('#messagingModal input[placeholder="Message..."]').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Message Input - Fullscreen
    document.getElementById('fullscreenMessageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage('fullscreen');
    });

    // Send Buttons
    document.querySelector('#messagingModal button:last-child').addEventListener('click', () => sendMessage());
    document.getElementById('fullscreenSendBtn').addEventListener('click', () => sendMessage('fullscreen'));
}

function toggleMessagingModal() {
    const modal = document.getElementById('messagingModal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        selectConversation(1, 'modal');
    }
}

function closeMessagingModal() {
    document.getElementById('messagingModal').classList.add('hidden');
}

function expandToFullscreen() {
    closeMessagingModal();
    isFullscreen = true;
    document.getElementById('messagingFullscreen').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    selectConversation(selectedConversationId, 'fullscreen');
}

function closeFullscreen() {
    isFullscreen = false;
    document.getElementById('messagingFullscreen').classList.add('hidden');
    document.body.style.overflow = 'auto';
    toggleMessagingModal();
}

function renderModalConversations() {
    const container = document.getElementById('modalConversationsList');
    container.innerHTML = '';

    conversations.forEach(conv => {
        const element = document.createElement('div');
        element.className = `p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition ${selectedConversationId === conv.id && !isFullscreen ? 'bg-green-50' : ''}`;
        element.onclick = () => selectConversation(conv.id, 'modal');

        element.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="relative">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-xs text-gray-700">
                        ${conv.avatar}
                    </div>
                    ${conv.online !== null ? `
                        <div class="absolute bottom-0 right-0 w-2 h-2 ${conv.online ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white"></div>
                    ` : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm text-gray-900">${conv.name}</div>
                    <div class="text-xs text-gray-500 truncate">${conv.lastMessage}</div>
                </div>
                ${conv.unread > 0 ? `<span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">${conv.unread}</span>` : ''}
            </div>
        `;

        container.appendChild(element);
    });
}

function renderFullscreenConversations() {
    const container = document.getElementById('fullscreenConversationsList');
    container.innerHTML = '';

    conversations.forEach(conv => {
        const element = document.createElement('div');
        element.className = `p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition ${selectedConversationId === conv.id && isFullscreen ? 'bg-green-50 border-l-4 border-green-500' : ''}`;
        element.onclick = () => selectConversation(conv.id, 'fullscreen');

        element.innerHTML = `
            <div class="flex items-center space-x-3">
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
                    <div class="text-xs text-gray-500 truncate">${conv.lastMessage}</div>
                </div>
                ${conv.unread > 0 ? `<span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">${conv.unread}</span>` : ''}
            </div>
        `;

        container.appendChild(element);
    });
}

function selectConversation(conversationId, context) {
    selectedConversationId = conversationId;
    const conv = conversations.find(c => c.id === conversationId);

    if (context === 'modal') {
        renderModalConversations();
    } else if (context === 'fullscreen') {
        // Update fullscreen header
        document.getElementById('fullscreenHeaderAvatar').src = `https://via.placeholder.com/48?text=${conv.avatar}`;
        document.getElementById('fullscreenHeaderName').textContent = conv.name;
        document.getElementById('fullscreenHeaderStatus').textContent = `${conv.role} at ${conv.company}`;
        renderFullscreenMessages();
        renderFullscreenConversations();
    }
}

function renderFullscreenMessages() {
    const messagesArea = document.getElementById('fullscreenMessagesArea');
    const msgs = messages[selectedConversationId] || [];
    
    messagesArea.innerHTML = '';

    msgs.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start gap-2.5 group ${msg.isSent ? 'justify-end' : ''}`;

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
            `;
        }

        messagesArea.appendChild(messageDiv);
    });

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function sendMessage(context = 'modal') {
    let input;
    if (context === 'fullscreen') {
        input = document.getElementById('fullscreenMessageInput');
    } else {
        input = document.querySelector('#messagingModal input[placeholder="Message..."]');
    }

    const text = input.value.trim();
    if (!text) return;

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
    input.value = '';

    if (context === 'fullscreen') {
        renderFullscreenMessages();
    }

    // Update last message
    const conv = conversations.find(c => c.id === selectedConversationId);
    if (conv) {
        conv.lastMessage = text;
        conv.lastMessageTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    renderModalConversations();
    renderFullscreenConversations();
}
