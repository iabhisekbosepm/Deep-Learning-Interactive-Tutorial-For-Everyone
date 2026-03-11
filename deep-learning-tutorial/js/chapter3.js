/* ============================================
   Chapter 3: Building From Scratch
   ============================================ */

const Chapter3 = {
    init() {
        App.registerChapter('3-1', () => this.loadChapter3_1());
        App.registerChapter('3-2', () => this.loadChapter3_2());
    },

    // ============================================
    // 3.1: Neural Network From Scratch
    // ============================================
    forwardPassStep: 0,

    loadChapter3_1() {
        const container = document.getElementById('chapter-3-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 3 \u2022 Chapter 3.1</span>
                <h1>Neural Network From Scratch</h1>
                <p>Let's build our very own brain-like network from scratch! No shortcuts allowed!
                   We'll learn how information travels forward (like passing a note in class)
                   and how we fix mistakes by going backward (like retracing your steps when you get lost).</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCD8</span> What Are Forward Pass and Backpropagation?</h2>
                <p><strong>Forward pass</strong> means sending an input through the network to get a prediction.
                   <strong>Backpropagation</strong> means sending the error backward so the network learns which weights should change.</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83C\uDFF7\uFE0F</span>
                    <span class="info-box-text"><strong>Real terms to remember:</strong> forward pass = prediction step,
                    gradient = how much a weight should change, backpropagation = error-correction step.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Why Do We Care?</h2>
                <p>These two steps are the basic learning loop of neural networks. Without a forward pass, the model cannot answer.
                   Without backpropagation, it cannot improve from mistakes.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDEE</span> One Worked Example</h2>
                <p>Suppose a neuron predicts <strong>0.80</strong>, but the correct answer is <strong>1.00</strong>.
                   The error is <strong>-0.20</strong>. If the input was <strong>0.50</strong>, then the gradient is roughly
                   <strong>-0.20 \u00D7 0.50 = -0.10</strong>. With learning rate <strong>0.1</strong>:</p>
                <div class="code-block">
prediction = 0.80
target = 1.00
error = prediction - target = -0.20
gradient = error * input = -0.10
new_weight = 0.40 - 0.1 * (-0.10) = 0.41
                </div>
                <p>The weight got a little bigger because the neuron predicted too low.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD27</span> The Building Blocks</h2>
                <p>A neural network does the same 4 easy steps over and over. It's like a recipe!</p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">1\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;">Multiply</div>
                        <div style="font-size:12px;color:var(--text-secondary);">inputs \u00D7 importance scores</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">2\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;">Add a Nudge</div>
                        <div style="font-size:12px;color:var(--text-secondary);">+ a little extra push</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">3\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;">Activate</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Decide: pass it on or not?</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">4\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;">Repeat</div>
                        <div style="font-size:12px;color:var(--text-secondary);">do it again for the next layer!</div>
                    </div>
                </div>
            </div>

            <!-- Interactive Forward Pass -->
            <div class="section">
                <h2><span class="section-icon">\u25B6\uFE0F</span> Interactive Forward Pass</h2>
                <p>Imagine passing a note through a chain of friends. Each friend changes it a little!
                   Watch the numbers travel through the network step by step. Cool, right?</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="network-viz">
                    <canvas id="forwardPassCanvas" width="800" height="320"></canvas>
                </div>

                <div class="step-explanation" id="fpExplanation">
                    Click "Next Step" to send information forward through the network, like passing a note in class!
                </div>

                <div class="step-indicator" id="fpSteps"></div>

                <div class="controls">
                    <button class="btn-secondary btn-small" onclick="Chapter3.resetForwardPass()">Reset</button>
                    <button class="btn-primary btn-small" onclick="Chapter3.nextForwardStep()">Next Step \u2192</button>
                    <button class="btn-secondary btn-small" onclick="Chapter3.autoForwardPass()">Auto Play</button>
                </div>
            </div>

            <!-- Python Implementation -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Python Implementation</h2>
                <p>Here's the fun part -- this is what it looks like written as real code!</p>

                <div class="code-block">
<span class="keyword">import</span> numpy <span class="keyword">as</span> np

<span class="keyword">class</span> <span class="function">NeuralNetwork</span>:
    <span class="keyword">def</span> <span class="function">__init__</span>(self, layers):
        self.weights = []
        self.biases = []
        <span class="keyword">for</span> i <span class="keyword">in</span> <span class="function">range</span>(<span class="function">len</span>(layers) - <span class="number">1</span>):
            w = np.random.<span class="function">randn</span>(layers[i], layers[i+<span class="number">1</span>]) * <span class="number">0.01</span>
            b = np.<span class="function">zeros</span>((<span class="number">1</span>, layers[i+<span class="number">1</span>]))
            self.weights.<span class="function">append</span>(w)
            self.biases.<span class="function">append</span>(b)

    <span class="keyword">def</span> <span class="function">relu</span>(self, z):
        <span class="keyword">return</span> np.<span class="function">maximum</span>(<span class="number">0</span>, z)

    <span class="keyword">def</span> <span class="function">forward</span>(self, X):
        self.activations = [X]
        <span class="keyword">for</span> i <span class="keyword">in</span> <span class="function">range</span>(<span class="function">len</span>(self.weights)):
            z = self.activations[-<span class="number">1</span>] @ self.weights[i] + self.biases[i]
            a = self.<span class="function">relu</span>(z) <span class="keyword">if</span> i < <span class="function">len</span>(self.weights)-<span class="number">1</span> <span class="keyword">else</span> z
            self.activations.<span class="function">append</span>(a)
        <span class="keyword">return</span> self.activations[-<span class="number">1</span>]

<span class="comment"># Build our brain: 2 inputs, 4 helpers in the middle, 1 answer</span>
nn = <span class="function">NeuralNetwork</span>([<span class="number">2</span>, <span class="number">4</span>, <span class="number">1</span>])
output = nn.<span class="function">forward</span>(np.array([[<span class="number">0.5</span>, <span class="number">0.8</span>]]))
                </div>
            </div>

            <!-- Backpropagation -->
            <div class="section">
                <h2><span class="section-icon">\u21A9\uFE0F</span> Backpropagation Visualized</h2>
                <p>Think of it like this: when you get a wrong answer on a test, you go backward
                   to find where you made the mistake. That's backpropagation! It retraces steps
                   to fix each importance score a little bit.</p>
                <div class="info-box warning">
                    <span class="info-box-icon">\uD83D\uDCCD</span>
                    <span class="info-box-text"><strong>Definition:</strong> a gradient tells each weight which direction to move
                    and how strongly. Backpropagation computes those gradients from the output layer back toward the input.</span>
                </div>

                <div class="network-viz">
                    <canvas id="backpropCanvas" width="800" height="250"></canvas>
                </div>
                <div class="text-center">
                    <button class="btn-secondary btn-small" onclick="Chapter3.animateBackprop()">
                        \u25B6 Animate Backpropagation
                    </button>
                </div>

                <div class="code-block mt-16">
<span class="keyword">def</span> <span class="function">backward</span>(self, X, y, learning_rate=<span class="number">0.01</span>):
    m = X.shape[<span class="number">0</span>]
    <span class="comment"># How far off was our guess?</span>
    delta = self.activations[-<span class="number">1</span>] - y

    <span class="comment"># Go backward through each layer to find who made mistakes</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> <span class="function">reversed</span>(<span class="function">range</span>(<span class="function">len</span>(self.weights))):
        <span class="comment"># Figure out how much each importance score was wrong</span>
        dW = self.activations[i].T @ delta / m
        db = np.<span class="function">sum</span>(delta, axis=<span class="number">0</span>) / m

        <span class="comment"># Pass the blame to the layer before this one</span>
        <span class="keyword">if</span> i > <span class="number">0</span>:
            delta = (delta @ self.weights[i].T)
            delta[self.activations[i] <= <span class="number">0</span>] = <span class="number">0</span>  <span class="comment"># ReLU says: ignore if it was zero</span>

        <span class="comment"># Fix the importance scores a tiny bit (step size controls how much)</span>
        self.weights[i] -= learning_rate * dW
        self.biases[i] -= learning_rate * db
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter3.startQuiz3_1()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('2-5')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('3-2')">Next: SGD vs GD \u2192</button>
            </div>
        `;

        this.resetForwardPass();
        this.drawBackpropNetwork();
    },

    // Forward pass data
    fpData: {
        inputs: [0.5, 0.8],
        w1: [[0.4, -0.2], [0.6, 0.3]],
        b1: [0.1, -0.1],
        w2: [0.7, -0.5],
        b2: 0.2,
        z1: [], a1: [], z2: 0, a2: 0
    },

    resetForwardPass() {
        this.forwardPassStep = 0;
        this.fpData.z1 = []; this.fpData.a1 = [];
        this.fpData.z2 = 0; this.fpData.a2 = 0;
        this.drawForwardPass();
        const el = document.getElementById('fpExplanation');
        if (el) el.innerHTML = 'Click "Next Step" to send information forward through the network, like passing a note in class!';
        this.updateFPSteps();
    },

    updateFPSteps() {
        const el = document.getElementById('fpSteps');
        if (!el) return;
        const total = 5;
        el.innerHTML = Array(total).fill(0).map((_, i) =>
            `<div class="step-dot ${i < this.forwardPassStep ? 'completed' : ''} ${i === this.forwardPassStep ? 'active' : ''}"></div>`
        ).join('');
    },

    nextForwardStep() {
        const d = this.fpData;
        const expl = document.getElementById('fpExplanation');
        if (this.forwardPassStep >= 5) { this.resetForwardPass(); return; }

        switch (this.forwardPassStep) {
            case 0:
                expl.innerHTML = `<strong>Step 1: Input</strong> x = [${d.inputs.join(', ')}]`;
                break;
            case 1:
                d.z1[0] = d.inputs[0]*d.w1[0][0] + d.inputs[1]*d.w1[1][0] + d.b1[0];
                d.z1[1] = d.inputs[0]*d.w1[0][1] + d.inputs[1]*d.w1[1][1] + d.b1[1];
                expl.innerHTML = `<strong>Step 2: Hidden layer (weighted sum)</strong><br>
                    z1[0] = ${d.inputs[0]}\u00D7${d.w1[0][0]} + ${d.inputs[1]}\u00D7${d.w1[1][0]} + ${d.b1[0]} = <strong>${d.z1[0].toFixed(2)}</strong><br>
                    z1[1] = ${d.inputs[0]}\u00D7${d.w1[0][1]} + ${d.inputs[1]}\u00D7${d.w1[1][1]} + ${d.b1[1]} = <strong>${d.z1[1].toFixed(2)}</strong>`;
                break;
            case 2:
                d.a1 = d.z1.map(z => Math.max(0, z));
                expl.innerHTML = `<strong>Step 3: ReLU Activation</strong><br>
                    a1[0] = ReLU(${d.z1[0].toFixed(2)}) = <strong>${d.a1[0].toFixed(2)}</strong><br>
                    a1[1] = ReLU(${d.z1[1].toFixed(2)}) = <strong>${d.a1[1].toFixed(2)}</strong>`;
                break;
            case 3:
                d.z2 = d.a1[0]*d.w2[0] + d.a1[1]*d.w2[1] + d.b2;
                expl.innerHTML = `<strong>Step 4: Output layer (weighted sum)</strong><br>
                    z2 = ${d.a1[0].toFixed(2)}\u00D7${d.w2[0]} + ${d.a1[1].toFixed(2)}\u00D7${d.w2[1]} + ${d.b2} = <strong>${d.z2.toFixed(3)}</strong>`;
                break;
            case 4:
                d.a2 = 1 / (1 + Math.exp(-d.z2));
                expl.innerHTML = `<strong>Step 5: Sigmoid output</strong><br>
                    output = sigmoid(${d.z2.toFixed(3)}) = <strong>${d.a2.toFixed(4)}</strong><br>
                    This is the network's prediction!`;
                break;
        }
        this.forwardPassStep++;
        this.updateFPSteps();
        this.drawForwardPass();
    },

    autoForwardPass() {
        this.resetForwardPass();
        let step = 0;
        const iv = setInterval(() => {
            if (step >= 5) { clearInterval(iv); return; }
            this.nextForwardStep();
            step++;
        }, 1200);
    },

    drawForwardPass() {
        const canvas = document.getElementById('forwardPassCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const d = this.fpData;
        const step = this.forwardPassStep;
        const layers = [
            { label: 'Input', x: 100, nodes: [{v: d.inputs[0], l:'x1'},{v: d.inputs[1], l:'x2'}], color: '#3b82f6' },
            { label: 'Hidden', x: 350, nodes: [{v: step>2?d.a1[0]:step>1?d.z1[0]:null, l:'h1'},{v: step>2?d.a1[1]:step>1?d.z1[1]:null, l:'h2'}], color: '#8b5cf6' },
            { label: 'Output', x: 600, nodes: [{v: step>4?d.a2:step>3?d.z2:null, l:'y'}], color: '#10b981' }
        ];

        // Connections
        const active = (lIdx) => step > lIdx;
        for (let l = 0; l < layers.length - 1; l++) {
            const from = layers[l], to = layers[l+1];
            for (let i = 0; i < from.nodes.length; i++) {
                for (let j = 0; j < to.nodes.length; j++) {
                    const y1 = H / (from.nodes.length + 1) * (i + 1);
                    const y2 = H / (to.nodes.length + 1) * (j + 1);
                    ctx.beginPath();
                    ctx.moveTo(from.x, y1); ctx.lineTo(to.x, y2);
                    ctx.strokeStyle = active(l) ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)';
                    ctx.lineWidth = active(l) ? 2 : 1;
                    ctx.stroke();
                }
            }
        }

        // Nodes
        layers.forEach((layer, lIdx) => {
            layer.nodes.forEach((node, i) => {
                const y = H / (layer.nodes.length + 1) * (i + 1);
                ctx.beginPath();
                ctx.arc(layer.x, y, 24, 0, Math.PI * 2);
                ctx.fillStyle = (step > lIdx) ? layer.color : 'rgba(255,255,255,0.1)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px JetBrains Mono';
                ctx.textAlign = 'center';
                if (node.v !== null && node.v !== undefined) {
                    ctx.fillText(typeof node.v === 'number' ? node.v.toFixed(2) : '', layer.x, y + 4);
                } else {
                    ctx.fillText(node.l, layer.x, y + 4);
                }
            });

            ctx.fillStyle = '#8b95a8';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(layer.label, layer.x, H - 10);
        });
    },

    // Backprop animation
    backpropAnimating: false,

    drawBackpropNetwork() {
        const canvas = document.getElementById('backpropCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const layers = [
            { x: 120, nodes: 3, color: '#3b82f6', label: 'Input' },
            { x: 320, nodes: 4, color: '#8b5cf6', label: 'Hidden' },
            { x: 520, nodes: 3, color: '#a855f7', label: 'Hidden 2' },
            { x: 700, nodes: 2, color: '#10b981', label: 'Output' }
        ];

        for (let l = 0; l < layers.length - 1; l++) {
            const from = layers[l], to = layers[l+1];
            for (let i = 0; i < from.nodes; i++) {
                for (let j = 0; j < to.nodes; j++) {
                    const y1 = H / (from.nodes + 1) * (i + 1);
                    const y2 = H / (to.nodes + 1) * (j + 1);
                    ctx.beginPath(); ctx.moveTo(from.x, y1); ctx.lineTo(to.x, y2);
                    ctx.strokeStyle = 'rgba(99,102,241,0.1)'; ctx.lineWidth = 1; ctx.stroke();
                }
            }
        }

        layers.forEach(layer => {
            for (let i = 0; i < layer.nodes; i++) {
                const y = H / (layer.nodes + 1) * (i + 1);
                ctx.beginPath(); ctx.arc(layer.x, y, 12, 0, Math.PI * 2);
                ctx.fillStyle = layer.color; ctx.fill();
            }
            ctx.fillStyle = '#8b95a8'; ctx.font = '11px Inter'; ctx.textAlign = 'center';
            ctx.fillText(layer.label, layer.x, H - 8);
        });
    },

    animateBackprop() {
        if (this.backpropAnimating) return;
        this.backpropAnimating = true;

        const canvas = document.getElementById('backpropCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        const layers = [
            { x: 700, nodes: 2 }, { x: 520, nodes: 3 },
            { x: 320, nodes: 4 }, { x: 120, nodes: 3 }
        ];

        let particles = [], layerIdx = 0;

        const createParticles = (from, to) => {
            for (let i = 0; i < from.nodes; i++) {
                const y1 = H / (from.nodes + 1) * (i + 1);
                const j = Math.floor(Math.random() * to.nodes);
                const y2 = H / (to.nodes + 1) * (j + 1);
                particles.push({ x: from.x, y: y1, tx: to.x, ty: y2, progress: 0, speed: 0.015 + Math.random() * 0.01 });
            }
        };
        createParticles(layers[0], layers[1]);

        const animate = () => {
            this.drawBackpropNetwork();
            ctx.fillStyle = '#ef4444'; ctx.font = 'bold 13px Inter'; ctx.textAlign = 'center';
            ctx.fillText('\u2190 Gradients flow backward', W / 2, 20);

            let allDone = true;
            particles.forEach(p => {
                p.progress += p.speed;
                if (p.progress < 1) {
                    allDone = false;
                    const x = p.x + (p.tx - p.x) * p.progress;
                    const y = p.y + (p.ty - p.y) * p.progress;
                    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
                    ctx.fill(); ctx.shadowBlur = 0;
                }
            });

            if (allDone) {
                layerIdx++;
                if (layerIdx < layers.length - 1) {
                    particles = [];
                    createParticles(layers[layerIdx], layers[layerIdx + 1]);
                    requestAnimationFrame(animate);
                } else {
                    this.backpropAnimating = false;
                    this.drawBackpropNetwork();
                }
            } else {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    },

    startQuiz3_1() {
        Quiz.start({
            title: 'Chapter 3.1: NN From Scratch', chapterId: '3-1',
            questions: [
                { question: 'What are the 4 steps the network does in each layer?',
                  options: ['Multiply, Add a nudge, Activate, Pass to the next layer', 'Load, Compute, Save, Return', 'Read, Process, Write, Log', 'Input, Filter, Sort, Output'],
                  correct: 0, explanation: 'Think of it like a recipe! Each layer multiplies inputs by importance scores, adds a little nudge, decides what to pass on, then sends it forward.' },
                { question: 'What does backpropagation do? (Going backward to fix mistakes)',
                  options: ['It gives us the final answer', 'It figures out how much each importance score was wrong', 'It counts how many layers we need', 'It loads the training data'],
                  correct: 1, explanation: 'Imagine getting a wrong answer on a test. Backpropagation goes backward step by step to find which importance scores caused the mistake, so we can fix them!' },
                { question: 'When sending info forward, which step lets the network learn tricky patterns?',
                  options: ['Multiplying numbers together', 'Adding a nudge', 'The activation function (the on/off switch)', 'Softmax'],
                  correct: 2, explanation: 'The activation function is like a gatekeeper. It decides what gets through. Without it, the network could only learn simple straight-line patterns. Boring!' },
                { question: 'What happens to importance scores during training?',
                  options: ['They never change', 'They get adjusted a tiny bit each round to reduce mistakes', 'They double every round', 'They get randomly scrambled'],
                  correct: 1, explanation: 'Each round of practice, the importance scores change by a small step size. It is like tuning a guitar string a tiny bit until it sounds just right!' },
                { question: 'Why do we start with small random importance scores instead of all zeros?',
                  options: ['To save space', 'So each brain cell can learn something different', 'To make it go faster', 'It does not matter at all'],
                  correct: 1, explanation: 'If all scores start at zero, every brain cell does the exact same thing. That is like every player on a soccer team standing in the same spot. Random starting values let each one learn its own special job!' }
            ]
        });
    },

    // ============================================
    // 3.2: SGD vs GD Battle
    // ============================================
    raceRunning: false,

    loadChapter3_2() {
        const container = document.getElementById('chapter-3-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 3 \u2022 Chapter 3.2</span>
                <h1>SGD vs GD Battle</h1>
                <p>How should our network practice? By looking at ALL the examples at once,
                   just ONE at a time, or a small group? Let's race them and see who wins!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFCE\uFE0F</span> The Three Contenders</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="info-box" style="flex-direction:column;text-align:center;">
                        <strong style="color:#6366f1;">Batch GD</strong>
                        <span class="info-box-text">Learns from ALL examples at once. Steady but super slow. Imagine reading an entire book before answering one homework question!</span>
                    </div>
                    <div class="info-box" style="flex-direction:column;text-align:center;">
                        <strong style="color:#10b981;">SGD</strong>
                        <span class="info-box-text">Learns from ONE example at a time (like a quick learner!). Super fast but a bit jumpy. It's like studying from random flashcards -- sometimes you learn the wrong thing!</span>
                    </div>
                    <div class="info-box" style="flex-direction:column;text-align:center;">
                        <strong style="color:#f59e0b;">Mini-Batch</strong>
                        <span class="info-box-text">Learns from a small group at a time (the best of both!). Not too slow, not too jumpy. This is what the pros use!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFC1</span> Race Simulator</h2>
                <p>Amazing -- it's race time! Watch all three learners try to get close to the right answer the fastest!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="graph-container">
                    <canvas id="raceCanvas" width="750" height="350"></canvas>
                    <div class="graph-legend">
                        <div class="legend-item active"><span class="legend-dot" style="background:#6366f1;"></span> Batch GD</div>
                        <div class="legend-item active"><span class="legend-dot" style="background:#10b981;"></span> SGD</div>
                        <div class="legend-item active"><span class="legend-dot" style="background:#f59e0b;"></span> Mini-Batch</div>
                    </div>
                </div>

                <div class="gd-stats" id="raceStats">
                    <div class="gd-stat"><div class="stat-label">Epoch</div><div class="stat-value" id="raceEpoch">0</div></div>
                    <div class="gd-stat"><div class="stat-label">Batch GD Loss</div><div class="stat-value" id="raceBatch" style="color:#6366f1;">2.000</div></div>
                    <div class="gd-stat"><div class="stat-label">SGD Loss</div><div class="stat-value" id="raceSGD" style="color:#10b981;">2.000</div></div>
                    <div class="gd-stat"><div class="stat-label">Mini-Batch Loss</div><div class="stat-value" id="raceMini" style="color:#f59e0b;">2.000</div></div>
                </div>

                <div class="controls">
                    <button class="btn-primary btn-small" id="raceBtn" onclick="Chapter3.toggleRace()">\u25B6 Start Race</button>
                    <button class="btn-secondary btn-small" onclick="Chapter3.resetRace()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCDD</span> Key Differences</h2>
                <div class="code-block">
<span class="comment"># Batch GD: Study EVERYTHING before each answer (slow but steady)</span>
<span class="keyword">for</span> epoch <span class="keyword">in</span> <span class="function">range</span>(epochs):
    gradient = <span class="function">compute_gradient</span>(ALL_DATA)    <span class="comment"># Looks at ALL examples (slow!)</span>
    weights -= lr * gradient                 <span class="comment"># Makes one careful change</span>

<span class="comment"># SGD: Learn from one random example at a time (fast but jumpy)</span>
<span class="keyword">for</span> epoch <span class="keyword">in</span> <span class="function">range</span>(epochs):
    <span class="keyword">for</span> sample <span class="keyword">in</span> <span class="function">shuffle</span>(data):
        gradient = <span class="function">compute_gradient</span>(sample)   <span class="comment"># Just 1 example (super fast!)</span>
        weights -= lr * gradient              <span class="comment"># Quick but wobbly changes</span>

<span class="comment"># Mini-Batch: Learn from a small group at a time (the best of both!)</span>
<span class="keyword">for</span> epoch <span class="keyword">in</span> <span class="function">range</span>(epochs):
    <span class="keyword">for</span> batch <span class="keyword">in</span> <span class="function">get_batches</span>(data, size=<span class="number">32</span>):
        gradient = <span class="function">compute_gradient</span>(batch)    <span class="comment"># A small group (just right!)</span>
        weights -= lr * gradient              <span class="comment"># Nice balanced changes</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter3.startQuiz3_2()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('3-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('4-1')">Next: TensorBoard \u2192</button>
            </div>
        `;

        this.resetRace();
    },

    raceData: { batch: [], sgd: [], mini: [], epoch: 0 },

    resetRace() {
        this.raceRunning = false;
        this.raceData = { batch: [2.0], sgd: [2.0], mini: [2.0], epoch: 0 };
        const btn = document.getElementById('raceBtn');
        if (btn) btn.textContent = '\u25B6 Start Race';
        this.drawRace();
        this.updateRaceStats();
    },

    toggleRace() {
        this.raceRunning = !this.raceRunning;
        const btn = document.getElementById('raceBtn');
        if (btn) btn.textContent = this.raceRunning ? '\u23F8 Pause' : '\u25B6 Resume';
        if (this.raceRunning) this.runRace();
    },

    runRace() {
        if (!this.raceRunning || this.raceData.epoch >= 50) {
            this.raceRunning = false;
            const btn = document.getElementById('raceBtn');
            if (btn) btn.textContent = '\u25B6 Start Race';
            return;
        }

        const d = this.raceData;
        d.epoch++;

        const batchLast = d.batch[d.batch.length - 1];
        const sgdLast = d.sgd[d.sgd.length - 1];
        const miniLast = d.mini[d.mini.length - 1];

        d.batch.push(Math.max(0.05, batchLast * 0.92 + (Math.random() - 0.5) * 0.02));
        d.sgd.push(Math.max(0.05, sgdLast * 0.88 + (Math.random() - 0.5) * 0.15));
        d.mini.push(Math.max(0.05, miniLast * 0.90 + (Math.random() - 0.5) * 0.06));

        this.drawRace();
        this.updateRaceStats();
        setTimeout(() => this.runRace(), 200);
    },

    updateRaceStats() {
        const d = this.raceData;
        const el = id => document.getElementById(id);
        if (el('raceEpoch')) el('raceEpoch').textContent = d.epoch;
        if (el('raceBatch')) el('raceBatch').textContent = d.batch[d.batch.length-1].toFixed(3);
        if (el('raceSGD')) el('raceSGD').textContent = d.sgd[d.sgd.length-1].toFixed(3);
        if (el('raceMini')) el('raceMini').textContent = d.mini[d.mini.length-1].toFixed(3);
    },

    drawRace() {
        const canvas = document.getElementById('raceCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 30, left: 50 };
        ctx.clearRect(0, 0, W, H);

        const plotW = W - pad.left - pad.right, plotH = H - pad.top - pad.bottom;
        const d = this.raceData;
        const maxEpoch = 50;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + plotH * (i / 4);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }

        const drawLine = (data, color) => {
            if (data.length < 2) return;
            ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2.5;
            data.forEach((v, i) => {
                const x = pad.left + (i / maxEpoch) * plotW;
                const y = pad.top + plotH * (1 - (2.5 - v) / 2.5);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, Math.max(pad.top, Math.min(pad.top + plotH, y)));
            });
            ctx.stroke();
        };

        drawLine(d.batch, '#6366f1');
        drawLine(d.sgd, '#10b981');
        drawLine(d.mini, '#f59e0b');

        ctx.fillStyle = '#5a6478'; ctx.font = '11px Inter'; ctx.textAlign = 'center';
        ctx.fillText('Epochs', W / 2, H - 5);
        ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText('Loss', 0, 0); ctx.restore();
    },

    startQuiz3_2() {
        Quiz.start({
            title: 'Chapter 3.2: SGD vs GD', chapterId: '3-2',
            questions: [
                { question: 'What makes SGD "stochastic" (a fancy word for random)?', options: ['It starts with random importance scores', 'It picks ONE random example to learn from each time', 'Its step size is random', 'It adds random layers'], correct: 1, explanation: '"Stochastic" just means random. SGD randomly grabs one example, learns from it, and moves on. Like picking a random flashcard from a pile!' },
                { question: 'How many examples does Mini-Batch usually look at?', options: ['Just 1', 'A small group of 32 to 256', '10,000', 'All of them'], correct: 1, explanation: 'Mini-Batch looks at a small group -- usually 32, 64, 128, or 256 examples at a time. Think of it like studying with a small group of friends instead of alone or with the whole school!' },
                { question: 'SGD is a bit jumpy, but why can that actually help?', options: ['The jumpiness helps it escape small dips and find the deepest valley (best answer)', 'It just makes training faster', 'Jumpiness is never helpful', 'It totally stops memorizing'], correct: 0, explanation: 'Imagine looking for the lowest point in a hilly area. If you walk too smoothly, you might get stuck in a small dip. But if you jump around a bit, you might find an even deeper valley -- the best answer!' },
                { question: 'Which learner is the fastest but wobbliest?', options: ['Batch GD (reads everything)', 'SGD (one example at a time)', 'Mini-Batch GD (small groups)', 'Adam'], correct: 1, explanation: 'SGD only looks at one example at a time, so it is lightning fast! But learning from just one example makes it wobbly, like trying to guess what the whole class thinks by asking just one student.' }
            ]
        });
    }
};
