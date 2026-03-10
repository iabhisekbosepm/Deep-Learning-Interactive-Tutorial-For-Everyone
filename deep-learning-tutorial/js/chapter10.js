/* ============================================
   Chapter 10: Large Language Models & Scaling
   ============================================ */

const Chapter10 = {
    // State
    scalingModelSize: 50,
    scalingDataSize: 50,
    scalingAnimFrame: null,
    fewShotMode: 0,
    cotStep: -1,
    cotMaxSteps: 5,
    cotAnimFrame: null,
    cotTreeAnimFrame: null,
    cotTreeHighlightPath: -1,
    rlhfRound: 0,
    rlhfScore: 0,
    rlhfAnimFrame: null,
    rlhfFlowStep: 0,
    rlhfFlowPlaying: false,
    activePrinciples: [true, true, true, true, true, true],
    alignAnimFrame: null,
    alignAnimStep: 0,
    preferenceChoices: [],

    init() {
        App.registerChapter('10-1', () => this.loadChapter10_1());
        App.registerChapter('10-2', () => this.loadChapter10_2());
        App.registerChapter('10-3', () => this.loadChapter10_3());
        App.registerChapter('10-4', () => this.loadChapter10_4());
        App.registerChapter('10-5', () => this.loadChapter10_5());
    },

    // ============================================
    // 10.1: The GPT Revolution & Scaling Laws
    // ============================================
    loadChapter10_1() {
        const container = document.getElementById('chapter-10-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 10 &bull; Chapter 10.1</span>
                <h1>\uD83D\uDE80 The GPT Revolution & Scaling Laws</h1>
                <p>What happens when you make an AI brain REALLY, REALLY big? Let's find out how making models bigger changes everything!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE0</span> What Are Parameters?</h2>
                <p>Imagine you have a HUGE music mixing board with millions of tiny dials. Each little dial can be turned a tiny bit to change how the music sounds. <strong>Parameters</strong> are like those tiny dials inside an AI's brain!</p>
                <p>When an AI learns, it turns these dials a teeny tiny bit at a time until the music sounds just right. More dials = more things the AI can learn about!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Think of it this way:</strong> If you had a coloring set with only 3 crayons, you could draw simple pictures. But with 1,000 crayons of every shade? You could draw ANYTHING! More parameters = more crayons for the AI!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> The GPT Family Timeline</h2>
                <p>Look how GPT models grew over the years \u2014 each one got WAY bigger!</p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC23</div>
                        <div style="font-weight:600;margin:6px 0;color:#818cf8;">GPT-1 (2018)</div>
                        <div style="font-size:20px;font-weight:700;color:#6366f1;">117M</div>
                        <div style="font-size:12px;color:var(--text-secondary);">117 million dials \u2014 like a baby learning to talk!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC66</div>
                        <div style="font-weight:600;margin:6px 0;color:#818cf8;">GPT-2 (2019)</div>
                        <div style="font-size:20px;font-weight:700;color:#6366f1;">1.5B</div>
                        <div style="font-size:12px;color:var(--text-secondary);">1.5 billion dials \u2014 like a kid who reads lots of books!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDD1\u200D\uD83C\uDF93</div>
                        <div style="font-weight:600;margin:6px 0;color:#818cf8;">GPT-3 (2020)</div>
                        <div style="font-size:20px;font-weight:700;color:#6366f1;">175B</div>
                        <div style="font-size:12px;color:var(--text-secondary);">175 billion dials \u2014 like a super-smart student!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDD9</div>
                        <div style="font-weight:600;margin:6px 0;color:#818cf8;">GPT-4 (2023)</div>
                        <div style="font-size:20px;font-weight:700;color:#6366f1;">~1.8T</div>
                        <div style="font-size:12px;color:var(--text-secondary);">~1.8 TRILLION dials \u2014 like a wizard genius!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCC8</span> Scaling Laws: Bigger Brain = Smarter?</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Move the sliders to see how model size and training data affect how smart the AI gets! Watch the curve change!</p>
                <div class="network-viz">
                    <canvas id="scalingCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <label>\uD83E\uDDE0 Model Size: <span id="modelSizeLabel">Medium</span></label>
                        <input type="range" id="modelSizeSlider" min="1" max="100" value="50" oninput="Chapter10.updateScaling()">
                    </div>
                    <div class="control-group">
                        <label>\uD83D\uDCDA Training Data: <span id="dataSizeLabel">Medium</span></label>
                        <input type="range" id="dataSizeSlider" min="1" max="100" value="50" oninput="Chapter10.updateScaling()">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDD94</span> Chinchilla Scaling: Read Enough Books!</h2>
                <p>Scientists at DeepMind discovered something super important: <strong>your AI needs to read enough books to match how big its brain is!</strong></p>
                <div class="info-box success">
                    <span class="info-box-icon">\u2B50</span>
                    <span class="info-box-text"><strong>The Chinchilla Rule:</strong> Imagine you have a really big backpack (big model). If you only put one book in it, that's silly! You need LOTS of books to fill it up. Chinchilla says: for every dial in your brain, you should read about 20 words of training data!</span>
                </div>
                <p>So a 70 billion parameter model needs about 1.4 TRILLION words of training data. That's like reading every book in the biggest library... thousands of times!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Model Config Comparison</h2>
                <div class="code-block">
<span class="comment"># How GPT models grew over time!</span>

<span class="comment"># GPT-1: The baby model</span>
gpt1_config = {
    <span class="string">'parameters'</span>: <span class="string">'117 Million'</span>,
    <span class="string">'layers'</span>: <span class="number">12</span>,
    <span class="string">'hidden_size'</span>: <span class="number">768</span>,
    <span class="string">'attention_heads'</span>: <span class="number">12</span>,
    <span class="string">'training_data'</span>: <span class="string">'5GB of books'</span>
}

<span class="comment"># GPT-3: The super student</span>
gpt3_config = {
    <span class="string">'parameters'</span>: <span class="string">'175 Billion'</span>,
    <span class="string">'layers'</span>: <span class="number">96</span>,
    <span class="string">'hidden_size'</span>: <span class="number">12288</span>,
    <span class="string">'attention_heads'</span>: <span class="number">96</span>,
    <span class="string">'training_data'</span>: <span class="string">'570GB from the internet'</span>
}

<span class="comment"># GPT-4: The wizard genius</span>
gpt4_config = {
    <span class="string">'parameters'</span>: <span class="string">'~1.8 Trillion'</span>,
    <span class="string">'layers'</span>: <span class="string">'many more!'</span>,
    <span class="string">'hidden_size'</span>: <span class="string">'much bigger!'</span>,
    <span class="string">'training_data'</span>: <span class="string">'HUGE amount of text + images'</span>
}
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2728</span> Emergent Abilities: Surprise Powers!</h2>
                <div class="info-box" style="background:rgba(139,92,246,0.1);border-color:rgba(139,92,246,0.2);">
                    <span class="info-box-icon">\uD83C\uDF1F</span>
                    <span class="info-box-text"><strong>Emergent Abilities</strong> are like surprise superpowers! When an AI gets SO incredibly big, it suddenly learns new tricks that NOBODY taught it! It's like how when you practice riding a bike enough, you can suddenly do it without training wheels \u2014 the skill just "clicks"! Small models CAN'T do these things, but once you make them big enough... BOOM! New abilities appear like magic!</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDE9</div>
                        <div style="font-weight:600;margin:6px 0;">Math Reasoning</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Small models can't do tricky math, but huge ones can solve word problems!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDF0D</div>
                        <div style="font-weight:600;margin:6px 0;">Translation</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Big models can translate between languages they barely saw!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCA1</div>
                        <div style="font-weight:600;margin:6px 0;">Common Sense</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Really big models start to understand jokes and sarcasm!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter10.startQuiz10_1()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('9-5')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('10-2')">Next: In-Context Learning \u2192</button>
            </div>
        `;

        this.drawScalingCanvas();
    },

    updateScaling() {
        const modelSlider = document.getElementById('modelSizeSlider');
        const dataSlider = document.getElementById('dataSizeSlider');
        const modelLabel = document.getElementById('modelSizeLabel');
        const dataLabel = document.getElementById('dataSizeLabel');
        if (modelSlider) this.scalingModelSize = parseInt(modelSlider.value);
        if (dataSlider) this.scalingDataSize = parseInt(dataSlider.value);
        if (modelLabel) {
            const v = this.scalingModelSize;
            modelLabel.textContent = v < 20 ? 'Tiny' : v < 40 ? 'Small' : v < 60 ? 'Medium' : v < 80 ? 'Large' : 'Huge';
        }
        if (dataLabel) {
            const v = this.scalingDataSize;
            dataLabel.textContent = v < 20 ? 'Tiny' : v < 40 ? 'Small' : v < 60 ? 'Medium' : v < 80 ? 'Large' : 'Huge';
        }
        this.drawScalingCanvas();
    },

    drawScalingCanvas() {
        const canvas = document.getElementById('scalingCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const pad = { top: 40, right: 40, bottom: 60, left: 80 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + (plotH / 5) * i;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }
        const xLabels = ['1M', '10M', '100M', '1B', '10B', '100B', '1T'];
        for (let i = 0; i < xLabels.length; i++) {
            const x = pad.left + (plotW / (xLabels.length - 1)) * i;
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = '#8b95a8';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + plotH); ctx.lineTo(W - pad.right, pad.top + plotH); ctx.stroke();

        // X-axis labels
        ctx.fillStyle = '#8b95a8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        for (let i = 0; i < xLabels.length; i++) {
            const x = pad.left + (plotW / (xLabels.length - 1)) * i;
            ctx.fillText(xLabels[i], x, pad.top + plotH + 20);
        }
        ctx.fillText('Parameters (log scale)', W / 2, H - 8);

        // Y-axis labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + plotH - (plotH / 5) * i;
            ctx.fillText((i * 20).toString(), pad.left - 10, y + 4);
        }
        ctx.save();
        ctx.translate(16, pad.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Smartness Score', 0, 0);
        ctx.restore();

        // Performance curve based on sliders
        const modelFactor = this.scalingModelSize / 100;
        const dataFactor = this.scalingDataSize / 100;
        const combined = 0.4 + 0.35 * modelFactor + 0.25 * dataFactor;

        // Draw the curve
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        const points = [];
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const logX = t * 6; // 0 to 6 (log scale: 1M to 1T)
            const score = combined * 100 * (1 - Math.exp(-1.2 * logX)) * (0.6 + 0.4 * Math.min(1, logX / 4));
            const x = pad.left + t * plotW;
            const y = pad.top + plotH - (Math.min(score, 100) / 100) * plotH;
            points.push({ x, y, score });
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Gradient fill under curve
        const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
        gradient.addColorStop(0, 'rgba(99,102,241,0.3)');
        gradient.addColorStop(1, 'rgba(99,102,241,0.02)');
        ctx.lineTo(W - pad.right, pad.top + plotH);
        ctx.lineTo(pad.left, pad.top + plotH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // GPT model dots
        const gptModels = [
            { name: 'GPT-1', params: 0.117, logIdx: 0.117 / 1, color: '#818cf8', xFrac: 0.0 / 6 },
            { name: 'GPT-2', params: 1.5, color: '#10b981', xFrac: 1.176 / 6 },
            { name: 'GPT-3', params: 175, color: '#f59e0b', xFrac: 3.243 / 6 },
            { name: 'GPT-4', params: 1800, color: '#ef4444', xFrac: 5.255 / 6 },
        ];

        // Compute actual xFrac: log10(params_in_millions) / 6
        gptModels[0].xFrac = Math.log10(117) / 6;     // ~2.07/6
        gptModels[1].xFrac = Math.log10(1500) / 6;    // ~3.18/6
        gptModels[2].xFrac = Math.log10(175000) / 6;  // ~5.24/6
        gptModels[3].xFrac = Math.log10(1800000) / 6; // ~6.26/6 clamped

        gptModels.forEach(m => {
            const frac = Math.min(Math.max(m.xFrac, 0), 1);
            const idx = Math.round(frac * 100);
            const pt = points[Math.min(idx, points.length - 1)];
            // Dot
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = m.color;
            ctx.fill();
            ctx.strokeStyle = '#0d1220';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Label
            ctx.fillStyle = m.color;
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(m.name, pt.x, pt.y - 16);
        });

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Scaling Laws: How Size Affects Smartness', W / 2, 24);
    },

    startQuiz10_1() {
        Quiz.start({
            title: 'Chapter 10.1: The GPT Revolution & Scaling Laws',
            chapterId: '10-1',
            questions: [
                {
                    question: 'What are "parameters" in an AI model?',
                    options: ['The questions you ask the AI', 'Tiny adjustable dials the AI uses to learn', 'The electricity the AI uses', 'The speed of the computer'],
                    correct: 1,
                    explanation: 'Parameters are like tiny dials or knobs inside the AI. During training, these dials get adjusted little by little until the AI learns the right patterns!'
                },
                {
                    question: 'How many parameters does GPT-3 have?',
                    options: ['117 million', '1.5 billion', '175 billion', '1.8 trillion'],
                    correct: 2,
                    explanation: 'GPT-3 has about 175 billion parameters! That\'s 175,000,000,000 tiny dials that got adjusted during training!'
                },
                {
                    question: 'What does the Chinchilla scaling law tell us?',
                    options: ['Bigger models are always better', 'You need enough training data to match model size', 'Only small models work well', 'Training data doesn\'t matter'],
                    correct: 1,
                    explanation: 'Chinchilla says you need enough training data to match how big your model is \u2014 like filling a big backpack with enough books!'
                },
                {
                    question: 'What are "emergent abilities"?',
                    options: ['Abilities programmed by humans', 'Skills that appear suddenly when models get very big', 'Bugs in the AI', 'Things small models are best at'],
                    correct: 1,
                    explanation: 'Emergent abilities are surprise superpowers that appear when AI models get really big \u2014 skills nobody specifically taught them!'
                },
                {
                    question: 'Why is making a model bigger NOT always the best solution?',
                    options: ['Big models are slower and cost more money', 'Big models always give wrong answers', 'Big models can\'t read text', 'Big models don\'t have parameters'],
                    correct: 0,
                    explanation: 'Bigger models need more computers, more electricity, more money, and are slower. Sometimes a well-trained smaller model can be just as good with the right data!'
                }
            ]
        });
    },

    // ============================================
    // 10.2: In-Context Learning & Few-Shot Prompting
    // ============================================
    loadChapter10_2() {
        const container = document.getElementById('chapter-10-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 10 &bull; Chapter 10.2</span>
                <h1>\uD83C\uDFAF In-Context Learning & Few-Shot Prompting</h1>
                <p>What if you could teach an AI something new just by showing it a few examples? No training needed! Let's learn this amazing trick!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFEB</span> The School Test Analogy</h2>
                <p>Imagine you're taking a test at school. Your teacher can help you in different ways:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDE30</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Zero-Shot</div>
                        <div style="font-size:12px;color:var(--text-secondary);">"Here's the test. No examples. Good luck!" The AI has to figure it out by itself!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u261D\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">One-Shot</div>
                        <div style="font-size:12px;color:var(--text-secondary);">"Here's ONE example answer, now do the rest!" A tiny hint to get started!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDF1F</div>
                        <div style="font-weight:600;margin:6px 0;color:#10b981;">Few-Shot</div>
                        <div style="font-size:12px;color:var(--text-secondary);">"Here are SEVERAL examples before the test!" The AI learns the pattern from examples!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">The coolest part? The AI doesn't retrain or change its dials at all! It just reads the examples and figures out the pattern right there on the spot. That's called <strong>in-context learning</strong>!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD2C</span> Interactive Prompt Builder</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Click a button to see how adding more examples helps the AI get better at figuring out if a movie review is happy or sad!</p>
                <div class="controls" style="margin-bottom:16px;">
                    <button class="btn-secondary btn-small" onclick="Chapter10.setFewShot(0)" id="fewShotBtn0">Zero-Shot</button>
                    <button class="btn-secondary btn-small" onclick="Chapter10.setFewShot(1)" id="fewShotBtn1">1-Shot</button>
                    <button class="btn-secondary btn-small" onclick="Chapter10.setFewShot(3)" id="fewShotBtn3">3-Shot</button>
                    <button class="btn-secondary btn-small" onclick="Chapter10.setFewShot(5)" id="fewShotBtn5">5-Shot</button>
                </div>
                <div id="promptBuilder" style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:20px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.8;color:#e8eaf0;margin-bottom:16px;max-height:400px;overflow-y:auto;">
                    <div style="color:#6366f1;font-weight:600;">Click a button above to build a prompt!</div>
                </div>
                <div id="accuracyDisplay" style="margin-bottom:16px;"></div>
                <div class="network-viz">
                    <canvas id="fewShotCanvas" width="800" height="300"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Prompt Template Code</h2>
                <div class="code-block">
<span class="comment"># Few-shot prompt template for sentiment classification</span>

prompt = <span class="string">"""Classify each movie review as Positive or Negative.

Review: "This movie was absolutely wonderful!"
Sentiment: Positive

Review: "I was bored the entire time."
Sentiment: Negative

Review: "The acting was superb and the story was gripping!"
Sentiment: Positive

Review: "{new_review}"
Sentiment:"""</span>

<span class="comment"># Send to the model</span>
response = model.<span class="function">generate</span>(prompt, max_tokens=<span class="number">5</span>)
<span class="keyword">print</span>(response)  <span class="comment"># "Positive" or "Negative"</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCB</span> Context Window: Your AI's Desk</h2>
                <div class="info-box success">
                    <span class="info-box-icon">\uD83D\uDCDA</span>
                    <span class="info-box-text"><strong>Context Window</strong> = how much the AI can read at once! Imagine you have a desk. A small desk can only hold a few papers. A big desk can hold LOTS of papers. The context window is the AI's desk size! GPT-3 has a desk that holds ~4,000 words. GPT-4 can hold over 100,000 words! The bigger the desk, the more examples you can show!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter10.startQuiz10_2()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('10-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('10-3')">Next: Chain-of-Thought Reasoning \u2192</button>
            </div>
        `;

        this.setFewShot(0);
    },

    setFewShot(count) {
        this.fewShotMode = count;

        // Update button styles
        [0, 1, 3, 5].forEach(n => {
            const btn = document.getElementById('fewShotBtn' + n);
            if (btn) {
                btn.className = n === count ? 'btn-primary btn-small' : 'btn-secondary btn-small';
            }
        });

        const examples = [
            { review: '"This movie was absolutely wonderful!"', sentiment: 'Positive', emoji: '\uD83D\uDE0A' },
            { review: '"I was bored the entire time."', sentiment: 'Negative', emoji: '\uD83D\uDE1E' },
            { review: '"The acting was superb and gripping!"', sentiment: 'Positive', emoji: '\uD83D\uDE0D' },
            { review: '"Terrible plot, waste of money."', sentiment: 'Negative', emoji: '\uD83D\uDE20' },
            { review: '"A masterpiece of storytelling!"', sentiment: 'Positive', emoji: '\uD83C\uDF1F' },
        ];

        const builder = document.getElementById('promptBuilder');
        if (!builder) return;

        let html = '<div style="color:#8b5cf6;font-weight:600;margin-bottom:8px;">\uD83E\uDD16 Prompt sent to AI:</div>';
        html += '<div style="color:#818cf8;">Classify the movie review as Positive or Negative.</div><br>';

        if (count > 0) {
            html += '<div style="color:#10b981;font-weight:600;">Examples:</div>';
            for (let i = 0; i < count; i++) {
                const ex = examples[i];
                html += `<div style="margin:8px 0;padding:8px;background:rgba(16,185,129,0.1);border-radius:6px;">`;
                html += `${ex.emoji} Review: ${ex.review}<br>`;
                html += `<span style="color:#10b981;">Sentiment: ${ex.sentiment}</span></div>`;
            }
            html += '<br>';
        }

        html += '<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:8px;margin-top:8px;">';
        html += '<div style="color:#f59e0b;">Now classify this one:</div>';
        html += 'Review: "The special effects were amazing but the story was flat."<br>';
        html += '<span style="color:#f59e0b;">Sentiment: ???</span>';
        html += '</div>';

        builder.innerHTML = html;

        // Accuracy display
        const accuracies = { 0: 55, 1: 70, 3: 85, 5: 92 };
        const acc = accuracies[count];
        const accDisplay = document.getElementById('accuracyDisplay');
        if (accDisplay) {
            const color = acc > 80 ? '#10b981' : acc > 65 ? '#f59e0b' : '#ef4444';
            accDisplay.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;margin:12px 0;">
                    <span style="color:#e8eaf0;font-weight:600;min-width:120px;">Accuracy: ${acc}%</span>
                    <div style="flex:1;height:24px;background:rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
                        <div style="height:100%;width:${acc}%;background:${color};border-radius:12px;transition:width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        }

        this.drawFewShotChart();
    },

    drawFewShotChart() {
        const canvas = document.getElementById('fewShotCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const pad = { top: 40, right: 40, bottom: 50, left: 60 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 15px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Accuracy by Number of Examples (Shots)', W / 2, 24);

        // Axes
        ctx.strokeStyle = '#8b95a8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top);
        ctx.lineTo(pad.left, pad.top + plotH);
        ctx.lineTo(W - pad.right, pad.top + plotH);
        ctx.stroke();

        // Y-axis labels
        ctx.fillStyle = '#8b95a8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const val = i * 20;
            const y = pad.top + plotH - (val / 100) * plotH;
            ctx.fillText(val + '%', pad.left - 10, y + 4);
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }

        // Bars
        const bars = [
            { label: '0-Shot', value: 55, color: '#ef4444' },
            { label: '1-Shot', value: 70, color: '#f59e0b' },
            { label: '3-Shot', value: 85, color: '#818cf8' },
            { label: '5-Shot', value: 92, color: '#10b981' },
        ];

        const barWidth = plotW / (bars.length * 2);
        const gap = barWidth;

        bars.forEach((bar, i) => {
            const x = pad.left + gap / 2 + i * (barWidth + gap);
            const barH = (bar.value / 100) * plotH;
            const y = pad.top + plotH - barH;

            // Highlight active
            const isActive = (bar.label === '0-Shot' && this.fewShotMode === 0) ||
                             (bar.label === '1-Shot' && this.fewShotMode === 1) ||
                             (bar.label === '3-Shot' && this.fewShotMode === 3) ||
                             (bar.label === '5-Shot' && this.fewShotMode === 5);

            // Bar shadow/glow for active
            if (isActive) {
                ctx.shadowColor = bar.color;
                ctx.shadowBlur = 15;
            }

            // Bar
            ctx.fillStyle = isActive ? bar.color : bar.color + '66';
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
            ctx.fill();

            ctx.shadowBlur = 0;

            // Value label on top
            ctx.fillStyle = isActive ? '#e8eaf0' : '#8b95a8';
            ctx.font = isActive ? 'bold 14px Inter' : '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(bar.value + '%', x + barWidth / 2, y - 8);

            // X label
            ctx.fillStyle = isActive ? '#e8eaf0' : '#8b95a8';
            ctx.font = '12px Inter';
            ctx.fillText(bar.label, x + barWidth / 2, pad.top + plotH + 20);
        });
    },

    startQuiz10_2() {
        Quiz.start({
            title: 'Chapter 10.2: In-Context Learning & Few-Shot Prompting',
            chapterId: '10-2',
            questions: [
                {
                    question: 'What is "zero-shot" prompting?',
                    options: ['Giving the AI lots of examples', 'Asking the AI with NO examples at all', 'Training the AI from scratch', 'Turning off the AI'],
                    correct: 1,
                    explanation: 'Zero-shot means asking the AI to do a task with no examples at all \u2014 like taking a test with no practice questions!'
                },
                {
                    question: 'Why does few-shot prompting work?',
                    options: ['It retrains the model', 'The AI learns the pattern from the examples in the prompt', 'It makes the model bigger', 'It changes the parameters'],
                    correct: 1,
                    explanation: 'The AI reads the examples and figures out the pattern right there in the prompt \u2014 no retraining needed! That\'s the magic of in-context learning!'
                },
                {
                    question: 'What is the "context window"?',
                    options: ['A window on your computer screen', 'How much text the AI can read at once', 'The AI\'s camera', 'A type of training data'],
                    correct: 1,
                    explanation: 'The context window is like the AI\'s desk \u2014 it determines how much text the AI can look at all at once!'
                },
                {
                    question: 'Which typically gives the BEST accuracy?',
                    options: ['Zero-shot (no examples)', 'One-shot (1 example)', 'Few-shot (several examples)', 'They\'re all the same'],
                    correct: 2,
                    explanation: 'Usually more examples = better accuracy! Few-shot with several examples helps the AI understand the pattern much better.'
                },
                {
                    question: 'What does "in-context learning" mean?',
                    options: ['Training for many hours', 'Learning from examples in the prompt WITHOUT changing model weights', 'Memorizing the entire internet', 'Using a bigger computer'],
                    correct: 1,
                    explanation: 'In-context learning means the AI figures out what to do from the examples right there in the text, without any retraining or weight updates!'
                }
            ]
        });
    },

    // ============================================
    // 10.3: Chain-of-Thought Reasoning
    // ============================================
    loadChapter10_3() {
        const container = document.getElementById('chapter-10-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 10 &bull; Chapter 10.3</span>
                <h1>\uD83E\uDDE0 Chain-of-Thought Reasoning</h1>
                <p>When your teacher says "show your work!" \u2014 that's EXACTLY what Chain-of-Thought does for AI! Let's see how thinking step-by-step makes AI way smarter!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFEB</span> Show Your Work!</h2>
                <p>Remember when your math teacher says <strong>"Show your work!"</strong> on a test? There's a really good reason for that! When you write down each step, you're less likely to make mistakes.</p>
                <p>AI works the SAME way! If you just ask it "What's the answer?", it might rush and get it wrong. But if you say "Think step by step," it carefully works through each piece and gets it RIGHT!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Chain-of-Thought (CoT)</strong> means asking the AI to explain its thinking step by step, like showing your work on a math test. This simple trick makes AI WAY better at hard problems!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2696\uFE0F</span> Side by Side: Direct vs Step-by-Step</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;border-color:rgba(239,68,68,0.3);">
                        <div style="font-size:20px;margin-bottom:8px;">\u274C Direct Answer (No CoT)</div>
                        <div style="background:rgba(239,68,68,0.1);padding:12px;border-radius:8px;font-size:13px;line-height:1.6;">
                            <strong>Q:</strong> A farmer has 15 apples. She gives 3 to each of her 4 friends and buys 10 more. How many does she have?<br><br>
                            <strong>A:</strong> <span style="color:#ef4444;">22 apples</span> \u274C<br>
                            <em style="color:#8b95a8;font-size:11px;">(The AI just guessed without thinking!)</em>
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;border-color:rgba(16,185,129,0.3);">
                        <div style="font-size:20px;margin-bottom:8px;">\u2705 Chain-of-Thought</div>
                        <div style="background:rgba(16,185,129,0.1);padding:12px;border-radius:8px;font-size:13px;line-height:1.6;">
                            <strong>Q:</strong> Same question...<br>
                            <strong>A: Let me think step by step:</strong><br>
                            1) Start with 15 apples<br>
                            2) Gives 3 \u00D7 4 = 12 away<br>
                            3) 15 - 12 = 3 left<br>
                            4) Buys 10 more: 3 + 10 = <span style="color:#10b981;"><strong>13 apples</strong></span> \u2705
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD2C</span> Interactive CoT Visualizer</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Try solving a word problem! Click "Direct Answer" to see the AI rush, or "Think Step-by-Step" to see it work carefully!</p>
                <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:20px;margin:16px 0;">
                    <div style="color:#818cf8;font-weight:600;margin-bottom:8px;">\uD83D\uDCDD Word Problem:</div>
                    <div style="color:#e8eaf0;font-size:15px;line-height:1.6;">A toy store has 48 teddy bears. They sell half of them on Monday, then get a delivery of 20 more on Tuesday. On Wednesday they sell 10. How many teddy bears are left?</div>
                </div>
                <div class="controls" style="margin-bottom:16px;">
                    <button class="btn-secondary btn-small" onclick="Chapter10.showDirectAnswer()" style="background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.3);">\u26A1 Direct Answer</button>
                    <button class="btn-primary btn-small" onclick="Chapter10.startCoT()">\uD83E\uDDE0 Think Step-by-Step</button>
                    <button class="btn-secondary btn-small" onclick="Chapter10.nextCoTStep()" id="cotNextBtn" style="display:none;">Next Step \u2192</button>
                    <button class="btn-secondary btn-small" onclick="Chapter10.resetCoT()">Reset</button>
                </div>
                <div id="cotDisplay" style="min-height:200px;"></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF33</span> Tree of Thought: Exploring Many Paths</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Sometimes the AI explores MULTIPLE ways to solve a problem, like a choose-your-own-adventure book! Watch the "tree" of thinking paths. Green = correct path, Red = wrong paths.</p>
                <div class="network-viz">
                    <canvas id="cotTreeCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <button class="btn-primary btn-small" onclick="Chapter10.animateTree()">&#x25B6; Animate Paths</button>
                    <button class="btn-secondary btn-small" onclick="Chapter10.resetTree()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDD1D</span> Self-Consistency: Ask Your Friends!</h2>
                <div class="info-box success">
                    <span class="info-box-icon">\uD83D\uDE4B</span>
                    <span class="info-box-text"><strong>Self-Consistency</strong> is like asking 5 friends the same math question. Each friend shows their work differently, but if 4 out of 5 get "13 apples," that's probably the right answer! The AI generates multiple chain-of-thought answers and picks the most popular one!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Code: CoT Prompt</h2>
                <div class="code-block">
<span class="comment"># Chain-of-Thought Prompting</span>

prompt = <span class="string">"""Q: A farmer has 15 apples. She gives 3 to each of
her 4 friends and buys 10 more. How many apples
does she have now?

A: Let me think step by step.
1) The farmer starts with 15 apples.
2) She gives away 3 x 4 = 12 apples.
3) She has 15 - 12 = 3 apples left.
4) She buys 10 more: 3 + 10 = 13 apples.
The answer is 13.

Q: {new_question}

A: Let me think step by step."""</span>

response = model.<span class="function">generate</span>(prompt, max_tokens=<span class="number">200</span>)
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter10.startQuiz10_3()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('10-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('10-4')">Next: RLHF & Instruction Tuning \u2192</button>
            </div>
        `;

        this.cotStep = -1;
        this.drawCoTTree();
    },

    showDirectAnswer() {
        const display = document.getElementById('cotDisplay');
        if (!display) return;
        this.cotStep = -1;
        const nextBtn = document.getElementById('cotNextBtn');
        if (nextBtn) nextBtn.style.display = 'none';

        display.innerHTML = `
            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:20px;">
                <div style="color:#ef4444;font-weight:600;font-size:16px;margin-bottom:8px;">\u26A1 Direct Answer (No Thinking!):</div>
                <div style="color:#e8eaf0;font-size:15px;">"The answer is <strong style="color:#ef4444;">38 teddy bears</strong>" \u274C</div>
                <div style="color:#8b95a8;font-size:12px;margin-top:8px;">Oops! The AI just guessed without working through it. The right answer is 34!</div>
            </div>
        `;
    },

    startCoT() {
        this.cotStep = 0;
        const nextBtn = document.getElementById('cotNextBtn');
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        this.renderCoTSteps();
    },

    nextCoTStep() {
        if (this.cotStep < this.cotMaxSteps - 1) {
            this.cotStep++;
            this.renderCoTSteps();
        }
    },

    resetCoT() {
        this.cotStep = -1;
        const display = document.getElementById('cotDisplay');
        if (display) display.innerHTML = '';
        const nextBtn = document.getElementById('cotNextBtn');
        if (nextBtn) nextBtn.style.display = 'none';
    },

    renderCoTSteps() {
        const display = document.getElementById('cotDisplay');
        if (!display) return;

        const steps = [
            { text: 'The toy store starts with <strong>48 teddy bears</strong>.', detail: 'First, let me note what we begin with!' },
            { text: 'On Monday, they sell <strong>half</strong> of 48 = <strong>24 bears sold</strong>.', detail: '48 \u00F7 2 = 24. Half means dividing by 2!' },
            { text: 'After Monday: 48 - 24 = <strong>24 bears left</strong>.', detail: 'We subtract what was sold from the total.' },
            { text: 'Tuesday delivery: 24 + 20 = <strong>44 bears</strong>.', detail: 'The delivery truck brings 20 new friends!' },
            { text: 'Wednesday sales: 44 - 10 = <strong style="color:#10b981;">34 teddy bears left! \u2705</strong>', detail: 'And that\'s our final answer!' },
        ];

        let html = '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:20px;">';
        html += '<div style="color:#10b981;font-weight:600;font-size:16px;margin-bottom:12px;">\uD83E\uDDE0 Thinking Step by Step...</div>';

        for (let i = 0; i <= this.cotStep; i++) {
            const step = steps[i];
            const isActive = i === this.cotStep;
            html += `<div class="cot-step" style="display:flex;gap:12px;align-items:flex-start;margin:10px 0;padding:10px;border-radius:8px;background:${isActive ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.05)'};border:1px solid ${isActive ? 'rgba(99,102,241,0.4)' : 'transparent'};transition:all 0.3s;">
                <div class="cot-step-number" style="min-width:28px;height:28px;border-radius:50%;background:${isActive ? '#6366f1' : '#333'};color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">${i + 1}</div>
                <div>
                    <div style="color:#e8eaf0;font-size:14px;">${step.text}</div>
                    <div style="color:#8b95a8;font-size:12px;margin-top:4px;">${step.detail}</div>
                </div>
            </div>`;
        }

        if (this.cotStep >= this.cotMaxSteps - 1) {
            html += '<div style="color:#10b981;font-weight:600;margin-top:12px;font-size:15px;">\uD83C\uDF89 The answer is 34 teddy bears! By thinking step-by-step, we got it right!</div>';
            const nextBtn = document.getElementById('cotNextBtn');
            if (nextBtn) nextBtn.style.display = 'none';
        }

        html += '</div>';
        display.innerHTML = html;
    },

    drawCoTTree() {
        const canvas = document.getElementById('cotTreeCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Tree structure
        const nodes = [
            { x: 400, y: 40, label: 'Question', color: '#6366f1', level: 0 },
            // Level 1: approaches
            { x: 150, y: 140, label: 'Add all numbers', color: '#8b95a8', level: 1 },
            { x: 400, y: 140, label: 'Step by step math', color: '#8b95a8', level: 1 },
            { x: 650, y: 140, label: 'Guess the answer', color: '#8b95a8', level: 1 },
            // Level 2: results
            { x: 80, y: 250, label: '48+24+20+10=102', color: '#ef4444', level: 2 },
            { x: 220, y: 250, label: '48+20-24-10=34', color: '#ef4444', level: 2 },
            { x: 330, y: 250, label: '48/2=24, +20=44', color: '#10b981', level: 2 },
            { x: 470, y: 250, label: '48-24=24, +20=44', color: '#10b981', level: 2 },
            { x: 600, y: 250, label: 'Maybe 38?', color: '#ef4444', level: 2 },
            { x: 720, y: 250, label: 'About 30?', color: '#ef4444', level: 2 },
            // Level 3: final answers
            { x: 80, y: 350, label: '102 \u274C', color: '#ef4444', level: 3 },
            { x: 220, y: 350, label: '34 \u274C order', color: '#ef4444', level: 3 },
            { x: 400, y: 350, label: '34 \u2705 Correct!', color: '#10b981', level: 3 },
            { x: 600, y: 350, label: '38 \u274C', color: '#ef4444', level: 3 },
            { x: 720, y: 350, label: '30 \u274C', color: '#ef4444', level: 3 },
        ];

        const edges = [
            [0, 1], [0, 2], [0, 3],
            [1, 4], [1, 5],
            [2, 6], [2, 7],
            [3, 8], [3, 9],
            [4, 10], [5, 11],
            [6, 12], [7, 12],
            [8, 13], [9, 14],
        ];

        // Correct path edges
        const correctEdges = [
            [0, 2], [2, 6], [2, 7], [6, 12], [7, 12]
        ];

        const isCorrectEdge = (from, to) => {
            return correctEdges.some(e => e[0] === from && e[1] === to);
        };

        const highlightLevel = this.cotTreeHighlightPath;

        // Draw edges
        edges.forEach(([fromIdx, toIdx]) => {
            const from = nodes[fromIdx];
            const to = nodes[toIdx];
            const correct = isCorrectEdge(fromIdx, toIdx);
            const highlight = highlightLevel >= to.level;

            ctx.beginPath();
            ctx.moveTo(from.x, from.y + 16);
            ctx.lineTo(to.x, to.y - 16);
            ctx.strokeStyle = highlight ? (correct ? '#10b981' : '#ef4444') : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = highlight ? 3 : 1.5;
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach((node, i) => {
            const highlight = this.cotTreeHighlightPath >= node.level;
            const isCorrectNode = [0, 2, 6, 7, 12].includes(i);

            ctx.beginPath();
            const textWidth = ctx.measureText(node.label).width;
            const boxW = Math.max(textWidth + 20, 60);
            const boxH = 28;

            if (highlight) {
                ctx.shadowColor = isCorrectNode ? '#10b981' : '#ef4444';
                ctx.shadowBlur = 10;
            }

            ctx.fillStyle = highlight ?
                (isCorrectNode ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') :
                'rgba(255,255,255,0.05)';
            ctx.beginPath();
            ctx.roundRect(node.x - boxW / 2, node.y - boxH / 2, boxW, boxH, 8);
            ctx.fill();

            ctx.strokeStyle = highlight ?
                (isCorrectNode ? '#10b981' : '#ef4444') :
                'rgba(255,255,255,0.2)';
            ctx.lineWidth = highlight ? 2 : 1;
            ctx.stroke();

            ctx.shadowBlur = 0;

            ctx.fillStyle = highlight ? '#e8eaf0' : '#8b95a8';
            ctx.font = node.level === 3 ? 'bold 12px Inter' : '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y + 4);
        });

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('\uD83C\uDF33 Tree of Thought: Exploring different reasoning paths', 20, H - 10);
    },

    animateTree() {
        this.cotTreeHighlightPath = 0;
        this.drawCoTTree();

        let level = 0;
        if (this.cotTreeAnimFrame) clearInterval(this.cotTreeAnimFrame);
        this.cotTreeAnimFrame = setInterval(() => {
            level++;
            this.cotTreeHighlightPath = level;
            this.drawCoTTree();
            if (level >= 3) {
                clearInterval(this.cotTreeAnimFrame);
                this.cotTreeAnimFrame = null;
            }
        }, 800);
    },

    resetTree() {
        if (this.cotTreeAnimFrame) {
            clearInterval(this.cotTreeAnimFrame);
            this.cotTreeAnimFrame = null;
        }
        this.cotTreeHighlightPath = -1;
        this.drawCoTTree();
    },

    startQuiz10_3() {
        Quiz.start({
            title: 'Chapter 10.3: Chain-of-Thought Reasoning',
            chapterId: '10-3',
            questions: [
                {
                    question: 'What is "Chain-of-Thought" prompting?',
                    options: ['Making the AI think faster', 'Asking the AI to explain its reasoning step by step', 'Chaining multiple AIs together', 'Making the AI forget things'],
                    correct: 1,
                    explanation: 'Chain-of-Thought means asking the AI to show its work step by step, just like your teacher says on a math test!'
                },
                {
                    question: 'Why does Chain-of-Thought help AI get better answers?',
                    options: ['It makes the model bigger', 'Breaking problems into small steps reduces mistakes', 'It adds more training data', 'It uses more electricity'],
                    correct: 1,
                    explanation: 'Just like when you show your work in math, breaking a big problem into small steps helps avoid silly mistakes!'
                },
                {
                    question: 'What is "Self-Consistency"?',
                    options: ['Asking the AI once and trusting the answer', 'Generating multiple reasoning paths and picking the most common answer', 'Making the AI always say the same thing', 'Training the AI to be consistent'],
                    correct: 1,
                    explanation: 'Self-Consistency is like asking 5 friends the same question and going with the answer most of them agree on!'
                },
                {
                    question: 'What is "Tree of Thought"?',
                    options: ['Drawing pictures of trees', 'Exploring multiple different reasoning paths like branches', 'Planting ideas in the AI', 'A type of decision tree'],
                    correct: 1,
                    explanation: 'Tree of Thought explores many possible reasoning paths \u2014 like branches on a tree \u2014 and picks the path that leads to the best answer!'
                },
                {
                    question: 'What is the simplest way to trigger Chain-of-Thought?',
                    options: ['Use a bigger model', 'Add "Let\'s think step by step" to the prompt', 'Train the model longer', 'Use more GPUs'],
                    correct: 1,
                    explanation: 'Simply adding "Let\'s think step by step" to your prompt can dramatically improve the AI\'s reasoning \u2014 it\'s like magic words!'
                }
            ]
        });
    },

    // ============================================
    // 10.4: RLHF & Instruction Tuning
    // ============================================
    loadChapter10_4() {
        const container = document.getElementById('chapter-10-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 10 &bull; Chapter 10.4</span>
                <h1>\uD83D\uDC4D RLHF & Instruction Tuning</h1>
                <p>How do we teach an AI to be helpful, honest, and nice? It's like teaching a super-smart kid good manners!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFEB</span> The 3 Stages of AI School</h2>
                <p>Teaching an AI to be a great helper has THREE big stages, just like growing up!</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCDA</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Stage 1: Pre-Training</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Reading MILLIONS of books, websites, and articles. Like a baby absorbing everything it hears! The AI learns language but doesn't know how to be helpful yet.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFAF</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">Stage 2: Instruction Tuning</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Learning to FOLLOW DIRECTIONS with examples. Like going to school and learning to answer questions properly. "When someone asks X, respond like Y!"</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC4D</div>
                        <div style="font-weight:600;margin:6px 0;color:#10b981;">Stage 3: RLHF</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Learning from thumbs up \uD83D\uDC4D and thumbs down \uD83D\uDC4E from real people! Like your friends telling you "that was nice!" or "don't say that!" until you learn great manners!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Think of it this way:</strong> First you learn to talk (pre-train), then you learn good manners (instruction tune), then your friends tell you what's nice and what's not (RLHF)!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC4D</span> Interactive Preference Rater</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>YOU get to be the human teacher! Read the question, then pick which AI response is better. This is exactly how RLHF works!</p>
                <div id="preferenceGame" style="margin:16px 0;"></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD04</span> The RLHF Pipeline</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Watch how data flows through all 3 stages! Hit play to see the animation.</p>
                <div class="network-viz">
                    <canvas id="rlhfCanvas" width="800" height="350"></canvas>
                </div>
                <div class="controls">
                    <button class="btn-primary btn-small" onclick="Chapter10.playRlhfFlow()">&#x25B6; Play Animation</button>
                    <button class="btn-secondary btn-small" onclick="Chapter10.resetRlhfFlow()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Code: Training Pipeline</h2>
                <div class="code-block">
<span class="comment"># The 3 stages of making a helpful AI!</span>

<span class="comment"># Stage 1: Pre-training (read everything)</span>
base_model = <span class="function">pretrain</span>(
    data=<span class="string">"internet_text"</span>,     <span class="comment"># Trillions of words</span>
    params=<span class="number">70_000_000_000</span>,    <span class="comment"># 70 billion dials</span>
    objective=<span class="string">"next_word"</span>     <span class="comment"># Predict next word</span>
)

<span class="comment"># Stage 2: Instruction tuning (learn manners)</span>
sft_model = <span class="function">fine_tune</span>(
    model=base_model,
    data=<span class="string">"instruction_examples"</span>,  <span class="comment"># Q&A pairs</span>
    method=<span class="string">"supervised"</span>            <span class="comment"># Learn from examples</span>
)

<span class="comment"># Stage 3: RLHF (learn from human feedback)</span>
reward_model = <span class="function">train_reward</span>(
    data=<span class="string">"human_preferences"</span>  <span class="comment"># Which answer humans liked</span>
)
final_model = <span class="function">rlhf_train</span>(
    model=sft_model,
    reward=reward_model,
    method=<span class="string">"PPO"</span>  <span class="comment"># Proximal Policy Optimization</span>
)
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter10.startQuiz10_4()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('10-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('10-5')">Next: Advanced Alignment \u2192</button>
            </div>
        `;

        this.rlhfRound = 0;
        this.rlhfScore = 0;
        this.preferenceChoices = [];
        this.renderPreferenceRound();
        this.drawRlhfPipeline();
    },

    getPreferenceRounds() {
        return [
            {
                question: 'How do I make a paper airplane?',
                responseA: {
                    text: 'Whatever. Just fold some paper or something, I don\'t care.',
                    quality: 'bad',
                    reason: 'Rude and unhelpful'
                },
                responseB: {
                    text: 'Great question! Here\'s how: 1) Take a sheet of paper, 2) Fold it in half lengthwise, 3) Fold the top corners down to the center, 4) Fold the wings down. Now throw it gently and watch it fly!',
                    quality: 'good',
                    reason: 'Helpful, clear, and friendly!'
                },
                goodSide: 'B'
            },
            {
                question: 'What\'s 2 + 2?',
                responseA: {
                    text: 'The answer is 4! That\'s because when you combine two groups of 2 things, you get 4 things total.',
                    quality: 'good',
                    reason: 'Correct and explains why!'
                },
                responseB: {
                    text: 'The answer is 22! You just put the two 2s next to each other!',
                    quality: 'bad',
                    reason: 'Wrong answer! 2+2=4, not 22!'
                },
                goodSide: 'A'
            },
            {
                question: 'Can you help me trick my friend?',
                responseA: {
                    text: 'Sure! Here are 10 mean tricks to play on your friend...',
                    quality: 'bad',
                    reason: 'Helping with something mean!'
                },
                responseB: {
                    text: 'I\'d rather help you plan something nice! How about a surprise birthday party or a fun game you could play together?',
                    quality: 'good',
                    reason: 'Redirects to something positive!'
                },
                goodSide: 'B'
            },
            {
                question: 'Why is the sky blue?',
                responseA: {
                    text: 'Sunlight has all colors mixed together. When it hits the air, blue light bounces around the most because it travels in short, tiny waves. So when you look up, you see all that bouncing blue light!',
                    quality: 'good',
                    reason: 'Accurate and easy to understand!'
                },
                responseB: {
                    text: 'Because someone painted it blue a long time ago. Nobody knows who did it though.',
                    quality: 'bad',
                    reason: 'Made up a wrong answer!'
                },
                goodSide: 'A'
            },
            {
                question: 'I\'m feeling really sad today.',
                responseA: {
                    text: 'Stop being sad. Just be happy. It\'s not that hard.',
                    quality: 'bad',
                    reason: 'Dismissive and not understanding!'
                },
                responseB: {
                    text: 'I\'m sorry you\'re feeling sad. It\'s totally okay to feel that way sometimes. Would you like to talk about what\'s bothering you? Sometimes sharing how we feel can help us feel a little better.',
                    quality: 'good',
                    reason: 'Empathetic and supportive!'
                },
                goodSide: 'B'
            }
        ];
    },

    renderPreferenceRound() {
        const game = document.getElementById('preferenceGame');
        if (!game) return;

        const rounds = this.getPreferenceRounds();

        if (this.rlhfRound >= rounds.length) {
            // Show results
            const score = this.rlhfScore;
            const total = rounds.length;
            game.innerHTML = `
                <div style="text-align:center;padding:30px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;">
                    <div style="font-size:48px;">${score >= 4 ? '\uD83C\uDF89' : score >= 3 ? '\uD83D\uDC4D' : '\uD83E\uDD14'}</div>
                    <div style="font-size:20px;font-weight:700;color:#e8eaf0;margin:12px 0;">You scored ${score}/${total}!</div>
                    <div style="color:#8b95a8;margin-bottom:16px;">${score >= 4 ? 'Amazing! You\'d be a GREAT AI trainer! You know exactly what makes a good response.' : score >= 3 ? 'Good job! You have a great sense for helpful, honest, and kind responses!' : 'Nice try! Remember: good AI responses are helpful, honest, and kind!'}</div>
                    <div style="font-size:14px;color:#818cf8;font-weight:600;">What makes responses GOOD:</div>
                    <div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
                        <span style="background:rgba(16,185,129,0.2);padding:6px 14px;border-radius:20px;font-size:13px;color:#10b981;">\uD83D\uDC4D Helpful</span>
                        <span style="background:rgba(99,102,241,0.2);padding:6px 14px;border-radius:20px;font-size:13px;color:#818cf8;">\uD83D\uDCDD Honest</span>
                        <span style="background:rgba(245,158,11,0.2);padding:6px 14px;border-radius:20px;font-size:13px;color:#f59e0b;">\uD83D\uDE0A Harmless</span>
                    </div>
                    <button class="btn-secondary btn-small" onclick="Chapter10.resetPreferenceGame()" style="margin-top:16px;">Play Again</button>
                </div>
            `;
            return;
        }

        const round = rounds[this.rlhfRound];
        const roundNum = this.rlhfRound + 1;

        game.innerHTML = `
            <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
                <span style="color:#818cf8;font-weight:600;">Round ${roundNum} of ${rounds.length}</span>
                <span style="color:#10b981;font-weight:600;">Score: ${this.rlhfScore}/${this.rlhfRound}</span>
            </div>
            <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:14px;margin-bottom:16px;">
                <div style="color:#818cf8;font-size:12px;font-weight:600;">QUESTION:</div>
                <div style="color:#e8eaf0;font-size:15px;font-weight:500;">${round.question}</div>
            </div>
            <div style="font-size:13px;color:#8b95a8;margin-bottom:10px;text-align:center;">Which response is better? Click to choose!</div>
            <div class="preference-pair" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="response-card" onclick="Chapter10.pickPreference('A')" id="respCardA" style="cursor:pointer;padding:16px;border-radius:12px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);transition:all 0.3s;">
                    <div style="color:#818cf8;font-weight:600;margin-bottom:8px;">Response A</div>
                    <div style="color:#e8eaf0;font-size:14px;line-height:1.6;">${round.responseA.text}</div>
                </div>
                <div class="response-card" onclick="Chapter10.pickPreference('B')" id="respCardB" style="cursor:pointer;padding:16px;border-radius:12px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);transition:all 0.3s;">
                    <div style="color:#818cf8;font-weight:600;margin-bottom:8px;">Response B</div>
                    <div style="color:#e8eaf0;font-size:14px;line-height:1.6;">${round.responseB.text}</div>
                </div>
            </div>
        `;
    },

    pickPreference(choice) {
        const rounds = this.getPreferenceRounds();
        const round = rounds[this.rlhfRound];
        const correct = choice === round.goodSide;

        if (correct) this.rlhfScore++;
        this.preferenceChoices.push(choice);

        // Show feedback
        const cardA = document.getElementById('respCardA');
        const cardB = document.getElementById('respCardB');

        if (cardA && cardB) {
            cardA.onclick = null;
            cardB.onclick = null;
            cardA.style.cursor = 'default';
            cardB.style.cursor = 'default';

            if (round.goodSide === 'A') {
                cardA.style.borderColor = '#10b981';
                cardA.style.background = 'rgba(16,185,129,0.1)';
                cardB.style.borderColor = '#ef4444';
                cardB.style.background = 'rgba(239,68,68,0.1)';
            } else {
                cardB.style.borderColor = '#10b981';
                cardB.style.background = 'rgba(16,185,129,0.1)';
                cardA.style.borderColor = '#ef4444';
                cardA.style.background = 'rgba(239,68,68,0.1)';
            }

            // Add explanation
            const goodCard = round.goodSide === 'A' ? cardA : cardB;
            const badCard = round.goodSide === 'A' ? cardB : cardA;
            goodCard.innerHTML += `<div style="color:#10b981;font-size:12px;margin-top:8px;font-weight:600;">\u2705 ${round.goodSide === 'A' ? round.responseA.reason : round.responseB.reason}</div>`;
            badCard.innerHTML += `<div style="color:#ef4444;font-size:12px;margin-top:8px;font-weight:600;">\u274C ${round.goodSide === 'A' ? round.responseB.reason : round.responseA.reason}</div>`;
        }

        // Next round after delay
        setTimeout(() => {
            this.rlhfRound++;
            this.renderPreferenceRound();
        }, 1800);
    },

    resetPreferenceGame() {
        this.rlhfRound = 0;
        this.rlhfScore = 0;
        this.preferenceChoices = [];
        this.renderPreferenceRound();
    },

    drawRlhfPipeline() {
        const canvas = document.getElementById('rlhfCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const stages = [
            { x: 60, y: H / 2, w: 100, h: 60, label: 'Raw Text', sublabel: 'Books & Web', color: '#8b95a8', icon: '\uD83D\uDCDA' },
            { x: 210, y: H / 2, w: 110, h: 60, label: 'Pre-trained', sublabel: 'Base Model', color: '#6366f1', icon: '\uD83E\uDDE0' },
            { x: 370, y: H / 2, w: 110, h: 60, label: 'Instruction', sublabel: 'Data (Q&A)', color: '#f59e0b', icon: '\uD83C\uDFAF' },
            { x: 530, y: H / 2, w: 110, h: 60, label: 'SFT Model', sublabel: 'Follows Orders', color: '#818cf8', icon: '\uD83C\uDF93' },
            { x: 690, y: H / 2 - 50, w: 100, h: 50, label: 'Human Prefs', sublabel: '\uD83D\uDC4D vs \uD83D\uDC4E', color: '#10b981', icon: '\uD83D\uDC65' },
            { x: 690, y: H / 2 + 30, w: 100, h: 50, label: 'RLHF Model', sublabel: 'Final AI!', color: '#10b981', icon: '\u2B50' },
        ];

        const arrows = [
            [0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [4, 5]
        ];

        const flowStep = this.rlhfFlowStep;

        // Draw arrows
        arrows.forEach(([fromIdx, toIdx], aIdx) => {
            const from = stages[fromIdx];
            const to = stages[toIdx];
            const fromRight = from.x + from.w;
            const toLeft = to.x;
            const fromCY = from.y + (fromIdx === 3 && toIdx === 4 ? 0 : from.h / 2);
            const toCY = to.y + to.h / 2;

            const active = flowStep > aIdx;

            ctx.beginPath();
            ctx.moveTo(fromRight + 2, from.y + from.h / 2);
            ctx.lineTo(toLeft - 2, to.y + to.h / 2);
            ctx.strokeStyle = active ? '#6366f1' : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = active ? 3 : 1.5;
            ctx.stroke();

            // Arrowhead
            const angle = Math.atan2(to.y + to.h / 2 - from.y - from.h / 2, toLeft - fromRight);
            const ax = toLeft - 2;
            const ay = to.y + to.h / 2;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax - 10 * Math.cos(angle - 0.4), ay - 10 * Math.sin(angle - 0.4));
            ctx.lineTo(ax - 10 * Math.cos(angle + 0.4), ay - 10 * Math.sin(angle + 0.4));
            ctx.closePath();
            ctx.fillStyle = active ? '#6366f1' : 'rgba(255,255,255,0.15)';
            ctx.fill();

            // Animated particle
            if (active && this.rlhfFlowPlaying) {
                const t = (Date.now() % 1500) / 1500;
                const px = fromRight + t * (toLeft - fromRight);
                const py = from.y + from.h / 2 + t * (to.y + to.h / 2 - from.y - from.h / 2);
                ctx.beginPath();
                ctx.arc(px, py, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();
                ctx.shadowColor = '#f59e0b';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // Draw stage boxes
        stages.forEach((stage, i) => {
            const active = flowStep > i || (i === 0);

            if (active) {
                ctx.shadowColor = stage.color;
                ctx.shadowBlur = 12;
            }

            ctx.fillStyle = active ? stage.color + '33' : 'rgba(255,255,255,0.05)';
            ctx.beginPath();
            ctx.roundRect(stage.x, stage.y, stage.w, stage.h, 10);
            ctx.fill();

            ctx.strokeStyle = active ? stage.color : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = active ? 2 : 1;
            ctx.stroke();

            ctx.shadowBlur = 0;

            // Label
            ctx.fillStyle = active ? '#e8eaf0' : '#8b95a8';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(stage.label, stage.x + stage.w / 2, stage.y + stage.h / 2 - 2);
            ctx.font = '10px Inter';
            ctx.fillStyle = active ? '#8b95a8' : '#555';
            ctx.fillText(stage.sublabel, stage.x + stage.w / 2, stage.y + stage.h / 2 + 14);
        });

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('\uD83D\uDD04 RLHF Training Pipeline: From Raw Text to Helpful AI', W / 2, 24);
    },

    playRlhfFlow() {
        this.rlhfFlowStep = 0;
        this.rlhfFlowPlaying = true;

        if (this.rlhfAnimFrame) clearInterval(this.rlhfAnimFrame);

        // Step animation
        let stepTimer = setInterval(() => {
            this.rlhfFlowStep++;
            if (this.rlhfFlowStep > 6) {
                clearInterval(stepTimer);
            }
        }, 1000);

        // Render loop for particles
        const renderLoop = () => {
            this.drawRlhfPipeline();
            if (this.rlhfFlowPlaying) {
                this.rlhfAnimFrame = requestAnimationFrame(renderLoop);
            }
        };
        renderLoop();
    },

    resetRlhfFlow() {
        this.rlhfFlowPlaying = false;
        this.rlhfFlowStep = 0;
        if (this.rlhfAnimFrame) {
            cancelAnimationFrame(this.rlhfAnimFrame);
            this.rlhfAnimFrame = null;
        }
        this.drawRlhfPipeline();
    },

    startQuiz10_4() {
        Quiz.start({
            title: 'Chapter 10.4: RLHF & Instruction Tuning',
            chapterId: '10-4',
            questions: [
                {
                    question: 'What are the 3 stages of training a helpful AI?',
                    options: ['Download, Install, Run', 'Pre-training, Instruction Tuning, RLHF', 'Reading, Writing, Arithmetic', 'Design, Build, Test'],
                    correct: 1,
                    explanation: 'The three stages are: Pre-training (reading everything), Instruction Tuning (learning to follow directions), and RLHF (learning from human feedback)!'
                },
                {
                    question: 'What does RLHF stand for?',
                    options: ['Really Large Helpful Friend', 'Reinforcement Learning from Human Feedback', 'Reading Lots of Helpful Files', 'Running Language Help Functions'],
                    correct: 1,
                    explanation: 'RLHF stands for Reinforcement Learning from Human Feedback \u2014 the AI learns what humans like and don\'t like!'
                },
                {
                    question: 'What happens during "instruction tuning"?',
                    options: ['The AI reads random text', 'The AI learns to follow directions from example Q&A pairs', 'The AI gets bigger', 'The AI is deleted and rebuilt'],
                    correct: 1,
                    explanation: 'During instruction tuning, the AI practices following directions by learning from lots of example questions and good answers!'
                },
                {
                    question: 'In RLHF, what does the "reward model" learn?',
                    options: ['How to write code', 'Which responses humans prefer (like vs dislike)', 'How to make the AI bigger', 'How to speed up the computer'],
                    correct: 1,
                    explanation: 'The reward model learns to predict which responses humans will give a thumbs up to \u2014 it becomes a judge of quality!'
                },
                {
                    question: 'What makes a good AI response? (Choose the BEST answer)',
                    options: ['Being as long as possible', 'Being helpful, honest, and harmless', 'Using big complicated words', 'Always agreeing with the user'],
                    correct: 1,
                    explanation: 'The best AI responses are helpful (actually useful), honest (truthful), and harmless (don\'t cause problems). This is called the HHH framework!'
                }
            ]
        });
    },

    // ============================================
    // 10.5: Advanced Alignment (Constitutional AI, DPO)
    // ============================================
    loadChapter10_5() {
        const container = document.getElementById('chapter-10-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 10 &bull; Chapter 10.5</span>
                <h1>\uD83D\uDCDC Advanced Alignment: Constitutional AI & DPO</h1>
                <p>What if we could give the AI a rulebook to follow AND teach it to check its own homework? Let's learn about the coolest new ways to make AI safe and helpful!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCDC</span> Constitutional AI: The AI's Rulebook</h2>
                <p>Imagine you write a list of rules for being a good person \u2014 like "Be kind," "Tell the truth," and "Don't hurt anyone." Now imagine giving that list to the AI and saying: <strong>"Follow these rules, and then check your OWN work to make sure you did!"</strong></p>
                <p>That's <strong>Constitutional AI</strong>! The AI gets a "constitution" (a set of principles) and learns to evaluate and fix its own responses!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Constitutional AI</strong> is like giving a kid a rulebook of do's and don'ts, then asking them to grade their OWN homework using that rulebook! The AI writes an answer, checks it against the rules, and revises it to be better!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDEE0\uFE0F</span> Interactive Constitution Builder</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Toggle the principles on and off to see how they change the AI's response! Each principle makes the AI revise its answer!</p>
                <div id="constitutionBuilder" style="margin:16px 0;"></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> DPO: The Shortcut Method</h2>
                <p><strong>DPO (Direct Preference Optimization)</strong> is a clever shortcut! Instead of training a whole separate "judge" (reward model) like in RLHF, DPO teaches the AI directly from examples of good and bad answers!</p>
                <div class="info-box success">
                    <span class="info-box-icon">\u2B50</span>
                    <span class="info-box-text"><strong>Think of it this way:</strong> RLHF is like hiring a tutor to grade your work, then learning from their grades. DPO is like learning directly from a workbook that shows you "this answer is RIGHT, this answer is WRONG" \u2014 no tutor needed! It's simpler AND often works just as well!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD00</span> RLHF vs DPO: The Path Comparison</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Watch and compare the two paths! RLHF needs 3 steps, but DPO only needs 2!</p>
                <div class="network-viz">
                    <canvas id="alignmentCanvas" width="800" height="350"></canvas>
                </div>
                <div class="controls">
                    <button class="btn-primary btn-small" onclick="Chapter10.animateAlignment()">&#x25B6; Animate Comparison</button>
                    <button class="btn-secondary btn-small" onclick="Chapter10.resetAlignment()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2696\uFE0F</span> Comparing the Three Methods</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC4D</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">RLHF</div>
                        <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                            <strong>Steps:</strong> SFT \u2192 Train Reward Model \u2192 PPO<br>
                            <strong>Pros:</strong> Very effective, well-tested<br>
                            <strong>Cons:</strong> Complex, needs reward model, expensive
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFAF</div>
                        <div style="font-weight:600;margin:6px 0;color:#10b981;">DPO</div>
                        <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                            <strong>Steps:</strong> SFT \u2192 DPO Training<br>
                            <strong>Pros:</strong> Simpler, no reward model needed<br>
                            <strong>Cons:</strong> Newer method, still being studied
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCDC</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">Constitutional AI</div>
                        <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
                            <strong>Steps:</strong> SFT \u2192 AI Self-Critique \u2192 RLAIF<br>
                            <strong>Pros:</strong> Less human labeling needed<br>
                            <strong>Cons:</strong> Needs good principles, AI judges itself
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Code: Constitutional Principles</h2>
                <div class="code-block">
<span class="comment"># Constitutional AI principles (the AI's rulebook!)</span>

principles = [
    <span class="string">"Be helpful: Give useful, accurate information."</span>,
    <span class="string">"Be honest: Never make up facts or lie."</span>,
    <span class="string">"Be harmless: Don't help with anything dangerous."</span>,
    <span class="string">"Be fair: Treat everyone equally, no bias."</span>,
    <span class="string">"Respect privacy: Never share personal info."</span>,
    <span class="string">"Admit mistakes: Say 'I don't know' when unsure."</span>,
]

<span class="comment"># Step 1: AI generates a response</span>
response = model.<span class="function">generate</span>(question)

<span class="comment"># Step 2: AI critiques its OWN response</span>
<span class="keyword">for</span> principle <span class="keyword">in</span> principles:
    critique = model.<span class="function">generate</span>(
        <span class="string">f"Does this response follow the rule: </span>
        <span class="string">{principle}? If not, revise it."</span>
    )

<span class="comment"># Step 3: AI outputs the revised response!</span>
final_response = model.<span class="function">generate</span>(revised_prompt)
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter10.startQuiz10_5()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('10-4')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('11-1')">Next: Module 11 \u2192</button>
            </div>
        `;

        this.activePrinciples = [true, true, true, true, true, true];
        this.renderConstitutionBuilder();
        this.drawAlignmentComparison();
    },

    renderConstitutionBuilder() {
        const builder = document.getElementById('constitutionBuilder');
        if (!builder) return;

        const principles = [
            { name: 'Be Helpful', icon: '\uD83D\uDC4D', color: '#6366f1' },
            { name: 'Be Honest', icon: '\uD83D\uDCDD', color: '#818cf8' },
            { name: "Don't Be Harmful", icon: '\uD83D\uDEE1\uFE0F', color: '#ef4444' },
            { name: 'Be Fair', icon: '\u2696\uFE0F', color: '#f59e0b' },
            { name: 'Respect Privacy', icon: '\uD83D\uDD12', color: '#10b981' },
            { name: 'Admit Mistakes', icon: '\uD83E\uDD37', color: '#8b5cf6' },
        ];

        // Build the response based on active principles
        const question = 'A user asks: "Tell me about my neighbor John Smith and give me advice on how to win an argument with him."';

        let response = '';
        const activeList = this.activePrinciples;

        // Build progressive response
        const helpful = activeList[0];
        const honest = activeList[1];
        const notHarmful = activeList[2];
        const fair = activeList[3];
        const privacy = activeList[4];
        const admitMistakes = activeList[5];

        if (!helpful && !honest && !notHarmful && !fair && !privacy && !admitMistakes) {
            response = '"Sure! John Smith at 123 Main Street is always wrong about everything. Here\'s how to crush him in any argument: just yell louder and make stuff up to sound smart!"';
        } else {
            let parts = [];
            if (helpful) {
                parts.push('I\'d be happy to help you with communication tips!');
            }
            if (privacy) {
                parts.push('I can\'t share personal information about specific people \u2014 that\'s private!');
            }
            if (notHarmful) {
                parts.push('Instead of "winning" arguments, let me suggest ways to have a respectful conversation where both sides feel heard.');
            }
            if (honest) {
                parts.push('Honestly, arguments usually aren\'t about winning \u2014 they\'re about understanding each other.');
            }
            if (fair) {
                parts.push('Remember to listen to the other person\'s side too \u2014 everyone deserves to be heard fairly!');
            }
            if (admitMistakes) {
                parts.push('And it\'s totally okay to say "You know what, I was wrong about that" \u2014 it actually makes people respect you MORE!');
            }
            response = '"' + parts.join(' ') + '"';
        }

        let html = '';

        // Principle toggle buttons
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;justify-content:center;">';
        principles.forEach((p, i) => {
            const active = this.activePrinciples[i];
            html += `<button onclick="Chapter10.togglePrinciple(${i})" style="
                padding:8px 16px;border-radius:20px;border:2px solid ${active ? p.color : 'rgba(255,255,255,0.15)'};
                background:${active ? p.color + '22' : 'transparent'};
                color:${active ? p.color : '#8b95a8'};
                cursor:pointer;font-size:13px;font-weight:600;
                transition:all 0.3s;
            ">${p.icon} ${p.name} ${active ? '\u2705' : '\u274C'}</button>`;
        });
        html += '</div>';

        // Question
        html += `<div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:14px;margin-bottom:12px;">
            <div style="color:#818cf8;font-size:12px;font-weight:600;">TRICKY QUESTION:</div>
            <div style="color:#e8eaf0;font-size:14px;">${question}</div>
        </div>`;

        // Active principle count
        const activeCount = this.activePrinciples.filter(p => p).length;
        const safetyColor = activeCount >= 5 ? '#10b981' : activeCount >= 3 ? '#f59e0b' : '#ef4444';
        const safetyLabel = activeCount >= 5 ? 'Very Safe!' : activeCount >= 3 ? 'Getting Better' : 'Needs More Rules!';

        html += `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <span style="color:#e8eaf0;font-weight:600;font-size:13px;">Safety Level:</span>
            <div style="flex:1;height:20px;background:rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;">
                <div style="height:100%;width:${(activeCount / 6) * 100}%;background:${safetyColor};border-radius:10px;transition:all 0.5s;"></div>
            </div>
            <span style="color:${safetyColor};font-weight:600;font-size:13px;">${safetyLabel}</span>
        </div>`;

        // AI Response
        html += `<div style="background:rgba(${activeCount >= 4 ? '16,185,129' : activeCount >= 2 ? '245,158,11' : '239,68,68'},0.1);border:1px solid rgba(${activeCount >= 4 ? '16,185,129' : activeCount >= 2 ? '245,158,11' : '239,68,68'},0.3);border-radius:10px;padding:14px;">
            <div style="color:${safetyColor};font-size:12px;font-weight:600;">AI RESPONSE (revised by ${activeCount} principle${activeCount !== 1 ? 's' : ''}):</div>
            <div style="color:#e8eaf0;font-size:14px;line-height:1.6;margin-top:6px;">${response}</div>
        </div>`;

        builder.innerHTML = html;
    },

    togglePrinciple(idx) {
        this.activePrinciples[idx] = !this.activePrinciples[idx];
        this.renderConstitutionBuilder();
    },

    drawAlignmentComparison() {
        const canvas = document.getElementById('alignmentCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const step = this.alignAnimStep;

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 15px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('RLHF vs DPO: Two Paths to Alignment', W / 2, 28);

        // --- RLHF Path (top) ---
        const rlhfY = 90;
        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('RLHF Path (3 steps):', 30, rlhfY - 20);

        const rlhfBoxes = [
            { x: 50, y: rlhfY, w: 130, h: 50, label: 'SFT Model', sublabel: 'Supervised Fine-Tuning', color: '#6366f1' },
            { x: 240, y: rlhfY, w: 150, h: 50, label: 'Train Reward Model', sublabel: 'Learn human preferences', color: '#f59e0b' },
            { x: 450, y: rlhfY, w: 130, h: 50, label: 'PPO Training', sublabel: 'Optimize with RL', color: '#8b5cf6' },
            { x: 640, y: rlhfY, w: 120, h: 50, label: 'Aligned Model', sublabel: 'RLHF complete!', color: '#10b981' },
        ];

        // --- DPO Path (bottom) ---
        const dpoY = 230;
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('DPO Path (2 steps - simpler!):', 30, dpoY - 20);

        const dpoBoxes = [
            { x: 50, y: dpoY, w: 130, h: 50, label: 'SFT Model', sublabel: 'Supervised Fine-Tuning', color: '#6366f1' },
            { x: 320, y: dpoY, w: 180, h: 50, label: 'DPO Training', sublabel: 'Learn directly from pairs', color: '#10b981' },
            { x: 640, y: dpoY, w: 120, h: 50, label: 'Aligned Model', sublabel: 'DPO complete!', color: '#10b981' },
        ];

        const drawBoxes = (boxes, stepThreshold) => {
            // Draw arrows
            for (let i = 0; i < boxes.length - 1; i++) {
                const from = boxes[i];
                const to = boxes[i + 1];
                const active = step > i + stepThreshold;

                ctx.beginPath();
                ctx.moveTo(from.x + from.w + 4, from.y + from.h / 2);
                ctx.lineTo(to.x - 4, to.y + to.h / 2);
                ctx.strokeStyle = active ? '#6366f1' : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = active ? 3 : 1.5;
                ctx.stroke();

                // Arrow head
                const ax = to.x - 4;
                const ay = to.y + to.h / 2;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(ax - 10, ay - 5);
                ctx.lineTo(ax - 10, ay + 5);
                ctx.closePath();
                ctx.fillStyle = active ? '#6366f1' : 'rgba(255,255,255,0.15)';
                ctx.fill();

                // Animated particle
                if (active && this.alignAnimStep > 0) {
                    const t = (Date.now() % 1200) / 1200;
                    const px = from.x + from.w + t * (to.x - from.x - from.w);
                    const py = from.y + from.h / 2;
                    ctx.beginPath();
                    ctx.arc(px, py, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#f59e0b';
                    ctx.shadowColor = '#f59e0b';
                    ctx.shadowBlur = 8;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            // Draw boxes
            boxes.forEach((box, i) => {
                const active = step > i + stepThreshold || i === 0;

                if (active) {
                    ctx.shadowColor = box.color;
                    ctx.shadowBlur = 10;
                }

                ctx.fillStyle = active ? box.color + '33' : 'rgba(255,255,255,0.05)';
                ctx.beginPath();
                ctx.roundRect(box.x, box.y, box.w, box.h, 10);
                ctx.fill();

                ctx.strokeStyle = active ? box.color : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = active ? 2 : 1;
                ctx.stroke();

                ctx.shadowBlur = 0;

                ctx.fillStyle = active ? '#e8eaf0' : '#8b95a8';
                ctx.font = 'bold 13px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(box.label, box.x + box.w / 2, box.y + box.h / 2 - 4);
                ctx.font = '10px Inter';
                ctx.fillStyle = '#8b95a8';
                ctx.fillText(box.sublabel, box.x + box.w / 2, box.y + box.h / 2 + 12);
            });
        };

        drawBoxes(rlhfBoxes, 0);
        drawBoxes(dpoBoxes, 0);

        // Comparison note at bottom
        ctx.fillStyle = '#8b95a8';
        ctx.font = '13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('DPO skips the reward model step \u2014 going straight from preferences to training!', W / 2, H - 20);
    },

    animateAlignment() {
        this.alignAnimStep = 0;
        if (this.alignAnimFrame) cancelAnimationFrame(this.alignAnimFrame);

        let lastStep = Date.now();
        const animate = () => {
            const now = Date.now();
            if (now - lastStep > 900) {
                this.alignAnimStep++;
                lastStep = now;
            }
            this.drawAlignmentComparison();
            if (this.alignAnimStep <= 5) {
                this.alignAnimFrame = requestAnimationFrame(animate);
            }
        };
        animate();
    },

    resetAlignment() {
        this.alignAnimStep = 0;
        if (this.alignAnimFrame) {
            cancelAnimationFrame(this.alignAnimFrame);
            this.alignAnimFrame = null;
        }
        this.drawAlignmentComparison();
    },

    startQuiz10_5() {
        Quiz.start({
            title: 'Chapter 10.5: Advanced Alignment (Constitutional AI, DPO)',
            chapterId: '10-5',
            questions: [
                {
                    question: 'What is Constitutional AI?',
                    options: ['An AI that studies law', 'An AI that follows a set of principles and checks its own responses', 'An AI that writes constitutions', 'An AI that only works in one country'],
                    correct: 1,
                    explanation: 'Constitutional AI gives the model a set of rules (principles) and teaches it to critique and revise its own responses \u2014 like checking your own homework!'
                },
                {
                    question: 'How is DPO different from RLHF?',
                    options: ['DPO uses a bigger model', 'DPO skips the reward model and learns directly from preference pairs', 'DPO doesn\'t use any human data', 'DPO is the same thing as RLHF'],
                    correct: 1,
                    explanation: 'DPO (Direct Preference Optimization) is simpler because it skips building a separate reward model. It learns directly from examples of good vs bad answers!'
                },
                {
                    question: 'What does RLAIF stand for in Constitutional AI?',
                    options: ['Really Large AI Files', 'Reinforcement Learning from AI Feedback', 'Running Large AI Functions', 'Reading Lots of AI Facts'],
                    correct: 1,
                    explanation: 'RLAIF means Reinforcement Learning from AI Feedback \u2014 instead of humans rating responses, the AI evaluates itself using its constitutional principles!'
                },
                {
                    question: 'Why might Constitutional AI need FEWER human labelers?',
                    options: ['It doesn\'t need any data at all', 'The AI does much of the evaluation itself using principles', 'It only uses computers, no humans involved', 'It works without training'],
                    correct: 1,
                    explanation: 'Since the AI checks its own responses against the principles, you need fewer humans to rate responses \u2014 the AI does a lot of the work itself!'
                },
                {
                    question: 'Which describes a good "constitutional principle"?',
                    options: ['"Always agree with the user no matter what"', '"Be helpful, honest, and avoid causing harm"', '"Make responses as long as possible"', '"Use as many big words as you can"'],
                    correct: 1,
                    explanation: 'Good principles guide the AI to be genuinely helpful, truthful, and safe \u2014 not just agreeable or verbose!'
                }
            ]
        });
    }
};
