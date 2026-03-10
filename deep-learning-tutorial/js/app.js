/* ============================================
   App Controller - Navigation, Progress & Achievements
   ============================================ */

const App = {
    currentChapter: null,
    chapters: {},
    progress: {},
    quizzesCompleted: {},
    achievements: [],
    xp: 0,
    totalChapters: 61,

    // Achievement definitions
    ACHIEVEMENTS: [
        { id: 'first_step', title: 'First Steps', desc: 'Complete your first chapter', icon: '\uD83D\uDC23', check: (app) => Object.keys(app.progress).length >= 1 },
        { id: 'quick_learner', title: 'Quick Learner', desc: 'Complete 5 chapters', icon: '\uD83D\uDCDA', check: (app) => Object.keys(app.progress).length >= 5 },
        { id: 'halfway', title: 'Halfway There', desc: 'Complete 31 chapters', icon: '\uD83C\uDFC3', check: (app) => Object.keys(app.progress).length >= 31 },
        { id: 'deep_learner', title: 'Deep Learner', desc: 'Complete all 61 chapters', icon: '\uD83C\uDF93', check: (app) => Object.keys(app.progress).length >= 61 },
        { id: 'perfect_score', title: 'Perfect Score', desc: 'Get 100% on any quiz', icon: '\uD83C\uDFAF', check: (app) => Object.values(app.quizzesCompleted).some(q => q.score === q.total) },
        { id: 'quiz_5', title: 'Quiz Taker', desc: 'Complete 5 quizzes', icon: '\uD83D\uDCDD', check: (app) => Object.keys(app.quizzesCompleted).length >= 5 },
        { id: 'quiz_15', title: 'Quiz Master', desc: 'Complete 15 quizzes', icon: '\uD83E\uDDE0', check: (app) => Object.keys(app.quizzesCompleted).length >= 15 },
        { id: 'quiz_all', title: 'Quiz Champion', desc: 'Complete all 61 quizzes', icon: '\uD83D\uDC51', check: (app) => Object.keys(app.quizzesCompleted).length >= 61 },
        { id: 'xp_100', title: 'XP Hunter', desc: 'Earn 100 XP', icon: '\u2B50', check: (app) => app.xp >= 100 },
        { id: 'xp_500', title: 'XP Master', desc: 'Earn 500 XP', icon: '\uD83C\uDF1F', check: (app) => app.xp >= 500 },
        { id: 'xp_1000', title: 'XP Legend', desc: 'Earn 1,000 XP', icon: '\uD83D\uDCA0', check: (app) => app.xp >= 1000 },
        { id: 'xp_2000', title: 'XP God', desc: 'Earn 2,000 XP', icon: '\uD83D\uDE80', check: (app) => app.xp >= 2000 },
        { id: 'module1', title: 'Foundation Builder', desc: 'Complete Module 1', icon: '\uD83C\uDFD7\uFE0F', check: (app) => ['1-1','1-2'].every(c => app.progress[c]) },
        { id: 'module2', title: 'Math Wizard', desc: 'Complete Module 2', icon: '\uD83E\uDDD9', check: (app) => ['2-1','2-2','2-3','2-4','2-5'].every(c => app.progress[c]) },
        { id: 'module3', title: 'CNN Explorer', desc: 'Complete Module 3', icon: '\uD83D\uDD0D', check: (app) => ['3-1','3-2'].every(c => app.progress[c]) },
        { id: 'module9', title: 'Transformer Guru', desc: 'Complete Module 9', icon: '\u26A1', check: (app) => ['9-1','9-2','9-3','9-4','9-5'].every(c => app.progress[c]) },
        { id: 'module12', title: 'Frontier Pioneer', desc: 'Complete Module 12', icon: '\uD83C\uDF0C', check: (app) => ['12-1','12-2','12-3','12-4','12-5'].every(c => app.progress[c]) },
        { id: 'module13', title: 'Attention Architect', desc: 'Complete Module 13', icon: '\uD83D\uDD2C', check: (app) => ['13-1','13-2','13-3','13-4','13-5'].every(c => app.progress[c]) },
        { id: 'module14', title: 'Reasoning Master', desc: 'Complete Module 14', icon: '\uD83E\uDDE0', check: (app) => ['14-1','14-2','14-3','14-4','14-5'].every(c => app.progress[c]) },
        { id: 'module15', title: 'Production Engineer', desc: 'Complete Module 15', icon: '\uD83C\uDFED', check: (app) => ['15-1','15-2','15-3','15-4','15-5'].every(c => app.progress[c]) },
    ],

    STORAGE_KEY: 'dl-tutorial-progress',

    init() {
        this.loadProgress();
        this.setupNavigation();
        this.setupSidebar();
        this.updateProgressUI();

        // Register chapters
        if (typeof Chapter1 !== 'undefined') Chapter1.init();
        if (typeof Chapter2 !== 'undefined') Chapter2.init();
        if (typeof Chapter3 !== 'undefined') Chapter3.init();
        if (typeof Chapter4 !== 'undefined') Chapter4.init();
        if (typeof Chapter5 !== 'undefined') Chapter5.init();
        if (typeof Chapter6 !== 'undefined') Chapter6.init();
        if (typeof Chapter7 !== 'undefined') Chapter7.init();
        if (typeof Chapter8 !== 'undefined') Chapter8.init();
        if (typeof Chapter9 !== 'undefined') Chapter9.init();
        if (typeof Chapter10 !== 'undefined') Chapter10.init();
        if (typeof Chapter11 !== 'undefined') Chapter11.init();
        if (typeof Chapter12 !== 'undefined') Chapter12.init();
        if (typeof Chapter13 !== 'undefined') Chapter13.init();
        if (typeof Chapter14 !== 'undefined') Chapter14.init();
        if (typeof Chapter15 !== 'undefined') Chapter15.init();
    },

    // ---- Navigation ----
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const chapter = item.dataset.chapter;
                this.navigateTo(chapter);
            });
        });
    },

    navigateTo(chapterId) {
        // Hide all chapters
        document.querySelectorAll('.chapter-container').forEach(c => {
            c.classList.remove('active');
        });

        // Show target
        const target = document.getElementById(`chapter-${chapterId}`);
        if (target) {
            target.classList.add('active');
            this.currentChapter = chapterId;

            // Update nav
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.chapter === chapterId);
            });

            // Initialize chapter content if not loaded
            if (this.chapters[chapterId] && !this.chapters[chapterId].loaded) {
                this.chapters[chapterId].load();
                this.chapters[chapterId].loaded = true;
            }

            // Scroll to top
            window.scrollTo(0, 0);
        }
    },

    registerChapter(id, loadFn) {
        this.chapters[id] = { load: loadFn, loaded: false };
    },

    // ---- Sidebar (mobile) ----
    setupSidebar() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');

        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });

            // Close sidebar on navigation (mobile)
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    sidebar.classList.remove('open');
                });
            });
        }
    },

    // ---- Progress & Persistence ----
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.progress = data.progress || {};
                this.xp = data.xp || 0;
                this.quizzesCompleted = data.quizzesCompleted || {};
                this.achievements = data.achievements || [];
            }
        } catch (e) {
            console.warn('Could not load progress from localStorage:', e);
            this.progress = {};
            this.xp = 0;
            this.quizzesCompleted = {};
            this.achievements = [];
        }
    },

    saveProgress() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                progress: this.progress,
                xp: this.xp,
                quizzesCompleted: this.quizzesCompleted,
                achievements: this.achievements,
                lastUpdated: Date.now()
            }));
        } catch (e) {
            console.warn('Could not save progress to localStorage:', e);
        }
    },

    // Called by Quiz when a quiz is finished
    completeQuiz(chapterId, score, total) {
        const percent = Math.round((score / total) * 100);
        const prev = this.quizzesCompleted[chapterId];
        let xpAwarded = 0;

        if (!prev) {
            // First time completing this quiz - award full XP
            xpAwarded = score * 10;
            this.quizzesCompleted[chapterId] = { score, total, bestPercent: percent, xpAwarded, completedAt: Date.now() };
        } else if (score > prev.score) {
            // Beat previous score - award only the XP difference
            const prevXP = prev.score * 10;
            const newXP = score * 10;
            xpAwarded = newXP - prevXP;
            this.quizzesCompleted[chapterId] = {
                score,
                total,
                bestPercent: percent,
                xpAwarded: prev.xpAwarded + xpAwarded,
                completedAt: prev.completedAt,
                improvedAt: Date.now()
            };
        }
        // If same or worse score, no additional XP

        if (xpAwarded > 0) {
            this.xp += xpAwarded;
        }

        // Complete chapter if score >= 60%
        if (percent >= 60) {
            this.markChapterComplete(chapterId);
        }

        this.saveProgress();
        this.updateProgressUI();
        this.checkAchievements();

        return { xpAwarded, isNewBest: !prev || score > prev.score, prevBest: prev ? prev.score : 0 };
    },

    markChapterComplete(chapterId) {
        if (!this.progress[chapterId]) {
            this.progress[chapterId] = { completedAt: Date.now() };
            this.xp += 50; // Chapter completion bonus

            // Update nav item
            const navItem = document.querySelector(`.nav-item[data-chapter="${chapterId}"]`);
            if (navItem) navItem.classList.add('completed');
        }
    },

    completeChapter(chapterId) {
        // Public API for direct chapter completion (e.g., from non-quiz interactions)
        if (!this.progress[chapterId]) {
            this.markChapterComplete(chapterId);
            this.saveProgress();
            this.updateProgressUI();
            this.checkAchievements();
            this.showToast('Chapter Complete!', `You've mastered ${chapterId}. +50 XP`);
        }
    },

    addXP(amount) {
        if (amount <= 0) return;
        this.xp += amount;
        this.saveProgress();
        this.updateProgressUI();
        this.checkAchievements();
    },

    // ---- Achievements ----
    checkAchievements() {
        let newAchievements = [];

        this.ACHIEVEMENTS.forEach(ach => {
            if (!this.achievements.includes(ach.id) && ach.check(this)) {
                this.achievements.push(ach.id);
                newAchievements.push(ach);
            }
        });

        if (newAchievements.length > 0) {
            this.saveProgress();
            // Show toasts for new achievements with staggered delay
            newAchievements.forEach((ach, i) => {
                setTimeout(() => {
                    this.showToast(`${ach.icon} ${ach.title}`, ach.desc);
                }, i * 2500);
            });
        }
    },

    getAchievementProgress() {
        return {
            earned: this.achievements.length,
            total: this.ACHIEVEMENTS.length,
            list: this.ACHIEVEMENTS.map(ach => ({
                ...ach,
                earned: this.achievements.includes(ach.id)
            }))
        };
    },

    // ---- UI Updates ----
    updateProgressUI() {
        const completedCount = Object.keys(this.progress).length;
        const percent = Math.round((completedCount / this.totalChapters) * 100);

        const progressPercent = document.getElementById('progressPercent');
        const progressFill = document.getElementById('progressFill');
        const xpCount = document.getElementById('xpCount');
        const achievementCount = document.getElementById('achievementCount');

        if (progressPercent) progressPercent.textContent = `${percent}%`;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (xpCount) xpCount.textContent = this.xp;
        if (achievementCount) achievementCount.textContent = `${this.achievements.length}/${this.ACHIEVEMENTS.length}`;

        // Update nav items
        Object.keys(this.progress).forEach(chapterId => {
            const navItem = document.querySelector(`.nav-item[data-chapter="${chapterId}"]`);
            if (navItem) navItem.classList.add('completed');
        });
    },

    // ---- Toast ----
    showToast(title, message) {
        const toast = document.getElementById('achievementToast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');

        if (!toast || !toastTitle || !toastMessage) return;

        toastTitle.textContent = title;
        toastMessage.textContent = message;
        toast.classList.add('show');

        // Clear any existing timeout
        if (this._toastTimeout) clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => toast.classList.remove('show'), 4000);
    },

    // ---- Stats ----
    getStats() {
        return {
            chaptersCompleted: Object.keys(this.progress).length,
            totalChapters: this.totalChapters,
            quizzesCompleted: Object.keys(this.quizzesCompleted).length,
            totalQuizzes: this.totalChapters,
            xp: this.xp,
            achievements: this.achievements.length,
            totalAchievements: this.ACHIEVEMENTS.length,
            averageQuizScore: this.getAverageQuizScore()
        };
    },

    getAverageQuizScore() {
        const quizzes = Object.values(this.quizzesCompleted);
        if (quizzes.length === 0) return 0;
        const totalPercent = quizzes.reduce((sum, q) => sum + q.bestPercent, 0);
        return Math.round(totalPercent / quizzes.length);
    },

    // ---- Reset (for testing) ----
    resetProgress() {
        this.progress = {};
        this.xp = 0;
        this.quizzesCompleted = {};
        this.achievements = [];
        this.saveProgress();
        this.updateProgressUI();
        // Remove completed class from all nav items
        document.querySelectorAll('.nav-item.completed').forEach(item => {
            item.classList.remove('completed');
        });
    },

    // ---- Helpers ----
    getNextChapter(current) {
        const order = ['1-1','1-2','2-1','2-2','2-3','2-4','2-5','3-1','3-2','4-1','4-2','5-1','5-2','5-3','5-4','6-1','6-2','6-3','7-1','7-2','7-3','8-1','8-2','8-3','8-4','8-5','9-1','9-2','9-3','9-4','9-5','10-1','10-2','10-3','10-4','10-5','11-1','11-2','11-3','11-4','11-5','12-1','12-2','12-3','12-4','12-5','13-1','13-2','13-3','13-4','13-5','14-1','14-2','14-3','14-4','14-5','15-1','15-2','15-3','15-4','15-5'];
        const idx = order.indexOf(current);
        return idx < order.length - 1 ? order[idx + 1] : null;
    },

    getPrevChapter(current) {
        const order = ['1-1','1-2','2-1','2-2','2-3','2-4','2-5','3-1','3-2','4-1','4-2','5-1','5-2','5-3','5-4','6-1','6-2','6-3','7-1','7-2','7-3','8-1','8-2','8-3','8-4','8-5','9-1','9-2','9-3','9-4','9-5','10-1','10-2','10-3','10-4','10-5','11-1','11-2','11-3','11-4','11-5','12-1','12-2','12-3','12-4','12-5','13-1','13-2','13-3','13-4','13-5','14-1','14-2','14-3','14-4','14-5','15-1','15-2','15-3','15-4','15-5'];
        const idx = order.indexOf(current);
        return idx > 0 ? order[idx - 1] : null;
    }
};
