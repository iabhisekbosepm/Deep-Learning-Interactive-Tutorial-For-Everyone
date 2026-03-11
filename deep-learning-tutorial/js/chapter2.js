/* ============================================
   Chapter 2: The Math Behind the Magic
   ============================================ */

const Chapter2 = {
    init() {
        App.registerChapter('2-1', () => this.loadChapter2_1());
        App.registerChapter('2-2', () => this.loadChapter2_2());
        App.registerChapter('2-3', () => this.loadChapter2_3());
        App.registerChapter('2-4', () => this.loadChapter2_4());
        App.registerChapter('2-5', () => this.loadChapter2_5());
    },

    // ============================================
    // 2.1: Activation Functions
    // ============================================
    activeFunctions: ['relu', 'sigmoid', 'tanh'],

    loadChapter2_1() {
        const container = document.getElementById('chapter-2-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 2 \u2022 Chapter 2.1</span>
                <h1>Activation Functions Playground</h1>
                <p>Activation functions are like on/off switches for each tiny brain helper.
                   They decide if a helper should speak up or stay quiet!
                   Without them, the network could only learn straight-line patterns. Boring!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u26A1</span> Why Do We Need Activation Functions?</h2>
                <p>Imagine you can only draw with a ruler -- just straight lines.
                   No matter how many straight lines you stack, you can never draw a circle!
                   Activation functions let the network learn curvy, wiggly patterns --
                   not just boring straight lines. That is what makes them so cool!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Here is the fun part: without activation functions, even a network
                    with 100 layers would be no smarter than one with just 1 layer!
                    The ability to learn curvy patterns is what makes deep networks powerful!</span>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\uD83C\uDFF7\uFE0F</span>
                    <span class="info-box-text"><strong>Real term to remember:</strong> an <strong>activation function</strong> is the formula that turns a neuron's weighted sum into its output.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Interactive Visualizer</h2>
                <p>Click the names below to turn them on or off.
                   Watch how each on/off switch changes numbers in a different way!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="graph-container">
                    <canvas id="activationCanvas" width="750" height="350"></canvas>
                    <div class="graph-legend" id="activationLegend">
                        <div class="legend-item active" onclick="Chapter2.toggleActivation('relu')" id="legend-relu">
                            <span class="legend-dot" style="background: #6366f1;"></span>
                            ReLU
                        </div>
                        <div class="legend-item active" onclick="Chapter2.toggleActivation('sigmoid')" id="legend-sigmoid">
                            <span class="legend-dot" style="background: #10b981;"></span>
                            Sigmoid
                        </div>
                        <div class="legend-item active" onclick="Chapter2.toggleActivation('tanh')" id="legend-tanh">
                            <span class="legend-dot" style="background: #f59e0b;"></span>
                            Tanh
                        </div>
                        <div class="legend-item" onclick="Chapter2.toggleActivation('leaky')" id="legend-leaky">
                            <span class="legend-dot" style="background: #ef4444;"></span>
                            Leaky ReLU
                        </div>
                    </div>
                </div>

                <h3>How Each Function Works</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
                    <div class="info-box">
                        <span class="info-box-icon" style="color: #6366f1;">\u25CF</span>
                        <span class="info-box-text">
                            <strong>ReLU</strong>: If positive, keep it. If negative, make it zero!<br>
                            Think of it like a door that only lets good vibes through. The most popular on/off switch!
                        </span>
                    </div>
                    <div class="info-box">
                        <span class="info-box-icon" style="color: #10b981;">\u25CF</span>
                        <span class="info-box-text">
                            <strong>Sigmoid</strong>: Squishes any number into a score between 0 and 1, like a percentage!<br>
                            Great for yes/no answers. But it can make the learning signal get weaker and weaker, like a whisper in a long hallway.
                        </span>
                    </div>
                    <div class="info-box">
                        <span class="info-box-icon" style="color: #f59e0b;">\u25CF</span>
                        <span class="info-box-text">
                            <strong>Tanh</strong>: Squishes numbers to be between -1 and 1.<br>
                            Imagine a thermometer that only goes from -1 to 1. It puts zero right in the middle, which helps learning!
                        </span>
                    </div>
                    <div class="info-box">
                        <span class="info-box-icon" style="color: #ef4444;">\u25CF</span>
                        <span class="info-box-text">
                            <strong>Leaky ReLU</strong>: Like ReLU, but lets a tiny trickle through for negatives instead of blocking them completely.<br>
                            This fixes a problem where some brain helpers would "fall asleep" and never wake up!
                        </span>
                    </div>
                </div>
            </div>

            <!-- Neuron Simulator -->
            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE0</span> Single Neuron Simulator</h2>
                <p>Move the sliders to see how one tiny brain helper does its job!
                   It takes a number, multiplies it by an importance score (weight), adds a little extra push (bias), then runs it through the on/off switch!</p>

                <div class="controls">
                    <div class="control-group">
                        <label>Input (x)</label>
                        <input type="range" id="neuronInput" min="-5" max="5" value="1" step="0.1"
                               oninput="Chapter2.updateNeuron()">
                        <span class="slider-value" id="neuronInputVal">1.0</span>
                    </div>
                    <div class="control-group">
                        <label>Weight (w)</label>
                        <input type="range" id="neuronWeight" min="-3" max="3" value="1" step="0.1"
                               oninput="Chapter2.updateNeuron()">
                        <span class="slider-value" id="neuronWeightVal">1.0</span>
                    </div>
                    <div class="control-group">
                        <label>Bias (b)</label>
                        <input type="range" id="neuronBias" min="-3" max="3" value="0" step="0.1"
                               oninput="Chapter2.updateNeuron()">
                        <span class="slider-value" id="neuronBiasVal">0.0</span>
                    </div>
                </div>

                <div class="step-explanation" id="neuronExplanation">
                    z = w \u00D7 x + b = 1.0 \u00D7 1.0 + 0.0 = <strong>1.0</strong><br>
                    ReLU(1.0) = <strong>1.0</strong> |
                    Sigmoid(1.0) = <strong>0.731</strong> |
                    Tanh(1.0) = <strong>0.762</strong>
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter2.startQuiz2_1()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('1-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('2-2')">Next: Derivatives \u2192</button>
            </div>
        `;

        this.drawActivationGraph();
        this.updateNeuron();
    },

    toggleActivation(name) {
        const idx = this.activeFunctions.indexOf(name);
        const legend = document.getElementById(`legend-${name}`);
        if (idx >= 0) {
            this.activeFunctions.splice(idx, 1);
            legend.classList.remove('active');
        } else {
            this.activeFunctions.push(name);
            legend.classList.add('active');
        }
        this.drawActivationGraph();
    },

    drawActivationGraph() {
        const canvas = document.getElementById('activationCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += 50) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y <= H; y += 50) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

        // Labels
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        for (let i = -6; i <= 6; i++) {
            if (i === 0) continue;
            ctx.fillText(i.toString(), cx + i * 50, cy + 16);
        }
        ctx.textAlign = 'right';
        for (let i = -3; i <= 3; i++) {
            if (i === 0) continue;
            ctx.fillText(i.toString(), cx - 8, cy - i * 50 + 4);
        }

        const scaleX = 50, scaleY = 50;

        const functions = {
            relu: { fn: x => Math.max(0, x), color: '#6366f1' },
            sigmoid: { fn: x => 1 / (1 + Math.exp(-x)), color: '#10b981' },
            tanh: { fn: x => Math.tanh(x), color: '#f59e0b' },
            leaky: { fn: x => x >= 0 ? x : 0.01 * x, color: '#ef4444' }
        };

        this.activeFunctions.forEach(name => {
            const { fn, color } = functions[name];
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;

            for (let px = 0; px <= W; px++) {
                const x = (px - cx) / scaleX;
                const y = fn(x);
                const py = cy - y * scaleY;
                if (px === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        });
    },

    updateNeuron() {
        const x = parseFloat(document.getElementById('neuronInput')?.value || 0);
        const w = parseFloat(document.getElementById('neuronWeight')?.value || 1);
        const b = parseFloat(document.getElementById('neuronBias')?.value || 0);

        document.getElementById('neuronInputVal').textContent = x.toFixed(1);
        document.getElementById('neuronWeightVal').textContent = w.toFixed(1);
        document.getElementById('neuronBiasVal').textContent = b.toFixed(1);

        const z = w * x + b;
        const relu = Math.max(0, z);
        const sigmoid = 1 / (1 + Math.exp(-z));
        const tanh = Math.tanh(z);

        document.getElementById('neuronExplanation').innerHTML =
            `z = w \u00D7 x + b = ${w.toFixed(1)} \u00D7 ${x.toFixed(1)} + ${b.toFixed(1)} = <strong>${z.toFixed(2)}</strong><br>` +
            `ReLU(${z.toFixed(2)}) = <strong>${relu.toFixed(3)}</strong> | ` +
            `Sigmoid(${z.toFixed(2)}) = <strong>${sigmoid.toFixed(3)}</strong> | ` +
            `Tanh(${z.toFixed(2)}) = <strong>${tanh.toFixed(3)}</strong>`;
    },

    startQuiz2_1() {
        Quiz.start({
            title: 'Chapter 2.1: Activation Functions',
            chapterId: '2-1',
            questions: [
                {
                    question: 'Why do we need on/off switches (activation functions)?',
                    options: [
                        'To make the network go faster',
                        'So the network can learn curvy patterns, not just straight lines',
                        'To use fewer numbers',
                        'To make the answer always positive'
                    ],
                    correct: 1,
                    explanation: 'Without on/off switches, stacking layers would be like stacking rulers -- you still only get straight lines! The switches let the network learn curves and wiggles.'
                },
                {
                    question: 'What does ReLU do when it gets a negative number?',
                    options: ['Keeps the number', 'Turns it to 0', 'Turns it to -1', 'Turns it to 1'],
                    correct: 1,
                    explanation: 'ReLU is simple: if the number is positive, keep it. If it is negative, make it zero. Like a door that blocks anything below zero!'
                },
                {
                    question: 'Sigmoid squishes numbers into what range?',
                    options: ['Between -1 and 1', 'Between 0 and 1', 'Between 0 and forever', 'Any number at all'],
                    correct: 1,
                    explanation: 'Sigmoid squishes any number into a score between 0 and 1, like a percentage! Really useful when you need a yes-or-no answer.'
                },
                {
                    question: 'What problem does Leaky ReLU fix?',
                    options: [
                        'The learning signal getting too weak with Sigmoid',
                        'Brain helpers falling asleep and never waking up with regular ReLU',
                        'Slow math',
                        'Memorizing answers instead of learning'
                    ],
                    correct: 1,
                    explanation: 'Sometimes with regular ReLU, a brain helper gets stuck at zero forever -- it falls asleep! Leaky ReLU lets a tiny bit through so it can still wake up.'
                },
                {
                    question: 'A brain helper calculates: 2 times 3 plus (-1) = 5. What does ReLU give us?',
                    options: ['0', '1', '5', '0.5'],
                    correct: 2,
                    explanation: 'ReLU says: is 5 positive? Yes! So keep it. ReLU(5) = 5. Easy peasy!'
                }
            ]
        });
    },

    // ============================================
    // 2.2: Derivatives
    // ============================================
    derivativeX: 1.0,

    loadChapter2_2() {
        const container = document.getElementById('chapter-2-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 2 \u2022 Chapter 2.2</span>
                <h1>Derivatives Made Simple</h1>
                <p>A derivative tells you how fast something is changing.
                   Think of it like checking how steep a hill is under your feet!
                   This helps the network know which way to go to get better.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCC8</span> What is a Derivative?</h2>
                <p>A derivative tells you <strong>how steep the hill is</strong> at the exact spot where you're standing.
                   Imagine asking: "If I take one tiny step forward, do I go up, down, or stay flat?"</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDE97</span>
                    <span class="info-box-text">Think of it like riding your bike. Your speed tells you how fast your position changes --
                    that is a derivative! And when you pedal harder, your speed goes up -- that change in speed is another derivative!
                    It is just like asking "how fast is this thing changing right now?"</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Tangent Line Explorer</h2>
                <p>Move the slider to slide the yellow dot along the curve. See the red dashed line?
                   That shows how steep the hill is at that spot! Steeper line = bigger change = bigger derivative.</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Function</label>
                        <select id="derivativeFunc" onchange="Chapter2.drawDerivative()">
                            <option value="quadratic">f(x) = x\u00B2</option>
                            <option value="cubic">f(x) = x\u00B3</option>
                            <option value="sine">f(x) = sin(x)</option>
                            <option value="sigmoid">f(x) = sigmoid(x)</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Point (x = <span id="derivXVal">1.0</span>)</label>
                        <input type="range" id="derivativeSlider" min="-3" max="3" value="1" step="0.1"
                               oninput="Chapter2.updateDerivative()">
                    </div>
                </div>

                <div class="graph-container">
                    <canvas id="derivativeCanvas" width="750" height="350"></canvas>
                </div>

                <div class="step-explanation" id="derivativeExplanation">
                    At x = 1.0: f(1.0) = 1.00, f'(1.0) = 2.00 (slope of tangent line)
                </div>
            </div>

            <!-- Chain Rule -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD17</span> The Chain Rule (Key to Backpropagation)</h2>
                <p>The chain rule is like connecting changes together, like dominoes!
                   When one domino falls, it knocks the next one, which knocks the next one.
                   This is how the network figures out which importance scores to change.</p>

                <div class="code-block">
<span class="comment"># The chain rule: connect changes like dominoes!</span>
dy/dx = <span class="function">f'</span>(g(x)) <span class="keyword">*</span> <span class="function">g'</span>(x)

<span class="comment"># Imagine: you double a number, then square it</span>
<span class="comment"># How fast does the final answer change? Multiply the changes together!</span>
dy/dx = <span class="number">2u</span> <span class="keyword">*</span> <span class="number">2</span> = <span class="number">2(2x+1)</span> <span class="keyword">*</span> <span class="number">2</span> = <span class="number">4(2x+1)</span>

<span class="comment"># In a neural network, the dominoes fall backwards through all layers:</span>
dLoss/dWeight = dLoss/dOutput <span class="keyword">*</span> dOutput/dHidden <span class="keyword">*</span> dHidden/dWeight
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u2B50</span>
                    <span class="info-box-text">This domino chain of changes is exactly how the network learns!
                    The message travels backward through the network, telling each importance score:
                    "Hey, here's how you should change to do better next time!"</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter2.startQuiz2_2()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('2-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('2-3')">Next: Matrix Math \u2192</button>
            </div>
        `;

        this.drawDerivative();
    },

    updateDerivative() {
        this.derivativeX = parseFloat(document.getElementById('derivativeSlider')?.value || 1);
        document.getElementById('derivXVal').textContent = this.derivativeX.toFixed(1);
        this.drawDerivative();
    },

    drawDerivative() {
        const canvas = document.getElementById('derivativeCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        const funcName = document.getElementById('derivativeFunc')?.value || 'quadratic';
        const x0 = this.derivativeX;

        const funcs = {
            quadratic: { fn: x => x * x, dfn: x => 2 * x, label: 'x\u00B2' },
            cubic: { fn: x => x * x * x, dfn: x => 3 * x * x, label: 'x\u00B3' },
            sine: { fn: x => Math.sin(x), dfn: x => Math.cos(x), label: 'sin(x)' },
            sigmoid: { fn: x => 1/(1+Math.exp(-x)), dfn: x => { const s = 1/(1+Math.exp(-x)); return s*(1-s); }, label: '\u03C3(x)' }
        };

        const { fn, dfn, label } = funcs[funcName];
        const scaleX = 80, scaleY = funcName === 'sigmoid' ? 150 : 40;

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

        // Function curve
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        for (let px = 0; px <= W; px++) {
            const x = (px - cx) / scaleX;
            const y = fn(x);
            const py = cy - y * scaleY;
            if (px === 0) ctx.moveTo(px, Math.max(0, Math.min(H, py)));
            else ctx.lineTo(px, Math.max(0, Math.min(H, py)));
        }
        ctx.stroke();

        // Point on curve
        const y0 = fn(x0);
        const slope = dfn(x0);
        const px0 = cx + x0 * scaleX;
        const py0 = cy - y0 * scaleY;

        // Tangent line
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        const tangentLen = 2;
        const tx1 = cx + (x0 - tangentLen) * scaleX;
        const ty1 = cy - (y0 - slope * tangentLen) * scaleY;
        const tx2 = cx + (x0 + tangentLen) * scaleX;
        const ty2 = cy - (y0 + slope * tangentLen) * scaleY;
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Point
        ctx.beginPath();
        ctx.arc(px0, py0, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`f(${x0.toFixed(1)}) = ${y0.toFixed(2)}`, px0 + 14, py0 - 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`slope = ${slope.toFixed(2)}`, px0 + 14, py0 + 14);

        // Update explanation
        const el = document.getElementById('derivativeExplanation');
        if (el) {
            el.innerHTML = `At x = ${x0.toFixed(1)}: f(${x0.toFixed(1)}) = ${y0.toFixed(2)}, ` +
                `f'(${x0.toFixed(1)}) = <strong>${slope.toFixed(2)}</strong> (slope of tangent line)` +
                `<br>Interpretation: A tiny increase in x causes the output to change by ~${slope.toFixed(2)}`;
        }
    },

    startQuiz2_2() {
        Quiz.start({
            title: 'Chapter 2.2: Derivatives',
            chapterId: '2-2',
            questions: [
                {
                    question: 'What does a derivative tell you?',
                    options: [
                        'The total value of something',
                        'How fast something is changing (how steep the hill is)',
                        'The area under a curve',
                        'The biggest value possible'
                    ],
                    correct: 1,
                    explanation: 'A derivative tells you how steep the hill is right where you are standing. It is like asking "how fast am I going up or down right now?"'
                },
                {
                    question: 'If f(x) = x squared, how steep is the hill at x = 3?',
                    options: ['3', '6', '9', '2'],
                    correct: 1,
                    explanation: 'The rule is: multiply by 2. So at x = 3, the steepness is 2 times 3 = 6. The hill is pretty steep there!'
                },
                {
                    question: 'What is the chain rule used for in a neural network?',
                    options: [
                        'Plugging layers together',
                        'Connecting changes like dominoes to figure out how to improve every layer',
                        'Adding more brain helpers',
                        'Choosing how big each step is'
                    ],
                    correct: 1,
                    explanation: 'The chain rule connects changes like dominoes falling through every layer. It tells each importance score how it should change to make the final answer better!'
                },
                {
                    question: 'If the steepness (derivative) is negative, should the importance score go up or down?',
                    options: [
                        'Go down',
                        'Go up',
                        'Stay the same',
                        'Become zero'
                    ],
                    correct: 1,
                    explanation: 'Imagine you are on a hill and it slopes down to your right. A negative steepness means going right (making the score bigger) takes you downhill -- closer to the answer! So the score should go up.'
                }
            ]
        });
    },

    // ============================================
    // 2.3: Matrix Math
    // ============================================
    matrixStep: 0,

    loadChapter2_3() {
        const container = document.getElementById('chapter-2-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 2 \u2022 Chapter 2.3</span>
                <h1>Matrix Math</h1>
                <p>A matrix is just a grid of numbers, like a spreadsheet or a bingo card!
                   Neural networks use these grids to move information around.
                   Let's learn how to combine two grids together!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCDD</span> Why Matrices?</h2>
                <p>Every layer in a neural network uses a grid of importance scores (weights).
                   Think of it like a recipe card: it tells the network how to mix all the ingredients (inputs) together.
                   Computers called GPUs can do all this grid math super fast -- that is why they are great for deep learning!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Step-by-Step Matrix Multiplication</h2>
                <p>Click "Next Step" to see how we combine two grids following special rules, one box at a time!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="matrix-equation" id="matrixDisplay"></div>

                <div class="step-indicator" id="matrixSteps"></div>

                <div class="step-explanation" id="matrixExplanation">
                    Click "Next Step" to start combining the grids!
                </div>

                <div class="controls">
                    <button class="btn-secondary btn-small" onclick="Chapter2.resetMatrix()">Reset</button>
                    <button class="btn-primary btn-small" onclick="Chapter2.nextMatrixStep()">Next Step \u2192</button>
                    <button class="btn-secondary btn-small" onclick="Chapter2.autoPlayMatrix()">Auto Play</button>
                </div>
            </div>

            <!-- Neural Network as Matrix -->
            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE9</span> A Neural Network Layer = Matrix Multiply</h2>
                <div class="code-block">
<span class="comment"># One layer with 3 inputs and 2 outputs (like 3 ingredients making 2 dishes!):</span>

inputs  = [<span class="number">0.5</span>, <span class="number">0.8</span>, <span class="number">0.2</span>]     <span class="comment"># 3 ingredients</span>

weights = [[<span class="number">0.2</span>, <span class="number">0.4</span>],      <span class="comment"># the recipe card (a 3-by-2 grid)</span>
           [<span class="number">0.6</span>, <span class="number">0.1</span>],
           [<span class="number">0.3</span>, <span class="number">0.7</span>]]

biases  = [<span class="number">0.1</span>, <span class="number">0.2</span>]        <span class="comment"># the little extra push for each dish</span>

<span class="comment"># Mix ingredients using the recipe, then add the extra push!</span>
output = inputs @ weights + biases
<span class="comment"># = [0.5*0.2 + 0.8*0.6 + 0.2*0.3 + 0.1,</span>
<span class="comment">#    0.5*0.4 + 0.8*0.1 + 0.2*0.7 + 0.2]</span>
<span class="comment"># = [0.74, 0.62]  -- two answers come out!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter2.startQuiz2_3()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('2-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('2-4')">Next: Loss Functions \u2192</button>
            </div>
        `;

        this.resetMatrix();
    },

    matA: [[1, 2], [3, 4]],
    matB: [[5, 6], [7, 8]],
    matResult: [[0, 0], [0, 0]],

    resetMatrix() {
        this.matrixStep = 0;
        this.matResult = [[0, 0], [0, 0]];
        this.renderMatrix();
    },

    renderMatrix(highlightRow, highlightCol) {
        const display = document.getElementById('matrixDisplay');
        if (!display) return;

        const renderMat = (mat, id, hlRow, hlCol, isResult) => {
            return `<div class="matrix-display" id="${id}">
                ${mat.map((row, r) => `
                    <div class="matrix-row">
                        ${row.map((val, c) => {
                            let cls = 'matrix-cell';
                            if (hlRow === r && !isResult) cls += ' highlight';
                            if (hlCol === c && !isResult) cls += ' highlight';
                            if (isResult && hlRow === r && hlCol === c) cls += ' result';
                            return `<div class="${cls}">${val}</div>`;
                        }).join('')}
                    </div>
                `).join('')}
            </div>`;
        };

        const hr = highlightRow !== undefined ? highlightRow : -1;
        const hc = highlightCol !== undefined ? highlightCol : -1;

        display.innerHTML =
            renderMat(this.matA, 'matA', hr, -1, false) +
            '<span class="matrix-operator">\u00D7</span>' +
            renderMat(this.matB, 'matB', -1, hc, false) +
            '<span class="matrix-operator">=</span>' +
            renderMat(this.matResult, 'matResult', hr, hc, true);

        // Step indicator
        const totalSteps = 4;
        const stepsEl = document.getElementById('matrixSteps');
        if (stepsEl) {
            stepsEl.innerHTML = Array(totalSteps).fill(0).map((_, i) =>
                `<div class="step-dot ${i < this.matrixStep ? 'completed' : ''} ${i === this.matrixStep ? 'active' : ''}"></div>`
            ).join('');
        }
    },

    nextMatrixStep() {
        if (this.matrixStep >= 4) {
            this.resetMatrix();
            return;
        }

        const steps = [
            { r: 0, c: 0 }, { r: 0, c: 1 },
            { r: 1, c: 0 }, { r: 1, c: 1 }
        ];

        const { r, c } = steps[this.matrixStep];

        // Calculate result
        let sum = 0;
        const parts = [];
        for (let k = 0; k < 2; k++) {
            sum += this.matA[r][k] * this.matB[k][c];
            parts.push(`${this.matA[r][k]}\u00D7${this.matB[k][c]}`);
        }
        this.matResult[r][c] = sum;

        this.renderMatrix(r, c);

        // Explanation
        const expl = document.getElementById('matrixExplanation');
        if (expl) {
            expl.innerHTML = `<strong>Step ${this.matrixStep + 1}:</strong> Result[${r}][${c}] = ` +
                `Row ${r} of A \u2022 Column ${c} of B = ${parts.join(' + ')} = <strong>${sum}</strong>`;
        }

        this.matrixStep++;
    },

    autoPlayMatrix() {
        this.resetMatrix();
        let step = 0;
        const interval = setInterval(() => {
            if (step >= 4) { clearInterval(interval); return; }
            this.nextMatrixStep();
            step++;
        }, 1000);
    },

    startQuiz2_3() {
        Quiz.start({
            title: 'Chapter 2.3: Matrix Math',
            chapterId: '2-3',
            questions: [
                {
                    question: 'If grid A is 2 rows by 3 columns, and grid B is 3 rows by 4 columns, what size is the answer grid?',
                    options: ['2 rows by 4 columns', '3 rows by 3 columns', '2 rows by 3 columns', '3 rows by 4 columns'],
                    correct: 0,
                    explanation: 'When you combine two grids, the answer keeps the rows from the first grid and the columns from the second. So 2 rows by 3 columns times 3 rows by 4 columns gives you 2 rows by 4 columns!'
                },
                {
                    question: 'Can you combine a 3-by-2 grid with a 4-by-3 grid?',
                    options: ['Yes, you get a 3-by-3 grid', 'No, the sizes do not match up', 'Yes, you get a 4-by-2 grid', 'Yes, you get a 3-by-4 grid'],
                    correct: 1,
                    explanation: 'The inside numbers must match! Grid A has 2 columns but Grid B has 4 rows. 2 does not equal 4, so they cannot be combined. It is like trying to plug a square peg into a round hole!'
                },
                {
                    question: 'In a neural network layer, what is stored in the grid (matrix)?',
                    options: ['The input information', 'The importance scores (weights)', 'The final answer', 'The on/off switch'],
                    correct: 1,
                    explanation: 'The importance scores (weights) live in a grid. The network combines this grid with the input to get the answer: output = weights grid times input plus a little extra push (bias).'
                },
                {
                    question: 'Why are GPUs (special computer chips) so good at deep learning?',
                    options: [
                        'They have more storage space',
                        'They can do tons of grid math all at the same time',
                        'They run at higher speeds',
                        'They use less electricity'
                    ],
                    correct: 1,
                    explanation: 'GPUs have thousands of tiny workers that can all do math at the same time! Since neural networks need lots of grid math, GPUs finish the job super fast.'
                }
            ]
        });
    },

    // ============================================
    // 2.4: Loss Functions
    // ============================================
    loadChapter2_4() {
        const container = document.getElementById('chapter-2-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 2 \u2022 Chapter 2.4</span>
                <h1>Loss Functions</h1>
                <p>A loss function is like a scorecard that tells you how wrong your guess was.
                   The bigger the score, the more wrong you were!
                   The goal is to get this score as close to zero as possible.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> What is Loss?</h2>
                <p>Loss is how far your guess is from the right answer. A perfect guess has zero loss. Cool, right?</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83C\uDFF9</span>
                    <span class="info-box-text">Imagine you are playing darts! The bullseye in the middle is the right answer.
                    Loss is how far your dart lands from the bullseye. A dart right in the center = zero loss!
                    A dart way off on the edge = big loss! Training is like practicing your throws to get closer and closer to the bullseye each time.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Loss Function Comparison</h2>
                <p>Move the slider to change your guess and see how the different scorecards react!
                   Try to get the guess close to 1.0 and watch the loss go down.</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>True Value</label>
                        <span class="slider-value" style="color: var(--success);">1.0</span>
                    </div>
                    <div class="control-group">
                        <label>Prediction (<span id="predVal">0.5</span>)</label>
                        <input type="range" id="lossSlider" min="0" max="2" value="0.5" step="0.01"
                               oninput="Chapter2.updateLoss()">
                    </div>
                </div>

                <div class="gd-stats" id="lossValues">
                    <div class="gd-stat">
                        <div class="stat-label">MSE Loss</div>
                        <div class="stat-value" id="mseLoss">0.250</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">MAE Loss</div>
                        <div class="stat-value" id="maeLoss">0.500</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Huber Loss</div>
                        <div class="stat-value" id="huberLoss">0.125</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Error</div>
                        <div class="stat-value" id="errorVal">-0.500</div>
                    </div>
                </div>

                <div class="graph-container">
                    <canvas id="lossCanvas" width="750" height="300"></canvas>
                    <div class="graph-legend">
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #6366f1;"></span>
                            MSE (Average of Squared Mistakes)
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #10b981;"></span>
                            MAE (Average of Mistakes)
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #f59e0b;"></span>
                            Huber Loss (A Mix of Both)
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cross Entropy -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD22</span> Cross-Entropy (For Classification)</h2>
                <p>When the question is "is it a cat or a dog?" we use a special score called Cross-Entropy.
                   It is a special score for yes/no questions, and it gets REALLY mad when you are super confident but wrong!</p>

                <div class="code-block">
<span class="comment"># Cross-Entropy: a special score for yes/no questions</span>
<span class="comment"># The truth: it IS a cat!</span>
<span class="comment"># Network says: "I'm 90% sure it's a cat" -- pretty confident and right!</span>
loss = -(<span class="number">1</span> * log(<span class="number">0.9</span>)) = <span class="number">0.105</span>  <span class="comment"># Small loss -- good job!</span>

<span class="comment"># Network says: "I'm only 10% sure it's a cat" -- not very confident...</span>
loss = -(<span class="number">1</span> * log(<span class="number">0.1</span>)) = <span class="number">2.303</span>  <span class="comment"># Big loss -- do better!</span>

<span class="comment"># Network says: "I'm 1% sure it's a cat" -- super confident AND wrong!</span>
loss = -(<span class="number">1</span> * log(<span class="number">0.01</span>)) = <span class="number">4.605</span>  <span class="comment"># HUGE loss -- yikes!</span>
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A0\uFE0F</span>
                    <span class="info-box-text">Cross-entropy is like a strict teacher! If you say "I am 99% sure it is NOT a cat"
                    but it really IS a cat, you get a HUGE penalty. Being wrong is one thing,
                    but being wrong AND super confident? That is the worst!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter2.startQuiz2_4()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('2-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('2-5')">Next: Gradient Descent \u2192</button>
            </div>
        `;

        this.updateLoss();
    },

    updateLoss() {
        const pred = parseFloat(document.getElementById('lossSlider')?.value || 0.5);
        const truth = 1.0;
        const error = pred - truth;

        document.getElementById('predVal').textContent = pred.toFixed(2);

        const mse = error * error;
        const mae = Math.abs(error);
        const delta = 1.0;
        const huber = mae <= delta ? 0.5 * error * error : delta * (mae - 0.5 * delta);

        document.getElementById('mseLoss').textContent = mse.toFixed(3);
        document.getElementById('maeLoss').textContent = mae.toFixed(3);
        document.getElementById('huberLoss').textContent = huber.toFixed(3);
        document.getElementById('errorVal').textContent = error.toFixed(3);

        this.drawLossGraph(pred);
    },

    drawLossGraph(currentPred) {
        const canvas = document.getElementById('lossCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 40, left: 60 };

        ctx.clearRect(0, 0, W, H);

        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        // Functions
        const truth = 1.0;
        const losses = {
            mse: { fn: p => (p - truth) ** 2, color: '#6366f1' },
            mae: { fn: p => Math.abs(p - truth), color: '#10b981' },
            huber: { fn: p => { const e = Math.abs(p - truth); return e <= 1 ? 0.5*e*e : e - 0.5; }, color: '#f59e0b' }
        };

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + plotH * (i / 4);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
            ctx.fillStyle = '#5a6478';
            ctx.font = '11px JetBrains Mono';
            ctx.textAlign = 'right';
            ctx.fillText((4 - i).toFixed(1), pad.left - 8, y + 4);
        }

        // X axis labels
        ctx.textAlign = 'center';
        for (let i = 0; i <= 4; i++) {
            const x = pad.left + plotW * (i / 4);
            ctx.fillText((i * 0.5).toFixed(1), x, H - 10);
        }
        ctx.fillText('Prediction', W / 2, H - 0);

        // Plot curves
        Object.values(losses).forEach(({ fn, color }) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            for (let px = 0; px <= plotW; px++) {
                const pred = (px / plotW) * 2;
                const loss = fn(pred);
                const x = pad.left + px;
                const y = pad.top + plotH * (1 - loss / 4);
                if (px === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, Math.max(pad.top, y));
            }
            ctx.stroke();
        });

        // Current prediction marker
        const cpx = pad.left + (currentPred / 2) * plotW;
        ctx.beginPath();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(cpx, pad.top);
        ctx.lineTo(cpx, pad.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(cpx, pad.top + plotH * (1 - losses.mse.fn(currentPred) / 4), 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
    },

    startQuiz2_4() {
        Quiz.start({
            title: 'Chapter 2.4: Loss Functions',
            chapterId: '2-4',
            questions: [
                {
                    question: 'What does a loss function (scorecard) tell you?',
                    options: [
                        'How fast the network learns',
                        'How wrong the network\'s guess was',
                        'How many brain helpers the network has',
                        'How much practice data there is'
                    ],
                    correct: 1,
                    explanation: 'A loss function is a score that tells us how wrong we are. The smaller the score, the better the guess! A score of zero means a perfect guess.'
                },
                {
                    question: 'Which scorecard is best for "is it a cat or a dog?" questions?',
                    options: ['MSE (Average of Squared Mistakes)', 'MAE (Average of Mistakes)', 'Cross-Entropy (Special Score for Yes/No Questions)', 'Huber Loss'],
                    correct: 2,
                    explanation: 'Cross-Entropy is the special score made for yes/no and pick-one questions. It gets extra mad at confident wrong answers!'
                },
                {
                    question: 'The right answer is 5 and the guess is 3. What is the average squared mistake (MSE)?',
                    options: ['2', '4', '8', '-2'],
                    correct: 1,
                    explanation: 'The mistake is 3 minus 5 = -2. Then we square it: -2 times -2 = 4. So the MSE is 4! Squaring makes sure the score is always positive.'
                },
                {
                    question: 'What happens to cross-entropy when the network is super confident but totally wrong?',
                    options: [
                        'The score stays small',
                        'The score gets really, really big',
                        'The score goes below zero',
                        'The score becomes zero'
                    ],
                    correct: 1,
                    explanation: 'Being confident and wrong is the worst combo! If the network says "I am 99% sure" but it is wrong, the loss score shoots way up. It is like a teacher giving extra homework for being overconfident and wrong!'
                }
            ]
        });
    },

    // ============================================
    // 2.5: Gradient Descent
    // ============================================
    gdRunning: false,
    gdX: 4.0,
    gdHistory: [],
    gdLearningRate: 0.1,

    loadChapter2_5() {
        const container = document.getElementById('chapter-2-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 2 \u2022 Chapter 2.5</span>
                <h1>Gradient Descent</h1>
                <p>This is how neural networks get better -- by learning from mistakes, step by step!
                   Imagine a ball rolling down a hill. It always rolls toward the lowest spot.
                   That is exactly what gradient descent does!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u26F0\uFE0F</span> The Big Idea</h2>
                <p>Imagine you are blindfolded on a hill and want to find the bottom.
                   What would you do? Feel around with your feet, figure out which direction goes downhill,
                   then take a step that way! That is gradient descent -- finding which direction to go to get better!</p>

                <div class="code-block">
<span class="comment"># The rule for rolling downhill:</span>
weight = weight - learning_rate <span class="keyword">*</span> gradient

<span class="comment"># gradient = which direction to go to get better (the steepness of the hill)</span>
<span class="comment"># learning_rate = how big each step is (small steps or big jumps?)</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Gradient Descent Simulator</h2>
                <p>Watch the yellow ball roll downhill to find the bottom of the valley!
                   Try changing how big each step is (the learning rate) to see what happens.</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Learning Rate</label>
                        <input type="range" id="gdLR" min="0.01" max="0.5" value="0.1" step="0.01"
                               oninput="Chapter2.updateGDParams()">
                        <span class="slider-value" id="gdLRVal">0.10</span>
                    </div>
                    <div class="control-group">
                        <label>Start Position</label>
                        <input type="range" id="gdStart" min="-4" max="4" value="4" step="0.1"
                               oninput="Chapter2.updateGDParams()">
                        <span class="slider-value" id="gdStartVal">4.0</span>
                    </div>
                    <div class="control-group">
                        <label>Loss Function</label>
                        <select id="gdFunc" onchange="Chapter2.updateGDParams()">
                            <option value="quadratic">Smooth Hill: f(x) = x\u00B2</option>
                            <option value="bumpy">Bumpy Hill: f(x) = x\u00B2 + 2sin(3x)</option>
                        </select>
                    </div>
                </div>

                <div class="graph-container">
                    <canvas id="gdCanvas" width="750" height="350"></canvas>
                </div>

                <div class="gd-stats">
                    <div class="gd-stat">
                        <div class="stat-label">Step</div>
                        <div class="stat-value" id="gdStep">0</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Position (x)</div>
                        <div class="stat-value" id="gdPos">4.000</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Loss f(x)</div>
                        <div class="stat-value" id="gdLoss">16.000</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Gradient</div>
                        <div class="stat-value" id="gdGrad">8.000</div>
                    </div>
                </div>

                <div class="controls">
                    <button class="btn-primary btn-small" id="gdRunBtn" onclick="Chapter2.toggleGD()">
                        \u25B6 Start
                    </button>
                    <button class="btn-secondary btn-small" onclick="Chapter2.stepGD()">
                        Single Step
                    </button>
                    <button class="btn-secondary btn-small" onclick="Chapter2.resetGD()">
                        Reset
                    </button>
                </div>
            </div>

            <!-- Learning Rate Effects -->
            <div class="section">
                <h2><span class="section-icon">\u2696\uFE0F</span> The Learning Rate Dilemma</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                    <div class="info-box warning">
                        <span class="info-box-text">
                            <strong>Tiny Steps (0.001)</strong><br>
                            Like a snail going down the hill. You will get there, but it takes forever!
                        </span>
                    </div>
                    <div class="info-box success">
                        <span class="info-box-text">
                            <strong>Just Right (0.01-0.1)</strong><br>
                            Like walking at a nice pace. You roll smoothly to the bottom. The sweet spot!
                        </span>
                    </div>
                    <div class="info-box" style="background: var(--error-bg); border-color: rgba(239,68,68,0.2);">
                        <span class="info-box-text">
                            <strong>Giant Leaps (0.5+)</strong><br>
                            Like jumping so far you fly right past the bottom and land on the other side! Things get worse, not better.
                        </span>
                    </div>
                </div>

                <div class="info-box mt-16">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Try it yourself above! Set the step size to 0.01 (tiny steps), then try 0.5 (giant leaps),
                    and watch what happens to the ball. Amazing, right? Smart new tricks like "Adam" figure out the best step size automatically!</span>
                </div>
            </div>

            <!-- SGD vs GD -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFCE\uFE0F</span> Batch vs Stochastic vs Mini-Batch</h2>
                <div class="code-block">
<span class="comment"># Full Batch: Look at ALL the practice examples before taking a step</span>
<span class="comment"># Like reading the entire textbook before answering one question (slow but careful)</span>
gradient = <span class="function">compute_gradient</span>(ALL_DATA)

<span class="comment"># Stochastic (SGD): Look at just ONE random example before stepping</span>
<span class="comment"># Like guessing after seeing just one flash card (fast but shaky)</span>
gradient = <span class="function">compute_gradient</span>(ONE_SAMPLE)

<span class="comment"># Mini-Batch: Look at a small handful of examples (the most popular way!)</span>
<span class="comment"># Like studying a few flash cards at a time -- fast AND steady!</span>
gradient = <span class="function">compute_gradient</span>(BATCH_OF_32)
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter2.startQuiz2_5()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('2-4')">\u2190 Previous</button>
                <div>
                    <span style="color: var(--success); font-weight: 600;">\u2713 Module 2 Complete!</span>
                </div>
            </div>
        `;

        this.resetGD();
    },

    updateGDParams() {
        this.gdLearningRate = parseFloat(document.getElementById('gdLR')?.value || 0.1);
        document.getElementById('gdLRVal').textContent = this.gdLearningRate.toFixed(2);
        const start = parseFloat(document.getElementById('gdStart')?.value || 4);
        document.getElementById('gdStartVal').textContent = start.toFixed(1);
        this.resetGD();
    },

    getGDFunction() {
        const name = document.getElementById('gdFunc')?.value || 'quadratic';
        if (name === 'bumpy') {
            return {
                fn: x => x * x + 2 * Math.sin(3 * x),
                dfn: x => 2 * x + 6 * Math.cos(3 * x)
            };
        }
        return {
            fn: x => x * x,
            dfn: x => 2 * x
        };
    },

    resetGD() {
        this.gdRunning = false;
        this.gdX = parseFloat(document.getElementById('gdStart')?.value || 4);
        this.gdHistory = [this.gdX];
        const btn = document.getElementById('gdRunBtn');
        if (btn) btn.textContent = '\u25B6 Start';
        this.drawGD();
        this.updateGDStats();
    },

    toggleGD() {
        this.gdRunning = !this.gdRunning;
        const btn = document.getElementById('gdRunBtn');
        if (btn) btn.textContent = this.gdRunning ? '\u23F8 Pause' : '\u25B6 Start';
        if (this.gdRunning) this.runGD();
    },

    stepGD() {
        const { dfn } = this.getGDFunction();
        const grad = dfn(this.gdX);
        this.gdX = this.gdX - this.gdLearningRate * grad;
        this.gdHistory.push(this.gdX);
        this.drawGD();
        this.updateGDStats();
    },

    runGD() {
        if (!this.gdRunning) return;
        if (this.gdHistory.length > 100) {
            this.gdRunning = false;
            document.getElementById('gdRunBtn').textContent = '\u25B6 Start';
            return;
        }

        this.stepGD();
        setTimeout(() => this.runGD(), 200);
    },

    updateGDStats() {
        const { fn, dfn } = this.getGDFunction();
        document.getElementById('gdStep').textContent = this.gdHistory.length - 1;
        document.getElementById('gdPos').textContent = this.gdX.toFixed(3);
        document.getElementById('gdLoss').textContent = fn(this.gdX).toFixed(3);
        document.getElementById('gdGrad').textContent = dfn(this.gdX).toFixed(3);
    },

    drawGD() {
        const canvas = document.getElementById('gdCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 30, left: 20 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;
        const { fn } = this.getGDFunction();

        ctx.clearRect(0, 0, W, H);

        // Calculate scale
        const xMin = -5, xMax = 5;
        const yMax = 20;
        const toX = x => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
        const toY = y => pad.top + plotH * (1 - y / yMax);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = xMin; i <= xMax; i++) {
            const x = toX(i);
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
        }
        for (let i = 0; i <= yMax; i += 5) {
            const y = toY(i);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }

        // Axis
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        const zeroY = toY(0);
        ctx.beginPath(); ctx.moveTo(pad.left, zeroY); ctx.lineTo(W - pad.right, zeroY); ctx.stroke();

        // Loss curve
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        for (let px = 0; px <= plotW; px++) {
            const x = xMin + (px / plotW) * (xMax - xMin);
            const y = fn(x);
            const screenY = toY(Math.min(y, yMax));
            if (px === 0) ctx.moveTo(pad.left + px, screenY);
            else ctx.lineTo(pad.left + px, screenY);
        }
        ctx.stroke();

        // Path history
        if (this.gdHistory.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.lineWidth = 1.5;
            this.gdHistory.forEach((x, i) => {
                const sx = toX(x);
                const sy = toY(Math.min(fn(x), yMax));
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            });
            ctx.stroke();

            // Previous points
            this.gdHistory.forEach((x, i) => {
                if (i === this.gdHistory.length - 1) return;
                const sx = toX(x);
                const sy = toY(Math.min(fn(x), yMax));
                ctx.beginPath();
                ctx.arc(sx, sy, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
                ctx.fill();
            });
        }

        // Current position (ball)
        const cx = toX(this.gdX);
        const cy = toY(Math.min(fn(this.gdX), yMax));

        // Glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
        glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(cx - 20, cy - 20, 40, 40);

        // Ball
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    },

    startQuiz2_5() {
        Quiz.start({
            title: 'Chapter 2.5: Gradient Descent',
            chapterId: '2-5',
            questions: [
                {
                    question: 'What is the goal of gradient descent (rolling downhill)?',
                    options: [
                        'To make the loss score bigger',
                        'To find the best importance scores that make the loss as small as possible',
                        'To add more layers',
                        'To make the network faster'
                    ],
                    correct: 1,
                    explanation: 'Gradient descent is all about rolling the ball downhill to the bottom of the valley! That bottom is where the loss is smallest and the network does its best work.'
                },
                {
                    question: 'What happens if you take steps that are too big (learning rate too high)?',
                    options: [
                        'Training gets more stable',
                        'The network learns faster',
                        'The ball jumps right over the bottom and things get worse',
                        'Nothing changes'
                    ],
                    correct: 2,
                    explanation: 'Giant leaps make the ball fly right past the bottom of the valley! It bounces back and forth wildly and might even fly off the hill. Smaller steps are safer.'
                },
                {
                    question: 'The rule is: w = w - step_size * gradient. If the gradient (direction) is positive, what happens to w?',
                    options: [
                        'w gets bigger',
                        'w gets smaller',
                        'w stays the same',
                        'w becomes zero'
                    ],
                    correct: 1,
                    explanation: 'Think of the ball on a hill. A positive gradient means the hill slopes up to the right. So we need to go left (make w smaller) to roll downhill toward the bottom!'
                },
                {
                    question: 'What is the difference between SGD (one flash card) and batch (whole textbook)?',
                    options: [
                        'SGD looks at all data, batch looks at one example',
                        'SGD looks at one random example per step, batch looks at all data',
                        'They are the same thing',
                        'SGD is always better'
                    ],
                    correct: 1,
                    explanation: 'SGD is like studying one random flash card before each step -- fast but shaky. Batch is like reading the whole textbook first -- slow but steady. Most people use mini-batch, which is a few cards at a time!'
                },
                {
                    question: 'What method do most real neural networks use?',
                    options: [
                        'Full batch (look at everything)',
                        'Pure SGD (just one example)',
                        'Mini-batch (a small handful of 32-256 examples)',
                        'No gradient descent at all'
                    ],
                    correct: 2,
                    explanation: 'Mini-batch is the winner! It is the best of both worlds -- fast like SGD but steady like full batch. Most networks study 32, 64, 128, or 256 examples at a time.'
                }
            ]
        });
    }
};
