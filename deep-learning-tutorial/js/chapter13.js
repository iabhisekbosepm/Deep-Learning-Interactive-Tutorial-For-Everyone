/* ============================================
   Chapter 13: Attention & Memory Optimization
   ============================================ */

const Chapter13 = {
    // State for 13.1 FlashAttention
    flashSeqLen: 512,
    flashAnimFrame: null,
    flashBlockIndex: 0,
    flashAnimating: false,
    flashMode: 'standard',

    // State for 13.2 Sparse Attention
    sparseAnimFrame: null,
    sparseMode: 'full',
    sparseK: 4,
    sparseGridSize: 16,
    sparseWeights: [],
    sparseHighlight: -1,

    // State for 13.3 MLA
    mlaAnimFrame: null,
    mlaLatentRatio: 0.3,
    mlaAnimStep: 0,
    mlaAnimating: false,

    // State for 13.4 KV Cache
    kvCacheAnimFrame: null,
    kvCacheTokens: [],
    kvCacheMode: 'standard',
    kvCacheGenerating: false,
    kvCacheStep: 0,

    // State for 13.5 Speculative Decoding
    specAnimFrame: null,
    specDraftLen: 3,
    specMode: 'standard',
    specTokens: [],
    specAnimating: false,
    specStep: 0,

    init() {
        App.registerChapter('13-1', () => this.loadChapter13_1());
        App.registerChapter('13-2', () => this.loadChapter13_2());
        App.registerChapter('13-3', () => this.loadChapter13_3());
        App.registerChapter('13-4', () => this.loadChapter13_4());
        App.registerChapter('13-5', () => this.loadChapter13_5());
    },

    // ============================================
    // 13.1: FlashAttention
    // ============================================
    loadChapter13_1() {
        const container = document.getElementById('chapter-13-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 13 &bull; Chapter 13.1</span>
                <h1>FlashAttention: Lightning-Fast Attention</h1>
                <p>What if you could read a really long book without running out of desk space? FlashAttention reads in smart little chunks instead of spreading the WHOLE book across the floor!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCD8</span> Definition, Why It Matters, Example</h2>
                <p><strong>Definition:</strong> <strong>FlashAttention</strong> is an attention algorithm that avoids materializing the full attention matrix in memory.</p>
                <p><strong>Why it matters:</strong> it cuts memory traffic and makes long-context attention much faster on GPUs.</p>
                <p><strong>Example:</strong> instead of storing all N\u00D7N attention scores at once, it processes blocks, updates the result, and moves on.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u26A1</span> The Big Memory Problem</h2>
                <p>Remember how attention works? The model looks at <strong>every word</strong> and compares it with <strong>every other word</strong>. If you have 1,000 words, that means building a giant table with 1,000 rows and 1,000 columns - that's <strong>1 million</strong> numbers to store!</p>
                <p>Imagine you're doing a school project and you need to compare every student in your class with every other student. With 30 kids, you need a chart with 900 boxes. But what if your class had 4,000 students? That's <strong>16 million boxes</strong>! Your desk would overflow!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>The Problem:</strong> Standard attention stores the ENTIRE N\u00D7N attention matrix in GPU memory (called HBM). For long sequences, this is HUGE and SLOW because the GPU keeps shuffling data back and forth!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4D6}</span> The Textbook Analogy</h2>
                <p>Think about reading a <strong>really big textbook</strong>:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DA}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Standard Attention</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Photocopy the ENTIRE textbook and spread ALL pages across your desk at once. Needs a HUGE desk! If the book is too big, you run out of space completely.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u26A1</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">FlashAttention</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Read ONE page at a time, take notes, then put it away and grab the next page. You only need space for ONE page! Works even for giant books!</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Key Insight:</strong> FlashAttention uses the GPU's tiny but SUPER fast memory (SRAM) to process small blocks, instead of the big but SLOW main memory (HBM). It's like using a small but lightning-fast notebook instead of a huge but slow filing cabinet!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Standard vs FlashAttention</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Move the slider to change the sequence length and watch how memory usage explodes for standard attention but stays small for FlashAttention!</p>
                <div class="controls" style="margin-bottom:12px;">
                    <label style="font-weight:600;color:var(--text-primary);">Sequence Length: <span id="flashSeqLenVal">512</span></label>
                    <input type="range" min="128" max="4096" value="512" step="64" style="width:100%;margin-top:8px;"
                        oninput="Chapter13.updateFlash(parseInt(this.value))">
                </div>
                <div style="display:flex;gap:10px;margin-bottom:12px;">
                    <button class="btn-primary btn-small" onclick="Chapter13.setFlashMode('standard')">Standard Attention</button>
                    <button class="btn-primary btn-small" onclick="Chapter13.setFlashMode('flash')">FlashAttention</button>
                    <button class="btn-primary btn-small" onclick="Chapter13.setFlashMode('compare')">Compare Both</button>
                </div>
                <div class="network-viz">
                    <canvas id="flashCanvas" width="800" height="400"></canvas>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                    <div id="flashStdMemStat" class="info-box" style="border-left-color:#ef4444;">
                        <span class="info-box-icon">\u{1F4E6}</span>
                        <span class="info-box-text"><strong>Standard Memory:</strong> <span id="flashStdMemVal">1.0 MB</span></span>
                    </div>
                    <div id="flashFlashMemStat" class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">\u26A1</span>
                        <span class="info-box-text"><strong>Flash Memory:</strong> <span id="flashFlashMemVal">0.03 MB</span></span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9F1}</span> How Block-wise Processing Works</h2>
                <p>FlashAttention divides the big attention matrix into <strong>small tiles</strong> (blocks). Instead of computing the whole thing at once, it processes one tile at a time:</p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">1\uFE0F\u20E3</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Load Block</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Load a small block of Q and K into fast SRAM memory</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">2\uFE0F\u20E3</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Compute</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Calculate attention scores for just this small block</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">3\uFE0F\u20E3</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Update</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Use the "online softmax trick" to update the running result</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">4\uFE0F\u20E3</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Next Block</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Throw away the block and move to the next one!</div>
                    </div>
                </div>
                <div class="info-box warning">
                    <span class="info-box-icon">\u{26A0}\uFE0F</span>
                    <span class="info-box-text"><strong>Tricky Part - Online Softmax:</strong> Normally, softmax needs to see ALL the scores at once. FlashAttention uses a clever math trick to compute softmax block-by-block, keeping a running maximum and sum. It gets the EXACT same answer as standard attention - not an approximation!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> SRAM vs HBM: The Speed Difference</h2>
                <p>Your GPU has two kinds of memory, just like your room has a desk and a closet:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F5C4}\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">HBM (Main Memory)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like a <strong>big closet</strong>: holds lots of stuff (40-80 GB) but it takes time to walk over and grab things. Bandwidth: ~2 TB/s</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DD}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">SRAM (Fast Cache)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like your <strong>desk</strong>: tiny (20 MB) but everything is RIGHT THERE - super fast to grab! Bandwidth: ~19 TB/s</div>
                    </div>
                </div>
                <p>FlashAttention keeps data on the fast "desk" (SRAM) as much as possible, only going to the slow "closet" (HBM) when absolutely necessary. This makes it <strong>2-4x faster</strong> than standard attention!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F522}</span> The Math Made Simple</h2>
                <p>Here's the memory comparison in simple numbers:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#ef4444;">Standard: O(N\u00B2) Memory</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            \u2022 N=512: stores <strong>262K</strong> numbers<br>
                            \u2022 N=2048: stores <strong>4.2M</strong> numbers<br>
                            \u2022 N=4096: stores <strong>16.8M</strong> numbers!
                        </div>
                    </div>
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#22c55e;">Flash: O(N) Memory</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            \u2022 N=512: stores <strong>512</strong> numbers<br>
                            \u2022 N=2048: stores <strong>2,048</strong> numbers<br>
                            \u2022 N=4096: stores <strong>4,096</strong> numbers!
                        </div>
                    </div>
                </div>
                <p>At N=4096, standard attention uses <strong>4,096x more memory</strong> than FlashAttention! That's like needing a warehouse vs a backpack!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> FlashAttention in Code</h2>
                <p>Using FlashAttention in real code is surprisingly simple:</p>
                <div class="code-block"><pre><span class="comment"># Standard Attention (the slow way)</span>
<span class="keyword">import</span> torch

Q, K, V = queries, keys, values
scores = torch.matmul(Q, K.T) / sqrt(d)  <span class="comment"># N\u00D7N matrix - HUGE!</span>
weights = torch.softmax(scores, dim=-1)    <span class="comment"># Stores full matrix</span>
output = torch.matmul(weights, V)          <span class="comment"># Final output</span>
<span class="comment"># Memory: O(N\u00B2) - ouch!</span>

<span class="comment"># FlashAttention (the fast way!)</span>
<span class="keyword">from</span> flash_attn <span class="keyword">import</span> flash_attn_func

<span class="comment"># Just one line! It handles the tiling automatically</span>
output = flash_attn_func(Q, K, V)
<span class="comment"># Memory: O(N) - amazing!</span>
<span class="comment"># Speed: 2-4x faster on real GPUs!</span></pre></div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Fun fact:</strong> FlashAttention was invented by Tri Dao at Stanford in 2022. FlashAttention-2 came in 2023, and FlashAttention-3 in 2024, each one even faster! It is now used in almost every major AI lab.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Standard attention uses O(N\u00B2) memory</strong> because it stores the full N\u00D7N attention matrix. This limits how long your sequences can be.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>FlashAttention tiles the computation</strong> into small blocks that fit in fast SRAM, processing them one at a time and never storing the full matrix.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>The online softmax trick</strong> lets you compute exact softmax block-by-block. No approximation needed - you get the SAME answer, just faster!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>SRAM is ~10x faster than HBM</strong> but much smaller. FlashAttention cleverly uses SRAM for computation and minimizes slow HBM reads/writes.</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter13.startQuiz13_1()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('12-5')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('13-2')">Next: Sparse Attention \u2192</button>
            </div>
        `;

        this.flashMode = 'compare';
        this.drawFlash();
    },

    setFlashMode(mode) {
        this.flashMode = mode;
        this.flashBlockIndex = 0;
        this.drawFlash();
    },

    updateFlash(val) {
        this.flashSeqLen = val;
        const label = document.getElementById('flashSeqLenVal');
        if (label) label.textContent = val;

        // Update memory stats
        const stdMem = (val * val * 4) / (1024 * 1024); // 4 bytes per float
        const flashMem = (val * 128 * 4) / (1024 * 1024); // block size ~128
        const stdEl = document.getElementById('flashStdMemVal');
        const flashEl = document.getElementById('flashFlashMemVal');
        if (stdEl) stdEl.textContent = stdMem >= 1 ? stdMem.toFixed(1) + ' MB' : (stdMem * 1024).toFixed(0) + ' KB';
        if (flashEl) flashEl.textContent = flashMem >= 1 ? flashMem.toFixed(2) + ' MB' : (flashMem * 1024).toFixed(0) + ' KB';

        this.drawFlash();
    },

    drawFlash() {
        const canvas = document.getElementById('flashCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const seqLen = this.flashSeqLen;
        const mode = this.flashMode;
        const time = Date.now() / 1000;

        if (mode === 'standard' || mode === 'compare') {
            this.drawFlashStandard(ctx, mode === 'compare' ? 30 : 150, 50, mode === 'compare' ? 320 : 500, 300, seqLen, time);
        }
        if (mode === 'flash' || mode === 'compare') {
            this.drawFlashTiled(ctx, mode === 'compare' ? 430 : 150, 50, mode === 'compare' ? 320 : 500, 300, seqLen, time);
        }

        // Title
        ctx.font = 'bold 16px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        if (mode === 'compare') {
            ctx.fillText('Standard Attention vs FlashAttention', W / 2, 30);
        } else if (mode === 'standard') {
            ctx.fillText('Standard Attention: Full N\u00D7N Matrix in Memory', W / 2, 30);
        } else {
            ctx.fillText('FlashAttention: Block-by-Block Processing', W / 2, 30);
        }

        // Memory comparison bar at bottom
        const stdMem = seqLen * seqLen;
        const flashMem = seqLen * 128;
        const maxMem = 4096 * 4096;
        const barY = H - 30;
        const barMaxW = W - 100;

        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Memory Usage:', 20, barY - 5);

        // Standard memory bar
        const stdBarW = Math.max(4, (stdMem / maxMem) * barMaxW * 0.7);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.fillRect(120, barY - 14, stdBarW, 10);
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'left';
        ctx.fillText('Std: ' + this.formatMemory(stdMem * 4), 120 + stdBarW + 6, barY - 5);

        // Flash memory bar
        const flashBarW = Math.max(4, (flashMem / maxMem) * barMaxW * 0.7);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.fillRect(120, barY + 2, flashBarW, 10);
        ctx.fillStyle = '#22c55e';
        ctx.fillText('Flash: ' + this.formatMemory(flashMem * 4), 120 + flashBarW + 6, barY + 11);

        if (this.flashAnimFrame) cancelAnimationFrame(this.flashAnimFrame);
        this.flashAnimFrame = requestAnimationFrame(() => this.drawFlash());
    },

    drawFlashStandard(ctx, x, y, w, h, seqLen, time) {
        // Draw the full NxN matrix
        const gridSize = Math.min(16, Math.ceil(seqLen / 64));
        const cellW = w / gridSize;
        const cellH = h / gridSize;

        // Label
        ctx.font = 'bold 13px Inter';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('Standard: Full N\u00D7N Matrix', x + w / 2, y - 6);

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                // All cells filled - representing full matrix in memory
                const wave = Math.sin(time * 2 + r * 0.5 + c * 0.3) * 0.15 + 0.55;
                const alpha = 0.3 + wave * 0.5;
                ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
                ctx.fillRect(x + c * cellW + 1, y + r * cellH + 1, cellW - 2, cellH - 2);

                // Glow for diagonal (self-attention is strongest)
                if (r === c) {
                    ctx.fillStyle = `rgba(245, 158, 11, ${0.4 + Math.sin(time * 3) * 0.2})`;
                    ctx.fillRect(x + c * cellW + 1, y + r * cellH + 1, cellW - 2, cellH - 2);
                }
            }
        }

        // Border
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // "ALL in HBM" label
        ctx.font = '11px Inter';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText('Entire matrix stored in slow HBM!', x + w / 2, y + h + 16);
    },

    drawFlashTiled(ctx, x, y, w, h, seqLen, time) {
        // Draw block-wise tiled processing
        const gridSize = Math.min(16, Math.ceil(seqLen / 64));
        const blockSize = 4;
        const numBlocks = Math.ceil(gridSize / blockSize);
        const cellW = w / gridSize;
        const cellH = h / gridSize;

        // Label
        ctx.font = 'bold 13px Inter';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText('FlashAttention: Block-by-Block', x + w / 2, y - 6);

        // Current active block (animated)
        const totalBlocks = numBlocks * numBlocks;
        const activeBlock = Math.floor(time * 1.5) % totalBlocks;
        const activeBlockRow = Math.floor(activeBlock / numBlocks);
        const activeBlockCol = activeBlock % numBlocks;

        for (let br = 0; br < numBlocks; br++) {
            for (let bc = 0; bc < numBlocks; bc++) {
                const isActive = (br === activeBlockRow && bc === activeBlockCol);
                const isPast = (br * numBlocks + bc) < activeBlock;

                for (let r = 0; r < blockSize && (br * blockSize + r) < gridSize; r++) {
                    for (let c = 0; c < blockSize && (bc * blockSize + c) < gridSize; c++) {
                        const gr = br * blockSize + r;
                        const gc = bc * blockSize + c;

                        if (isActive) {
                            // Currently processing - bright green with pulse
                            const pulse = 0.6 + Math.sin(time * 6) * 0.3;
                            ctx.fillStyle = `rgba(34, 197, 94, ${pulse})`;
                        } else if (isPast) {
                            // Already processed - dim
                            ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
                        } else {
                            // Not yet processed - very dim
                            ctx.fillStyle = 'rgba(99, 102, 241, 0.06)';
                        }
                        ctx.fillRect(x + gc * cellW + 1, y + gr * cellH + 1, cellW - 2, cellH - 2);
                    }
                }

                // Draw block border for active block
                if (isActive) {
                    ctx.strokeStyle = '#22c55e';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(
                        x + bc * blockSize * cellW,
                        y + br * blockSize * cellH,
                        Math.min(blockSize, gridSize - bc * blockSize) * cellW,
                        Math.min(blockSize, gridSize - br * blockSize) * cellH
                    );

                    // "SRAM" label near active block
                    ctx.font = 'bold 10px JetBrains Mono';
                    ctx.fillStyle = '#22c55e';
                    ctx.textAlign = 'center';
                    const lblX = x + bc * blockSize * cellW + Math.min(blockSize, gridSize - bc * blockSize) * cellW / 2;
                    const lblY = y + br * blockSize * cellH + Math.min(blockSize, gridSize - br * blockSize) * cellH / 2 + 4;
                    ctx.fillText('SRAM', lblX, lblY);
                }
            }
        }

        // Border
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Status label
        ctx.font = '11px Inter';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText(`Processing block ${activeBlock + 1}/${totalBlocks} in fast SRAM`, x + w / 2, y + h + 16);
    },

    formatMemory(bytes) {
        if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return bytes + ' B';
    },

    startQuiz13_1() {
        Quiz.start({
            title: 'FlashAttention Quiz',
            chapterId: '13-1',
            questions: [
                {
                    question: 'What does FlashAttention do differently from standard attention?',
                    options: [
                        'It uses more memory to be more accurate',
                        'It processes attention in small blocks using fast SRAM',
                        'It removes attention completely',
                        'It doubles the size of the model'
                    ],
                    correct: 1,
                    explanation: 'FlashAttention processes attention in small blocks (tiles) using the GPU\'s fast SRAM memory, instead of storing the entire N\u00D7N matrix in slow HBM!'
                },
                {
                    question: 'What is the memory complexity of standard attention vs FlashAttention?',
                    options: [
                        'Both are O(N)',
                        'Standard is O(N), Flash is O(N\u00B2)',
                        'Standard is O(N\u00B2), Flash is O(N)',
                        'Both are O(N\u00B2)'
                    ],
                    correct: 2,
                    explanation: 'Standard attention stores the full N\u00D7N matrix, so it uses O(N\u00B2) memory. FlashAttention processes block by block and only needs O(N) memory!'
                },
                {
                    question: 'What is the "online softmax trick" used for?',
                    options: [
                        'To make the model train faster',
                        'To compute exact softmax block-by-block without seeing all scores at once',
                        'To skip softmax entirely',
                        'To use a different activation function'
                    ],
                    correct: 1,
                    explanation: 'The online softmax trick lets FlashAttention compute the exact same softmax result by processing blocks one at a time, keeping a running maximum and sum. No approximation needed!'
                },
                {
                    question: 'Which type of GPU memory is FASTER but SMALLER?',
                    options: [
                        'HBM (High Bandwidth Memory)',
                        'RAM (Random Access Memory)',
                        'SRAM (Static Random Access Memory)',
                        'SSD (Solid State Drive)'
                    ],
                    correct: 2,
                    explanation: 'SRAM is the tiny but super-fast cache on the GPU (~20 MB, ~19 TB/s). HBM is the big but slower main memory (~40-80 GB, ~2 TB/s). FlashAttention keeps data in SRAM as much as possible!'
                },
                {
                    question: 'If you have a sequence of length 4096, how many times more memory does standard attention use compared to FlashAttention?',
                    options: [
                        '4x more',
                        '32x more',
                        '4,096x more',
                        '16 million times more'
                    ],
                    correct: 2,
                    explanation: 'Standard attention stores N\u00D7N = 4096\u00D74096 = 16.7M values. FlashAttention only needs ~N = 4096 values at any time. That is roughly 4,096x less memory!'
                }
            ]
        });
    },

    // ============================================
    // 13.2: Sparse Attention & DSA
    // ============================================
    loadChapter13_2() {
        const container = document.getElementById('chapter-13-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 13 &bull; Chapter 13.2</span>
                <h1>Sparse Attention & DeepSeek Sparse Attention</h1>
                <p>What if instead of reading every single word in a book, you could just highlight the important sentences? That is what Sparse Attention does!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4D6}</span> Not Every Word Matters Equally</h2>
                <p>When you read a long story, do you pay the same attention to <strong>every single word</strong>? Of course not! Words like "the", "a", and "is" are not very important. But words like "dragon", "treasure", and "exploded" are super exciting and important!</p>
                <p><strong>Sparse Attention</strong> works the same way. Instead of every word looking at every other word (which is slow), each word only looks at the <strong>most important</strong> other words. The rest get ignored!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Think of it this way:</strong> In a class of 100 students, instead of everyone talking to everyone (10,000 conversations!), each student only talks to their 5 best friends and the class president. That is only 600 conversations - much simpler!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AF}</span> Three Types of Sparse Attention</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F50D}</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Full Attention</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Every word looks at every other word. Most accurate but slowest. Like reading every page of every book in the library!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F3E0}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">Local Window</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Each word only looks at its nearby neighbors. Like only talking to kids sitting next to you. Fast but might miss distant info!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{2B50}</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">Top-K Sparse</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Each word picks the K most important words to attend to. Like raising your hand to pick only the best teammates for a project!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Attention Pattern Viewer</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Toggle between different attention patterns and see which cells light up! Bright cells mean high attention, dark cells mean ignored.</p>
                <div class="controls" style="margin-bottom:12px;">
                    <div style="display:flex;gap:10px;margin-bottom:10px;">
                        <button class="btn-primary btn-small" onclick="Chapter13.setSparseMode('full')">Full Attention</button>
                        <button class="btn-primary btn-small" onclick="Chapter13.setSparseMode('local')">Local Window</button>
                        <button class="btn-primary btn-small" onclick="Chapter13.setSparseMode('topk')">Top-K Sparse</button>
                        <button class="btn-primary btn-small" onclick="Chapter13.setSparseMode('dsa')">DSA (DeepSeek)</button>
                    </div>
                    <label style="font-weight:600;color:var(--text-primary);">K (Top-K tokens): <span id="sparseKVal">4</span></label>
                    <input type="range" min="1" max="16" value="4" step="1" style="width:100%;margin-top:8px;"
                        oninput="Chapter13.updateSparseK(parseInt(this.value))">
                </div>
                <div class="network-viz">
                    <canvas id="sparseCanvas" width="800" height="400"></canvas>
                </div>
                <div id="sparseInfoBox" class="info-box" style="margin-top:12px;">
                    <span class="info-box-icon">\u{1F4CA}</span>
                    <span class="info-box-text"><strong>Full Attention:</strong> Every token attends to every other token. 256 total attention connections for a 16-token sequence.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F680}</span> DeepSeek Sparse Attention (DSA)</h2>
                <p>DeepSeek's team had a brilliant idea: what if we could figure out which words are important <strong>BEFORE</strong> doing the expensive attention computation?</p>
                <p>DSA works in two clever steps:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">1\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">Quick Score</div>
                        <div style="font-size:12px;color:var(--text-secondary);">First, use a <strong>cheap</strong> scoring function to quickly estimate how important each token is. Like glancing at chapter titles before reading!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">2\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Attend to Winners</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Then, only compute full attention for the top-scoring tokens. Skip the boring ones entirely! Like only reading the highlighted pages.</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Why DSA is special:</strong> Other sparse methods use fixed patterns (like "always attend to nearby words"). DSA is <em>data-dependent</em> - it picks different important tokens for different inputs! It combines local window attention with Top-K selection for the best of both worlds.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3EB}</span> Real World Example: Studying for a Test</h2>
                <p>Imagine you have a 500-page textbook to study:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DA}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Full Attention Student</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Reads every word of every page. Takes 50 hours. Gets 95% but is exhausted and ran out of time.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F31F}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">DSA Student</div>
                        <div style="font-size:12px;color:var(--text-secondary);">First skims ALL chapters (10 min), highlights key sections, then carefully reads only those. Takes 10 hours. Gets 92%!</div>
                    </div>
                </div>
                <div class="info-box warning">
                    <span class="info-box-icon">\u{26A0}\uFE0F</span>
                    <span class="info-box-text"><strong>The tradeoff:</strong> Sparse attention is faster but might occasionally miss something important. The art is in choosing the right sparsity pattern! DSA is smart because it picks what to attend to based on the actual content, not a fixed rule.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> Sparse Attention in Code</h2>
                <div class="code-block"><pre><span class="comment"># Full Attention: O(N\u00B2) - every token sees all tokens</span>
attention_mask = torch.ones(N, N)  <span class="comment"># All 1s = attend everywhere</span>

<span class="comment"># Local Window Attention: O(N \u00D7 W)</span>
window_size = <span class="number">128</span>
<span class="keyword">for</span> i <span class="keyword">in</span> range(N):
    attention_mask[i, max(<span class="number">0</span>, i-window_size):i+window_size] = <span class="number">1</span>

<span class="comment"># Top-K Sparse Attention: O(N \u00D7 K)</span>
scores = compute_quick_scores(queries, keys)
top_k_indices = scores.topk(K).indices  <span class="comment"># Pick the K best!</span>
<span class="comment"># Only attend to these K tokens per query</span>

<span class="comment"># DeepSeek Sparse Attention: Local + Top-K</span>
local_mask = get_local_window(N, window=<span class="number">128</span>)
importance = cheap_score_function(queries, keys)
top_k_mask = importance.topk(K).indices
final_mask = local_mask | top_k_mask  <span class="comment"># Best of both!</span></pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Full attention is O(N\u00B2)</strong> - every token looks at every other. Accurate but very slow for long sequences.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Local window attention</strong> only looks at nearby tokens, making it O(N\u00D7W). Fast but might miss long-range connections.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Top-K sparse attention</strong> picks the K most important tokens to attend to. Smarter than fixed patterns!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>DeepSeek Sparse Attention (DSA)</strong> combines local + Top-K. It scores importance cheaply FIRST, then only computes full attention for winners. Data-dependent and efficient!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter13.startQuiz13_2()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('13-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('13-3')">Next: Multi-Head Latent Attention \u2192</button>
            </div>
        `;

        this.initSparseWeights();
        this.sparseMode = 'full';
        this.drawSparse();
    },

    initSparseWeights() {
        // Generate random attention weights for visualization
        const N = this.sparseGridSize;
        this.sparseWeights = [];
        for (let r = 0; r < N; r++) {
            this.sparseWeights[r] = [];
            for (let c = 0; c < N; c++) {
                // Higher weight for nearby tokens and some random "important" tokens
                const dist = Math.abs(r - c);
                const base = Math.exp(-dist * 0.3) * 0.5;
                const random = Math.random() * 0.5;
                this.sparseWeights[r][c] = base + random;
            }
            // Normalize row
            const sum = this.sparseWeights[r].reduce((a, b) => a + b, 0);
            this.sparseWeights[r] = this.sparseWeights[r].map(v => v / sum);
        }
    },

    setSparseMode(mode) {
        this.sparseMode = mode;
        // Update info box
        const info = document.getElementById('sparseInfoBox');
        if (info) {
            const N = this.sparseGridSize;
            const K = this.sparseK;
            const infoTexts = {
                'full': `<strong>Full Attention:</strong> Every token attends to every other token. ${N * N} total attention connections for a ${N}-token sequence.`,
                'local': `<strong>Local Window:</strong> Each token only attends to its ${Math.min(K * 2, N)} nearest neighbors. ${N * Math.min(K * 2, N)} connections - much fewer!`,
                'topk': `<strong>Top-K Sparse:</strong> Each token picks only the ${K} most important tokens. Just ${N * K} connections total!`,
                'dsa': `<strong>DSA (DeepSeek):</strong> Combines local window (${Math.min(4, K)} neighbors) + Top-${Math.max(1, K - 2)} important tokens. Smart and efficient!`
            };
            info.querySelector('.info-box-text').innerHTML = infoTexts[mode] || infoTexts['full'];
        }
        this.drawSparse();
    },

    updateSparseK(val) {
        this.sparseK = val;
        const label = document.getElementById('sparseKVal');
        if (label) label.textContent = val;
        this.setSparseMode(this.sparseMode); // refresh info text
        this.drawSparse();
    },

    drawSparse() {
        const canvas = document.getElementById('sparseCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const N = this.sparseGridSize;
        const K = this.sparseK;
        const mode = this.sparseMode;
        const time = Date.now() / 1000;

        // Grid dimensions
        const gridX = 120;
        const gridY = 50;
        const gridW = 340;
        const gridH = 320;
        const cellW = gridW / N;
        const cellH = gridH / N;

        // Title
        ctx.font = 'bold 15px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        const titles = {
            'full': 'Full Attention Pattern',
            'local': 'Local Window Attention',
            'topk': 'Top-K Sparse Attention',
            'dsa': 'DeepSeek Sparse Attention (DSA)'
        };
        ctx.fillText(titles[mode] || 'Attention Pattern', W / 2, 30);

        // Axis labels
        ctx.font = '11px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('Key Tokens \u2192', gridX + gridW / 2, gridY - 8);
        ctx.save();
        ctx.translate(gridX - 16, gridY + gridH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Query Tokens \u2192', 0, 0);
        ctx.restore();

        // Draw attention grid
        let activeCount = 0;
        let totalCount = N * N;

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const weight = this.sparseWeights[r] ? this.sparseWeights[r][c] : 0;
                let isActive = false;
                let alpha = 0;

                if (mode === 'full') {
                    isActive = true;
                    alpha = weight * 4;
                } else if (mode === 'local') {
                    const dist = Math.abs(r - c);
                    isActive = dist <= K;
                    alpha = isActive ? weight * 5 : 0.03;
                } else if (mode === 'topk') {
                    // Get top-K indices for this row
                    const row = this.sparseWeights[r] || [];
                    const sorted = row.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
                    const topIndices = sorted.slice(0, K).map(x => x.i);
                    isActive = topIndices.includes(c);
                    alpha = isActive ? weight * 5 : 0.03;
                } else if (mode === 'dsa') {
                    // DSA: local window + top-K on non-local
                    const dist = Math.abs(r - c);
                    const isLocal = dist <= Math.min(3, K);
                    const row = this.sparseWeights[r] || [];
                    const sorted = row.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
                    const topIndices = sorted.slice(0, Math.max(1, K - 2)).map(x => x.i);
                    isActive = isLocal || topIndices.includes(c);
                    alpha = isActive ? weight * 5 : 0.03;
                }

                if (isActive) activeCount++;

                // Color based on mode and activity
                alpha = Math.min(1, Math.max(0, alpha));
                const cx = gridX + c * cellW;
                const cy = gridY + r * cellH;

                if (isActive) {
                    const pulse = mode !== 'full' ? (0.85 + Math.sin(time * 2 + r * 0.3 + c * 0.2) * 0.15) : 1.0;
                    if (mode === 'full') {
                        ctx.fillStyle = `rgba(99, 102, 241, ${alpha * 0.7})`;
                    } else if (mode === 'local') {
                        ctx.fillStyle = `rgba(168, 85, 247, ${alpha * pulse * 0.8})`;
                    } else if (mode === 'topk') {
                        ctx.fillStyle = `rgba(245, 158, 11, ${alpha * pulse * 0.8})`;
                    } else {
                        // DSA: local = purple, topk = amber
                        const dist = Math.abs(r - c);
                        if (dist <= Math.min(3, K)) {
                            ctx.fillStyle = `rgba(168, 85, 247, ${alpha * pulse * 0.8})`;
                        } else {
                            ctx.fillStyle = `rgba(245, 158, 11, ${alpha * pulse * 0.8})`;
                        }
                    }
                } else {
                    ctx.fillStyle = `rgba(30, 41, 59, 0.5)`;
                }

                ctx.fillRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);
            }
        }

        // Grid border
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(gridX, gridY, gridW, gridH);

        // Stats panel on the right
        const statsX = 510;
        const statsY = 60;

        ctx.font = 'bold 14px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'left';
        ctx.fillText('Statistics', statsX, statsY);

        ctx.font = '12px Inter';
        ctx.fillStyle = '#94a3b8';
        const sparsity = ((1 - activeCount / totalCount) * 100).toFixed(1);
        const items = [
            { label: 'Grid Size:', value: `${N}\u00D7${N}`, color: '#e8eaf0' },
            { label: 'Total Cells:', value: totalCount.toString(), color: '#e8eaf0' },
            { label: 'Active Cells:', value: activeCount.toString(), color: '#22c55e' },
            { label: 'Skipped:', value: (totalCount - activeCount).toString(), color: '#ef4444' },
            { label: 'Sparsity:', value: sparsity + '%', color: '#f59e0b' },
            { label: 'Speedup:', value: (totalCount / Math.max(1, activeCount)).toFixed(1) + 'x', color: '#a855f7' }
        ];

        items.forEach((item, i) => {
            const iy = statsY + 28 + i * 26;
            ctx.font = '12px Inter';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, statsX, iy);
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.fillStyle = item.color;
            ctx.fillText(item.value, statsX + 110, iy);
        });

        // Legend
        const legendY = statsY + 220;
        ctx.font = 'bold 12px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'left';
        ctx.fillText('Legend:', statsX, legendY);

        const legendItems = [];
        if (mode === 'full') {
            legendItems.push({ color: '#6366f1', label: 'Attending' });
        } else if (mode === 'local') {
            legendItems.push({ color: '#a855f7', label: 'Local window' });
        } else if (mode === 'topk') {
            legendItems.push({ color: '#f59e0b', label: 'Top-K selected' });
        } else if (mode === 'dsa') {
            legendItems.push({ color: '#a855f7', label: 'Local window' });
            legendItems.push({ color: '#f59e0b', label: 'Top-K selected' });
        }
        legendItems.push({ color: '#1e293b', label: 'Ignored' });

        legendItems.forEach((item, i) => {
            const ly = legendY + 20 + i * 22;
            ctx.fillStyle = item.color;
            ctx.fillRect(statsX, ly - 8, 14, 14);
            ctx.font = '11px Inter';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, statsX + 20, ly + 3);
        });

        // Efficiency bar
        const barY = H - 30;
        const barX = 120;
        const barW = 340;
        const efficiency = activeCount / totalCount;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(barX, barY - 8, barW, 12);

        const effGrad = ctx.createLinearGradient(barX, 0, barX + barW * efficiency, 0);
        effGrad.addColorStop(0, '#22c55e');
        effGrad.addColorStop(1, '#6366f1');
        ctx.fillStyle = effGrad;
        ctx.fillRect(barX, barY - 8, barW * efficiency, 12);

        ctx.font = '11px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('Compute Used: ' + (efficiency * 100).toFixed(0) + '%', barX, barY + 16);

        if (this.sparseAnimFrame) cancelAnimationFrame(this.sparseAnimFrame);
        this.sparseAnimFrame = requestAnimationFrame(() => this.drawSparse());
    },

    startQuiz13_2() {
        Quiz.start({
            title: 'Sparse Attention & DSA Quiz',
            chapterId: '13-2',
            questions: [
                {
                    question: 'What does "sparse" mean in Sparse Attention?',
                    options: [
                        'The model uses more parameters',
                        'Each token only attends to a few important tokens instead of all of them',
                        'The model runs on fewer GPUs',
                        'Attention weights are always zero'
                    ],
                    correct: 1,
                    explanation: '"Sparse" means most attention connections are set to zero (skipped). Each token only looks at a small number of important tokens instead of all N tokens!'
                },
                {
                    question: 'How does Local Window attention decide which tokens to attend to?',
                    options: [
                        'It randomly picks tokens',
                        'It picks the tokens with the highest scores',
                        'It only attends to nearby (neighboring) tokens',
                        'It attends to every other token'
                    ],
                    correct: 2,
                    explanation: 'Local Window attention only looks at tokens that are close by (within a fixed window). Like only talking to the kids sitting next to you in class!'
                },
                {
                    question: 'What makes DeepSeek Sparse Attention (DSA) special compared to other sparse methods?',
                    options: [
                        'It uses more memory than standard attention',
                        'It scores importance BEFORE doing full attention, and the pattern depends on the input',
                        'It only works on English text',
                        'It removes attention layers completely'
                    ],
                    correct: 1,
                    explanation: 'DSA is data-dependent! It uses a cheap scoring function to estimate importance first, then only computes full attention for the top tokens. The pattern changes based on the actual input!'
                },
                {
                    question: 'If you have 1000 tokens and use Top-4 sparse attention, how many attention connections does each token have?',
                    options: [
                        '1,000 connections (all tokens)',
                        '4 connections (Top-4)',
                        '500 connections (half)',
                        '100 connections (10%)'
                    ],
                    correct: 1,
                    explanation: 'With Top-4, each of the 1000 tokens only attends to 4 other tokens. That is 4,000 total connections instead of 1,000,000 with full attention - a 250x reduction!'
                },
                {
                    question: 'What is a potential downside of sparse attention?',
                    options: [
                        'It always gives wrong answers',
                        'It uses more memory than full attention',
                        'It might occasionally miss important long-range connections',
                        'It cannot process any text at all'
                    ],
                    correct: 2,
                    explanation: 'The tradeoff is that sparse attention might miss some important connections between distant tokens. That is why methods like DSA combine local windows with Top-K selection to catch both nearby and important distant tokens!'
                }
            ]
        });
    },

    // ============================================
    // 13.3: Multi-Head Latent Attention (MLA)
    // ============================================
    loadChapter13_3() {
        const container = document.getElementById('chapter-13-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 13 &bull; Chapter 13.3</span>
                <h1>Multi-Head Latent Attention (MLA)</h1>
                <p>What if instead of keeping a full 10-page report, you wrote a super-short 2-page summary that has ALL the important info? That is how MLA saves memory!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4DD}</span> The KV Cache Problem</h2>
                <p>When a language model generates text, it needs to remember all the previous words. For each word, it stores two things: a <strong>Key</strong> (what this word is about) and a <strong>Value</strong> (what info this word carries). This is called the <strong>KV Cache</strong>.</p>
                <p>The problem? With many attention heads and long sequences, the KV cache gets <strong>ENORMOUS</strong>!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Example:</strong> A model like LLaMA-70B has 64 attention heads, each storing Keys and Values. For a 4096-token sequence, the KV cache alone uses over <strong>5 GB of memory</strong> per request! If you want to serve 100 users at once, that is 500 GB just for the cache!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4DA}</span> The Summary Analogy</h2>
                <p>Imagine you are a student working on a group project:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DA}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Standard MHA</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Every team member keeps their OWN copy of all 10 research papers. 8 members \u00D7 10 papers = <strong>80 copies</strong> to store! Your backpacks are BURSTING!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DD}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">MLA (Compressed)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The team writes ONE 2-page summary of all papers. Each member reads the summary and extracts what they need. Only <strong>1 summary</strong> to store!</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Key Idea:</strong> MLA compresses all the KV heads into a much smaller "latent" representation. When an attention head needs the K and V values, it decompresses them on-the-fly from this compact latent space. Invented by the DeepSeek team for DeepSeek-V2!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: MHA vs MLA Compression</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Drag the slider to change the latent compression ratio. Watch how the memory savings increase as you compress more!</p>
                <div class="controls" style="margin-bottom:12px;">
                    <label style="font-weight:600;color:var(--text-primary);">Latent Dimension Ratio: <span id="mlaRatioVal">0.30</span> <span id="mlaRatioLabel" style="color:#94a3b8;font-weight:400;">(30% of original size)</span></label>
                    <input type="range" min="0.1" max="1.0" value="0.3" step="0.05" style="width:100%;margin-top:8px;"
                        oninput="Chapter13.updateMLARatio(parseFloat(this.value))">
                </div>
                <div class="network-viz">
                    <canvas id="mlaCanvas" width="800" height="400"></canvas>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px;">
                    <div id="mlaMHAMemStat" class="info-box" style="border-left-color:#ef4444;">
                        <span class="info-box-icon">\u{1F4E6}</span>
                        <span class="info-box-text"><strong>MHA Cache:</strong> <span id="mlaMHAMemVal">5.24 GB</span></span>
                    </div>
                    <div id="mlaMLAMemStat" class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">\u{1F4DD}</span>
                        <span class="info-box-text"><strong>MLA Cache:</strong> <span id="mlaMLAMemVal">1.57 GB</span></span>
                    </div>
                    <div id="mlaSavingsStat" class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">\u{1F4B0}</span>
                        <span class="info-box-text"><strong>Savings:</strong> <span id="mlaSavingsVal">70%</span></span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9E9}</span> How MLA Works Step by Step</h2>
                <p>MLA has three main steps:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">1\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">Compress (Down-Project)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Squish all the KV heads into a tiny latent vector using a learned projection matrix. Like writing a summary!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">2\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Store (Cache)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Only store this tiny latent vector in the KV cache. Way smaller than storing all heads separately!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">3\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Expand (Up-Project)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">When needed, decompress the latent vector back into full K and V for each head. Like reading the summary to recall details!</div>
                    </div>
                </div>
                <div class="info-box warning">
                    <span class="info-box-icon">\u{26A0}\uFE0F</span>
                    <span class="info-box-text"><strong>The clever trick:</strong> The up-projection matrix can be absorbed into the attention computation! This means decompression happens automatically during attention, adding almost ZERO extra cost. Pure genius by the DeepSeek team!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3EB}</span> Comparing KV Cache Strategies</h2>
                <p>There are several approaches to reducing KV cache size. MLA is the most advanced:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DA}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Multi-Head Attention (MHA)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Each head has its own K and V. <strong>64 heads \u00D7 128 dim = 8,192 dims</strong> to cache. Full quality but maximum memory usage.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F465}</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">Grouped Query Attention (GQA)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Groups of heads share K and V. <strong>8 groups \u00D7 128 dim = 1,024 dims</strong> to cache. Used by LLaMA 3 and Gemma.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F464}</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Multi-Query Attention (MQA)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">ALL heads share one K and one V. <strong>1 \u00D7 128 dim = 128 dims</strong> to cache. Very small but loses some quality.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{2B50}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">MLA (DeepSeek-V2)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Compress ALL heads into a learned latent space. <strong>512 latent dims</strong> = tiny cache but FULL quality! Best of all worlds.</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Fun fact:</strong> DeepSeek-V2 used MLA to reduce its KV cache by over <strong>93%</strong> compared to standard MHA, while actually IMPROVING model quality! This is what made DeepSeek-V2 so efficient and cheap to run.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> MLA in Code</h2>
                <div class="code-block"><pre><span class="comment"># Standard MHA: Each head stores its own K, V</span>
num_heads = <span class="number">64</span>
head_dim = <span class="number">128</span>
kv_cache_dim = num_heads * head_dim * <span class="number">2</span>  <span class="comment"># = 16,384 per token!</span>

<span class="comment"># MLA: Compress to tiny latent space</span>
latent_dim = <span class="number">512</span>  <span class="comment"># Much smaller than 16,384!</span>

<span class="comment"># Down-project: compress KV into latent</span>
W_down = nn.Linear(hidden_dim, latent_dim)
latent = W_down(hidden_state)  <span class="comment"># Tiny! Store THIS in cache</span>

<span class="comment"># Up-project: expand latent back to full KV</span>
W_up_k = nn.Linear(latent_dim, num_heads * head_dim)
W_up_v = nn.Linear(latent_dim, num_heads * head_dim)
keys = W_up_k(latent)    <span class="comment"># Reconstruct K on the fly</span>
values = W_up_v(latent)  <span class="comment"># Reconstruct V on the fly</span>

<span class="comment"># Memory savings: 512 vs 16,384 = 97% reduction!</span></pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>The KV cache is a memory bottleneck</strong> - for long sequences with many heads, it can use tens of gigabytes of GPU memory, limiting how many users you can serve.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>MLA compresses KV into a latent space</strong> using learned projection matrices. Only the tiny latent vector is cached, saving 90%+ memory.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>The up-projection is absorbed into attention</strong>, so decompression is essentially free. You get massive memory savings with no quality loss!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>DeepSeek-V2 proved MLA works</strong> by reducing KV cache by 93% while maintaining or improving quality. This innovation is now being adopted by other models.</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter13.startQuiz13_3()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('13-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('13-4')">Next: KV Cache Optimization \u2192</button>
            </div>
        `;

        this.drawMLA();
    },

    updateMLARatio(val) {
        this.mlaLatentRatio = val;
        const ratioLabel = document.getElementById('mlaRatioVal');
        const descLabel = document.getElementById('mlaRatioLabel');
        if (ratioLabel) ratioLabel.textContent = val.toFixed(2);
        if (descLabel) descLabel.textContent = `(${Math.round(val * 100)}% of original size)`;

        // Update memory stats (model: 64 heads, 128 dim, 80 layers, 4096 tokens, 2 bytes per param)
        const numHeads = 64;
        const headDim = 128;
        const layers = 80;
        const seqLen = 4096;
        const bytesPerParam = 2;

        const mhaMem = numHeads * headDim * 2 * layers * seqLen * bytesPerParam; // K + V
        const mlaMem = Math.round(numHeads * headDim * val) * 2 * layers * seqLen * bytesPerParam;
        const savings = ((1 - mlaMem / mhaMem) * 100).toFixed(0);

        const mhaEl = document.getElementById('mlaMHAMemVal');
        const mlaEl = document.getElementById('mlaMLAMemVal');
        const savEl = document.getElementById('mlaSavingsVal');
        if (mhaEl) mhaEl.textContent = this.formatMemory(mhaMem);
        if (mlaEl) mlaEl.textContent = this.formatMemory(mlaMem);
        if (savEl) savEl.textContent = savings + '%';

        this.drawMLA();
    },

    drawMLA() {
        const canvas = document.getElementById('mlaCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const ratio = this.mlaLatentRatio;
        const time = Date.now() / 1000;
        const numHeads = 8; // visual heads
        const headBlockW = 30;
        const headBlockH = 20;

        // Title
        ctx.font = 'bold 15px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Multi-Head Attention (MHA) vs Multi-Head Latent Attention (MLA)', W / 2, 25);

        // === LEFT: MHA ===
        const mhaX = 40;
        const mhaY = 55;
        ctx.font = 'bold 13px Inter';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('Standard MHA', mhaX + 150, mhaY);

        // Draw heads as colored blocks (K + V for each head)
        ctx.font = '10px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('Each head stores its own K and V:', mhaX + 150, mhaY + 18);

        const headColors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

        for (let h = 0; h < numHeads; h++) {
            const hx = mhaX + 10 + h * 38;
            const hy = mhaY + 30;

            // K block
            const pulse = 0.7 + Math.sin(time * 2 + h * 0.5) * 0.3;
            ctx.fillStyle = headColors[h];
            ctx.globalAlpha = pulse;
            ctx.fillRect(hx, hy, headBlockW, headBlockH);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = headColors[h];
            ctx.lineWidth = 1;
            ctx.strokeRect(hx, hy, headBlockW, headBlockH);
            ctx.font = '8px JetBrains Mono';
            ctx.fillStyle = '#fff';
            ctx.fillText('K' + (h + 1), hx + headBlockW / 2, hy + 13);

            // V block
            ctx.fillStyle = headColors[h];
            ctx.globalAlpha = pulse * 0.7;
            ctx.fillRect(hx, hy + 24, headBlockW, headBlockH);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = headColors[h];
            ctx.strokeRect(hx, hy + 24, headBlockW, headBlockH);
            ctx.fillStyle = '#fff';
            ctx.fillText('V' + (h + 1), hx + headBlockW / 2, hy + 37);
        }

        // MHA memory bar
        const mhaBarY = mhaY + 90;
        const mhaBarW = 280;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(mhaX + 10, mhaBarY, mhaBarW, 20);
        const mhaGrad = ctx.createLinearGradient(mhaX + 10, 0, mhaX + 10 + mhaBarW, 0);
        mhaGrad.addColorStop(0, '#ef4444');
        mhaGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = mhaGrad;
        ctx.fillRect(mhaX + 10, mhaBarY, mhaBarW, 20);
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('KV Cache: 16,384 dims per token', mhaX + 10 + mhaBarW / 2, mhaBarY + 14);

        // Arrow down to cache
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mhaX + 150, mhaBarY + 24);
        ctx.lineTo(mhaX + 150, mhaBarY + 40);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mhaX + 145, mhaBarY + 36);
        ctx.lineTo(mhaX + 150, mhaBarY + 42);
        ctx.lineTo(mhaX + 155, mhaBarY + 36);
        ctx.fill();

        ctx.font = '11px Inter';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('HUGE cache!', mhaX + 150, mhaBarY + 56);

        // === RIGHT: MLA ===
        const mlaX = 430;
        const mlaY = 55;
        ctx.font = 'bold 13px Inter';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText('MLA (DeepSeek-V2)', mlaX + 150, mlaY);

        // Draw heads feeding into compressor
        ctx.font = '10px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('All heads compress into latent space:', mlaX + 150, mlaY + 18);

        for (let h = 0; h < numHeads; h++) {
            const hx = mlaX + 10 + h * 38;
            const hy = mlaY + 30;

            // Faded head blocks (being compressed)
            ctx.fillStyle = headColors[h];
            ctx.globalAlpha = 0.25;
            ctx.fillRect(hx, hy, headBlockW, headBlockH);
            ctx.fillRect(hx, hy + 24, headBlockW, headBlockH);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = headColors[h];
            ctx.lineWidth = 0.5;
            ctx.strokeRect(hx, hy, headBlockW, headBlockH);
            ctx.strokeRect(hx, hy + 24, headBlockW, headBlockH);

            // Arrow from head to latent
            ctx.strokeStyle = `rgba(34, 197, 94, 0.4)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(hx + headBlockW / 2, hy + 48);
            ctx.lineTo(mlaX + 10 + ratio * 280 / 2, mlaY + 90);
            ctx.stroke();
        }

        // MLA latent bar (smaller based on ratio)
        const mlaBarY = mlaY + 90;
        const mlaBarW = 280 * ratio;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(mlaX + 10, mlaBarY, 280, 20);
        const mlaGrad = ctx.createLinearGradient(mlaX + 10, 0, mlaX + 10 + mlaBarW, 0);
        mlaGrad.addColorStop(0, '#22c55e');
        mlaGrad.addColorStop(1, '#6366f1');
        ctx.fillStyle = mlaGrad;
        ctx.fillRect(mlaX + 10, mlaBarY, mlaBarW, 20);
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        const latentDims = Math.round(16384 * ratio);
        ctx.fillText(`Latent: ${latentDims} dims`, mlaX + 10 + mlaBarW / 2, mlaBarY + 14);

        // Arrow down
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mlaX + 10 + mlaBarW / 2, mlaBarY + 24);
        ctx.lineTo(mlaX + 10 + mlaBarW / 2, mlaBarY + 40);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mlaX + 5 + mlaBarW / 2, mlaBarY + 36);
        ctx.lineTo(mlaX + 10 + mlaBarW / 2, mlaBarY + 42);
        ctx.lineTo(mlaX + 15 + mlaBarW / 2, mlaBarY + 36);
        ctx.fillStyle = '#22c55e';
        ctx.fill();

        ctx.font = '11px Inter';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText('Tiny cache!', mlaX + 10 + mlaBarW / 2, mlaBarY + 56);

        // === BOTTOM: Memory Comparison Bar Chart ===
        const chartY = 230;
        const chartH = 130;
        const chartX = 100;
        const chartW = 600;

        ctx.font = 'bold 13px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Memory Usage Comparison (KV Cache per Token)', W / 2, chartY);

        // Bars for different strategies
        const strategies = [
            { name: 'MHA (64 heads)', dims: 16384, color: '#ef4444' },
            { name: 'GQA (8 groups)', dims: 2048, color: '#f59e0b' },
            { name: 'MQA (1 shared)', dims: 256, color: '#6366f1' },
            { name: 'MLA (latent)', dims: latentDims, color: '#22c55e' }
        ];

        const maxDims = 16384;
        const barHeight = 22;
        const barGap = 8;

        strategies.forEach((s, i) => {
            const by = chartY + 18 + i * (barHeight + barGap);
            const bw = Math.max(8, (s.dims / maxDims) * (chartW - 180));

            // Label
            ctx.font = '11px Inter';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'right';
            ctx.fillText(s.name, chartX + 110, by + 15);

            // Bar with animation
            const pulse = s.name.includes('MLA') ? (0.8 + Math.sin(time * 3) * 0.2) : 1.0;
            ctx.fillStyle = s.color;
            ctx.globalAlpha = pulse * 0.8;
            ctx.beginPath();
            ctx.roundRect(chartX + 120, by, bw, barHeight, 4);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Value label
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.fillStyle = s.color;
            ctx.textAlign = 'left';
            ctx.fillText(s.dims.toLocaleString() + ' dims', chartX + 126 + bw, by + 15);
        });

        // Savings callout
        const savingsPercent = ((1 - ratio) * 100).toFixed(0);
        ctx.font = 'bold 16px Inter';
        ctx.fillStyle = '#a855f7';
        ctx.textAlign = 'center';
        const calloutY = chartY + 18 + 4 * (barHeight + barGap) + 12;
        ctx.fillText(`MLA saves ${savingsPercent}% memory vs MHA!`, W / 2, calloutY);

        if (this.mlaAnimFrame) cancelAnimationFrame(this.mlaAnimFrame);
        this.mlaAnimFrame = requestAnimationFrame(() => this.drawMLA());
    },

    startQuiz13_3() {
        Quiz.start({
            title: 'Multi-Head Latent Attention (MLA) Quiz',
            chapterId: '13-3',
            questions: [
                {
                    question: 'What is the KV cache used for in language models?',
                    options: [
                        'Storing the model weights',
                        'Storing the Keys and Values from previous tokens during text generation',
                        'Caching the training data',
                        'Storing the loss function values'
                    ],
                    correct: 1,
                    explanation: 'The KV cache stores Keys and Values from previously generated tokens so the model does not have to recompute them. This makes generation faster but uses lots of memory!'
                },
                {
                    question: 'How does MLA reduce KV cache memory usage?',
                    options: [
                        'By deleting old tokens from the cache',
                        'By using fewer attention heads',
                        'By compressing all KV heads into a smaller latent vector',
                        'By using smaller numbers (lower precision)'
                    ],
                    correct: 2,
                    explanation: 'MLA uses a down-projection to compress all KV heads into a much smaller latent representation. Only this tiny latent vector is cached, saving 90%+ memory!'
                },
                {
                    question: 'Which model first introduced Multi-Head Latent Attention?',
                    options: [
                        'GPT-4',
                        'LLaMA 3',
                        'DeepSeek-V2',
                        'Claude'
                    ],
                    correct: 2,
                    explanation: 'DeepSeek-V2 introduced MLA as a key innovation. It allowed the model to achieve massive KV cache reduction (93%+) while maintaining or improving quality!'
                },
                {
                    question: 'In the summary analogy, what does the "2-page summary" represent?',
                    options: [
                        'The attention weights',
                        'The compressed latent vector that replaces the full KV cache',
                        'The model output',
                        'The training data'
                    ],
                    correct: 1,
                    explanation: 'The 2-page summary represents the latent vector. Instead of every team member (head) keeping their own copy of all papers (KV), one compact summary (latent) contains all the important information!'
                },
                {
                    question: 'What happens to model quality when using MLA with good compression?',
                    options: [
                        'Quality drops dramatically',
                        'Quality stays the same or even improves',
                        'The model stops working',
                        'Quality only improves for short texts'
                    ],
                    correct: 1,
                    explanation: 'Surprisingly, DeepSeek-V2 showed that MLA can maintain or even IMPROVE quality compared to standard MHA! The learned compression actually acts as a useful regularization.'
                }
            ]
        });
    },

    // ============================================
    // 13.4: KV Cache & Paged Attention
    // ============================================
    loadChapter13_4() {
        const container = document.getElementById('chapter-13-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 13 &bull; Chapter 13.4</span>
                <h1>KV Cache & Paged Attention</h1>
                <p>What if you could keep notes from every page you already read, so you never have to re-read them? That is what KV Cache does for AI models!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4D3}</span> The Note-Taking Analogy</h2>
                <p>Imagine you are writing a story one sentence at a time. Each time you write a new sentence, you need to re-read <strong>everything you already wrote</strong> to make sure the next sentence makes sense.</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DA}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Without KV Cache</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Every time you write a new sentence, you re-read the ENTIRE story from the beginning. Wrote 100 sentences? Re-read all 100 before writing sentence 101. Super slow!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DD}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">With KV Cache</div>
                        <div style="font-size:12px;color:var(--text-secondary);">You keep notes about every sentence you already read. For the next sentence, just check your notes and read the ONE new sentence. So much faster!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>How it works:</strong> When the model generates text token-by-token, it computes a Key and a Value for each token. Without cache, it recomputes ALL Keys and Values every single step. With cache, it stores them and only computes for the NEW token!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4DA}</span> Paged Attention: The Library Card Catalog</h2>
                <p>Even with KV Cache, there is another problem: <strong>memory waste</strong>. Normally, the computer reserves a big block of memory for each conversation, even if you do not use it all. That is like giving every library book its own shelf, even tiny pamphlets!</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4E6}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Fixed Allocation</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Reserve maximum memory upfront for every request. A 10-word chat gets same space as a 10,000-word essay. So wasteful!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F5C3}\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Paged Attention</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Break memory into small pages. Each request grabs pages as needed. Like a library card catalog - books go wherever there is room!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4B0}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">Result</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Up to 24x more users served at the same time! Memory that was wasted is now shared efficiently across many requests.</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Paged Attention</strong> was introduced in the vLLM project from UC Berkeley. It borrows the idea of "virtual memory pages" from operating systems. Instead of contiguous memory blocks, KV cache entries are stored in fixed-size pages that can be anywhere in memory!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: KV Cache Token Generation</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Watch how tokens are generated with different caching strategies. See how the cache grows and how much work is needed at each step!</p>
                <div class="controls" style="margin-bottom:12px;">
                    <div style="display:flex;gap:10px;margin-bottom:10px;">
                        <button class="btn-primary btn-small" onclick="Chapter13.setKVCacheMode('standard')">Standard (Recompute All)</button>
                        <button class="btn-primary btn-small" onclick="Chapter13.setKVCacheMode('cached')">KV Cache (Reuse)</button>
                        <button class="btn-primary btn-small" onclick="Chapter13.setKVCacheMode('paged')">Paged (Efficient Memory)</button>
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button class="btn-primary btn-small" onclick="Chapter13.startKVCacheAnim()">Generate Tokens</button>
                        <button class="btn-secondary btn-small" onclick="Chapter13.resetKVCache()">Reset</button>
                    </div>
                </div>
                <div class="network-viz">
                    <canvas id="kvCacheCanvas" width="800" height="400"></canvas>
                </div>
                <div id="kvCacheInfo" class="info-box" style="margin-top:12px;">
                    <span class="info-box-icon">\u{1F4CA}</span>
                    <span class="info-box-text"><strong>Standard Mode:</strong> All Key/Value pairs are recomputed at every step. Press "Generate Tokens" to watch the process.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F522}</span> The Numbers Tell the Story</h2>
                <p>Here is why KV Cache matters so much at scale:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#ef4444;">Without KV Cache: O(N\u00B2) work</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            \u2022 Token 1: compute 1 K,V<br>
                            \u2022 Token 10: recompute ALL 10 K,V<br>
                            \u2022 Token 100: recompute ALL 100 K,V<br>
                            \u2022 Total: 1+2+3+...+N = <strong>N\u00B2/2</strong> operations!
                        </div>
                    </div>
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#22c55e;">With KV Cache: O(N) work</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            \u2022 Token 1: compute 1 K,V and cache it<br>
                            \u2022 Token 10: compute ONLY 1 new K,V<br>
                            \u2022 Token 100: compute ONLY 1 new K,V<br>
                            \u2022 Total: just <strong>N</strong> operations!
                        </div>
                    </div>
                </div>
                <p>For a 1000-token response, that is the difference between <strong>500,000 operations</strong> and <strong>1,000 operations</strong> - a 500x speedup!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> KV Cache & Paged Attention in Code</h2>
                <div class="code-block"><pre><span class="comment"># Without KV Cache - recompute everything each step</span>
<span class="keyword">for</span> step <span class="keyword">in</span> range(output_length):
    all_tokens = prompt + generated_so_far
    K, V = compute_kv(all_tokens)  <span class="comment"># Recomputes ALL tokens!</span>
    next_token = attend(query, K, V)
    generated_so_far.append(next_token)

<span class="comment"># With KV Cache - only compute new token's K,V</span>
kv_cache = {}
<span class="keyword">for</span> step <span class="keyword">in</span> range(output_length):
    new_K, new_V = compute_kv(last_token)  <span class="comment"># Just ONE token!</span>
    kv_cache[step] = (new_K, new_V)
    all_K = concat([kv_cache[i][<span class="number">0</span>] <span class="keyword">for</span> i <span class="keyword">in</span> kv_cache])
    all_V = concat([kv_cache[i][<span class="number">1</span>] <span class="keyword">for</span> i <span class="keyword">in</span> kv_cache])
    next_token = attend(query, all_K, all_V)

<span class="comment"># Paged Attention (vLLM style)</span>
page_size = <span class="number">16</span>  <span class="comment"># tokens per page</span>
page_table = {}  <span class="comment"># maps logical page -> physical page</span>
<span class="comment"># Pages allocated on demand, not pre-allocated!</span>
<span class="comment"># Different requests can share physical pages</span></pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Without KV Cache, the model recomputes ALL Keys and Values</strong> at every generation step. This is O(N\u00B2) total work - painfully slow for long outputs.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>KV Cache stores previously computed Keys and Values</strong> so each new token only needs to compute its own K,V. Reduces total work from O(N\u00B2) to O(N).</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Fixed memory allocation wastes huge amounts of GPU memory</strong> because each request reserves the maximum possible space, even if it uses only a fraction.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Paged Attention breaks KV cache into small pages</strong> allocated on demand, like virtual memory in operating systems. This allows serving up to 24x more users simultaneously!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter13.startQuiz13_4()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('13-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('13-5')">Next: Speculative Decoding \u2192</button>
            </div>
        `;

        this.kvCacheMode = 'standard';
        this.kvCacheStep = 0;
        this.kvCacheTokens = [];
        this.kvCacheGenerating = false;
        this.drawKVCache();
    },

    setKVCacheMode(mode) {
        this.kvCacheMode = mode;
        const info = document.getElementById('kvCacheInfo');
        if (info) {
            const texts = {
                'standard': '<strong>Standard Mode:</strong> All Key/Value pairs are recomputed at every step. Watch how ALL bars flash each time a new token is generated!',
                'cached': '<strong>KV Cache Mode:</strong> Previously computed K,V pairs are reused. Only the NEW token (rightmost bar) needs computation. Much faster!',
                'paged': '<strong>Paged Mode:</strong> Like KV Cache, but memory is organized into fixed-size pages. Pages are allocated on demand and can be anywhere in memory. Efficient!'
            };
            info.innerHTML = '<span class="info-box-icon">\u{1F4CA}</span><span class="info-box-text">' + texts[mode] + '</span>';
        }
        this.kvCacheStep = 0;
        this.kvCacheTokens = [];
        this.kvCacheGenerating = false;
        this.drawKVCache();
    },

    startKVCacheAnim() {
        if (this.kvCacheGenerating) return;
        this.kvCacheGenerating = true;
        this.kvCacheStep = 0;
        this.kvCacheTokens = [];
        this.animateKVCache();
    },

    animateKVCache() {
        if (!this.kvCacheGenerating) return;
        if (this.kvCacheStep >= 12) {
            this.kvCacheGenerating = false;
            return;
        }
        this.kvCacheTokens.push({
            id: this.kvCacheStep,
            time: Date.now()
        });
        this.kvCacheStep++;
        this.drawKVCache();
        setTimeout(() => this.animateKVCache(), this.kvCacheMode === 'standard' ? 800 : 500);
    },

    resetKVCache() {
        this.kvCacheGenerating = false;
        this.kvCacheStep = 0;
        this.kvCacheTokens = [];
        this.drawKVCache();
    },

    drawKVCache() {
        const canvas = document.getElementById('kvCacheCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const time = Date.now() / 1000;
        const mode = this.kvCacheMode;
        const tokens = this.kvCacheTokens;
        const numTokens = tokens.length;

        // Title
        ctx.font = 'bold 15px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        const modeLabel = mode === 'standard' ? 'Standard (Recompute All)' : mode === 'cached' ? 'KV Cache (Reuse Previous)' : 'Paged Attention (Efficient Memory)';
        ctx.fillText('Token Generation: ' + modeLabel, W / 2, 25);

        // Token generation lane (left side)
        const tokenAreaX = 30;
        const tokenAreaY = 50;
        const tokenW = 50;
        const tokenH = 28;
        const tokenGap = 6;

        ctx.font = 'bold 12px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('Generated Tokens:', tokenAreaX, tokenAreaY);

        const sampleWords = ['The', 'cat', 'sat', 'on', 'the', 'warm', 'soft', 'red', 'old', 'mat', 'and', 'purred'];

        for (let i = 0; i < numTokens; i++) {
            const tx = tokenAreaX + (i % 6) * (tokenW + tokenGap);
            const ty = tokenAreaY + 10 + Math.floor(i / 6) * (tokenH + tokenGap);
            const isLatest = (i === numTokens - 1) && this.kvCacheGenerating;

            const pulse = isLatest ? (0.7 + Math.sin(time * 6) * 0.3) : 0.8;
            ctx.fillStyle = isLatest ? `rgba(59, 130, 246, ${pulse})` : 'rgba(99, 102, 241, 0.5)';
            ctx.beginPath();
            ctx.roundRect(tx, ty, tokenW, tokenH, 6);
            ctx.fill();

            if (isLatest) {
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(tx, ty, tokenW, tokenH, 6);
                ctx.stroke();
            }

            ctx.font = '11px Inter';
            ctx.fillStyle = '#e8eaf0';
            ctx.textAlign = 'center';
            ctx.fillText(sampleWords[i % sampleWords.length], tx + tokenW / 2, ty + 18);
        }

        if (numTokens === 0) {
            ctx.font = '13px Inter';
            ctx.fillStyle = '#4b5563';
            ctx.textAlign = 'center';
            ctx.fillText('Press "Generate Tokens" to start', tokenAreaX + 160, tokenAreaY + 50);
        }

        // KV Cache visualization (right side)
        const cacheX = 400;
        const cacheY = 50;
        const barW = 30;
        const barMaxH = 140;
        const barGap = 4;
        const pageSize = 4;

        ctx.font = 'bold 12px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('KV Cache Memory:', cacheX, cacheY);

        // Draw K row label
        ctx.font = '10px JetBrains Mono';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'right';
        ctx.fillText('Keys', cacheX - 6, cacheY + 50);
        ctx.fillStyle = '#a855f7';
        ctx.fillText('Values', cacheX - 6, cacheY + 50 + barMaxH / 2 + 20);

        for (let i = 0; i < numTokens; i++) {
            const bx = cacheX + i * (barW + barGap);
            if (bx + barW > W - 20) break;

            const isLatest = (i === numTokens - 1) && this.kvCacheGenerating;
            const age = (Date.now() - tokens[i].time) / 1000;

            // Key bar
            let kAlpha, vAlpha;
            if (mode === 'standard') {
                // All flash/recompute each step
                const flash = this.kvCacheGenerating ? (0.3 + Math.sin(time * 8 + i * 0.5) * 0.4) : 0.5;
                kAlpha = flash;
                vAlpha = flash;
            } else {
                // Cache: old ones are solid, new one pulses
                kAlpha = isLatest ? (0.5 + Math.sin(time * 6) * 0.4) : 0.7;
                vAlpha = isLatest ? (0.5 + Math.sin(time * 6) * 0.4) : 0.7;
            }

            const kBarH = barMaxH / 2 - 4;
            const vBarH = barMaxH / 2 - 4;

            // Page boundaries for paged mode
            if (mode === 'paged' && i > 0 && i % pageSize === 0) {
                ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 3]);
                ctx.beginPath();
                ctx.moveTo(bx - barGap / 2, cacheY + 16);
                ctx.lineTo(bx - barGap / 2, cacheY + 16 + barMaxH + 20);
                ctx.stroke();
                ctx.setLineDash([]);

                // Page label
                ctx.font = '8px JetBrains Mono';
                ctx.fillStyle = '#a855f7';
                ctx.textAlign = 'center';
                ctx.fillText('P' + Math.floor(i / pageSize), bx - barGap / 2, cacheY + 16 + barMaxH + 32);
            }

            // Key bar (top)
            const kyStart = cacheY + 20;
            ctx.fillStyle = `rgba(245, 158, 11, ${kAlpha})`;
            ctx.beginPath();
            ctx.roundRect(bx, kyStart, barW, kBarH, 3);
            ctx.fill();

            if (isLatest) {
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(bx, kyStart, barW, kBarH, 3);
                ctx.stroke();
            }

            // Value bar (bottom)
            const vyStart = kyStart + kBarH + 8;
            ctx.fillStyle = `rgba(168, 85, 247, ${vAlpha})`;
            ctx.beginPath();
            ctx.roundRect(bx, vyStart, barW, vBarH, 3);
            ctx.fill();

            if (isLatest) {
                ctx.strokeStyle = '#c084fc';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(bx, vyStart, barW, vBarH, 3);
                ctx.stroke();
            }

            // Token index label
            ctx.font = '9px JetBrains Mono';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText('t' + i, bx + barW / 2, vyStart + vBarH + 14);
        }

        // Page labels for paged mode (first page)
        if (mode === 'paged' && numTokens > 0) {
            ctx.font = '8px JetBrains Mono';
            ctx.fillStyle = '#a855f7';
            ctx.textAlign = 'center';
            ctx.fillText('P0', cacheX + Math.min(pageSize, numTokens) * (barW + barGap) / 2 - barGap / 2, cacheY + 16 + barMaxH + 32);
        }

        // Work indicator at bottom
        const workY = H - 80;
        ctx.font = 'bold 12px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('Computation per step:', 30, workY);

        if (numTokens > 0) {
            const maxWork = 12;
            const workBarMaxW = W - 80;

            let currentWork, totalWork, workColor, workLabel;
            if (mode === 'standard') {
                currentWork = numTokens;
                totalWork = numTokens * (numTokens + 1) / 2;
                workColor = '#ef4444';
                workLabel = `Step ${numTokens}: Recomputing ALL ${numTokens} K,V pairs (total work: ${totalWork})`;
            } else {
                currentWork = 1;
                totalWork = numTokens;
                workColor = '#22c55e';
                workLabel = `Step ${numTokens}: Computing only 1 new K,V pair (total work: ${totalWork})`;
            }

            const workBarW = Math.max(8, (currentWork / maxWork) * workBarMaxW);
            ctx.fillStyle = workColor;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.roundRect(30, workY + 10, workBarW, 18, 4);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.font = '11px Inter';
            ctx.fillStyle = workColor;
            ctx.textAlign = 'left';
            ctx.fillText(workLabel, 30, workY + 46);
        }

        // Memory usage bar
        const memY = H - 25;
        if (numTokens > 0) {
            const memUsed = mode === 'paged' ?
                Math.ceil(numTokens / 4) * 4 :
                (mode === 'standard' ? numTokens : numTokens);
            const memMax = 12;
            const memBarW = Math.max(8, (memUsed / memMax) * (W - 250));
            const memColor = mode === 'paged' ? '#a855f7' : (mode === 'cached' ? '#22c55e' : '#ef4444');

            ctx.font = '11px Inter';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'left';
            ctx.fillText('Memory:', 30, memY);
            ctx.fillStyle = memColor;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.roundRect(100, memY - 12, memBarW, 14, 3);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.fillStyle = memColor;
            ctx.textAlign = 'left';
            const wasteLabel = mode === 'paged' ? ` (${Math.ceil(numTokens / 4)} pages, minimal waste)` : '';
            ctx.fillText(`${memUsed} slots used${wasteLabel}`, 100 + memBarW + 8, memY);
        }

        if (this.kvCacheAnimFrame) cancelAnimationFrame(this.kvCacheAnimFrame);
        if (this.kvCacheGenerating || numTokens > 0) {
            this.kvCacheAnimFrame = requestAnimationFrame(() => this.drawKVCache());
        }
    },

    startQuiz13_4() {
        Quiz.start({
            title: 'KV Cache & Paged Attention Quiz',
            chapterId: '13-4',
            questions: [
                {
                    question: 'What does the KV Cache store?',
                    options: [
                        'The model weights for each layer',
                        'The previously computed Keys and Values for each token',
                        'The training data used to build the model',
                        'The final output predictions'
                    ],
                    correct: 1,
                    explanation: 'The KV Cache stores the Keys and Values computed for previous tokens during text generation. This way, the model does not need to recompute them when generating each new token!'
                },
                {
                    question: 'Without KV Cache, how much total work is needed to generate N tokens?',
                    options: [
                        'O(N) - linear',
                        'O(N\u00B2) - quadratic',
                        'O(log N) - logarithmic',
                        'O(1) - constant'
                    ],
                    correct: 1,
                    explanation: 'Without KV Cache, generating token i requires recomputing all i Key/Value pairs. The total work is 1+2+3+...+N = N(N+1)/2 = O(N\u00B2). With KV Cache, it drops to just O(N)!'
                },
                {
                    question: 'What real-world concept inspired Paged Attention?',
                    options: [
                        'A library card catalog',
                        'Virtual memory pages in operating systems',
                        'Page numbers in a book',
                        'Social media pages'
                    ],
                    correct: 1,
                    explanation: 'Paged Attention borrows the concept of virtual memory pages from operating systems. Memory is divided into fixed-size pages that can be allocated on demand and stored anywhere in physical memory!'
                },
                {
                    question: 'What is the main problem that Paged Attention solves?',
                    options: [
                        'Making the model more accurate',
                        'Reducing memory waste from fixed-size pre-allocation',
                        'Making tokens generate faster',
                        'Reducing the number of attention heads'
                    ],
                    correct: 1,
                    explanation: 'Without Paged Attention, each request pre-allocates the maximum possible memory, wasting huge amounts. Paged Attention allocates memory in small pages on demand, reducing waste and allowing up to 24x more concurrent users!'
                },
                {
                    question: 'Which project introduced Paged Attention for LLM serving?',
                    options: [
                        'PyTorch',
                        'TensorFlow',
                        'vLLM',
                        'Hugging Face'
                    ],
                    correct: 2,
                    explanation: 'vLLM (from UC Berkeley) introduced Paged Attention, which dramatically improved LLM serving throughput by efficiently managing KV cache memory using an OS-inspired paging system.'
                }
            ]
        });
    },

    // ============================================
    // 13.5: Speculative Decoding & Batching
    // ============================================
    loadChapter13_5() {
        const container = document.getElementById('chapter-13-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 13 &bull; Chapter 13.5</span>
                <h1>Speculative Decoding & Continuous Batching</h1>
                <p>What if a fast but less accurate friend guesses what you will write next, and you just check if they are right? That is Speculative Decoding!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3C3}</span> The Guessing Game Analogy</h2>
                <p>Imagine you are a <strong>very smart but very slow</strong> writer. It takes you 10 seconds to write each word. Your friend is <strong>not as smart but super fast</strong> - they can write a word in 1 second.</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F422}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Standard Decoding</div>
                        <div style="font-size:12px;color:var(--text-secondary);">You (the big model) write every word yourself, one at a time. 10 words = 100 seconds. Accurate but slow!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F680}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Speculative Decoding</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Your fast friend guesses 3 words (3 sec). You check all 3 at once (10 sec). If 2 are right, you got 3 words in 13 sec instead of 30!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Key Insight:</strong> A small "draft" model quickly predicts several tokens. The large "verifier" model checks them all <strong>in parallel</strong> (not one by one!). Accepted tokens are kept, rejected ones are regenerated. The output quality is <strong>identical</strong> to using the big model alone!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4E6}</span> Continuous Batching: No More Waiting</h2>
                <p>In a restaurant, imagine if the waiter had to wait for <strong>everyone</strong> at a table to finish eating before clearing ANY plates. Table 1 has a slow eater? Everyone waits!</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F37D}\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Static Batching</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Wait for ALL requests in the batch to finish before starting ANY new ones. Short requests waste time waiting for long ones!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F3C3}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Continuous Batching</div>
                        <div style="font-size:12px;color:var(--text-secondary);">As soon as one request finishes, a new one takes its slot. No wasted time! Like clearing plates as people finish, not all at once.</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Continuous batching</strong> (also called "iteration-level scheduling") processes requests as they arrive and depart. Combined with speculative decoding, this gives massive throughput improvements - serving 2-3x more users with the same hardware!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Speculative Decoding Race</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Watch a side-by-side race between standard decoding and speculative decoding. See how many tokens get accepted vs rejected!</p>
                <div class="controls" style="margin-bottom:12px;">
                    <div style="display:flex;gap:10px;margin-bottom:10px;">
                        <label style="font-weight:600;color:var(--text-primary);">Draft Length: <span id="specDraftLenVal">3</span></label>
                        <input type="range" min="1" max="5" value="3" step="1" style="width:200px;"
                            oninput="Chapter13.updateSpecDraftLen(parseInt(this.value))">
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button class="btn-primary btn-small" onclick="Chapter13.startSpecAnim()">Start Race</button>
                        <button class="btn-secondary btn-small" onclick="Chapter13.resetSpec()">Reset</button>
                    </div>
                </div>
                <div class="network-viz">
                    <canvas id="specCanvas" width="800" height="400"></canvas>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                    <div id="specStdStat" class="info-box" style="border-left-color:#ef4444;">
                        <span class="info-box-icon">\u{1F422}</span>
                        <span class="info-box-text"><strong>Standard:</strong> <span id="specStdCount">0</span> tokens generated</span>
                    </div>
                    <div id="specSpecStat" class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">\u{1F680}</span>
                        <span class="info-box-text"><strong>Speculative:</strong> <span id="specSpecCount">0</span> tokens generated (<span id="specAcceptRate">0%</span> accepted)</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9E9}</span> How Speculative Decoding Works Step by Step</h2>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">1\uFE0F\u20E3</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Draft</div>
                        <div style="font-size:10px;color:var(--text-secondary);">The small fast model generates K draft tokens quickly (like your friend guessing)</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">2\uFE0F\u20E3</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Verify</div>
                        <div style="font-size:10px;color:var(--text-secondary);">The big model checks ALL K tokens at once in a single forward pass (parallel!)</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">3\uFE0F\u20E3</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Accept/Reject</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Keep accepted tokens (green), discard rejected ones (red). Usually 70-90% get accepted!</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">4\uFE0F\u20E3</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Repeat</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Start again from the last accepted token. The output is EXACTLY what the big model would produce!</div>
                    </div>
                </div>
                <div class="info-box warning">
                    <span class="info-box-icon">\u{26A0}\uFE0F</span>
                    <span class="info-box-text"><strong>Important guarantee:</strong> Speculative decoding produces the EXACT same output as the big model alone. It is not an approximation! The verification step ensures mathematical equivalence using a clever rejection sampling scheme.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> Speculative Decoding in Code</h2>
                <div class="code-block"><pre><span class="comment"># Speculative Decoding: Draft + Verify</span>
draft_model = SmallFastModel()   <span class="comment"># e.g., 1B parameters</span>
target_model = BigSlowModel()    <span class="comment"># e.g., 70B parameters</span>
K = <span class="number">3</span>  <span class="comment"># number of draft tokens</span>

<span class="keyword">while</span> <span class="keyword">not</span> done:
    <span class="comment"># Step 1: Draft K tokens quickly</span>
    draft_tokens = draft_model.generate(context, K)

    <span class="comment"># Step 2: Verify ALL at once (single forward pass!)</span>
    target_probs = target_model.forward(context + draft_tokens)

    <span class="comment"># Step 3: Accept or reject each draft token</span>
    <span class="keyword">for</span> i <span class="keyword">in</span> range(K):
        <span class="keyword">if</span> accept(draft_probs[i], target_probs[i]):
            context.append(draft_tokens[i])  <span class="comment"># Keep it!</span>
        <span class="keyword">else</span>:
            context.append(sample(target_probs[i]))  <span class="comment"># Use big model's token</span>
            <span class="keyword">break</span>  <span class="comment"># Start new draft from here</span>

<span class="comment"># Continuous Batching (iteration-level scheduling)</span>
active_requests = []
<span class="keyword">while</span> server_running:
    <span class="comment"># Add new requests to batch immediately</span>
    active_requests += get_new_requests()
    <span class="comment"># Process one step for all active requests</span>
    results = model.forward_batch(active_requests)
    <span class="comment"># Remove finished requests, keep going with rest</span>
    active_requests = [r <span class="keyword">for</span> r <span class="keyword">in</span> active_requests <span class="keyword">if not</span> r.done]</pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Standard decoding generates one token at a time</strong> from the big model. Each token requires a full forward pass through the entire model. Accurate but slow.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Speculative decoding uses a small draft model</strong> to quickly guess several tokens, then the big model verifies them all in one pass. Typically 2-3x faster with identical output quality!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Static batching wastes GPU time</strong> because all requests in a batch must finish before new ones start. Short requests sit idle while waiting for long ones.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Continuous batching adds and removes requests on the fly</strong>, keeping the GPU busy at all times. Combined with speculative decoding, this maximizes throughput for real-world serving.</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter13.startQuiz13_5()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('13-4')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('14-1')">Next: Reasoning Models \u2192</button>
            </div>
        `;

        this.specMode = 'standard';
        this.specStep = 0;
        this.specTokens = [];
        this.specAnimating = false;
        this.drawSpec();
    },

    updateSpecDraftLen(val) {
        this.specDraftLen = val;
        const label = document.getElementById('specDraftLenVal');
        if (label) label.textContent = val;
    },

    startSpecAnim() {
        if (this.specAnimating) return;
        this.specAnimating = true;
        this.specTokens = [];
        this.specStep = 0;
        this.specStdTokens = 0;
        this.specSpecTokens = 0;
        this.specAccepted = 0;
        this.specTotal = 0;
        this.specStdTime = 0;
        this.specSpecTime = 0;
        this.specPhase = 'running';
        this.animateSpec();
    },

    resetSpec() {
        this.specAnimating = false;
        this.specTokens = [];
        this.specStep = 0;
        this.specStdTokens = 0;
        this.specSpecTokens = 0;
        this.specAccepted = 0;
        this.specTotal = 0;
        const stdEl = document.getElementById('specStdCount');
        const specEl = document.getElementById('specSpecCount');
        const rateEl = document.getElementById('specAcceptRate');
        if (stdEl) stdEl.textContent = '0';
        if (specEl) specEl.textContent = '0';
        if (rateEl) rateEl.textContent = '0%';
        this.drawSpec();
    },

    animateSpec() {
        if (!this.specAnimating) return;

        const targetTokens = 20;
        const draftLen = this.specDraftLen;

        // Standard: one token at a time (slow)
        if (this.specStdTokens < targetTokens) {
            this.specStdTokens++;
            this.specStdTime++;
        }

        // Speculative: draft several, verify, accept/reject
        if (this.specSpecTokens < targetTokens) {
            // Draft phase (fast, takes 1 time unit total for all draft tokens)
            this.specSpecTime++;
            // Verify phase (takes 1 time unit)
            this.specSpecTime++;

            for (let d = 0; d < draftLen && this.specSpecTokens < targetTokens; d++) {
                this.specTotal++;
                // Acceptance probability depends on draft length (shorter = higher acceptance)
                const acceptProb = 0.85 - (draftLen - 1) * 0.05;
                if (Math.random() < acceptProb) {
                    this.specAccepted++;
                    this.specSpecTokens++;
                    this.specTokens.push({ type: 'accepted', step: this.specStep });
                } else {
                    this.specSpecTokens++;
                    this.specTokens.push({ type: 'rejected', step: this.specStep });
                    break; // Stop at first rejection
                }
            }
        }

        // Update UI
        const stdEl = document.getElementById('specStdCount');
        const specEl = document.getElementById('specSpecCount');
        const rateEl = document.getElementById('specAcceptRate');
        if (stdEl) stdEl.textContent = this.specStdTokens;
        if (specEl) specEl.textContent = this.specSpecTokens;
        if (rateEl && this.specTotal > 0) rateEl.textContent = Math.round(this.specAccepted / this.specTotal * 100) + '%';

        this.specStep++;
        this.drawSpec();

        if (this.specStdTokens < targetTokens || this.specSpecTokens < targetTokens) {
            setTimeout(() => this.animateSpec(), 400);
        } else {
            this.specAnimating = false;
        }
    },

    drawSpec() {
        const canvas = document.getElementById('specCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const time = Date.now() / 1000;
        const stdTokens = this.specStdTokens || 0;
        const specTokens = this.specSpecTokens || 0;
        const tokens = this.specTokens || [];
        const targetTokens = 20;

        // Title
        ctx.font = 'bold 15px Inter';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Standard Decoding vs Speculative Decoding Race', W / 2, 25);

        // === TOP LANE: Standard Decoding ===
        const laneH = 130;
        const stdY = 50;
        const specY = 220;
        const laneX = 30;
        const laneW = W - 60;
        const tokenW = 32;
        const tokenH = 36;
        const tokenGap = 4;

        // Standard lane background
        ctx.fillStyle = 'rgba(239, 68, 68, 0.06)';
        ctx.beginPath();
        ctx.roundRect(laneX, stdY, laneW, laneH, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(laneX, stdY, laneW, laneH, 8);
        ctx.stroke();

        // Standard lane label
        ctx.font = 'bold 13px Inter';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'left';
        ctx.fillText('\u{1F422} Standard: One token at a time (Big Model)', laneX + 12, stdY + 20);

        // Standard tokens
        for (let i = 0; i < stdTokens; i++) {
            const tx = laneX + 12 + i * (tokenW + tokenGap);
            const ty = stdY + 35;
            if (tx + tokenW > laneX + laneW - 10) break;

            const isLatest = (i === stdTokens - 1) && this.specAnimating;
            const alpha = isLatest ? (0.5 + Math.sin(time * 6) * 0.4) : 0.7;

            ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
            ctx.beginPath();
            ctx.roundRect(tx, ty, tokenW, tokenH, 5);
            ctx.fill();

            if (isLatest) {
                ctx.strokeStyle = '#fca5a5';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(tx, ty, tokenW, tokenH, 5);
                ctx.stroke();
            }

            ctx.font = '9px JetBrains Mono';
            ctx.fillStyle = '#e8eaf0';
            ctx.textAlign = 'center';
            ctx.fillText('t' + i, tx + tokenW / 2, ty + 22);
        }

        // Standard progress bar
        const stdProgress = stdTokens / targetTokens;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.beginPath();
        ctx.roundRect(laneX + 12, stdY + laneH - 30, laneW - 24, 14, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.beginPath();
        ctx.roundRect(laneX + 12, stdY + laneH - 30, Math.max(4, (laneW - 24) * stdProgress), 14, 4);
        ctx.fill();
        ctx.font = '10px Inter';
        ctx.fillStyle = '#fca5a5';
        ctx.textAlign = 'center';
        ctx.fillText(`${stdTokens}/${targetTokens} tokens`, laneX + laneW / 2, stdY + laneH - 19);

        // === BOTTOM LANE: Speculative Decoding ===
        ctx.fillStyle = 'rgba(34, 197, 94, 0.06)';
        ctx.beginPath();
        ctx.roundRect(laneX, specY, laneW, laneH, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(laneX, specY, laneW, laneH, 8);
        ctx.stroke();

        // Speculative lane label
        ctx.font = 'bold 13px Inter';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'left';
        ctx.fillText('\u{1F680} Speculative: Draft (Small) + Verify (Big)', laneX + 12, specY + 20);

        // Speculative tokens
        for (let i = 0; i < tokens.length; i++) {
            const tx = laneX + 12 + i * (tokenW + tokenGap);
            const ty = specY + 35;
            if (tx + tokenW > laneX + laneW - 10) break;

            const tok = tokens[i];
            const isLatest = (i === tokens.length - 1) && this.specAnimating;

            let color;
            if (tok.type === 'accepted') {
                const alpha = isLatest ? (0.5 + Math.sin(time * 6) * 0.4) : 0.7;
                color = `rgba(34, 197, 94, ${alpha})`;
            } else {
                const alpha = isLatest ? (0.5 + Math.sin(time * 6) * 0.4) : 0.5;
                color = `rgba(239, 68, 68, ${alpha})`;
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(tx, ty, tokenW, tokenH, 5);
            ctx.fill();

            if (isLatest) {
                ctx.strokeStyle = tok.type === 'accepted' ? '#86efac' : '#fca5a5';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(tx, ty, tokenW, tokenH, 5);
                ctx.stroke();
            }

            ctx.font = '9px JetBrains Mono';
            ctx.fillStyle = '#e8eaf0';
            ctx.textAlign = 'center';
            ctx.fillText('t' + i, tx + tokenW / 2, ty + 15);

            // Accepted/Rejected indicator
            ctx.font = 'bold 9px Inter';
            ctx.fillText(tok.type === 'accepted' ? '\u2713' : '\u2717', tx + tokenW / 2, ty + 30);
        }

        // Speculative progress bar
        const specProgress = specTokens / targetTokens;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.beginPath();
        ctx.roundRect(laneX + 12, specY + laneH - 30, laneW - 24, 14, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
        ctx.beginPath();
        ctx.roundRect(laneX + 12, specY + laneH - 30, Math.max(4, (laneW - 24) * specProgress), 14, 4);
        ctx.fill();
        ctx.font = '10px Inter';
        ctx.fillStyle = '#86efac';
        ctx.textAlign = 'center';
        ctx.fillText(`${specTokens}/${targetTokens} tokens`, laneX + laneW / 2, specY + laneH - 19);

        // Speedup counter
        if (stdTokens > 0 && specTokens > 0) {
            const speedup = specTokens > stdTokens ? (specTokens / Math.max(1, stdTokens)).toFixed(1) : '...';
            ctx.font = 'bold 18px Inter';
            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'center';
            ctx.fillText(`Speedup: ${speedup}x`, W / 2, H - 25);
        }

        // Draft length indicator
        ctx.font = '11px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'right';
        ctx.fillText(`Draft length: ${this.specDraftLen}`, W - 30, H - 10);

        if (this.specAnimating) {
            if (this.specAnimFrame) cancelAnimationFrame(this.specAnimFrame);
            this.specAnimFrame = requestAnimationFrame(() => this.drawSpec());
        }
    },

    startQuiz13_5() {
        Quiz.start({
            title: 'Speculative Decoding & Batching Quiz',
            chapterId: '13-5',
            questions: [
                {
                    question: 'In speculative decoding, what does the small "draft" model do?',
                    options: [
                        'It replaces the big model entirely',
                        'It quickly generates several candidate tokens for the big model to verify',
                        'It trains the big model to be faster',
                        'It compresses the big model\'s weights'
                    ],
                    correct: 1,
                    explanation: 'The small draft model quickly generates several candidate tokens. The big model then verifies all of them in a single forward pass. This is faster than having the big model generate each token one by one!'
                },
                {
                    question: 'How does the big model verify the draft tokens?',
                    options: [
                        'It regenerates each token one by one',
                        'It checks them all at once in a single forward pass (in parallel)',
                        'It asks another model to check',
                        'It compares them to the training data'
                    ],
                    correct: 1,
                    explanation: 'The big model can verify all K draft tokens in a single forward pass because it processes them in parallel. This is the key insight - verification is much cheaper than sequential generation!'
                },
                {
                    question: 'Does speculative decoding change the output quality compared to standard decoding?',
                    options: [
                        'Yes, it makes the output worse',
                        'Yes, it makes the output better',
                        'No, the output is mathematically identical',
                        'It depends on the draft model size'
                    ],
                    correct: 2,
                    explanation: 'Speculative decoding produces the EXACT same output distribution as the big model alone! The rejection sampling scheme guarantees mathematical equivalence. You get speed for free with no quality loss!'
                },
                {
                    question: 'What is the main problem with static batching?',
                    options: [
                        'It uses too much memory',
                        'Short requests must wait for long requests to finish before new requests can start',
                        'It only works with small models',
                        'It requires a draft model'
                    ],
                    correct: 1,
                    explanation: 'In static batching, ALL requests in a batch must complete before any new requests can be added. This means short requests sit idle while waiting for the longest request, wasting valuable GPU time!'
                },
                {
                    question: 'What does continuous batching do differently from static batching?',
                    options: [
                        'It uses a bigger batch size',
                        'It processes requests one at a time',
                        'It adds and removes individual requests on the fly as they arrive and complete',
                        'It only batches requests of the same length'
                    ],
                    correct: 2,
                    explanation: 'Continuous batching (iteration-level scheduling) adds new requests to the batch as soon as slots open up and removes completed requests immediately. The GPU stays busy at all times, maximizing throughput!'
                }
            ]
        });
    }
};
