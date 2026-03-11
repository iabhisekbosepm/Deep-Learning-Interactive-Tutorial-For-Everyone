/* ============================================
   Chapter 1: Foundation & First Neural Network
   ============================================ */

const Chapter1 = {
    init() {
        App.registerChapter('1-1', () => this.loadChapter1_1());
        App.registerChapter('1-2', () => this.loadChapter1_2());
    },

    // ============================================
    // Chapter 1.1: Hello Neural Networks
    // ============================================
    loadChapter1_1() {
        const container = document.getElementById('chapter-1-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 1 \u2022 Chapter 1.1</span>
                <h1>Hello Neural Networks!</h1>
                <p>Your brain has billions of tiny helpers called neurons that work together.
                   A neural network is a computer that tries to learn the same way -- but much simpler!
                   Let's see one in action and have some fun!</p>
            </div>

            <!-- What is a Neural Network -->
            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE0</span> What is a Neural Network?</h2>
                <p>A neural network is a team of tiny brain helpers (called neurons) that learn by looking
                   at lots of examples. It's just like when you learned what a cat looks like
                   by seeing many different cats!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Think of it like this: Imagine you show your friend 1000 pictures of cats and dogs.
                    Soon, they can tell the difference every time! Neural networks learn the same way, but using numbers and math!</span>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\uD83C\uDFF7\uFE0F</span>
                    <span class="info-box-text"><strong>Real term to remember:</strong> a <strong>neural network</strong> is a mathematical model that learns patterns from examples by adjusting weights and biases.</span>
                </div>

                <h3>The 3 Key Layers</h3>
                <p>Every neural network has:</p>
                <ul style="color: var(--text-secondary); padding-left: 20px; margin-bottom: 16px;">
                    <li><strong style="color: #60a5fa;">Input Layer</strong> -- This is where info goes in (like your eyes seeing a picture)</li>
                    <li><strong style="color: #a78bfa;">Hidden Layers</strong> -- These are the thinkers that find patterns</li>
                    <li><strong style="color: #34d399;">Output Layer</strong> -- This is where the answer comes out!</li>
                </ul>

                <div class="network-viz">
                    <canvas id="networkCanvas" width="800" height="300"></canvas>
                </div>
                <div class="text-center">
                    <button class="btn-secondary btn-small" onclick="Chapter1.animateNetwork()">
                        \u25B6 Animate Data Flow
                    </button>
                </div>
            </div>

            <!-- Interactive: Draw & Predict -->
            <div class="section">
                <h2><span class="section-icon">\u270D\uFE0F</span> Draw a Digit</h2>
                <p>Draw a number (0-9) below and watch the computer guess what you drew!
                   This is how a neural network trained on a big collection of handwritten numbers works.</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="draw-area">
                    <div>
                        <div class="draw-canvas-wrap">
                            <canvas id="drawCanvas" width="280" height="280"></canvas>
                        </div>
                        <div class="canvas-toolbar">
                            <button class="btn-secondary btn-small" onclick="Chapter1.clearCanvas()">Clear</button>
                            <button class="btn-primary btn-small" onclick="Chapter1.predictDigit()">Predict!</button>
                        </div>
                    </div>
                    <div>
                        <h3>Prediction</h3>
                        <div class="prediction-results" id="predictionResults">
                            ${[0,1,2,3,4,5,6,7,8,9].map(i => `
                                <div class="prediction-bar">
                                    <div class="bar-container">
                                        <div class="bar-fill" id="bar-${i}" style="height: 0%"></div>
                                    </div>
                                    <div class="label">${i}</div>
                                    <div class="confidence" id="conf-${i}">0%</div>
                                </div>
                            `).join('')}
                        </div>
                        <div id="predictionMessage" class="info-box success hidden">
                            <span class="info-box-icon">\uD83C\uDF89</span>
                            <span class="info-box-text" id="predictionText"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="section">
                <h2><span class="section-icon">\u2699\uFE0F</span> How Does It Actually Work?</h2>
                <p>Here's the fun part -- this is what happens step by step when you draw a number:</p>

                <div class="code-block">
<span class="comment"># Step 1: Your drawing turns into a tiny grid of numbers (like graph paper!)</span>
image = [[0, 0, 128, 255, 255, 128, 0, ...], ...]  <span class="comment"># 784 little squares</span>

<span class="comment"># Step 2: Each square's number goes into the input layer</span>
input_layer = flatten(image)  <span class="comment"># [0, 0, 128, 255, ...]</span>

<span class="comment"># Step 3: The hidden helpers use importance scores (weights) and a little extra push (bias)</span>
hidden = <span class="function">activation</span>(weights @ input_layer + bias)

<span class="comment"># Step 4: Picking the best answer -- each digit gets a confidence score!</span>
output = <span class="function">softmax</span>(hidden)  <span class="comment"># [0.01, 0.02, 0.95, ...]</span>

<span class="comment"># Step 5: The highest score wins!</span>
prediction = <span class="function">argmax</span>(output)  <span class="comment"># 2</span>
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A1</span>
                    <span class="info-box-text">The secret sauce is the <strong>importance scores (weights)</strong>! Think of it like this:
                    imagine asking all your friends for their opinion. You trust some friends more than others.
                    The network learns who to trust by practicing over and over, learning from mistakes step by step.
                    We'll see how in Chapter 2.5!</span>
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <p>Cool! Let's see how much you remember. Ready for a quick quiz?</p>
                <span class="tag tag-quiz">Quiz \u2022 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter1.startQuiz1_1()">
                        Start Quiz \u2192
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="chapter-nav">
                <div></div>
                <button class="btn-primary" onclick="App.navigateTo('1-2')">
                    Next: Fashion Detective \u2192
                </button>
            </div>
        `;

        this.initDrawCanvas();
        this.drawNetwork();
    },

    // ---- Network Visualization ----
    networkAnimating: false,

    drawNetwork() {
        const canvas = document.getElementById('networkCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        const layers = [
            { name: 'Input', nodes: 6, color: '#3b82f6', x: 100 },
            { name: 'Hidden 1', nodes: 8, color: '#8b5cf6', x: 300 },
            { name: 'Hidden 2', nodes: 6, color: '#a855f7', x: 500 },
            { name: 'Output', nodes: 4, color: '#10b981', x: 700 }
        ];

        // Draw connections
        for (let l = 0; l < layers.length - 1; l++) {
            const from = layers[l];
            const to = layers[l + 1];
            for (let i = 0; i < from.nodes; i++) {
                for (let j = 0; j < to.nodes; j++) {
                    const y1 = (H / (from.nodes + 1)) * (i + 1);
                    const y2 = (H / (to.nodes + 1)) * (j + 1);
                    ctx.beginPath();
                    ctx.moveTo(from.x, y1);
                    ctx.lineTo(to.x, y2);
                    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        layers.forEach(layer => {
            for (let i = 0; i < layer.nodes; i++) {
                const y = (H / (layer.nodes + 1)) * (i + 1);
                ctx.beginPath();
                ctx.arc(layer.x, y, 14, 0, Math.PI * 2);
                ctx.fillStyle = layer.color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Label
            ctx.fillStyle = '#8b95a8';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(layer.name, layer.x, H - 10);
        });
    },

    animateNetwork() {
        if (this.networkAnimating) return;
        this.networkAnimating = true;

        const canvas = document.getElementById('networkCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        const layers = [
            { nodes: 6, x: 100 },
            { nodes: 8, x: 300 },
            { nodes: 6, x: 500 },
            { nodes: 4, x: 700 }
        ];

        let particles = [];
        let layerIdx = 0;

        const createParticles = (fromLayer, toLayer) => {
            for (let i = 0; i < fromLayer.nodes; i++) {
                const y1 = (H / (fromLayer.nodes + 1)) * (i + 1);
                const targetNode = Math.floor(Math.random() * toLayer.nodes);
                const y2 = (H / (toLayer.nodes + 1)) * (targetNode + 1);
                particles.push({
                    x: fromLayer.x, y: y1,
                    tx: toLayer.x, ty: y2,
                    progress: 0,
                    speed: 0.015 + Math.random() * 0.01
                });
            }
        };

        createParticles(layers[0], layers[1]);

        const animate = () => {
            this.drawNetwork();

            // Draw particles
            let allDone = true;
            particles.forEach(p => {
                p.progress += p.speed;
                if (p.progress < 1) {
                    allDone = false;
                    const x = p.x + (p.tx - p.x) * p.progress;
                    const y = p.y + (p.ty - p.y) * p.progress;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#fbbf24';
                    ctx.shadowColor = '#fbbf24';
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

            if (allDone) {
                layerIdx++;
                if (layerIdx < layers.length - 1) {
                    particles = [];
                    createParticles(layers[layerIdx], layers[layerIdx + 1]);
                    requestAnimationFrame(animate);
                } else {
                    this.networkAnimating = false;
                    this.drawNetwork();
                }
            } else {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    // ---- Drawing Canvas ----
    drawCtx: null,
    isDrawing: false,

    initDrawCanvas() {
        const canvas = document.getElementById('drawCanvas');
        if (!canvas) return;
        this.drawCtx = canvas.getContext('2d');
        this.drawCtx.fillStyle = '#000';
        this.drawCtx.fillRect(0, 0, 280, 280);
        this.drawCtx.lineCap = 'round';
        this.drawCtx.lineJoin = 'round';

        canvas.addEventListener('mousedown', (e) => this.startDraw(e));
        canvas.addEventListener('mousemove', (e) => this.draw(e));
        canvas.addEventListener('mouseup', () => this.isDrawing = false);
        canvas.addEventListener('mouseleave', () => this.isDrawing = false);

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDraw(e.touches[0]);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        canvas.addEventListener('touchend', () => this.isDrawing = false);
    },

    startDraw(e) {
        this.isDrawing = true;
        const rect = document.getElementById('drawCanvas').getBoundingClientRect();
        const scaleX = 280 / rect.width;
        const scaleY = 280 / rect.height;
        this.drawCtx.beginPath();
        this.drawCtx.moveTo(
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY
        );
    },

    draw(e) {
        if (!this.isDrawing) return;
        const rect = document.getElementById('drawCanvas').getBoundingClientRect();
        const scaleX = 280 / rect.width;
        const scaleY = 280 / rect.height;
        this.drawCtx.strokeStyle = '#fff';
        this.drawCtx.lineWidth = 18;
        this.drawCtx.lineTo(
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY
        );
        this.drawCtx.stroke();
    },

    clearCanvas() {
        if (!this.drawCtx) return;
        this.drawCtx.fillStyle = '#000';
        this.drawCtx.fillRect(0, 0, 280, 280);

        // Clear predictions
        for (let i = 0; i < 10; i++) {
            document.getElementById(`bar-${i}`).style.height = '0%';
            document.getElementById(`bar-${i}`).className = 'bar-fill';
            document.getElementById(`conf-${i}`).textContent = '0%';
        }
        document.getElementById('predictionMessage').classList.add('hidden');
    },

    predictDigit() {
        // Lightweight deterministic classifier for consistent demo behavior
        const canvas = document.getElementById('drawCanvas');
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, 280, 280);
        const features = this.extractDigitFeatures(imageData);
        if (!features) {
            App.showToast('Draw something!', 'Please draw a digit first');
            return;
        }

        const scores = this.generatePrediction(features);

        // Animate the bars
        const maxScore = Math.max(...scores);
        const predictedDigit = scores.indexOf(maxScore);

        scores.forEach((score, i) => {
            const percent = Math.round(score * 100);
            const bar = document.getElementById(`bar-${i}`);
            const conf = document.getElementById(`conf-${i}`);

            setTimeout(() => {
                bar.style.height = `${percent}%`;
                bar.className = `bar-fill ${i === predictedDigit ? 'top' : ''}`;
                conf.textContent = `${percent}%`;
            }, i * 50);
        });

        // Show message
        setTimeout(() => {
            const msg = document.getElementById('predictionMessage');
            const text = document.getElementById('predictionText');
            msg.classList.remove('hidden');
            text.textContent = `The neural network thinks you drew a ${predictedDigit} with ${Math.round(maxScore * 100)}% confidence!`;
        }, 600);
    },

    extractDigitFeatures(imageData) {
        const src = imageData.data;
        const gridSize = 28;
        const block = 10;
        const grid = Array.from({ length: gridSize }, () => new Array(gridSize).fill(0));

        for (let gy = 0; gy < gridSize; gy++) {
            for (let gx = 0; gx < gridSize; gx++) {
                let sum = 0;
                for (let y = gy * block; y < (gy + 1) * block; y++) {
                    for (let x = gx * block; x < (gx + 1) * block; x++) {
                        sum += src[(y * 280 + x) * 4];
                    }
                }
                grid[gy][gx] = (sum / (block * block * 255)) > 0.16 ? 1 : 0;
            }
        }

        let minX = gridSize, minY = gridSize, maxX = -1, maxY = -1;
        let total = 0;
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (!grid[y][x]) continue;
                total++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        if (total < 12) return null;

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const area = width * height;
        const aspect = width / Math.max(height, 1);
        const density = total / Math.max(area, 1);

        const regions = new Array(9).fill(0);
        let left = 0, midCol = 0, right = 0;
        let top = 0, midRow = 0, bottom = 0;

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (!grid[y][x]) continue;
                const nx = (x - minX) / Math.max(width - 1, 1);
                const ny = (y - minY) / Math.max(height - 1, 1);
                const gx = Math.min(Math.floor(nx * 3), 2);
                const gy = Math.min(Math.floor(ny * 3), 2);
                regions[gy * 3 + gx] += 1;

                if (nx < 0.33) left++;
                else if (nx < 0.66) midCol++;
                else right++;

                if (ny < 0.33) top++;
                else if (ny < 0.66) midRow++;
                else bottom++;
            }
        }

        const normalize = (v) => v / Math.max(total, 1);
        const normRegions = regions.map(normalize);
        const holeCount = this.countDigitHoles(grid, minX, minY, maxX, maxY);

        return {
            aspect,
            density,
            holes: holeCount,
            regions: normRegions,
            top: normalize(top),
            middle: normalize(midRow),
            bottom: normalize(bottom),
            left: normalize(left),
            center: normalize(midCol),
            right: normalize(right)
        };
    },

    countDigitHoles(grid, minX, minY, maxX, maxY) {
        const w = (maxX - minX + 1) + 2;
        const h = (maxY - minY + 1) + 2;
        const bg = Array.from({ length: h }, () => new Array(w).fill(0));
        const seen = Array.from({ length: h }, () => new Array(w).fill(false));

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const gx = minX + x - 1;
                const gy = minY + y - 1;
                const outside = gx < minX || gx > maxX || gy < minY || gy > maxY;
                bg[y][x] = outside ? 1 : (grid[gy][gx] ? 0 : 1);
            }
        }

        const q = [[0, 0]];
        seen[0][0] = true;
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        while (q.length) {
            const [x, y] = q.pop();
            for (const [dx, dy] of dirs) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                if (seen[ny][nx] || bg[ny][nx] === 0) continue;
                seen[ny][nx] = true;
                q.push([nx, ny]);
            }
        }

        let holes = 0;
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                if (bg[y][x] === 0 || seen[y][x]) continue;
                holes++;
                const stack = [[x, y]];
                seen[y][x] = true;
                while (stack.length) {
                    const [cx, cy] = stack.pop();
                    for (const [dx, dy] of dirs) {
                        const nx = cx + dx, ny = cy + dy;
                        if (nx <= 0 || ny <= 0 || nx >= w - 1 || ny >= h - 1) continue;
                        if (seen[ny][nx] || bg[ny][nx] === 0) continue;
                        seen[ny][nx] = true;
                        stack.push([nx, ny]);
                    }
                }
            }
        }
        return holes;
    },

    scoreHit(condition, weight) {
        return condition ? weight : 0;
    },

    generatePrediction(features) {
        const r = features.regions;
        const scores = new Array(10).fill(0.05);

        const topRow = r[0] + r[1] + r[2];
        const midRow = r[3] + r[4] + r[5];
        const bottomRow = r[6] + r[7] + r[8];
        const leftCol = r[0] + r[3] + r[6];
        const rightCol = r[2] + r[5] + r[8];
        const centerMass = r[4];

        // 0
        scores[0] += this.scoreHit(features.holes >= 1, 0.9);
        scores[0] += this.scoreHit(centerMass < 0.17, 0.25);
        scores[0] += this.scoreHit(Math.abs(leftCol - rightCol) < 0.16, 0.25);
        scores[0] += this.scoreHit(Math.abs(topRow - bottomRow) < 0.18, 0.15);

        // 1
        scores[1] += this.scoreHit(features.aspect < 0.55, 0.8);
        scores[1] += this.scoreHit(features.center > 0.42, 0.4);
        scores[1] += this.scoreHit(features.holes === 0, 0.15);

        // 2
        scores[2] += this.scoreHit(topRow > 0.33 && bottomRow > 0.28, 0.45);
        scores[2] += this.scoreHit(rightCol > leftCol, 0.25);
        scores[2] += this.scoreHit(features.holes === 0, 0.2);
        scores[2] += this.scoreHit(midRow > 0.2, 0.2);

        // 3
        scores[3] += this.scoreHit(topRow > 0.28 && bottomRow > 0.24, 0.35);
        scores[3] += this.scoreHit(rightCol > leftCol + 0.08, 0.5);
        scores[3] += this.scoreHit(features.holes === 0, 0.2);
        scores[3] += this.scoreHit(midRow > 0.2, 0.2);

        // 4
        scores[4] += this.scoreHit(midRow > 0.28, 0.45);
        scores[4] += this.scoreHit(rightCol > 0.34, 0.35);
        scores[4] += this.scoreHit(r[0] > 0.08 || r[3] > 0.1, 0.2);
        scores[4] += this.scoreHit(bottomRow < 0.3, 0.15);

        // 5
        scores[5] += this.scoreHit(topRow > 0.3 && bottomRow > 0.24, 0.4);
        scores[5] += this.scoreHit(leftCol > rightCol * 0.8, 0.25);
        scores[5] += this.scoreHit(midRow > 0.18, 0.2);
        scores[5] += this.scoreHit(features.holes === 0, 0.2);

        // 6
        scores[6] += this.scoreHit(features.holes >= 1, 0.5);
        scores[6] += this.scoreHit(leftCol > rightCol * 0.9, 0.25);
        scores[6] += this.scoreHit(bottomRow > topRow, 0.25);
        scores[6] += this.scoreHit(r[6] > r[2], 0.2);

        // 7
        scores[7] += this.scoreHit(topRow > 0.36, 0.65);
        scores[7] += this.scoreHit(features.holes === 0, 0.2);
        scores[7] += this.scoreHit(rightCol > leftCol + 0.08, 0.4);
        scores[7] += this.scoreHit(bottomRow < 0.28, 0.25);
        scores[7] += this.scoreHit(r[0] > 0.08 && r[8] > 0.06, 0.2);

        // 8
        scores[8] += this.scoreHit(features.holes >= 2, 1.2);
        scores[8] += this.scoreHit(features.holes === 1, 0.35);
        scores[8] += this.scoreHit(centerMass > 0.15, 0.25);
        scores[8] += this.scoreHit(Math.abs(leftCol - rightCol) < 0.12, 0.2);

        // 9
        scores[9] += this.scoreHit(features.holes >= 1, 0.55);
        scores[9] += this.scoreHit(topRow > bottomRow, 0.3);
        scores[9] += this.scoreHit(rightCol > leftCol, 0.3);
        scores[9] += this.scoreHit(r[2] > r[6], 0.2);

        // Normalize with softmax for percentage-style confidence output
        const maxS = Math.max(...scores);
        const expScores = scores.map((s) => Math.exp((s - maxS) * 3.5));
        const sumExp = expScores.reduce((a, b) => a + b, 0);
        return expScores.map((s) => s / sumExp);
    },

    // ---- Quiz 1.1 ----
    startQuiz1_1() {
        Quiz.start({
            title: 'Chapter 1.1: Neural Networks Basics',
            chapterId: '1-1',
            questions: [
                {
                    question: 'What are the three main groups in a neural network?',
                    options: [
                        'Input, Hidden, Output',
                        'Start, Middle, End',
                        'Data, Process, Result',
                        'Front, Core, Back'
                    ],
                    correct: 0,
                    explanation: 'A neural network has three groups: the Input layer (where info goes in), Hidden layers (the thinkers that find patterns), and the Output layer (where the answer comes out)!'
                },
                {
                    question: 'What is MNIST? (Hint: it is a big collection of something!)',
                    options: [
                        'Photos of animals',
                        'Handwritten numbers (0-9)',
                        'Audio recordings',
                        'Text documents'
                    ],
                    correct: 1,
                    explanation: 'MNIST is a big collection of 70,000 handwritten numbers! Each one is a tiny picture. It is like the first practice exercise for neural networks.'
                },
                {
                    question: 'How does a neural network learn?',
                    options: [
                        'By memorizing every single example perfectly',
                        'By changing its importance scores to make fewer mistakes',
                        'By copying the practice data',
                        'By randomly guessing until it gets lucky'
                    ],
                    correct: 1,
                    explanation: 'Neural networks learn by changing their importance scores (weights) little by little, learning from mistakes each time -- like practicing a sport to get better!'
                },
                {
                    question: 'What does "picking the best answer" (Softmax) do at the end?',
                    options: [
                        'Makes the network faster',
                        'Turns the scores into percentages that add up to 100%',
                        'Removes some brain helpers',
                        'Adds more hidden layers'
                    ],
                    correct: 1,
                    explanation: 'Softmax is like picking the best answer! It turns all the scores into percentages (like 10%, 5%, 85%) that add up to 100%, so you can see how sure the network is.'
                },
                {
                    question: 'If a picture is 28 squares wide and 28 squares tall, how many tiny brain helpers do we need at the start?',
                    options: [
                        '28',
                        '56',
                        '784',
                        '280'
                    ],
                    correct: 2,
                    explanation: '28 times 28 equals 784 squares! Each square needs its own tiny brain helper, so we need 784 of them at the start.'
                }
            ]
        });
    },

    // ============================================
    // Chapter 1.2: Fashion Detective
    // ============================================
    loadChapter1_2() {
        const container = document.getElementById('chapter-1-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 1 \u2022 Chapter 1.2</span>
                <h1>Fashion Detective \uD83D\uDD75\uFE0F</h1>
                <p>Amazing! Now that you know the basics, let's try something even cooler:
                   teaching a computer to recognize clothes! Instead of numbers, we'll show it
                   pictures of shirts, shoes, and bags. Same size pictures, but a bigger challenge!</p>
            </div>

            <!-- Fashion Items -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC57</span> Meet the Fashion Items</h2>
                <p>There are 10 types of clothing to learn. Click each one to find out more!</p>

                <div id="fashionGrid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 20px 0;">
                </div>
                <div id="fashionInfo" class="info-box" style="display: none;">
                    <span class="info-box-icon">\uD83D\uDC4D</span>
                    <span class="info-box-text" id="fashionInfoText"></span>
                </div>
            </div>

            <!-- Build Your Network -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD27</span> Build Your Own Network</h2>
                <p>Now you get to be the builder! Move the sliders to choose how many
                   tiny brain helpers go in each layer. See how your choices change
                   how well the network learns!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Hidden Layer 1 Neurons</label>
                        <input type="range" id="layer1Neurons" min="4" max="128" value="64"
                               oninput="Chapter1.updateArchitecture()">
                        <span class="slider-value" id="layer1Value">64</span>
                    </div>
                    <div class="control-group">
                        <label>Hidden Layer 2 Neurons</label>
                        <input type="range" id="layer2Neurons" min="0" max="64" value="32"
                               oninput="Chapter1.updateArchitecture()">
                        <span class="slider-value" id="layer2Value">32</span>
                    </div>
                    <div class="control-group">
                        <label>Activation Function</label>
                        <select id="activationSelect" onchange="Chapter1.updateArchitecture()">
                            <option value="relu">ReLU</option>
                            <option value="sigmoid">Sigmoid</option>
                            <option value="tanh">Tanh</option>
                        </select>
                    </div>
                </div>

                <div class="network-viz">
                    <canvas id="fashionNetCanvas" width="800" height="280"></canvas>
                </div>

                <div id="architectureInfo" class="info-box">
                    <span class="info-box-icon">\uD83D\uDCCA</span>
                    <span class="info-box-text" id="archInfoText">
                        Architecture: 784 \u2192 64 \u2192 32 \u2192 10 | Total parameters: ~53,000
                    </span>
                </div>

                <!-- Simulated Training -->
                <h3>Simulated Training</h3>
                <p>Click "Train" to let your network practice and see how many it gets right!</p>
                <div class="controls">
                    <button class="btn-primary btn-small" id="trainBtn" onclick="Chapter1.simulateTraining()">
                        \u25B6 Train Model
                    </button>
                    <span id="trainingStatus" style="color: var(--text-muted); font-size: 14px;"></span>
                </div>

                <div class="graph-container" id="trainingGraph" style="display: none;">
                    <canvas id="trainingCanvas" width="750" height="250"></canvas>
                    <div class="graph-legend">
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #6366f1;"></span>
                            Training Loss
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #10b981;"></span>
                            Accuracy
                        </div>
                    </div>
                </div>
            </div>

            <!-- Key Takeaway -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCDD</span> Key Takeaways</h2>
                <ul style="color: var(--text-secondary); padding-left: 20px; line-height: 2;">
                    <li>More brain helpers does NOT always mean better! (The network might just memorize answers instead of actually learning)</li>
                    <li>How you build your network depends on what you want it to do</li>
                    <li>The on/off switch (activation function) you pick changes how well it learns</li>
                    <li>Training is all about finding the right balance -- not too simple, not too complicated!</li>
                </ul>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter1.startQuiz1_2()">
                        Start Quiz \u2192
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('1-1')">
                    \u2190 Previous
                </button>
                <button class="btn-primary" onclick="App.navigateTo('2-1')">
                    Next: Activation Functions \u2192
                </button>
            </div>
        `;

        this.renderFashionGrid();
        this.updateArchitecture();
    },

    // Fashion items grid
    fashionItems: [
        { name: 'T-shirt/Top', icon: '\uD83D\uDC55', difficulty: 'Easy' },
        { name: 'Trouser', icon: '\uD83D\uDC56', difficulty: 'Easy' },
        { name: 'Pullover', icon: '\uD83E\uDDE5', difficulty: 'Medium' },
        { name: 'Dress', icon: '\uD83D\uDC57', difficulty: 'Medium' },
        { name: 'Coat', icon: '\uD83E\uDDE5', difficulty: 'Hard' },
        { name: 'Sandal', icon: '\uD83E\uDE74', difficulty: 'Easy' },
        { name: 'Shirt', icon: '\uD83D\uDC54', difficulty: 'Hard' },
        { name: 'Sneaker', icon: '\uD83D\uDC5F', difficulty: 'Medium' },
        { name: 'Bag', icon: '\uD83D\uDC5C', difficulty: 'Easy' },
        { name: 'Ankle Boot', icon: '\uD83E\uDD7E', difficulty: 'Medium' }
    ],

    renderFashionGrid() {
        const grid = document.getElementById('fashionGrid');
        if (!grid) return;

        grid.innerHTML = this.fashionItems.map((item, i) => `
            <div class="feature-card" style="padding: 16px; cursor: pointer; text-align: center;"
                 onclick="Chapter1.showFashionInfo(${i})">
                <div style="font-size: 32px;">${item.icon}</div>
                <div style="font-size: 12px; font-weight: 600; margin-top: 6px;">${item.name}</div>
                <div style="font-size: 10px; color: var(--text-muted);">Class ${i}</div>
            </div>
        `).join('');
    },

    showFashionInfo(index) {
        const item = this.fashionItems[index];
        const difficulties = { 'Easy': 'easy to classify', 'Medium': 'moderately challenging', 'Hard': 'often confused with similar items' };
        document.getElementById('fashionInfo').style.display = 'flex';
        document.getElementById('fashionInfoText').innerHTML =
            `<strong>${item.name}</strong> (Class ${index}) -- Difficulty: ${item.difficulty}. ` +
            `This item is ${difficulties[item.difficulty]}. ` +
            (item.difficulty === 'Hard' ? 'The network may confuse it with visually similar items.' : 'The network usually handles this well!');
    },

    // Architecture builder
    updateArchitecture() {
        const l1 = parseInt(document.getElementById('layer1Neurons')?.value || 64);
        const l2 = parseInt(document.getElementById('layer2Neurons')?.value || 32);
        const act = document.getElementById('activationSelect')?.value || 'relu';

        document.getElementById('layer1Value').textContent = l1;
        document.getElementById('layer2Value').textContent = l2;

        // Calculate params
        let params = 784 * l1 + l1; // input to layer1
        let archStr = `784 \u2192 ${l1}`;
        if (l2 > 0) {
            params += l1 * l2 + l2;
            archStr += ` \u2192 ${l2}`;
            params += l2 * 10 + 10;
        } else {
            params += l1 * 10 + 10;
        }
        archStr += ` \u2192 10`;

        document.getElementById('archInfoText').innerHTML =
            `Architecture: ${archStr} | Activation: ${act.toUpperCase()} | Total parameters: ~${params.toLocaleString()}`;

        this.drawFashionNetwork(l1, l2);
    },

    drawFashionNetwork(l1, l2) {
        const canvas = document.getElementById('fashionNetCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const layers = [
            { name: 'Input (784)', nodes: Math.min(8, 8), color: '#3b82f6', x: 80 },
            { name: `Hidden 1 (${l1})`, nodes: Math.min(Math.ceil(l1 / 8), 10), color: '#8b5cf6', x: 300 }
        ];
        if (l2 > 0) {
            layers.push({ name: `Hidden 2 (${l2})`, nodes: Math.min(Math.ceil(l2 / 4), 8), color: '#a855f7', x: 500 });
        }
        layers.push({ name: 'Output (10)', nodes: 5, color: '#10b981', x: 720 });

        // Connections
        for (let l = 0; l < layers.length - 1; l++) {
            const from = layers[l], to = layers[l + 1];
            for (let i = 0; i < from.nodes; i++) {
                for (let j = 0; j < to.nodes; j++) {
                    const y1 = (H / (from.nodes + 1)) * (i + 1);
                    const y2 = (H / (to.nodes + 1)) * (j + 1);
                    ctx.beginPath();
                    ctx.moveTo(from.x, y1);
                    ctx.lineTo(to.x, y2);
                    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Nodes
        layers.forEach(layer => {
            for (let i = 0; i < layer.nodes; i++) {
                const y = (H / (layer.nodes + 1)) * (i + 1);
                ctx.beginPath();
                ctx.arc(layer.x, y, 10, 0, Math.PI * 2);
                ctx.fillStyle = layer.color;
                ctx.fill();
            }
            ctx.fillStyle = '#8b95a8';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(layer.name, layer.x, H - 8);
        });
    },

    // Simulated training
    simulateTraining() {
        const btn = document.getElementById('trainBtn');
        const status = document.getElementById('trainingStatus');
        const graphDiv = document.getElementById('trainingGraph');
        const canvas = document.getElementById('trainingCanvas');

        btn.disabled = true;
        graphDiv.style.display = 'block';
        status.textContent = 'Training...';

        const l1 = parseInt(document.getElementById('layer1Neurons').value);
        const l2 = parseInt(document.getElementById('layer2Neurons').value);
        const act = document.getElementById('activationSelect').value;

        // Generate realistic training curves
        const epochs = 20;
        const complexity = (l1 + l2) / 192;
        const actMultiplier = { relu: 1.0, sigmoid: 0.85, tanh: 0.92 }[act];
        const baseAccuracy = 0.65 + complexity * 0.2 * actMultiplier;
        const maxAccuracy = Math.min(0.92, baseAccuracy + 0.15);

        const losses = [];
        const accuracies = [];

        for (let i = 0; i < epochs; i++) {
            const t = i / epochs;
            const loss = 2.0 * Math.exp(-3 * t * actMultiplier) + 0.3 * (1 - complexity) + Math.random() * 0.05;
            const acc = baseAccuracy + (maxAccuracy - baseAccuracy) * (1 - Math.exp(-4 * t)) + Math.random() * 0.02;
            losses.push(loss);
            accuracies.push(Math.min(acc, 0.95));
        }

        // Animate drawing
        let frame = 0;
        const ctx = canvas.getContext('2d');

        const drawFrame = () => {
            if (frame >= epochs) {
                btn.disabled = false;
                status.textContent = `Done! Final accuracy: ${(accuracies[epochs - 1] * 100).toFixed(1)}%`;
                return;
            }

            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const W = canvas.width, H = canvas.height;
            const pad = { top: 20, right: 20, bottom: 30, left: 50 };

            // Grid
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = pad.top + (H - pad.top - pad.bottom) * (i / 4);
                ctx.beginPath();
                ctx.moveTo(pad.left, y);
                ctx.lineTo(W - pad.right, y);
                ctx.stroke();
            }

            // Loss line
            ctx.beginPath();
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            for (let i = 0; i < frame; i++) {
                const x = pad.left + (W - pad.left - pad.right) * (i / (epochs - 1));
                const y = pad.top + (H - pad.top - pad.bottom) * (losses[i] / 2.5);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Accuracy line
            ctx.beginPath();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            for (let i = 0; i < frame; i++) {
                const x = pad.left + (W - pad.left - pad.right) * (i / (epochs - 1));
                const y = pad.top + (H - pad.top - pad.bottom) * (1 - accuracies[i]);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#8b95a8';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Epochs', W / 2, H - 5);
            status.textContent = `Epoch ${frame}/${epochs}...`;

            setTimeout(drawFrame, 150);
        };

        drawFrame();
    },

    // ---- Quiz 1.2 ----
    startQuiz1_2() {
        Quiz.start({
            title: 'Chapter 1.2: Fashion Detective',
            chapterId: '1-2',
            questions: [
                {
                    question: 'How many types of clothing are there in the Fashion dataset?',
                    options: ['5', '10', '20', '100'],
                    correct: 1,
                    explanation: 'There are 10 types of clothes: T-shirt, Trouser, Pullover, Dress, Coat, Sandal, Shirt, Sneaker, Bag, and Ankle Boot. That is a lot to remember!'
                },
                {
                    question: 'What goes wrong if you add way too many brain helpers to a network?',
                    options: [
                        'It always gets smarter',
                        'It might just memorize answers instead of actually learning',
                        'Nothing happens',
                        'The network gets smaller'
                    ],
                    correct: 1,
                    explanation: 'Too many brain helpers can make the network memorize the answers like a cheat sheet, instead of truly learning. Then it does badly on new pictures it has never seen!'
                },
                {
                    question: 'How many tiny squares (pixels) are in one clothing picture?',
                    options: ['28 pixels', '784 pixels', '256 pixels', '1024 pixels'],
                    correct: 1,
                    explanation: 'Each clothing picture is 28 squares wide and 28 squares tall. 28 times 28 = 784 tiny squares, just like the handwritten numbers!'
                },
                {
                    question: 'Which on/off switch (activation function) do most networks use today?',
                    options: ['Sigmoid', 'ReLU', 'Step function', 'Linear'],
                    correct: 1,
                    explanation: 'ReLU is the most popular on/off switch! It is simple and fast. It keeps positive numbers and turns negative numbers to zero.'
                },
                {
                    question: 'What does "training a model" actually mean?',
                    options: [
                        'Writing the computer code',
                        'Changing the importance scores to make fewer mistakes each round of practice',
                        'Collecting pictures',
                        'Testing it on new pictures'
                    ],
                    correct: 1,
                    explanation: 'Training means the network practices over and over (each round is called an epoch). Each time, it changes its importance scores to get a little better, like practicing free throws in basketball!'
                }
            ]
        });
    }
};
