/* ============================================
   Chapter 9: Transformers Deep Dive
   ============================================ */

const Chapter9 = {
    // State
    activeBlock: null,
    archAnimFrame: null,
    archAnimStep: 0,
    archAnimPlaying: false,
    qkvStep: 0,
    qkvMaxSteps: 6,
    selectedHeadCount: 1,
    genTokens: [],
    genTemperature: 1.0,
    genAnimating: false,
    genAnimId: null,
    vitPatchSize: 2,
    vitSelectedPatch: null,

    init() {
        App.registerChapter('9-1', () => this.loadChapter9_1());
        App.registerChapter('9-2', () => this.loadChapter9_2());
        App.registerChapter('9-3', () => this.loadChapter9_3());
        App.registerChapter('9-4', () => this.loadChapter9_4());
        App.registerChapter('9-5', () => this.loadChapter9_5());
    },

    // ============================================
    // 9.1: The Transformer Architecture
    // ============================================
    loadChapter9_1() {
        const container = document.getElementById('chapter-9-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 9 &bull; Chapter 9.1</span>
                <h1>The Transformer Architecture</h1>
                <p>The Transformer, introduced in the landmark paper "Attention Is All You Need" (Vaswani et al., 2017), replaced recurrence with self-attention and became the foundation of modern AI.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCD8</span> Definition, Why It Matters, Example</h2>
                <p><strong>Definition:</strong> a <strong>Transformer</strong> is a neural architecture built around attention, feed-forward layers, residual connections, and normalization.</p>
                <p><strong>Why it matters:</strong> it handles long-range dependencies much better than older sequence models and became the backbone of modern AI systems.</p>
                <p><strong>Example:</strong> in the sentence "The trophy did not fit in the suitcase because it was too big," attention helps decide whether <strong>it</strong> refers to the trophy or the suitcase.</p>
            </div>

            <div class="section">
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDD17</span>
                    <span class="info-box-text">In Chapter 8.3, we introduced self-attention and BERT. Now we go deeper into the <strong>full Transformer architecture</strong>, understanding every component and how data flows through the model.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFD7\uFE0F</span> Full Architecture Diagram</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Click any component to learn more. Hit "Animate" to watch data flow through the model.</p>
                <div class="network-viz">
                    <canvas id="archCanvas" width="800" height="520"></canvas>
                </div>
                <div class="controls" style="margin-top:12px;">
                    <button class="btn-primary btn-small" onclick="Chapter9.playDataFlow()">&#x25B6; Animate Data Flow</button>
                    <button class="btn-secondary btn-small" onclick="Chapter9.stopDataFlow()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD0D</span> Component Explorer</h2>
                <p>Click a component to see its role in the Transformer:</p>
                <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:16px 0;">
                    <div class="transformer-block" onclick="Chapter9.selectBlock('embedding')">
                        <span class="block-icon">\uD83D\uDCDD</span> Input Embedding
                    </div>
                    <div class="transformer-block" onclick="Chapter9.selectBlock('positional')">
                        <span class="block-icon">\uD83D\uDCCD</span> Positional Encoding
                    </div>
                    <div class="transformer-block" onclick="Chapter9.selectBlock('self-attention')">
                        <span class="block-icon">\uD83D\uDC41\uFE0F</span> Self-Attention
                    </div>
                    <div class="transformer-block" onclick="Chapter9.selectBlock('addnorm')">
                        <span class="block-icon">\u2795</span> Add & Norm
                    </div>
                    <div class="transformer-block" onclick="Chapter9.selectBlock('ffn')">
                        <span class="block-icon">\u26A1</span> Feed-Forward
                    </div>
                    <div class="transformer-block" onclick="Chapter9.selectBlock('cross-attention')">
                        <span class="block-icon">\uD83D\uDD00</span> Cross-Attention
                    </div>
                    <div class="transformer-block" onclick="Chapter9.selectBlock('masked')">
                        <span class="block-icon">\uD83C\uDFAD</span> Masked Self-Attention
                    </div>
                </div>
                <div class="block-detail-panel" id="blockDetail">
                    <p style="color:var(--text-muted);text-align:center;">Click a component above to see its explanation.</p>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2696\uFE0F</span> Encoder vs Decoder</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div class="feature-card">
                        <div style="font-size:24px;margin-bottom:8px;">\uD83D\uDCD6</div>
                        <h3 style="color:#6366f1;">Encoder</h3>
                        <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            <strong>Bidirectional</strong> self-attention -- sees all positions at once.<br>
                            Used for <em>understanding</em>: classification, NER, question answering.<br>
                            Examples: BERT, RoBERTa, DeBERTa.
                        </p>
                    </div>
                    <div class="feature-card">
                        <div style="font-size:24px;margin-bottom:8px;">\u270D\uFE0F</div>
                        <h3 style="color:#10b981;">Decoder</h3>
                        <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            <strong>Causal (masked)</strong> self-attention + cross-attention to encoder.<br>
                            Used for <em>generation</em>: translation, text completion, dialogue.<br>
                            Examples: GPT, LLaMA, Claude.
                        </p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Code Example</h2>
                <div class="code-block">
<span class="keyword">import</span> torch.nn <span class="keyword">as</span> nn

<span class="comment"># Transformer configuration</span>
transformer = nn.<span class="function">Transformer</span>(
    d_model=<span class="number">512</span>,          <span class="comment"># Embedding dimension</span>
    nhead=<span class="number">8</span>,              <span class="comment"># Number of attention heads</span>
    num_encoder_layers=<span class="number">6</span>, <span class="comment"># Encoder stack depth</span>
    num_decoder_layers=<span class="number">6</span>, <span class="comment"># Decoder stack depth</span>
    dim_feedforward=<span class="number">2048</span>, <span class="comment"># FFN inner dimension</span>
    dropout=<span class="number">0.1</span>,
)

<span class="comment"># Forward pass</span>
src = torch.<span class="function">randn</span>(<span class="number">10</span>, <span class="number">32</span>, <span class="number">512</span>)  <span class="comment"># (seq_len, batch, d_model)</span>
tgt = torch.<span class="function">randn</span>(<span class="number">20</span>, <span class="number">32</span>, <span class="number">512</span>)
output = <span class="function">transformer</span>(src, tgt)
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter9.startQuiz9_1()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('8-5')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('9-2')">Next: Tokenization & Encoding \u2192</button>
            </div>
        `;

        this.drawArchitecture();
    },

    blockDescriptions: {
        'embedding': '<strong>\uD83D\uDCDD Input Embedding</strong><br>Converts token IDs into dense vectors of dimension d_model (typically 512 or 768). Each token in the vocabulary gets a learnable vector. This is a simple lookup table: token ID &rarr; vector.',
        'positional': '<strong>\uD83D\uDCCD Positional Encoding</strong><br>Injects position information using sin/cos functions: PE(pos,2i)=sin(pos/10000^(2i/d)). Without this, the model cannot distinguish word order. We explore this in depth in <strong>Chapter 9.2</strong>.',
        'self-attention': '<strong>\uD83D\uDC41\uFE0F Self-Attention</strong><br>Each position attends to all positions. Computes Query, Key, Value from input, then Attention(Q,K,V) = softmax(QK\u1D40/&radic;d_k)V. This lets the model capture long-range dependencies. Deep dive in <strong>Chapter 9.3</strong>.',
        'addnorm': '<strong>\u2795 Add & Norm (Residual + LayerNorm)</strong><br>output = LayerNorm(x + Sublayer(x)). The residual connection prevents gradient degradation in deep stacks. LayerNorm stabilizes training by normalizing across features.',
        'ffn': '<strong>\u26A1 Feed-Forward Network</strong><br>Two linear transformations with ReLU: FFN(x) = max(0, xW\u2081+b\u2081)W\u2082+b\u2082. Typically expands then contracts: 512 &rarr; 2048 &rarr; 512. Applied independently to each position.',
        'cross-attention': '<strong>\uD83D\uDD00 Cross-Attention</strong><br>Decoder attends to encoder output. Q comes from the decoder, K and V come from the encoder. This is how translation models "look at" the source sentence while generating the target.',
        'masked': '<strong>\uD83C\uDFAD Masked Self-Attention</strong><br>Same as self-attention but with a causal mask that prevents positions from attending to future tokens. Essential for autoregressive generation -- the model can only "see" what it has already generated.'
    },

    selectBlock(name) {
        this.activeBlock = name;
        const panel = document.getElementById('blockDetail');
        if (panel && this.blockDescriptions[name]) {
            panel.innerHTML = this.blockDescriptions[name];
        }
        document.querySelectorAll('.transformer-block').forEach(b => b.classList.remove('active'));
        event.currentTarget.classList.add('active');
    },

    drawArchitecture() {
        const canvas = document.getElementById('archCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const colors = {
            embed: '#3b82f6', pe: '#8b5cf6', attn: '#6366f1',
            norm: '#a78bfa', ffn: '#10b981', cross: '#f59e0b', masked: '#ef4444'
        };

        const drawBlock = (x, y, w, h, label, color, highlight) => {
            ctx.fillStyle = color;
            ctx.globalAlpha = highlight ? 0.3 : 0.15;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 6);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = highlight ? 3 : 1.5;
            ctx.stroke();
            ctx.fillStyle = '#e8eaf0';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + w / 2, y + h / 2 + 4);
        };

        const drawArrow = (x1, y1, x2, y2, color) => {
            ctx.beginPath();
            ctx.strokeStyle = color || 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1.5;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            const angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.beginPath();
            ctx.fillStyle = color || 'rgba(255,255,255,0.3)';
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - 8 * Math.cos(angle - 0.4), y2 - 8 * Math.sin(angle - 0.4));
            ctx.lineTo(x2 - 8 * Math.cos(angle + 0.4), y2 - 8 * Math.sin(angle + 0.4));
            ctx.fill();
        };

        // Labels
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('ENCODER', 200, 30);
        ctx.fillText('DECODER', 600, 30);

        // Encoder side
        const ex = 100, bw = 200, bh = 32, gap = 8;
        let ey = 460;
        drawBlock(ex, ey, bw, bh, 'Input Embedding', colors.embed);
        ey -= bh + gap;
        drawBlock(ex, ey, bw, bh, 'Positional Encoding', colors.pe);
        drawArrow(200, 492, 200, 460 - gap);

        // Encoder layer (N x)
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(ex - 10, 250, bw + 20, 180);
        ctx.setLineDash([]);
        ctx.fillStyle = '#5a6478';
        ctx.font = '10px Inter';
        ctx.fillText('N\u00D7', ex - 10 + (bw + 20) / 2, 245);

        ey = 400;
        drawBlock(ex, ey, bw, bh, 'Multi-Head Self-Attention', colors.attn);
        drawArrow(200, 428 - gap, 200, ey + bh);
        ey -= bh + gap;
        drawBlock(ex, ey, bw, bh, 'Add & Norm', colors.norm);
        drawArrow(200, ey + bh + gap + bh, 200, ey + bh);
        ey -= bh + gap;
        drawBlock(ex, ey, bw, bh, 'Feed-Forward', colors.ffn);
        drawArrow(200, ey + bh + gap + bh, 200, ey + bh);
        ey -= bh + gap;
        drawBlock(ex, ey, bw, bh, 'Add & Norm', colors.norm);
        drawArrow(200, ey + bh + gap + bh, 200, ey + bh);

        // Encoder output arrow to decoder
        drawArrow(310, 330, 490, 330, '#f59e0b');
        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px Inter';
        ctx.fillText('Encoder Output', 400, 322);

        // Decoder side
        const dx = 500;
        ey = 460;
        drawBlock(dx, ey, bw, bh, 'Output Embedding', colors.embed);
        ey -= bh + gap;
        drawBlock(dx, ey, bw, bh, 'Positional Encoding', colors.pe);
        drawArrow(600, 492, 600, 460 - gap);

        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(dx - 10, 170, bw + 20, 260);
        ctx.setLineDash([]);
        ctx.fillStyle = '#5a6478';
        ctx.font = '10px Inter';
        ctx.fillText('N\u00D7', dx - 10 + (bw + 20) / 2, 165);

        ey = 390;
        drawBlock(dx, ey, bw, bh, 'Masked Self-Attention', colors.masked);
        drawArrow(600, 420 - gap, 600, ey + bh);
        ey -= bh + gap;
        drawBlock(dx, ey, bw, bh, 'Add & Norm', colors.norm);
        drawArrow(600, ey + bh + gap + bh, 600, ey + bh);
        ey -= bh + gap;
        drawBlock(dx, ey, bw, bh, 'Cross-Attention (Q=Dec, KV=Enc)', colors.cross);
        drawArrow(600, ey + bh + gap + bh, 600, ey + bh);
        ey -= bh + gap;
        drawBlock(dx, ey, bw, bh, 'Add & Norm', colors.norm);
        drawArrow(600, ey + bh + gap + bh, 600, ey + bh);
        ey -= bh + gap;
        drawBlock(dx, ey, bw, bh, 'Feed-Forward', colors.ffn);
        drawArrow(600, ey + bh + gap + bh, 600, ey + bh);
        ey -= bh + gap;
        drawBlock(dx, ey, bw, bh, 'Add & Norm', colors.norm);
        drawArrow(600, ey + bh + gap + bh, 600, ey + bh);

        // Output
        ey -= bh + gap;
        drawBlock(dx, ey, bw, bh, 'Linear + Softmax', '#3b82f6');
        drawArrow(600, ey + bh + gap + bh, 600, ey + bh);

        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('Output Probabilities', 600, ey - 10);

        // Data flow dots if animating
        if (this.archAnimPlaying && this.archAnimStep > 0) {
            const dotPositions = [
                { x: 200, y: 480 }, { x: 200, y: 440 }, { x: 200, y: 410 },
                { x: 200, y: 370 }, { x: 200, y: 340 }, { x: 200, y: 300 },
                { x: 400, y: 330 }, { x: 600, y: 400 }, { x: 600, y: 360 },
                { x: 600, y: 320 }, { x: 600, y: 280 }, { x: 600, y: 240 },
                { x: 600, y: 200 }, { x: 600, y: 160 }
            ];
            const step = Math.min(this.archAnimStep, dotPositions.length);
            for (let i = 0; i < step; i++) {
                ctx.beginPath();
                ctx.arc(dotPositions[i].x, dotPositions[i].y, 5, 0, Math.PI * 2);
                ctx.fillStyle = i < 6 ? '#6366f1' : (i === 6 ? '#f59e0b' : '#10b981');
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    },

    playDataFlow() {
        this.archAnimPlaying = true;
        this.archAnimStep = 0;
        const animate = () => {
            this.archAnimStep++;
            this.drawArchitecture();
            if (this.archAnimStep < 15) {
                this.archAnimFrame = setTimeout(animate, 400);
            }
        };
        animate();
    },

    stopDataFlow() {
        this.archAnimPlaying = false;
        this.archAnimStep = 0;
        clearTimeout(this.archAnimFrame);
        this.drawArchitecture();
    },

    startQuiz9_1() {
        Quiz.start({
            title: 'Chapter 9.1: Transformer Architecture',
            chapterId: '9-1',
            questions: [
                {
                    question: 'What mechanism did the Transformer replace RNNs with?',
                    options: ['Convolution', 'Self-attention', 'Pooling', 'Batch normalization'],
                    correct: 1,
                    explanation: 'The Transformer uses self-attention instead of recurrence, allowing parallel processing of all positions.'
                },
                {
                    question: 'What is the role of cross-attention in the decoder?',
                    options: ['Attend to future tokens', 'Attend to encoder output', 'Normalize gradients', 'Reduce dimensions'],
                    correct: 1,
                    explanation: 'Cross-attention lets the decoder attend to the encoder output, using Q from the decoder and K,V from the encoder.'
                },
                {
                    question: 'Why does the decoder use masked self-attention?',
                    options: ['To reduce computation', 'To prevent attending to future tokens during generation', 'To improve accuracy', 'To handle variable length inputs'],
                    correct: 1,
                    explanation: 'The causal mask prevents the decoder from seeing future tokens, maintaining the autoregressive property.'
                },
                {
                    question: 'What does Add & Norm do?',
                    options: ['Adds new layers', 'Residual connection + Layer Normalization', 'Adds attention heads', 'Normalizes the loss'],
                    correct: 1,
                    explanation: 'Add & Norm applies a residual connection (x + Sublayer(x)) followed by Layer Normalization to stabilize deep networks.'
                },
                {
                    question: 'What is d_model in the original Transformer paper?',
                    options: ['64', '256', '512', '1024'],
                    correct: 2,
                    explanation: 'The original "Attention Is All You Need" paper used d_model=512 as the embedding dimension.'
                }
            ]
        });
    },

    // ============================================
    // 9.2: Tokenization & Positional Encoding
    // ============================================
    loadChapter9_2() {
        const container = document.getElementById('chapter-9-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 9 &bull; Chapter 9.2</span>
                <h1>Tokenization & Positional Encoding</h1>
                <p>Before text enters a Transformer, it must be broken into tokens and given positional information. These two steps are critical for the model to understand language.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2702\uFE0F</span> Interactive Tokenizer</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Type text and see how different tokenization strategies break it into subwords:</p>
                <div class="controls" style="margin:12px 0;">
                    <input type="text" class="text-input" id="tokenizerInput" value="The transformer model is running unhappily" style="flex:1;">
                    <button class="btn-primary btn-small" onclick="Chapter9.tokenize('bpe')">BPE (GPT)</button>
                    <button class="btn-secondary btn-small" onclick="Chapter9.tokenize('wordpiece')">WordPiece (BERT)</button>
                </div>
                <div id="tokenOutput" style="min-height:60px;"></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF0A</span> Positional Encoding Visualizer</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Transformers have no sense of word order without positional encodings. The formula uses sin/cos waves at different frequencies:</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCDD</span>
                    <span class="info-box-text">PE(pos, 2i) = sin(pos / 10000<sup>2i/d</sup>) &nbsp;&nbsp;|&nbsp;&nbsp; PE(pos, 2i+1) = cos(pos / 10000<sup>2i/d</sup>)</span>
                </div>
                <div class="network-viz">
                    <canvas id="peWaveCanvas" width="800" height="350"></canvas>
                </div>
                <div class="wave-controls">
                    <div class="control-group">
                        <label>Position: <strong id="pePositionLabel">0</strong></label>
                        <input type="range" id="pePositionSlider" min="0" max="50" value="0" oninput="Chapter9.updatePE()">
                    </div>
                    <div class="control-group">
                        <label>Highlight Dimension: <strong id="peDimLabel">0</strong></label>
                        <input type="range" id="peDimSlider" min="0" max="15" value="0" oninput="Chapter9.updatePE()">
                    </div>
                </div>
                <div class="gd-stats" id="peStats">
                    <div class="gd-stat"><div class="stat-label">Position</div><div class="stat-value" id="pePosVal">0</div></div>
                    <div class="gd-stat"><div class="stat-label">Dimension</div><div class="stat-value" id="peDimVal">0</div></div>
                    <div class="gd-stat"><div class="stat-label">sin value</div><div class="stat-value" id="peSinVal">0.000</div></div>
                    <div class="gd-stat"><div class="stat-label">cos value</div><div class="stat-value" id="peCosVal">1.000</div></div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD00</span> Why Position Matters</h2>
                <p>Without positional information, a Transformer sees these two sentences as identical (same words, same attention):</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="info-box success">
                        <span class="info-box-text"><strong>"The dog bit the man"</strong><br>The dog is the aggressor</span>
                    </div>
                    <div class="info-box warning">
                        <span class="info-box-text"><strong>"The man bit the dog"</strong><br>The man is the aggressor</span>
                    </div>
                </div>
                <div id="shuffleArea" style="text-align:center;margin:16px 0;">
                    <p id="shuffledSentence" style="font-size:20px;font-weight:600;color:var(--accent-secondary);min-height:32px;">Click shuffle to rearrange!</p>
                    <button class="btn-primary btn-small" onclick="Chapter9.shuffleSentence()" style="margin-top:8px;">Shuffle Words</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Code Example</h2>
                <div class="code-block">
<span class="keyword">from</span> transformers <span class="keyword">import</span> AutoTokenizer

tokenizer = AutoTokenizer.<span class="function">from_pretrained</span>(<span class="string">'bert-base-uncased'</span>)

text = <span class="string">"The transformer model is running unhappily"</span>
tokens = tokenizer.<span class="function">tokenize</span>(text)
<span class="comment"># ['the', 'transform', '##er', 'model', 'is', 'running', 'un', '##happi', '##ly']</span>

ids = tokenizer.<span class="function">encode</span>(text)
<span class="comment"># [101, 1996, 19081, 2121, 2944, 2003, 2770, 4895, 18223, 2135, 102]</span>

decoded = tokenizer.<span class="function">decode</span>(ids)
<span class="comment"># '[CLS] the transformer model is running unhappily [SEP]'</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter9.startQuiz9_2()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('9-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('9-3')">Next: Self-Attention Deep Dive \u2192</button>
            </div>
        `;

        this.drawPEWaves();
    },

    bpeSplits: {
        'transformer': ['transform', 'er'], 'running': ['run', 'ning'], 'unhappily': ['un', 'happi', 'ly'],
        'unhappy': ['un', 'happy'], 'playing': ['play', 'ing'], 'quickly': ['quick', 'ly'],
        'beautiful': ['beaut', 'iful'], 'understanding': ['under', 'stand', 'ing'],
        'attention': ['at', 'ten', 'tion'], 'embedding': ['embed', 'ding'],
        'learning': ['learn', 'ing'], 'network': ['net', 'work'], 'neural': ['neur', 'al'],
        'computing': ['comput', 'ing'], 'processing': ['process', 'ing'],
    },

    wpSplits: {
        'transformer': ['transform', '##er'], 'running': ['run', '##ning'], 'unhappily': ['un', '##happi', '##ly'],
        'unhappy': ['un', '##happy'], 'playing': ['play', '##ing'], 'quickly': ['quick', '##ly'],
        'beautiful': ['beaut', '##iful'], 'understanding': ['under', '##stand', '##ing'],
        'attention': ['at', '##ten', '##tion'], 'embedding': ['embed', '##ding'],
        'learning': ['learn', '##ing'], 'network': ['net', '##work'], 'neural': ['neur', '##al'],
        'computing': ['comput', '##ing'], 'processing': ['process', '##ing'],
    },

    tokenize(mode) {
        const input = document.getElementById('tokenizerInput').value.trim();
        if (!input) return;
        const words = input.toLowerCase().split(/\s+/);
        const splits = mode === 'bpe' ? this.bpeSplits : this.wpSplits;
        const tokens = [];
        words.forEach(w => {
            if (splits[w]) tokens.push(...splits[w]);
            else tokens.push(w);
        });

        const ids = tokens.map((t, i) => 1000 + Math.abs(t.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 0) % 29000));
        const vecs = tokens.map(() => {
            const v = [];
            for (let i = 0; i < 3; i++) v.push((Math.random() * 2 - 1).toFixed(2));
            return '[' + v.join(', ') + ', ...]';
        });

        let html = '<div style="margin-bottom:12px;"><strong>Tokens:</strong></div>';
        html += '<div class="token-flow">';
        tokens.forEach((t, i) => {
            if (i > 0) html += '<span class="flow-arrow">&middot;</span>';
            html += `<span class="token-chip text-token">${t}</span>`;
        });
        html += '</div>';

        html += '<div style="margin:12px 0;"><strong>Token IDs:</strong></div>';
        html += '<div class="token-flow">';
        ids.forEach((id, i) => {
            if (i > 0) html += '<span class="flow-arrow">&middot;</span>';
            html += `<span class="token-chip id-token">${id}</span>`;
        });
        html += '</div>';

        html += '<div style="margin:12px 0;"><strong>Embedding Vectors:</strong></div>';
        html += '<div class="token-flow">';
        vecs.forEach((v, i) => {
            if (i > 0) html += '<span class="flow-arrow">&middot;</span>';
            html += `<span class="token-chip vec-token">${v}</span>`;
        });
        html += '</div>';

        document.getElementById('tokenOutput').innerHTML = html;
    },

    drawPEWaves() {
        const canvas = document.getElementById('peWaveCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const pad = { top: 30, right: 30, bottom: 50, left: 60 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = pad.left + (plotW / 10) * i;
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
        }
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (plotH / 4) * i;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
        }

        // Axes
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Position', pad.left + plotW / 2, H - 10);
        ctx.textAlign = 'right';
        ctx.fillText('1', pad.left - 8, pad.top + 5);
        ctx.fillText('0', pad.left - 8, pad.top + plotH / 2 + 4);
        ctx.fillText('-1', pad.left - 8, pad.top + plotH + 4);
        for (let i = 0; i <= 50; i += 10) {
            ctx.textAlign = 'center';
            ctx.fillText(i, pad.left + (plotW / 50) * i, pad.top + plotH + 20);
        }

        const pos = parseInt(document.getElementById('pePositionSlider')?.value || 0);
        const dim = parseInt(document.getElementById('peDimSlider')?.value || 0);
        const dModel = 64;
        const maxPos = 50;

        // Draw waves for dims 0-15
        const waveColors = ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899',
                            '#6366f1', '#8b5cf6', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
        for (let d = 0; d < 16; d++) {
            const freq = 1 / Math.pow(10000, (2 * d) / dModel);
            const isHighlighted = d === dim;
            ctx.beginPath();
            ctx.strokeStyle = waveColors[d % waveColors.length];
            ctx.globalAlpha = isHighlighted ? 1 : 0.15;
            ctx.lineWidth = isHighlighted ? 3 : 1;
            for (let p = 0; p <= maxPos; p++) {
                const val = Math.sin(p * freq);
                const x = pad.left + (p / maxPos) * plotW;
                const y = pad.top + plotH / 2 - val * (plotH / 2);
                if (p === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Position line
        const posX = pad.left + (pos / maxPos) * plotW;
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.moveTo(posX, pad.top);
        ctx.lineTo(posX, pad.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Intersection dot
        const freq = 1 / Math.pow(10000, (2 * dim) / dModel);
        const sinVal = Math.sin(pos * freq);
        const cosVal = Math.cos(pos * freq);
        const dotY = pad.top + plotH / 2 - sinVal * (plotH / 2);
        ctx.beginPath();
        ctx.arc(posX, dotY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Legend
        ctx.fillStyle = '#e8eaf0';
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`Highlighted: dim ${dim} (freq = ${freq.toFixed(6)})`, pad.left, pad.top - 10);
    },

    updatePE() {
        const pos = parseInt(document.getElementById('pePositionSlider')?.value || 0);
        const dim = parseInt(document.getElementById('peDimSlider')?.value || 0);
        document.getElementById('pePositionLabel').textContent = pos;
        document.getElementById('peDimLabel').textContent = dim;

        const dModel = 64;
        const freq = 1 / Math.pow(10000, (2 * dim) / dModel);
        const sinVal = Math.sin(pos * freq);
        const cosVal = Math.cos(pos * freq);

        document.getElementById('pePosVal').textContent = pos;
        document.getElementById('peDimVal').textContent = dim;
        document.getElementById('peSinVal').textContent = sinVal.toFixed(4);
        document.getElementById('peCosVal').textContent = cosVal.toFixed(4);

        this.drawPEWaves();
    },

    shuffleSentence() {
        const words = ['The', 'cat', 'chased', 'the', 'mouse', 'quickly'];
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        document.getElementById('shuffledSentence').textContent = '"' + words.join(' ') + '"';
    },

    startQuiz9_2() {
        Quiz.start({
            title: 'Chapter 9.2: Tokenization & Positional Encoding',
            chapterId: '9-2',
            questions: [
                {
                    question: 'What does BPE (Byte-Pair Encoding) do?',
                    options: ['Encodes bytes as pairs', 'Merges frequent character pairs into subword tokens', 'Converts words to bytes', 'Pairs similar words together'],
                    correct: 1,
                    explanation: 'BPE iteratively merges the most frequent pair of adjacent symbols, building a vocabulary of subword tokens.'
                },
                {
                    question: 'What does "##" prefix mean in WordPiece tokenization?',
                    options: ['A comment', 'A special token', 'A continuation of the previous token (not a word start)', 'A padding token'],
                    correct: 2,
                    explanation: 'In WordPiece (used by BERT), "##" indicates the token is a continuation of the previous token, not the start of a new word.'
                },
                {
                    question: 'Why does positional encoding use different frequencies for different dimensions?',
                    options: ['To save memory', 'So each position gets a unique pattern across all dimensions', 'To speed up training', 'It does not use different frequencies'],
                    correct: 1,
                    explanation: 'Different frequencies across dimensions create unique patterns for each position, allowing the model to distinguish positions at multiple scales.'
                },
                {
                    question: 'What would happen without positional encoding?',
                    options: ['The model would be slower', 'The model could not distinguish word order', 'The model would overfit', 'Nothing would change'],
                    correct: 1,
                    explanation: 'Without positional encoding, self-attention is permutation-invariant -- it treats "dog bit man" and "man bit dog" identically.'
                },
                {
                    question: 'What is the maximum value of a positional encoding component?',
                    options: ['0.5', '1.0', '10000', 'Infinity'],
                    correct: 1,
                    explanation: 'Since positional encoding uses sin and cos functions, all values are bounded between -1 and 1.'
                }
            ]
        });
    },

    // ============================================
    // 9.3: Self-Attention Deep Dive (Q, K, V)
    // ============================================
    loadChapter9_3() {
        const container = document.getElementById('chapter-9-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 9 &bull; Chapter 9.3</span>
                <h1>Self-Attention Deep Dive</h1>
                <p>In Chapter 8.3, we saw attention weights connecting words. Now we trace exactly how Query, Key, and Value matrices produce those weights step by step.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD2C</span> Step-by-Step Q/K/V Computation</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Watch how a sentence passes through the self-attention mechanism. Use the controls to step through each stage:</p>
                <div class="network-viz">
                    <canvas id="qkvCanvas" width="800" height="420"></canvas>
                </div>
                <div class="controls" style="margin-top:12px;">
                    <button class="btn-secondary btn-small" onclick="Chapter9.prevQKVStep()">\u2190 Previous</button>
                    <span style="color:var(--text-secondary);font-size:13px;" id="qkvStepLabel">Step 1 / 6</span>
                    <button class="btn-primary btn-small" onclick="Chapter9.nextQKVStep()">Next \u2192</button>
                    <button class="btn-secondary btn-small" onclick="Chapter9.autoPlayQKV()">&#x25B6; Auto-play</button>
                </div>
                <div class="step-explanation" id="qkvExplanation" style="margin-top:12px;">
                    <strong>Step 1: Input Embeddings</strong> &mdash; Each word is represented as a dense vector. These are our starting point.
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE0</span> Multi-Head Attention</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Instead of one attention, Transformers run multiple attention "heads" in parallel, each learning different patterns:</p>
                <div class="network-viz">
                    <canvas id="multiHeadCanvas" width="800" height="300"></canvas>
                </div>
                <div class="controls" style="margin-top:12px;">
                    <button class="btn-small ${this.selectedHeadCount === 1 ? 'btn-primary' : 'btn-secondary'}" onclick="Chapter9.setHeadCount(1)">1 Head</button>
                    <button class="btn-small ${this.selectedHeadCount === 2 ? 'btn-primary' : 'btn-secondary'}" onclick="Chapter9.setHeadCount(2)">2 Heads</button>
                    <button class="btn-small ${this.selectedHeadCount === 4 ? 'btn-primary' : 'btn-secondary'}" onclick="Chapter9.setHeadCount(4)">4 Heads</button>
                    <button class="btn-small ${this.selectedHeadCount === 8 ? 'btn-primary' : 'btn-secondary'}" onclick="Chapter9.setHeadCount(8)">8 Heads</button>
                </div>
                <div class="gd-stats" style="margin-top:12px;">
                    <div class="gd-stat"><div class="stat-label">Num Heads</div><div class="stat-value" id="mhHeads">1</div></div>
                    <div class="gd-stat"><div class="stat-label">Head Dim</div><div class="stat-value" id="mhHeadDim">512</div></div>
                    <div class="gd-stat"><div class="stat-label">d_model</div><div class="stat-value">512</div></div>
                    <div class="gd-stat"><div class="stat-label">Total Params</div><div class="stat-value" id="mhParams">1.05M</div></div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Code Example</h2>
                <div class="code-block">
<span class="keyword">import</span> torch
<span class="keyword">import</span> torch.nn.functional <span class="keyword">as</span> F

<span class="keyword">def</span> <span class="function">scaled_dot_product_attention</span>(Q, K, V, mask=<span class="keyword">None</span>):
    d_k = Q.<span class="function">size</span>(-<span class="number">1</span>)
    scores = torch.<span class="function">matmul</span>(Q, K.<span class="function">transpose</span>(-<span class="number">2</span>, -<span class="number">1</span>)) / (d_k ** <span class="number">0.5</span>)
    <span class="keyword">if</span> mask <span class="keyword">is not None</span>:
        scores = scores.<span class="function">masked_fill</span>(mask == <span class="number">0</span>, -<span class="number">1e9</span>)
    weights = F.<span class="function">softmax</span>(scores, dim=-<span class="number">1</span>)
    <span class="keyword">return</span> torch.<span class="function">matmul</span>(weights, V), weights

<span class="comment"># Example usage</span>
Q = torch.<span class="function">randn</span>(<span class="number">1</span>, <span class="number">4</span>, <span class="number">64</span>)  <span class="comment"># (batch, seq_len, d_k)</span>
K = torch.<span class="function">randn</span>(<span class="number">1</span>, <span class="number">4</span>, <span class="number">64</span>)
V = torch.<span class="function">randn</span>(<span class="number">1</span>, <span class="number">4</span>, <span class="number">64</span>)
output, weights = <span class="function">scaled_dot_product_attention</span>(Q, K, V)
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter9.startQuiz9_3()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('9-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('9-4')">Next: GPT & Text Generation \u2192</button>
            </div>
        `;

        this.qkvStep = 0;
        this.drawQKVStep(0);
        this.drawMultiHead();
    },

    qkvWords: ['I', 'love', 'deep', 'learning'],
    qkvColors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
    qkvExplanations: [
        '<strong>Step 1: Input Embeddings</strong> &mdash; Each word is represented as a dense vector (shown as colored rows). These are the raw inputs to self-attention.',
        '<strong>Step 2: Linear Projections</strong> &mdash; The input X is multiplied by weight matrices W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> to produce Query (Q), Key (K), and Value (V) matrices.',
        '<strong>Step 3: Q &times; K<sup>T</sup></strong> &mdash; Compute dot products between all Query-Key pairs. This produces a score matrix showing how much each word should attend to every other word.',
        '<strong>Step 4: Scale by &radic;d<sub>k</sub></strong> &mdash; Divide scores by &radic;d<sub>k</sub> to prevent large dot products from pushing softmax into extreme regions with tiny gradients.',
        '<strong>Step 5: Softmax</strong> &mdash; Apply softmax row-wise to convert raw scores into attention weights (probabilities that sum to 1 per row).',
        '<strong>Step 6: Attention &times; V</strong> &mdash; Multiply attention weights by V to produce the output. Each word\'s output is a weighted combination of all Value vectors.'
    ],

    drawQKVStep(step) {
        const canvas = document.getElementById('qkvCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const words = this.qkvWords;
        const colors = this.qkvColors;

        // Example small matrices for visualization
        const X = [[0.5, 0.3, 0.8], [0.9, 0.1, 0.4], [0.2, 0.7, 0.6], [0.4, 0.5, 0.3]];
        const Q = [[0.6, 0.4], [0.8, 0.2], [0.3, 0.7], [0.5, 0.5]];
        const K = [[0.7, 0.3], [0.2, 0.9], [0.5, 0.5], [0.4, 0.6]];
        const V = [[0.1, 0.9], [0.8, 0.2], [0.5, 0.5], [0.3, 0.7]];
        const scores = [[0.54, 0.54, 0.47, 0.48], [0.62, 0.32, 0.50, 0.44], [0.33, 0.69, 0.50, 0.54], [0.50, 0.55, 0.50, 0.50]];
        const scaled = scores.map(r => r.map(v => v / Math.sqrt(2)));
        const softmaxed = scaled.map(row => {
            const exps = row.map(v => Math.exp(v * 3));
            const sum = exps.reduce((a, b) => a + b, 0);
            return exps.map(e => e / sum);
        });

        const drawMatrix = (data, x, y, cellW, cellH, label, labelColor, highlightRow, highlightCol) => {
            ctx.fillStyle = labelColor || '#e8eaf0';
            ctx.font = 'bold 13px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + (data[0].length * cellW) / 2, y - 8);

            data.forEach((row, ri) => {
                row.forEach((val, ci) => {
                    const cx = x + ci * cellW;
                    const cy = y + ri * cellH;
                    const isHighlight = (highlightRow === ri || highlightCol === ci);
                    ctx.fillStyle = isHighlight ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)';
                    ctx.fillRect(cx, cy, cellW - 2, cellH - 2);
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(cx, cy, cellW - 2, cellH - 2);
                    ctx.fillStyle = '#e8eaf0';
                    ctx.font = '10px JetBrains Mono';
                    ctx.textAlign = 'center';
                    ctx.fillText(typeof val === 'number' ? val.toFixed(2) : val, cx + cellW / 2 - 1, cy + cellH / 2 + 3);
                });
            });

            // Row labels
            if (label === 'X' || label === 'Q' || label === 'Attn\u00D7V') {
                words.forEach((w, i) => {
                    ctx.fillStyle = colors[i];
                    ctx.font = '11px Inter';
                    ctx.textAlign = 'right';
                    ctx.fillText(w, x - 6, y + i * cellH + cellH / 2 + 3);
                });
            }
        };

        const cw = 48, ch = 32;

        if (step === 0) {
            // Input embeddings
            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Input Embeddings (X)', W / 2, 40);
            drawMatrix(X, W / 2 - (3 * cw) / 2, 60, cw, ch, 'X', '#6366f1');
            // Word labels with colored dots
            words.forEach((w, i) => {
                ctx.beginPath();
                ctx.arc(W / 2 - (3 * cw) / 2 - 30, 60 + i * ch + ch / 2, 5, 0, Math.PI * 2);
                ctx.fillStyle = colors[i];
                ctx.fill();
            });

            ctx.fillStyle = '#8b949e';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Each row is a word vector of dimension d_model', W / 2, 220);
        } else if (step === 1) {
            // Linear projections
            drawMatrix(X, 40, 60, cw, ch, 'X', '#818cf8');
            ctx.fillStyle = '#8b949e'; ctx.font = '20px Inter'; ctx.textAlign = 'center';
            ctx.fillText('\u00D7', 40 + 3 * cw + 20, 110);

            ctx.fillStyle = '#6366f1'; ctx.font = 'bold 12px Inter';
            ctx.fillText('W_Q', 250, 50);
            ctx.fillStyle = 'rgba(99,102,241,0.15)';
            ctx.fillRect(220, 60, 60, 100);
            ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 1; ctx.strokeRect(220, 60, 60, 100);

            ctx.fillStyle = '#8b949e'; ctx.font = '20px Inter'; ctx.fillText('=', 310, 110);
            drawMatrix(Q, 340, 60, cw, ch, 'Q', '#6366f1');

            // K and V below
            drawMatrix(K, 340, 210, cw, ch, 'K', '#10b981');
            drawMatrix(V, 340, 360, cw, ch, 'V', '#f59e0b');

            ctx.fillStyle = '#8b949e'; ctx.font = '12px Inter'; ctx.textAlign = 'left';
            ctx.fillText('X \u00D7 W_K \u2192', 220, 250);
            ctx.fillText('X \u00D7 W_V \u2192', 220, 400);
        } else if (step === 2) {
            // Q * K^T
            drawMatrix(Q, 40, 80, cw, ch, 'Q', '#6366f1');
            ctx.fillStyle = '#8b949e'; ctx.font = '20px Inter'; ctx.textAlign = 'center';
            ctx.fillText('\u00D7', 170, 130);
            ctx.fillStyle = '#10b981'; ctx.font = 'bold 12px Inter';
            ctx.fillText('K\u1D40', 240, 70);
            ctx.fillStyle = 'rgba(16,185,129,0.15)';
            ctx.fillRect(200, 80, 80, 55);
            ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1; ctx.strokeRect(200, 80, 80, 55);

            ctx.fillStyle = '#8b949e'; ctx.font = '20px Inter'; ctx.textAlign = 'center';
            ctx.fillText('=', 310, 130);

            drawMatrix(scores, 340, 60, cw, ch, 'Scores', '#8b5cf6');

            // Labels
            ctx.fillStyle = '#8b949e'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
            ctx.fillText('Each cell = dot product of Q_i and K_j', W / 2, 260);
            ctx.fillText('Higher score = more attention from word i to word j', W / 2, 280);
        } else if (step === 3) {
            // Scale
            drawMatrix(scores, 120, 60, cw, ch, 'Scores', '#8b5cf6');
            ctx.fillStyle = '#8b949e'; ctx.font = '20px Inter'; ctx.textAlign = 'center';
            ctx.fillText('\u00F7 \u221Ad_k', 380, 120);
            ctx.fillText('=', 460, 120);
            drawMatrix(scaled, 500, 60, cw, ch, 'Scaled', '#a855f7');

            ctx.fillStyle = '#8b949e'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
            ctx.fillText('d_k = 2, so \u221Ad_k = 1.41', W / 2, 240);
            ctx.fillText('Scaling prevents softmax saturation with large d_k', W / 2, 260);
        } else if (step === 4) {
            // Softmax
            drawMatrix(scaled, 80, 60, cw, ch, 'Scaled Scores', '#a855f7');
            ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 16px Inter'; ctx.textAlign = 'center';
            ctx.fillText('\u2192 softmax \u2192', 360, 120);
            drawMatrix(softmaxed, 480, 60, cw, ch, 'Attention Weights', '#f59e0b');

            ctx.fillStyle = '#8b949e'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
            ctx.fillText('Each row sums to 1.0 (probability distribution)', W / 2, 250);

            // Draw mini bar charts for each row
            softmaxed.forEach((row, ri) => {
                const baseX = 480;
                const baseY = 280 + ri * 30;
                ctx.fillStyle = colors[ri];
                ctx.font = '10px Inter'; ctx.textAlign = 'right';
                ctx.fillText(words[ri] + ':', baseX - 5, baseY + 12);
                row.forEach((v, ci) => {
                    const barW = v * 80;
                    ctx.fillStyle = colors[ci];
                    ctx.globalAlpha = 0.6;
                    ctx.fillRect(baseX + ci * 85, baseY, barW, 16);
                    ctx.globalAlpha = 1;
                });
            });
        } else if (step === 5) {
            // Attention * V = Output
            drawMatrix(softmaxed, 40, 60, 44, ch, 'Attn Weights', '#f59e0b');
            ctx.fillStyle = '#8b949e'; ctx.font = '20px Inter'; ctx.textAlign = 'center';
            ctx.fillText('\u00D7', 240, 120);
            drawMatrix(V, 280, 80, cw, ch, 'V', '#f59e0b');
            ctx.fillStyle = '#8b949e'; ctx.font = '20px Inter'; ctx.textAlign = 'center';
            ctx.fillText('=', 420, 120);

            const output = softmaxed.map(row => {
                return V[0].map((_, ci) => {
                    return row.reduce((sum, w, ri) => sum + w * V[ri][ci], 0);
                });
            });
            drawMatrix(output, 460, 80, cw, ch, 'Output', '#10b981');

            ctx.fillStyle = '#8b949e'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
            ctx.fillText('Each output row is a weighted combination of all V vectors', W / 2, 270);
            ctx.fillText('Words that received high attention contribute more', W / 2, 290);
        }

        // Update step label
        const label = document.getElementById('qkvStepLabel');
        if (label) label.textContent = `Step ${step + 1} / ${this.qkvMaxSteps}`;
        const expl = document.getElementById('qkvExplanation');
        if (expl) expl.innerHTML = this.qkvExplanations[step];
    },

    nextQKVStep() {
        if (this.qkvStep < this.qkvMaxSteps - 1) {
            this.qkvStep++;
            this.drawQKVStep(this.qkvStep);
        }
    },

    prevQKVStep() {
        if (this.qkvStep > 0) {
            this.qkvStep--;
            this.drawQKVStep(this.qkvStep);
        }
    },

    autoPlayQKV() {
        this.qkvStep = 0;
        this.drawQKVStep(0);
        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step >= this.qkvMaxSteps) { clearInterval(interval); return; }
            this.qkvStep = step;
            this.drawQKVStep(step);
        }, 1500);
    },

    drawMultiHead() {
        const canvas = document.getElementById('multiHeadCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const numHeads = this.selectedHeadCount;
        const headColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#a855f7'];
        const headLabels = ['Positional', 'Syntactic', 'Semantic', 'Coreference', 'Local', 'Global', 'Punctuation', 'Structural'];

        const headW = Math.min(120, (W - 200) / numHeads - 10);
        const startX = 80;
        const headGap = (W - 200 - numHeads * headW) / (numHeads + 1);

        // Input
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Input X', 40, H / 2 + 4);

        // Arrow to heads
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(70, H / 2);
        ctx.lineTo(startX, H / 2);
        ctx.stroke();

        // Draw heads
        for (let i = 0; i < numHeads; i++) {
            const hx = startX + headGap + i * (headW + headGap);
            const hy = 40;
            const hh = H - 80;

            ctx.fillStyle = headColors[i % headColors.length];
            ctx.globalAlpha = 0.12;
            ctx.beginPath();
            ctx.roundRect(hx, hy, headW, hh, 8);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = headColors[i % headColors.length];
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = headColors[i % headColors.length];
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`Head ${i + 1}`, hx + headW / 2, hy + 20);
            ctx.fillStyle = '#8b949e';
            ctx.font = '9px Inter';
            if (i < headLabels.length) {
                ctx.fillText(headLabels[i], hx + headW / 2, hy + 35);
            }
            ctx.fillText(`d_k=${Math.floor(512 / numHeads)}`, hx + headW / 2, hy + hh - 10);

            // Mini attention pattern
            const pSize = Math.min(12, (headW - 20) / 4);
            const px = hx + (headW - 4 * pSize) / 2;
            const py = hy + 50;
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    let alpha;
                    if (i % 4 === 0) alpha = Math.max(0, 1 - Math.abs(r - c) * 0.3); // Positional
                    else if (i % 4 === 1) alpha = (r === 0 && c === 2) || (r === 2 && c === 0) ? 0.9 : 0.15; // Syntactic
                    else if (i % 4 === 2) alpha = (r === c) ? 0.7 : Math.random() * 0.3; // Semantic
                    else alpha = (c <= r) ? 0.4 : 0.05; // Structural

                    ctx.fillStyle = headColors[i % headColors.length];
                    ctx.globalAlpha = Math.max(0.05, alpha);
                    ctx.fillRect(px + c * pSize, py + r * pSize, pSize - 1, pSize - 1);
                }
            }
            ctx.globalAlpha = 1;
        }

        // Concat arrow and output
        const concatX = startX + headGap + numHeads * (headW + headGap);
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Concat', concatX + 20, H / 2 - 10);
        ctx.fillText('+', concatX + 20, H / 2 + 5);
        ctx.fillText('Linear', concatX + 20, H / 2 + 20);

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.moveTo(concatX + 50, H / 2);
        ctx.lineTo(W - 40, H / 2);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('Output', W - 20, H / 2 + 4);

        // Update stats
        const headDim = Math.floor(512 / numHeads);
        const params = (512 * headDim * 3 * numHeads + 512 * 512) / 1e6;
        document.getElementById('mhHeads').textContent = numHeads;
        document.getElementById('mhHeadDim').textContent = headDim;
        document.getElementById('mhParams').textContent = params.toFixed(2) + 'M';
    },

    setHeadCount(n) {
        this.selectedHeadCount = n;
        this.drawMultiHead();
    },

    startQuiz9_3() {
        Quiz.start({
            title: 'Chapter 9.3: Self-Attention Deep Dive',
            chapterId: '9-3',
            questions: [
                {
                    question: 'What are Q, K, and V in self-attention?',
                    options: ['Quality, Key, Volume', 'Query, Key, Value -- linear projections of the input', 'Quantized, Kernel, Vector', 'Queue, Key, Validator'],
                    correct: 1,
                    explanation: 'Q (Query), K (Key), and V (Value) are obtained by multiplying the input by learned weight matrices W_Q, W_K, W_V.'
                },
                {
                    question: 'Why do we scale by \u221Ad_k?',
                    options: ['To make the model faster', 'To prevent dot products from growing too large and pushing softmax into saturation', 'To reduce memory usage', 'It is optional and not needed'],
                    correct: 1,
                    explanation: 'Large dot products cause softmax to produce near-one-hot outputs with tiny gradients, making training difficult.'
                },
                {
                    question: 'What does each row of the attention weight matrix represent?',
                    options: ['A word embedding', 'A probability distribution over all positions for one word', 'A loss value', 'A gradient vector'],
                    correct: 1,
                    explanation: 'After softmax, each row is a probability distribution showing how much that position attends to every other position.'
                },
                {
                    question: 'Why use multiple attention heads instead of one large head?',
                    options: ['It is cheaper', 'Different heads can learn different types of relationships (positional, syntactic, semantic)', 'It uses less memory', 'One head is always better'],
                    correct: 1,
                    explanation: 'Multiple heads allow the model to attend to information at different positions and learn different relationship patterns simultaneously.'
                },
                {
                    question: 'What happens after all heads compute their outputs?',
                    options: ['They are averaged', 'They are concatenated and passed through a linear layer', 'They are summed', 'Only the best head is kept'],
                    correct: 1,
                    explanation: 'Multi-head outputs are concatenated along the feature dimension and projected through a final linear layer back to d_model.'
                }
            ]
        });
    },

    // ============================================
    // 9.4: GPT & Text Generation
    // ============================================
    loadChapter9_4() {
        const container = document.getElementById('chapter-9-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 9 &bull; Chapter 9.4</span>
                <h1>GPT & Text Generation</h1>
                <p>GPT (Generative Pre-trained Transformer) uses a decoder-only architecture to generate text one token at a time, predicting the most likely next word.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD04</span> Model Types Comparison</h2>
                <div class="model-comparison">
                    <div class="model-card" onclick="this.classList.toggle('active')">
                        <div class="model-icon">\uD83D\uDCD6</div>
                        <div class="model-name">Encoder-Only</div>
                        <div class="model-desc">BERT, RoBERTa, DeBERTa</div>
                        <p style="font-size:11px;color:var(--text-secondary);margin-top:8px;">Bidirectional. Best for understanding: classification, NER, QA extraction.</p>
                    </div>
                    <div class="model-card" onclick="this.classList.toggle('active')">
                        <div class="model-icon">\u270D\uFE0F</div>
                        <div class="model-name">Decoder-Only</div>
                        <div class="model-desc">GPT, LLaMA, Claude</div>
                        <p style="font-size:11px;color:var(--text-secondary);margin-top:8px;">Causal (left-to-right). Best for generation: text, code, dialogue.</p>
                    </div>
                    <div class="model-card" onclick="this.classList.toggle('active')">
                        <div class="model-icon">\uD83D\uDD00</div>
                        <div class="model-name">Encoder-Decoder</div>
                        <div class="model-desc">T5, BART, mBART</div>
                        <p style="font-size:11px;color:var(--text-secondary);margin-top:8px;">Full transformer. Best for seq2seq: translation, summarization.</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAD</span> Causal Masking</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>In GPT, each token can only attend to itself and previous tokens. Future positions are masked with -&infin;:</p>
                <div id="causalMaskArea" style="text-align:center;margin:16px 0;overflow-x:auto;"></div>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">The upper triangle is blocked (-&infin; before softmax = 0 attention weight). This prevents the model from "cheating" by looking at future tokens during training.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2328\uFE0F</span> Interactive Text Generation</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Type a prompt and watch the model generate text token by token:</p>
                <div class="controls" style="margin:12px 0;">
                    <input type="text" class="text-input" id="genPromptInput" value="The future of AI is" style="flex:1;">
                    <button class="btn-primary btn-small" onclick="Chapter9.generateText()">Generate</button>
                    <button class="btn-secondary btn-small" onclick="Chapter9.resetGeneration()">Reset</button>
                </div>
                <div class="generation-output" id="genOutput">
                    <span style="color:var(--text-muted);">Click "Generate" to start...</span>
                </div>
                <div id="probBarsArea" style="margin-top:12px;"></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF21\uFE0F</span> Temperature Control</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Temperature controls the randomness of generation. Low = focused, High = creative:</p>
                <div class="network-viz">
                    <canvas id="tempCanvas" width="800" height="280"></canvas>
                </div>
                <div class="controls" style="margin-top:12px;">
                    <div class="control-group">
                        <label>Temperature: <strong id="tempLabel">1.0</strong></label>
                        <input type="range" id="tempSlider" min="1" max="20" value="10" oninput="Chapter9.updateTemperature()">
                    </div>
                </div>
                <div class="gd-stats">
                    <div class="gd-stat"><div class="stat-label">Temperature</div><div class="stat-value" id="tempVal">1.0</div></div>
                    <div class="gd-stat"><div class="stat-label">Top Token Prob</div><div class="stat-value" id="topProbVal">35%</div></div>
                    <div class="gd-stat"><div class="stat-label">Entropy</div><div class="stat-value" id="entropyVal">2.1</div></div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Code Example</h2>
                <div class="code-block">
<span class="keyword">from</span> transformers <span class="keyword">import</span> GPT2LMHeadModel, GPT2Tokenizer

tokenizer = GPT2Tokenizer.<span class="function">from_pretrained</span>(<span class="string">'gpt2'</span>)
model = GPT2LMHeadModel.<span class="function">from_pretrained</span>(<span class="string">'gpt2'</span>)

prompt = <span class="string">"The future of AI is"</span>
inputs = <span class="function">tokenizer</span>(prompt, return_tensors=<span class="string">'pt'</span>)

output = model.<span class="function">generate</span>(
    **inputs,
    max_new_tokens=<span class="number">50</span>,
    temperature=<span class="number">0.8</span>,
    top_k=<span class="number">50</span>,
    top_p=<span class="number">0.95</span>,
    do_sample=<span class="keyword">True</span>,
)
<span class="function">print</span>(tokenizer.<span class="function">decode</span>(output[<span class="number">0</span>]))
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter9.startQuiz9_4()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('9-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('9-5')">Next: Vision Transformers \u2192</button>
            </div>
        `;

        this.buildCausalMask();
        this.drawTemperature();
    },

    buildCausalMask() {
        const tokens = ['The', 'future', 'of', 'AI', 'is', 'bright'];
        const n = tokens.length;
        let html = '<div style="display:inline-block;">';
        // Header row
        html += '<div style="display:grid;grid-template-columns:60px repeat(' + n + ', 46px);gap:2px;">';
        html += '<div></div>';
        tokens.forEach(t => {
            html += `<div style="font-size:10px;color:var(--text-secondary);text-align:center;padding:4px;">${t}</div>`;
        });
        html += '</div>';
        // Matrix rows
        for (let r = 0; r < n; r++) {
            html += '<div style="display:grid;grid-template-columns:60px repeat(' + n + ', 46px);gap:2px;">';
            html += `<div style="font-size:10px;color:var(--text-secondary);text-align:right;padding:8px 4px;">${tokens[r]}</div>`;
            for (let c = 0; c < n; c++) {
                if (c <= r) {
                    const score = (0.3 + Math.random() * 0.5).toFixed(2);
                    html += `<div class="mask-cell allowed">${score}</div>`;
                } else {
                    html += `<div class="mask-cell blocked">-&infin;</div>`;
                }
            }
            html += '</div>';
        }
        html += '</div>';
        document.getElementById('causalMaskArea').innerHTML = html;
    },

    genTrees: {
        'default': { candidates: ['the', 'a', 'very', 'not', 'quite'], probs: [0.3, 0.25, 0.2, 0.15, 0.1] },
        'The future of AI is': { candidates: ['bright', 'uncertain', 'exciting', 'promising', 'here'], probs: [0.35, 0.22, 0.2, 0.13, 0.1] },
        'bright': { candidates: [',', 'and', '.', 'but', 'with'], probs: [0.3, 0.25, 0.2, 0.15, 0.1] },
        'uncertain': { candidates: [',', 'but', '.', 'and', 'yet'], probs: [0.28, 0.25, 0.22, 0.15, 0.1] },
        'exciting': { candidates: [',', '.', 'and', 'but', 'with'], probs: [0.3, 0.25, 0.2, 0.15, 0.1] },
        ',': { candidates: ['with', 'and', 'but', 'as', 'driven'], probs: [0.25, 0.25, 0.2, 0.18, 0.12] },
        'and': { candidates: ['the', 'it', 'we', 'its', 'this'], probs: [0.28, 0.25, 0.2, 0.17, 0.1] },
        'with': { candidates: ['new', 'many', 'great', 'incredible', 'vast'], probs: [0.3, 0.25, 0.2, 0.15, 0.1] },
        'new': { candidates: ['opportunities', 'technologies', 'discoveries', 'breakthroughs', 'possibilities'], probs: [0.3, 0.25, 0.2, 0.15, 0.1] },
        'many': { candidates: ['challenges', 'opportunities', 'possibilities', 'questions', 'advances'], probs: [0.28, 0.25, 0.2, 0.15, 0.12] },
    },

    generateText() {
        if (this.genAnimating) return;
        this.genAnimating = true;
        const prompt = document.getElementById('genPromptInput').value.trim();
        this.genTokens = [];
        document.getElementById('genOutput').innerHTML = `<span>${prompt} </span>`;

        let lastToken = prompt;
        let count = 0;
        const maxTokens = 8;

        const step = () => {
            if (count >= maxTokens) { this.genAnimating = false; return; }
            const tree = this.genTrees[lastToken] || this.genTrees['default'];
            const temp = this.genTemperature;

            // Temperature-adjusted sampling
            const logits = tree.probs.map(p => Math.log(p));
            const scaled = logits.map(l => l / temp);
            const maxL = Math.max(...scaled);
            const exps = scaled.map(l => Math.exp(l - maxL));
            const sumExp = exps.reduce((a, b) => a + b, 0);
            const probs = exps.map(e => e / sumExp);

            // Sample
            const r = Math.random();
            let cumulative = 0;
            let chosen = 0;
            for (let i = 0; i < probs.length; i++) {
                cumulative += probs[i];
                if (r < cumulative) { chosen = i; break; }
            }

            const token = tree.candidates[chosen];
            this.genTokens.push(token);
            lastToken = token;

            const output = document.getElementById('genOutput');
            output.innerHTML += `<span class="generated-token">${token} </span>`;

            // Show prob bars
            this.showProbBars(tree.candidates, probs, chosen);

            count++;
            this.genAnimId = setTimeout(step, 600);
        };

        step();
    },

    showProbBars(candidates, probs, chosenIdx) {
        const maxProb = Math.max(...probs);
        let html = '<div style="display:flex;gap:8px;align-items:flex-end;height:100px;padding:12px;background:var(--bg-input);border-radius:8px;">';
        const barColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        candidates.forEach((c, i) => {
            const barH = (probs[i] / maxProb) * 80;
            const isChosen = i === chosenIdx;
            html += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">`;
            html += `<span style="font-size:10px;color:var(--text-secondary);">${(probs[i] * 100).toFixed(1)}%</span>`;
            html += `<div style="width:100%;height:${barH}px;background:${barColors[i]};border-radius:4px 4px 0 0;opacity:${isChosen ? 1 : 0.4};border:${isChosen ? '2px solid #fff' : 'none'};"></div>`;
            html += `<span style="font-size:10px;color:${isChosen ? '#e8eaf0' : 'var(--text-muted)'};font-weight:${isChosen ? '700' : '400'};">${c}</span>`;
            html += `</div>`;
        });
        html += '</div>';
        document.getElementById('probBarsArea').innerHTML = html;
    },

    resetGeneration() {
        this.genAnimating = false;
        clearTimeout(this.genAnimId);
        this.genTokens = [];
        document.getElementById('genOutput').innerHTML = '<span style="color:var(--text-muted);">Click "Generate" to start...</span>';
        document.getElementById('probBarsArea').innerHTML = '';
    },

    drawTemperature() {
        const canvas = document.getElementById('tempCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const temp = parseFloat(document.getElementById('tempSlider')?.value || 10) / 10;
        this.genTemperature = temp;

        const pad = { top: 30, right: 30, bottom: 60, left: 50 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        const tokens = ['bright', 'uncertain', 'exciting', 'promising', 'here', 'complex', 'limitless', 'unclear'];
        const logits = [2.5, 1.8, 1.6, 1.0, 0.5, 0.3, 0.1, -0.2];

        // Apply temperature
        const scaled = logits.map(l => l / temp);
        const maxL = Math.max(...scaled);
        const exps = scaled.map(l => Math.exp(l - maxL));
        const sumExp = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map(e => e / sumExp);

        const maxProb = Math.max(...probs);
        const barW = plotW / tokens.length - 8;
        const barColors = ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (plotH / 4) * i;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }

        // Bars
        tokens.forEach((t, i) => {
            const x = pad.left + i * (barW + 8) + 4;
            const barH = (probs[i] / Math.max(maxProb, 0.01)) * plotH;
            const y = pad.top + plotH - barH;

            const grad = ctx.createLinearGradient(x, y, x, pad.top + plotH);
            grad.addColorStop(0, barColors[i]);
            grad.addColorStop(1, barColors[i] + '33');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
            ctx.fill();

            // Probability label
            ctx.fillStyle = '#e8eaf0';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText((probs[i] * 100).toFixed(1) + '%', x + barW / 2, y - 6);

            // Token label
            ctx.fillStyle = '#8b949e';
            ctx.font = '10px Inter';
            ctx.save();
            ctx.translate(x + barW / 2, pad.top + plotH + 15);
            ctx.rotate(-0.4);
            ctx.fillText(t, 0, 0);
            ctx.restore();
        });

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`Temperature = ${temp.toFixed(1)} ${temp < 0.5 ? '(Greedy)' : temp < 1.0 ? '(Focused)' : temp < 1.5 ? '(Balanced)' : '(Creative)'}`, W / 2, 18);

        // Update stats
        document.getElementById('tempLabel').textContent = temp.toFixed(1);
        document.getElementById('tempVal').textContent = temp.toFixed(1);
        document.getElementById('topProbVal').textContent = (probs[0] * 100).toFixed(1) + '%';
        const entropy = -probs.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
        document.getElementById('entropyVal').textContent = entropy.toFixed(2);
    },

    updateTemperature() {
        this.drawTemperature();
    },

    startQuiz9_4() {
        Quiz.start({
            title: 'Chapter 9.4: GPT & Text Generation',
            chapterId: '9-4',
            questions: [
                {
                    question: 'What type of Transformer architecture does GPT use?',
                    options: ['Encoder-only', 'Decoder-only', 'Encoder-decoder', 'Neither'],
                    correct: 1,
                    explanation: 'GPT uses a decoder-only architecture with causal (masked) self-attention for autoregressive generation.'
                },
                {
                    question: 'What does the causal mask prevent?',
                    options: ['Attending to padding tokens', 'Attending to future tokens', 'Attending to the same token', 'Attending to special tokens'],
                    correct: 1,
                    explanation: 'The causal mask ensures each position can only attend to previous positions, preventing information leakage from future tokens.'
                },
                {
                    question: 'What happens when temperature approaches 0?',
                    options: ['Output becomes random', 'Output becomes greedy (always picks the most likely token)', 'Model crashes', 'Output becomes longer'],
                    correct: 1,
                    explanation: 'Very low temperature sharpens the probability distribution, making the model almost always select the highest-probability token.'
                },
                {
                    question: 'What is autoregressive generation?',
                    options: ['Generating all tokens at once', 'Generating tokens one at a time, each conditioned on previous ones', 'Generating tokens in reverse order', 'Generating tokens randomly'],
                    correct: 1,
                    explanation: 'Autoregressive models generate one token at a time, feeding each generated token back as input for generating the next.'
                },
                {
                    question: 'What does top-k sampling do?',
                    options: ['Picks the top k layers', 'Restricts sampling to only the k most probable tokens', 'Uses k attention heads', 'Generates k sequences'],
                    correct: 1,
                    explanation: 'Top-k sampling filters the vocabulary to only the k most probable tokens before sampling, preventing unlikely tokens from being selected.'
                }
            ]
        });
    },

    // ============================================
    // 9.5: Vision Transformers (ViT)
    // ============================================
    loadChapter9_5() {
        const container = document.getElementById('chapter-9-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 9 &bull; Chapter 9.5</span>
                <h1>Vision Transformers (ViT)</h1>
                <p>In Module 6, we learned how CNNs process images with convolutional filters. Vision Transformers take a radically different approach: treat the image as a sequence of patches and process them with a standard Transformer.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDDBC\uFE0F</span> Image to Patches</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>An image is divided into fixed-size patches, each becoming a "token" for the Transformer:</p>
                <div class="network-viz">
                    <canvas id="patchCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls" style="margin-top:12px;">
                    <div class="control-group">
                        <label>Patch Size: <strong id="patchSizeLabel">2x2</strong></label>
                        <input type="range" id="patchSizeSlider" min="1" max="4" value="2" oninput="Chapter9.updatePatchSize()">
                    </div>
                </div>
                <div class="gd-stats">
                    <div class="gd-stat"><div class="stat-label">Image Size</div><div class="stat-value">8x8</div></div>
                    <div class="gd-stat"><div class="stat-label">Patch Size</div><div class="stat-value" id="vitPatchSizeVal">2x2</div></div>
                    <div class="gd-stat"><div class="stat-label">Num Patches</div><div class="stat-value" id="vitNumPatches">16</div></div>
                    <div class="gd-stat"><div class="stat-label">Sequence Length</div><div class="stat-value" id="vitSeqLen">17</div></div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD17</span> Patch Embedding Pipeline</h2>
                <p>Each patch goes through a pipeline before entering the Transformer encoder:</p>
                <div class="pipeline-stages">
                    <div class="pipeline-stage active">Image Patches</div>
                    <span style="color:var(--text-muted);">\u2192</span>
                    <div class="pipeline-stage">Flatten</div>
                    <span style="color:var(--text-muted);">\u2192</span>
                    <div class="pipeline-stage">Linear Projection</div>
                    <span style="color:var(--text-muted);">\u2192</span>
                    <div class="pipeline-stage">+ Position Embed</div>
                    <span style="color:var(--text-muted);">\u2192</span>
                    <div class="pipeline-stage">Prepend [CLS]</div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\uD83C\uDF1F</span>
                    <span class="info-box-text">The <strong>[CLS] token</strong> aggregates information from all patches through self-attention. After transformer layers, its output is used for classification -- similar to how BERT uses [CLS] for text classification.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2696\uFE0F</span> CNN vs ViT</h2>
                <table class="compare-table" style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th style="text-align:left;padding:12px;border-bottom:2px solid var(--border);color:var(--text-secondary);">Property</th>
                            <th style="text-align:center;padding:12px;border-bottom:2px solid var(--border);color:#6366f1;">CNN</th>
                            <th style="text-align:center;padding:12px;border-bottom:2px solid var(--border);color:#10b981;">ViT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding:10px;border-bottom:1px solid var(--border);">Inductive Bias</td><td style="text-align:center;padding:10px;border-bottom:1px solid var(--border);">Strong (locality, translation invariance)</td><td style="text-align:center;padding:10px;border-bottom:1px solid var(--border);">Weak (learns from data)</td></tr>
                        <tr><td style="padding:10px;border-bottom:1px solid var(--border);">Data Requirement</td><td style="text-align:center;padding:10px;border-bottom:1px solid var(--border);">Works well with limited data</td><td style="text-align:center;padding:10px;border-bottom:1px solid var(--border);">Needs large datasets or pre-training</td></tr>
                        <tr><td style="padding:10px;border-bottom:1px solid var(--border);">Receptive Field</td><td style="text-align:center;padding:10px;border-bottom:1px solid var(--border);">Gradually expands with depth</td><td style="text-align:center;padding:10px;border-bottom:1px solid var(--border);">Global from layer 1</td></tr>
                        <tr><td style="padding:10px;border-bottom:1px solid var(--border);">Scalability</td><td style="text-align:center;padding:10px;border-bottom:1px solid var(--border);">Diminishing returns at scale</td><td style="text-align:center;padding:10px;border-bottom:1px solid var(--border);">Scales well with data & compute</td></tr>
                        <tr><td style="padding:10px;">Computation</td><td style="text-align:center;padding:10px;">O(K&sup2; &times; C &times; H &times; W)</td><td style="text-align:center;padding:10px;">O(N&sup2; &times; D) where N = patches</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Patch Size vs Computation</h2>
                <span class="tag tag-interactive">Interactive</span>
                <div class="network-viz">
                    <canvas id="computeCanvas" width="750" height="280"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Code Example</h2>
                <div class="code-block">
<span class="keyword">from</span> transformers <span class="keyword">import</span> ViTForImageClassification, ViTFeatureExtractor
<span class="keyword">from</span> PIL <span class="keyword">import</span> Image

extractor = ViTFeatureExtractor.<span class="function">from_pretrained</span>(
    <span class="string">'google/vit-base-patch16-224'</span>
)
model = ViTForImageClassification.<span class="function">from_pretrained</span>(
    <span class="string">'google/vit-base-patch16-224'</span>
)

image = Image.<span class="function">open</span>(<span class="string">'cat.jpg'</span>)
inputs = <span class="function">extractor</span>(images=image, return_tensors=<span class="string">'pt'</span>)
outputs = <span class="function">model</span>(**inputs)

predicted_class = outputs.logits.<span class="function">argmax</span>(-<span class="number">1</span>).<span class="function">item</span>()
<span class="function">print</span>(model.config.id2label[predicted_class])
<span class="comment"># 'tabby cat'</span>
                </div>
            </div>

            <!-- Module 9 Complete -->
            <div class="section">
                <div class="info-box success" style="text-align:center;">
                    <span class="info-box-icon">\uD83D\uDE80</span>
                    <span class="info-box-text">
                        <strong>Module 9 Complete!</strong> You now understand Transformers inside and out.
                        Ready for the next adventure? Continue to Module 10 to learn about
                        Large Language Models, GPT, and the cutting-edge techniques powering modern AI!
                    </span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Final Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter9.startQuiz9_5()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('9-4')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('10-1')">Next: GPT Revolution \u2192</button>
            </div>
        `;

        this.drawPatchViz();
        this.drawComputeChart();
    },

    drawPatchViz() {
        const canvas = document.getElementById('patchCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const imgSize = 8;
        const patchSize = this.vitPatchSize;
        const numPatches = (imgSize / patchSize) * (imgSize / patchSize);
        const seqLen = numPatches + 1;

        // Generate colorful image
        const cellSize = 36;
        const imgX = 40;
        const imgY = (H - imgSize * cellSize) / 2;
        const patchColors = [];
        const palette = ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899',
                        '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#e879f9', '#fb923c', '#38bdf8', '#a3e635'];

        for (let r = 0; r < imgSize; r++) {
            for (let c = 0; c < imgSize; c++) {
                const patchR = Math.floor(r / patchSize);
                const patchC = Math.floor(c / patchSize);
                const patchIdx = patchR * (imgSize / patchSize) + patchC;
                const color = palette[patchIdx % palette.length];
                patchColors[patchIdx] = color;

                // Vary brightness per pixel within patch
                const brightness = 0.7 + Math.random() * 0.3;
                ctx.fillStyle = color;
                ctx.globalAlpha = brightness;
                ctx.fillRect(imgX + c * cellSize, imgY + r * cellSize, cellSize - 1, cellSize - 1);
                ctx.globalAlpha = 1;
            }
        }

        // Grid overlay showing patches
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        for (let r = 0; r <= imgSize / patchSize; r++) {
            ctx.beginPath();
            ctx.moveTo(imgX, imgY + r * patchSize * cellSize);
            ctx.lineTo(imgX + imgSize * cellSize, imgY + r * patchSize * cellSize);
            ctx.stroke();
        }
        for (let c = 0; c <= imgSize / patchSize; c++) {
            ctx.beginPath();
            ctx.moveTo(imgX + c * patchSize * cellSize, imgY);
            ctx.lineTo(imgX + c * patchSize * cellSize, imgY + imgSize * cellSize);
            ctx.stroke();
        }

        // Label
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${imgSize}x${imgSize} Image`, imgX + (imgSize * cellSize) / 2, imgY - 12);

        // Arrow
        const arrowX = imgX + imgSize * cellSize + 30;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '24px Inter';
        ctx.fillText('\u2192', arrowX, H / 2 + 8);

        // Patch sequence on the right
        const seqX = arrowX + 50;
        const patchW = Math.min(32, (W - seqX - 20) / seqLen);
        const seqY = H / 2 - 20;

        // CLS token
        ctx.fillStyle = '#f59e0b';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(seqX, seqY, patchW - 2, 40);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(seqX, seqY, patchW - 2, 40);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 8px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('[CLS]', seqX + patchW / 2 - 1, seqY + 24);

        // Patches
        for (let i = 0; i < numPatches; i++) {
            const px = seqX + (i + 1) * patchW;
            const color = patchColors[i] || palette[i % palette.length];
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(px, seqY, patchW - 2, 40);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.strokeRect(px, seqY, patchW - 2, 40);
            ctx.fillStyle = '#e8eaf0';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`P${i + 1}`, px + patchW / 2 - 1, seqY + 24);
        }

        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`Sequence (${seqLen} tokens)`, seqX + (seqLen * patchW) / 2, seqY - 12);

        // Update stats
        const sizes = [1, 2, 4, 8];
        const ps = sizes[patchSize - 1] || patchSize;
        document.getElementById('patchSizeLabel').textContent = `${ps}x${ps}`;
        document.getElementById('vitPatchSizeVal').textContent = `${ps}x${ps}`;
        document.getElementById('vitNumPatches').textContent = numPatches;
        document.getElementById('vitSeqLen').textContent = seqLen;
    },

    updatePatchSize() {
        const val = parseInt(document.getElementById('patchSizeSlider')?.value || 2);
        this.vitPatchSize = val;
        this.drawPatchViz();
        this.drawComputeChart();
    },

    drawComputeChart() {
        const canvas = document.getElementById('computeCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const pad = { top: 40, right: 30, bottom: 60, left: 60 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        const configs = [
            { patch: 1, patches: 64, flops: 64 * 64 },
            { patch: 2, patches: 16, flops: 16 * 16 },
            { patch: 4, patches: 4, flops: 4 * 4 },
            { patch: 8, patches: 1, flops: 1 * 1 },
        ];
        const maxFlops = configs[0].flops;
        const barW = plotW / configs.length - 20;
        const barColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (plotH / 4) * i;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }

        // Bars
        configs.forEach((c, i) => {
            const x = pad.left + i * (barW + 20) + 10;
            const barH = (c.flops / maxFlops) * plotH;
            const y = pad.top + plotH - barH;

            const grad = ctx.createLinearGradient(x, y, x, pad.top + plotH);
            grad.addColorStop(0, barColors[i]);
            grad.addColorStop(1, barColors[i] + '33');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
            ctx.fill();

            // Labels
            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${c.patches} patches`, x + barW / 2, y - 18);
            ctx.fillStyle = '#8b949e';
            ctx.font = '10px Inter';
            ctx.fillText(`N\u00B2=${c.flops}`, x + barW / 2, y - 6);

            ctx.fillStyle = '#e8eaf0';
            ctx.font = '12px Inter';
            ctx.fillText(`${c.patch}x${c.patch}`, x + barW / 2, pad.top + plotH + 20);
        });

        // Axis labels
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Patch Size', W / 2, H - 10);

        ctx.save();
        ctx.translate(15, pad.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Self-Attention FLOPs (N\u00B2)', 0, 0);
        ctx.restore();

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Smaller patches = more tokens = much more computation', W / 2, 20);
    },

    startQuiz9_5() {
        Quiz.start({
            title: 'Chapter 9.5: Vision Transformers',
            chapterId: '9-5',
            questions: [
                {
                    question: 'How does ViT process an image?',
                    options: ['Using convolutional filters', 'By dividing the image into patches and treating them as tokens', 'By processing pixel by pixel', 'Using pooling layers'],
                    correct: 1,
                    explanation: 'ViT splits the image into fixed-size patches, linearly embeds each patch, and feeds them as a sequence to a standard Transformer encoder.'
                },
                {
                    question: 'What is the [CLS] token used for in ViT?',
                    options: ['Classifying each patch', 'Aggregating global image information for classification', 'Marking the end of the sequence', 'Encoding position information'],
                    correct: 1,
                    explanation: 'The [CLS] token attends to all patches through self-attention and its final representation is used for image classification.'
                },
                {
                    question: 'How does self-attention computation scale with the number of patches?',
                    options: ['Linearly O(N)', 'Quadratically O(N\u00B2)', 'Logarithmically O(log N)', 'Constant O(1)'],
                    correct: 1,
                    explanation: 'Self-attention requires computing attention between all pairs of patches, resulting in O(N\u00B2) complexity where N is the number of patches.'
                },
                {
                    question: 'Compared to CNNs, what disadvantage do ViTs have?',
                    options: ['Cannot process images', 'Need more training data due to weaker inductive biases', 'Are always slower', 'Cannot do classification'],
                    correct: 1,
                    explanation: 'ViTs lack the inductive biases of CNNs (locality, translation equivariance), so they need larger datasets or pre-training to match CNN performance.'
                },
                {
                    question: 'What happens when you decrease the patch size in ViT?',
                    options: ['Fewer patches, less computation', 'More patches, quadratically more computation', 'No change in computation', 'The model gets smaller'],
                    correct: 1,
                    explanation: 'Smaller patches create more tokens (N), and since self-attention is O(N\u00B2), computation increases quadratically.'
                }
            ]
        });
    }
};
