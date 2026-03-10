/* ============================================
   Chapter 6: Computer Vision
   ============================================ */

const Chapter6 = {
    init() {
        App.registerChapter('6-1', () => this.loadChapter6_1());
        App.registerChapter('6-2', () => this.loadChapter6_2());
        App.registerChapter('6-3', () => this.loadChapter6_3());
    },

    // ============================================
    // 6.1: Convolutional Neural Networks
    // ============================================
    convStep: 0,
    convAutoPlaying: false,
    convAnimationId: null,

    loadChapter6_1() {
        const container = document.getElementById('chapter-6-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 6 \u2022 Chapter 6.1</span>
                <h1>Convolutional Neural Networks</h1>
                <p>Cool! Regular AI brains look at every tiny dot in a picture one by one. But CNNs are smarter -- they slide a little magnifying glass across the picture to find patterns like edges, shapes, and textures. It is like how you spot shapes in clouds!</p>
            </div>

            <!-- What is Convolution -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD0D</span> What is Convolution?</h2>
                <p>Imagine sliding a tiny magnifying glass across a picture. At each spot, it looks at a small area and checks for a pattern. It creates a new picture called a <strong>feature map</strong> that highlights where it found those patterns -- like a treasure map showing where the cool stuff is!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Think of it like playing "I Spy" with a small window.
                    You move the window across the whole picture, one spot at a time.
                    Different windows look for different things -- one finds up-and-down lines,
                    another finds side-to-side lines, and another finds corners!</span>
                </div>

                <h3>Key Concepts</h3>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0;">
                    <div class="feature-card" style="padding: 16px; text-align: center;">
                        <div style="font-size: 28px;">\uD83C\uDF10</div>
                        <div style="font-weight: 600; margin: 6px 0;">Kernel</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">A tiny magnifying glass (like 3x3 squares) that looks for one pattern</div>
                    </div>
                    <div class="feature-card" style="padding: 16px; text-align: center;">
                        <div style="font-size: 28px;">\uD83D\uDC63</div>
                        <div style="font-weight: 600; margin: 6px 0;">Stride</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">How many steps the window moves each time (1 step or 2 steps?)</div>
                    </div>
                    <div class="feature-card" style="padding: 16px; text-align: center;">
                        <div style="font-size: 28px;">\uD83D\uDDBC\uFE0F</div>
                        <div style="font-weight: 600; margin: 6px 0;">Padding</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Adding a border of zeros around the edge so nothing gets cut off</div>
                    </div>
                    <div class="feature-card" style="padding: 16px; text-align: center;">
                        <div style="font-size: 28px;">\uD83D\uDCC9</div>
                        <div style="font-weight: 600; margin: 6px 0;">Pooling</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Shrinking the picture by keeping only the most important parts</div>
                    </div>
                </div>
            </div>

            <!-- Interactive Convolution -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Interactive Convolution Visualizer</h2>
                <p>Watch the little 3x3 magnifying glass slide across the 5x5 picture grid. At each spot, it multiplies and adds up numbers to get one answer for the output. It is like a math treasure hunt!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="network-viz">
                    <canvas id="convCanvas" width="800" height="380"></canvas>
                </div>

                <div class="step-explanation" id="convExplanation">
                    Click "Next Step" to begin the convolution operation!
                </div>

                <div class="controls">
                    <button class="btn-secondary btn-small" onclick="Chapter6.resetConv()">Reset</button>
                    <button class="btn-primary btn-small" onclick="Chapter6.nextConvStep()">Next Step \u2192</button>
                    <button class="btn-secondary btn-small" id="convAutoBtn" onclick="Chapter6.autoPlayConv()">Auto Play</button>
                </div>
            </div>

            <!-- CNN Architecture -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFD7\uFE0F</span> CNN Architecture</h2>
                <p>A CNN is built like a layer cake! The first layers find simple things like edges. The middle layers find shapes and textures. The deep layers find whole objects like cats or cars! Each layer builds on what came before.</p>

                <div class="network-viz">
                    <canvas id="cnnArchCanvas" width="800" height="220"></canvas>
                </div>

                <div class="info-box success">
                    <span class="info-box-icon">\u2705</span>
                    <span class="info-box-text">The picture above shows the recipe:
                    <strong>Look for patterns, Wake up, Shrink, Look again, Wake up, Shrink, Flatten, Decide, Answer!</strong>
                    Each step makes the picture smaller but finds cooler and more important patterns!</span>
                </div>
            </div>

            <!-- Stride and Padding -->
            <div class="section">
                <h2><span class="section-icon">\u2699\uFE0F</span> Stride and Padding Explained</h2>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
                    <div class="info-box">
                        <span class="info-box-icon" style="color: #6366f1;">\u25CF</span>
                        <span class="info-box-text">
                            <strong>Stride = 1</strong> (default)<br>
                            The window takes tiny baby steps, moving 1 square at a time. It checks everything carefully! The output is almost the same size.
                        </span>
                    </div>
                    <div class="info-box">
                        <span class="info-box-icon" style="color: #10b981;">\u25CF</span>
                        <span class="info-box-text">
                            <strong>Stride = 2</strong><br>
                            The window takes bigger jumps, skipping every other square. It is faster but the output picture is half the size!
                        </span>
                    </div>
                    <div class="info-box">
                        <span class="info-box-icon" style="color: #f59e0b;">\u25CF</span>
                        <span class="info-box-text">
                            <strong>Valid Padding</strong> (no padding)<br>
                            No extra border added. The output gets smaller because the edges get cut off. A 5x5 picture becomes 3x3!
                        </span>
                    </div>
                    <div class="info-box">
                        <span class="info-box-icon" style="color: #8b5cf6;">\u25CF</span>
                        <span class="info-box-text">
                            <strong>Same Padding</strong><br>
                            We add a border of zeros around the picture like a picture frame. Now the output stays the SAME size as the input! Nothing gets cut off.
                        </span>
                    </div>
                </div>

                <div class="info-box warning mt-16">
                    <span class="info-box-icon">\u26A1</span>
                    <span class="info-box-text">Here is the magic formula to figure out the output size: <code>((Input - Kernel + 2*Padding) / Stride) + 1</code>.
                    For a 32x32 picture with a 3x3 window, stride=1, padding=1: ((32 - 3 + 2) / 1) + 1 = <strong>32x32</strong> (same size! The padding saved us!).</span>
                </div>
            </div>

            <!-- Pooling -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCC9</span> Pooling Layers</h2>
                <p>Pooling is like shrinking a picture by keeping only the best parts! Imagine you have a big photo and you want to make it smaller. <strong>Max Pooling</strong> looks at small groups of pixels and keeps only the biggest (most important) number from each group.</p>

                <div class="network-viz">
                    <canvas id="poolingCanvas" width="800" height="200"></canvas>
                </div>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Max Pooling looks at each little 2x2 group and picks the winner -- the biggest number! This makes the picture half the size but keeps the most important info. It is like picking the best player from each team for an all-star game!</span>
                </div>
            </div>

            <!-- Code Example -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> CNN in Keras/TensorFlow</h2>
                <p>Here's how to build a CNN for image classification:</p>

                <div class="code-block">
<span class="keyword">import</span> tensorflow <span class="keyword">as</span> tf
<span class="keyword">from</span> tensorflow.keras <span class="keyword">import</span> layers, models

<span class="comment"># Build a CNN brain to look at small color pictures</span>
model = models.<span class="function">Sequential</span>([
    <span class="comment"># First pattern-finding layer</span>
    layers.<span class="function">Conv2D</span>(<span class="number">32</span>, (<span class="number">3</span>, <span class="number">3</span>), activation=<span class="string">'relu'</span>,
                 input_shape=(<span class="number">32</span>, <span class="number">32</span>, <span class="number">3</span>)),
    layers.<span class="function">MaxPooling2D</span>((<span class="number">2</span>, <span class="number">2</span>)),

    <span class="comment"># Second pattern-finding layer (finds cooler patterns!)</span>
    layers.<span class="function">Conv2D</span>(<span class="number">64</span>, (<span class="number">3</span>, <span class="number">3</span>), activation=<span class="string">'relu'</span>),
    layers.<span class="function">MaxPooling2D</span>((<span class="number">2</span>, <span class="number">2</span>)),

    <span class="comment"># Third pattern-finding layer (finds the coolest stuff!)</span>
    layers.<span class="function">Conv2D</span>(<span class="number">64</span>, (<span class="number">3</span>, <span class="number">3</span>), activation=<span class="string">'relu'</span>),

    <span class="comment"># Squish everything flat and make a decision</span>
    layers.<span class="function">Flatten</span>(),
    layers.<span class="function">Dense</span>(<span class="number">64</span>, activation=<span class="string">'relu'</span>),
    layers.<span class="function">Dense</span>(<span class="number">10</span>, activation=<span class="string">'softmax'</span>)
])

model.<span class="function">compile</span>(
    optimizer=<span class="string">'adam'</span>,
    loss=<span class="string">'sparse_categorical_crossentropy'</span>,
    metrics=[<span class="string">'accuracy'</span>]
)

model.<span class="function">summary</span>()
<span class="comment"># Only ~93,000 numbers to learn (way less than a regular brain!)</span>
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A0\uFE0F</span>
                    <span class="info-box-text">A regular AI brain would need over 200,000 numbers just for the first layer of a tiny 32x32 picture! But a CNN reuses the same little magnifying glass everywhere, so it only needs about 93,000 numbers total. Way more efficient -- like using one cookie cutter for the whole batch instead of carving each cookie by hand!</span>
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <p>Let's see what you learned about how AIs look at pictures!</p>
                <span class="tag tag-quiz">Quiz \u2022 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter6.startQuiz6_1()">
                        Start Quiz \u2192
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('5-4')">
                    \u2190 Previous
                </button>
                <button class="btn-primary" onclick="App.navigateTo('6-2')">
                    Next: Data Augmentation \u2192
                </button>
            </div>
        `;

        this.resetConv();
        this.drawCNNArchitecture();
        this.drawPoolingDiagram();
    },

    // ---- Convolution Data ----
    convInput: [
        [1, 0, 1, 2, 1],
        [0, 1, 2, 0, 0],
        [2, 2, 0, 1, 1],
        [1, 0, 1, 0, 2],
        [0, 1, 2, 1, 0]
    ],
    convKernel: [
        [1, 0, -1],
        [1, 0, -1],
        [1, 0, -1]
    ],
    convOutput: [],
    convPositions: [],

    resetConv() {
        this.convStep = 0;
        this.convAutoPlaying = false;
        if (this.convAnimationId) {
            clearTimeout(this.convAnimationId);
            this.convAnimationId = null;
        }
        const btn = document.getElementById('convAutoBtn');
        if (btn) btn.textContent = 'Auto Play';

        // Calculate all positions (stride=1, no padding => 3x3 output)
        this.convPositions = [];
        for (let r = 0; r <= 2; r++) {
            for (let c = 0; c <= 2; c++) {
                this.convPositions.push({ row: r, col: c });
            }
        }
        this.convOutput = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.drawConv();
        const el = document.getElementById('convExplanation');
        if (el) el.innerHTML = 'Click "Next Step" to begin the convolution operation!';
    },

    nextConvStep() {
        if (this.convStep >= 9) {
            this.resetConv();
            return;
        }

        const pos = this.convPositions[this.convStep];
        const r = pos.row, c = pos.col;

        // Compute convolution at this position
        let sum = 0;
        const parts = [];
        for (let kr = 0; kr < 3; kr++) {
            for (let kc = 0; kc < 3; kc++) {
                const inputVal = this.convInput[r + kr][c + kc];
                const kernelVal = this.convKernel[kr][kc];
                const product = inputVal * kernelVal;
                sum += product;
                if (kernelVal !== 0) {
                    parts.push(`${inputVal}\u00D7${kernelVal >= 0 ? '' : '('}${kernelVal}${kernelVal >= 0 ? '' : ')'}`);
                }
            }
        }

        const outR = r;
        const outC = c;
        this.convOutput[outR][outC] = sum;

        this.drawConv(r, c);

        const expl = document.getElementById('convExplanation');
        if (expl) {
            expl.innerHTML = `<strong>Step ${this.convStep + 1}/9:</strong> Kernel at position (${r}, ${c})<br>` +
                `Calculation: ${parts.join(' + ')} = <strong>${sum}</strong> \u2192 Output[${outR}][${outC}]`;
        }

        this.convStep++;
    },

    autoPlayConv() {
        if (this.convAutoPlaying) {
            this.convAutoPlaying = false;
            if (this.convAnimationId) {
                clearTimeout(this.convAnimationId);
                this.convAnimationId = null;
            }
            const btn = document.getElementById('convAutoBtn');
            if (btn) btn.textContent = 'Auto Play';
            return;
        }

        this.resetConv();
        this.convAutoPlaying = true;
        const btn = document.getElementById('convAutoBtn');
        if (btn) btn.textContent = 'Stop';

        const step = () => {
            if (!this.convAutoPlaying || this.convStep >= 9) {
                this.convAutoPlaying = false;
                const btn = document.getElementById('convAutoBtn');
                if (btn) btn.textContent = 'Auto Play';
                return;
            }
            this.nextConvStep();
            this.convAnimationId = setTimeout(step, 800);
        };
        this.convAnimationId = setTimeout(step, 400);
    },

    drawConv(highlightRow, highlightCol) {
        const canvas = document.getElementById('convCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const cellSize = 48;
        const gap = 4;

        // Input grid position
        const inputX = 40;
        const inputY = 60;

        // Kernel position
        const kernelX = 340;
        const kernelY = 100;

        // Output position
        const outputX = 580;
        const outputY = 100;

        // Labels
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Input (5\u00D75)', inputX + (cellSize * 5 + gap * 4) / 2, inputY - 20);
        ctx.fillText('Kernel (3\u00D73)', kernelX + (cellSize * 3 + gap * 2) / 2, kernelY - 20);
        ctx.fillText('Output (3\u00D73)', outputX + (cellSize * 3 + gap * 2) / 2, outputY - 20);

        // Operator labels
        ctx.fillStyle = '#8b95a8';
        ctx.font = 'bold 24px Inter';
        ctx.fillText('\u2217', 310, 190);
        ctx.fillText('=', 550, 190);

        // Draw input grid
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const x = inputX + c * (cellSize + gap);
                const y = inputY + r * (cellSize + gap);

                let isHighlighted = false;
                if (highlightRow !== undefined && highlightCol !== undefined) {
                    if (r >= highlightRow && r < highlightRow + 3 &&
                        c >= highlightCol && c < highlightCol + 3) {
                        isHighlighted = true;
                    }
                }

                ctx.fillStyle = isHighlighted ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)';
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = isHighlighted ? '#6366f1' : 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = isHighlighted ? 2 : 1;
                ctx.strokeRect(x, y, cellSize, cellSize);

                ctx.fillStyle = isHighlighted ? '#e8eaf0' : '#8b95a8';
                ctx.font = 'bold 16px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.convInput[r][c].toString(), x + cellSize / 2, y + cellSize / 2);
            }
        }

        // Draw kernel
        const kernelColors = { '-1': '#ef4444', '0': '#6b7280', '1': '#10b981' };
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const x = kernelX + c * (cellSize + gap);
                const y = kernelY + r * (cellSize + gap);
                const val = this.convKernel[r][c];

                ctx.fillStyle = val > 0 ? 'rgba(16, 185, 129, 0.2)' :
                                val < 0 ? 'rgba(239, 68, 68, 0.2)' :
                                'rgba(255, 255, 255, 0.05)';
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = val > 0 ? '#10b981' : val < 0 ? '#ef4444' : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, y, cellSize, cellSize);

                ctx.fillStyle = kernelColors[val.toString()] || '#8b95a8';
                ctx.font = 'bold 16px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(val.toString(), x + cellSize / 2, y + cellSize / 2);
            }
        }

        // Draw output grid
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const x = outputX + c * (cellSize + gap);
                const y = outputY + r * (cellSize + gap);
                const val = this.convOutput[r][c];

                const isCurrent = (highlightRow !== undefined && r === highlightRow && c === highlightCol);

                ctx.fillStyle = val !== null ?
                    (isCurrent ? 'rgba(251, 191, 36, 0.3)' : 'rgba(99, 102, 241, 0.15)') :
                    'rgba(255, 255, 255, 0.03)';
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = isCurrent ? '#fbbf24' :
                    (val !== null ? '#6366f1' : 'rgba(255,255,255,0.1)');
                ctx.lineWidth = isCurrent ? 2.5 : 1;
                ctx.strokeRect(x, y, cellSize, cellSize);

                if (val !== null) {
                    ctx.fillStyle = isCurrent ? '#fbbf24' : '#e8eaf0';
                    ctx.font = 'bold 16px JetBrains Mono';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(val.toString(), x + cellSize / 2, y + cellSize / 2);
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.font = '14px JetBrains Mono';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('?', x + cellSize / 2, y + cellSize / 2);
                }
            }
        }

        // Description under kernel
        ctx.fillStyle = '#8b95a8';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('(Vertical edge detector)', kernelX + (cellSize * 3 + gap * 2) / 2, kernelY + 3 * (cellSize + gap) + 16);

        ctx.textBaseline = 'alphabetic';
    },

    // ---- CNN Architecture Diagram ----
    drawCNNArchitecture() {
        const canvas = document.getElementById('cnnArchCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const blocks = [
            { label: 'Input\n32x32x3', w: 55, h: 80, color: '#3b82f6', x: 20 },
            { label: 'Conv2D\n32 filters', w: 50, h: 70, color: '#6366f1', x: 100 },
            { label: 'ReLU', w: 30, h: 70, color: '#f59e0b', x: 170 },
            { label: 'MaxPool\n16x16', w: 40, h: 55, color: '#ef4444', x: 220 },
            { label: 'Conv2D\n64 filters', w: 45, h: 55, color: '#6366f1', x: 290 },
            { label: 'ReLU', w: 30, h: 55, color: '#f59e0b', x: 355 },
            { label: 'MaxPool\n8x8', w: 35, h: 40, color: '#ef4444', x: 405 },
            { label: 'Flatten', w: 20, h: 80, color: '#8b5cf6', x: 475 },
            { label: 'Dense\n64', w: 50, h: 50, color: '#10b981', x: 530 },
            { label: 'Dense\n10', w: 45, h: 35, color: '#10b981', x: 610 },
            { label: 'Softmax\nOutput', w: 45, h: 35, color: '#fbbf24', x: 690 }
        ];

        const cy = H / 2;

        // Draw connections
        for (let i = 0; i < blocks.length - 1; i++) {
            const b1 = blocks[i];
            const b2 = blocks[i + 1];
            ctx.beginPath();
            ctx.moveTo(b1.x + b1.w, cy);
            ctx.lineTo(b2.x, cy);
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Arrow
            const ax = b2.x - 4;
            ctx.beginPath();
            ctx.moveTo(ax, cy - 4);
            ctx.lineTo(ax + 6, cy);
            ctx.lineTo(ax, cy + 4);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
            ctx.fill();
        }

        // Draw blocks
        blocks.forEach(b => {
            const y = cy - b.h / 2;

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(b.x + 2, y + 2, b.w, b.h);

            // Block
            ctx.fillStyle = b.color + '33';
            ctx.fillRect(b.x, y, b.w, b.h);
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x, y, b.w, b.h);

            // Label
            ctx.fillStyle = '#e8eaf0';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            const lines = b.label.split('\n');
            lines.forEach((line, li) => {
                ctx.fillText(line, b.x + b.w / 2, cy - (lines.length - 1) * 6 + li * 13);
            });
        });
    },

    // ---- Pooling Diagram ----
    drawPoolingDiagram() {
        const canvas = document.getElementById('poolingCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const cellSize = 38;
        const gap = 2;

        // 4x4 input for pooling
        const poolInput = [
            [1, 3, 2, 1],
            [4, 6, 5, 2],
            [7, 2, 3, 8],
            [1, 5, 4, 6]
        ];

        // 2x2 max pooling output
        const poolOutput = [
            [6, 5],
            [7, 8]
        ];

        const inputX = 180;
        const inputY = 40;
        const outputX = 520;
        const outputY = 60;

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Input (4\u00D74)', inputX + (cellSize * 4 + gap * 3) / 2, inputY - 14);
        ctx.fillText('Max Pool Output (2\u00D72)', outputX + (cellSize * 2 + gap) / 2, outputY - 14);

        // Arrow
        ctx.fillStyle = '#8b95a8';
        ctx.font = 'bold 16px Inter';
        ctx.fillText('Max Pool 2\u00D72 \u2192', 430, H / 2 + 5);

        // Draw input with colored 2x2 regions
        const regionColors = [
            'rgba(99, 102, 241, 0.2)', 'rgba(16, 185, 129, 0.2)',
            'rgba(245, 158, 11, 0.2)', 'rgba(239, 68, 68, 0.2)'
        ];
        const borderColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const x = inputX + c * (cellSize + gap);
                const y = inputY + r * (cellSize + gap);
                const regionIdx = Math.floor(r / 2) * 2 + Math.floor(c / 2);

                ctx.fillStyle = regionColors[regionIdx];
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = borderColors[regionIdx];
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, y, cellSize, cellSize);

                // Highlight max values
                const isMax = poolInput[r][c] === poolOutput[Math.floor(r / 2)][Math.floor(c / 2)];
                ctx.fillStyle = isMax ? '#fbbf24' : '#8b95a8';
                ctx.font = isMax ? 'bold 16px JetBrains Mono' : '14px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(poolInput[r][c].toString(), x + cellSize / 2, y + cellSize / 2);
            }
        }

        // Draw output
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 2; c++) {
                const x = outputX + c * (cellSize + gap);
                const y = outputY + r * (cellSize + gap);
                const regionIdx = r * 2 + c;

                ctx.fillStyle = regionColors[regionIdx];
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = borderColors[regionIdx];
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellSize, cellSize);

                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 16px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(poolOutput[r][c].toString(), x + cellSize / 2, y + cellSize / 2);
            }
        }

        ctx.textBaseline = 'alphabetic';
    },

    // ---- Quiz 6.1 ----
    startQuiz6_1() {
        Quiz.start({
            title: 'Chapter 6.1: Convolutional Neural Networks',
            chapterId: '6-1',
            questions: [
                {
                    question: 'Why are CNNs better than regular AI brains for looking at pictures?',
                    options: [
                        'They are always right',
                        'They reuse the same magnifying glass everywhere, so they need way fewer numbers to learn',
                        'They do not need any practice pictures',
                        'They only work with color pictures'
                    ],
                    correct: 1,
                    explanation: 'CNNs use the same little magnifying glass (filter) across the whole picture. This is like using one cookie cutter for all cookies instead of carving each one -- way less work!'
                },
                {
                    question: 'What does the 3x3 magnifying glass (kernel) do?',
                    options: [
                        'Shrinks the picture to 3x3',
                        'Slides across the picture, multiplying and adding numbers at each spot to find patterns',
                        'Randomly picks 9 dots',
                        'Makes the picture 3 times bigger'
                    ],
                    correct: 1,
                    explanation: 'At each spot, the 3x3 magnifying glass multiplies its numbers with the picture numbers underneath, adds them up, and writes down one answer. Then it slides over to the next spot!'
                },
                {
                    question: 'If you slide a 3x3 window across a 5x5 picture (1 step at a time, no border), how big is the answer?',
                    options: ['5x5', '3x3', '7x7', '2x2'],
                    correct: 1,
                    explanation: 'The window can fit in 3 spots across and 3 spots down. So the output is 3x3! Use the formula: (5 - 3) / 1 + 1 = 3.'
                },
                {
                    question: 'What does Max Pooling do?',
                    options: [
                        'Adds more dots to the picture',
                        'Picks the biggest number from each small group, making the picture smaller',
                        'Uses the biggest magnifying glass number',
                        'Makes the picture have more colors'
                    ],
                    correct: 1,
                    explanation: 'Max Pooling looks at each little group (like 2x2) and picks the winner -- the biggest number! This makes the picture half the size but keeps the most important stuff.'
                },
                {
                    question: 'What do the first layers of a CNN find?',
                    options: [
                        'Whole things like faces or cars',
                        'Simple stuff like lines, edges, and patterns',
                        'Only colors',
                        'Nothing useful until the very end'
                    ],
                    correct: 1,
                    explanation: 'The first layers find simple things like lines and edges. Then the next layers combine those into shapes (like eyes or wheels). The last layers put it all together to see whole objects (like a face or a car)!'
                }
            ]
        });
    },

    // ============================================
    // 6.2: Data Augmentation Lab
    // ============================================
    augOriginalData: null,
    augCurrentData: null,

    loadChapter6_2() {
        const container = document.getElementById('chapter-6-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 6 \u2022 Chapter 6.2</span>
                <h1>Data Augmentation Lab</h1>
                <p>Welcome to art class! Data augmentation is when we make NEW training pictures by flipping, rotating, and zooming the ones we already have. It is like having one coloring page and making lots of different versions of it. More practice pictures for free!</p>
            </div>

            <!-- Why Augmentation -->
            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE9</span> Why Data Augmentation?</h2>
                <p>AI brains are super hungry for pictures! If you only show them 1,000 cat photos, they might only learn cats from one angle. But by flipping, rotating, and zooming those same photos, we make thousands of new practice pictures. It is like an art class where you draw the same thing in many different styles!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Think of it like practicing soccer: instead of always kicking from the same spot, you practice from different angles, distances, and with different feet. Data augmentation helps the AI learn WHAT a cat looks like, not memorize one specific photo of a cat!</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0;">
                    <div class="info-box success" style="flex-direction: column; text-align: center;">
                        <strong>Stops Cheating</strong>
                        <span class="info-box-text">With so many different versions, the AI cannot just memorize pictures!</span>
                    </div>
                    <div class="info-box success" style="flex-direction: column; text-align: center;">
                        <strong>Works Better in Real Life</strong>
                        <span class="info-box-text">The AI gets used to seeing things from all angles, so real-world pictures do not confuse it.</span>
                    </div>
                    <div class="info-box success" style="flex-direction: column; text-align: center;">
                        <strong>Free Pictures!</strong>
                        <span class="info-box-text">You do not need to go take thousands of new photos -- just flip and twist the ones you have!</span>
                    </div>
                </div>
            </div>

            <!-- Interactive Augmentation -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFA8</span> Augmentation Playground</h2>
                <p>Click the buttons below to change the pixel art picture! Try flipping, rotating, and zooming. See how the picture looks different but you can still tell what it is? That is the magic of augmentation!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div style="display: flex; gap: 40px; justify-content: center; align-items: flex-start; margin: 20px 0; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="color: #8b95a8; font-size: 13px; margin-bottom: 8px; font-weight: 600;">Original</div>
                        <div class="network-viz" style="padding: 12px; display: inline-block;">
                            <canvas id="augOriginalCanvas" width="200" height="200"></canvas>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #fbbf24; font-size: 13px; margin-bottom: 8px; font-weight: 600;">Augmented</div>
                        <div class="network-viz" style="padding: 12px; display: inline-block;">
                            <canvas id="augCurrentCanvas" width="200" height="200"></canvas>
                        </div>
                    </div>
                </div>

                <div id="augLabel" class="step-explanation">
                    Apply an augmentation to see the transformation!
                </div>

                <div class="controls" style="flex-wrap: wrap;">
                    <button class="btn-primary btn-small" onclick="Chapter6.applyAugmentation('rotate')">Rotate 90\u00B0</button>
                    <button class="btn-primary btn-small" onclick="Chapter6.applyAugmentation('flipH')">Flip Horizontal</button>
                    <button class="btn-primary btn-small" onclick="Chapter6.applyAugmentation('flipV')">Flip Vertical</button>
                    <button class="btn-primary btn-small" onclick="Chapter6.applyAugmentation('zoom')">Zoom In</button>
                    <button class="btn-primary btn-small" onclick="Chapter6.applyAugmentation('shift')">Shift Right</button>
                    <button class="btn-primary btn-small" onclick="Chapter6.applyAugmentation('noise')">Add Noise</button>
                    <button class="btn-secondary btn-small" onclick="Chapter6.resetAugmentation()">Reset</button>
                </div>
            </div>

            <!-- Accuracy Comparison -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Impact of Data Augmentation</h2>
                <p>Look at this chart! The AI with augmentation (green) gets way better than the one without (red). More practice pictures = a smarter AI that does not just memorize!</p>

                <div class="graph-container">
                    <canvas id="augAccuracyCanvas" width="750" height="300"></canvas>
                    <div class="graph-legend">
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #ef4444;"></span>
                            Without Augmentation
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #10b981;"></span>
                            With Augmentation
                        </div>
                    </div>
                </div>

                <div class="gd-stats">
                    <div class="gd-stat">
                        <div class="stat-label">Without Aug (Final)</div>
                        <div class="stat-value" style="color: #ef4444;">78.2%</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">With Aug (Final)</div>
                        <div class="stat-value" style="color: #10b981;">91.5%</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Improvement</div>
                        <div class="stat-value" style="color: #fbbf24;">+13.3%</div>
                    </div>
                </div>
            </div>

            <!-- Code Example -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Augmentation in Keras</h2>
                <p>Here is how you tell the computer to flip and twist your pictures:</p>

                <div class="code-block">
<span class="keyword">from</span> tensorflow.keras <span class="keyword">import</span> layers, Sequential

<span class="comment"># Set up the picture-changing tricks</span>
augmentation = Sequential([
    layers.<span class="function">RandomFlip</span>(<span class="string">"horizontal"</span>),
    layers.<span class="function">RandomRotation</span>(<span class="number">0.1</span>),       <span class="comment"># Spin it a tiny bit</span>
    layers.<span class="function">RandomZoom</span>(<span class="number">0.1</span>),           <span class="comment"># Zoom in or out a little</span>
    layers.<span class="function">RandomTranslation</span>(<span class="number">0.1</span>, <span class="number">0.1</span>), <span class="comment"># Scoot it around a bit</span>
    layers.<span class="function">RandomContrast</span>(<span class="number">0.1</span>),       <span class="comment"># Make it a little brighter or darker</span>
])

<span class="comment"># Add it to your AI brain</span>
model = Sequential([
    augmentation,                      <span class="comment"># Only changes pictures during practice, not the real test!</span>
    layers.<span class="function">Conv2D</span>(<span class="number">32</span>, <span class="number">3</span>, activation=<span class="string">'relu'</span>),
    layers.<span class="function">MaxPooling2D</span>(),
    layers.<span class="function">Conv2D</span>(<span class="number">64</span>, <span class="number">3</span>, activation=<span class="string">'relu'</span>),
    layers.<span class="function">MaxPooling2D</span>(),
    layers.<span class="function">Flatten</span>(),
    layers.<span class="function">Dense</span>(<span class="number">64</span>, activation=<span class="string">'relu'</span>),
    layers.<span class="function">Dense</span>(<span class="number">10</span>, activation=<span class="string">'softmax'</span>)
])

<span class="comment"># The tricks turn off automatically when it's time for the real test</span>
model.<span class="function">compile</span>(optimizer=<span class="string">'adam'</span>, loss=<span class="string">'sparse_categorical_crossentropy'</span>)
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A0\uFE0F</span>
                    <span class="info-box-text">Pick tricks that make sense! Flipping a cat picture sideways is fine -- a cat is still a cat! But flipping text would make it unreadable. And flipping a face upside down would be weird! Think about what changes are OK for YOUR pictures.</span>
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter6.startQuiz6_2()">
                        Start Quiz \u2192
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('6-1')">
                    \u2190 Previous
                </button>
                <button class="btn-primary" onclick="App.navigateTo('6-3')">
                    Next: Transfer Learning \u2192
                </button>
            </div>
        `;

        this.initAugmentation();
        this.drawAugAccuracyGraph();
    },

    // ---- Pixel Art (8x8 arrow pointing right) ----
    getArrowPixelArt() {
        return [
            [0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 1, 1, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0]
        ];
    },

    initAugmentation() {
        this.augOriginalData = this.getArrowPixelArt();
        this.augCurrentData = this.augOriginalData.map(row => [...row]);
        this.drawPixelArt('augOriginalCanvas', this.augOriginalData, '#6366f1');
        this.drawPixelArt('augCurrentCanvas', this.augCurrentData, '#6366f1');
    },

    drawPixelArt(canvasId, data, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const size = data.length;
        const cellSize = Math.floor(Math.min(W, H) / size) - 2;
        const offsetX = (W - size * (cellSize + 2)) / 2;
        const offsetY = (H - size * (cellSize + 2)) / 2;

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < data[r].length; c++) {
                const x = offsetX + c * (cellSize + 2);
                const y = offsetY + r * (cellSize + 2);
                const val = data[r][c];

                if (typeof val === 'number') {
                    if (val > 0.5) {
                        ctx.fillStyle = color;
                    } else if (val > 0) {
                        // Partial values (noise)
                        const alpha = Math.max(0.15, val);
                        ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
                    }
                } else {
                    ctx.fillStyle = val ? color : 'rgba(255, 255, 255, 0.06)';
                }

                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
    },

    applyAugmentation(type) {
        let data = this.augCurrentData.map(row => [...row]);
        const size = data.length;
        let label = '';

        switch (type) {
            case 'rotate': {
                // Rotate 90 degrees clockwise
                const rotated = Array.from({ length: size }, () => new Array(size).fill(0));
                for (let r = 0; r < size; r++) {
                    for (let c = 0; c < size; c++) {
                        rotated[c][size - 1 - r] = data[r][c];
                    }
                }
                data = rotated;
                label = '<strong>Rotate 90\u00B0 Clockwise:</strong> The arrow is turned sideways! But it is still an arrow. The AI learns that turning a picture does not change what it is.';
                break;
            }
            case 'flipH': {
                // Flip horizontally
                data = data.map(row => [...row].reverse());
                label = '<strong>Flip Horizontal:</strong> The picture is flipped like a mirror! A left arrow and right arrow are still both arrows. The AI learns that flipped pictures show the same thing.';
                break;
            }
            case 'flipV': {
                // Flip vertically
                data = [...data].reverse();
                label = '<strong>Flip Vertical:</strong> The picture is flipped upside-down, like looking in a puddle! The AI learns to recognize things even when they are upside down.';
                break;
            }
            case 'zoom': {
                // Zoom into center
                const zoomed = Array.from({ length: size }, () => new Array(size).fill(0));
                const zoomFactor = 1.5;
                const cx = size / 2, cy = size / 2;
                for (let r = 0; r < size; r++) {
                    for (let c = 0; c < size; c++) {
                        const srcR = Math.round(cy + (r - cy) / zoomFactor);
                        const srcC = Math.round(cx + (c - cx) / zoomFactor);
                        if (srcR >= 0 && srcR < size && srcC >= 0 && srcC < size) {
                            zoomed[r][c] = data[srcR][srcC];
                        }
                    }
                }
                data = zoomed;
                label = '<strong>Zoom In (1.5x):</strong> We zoomed in closer, like using a magnifying glass! The AI learns that things can look bigger or smaller and still be the same thing.';
                break;
            }
            case 'shift': {
                // Shift right by 2 pixels
                const shifted = Array.from({ length: size }, () => new Array(size).fill(0));
                for (let r = 0; r < size; r++) {
                    for (let c = 0; c < size; c++) {
                        const srcC = c - 2;
                        if (srcC >= 0 && srcC < size) {
                            shifted[r][c] = data[r][srcC];
                        }
                    }
                }
                data = shifted;
                label = '<strong>Shift Right (+2px):</strong> We scooted the picture to the right! The AI learns that WHERE something is in the picture does not change WHAT it is.';
                break;
            }
            case 'noise': {
                // Add random noise
                data = data.map(row => row.map(val => {
                    const noise = (Math.random() - 0.5) * 0.6;
                    return Math.max(0, Math.min(1, val + noise));
                }));
                label = '<strong>Random Noise:</strong> We sprinkled some random dots on the picture, like paint splatters! The AI learns to ignore messy spots and still figure out what the picture shows.';
                break;
            }
        }

        this.augCurrentData = data;
        this.drawPixelArt('augCurrentCanvas', data, '#10b981');
        const el = document.getElementById('augLabel');
        if (el) el.innerHTML = label;
    },

    resetAugmentation() {
        this.augCurrentData = this.augOriginalData.map(row => [...row]);
        this.drawPixelArt('augCurrentCanvas', this.augCurrentData, '#6366f1');
        const el = document.getElementById('augLabel');
        if (el) el.innerHTML = 'Apply an augmentation to see the transformation!';
    },

    // ---- Accuracy Comparison Graph ----
    drawAugAccuracyGraph() {
        const canvas = document.getElementById('augAccuracyCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 25, right: 20, bottom: 40, left: 60 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        // Generate data
        const epochs = 30;
        const withoutAug = [];
        const withAug = [];

        for (let i = 0; i < epochs; i++) {
            const t = i / epochs;
            // Without augmentation: overfits, plateaus early
            const noAugVal = 0.45 + 0.35 * (1 - Math.exp(-4 * t)) - 0.02 * t + (Math.random() - 0.5) * 0.02;
            withoutAug.push(Math.min(noAugVal, 0.80));

            // With augmentation: steady improvement, higher ceiling
            const augVal = 0.45 + 0.48 * (1 - Math.exp(-3 * t)) + (Math.random() - 0.5) * 0.015;
            withAug.push(Math.min(augVal, 0.93));
        }

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + plotH * (i / 5);
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();

            ctx.fillStyle = '#5a6478';
            ctx.font = '11px JetBrains Mono';
            ctx.textAlign = 'right';
            ctx.fillText(((100 - i * 20)).toString() + '%', pad.left - 8, y + 4);
        }

        // X axis labels
        ctx.textAlign = 'center';
        for (let i = 0; i <= 6; i++) {
            const x = pad.left + plotW * (i / 6);
            ctx.fillText((i * 5).toString(), x, H - 10);
        }
        ctx.fillText('Epochs', W / 2, H - 0);

        // Plot: without augmentation (red)
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        withoutAug.forEach((v, i) => {
            const x = pad.left + (i / (epochs - 1)) * plotW;
            const y = pad.top + plotH * (1 - v);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Plot: with augmentation (green)
        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        withAug.forEach((v, i) => {
            const x = pad.left + (i / (epochs - 1)) * plotW;
            const y = pad.top + plotH * (1 - v);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Overfitting annotation
        ctx.fillStyle = '#ef4444';
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        const annotX = pad.left + plotW * 0.65;
        const annotY = pad.top + plotH * (1 - 0.78);
        ctx.fillText('Plateaus early', annotX + 10, annotY - 2);

        ctx.fillStyle = '#10b981';
        const annot2Y = pad.top + plotH * (1 - 0.91);
        ctx.fillText('Keeps improving!', annotX + 10, annot2Y - 2);
    },

    // ---- Quiz 6.2 ----
    startQuiz6_2() {
        Quiz.start({
            title: 'Chapter 6.2: Data Augmentation',
            chapterId: '6-2',
            questions: [
                {
                    question: 'Why do we use data augmentation (flipping, rotating, zooming pictures)?',
                    options: [
                        'To make the pictures look nicer',
                        'To give the AI more different practice pictures so it really learns and does not memorize',
                        'To make pictures smaller and faster',
                        'To turn color pictures into black and white'
                    ],
                    correct: 1,
                    explanation: 'By flipping and changing pictures, we give the AI many more examples to practice with. This helps it learn what things REALLY look like, not just memorize one photo!'
                },
                {
                    question: 'Which trick would NOT make sense for recognizing handwritten numbers?',
                    options: [
                        'Tilting it a tiny bit',
                        'Scooting it a little',
                        'Flipping it upside down',
                        'Adding tiny random dots'
                    ],
                    correct: 2,
                    explanation: 'Flipping numbers upside down changes what they are -- a 6 turns into a 9! You should only use tricks that do NOT change what the picture means.'
                },
                {
                    question: 'When do the picture-changing tricks happen?',
                    options: [
                        'Only during practice (training)',
                        'Only during the real test',
                        'During both practice and the real test',
                        'Only when checking homework'
                    ],
                    correct: 0,
                    explanation: 'The flipping and rotating only happens during practice time! When the AI takes the real test, it sees the pictures as they really are, with no changes.'
                },
                {
                    question: 'Without augmentation: 78% right. With augmentation: 91% right. Why is the second one better?',
                    options: [
                        'The AI brain got bigger',
                        'The AI saw many different versions of each picture and learned what things REALLY look like',
                        'Some bad pictures were removed',
                        'The AI practiced for longer'
                    ],
                    correct: 1,
                    explanation: 'By seeing the same thing flipped, rotated, and zoomed, the AI learned what things really look like from all angles. It did not just memorize one specific photo!'
                }
            ]
        });
    },

    // ============================================
    // 6.3: Transfer Learning Studio
    // ============================================
    tlFreezeCount: 15,
    tlTotalLayers: 20,

    loadChapter6_3() {
        const container = document.getElementById('chapter-6-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 6 \u2022 Chapter 6.3</span>
                <h1>Transfer Learning Studio</h1>
                <p>Amazing! Why start from zero when someone already taught an AI to see millions of pictures? Transfer learning is like using knowledge from one task to help with another -- like how knowing how to ride a bike helps you learn a motorcycle! We can borrow a smart AI brain and teach it our own stuff!</p>
            </div>

            <!-- What is Transfer Learning -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF93</span> What is Transfer Learning?</h2>
                <p>Transfer learning borrows a brain that already learned from 14 million pictures! That brain already knows about edges, shapes, and textures. We just teach it our own special thing, like telling the difference between dogs and cats. It is way faster than starting from scratch!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Think of it like this: if you already know how to ride a bike, learning a skateboard is way easier! You already know about balance and steering. The same idea works for AI -- a brain that already learned about shapes and colors can quickly learn YOUR special pictures!</span>
                </div>

                <h3>Two Approaches</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
                    <div class="info-box" style="flex-direction: column;">
                        <strong style="color: #3b82f6;">\uD83E\uDDCA Feature Extraction (Keep the foundation)</strong>
                        <span class="info-box-text">Freeze all the borrowed layers -- do not change them! Only teach the new top part. Super fast, and you only need a few pictures. Like keeping the foundation of a house and just redecorating the rooms!</span>
                    </div>
                    <div class="info-box" style="flex-direction: column;">
                        <strong style="color: #10b981;">\uD83D\uDD27 Fine-Tuning (Small adjustments)</strong>
                        <span class="info-box-text">Unfreeze some layers and carefully adjust them. Make small tweaks to fit your specific task. Like remodeling some rooms while keeping the foundation! Needs more pictures and more time, but works better for tricky tasks.</span>
                    </div>
                </div>
            </div>

            <!-- Interactive Layer Freezing -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Layer Freeze/Unfreeze Visualizer</h2>
                <p>Use the slider to freeze or unfreeze layers! Blue layers are frozen (locked, we do not change them). Green layers are learning. Watch what happens to the numbers!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Frozen Layers: <span id="tlFreezeVal">15</span> / ${this.tlTotalLayers}</label>
                        <input type="range" id="tlFreezeSlider" min="0" max="${this.tlTotalLayers}" value="15"
                               oninput="Chapter6.updateTransferLearning()">
                    </div>
                </div>

                <div class="network-viz">
                    <canvas id="tlLayerCanvas" width="800" height="220"></canvas>
                </div>

                <div class="gd-stats" id="tlStats">
                    <div class="gd-stat">
                        <div class="stat-label">Total Params</div>
                        <div class="stat-value" id="tlTotalParams">25.6M</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Frozen Params</div>
                        <div class="stat-value" id="tlFrozenParams" style="color: #3b82f6;">19.2M</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Trainable Params</div>
                        <div class="stat-value" id="tlTrainableParams" style="color: #10b981;">6.4M</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Training Speed</div>
                        <div class="stat-value" id="tlSpeed" style="color: #f59e0b;">Fast</div>
                    </div>
                </div>

                <div class="step-explanation" id="tlExplanation">
                    <strong>Feature Extraction Mode:</strong> Most layers are locked! Only the new answer part on top
                    will learn. This is super fast and works great even when you have only a few pictures.
                </div>
            </div>

            <!-- Model Comparison -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Popular Pre-trained Models</h2>
                <p>Here are some famous AI brains you can borrow! Each one is different -- some are big and super smart, others are small and fast. Pick the one that is right for your project!</p>

                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <thead>
                            <tr style="border-bottom: 2px solid rgba(99, 102, 241, 0.3);">
                                <th style="text-align: left; padding: 12px 16px; color: #e8eaf0; font-size: 14px;">Model</th>
                                <th style="text-align: center; padding: 12px 16px; color: #e8eaf0; font-size: 14px;">Parameters</th>
                                <th style="text-align: center; padding: 12px 16px; color: #e8eaf0; font-size: 14px;">Top-1 Accuracy</th>
                                <th style="text-align: center; padding: 12px 16px; color: #e8eaf0; font-size: 14px;">Size (MB)</th>
                                <th style="text-align: center; padding: 12px 16px; color: #e8eaf0; font-size: 14px;">Best For</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                                <td style="padding: 12px 16px; color: #8b5cf6; font-weight: 600;">VGG16</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">138M</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">71.3%</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">528</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">Simple architecture, teaching</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                                <td style="padding: 12px 16px; color: #6366f1; font-weight: 600;">ResNet50</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">25.6M</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">74.9%</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">98</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">General purpose, balanced</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                                <td style="padding: 12px 16px; color: #10b981; font-weight: 600;">MobileNetV2</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">3.4M</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">71.3%</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">14</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">Mobile/edge, speed-critical</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                                <td style="padding: 12px 16px; color: #f59e0b; font-weight: 600;">EfficientNetB0</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">5.3M</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">77.1%</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">29</td>
                                <td style="padding: 12px 16px; text-align: center; color: #8b95a8;">Best accuracy/efficiency ratio</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A1</span>
                    <span class="info-box-text">VGG16 is HUGE (138 million numbers!) but only gets 71% right.
                    EfficientNetB0 is much smaller (5.3 million) but gets 77% right! Newer brains are smarter AND smaller. It is like how newer phones are thinner but more powerful!</span>
                </div>
            </div>

            <!-- Code Example -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Transfer Learning in Keras</h2>
                <p>Here is how to borrow a smart AI brain (ResNet50) and teach it your own stuff:</p>

                <div class="code-block">
<span class="keyword">import</span> tensorflow <span class="keyword">as</span> tf
<span class="keyword">from</span> tensorflow.keras <span class="keyword">import</span> layers, models

<span class="comment"># Step 1: Borrow the smart brain (without its old answer part)</span>
base_model = tf.keras.applications.<span class="function">ResNet50</span>(
    weights=<span class="string">'imagenet'</span>,
    include_top=<span class="keyword">False</span>,          <span class="comment"># Take off the old answer part</span>
    input_shape=(<span class="number">224</span>, <span class="number">224</span>, <span class="number">3</span>)
)

<span class="comment"># Step 2: Lock the borrowed brain so we do not mess it up</span>
base_model.trainable = <span class="keyword">False</span>   <span class="comment"># Freeze! Do not change these layers</span>

<span class="comment"># Step 3: Add our own new answer part on top</span>
model = models.<span class="function">Sequential</span>([
    base_model,
    layers.<span class="function">GlobalAveragePooling2D</span>(),
    layers.<span class="function">Dense</span>(<span class="number">256</span>, activation=<span class="string">'relu'</span>),
    layers.<span class="function">Dropout</span>(<span class="number">0.5</span>),
    layers.<span class="function">Dense</span>(<span class="number">5</span>, activation=<span class="string">'softmax'</span>)  <span class="comment"># Pick from 5 choices</span>
])

<span class="comment"># Step 4: Teach it our stuff (only the new part learns!)</span>
model.<span class="function">compile</span>(optimizer=<span class="string">'adam'</span>, loss=<span class="string">'categorical_crossentropy'</span>)
model.<span class="function">fit</span>(train_data, epochs=<span class="number">10</span>)

<span class="comment"># Step 5 (Bonus): Carefully adjust some top layers too</span>
base_model.trainable = <span class="keyword">True</span>
<span class="keyword">for</span> layer <span class="keyword">in</span> base_model.layers[:-<span class="number">20</span>]:
    layer.trainable = <span class="keyword">False</span>     <span class="comment"># Keep the early layers locked</span>

<span class="comment"># Use a smaller learning speed so we do not break what was already learned!</span>
model.<span class="function">compile</span>(
    optimizer=tf.keras.optimizers.<span class="function">Adam</span>(<span class="number">1e-5</span>),
    loss=<span class="string">'categorical_crossentropy'</span>
)
model.<span class="function">fit</span>(train_data, epochs=<span class="number">5</span>)
                </div>

                <div class="info-box success">
                    <span class="info-box-icon">\u2705</span>
                    <span class="info-box-text">Here is the cool part: with transfer learning, you can get over 90% right with just a few hundred pictures and a few minutes of practice! Without it, you would need MILLIONS of pictures and days of computer time. That is like a shortcut in a video game!</span>
                </div>
            </div>

            <!-- Feature Extraction vs Fine-Tuning -->
            <div class="section">
                <h2><span class="section-icon">\u2696\uFE0F</span> Feature Extraction vs Fine-Tuning</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="info-box" style="flex-direction: column;">
                        <strong style="color: #3b82f6; margin-bottom: 8px;">Feature Extraction (Keep it all locked)</strong>
                        <ul style="color: var(--text-secondary); padding-left: 16px; margin: 0; line-height: 1.8; font-size: 13px;">
                            <li>Lock ALL the borrowed layers</li>
                            <li>Only teach the new answer part</li>
                            <li>Super fast (seconds to minutes)</li>
                            <li>Works with just a few pictures (100+)</li>
                            <li>Best when your pictures look like what it already knows</li>
                        </ul>
                    </div>
                    <div class="info-box" style="flex-direction: column;">
                        <strong style="color: #10b981; margin-bottom: 8px;">Fine-Tuning (Make small adjustments)</strong>
                        <ul style="color: var(--text-secondary); padding-left: 16px; margin: 0; line-height: 1.8; font-size: 13px;">
                            <li>Unlock some top layers and carefully adjust them</li>
                            <li>Learn slowly so you do not break what was already learned</li>
                            <li>Takes a bit longer (minutes to hours)</li>
                            <li>Needs more pictures (1,000+)</li>
                            <li>Best when your pictures look DIFFERENT from what it already knows</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter6.startQuiz6_3()">
                        Start Quiz \u2192
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('6-2')">
                    \u2190 Previous
                </button>
                <button class="btn-primary" onclick="App.navigateTo('7-1')">
                    Next: Word Embeddings \u2192
                </button>
            </div>
        `;

        this.updateTransferLearning();
    },

    // ---- Transfer Learning Visualization ----
    updateTransferLearning() {
        const slider = document.getElementById('tlFreezeSlider');
        if (!slider) return;
        this.tlFreezeCount = parseInt(slider.value);
        document.getElementById('tlFreezeVal').textContent = this.tlFreezeCount;

        this.drawTransferLearningLayers();
        this.updateTLStats();
        this.updateTLExplanation();
    },

    drawTransferLearningLayers() {
        const canvas = document.getElementById('tlLayerCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const total = this.tlTotalLayers;
        const frozen = this.tlFreezeCount;
        const layerWidth = Math.min(32, (W - 80) / total - 4);
        const layerGap = 4;
        const totalWidth = total * (layerWidth + layerGap) - layerGap;
        const startX = (W - totalWidth) / 2;
        const layerHeight = 120;
        const startY = (H - layerHeight) / 2 + 10;

        // Pre-trained model bracket
        const pretrainedEnd = startX + (total - 2) * (layerWidth + layerGap) - layerGap;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY - 18);
        ctx.lineTo(startX, startY - 24);
        ctx.lineTo(pretrainedEnd + layerWidth, startY - 24);
        ctx.lineTo(pretrainedEnd + layerWidth, startY - 18);
        ctx.stroke();
        ctx.fillStyle = '#8b5cf6';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Pre-trained Model (e.g., ResNet50)', (startX + pretrainedEnd + layerWidth) / 2, startY - 28);

        // New head bracket
        const headStart = startX + (total - 2) * (layerWidth + layerGap);
        const headEnd = startX + totalWidth;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.beginPath();
        ctx.moveTo(headStart, startY - 18);
        ctx.lineTo(headStart, startY - 24);
        ctx.lineTo(headEnd, startY - 24);
        ctx.lineTo(headEnd, startY - 18);
        ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('New Head', (headStart + headEnd) / 2, startY - 28);

        // Draw layers
        for (let i = 0; i < total; i++) {
            const x = startX + i * (layerWidth + layerGap);
            const isFrozen = i < frozen;
            const isNewHead = i >= total - 2;

            // Varying heights for visual interest
            const hVariation = isNewHead ? 0.5 : (0.6 + 0.4 * Math.sin(i * 0.5 + 1));
            const lh = layerHeight * hVariation;
            const ly = startY + (layerHeight - lh) / 2;

            if (isNewHead) {
                // New classifier head layers
                ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
                ctx.fillRect(x, ly, layerWidth, lh);
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, ly, layerWidth, lh);
            } else if (isFrozen) {
                // Frozen layers
                ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
                ctx.fillRect(x, ly, layerWidth, lh);
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, ly, layerWidth, lh);

                // Lock icon (small snowflake dot)
                ctx.fillStyle = '#3b82f6';
                ctx.beginPath();
                ctx.arc(x + layerWidth / 2, ly + lh / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Trainable layers
                ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
                ctx.fillRect(x, ly, layerWidth, lh);
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, ly, layerWidth, lh);

                // Training pulse indicator
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.arc(x + layerWidth / 2, ly + lh / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Legend
        const legendY = startY + layerHeight + 20;
        const legendItems = [
            { color: '#3b82f6', label: 'Frozen (weights locked)' },
            { color: '#10b981', label: 'Trainable (learning)' },
            { color: '#fbbf24', label: 'New classifier head' }
        ];

        let legendX = W / 2 - 200;
        legendItems.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, legendY - 5, 12, 12);
            ctx.fillStyle = '#8b95a8';
            ctx.font = '11px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, legendX + 18, legendY + 5);
            legendX += 150;
        });
    },

    updateTLStats() {
        const total = this.tlTotalLayers;
        const frozen = this.tlFreezeCount;
        const trainable = total - frozen;

        // Simulate parameter counts (ResNet50-like distribution)
        const totalParams = 25.6; // millions
        const paramsPerLayer = [];
        for (let i = 0; i < total; i++) {
            // Deeper layers have more params
            paramsPerLayer.push(0.5 + (i / total) * 2.0);
        }
        const totalWeight = paramsPerLayer.reduce((a, b) => a + b, 0);

        let frozenParams = 0;
        for (let i = 0; i < frozen; i++) {
            frozenParams += (paramsPerLayer[i] / totalWeight) * totalParams;
        }
        const trainableParams = totalParams - frozenParams;

        const el = id => document.getElementById(id);
        if (el('tlTotalParams')) el('tlTotalParams').textContent = totalParams.toFixed(1) + 'M';
        if (el('tlFrozenParams')) el('tlFrozenParams').textContent = frozenParams.toFixed(1) + 'M';
        if (el('tlTrainableParams')) el('tlTrainableParams').textContent = trainableParams.toFixed(1) + 'M';

        // Speed estimation
        const frozenRatio = frozen / total;
        let speed = 'Slow';
        if (frozenRatio > 0.8) speed = 'Very Fast';
        else if (frozenRatio > 0.5) speed = 'Fast';
        else if (frozenRatio > 0.2) speed = 'Moderate';
        if (el('tlSpeed')) el('tlSpeed').textContent = speed;
    },

    updateTLExplanation() {
        const el = document.getElementById('tlExplanation');
        if (!el) return;
        const frozen = this.tlFreezeCount;
        const total = this.tlTotalLayers;
        const ratio = frozen / total;

        if (ratio >= 0.9) {
            el.innerHTML = '<strong>Feature Extraction Mode:</strong> Almost all layers are locked! ' +
                'Only the new answer part is learning. Super fast, and you only need a few pictures. ' +
                'Great when your pictures look like regular photos!';
        } else if (ratio >= 0.6) {
            el.innerHTML = '<strong>Moderate Fine-Tuning:</strong> Most layers are still locked, but some top ones are learning. ' +
                'A nice balance! The AI keeps its basic skills (finding edges and shapes) but can ' +
                'adjust its fancy pattern-finding to match your pictures.';
        } else if (ratio >= 0.3) {
            el.innerHTML = '<strong>Lots of Fine-Tuning:</strong> Many layers are unlocked and learning! ' +
                'The AI is changing a LOT of what it knows. You need more pictures and have to be careful ' +
                'not to go too fast. Good when your pictures are very different from regular photos.';
        } else if (ratio > 0) {
            el.innerHTML = '<strong>Almost Starting Over:</strong> Nearly all layers are unlocked! ' +
                'This is almost like training from scratch, but with a head start. ' +
                'You need LOTS of pictures and time. Be careful -- the AI might forget everything it already knew!';
        } else {
            el.innerHTML = '<strong>Full Training (Nothing locked):</strong> All layers are learning from scratch! ' +
                'The borrowed brain is just a starting point. You need tons of pictures ' +
                'and lots of time. Go very slowly or you will erase all the smart stuff it already knew!';
        }
    },

    // ---- Quiz 6.3 ----
    startQuiz6_3() {
        Quiz.start({
            title: 'Chapter 6.3: Transfer Learning',
            chapterId: '6-3',
            questions: [
                {
                    question: 'What is transfer learning?',
                    options: [
                        'Teaching an AI from scratch with new pictures',
                        'Borrowing a smart AI brain and teaching it YOUR new task',
                        'Sending data from one computer to another',
                        'Moving the AI to a faster computer'
                    ],
                    correct: 1,
                    explanation: 'Transfer learning is borrowing a brain that already learned from millions of pictures and teaching it your own special thing. Like how a chef who knows French cooking can quickly learn Italian cooking!'
                },
                {
                    question: 'In feature extraction mode, which layers are locked (frozen)?',
                    options: [
                        'Only the last layer',
                        'ALL the borrowed layers are locked -- only the new answer part learns',
                        'Nothing is locked',
                        'Only the first layer'
                    ],
                    correct: 1,
                    explanation: 'In feature extraction mode, we lock ALL the borrowed layers. We only teach the new part we added on top. It is like keeping the foundation of a house and just painting the walls!'
                },
                {
                    question: 'Why do we learn slowly (low learning rate) when fine-tuning?',
                    options: [
                        'To finish faster',
                        'So we do not erase all the smart stuff the AI already learned',
                        'Slow learning is always better',
                        'It does not matter how fast we go'
                    ],
                    correct: 1,
                    explanation: 'The borrowed brain already knows amazing things! If we change it too fast, we could erase all that knowledge. It is like carefully editing a painting instead of painting over the whole thing!'
                },
                {
                    question: 'Which AI brain would you pick for a phone app?',
                    options: [
                        'VGG16 (super big -- 138 million numbers, 528MB)',
                        'ResNet50 (medium -- 25.6 million numbers, 98MB)',
                        'MobileNetV2 (tiny and fast -- 3.4 million numbers, 14MB)',
                        'Any brain works just as well on a phone'
                    ],
                    correct: 2,
                    explanation: 'MobileNetV2 was built specially for phones! It is tiny (only 14MB) but still smart. The big brains are too heavy for a phone -- like trying to fit a school bus in your garage!'
                }
            ]
        });
    }
};
