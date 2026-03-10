/* ============================================
   Chapter 7: Natural Language Processing
   ============================================ */

const Chapter7 = {
    init() {
        App.registerChapter('7-1', () => this.loadChapter7_1());
        App.registerChapter('7-2', () => this.loadChapter7_2());
        App.registerChapter('7-3', () => this.loadChapter7_3());
    },

    // ============================================
    // 7.1: Word Embeddings Explorer
    // ============================================
    embeddingSelectedWord: null,
    analogyAnimating: false,

    // Predefined word vectors (projected to 2D for visualization)
    wordVectors: {
        king:   { x: 0.65, y: 0.75, group: 'royalty' },
        queen:  { x: 0.55, y: 0.80, group: 'royalty' },
        man:    { x: 0.70, y: 0.45, group: 'royalty' },
        woman:  { x: 0.60, y: 0.50, group: 'royalty' },
        cat:    { x: 0.20, y: 0.30, group: 'animals' },
        dog:    { x: 0.25, y: 0.20, group: 'animals' },
        puppy:  { x: 0.30, y: 0.15, group: 'animals' },
        kitten: { x: 0.15, y: 0.25, group: 'animals' },
        car:    { x: 0.80, y: 0.15, group: 'vehicles' },
        bus:    { x: 0.85, y: 0.25, group: 'vehicles' },
        happy:  { x: 0.35, y: 0.70, group: 'emotions' },
        sad:    { x: 0.40, y: 0.85, group: 'emotions' },
        good:   { x: 0.30, y: 0.65, group: 'emotions' },
        bad:    { x: 0.45, y: 0.88, group: 'emotions' }
    },

    groupColors: {
        royalty:  '#8b5cf6',
        animals:  '#10b981',
        vehicles: '#3b82f6',
        emotions: '#f59e0b'
    },

    loadChapter7_1() {
        const container = document.getElementById('chapter-7-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 7 \u2022 Chapter 7.1</span>
                <h1>Word Embeddings Explorer</h1>
                <p>Computers only understand numbers, not words! Word embeddings are like a secret code
                   that turns words into lists of numbers. Similar words get similar number lists and
                   live close together in an imaginary world. Cool, right?</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCD6</span> From Words to Numbers</h2>
                <p>How do we turn words into numbers for a computer brain? There are two ways:</p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="info-box warning">
                        <span class="info-box-text">
                            <strong>One-Hot Encoding (The Old Way)</strong><br>
                            Imagine giving each word its own spot in a HUGE list of mostly zeros.
                            "cat" = [0,0,1,0,...,0]. It is like a giant classroom where every kid
                            sits alone. No one knows who is friends with who. Wasteful!
                        </span>
                    </div>
                    <div class="info-box success">
                        <span class="info-box-text">
                            <strong>Dense Embeddings (The Smart Way)</strong><br>
                            Each word gets a short, packed list of numbers.
                            "cat" = [0.2, -0.4, 0.7, ...]. Think of it like giving each kid a
                            friendship bracelet -- similar kids get similar bracelets!
                        </span>
                    </div>
                </div>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Think of it like a map of words! "King" and "queen" live on the same street
                    because they are both royalty. But "king" and "puppy" live in totally different
                    neighborhoods. The computer learns this all by itself from reading lots of text!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDDFA\uFE0F</span> 2D Embedding Space</h2>
                <p>Here is a picture of where words live! Words that mean similar things
                   hang out together, like friends at recess. Click any word to see its closest buddies!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="network-viz">
                    <canvas id="embeddingCanvas" width="800" height="450"></canvas>
                </div>

                <div class="graph-legend">
                    <div class="legend-item active">
                        <span class="legend-dot" style="background:#8b5cf6;"></span> Royalty
                    </div>
                    <div class="legend-item active">
                        <span class="legend-dot" style="background:#10b981;"></span> Animals
                    </div>
                    <div class="legend-item active">
                        <span class="legend-dot" style="background:#3b82f6;"></span> Vehicles
                    </div>
                    <div class="legend-item active">
                        <span class="legend-dot" style="background:#f59e0b;"></span> Emotions
                    </div>
                </div>

                <div class="step-explanation" id="embeddingInfo">
                    Click on any word to light it up and see which words are its closest friends!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2728</span> Vector Arithmetic: King - Man + Woman = ?</h2>
                <p>Here is the fun part -- word math is almost like magic! If you take "king,"
                   remove the "man" part, and add the "woman" part, you get... "queen"!
                   It is like the computer truly understands what these words mean!</p>

                <div class="network-viz">
                    <canvas id="analogyCanvas" width="800" height="350"></canvas>
                </div>

                <div class="step-explanation" id="analogyExplanation">
                    Click "Show Analogy" to watch the magic: king - man + woman = queen!
                </div>

                <div class="controls">
                    <button class="btn-primary btn-small" id="analogyBtn" onclick="Chapter7.animateAnalogy()">
                        \u25B6 Show Analogy
                    </button>
                    <button class="btn-secondary btn-small" onclick="Chapter7.resetAnalogy()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Keras Embedding Layer</h2>
                <p>When you build a real model, you add a special Embedding layer first.
                   It starts with random numbers and learns the best secret codes during training!</p>

                <div class="code-block">
<span class="keyword">from</span> tensorflow.keras.models <span class="keyword">import</span> Sequential
<span class="keyword">from</span> tensorflow.keras.layers <span class="keyword">import</span> Embedding, Flatten, Dense

<span class="comment"># Our dictionary has 10,000 words</span>
<span class="comment"># Each word becomes a list of 128 numbers</span>
<span class="comment"># Sentences can be up to 50 words long</span>

model = <span class="function">Sequential</span>([
    <span class="function">Embedding</span>(input_dim=<span class="number">10000</span>, output_dim=<span class="number">128</span>,
              input_length=<span class="number">50</span>),
    <span class="function">Flatten</span>(),
    <span class="function">Dense</span>(<span class="number">64</span>, activation=<span class="string">'relu'</span>),
    <span class="function">Dense</span>(<span class="number">1</span>, activation=<span class="string">'sigmoid'</span>)
])

model.<span class="function">compile</span>(optimizer=<span class="string">'adam'</span>,
              loss=<span class="string">'binary_crossentropy'</span>,
              metrics=[<span class="string">'accuracy'</span>])

<span class="comment"># The Embedding layer starts with random number lists</span>
<span class="comment"># and learns better ones as it practices!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCDD</span> Key Concepts</h2>
                <ul style="color: var(--text-secondary); padding-left: 20px; line-height: 2;">
                    <li><strong>How long are the number lists?</strong> Usually 50 to 300 numbers per word</li>
                    <li><strong>Measuring similarity:</strong> We compare two word lists to see how alike they are -- like checking if two recipes use similar ingredients</li>
                    <li><strong>Reusing what we learned:</strong> Someone else can train word codes on millions of books, and we can borrow them!</li>
                    <li><strong>Smart codes:</strong> Modern AI (like BERT and GPT) gives a word different codes depending on the sentence it appears in</li>
                </ul>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter7.startQuiz7_1()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('6-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('7-2')">Next: Word2Vec Deep Dive \u2192</button>
            </div>
        `;

        this.embeddingSelectedWord = null;
        this.analogyAnimating = false;
        this.drawEmbeddingSpace();
        this.initEmbeddingClick();
        this.resetAnalogy();
    },

    initEmbeddingClick() {
        const canvas = document.getElementById('embeddingCanvas');
        if (!canvas) return;
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            const pad = { left: 60, right: 40, top: 40, bottom: 40 };
            const plotW = canvas.width - pad.left - pad.right;
            const plotH = canvas.height - pad.top - pad.bottom;

            let closest = null;
            let closestDist = Infinity;
            Object.entries(this.wordVectors).forEach(([word, vec]) => {
                const px = pad.left + vec.x * plotW;
                const py = pad.top + (1 - vec.y) * plotH;
                const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
                if (dist < closestDist && dist < 30) {
                    closestDist = dist;
                    closest = word;
                }
            });

            if (closest) {
                this.embeddingSelectedWord = closest;
                this.drawEmbeddingSpace();
                const info = document.getElementById('embeddingInfo');
                if (info) {
                    const neighbors = this.getNeighbors(closest, 3);
                    info.innerHTML = `<strong>"${closest}"</strong> (${this.wordVectors[closest].group}) -- ` +
                        `Nearest neighbors: ${neighbors.map(n => `<strong>"${n.word}"</strong> (dist: ${n.dist.toFixed(3)})`).join(', ')}`;
                }
            }
        });
    },

    getNeighbors(word, k) {
        const vec = this.wordVectors[word];
        const distances = [];
        Object.entries(this.wordVectors).forEach(([w, v]) => {
            if (w === word) return;
            const dist = Math.sqrt((vec.x - v.x) ** 2 + (vec.y - v.y) ** 2);
            distances.push({ word: w, dist });
        });
        distances.sort((a, b) => a.dist - b.dist);
        return distances.slice(0, k);
    },

    drawEmbeddingSpace() {
        const canvas = document.getElementById('embeddingCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { left: 60, right: 40, top: 40, bottom: 40 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = pad.left + plotW * (i / 10);
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
            const y = pad.top + plotH * (i / 10);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
        }

        // Axes labels
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Dimension 1', W / 2, H - 8);
        ctx.save();
        ctx.translate(14, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Dimension 2', 0, 0);
        ctx.restore();

        const selected = this.embeddingSelectedWord;
        let neighbors = [];
        if (selected) {
            neighbors = this.getNeighbors(selected, 3);
        }

        // Draw neighbor connections
        if (selected) {
            const sv = this.wordVectors[selected];
            const sx = pad.left + sv.x * plotW;
            const sy = pad.top + (1 - sv.y) * plotH;

            neighbors.forEach(n => {
                const nv = this.wordVectors[n.word];
                const nx = pad.left + nv.x * plotW;
                const ny = pad.top + (1 - nv.y) * plotH;

                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(nx, ny);
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Distance label
                const midX = (sx + nx) / 2;
                const midY = (sy + ny) / 2;
                ctx.fillStyle = '#fbbf24';
                ctx.font = '10px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(n.dist.toFixed(3), midX, midY - 6);
            });
        }

        // Draw word points
        Object.entries(this.wordVectors).forEach(([word, vec]) => {
            const px = pad.left + vec.x * plotW;
            const py = pad.top + (1 - vec.y) * plotH;
            const color = this.groupColors[vec.group];
            const isSelected = word === selected;
            const isNeighbor = neighbors.some(n => n.word === word);

            // Glow for selected
            if (isSelected) {
                const glow = ctx.createRadialGradient(px, py, 0, px, py, 28);
                glow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
                glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
                ctx.fillStyle = glow;
                ctx.fillRect(px - 28, py - 28, 56, 56);
            }

            // Point
            ctx.beginPath();
            ctx.arc(px, py, isSelected ? 10 : (isNeighbor ? 8 : 6), 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? '#fbbf24' : color;
            ctx.fill();
            ctx.strokeStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = isSelected ? 2.5 : 1.5;
            ctx.stroke();

            // Label
            ctx.fillStyle = isSelected ? '#fbbf24' : '#e8eaf0';
            ctx.font = isSelected ? 'bold 13px Inter' : '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(word, px, py - 14);
        });
    },

    resetAnalogy() {
        this.analogyAnimating = false;
        this.drawAnalogyBase();
    },

    drawAnalogyBase() {
        const canvas = document.getElementById('analogyCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const pad = { left: 80, right: 80, top: 50, bottom: 50 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 8; i++) {
            const x = pad.left + plotW * (i / 8);
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
            const y = pad.top + plotH * (i / 8);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
        }

        // Define positions
        const words = {
            king:  { x: 0.70, y: 0.80 },
            queen: { x: 0.55, y: 0.85 },
            man:   { x: 0.75, y: 0.40 },
            woman: { x: 0.60, y: 0.45 }
        };

        // Draw each word point
        Object.entries(words).forEach(([word, pos]) => {
            const px = pad.left + pos.x * plotW;
            const py = pad.top + (1 - pos.y) * plotH;

            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#8b5cf6';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(word, px, py - 16);
        });

        // Draw relationship lines (king-man, queen-woman as dashed)
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1.5;

        // king to man (vertical relationship)
        let fromP = { x: pad.left + words.king.x * plotW, y: pad.top + (1 - words.king.y) * plotH };
        let toP = { x: pad.left + words.man.x * plotW, y: pad.top + (1 - words.man.y) * plotH };
        ctx.beginPath(); ctx.moveTo(fromP.x, fromP.y); ctx.lineTo(toP.x, toP.y); ctx.stroke();

        // queen to woman
        fromP = { x: pad.left + words.queen.x * plotW, y: pad.top + (1 - words.queen.y) * plotH };
        toP = { x: pad.left + words.woman.x * plotW, y: pad.top + (1 - words.woman.y) * plotH };
        ctx.beginPath(); ctx.moveTo(fromP.x, fromP.y); ctx.lineTo(toP.x, toP.y); ctx.stroke();

        ctx.setLineDash([]);

        // Labels for relationships
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        const kingP = { x: pad.left + words.king.x * plotW, y: pad.top + (1 - words.king.y) * plotH };
        const manP = { x: pad.left + words.man.x * plotW, y: pad.top + (1 - words.man.y) * plotH };
        ctx.fillText('gender', (kingP.x + manP.x) / 2 + 20, (kingP.y + manP.y) / 2);

        const queenP = { x: pad.left + words.queen.x * plotW, y: pad.top + (1 - words.queen.y) * plotH };
        const womanP = { x: pad.left + words.woman.x * plotW, y: pad.top + (1 - words.woman.y) * plotH };
        ctx.fillText('gender', (queenP.x + womanP.x) / 2 + 20, (queenP.y + womanP.y) / 2);
    },

    animateAnalogy() {
        if (this.analogyAnimating) return;
        this.analogyAnimating = true;

        const canvas = document.getElementById('analogyCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { left: 80, right: 80, top: 50, bottom: 50 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        const words = {
            king:  { x: 0.70, y: 0.80 },
            queen: { x: 0.55, y: 0.85 },
            man:   { x: 0.75, y: 0.40 },
            woman: { x: 0.60, y: 0.45 }
        };

        const toScreen = (pos) => ({
            x: pad.left + pos.x * plotW,
            y: pad.top + (1 - pos.y) * plotH
        });

        const kingS = toScreen(words.king);
        const manS = toScreen(words.man);
        const womanS = toScreen(words.woman);
        const queenS = toScreen(words.queen);

        // Animation stages: 0=king, 1=subtract man, 2=add woman, 3=arrive at queen
        let stage = 0;
        let progress = 0;
        const speed = 0.02;
        const expl = document.getElementById('analogyExplanation');

        // Intermediate point after king - man
        const interX = kingS.x - (manS.x - kingS.x);
        const interY = kingS.y - (manS.y - kingS.y);

        // Current animated point
        let currentX = kingS.x;
        let currentY = kingS.y;

        const drawArrow = (fromX, fromY, toX, toY, color, label) => {
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const headLen = 12;

            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(toX, toY);
            ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Label
            if (label) {
                const midX = (fromX + toX) / 2;
                const midY = (fromY + toY) / 2;
                ctx.fillStyle = color;
                ctx.font = 'bold 12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(label, midX - 20, midY - 10);
            }
        };

        const animate = () => {
            this.drawAnalogyBase();
            progress += speed;

            if (stage === 0) {
                // Stage 0: show king highlighted, then move toward king - man direction
                const t = Math.min(progress, 1);
                currentX = kingS.x + (interX - kingS.x) * t;
                currentY = kingS.y + (interY - kingS.y) * t;

                drawArrow(kingS.x, kingS.y, currentX, currentY, '#ef4444', '- man');

                if (expl) expl.innerHTML = '<strong>Step 1:</strong> Start at "king" and take away the "man" part...';

                if (progress >= 1) { stage = 1; progress = 0; }
            } else if (stage === 1) {
                // Stage 1: from intermediate, add woman direction toward queen
                drawArrow(kingS.x, kingS.y, interX, interY, '#ef4444', '- man');

                const t = Math.min(progress, 1);
                const targetX = queenS.x;
                const targetY = queenS.y;
                currentX = interX + (targetX - interX) * t;
                currentY = interY + (targetY - interY) * t;

                drawArrow(interX, interY, currentX, currentY, '#10b981', '+ woman');

                if (expl) expl.innerHTML = '<strong>Step 2:</strong> Now add the "woman" part to see where we land...';

                if (progress >= 1) { stage = 2; progress = 0; }
            } else if (stage === 2) {
                // Final stage: show complete result
                drawArrow(kingS.x, kingS.y, interX, interY, '#ef4444', '- man');
                drawArrow(interX, interY, queenS.x, queenS.y, '#10b981', '+ woman');

                // Highlight queen as result
                ctx.beginPath();
                ctx.arc(queenS.x, queenS.y, 16, 0, Math.PI * 2);
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 14px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('= queen!', queenS.x, queenS.y + 30);

                if (expl) expl.innerHTML = '<strong>Amazing!</strong> king - man + woman = <strong>queen</strong>! ' +
                    'The computer figured out the relationship between these words all by itself. Like magic!';

                this.analogyAnimating = false;
                return;
            }

            // Draw animated point
            ctx.beginPath();
            ctx.arc(currentX, currentY, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    },

    startQuiz7_1() {
        Quiz.start({
            title: 'Chapter 7.1: Word Embeddings',
            chapterId: '7-1',
            questions: [
                {
                    question: 'Why are packed number lists (dense embeddings) better than the huge list of zeros (one-hot)?',
                    options: [
                        'They use more memory',
                        'They know which words are similar to each other',
                        'They are faster to compute',
                        'They work with any language automatically'
                    ],
                    correct: 1,
                    explanation: 'Packed number lists put similar words close together, like friends sitting near each other. The huge lists of zeros cannot tell which words are alike.'
                },
                {
                    question: 'What does the magic equation "king - man + woman = queen" show us?',
                    options: [
                        'That computers can do math',
                        'That word number lists can understand real-world relationships, like word magic!',
                        'That kings and queens are similar',
                        'That embeddings are always perfect'
                    ],
                    correct: 1,
                    explanation: 'The computer learned real relationships between words just from reading! It figured out "king is to man as queen is to woman" all by itself.'
                },
                {
                    question: 'How many numbers are usually in a word\'s secret code (its number list)?',
                    options: [
                        '2-5 numbers',
                        '10,000+ numbers (same as the dictionary size)',
                        '50-300 numbers',
                        'Just 1 number'
                    ],
                    correct: 2,
                    explanation: 'Word codes usually have 50 to 300 numbers. That is small enough to be fast, but big enough to capture what the word means.'
                },
                {
                    question: 'How does the Embedding layer learn which number list goes with which word?',
                    options: [
                        'The number lists are set forever and never change',
                        'It starts with random numbers and gets better by practicing on lots of text',
                        'It downloads the answers from the internet',
                        'It checks how similar the letters in the words look'
                    ],
                    correct: 1,
                    explanation: 'The Embedding layer starts with random numbers and keeps adjusting them during training. Words that appear near each other end up with similar number lists!'
                }
            ]
        });
    },

    // ============================================
    // 7.2: Word2Vec Deep Dive
    // ============================================
    w2vSelectedWord: 2,
    w2vWindowSize: 2,
    w2vTraining: false,

    loadChapter7_2() {
        const container = document.getElementById('chapter-7-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 7 \u2022 Chapter 7.2</span>
                <h1>Word2Vec Deep Dive</h1>
                <p>Word2Vec is the famous trick that taught computers to understand words!
                   It learns by playing a guessing game with words and their neighbors.
                   Let's see how it works -- it has two fun ways to play!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Two Architectures</h2>
                <p>Word2Vec has two ways to play the guessing game. Both help the computer
                   learn what words mean, but they guess in opposite directions:</p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
                    <div class="feature-card" style="padding:20px;">
                        <h3 style="color:#6366f1;margin-bottom:10px;">Skip-gram</h3>
                        <div class="network-viz" style="margin:10px 0;">
                            <canvas id="skipgramCanvas" width="340" height="200"></canvas>
                        </div>
                        <p style="font-size:13px;color:var(--text-secondary);">
                            Given one word in the middle, guess the words around it!
                            Think of it like: "I say 'cat', can you guess what other words are nearby?"
                            Works better for uncommon words.
                        </p>
                    </div>
                    <div class="feature-card" style="padding:20px;">
                        <h3 style="color:#10b981;margin-bottom:10px;">CBOW (Continuous Bag of Words)</h3>
                        <div class="network-viz" style="margin:10px 0;">
                            <canvas id="cbowCanvas" width="340" height="200"></canvas>
                        </div>
                        <p style="font-size:13px;color:var(--text-secondary);">
                            Given the surrounding words, guess the word in the middle!
                            Think of it like: "The words around are 'the' and 'sat'. What goes in the blank?"
                            Faster to learn and good for common words.
                        </p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD0D</span> Context Window Explorer</h2>
                <p>Click on any word below and change how many nearby words we look at.
                   The "window" is like a spotlight -- it shows which neighbor words the computer pays attention to!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Sentence</label>
                        <input type="text" id="w2vSentence" value="The cat sat on the mat"
                               style="background:var(--card-bg);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;color:var(--text-primary);font-size:14px;width:100%;"
                               oninput="Chapter7.updateW2V()">
                    </div>
                    <div class="control-group">
                        <label>Window Size (<span id="w2vWinVal">2</span>)</label>
                        <input type="range" id="w2vWindow" min="1" max="4" value="2" step="1"
                               oninput="Chapter7.updateW2VWindow()">
                    </div>
                </div>

                <div id="w2vWordButtons" style="display:flex;gap:8px;flex-wrap:wrap;margin:16px 0;"></div>

                <div class="network-viz">
                    <canvas id="contextCanvas" width="800" height="280"></canvas>
                </div>

                <div class="step-explanation" id="w2vExplanation">
                    Click a word above and change the window size to see which neighbors light up!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCC9</span> Training Progress Simulation</h2>
                <p>Watch the computer practice! The "loss" number goes down as it gets better.
                   The "similarity score" goes up as it learns which words are friends.
                   It is like watching someone get better at a video game!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="graph-container">
                    <canvas id="w2vTrainCanvas" width="750" height="280"></canvas>
                    <div class="graph-legend">
                        <div class="legend-item active">
                            <span class="legend-dot" style="background:#6366f1;"></span> Training Loss
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background:#10b981;"></span> Word Similarity Score
                        </div>
                    </div>
                </div>

                <div class="gd-stats" id="w2vStats">
                    <div class="gd-stat">
                        <div class="stat-label">Epoch</div>
                        <div class="stat-value" id="w2vEpoch">0</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Loss</div>
                        <div class="stat-value" id="w2vLoss" style="color:#6366f1;">4.000</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Similarity Score</div>
                        <div class="stat-value" id="w2vSim" style="color:#10b981;">0.100</div>
                    </div>
                </div>

                <div class="controls">
                    <button class="btn-primary btn-small" id="w2vTrainBtn" onclick="Chapter7.toggleW2VTraining()">
                        \u25B6 Start Training
                    </button>
                    <button class="btn-secondary btn-small" onclick="Chapter7.resetW2VTraining()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Word2Vec with Gensim</h2>
                <div class="code-block">
<span class="keyword">from</span> gensim.models <span class="keyword">import</span> Word2Vec

<span class="comment"># Get our sentences ready (each sentence is a list of words)</span>
sentences = [
    [<span class="string">"the"</span>, <span class="string">"cat"</span>, <span class="string">"sat"</span>, <span class="string">"on"</span>, <span class="string">"the"</span>, <span class="string">"mat"</span>],
    [<span class="string">"the"</span>, <span class="string">"dog"</span>, <span class="string">"played"</span>, <span class="string">"in"</span>, <span class="string">"the"</span>, <span class="string">"park"</span>],
    <span class="comment"># ... thousands more sentences to practice on!</span>
]

<span class="comment"># Let Word2Vec practice and learn!</span>
model = <span class="function">Word2Vec</span>(
    sentences,
    vector_size=<span class="number">100</span>,    <span class="comment"># Each word gets 100 numbers</span>
    window=<span class="number">5</span>,            <span class="comment"># Look at 5 neighbor words on each side</span>
    min_count=<span class="number">1</span>,        <span class="comment"># Skip super rare words</span>
    sg=<span class="number">1</span>,               <span class="comment"># 1=Skip-gram, 0=CBOW</span>
    epochs=<span class="number">10</span>
)

<span class="comment"># Ask: "What words are most like 'cat'?"</span>
model.wv.<span class="function">most_similar</span>(<span class="string">"cat"</span>, topn=<span class="number">3</span>)
<span class="comment"># [('dog', 0.89), ('kitten', 0.85), ('pet', 0.81)]</span>

<span class="comment"># Word math magic!</span>
result = model.wv.<span class="function">most_similar</span>(
    positive=[<span class="string">"king"</span>, <span class="string">"woman"</span>],
    negative=[<span class="string">"man"</span>]
)
<span class="comment"># [('queen', 0.92), ...]</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter7.startQuiz7_2()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('7-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('7-3')">Next: RNN Text Classification \u2192</button>
            </div>
        `;

        this.w2vSelectedWord = 2;
        this.w2vWindowSize = 2;
        this.w2vTraining = false;
        this.w2vTrainData = { losses: [4.0], similarities: [0.1], epoch: 0 };
        this.drawSkipgram();
        this.drawCBOW();
        this.updateW2V();
        this.resetW2VTraining();
    },

    drawSkipgram() {
        const canvas = document.getElementById('skipgramCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const centerX = 100, centerY = H / 2;
        const contextWords = ['word(t-2)', 'word(t-1)', 'word(t+1)', 'word(t+2)'];
        const contextX = 260;

        // Connections
        contextWords.forEach((_, i) => {
            const cy = 30 + (i * (H - 60)) / (contextWords.length - 1);
            ctx.beginPath();
            ctx.moveTo(centerX + 20, centerY);
            ctx.lineTo(contextX - 20, cy);
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Center word
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('center', centerX, centerY + 3);
        ctx.fillStyle = '#8b95a8';
        ctx.font = '10px Inter';
        ctx.fillText('word(t)', centerX, centerY + 34);

        // Context words
        contextWords.forEach((word, i) => {
            const cy = 30 + (i * (H - 60)) / (contextWords.length - 1);
            ctx.beginPath();
            ctx.arc(contextX, cy, 16, 0, Math.PI * 2);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#8b95a8';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(word, contextX, cy + 30);
        });

        // Arrow label
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('predicts', 180, centerY - 10);
        ctx.fillText('\u2192', 180, centerY + 8);
    },

    drawCBOW() {
        const canvas = document.getElementById('cbowCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const contextX = 80;
        const centerX = 260, centerY = H / 2;
        const contextWords = ['word(t-2)', 'word(t-1)', 'word(t+1)', 'word(t+2)'];

        // Connections
        contextWords.forEach((_, i) => {
            const cy = 30 + (i * (H - 60)) / (contextWords.length - 1);
            ctx.beginPath();
            ctx.moveTo(contextX + 20, cy);
            ctx.lineTo(centerX - 20, centerY);
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Context words
        contextWords.forEach((word, i) => {
            const cy = 30 + (i * (H - 60)) / (contextWords.length - 1);
            ctx.beginPath();
            ctx.arc(contextX, cy, 16, 0, Math.PI * 2);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#8b95a8';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(word, contextX, cy + 30);
        });

        // Center word (target)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('target', centerX, centerY + 3);
        ctx.fillStyle = '#8b95a8';
        ctx.font = '10px Inter';
        ctx.fillText('word(t)', centerX, centerY + 34);

        // Arrow label
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('predicts', 170, centerY - 10);
        ctx.fillText('\u2192', 170, centerY + 8);
    },

    updateW2VWindow() {
        this.w2vWindowSize = parseInt(document.getElementById('w2vWindow')?.value || 2);
        document.getElementById('w2vWinVal').textContent = this.w2vWindowSize;
        this.updateW2V();
    },

    updateW2V() {
        const sentenceInput = document.getElementById('w2vSentence');
        if (!sentenceInput) return;
        const words = sentenceInput.value.trim().split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) return;

        // Clamp selected word index
        if (this.w2vSelectedWord >= words.length) this.w2vSelectedWord = Math.floor(words.length / 2);

        // Render word buttons
        const btnContainer = document.getElementById('w2vWordButtons');
        if (btnContainer) {
            btnContainer.innerHTML = words.map((w, i) => {
                const isCenter = i === this.w2vSelectedWord;
                const isContext = Math.abs(i - this.w2vSelectedWord) > 0 &&
                                  Math.abs(i - this.w2vSelectedWord) <= this.w2vWindowSize;
                let style = 'padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;border:2px solid ';
                if (isCenter) {
                    style += '#6366f1;background:rgba(99,102,241,0.2);color:#a5b4fc;';
                } else if (isContext) {
                    style += '#10b981;background:rgba(16,185,129,0.15);color:#6ee7b7;';
                } else {
                    style += 'rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:var(--text-secondary);';
                }
                return `<div style="${style}" onclick="Chapter7.selectW2VWord(${i})">${w}</div>`;
            }).join('');
        }

        this.drawContextWindow(words);

        const expl = document.getElementById('w2vExplanation');
        if (expl) {
            const center = words[this.w2vSelectedWord];
            const contextIndices = [];
            for (let i = Math.max(0, this.w2vSelectedWord - this.w2vWindowSize);
                     i <= Math.min(words.length - 1, this.w2vSelectedWord + this.w2vWindowSize); i++) {
                if (i !== this.w2vSelectedWord) contextIndices.push(i);
            }
            const contextWords = contextIndices.map(i => `"${words[i]}"`).join(', ');
            expl.innerHTML = `<strong>Center word:</strong> "${center}" | <strong>Context (window=${this.w2vWindowSize}):</strong> ${contextWords || 'none'}` +
                `<br><strong>Skip-gram task:</strong> Given "${center}", predict ${contextWords}` +
                `<br><strong>CBOW task:</strong> Given ${contextWords}, predict "${center}"`;
        }
    },

    selectW2VWord(idx) {
        this.w2vSelectedWord = idx;
        this.updateW2V();
    },

    drawContextWindow(words) {
        const canvas = document.getElementById('contextCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        if (words.length === 0) return;

        const centerIdx = this.w2vSelectedWord;
        const winSize = this.w2vWindowSize;
        const totalWords = words.length;
        const spacing = Math.min(120, (W - 80) / totalWords);
        const startX = (W - spacing * (totalWords - 1)) / 2;
        const baseY = H / 2;

        // Draw context window bracket
        const leftIdx = Math.max(0, centerIdx - winSize);
        const rightIdx = Math.min(totalWords - 1, centerIdx + winSize);
        const bracketLeft = startX + leftIdx * spacing - 30;
        const bracketRight = startX + rightIdx * spacing + 30;
        const bracketTop = baseY - 55;
        const bracketBottom = baseY + 55;

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bracketLeft, bracketTop, bracketRight - bracketLeft, bracketBottom - bracketTop);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.fillRect(bracketLeft, bracketTop, bracketRight - bracketLeft, bracketBottom - bracketTop);

        // Window label
        ctx.fillStyle = '#6366f1';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`window = ${winSize}`, (bracketLeft + bracketRight) / 2, bracketTop - 8);

        // Draw connections from center to context words
        words.forEach((word, i) => {
            if (i === centerIdx) return;
            const dist = Math.abs(i - centerIdx);
            if (dist > 0 && dist <= winSize) {
                const fromX = startX + centerIdx * spacing;
                const toX = startX + i * spacing;
                const cpY = baseY - 60 - (winSize - dist) * 15;

                ctx.beginPath();
                ctx.moveTo(fromX, baseY - 18);
                ctx.quadraticCurveTo((fromX + toX) / 2, cpY, toX, baseY - 18);
                ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        // Draw words
        words.forEach((word, i) => {
            const x = startX + i * spacing;
            const isCenter = i === centerIdx;
            const dist = Math.abs(i - centerIdx);
            const isContext = dist > 0 && dist <= winSize;

            // Circle
            ctx.beginPath();
            ctx.arc(x, baseY, isCenter ? 22 : 18, 0, Math.PI * 2);
            if (isCenter) {
                ctx.fillStyle = '#6366f1';
            } else if (isContext) {
                ctx.fillStyle = '#10b981';
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
            }
            ctx.fill();
            ctx.strokeStyle = isCenter ? '#fff' : 'rgba(255,255,255,0.2)';
            ctx.lineWidth = isCenter ? 2.5 : 1.5;
            ctx.stroke();

            // Word text
            ctx.fillStyle = (isCenter || isContext) ? '#fff' : '#5a6478';
            ctx.font = (isCenter ? 'bold ' : '') + '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(word, x, baseY + 4);

            // Role label below
            if (isCenter) {
                ctx.fillStyle = '#6366f1';
                ctx.font = 'bold 10px Inter';
                ctx.fillText('CENTER', x, baseY + 42);
            } else if (isContext) {
                ctx.fillStyle = '#10b981';
                ctx.font = '10px Inter';
                ctx.fillText('context', x, baseY + 42);
            }

            // Position label
            ctx.fillStyle = '#5a6478';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`t${i - centerIdx >= 0 ? '+' : ''}${i - centerIdx}`, x, baseY + 56);
        });
    },

    // W2V Training simulation
    w2vTrainData: { losses: [4.0], similarities: [0.1], epoch: 0 },

    resetW2VTraining() {
        this.w2vTraining = false;
        this.w2vTrainData = { losses: [4.0], similarities: [0.1], epoch: 0 };
        const btn = document.getElementById('w2vTrainBtn');
        if (btn) btn.textContent = '\u25B6 Start Training';
        this.drawW2VTraining();
        this.updateW2VStats();
    },

    toggleW2VTraining() {
        this.w2vTraining = !this.w2vTraining;
        const btn = document.getElementById('w2vTrainBtn');
        if (btn) btn.textContent = this.w2vTraining ? '\u23F8 Pause' : '\u25B6 Resume';
        if (this.w2vTraining) this.runW2VTraining();
    },

    runW2VTraining() {
        if (!this.w2vTraining || this.w2vTrainData.epoch >= 50) {
            this.w2vTraining = false;
            const btn = document.getElementById('w2vTrainBtn');
            if (btn) btn.textContent = '\u25B6 Start Training';
            return;
        }

        const d = this.w2vTrainData;
        d.epoch++;

        const lastLoss = d.losses[d.losses.length - 1];
        const lastSim = d.similarities[d.similarities.length - 1];

        d.losses.push(Math.max(0.3, lastLoss * 0.93 + (Math.random() - 0.5) * 0.08));
        d.similarities.push(Math.min(0.95, lastSim + (1 - lastSim) * 0.06 + (Math.random() - 0.5) * 0.02));

        this.drawW2VTraining();
        this.updateW2VStats();
        setTimeout(() => this.runW2VTraining(), 200);
    },

    updateW2VStats() {
        const d = this.w2vTrainData;
        const el = id => document.getElementById(id);
        if (el('w2vEpoch')) el('w2vEpoch').textContent = d.epoch;
        if (el('w2vLoss')) el('w2vLoss').textContent = d.losses[d.losses.length - 1].toFixed(3);
        if (el('w2vSim')) el('w2vSim').textContent = d.similarities[d.similarities.length - 1].toFixed(3);
    },

    drawW2VTraining() {
        const canvas = document.getElementById('w2vTrainCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 30, left: 50 };
        ctx.clearRect(0, 0, W, H);

        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;
        const d = this.w2vTrainData;
        const maxEpoch = 50;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + plotH * (i / 4);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }

        const drawLine = (data, color, maxVal) => {
            if (data.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            data.forEach((v, i) => {
                const x = pad.left + (i / maxEpoch) * plotW;
                const y = pad.top + plotH * (1 - v / maxVal);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, Math.max(pad.top, Math.min(pad.top + plotH, y)));
            });
            ctx.stroke();
        };

        drawLine(d.losses, '#6366f1', 5.0);
        drawLine(d.similarities, '#10b981', 1.0);

        // Axis labels
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Epochs', W / 2, H - 5);
        ctx.save();
        ctx.translate(14, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Value', 0, 0);
        ctx.restore();
    },

    startQuiz7_2() {
        Quiz.start({
            title: 'Chapter 7.2: Word2Vec',
            chapterId: '7-2',
            questions: [
                {
                    question: 'In the Skip-gram game, what does the computer start with and what does it try to guess?',
                    options: [
                        'Starts with: neighbor words, Guesses: the middle word',
                        'Starts with: the middle word, Guesses: the neighbor words',
                        'Starts with: a sentence, Guesses: a paragraph',
                        'Starts with: letters, Guesses: words'
                    ],
                    correct: 1,
                    explanation: 'Skip-gram starts with one word in the middle and tries to guess the neighbor words around it. It is like being given "cat" and guessing "the" and "sat" are nearby!'
                },
                {
                    question: 'What does the "window size" control?',
                    options: [
                        'How many numbers each word gets',
                        'How many nearby words we look at on each side',
                        'How many times we practice',
                        'How fast we learn'
                    ],
                    correct: 1,
                    explanation: 'The window size is like a spotlight. A window of 2 means we look at 2 words on the left and 2 words on the right of our center word.'
                },
                {
                    question: 'Which game style is better for learning uncommon words?',
                    options: [
                        'CBOW (guessing the middle word)',
                        'Skip-gram (guessing the neighbors)',
                        'Both are exactly the same',
                        'Neither can learn uncommon words'
                    ],
                    correct: 1,
                    explanation: 'Skip-gram gives each word its own practice rounds, so even rare words get enough chances to learn. CBOW mixes everything together, which is less helpful for uncommon words.'
                },
                {
                    question: 'How does Word2Vec figure out what words mean?',
                    options: [
                        'It looks up words in a dictionary',
                        'It studies how the letters are spelled',
                        'Words that appear near the same neighbors get similar number lists',
                        'A person writes rules for every single word'
                    ],
                    correct: 2,
                    explanation: 'Words that hang out near the same friends tend to mean similar things! "Cat" and "dog" both appear near words like "pet" and "cute," so they end up with similar number lists.'
                }
            ]
        });
    },

    // ============================================
    // 7.3: RNN Text Classification
    // ============================================
    rnnAnimating: false,
    sentimentResult: null,

    loadChapter7_3() {
        const container = document.getElementById('chapter-7-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 7 \u2022 Chapter 7.3</span>
                <h1>RNN Text Classification</h1>
                <p>Recurrent Neural Networks (RNNs) are special because they have a memory!
                   They read words one at a time and remember what came before.
                   This makes them great at understanding sentences, where the order of words matters!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD01</span> How RNNs Process Sequences</h2>
                <p>Imagine reading a story one word at a time. After each word, you remember
                   what happened so far. That memory is called the "hidden state." Watch it flow
                   from word to word below!</p>

                <div class="network-viz">
                    <canvas id="rnnCanvas" width="800" height="300"></canvas>
                </div>

                <div class="step-explanation" id="rnnExplanation">
                    Click "Animate RNN" to watch the memory pass from word to word, like a game of telephone!
                </div>

                <div class="controls">
                    <button class="btn-primary btn-small" onclick="Chapter7.animateRNN()">
                        \u25B6 Animate RNN
                    </button>
                    <button class="btn-secondary btn-small" onclick="Chapter7.resetRNN()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDE00</span> Interactive Sentiment Analyzer</h2>
                <p>Type a sentence and click "Analyze Sentiment" to find out if it sounds
                   happy or sad! The computer reads each word and updates its mood guess.
                   Try different sentences to see what happens!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group" style="flex:1;">
                        <label>Enter a sentence</label>
                        <input type="text" id="sentimentInput" value="This movie was absolutely wonderful and amazing"
                               style="background:var(--card-bg);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;color:var(--text-primary);font-size:14px;width:100%;"
                               onkeydown="if(event.key==='Enter')Chapter7.analyzeSentiment()">
                    </div>
                </div>
                <div class="controls" style="margin-top:8px;">
                    <button class="btn-primary btn-small" onclick="Chapter7.analyzeSentiment()">
                        Analyze Sentiment
                    </button>
                    <button class="btn-secondary btn-small" onclick="document.getElementById('sentimentInput').value='The food was terrible and the service was slow';Chapter7.analyzeSentiment()">
                        Try Negative
                    </button>
                    <button class="btn-secondary btn-small" onclick="document.getElementById('sentimentInput').value='I love this product it works great';Chapter7.analyzeSentiment()">
                        Try Positive
                    </button>
                </div>

                <div id="sentimentResultArea" style="margin-top:16px;display:none;">
                    <div class="network-viz">
                        <canvas id="sentimentCanvas" width="800" height="200"></canvas>
                    </div>
                    <div class="gd-stats" id="sentimentStats">
                        <div class="gd-stat">
                            <div class="stat-label">Positive Score</div>
                            <div class="stat-value" id="posScore" style="color:#10b981;">0.000</div>
                        </div>
                        <div class="gd-stat">
                            <div class="stat-label">Negative Score</div>
                            <div class="stat-value" id="negScore" style="color:#ef4444;">0.000</div>
                        </div>
                        <div class="gd-stat">
                            <div class="stat-label">Verdict</div>
                            <div class="stat-value" id="sentimentVerdict">--</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u26A0\uFE0F</span> The Vanishing Gradient Problem</h2>
                <p>Basic RNNs have a big problem: they forget things from long ago!
                   Imagine trying to remember what you had for breakfast last week --
                   that is how hard it is for an RNN to remember words from far back in a sentence.
                   This is called the <strong>vanishing gradient problem</strong>.</p>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A1</span>
                    <span class="info-box-text">In a long sentence like "The cat, which had been sitting on the warm mat all
                    afternoon, <strong>was</strong> happy" -- a basic RNN might forget about "cat" by the time it gets to
                    "was" because its memory fades over many words. It is like the game of telephone
                    where the message gets garbled!</span>
                </div>

                <h3 style="margin-top:20px;">The Solution: LSTM and GRU</h3>
                <p>Long Short-Term Memory (LSTM) is a special brain that can remember things
                   for a long time! It uses tiny doors called <strong>gates</strong> that decide what to
                   remember and what to forget. Think of them like this:</p>

                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDEAA</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Forget Gate</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Decides what old stuff to throw away. Like cleaning out your backpack!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCE5</div>
                        <div style="font-weight:600;margin:6px 0;color:#3b82f6;">Input Gate</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Decides what new stuff to save. Like putting important notes in your folder!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCE4</div>
                        <div style="font-weight:600;margin:6px 0;color:#10b981;">Output Gate</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Decides what to say out loud. Like choosing which answer to share in class!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE0</span> LSTM Cell Diagram</h2>
                <p>The LSTM cell has two kinds of memory: the <strong>cell state</strong> is like a diary
                   (long-term memory) and the <strong>hidden state</strong> is like a sticky note
                   (short-term memory). The gates control what goes in and out!</p>

                <div class="network-viz">
                    <canvas id="lstmCanvas" width="800" height="350"></canvas>
                </div>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>GRU (Gated Recurrent Unit)</strong> is like a simpler version of LSTM. It only
                    has 2 gates instead of 3. It works almost as well as LSTM on many tasks
                    and is faster to learn because it has fewer parts!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Text Classification with LSTM</h2>
                <div class="code-block">
<span class="keyword">from</span> tensorflow.keras.models <span class="keyword">import</span> Sequential
<span class="keyword">from</span> tensorflow.keras.layers <span class="keyword">import</span> Embedding, LSTM, Dense
<span class="keyword">from</span> tensorflow.keras.layers <span class="keyword">import</span> Bidirectional, Dropout
<span class="keyword">from</span> tensorflow.keras.preprocessing.sequence <span class="keyword">import</span> pad_sequences

<span class="comment"># Settings for our model</span>
vocab_size = <span class="number">10000</span>
max_length = <span class="number">200</span>
embedding_dim = <span class="number">128</span>

<span class="comment"># Build the brain!</span>
model = <span class="function">Sequential</span>([
    <span class="function">Embedding</span>(vocab_size, embedding_dim,
              input_length=max_length),
    <span class="function">Bidirectional</span>(<span class="function">LSTM</span>(<span class="number">64</span>, return_sequences=<span class="keyword">True</span>)),
    <span class="function">Dropout</span>(<span class="number">0.3</span>),
    <span class="function">Bidirectional</span>(<span class="function">LSTM</span>(<span class="number">32</span>)),
    <span class="function">Dense</span>(<span class="number">64</span>, activation=<span class="string">'relu'</span>),
    <span class="function">Dropout</span>(<span class="number">0.5</span>),
    <span class="function">Dense</span>(<span class="number">1</span>, activation=<span class="string">'sigmoid'</span>)  <span class="comment"># Happy or sad? (2 choices)</span>
])

model.<span class="function">compile</span>(
    optimizer=<span class="string">'adam'</span>,
    loss=<span class="string">'binary_crossentropy'</span>,
    metrics=[<span class="string">'accuracy'</span>]
)

<span class="comment"># Make all sentences the same length (add padding)</span>
X_train = <span class="function">pad_sequences</span>(X_train, maxlen=max_length)

<span class="comment"># Let it practice!</span>
model.<span class="function">fit</span>(X_train, y_train,
          epochs=<span class="number">10</span>,
          batch_size=<span class="number">64</span>,
          validation_split=<span class="number">0.2</span>)

<span class="comment"># Gets about 87-90% of movie reviews right! Pretty good!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter7.startQuiz7_3()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('7-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('8-1')">Next: Module 8 \u2192</button>
            </div>
        `;

        this.rnnAnimating = false;
        this.resetRNN();
        this.drawLSTMDiagram();
    },

    // RNN Animation
    rnnWords: ['I', 'love', 'deep', 'learning'],

    resetRNN() {
        this.rnnAnimating = false;
        this.drawRNNUnrolled(-1);
        const expl = document.getElementById('rnnExplanation');
        if (expl) expl.innerHTML = 'Click "Animate RNN" to watch the memory pass from word to word, like a game of telephone!';
    },

    drawRNNUnrolled(activeStep) {
        const canvas = document.getElementById('rnnCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const words = this.rnnWords;
        const numSteps = words.length;
        const spacing = (W - 120) / numSteps;
        const startX = 80;
        const inputY = H - 50;
        const hiddenY = H / 2;
        const outputY = 50;

        // Draw each timestep
        words.forEach((word, i) => {
            const x = startX + i * spacing;
            const active = i <= activeStep;
            const current = i === activeStep;

            // Input node
            ctx.beginPath();
            ctx.arc(x, inputY, 18, 0, Math.PI * 2);
            ctx.fillStyle = active ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)';
            ctx.fill();
            ctx.strokeStyle = active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = active ? '#fff' : '#5a6478';
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(word, x, inputY + 4);

            // Input label
            ctx.fillStyle = '#5a6478';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`x(${i})`, x, inputY + 34);

            // Connection: input -> hidden
            ctx.beginPath();
            ctx.moveTo(x, inputY - 18);
            ctx.lineTo(x, hiddenY + 22);
            ctx.strokeStyle = active ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.1)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Hidden node
            ctx.beginPath();
            ctx.arc(x, hiddenY, 22, 0, Math.PI * 2);
            if (current) {
                ctx.fillStyle = '#fbbf24';
            } else if (active) {
                ctx.fillStyle = '#8b5cf6';
            } else {
                ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
            }
            ctx.fill();
            ctx.strokeStyle = current ? '#fff' : 'rgba(255,255,255,0.2)';
            ctx.lineWidth = current ? 2.5 : 1.5;
            ctx.stroke();

            ctx.fillStyle = active ? '#fff' : '#5a6478';
            ctx.font = 'bold 10px Inter';
            ctx.fillText(`h(${i})`, x, hiddenY + 4);

            // Connection: hidden -> output
            ctx.beginPath();
            ctx.moveTo(x, hiddenY - 22);
            ctx.lineTo(x, outputY + 18);
            ctx.strokeStyle = active ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.1)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Output node
            ctx.beginPath();
            ctx.arc(x, outputY, 18, 0, Math.PI * 2);
            ctx.fillStyle = active ? '#10b981' : 'rgba(16, 185, 129, 0.2)';
            ctx.fill();
            ctx.strokeStyle = active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = active ? '#fff' : '#5a6478';
            ctx.font = 'bold 10px Inter';
            ctx.fillText(`y(${i})`, x, outputY + 4);

            // Recurrent connection (hidden -> next hidden)
            if (i < numSteps - 1) {
                const nextX = startX + (i + 1) * spacing;
                const arrowActive = i < activeStep;

                ctx.beginPath();
                ctx.moveTo(x + 22, hiddenY);
                ctx.lineTo(nextX - 22, hiddenY);
                ctx.strokeStyle = arrowActive ? 'rgba(251, 191, 36, 0.6)' : 'rgba(251, 191, 36, 0.15)';
                ctx.lineWidth = arrowActive ? 2.5 : 1.5;
                ctx.stroke();

                // Arrowhead
                const arrowX = nextX - 22;
                ctx.beginPath();
                ctx.moveTo(arrowX, hiddenY);
                ctx.lineTo(arrowX - 8, hiddenY - 5);
                ctx.lineTo(arrowX - 8, hiddenY + 5);
                ctx.closePath();
                ctx.fillStyle = arrowActive ? 'rgba(251, 191, 36, 0.6)' : 'rgba(251, 191, 36, 0.15)';
                ctx.fill();

                // Label
                if (arrowActive || i === activeStep) {
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = '9px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText('h(t)', (x + nextX) / 2, hiddenY - 12);
                }
            }
        });

        // Labels for rows
        ctx.fillStyle = '#8b95a8';
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('Output', 48, outputY + 4);
        ctx.fillText('Hidden', 48, hiddenY + 4);
        ctx.fillText('Input', 48, inputY + 4);
    },

    animateRNN() {
        if (this.rnnAnimating) return;
        this.rnnAnimating = true;

        let step = -1;
        const words = this.rnnWords;
        const expl = document.getElementById('rnnExplanation');

        const nextStep = () => {
            step++;
            if (step >= words.length) {
                this.rnnAnimating = false;
                if (expl) expl.innerHTML = '<strong>Done!</strong> The final memory h(' + (words.length - 1) + ') ' +
                    'holds a summary of the whole sentence. Now we can use it to decide if the sentence is happy or sad!';
                return;
            }

            this.drawRNNUnrolled(step);

            if (expl) {
                if (step === 0) {
                    expl.innerHTML = `<strong>t=${step}:</strong> Reading the word "${words[step]}" and creating the first memory h(0). ` +
                        `The journey begins!`;
                } else {
                    expl.innerHTML = `<strong>t=${step}:</strong> Reading "${words[step]}" and mixing it with the old memory h(${step - 1}) ` +
                        `to make a new memory h(${step}). The memory keeps growing!`;
                }
            }

            // Animate particle along recurrent connection
            if (step < words.length - 1) {
                this.animateRNNParticle(step, () => {
                    setTimeout(nextStep, 400);
                });
            } else {
                setTimeout(nextStep, 800);
            }
        };

        nextStep();
    },

    animateRNNParticle(fromStep, callback) {
        const canvas = document.getElementById('rnnCanvas');
        if (!canvas) { callback(); return; }
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        const numSteps = this.rnnWords.length;
        const spacing = (W - 120) / numSteps;
        const startX = 80;
        const hiddenY = H / 2;

        const fromX = startX + fromStep * spacing + 22;
        const toX = startX + (fromStep + 1) * spacing - 22;

        let progress = 0;
        const speed = 0.04;

        const animate = () => {
            progress += speed;
            if (progress >= 1) { callback(); return; }

            // Redraw base
            this.drawRNNUnrolled(fromStep);

            // Draw particle
            const px = fromX + (toX - fromX) * progress;
            ctx.beginPath();
            ctx.arc(px, hiddenY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    },

    // Sentiment Analysis
    positiveWords: ['good', 'great', 'amazing', 'wonderful', 'excellent', 'fantastic', 'love', 'best',
                    'happy', 'beautiful', 'perfect', 'awesome', 'brilliant', 'outstanding', 'superb',
                    'nice', 'enjoy', 'pleasant', 'delightful', 'impressive', 'recommend', 'favorite',
                    'fun', 'liked', 'loves', 'loved', 'works', 'helpful', 'easy', 'fast'],
    negativeWords: ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'boring',
                    'ugly', 'disappointing', 'waste', 'slow', 'broken', 'useless', 'annoying',
                    'difficult', 'painful', 'mediocre', 'dull', 'frustrating', 'expensive',
                    'failed', 'wrong', 'sad', 'angry', 'never', 'unfortunately', 'lacks'],
    intensifiers: ['very', 'extremely', 'absolutely', 'really', 'so', 'incredibly', 'totally', 'completely', 'truly'],
    negators: ['not', "n't", 'no', 'never', 'neither', 'nor', 'hardly', 'barely'],

    analyzeSentiment() {
        const input = document.getElementById('sentimentInput');
        if (!input) return;
        const text = input.value.trim().toLowerCase();
        if (text.length === 0) return;

        const words = text.split(/\s+/);
        let posScore = 0;
        let negScore = 0;
        const wordScores = [];
        let negate = false;
        let intensify = false;

        words.forEach((word, i) => {
            // Clean punctuation
            const clean = word.replace(/[^a-z']/g, '');
            let score = 0;

            if (this.negators.some(n => clean.includes(n))) {
                negate = true;
                wordScores.push({ word, score: 0, type: 'negator' });
                return;
            }

            if (this.intensifiers.includes(clean)) {
                intensify = true;
                wordScores.push({ word, score: 0, type: 'intensifier' });
                return;
            }

            if (this.positiveWords.includes(clean)) {
                score = negate ? -0.8 : 0.8;
                if (intensify) score *= 1.5;
            } else if (this.negativeWords.includes(clean)) {
                score = negate ? 0.5 : -0.8;
                if (intensify) score *= 1.5;
            }

            if (score > 0) posScore += score;
            if (score < 0) negScore += Math.abs(score);

            wordScores.push({
                word,
                score,
                type: score > 0 ? 'positive' : (score < 0 ? 'negative' : 'neutral')
            });

            negate = false;
            intensify = false;
        });

        // Normalize
        const total = posScore + negScore;
        if (total > 0) {
            posScore = posScore / total;
            negScore = negScore / total;
        } else {
            posScore = 0.5;
            negScore = 0.5;
        }

        this.sentimentResult = { posScore, negScore, wordScores };

        // Show result area
        document.getElementById('sentimentResultArea').style.display = 'block';
        document.getElementById('posScore').textContent = posScore.toFixed(3);
        document.getElementById('negScore').textContent = negScore.toFixed(3);

        const verdict = document.getElementById('sentimentVerdict');
        if (posScore > 0.6) {
            verdict.textContent = 'Positive';
            verdict.style.color = '#10b981';
        } else if (negScore > 0.6) {
            verdict.textContent = 'Negative';
            verdict.style.color = '#ef4444';
        } else {
            verdict.textContent = 'Neutral';
            verdict.style.color = '#f59e0b';
        }

        this.drawSentimentChart();
    },

    drawSentimentChart() {
        const canvas = document.getElementById('sentimentCanvas');
        if (!canvas || !this.sentimentResult) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const { posScore, negScore, wordScores } = this.sentimentResult;
        const pad = { left: 40, right: 40, top: 30, bottom: 50 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        // Draw word-by-word scores as bars
        const barWidth = Math.min(50, (plotW - 20) / wordScores.length);
        const barGap = (plotW - barWidth * wordScores.length) / (wordScores.length + 1);
        const zeroY = pad.top + plotH / 2;

        // Zero line
        ctx.beginPath();
        ctx.moveTo(pad.left, zeroY);
        ctx.lineTo(W - pad.right, zeroY);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#10b981';
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Positive', pad.left, pad.top + 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('Negative', pad.left, pad.top + plotH);

        wordScores.forEach((ws, i) => {
            const x = pad.left + barGap + i * (barWidth + barGap);
            const maxBarH = plotH / 2 - 10;
            const barH = Math.abs(ws.score) * maxBarH / 1.2;

            if (ws.score > 0) {
                ctx.fillStyle = '#10b981';
                ctx.fillRect(x, zeroY - barH, barWidth, barH);
            } else if (ws.score < 0) {
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x, zeroY, barWidth, barH);
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(x, zeroY - 2, barWidth, 4);
            }

            // Word label
            ctx.save();
            ctx.translate(x + barWidth / 2, H - 8);
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = ws.type === 'positive' ? '#10b981' :
                           (ws.type === 'negative' ? '#ef4444' :
                           (ws.type === 'negator' ? '#f59e0b' :
                           (ws.type === 'intensifier' ? '#8b5cf6' : '#5a6478')));
            ctx.font = '10px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(ws.word, 0, 0);
            ctx.restore();
        });

        // Overall bar at right side
        const summaryX = W - pad.right - 60;
        const summaryW = 40;
        const summaryH = plotH - 20;
        const posH = posScore * summaryH;
        const negH = negScore * summaryH;

        ctx.fillStyle = '#10b981';
        ctx.fillRect(summaryX, pad.top + 10 + (summaryH - posH), summaryW / 2 - 2, posH);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(summaryX + summaryW / 2 + 2, pad.top + 10 + (summaryH - negH), summaryW / 2 - 2, negH);

        ctx.fillStyle = '#8b95a8';
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Overall', summaryX + summaryW / 2, pad.top + 6);
    },

    // LSTM Diagram
    drawLSTMDiagram() {
        const canvas = document.getElementById('lstmCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const cellX = 200, cellY = 80, cellW = 400, cellH = 200;

        // Cell body
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        const radius = 12;
        ctx.beginPath();
        ctx.moveTo(cellX + radius, cellY);
        ctx.lineTo(cellX + cellW - radius, cellY);
        ctx.quadraticCurveTo(cellX + cellW, cellY, cellX + cellW, cellY + radius);
        ctx.lineTo(cellX + cellW, cellY + cellH - radius);
        ctx.quadraticCurveTo(cellX + cellW, cellY + cellH, cellX + cellW - radius, cellY + cellH);
        ctx.lineTo(cellX + radius, cellY + cellH);
        ctx.quadraticCurveTo(cellX, cellY + cellH, cellX, cellY + cellH - radius);
        ctx.lineTo(cellX, cellY + radius);
        ctx.quadraticCurveTo(cellX, cellY, cellX + radius, cellY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(139, 92, 246, 0.05)';
        ctx.fill();
        ctx.stroke();

        // Cell state line (top, horizontal)
        const csY = cellY + 40;
        ctx.beginPath();
        ctx.moveTo(cellX - 60, csY);
        ctx.lineTo(cellX + cellW + 60, csY);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrow on cell state
        ctx.beginPath();
        ctx.moveTo(cellX + cellW + 60, csY);
        ctx.lineTo(cellX + cellW + 48, csY - 6);
        ctx.lineTo(cellX + cellW + 48, csY + 6);
        ctx.closePath();
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Cell State (C_t)', cellX + cellW / 2, csY - 14);

        // Hidden state line (bottom)
        const hsY = cellY + cellH - 40;
        ctx.beginPath();
        ctx.moveTo(cellX - 60, hsY);
        ctx.lineTo(cellX + cellW + 60, hsY);
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cellX + cellW + 60, hsY);
        ctx.lineTo(cellX + cellW + 48, hsY - 6);
        ctx.lineTo(cellX + cellW + 48, hsY + 6);
        ctx.closePath();
        ctx.fillStyle = '#8b5cf6';
        ctx.fill();

        ctx.fillStyle = '#8b5cf6';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('Hidden State (h_t)', cellX + cellW / 2, hsY + 24);

        // Gates
        const gateRadius = 22;
        const gates = [
            { name: 'Forget\nGate', x: cellX + 80, y: (csY + hsY) / 2, color: '#ef4444', symbol: '\u00D7' },
            { name: 'Input\nGate', x: cellX + 200, y: (csY + hsY) / 2, color: '#3b82f6', symbol: '+' },
            { name: 'Output\nGate', x: cellX + 320, y: (csY + hsY) / 2, color: '#10b981', symbol: '\u00D7' }
        ];

        gates.forEach(gate => {
            // Gate circle
            ctx.beginPath();
            ctx.arc(gate.x, gate.y, gateRadius, 0, Math.PI * 2);
            ctx.fillStyle = gate.color;
            ctx.globalAlpha = 0.2;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = gate.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Symbol
            ctx.fillStyle = gate.color;
            ctx.font = 'bold 18px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(gate.symbol, gate.x, gate.y + 6);

            // Connection to cell state (vertical line up)
            ctx.beginPath();
            ctx.moveTo(gate.x, gate.y - gateRadius);
            ctx.lineTo(gate.x, csY);
            ctx.strokeStyle = gate.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Connection to hidden state (vertical line down)
            ctx.beginPath();
            ctx.moveTo(gate.x, gate.y + gateRadius);
            ctx.lineTo(gate.x, hsY);
            ctx.strokeStyle = gate.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Gate label
            ctx.fillStyle = '#e8eaf0';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            const lines = gate.name.split('\n');
            lines.forEach((line, li) => {
                ctx.fillText(line, gate.x, gate.y + gateRadius + 16 + li * 14);
            });
        });

        // Input labels
        ctx.fillStyle = '#8b95a8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('C_(t-1)', cellX - 70, csY + 4);
        ctx.fillText('h_(t-1)', cellX - 70, hsY + 4);

        ctx.textAlign = 'left';
        ctx.fillText('C_t', cellX + cellW + 70, csY + 4);
        ctx.fillText('h_t', cellX + cellW + 70, hsY + 4);

        // Input x_t at bottom
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('x_t (input)', cellX + cellW / 2, cellY + cellH + 30);

        // Arrow from input
        ctx.beginPath();
        ctx.moveTo(cellX + cellW / 2, cellY + cellH + 16);
        ctx.lineTo(cellX + cellW / 2, cellY + cellH);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('LSTM Cell', cellX + cellW / 2, cellY - 16);
    },

    startQuiz7_3() {
        Quiz.start({
            title: 'Chapter 7.3: RNN Text Classification',
            chapterId: '7-3',
            questions: [
                {
                    question: 'What makes RNNs special compared to regular networks?',
                    options: [
                        'They have more layers',
                        'They have a memory that passes from one word to the next',
                        'They only work with pictures',
                        'They do not use any special math'
                    ],
                    correct: 1,
                    explanation: 'RNNs are special because they have a memory! After reading each word, they pass what they remember to the next step, like whispering a secret down a line of friends.'
                },
                {
                    question: 'What is the "vanishing gradient" problem? (Think of it like a memory problem!)',
                    options: [
                        'The computer runs out of storage space',
                        'The learning signal gets weaker and weaker over many steps, so the network forgets old words',
                        'The learning speed becomes too slow',
                        'The computer loses its settings'
                    ],
                    correct: 1,
                    explanation: 'Imagine whispering a message through 100 people. By the end, the message is totally lost! That is what happens to the learning signal in a basic RNN over many words.'
                },
                {
                    question: 'What are the three tiny doors (gates) in an LSTM?',
                    options: [
                        'Open, Close, Toggle',
                        'Forget, Input, Output',
                        'Read, Write, Delete',
                        'Forward, Backward, Skip'
                    ],
                    correct: 1,
                    explanation: 'LSTM has three doors: the Forget door (throws away old stuff), the Input door (saves new stuff), and the Output door (decides what to say). Like cleaning, saving, and sharing!'
                },
                {
                    question: 'How does LSTM fix the forgetting problem?',
                    options: [
                        'By learning faster',
                        'By having a special highway for memories to travel far without fading',
                        'By removing the memory connections',
                        'By using fewer layers'
                    ],
                    correct: 1,
                    explanation: 'Think of it like a conveyor belt at a factory. The cell state lets important memories ride along without getting lost, even across very long sentences!'
                },
                {
                    question: 'What does "Bidirectional" LSTM mean?',
                    options: [
                        'It reads the sentence both forward AND backward, like reading a book from both ends',
                        'It uses two different scoring methods',
                        'It has two memory layers',
                        'It switches between LSTM and GRU'
                    ],
                    correct: 0,
                    explanation: 'A Bidirectional LSTM reads the sentence both ways: left-to-right AND right-to-left! This way it understands both what came before and what comes after each word.'
                }
            ]
        });
    }
};
