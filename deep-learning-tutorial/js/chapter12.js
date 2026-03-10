/* ============================================
   Chapter 12: Frontier & Emerging Techniques
   ============================================ */

const Chapter12 = {
    // State
    mambaAnimFrame: null,
    mambaSeqLen: 500,
    moeSelectedCategory: null,
    moeAnimFrame: null,
    moeAnimating: false,
    loraAnimating: false,
    loraAnimFrame: null,
    loraFullCells: [],
    loraLoraCells: [],
    loraStep: 0,
    ragSelectedQuery: null,
    ragAnimating: false,
    ragAnimFrame: null,
    ragStep: 0,
    agentRunning: false,
    agentAnimFrame: null,
    agentCurrentNode: 0,
    agentLoopCount: 0,
    agentGoal: 'Research a topic',
    agentSelectedTools: [],
    agentBubbleText: '',

    init() {
        App.registerChapter('12-1', () => this.loadChapter12_1());
        App.registerChapter('12-2', () => this.loadChapter12_2());
        App.registerChapter('12-3', () => this.loadChapter12_3());
        App.registerChapter('12-4', () => this.loadChapter12_4());
        App.registerChapter('12-5', () => this.loadChapter12_5());
    },

    // ============================================
    // 12.1: State Space Models & Mamba
    // ============================================
    loadChapter12_1() {
        const container = document.getElementById('chapter-12-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 12 &bull; Chapter 12.1</span>
                <h1>State Space Models & Mamba</h1>
                <p>Meet the speed reader that zooms through super long books just as well as Transformers - but WAY faster! Let's see how Mamba works its magic!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCDA</span> The Long Book Problem</h2>
                <p>Transformers are super smart but slow with really long books. Mamba is like a <strong>speed reader</strong> who zooms through the whole book just as well but WAY faster!</p>
                <p>Think about it like this: when a Transformer reads, it compares <em>every single word</em> with <em>every other word</em>. That's like asking everyone in your class to shake hands with everyone else. With 10 kids that's 45 handshakes, but with 20 kids it's 190! It grows really fast!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">If you double the book length, Transformers take <strong>4x longer</strong> but Mamba only takes <strong>2x longer</strong>! That's the difference between <em>quadratic</em> and <em>linear</em> complexity.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFC1</span> Complexity Race: Transformer vs Mamba</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Drag the slider to increase the sequence length and watch how Transformer slows down compared to Mamba!</p>
                <div class="controls" style="margin-bottom:12px;">
                    <label style="font-weight:600;color:var(--text-primary);">Sequence Length: <span id="mambaSeqLabel">500</span></label>
                    <input type="range" min="100" max="10000" value="500" step="100" style="width:100%;margin-top:8px;"
                        oninput="Chapter12.updateMambaRace(parseInt(this.value))">
                </div>
                <div class="network-viz">
                    <canvas id="mambaCanvas" width="800" height="400"></canvas>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                    <div id="mambaTransformerStat" class="info-box" style="border-left-color:#ef4444;">
                        <span class="info-box-icon">\uD83D\uDC22</span>
                        <span class="info-box-text"><strong>Transformer:</strong> 250,000 operations</span>
                    </div>
                    <div id="mambaMambaStat" class="info-box" style="border-left-color:#10b981;">
                        <span class="info-box-icon">\u26A1</span>
                        <span class="info-box-text"><strong>Mamba:</strong> 500 operations</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE0</span> How Does Mamba Read So Fast?</h2>
                <p>Mamba uses something called a <strong>Selective State Space</strong>. Instead of looking at every word at once (like Transformers), Mamba reads one word at a time and decides:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:20px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCDD</div>
                        <div style="font-weight:600;margin:6px 0;">Remember It!</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Important words get saved to its "memory notepad"</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDDD1\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;">Forget It!</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Boring filler words get tossed away</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDD04</div>
                        <div style="font-weight:600;margin:6px 0;">Update It!</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Mix the new word with old memories</div>
                    </div>
                </div>
                <p>Mamba decides what to remember and what to forget as it reads - like taking notes on only the important parts! The <strong>selective</strong> part is key: unlike older state space models, Mamba can <em>choose</em> what matters based on the content.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFEB</span> Real-World Example: Reading a Story</h2>
                <p>Let's say you're reading a <strong>detective story</strong> that's 1000 pages long. Here's how each approach handles it:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC22</div>
                        <div style="font-weight:600;margin:6px 0;">Transformer Reading</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Reads all 1000 pages, then compares EVERY sentence with EVERY other sentence. That's 1,000,000 comparisons! Super thorough but SO slow.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDE80</div>
                        <div style="font-weight:600;margin:6px 0;">Mamba Reading</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Reads page by page, keeping a "memory card" of important clues. "The butler was suspicious on page 50..." Only 1,000 steps! Lightning fast!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\uD83C\uDFAF</span>
                    <span class="info-box-text"><strong>Fun fact:</strong> Mamba was created by researchers Albert Gu and Tri Dao in December 2023. The name "Mamba" comes from a super fast snake - the Black Mamba can slither at 12 mph!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD22</span> The Math Behind It (Super Simple!)</h2>
                <p>Don't worry, this math is easy! Here's why Mamba is faster:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#ef4444;">Transformer: N \u00D7 N</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            \u2022 100 words = 100 \u00D7 100 = <strong>10,000</strong> steps<br>
                            \u2022 1,000 words = 1,000 \u00D7 1,000 = <strong>1,000,000</strong> steps<br>
                            \u2022 10,000 words = 10,000 \u00D7 10,000 = <strong>100,000,000</strong> steps!
                        </div>
                    </div>
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#10b981;">Mamba: N \u00D7 16</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            \u2022 100 words = 100 \u00D7 16 = <strong>1,600</strong> steps<br>
                            \u2022 1,000 words = 1,000 \u00D7 16 = <strong>16,000</strong> steps<br>
                            \u2022 10,000 words = 10,000 \u00D7 16 = <strong>160,000</strong> steps!
                        </div>
                    </div>
                </div>
                <p>See the difference? At 10,000 words, Transformer needs <strong>100 million</strong> steps but Mamba only needs <strong>160 thousand</strong>. That's <strong>625x faster</strong>!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Where Mamba Really Shines</h2>
                <p>Mamba is especially amazing for tasks with <strong>really long inputs</strong>:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDEC</div>
                        <div style="font-weight:600;margin:6px 0;">DNA Sequences</div>
                        <div style="font-size:12px;color:var(--text-secondary);">DNA can be millions of letters long! Mamba can process entire genomes that Transformers would choke on.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFA5</div>
                        <div style="font-weight:600;margin:6px 0;">Long Videos</div>
                        <div style="font-size:12px;color:var(--text-secondary);">A 2-hour movie has millions of pixels per second! Mamba handles long video understanding beautifully.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFB5</div>
                        <div style="font-weight:600;margin:6px 0;">Audio Processing</div>
                        <div style="font-size:12px;color:var(--text-secondary);">A song has thousands of samples per second. Mamba can process hours of audio efficiently!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCDD</div>
                        <div style="font-weight:600;margin:6px 0;">Whole Books</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Read and understand entire novels at once! No need to cut them into tiny chapters.</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD2C</span> Comparing the Approaches</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDD16</div>
                        <div style="font-weight:600;margin:6px 0;">Transformer</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Sees everything at once. Super smart but slow on long texts. Uses attention for every pair of words.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC0D</div>
                        <div style="font-weight:600;margin:6px 0;">Mamba (SSM)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Reads one word at a time with smart memory. Lightning fast on long texts! Linear speed.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDD1D</div>
                        <div style="font-weight:600;margin:6px 0;">Hybrid</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Mix both! Use attention for tricky parts and Mamba for the rest. Best of both worlds!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Mamba in Code</h2>
                <p>Here's what a Mamba model configuration looks like:</p>
                <div class="code-block">
<span class="keyword">from</span> mamba_ssm <span class="keyword">import</span> Mamba

<span class="comment"># Create a Mamba block - the speed reader!</span>
mamba_block = Mamba(
    d_model=<span class="number">768</span>,       <span class="comment"># How big each word's representation is</span>
    d_state=<span class="number">16</span>,        <span class="comment"># Size of the "memory notepad"</span>
    d_conv=<span class="number">4</span>,          <span class="comment"># How many nearby words to peek at</span>
    expand=<span class="number">2</span>,          <span class="comment"># Make the inner layer 2x wider</span>
)

<span class="comment"># It reads through a sequence super fast!</span>
<span class="comment"># Input: (batch, sequence_length, 768)</span>
<span class="comment"># Output: (batch, sequence_length, 768)</span>
output = mamba_block(input_tokens)
<span class="comment"># Linear time = zooooom! \uD83D\uDE80</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCB</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Transformers are quadratic (O(n\u00B2))</strong> - they compare every word with every other word, which gets really slow for long sequences.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#10b981;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Mamba is linear (O(n))</strong> - it reads one word at a time with a clever "memory state" that remembers what's important. Way faster!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Selective State Spaces</strong> are the key innovation - Mamba can CHOOSE what to remember based on the input content, not just follow a fixed pattern.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Hybrid models</strong> combine Transformers and Mamba to get the best of both: attention where it helps, and linear speed everywhere else.</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter12.startQuiz12_1()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('11-5')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('12-2')">Next: Mixture of Experts \u2192</button>
            </div>
        `;

        this.drawMambaRace(500);
    },

    drawMambaRace(seqLen) {
        const canvas = document.getElementById('mambaCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Title
        ctx.font = 'bold 16px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Complexity Race: Who Finishes First?', W / 2, 30);

        // Calculate complexities
        const transformerOps = seqLen * seqLen;
        const mambaOps = seqLen * 16; // linear with a constant factor

        // Scale bars to fit canvas
        const maxBarHeight = 280;
        const maxOps = 10000 * 10000; // max possible transformer ops
        const transformerHeight = Math.min(maxBarHeight, (transformerOps / maxOps) * maxBarHeight * 4);
        const mambaHeight = Math.min(maxBarHeight, (mambaOps / maxOps) * maxBarHeight * 4);

        const barWidth = 140;
        const barY = H - 50;

        // Draw race track lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const y = barY - (i * maxBarHeight / 5);
            ctx.beginPath();
            ctx.moveTo(100, y);
            ctx.lineTo(W - 100, y);
            ctx.stroke();
        }

        // Transformer bar (red/orange gradient)
        const tBarX = W / 2 - barWidth - 40;
        const tGrad = ctx.createLinearGradient(tBarX, barY, tBarX, barY - transformerHeight);
        tGrad.addColorStop(0, '#ef4444');
        tGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.roundRect(tBarX, barY - transformerHeight, barWidth, transformerHeight, [8, 8, 0, 0]);
        ctx.fill();

        // Animated pulse on transformer bar
        const pulseAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 300);
        ctx.fillStyle = `rgba(239, 68, 68, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.roundRect(tBarX - 4, barY - transformerHeight - 4, barWidth + 8, transformerHeight + 8, [10, 10, 2, 2]);
        ctx.fill();

        // Re-draw transformer bar on top of pulse
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.roundRect(tBarX, barY - transformerHeight, barWidth, transformerHeight, [8, 8, 0, 0]);
        ctx.fill();

        // Mamba bar (green gradient)
        const mBarX = W / 2 + 40;
        const mGrad = ctx.createLinearGradient(mBarX, barY, mBarX, barY - mambaHeight);
        mGrad.addColorStop(0, '#10b981');
        mGrad.addColorStop(1, '#6ee7b7');
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.roundRect(mBarX, barY - Math.max(mambaHeight, 4), barWidth, Math.max(mambaHeight, 4), [8, 8, 0, 0]);
        ctx.fill();

        // Glow on mamba bar
        const mPulseAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 400);
        ctx.fillStyle = `rgba(16, 185, 129, ${mPulseAlpha})`;
        ctx.beginPath();
        ctx.roundRect(mBarX - 4, barY - Math.max(mambaHeight, 4) - 4, barWidth + 8, Math.max(mambaHeight, 4) + 8, [10, 10, 2, 2]);
        ctx.fill();

        // Re-draw mamba bar
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.roundRect(mBarX, barY - Math.max(mambaHeight, 4), barWidth, Math.max(mambaHeight, 4), [8, 8, 0, 0]);
        ctx.fill();

        // Labels
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';

        ctx.fillStyle = '#ef4444';
        ctx.fillText('Transformer', tBarX + barWidth / 2, barY + 20);
        ctx.font = '12px JetBrains Mono';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('O(n\u00B2)', tBarX + barWidth / 2, barY + 36);

        ctx.font = 'bold 14px Inter';
        ctx.fillStyle = '#10b981';
        ctx.fillText('Mamba', mBarX + barWidth / 2, barY + 20);
        ctx.font = '12px JetBrains Mono';
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText('O(n)', mBarX + barWidth / 2, barY + 36);

        // Operation counts on bars
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.formatNumber(transformerOps), tBarX + barWidth / 2, barY - transformerHeight - 12);
        ctx.fillText(this.formatNumber(mambaOps), mBarX + barWidth / 2, barY - Math.max(mambaHeight, 4) - 12);

        // Speed comparison
        const speedup = (transformerOps / mambaOps).toFixed(1);
        ctx.font = 'bold 15px Inter';
        ctx.fillStyle = '#a855f7';
        ctx.fillText(`Mamba is ${speedup}x faster!`, W / 2, 58);

        // Emoji race indicators
        ctx.font = '24px serif';
        ctx.fillText('\uD83D\uDC22', tBarX + barWidth / 2, barY - transformerHeight - 32);
        ctx.fillText('\uD83D\uDE80', mBarX + barWidth / 2, barY - Math.max(mambaHeight, 4) - 32);

        // Animate
        if (this.mambaAnimFrame) cancelAnimationFrame(this.mambaAnimFrame);
        this.mambaAnimFrame = requestAnimationFrame(() => this.drawMambaRace(seqLen));
    },

    formatNumber(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toString();
    },

    updateMambaRace(val) {
        this.mambaSeqLen = val;
        const label = document.getElementById('mambaSeqLabel');
        if (label) label.textContent = val;

        const transformerOps = val * val;
        const mambaOps = val * 16;

        const tStat = document.getElementById('mambaTransformerStat');
        if (tStat) {
            tStat.querySelector('.info-box-text').innerHTML = `<strong>Transformer:</strong> ${this.formatNumber(transformerOps)} operations`;
        }
        const mStat = document.getElementById('mambaMambaStat');
        if (mStat) {
            mStat.querySelector('.info-box-text').innerHTML = `<strong>Mamba:</strong> ${this.formatNumber(mambaOps)} operations`;
        }

        this.drawMambaRace(val);
    },

    startQuiz12_1() {
        Quiz.start({
            title: 'State Space Models & Mamba',
            chapterId: '12-1',
            questions: [
                {
                    question: 'What is the main problem with Transformers that Mamba solves?',
                    options: [
                        'Transformers can\'t learn anything',
                        'Transformers are slow on very long sequences',
                        'Transformers only work with images',
                        'Transformers need too many GPUs to train'
                    ],
                    correct: 1,
                    explanation: 'Transformers have quadratic complexity - they get really slow when sequences are very long! Mamba\'s linear complexity makes it much faster on long sequences.'
                },
                {
                    question: 'If you double the sequence length, how much slower does a Transformer get?',
                    options: [
                        '2x slower (double)',
                        '3x slower (triple)',
                        '4x slower (quadratic)',
                        '8x slower (cubic)'
                    ],
                    correct: 2,
                    explanation: 'Transformers have O(n\u00B2) complexity. Double the input means 2\u00B2 = 4x more work! That\'s why they struggle with really long books.'
                },
                {
                    question: 'What does "selective" mean in Selective State Space Models?',
                    options: [
                        'It selects which GPU to use',
                        'It chooses which words to remember and which to forget',
                        'It only works on selected languages',
                        'It picks the best model from a list'
                    ],
                    correct: 1,
                    explanation: 'The "selective" part means Mamba can decide what\'s important to remember and what to skip - like taking notes on only the key points!'
                },
                {
                    question: 'How does Mamba read through text?',
                    options: [
                        'It looks at all words at the same time like Transformers',
                        'It reads one word at a time, updating its memory',
                        'It only reads the first and last words',
                        'It reads words in random order'
                    ],
                    correct: 1,
                    explanation: 'Mamba processes text sequentially, reading one word at a time and updating its memory state. This is what makes it linear time!'
                },
                {
                    question: 'What is a "Hybrid" model?',
                    options: [
                        'A model that only uses Mamba layers',
                        'A model that only uses Transformer attention',
                        'A mix of attention layers and Mamba layers together',
                        'A model that runs on both CPU and GPU'
                    ],
                    correct: 2,
                    explanation: 'Hybrid models combine the best of both worlds - using attention for parts where it helps and Mamba for speed on long sequences!'
                }
            ]
        });
    },

    // ============================================
    // 12.2: Mixture of Experts (MoE)
    // ============================================
    loadChapter12_2() {
        const container = document.getElementById('chapter-12-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 12 &bull; Chapter 12.2</span>
                <h1>Mixture of Experts (MoE)</h1>
                <p>Instead of one brain that knows everything, imagine a TEAM of specialist brains! A smart "router" sends each question to the right experts!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE0</span> A Team of Specialist Brains</h2>
                <p>Instead of one brain that knows everything, imagine a team of specialist brains! One is great at <strong>math</strong>, another at <strong>science</strong>, another at <strong>art</strong>. A <strong>"router"</strong> decides which experts to ask for each question!</p>
                <p>Think of it like a hospital. When you walk in, the <strong>receptionist</strong> (the router) doesn't try to treat you. Instead, they figure out your problem and send you to the <strong>right doctor</strong> (the expert)! A heart problem goes to the cardiologist, a broken bone goes to the orthopedist.</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Key insight:</strong> The model has 47 billion total settings, but only uses 13 billion for each answer! That's like having 8 chefs but only 2 cook each dish - super efficient!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Interactive Expert Routing</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Click a question type to see which experts the router picks!</p>
                <div class="controls" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
                    <button class="btn-primary btn-small" onclick="Chapter12.routeToExperts('math')">\uD83D\uDCCA Math Question</button>
                    <button class="btn-primary btn-small" onclick="Chapter12.routeToExperts('science')">\uD83D\uDD2C Science Question</button>
                    <button class="btn-primary btn-small" onclick="Chapter12.routeToExperts('language')">\uD83D\uDCDD Language Question</button>
                    <button class="btn-primary btn-small" onclick="Chapter12.routeToExperts('art')">\uD83C\uDFA8 Art Question</button>
                </div>
                <div class="network-viz">
                    <canvas id="moeCanvas" width="800" height="400"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF54</span> Mixtral: 8 Experts, 2 at a Time!</h2>
                <p>The famous <strong>Mixtral 8x7B</strong> model has 8 expert networks, but for each token (word piece), the router only activates the <strong>top 2 experts</strong>!</p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDE0</div>
                        <div style="font-weight:600;margin:6px 0;">8 Experts</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Total specialist networks in the model</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u2705</div>
                        <div style="font-weight:600;margin:6px 0;">2 Active</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Only 2 experts work on each token</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCCA</div>
                        <div style="font-weight:600;margin:6px 0;">47B Params</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Total parameters across all experts</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u26A1</div>
                        <div style="font-weight:600;margin:6px 0;">13B Used</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Active parameters per forward pass</div>
                    </div>
                </div>
                <p>It's like having a huge team of 8 chefs, but for each dish only 2 of them jump in to cook. This means the model is <strong>super smart</strong> (because it has lots of experts) but also <strong>super fast</strong> (because only a few run at a time)!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2696\uFE0F</span> Load Balancing: Sharing the Work</h2>
                <p>There's a sneaky problem with MoE: what if the router sends ALL the questions to just one or two experts? Those experts get <strong>overworked</strong> while the others sit around doing nothing!</p>
                <p>That's like if the hospital receptionist sent every single patient to the same doctor. That doctor would be exhausted, and the other doctors would be bored!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>The fix:</strong> We add a special "load balancing loss" during training. It's like a rule that says "every expert must get roughly the same number of questions." This way, all experts stay busy and learn to be useful!</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u274C</div>
                        <div style="font-weight:600;margin:6px 0;">Without Balancing</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Expert 1 gets 80% of work. Expert 2-8 barely used. Model wastes most of its capacity!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u2705</div>
                        <div style="font-weight:600;margin:6px 0;">With Balancing</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Each expert gets ~12.5% of work. All experts specialize and contribute. Full brain power!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF1F</span> Famous MoE Models</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDF10</div>
                        <div style="font-weight:600;margin:6px 0;">Switch Transformer</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Google's model with 1.6 TRILLION parameters! Routes each token to just 1 expert. The first really big MoE.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDF00</div>
                        <div style="font-weight:600;margin:6px 0;">Mixtral 8x7B</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Mistral AI's hit model! 8 experts, top-2 routing. Beats models 2x its active size!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC8E</div>
                        <div style="font-weight:600;margin:6px 0;">DeepSeek-V2</div>
                        <div style="font-size:12px;color:var(--text-secondary);">236B total, 21B active. Uses clever "shared experts" that always run. Super efficient!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> MoE by the Numbers</h2>
                <p>Let's look at how MoE saves compute while keeping quality high!</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-weight:600;margin-bottom:10px;color:#6366f1;">\uD83D\uDCB0 Dense Model (No MoE)</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;">
                            \u2022 Total parameters: <strong>47B</strong><br>
                            \u2022 Active parameters: <strong>47B</strong> (all of them!)<br>
                            \u2022 Compute per token: <strong>47B FLOPs</strong><br>
                            \u2022 Memory needed: <strong>94 GB</strong><br>
                            \u2022 GPUs needed: <strong>4+ A100s</strong>
                        </div>
                    </div>
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-weight:600;margin-bottom:10px;color:#10b981;">\u26A1 MoE Model (8 experts, top-2)</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;">
                            \u2022 Total parameters: <strong>47B</strong><br>
                            \u2022 Active parameters: <strong>13B</strong> (only 28%!)<br>
                            \u2022 Compute per token: <strong>13B FLOPs</strong><br>
                            \u2022 Memory still needed: <strong>94 GB</strong> (all experts in memory)<br>
                            \u2022 But <strong>3.6x faster</strong> per token!
                        </div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\uD83C\uDFAF</span>
                    <span class="info-box-text"><strong>Tradeoff:</strong> MoE models still need lots of memory (all experts must be loaded), but they're much FASTER because only a few experts compute each time. It's like paying for a big kitchen but only turning on 2 stoves at a time - saves energy!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> MoE Layer in Code</h2>
                <div class="code-block">
<span class="keyword">import</span> torch
<span class="keyword">import</span> torch.nn <span class="keyword">as</span> nn

<span class="keyword">class</span> <span class="function">MoELayer</span>(nn.Module):
    <span class="keyword">def</span> <span class="function">__init__</span>(self, d_model, num_experts=<span class="number">8</span>, top_k=<span class="number">2</span>):
        <span class="keyword">super</span>().__init__()
        <span class="comment"># Create 8 expert networks</span>
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(d_model, d_model * <span class="number">4</span>),
                nn.GELU(),
                nn.Linear(d_model * <span class="number">4</span>, d_model)
            ) <span class="keyword">for</span> _ <span class="keyword">in</span> range(num_experts)
        ])
        <span class="comment"># The router (receptionist!)</span>
        self.router = nn.Linear(d_model, num_experts)
        self.top_k = top_k

    <span class="keyword">def</span> <span class="function">forward</span>(self, x):
        <span class="comment"># Router picks the top 2 experts</span>
        scores = self.router(x).softmax(dim=-<span class="number">1</span>)
        top_vals, top_idx = scores.topk(self.top_k)
        <span class="comment"># Only run the 2 chosen experts!</span>
        output = sum(
            top_vals[..., i:i+<span class="number">1</span>] * self.experts[idx](x)
            <span class="keyword">for</span> i, idx <span class="keyword">in</span> enumerate(top_idx.unbind(-<span class="number">1</span>))
        )
        <span class="keyword">return</span> output
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCB</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Mixture of Experts</strong> uses multiple specialist networks instead of one giant network. Each expert gets really good at certain types of inputs!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#10b981;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>The Router</strong> is a small network that looks at each input and decides which experts should handle it - like a receptionist at a hospital.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Sparse activation</strong> means only a few experts run for each input, making MoE models much faster than if every expert ran every time.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Load balancing</strong> ensures all experts get used equally during training, so no expert is wasted and the model reaches its full potential.</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter12.startQuiz12_2()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('12-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('12-3')">Next: Efficient Fine-Tuning \u2192</button>
            </div>
        `;

        this.drawMoE(null);
    },

    drawMoE(category) {
        const canvas = document.getElementById('moeCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const expertNames = [
            'Math\nExpert', 'Logic\nExpert', 'Science\nExpert', 'History\nExpert',
            'Language\nExpert', 'Code\nExpert', 'Art\nExpert', 'Music\nExpert'
        ];
        const expertEmojis = ['\uD83D\uDCCA', '\uD83E\uDDE9', '\uD83D\uDD2C', '\uD83C\uDFF0', '\uD83D\uDCDD', '\uD83D\uDCBB', '\uD83C\uDFA8', '\uD83C\uDFB5'];
        const expertColors = ['#6366f1', '#818cf8', '#10b981', '#f59e0b', '#a855f7', '#3b82f6', '#ec4899', '#14b8a6'];

        // Routing map: which 2 experts for each category
        const routingMap = {
            math: [0, 1],
            science: [2, 1],
            language: [4, 3],
            art: [6, 7]
        };

        const routingWeights = {
            math: [72, 28],
            science: [65, 35],
            language: [70, 30],
            art: [60, 40]
        };

        // Draw router at top center
        const routerX = W / 2;
        const routerY = 55;
        ctx.beginPath();
        ctx.roundRect(routerX - 60, routerY - 20, 120, 40, 10);
        ctx.fillStyle = category ? '#8b5cf6' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = 'bold 13px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\uD83D\uDCE8 Router', routerX, routerY);

        // Draw 8 experts in 2 rows x 4 cols
        const cols = 4;
        const rows = 2;
        const expertW = 120;
        const expertH = 70;
        const startX = 60;
        const gapX = (W - 2 * startX - cols * expertW) / (cols - 1);
        const startY = 140;
        const gapY = 30;
        const activeExperts = category ? routingMap[category] : [];

        for (let i = 0; i < 8; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = startX + col * (expertW + gapX);
            const y = startY + row * (expertH + gapY);

            const isActive = activeExperts.includes(i);

            // Glow effect for active experts
            if (isActive) {
                ctx.shadowColor = expertColors[i];
                ctx.shadowBlur = 20;
            }

            ctx.beginPath();
            ctx.roundRect(x, y, expertW, expertH, 10);
            ctx.fillStyle = isActive ? expertColors[i] + '33' : '#111827';
            ctx.fill();
            ctx.strokeStyle = isActive ? expertColors[i] : '#2d3748';
            ctx.lineWidth = isActive ? 3 : 1;
            ctx.stroke();

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // Expert emoji and name
            ctx.font = '20px serif';
            ctx.fillStyle = '#e8eaf0';
            ctx.fillText(expertEmojis[i], x + expertW / 2, y + 24);
            ctx.font = '11px Inter';
            ctx.fillStyle = isActive ? '#e8eaf0' : '#8b95a8';
            const nameParts = expertNames[i].split('\n');
            nameParts.forEach((part, pi) => {
                ctx.fillText(part, x + expertW / 2, y + 44 + pi * 14);
            });

            // Draw routing arrows from router to active experts
            if (isActive && category) {
                const expertCenterX = x + expertW / 2;
                const expertTopY = y;
                const weightIdx = activeExperts.indexOf(i);
                const weight = routingWeights[category][weightIdx];

                ctx.beginPath();
                ctx.moveTo(routerX, routerY + 20);
                ctx.lineTo(expertCenterX, expertTopY);
                ctx.strokeStyle = expertColors[i];
                ctx.lineWidth = 3;
                ctx.setLineDash([6, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Weight label
                ctx.font = 'bold 12px JetBrains Mono';
                const midX = (routerX + expertCenterX) / 2;
                const midY = (routerY + 20 + expertTopY) / 2;
                ctx.fillStyle = expertColors[i];
                ctx.fillText(weight + '%', midX, midY - 6);
            }
        }

        // Draw combined output at bottom
        if (category) {
            const outputY = startY + 2 * (expertH + gapY) + 20;
            ctx.beginPath();
            ctx.roundRect(W / 2 - 80, outputY, 160, 36, 8);
            ctx.fillStyle = '#10b981' + '33';
            ctx.fill();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = 'bold 13px Inter';
            ctx.fillStyle = '#10b981';
            ctx.fillText('\u2705 Combined Output', W / 2, outputY + 18);

            // Arrows from active experts to output
            activeExperts.forEach(i => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const x = startX + col * (expertW + gapX) + expertW / 2;
                const y = startY + row * (expertH + gapY) + expertH;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(W / 2, outputY);
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 3]);
                ctx.stroke();
                ctx.setLineDash([]);
            });

            // Input label at top
            const categoryLabels = {
                math: '\uD83D\uDCCA "What is 7 x 8?"',
                science: '\uD83D\uDD2C "Why is the sky blue?"',
                language: '\uD83D\uDCDD "Write a poem"',
                art: '\uD83C\uDFA8 "Draw a sunset"'
            };
            ctx.font = '14px Inter';
            ctx.fillStyle = '#a855f7';
            ctx.fillText(categoryLabels[category], W / 2, routerY - 28);

            // Arrow from input to router
            ctx.beginPath();
            ctx.moveTo(W / 2, routerY - 20);
            ctx.lineTo(W / 2, routerY - 20);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2;
            this.drawArrow(ctx, W / 2, routerY - 22, W / 2, routerY - 20);
        } else {
            // Instruction text
            ctx.font = '14px Inter';
            ctx.fillStyle = '#8b95a8';
            ctx.fillText('Click a question type above to see the routing!', W / 2, H - 30);
        }
    },

    drawArrow(ctx, fromX, fromY, toX, toY) {
        const headLen = 8;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    },

    routeToExperts(category) {
        this.moeSelectedCategory = category;
        this.drawMoE(category);
    },

    startQuiz12_2() {
        Quiz.start({
            title: 'Mixture of Experts (MoE)',
            chapterId: '12-2',
            questions: [
                {
                    question: 'What does the "router" in a Mixture of Experts model do?',
                    options: [
                        'It trains all the experts at the same time',
                        'It decides which experts to send each input to',
                        'It combines all experts into one big network',
                        'It deletes experts that aren\'t needed'
                    ],
                    correct: 1,
                    explanation: 'The router is like a receptionist - it looks at each input and decides which specialist experts should handle it!'
                },
                {
                    question: 'In Mixtral 8x7B, how many experts are used for each token?',
                    options: [
                        'All 8 experts',
                        '4 experts',
                        '2 experts',
                        '1 expert'
                    ],
                    correct: 2,
                    explanation: 'Mixtral picks the top 2 experts for each token. This is why it\'s fast - only 2 out of 8 experts run each time!'
                },
                {
                    question: 'Why is MoE more efficient than a regular model?',
                    options: [
                        'It uses smaller numbers',
                        'Only some experts are active for each input, so less computing is needed',
                        'It doesn\'t need a GPU',
                        'It skips the training step'
                    ],
                    correct: 1,
                    explanation: 'Even though the total model is huge (47B params), only a fraction (13B) activates per input. More knowledge, less compute!'
                },
                {
                    question: 'What is the best analogy for Mixture of Experts?',
                    options: [
                        'One student studying all subjects alone',
                        'A team of specialists where the right ones handle each task',
                        'A single teacher who teaches everything',
                        'A robot that works 24/7'
                    ],
                    correct: 1,
                    explanation: 'MoE is like a team of specialists! Each expert is great at certain tasks, and the router picks the right ones for each job.'
                },
                {
                    question: 'What problem does load balancing solve in MoE?',
                    options: [
                        'It makes the model smaller',
                        'It prevents all inputs from going to the same few experts',
                        'It speeds up the router',
                        'It reduces the number of experts needed'
                    ],
                    correct: 1,
                    explanation: 'Without load balancing, the router might send everything to just 1-2 experts (overworking them). Load balancing spreads the work evenly!'
                }
            ]
        });
    },

    // ============================================
    // 12.3: Efficient Fine-Tuning (LoRA & QLoRA)
    // ============================================
    loadChapter12_3() {
        const container = document.getElementById('chapter-12-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 12 &bull; Chapter 12.3</span>
                <h1>Efficient Fine-Tuning: LoRA & QLoRA</h1>
                <p>Imagine a giant robot with a million dials. Instead of turning ALL the dials, LoRA adds smart stickers that adjust groups of dials at once!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD27</span> The Problem: Too Many Dials!</h2>
                <p>Imagine a giant robot with a <strong>million tiny dials</strong>. To teach it a new trick, you'd normally have to adjust ALL the dials - that's called <strong>full fine-tuning</strong>. It takes forever and needs a super-expensive computer!</p>
                <p>But what if you could add a few <strong>smart stickers</strong> that adjust groups of dials at once? That's exactly what <strong>LoRA</strong> does! Instead of changing the million dials, LoRA adds a tiny "shortcut layer" that gets the same result with WAY less work!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Low-Rank magic:</strong> Instead of a giant 100\u00D7100 multiplication table, use two small tables (100\u00D74 and 4\u00D7100) that multiply together! Same result, way fewer numbers to learn!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Interactive: Full Fine-Tuning vs LoRA</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Press "Animate" to see the difference! Full fine-tuning updates ALL parameters (blue), but LoRA only updates a tiny fraction (green)!</p>
                <div class="controls" style="margin-bottom:12px;">
                    <button class="btn-primary btn-small" onclick="Chapter12.animateLoRA()">\u25B6 Animate</button>
                    <button class="btn-secondary btn-small" onclick="Chapter12.resetLoRA()">Reset</button>
                </div>
                <div class="network-viz">
                    <canvas id="loraCanvas" width="800" height="400"></canvas>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                    <div id="loraFullStats" class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">\uD83D\uDCCA</span>
                        <span class="info-box-text"><strong>Full Fine-Tuning:</strong><br>100% parameters updated<br>48GB GPU memory needed</span>
                    </div>
                    <div id="loraLoraStats" class="info-box" style="border-left-color:#10b981;">
                        <span class="info-box-icon">\u26A1</span>
                        <span class="info-box-text"><strong>LoRA:</strong><br>~2% parameters updated<br>8GB GPU memory needed</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD22</span> The Low-Rank Trick Explained</h2>
                <p>Here's the clever trick behind LoRA. Imagine you have a HUGE multiplication table that's <strong>100 rows by 100 columns</strong> (10,000 numbers!). That's a lot to change!</p>
                <p>But what if you could represent the same table using TWO tiny tables: one that's <strong>100 rows by 4 columns</strong> (400 numbers) and another that's <strong>4 rows by 100 columns</strong> (400 numbers)? When you multiply them together, you get back the big table!</p>
                <div style="display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:8px;align-items:center;margin:20px 0;text-align:center;">
                    <div class="feature-card" style="padding:12px;">
                        <div style="font-weight:600;font-size:14px;color:#ef4444;">Big Matrix</div>
                        <div style="font-size:11px;color:var(--text-secondary);">100 \u00D7 100</div>
                        <div style="font-size:20px;margin-top:4px;">10,000 numbers</div>
                    </div>
                    <div style="font-size:24px;color:#8b95a8;">\u2248</div>
                    <div class="feature-card" style="padding:12px;">
                        <div style="font-weight:600;font-size:14px;color:#10b981;">Matrix A</div>
                        <div style="font-size:11px;color:var(--text-secondary);">100 \u00D7 4</div>
                        <div style="font-size:20px;margin-top:4px;">400 numbers</div>
                    </div>
                    <div style="font-size:24px;color:#8b95a8;">\u00D7</div>
                    <div class="feature-card" style="padding:12px;">
                        <div style="font-weight:600;font-size:14px;color:#10b981;">Matrix B</div>
                        <div style="font-size:11px;color:var(--text-secondary);">4 \u00D7 100</div>
                        <div style="font-size:20px;margin-top:4px;">400 numbers</div>
                    </div>
                </div>
                <p>Instead of learning 10,000 changes, LoRA only learns <strong>800</strong> numbers (400 + 400). That's <strong>12.5x less work</strong>! And the rank "4" is what we call the <strong>low rank</strong> - it's the size of the shortcut.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFA8</span> Where Does LoRA Go?</h2>
                <p>LoRA stickers don't go everywhere in the model. They usually go on the <strong>attention layers</strong> - specifically the Q (query) and V (value) matrices. These are the parts that control HOW the model pays attention to different words!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83C\uDFAF</span>
                    <span class="info-box-text"><strong>Target modules:</strong> Most people apply LoRA to <code>q_proj</code> and <code>v_proj</code> layers. Some also add <code>k_proj</code>, <code>o_proj</code>, and even the feed-forward layers for slightly better results!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCF1</span> QLoRA: LoRA for Your Laptop!</h2>
                <p><strong>QLoRA</strong> takes LoRA even further. First, it <strong>shrinks</strong> the model's numbers (quantization - making them simpler, like rounding 3.14159 to just 3). Then it applies LoRA on top!</p>
                <p>The result? You can fine-tune a huge AI model on your <strong>regular laptop</strong> instead of needing an expensive server!</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCB0</div>
                        <div style="font-weight:600;margin:6px 0;">Full Fine-Tune</div>
                        <div style="font-size:12px;color:var(--text-secondary);">48GB memory, $$$, all params change. Best quality but very expensive!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u2728</div>
                        <div style="font-weight:600;margin:6px 0;">LoRA</div>
                        <div style="font-size:12px;color:var(--text-secondary);">8GB memory, $, ~2% params. Nearly as good, much cheaper!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDE80</div>
                        <div style="font-weight:600;margin:6px 0;">QLoRA</div>
                        <div style="font-size:12px;color:var(--text-secondary);">4GB memory, \u00A2, quantized + LoRA. Runs on your laptop!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> LoRA with PEFT in Code</h2>
                <div class="code-block">
<span class="keyword">from</span> peft <span class="keyword">import</span> LoraConfig, get_peft_model
<span class="keyword">from</span> transformers <span class="keyword">import</span> AutoModelForCausalLM

<span class="comment"># Load a big pre-trained model</span>
model = AutoModelForCausalLM.from_pretrained(
    <span class="string">"meta-llama/Llama-2-7b-hf"</span>
)

<span class="comment"># Add tiny LoRA "stickers" to it!</span>
lora_config = LoraConfig(
    r=<span class="number">8</span>,              <span class="comment"># Rank: how many shortcuts (4-64)</span>
    lora_alpha=<span class="number">32</span>,     <span class="comment"># Scaling factor</span>
    target_modules=[<span class="string">"q_proj"</span>, <span class="string">"v_proj"</span>],  <span class="comment"># Which layers</span>
    lora_dropout=<span class="number">0.05</span>,  <span class="comment"># A tiny bit of randomness</span>
    bias=<span class="string">"none"</span>,
)

<span class="comment"># Only 2% of the weights are trainable!</span>
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
<span class="comment"># Output: "trainable params: 4.2M || all params: 6.7B || 0.06%"</span>
<span class="comment"># That's SO much less to train! \uD83C\uDF89</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF1F</span> LoRA Adapters: Swap Personalities!</h2>
                <p>One of the COOLEST things about LoRA is that you can create <strong>multiple adapters</strong> for the same base model! It's like having one robot body with different "personality chips" you can swap in and out!</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC68\u200D\u2695\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;">Medical LoRA</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Trained on medical textbooks. Makes the AI great at health questions!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCBB</div>
                        <div style="font-weight:600;margin:6px 0;">Coding LoRA</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Trained on code examples. Turns the AI into a programming expert!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFA8</div>
                        <div style="font-weight:600;margin:6px 0;">Creative LoRA</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Trained on stories and poems. Makes the AI write beautifully!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Adapter merging:</strong> You can even COMBINE multiple LoRA adapters! Mix the medical LoRA with the creative LoRA to get an AI that explains health topics in fun, easy-to-understand stories!</span>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter12.startQuiz12_3()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('12-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('12-4')">Next: RAG \u2192</button>
            </div>
        `;

        this.resetLoRA();
        this.drawLoRA();
    },

    drawLoRA() {
        const canvas = document.getElementById('loraCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const gridSize = 10;
        const cellSize = 26;
        const gap = 3;
        const gridW = gridSize * (cellSize + gap) - gap;

        // Left grid: Full Fine-Tuning
        const leftStartX = W / 4 - gridW / 2;
        const startY = 70;

        ctx.font = 'bold 14px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Full Fine-Tuning', W / 4, 35);
        ctx.font = '12px Inter';
        ctx.fillStyle = '#8b95a8';
        ctx.fillText('Update ALL 100 parameters', W / 4, 54);

        // Right grid: LoRA
        const rightStartX = (3 * W / 4) - gridW / 2;

        ctx.font = 'bold 14px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.fillText('LoRA', 3 * W / 4, 35);
        ctx.font = '12px Inter';
        ctx.fillStyle = '#8b95a8';
        ctx.fillText('Update only ~12 parameters', 3 * W / 4, 54);

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const idx = row * gridSize + col;

                // Full fine-tuning grid (left)
                const lx = leftStartX + col * (cellSize + gap);
                const ly = startY + row * (cellSize + gap);
                const fullActive = this.loraFullCells.includes(idx);

                ctx.beginPath();
                ctx.roundRect(lx, ly, cellSize, cellSize, 4);
                if (fullActive) {
                    ctx.fillStyle = '#6366f1';
                    ctx.shadowColor = '#6366f1';
                    ctx.shadowBlur = 8;
                } else {
                    ctx.fillStyle = '#1e293b';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;

                // LoRA grid (right)
                const rx = rightStartX + col * (cellSize + gap);
                const ry = startY + row * (cellSize + gap);
                const loraActive = this.loraLoraCells.includes(idx);

                ctx.beginPath();
                ctx.roundRect(rx, ry, cellSize, cellSize, 4);
                if (loraActive) {
                    ctx.fillStyle = '#10b981';
                    ctx.shadowColor = '#10b981';
                    ctx.shadowBlur = 8;
                } else {
                    ctx.fillStyle = '#1e293b';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Progress stats
        const fullPct = Math.round((this.loraFullCells.length / 100) * 100);
        const loraPct = Math.round((this.loraLoraCells.length / 100) * 100);

        const statsY = startY + gridSize * (cellSize + gap) + 16;

        ctx.font = 'bold 14px JetBrains Mono';
        ctx.fillStyle = '#6366f1';
        ctx.fillText(`${fullPct}% updated`, W / 4, statsY);

        ctx.fillStyle = '#10b981';
        ctx.fillText(`${loraPct}% updated`, 3 * W / 4, statsY);

        // Draw divider
        ctx.beginPath();
        ctx.moveTo(W / 2, 20);
        ctx.lineTo(W / 2, H - 20);
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '20px serif';
        ctx.fillText('VS', W / 2, H / 2);
    },

    animateLoRA() {
        if (this.loraAnimating) return;
        this.loraAnimating = true;
        this.loraFullCells = [];
        this.loraLoraCells = [];
        this.loraStep = 0;

        // LoRA cells: form an L-shape pattern (low-rank decomposition visualization)
        // First column (100x4 = first 10 rows of col 0) + first row (4x100 = row 0, cols 0-9)
        const loraCellTargets = [];
        // Left "tall thin" matrix: first column
        for (let r = 0; r < gridSize; r++) {
            loraCellTargets.push(r * gridSize + 0); // column 0
        }
        // Bottom "wide short" matrix: last row partial
        for (let c = 1; c < gridSize; c++) {
            loraCellTargets.push((gridSize - 1) * gridSize + c);
        }
        // Add a couple more for the rank representation
        for (let r = 0; r < gridSize; r++) {
            loraCellTargets.push(r * gridSize + 1);
        }

        const animStep = () => {
            if (this.loraStep < 100) {
                // Full fine-tuning: light up one cell at a time
                this.loraFullCells.push(this.loraStep);
            }

            // LoRA: light up its cells in order (but only the targeted ones)
            if (this.loraStep < loraCellTargets.length) {
                this.loraLoraCells.push(loraCellTargets[this.loraStep]);
            }

            this.loraStep++;
            this.drawLoRA();

            if (this.loraStep < 100) {
                this.loraAnimFrame = requestAnimationFrame(animStep);
            } else {
                this.loraAnimating = false;
            }
        };

        animStep();
    },

    resetLoRA() {
        this.loraAnimating = false;
        if (this.loraAnimFrame) cancelAnimationFrame(this.loraAnimFrame);
        this.loraFullCells = [];
        this.loraLoraCells = [];
        this.loraStep = 0;
        this.drawLoRA();
    },

    startQuiz12_3() {
        Quiz.start({
            title: 'Efficient Fine-Tuning: LoRA & QLoRA',
            chapterId: '12-3',
            questions: [
                {
                    question: 'What does LoRA stand for?',
                    options: [
                        'Low-Rank Adaptation',
                        'Long-Range Attention',
                        'Linear Output Regression Algorithm',
                        'Large Output Retraining Approach'
                    ],
                    correct: 0,
                    explanation: 'LoRA = Low-Rank Adaptation! It uses low-rank matrices (small shortcut tables) to fine-tune models efficiently.'
                },
                {
                    question: 'How much of the model does LoRA typically update?',
                    options: [
                        '100% of all parameters',
                        'About 50% of parameters',
                        'About 2% or less of parameters',
                        'Only 1 parameter'
                    ],
                    correct: 2,
                    explanation: 'LoRA typically updates only about 0.1% to 2% of parameters. That\'s what makes it so fast and memory-efficient!'
                },
                {
                    question: 'What extra trick does QLoRA add on top of LoRA?',
                    options: [
                        'It adds more layers to the model',
                        'It quantizes (shrinks) the base model to use less memory',
                        'It trains for twice as long',
                        'It removes unused experts'
                    ],
                    correct: 1,
                    explanation: 'QLoRA first quantizes (shrinks) the model\'s numbers from 16-bit to 4-bit, then applies LoRA. This means it can run on regular laptops!'
                },
                {
                    question: 'What is the "rank" in Low-Rank Adaptation?',
                    options: [
                        'How important the model is',
                        'The size of the small shortcut matrices',
                        'The model\'s leaderboard ranking',
                        'How many GPUs are needed'
                    ],
                    correct: 1,
                    explanation: 'The rank (r) controls the size of the small matrices. A rank of 8 means using 100x8 and 8x100 tables instead of one huge 100x100 table!'
                },
                {
                    question: 'Why is LoRA so popular for fine-tuning large models?',
                    options: [
                        'It makes models bigger and more powerful',
                        'It\'s cheap, fast, and gets nearly the same quality as full fine-tuning',
                        'It was the first fine-tuning method ever invented',
                        'It only works with small models'
                    ],
                    correct: 1,
                    explanation: 'LoRA is a game-changer because it\'s much cheaper and faster while achieving nearly the same quality. You can fine-tune billion-parameter models on a single GPU!'
                }
            ]
        });
    },

    // ============================================
    // 12.4: RAG (Retrieval-Augmented Generation)
    // ============================================
    loadChapter12_4() {
        const container = document.getElementById('chapter-12-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 12 &bull; Chapter 12.4</span>
                <h1>RAG: Retrieval-Augmented Generation</h1>
                <p>Instead of memorizing every book in the library, teach the AI to LOOK THINGS UP! It's like an open-book test instead of a closed-book test!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCDA</span> The Open-Book Test</h2>
                <p>Instead of memorizing every book in the library, RAG teaches the AI to <strong>LOOK THINGS UP</strong>! It's like an <strong>open-book test</strong> instead of a closed-book test.</p>
                <p>Think about it: if your teacher asks "What year did the first airplane fly?", you could either:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDE0</div>
                        <div style="font-weight:600;margin:6px 0;">Without RAG</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Try to remember from memory. Might get it wrong or make something up! "Uhh... 1895?" (Wrong!)</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCD6</div>
                        <div style="font-weight:600;margin:6px 0;">With RAG</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Look it up in a book first, THEN answer! "1903, the Wright Brothers!" (Correct!)</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD04</span> The 3-Step RAG Pipeline</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDD22</div>
                        <div style="font-weight:600;margin:6px 0;">1. Embed</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Turn documents into secret number codes (vectors). Each document gets its own unique code!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDD0D</div>
                        <div style="font-weight:600;margin:6px 0;">2. Search</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Turn the question into a code too. Find documents with the CLOSEST codes!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u270D\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;">3. Generate</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Give the AI the question PLUS the found documents. Now it can write an accurate answer!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Interactive RAG Demo</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Click a question to see how RAG finds the right documents and generates an answer!</p>
                <div class="controls" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
                    <button class="btn-primary btn-small" onclick="Chapter12.startRAG('jupiter')">\uD83C\uDF0C How big is Jupiter?</button>
                    <button class="btn-primary btn-small" onclick="Chapter12.startRAG('trex')">\uD83E\uDD96 What did T-Rex eat?</button>
                    <button class="btn-primary btn-small" onclick="Chapter12.startRAG('pasta')">\uD83C\uDF5D How to make pasta?</button>
                </div>
                <div class="network-viz">
                    <canvas id="ragCanvas" width="800" height="400"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCF</span> Vector Search: Secret Number Codes</h2>
                <p>Each document gets a <strong>secret number code</strong> (called a "vector embedding"). Questions get codes too. We find documents with the <strong>closest codes</strong>!</p>
                <p>Imagine every document is a dot on a giant map. When you ask a question, we put your question on the map too, and find the <strong>nearest dots</strong>. Those are the most relevant documents!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Why RAG matters:</strong> Without RAG, the AI might <strong>make stuff up</strong> (called "hallucination")! RAG helps it give answers based on <strong>real information</strong> from actual documents. It's like the difference between guessing and checking your work!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDEE0\uFE0F</span> Building a RAG System</h2>
                <p>Building a RAG system is like building a smart library! Here are the key pieces you need:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCC4</div>
                        <div style="font-weight:600;margin:6px 0;">Document Chunking</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Break big documents into small pieces (chunks). Like cutting a long book into short paragraphs so we can find the exact part we need!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDDC3\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;">Vector Database</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Store all the number codes in a special fast-search database. Like a card catalog but for number codes! Popular ones: Pinecone, Chroma, FAISS.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDD17</div>
                        <div style="font-weight:600;margin:6px 0;">Embedding Model</div>
                        <div style="font-size:12px;color:var(--text-secondary);">A special AI that turns text into number codes. Like a translator that converts words into coordinates on a map!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDE9</div>
                        <div style="font-weight:600;margin:6px 0;">Prompt Template</div>
                        <div style="font-size:12px;color:var(--text-secondary);">A fill-in-the-blank prompt like: "Based on these documents: [DOCS], answer this question: [QUESTION]"</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u26A0\uFE0F</span> RAG vs Fine-Tuning: When to Use Each?</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCD6</div>
                        <div style="font-weight:600;margin:6px 0;">Use RAG When...</div>
                        <div style="font-size:12px;color:var(--text-secondary);text-align:left;line-height:1.6;">
                            \u2022 Info changes often (news, prices)<br>
                            \u2022 You need to cite sources<br>
                            \u2022 You have LOTS of documents<br>
                            \u2022 Accuracy matters most
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFA8</div>
                        <div style="font-weight:600;margin:6px 0;">Use Fine-Tuning When...</div>
                        <div style="font-size:12px;color:var(--text-secondary);text-align:left;line-height:1.6;">
                            \u2022 You need a specific style or format<br>
                            \u2022 The knowledge is stable and fixed<br>
                            \u2022 Speed at inference time matters<br>
                            \u2022 You want to change behavior
                        </div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDE80</span>
                    <span class="info-box-text"><strong>Pro tip:</strong> Many real-world systems use BOTH! Fine-tune the model for the right style, then use RAG for up-to-date facts. Best of both worlds!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> RAG Pipeline in Code</h2>
                <div class="code-block">
<span class="keyword">from</span> langchain <span class="keyword">import</span> OpenAIEmbeddings, FAISS, ChatOpenAI

<span class="comment"># Step 1: Turn documents into number codes</span>
embeddings = OpenAIEmbeddings()
documents = [
    <span class="string">"Jupiter is the largest planet, 11x wider than Earth"</span>,
    <span class="string">"T-Rex was a meat-eating dinosaur with tiny arms"</span>,
    <span class="string">"Pasta is made from flour, water, and sometimes eggs"</span>,
]

<span class="comment"># Store the codes in a searchable database</span>
vector_store = FAISS.from_texts(documents, embeddings)

<span class="comment"># Step 2: Search for relevant documents</span>
question = <span class="string">"How big is Jupiter?"</span>
relevant_docs = vector_store.similarity_search(question, k=<span class="number">2</span>)

<span class="comment"># Step 3: Generate an answer using the documents!</span>
llm = ChatOpenAI(model=<span class="string">"gpt-4"</span>)
answer = llm.invoke(
    f<span class="string">"Based on these docs: {relevant_docs}\n"</span>
    f<span class="string">"Answer: {question}"</span>
)
<span class="comment"># Now the AI answers with REAL facts! \uD83C\uDF89</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF1F</span> Famous RAG Applications</h2>
                <p>RAG is used everywhere in the real world! Here are some cool examples:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFE2</div>
                        <div style="font-weight:600;margin:6px 0;">Company Help Desks</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Companies connect AI to their internal documents so it can answer employee questions accurately - like HR policies, tech guides, etc!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC68\u200D\u2696\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;">Legal Research</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Lawyers use RAG to search through thousands of legal cases and find relevant precedents in seconds!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCDA</div>
                        <div style="font-weight:600;margin:6px 0;">Study Assistants</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Upload your textbook, and the AI can answer questions about it! Perfect for studying before a test!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCF0</div>
                        <div style="font-weight:600;margin:6px 0;">News Analysis</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Connect AI to live news feeds so it always has the latest information when you ask about current events!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter12.startQuiz12_4()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('12-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('12-5')">Next: AI Agents \u2192</button>
            </div>
        `;

        this.drawRAG(null, 0);
    },

    drawRAG(query, step) {
        const canvas = document.getElementById('ragCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Document data
        const docs = [
            { label: 'Solar System', emoji: '\uD83C\uDF0C', x: 60, y: 70, color: '#6366f1' },
            { label: 'Dinosaurs', emoji: '\uD83E\uDD96', x: 60, y: 150, color: '#10b981' },
            { label: 'Cooking', emoji: '\uD83C\uDF73', x: 60, y: 230, color: '#f59e0b' },
            { label: 'Sports', emoji: '\u26BD', x: 60, y: 310, color: '#ef4444' },
            { label: 'Planets', emoji: '\uD83E\uDE90', x: 200, y: 70, color: '#818cf8' },
            { label: 'Animals', emoji: '\uD83E\uDD81', x: 200, y: 150, color: '#14b8a6' },
            { label: 'Recipes', emoji: '\uD83C\uDF5D', x: 200, y: 230, color: '#a855f7' },
            { label: 'Music', emoji: '\uD83C\uDFB5', x: 200, y: 310, color: '#ec4899' }
        ];

        // Which docs match each query
        const queryMatches = {
            jupiter: [0, 4],
            trex: [1, 5],
            pasta: [2, 6]
        };

        const queryLabels = {
            jupiter: 'How big is Jupiter?',
            trex: 'What did T-Rex eat?',
            pasta: 'How to make pasta?'
        };

        const queryAnswers = {
            jupiter: 'Jupiter is 11x wider than Earth - the biggest planet!',
            trex: 'T-Rex ate meat - it was a fearsome carnivore!',
            pasta: 'Mix flour, water & eggs, then boil in water!'
        };

        const matches = query ? queryMatches[query] : [];

        // Draw documents
        const docW = 110;
        const docH = 52;
        docs.forEach((doc, i) => {
            const isMatch = matches.includes(i) && step >= 3;

            if (isMatch) {
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 15;
            }

            ctx.beginPath();
            ctx.roundRect(doc.x, doc.y, docW, docH, 8);
            ctx.fillStyle = isMatch ? '#10b981' + '33' : '#111827';
            ctx.fill();
            ctx.strokeStyle = isMatch ? '#10b981' : doc.color + '66';
            ctx.lineWidth = isMatch ? 3 : 1;
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.font = '18px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(doc.emoji, doc.x + 22, doc.y + docH / 2);

            ctx.font = '11px Inter';
            ctx.fillStyle = isMatch ? '#e8eaf0' : '#8b95a8';
            ctx.fillText(doc.label, doc.x + 68, doc.y + docH / 2);
        });

        // Title label for knowledge base
        ctx.font = 'bold 12px Inter';
        ctx.fillStyle = '#8b95a8';
        ctx.textAlign = 'center';
        ctx.fillText('\uD83D\uDCDA Knowledge Base', 165, 38);

        if (query) {
            // Query box at top-right area
            const qx = 440;
            const qy = 40;
            ctx.beginPath();
            ctx.roundRect(qx, qy, 300, 36, 8);
            ctx.fillStyle = '#8b5cf6' + '33';
            ctx.fill();
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.font = 'bold 13px Inter';
            ctx.fillStyle = '#a855f7';
            ctx.fillText('\u2753 ' + queryLabels[query], qx + 150, qy + 18);

            // Step 1 & 2: Search arrow
            if (step >= 2) {
                ctx.beginPath();
                ctx.moveTo(qx, qy + 36);
                ctx.lineTo(340, 190);
                ctx.strokeStyle = '#8b5cf6';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Search label
                ctx.font = 'bold 12px Inter';
                ctx.fillStyle = '#a855f7';
                ctx.fillText('\uD83D\uDD0D Searching...', 390, 130);
            }

            // Step 3: Matching docs highlighted (done above in drawing loop)

            // Step 4: Generate box
            if (step >= 4) {
                const gx = 420;
                const gy = 200;
                ctx.beginPath();
                ctx.roundRect(gx, gy, 320, 50, 10);
                const genGrad = ctx.createLinearGradient(gx, gy, gx + 320, gy + 50);
                genGrad.addColorStop(0, '#6366f1' + '44');
                genGrad.addColorStop(1, '#a855f7' + '44');
                ctx.fillStyle = genGrad;
                ctx.fill();
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.font = 'bold 13px Inter';
                ctx.fillStyle = '#e8eaf0';
                ctx.fillText('\u2699\uFE0F Generate Answer', gx + 160, gy + 18);
                ctx.font = '11px Inter';
                ctx.fillStyle = '#8b95a8';
                ctx.fillText('Reading docs + question...', gx + 160, gy + 36);

                // Arrows from matched docs to generator
                matches.forEach(i => {
                    const doc = docs[i];
                    ctx.beginPath();
                    ctx.moveTo(doc.x + docW, doc.y + docH / 2);
                    ctx.lineTo(gx, gy + 25);
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 3]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                });
            }

            // Step 5: Answer
            if (step >= 5) {
                const ax = 420;
                const ay = 290;
                ctx.beginPath();
                ctx.roundRect(ax, ay, 320, 60, 10);
                ctx.fillStyle = '#10b981' + '22';
                ctx.fill();
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.font = 'bold 13px Inter';
                ctx.fillStyle = '#10b981';
                ctx.fillText('\u2705 Answer', ax + 160, ay + 18);
                ctx.font = '12px Inter';
                ctx.fillStyle = '#e8eaf0';

                // Word-wrap the answer
                const answer = queryAnswers[query];
                const words = answer.split(' ');
                let line = '';
                let lineY = ay + 38;
                words.forEach(word => {
                    const testLine = line + word + ' ';
                    if (ctx.measureText(testLine).width > 290) {
                        ctx.fillText(line.trim(), ax + 160, lineY);
                        line = word + ' ';
                        lineY += 16;
                    } else {
                        line = testLine;
                    }
                });
                ctx.fillText(line.trim(), ax + 160, lineY);

                // Arrow from generator to answer
                ctx.beginPath();
                ctx.moveTo(ax + 160, 250);
                ctx.lineTo(ax + 160, ay);
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = '#6366f1';
                this.drawArrow(ctx, ax + 160, 260, ax + 160, ay);
            }
        } else {
            ctx.font = '14px Inter';
            ctx.fillStyle = '#8b95a8';
            ctx.textAlign = 'center';
            ctx.fillText('Click a question above to see RAG in action!', W / 2, H - 30);
        }
    },

    startRAG(query) {
        if (this.ragAnimating) return;
        this.ragAnimating = true;
        this.ragSelectedQuery = query;
        this.ragStep = 0;

        const animate = () => {
            this.ragStep++;
            this.drawRAG(query, this.ragStep);

            if (this.ragStep < 5) {
                this.ragAnimFrame = setTimeout(animate, 700);
            } else {
                this.ragAnimating = false;
            }
        };

        this.drawRAG(query, 1);
        this.ragAnimFrame = setTimeout(animate, 600);
    },

    startQuiz12_4() {
        Quiz.start({
            title: 'RAG: Retrieval-Augmented Generation',
            chapterId: '12-4',
            questions: [
                {
                    question: 'What does RAG stand for?',
                    options: [
                        'Random Answer Generator',
                        'Retrieval-Augmented Generation',
                        'Rapid AI Growth',
                        'Recursive Attention Gate'
                    ],
                    correct: 1,
                    explanation: 'RAG = Retrieval-Augmented Generation. It RETRIEVES relevant documents, then uses them to AUGMENT (improve) the GENERATION of answers!'
                },
                {
                    question: 'What is the best analogy for RAG?',
                    options: [
                        'A closed-book exam where you memorize everything',
                        'An open-book test where you can look up answers',
                        'A multiple-choice test with random guessing',
                        'A spelling bee'
                    ],
                    correct: 1,
                    explanation: 'RAG is like an open-book test! Instead of memorizing everything, the AI looks up relevant information before answering.'
                },
                {
                    question: 'What are the 3 steps of the RAG pipeline?',
                    options: [
                        'Read, Write, Delete',
                        'Embed, Search, Generate',
                        'Train, Test, Deploy',
                        'Input, Process, Output'
                    ],
                    correct: 1,
                    explanation: 'The 3 steps are: Embed (turn docs into number codes), Search (find the closest matches), Generate (read the docs and write an answer)!'
                },
                {
                    question: 'What problem does RAG help solve?',
                    options: [
                        'Making the model run faster',
                        'Reducing hallucination (making stuff up)',
                        'Making the model smaller',
                        'Training with less data'
                    ],
                    correct: 1,
                    explanation: 'RAG reduces hallucination! By grounding answers in real documents, the AI is much less likely to make things up.'
                },
                {
                    question: 'What is a "vector embedding" in RAG?',
                    options: [
                        'A picture of the document',
                        'A summary of the document in words',
                        'A secret number code that represents the document\'s meaning',
                        'A compressed version of the document'
                    ],
                    correct: 2,
                    explanation: 'Vector embeddings are number codes that capture the MEANING of text. Similar topics get similar codes, making search super effective!'
                }
            ]
        });
    },

    // ============================================
    // 12.5: AI Agents & Autonomous Systems (FINAL!)
    // ============================================
    loadChapter12_5() {
        const container = document.getElementById('chapter-12-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 12 &bull; Chapter 12.5 \u2022 FINAL CHAPTER!</span>
                <h1>AI Agents & Autonomous Systems</h1>
                <p>Regular AI just answers questions. AI Agents can PLAN, USE TOOLS, and actually DO things! Welcome to the future of AI!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDD16</span> From Chatbot to Agent</h2>
                <p>Regular AI just answers questions. But <strong>AI Agents</strong> are like helpful robots that can <strong>PLAN</strong>, <strong>USE TOOLS</strong>, and actually <strong>DO things</strong>! Like a homework helper that can search the web, use a calculator, and write code!</p>
                <p>Think of it this way: a regular chatbot is like a friend who just <em>talks</em>. An AI agent is like a friend who talks AND <em>does stuff for you</em>!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>The ReAct Loop:</strong> AI agents follow a cycle: <strong>Think</strong> (what should I do?) \u2192 <strong>Act</strong> (use a tool!) \u2192 <strong>Observe</strong> (what happened?) \u2192 <strong>Repeat</strong> until the task is done!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Interactive Agent Workflow</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Pick a goal and hit "Start Agent" to watch the AI agent think, plan, act, and observe!</p>
                <div class="controls" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;align-items:center;">
                    <label style="font-weight:600;color:var(--text-primary);">Goal:</label>
                    <select id="agentGoalSelect" style="padding:6px 12px;border-radius:8px;background:#1e293b;color:#e8eaf0;border:1px solid #2d3748;"
                        onchange="Chapter12.agentGoal=this.value">
                        <option value="Research a topic">Research a topic</option>
                        <option value="Solve a math problem">Solve a math problem</option>
                        <option value="Write a summary">Write a summary</option>
                    </select>
                    <button class="btn-primary btn-small" onclick="Chapter12.startAgent()">\u25B6 Start Agent</button>
                    <button class="btn-secondary btn-small" onclick="Chapter12.resetAgent()">Reset</button>
                </div>
                <div class="network-viz">
                    <canvas id="agentCanvas" width="800" height="400"></canvas>
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;justify-content:center;">
                    <span style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-right:8px;">Agent Tools:</span>
                    <span class="tag tag-interactive" style="cursor:pointer;" onclick="Chapter12.toggleTool('search')">\uD83D\uDD0D Search</span>
                    <span class="tag tag-interactive" style="cursor:pointer;" onclick="Chapter12.toggleTool('calculator')">\uD83E\uDDEE Calculator</span>
                    <span class="tag tag-interactive" style="cursor:pointer;" onclick="Chapter12.toggleTool('code')">\uD83D\uDCBB Code Runner</span>
                    <span class="tag tag-interactive" style="cursor:pointer;" onclick="Chapter12.toggleTool('writer')">\u270D\uFE0F File Writer</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD04</span> The ReAct Loop Explained</h2>
                <p>The secret sauce of AI agents is the <strong>ReAct loop</strong> (Reasoning + Acting). Let's break it down:</p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDE0</div>
                        <div style="font-weight:600;margin:6px 0;">1. Think</div>
                        <div style="font-size:12px;color:var(--text-secondary);">"Hmm, I need to find the population of Tokyo. I should use the search tool!"</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCCB</div>
                        <div style="font-weight:600;margin:6px 0;">2. Plan</div>
                        <div style="font-size:12px;color:var(--text-secondary);">"Step 1: Search for population. Step 2: Calculate schools needed. Step 3: Write report."</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDD27</div>
                        <div style="font-weight:600;margin:6px 0;">3. Act</div>
                        <div style="font-size:12px;color:var(--text-secondary);">*Uses search tool* "Tokyo population 2024..." *Uses calculator* "14M \u00F7 500 = 28,000"</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC41\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;">4. Observe</div>
                        <div style="font-size:12px;color:var(--text-secondary);">"Got the answer! Tokyo would need about 28,000 schools. Let me compile my report."</div>
                    </div>
                </div>
                <p>The agent keeps looping through Think \u2192 Plan \u2192 Act \u2192 Observe until the task is done! Each loop gets it closer to the goal, just like how you solve a problem step by step.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDEE0\uFE0F</span> Agent Tools: The Agent's Superpowers</h2>
                <p>Tools are what give agents their superpowers! Without tools, an AI can only think and write text. With tools, it can actually <strong>interact with the world</strong>:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                            <span style="font-size:24px;">\uD83D\uDD0D</span>
                            <span style="font-weight:600;">Web Search</span>
                        </div>
                        <div style="font-size:12px;color:var(--text-secondary);">Search the internet for up-to-date information. Like having Google built right into the AI's brain!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                            <span style="font-size:24px;">\uD83E\uDDEE</span>
                            <span style="font-weight:600;">Calculator</span>
                        </div>
                        <div style="font-size:12px;color:var(--text-secondary);">Do precise math calculations. AIs can be bad at arithmetic, but a calculator tool fixes that!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                            <span style="font-size:24px;">\uD83D\uDCBB</span>
                            <span style="font-weight:600;">Code Runner</span>
                        </div>
                        <div style="font-size:12px;color:var(--text-secondary);">Write and run Python code. Can create charts, analyze data, or build programs!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                            <span style="font-size:24px;">\u270D\uFE0F</span>
                            <span style="font-weight:600;">File Writer</span>
                        </div>
                        <div style="font-size:12px;color:var(--text-secondary);">Save results to files. Write reports, create documents, or save code to disk!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC65</span> Multi-Agent Teams</h2>
                <p>What's even cooler than one AI agent? A <strong>TEAM</strong> of AI agents that talk to each other! One researches, another writes, another checks the work!</p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDD0D</div>
                        <div style="font-weight:600;margin:6px 0;">Researcher</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Searches the web and gathers information</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u270D\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;">Writer</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Writes clear, organized content</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDD0E</div>
                        <div style="font-weight:600;margin:6px 0;">Reviewer</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Checks facts and fixes mistakes</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCE6</div>
                        <div style="font-weight:600;margin:6px 0;">Publisher</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Formats and delivers the final result</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCC5</span> The Agent Timeline</h2>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDD16</div>
                        <div style="font-weight:600;margin:6px 0;">AutoGPT</div>
                        <div style="font-size:12px;color:var(--text-secondary);">2023 - First viral autonomous agent experiment</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDD17</div>
                        <div style="font-weight:600;margin:6px 0;">LangChain</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Toolkits and chains for building agents</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC65</div>
                        <div style="font-weight:600;margin:6px 0;">CrewAI</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Teams of specialized AI agents working together</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u2728</div>
                        <div style="font-weight:600;margin:6px 0;">Claude Code</div>
                        <div style="font-size:12px;color:var(--text-secondary);">AI agent that writes and runs real code!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u26A0\uFE0F</span> Agent Safety & Guardrails</h2>
                <p>With great power comes great responsibility! Since agents can actually DO things in the real world, we need <strong>safety guardrails</strong>:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDED1</div>
                        <div style="font-weight:600;margin:6px 0;">Boundaries</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Limit what tools the agent can use. Don't let it delete files or spend money without permission!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC41\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;">Human Oversight</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Always have a human check important actions. The agent asks permission before doing big things!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCDD</div>
                        <div style="font-weight:600;margin:6px 0;">Logging</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Keep a record of everything the agent does. Like a security camera for AI actions!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Remember:</strong> AI agents are amazing helpers, but they work best when humans stay in the loop! Think of it as a partnership - the AI does the heavy lifting, and you make the important decisions.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDE80</span> The Future of AI Agents</h2>
                <p>AI agents are getting better and better! Here's what's coming:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDF0D</div>
                        <div style="font-weight:600;margin:6px 0;">Computer Use</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Agents that can use a computer just like you - clicking buttons, typing, browsing the web with a real browser!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDD1D</div>
                        <div style="font-weight:600;margin:6px 0;">Agent-to-Agent</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Agents that hire other agents! One agent manages a whole team of specialist agents to complete big projects.</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Agent Framework in Code</h2>
                <div class="code-block">
<span class="keyword">from</span> langchain.agents <span class="keyword">import</span> create_react_agent
<span class="keyword">from</span> langchain.tools <span class="keyword">import</span> Tool
<span class="keyword">from</span> langchain_openai <span class="keyword">import</span> ChatOpenAI

<span class="comment"># Define the tools the agent can use</span>
tools = [
    Tool(name=<span class="string">"Search"</span>,
         func=search_web,
         description=<span class="string">"Search the internet for info"</span>),
    Tool(name=<span class="string">"Calculator"</span>,
         func=calculator,
         description=<span class="string">"Do math calculations"</span>),
    Tool(name=<span class="string">"CodeRunner"</span>,
         func=run_python,
         description=<span class="string">"Run Python code"</span>),
]

<span class="comment"># Create the agent with ReAct reasoning</span>
llm = ChatOpenAI(model=<span class="string">"gpt-4"</span>)
agent = create_react_agent(llm, tools, prompt)

<span class="comment"># Give it a goal and watch it work!</span>
result = agent.invoke({
    <span class="string">"input"</span>: <span class="string">"Research the population of Tokyo and calculate how many schools are needed if each school has 500 students"</span>
})
<span class="comment"># The agent will: Think \u2192 Search \u2192 Think \u2192 Calculate \u2192 Answer!</span>
<span class="comment"># It does multiple steps all by itself! \uD83E\uDD16\u2728</span>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter12.startQuiz12_5()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('12-4')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('13-1')">Next: FlashAttention \u2192</button>
            </div>
        `;

        this.resetAgent();
        this.drawAgent();
    },

    drawAgent() {
        const canvas = document.getElementById('agentCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Define 4 nodes in a circle
        const centerX = W / 2;
        const centerY = H / 2 - 10;
        const radius = 130;

        const nodes = [
            { label: 'Think', emoji: '\uD83E\uDDE0', angle: -Math.PI / 2, color: '#6366f1' },
            { label: 'Plan', emoji: '\uD83D\uDCCB', angle: 0, color: '#818cf8' },
            { label: 'Act', emoji: '\uD83D\uDD27', angle: Math.PI / 2, color: '#10b981' },
            { label: 'Observe', emoji: '\uD83D\uDC41\uFE0F', angle: Math.PI, color: '#f59e0b' }
        ];

        // Draw connecting arrows between nodes
        nodes.forEach((node, i) => {
            const next = nodes[(i + 1) % 4];
            const x1 = centerX + Math.cos(node.angle) * (radius - 30);
            const y1 = centerY + Math.sin(node.angle) * (radius - 30);
            const x2 = centerX + Math.cos(next.angle) * (radius - 30);
            const y2 = centerY + Math.sin(next.angle) * (radius - 30);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            // Curved arrow using quadratic bezier
            const cpx = centerX + Math.cos((node.angle + next.angle) / 2) * (radius * 0.4);
            const cpy = centerY + Math.sin((node.angle + next.angle) / 2) * (radius * 0.4);
            ctx.quadraticCurveTo(cpx, cpy, x2, y2);
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Draw nodes
        const nodeRadius = 44;
        nodes.forEach((node, i) => {
            const x = centerX + Math.cos(node.angle) * radius;
            const y = centerY + Math.sin(node.angle) * radius;

            const isActive = this.agentRunning && this.agentCurrentNode === i;

            if (isActive) {
                ctx.shadowColor = node.color;
                ctx.shadowBlur = 25;
            }

            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = isActive ? node.color + '44' : '#111827';
            ctx.fill();
            ctx.strokeStyle = isActive ? node.color : '#2d3748';
            ctx.lineWidth = isActive ? 3 : 1.5;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Emoji
            ctx.font = '24px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.emoji, x, y - 8);

            // Label
            ctx.font = 'bold 12px Inter';
            ctx.fillStyle = isActive ? '#e8eaf0' : '#8b95a8';
            ctx.fillText(node.label, x, y + 20);
        });

        // Draw glowing particle if running
        if (this.agentRunning) {
            const currentNode = nodes[this.agentCurrentNode];
            const px = centerX + Math.cos(currentNode.angle) * radius;
            const py = centerY + Math.sin(currentNode.angle) * radius;

            // Glowing particle
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fillStyle = currentNode.color;
            ctx.shadowColor = currentNode.color;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Bubble text
            if (this.agentBubbleText) {
                const bubbleX = centerX;
                const bubbleY = centerY;
                const bubbleW = ctx.measureText(this.agentBubbleText).width + 24;

                ctx.beginPath();
                ctx.roundRect(bubbleX - bubbleW / 2, bubbleY - 14, bubbleW, 28, 8);
                ctx.fillStyle = '#1e293b';
                ctx.fill();
                ctx.strokeStyle = currentNode.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.font = '12px Inter';
                ctx.fillStyle = '#e8eaf0';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.agentBubbleText, bubbleX, bubbleY);
            }
        }

        // Goal display at top
        ctx.font = 'bold 13px Inter';
        ctx.fillStyle = '#a855f7';
        ctx.textAlign = 'center';
        ctx.fillText('\uD83C\uDFAF Goal: ' + this.agentGoal, centerX, 22);

        // Draw tool panel on the right side
        const toolNames = [
            { name: 'Search', emoji: '\uD83D\uDD0D', color: '#6366f1' },
            { name: 'Calculator', emoji: '\uD83E\uDDEE', color: '#10b981' },
            { name: 'Code', emoji: '\uD83D\uDCBB', color: '#818cf8' },
            { name: 'Writer', emoji: '\u270D\uFE0F', color: '#f59e0b' }
        ];

        const toolStartX = W - 90;
        const toolStartY = 80;

        ctx.font = 'bold 10px Inter';
        ctx.fillStyle = '#8b95a8';
        ctx.textAlign = 'center';
        ctx.fillText('Tools', toolStartX, toolStartY - 12);

        toolNames.forEach((tool, i) => {
            const ty = toolStartY + i * 44;
            const isSelected = this.agentSelectedTools.includes(tool.name.toLowerCase());
            const isActiveOnCanvas = this.agentRunning && this.agentCurrentNode === 2; // Act phase

            ctx.beginPath();
            ctx.roundRect(toolStartX - 36, ty, 72, 34, 6);
            ctx.fillStyle = (isSelected || isActiveOnCanvas) ? tool.color + '22' : '#111827';
            ctx.fill();
            ctx.strokeStyle = (isSelected || isActiveOnCanvas) ? tool.color : '#2d3748';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.font = '14px serif';
            ctx.fillText(tool.emoji, toolStartX - 12, ty + 18);
            ctx.font = '10px Inter';
            ctx.fillStyle = (isSelected || isActiveOnCanvas) ? '#e8eaf0' : '#8b95a8';
            ctx.fillText(tool.name, toolStartX + 16, ty + 20);
        });

        // Draw status panel on the left side
        const statusX = 80;
        const statusY = 80;

        ctx.font = 'bold 10px Inter';
        ctx.fillStyle = '#8b95a8';
        ctx.textAlign = 'center';
        ctx.fillText('Status', statusX, statusY - 12);

        const statusItems = [
            { label: 'State', value: this.agentRunning ? nodes[this.agentCurrentNode].label : 'Idle', color: this.agentRunning ? nodes[this.agentCurrentNode].color : '#8b95a8' },
            { label: 'Loops', value: this.agentLoopCount + '/3', color: this.agentLoopCount >= 3 ? '#10b981' : '#8b95a8' },
            { label: 'Steps', value: this.agentRunning ? 'Running...' : (this.agentLoopCount >= 3 ? 'Done!' : 'Ready'), color: this.agentRunning ? '#f59e0b' : '#8b95a8' }
        ];

        statusItems.forEach((item, i) => {
            const sy = statusY + i * 38;

            ctx.beginPath();
            ctx.roundRect(statusX - 40, sy, 80, 30, 6);
            ctx.fillStyle = '#111827';
            ctx.fill();
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.font = '9px Inter';
            ctx.fillStyle = '#8b95a8';
            ctx.fillText(item.label, statusX, sy + 11);
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.fillStyle = item.color;
            ctx.fillText(item.value, statusX, sy + 23);
        });

        // Loop counter at bottom
        if (this.agentRunning || this.agentLoopCount > 0) {
            ctx.font = '12px JetBrains Mono';
            ctx.fillStyle = '#8b95a8';
            ctx.textAlign = 'center';
            ctx.fillText('ReAct Loop: ' + this.agentLoopCount + ' / 3', centerX, H - 16);
        }

        if (!this.agentRunning && this.agentLoopCount === 0) {
            ctx.font = '13px Inter';
            ctx.fillStyle = '#8b95a8';
            ctx.textAlign = 'center';
            ctx.fillText('Select a goal and click "Start Agent" to begin!', centerX, H - 16);
        }

        if (this.agentLoopCount >= 3 && !this.agentRunning) {
            ctx.font = 'bold 14px Inter';
            ctx.fillStyle = '#10b981';
            ctx.textAlign = 'center';
            ctx.fillText('\u2705 Task Complete! The agent finished all 3 loops!', centerX, H - 16);
        }
    },

    startAgent() {
        if (this.agentRunning) return;
        this.agentRunning = true;
        this.agentCurrentNode = 0;
        this.agentLoopCount = 0;

        const goalSelect = document.getElementById('agentGoalSelect');
        if (goalSelect) this.agentGoal = goalSelect.value;

        const goalBubbles = {
            'Research a topic': [
                ['I need to find information...', 'Break it into subtasks...', 'Searching the web...', 'Found 3 relevant articles!'],
                ['Analyzing the results...', 'Summarize key points...', 'Writing notes...', 'Notes look good!'],
                ['Let me verify facts...', 'Cross-check sources...', 'Compiling final report...', 'Report verified!']
            ],
            'Solve a math problem': [
                ['What kind of math is this?', 'Step 1: Parse the equation...', 'Using calculator tool...', 'Got intermediate result!'],
                ['Need to simplify further...', 'Apply the formula...', 'Computing step 2...', 'Almost there!'],
                ['Checking my work...', 'Verify each step...', 'Running final check...', 'Answer confirmed!']
            ],
            'Write a summary': [
                ['What needs summarizing?', 'Outline the key points...', 'Reading the source text...', 'Identified main ideas!'],
                ['Drafting the summary...', 'Structure into paragraphs...', 'Writing first draft...', 'Draft complete!'],
                ['Review and polish...', 'Check for clarity...', 'Final editing pass...', 'Summary is ready!']
            ]
        };

        const bubbles = goalBubbles[this.agentGoal] || goalBubbles['Research a topic'];

        let stepIdx = 0;
        let loopIdx = 0;

        const tick = () => {
            this.agentCurrentNode = stepIdx % 4;
            this.agentBubbleText = bubbles[loopIdx] ? bubbles[loopIdx][stepIdx % 4] : '';

            if (stepIdx % 4 === 0 && stepIdx > 0) {
                loopIdx++;
                this.agentLoopCount = loopIdx;
            }

            this.drawAgent();
            stepIdx++;

            if (loopIdx < 3) {
                this.agentAnimFrame = setTimeout(tick, 800);
            } else {
                this.agentRunning = false;
                this.agentBubbleText = '';
                this.drawAgent();
            }
        };

        tick();
    },

    resetAgent() {
        this.agentRunning = false;
        if (this.agentAnimFrame) clearTimeout(this.agentAnimFrame);
        this.agentCurrentNode = 0;
        this.agentLoopCount = 0;
        this.agentBubbleText = '';
        this.agentSelectedTools = [];
        this.drawAgent();
    },

    toggleTool(tool) {
        const idx = this.agentSelectedTools.indexOf(tool);
        if (idx >= 0) {
            this.agentSelectedTools.splice(idx, 1);
        } else {
            this.agentSelectedTools.push(tool);
        }
    },

    startQuiz12_5() {
        Quiz.start({
            title: 'AI Agents & Autonomous Systems',
            chapterId: '12-5',
            questions: [
                {
                    question: 'What makes an AI Agent different from a regular chatbot?',
                    options: [
                        'It can only answer yes or no questions',
                        'It can plan, use tools, and take actions - not just chat',
                        'It is always connected to the internet',
                        'It has a physical robot body'
                    ],
                    correct: 1,
                    explanation: 'AI Agents go beyond chatting - they can plan steps, use tools (like search engines and calculators), and take real actions to complete tasks!'
                },
                {
                    question: 'What are the steps of the ReAct loop?',
                    options: [
                        'Read, Edit, Apply, Compile, Test',
                        'Think, Act, Observe, Repeat',
                        'Input, Process, Output',
                        'Train, Validate, Test, Deploy'
                    ],
                    correct: 1,
                    explanation: 'ReAct = Reasoning + Acting. The agent Thinks about what to do, Acts (uses a tool), Observes the result, then Repeats until done!'
                },
                {
                    question: 'What is a multi-agent system?',
                    options: [
                        'One agent that uses many GPUs',
                        'Multiple AI agents that work together as a team',
                        'An agent that speaks multiple languages',
                        'A very large single AI model'
                    ],
                    correct: 1,
                    explanation: 'Multi-agent systems have teams of specialized AI agents. One might research, another writes, another reviews - just like a human team!'
                },
                {
                    question: 'Why do AI agents need "tools"?',
                    options: [
                        'Because they can\'t think without them',
                        'To interact with the real world - search the web, do math, run code, etc.',
                        'Tools make them look smarter',
                        'They need tools to train faster'
                    ],
                    correct: 1,
                    explanation: 'Tools let agents DO things! Without tools, an AI can only generate text. With tools, it can search the web, calculate numbers, write files, and much more!'
                },
                {
                    question: 'Which of these is the best example of an AI agent task?',
                    options: [
                        'Answering "What is 2+2?"',
                        'Researching a topic, writing a report, and sending it by email',
                        'Generating a single sentence',
                        'Translating one word'
                    ],
                    correct: 1,
                    explanation: 'An agent task involves MULTIPLE STEPS and TOOLS. Research + writing + emailing requires planning, multiple tool uses, and observation - that\'s agent territory!'
                }
            ]
        });
    }
};
