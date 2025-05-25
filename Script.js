const PASSWORD = "mahfoudh/jemile"; // كلمة المرور المطلوبة
let players = []; // مصفوفة اللاعبين
let currentPlayerIndex = 0; // مؤشر اللاعب الحالي
let questions = []; // الأسئلة
let challenges = []; // التحديات
let usedItems = []; // العناصر المستخدمة (أسئلة وتحديات)
let selectedCardType = null; // نوع البطاقة المختارة (سؤال أو تحدي)
let currentQuestion = null; // السؤال الحالي
let currentChallenge = null; // التحدي الحالي

// عناصر DOM
const startScreen = document.getElementById('start-screen');
const playersScreen = document.getElementById('players-screen');
const gameScreen = document.getElementById('game-screen');
const scoresModal = document.getElementById('scores-modal');
const gameOverModal = document.getElementById('game-over-modal');

const passwordInput = document.getElementById('password-input');
const passwordBtn = document.getElementById('password-btn');
const passwordError = document.getElementById('password-error');

const playersContainer = document.querySelector('.players-container');
const addPlayerBtn = document.getElementById('add-player-btn');
const startGameBtn = document.getElementById('start-game-btn');
const playersError = document.getElementById('players-error');

const currentPlayerNameElement = document.getElementById('current-player-name');
const showScoresBtn = document.getElementById('show-scores-btn');
const closeScoresBtn = document.getElementById('close-scores-btn');
const scoresList = document.getElementById('scores-list');

const questionCard = document.getElementById('question-card');
const challengeCard = document.getElementById('challenge-card');
const questionText = document.getElementById('question-text');
const challengeText = document.getElementById('challenge-text');
const completedBtn = document.getElementById('completed-btn');
const skipBtn = document.getElementById('skip-btn');

const winnerName = document.getElementById('winner-name');
const finalScoresList = document.getElementById('final-scores-list');
const playAgainBtn = document.getElementById('play-again-btn');

// تحميل الأسئلة والتحديات
async function loadGameData() {
    try {
        const questionsResponse = await fetch('questions.json');
        const challengesResponse = await fetch('challenges.json');
        
        if (!questionsResponse.ok || !challengesResponse.ok) {
            throw new Error('فشل في تحميل بيانات اللعبة');
        }
        
        questions = await questionsResponse.json();
        challenges = await challengesResponse.json();
        
        console.log('تم تحميل البيانات بنجاح:', { questions, challenges });
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        alert('حدث خطأ في تحميل بيانات اللعبة. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
    }
}

// التحقق من كلمة المرور
passwordBtn.addEventListener('click', () => {
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === PASSWORD) {
        // كلمة المرور صحيحة، الانتقال إلى شاشة اللاعبين
        startScreen.classList.add('hidden');
        playersScreen.classList.remove('hidden');
        playersScreen.classList.add('active');
        
        // تحميل بيانات اللعبة
        loadGameData();
    } else {
        // كلمة المرور خاطئة
        passwordError.textContent = 'كلمة المرور غير صحيحة';
        
        // إضافة تأثير الاهتزاز
        passwordInput.classList.add('shake');
        setTimeout(() => {
            passwordInput.classList.remove('shake');
        }, 500);
    }
});

// إضافة تأثير الاهتزاز للعناصر
function addShakeEffect(element) {
    if (!element.style.animation) {
        element.style.animation = 'shake 0.5s';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// إضافة لاعب جديد
addPlayerBtn.addEventListener('click', () => {
    const playerInputs = document.querySelectorAll('.player-input');
    const newPlayerIndex = playerInputs.length + 1;
    
    const newPlayerInput = document.createElement('div');
    newPlayerInput.className = 'player-input';
    newPlayerInput.innerHTML = `
        <input type="text" class="player-name" placeholder="اسم اللاعب ${newPlayerIndex}">
        <button class="remove-player"><i class="fas fa-times"></i></button>
    `;
    
    playersContainer.appendChild(newPlayerInput);
    
    // إضافة حدث لزر الحذف
    const removeBtn = newPlayerInput.querySelector('.remove-player');
    removeBtn.addEventListener('click', () => {
        if (document.querySelectorAll('.player-input').length > 2) {
            playersContainer.removeChild(newPlayerInput);
            updatePlayerPlaceholders();
        } else {
            playersError.textContent = 'يجب أن يكون هناك لاعبان على الأقل';
            setTimeout(() => {
                playersError.textContent = '';
            }, 3000);
        }
    });
    
    // تحديث الترقيم في placeholder
    updatePlayerPlaceholders();
});

// تحديث ترقيم اللاعبين في placeholder
function updatePlayerPlaceholders() {
    const playerInputs = document.querySelectorAll('.player-name');
    playerInputs.forEach((input, index) => {
        input.placeholder = `اسم اللاعب ${index + 1}`;
    });
}

// إضافة أحداث لأزرار حذف اللاعبين الموجودين مسبقًا
document.querySelectorAll('.remove-player').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const playerInput = e.target.closest('.player-input');
        if (document.querySelectorAll('.player-input').length > 2) {
            playersContainer.removeChild(playerInput);
            updatePlayerPlaceholders();
        } else {
            playersError.textContent = 'يجب أن يكون هناك لاعبان على الأقل';
            setTimeout(() => {
                playersError.textContent = '';
            }, 3000);
        }
    });
});

// بدء اللعبة
startGameBtn.addEventListener('click', () => {
    // جمع أسماء اللاعبين
    const playerInputs = document.querySelectorAll('.player-name');
    players = [];
    
    let allNamesValid = true;
    
    playerInputs.forEach(input => {
        const name = input.value.trim();
        if (name) {
            players.push({ name, score: 0 });
        } else {
            allNamesValid = false;
        }
    });
    
    if (!allNamesValid) {
        playersError.textContent = 'يرجى إدخال أسماء جميع اللاعبين';
        return;
    }
    
    if (players.length < 2) {
        playersError.textContent = 'يجب أن يكون هناك لاعبان على الأقل';
        return;
    }
    
    // بدء اللعبة
    playersScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameScreen.classList.add('active');
    
    // إعادة تعيين متغيرات اللعبة
    currentPlayerIndex = 0;
    usedItems = [];
    
    // عرض اللاعب الحالي
    updateCurrentPlayer();
    
    // عرض سؤال وتحدي جديدين
    showNewQuestionAndChallenge();
});

// تحديث اللاعب الحالي
function updateCurrentPlayer() {
    currentPlayerNameElement.textContent = players[currentPlayerIndex].name;
    
    // إضافة تأثير التحديث
    currentPlayerNameElement.classList.add('score-update');
    setTimeout(() => {
        currentPlayerNameElement.classList.remove('score-update');
    }, 500);
}

// عرض سؤال وتحدي جديدين
function showNewQuestionAndChallenge() {
    // إعادة تعيين البطاقات
    questionCard.querySelector('.card-inner').classList.remove('flipped');
    challengeCard.querySelector('.card-inner').classList.remove('flipped');
    selectedCardType = null;
    
    // اختيار سؤال عشوائي غير مستخدم
    let availableQuestions = questions.filter(q => !usedItems.includes(`question_${q.id}`));
    if (availableQuestions.length === 0) {
        // إذا تم استخدام جميع الأسئلة، إعادة تعيين
        usedItems = usedItems.filter(item => !item.startsWith('question_'));
        availableQuestions = questions;
    }
    
    const randomQuestionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[randomQuestionIndex];
    
    // اختيار تحدي عشوائي غير مستخدم
    let availableChallenges = challenges.filter(c => !usedItems.includes(`challenge_${c.id}`));
    if (availableChallenges.length === 0) {
        // إذا تم استخدام جميع التحديات، إعادة تعيين
        usedItems = usedItems.filter(item => !item.startsWith('challenge_'));
        availableChallenges = challenges;
    }
    
    const randomChallengeIndex = Math.floor(Math.random() * availableChallenges.length);
    currentChallenge = availableChallenges[randomChallengeIndex];
    
    // عرض النصوص
    questionText.textContent = currentQuestion.text;
    challengeText.textContent = currentChallenge.text;
    
    // إضافة أحداث النقر للبطاقات
    addCardClickEvents();
}

// إضافة أحداث النقر للبطاقات
function addCardClickEvents() {
    // إزالة الأحداث السابقة
    questionCard.removeEventListener('click', handleQuestionCardClick);
    challengeCard.removeEventListener('click', handleChallengeCardClick);
    
    // إضافة أحداث جديدة
    questionCard.addEventListener('click', handleQuestionCardClick);
    challengeCard.addEventListener('click', handleChallengeCardClick);
}

// معالجة النقر على بطاقة السؤال
function handleQuestionCardClick() {
    if (selectedCardType) return; // تم اختيار بطاقة بالفعل
    
    selectedCardType = 'question';
    questionCard.querySelector('.card-inner').classList.add('flipped');
    
    // إضافة تأثير النبض
    questionCard.classList.add('pulse');
    setTimeout(() => {
        questionCard.classList.remove('pulse');
    }, 500);
    
    // تعطيل النقر على البطاقة الأخرى
    challengeCard.removeEventListener('click', handleChallengeCardClick);
}

// معالجة النقر على بطاقة التحدي
function handleChallengeCardClick() {
    if (selectedCardType) return; // تم اختيار بطاقة بالفعل
    
    selectedCardType = 'challenge';
    challengeCard.querySelector('.card-inner').classList.add('flipped');
    
    // إضافة تأثير النبض
    challengeCard.classList.add('pulse');
    setTimeout(() => {
        challengeCard.classList.remove('pulse');
    }, 500);
    
    // تعطيل النقر على البطاقة الأخرى
    questionCard.removeEventListener('click', handleQuestionCardClick);
}

// إكمال الدور الحالي
completedBtn.addEventListener('click', () => {
    if (!selectedCardType) {
        alert('يرجى اختيار سؤال أو تحدي أولاً');
        return;
    }
    
    // إضافة العنصر المستخدم إلى القائمة
    if (selectedCardType === 'question') {
        usedItems.push(`question_${currentQuestion.id}`);
    } else {
        usedItems.push(`challenge_${currentChallenge.id}`);
    }
    
    // زيادة النقاط
    players[currentPlayerIndex].score += 1;
    
    // عرض تأثير الكونفيتي
    createConfetti();
    
    // الانتقال إلى اللاعب التالي
    moveToNextPlayer();
});

// تخطي الدور الحالي
skipBtn.addEventListener('click', () => {
    if (!selectedCardType) {
        alert('يرجى اختيار سؤال أو تحدي أولاً');
        return;
    }
    
    // إضافة العنصر المستخدم إلى القائمة
    if (selectedCardType === 'question') {
        usedItems.push(`question_${currentQuestion.id}`);
    } else {
        usedItems.push(`challenge_${currentChallenge.id}`);
    }
    
    // الانتقال إلى اللاعب التالي بدون زيادة النقاط
    moveToNextPlayer();
});

// الانتقال إلى اللاعب التالي
function moveToNextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayer();
    
    // عرض سؤال وتحدي جديدين
    showNewQuestionAndChallenge();
    
    // التحقق من انتهاء اللعبة (إذا تم استخدام جميع الأسئلة والتحديات)
    if (usedItems.length >= questions.length + challenges.length) {
        setTimeout(() => {
            showGameOverScreen();
        }, 1000);
    }
}

// عرض شاشة النقاط
showScoresBtn.addEventListener('click', () => {
    updateScoresList();
    scoresModal.classList.remove('hidden');
});

// إغلاق شاشة النقاط
closeScoresBtn.addEventListener('click', () => {
    scoresModal.classList.add('hidden');
});

// تحديث قائمة النقاط
function updateScoresList() {
    scoresList.innerHTML = '';
    
    players.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${player.name}</span>
            <span>${player.score}</span>
        `;
        scoresList.appendChild(li);
    });
}

// عرض شاشة نهاية اللعبة
function showGameOverScreen() {
    // تحديد الفائز (أعلى نقاط)
    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    winnerName.textContent = winner.name;
    
    // تحديث قائمة النقاط النهائية
    finalScoresList.innerHTML = '';
    
    // ترتيب اللاعبين حسب النقاط
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${player.name}</span>
            <span>${player.score}</span>
        `;
        finalScoresList.appendChild(li);
    });
    
    // عرض المودال
    gameOverModal.classList.remove('hidden');
}

// إعادة اللعب
playAgainBtn.addEventListener('click', () => {
    // إعادة تعيين النقاط
    players.forEach(player => {
        player.score = 0;
    });
    
    // إخفاء مودال نهاية اللعبة
    gameOverModal.classList.add('hidden');
    
    // إعادة تعيين متغيرات اللعبة
    currentPlayerIndex = 0;
    usedItems = [];
    
    // عرض اللاعب الحالي
    updateCurrentPlayer();
    
    // عرض سؤال وتحدي جديدين
    showNewQuestionAndChallenge();
});

// إنشاء تأثير الكونفيتي
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        document.body.appendChild(confetti);
        
        // إزالة عنصر الكونفيتي بعد انتهاء الرسوم المتحركة
        setTimeout(() => {
            document.body.removeChild(confetti);
        }, 5000);
    }
}

// إضافة تأثير الاهتزاز
document.documentElement.style.setProperty('--shake-animation', `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`);

// إضافة حدث الضغط على Enter للتحقق من كلمة المرور
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordBtn.click();
    }
});

// إضافة حدث النقر خارج المودال لإغلاقه
window.addEventListener('click', (e) => {
    if (e.target === scoresModal) {
        scoresModal.classList.add('hidden');
    }
});
