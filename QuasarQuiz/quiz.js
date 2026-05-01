let shuffledQuestions = [];
let currentQuestionIndex = 0;
let allUserAnswers = [];
let timer;
let timeLeft = 600; // 10 minutes total

const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const timerDisplay = document.getElementById('timer');
const progressBar = document.getElementById('progressBar');
const questionNum = document.getElementById('questionNum');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const dotsContainer = document.getElementById('question-dots');

async function startQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    const level = urlParams.get('level');

    const quizTitle = document.getElementById('quiz-title');
    if (quizTitle && subject) {
        quizTitle.innerText = `${subject} Quiz`;
    }

    try {
        const response = await fetch('db.json');
        const data = await response.json();
        let filtered = data.questions.filter(q => q.subject === subject && q.difficulty === level);
        shuffledQuestions = shuffle(filtered).slice(0, 10);

        if (shuffledQuestions.length === 0) {
            questionText.innerText = "No questions found!";
        } else {
            allUserAnswers = new Array(shuffledQuestions.length).fill(-1);
            createDots();
            startGlobalTimer();
            loadQuestion();
        }
    } catch (err) {
        questionText.innerText = "Error loading database.";
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createDots() {
    dotsContainer.innerHTML = "";
    shuffledQuestions.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.id = `dot-${i}`;
        dotsContainer.appendChild(dot);
    });
}

function loadQuestion() {
    const q = shuffledQuestions[currentQuestionIndex];
    const savedAns = allUserAnswers[currentQuestionIndex];

    questionNum.innerText = `Question ${currentQuestionIndex + 1}/${shuffledQuestions.length}`;
    progressBar.style.width = `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%`;
    questionText.innerText = q.question;

    optionsContainer.innerHTML = "";
    q.options.forEach((text, index) => {
        const div = document.createElement('div');
        div.className = `option ${index === savedAns ? 'selected' : ''}`;
        div.innerText = text;
        div.onclick = () => selectOption(index, div);
        optionsContainer.appendChild(div);
    });

    // Update dots
    document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentQuestionIndex);
        d.classList.toggle('answered', allUserAnswers[i] !== -1);
    });

    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.innerHTML = currentQuestionIndex === shuffledQuestions.length - 1 ? 
        'Submit Quiz <i class="fa-solid fa-check-double"></i>' : 'Next <i class="fa-solid fa-chevron-right"></i>';
}

function selectOption(index, element) {
    allUserAnswers[currentQuestionIndex] = index;
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById(`dot-${currentQuestionIndex}`).classList.add('answered');
}

nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        submitQuiz();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
});

function startGlobalTimer() {
    timer = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        timerDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (timeLeft <= 0) submitQuiz();
    }, 1000);
}

function submitQuiz() {
    clearInterval(timer);
    let finalScore = 0;
    shuffledQuestions.forEach((q, i) => { if (allUserAnswers[i] === q.correct) finalScore++; });

    const percentage = Math.round((finalScore / shuffledQuestions.length) * 100);
    const template = document.getElementById('resultsTemplate').innerHTML;
    document.getElementById('quizBody').innerHTML = template;
    document.getElementById('finalPercentage').innerText = `${percentage}%`;
    document.getElementById('finalScoreText').innerText = `You scored ${finalScore} out of ${shuffledQuestions.length}`;
    document.querySelector('.quiz-footer').style.display = "none";
}

function startReview() {
    currentQuestionIndex = 0;
    renderReview();
}

function renderReview() {
    const q = shuffledQuestions[currentQuestionIndex];
    const userAns = allUserAnswers[currentQuestionIndex];
    const isCorrect = userAns === q.correct;

    document.getElementById('quizBody').innerHTML = `
        <div class="review-card">
            <div class="review-header">
                <span class="text-dim">Reviewing ${currentQuestionIndex + 1}/10</span>
                <span class="status-badge ${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? 'Correct' : 'Incorrect'}
                </span>
            </div>
            <h2 class="question-text" style="text-align: left;">${q.question}</h2>
            <div class="options-grid">
                ${q.options.map((opt, i) => `
                    <div class="option-static ${i === q.correct ? 'correct' : ''} ${i === userAns && !isCorrect ? 'incorrect' : ''}">
                        <span>${opt}</span>
                        ${i === q.correct ? '<i class="fa-solid fa-check"></i>' : (i === userAns ? '<i class="fa-solid fa-xmark"></i>' : '')}
                    </div>
                `).join('')}
            </div>
            <div class="review-controls" style="display: flex; gap: 15px; margin-top: 30px;">
                <button class="btn secondary" onclick="moveReview(-1)" ${currentQuestionIndex === 0 ? 'disabled' : ''}>Prev</button>
                <button class="btn secondary" onclick="moveReview(1)" ${currentQuestionIndex === 9 ? 'disabled' : ''}>Next</button>
            </div>
            <button class="btn" style="margin-top: 15px;" onclick="window.location.href='library.html'">Finish Review</button>
        </div>
    `;
}


function moveReview(step) { currentQuestionIndex += step; renderReview(); }

document.addEventListener('DOMContentLoaded', startQuiz);
