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

    loadChapter15_3() {
        const container = document.getElementById('chapter-15-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 15 &bull; Chapter 15.3</span>
                <h1>Inference Engines</h1>
                <p class="chapter-subtitle">How production systems serve LLM responses quickly and reliably.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u26A1</span> Core Ideas</h2>
                <ul style="color: var(--text-secondary); padding-left: 20px; line-height: 1.9;">
                    <li><strong style="color: var(--text-primary);">KV Cache:</strong> Reuse past attention state to avoid recomputing every token.</li>
                    <li><strong style="color: var(--text-primary);">Continuous Batching:</strong> Merge requests dynamically for high throughput.</li>
                    <li><strong style="color: var(--text-primary);">Speculative Decoding:</strong> Draft + verify tokens to reduce latency.</li>
                    <li><strong style="color: var(--text-primary);">Scheduling:</strong> Balance latency (single user) and throughput (many users).</li>
                </ul>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('15-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('15-4')">Next: External Memory \u2192</button>
            </div>
        `;
    },

    loadChapter15_4() {
        const container = document.getElementById('chapter-15-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 15 &bull; Chapter 15.4</span>
                <h1>External Memory</h1>
                <p class="chapter-subtitle">Grounding LLMs with retrieval systems for factual and up-to-date answers.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4DA}</span> RAG Memory Pipeline</h2>
                <ol style="color: var(--text-secondary); padding-left: 20px; line-height: 1.9;">
                    <li>Split documents into chunks.</li>
                    <li>Create embeddings for each chunk.</li>
                    <li>Store in a vector database.</li>
                    <li>Retrieve top-k chunks for each question.</li>
                    <li>Generate answer using retrieved context.</li>
                </ol>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text">External memory is key to reducing hallucinations and keeping responses aligned with your source documents.</span>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('15-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('15-5')">Next: Final Certification \u2192</button>
            </div>
        `;
    },

    loadChapter15_5() {
        const container = document.getElementById('chapter-15-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 15 &bull; Chapter 15.5</span>
                <h1>Final Certification Exam</h1>
                <p class="chapter-subtitle">Pass the final quiz with <strong>${this.finalQuizPassPercent}%+</strong> and claim your certificate.</p>
            </div>

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
                    <button class="btn-secondary" onclick="Chapter15.downloadCertificate()">Download Certificate</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('15-4')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('1-1')">Back to Start</button>
            </div>
        `;

        this.refreshCertificationUI();
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

    downloadCertificate() {
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
            'This certifies successful completion of the final exam (80%+ pass mark).'
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
    }
};
