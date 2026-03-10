/* ============================================
   Quiz Engine
   ============================================ */

const Quiz = {
    currentQuiz: null,
    currentIndex: 0,
    selectedAnswer: null,
    score: 0,
    answered: false,

    start(quizData) {
        this.currentQuiz = quizData;
        this.currentIndex = 0;
        this.selectedAnswer = null;
        this.score = 0;
        this.answered = false;

        this.showQuestion();
        document.getElementById('quizModal').classList.add('active');
    },

    showQuestion() {
        const q = this.currentQuiz.questions[this.currentIndex];
        const total = this.currentQuiz.questions.length;

        document.getElementById('quizTitle').textContent = this.currentQuiz.title;
        document.getElementById('quizProgress').textContent = `${this.currentIndex + 1}/${total}`;

        // Reset state
        this.selectedAnswer = null;
        this.answered = false;
        document.getElementById('quizSubmit').classList.remove('hidden');
        document.getElementById('quizNext').classList.add('hidden');

        const body = document.getElementById('quizBody');
        body.innerHTML = `
            <div class="quiz-question">${q.question}</div>
            <div class="quiz-options">
                ${q.options.map((opt, i) => `
                    <div class="quiz-option" data-index="${i}" onclick="Quiz.selectOption(${i})">
                        <span class="quiz-option-marker">${String.fromCharCode(65 + i)}</span>
                        <span>${opt}</span>
                    </div>
                `).join('')}
            </div>
            <div class="quiz-feedback" id="quizFeedback"></div>
        `;
    },

    selectOption(index) {
        if (this.answered) return;

        this.selectedAnswer = index;
        document.querySelectorAll('.quiz-option').forEach((opt, i) => {
            opt.classList.toggle('selected', i === index);
        });
    },

    submit() {
        if (this.selectedAnswer === null || this.answered) return;

        this.answered = true;
        const q = this.currentQuiz.questions[this.currentIndex];
        const correct = this.selectedAnswer === q.correct;

        if (correct) this.score++;

        // Show correct/incorrect
        document.querySelectorAll('.quiz-option').forEach((opt, i) => {
            if (i === q.correct) opt.classList.add('correct');
            if (i === this.selectedAnswer && !correct) opt.classList.add('incorrect');
        });

        // Feedback
        const feedback = document.getElementById('quizFeedback');
        feedback.className = `quiz-feedback ${correct ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = correct
            ? `Correct! ${q.explanation || ''}`
            : `Not quite. ${q.explanation || ''}`;

        // Toggle buttons
        document.getElementById('quizSubmit').classList.add('hidden');
        document.getElementById('quizNext').classList.remove('hidden');
        document.getElementById('quizNext').textContent =
            this.currentIndex < this.currentQuiz.questions.length - 1 ? 'Next \u2192' : 'See Results';
    },

    next() {
        this.currentIndex++;

        if (this.currentIndex < this.currentQuiz.questions.length) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    },

    skip() {
        this.close();
    },

    showResults() {
        const total = this.currentQuiz.questions.length;
        const percent = Math.round((this.score / total) * 100);
        const chapterId = this.currentQuiz.chapterId;

        // Use the new completeQuiz API which handles XP, deduplication, and achievements
        const result = App.completeQuiz(chapterId, this.score, total);

        const passed = percent >= 60;
        const statusIcon = passed ? '\uD83C\uDF89' : '\uD83D\uDCAA';
        const statusText = passed ? 'Quiz Passed!' : 'Keep Practicing!';
        const statusColor = passed ? 'var(--success)' : 'var(--warning)';

        let xpBreakdown = '';
        if (result.xpAwarded > 0) {
            xpBreakdown = `<p style="color: var(--warning); font-weight: 600; margin-top: 12px;">+${result.xpAwarded} XP earned</p>`;
            if (passed && !App.progress[chapterId]?.improvedAt) {
                xpBreakdown += `<p style="color: var(--success); font-size: 12px;">+50 XP chapter completion bonus!</p>`;
            }
        } else if (result.isNewBest === false) {
            xpBreakdown = `<p style="color: var(--text-secondary); font-size: 12px; margin-top: 12px;">Previous best: ${result.prevBest}/${total} \u2014 Beat it for more XP!</p>`;
        }

        let retakeNote = '';
        if (result.prevBest > 0 && result.isNewBest) {
            retakeNote = `<p style="color: var(--accent-secondary); font-size: 12px; margin-top: 6px;">\uD83C\uDF1F New personal best! (was ${result.prevBest}/${total})</p>`;
        }

        const body = document.getElementById('quizBody');
        body.innerHTML = `
            <div class="quiz-score">
                <div style="font-size: 36px; margin-bottom: 8px;">${statusIcon}</div>
                <div class="score-number">${this.score}/${total}</div>
                <p style="color: ${statusColor}; font-weight: 600;">${statusText} (${percent}%)</p>
                ${xpBreakdown}
                ${retakeNote}
                ${!passed ? '<p style="color: var(--text-secondary); font-size: 12px; margin-top: 8px;">Score 60% or higher to complete this chapter!</p>' : ''}
            </div>
        `;

        document.getElementById('quizSubmit').classList.add('hidden');
        document.getElementById('quizNext').textContent = 'Close';
        document.getElementById('quizNext').classList.remove('hidden');
        document.getElementById('quizNext').onclick = () => Quiz.close();
        document.getElementById('quizSkip').classList.add('hidden');
    },

    close() {
        document.getElementById('quizModal').classList.remove('active');
        // Reset next button
        document.getElementById('quizNext').onclick = () => Quiz.next();
        document.getElementById('quizSkip').classList.remove('hidden');
    }
};
