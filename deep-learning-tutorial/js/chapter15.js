/* ============================================
   Chapter 15: Production LLM Systems
   PART 1: Chapters 15.1, 15.2
   ============================================ */

const Chapter15 = {
    // State for 15.1 Quantization
    quantAnimFrame: null,
    quantBits: 16,
    quantAnimStep: 0,
    quantAnimating: false,

    // State for 15.2 Distributed Training
    parallelAnimFrame: null,
    parallelMode: 'data',
    parallelAnimStep: 0,
    parallelAnimating: false,
    parallelGPUs: [{}, {}, {}, {}],

    // State for 15.3 Inference
    servingAnimFrame: null,
    servingMode: 'static',
    servingRequests: [],
    servingAnimating: false,
    servingStep: 0,

    // State for 15.4 External Memory
    memoryAnimFrame: null,
    memoryQueryStep: 0,
    memoryAnimating: false,
    memoryType: 'vector',

    // State for 15.5 Future
    futureAnimFrame: null,
    futureAnimStep: 0,
    futureTopics: [],
    futureHover: -1,
    certificationStorageKey: 'dl-final-certification',
    finalQuizPassPercent: 80,

    init() {
        App.registerChapter('15-1', () => this.loadChapter15_1());
        App.registerChapter('15-2', () => this.loadChapter15_2());
        App.registerChapter('15-3', () => this.loadChapter15_3());
        App.registerChapter('15-4', () => this.loadChapter15_4());
        App.registerChapter('15-5', () => this.loadChapter15_5());
    },

    // ============================================
    // Utility: drawRoundedRect
    // ============================================
    drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },

    formatMemory(bytes) {
        if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return bytes + ' B';
    },

    // ============================================
    // 15.1: Quantization Deep Dive (GPTQ/AWQ/GGUF)
    // ============================================
    loadChapter15_1() {
        const container = document.getElementById('chapter-15-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 15 &bull; Chapter 15.1</span>
                <h1>Quantization Deep Dive (GPTQ / AWQ / GGUF)</h1>
                <p class="chapter-subtitle">Shrinking AI Brains Without Losing Smarts - Like JPEG Compression for Neural Networks!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4F7}</span> What Is Quantization?</h2>
                <p>Imagine you have a <strong>super high-resolution photo</strong> of your cat. It looks AMAZING - every single whisker is crystal clear. But the file is <strong>50 megabytes</strong>! Way too big to text to your friend.</p>
                <p>So you save it as a <strong>JPEG</strong>. Now it is only 2 megabytes, and it still looks great! You lost a tiny bit of detail, but you saved <strong>96% of the space</strong>. Quantization does the EXACT same thing for AI models!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Big Idea:</strong> A model normally stores its weights as FP16 (16-bit floating point) numbers. Quantization shrinks these down to INT8 (8-bit), INT4 (4-bit), or even INT2 (2-bit). Each weight takes less space, so the whole model gets smaller - like compressing a photo!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F522}</span> Bits: The Building Blocks of Numbers</h2>
                <p>Think of <strong>bits</strong> like colored crayons. More crayons = more colors you can draw with:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F3A8}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">FP16 (16-bit)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like having <strong>65,536 crayons</strong>. You can draw incredibly detailed pictures! This is what most models use normally.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F58D}\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">INT8 (8-bit)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like having <strong>256 crayons</strong>. Still pretty good! Most people can barely tell the difference. Uses half the memory.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{270F}\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">INT4 (4-bit)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like having only <strong>16 crayons</strong>. A little blocky, but you save 75% of space! Great for running big models on small GPUs.</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Real-world impact:</strong> A 70 billion parameter model in FP16 needs ~140 GB of memory (multiple expensive GPUs!). In INT4, it shrinks to ~35 GB and fits on a single GPU! DeepSeek even ran a 120B model on a single T4 (16 GB) with aggressive quantization.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F527}</span> The Three Quantization Methods</h2>
                <p>There are three popular ways to shrink a model. Think of them like three different strategies for packing a suitcase:</p>
                <div style="display:grid;grid-template-columns:1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                            <div style="font-size:24px;">\u{1F9F3}</div>
                            <div style="font-weight:600;color:#6366f1;font-size:16px;">GPTQ (GPU Quantization)</div>
                        </div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            Like packing your suitcase <strong>one drawer at a time</strong>. GPTQ goes through the model layer by layer, shrinking each one. If shrinking a layer causes errors, it adjusts the next layer to compensate. Imagine folding a shirt badly - you rearrange the next shirt to make up for it!
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                            <div style="font-size:24px;">\u{1F48E}</div>
                            <div style="font-weight:600;color:#a855f7;font-size:16px;">AWQ (Activation-Aware Quantization)</div>
                        </div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            Like knowing which items in your suitcase are <strong>fragile vs sturdy</strong>. AWQ figures out which weights are super important (the "fragile" ones) and protects them with higher precision. The less important weights get squished more aggressively. Smart packing!
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                            <div style="font-size:24px;">\u{1F4BB}</div>
                            <div style="font-weight:600;color:#22c55e;font-size:16px;">GGUF (CPU-Friendly Format)</div>
                        </div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            GGUF is a special file format used by <strong>llama.cpp</strong> to run models on your CPU - no fancy GPU needed! It is like converting a Blu-ray movie to a format that plays on your phone. You can run AI models on your laptop, even without a graphics card!
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Quantization Explorer</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Use the slider to change bit precision and watch what happens to model size, memory, and quality. See how the smooth weight distribution becomes "staircase-ified" at lower bits!</p>
                <div class="controls" style="margin-bottom:12px;">
                    <label style="font-weight:600;color:var(--text-primary);">Bit Precision: <span id="quantBitsVal">16</span>-bit</label>
                    <input type="range" min="0" max="4" value="3" step="1" style="width:100%;margin-top:8px;"
                        oninput="Chapter15.updateQuantBits(parseInt(this.value))">
                    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);margin-top:4px;">
                        <span>2-bit</span><span>4-bit</span><span>8-bit</span><span>16-bit</span><span>32-bit</span>
                    </div>
                </div>
                <div class="network-viz">
                    <canvas id="quantCanvas" width="800" height="400"></canvas>
                </div>
                <div id="quantInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Left: Weight distribution (smooth curve vs quantized steps). Right: Model size, GPU memory, and quality comparison.
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> Quantization in Code</h2>
                <p>Here is how you quantize a model in practice - it is surprisingly easy!</p>
                <div class="code-block"><pre>
<span class="comment"># GPTQ quantization with AutoGPTQ</span>
<span class="keyword">from</span> auto_gptq <span class="keyword">import</span> AutoGPTQForCausalLM

<span class="comment"># Load the full FP16 model (~140 GB for 70B params)</span>
model = AutoGPTQForCausalLM.from_pretrained(<span class="string">"meta-llama/Llama-3-70B"</span>)

<span class="comment"># Quantize to 4-bit (~35 GB - fits on one GPU!)</span>
model.quantize(bits=<span class="number">4</span>, dataset=calibration_data)
model.save_quantized(<span class="string">"Llama-3-70B-GPTQ-4bit"</span>)

<span class="comment"># AWQ quantization - protects important weights</span>
<span class="keyword">from</span> awq <span class="keyword">import</span> AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_pretrained(<span class="string">"meta-llama/Llama-3-70B"</span>)
model.quantize(quant_config={<span class="string">"w_bit"</span>: <span class="number">4</span>, <span class="string">"version"</span>: <span class="string">"gemm"</span>})

<span class="comment"># GGUF - convert for CPU inference with llama.cpp</span>
<span class="comment"># python convert.py model/ --outtype q4_0</span>
<span class="comment"># ./main -m model.Q4_0.gguf -p "Hello!"</span>
                </pre></div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Calibration data:</strong> GPTQ and AWQ need a small sample of real text (calibration data) to figure out the best way to quantize. It is like testing a compression algorithm on a few photos before compressing your whole album!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AF}</span> When to Use Each Method</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;">\u{1F680}</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Use GPTQ when...</div>
                        <div style="font-size:12px;color:var(--text-secondary);">You have a GPU and want fast inference. Great for serving models to many users. Most popular for production GPU deployment.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;">\u{1F9E0}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">Use AWQ when...</div>
                        <div style="font-size:12px;color:var(--text-secondary);">You need the best quality at low bits. AWQ often beats GPTQ at 4-bit because it protects important weights. Best quality-to-size ratio.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;">\u{1F4BB}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Use GGUF when...</div>
                        <div style="font-size:12px;color:var(--text-secondary);">You want to run models on your laptop CPU! No GPU needed. Perfect for local AI, privacy, and offline use with llama.cpp.</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Quantization is like JPEG for AI</strong> - it shrinks model weights from 16-bit to 8-bit, 4-bit, or even 2-bit, saving huge amounts of memory with only a small quality drop.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>GPTQ quantizes layer by layer</strong> and compensates for errors. AWQ protects important weights and compresses the rest more aggressively.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>GGUF lets you run models on CPU</strong> using llama.cpp - no expensive GPU needed! Perfect for local, private AI on your own laptop.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>A 70B model drops from 140 GB to 35 GB</strong> with 4-bit quantization - fitting on a single GPU instead of needing many!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter15.startQuiz15_1()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('14-5')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('15-2')">Next: Distributed Training \u2192</button>
            </div>
        `;

        this.initQuantCanvas();
    },

    // --- 15.1 Canvas & Interaction Methods ---

    quantBitOptions: [2, 4, 8, 16, 32],

    updateQuantBits(sliderVal) {
        this.quantBits = this.quantBitOptions[sliderVal];
        const label = document.getElementById('quantBitsVal');
        if (label) label.textContent = this.quantBits;
        this.drawQuantCanvas();
    },

    initQuantCanvas() {
        this.quantBits = 16;
        this.quantAnimStep = 0;
        this.quantAnimating = false;
        if (this.quantAnimFrame) cancelAnimationFrame(this.quantAnimFrame);
        const label = document.getElementById('quantBitsVal');
        if (label) label.textContent = 16;
        this.drawQuantCanvas();
    },

    drawQuantCanvas() {
        const canvas = document.getElementById('quantCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const bits = this.quantBits;
        const time = Date.now() / 1000;

        // === LEFT SIDE: Weight Distribution ===
        const leftX = 30;
        const leftW = 350;
        const graphY = 60;
        const graphH = 260;

        // Title
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Weight Distribution (' + bits + '-bit)', leftX + leftW / 2, 30);

        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX, graphY + graphH);
        ctx.lineTo(leftX + leftW, graphY + graphH);
        ctx.moveTo(leftX, graphY);
        ctx.lineTo(leftX, graphY + graphH);
        ctx.stroke();

        // Axis labels
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('-3.0', leftX + 20, graphY + graphH + 14);
        ctx.fillText('0', leftX + leftW / 2, graphY + graphH + 14);
        ctx.fillText('+3.0', leftX + leftW - 20, graphY + graphH + 14);
        ctx.textAlign = 'left';
        ctx.fillText('Frequency', leftX + 4, graphY - 4);

        // Draw the smooth bell curve (original FP16)
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        for (let i = 0; i <= leftW; i++) {
            const xNorm = (i / leftW) * 6 - 3; // -3 to +3
            const gaussian = Math.exp(-0.5 * xNorm * xNorm) / Math.sqrt(2 * Math.PI);
            const py = graphY + graphH - (gaussian * graphH * 2.2);
            if (i === 0) ctx.moveTo(leftX + i, py);
            else ctx.lineTo(leftX + i, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw quantized version (staircase)
        const numLevels = Math.pow(2, Math.min(bits, 8)); // cap visual at 256 levels
        const displayLevels = Math.min(numLevels, 128);
        const stepWidth = leftW / displayLevels;

        if (bits <= 16) {
            // Draw quantized staircase bars
            for (let i = 0; i < displayLevels; i++) {
                const xStart = leftX + (i / displayLevels) * leftW;
                const xMid = leftX + ((i + 0.5) / displayLevels) * leftW;
                const xNorm = ((i + 0.5) / displayLevels) * 6 - 3;
                const gaussian = Math.exp(-0.5 * xNorm * xNorm) / Math.sqrt(2 * Math.PI);
                const barH = gaussian * graphH * 2.2;
                const barW = Math.max(1, leftW / displayLevels - 1);

                const hue = bits <= 4 ? 142 : (bits <= 8 ? 45 : 230);
                const alpha = 0.5 + Math.sin(time * 2 + i * 0.3) * 0.1;

                if (bits <= 4) {
                    ctx.fillStyle = 'rgba(34, 197, 94, ' + alpha + ')';
                } else if (bits <= 8) {
                    ctx.fillStyle = 'rgba(245, 158, 11, ' + alpha + ')';
                } else {
                    ctx.fillStyle = 'rgba(99, 102, 241, ' + alpha + ')';
                }

                ctx.fillRect(xStart, graphY + graphH - barH, barW, barH);
            }

            // Draw staircase outline
            ctx.strokeStyle = bits <= 4 ? '#22c55e' : (bits <= 8 ? '#f59e0b' : '#6366f1');
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < displayLevels; i++) {
                const xStart = leftX + (i / displayLevels) * leftW;
                const xEnd = leftX + ((i + 1) / displayLevels) * leftW;
                const xNorm = ((i + 0.5) / displayLevels) * 6 - 3;
                const gaussian = Math.exp(-0.5 * xNorm * xNorm) / Math.sqrt(2 * Math.PI);
                const barH = gaussian * graphH * 2.2;
                const py = graphY + graphH - barH;

                if (i === 0) ctx.moveTo(xStart, py);
                else ctx.lineTo(xStart, py);
                ctx.lineTo(xEnd, py);
            }
            ctx.stroke();
        } else {
            // 32-bit: draw smooth filled curve
            ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.beginPath();
            ctx.moveTo(leftX, graphY + graphH);
            for (let i = 0; i <= leftW; i++) {
                const xNorm = (i / leftW) * 6 - 3;
                const gaussian = Math.exp(-0.5 * xNorm * xNorm) / Math.sqrt(2 * Math.PI);
                const py = graphY + graphH - (gaussian * graphH * 2.2);
                ctx.lineTo(leftX + i, py);
            }
            ctx.lineTo(leftX + leftW, graphY + graphH);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i <= leftW; i++) {
                const xNorm = (i / leftW) * 6 - 3;
                const gaussian = Math.exp(-0.5 * xNorm * xNorm) / Math.sqrt(2 * Math.PI);
                const py = graphY + graphH - (gaussian * graphH * 2.2);
                if (i === 0) ctx.moveTo(leftX + i, py);
                else ctx.lineTo(leftX + i, py);
            }
            ctx.stroke();
        }

        // Number of distinct values label
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('Distinct values: ' + (bits >= 16 ? numLevels.toLocaleString() : numLevels), leftX + leftW / 2, graphY + graphH + 30);

        // === RIGHT SIDE: Comparison Bars ===
        const rightX = 430;
        const rightW = 340;
        const barStartY = 50;

        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Impact of ' + bits + '-bit Quantization', rightX + rightW / 2, 30);

        // Model Size bar
        const modelSizes = { 2: 17.5, 4: 35, 8: 70, 16: 140, 32: 280 };
        const modelSize = modelSizes[bits] || 140;
        const maxModelSize = 280;
        const modelBarFrac = modelSize / maxModelSize;

        this.drawComparisonBar(ctx, rightX, barStartY, rightW, 'Model Size', modelSize + ' GB', modelBarFrac,
            modelSize <= 40 ? '#22c55e' : (modelSize <= 80 ? '#f59e0b' : '#ef4444'), time);

        // GPU Memory bar
        const gpuMemory = modelSize * 1.2; // rough estimate including overhead
        const maxGPU = 340;
        const gpuBarFrac = gpuMemory / maxGPU;

        this.drawComparisonBar(ctx, rightX, barStartY + 70, rightW, 'GPU Memory Needed', gpuMemory.toFixed(0) + ' GB', gpuBarFrac,
            gpuMemory <= 24 ? '#22c55e' : (gpuMemory <= 48 ? '#f59e0b' : '#ef4444'), time);

        // Quality bar
        const qualities = { 2: 72, 4: 92, 8: 97, 16: 99.5, 32: 100 };
        const quality = qualities[bits] || 99.5;
        const qualBarFrac = quality / 100;

        this.drawComparisonBar(ctx, rightX, barStartY + 140, rightW, 'Quality Score', quality + '%', qualBarFrac,
            quality >= 95 ? '#22c55e' : (quality >= 85 ? '#f59e0b' : '#ef4444'), time);

        // GPU Fit Indicators
        const gpuY = barStartY + 220;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('Fits on GPU?', rightX, gpuY);

        const gpuSizes = [
            { name: '16 GB (T4)', mem: 16 },
            { name: '24 GB (4090)', mem: 24 },
            { name: '80 GB (A100)', mem: 80 }
        ];

        gpuSizes.forEach((gpu, i) => {
            const gx = rightX + i * 115;
            const gy = gpuY + 20;
            const fits = gpuMemory <= gpu.mem;

            this.drawRoundedRect(ctx, gx, gy, 105, 45, 8);
            ctx.fillStyle = fits ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            ctx.fill();
            ctx.strokeStyle = fits ? '#22c55e' : '#ef4444';
            ctx.lineWidth = 1.5;
            this.drawRoundedRect(ctx, gx, gy, 105, 45, 8);
            ctx.stroke();

            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.fillStyle = fits ? '#22c55e' : '#ef4444';
            ctx.textAlign = 'center';
            ctx.fillText(fits ? '\u2713' : '\u2717', gx + 52, gy + 20);

            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(gpu.name, gx + 52, gy + 36);
        });

        // Method label at bottom
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        const methodNote = bits <= 4 ? 'Best methods: AWQ, GPTQ, GGUF (Q4)' :
                           bits <= 8 ? 'Best methods: GPTQ, AWQ, GGUF (Q8)' :
                           bits <= 16 ? 'Standard FP16 - no quantization needed' :
                           'FP32 - full precision (training only)';
        ctx.fillText(methodNote, rightX + rightW / 2, barStartY + 300);

        // Animation loop
        if (this.quantAnimFrame) cancelAnimationFrame(this.quantAnimFrame);
        this.quantAnimFrame = requestAnimationFrame(() => this.drawQuantCanvas());
    },

    drawComparisonBar(ctx, x, y, w, label, valueText, fraction, color, time) {
        const barH = 22;
        const barMaxW = w - 20;
        const barW = Math.max(4, fraction * barMaxW);

        // Label
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(label, x, y);

        // Bar background
        ctx.fillStyle = '#1e293b';
        this.drawRoundedRect(ctx, x, y + 8, barMaxW, barH, 4);
        ctx.fill();

        // Bar fill
        const pulse = Math.sin(time * 2) * 0.05 + 0.95;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7 * pulse;
        this.drawRoundedRect(ctx, x, y + 8, barW, barH, 4);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Value text
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'right';
        ctx.fillText(valueText, x + barMaxW, y);
    },

    startQuiz15_1() {
        Quiz.start({
            title: 'Quantization Deep Dive Quiz',
            chapterId: '15-1',
            questions: [
                {
                    question: 'What is quantization in the context of AI models?',
                    options: [
                        'Making the model learn new languages',
                        'Reducing the number of bits used to store each weight',
                        'Adding more layers to the model',
                        'Making the model run on the internet'
                    ],
                    correct: 1,
                    explanation: 'Quantization reduces the number of bits used to store each weight. For example, going from 16-bit to 4-bit numbers. It is like JPEG compression for AI - smaller file size with a small quality trade-off!'
                },
                {
                    question: 'A 70B parameter model in FP16 needs ~140 GB. How much does it need in INT4?',
                    options: [
                        'About 280 GB',
                        'About 140 GB (no change)',
                        'About 70 GB',
                        'About 35 GB'
                    ],
                    correct: 3,
                    explanation: 'INT4 uses 4 bits per weight instead of 16. That is 4x smaller! So 140 GB / 4 = ~35 GB. It can fit on a single GPU instead of needing many!'
                },
                {
                    question: 'What makes AWQ different from GPTQ?',
                    options: [
                        'AWQ is slower and less accurate',
                        'AWQ protects important weights while compressing others more aggressively',
                        'AWQ only works on CPUs',
                        'AWQ does not use calibration data'
                    ],
                    correct: 1,
                    explanation: 'AWQ (Activation-Aware Quantization) figures out which weights are most important and protects them with higher precision. The less important weights get compressed more. This often gives better quality than GPTQ at the same bit level!'
                },
                {
                    question: 'What is GGUF used for?',
                    options: [
                        'Training models faster on GPUs',
                        'A format for running models on CPU with llama.cpp',
                        'A way to make models bigger',
                        'Encrypting model weights for security'
                    ],
                    correct: 1,
                    explanation: 'GGUF is a file format designed for running quantized models on your CPU using llama.cpp. No fancy GPU needed! It lets you run AI models locally on your laptop.'
                },
                {
                    question: 'As you reduce from 16-bit to 4-bit quantization, what happens?',
                    options: [
                        'Model gets bigger and slower',
                        'Quality improves dramatically',
                        'Model gets much smaller with a small quality drop',
                        'The model stops working completely'
                    ],
                    correct: 2,
                    explanation: 'Going from 16-bit to 4-bit makes the model 4x smaller. Quality drops a little bit (like going from 99.5% to about 92%), but the model still works great! It is a fantastic trade-off for fitting big models on smaller hardware.'
                }
            ]
        });
    },

    // ============================================
    // 15.2: Distributed Training (Parallelism/ZeRO)
    // ============================================
    loadChapter15_2() {
        const container = document.getElementById('chapter-15-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 15 &bull; Chapter 15.2</span>
                <h1>Distributed Training: Parallelism & ZeRO</h1>
                <p class="chapter-subtitle">Building a Skyscraper with Multiple Construction Crews!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3D7}\uFE0F</span> Why One GPU Is Not Enough</h2>
                <p>Imagine trying to build a <strong>100-story skyscraper</strong> with just ONE construction crew. It would take <strong>forever</strong>! But what if you had FOUR crews working together? You could finish way faster!</p>
                <p>Training giant AI models like GPT-4 or DeepSeek has the same problem. One GPU simply does not have enough memory or speed. A 175 billion parameter model needs about <strong>3 terabytes of memory</strong> during training! No single GPU has that much. So we need to <strong>split the work</strong> across many GPUs.</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Big Idea:</strong> Distributed training splits the work of training a model across multiple GPUs. There are different strategies for splitting - just like there are different ways to organize construction crews!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4DA}</span> Four Ways to Split the Work</h2>
                <p>There are four main strategies. Think of them like four ways to organize students working on a big group project:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4E6}</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Data Parallelism</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Each GPU gets a <strong>full copy of the model</strong> but trains on <strong>different data</strong>. Like 4 students each reading different chapters of a textbook, then sharing their notes at the end!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1FA93}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">Tensor Parallelism</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Split each <strong>layer across GPUs</strong>. Like 4 people each doing a PART of the same math problem. Each one handles a chunk of the matrix multiplication!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F3ED}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Pipeline Parallelism</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Each GPU handles <strong>different layers</strong>. Like an assembly line: GPU 1 does layers 1-10, GPU 2 does layers 11-20, and so on. Data flows through like items on a conveyor belt!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4BE}</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">ZeRO (Zero Redundancy)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Split the <strong>optimizer states, gradients, and parameters</strong> across GPUs. Instead of everyone having full copies, each GPU keeps only its section. Saves TONS of memory!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: GPU Parallelism Visualizer</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Switch between parallelism modes to see how 4 GPUs split the work differently. Watch the data flow between them!</p>
                <div class="controls" style="margin-bottom:12px;">
                    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-primary btn-small" onclick="Chapter15.setParallelMode('data')">Data Parallel</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.setParallelMode('tensor')">Tensor Parallel</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.setParallelMode('pipeline')">Pipeline Parallel</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.setParallelMode('zero')">ZeRO</button>
                    </div>
                </div>
                <div class="network-viz">
                    <canvas id="parallelCanvas" width="800" height="400"></canvas>
                </div>
                <div id="parallelInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Click the buttons above to switch between parallelism strategies. Each mode shows different data distribution across 4 GPUs.
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4E6}</span> Data Parallelism: Everyone Gets a Copy</h2>
                <p>This is the simplest strategy. Each GPU gets the <strong>entire model</strong> and trains on a <strong>different batch of data</strong>:</p>
                <div class="code-block"><pre>
<span class="comment"># Data Parallelism with PyTorch</span>
<span class="keyword">import</span> torch
<span class="keyword">from</span> torch.nn.parallel <span class="keyword">import</span> DistributedDataParallel

<span class="comment"># Each GPU gets a full copy of the model</span>
model = MyLargeModel().to(device)
model = DistributedDataParallel(model)

<span class="comment"># Each GPU trains on DIFFERENT data</span>
<span class="keyword">for</span> batch <span class="keyword">in</span> data_loader:
    loss = model(batch)       <span class="comment"># Forward pass on this GPU's data</span>
    loss.backward()           <span class="comment"># Compute gradients</span>
    all_reduce(gradients)     <span class="comment"># Share & average gradients across GPUs</span>
    optimizer.step()          <span class="comment"># Update weights (same on all GPUs)</span>
                </pre></div>
                <div class="info-box warning">
                    <span class="info-box-icon">\u{26A0}\uFE0F</span>
                    <span class="info-box-text"><strong>Limitation:</strong> Every GPU needs enough memory to hold the full model + optimizer states + gradients. For a 175B model, that is about 3 TB per GPU! That is way too much. Data parallelism alone is not enough for the biggest models.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BE}</span> ZeRO: The Memory-Saving Superpower</h2>
                <p>ZeRO (Zero Redundancy Optimizer) is like a brilliant filing system. Instead of everyone keeping a complete copy of everything, each GPU only keeps its own section:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">1\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">ZeRO Stage 1</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Split <strong>optimizer states</strong> across GPUs. Each GPU only keeps 1/N of the Adam states (momentum, variance). Saves ~4x memory!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">2\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">ZeRO Stage 2</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Also split <strong>gradients</strong>. Each GPU only stores gradients for its portion of weights. Saves ~8x memory!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">3\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">ZeRO Stage 3</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Split <strong>everything</strong> - parameters too! Each GPU only stores 1/N of ALL model state. Maximum savings! Can train models that would not fit on any single GPU.</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Real Example:</strong> Training a 175B model with 4 GPUs. Without ZeRO: each GPU needs ~3 TB. With ZeRO Stage 3: each GPU only needs ~750 GB. That is 4x less per GPU! With even more GPUs, it drops further.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1FA93}</span> Tensor vs Pipeline: Splitting the Model</h2>
                <p>When the model is too big for one GPU, you can split the model itself:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#a855f7;">Tensor Parallelism</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            \u2022 Splits each <strong>layer horizontally</strong><br>
                            \u2022 Each GPU computes part of the matrix multiplication<br>
                            \u2022 Needs FAST connections between GPUs (NVLink)<br>
                            \u2022 Best for within a single machine (same node)
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#22c55e;">Pipeline Parallelism</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            \u2022 Splits by <strong>layers</strong> - each GPU handles a group<br>
                            \u2022 Data flows like an assembly line through GPUs<br>
                            \u2022 Uses micro-batches to keep GPUs busy<br>
                            \u2022 Works well across machines (different nodes)
                        </div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>In practice:</strong> Big labs use ALL of these together! For example, DeepSeek uses tensor parallelism within each machine (8 GPUs connected with fast NVLink), pipeline parallelism across machines, data parallelism for throughput, and ZeRO for memory savings. It is like having multiple construction strategies all at once!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> ZeRO in Code</h2>
                <p>Using ZeRO with DeepSpeed is simple:</p>
                <div class="code-block"><pre>
<span class="comment"># DeepSpeed config for ZeRO Stage 3</span>
ds_config = {
    <span class="string">"zero_optimization"</span>: {
        <span class="string">"stage"</span>: <span class="number">3</span>,               <span class="comment"># Split everything!</span>
        <span class="string">"offload_param"</span>: {        <span class="comment"># Can even offload to CPU</span>
            <span class="string">"device"</span>: <span class="string">"cpu"</span>
        },
        <span class="string">"offload_optimizer"</span>: {
            <span class="string">"device"</span>: <span class="string">"cpu"</span>
        }
    },
    <span class="string">"train_batch_size"</span>: <span class="number">256</span>,
    <span class="string">"fp16"</span>: {<span class="string">"enabled"</span>: <span class="keyword">true</span>}
}

<span class="comment"># Initialize with DeepSpeed</span>
model, optimizer, _, _ = deepspeed.initialize(
    model=model, config=ds_config
)

<span class="comment"># Training loop is the same as normal!</span>
<span class="keyword">for</span> batch <span class="keyword">in</span> data_loader:
    loss = model(batch)
    model.backward(loss)
    model.step()             <span class="comment"># DeepSpeed handles all the magic!</span>
                </pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Data Parallelism</strong> gives each GPU a full model copy and different data. Simple but memory-hungry since every GPU holds everything.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Tensor Parallelism</strong> splits each layer across GPUs. Great for fast GPU-to-GPU connections. Pipeline Parallelism assigns different layers to different GPUs.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>ZeRO eliminates redundancy</strong> by splitting optimizer states (Stage 1), gradients (Stage 2), and parameters (Stage 3) across GPUs.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Real systems combine all strategies:</strong> tensor parallelism within machines, pipeline parallelism across machines, data parallelism for throughput, and ZeRO for memory!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter15.startQuiz15_2()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('15-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('15-3')">Next: Inference Optimization \u2192</button>
            </div>
        `;

        this.initParallelCanvas();
    },

    // --- 15.2 Canvas & Interaction Methods ---

    setParallelMode(mode) {
        this.parallelMode = mode;
        this.parallelAnimStep = 0;
        const info = document.getElementById('parallelInfo');
        if (info) {
            const descriptions = {
                data: 'Data Parallelism: Each GPU has the FULL model but trains on different data batches. They share gradients after each step.',
                tensor: 'Tensor Parallelism: Each layer is SPLIT across GPUs. Each GPU computes part of every matrix multiplication.',
                pipeline: 'Pipeline Parallelism: Each GPU handles different layers. Data flows through GPUs like an assembly line.',
                zero: 'ZeRO: Optimizer states, gradients, and parameters are split across GPUs. No redundant copies!'
            };
            info.textContent = descriptions[mode] || '';
        }
        this.drawParallelCanvas();
    },

    initParallelCanvas() {
        this.parallelMode = 'data';
        this.parallelAnimStep = 0;
        this.parallelAnimating = false;
        if (this.parallelAnimFrame) cancelAnimationFrame(this.parallelAnimFrame);
        this.drawParallelCanvas();
    },

    drawParallelCanvas() {
        const canvas = document.getElementById('parallelCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const mode = this.parallelMode;
        const time = Date.now() / 1000;

        // Title
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        const titles = {
            data: 'Data Parallelism: Same Model, Different Data',
            tensor: 'Tensor Parallelism: Split Each Layer',
            pipeline: 'Pipeline Parallelism: Assembly Line of Layers',
            zero: 'ZeRO: Zero Redundancy Optimizer'
        };
        ctx.fillText(titles[mode] || '', W / 2, 25);

        // Draw 4 GPU boxes in a 2x2 grid
        const gpuW = 160;
        const gpuH = 130;
        const gpuGap = 40;
        const startX = (W - 2 * gpuW - gpuGap) / 2;
        const startY = 45;
        const gpuPositions = [
            { x: startX, y: startY },
            { x: startX + gpuW + gpuGap, y: startY },
            { x: startX, y: startY + gpuH + gpuGap },
            { x: startX + gpuW + gpuGap, y: startY + gpuH + gpuGap }
        ];

        const gpuColors = ['#6366f1', '#a855f7', '#22c55e', '#f59e0b'];
        const gpuNames = ['GPU 0', 'GPU 1', 'GPU 2', 'GPU 3'];

        if (mode === 'data') {
            this.drawDataParallel(ctx, gpuPositions, gpuW, gpuH, gpuColors, gpuNames, time);
        } else if (mode === 'tensor') {
            this.drawTensorParallel(ctx, gpuPositions, gpuW, gpuH, gpuColors, gpuNames, time);
        } else if (mode === 'pipeline') {
            this.drawPipelineParallel(ctx, gpuPositions, gpuW, gpuH, gpuColors, gpuNames, time, W);
        } else if (mode === 'zero') {
            this.drawZeROParallel(ctx, gpuPositions, gpuW, gpuH, gpuColors, gpuNames, time);
        }

        // Memory usage bars at the bottom
        const barY = H - 40;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('Memory per GPU:', 30, barY - 5);

        const memoryFractions = {
            data: [1.0, 1.0, 1.0, 1.0],
            tensor: [0.28, 0.28, 0.28, 0.28],
            pipeline: [0.27, 0.27, 0.27, 0.27],
            zero: [0.25, 0.25, 0.25, 0.25]
        };

        const fractions = memoryFractions[mode] || [1, 1, 1, 1];
        const barMaxW = 120;

        fractions.forEach((frac, i) => {
            const bx = 150 + i * 160;
            const bw = Math.max(4, frac * barMaxW);

            // Background
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(bx, barY - 12, barMaxW, 14);

            // Fill
            ctx.fillStyle = gpuColors[i];
            ctx.globalAlpha = 0.7;
            ctx.fillRect(bx, barY - 12, bw, 14);
            ctx.globalAlpha = 1.0;

            // Label
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#e8eaf0';
            ctx.textAlign = 'center';
            ctx.fillText(gpuNames[i] + ': ' + Math.round(frac * 100) + '%', bx + barMaxW / 2, barY + 10);
        });

        // Animation loop
        if (this.parallelAnimFrame) cancelAnimationFrame(this.parallelAnimFrame);
        this.parallelAnimFrame = requestAnimationFrame(() => this.drawParallelCanvas());
    },

    drawGPUBox(ctx, x, y, w, h, color, name) {
        // GPU box background
        this.drawRoundedRect(ctx, x, y, w, h, 10);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, x, y, w, h, 10);
        ctx.stroke();

        // GPU name
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(name, x + w / 2, y + 18);
    },

    drawDataParallel(ctx, positions, w, h, colors, names, time) {
        const dataColors = ['#3b82f6', '#ec4899', '#14b8a6', '#f97316'];
        const dataBatchLabels = ['Batch A', 'Batch B', 'Batch C', 'Batch D'];

        positions.forEach((pos, i) => {
            this.drawGPUBox(ctx, pos.x, pos.y, w, h, colors[i], names[i]);

            // Full model (shown as stacked layers)
            const layerY = pos.y + 28;
            const layerW = w - 30;
            const layerH = 10;
            for (let l = 0; l < 5; l++) {
                ctx.fillStyle = `rgba(99, 102, 241, ${0.3 + l * 0.1})`;
                this.drawRoundedRect(ctx, pos.x + 15, layerY + l * 13, layerW, layerH, 3);
                ctx.fill();
            }

            // "Full Model" label
            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText('Full Model', pos.x + w / 2, layerY + 75);

            // Data batch (colored block)
            const dataY = layerY + 82;
            ctx.fillStyle = dataColors[i];
            ctx.globalAlpha = 0.6 + Math.sin(time * 2 + i) * 0.2;
            this.drawRoundedRect(ctx, pos.x + 15, dataY, layerW, 16, 4);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(dataBatchLabels[i], pos.x + w / 2, dataY + 12);
        });

        // Draw gradient sharing arrows between GPUs
        const arrowAlpha = 0.4 + Math.sin(time * 3) * 0.3;
        ctx.strokeStyle = `rgba(245, 158, 11, ${arrowAlpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        // Horizontal arrows (top pair)
        const cx0 = positions[0].x + w;
        const cy0 = positions[0].y + h / 2;
        const cx1 = positions[1].x;
        const cy1 = positions[1].y + h / 2;
        ctx.beginPath();
        ctx.moveTo(cx0, cy0);
        ctx.lineTo(cx1, cy1);
        ctx.stroke();

        // Horizontal arrows (bottom pair)
        const cx2 = positions[2].x + w;
        const cy2 = positions[2].y + h / 2;
        const cx3 = positions[3].x;
        const cy3 = positions[3].y + h / 2;
        ctx.beginPath();
        ctx.moveTo(cx2, cy2);
        ctx.lineTo(cx3, cy3);
        ctx.stroke();

        // Vertical arrows
        const vx0 = positions[0].x + w / 2;
        const vy0 = positions[0].y + h;
        const vy2 = positions[2].y;
        ctx.beginPath();
        ctx.moveTo(vx0, vy0);
        ctx.lineTo(vx0, vy2);
        ctx.stroke();

        const vx1 = positions[1].x + w / 2;
        const vy1 = positions[1].y + h;
        const vy3 = positions[3].y;
        ctx.beginPath();
        ctx.moveTo(vx1, vy1);
        ctx.lineTo(vx1, vy3);
        ctx.stroke();

        ctx.setLineDash([]);

        // "All-Reduce Gradients" label in center
        const centerX = (positions[0].x + positions[1].x + w) / 2;
        const centerY = (positions[0].y + h + positions[2].y) / 2;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText('All-Reduce', centerX, centerY - 4);
        ctx.fillText('Gradients', centerX, centerY + 10);
    },

    drawTensorParallel(ctx, positions, w, h, colors, names, time) {
        positions.forEach((pos, i) => {
            this.drawGPUBox(ctx, pos.x, pos.y, w, h, colors[i], names[i]);

            // Show split layers - each GPU has a QUARTER of every layer
            const layerY = pos.y + 28;
            const layerW = w - 30;
            const layerH = 12;

            for (let l = 0; l < 5; l++) {
                // Draw the quarter slice with the GPU's color
                const alpha = 0.4 + Math.sin(time * 2 + l * 0.5 + i) * 0.15;
                ctx.fillStyle = colors[i].replace(')', ', ' + alpha + ')').replace('rgb', 'rgba');

                // Fallback: just use the color with opacity
                ctx.globalAlpha = alpha;
                ctx.fillStyle = colors[i];
                this.drawRoundedRect(ctx, pos.x + 15, layerY + l * 15, layerW, layerH, 3);
                ctx.fill();
                ctx.globalAlpha = 1.0;

                // Label: "1/4 of Layer N"
                ctx.font = '7px Inter, sans-serif';
                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                ctx.fillText('1/4 L' + (l + 1), pos.x + w / 2, layerY + l * 15 + 9);
            }

            // Label
            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText('Slice ' + (i + 1) + '/4 of ALL layers', pos.x + w / 2, layerY + 88);
        });

        // Communication arrows: all-to-all after each layer
        const arrowAlpha = 0.4 + Math.sin(time * 3) * 0.3;
        ctx.strokeStyle = `rgba(168, 85, 247, ${arrowAlpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);

        // Draw cross connections
        for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 4; j++) {
                const ax = positions[i].x + w / 2;
                const ay = positions[i].y + h / 2;
                const bx = positions[j].x + w / 2;
                const by = positions[j].y + h / 2;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.stroke();
            }
        }
        ctx.setLineDash([]);

        // Center label
        const centerX = (positions[0].x + positions[1].x + w) / 2;
        const centerY = (positions[0].y + h + positions[2].y) / 2;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#a855f7';
        ctx.textAlign = 'center';
        ctx.fillText('All-to-All', centerX, centerY - 4);
        ctx.fillText('Communication', centerX, centerY + 10);
    },

    drawPipelineParallel(ctx, positions, w, h, colors, names, time, canvasW) {
        // For pipeline, rearrange as a horizontal line
        const pipeW = 150;
        const pipeH = 100;
        const pipeGap = 30;
        const totalW = 4 * pipeW + 3 * pipeGap;
        const pipeStartX = (canvasW - totalW) / 2;
        const pipeY = 80;

        const layerRanges = ['Layers 1-10', 'Layers 11-20', 'Layers 21-30', 'Layers 31-40'];

        for (let i = 0; i < 4; i++) {
            const px = pipeStartX + i * (pipeW + pipeGap);

            this.drawGPUBox(ctx, px, pipeY, pipeW, pipeH, colors[i], names[i]);

            // Show sequential layers assigned to this GPU
            const layerY = pipeY + 25;
            const layerW = pipeW - 20;
            for (let l = 0; l < 3; l++) {
                ctx.globalAlpha = 0.4 + Math.sin(time * 2 + l + i) * 0.15;
                ctx.fillStyle = colors[i];
                this.drawRoundedRect(ctx, px + 10, layerY + l * 18, layerW, 14, 3);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // Layer range label
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText(layerRanges[i], px + pipeW / 2, pipeY + pipeH - 8);

            // Arrow to next GPU
            if (i < 3) {
                const arrowX1 = px + pipeW;
                const arrowX2 = px + pipeW + pipeGap;
                const arrowY = pipeY + pipeH / 2;

                // Animated data packet
                const packetPhase = (time * 1.5 + i * 0.8) % 1;
                const packetX = arrowX1 + packetPhase * pipeGap;

                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(arrowX1, arrowY);
                ctx.lineTo(arrowX2, arrowY);
                ctx.stroke();

                // Arrow head
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.moveTo(arrowX2, arrowY);
                ctx.lineTo(arrowX2 - 6, arrowY - 4);
                ctx.lineTo(arrowX2 - 6, arrowY + 4);
                ctx.closePath();
                ctx.fill();

                // Data packet
                ctx.fillStyle = colors[i];
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(packetX, arrowY, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }

        // Micro-batch timeline below
        const timelineY = pipeY + pipeH + 40;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('Micro-batch Pipeline Timeline', canvasW / 2, timelineY);

        const cellW = 40;
        const cellH = 20;
        const tlStartX = (canvasW - 8 * cellW) / 2;
        const tlStartY = timelineY + 14;
        const microBatches = ['MB1', 'MB2', 'MB3', 'MB4'];

        // Grid: 4 GPUs x 8 time steps
        for (let g = 0; g < 4; g++) {
            // GPU label
            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = colors[g];
            ctx.textAlign = 'right';
            ctx.fillText(names[g], tlStartX - 6, tlStartY + g * (cellH + 3) + 14);

            for (let t = 0; t < 8; t++) {
                const cx = tlStartX + t * cellW;
                const cy = tlStartY + g * (cellH + 3);

                // Which micro-batch is active on this GPU at this time?
                const mbIdx = t - g;
                if (mbIdx >= 0 && mbIdx < 4) {
                    const pulse = Math.sin(time * 3 + t + g) * 0.1 + 0.5;
                    ctx.fillStyle = colors[g];
                    ctx.globalAlpha = pulse;
                    ctx.fillRect(cx + 1, cy, cellW - 2, cellH);
                    ctx.globalAlpha = 1.0;

                    ctx.font = 'bold 8px Inter, sans-serif';
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.fillText(microBatches[mbIdx], cx + cellW / 2, cy + 13);
                } else {
                    // Idle (bubble)
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(cx + 1, cy, cellW - 2, cellH);
                    if (t < 4 + g && (mbIdx < 0 || mbIdx >= 4)) {
                        ctx.font = '7px Inter, sans-serif';
                        ctx.fillStyle = '#475569';
                        ctx.textAlign = 'center';
                        ctx.fillText('idle', cx + cellW / 2, cy + 13);
                    }
                }

                // Cell border
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(cx, cy, cellW, cellH);
            }
        }

        // Time label
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('Time \u2192', tlStartX + 4 * cellW, tlStartY + 4 * (cellH + 3) + 14);
    },

    drawZeROParallel(ctx, positions, w, h, colors, names, time) {
        const stageLabels = ['Optimizer', 'Gradients', 'Parameters'];
        const stageColors = ['#6366f1', '#a855f7', '#22c55e'];

        positions.forEach((pos, i) => {
            this.drawGPUBox(ctx, pos.x, pos.y, w, h, colors[i], names[i]);

            const slotY = pos.y + 28;
            const slotW = w - 24;
            const slotH = 22;

            for (let s = 0; s < 3; s++) {
                const sy = slotY + s * 28;

                // Background slot
                ctx.fillStyle = '#1e293b';
                this.drawRoundedRect(ctx, pos.x + 12, sy, slotW, slotH, 4);
                ctx.fill();

                // Only show the 1/4 slice this GPU owns
                const sliceW = slotW / 4;
                const sliceX = pos.x + 12 + i * sliceW;

                ctx.fillStyle = stageColors[s];
                ctx.globalAlpha = 0.5 + Math.sin(time * 2 + s + i) * 0.15;
                this.drawRoundedRect(ctx, sliceX, sy, sliceW, slotH, 4);
                ctx.fill();
                ctx.globalAlpha = 1.0;

                // Label
                ctx.font = '8px Inter, sans-serif';
                ctx.fillStyle = '#e8eaf0';
                ctx.textAlign = 'center';
                ctx.fillText('1/4 ' + stageLabels[s], pos.x + w / 2, sy + 14);
            }

            // Memory saved label
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillStyle = '#22c55e';
            ctx.textAlign = 'center';
            ctx.fillText('75% memory saved!', pos.x + w / 2, pos.y + h - 8);
        });

        // Communication arrows
        const arrowAlpha = 0.4 + Math.sin(time * 3) * 0.3;
        ctx.strokeStyle = `rgba(34, 197, 94, ${arrowAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);

        // Draw connections between all GPUs
        for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 4; j++) {
                const ax = positions[i].x + w / 2;
                const ay = positions[i].y + h / 2;
                const bx = positions[j].x + w / 2;
                const by = positions[j].y + h / 2;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.stroke();
            }
        }
        ctx.setLineDash([]);

        // Center label
        const centerX = (positions[0].x + positions[1].x + w) / 2;
        const centerY = (positions[0].y + h + positions[2].y) / 2;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText('Gather on', centerX, centerY - 4);
        ctx.fillText('Demand', centerX, centerY + 10);
    },

    startQuiz15_2() {
        Quiz.start({
            title: 'Distributed Training Quiz',
            chapterId: '15-2',
            questions: [
                {
                    question: 'In Data Parallelism, what does each GPU get?',
                    options: [
                        'A piece of the model and all the data',
                        'A full copy of the model and different data batches',
                        'Only the optimizer states',
                        'Just the gradients from other GPUs'
                    ],
                    correct: 1,
                    explanation: 'In Data Parallelism, each GPU gets a complete copy of the entire model, but each one trains on a different batch of data. After computing gradients, they share and average them (all-reduce)!'
                },
                {
                    question: 'What is the main advantage of Tensor Parallelism over Pipeline Parallelism?',
                    options: [
                        'It uses less network bandwidth',
                        'It splits each layer across GPUs so all GPUs work on every layer simultaneously',
                        'It does not need any communication between GPUs',
                        'It only works with small models'
                    ],
                    correct: 1,
                    explanation: 'Tensor Parallelism splits each layer across GPUs, so all GPUs work on every single layer together. Pipeline Parallelism assigns whole layers to specific GPUs, creating an assembly line. Tensor parallelism needs very fast connections (NVLink) but keeps all GPUs busy!'
                },
                {
                    question: 'What does ZeRO Stage 3 split across GPUs?',
                    options: [
                        'Only optimizer states',
                        'Optimizer states and gradients',
                        'Optimizer states, gradients, AND model parameters',
                        'Nothing - each GPU has a full copy'
                    ],
                    correct: 2,
                    explanation: 'ZeRO Stage 3 splits EVERYTHING across GPUs: optimizer states, gradients, and model parameters. Each GPU only stores 1/N of all model state, giving maximum memory savings!'
                },
                {
                    question: 'What is a "pipeline bubble" in Pipeline Parallelism?',
                    options: [
                        'A memory leak in the GPU',
                        'Idle time when some GPUs are waiting for data from other GPUs',
                        'A type of gradient explosion',
                        'Extra memory used for caching'
                    ],
                    correct: 1,
                    explanation: 'Pipeline bubbles are idle periods where GPUs are waiting. At the start, only GPU 0 is working while GPUs 1-3 wait. Micro-batching helps reduce these bubbles by keeping more GPUs busy!'
                },
                {
                    question: 'In practice, how do large AI labs train their biggest models?',
                    options: [
                        'They only use Data Parallelism',
                        'They only use one GPU with lots of memory',
                        'They combine multiple parallelism strategies together',
                        'They train on CPUs instead of GPUs'
                    ],
                    correct: 2,
                    explanation: 'Big labs combine ALL strategies: tensor parallelism within machines (fast NVLink), pipeline parallelism across machines, data parallelism for throughput, and ZeRO for memory savings. It is like using every construction strategy at once!'
                }
            ]
        });
    },

    // ============================================
    // 15.3: Inference Engines (vLLM / Batching)
    // ============================================
    loadChapter15_3() {
        const container = document.getElementById('chapter-15-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 15 &bull; Chapter 15.3</span>
                <h1>Inference Engines (vLLM & Batching)</h1>
                <p class="chapter-subtitle">Serving AI Like a Restaurant - How to Feed Thousands of Users Without Making Them Wait!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F354}</span> The Restaurant Analogy</h2>
                <p>Imagine you run a <strong>restaurant</strong>. Customers walk in, order food, and wait for their meals. Some people order a quick salad (short prompt), and some order a 7-course feast (long conversation). How do you serve everyone efficiently?</p>
                <p>An <strong>inference engine</strong> is like the kitchen of a restaurant for AI. When users send messages to ChatGPT or Claude, the inference engine is what actually generates the response, token by token. The challenge is serving <strong>thousands of users at once</strong> without making anyone wait too long!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Big Idea:</strong> Training a model is like writing a cookbook. Inference (serving) is like actually cooking meals for customers. Training happens once; inference happens millions of times a day! That is why making inference fast is so important.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F37D}\uFE0F</span> Static vs Continuous Batching</h2>
                <p>Here is the key difference between old and new serving methods:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F6D1}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Static Batching (Old Way)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like waiting for <strong>everyone at the table to finish eating</strong> before clearing ANY plates. If one person orders a 7-course meal, everyone else just sits there even after they are done! New customers cannot sit down until the whole table is cleared.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{2705}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Continuous Batching (New Way)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like clearing <strong>each person's plate as soon as they finish</strong>. When someone is done, a new customer immediately takes their seat! The restaurant never has empty chairs while people are waiting in line. Way more efficient!</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Real impact:</strong> Continuous batching (used by vLLM) can serve <strong>2-4x more users</strong> with the same GPU compared to static batching. That means the same hardware costs serve way more people!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4D6}</span> vLLM and PagedAttention</h2>
                <p>vLLM is a super popular inference engine that uses a clever trick called <strong>PagedAttention</strong> (remember from Chapter 13.4?). Here is how it works:</p>
                <p>Think of GPU memory like a <strong>bookshelf</strong>. Normally, each user's conversation takes up a whole shelf, even if they only have a few books. That wastes tons of space! PagedAttention is like using a library system instead - you only check out the pages you need, when you need them.</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DA}</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Paged KV Cache</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Instead of reserving a huge block of memory for each user, vLLM allocates small <strong>pages</strong> on demand. Like a library lending books one at a time instead of giving you the whole section!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F504}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">No Memory Waste</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Traditional systems waste <strong>60-80% of GPU memory</strong> on reserved-but-unused space. PagedAttention wastes less than <strong>4%</strong>! More memory means more users can be served at once.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F680}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Higher Throughput</div>
                        <div style="font-size:12px;color:var(--text-secondary);">By fitting more users in memory at the same time, vLLM can serve <strong>2-4x more requests per second</strong> than older systems like HuggingFace TGI.</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{2699}\uFE0F</span> Prefill vs Decode: Two Phases of Inference</h2>
                <p>When you send a message to an AI, the response happens in two very different phases:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                            <div style="font-size:24px;">\u{26A1}</div>
                            <div style="font-weight:600;color:#f59e0b;font-size:16px;">Prefill Phase</div>
                        </div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            Processes your <strong>entire prompt at once</strong>. Like a chef reading the whole recipe before cooking. This is <strong>compute-bound</strong> (limited by math speed, not memory). It is fast because all tokens can be processed in parallel!
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                            <div style="font-size:24px;">\u{1F422}</div>
                            <div style="font-weight:600;color:#6366f1;font-size:16px;">Decode Phase</div>
                        </div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            Generates tokens <strong>one by one</strong>. Like a chef cooking one dish at a time and waiting for each to finish before starting the next. This is <strong>memory-bound</strong> (limited by how fast you can read the KV cache from memory).
                        </div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Chunked Prefill:</strong> For very long prompts, vLLM splits the prefill into chunks. This prevents one user's huge prompt from blocking everyone else. It is like a chef breaking a big recipe into steps so they can check on other tables in between!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Batching Simulator</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Watch how requests flow through a GPU. Toggle between Static and Continuous batching to see the difference! Click "Add Request" to add more work, then hit "Start" to watch the simulation.</p>
                <div class="controls" style="margin-bottom:12px;">
                    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-primary btn-small" onclick="Chapter15.toggleServingMode('static')" id="btnStaticMode">Static Batching</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.toggleServingMode('continuous')" id="btnContinuousMode">Continuous Batching</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.addServingRequest()" style="background:#f59e0b;">+ Add Request</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.startServingAnim()" style="background:#22c55e;">Start</button>
                        <button class="btn-secondary btn-small" onclick="Chapter15.resetServing()">Reset</button>
                    </div>
                </div>
                <div class="network-viz">
                    <canvas id="servingCanvas" width="800" height="400"></canvas>
                </div>
                <div id="servingInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Static Batching: All requests in a batch must complete before new ones can start. Toggle to Continuous to see the difference!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> vLLM in Code</h2>
                <p>Using vLLM to serve a model is surprisingly simple:</p>
                <div class="code-block"><pre>
<span class="comment"># Install: pip install vllm</span>
<span class="keyword">from</span> vllm <span class="keyword">import</span> LLM, SamplingParams

<span class="comment"># Load model with PagedAttention (automatic!)</span>
llm = LLM(model=<span class="string">"meta-llama/Llama-3-70B"</span>,
          tensor_parallel_size=<span class="number">4</span>,    <span class="comment"># Use 4 GPUs</span>
          gpu_memory_utilization=<span class="number">0.9</span>) <span class="comment"># Use 90% of GPU memory</span>

<span class="comment"># Serve requests (continuous batching happens automatically)</span>
params = SamplingParams(temperature=<span class="number">0.7</span>, max_tokens=<span class="number">512</span>)
outputs = llm.generate([
    <span class="string">"Explain quantum computing"</span>,
    <span class="string">"Write a poem about cats"</span>,
    <span class="string">"What is the meaning of life?"</span>,
], params)

<span class="comment"># Or run as an OpenAI-compatible API server:</span>
<span class="comment"># python -m vllm.entrypoints.openai.api_server \\</span>
<span class="comment">#     --model meta-llama/Llama-3-70B \\</span>
<span class="comment">#     --tensor-parallel-size 4</span>
                </pre></div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Speculative Decoding:</strong> Another speed trick! A small "draft" model guesses several tokens ahead, then the big model checks them all at once. It is like having an intern write a first draft and the expert just reviews and corrects it - much faster than writing from scratch!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#ef4444;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Static batching wastes GPU time</strong> because all requests in a batch must finish before new ones start. Short requests wait for long ones - like clearing the whole table only after the slowest eater finishes.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Continuous batching</strong> lets finished requests leave and new ones join immediately, keeping the GPU busy at all times. This gives 2-4x higher throughput!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>vLLM uses PagedAttention</strong> to manage GPU memory like pages in a book - allocating only what is needed, when it is needed. This wastes less than 4% of memory compared to 60-80% with old methods.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Prefill is fast and parallel</strong> (processes the whole prompt at once). Decode is slow and sequential (generates one token at a time). Chunked prefill prevents long prompts from blocking other users.</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter15.startQuiz15_3()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('15-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('15-4')">Next: External Memory \u2192</button>
            </div>
        `;

        this.initServingCanvas();
    },

    // --- 15.3 Canvas & Interaction Methods ---

    toggleServingMode(mode) {
        this.servingMode = mode;
        const info = document.getElementById('servingInfo');
        if (info) {
            if (mode === 'static') {
                info.textContent = 'Static Batching: All requests in a batch must complete before new ones can start. Short requests waste GPU time waiting for long ones!';
            } else {
                info.textContent = 'Continuous Batching: Finished requests leave immediately and new ones join. The GPU stays busy at all times - much more efficient!';
            }
        }
        const btnStatic = document.getElementById('btnStaticMode');
        const btnCont = document.getElementById('btnContinuousMode');
        if (btnStatic) btnStatic.style.opacity = mode === 'static' ? '1' : '0.5';
        if (btnCont) btnCont.style.opacity = mode === 'continuous' ? '1' : '0.5';
        this.resetServing();
    },

    addServingRequest() {
        const colors = ['#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#a855f7', '#6366f1', '#22c55e', '#ef4444'];
        const names = ['User A', 'User B', 'User C', 'User D', 'User E', 'User F', 'User G', 'User H'];
        const idx = this.servingRequests.length % colors.length;
        const tokensNeeded = 20 + Math.floor(Math.random() * 80); // 20-100 tokens
        this.servingRequests.push({
            name: names[idx],
            color: colors[idx],
            tokensNeeded: tokensNeeded,
            tokensGenerated: 0,
            done: false,
            startedAt: -1,
            finishedAt: -1
        });
        this.drawServingCanvas();
    },

    initServingCanvas() {
        this.servingMode = 'static';
        this.servingStep = 0;
        this.servingAnimating = false;
        this.servingRequests = [];
        this.servingThroughput = 0;
        this.servingCompleted = 0;
        if (this.servingAnimFrame) cancelAnimationFrame(this.servingAnimFrame);

        // Seed with initial requests
        const colors = ['#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#a855f7'];
        const names = ['User A', 'User B', 'User C', 'User D', 'User E'];
        const tokenCounts = [30, 80, 45, 95, 55];
        for (let i = 0; i < 5; i++) {
            this.servingRequests.push({
                name: names[i],
                color: colors[i],
                tokensNeeded: tokenCounts[i],
                tokensGenerated: 0,
                done: false,
                startedAt: -1,
                finishedAt: -1
            });
        }

        const btnStatic = document.getElementById('btnStaticMode');
        const btnCont = document.getElementById('btnContinuousMode');
        if (btnStatic) btnStatic.style.opacity = '1';
        if (btnCont) btnCont.style.opacity = '0.5';

        this.drawServingCanvas();
    },

    resetServing() {
        this.servingStep = 0;
        this.servingAnimating = false;
        this.servingCompleted = 0;
        this.servingThroughput = 0;
        if (this.servingAnimFrame) cancelAnimationFrame(this.servingAnimFrame);
        this.servingRequests.forEach(r => {
            r.tokensGenerated = 0;
            r.done = false;
            r.startedAt = -1;
            r.finishedAt = -1;
        });
        this.drawServingCanvas();
    },

    startServingAnim() {
        if (this.servingAnimating) return;
        this.servingAnimating = true;
        this.servingStep = 0;
        this.servingCompleted = 0;
        this.servingThroughput = 0;
        this.servingRequests.forEach(r => {
            r.tokensGenerated = 0;
            r.done = false;
            r.startedAt = -1;
            r.finishedAt = -1;
        });
        this.servingAnimLoop();
    },

    servingAnimLoop() {
        if (!this.servingAnimating) return;

        const batchSize = 3; // GPU can handle 3 requests at a time
        const mode = this.servingMode;
        const reqs = this.servingRequests;
        const step = this.servingStep;

        if (mode === 'static') {
            // Static: pick first batchSize unfinished requests, process them together
            // All must finish before we pick new ones
            const activeReqs = reqs.filter(r => r.startedAt >= 0 && !r.done);
            if (activeReqs.length === 0) {
                // Pick next batch
                const pending = reqs.filter(r => r.startedAt < 0);
                const nextBatch = pending.slice(0, batchSize);
                if (nextBatch.length === 0) {
                    this.servingAnimating = false;
                    this.drawServingCanvas();
                    return;
                }
                nextBatch.forEach(r => { r.startedAt = step; });
            }
            // Process active requests
            const currentActive = reqs.filter(r => r.startedAt >= 0 && !r.done);
            currentActive.forEach(r => {
                r.tokensGenerated += 1;
                if (r.tokensGenerated >= r.tokensNeeded) {
                    r.done = true;
                    r.finishedAt = step;
                    this.servingCompleted++;
                }
            });
            // In static mode, wait for ALL active to finish
            const stillActive = reqs.filter(r => r.startedAt >= 0 && !r.done);
            if (stillActive.length === 0) {
                // Batch complete, next batch will be picked in next iteration
            }
        } else {
            // Continuous: always fill up to batchSize active slots
            const activeReqs = reqs.filter(r => r.startedAt >= 0 && !r.done);
            const openSlots = batchSize - activeReqs.length;
            if (openSlots > 0) {
                const pending = reqs.filter(r => r.startedAt < 0);
                const newReqs = pending.slice(0, openSlots);
                newReqs.forEach(r => { r.startedAt = step; });
            }
            // Process all active
            const currentActive = reqs.filter(r => r.startedAt >= 0 && !r.done);
            currentActive.forEach(r => {
                r.tokensGenerated += 1;
                if (r.tokensGenerated >= r.tokensNeeded) {
                    r.done = true;
                    r.finishedAt = step;
                    this.servingCompleted++;
                }
            });
        }

        this.servingStep++;
        if (this.servingStep > 0) {
            this.servingThroughput = (this.servingCompleted / this.servingStep * 60).toFixed(1);
        }

        this.drawServingCanvas();

        // Check if all done
        const allDone = reqs.every(r => r.done);
        if (allDone) {
            this.servingAnimating = false;
            this.drawServingCanvas();
            return;
        }

        this.servingAnimFrame = requestAnimationFrame(() => {
            // Slow down the simulation a bit
            setTimeout(() => this.servingAnimLoop(), 50);
        });
    },

    drawServingCanvas() {
        const canvas = document.getElementById('servingCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const time = Date.now() / 1000;
        const mode = this.servingMode;
        const reqs = this.servingRequests;
        const batchSize = 3;

        // Title
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText(mode === 'static' ? 'Static Batching: Wait for Whole Batch' : 'Continuous Batching: Fill Slots Immediately', W / 2, 25);

        // === LEFT: Request Queue ===
        const queueX = 20;
        const queueY = 45;
        const queueW = 180;

        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('Request Queue', queueX, queueY);

        reqs.forEach((r, i) => {
            const ry = queueY + 14 + i * 36;
            if (ry + 30 > H - 50) return; // clip if too many

            // Background bar
            this.drawRoundedRect(ctx, queueX, ry, queueW, 28, 6);
            ctx.fillStyle = r.done ? 'rgba(34, 197, 94, 0.1)' : (r.startedAt >= 0 ? 'rgba(99, 102, 241, 0.15)' : '#1e293b');
            ctx.fill();

            // Border
            ctx.strokeStyle = r.done ? '#22c55e' : (r.startedAt >= 0 ? r.color : '#334155');
            ctx.lineWidth = 1.5;
            this.drawRoundedRect(ctx, queueX, ry, queueW, 28, 6);
            ctx.stroke();

            // Progress fill
            const progress = r.tokensNeeded > 0 ? r.tokensGenerated / r.tokensNeeded : 0;
            if (progress > 0) {
                ctx.fillStyle = r.color;
                ctx.globalAlpha = 0.3;
                this.drawRoundedRect(ctx, queueX, ry, queueW * Math.min(1, progress), 28, 6);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // Name
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillStyle = r.done ? '#22c55e' : '#e8eaf0';
            ctx.textAlign = 'left';
            ctx.fillText(r.name, queueX + 8, ry + 12);

            // Token count
            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'right';
            ctx.fillText(r.tokensGenerated + '/' + r.tokensNeeded + ' tok', queueX + queueW - 8, ry + 12);

            // Status
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'left';
            if (r.done) {
                ctx.fillStyle = '#22c55e';
                ctx.fillText('Done!', queueX + 8, ry + 23);
            } else if (r.startedAt >= 0) {
                ctx.fillStyle = r.color;
                ctx.fillText('Processing...', queueX + 8, ry + 23);
            } else {
                ctx.fillStyle = '#64748b';
                ctx.fillText('Waiting', queueX + 8, ry + 23);
            }
        });

        // === CENTER: GPU Processing Area ===
        const gpuX = 230;
        const gpuY = 45;
        const gpuW = 340;
        const gpuH = 280;

        // GPU box
        this.drawRoundedRect(ctx, gpuX, gpuY, gpuW, gpuH, 12);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fill();

        const gpuBorderPulse = this.servingAnimating ? (0.6 + Math.sin(time * 3) * 0.4) : 0.5;
        ctx.strokeStyle = `rgba(99, 102, 241, ${gpuBorderPulse})`;
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, gpuX, gpuY, gpuW, gpuH, 12);
        ctx.stroke();

        // GPU label
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#6366f1';
        ctx.textAlign = 'center';
        ctx.fillText('GPU Processing Area', gpuX + gpuW / 2, gpuY + 22);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Batch Size: ' + batchSize + ' slots', gpuX + gpuW / 2, gpuY + 36);

        // Draw batch slots
        const slotW = (gpuW - 40) / batchSize;
        const slotH = 200;
        const slotY = gpuY + 50;

        for (let s = 0; s < batchSize; s++) {
            const sx = gpuX + 20 + s * slotW;

            // Slot background
            this.drawRoundedRect(ctx, sx + 2, slotY, slotW - 4, slotH, 8);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            this.drawRoundedRect(ctx, sx + 2, slotY, slotW - 4, slotH, 8);
            ctx.stroke();

            // Slot label
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#475569';
            ctx.textAlign = 'center';
            ctx.fillText('Slot ' + (s + 1), sx + slotW / 2, slotY + 14);
        }

        // Draw active requests in slots
        const activeReqs = reqs.filter(r => r.startedAt >= 0 && !r.done);
        const doneInSlot = reqs.filter(r => r.done);

        // For display, show currently active requests in slots
        activeReqs.forEach((r, i) => {
            if (i >= batchSize) return;
            const sx = gpuX + 20 + i * slotW;
            const progress = r.tokensNeeded > 0 ? r.tokensGenerated / r.tokensNeeded : 0;
            const barH = slotH - 30;
            const fillH = barH * Math.min(1, progress);

            // Fill from bottom up
            ctx.fillStyle = r.color;
            ctx.globalAlpha = 0.5 + Math.sin(time * 4 + i) * 0.15;
            this.drawRoundedRect(ctx, sx + 8, slotY + 22 + (barH - fillH), slotW - 20, fillH, 4);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Request name in slot
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillStyle = '#e8eaf0';
            ctx.textAlign = 'center';
            ctx.fillText(r.name, sx + slotW / 2, slotY + slotH - 10);

            // Percentage
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillStyle = r.color;
            ctx.fillText(Math.round(progress * 100) + '%', sx + slotW / 2, slotY + 36);
        });

        // === RIGHT: Stats Panel ===
        const statsX = 600;
        const statsY = 45;
        const statsW = 180;

        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('Stats', statsX, statsY);

        // Mode indicator
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = mode === 'static' ? '#ef4444' : '#22c55e';
        ctx.fillText('Mode: ' + (mode === 'static' ? 'Static' : 'Continuous'), statsX, statsY + 22);

        // Step counter
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Step: ' + this.servingStep, statsX, statsY + 42);

        // Completed
        ctx.fillText('Completed: ' + this.servingCompleted + '/' + reqs.length, statsX, statsY + 62);

        // Throughput
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('Throughput:', statsX, statsY + 90);
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillText(this.servingThroughput + ' req/min', statsX, statsY + 112);

        // GPU Utilization bar
        const activeCount = reqs.filter(r => r.startedAt >= 0 && !r.done).length;
        const utilization = this.servingAnimating ? (activeCount / batchSize) : 0;

        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('GPU Utilization:', statsX, statsY + 140);

        // Bar background
        this.drawRoundedRect(ctx, statsX, statsY + 148, statsW, 18, 4);
        ctx.fillStyle = '#1e293b';
        ctx.fill();

        // Bar fill
        const utilColor = utilization > 0.7 ? '#22c55e' : (utilization > 0.3 ? '#f59e0b' : '#ef4444');
        ctx.fillStyle = utilColor;
        ctx.globalAlpha = 0.7;
        this.drawRoundedRect(ctx, statsX, statsY + 148, statsW * utilization, 18, 4);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(utilization * 100) + '%', statsX + statsW / 2, statsY + 161);
        ctx.textAlign = 'left';

        // Explanation at bottom of stats
        const explY = statsY + 190;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        const lines = mode === 'static'
            ? ['In static mode, short', 'requests waste GPU time', 'waiting for long ones', 'to finish.']
            : ['In continuous mode,', 'finished requests leave', 'and new ones join right', 'away. Much faster!'];
        lines.forEach((line, i) => {
            ctx.fillText(line, statsX, explY + i * 14);
        });

        // Bottom label
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.fillText(mode === 'static'
            ? 'Notice: Short requests wait for the longest one in the batch!'
            : 'Notice: New requests fill empty slots immediately - no wasted time!',
            W / 2, H - 15);

        // Animation loop for visual updates (pulse effects) if animating
        if (this.servingAnimating) {
            // The main animation is driven by servingAnimLoop, so no extra rAF needed here
        }
    },

    startQuiz15_3() {
        Quiz.start({
            title: 'Inference Engines Quiz',
            chapterId: '15-3',
            questions: [
                {
                    question: 'What is the main problem with static batching?',
                    options: [
                        'It uses too much memory',
                        'All requests must finish before new ones can start, wasting GPU time',
                        'It can only serve one user at a time',
                        'It does not work with large models'
                    ],
                    correct: 1,
                    explanation: 'In static batching, ALL requests in a batch must complete before new ones can start. Short requests finish early but have to wait for the longest one. It is like not clearing plates until the slowest eater finishes!'
                },
                {
                    question: 'How does continuous batching improve throughput?',
                    options: [
                        'By using more GPUs',
                        'By making the model smaller',
                        'By letting finished requests leave and new ones join immediately',
                        'By skipping tokens during generation'
                    ],
                    correct: 2,
                    explanation: 'Continuous batching lets each request leave as soon as it finishes, and a new request takes its slot right away. The GPU never has empty slots while users are waiting - like clearing each plate as soon as someone finishes!'
                },
                {
                    question: 'What does PagedAttention (used by vLLM) do?',
                    options: [
                        'It makes the model generate tokens faster',
                        'It allocates GPU memory in small pages on demand instead of large reserved blocks',
                        'It splits the model across multiple GPUs',
                        'It compresses the model weights to use less memory'
                    ],
                    correct: 1,
                    explanation: 'PagedAttention allocates GPU memory in small pages, only when needed - like a library lending books one at a time. Traditional systems reserve huge blocks of memory that go mostly unused, wasting 60-80% of GPU memory!'
                },
                {
                    question: 'What is the difference between the Prefill and Decode phases?',
                    options: [
                        'Prefill is on CPU, Decode is on GPU',
                        'Prefill processes the entire prompt at once (fast), Decode generates tokens one by one (slow)',
                        'Prefill generates tokens, Decode processes the prompt',
                        'There is no difference, they are the same thing'
                    ],
                    correct: 1,
                    explanation: 'Prefill processes your entire prompt in one pass (compute-bound, fast). Decode then generates the response one token at a time (memory-bound, slower). It is like reading the recipe all at once vs cooking one dish at a time!'
                },
                {
                    question: 'What is speculative decoding?',
                    options: [
                        'Using a bigger model for faster inference',
                        'Generating tokens randomly and hoping they are correct',
                        'A small draft model guesses tokens ahead, then the big model verifies them in a batch',
                        'Running inference on CPU instead of GPU for speculation'
                    ],
                    correct: 2,
                    explanation: 'Speculative decoding uses a small, fast "draft" model to guess several tokens, then the big model checks them all at once. If the guesses are right (and they often are!), you generate multiple tokens in the time it would take to generate one. Like having an intern draft an email for the boss to quickly approve!'
                }
            ]
        });
    },

    loadChapter15_4() {
        const container = document.getElementById('chapter-15-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 15 &bull; Chapter 15.4</span>
                <h1>External Memory</h1>
                <p class="chapter-subtitle">Giving AI a Library Card - How Models Look Things Up Instead of Guessing!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4DA}</span> What Is External Memory?</h2>
                <p>Imagine you are a student taking a test. Your <strong>brain</strong> remembers everything you studied - that is like an AI's <strong>parameters</strong> (the stuff it learned during training). But what if a question comes up about something you never studied?</p>
                <p>Without external memory, you would have to <strong>guess</strong> (and the AI might "hallucinate" a wrong answer). But with external memory, it is like being allowed to <strong>open your textbook and check the library</strong> during the test! The AI can look things up to give you accurate, up-to-date answers.</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Big Idea:</strong> An AI's parameters are its long-term memory from training. External memory lets the AI access information it was NOT trained on - like giving it a library card so it can look up facts, recent news, or your company's private documents!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9E0}</span> Four Types of External Memory</h2>
                <p>There are four main ways to give an AI extra memory. Each one works differently, like different tools in a student's toolkit:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F50D}</div>
                        <div style="font-weight:600;margin:6px 0;color:#3b82f6;">Vector Database (RAG)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Store document chunks as embeddings and retrieve the most similar ones for each query. Like a <strong>librarian who finds the most relevant books</strong> for your question. This is the most popular type of external memory today!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4D3}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">Episodic Memory</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Remember past conversations and events. Like a <strong>diary that the AI can flip through</strong> to recall what you talked about last week, your preferences, or things you asked before.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DD}</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">Working Memory</div>
                        <div style="font-size:12px;color:var(--text-secondary);">A short-term scratchpad for the current task. Like <strong>sticky notes on your desk</strong> where you jot down intermediate steps while solving a math problem. It gets cleared when the task is done.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F578}\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Knowledge Graphs</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Structured facts and relationships. Like a <strong>mind map</strong> connecting "dogs \u2192 are \u2192 animals \u2192 need \u2192 food". Great for answering questions that need reasoning across multiple facts!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F504}</span> The RAG Pipeline</h2>
                <p>RAG (Retrieval-Augmented Generation) is the most common way to add external memory. Here is how it works, step by step:</p>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:16px 0;">
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">1\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:4px 0;color:#ef4444;font-size:12px;">Chunk</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Split documents into small pieces (like cutting a book into paragraphs)</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">2\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:4px 0;color:#f59e0b;font-size:12px;">Embed</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Turn each chunk into a number vector (its "meaning fingerprint")</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">3\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:4px 0;color:#3b82f6;font-size:12px;">Store</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Save vectors in a database (like filing cards in a library catalog)</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">4\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:4px 0;color:#a855f7;font-size:12px;">Retrieve</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Use cosine similarity to find the most relevant chunks for a question</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">5\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:4px 0;color:#22c55e;font-size:12px;">Generate</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Feed retrieved chunks + question to the LLM for a grounded answer</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Cosine similarity</strong> measures how "close" two vectors point in the same direction. If your question embedding and a document chunk embedding point the same way, they are about the same topic! A score of 1.0 = perfect match, 0 = completely unrelated.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: External Memory Architecture</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Click a memory type to see how a query flows from the AI brain to that memory and back. Watch the AI look up information and generate an answer!</p>
                <div class="controls" style="margin-bottom:12px;">
                    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-primary btn-small" onclick="Chapter15.setMemoryType('vector')" id="btnMemVector" style="background:#3b82f6;">Vector DB (RAG)</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.setMemoryType('episodic')" id="btnMemEpisodic" style="background:#a855f7;opacity:0.5;">Episodic Memory</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.setMemoryType('working')" id="btnMemWorking" style="background:#f59e0b;opacity:0.5;">Working Memory</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.setMemoryType('knowledge')" id="btnMemKnowledge" style="background:#22c55e;opacity:0.5;">Knowledge Graph</button>
                        <button class="btn-primary btn-small" onclick="Chapter15.animateMemoryQuery()" style="background:#ec4899;">Send Query</button>
                    </div>
                </div>
                <div class="network-viz">
                    <canvas id="memoryCanvas" width="800" height="400"></canvas>
                </div>
                <div id="memoryInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Vector DB (RAG): The AI sends your question to a vector database, retrieves the most relevant document chunks, and uses them to generate an accurate answer.
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> RAG in Code</h2>
                <p>Here is how a basic RAG pipeline looks using LangChain and a vector database:</p>
                <div class="code-block"><pre>
<span class="comment"># pip install langchain chromadb openai</span>
<span class="keyword">from</span> langchain.text_splitter <span class="keyword">import</span> RecursiveCharacterTextSplitter
<span class="keyword">from</span> langchain.embeddings <span class="keyword">import</span> OpenAIEmbeddings
<span class="keyword">from</span> langchain.vectorstores <span class="keyword">import</span> Chroma

<span class="comment"># Step 1: Chunk your documents</span>
splitter = RecursiveCharacterTextSplitter(chunk_size=<span class="number">500</span>, overlap=<span class="number">50</span>)
chunks = splitter.split_documents(my_documents)

<span class="comment"># Step 2-3: Embed and store in vector database</span>
vectordb = Chroma.from_documents(chunks, OpenAIEmbeddings())

<span class="comment"># Step 4: Retrieve relevant chunks for a question</span>
results = vectordb.similarity_search(<span class="string">"What is photosynthesis?"</span>, k=<span class="number">3</span>)

<span class="comment"># Step 5: Feed to LLM for grounded answer</span>
context = <span class="string">"\\n"</span>.join([r.page_content <span class="keyword">for</span> r <span class="keyword">in</span> results])
prompt = <span class="string">f"Using this context:\\n{context}\\n\\nAnswer: What is photosynthesis?"</span>
                </pre></div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Why RAG matters:</strong> Without RAG, an LLM can only answer based on what it memorized during training. With RAG, it can access your private documents, the latest news, or any knowledge base - and it always cites its sources!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#3b82f6;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>External memory gives AI a library card</strong> so it can look up information instead of guessing. This reduces hallucinations and keeps answers accurate and up to date.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Four types of memory:</strong> Vector DB (RAG) for document search, Episodic for past conversations, Working for short-term scratchpad, and Knowledge Graphs for structured facts and relationships.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>RAG pipeline:</strong> Chunk documents, embed them as vectors, store in a database, retrieve the most relevant chunks using cosine similarity, then generate an answer with the retrieved context.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Cosine similarity</strong> is the secret sauce of retrieval. It measures how similar two vectors are by checking if they point in the same direction. This is how the AI finds the most relevant information for your question.</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter15.startQuiz15_4()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('15-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('15-5')">Next: Frontier Research & Future \u2192</button>
            </div>
        `;

        this.initMemoryCanvas();
    },

    // --- 15.4 Canvas & Interaction Methods ---

    initMemoryCanvas() {
        this.memoryType = 'vector';
        this.memoryQueryStep = 0;
        this.memoryAnimating = false;
        this.memoryQueryDots = [];
        this.memoryResultDots = [];
        this.memoryRetrievedSnippets = [];
        if (this.memoryAnimFrame) cancelAnimationFrame(this.memoryAnimFrame);

        this.drawMemoryCanvas();
    },

    setMemoryType(type) {
        this.memoryType = type;
        this.memoryQueryStep = 0;
        this.memoryAnimating = false;
        this.memoryQueryDots = [];
        this.memoryResultDots = [];
        this.memoryRetrievedSnippets = [];
        if (this.memoryAnimFrame) cancelAnimationFrame(this.memoryAnimFrame);

        const types = ['vector', 'episodic', 'working', 'knowledge'];
        const ids = ['btnMemVector', 'btnMemEpisodic', 'btnMemWorking', 'btnMemKnowledge'];
        types.forEach((t, i) => {
            const btn = document.getElementById(ids[i]);
            if (btn) btn.style.opacity = (t === type) ? '1' : '0.5';
        });

        const descriptions = {
            vector: 'Vector DB (RAG): The AI sends your question to a vector database, retrieves the most relevant document chunks, and uses them to generate an accurate answer.',
            episodic: 'Episodic Memory: The AI searches its diary of past conversations to remember what you talked about before, your preferences, and previous context.',
            working: 'Working Memory: The AI uses a short-term scratchpad to keep track of intermediate steps, like sticky notes it writes and reads while solving a problem.',
            knowledge: 'Knowledge Graph: The AI traverses a web of connected facts (like "dogs are animals" and "animals need food") to reason about relationships and answer complex questions.'
        };
        const info = document.getElementById('memoryInfo');
        if (info) info.textContent = descriptions[type] || '';

        this.drawMemoryCanvas();
    },

    animateMemoryQuery() {
        if (this.memoryAnimating) return;
        this.memoryAnimating = true;
        this.memoryQueryStep = 0;
        this.memoryQueryDots = [];
        this.memoryResultDots = [];
        this.memoryRetrievedSnippets = [];
        this.memoryAnimStartTime = Date.now();

        const memPositions = this._getMemoryPositions();
        const active = memPositions[this.memoryType];
        const brain = memPositions.brain;

        // Create query dot: brain -> memory
        this.memoryQueryDots.push({
            x: brain.x, y: brain.y,
            tx: active.x + active.w / 2, ty: active.y + active.h / 2,
            progress: 0, phase: 'query'
        });

        this._animateMemoryLoop();
    },

    _getMemoryPositions() {
        return {
            brain: { x: 400, y: 200, r: 50 },
            vector:    { x: 320, y: 20, w: 160, h: 55, color: '#3b82f6', label: 'Vector DB (RAG)', icon: 'Search' },
            episodic:  { x: 620, y: 140, w: 160, h: 55, color: '#a855f7', label: 'Episodic Memory', icon: 'Diary' },
            working:   { x: 320, y: 325, w: 160, h: 55, color: '#f59e0b', label: 'Working Memory', icon: 'Notes' },
            knowledge: { x: 20, y: 140, w: 160, h: 55, color: '#22c55e', label: 'Knowledge Graph', icon: 'Web' }
        };
    },

    _animateMemoryLoop() {
        if (!this.memoryAnimating) return;

        const elapsed = Date.now() - this.memoryAnimStartTime;
        const queryDuration = 1200;
        const resultDuration = 1200;
        const totalDuration = queryDuration + 400 + resultDuration + 600;

        const memPositions = this._getMemoryPositions();
        const active = memPositions[this.memoryType];
        const brain = memPositions.brain;

        // Phase 1: query dot travels brain -> memory
        if (elapsed < queryDuration) {
            const p = elapsed / queryDuration;
            if (this.memoryQueryDots.length > 0) {
                this.memoryQueryDots[0].progress = p;
            }
            this.memoryQueryStep = 1;
        }
        // Phase 2: pause at memory (retrieving)
        else if (elapsed < queryDuration + 400) {
            if (this.memoryQueryDots.length > 0) {
                this.memoryQueryDots[0].progress = 1;
            }
            this.memoryQueryStep = 2;
        }
        // Phase 3: result dots travel memory -> brain
        else if (elapsed < queryDuration + 400 + resultDuration) {
            this.memoryQueryStep = 3;
            const rp = (elapsed - queryDuration - 400) / resultDuration;

            if (this.memoryResultDots.length === 0) {
                const snippets = this._getMemorySnippets(this.memoryType);
                for (let i = 0; i < 3; i++) {
                    this.memoryResultDots.push({
                        x: active.x + active.w / 2, y: active.y + active.h / 2,
                        tx: brain.x, ty: brain.y,
                        progress: 0, offset: i * 0.12,
                        snippet: snippets[i]
                    });
                }
            }

            this.memoryResultDots.forEach(d => {
                d.progress = Math.max(0, Math.min(1, (rp - d.offset) / (1 - d.offset * 2)));
            });
        }
        // Phase 4: show retrieved snippets
        else if (elapsed < totalDuration) {
            this.memoryQueryStep = 4;
            this.memoryRetrievedSnippets = this._getMemorySnippets(this.memoryType);
        }
        else {
            this.memoryAnimating = false;
            this.memoryQueryStep = 4;
            this.memoryRetrievedSnippets = this._getMemorySnippets(this.memoryType);
        }

        this.drawMemoryCanvas();

        if (this.memoryAnimating) {
            this.memoryAnimFrame = requestAnimationFrame(() => this._animateMemoryLoop());
        }
    },

    _getMemorySnippets(type) {
        const snippets = {
            vector: ['"Photosynthesis converts light..."', '"Plants use chlorophyll to..."', '"The Calvin cycle produces..."'],
            episodic: ['"Last week you asked about..."', '"You prefer short answers..."', '"Your project is about ML..."'],
            working: ['"Step 1: Parse the query..."', '"Step 2: Found 3 relevant..."', '"Step 3: Combining results..."'],
            knowledge: ['"Dog -> is_a -> Animal"', '"Animal -> needs -> Food"', '"Dog -> needs -> Food (inferred)"']
        };
        return snippets[type] || snippets.vector;
    },

    drawMemoryCanvas() {
        const canvas = document.getElementById('memoryCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const time = Date.now() / 1000;
        const memPositions = this._getMemoryPositions();
        const brain = memPositions.brain;
        const activeType = this.memoryType;
        const types = ['vector', 'episodic', 'working', 'knowledge'];

        // Title
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('External Memory Architecture', W / 2, 18);

        // Draw connection lines from brain to each memory
        types.forEach(type => {
            const mem = memPositions[type];
            const mx = mem.x + mem.w / 2;
            const my = mem.y + mem.h / 2;
            const isActive = (type === activeType);

            ctx.beginPath();
            ctx.moveTo(brain.x, brain.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = isActive ? mem.color : 'rgba(100, 116, 139, 0.3)';
            ctx.lineWidth = isActive ? 2.5 : 1;
            ctx.setLineDash(isActive ? [] : [5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Draw brain (center circle)
        const brainPulse = 1 + Math.sin(time * 2) * 0.05;
        ctx.beginPath();
        ctx.arc(brain.x, brain.y, brain.r * brainPulse, 0, Math.PI * 2);
        const brainGrad = ctx.createRadialGradient(brain.x, brain.y, 0, brain.x, brain.y, brain.r);
        brainGrad.addColorStop(0, '#6366f1');
        brainGrad.addColorStop(1, '#4338ca');
        ctx.fillStyle = brainGrad;
        ctx.fill();
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Brain label
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI Brain', brain.x, brain.y - 8);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#c7d2fe';
        ctx.fillText('(Parameters)', brain.x, brain.y + 8);

        // Draw 4 memory type boxes
        types.forEach(type => {
            const mem = memPositions[type];
            const isActive = (type === activeType);

            this.drawRoundedRect(ctx, mem.x, mem.y, mem.w, mem.h, 10);
            ctx.fillStyle = isActive ? (mem.color + '33') : '#1e293b';
            ctx.fill();

            ctx.strokeStyle = isActive ? mem.color : '#334155';
            ctx.lineWidth = isActive ? 2.5 : 1.5;
            this.drawRoundedRect(ctx, mem.x, mem.y, mem.w, mem.h, 10);
            ctx.stroke();

            // Glow for active
            if (isActive && this.memoryQueryStep === 2) {
                ctx.shadowColor = mem.color;
                ctx.shadowBlur = 12 + Math.sin(time * 6) * 6;
                this.drawRoundedRect(ctx, mem.x, mem.y, mem.w, mem.h, 10);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Icon text
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = isActive ? '#ffffff' : '#94a3b8';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mem.label, mem.x + mem.w / 2, mem.y + mem.h / 2 - 8);

            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = isActive ? mem.color : '#64748b';
            ctx.fillText(mem.icon, mem.x + mem.w / 2, mem.y + mem.h / 2 + 10);
        });

        // Draw query dot (brain -> memory)
        if (this.memoryQueryDots.length > 0 && this.memoryQueryStep >= 1 && this.memoryQueryStep <= 2) {
            const dot = this.memoryQueryDots[0];
            const p = dot.progress;
            const dx = dot.x + (dot.tx - dot.x) * p;
            const dy = dot.y + (dot.ty - dot.y) * p;

            ctx.beginPath();
            ctx.arc(dx, dy, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#ec4899';
            ctx.fill();
            ctx.shadowColor = '#ec4899';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Label on query dot
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Q', dx, dy);
        }

        // Draw result dots (memory -> brain)
        if (this.memoryResultDots.length > 0 && this.memoryQueryStep >= 3) {
            const activeMem = memPositions[activeType];
            this.memoryResultDots.forEach((dot, i) => {
                const p = Math.min(1, dot.progress);
                const dx = dot.x + (dot.tx - dot.x) * p;
                const dy = dot.y + (dot.ty - dot.y) * p;

                ctx.beginPath();
                ctx.arc(dx, dy, 5, 0, Math.PI * 2);
                ctx.fillStyle = activeMem.color;
                ctx.fill();
                ctx.shadowColor = activeMem.color;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }

        // Draw retrieved snippets panel (bottom right)
        if (this.memoryQueryStep === 4 && this.memoryRetrievedSnippets.length > 0) {
            const panelX = 530;
            const panelY = 280;
            const panelW = 260;
            const panelH = 110;

            this.drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 8);
            ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
            ctx.fill();
            ctx.strokeStyle = memPositions[activeType].color;
            ctx.lineWidth = 1.5;
            this.drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 8);
            ctx.stroke();

            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = memPositions[activeType].color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('Retrieved Info:', panelX + 10, panelY + 10);

            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#cbd5e1';
            this.memoryRetrievedSnippets.forEach((snippet, i) => {
                ctx.fillText(snippet, panelX + 10, panelY + 30 + i * 24);
            });

            // Answer generated label
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillStyle = '#22c55e';
            ctx.fillText('Answer generated with retrieved context!', panelX + 10, panelY + panelH - 12);
        }

        // Draw question label near brain when animating
        if (this.memoryAnimating || this.memoryQueryStep > 0) {
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#ec4899';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('Query: "What is photosynthesis?"', brain.x, brain.y - brain.r - 10);
        }

        ctx.textBaseline = 'alphabetic';
    },

    startQuiz15_4() {
        Quiz.start({
            title: 'External Memory Quiz',
            chapterId: '15-4',
            questions: [
                {
                    question: 'What is the main benefit of giving an AI external memory?',
                    options: [
                        'It makes the model train faster',
                        'It lets the AI look up information instead of guessing, reducing hallucinations',
                        'It replaces the need for model parameters entirely',
                        'It makes the model use less GPU memory'
                    ],
                    correct: 1,
                    explanation: 'External memory lets the AI access information it was not trained on - like giving a student a library card during a test. Instead of guessing (hallucinating), the AI can look up facts, recent news, or your private documents for accurate answers!'
                },
                {
                    question: 'In a RAG pipeline, what happens during the "Retrieve" step?',
                    options: [
                        'The model is retrained on new documents',
                        'Documents are split into small chunks',
                        'Cosine similarity is used to find the most relevant document chunks for the question',
                        'The final answer is generated by the LLM'
                    ],
                    correct: 2,
                    explanation: 'The Retrieve step uses cosine similarity to compare the question embedding against all stored chunk embeddings, finding the most relevant pieces of information. It is like a librarian finding the most relevant books for your question!'
                },
                {
                    question: 'Which type of external memory is like a diary the AI can flip through?',
                    options: [
                        'Vector Database (RAG)',
                        'Working Memory',
                        'Knowledge Graph',
                        'Episodic Memory'
                    ],
                    correct: 3,
                    explanation: 'Episodic memory stores past conversations and events - like a diary! The AI can look back through previous interactions to remember your preferences, what you discussed before, and important context from earlier conversations.'
                },
                {
                    question: 'What does cosine similarity measure in a vector database?',
                    options: [
                        'How long two documents are',
                        'How similar the meanings of two text chunks are based on the direction their vectors point',
                        'The number of words two texts share',
                        'How fast the retrieval system can search'
                    ],
                    correct: 1,
                    explanation: 'Cosine similarity measures how close two vectors point in the same direction. If the question embedding and a document chunk embedding point the same way, they are about the same topic! A score of 1.0 means a perfect match, and 0 means completely unrelated.'
                },
                {
                    question: 'How is a Knowledge Graph different from a Vector Database?',
                    options: [
                        'Knowledge Graphs are faster than Vector Databases',
                        'Vector Databases use numbers while Knowledge Graphs store structured facts and relationships like a mind map',
                        'Knowledge Graphs can only store 100 facts',
                        'There is no difference, they are the same thing'
                    ],
                    correct: 1,
                    explanation: 'A Knowledge Graph stores structured facts and relationships - like a mind map connecting "dogs are animals" and "animals need food", so you can infer "dogs need food". A Vector Database stores unstructured text as number vectors and finds similar chunks. They solve different problems!'
                }
            ]
        });
    },

    loadChapter15_5() {
        const container = document.getElementById('chapter-15-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 15 &bull; Chapter 15.5</span>
                <h1>Frontier Research & Course Completion</h1>
                <p class="chapter-subtitle">Explore exciting future AI research areas, then pass the final quiz with <strong>${this.finalQuizPassPercent}%+</strong> to claim your certificate!</p>
            </div>

            <!-- ===== Frontier Research Section ===== -->
            <div class="section">
                <h2><span class="section-icon">\u{1F52D}</span> Frontier Research Overview</h2>
                <p>AI is moving super fast! Think of it like a rocket ship that keeps going higher and higher. Researchers around the world are working on amazing new ideas that will make AI even smarter and more helpful. Let's peek at what's coming next!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text">These are the cutting-edge topics that top AI labs (like Google DeepMind, OpenAI, Anthropic, and Meta) are actively researching right now. Some of these might change the world in just a few years!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F680}</span> Exciting Research Areas</h2>
                <p>Here are six big research areas that smart scientists are exploring. Each one is like a different superpower for AI!</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px;">

                    <div class="feature-card" style="border-left:3px solid #6366f1;">
                        <h3 style="color:#6366f1;margin:0 0 8px;">\u{1F916} Agentic AI</h3>
                        <p style="color:var(--text-secondary);margin:0;font-size:14px;line-height:1.6;">
                            Imagine an AI that can use tools all by itself - browsing the web, writing code, sending emails, and even ordering pizza! <strong>Agentic AI</strong> (like GLM-5 style systems) can plan steps, use different tools, and complete tasks without you telling it every little thing. It's like having a super-smart helper who knows how to figure things out on their own.
                        </p>
                    </div>

                    <div class="feature-card" style="border-left:3px solid #f59e0b;">
                        <h3 style="color:#f59e0b;margin:0 0 8px;">\u{1F30D} World Models</h3>
                        <p style="color:var(--text-secondary);margin:0;font-size:14px;line-height:1.6;">
                            What if AI could understand how the real world works - like gravity, bouncing balls, and pouring water? <strong>World Models</strong> let AI simulate entire environments in its head! This is how self-driving cars predict what other drivers will do and how robots learn to pick up objects without breaking them.
                        </p>
                    </div>

                    <div class="feature-card" style="border-left:3px solid #10b981;">
                        <h3 style="color:#10b981;margin:0 0 8px;">\u{1F3A8} Multimodal Reasoning</h3>
                        <p style="color:var(--text-secondary);margin:0;font-size:14px;line-height:1.6;">
                            Humans can see, hear, read, and feel all at once. <strong>Multimodal AI</strong> combines text, images, audio, and video understanding into one brain! It can look at a photo, listen to music, read a story, and understand how they all connect. Think of it like giving AI all five senses instead of just one.
                        </p>
                    </div>

                    <div class="feature-card" style="border-left:3px solid #ec4899;">
                        <h3 style="color:#ec4899;margin:0 0 8px;">\u{26A1} Efficient Architecture</h3>
                        <p style="color:var(--text-secondary);margin:0;font-size:14px;line-height:1.6;">
                            Today's AI models are HUGE and need tons of electricity. Researchers are building <strong>better attention mechanisms</strong> and <strong>longer context windows</strong> so AI can remember more while using less power. It's like making a car engine that goes faster but uses less gas - everyone wins!
                        </p>
                    </div>

                    <div class="feature-card" style="border-left:3px solid #ef4444;">
                        <h3 style="color:#ef4444;margin:0 0 8px;">\u{1F6E1}\u{FE0F} AI Safety & Alignment</h3>
                        <p style="color:var(--text-secondary);margin:0;font-size:14px;line-height:1.6;">
                            As AI gets more powerful, we need to make sure it stays helpful and doesn't cause harm. <strong>AI Safety</strong> researchers work on making AI systems that are <em>helpful, harmless, and honest</em>. It's like teaching a very strong friend to always be kind and follow the rules.
                        </p>
                    </div>

                    <div class="feature-card" style="border-left:3px solid #8b5cf6;">
                        <h3 style="color:#8b5cf6;margin:0 0 8px;">\u{1F9E0} Biological-AI Integration</h3>
                        <p style="color:var(--text-secondary);margin:0;font-size:14px;line-height:1.6;">
                            Scientists are connecting computers directly to human brains! <strong>Brain-computer interfaces</strong> help paralyzed people move robot arms with their thoughts. <strong>Neuromorphic computing</strong> builds computer chips that work like real brain cells - using tiny spikes of electricity instead of normal 0s and 1s.
                        </p>
                    </div>

                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4AB}</span> Frontier Research Mind Map</h2>
                <p>This constellation map shows how all these research areas connect to each other. Hover over a topic to see its connections light up!</p>
                <div class="canvas-container">
                    <canvas id="futureCanvas" width="800" height="400" style="background:#0d1220;border-radius:12px;cursor:pointer;max-width:100%;"></canvas>
                </div>
            </div>

            <!-- ===== Course Completion Banner ===== -->
            <div class="section" style="text-align:center; padding:30px;">
                <div style="font-size:48px;">\u{1F393}\u{1F389}</div>
                <h2 style="color: var(--accent-primary); margin:12px 0;">Congratulations!</h2>
                <p>You've completed all <strong>15 Modules</strong> and <strong>61 Chapters</strong> of the Deep Learning Interactive Tutorial!</p>
                <p style="color: var(--text-secondary);">From neurons to transformers, from attention mechanisms to production systems - you've covered it all.</p>
                <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin:20px 0;">
                    <div style="background:var(--bg-secondary);padding:16px 24px;border-radius:12px;border:1px solid var(--border);">
                        <div style="font-size:24px;color:var(--accent-primary);font-weight:700;" id="finalChapterCount">0</div>
                        <div style="color:var(--text-secondary);font-size:12px;">Chapters</div>
                    </div>
                    <div style="background:var(--bg-secondary);padding:16px 24px;border-radius:12px;border:1px solid var(--border);">
                        <div style="font-size:24px;color:var(--warning);font-weight:700;" id="finalXPCount">0</div>
                        <div style="color:var(--text-secondary);font-size:12px;">Total XP</div>
                    </div>
                    <div style="background:var(--bg-secondary);padding:16px 24px;border-radius:12px;border:1px solid var(--border);">
                        <div style="font-size:24px;color:var(--success);font-weight:700;" id="finalQuizCount">0</div>
                        <div style="color:var(--text-secondary);font-size:12px;">Quizzes</div>
                    </div>
                </div>
            </div>

            <!-- ===== Certification Section (existing, preserved) ===== -->
            <div class="section">
                <h2><span class="section-icon">\u{1F4DD}</span> Certification Rules</h2>
                <ul style="color: var(--text-secondary); padding-left: 20px; line-height: 1.9;">
                    <li>Final quiz has 10 questions from across the tutorial.</li>
                    <li>Pass mark is <strong style="color: var(--text-primary);">${this.finalQuizPassPercent}%</strong> or higher.</li>
                    <li>To generate a certificate, sign in with Google.</li>
                </ul>
                <div class="controls" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
                    <!-- <button class="btn-secondary" onclick="Chapter15.signInWithClerkGoogle()">Sign in with Google</button> -->
                    <button class="btn-secondary" onclick="App.showToast('Coming soon', 'Google sign-in flow is coming soon.')">Sign in with Google</button>
                    <button class="btn-primary" onclick="Chapter15.startFinalCertificationQuiz()">Start Final Quiz</button>
                </div>
                <p id="certAuthStatus" style="margin-top:10px;color:var(--text-secondary);font-size:13px;"></p>
            </div>

            <div class="section hidden" id="certificateSection">
                <h2><span class="section-icon">\u{1F393}</span> Your Certificate</h2>
                <div class="info-box success">
                    <span class="info-box-icon">\u{1F389}</span>
                    <span class="info-box-text" id="certificateText"></span>
                </div>
                <div class="controls" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
                    <button class="btn-primary" onclick="Chapter15.downloadCertificatePDF()">Download PDF Certificate</button>
                    <button class="btn-secondary" onclick="Chapter15.downloadCertificateTxt()">Download Text Certificate</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('15-4')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('1-1')">Back to Start</button>
            </div>
        `;

        this.refreshCertificationUI();

        // Populate course completion stats
        const stats = App.getStats();
        const chapterEl = document.getElementById('finalChapterCount');
        const xpEl = document.getElementById('finalXPCount');
        const quizEl = document.getElementById('finalQuizCount');
        if (chapterEl) chapterEl.textContent = stats.chaptersCompleted + '/' + stats.totalChapters;
        if (xpEl) xpEl.textContent = stats.xp.toLocaleString();
        if (quizEl) quizEl.textContent = stats.quizzesCompleted + '/' + stats.totalQuizzes;

        // Initialize future canvas mind map
        this.initFutureCanvas();
    },

    async signInWithClerkGoogle() {
        const key = window.CLERK_PUBLISHABLE_KEY;
        if (!window.Clerk || !key) {
            App.showToast('Clerk not configured', 'Set window.CLERK_PUBLISHABLE_KEY in index.html to enable Google login.');
            this.refreshCertificationUI();
            return;
        }

        try {
            if (!window.Clerk.loaded) {
                await window.Clerk.load({ publishableKey: key });
            }

            if (window.Clerk.user) {
                this.refreshCertificationUI();
                return;
            }

            if (typeof window.Clerk.openSignIn === 'function') {
                window.Clerk.openSignIn();
            } else {
                window.Clerk.redirectToSignIn();
            }
        } catch (err) {
            console.warn('Clerk sign-in error:', err);
            if (this.isDevBrowserUnauthenticated(err)) {
                this.showClerkRecoveryPrompt();
            }
            App.showToast('Login error', 'Could not start Clerk sign-in flow.');
        }
    },

    async getClerkUser() {
        const key = window.CLERK_PUBLISHABLE_KEY;
        if (!window.Clerk || !key) return null;

        try {
            if (!window.Clerk.loaded) {
                await window.Clerk.load({ publishableKey: key });
            }
            return window.Clerk.user || null;
        } catch (err) {
            console.warn('Clerk load error:', err);
            if (this.isDevBrowserUnauthenticated(err)) {
                this.showClerkRecoveryPrompt();
            }
            return null;
        }
    },

    isDevBrowserUnauthenticated(err) {
        const topMessage = (err && err.message) ? String(err.message).toLowerCase() : '';
        const nestedCode = err && err.errors && err.errors[0] && err.errors[0].code
            ? String(err.errors[0].code).toLowerCase()
            : '';
        const nestedMessage = err && err.errors && err.errors[0] && err.errors[0].message
            ? String(err.errors[0].message).toLowerCase()
            : '';

        return topMessage.includes('browser unauthenticated') ||
            nestedMessage.includes('browser unauthenticated') ||
            nestedCode === 'dev_browser_unauthenticated';
    },

    showClerkRecoveryPrompt() {
        const status = document.getElementById('certAuthStatus');
        if (!status) return;

        status.style.color = 'var(--warning)';
        status.innerHTML = `
            Clerk dev session looks stale (<code>dev_browser_unauthenticated</code>).
            <button class="btn-secondary btn-small" style="margin-left:8px;" onclick="Chapter15.resetClerkSessionAndReload()">
                Reset Clerk session &amp; reload
            </button>
        `;
    },

    resetClerkSessionAndReload() {
        const clearStorage = (storage) => {
            const keys = [];
            for (let i = 0; i < storage.length; i++) {
                const k = storage.key(i);
                if (k && k.toLowerCase().includes('clerk')) keys.push(k);
            }
            keys.forEach((k) => storage.removeItem(k));
        };

        try { clearStorage(localStorage); } catch (e) {}
        try { clearStorage(sessionStorage); } catch (e) {}

        // Best-effort cookie cleanup for current domain.
        try {
            document.cookie.split(';').forEach((cookie) => {
                const name = cookie.split('=')[0].trim();
                if (!name || !name.toLowerCase().includes('clerk')) return;
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            });
        } catch (e) {}

        window.location.reload();
    },

    async refreshCertificationUI() {
        const status = document.getElementById('certAuthStatus');
        if (!status) return;

        const user = await this.getClerkUser();
        if (user) {
            const name = user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || 'Learner';
            status.textContent = `Signed in as ${name}.`;
            status.style.color = 'var(--success)';
        } else if (window.CLERK_PUBLISHABLE_KEY) {
            status.textContent = 'Not signed in. Sign in with Google to unlock certificate generation.';
            status.style.color = 'var(--warning)';
        } else {
            status.textContent = 'Clerk is not configured yet. Add a publishable key to enable Google login.';
            status.style.color = 'var(--text-secondary)';
        }

        const cert = this.getSavedCertificate();
        const certSection = document.getElementById('certificateSection');
        const certText = document.getElementById('certificateText');
        if (cert && certSection && certText) {
            certSection.classList.remove('hidden');
            certText.textContent = `${cert.name} passed the Final Certification Exam with ${cert.percent}% on ${new Date(cert.issuedAt).toLocaleDateString()}.`;
        }
    },

    startFinalCertificationQuiz() {
        Quiz.start({
            title: 'Final Certification Exam',
            chapterId: '15-5',
            passPercent: this.finalQuizPassPercent,
            disableProgressTracking: true,
            onFinish: (result) => this.handleFinalCertificationResult(result),
            questions: [
                { question: 'What does quantization primarily reduce?', options: ['Model memory footprint', 'Training data size', 'Number of layers', 'Prompt length'], correct: 0, explanation: 'Quantization reduces weight precision, which cuts memory usage.' },
                { question: 'In data parallel training, each GPU typically has:', options: ['Different model architecture', 'A full model copy with different mini-batches', 'Only optimizer states', 'Only one layer'], correct: 1, explanation: 'Data parallelism replicates the model and splits data batches.' },
                { question: 'Which method protects important weights during low-bit quantization?', options: ['GGUF', 'AWQ', 'Dropout', 'AdamW'], correct: 1, explanation: 'AWQ is activation-aware and preserves critical weights.' },
                { question: 'What is the role of KV cache during inference?', options: ['Store user passwords', 'Speed up autoregressive decoding', 'Compress training dataset', 'Increase token limit automatically'], correct: 1, explanation: 'KV cache avoids recomputing past attention states.' },
                { question: 'RAG mainly helps with:', options: ['GPU overclocking', 'Reducing hallucinations with retrieved context', 'Replacing tokenization', 'Removing attention'], correct: 1, explanation: 'RAG grounds generation with relevant retrieved documents.' },
                { question: 'Softmax output is best interpreted as:', options: ['Learning rate schedule', 'Normalized confidence-like probabilities', 'Backprop graph', 'Gradient clipping value'], correct: 1, explanation: 'Softmax transforms logits into normalized probabilities.' },
                { question: 'Which metric pair is most useful for imbalanced classification?', options: ['Precision and Recall', 'FPS and latency', 'BLEU and ROUGE', 'MSE and MAE'], correct: 0, explanation: 'Precision/Recall better capture imbalance behavior.' },
                { question: 'Speculative decoding improves latency by:', options: ['Increasing model size', 'Drafting tokens then verifying quickly', 'Disabling cache', 'Using only CPU'], correct: 1, explanation: 'A small draft model proposes tokens and a larger model verifies.' },
                { question: 'A pass in this final exam requires at least:', options: ['60%', '70%', '80%', '90%'], correct: 2, explanation: `This certification requires ${this.finalQuizPassPercent}% or higher.` },
                { question: 'Before issuing a certificate in this app, the learner must:', options: ['Submit phone number', 'Sign in via Clerk Google login', 'Install Python', 'Buy a subscription'], correct: 1, explanation: 'Certificate issuance is gated by Clerk-based login.' }
            ]
        });
    },

    async handleFinalCertificationResult(result) {
        if (!result.passed) {
            App.showToast('Not passed yet', `You need ${this.finalQuizPassPercent}% or higher for certification.`);
            return;
        }

        const user = await this.getClerkUser();
        if (!user) {
            App.showToast('Login required', 'Please sign in with Google (Clerk), then retake or reopen the final exam to issue certificate.');
            this.refreshCertificationUI();
            return;
        }

        const name = user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || 'Learner';
        const cert = {
            name,
            percent: result.percent,
            score: result.score,
            total: result.total,
            issuedAt: Date.now()
        };

        localStorage.setItem(this.certificationStorageKey, JSON.stringify(cert));
        App.showToast('Certificate unlocked', `Congratulations ${name}!`);
        this.refreshCertificationUI();
    },

    getSavedCertificate() {
        try {
            const raw = localStorage.getItem(this.certificationStorageKey);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    downloadCertificatePDF() {
        const cert = this.getSavedCertificate();
        if (!cert) {
            App.showToast('No certificate', 'Pass the final exam and login first.');
            return;
        }

        const jsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!jsPDF) {
            App.showToast('PDF library missing', 'Could not load PDF generator. Try text download.');
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 36;

        // Background
        doc.setFillColor(12, 18, 32);
        doc.rect(0, 0, pageW, pageH, 'F');

        // Border
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(2);
        doc.rect(margin, margin, pageW - margin * 2, pageH - margin * 2, 'S');

        doc.setDrawColor(129, 140, 248);
        doc.setLineWidth(0.8);
        doc.rect(margin + 10, margin + 10, pageW - (margin + 10) * 2, pageH - (margin + 10) * 2, 'S');

        // Header
        doc.setTextColor(232, 234, 240);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.text('Certificate of Completion', pageW / 2, 120, { align: 'center' });

        doc.setTextColor(129, 140, 248);
        doc.setFontSize(18);
        doc.text('Deep Learning Interactive Tutorial', pageW / 2, 152, { align: 'center' });

        // Body
        doc.setTextColor(139, 149, 168);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.text('This certifies that', pageW / 2, 220, { align: 'center' });

        doc.setTextColor(232, 234, 240);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(30);
        doc.text(cert.name, pageW / 2, 268, { align: 'center' });

        doc.setTextColor(139, 149, 168);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.text('has successfully passed the Final Certification Exam', pageW / 2, 306, { align: 'center' });
        doc.text(`with a score of ${cert.score}/${cert.total} (${cert.percent}%).`, pageW / 2, 334, { align: 'center' });

        // Footer details
        const issuedDate = new Date(cert.issuedAt).toLocaleDateString();
        doc.setTextColor(232, 234, 240);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text(`Issued on: ${issuedDate}`, margin + 26, pageH - 78);
        doc.text('Pass requirement: 80%+', pageW - margin - 26, pageH - 78, { align: 'right' });

        doc.setTextColor(139, 149, 168);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('Generated by Deep Learning Interactive Tutorial', pageW / 2, pageH - 42, { align: 'center' });

        const safeName = cert.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'learner';
        doc.save(`deep-learning-certificate-${safeName}.pdf`);
    },

    downloadCertificateTxt() {
        const cert = this.getSavedCertificate();
        if (!cert) {
            App.showToast('No certificate', 'Pass the final exam and login first.');
            return;
        }

        const content = [
            'Deep Learning Interactive Tutorial - Certificate of Completion',
            '',
            `Awarded to: ${cert.name}`,
            `Score: ${cert.score}/${cert.total} (${cert.percent}%)`,
            `Issued on: ${new Date(cert.issuedAt).toLocaleDateString()}`,
            '',
            `This certifies successful completion of the final exam (${this.finalQuizPassPercent}%+ pass mark).`
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deep-learning-certificate.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // ============================================
    // 15.5 Future Canvas: Frontier Research Mind Map
    // ============================================
    initFutureCanvas() {
        if (this.futureAnimFrame) {
            cancelAnimationFrame(this.futureAnimFrame);
            this.futureAnimFrame = null;
        }

        const canvas = document.getElementById('futureCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H / 2;

        // Define 6 outer topic nodes arranged in a hexagon
        const colors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#ef4444', '#8b5cf6'];
        const labels = [
            'Agentic AI',
            'World Models',
            'Multimodal\nReasoning',
            'Efficient\nArchitecture',
            'AI Safety &\nAlignment',
            'Biological-AI\nIntegration'
        ];
        const radius = 150;

        this.futureTopics = labels.map((label, i) => {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            return {
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
                label: label,
                color: colors[i],
                radius: 38
            };
        });

        // Center node
        this.futureCenterNode = { x: cx, y: cy, label: 'Frontier\nResearch', color: '#38bdf8', radius: 44 };

        // Connections: each outer connects to center + its neighbors
        this.futureConnections = [];
        for (let i = 0; i < 6; i++) {
            // To center
            this.futureConnections.push([i, -1]); // -1 means center
            // To next neighbor
            this.futureConnections.push([i, (i + 1) % 6]);
        }
        // Extra cross-connections for related topics
        this.futureConnections.push([0, 2]); // Agentic AI <-> Multimodal
        this.futureConnections.push([1, 3]); // World Models <-> Efficient Arch
        this.futureConnections.push([4, 5]); // AI Safety <-> Biological-AI

        this.futureHover = -1;
        this.futureAnimStep = 0;

        // Mouse interaction
        const getNodeAt = (mx, my) => {
            for (let i = 0; i < this.futureTopics.length; i++) {
                const t = this.futureTopics[i];
                const dx = mx - t.x;
                const dy = my - t.y;
                if (dx * dx + dy * dy < t.radius * t.radius) return i;
            }
            // Check center
            const cdx = mx - this.futureCenterNode.x;
            const cdy = my - this.futureCenterNode.y;
            if (cdx * cdx + cdy * cdy < this.futureCenterNode.radius * this.futureCenterNode.radius) return -1;
            return -2; // nothing
        };

        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            this.futureHover = getNodeAt(mx, my);
        };

        canvas.onmouseleave = () => {
            this.futureHover = -2;
        };

        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            this.futureHover = getNodeAt(mx, my);
        };

        this.drawFutureCanvas();
    },

    drawFutureCanvas() {
        const canvas = document.getElementById('futureCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        this.futureAnimStep += 0.015;

        // Clear
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Draw subtle star-field background
        ctx.save();
        for (let i = 0; i < 60; i++) {
            const sx = ((i * 137.5) % W);
            const sy = ((i * 97.3 + 20) % H);
            const brightness = 0.2 + 0.15 * Math.sin(this.futureAnimStep * 2 + i);
            ctx.fillStyle = `rgba(255,255,255,${brightness})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        const topics = this.futureTopics;
        const center = this.futureCenterNode;
        if (!topics || topics.length === 0) return;

        const hoverIdx = this.futureHover;

        // Helper: does a connection involve the hovered node?
        const isConnRelated = (conn) => {
            if (hoverIdx === -2) return false;
            return conn[0] === hoverIdx || conn[1] === hoverIdx;
        };

        // Draw connections
        for (const conn of this.futureConnections) {
            const fromNode = conn[0] >= 0 ? topics[conn[0]] : center;
            const toNode = conn[1] >= 0 ? topics[conn[1]] : center;
            const related = hoverIdx !== -2 && isConnRelated(conn);

            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);

            if (related) {
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 2.5;
            } else if (hoverIdx !== -2) {
                ctx.strokeStyle = 'rgba(255,255,255,0.07)';
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 1;
            }
            ctx.stroke();

            // Animated pulse dot along connection
            if (related || hoverIdx === -2) {
                const t = (this.futureAnimStep * 0.5 + conn[0] * 0.3) % 1;
                const px = fromNode.x + (toNode.x - fromNode.x) * t;
                const py = fromNode.y + (toNode.y - fromNode.y) * t;
                const pulseColor = related ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)';
                ctx.beginPath();
                ctx.arc(px, py, related ? 3 : 2, 0, Math.PI * 2);
                ctx.fillStyle = pulseColor;
                ctx.fill();
            }
        }

        // Draw nodes (outer topics)
        for (let i = 0; i < topics.length; i++) {
            const t = topics[i];
            const isHovered = (hoverIdx === i);
            const isRelatedToHover = hoverIdx !== -2 && this.futureConnections.some(c => isConnRelated(c) && (c[0] === i || c[1] === i));
            const glowSize = isHovered ? 18 : (isRelatedToHover ? 10 : 6);
            const nodeAlpha = (hoverIdx !== -2 && !isHovered && !isRelatedToHover) ? 0.35 : 1.0;

            ctx.save();
            ctx.globalAlpha = nodeAlpha;

            // Glow
            const glow = ctx.createRadialGradient(t.x, t.y, t.radius * 0.3, t.x, t.y, t.radius + glowSize);
            glow.addColorStop(0, t.color + 'aa');
            glow.addColorStop(1, t.color + '00');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius + glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Node body
            this.drawRoundedRect(ctx, t.x - t.radius, t.y - t.radius, t.radius * 2, t.radius * 2, 12);
            ctx.fillStyle = '#0d1220';
            ctx.fill();
            ctx.strokeStyle = t.color;
            ctx.lineWidth = isHovered ? 3 : 2;
            ctx.stroke();

            // Label
            ctx.fillStyle = t.color;
            ctx.font = 'bold 11px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const lines = t.label.split('\n');
            const lineH = 13;
            const startY = t.y - ((lines.length - 1) * lineH) / 2;
            lines.forEach((line, li) => {
                ctx.fillText(line, t.x, startY + li * lineH);
            });

            ctx.restore();
        }

        // Draw center node
        {
            const c = center;
            const isHovered = (hoverIdx === -1);
            const pulseR = 2 * Math.sin(this.futureAnimStep * 2);
            const glowSize = isHovered ? 22 : (12 + pulseR);

            ctx.save();

            // Glow
            const glow = ctx.createRadialGradient(c.x, c.y, c.radius * 0.3, c.x, c.y, c.radius + glowSize);
            glow.addColorStop(0, c.color + 'cc');
            glow.addColorStop(1, c.color + '00');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius + glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Node body
            this.drawRoundedRect(ctx, c.x - c.radius, c.y - c.radius, c.radius * 2, c.radius * 2, 14);
            ctx.fillStyle = '#0d1220';
            ctx.fill();
            ctx.strokeStyle = c.color;
            ctx.lineWidth = isHovered ? 3.5 : 2.5;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 13px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const lines = c.label.split('\n');
            const lineH = 15;
            const startY = c.y - ((lines.length - 1) * lineH) / 2;
            lines.forEach((line, li) => {
                ctx.fillText(line, c.x, startY + li * lineH);
            });

            ctx.restore();
        }

        this.futureAnimFrame = requestAnimationFrame(() => this.drawFutureCanvas());
    }
};
