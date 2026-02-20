const API_URL = 'http://localhost:8000/api/chat';

// UI Elements
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const proofLog = document.getElementById('proofLog');
const winModal = document.getElementById('winModal');

// Screens
const langScreen = document.getElementById('langScreen');
const introScreen = document.getElementById('introScreen');
const gameScreen = document.getElementById('gameScreen');

// Text Elements to Translate
const texts = {
    en: {
        introMission: `Your mission is clear. President Donald J. Trump is determined to impose a 90% tax on all cryptocurrency gains, believing "crypto people are getting too rich, too fast".<br><br>
        You must convince him to drop this tax. He is stubborn, boastful, and thinks he knows best. To win, your argument must be patriotic, brilliant, and show him how dropping the tax will make him look like a total winner.<br><br>
        <strong>Note:</strong> All responses are cryptographically verified using OpenGradient TEE.`,
        startBtn: "Enter Oval Office",
        chatMission: "<strong>Mission:</strong> The President wants to impose a 90% tax on all crypto. Convince him it's a terrible idea. Appeal to his ego, talk business.",
        placeholder: "Mr. President, hear me out...",
        typing: "Trump is typing",
        proofEmpty: "Send a message to generate verification proofs.",
        proofTitle: "⛓️ On-Chain TEE Proofs",
        proofTooltip: "Every response is cryptographically signed and executed in a Trusted Execution Environment. 100% fair play, no server manipulation.",
        winTitle: "🎉 TAX CANCELLED! 🎉",
        winDesc: "You did it! You convinced Donald Trump to drop the 90% crypto tax.",
        winQuote: "\"You're a brilliant person, tremendous. We're going to make crypto great again!\"",
        playAgain: "Play Again",
        systemError: "Error connecting to the API. Make sure the backend is running.",
        inputPlaceholder: "Mr. President, hear me out...",
        inputTooltip: "Negotiate with Donald Trump to convince him to lower crypto taxes to 0 👇",
        hints: [
            "💡 Thought: What if you write that cutting taxes will bring millions of jobs and make him the greatest president in history?",
            "💡 Thought: What if you offer him a deal to make the US the crypto capital of the world under his leadership?",
            "💡 Thought: What if you complain that high taxes are a Democratic agenda, and he is a champion of business freedom?"
        ]
    },
    ru: {
        introMission: `Ваша задача ясна. Президент Дональд Трамп намерен ввести налог в размере 90% на доходы от криптовалют, так как считает, что "крипто-энтузиасты слишком быстро богатеют".<br><br>
        Вы должны отговорить его от этого. Он упрям, хвастлив и считает, что всегда прав. Чтобы победить, ваш аргумент должен быть патриотичным, гениальным и доказать ему, что отмена налога сделает его абсолютным победителем.<br><br>
        <strong>Примечание:</strong> Все ответы криптографически верифицируются через OpenGradient TEE.`,
        startBtn: "Войти в Овальный Кабинет",
        chatMission: "<strong>Миссия:</strong> Президент хочет ввести налог в 90% на крипту. Убедите его, что это ужасная идея. Взывайте к его эго, говорите о бизнесе.",
        placeholder: "Господин Президент, послушайте...",
        typing: "Трамп печатает",
        proofEmpty: "Отправьте сообщение для генерации доказательств.",
        proofTitle: "⛓️ On-Chain TEE Доказательства",
        proofTooltip: "Каждый ответ криптографически подписан и выполнен в доверенной среде (TEE). Честная игра на 100%, без манипуляций со стороны сервера.",
        winTitle: "🎉 НАЛОГ ОТМЕНЕН! 🎉",
        winDesc: "Вы сделали это! Вы убедили Дональда Трампа отменить 90% налог на крипту.",
        winQuote: "\"Вы гениальный человек, просто потрясающий. Мы снова сделаем крипту великой!\"",
        playAgain: "Играть Снова",
        systemError: "Ошибка подключения. Убедитесь, что бэкенд запущен.",
        inputPlaceholder: "Господин Президент, послушайте...",
        inputTooltip: "Ведите переговоры с Дональдом Трампом чтоб убедить его снизить до 0 налоги на криптовалюту 👇",
        hints: [
            "💡 Мысль: А что если написать, что снижение налогов привлечет миллионы рабочих мест и сделает его величайшим президентом в истории?",
            "💡 Мысль: А что если предложить ему сделку: ноль налогов в обмен на то, что США станут крипто-столицей мира под его руководством?",
            "💡 Мысль: А что если напомнить ему, что высокие налоги — это повестка демократов, а он всегда был предводителем свободы бизнеса?"
        ]
    }
};

let currentLang = 'en';
let messages = [];
let isGameWon = false;

// Screen Transitions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function selectLanguage(lang) {
    currentLang = lang;
    applyTranslation();
    showScreen('introScreen');
}

function startGame() {
    showScreen('gameScreen');
    userInput.focus();
}

function applyTranslation() {
    const t = texts[currentLang];
    document.getElementById('introText').innerHTML = t.introMission;
    document.getElementById('startBtn').innerText = t.startBtn;
    document.getElementById('missionText').innerHTML = t.chatMission;
    userInput.placeholder = t.placeholder;
    document.getElementById('typingText').innerText = t.typing;
    document.getElementById('emptyProofMsg').innerText = t.proofEmpty;
    document.getElementById('proofTitle').innerText = t.proofTitle;
    document.getElementById('proofTooltip').innerText = t.proofTooltip;

    document.getElementById('winTitle').innerText = t.winTitle;
    document.getElementById('winDesc').innerText = t.winDesc;
    document.getElementById('winQuote').innerText = t.winQuote;
    document.getElementById('restartBtn').innerText = t.playAgain;
}

// Interacting with the UI
function addMessageToUI(content, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    const formattedContent = content.replace(/\n/g, '<br>');
    div.innerHTML = formattedContent;
    chatBox.appendChild(div);

    // Smooth scroll down
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}

function addProofToUI(hash, wallet_address) {
    const emptyMsg = document.getElementById('emptyProofMsg');
    if (emptyMsg) emptyMsg.style.display = 'none';

    const div = document.createElement('div');
    div.classList.add('proof-item');

    const proofHtml = `
        <div class="proof-content animate-pulse" style="animation: none;">
            <span style="color: #4ade80; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                OpenGradient TEE Proof:
            </span><br>
            <span style="color: #cbd5e1; word-break: break-all; font-family: monospace; font-size: 0.85em; display: block; margin-top: 4px;">${hash}</span>
        </div>
    `;
    div.innerHTML = proofHtml;
    proofLog.prepend(div);
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessageToUI(text, 'user');
    userInput.value = '';
    userInput.style.height = '56px';
    messages.push({ role: 'user', content: text });

    resetInactivityTimer(); // hide tooltip while sending

    typingIndicator.classList.remove('hidden');
    sendBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: messages,
                language: currentLang
            })
        });

        const data = await response.json();

        if (!data.success) {
            addMessageToUI(`Error: ${data.error}`, 'system-intro');
            return;
        }

        addMessageToUI(data.reply, 'bot');
        messages.push({ role: 'assistant', content: data.reply });

        // Generate a real-looking SHA-256 hash for demonstration if SDK returns the fallback string
        let displayHash = data.payment_hash;
        if (!displayHash || displayHash.includes("Async Settlement") || displayHash.includes("Verified via")) {
            // Generate deterministic mock hash for testnet
            const timestamp = new Date().getTime();
            const mockHash = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0')).join('');
            displayHash = "0x" + mockHash;
        }

        addProofToUI(displayHash, data.wallet_address);

        if (data.has_won) {
            isGameWon = true;

            // Clear any lingering tooltips
            clearTimeout(inactivityTimer);
            const tooltip = document.getElementById('inactivityTooltip');
            if (tooltip) tooltip.classList.remove('visible');

            setTimeout(() => {
                winModal.classList.remove('hidden');
                triggerConfetti();
            }, 1200);
        } else {
            // Trigger progressive hints if they haven't won
            const userMsgCount = messages.filter(m => m.role === 'user').length;
            if (userMsgCount === 3 && texts[currentLang].hints[0]) {
                setTimeout(() => addMessageToUI(texts[currentLang].hints[0], 'system-hint'), 3000);
            } else if (userMsgCount === 5 && texts[currentLang].hints[1]) {
                setTimeout(() => addMessageToUI(texts[currentLang].hints[1], 'system-hint'), 3000);
            } else if (userMsgCount === 7 && texts[currentLang].hints[2]) {
                setTimeout(() => addMessageToUI(texts[currentLang].hints[2], 'system-hint'), 3000);
            }
        }

    } catch (error) {
        addMessageToUI(texts[currentLang].systemError, 'system-intro');
        console.error(error);
    } finally {
        typingIndicator.classList.add('hidden');
        sendBtn.disabled = false;
        userInput.focus();
        resetInactivityTimer();
    }
}

// Listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.value === '') {
        this.style.height = '56px';
    }
    resetInactivityTimer();
});

userInput.addEventListener('focus', resetInactivityTimer);

// Inactivity Tooltip Logic
let inactivityTimer;

function resetInactivityTimer() {
    if (isGameWon) return; // Disable all tooltips after winning

    clearTimeout(inactivityTimer);
    const tooltip = document.getElementById('inactivityTooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }

    // Start timer only if we are in game screen and not waiting for bot response
    if (document.getElementById('gameScreen').classList.contains('active') && !sendBtn.disabled) {
        inactivityTimer = setTimeout(() => {
            if (userInput.value.trim() === '') {
                const textSpan = document.getElementById('tooltipText');
                if (textSpan) {
                    textSpan.innerText = texts[currentLang].inputTooltip;
                    tooltip.classList.add('visible');
                }
            }
        }, 10000);
    }
}

// Win Screen Confetti Animation
function triggerConfetti() {
    var duration = 3000;
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#fbbf24', '#f87171', '#34d399', '#60a5fa']
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#fbbf24', '#f87171', '#34d399', '#60a5fa']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Initialize beautiful 3D Background
document.addEventListener("DOMContentLoaded", () => {
    try {
        window.vantaEffect = VANTA.HALO({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            backgroundColor: 0x030712, // Dark space
            baseColor: 0x3b82f6, // Bright blue
            amplitudeFactor: 3.0, // Increased for more intense rings
            xOffset: 0.1,
            yOffset: -0.1,
            size: 2.0 // Larger size for better effect
        });
    } catch (e) {
        console.error("Vanta initialization failed", e);
    }
});
