/* ============================================
   Chapter 4: Training & Monitoring
   ============================================ */

const Chapter4 = {
    init() {
        App.registerChapter('4-1', () => this.loadChapter4_1());
        App.registerChapter('4-2', () => this.loadChapter4_2());
    },

    // ============================================
    // 4.1: TensorBoard Dashboard
    // ============================================
    tbTraining: false,
    tbEpoch: 0,
    tbMaxEpochs: 60,
    tbMetric: 'all',
    tbSmoothing: 0.6,
    tbData: { loss: [], valLoss: [], accuracy: [], valAccuracy: [], lr: [] },
    tbAnimFrame: null,

    loadChapter4_1() {
        const container = document.getElementById('chapter-4-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 4 \u2022 Chapter 4.1</span>
                <h1>TensorBoard Dashboard</h1>
                <p>Imagine training your pet without watching how it's doing -- you'd have no idea
                   if it's learning! TensorBoard is like a report card that updates in real time,
                   so you can see exactly how your AI is learning. Let's check it out!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> What is TensorBoard?</h2>
                <p>TensorBoard is a dashboard that shows how your AI is learning. Think of it
                   like a video game scoreboard that updates after every round. You can see
                   if your AI is getting better or if something went wrong!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">TensorBoard keeps track of <strong>simple numbers</strong> (like your score and mistakes),
                    <strong>bar charts</strong> (showing how the brain's numbers are spread out), <strong>maps</strong> (what the network looks like),
                    and even <strong>pictures</strong> (what it guessed). It's like having X-ray vision into your AI!</span>
                </div>

                <h3>Key Panels</h3>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCC9</div>
                        <div style="font-weight:600;margin:6px 0;">Scalars</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Simple numbers like mistakes and score over time</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCCA</div>
                        <div style="font-weight:600;margin:6px 0;">Histograms</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Bar charts showing how the brain's numbers are spread out</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDD17</div>
                        <div style="font-weight:600;margin:6px 0;">Graphs</div>
                        <div style="font-size:12px;color:var(--text-secondary);">A map showing how the network is built</div>
                    </div>
                </div>
            </div>

            <!-- Live Training Dashboard -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Live Training Dashboard</h2>
                <p>Click "Start Training" to watch the AI practice! See mistakes go down,
                   the score go up, and the step size shrink over time. It's like watching a student get smarter!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Metric</label>
                        <select id="tbMetricSelect" onchange="Chapter4.changeTBMetric()">
                            <option value="all">All Metrics</option>
                            <option value="loss">Loss Only</option>
                            <option value="accuracy">Accuracy Only</option>
                            <option value="lr">Learning Rate</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Smoothing (<span id="tbSmoothVal">0.6</span>)</label>
                        <input type="range" id="tbSmoothSlider" min="0" max="0.99" value="0.6" step="0.01"
                               oninput="Chapter4.changeTBSmoothing()">
                    </div>
                </div>

                <div class="graph-container">
                    <canvas id="tbDashboardCanvas" width="750" height="350"></canvas>
                    <div class="graph-legend" id="tbLegend">
                        <div class="legend-item active"><span class="legend-dot" style="background:#6366f1;"></span> Train Loss</div>
                        <div class="legend-item active"><span class="legend-dot" style="background:#ef4444;"></span> Val Loss</div>
                        <div class="legend-item active"><span class="legend-dot" style="background:#10b981;"></span> Train Acc</div>
                        <div class="legend-item active"><span class="legend-dot" style="background:#f59e0b;"></span> LR Schedule</div>
                    </div>
                </div>

                <div class="gd-stats" id="tbStats">
                    <div class="gd-stat">
                        <div class="stat-label">Epoch</div>
                        <div class="stat-value" id="tbEpochVal">0 / 60</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Train Loss</div>
                        <div class="stat-value" id="tbTrainLossVal" style="color:#6366f1;">--</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Val Loss</div>
                        <div class="stat-value" id="tbValLossVal" style="color:#ef4444;">--</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Accuracy</div>
                        <div class="stat-value" id="tbAccVal" style="color:#10b981;">--</div>
                    </div>
                </div>

                <div class="controls">
                    <button class="btn-primary btn-small" id="tbTrainBtn" onclick="Chapter4.toggleTBTraining()">\u25B6 Start Training</button>
                    <button class="btn-secondary btn-small" onclick="Chapter4.resetTBTraining()">Reset</button>
                </div>
            </div>

            <!-- Weight Distribution Histogram -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Weight Distribution Histogram</h2>
                <p>The AI's importance scores change as it learns. If they all shrink to zero
                   or get way too big, something is wrong! This bar chart shows how the scores
                   spread out at different stages of training. Cool, right?</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Training Stage</label>
                        <select id="tbHistStage" onchange="Chapter4.drawWeightHistogram()">
                            <option value="init">Initialization (Epoch 0)</option>
                            <option value="early">Early Training (Epoch 10)</option>
                            <option value="mid">Mid Training (Epoch 30)</option>
                            <option value="late">Converged (Epoch 60)</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Layer</label>
                        <select id="tbHistLayer" onchange="Chapter4.drawWeightHistogram()">
                            <option value="layer1">Layer 1 (Input)</option>
                            <option value="layer2">Layer 2 (Hidden)</option>
                            <option value="layer3">Layer 3 (Output)</option>
                        </select>
                    </div>
                </div>

                <div class="graph-container">
                    <canvas id="tbHistCanvas" width="750" height="280"></canvas>
                </div>

                <div class="step-explanation" id="tbHistExplanation">
                    Pick a training stage and a layer to see how the importance scores change as the AI learns!
                </div>
            </div>

            <!-- Code Example -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Using TensorBoard in Practice</h2>
                <p>Setting up your AI report card only takes a few lines of code!</p>

                <div class="code-block">
<span class="keyword">import</span> tensorflow <span class="keyword">as</span> tf

<span class="comment"># Set up the report card tracker</span>
tb_callback = tf.keras.callbacks.<span class="function">TensorBoard</span>(
    log_dir=<span class="string">'./logs'</span>,
    histogram_freq=<span class="number">1</span>,       <span class="comment"># Save bar charts every round of training</span>
    write_graph=<span class="keyword">True</span>,        <span class="comment"># Save a map of the network</span>
    update_freq=<span class="string">'epoch'</span>      <span class="comment"># Update the report card every round</span>
)

<span class="comment"># Start training and record the report card</span>
model.<span class="function">fit</span>(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=<span class="number">60</span>,
    callbacks=[tb_callback]
)

<span class="comment"># Open the report card in your browser (type this in the terminal):</span>
<span class="comment"># tensorboard --logdir=./logs --port=6006</span>
<span class="comment"># Then visit http://localhost:6006 to see it!</span>
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A1</span>
                    <span class="info-box-text"><strong>Here's the fun part:</strong> Watch the gap between training mistakes and test mistakes.
                    If test mistakes go UP while training mistakes go DOWN, your AI is memorizing
                    the textbook instead of actually understanding! That's called overfitting.</span>
                </div>
            </div>

            <!-- What to Watch For -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD0D</span> Training Signals to Watch</h2>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="info-box" style="flex-direction:column;">
                        <strong style="color:#10b981;">\u2705 Healthy Training</strong>
                        <span class="info-box-text">Mistakes going down smoothly. Training and test scores staying close together. Score getting better and better. Nice!</span>
                    </div>
                    <div class="info-box" style="flex-direction:column;">
                        <strong style="color:#ef4444;">\u274C Overfitting</strong>
                        <span class="info-box-text">Test mistakes go up while training mistakes go down. The AI is memorizing the textbook instead of understanding the subject. Like a kid who only remembers exact answers but can't solve new problems!</span>
                    </div>
                    <div class="info-box" style="flex-direction:column;">
                        <strong style="color:#f59e0b;">\u26A0\uFE0F Underfitting</strong>
                        <span class="info-box-text">Both scores stay bad and stop improving. The AI didn't study enough, or the network is too small. It's like not studying enough for a test!</span>
                    </div>
                    <div class="info-box" style="flex-direction:column;">
                        <strong style="color:#8b5cf6;">\uD83D\uDCA5 Exploding Gradients</strong>
                        <span class="info-box-text">Mistakes suddenly shoot up to a broken number (the computer gave up!). The importance scores got way too big. The fix? Make the step size smaller!</span>
                    </div>
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter4.startQuiz4_1()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('3-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('4-2')">Next: GPU Speed Boost \u2192</button>
            </div>
        `;

        this.resetTBTraining();
        this.drawWeightHistogram();
    },

    changeTBMetric() {
        this.tbMetric = document.getElementById('tbMetricSelect')?.value || 'all';
        this.drawTBDashboard();
    },

    changeTBSmoothing() {
        this.tbSmoothing = parseFloat(document.getElementById('tbSmoothSlider')?.value || 0.6);
        document.getElementById('tbSmoothVal').textContent = this.tbSmoothing.toFixed(2);
        this.drawTBDashboard();
    },

    resetTBTraining() {
        this.tbTraining = false;
        this.tbEpoch = 0;
        this.tbData = { loss: [], valLoss: [], accuracy: [], valAccuracy: [], lr: [] };
        if (this.tbAnimFrame) cancelAnimationFrame(this.tbAnimFrame);
        this.tbAnimFrame = null;
        const btn = document.getElementById('tbTrainBtn');
        if (btn) btn.textContent = '\u25B6 Start Training';
        this.updateTBStats();
        this.drawTBDashboard();
    },

    toggleTBTraining() {
        if (this.tbEpoch >= this.tbMaxEpochs) {
            this.resetTBTraining();
            return;
        }
        this.tbTraining = !this.tbTraining;
        const btn = document.getElementById('tbTrainBtn');
        if (btn) btn.textContent = this.tbTraining ? '\u23F8 Pause' : '\u25B6 Resume';
        if (this.tbTraining) this.runTBTraining();
    },

    runTBTraining() {
        if (!this.tbTraining || this.tbEpoch >= this.tbMaxEpochs) {
            this.tbTraining = false;
            const btn = document.getElementById('tbTrainBtn');
            if (btn) btn.textContent = '\u25B6 Start Training';
            return;
        }

        this.tbEpoch++;
        const e = this.tbEpoch;
        const d = this.tbData;

        // Simulated training dynamics
        const baseLoss = 2.5 * Math.exp(-0.06 * e) + 0.08;
        const noise = (Math.random() - 0.5) * 0.08;
        const trainLoss = Math.max(0.02, baseLoss + noise);

        // Val loss diverges slightly after epoch 40 (mild overfitting)
        const overfit = e > 40 ? (e - 40) * 0.004 : 0;
        const valNoise = (Math.random() - 0.5) * 0.12;
        const valLoss = Math.max(0.04, baseLoss + 0.05 + overfit + valNoise);

        // Accuracy climbs
        const baseAcc = 1.0 - 0.85 * Math.exp(-0.07 * e);
        const accNoise = (Math.random() - 0.5) * 0.02;
        const accuracy = Math.min(0.99, Math.max(0.1, baseAcc + accNoise));

        // Val accuracy
        const valAccuracy = Math.min(0.98, Math.max(0.1, baseAcc - 0.02 - (overfit * 0.5) + (Math.random() - 0.5) * 0.03));

        // Learning rate with step decay
        const lr = 0.001 * Math.pow(0.95, Math.floor(e / 10));

        d.loss.push(trainLoss);
        d.valLoss.push(valLoss);
        d.accuracy.push(accuracy);
        d.valAccuracy.push(valAccuracy);
        d.lr.push(lr);

        this.updateTBStats();
        this.drawTBDashboard();

        setTimeout(() => this.runTBTraining(), 150);
    },

    updateTBStats() {
        const d = this.tbData;
        const el = id => document.getElementById(id);
        if (el('tbEpochVal')) el('tbEpochVal').textContent = `${this.tbEpoch} / ${this.tbMaxEpochs}`;
        if (el('tbTrainLossVal')) el('tbTrainLossVal').textContent = d.loss.length > 0 ? d.loss[d.loss.length - 1].toFixed(4) : '--';
        if (el('tbValLossVal')) el('tbValLossVal').textContent = d.valLoss.length > 0 ? d.valLoss[d.valLoss.length - 1].toFixed(4) : '--';
        if (el('tbAccVal')) el('tbAccVal').textContent = d.accuracy.length > 0 ? (d.accuracy[d.accuracy.length - 1] * 100).toFixed(1) + '%' : '--';
    },

    smoothData(data, factor) {
        if (data.length === 0 || factor === 0) return data.slice();
        const smoothed = [data[0]];
        for (let i = 1; i < data.length; i++) {
            smoothed.push(smoothed[i - 1] * factor + data[i] * (1 - factor));
        }
        return smoothed;
    },

    drawTBDashboard() {
        const canvas = document.getElementById('tbDashboardCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 25, right: 20, bottom: 35, left: 55 };
        ctx.clearRect(0, 0, W, H);

        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;
        const d = this.tbData;
        const metric = this.tbMetric;
        const smooth = this.tbSmoothing;

        // Background grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + plotH * (i / 5);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }
        for (let i = 0; i <= 6; i++) {
            const x = pad.left + plotW * (i / 6);
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
        }

        // Axes labels
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Epoch', W / 2, H - 5);

        // Epoch ticks
        for (let i = 0; i <= 6; i++) {
            const epochVal = Math.round(this.tbMaxEpochs * (i / 6));
            const x = pad.left + plotW * (i / 6);
            ctx.fillText(epochVal.toString(), x, pad.top + plotH + 18);
        }

        ctx.save();
        ctx.translate(14, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(metric === 'lr' ? 'Learning Rate' : metric === 'accuracy' ? 'Accuracy' : 'Value', 0, 0);
        ctx.restore();

        // Determine Y scale
        let yMin = 0, yMax = 2.8;
        if (metric === 'accuracy') { yMin = 0; yMax = 1.05; }
        else if (metric === 'lr') { yMin = 0; yMax = 0.0012; }

        // Y-axis ticks
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const val = yMax - (yMax - yMin) * (i / 5);
            const y = pad.top + plotH * (i / 5);
            let label;
            if (metric === 'lr') label = val.toExponential(1);
            else if (metric === 'accuracy') label = (val * 100).toFixed(0) + '%';
            else label = val.toFixed(1);
            ctx.fillStyle = '#5a6478';
            ctx.font = '10px JetBrains Mono';
            ctx.fillText(label, pad.left - 8, y + 4);
        }

        const drawLine = (data, color, dashed) => {
            if (data.length < 2) return;
            const smoothed = this.smoothData(data, smooth);
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            if (dashed) ctx.setLineDash([6, 4]);
            else ctx.setLineDash([]);

            smoothed.forEach((v, i) => {
                const x = pad.left + (i / (this.tbMaxEpochs - 1)) * plotW;
                const y = pad.top + plotH * (1 - (v - yMin) / (yMax - yMin));
                const clampedY = Math.max(pad.top, Math.min(pad.top + plotH, y));
                if (i === 0) ctx.moveTo(x, clampedY);
                else ctx.lineTo(x, clampedY);
            });
            ctx.stroke();
            ctx.setLineDash([]);
        };

        // Draw appropriate metrics
        if (metric === 'all' || metric === 'loss') {
            drawLine(d.loss, '#6366f1', false);
            drawLine(d.valLoss, '#ef4444', true);
        }
        if (metric === 'all' || metric === 'accuracy') {
            drawLine(d.accuracy, '#10b981', false);
        }
        if (metric === 'all' || metric === 'lr') {
            drawLine(d.lr, '#f59e0b', false);
        }

        // Draw current epoch marker
        if (d.loss.length > 0) {
            const cx = pad.left + ((d.loss.length - 1) / (this.tbMaxEpochs - 1)) * plotW;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.moveTo(cx, pad.top);
            ctx.lineTo(cx, pad.top + plotH);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Empty state message
        if (d.loss.length === 0) {
            ctx.fillStyle = '#5a6478';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Start Training" to begin simulation', W / 2, H / 2);
        }
    },

    // Weight Histogram
    generateWeights(stage, layer) {
        const weights = [];
        const count = 200;
        let mean = 0, std = 0.1;

        if (layer === 'layer1') {
            if (stage === 'init') { mean = 0; std = 0.08; }
            else if (stage === 'early') { mean = 0.02; std = 0.12; }
            else if (stage === 'mid') { mean = 0.05; std = 0.18; }
            else { mean = 0.03; std = 0.22; }
        } else if (layer === 'layer2') {
            if (stage === 'init') { mean = 0; std = 0.06; }
            else if (stage === 'early') { mean = -0.01; std = 0.10; }
            else if (stage === 'mid') { mean = -0.03; std = 0.15; }
            else { mean = -0.02; std = 0.20; }
        } else {
            if (stage === 'init') { mean = 0; std = 0.10; }
            else if (stage === 'early') { mean = 0.05; std = 0.14; }
            else if (stage === 'mid') { mean = 0.10; std = 0.20; }
            else { mean = 0.08; std = 0.25; }
        }

        // Box-Muller transform for normal distribution
        for (let i = 0; i < count; i++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            weights.push(mean + z * std);
        }
        return weights;
    },

    drawWeightHistogram() {
        const canvas = document.getElementById('tbHistCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 35, left: 50 };
        ctx.clearRect(0, 0, W, H);

        const stage = document.getElementById('tbHistStage')?.value || 'init';
        const layer = document.getElementById('tbHistLayer')?.value || 'layer1';

        const weights = this.generateWeights(stage, layer);
        const numBins = 30;
        const minW = -0.8, maxW = 0.8;
        const binWidth = (maxW - minW) / numBins;
        const bins = new Array(numBins).fill(0);

        weights.forEach(w => {
            const idx = Math.floor((w - minW) / binWidth);
            if (idx >= 0 && idx < numBins) bins[idx]++;
        });

        const maxBin = Math.max(...bins, 1);
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;
        const barW = plotW / numBins;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + plotH * (i / 4);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }

        // Color based on stage
        const colors = {
            init: '#6366f1',
            early: '#3b82f6',
            mid: '#8b5cf6',
            late: '#10b981'
        };
        const barColor = colors[stage] || '#6366f1';

        // Draw bars
        bins.forEach((count, i) => {
            const x = pad.left + i * barW;
            const barH = (count / maxBin) * plotH;
            const y = pad.top + plotH - barH;

            ctx.fillStyle = barColor;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(x + 1, y, barW - 2, barH);
            ctx.globalAlpha = 1.0;

            ctx.strokeStyle = barColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y, barW - 2, barH);
        });

        // X-axis labels
        ctx.fillStyle = '#5a6478';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 8; i++) {
            const val = minW + (maxW - minW) * (i / 8);
            const x = pad.left + plotW * (i / 8);
            ctx.fillText(val.toFixed(1), x, pad.top + plotH + 18);
        }

        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        ctx.fillText('Weight Value', W / 2, H - 5);

        ctx.save();
        ctx.translate(14, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Count', 0, 0);
        ctx.restore();

        // Explanation
        const stageLabels = { init: 'Initialization', early: 'Early Training', mid: 'Mid Training', late: 'Converged' };
        const layerLabels = { layer1: 'Layer 1 (Input)', layer2: 'Layer 2 (Hidden)', layer3: 'Layer 3 (Output)' };
        const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
        const variance = weights.reduce((a, b) => a + (b - mean) ** 2, 0) / weights.length;
        const std = Math.sqrt(variance);

        const expl = document.getElementById('tbHistExplanation');
        if (expl) {
            expl.innerHTML = `<strong>${stageLabels[stage]}</strong> -- ${layerLabels[layer]}<br>
                Mean: <strong>${mean.toFixed(4)}</strong> | Std: <strong>${std.toFixed(4)}</strong><br>
                ${stage === 'init' ? 'All importance scores start near zero. Think of it like the first day of school -- nobody knows anything yet!' :
                  stage === 'early' ? 'The scores are spreading out. The AI is starting to learn! Like a student who just started studying.' :
                  stage === 'mid' ? 'The scores are spreading even more. Each brain cell is learning its own special job, like players on a team picking positions!' :
                  'The scores have settled down. The AI has finished learning and is ready to go! Like a student who studied and is ready for the test.'}`;
        }
    },

    startQuiz4_1() {
        Quiz.start({
            title: 'Chapter 4.1: TensorBoard Dashboard',
            chapterId: '4-1',
            questions: [
                {
                    question: 'What is the biggest warning sign that your AI is memorizing instead of learning?',
                    options: [
                        'Training mistakes going up',
                        'Test mistakes going up while training mistakes go down',
                        'The step size staying the same',
                        'The bar charts looking even on both sides'
                    ],
                    correct: 1,
                    explanation: 'When test mistakes go up but training mistakes go down, the AI is memorizing the textbook instead of understanding the subject. It is like a student who can only answer questions they have already seen!'
                },
                {
                    question: 'What do the bar charts (histograms) in TensorBoard show?',
                    options: [
                        'How good each guess was',
                        'How the brain\'s importance scores are spread out over time',
                        'A chart of the input data',
                        'How many rounds of training are done'
                    ],
                    correct: 1,
                    explanation: 'The bar charts show how the importance scores are spread out. If they all squish to zero, the learning signal is fading away like a whisper. If they get huge, something is exploding!'
                },
                {
                    question: 'What does the "smoothing" slider do on the charts?',
                    options: [
                        'It makes training faster',
                        'It deletes bad data points forever',
                        'It makes the wiggly lines smoother so you can see the big picture',
                        'It changes the step size'
                    ],
                    correct: 2,
                    explanation: 'Smoothing is like squinting at a messy drawing to see the overall shape. It removes the little bumps so you can clearly see if things are going up or down!'
                },
                {
                    question: 'If all the importance scores shrink to zero, what is going wrong?',
                    options: [
                        'The AI learned perfectly',
                        'The learning signal is fading away like a whisper -- the AI stopped learning',
                        'The AI is memorizing',
                        'Nothing, this is totally normal'
                    ],
                    correct: 1,
                    explanation: 'When importance scores collapse to zero, the learning signal is fading away like a whisper in a noisy room. The brain cells are "sleeping" and not learning anymore. This is called vanishing gradients.'
                }
            ]
        });
    },

    // ============================================
    // 4.2: GPU Speed Boost
    // ============================================
    gpuMatrixSize: 512,
    gpuAnimating: false,
    gpuAnimFrame: null,

    loadChapter4_2() {
        const container = document.getElementById('chapter-4-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 4 \u2022 Chapter 4.2</span>
                <h1>GPU Speed Boost</h1>
                <p>Why does everyone want a GPU for AI? Because a GPU can do THOUSANDS of
                   math problems at the same time! Let's see just how much faster it is
                   and why this is a game-changer for training neural networks.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u26A1</span> CPU vs GPU: The Core Difference</h2>
                <p>Imagine a super-smart professor who solves one problem at a time really fast. That's a CPU!
                   Now imagine a classroom of 1,000 students, each solving a simpler problem at the same time.
                   That's a GPU! Since AI needs tons of math done all at once, the classroom wins big time!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">A modern GPU has <strong>6,912 tiny workers</strong> (called CUDA cores)
                    all working at the same time. A CPU only has 8 to 16 workers. That's like comparing
                    a whole army of ants to a few strong beetles. For math, the ants win!</span>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDE9</div>
                        <div style="font-weight:600;margin:6px 0;">Tiny Workers</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Thousands of tiny workers (CUDA cores) all doing math at once</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDE80</div>
                        <div style="font-weight:600;margin:6px 0;">Data Highway</div>
                        <div style="font-size:12px;color:var(--text-secondary);">GPU has a super-wide highway for data. CPU has a narrow road.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCE6</div>
                        <div style="font-weight:600;margin:6px 0;">Batch Processing</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Practice with many examples at once instead of one by one</div>
                    </div>
                </div>
            </div>

            <!-- Benchmark Comparison -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFC1</span> Benchmark: CPU vs GPU</h2>
                <p>Move the slider to change how big the math problem is. The bigger the problem,
                   the more the GPU wins! Watch the difference grow -- it's amazing!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Matrix Size: <span id="gpuMatSizeVal">512 x 512</span></label>
                        <input type="range" id="gpuMatSizeSlider" min="64" max="4096" value="512" step="64"
                               oninput="Chapter4.updateGPUBenchmark()">
                    </div>
                </div>

                <div class="graph-container">
                    <canvas id="gpuBenchCanvas" width="750" height="300"></canvas>
                </div>

                <div class="gd-stats" id="gpuStats">
                    <div class="gd-stat">
                        <div class="stat-label">CPU Time</div>
                        <div class="stat-value" id="gpuCpuTime" style="color:#ef4444;">--</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">GPU Time</div>
                        <div class="stat-value" id="gpuGpuTime" style="color:#10b981;">--</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Speedup</div>
                        <div class="stat-value" id="gpuSpeedup" style="color:#f59e0b;">--</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">GPU TFLOPS</div>
                        <div class="stat-value" id="gpuFlops" style="color:#8b5cf6;">--</div>
                    </div>
                </div>
            </div>

            <!-- Sequential vs Parallel Visualization -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD04</span> Sequential vs Parallel Processing</h2>
                <p>Watch the CPU fill in boxes one at a time, while the GPU fills an entire
                   row at once! It's like coloring one square at a time vs. painting a whole row with one big brush!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="graph-container">
                    <canvas id="gpuParallelCanvas" width="750" height="350"></canvas>
                </div>

                <div class="controls">
                    <button class="btn-primary btn-small" id="gpuAnimBtn" onclick="Chapter4.startParallelAnim()">\u25B6 Run Comparison</button>
                    <button class="btn-secondary btn-small" onclick="Chapter4.resetParallelAnim()">Reset</button>
                </div>

                <div class="step-explanation" id="gpuParallelExplanation">
                    Click "Run Comparison" to watch the race! CPU does one at a time. GPU does a whole row at once!
                </div>
            </div>

            <!-- Code Example -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Using GPU in Practice</h2>
                <p>Telling your code to use the GPU is super easy. Just a few lines and you get a huge speed boost!</p>

                <div class="code-block">
<span class="comment"># ---- PyTorch (one way to do it) ----</span>
<span class="keyword">import</span> torch

<span class="comment"># Do we have a GPU? Let's check!</span>
device = torch.device(<span class="string">'cuda'</span> <span class="keyword">if</span> torch.cuda.<span class="function">is_available</span>() <span class="keyword">else</span> <span class="string">'cpu'</span>)
<span class="function">print</span>(<span class="string">f"Using: {device}"</span>)

<span class="comment"># Send the brain and the data to the GPU</span>
model = <span class="function">MyModel</span>().<span class="function">to</span>(device)
X_batch = X_batch.<span class="function">to</span>(device)
y_batch = y_batch.<span class="function">to</span>(device)

<span class="comment"># Train! Same steps as before, but now it's super fast on the GPU!</span>
output = <span class="function">model</span>(X_batch)
loss = <span class="function">criterion</span>(output, y_batch)
loss.<span class="function">backward</span>()
optimizer.<span class="function">step</span>()
                </div>

                <div class="code-block" style="margin-top:12px;">
<span class="comment"># ---- TensorFlow (another way to do it) ----</span>
<span class="keyword">import</span> tensorflow <span class="keyword">as</span> tf

<span class="comment"># TensorFlow finds the GPU on its own -- smart!</span>
<span class="function">print</span>(<span class="string">"GPUs:"</span>, tf.config.list_physical_devices(<span class="string">'GPU'</span>))

<span class="comment"># Tell the code: "Use the GPU please!" (usually happens automatically)</span>
<span class="keyword">with</span> tf.device(<span class="string">'/GPU:0'</span>):
    model = tf.keras.<span class="function">Sequential</span>([
        tf.keras.layers.<span class="function">Dense</span>(<span class="number">512</span>, activation=<span class="string">'relu'</span>),
        tf.keras.layers.<span class="function">Dense</span>(<span class="number">10</span>, activation=<span class="string">'softmax'</span>)
    ])
    model.<span class="function">compile</span>(optimizer=<span class="string">'adam'</span>, loss=<span class="string">'sparse_categorical_crossentropy'</span>)
    model.<span class="function">fit</span>(X_train, y_train, epochs=<span class="number">10</span>, batch_size=<span class="number">256</span>)
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A1</span>
                    <span class="info-box-text"><strong>How many examples to practice at once matters!</strong> GPUs work best when
                    they have lots to do at the same time. Practicing with 32 to 256 examples at once keeps all
                    the tiny workers busy. Giving them just 1 example wastes most of their power!</span>
                </div>
            </div>

            <!-- When GPU Matters -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCB</span> When Does GPU Matter Most?</h2>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="info-box" style="flex-direction:column;">
                        <strong style="color:#10b981;">\uD83D\uDE80 GPU Shines</strong>
                        <span class="info-box-text">Big math problems, picture and video AI, training with millions of importance scores, and practicing with big groups of examples at once.</span>
                    </div>
                    <div class="info-box" style="flex-direction:column;">
                        <strong style="color:#f59e0b;">\uD83E\uDD37 CPU is Fine</strong>
                        <span class="info-box-text">Small networks, spreadsheet-style data, getting data ready, answering one question at a time, and networks with lots of "if this then that" decisions.</span>
                    </div>
                </div>

                <h3>GPU Memory Hierarchy</h3>
                <div class="code-block">
<span class="comment"># The GPU has its own memory, like a desk where it does its work.</span>
<span class="comment"># Here's what takes up space on that desk:</span>
<span class="comment"># Importance scores:  ~4 bytes each (how precisely it stores numbers)</span>
<span class="comment"># Mistake info:       same size as the scores</span>
<span class="comment"># Optimizer notes:    2x the scores (for the smart optimizer)</span>
<span class="comment"># Scratch paper:      depends on how many examples at once</span>

<span class="comment"># Example: GPT-2 (a famous AI with 124 million scores!)</span>
Parameters:  <span class="number">124M</span> x <span class="number">4</span> bytes = <span class="number">496 MB</span>
Gradients:   <span class="number">496 MB</span>
Adam states: <span class="number">992 MB</span>
<span class="comment"># Total: about 2 GB just to start (before scratch paper!)</span>
<span class="comment"># That's why big AI brains need GPUs with 24-80 GB of desk space (VRAM)!</span>
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter4.startQuiz4_2()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('4-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('5-1')">Next: Module 5 \u2192</button>
            </div>
        `;

        this.updateGPUBenchmark();
        this.resetParallelAnim();
    },

    updateGPUBenchmark() {
        const slider = document.getElementById('gpuMatSizeSlider');
        const size = parseInt(slider?.value || 512);
        this.gpuMatrixSize = size;

        document.getElementById('gpuMatSizeVal').textContent = `${size} x ${size}`;

        // Simulated benchmark times (realistic approximations)
        // CPU: O(n^3) with constant ~0.5 GFLOPS for single core
        // GPU: O(n^3) with constant ~10 TFLOPS for modern GPU
        const n = size;
        const flops = 2 * n * n * n; // matrix multiply FLOPs

        const cpuGflops = 0.5; // Single-core effective GFLOPS
        const gpuTflops = 10;  // GPU effective TFLOPS

        const cpuTimeMs = (flops / (cpuGflops * 1e9)) * 1000;
        const gpuTimeMs = Math.max(0.05, (flops / (gpuTflops * 1e12)) * 1000 + 0.2); // +0.2ms kernel launch overhead

        const speedup = cpuTimeMs / gpuTimeMs;

        const el = id => document.getElementById(id);
        if (el('gpuCpuTime')) el('gpuCpuTime').textContent = cpuTimeMs < 1000 ? cpuTimeMs.toFixed(1) + ' ms' : (cpuTimeMs / 1000).toFixed(2) + ' s';
        if (el('gpuGpuTime')) el('gpuGpuTime').textContent = gpuTimeMs < 1000 ? gpuTimeMs.toFixed(2) + ' ms' : (gpuTimeMs / 1000).toFixed(3) + ' s';
        if (el('gpuSpeedup')) el('gpuSpeedup').textContent = speedup.toFixed(1) + 'x';
        if (el('gpuFlops')) el('gpuFlops').textContent = gpuTflops.toFixed(0) + ' TFLOPS';

        this.drawGPUBenchmark(cpuTimeMs, gpuTimeMs, speedup);
    },

    drawGPUBenchmark(cpuTime, gpuTime, speedup) {
        const canvas = document.getElementById('gpuBenchCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 30, right: 30, bottom: 50, left: 60 };
        ctx.clearRect(0, 0, W, H);

        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;
        const maxTime = cpuTime * 1.2;

        // Background grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const x = pad.left + plotW * (i / 4);
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
        }

        const barHeight = 60;
        const gap = 40;
        const totalBars = 2;
        const startY = pad.top + (plotH - (barHeight * totalBars + gap)) / 2;

        // CPU bar
        const cpuBarW = (cpuTime / maxTime) * plotW;
        const cpuY = startY;

        // GPU bar
        const gpuBarW = Math.max(4, (gpuTime / maxTime) * plotW);
        const gpuY = startY + barHeight + gap;

        // CPU bar with gradient
        const cpuGrad = ctx.createLinearGradient(pad.left, 0, pad.left + cpuBarW, 0);
        cpuGrad.addColorStop(0, '#ef4444');
        cpuGrad.addColorStop(1, '#dc2626');
        ctx.fillStyle = cpuGrad;
        ctx.beginPath();
        ctx.roundRect(pad.left, cpuY, cpuBarW, barHeight, 6);
        ctx.fill();

        // GPU bar with gradient
        const gpuGrad = ctx.createLinearGradient(pad.left, 0, pad.left + gpuBarW, 0);
        gpuGrad.addColorStop(0, '#10b981');
        gpuGrad.addColorStop(1, '#059669');
        ctx.fillStyle = gpuGrad;
        ctx.beginPath();
        ctx.roundRect(pad.left, gpuY, gpuBarW, barHeight, 6);
        ctx.fill();

        // Labels
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('CPU', pad.left - 10, cpuY + barHeight / 2 + 5);
        ctx.fillText('GPU', pad.left - 10, gpuY + barHeight / 2 + 5);

        // Time labels on bars
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'left';
        const cpuLabel = cpuTime < 1000 ? cpuTime.toFixed(1) + ' ms' : (cpuTime / 1000).toFixed(2) + ' s';
        const gpuLabel = gpuTime < 1000 ? gpuTime.toFixed(2) + ' ms' : (gpuTime / 1000).toFixed(3) + ' s';
        ctx.fillText(cpuLabel, pad.left + cpuBarW + 8, cpuY + barHeight / 2 + 5);
        ctx.fillText(gpuLabel, pad.left + gpuBarW + 8, gpuY + barHeight / 2 + 5);

        // Speedup badge
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${speedup.toFixed(1)}x faster`, W / 2, H - 15);

        // X-axis
        ctx.fillStyle = '#5a6478';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 4; i++) {
            const val = maxTime * (i / 4);
            const x = pad.left + plotW * (i / 4);
            const label = val < 1000 ? val.toFixed(0) + ' ms' : (val / 1000).toFixed(1) + ' s';
            ctx.fillText(label, x, pad.top + plotH + 18);
        }
    },

    // Parallel vs Sequential Animation
    cpuProgress: 0,
    gpuProgress: 0,
    parallelAnimDone: false,

    resetParallelAnim() {
        this.gpuAnimating = false;
        this.cpuProgress = 0;
        this.gpuProgress = 0;
        this.parallelAnimDone = false;
        if (this.gpuAnimFrame) cancelAnimationFrame(this.gpuAnimFrame);
        this.gpuAnimFrame = null;
        const btn = document.getElementById('gpuAnimBtn');
        if (btn) btn.textContent = '\u25B6 Run Comparison';
        const expl = document.getElementById('gpuParallelExplanation');
        if (expl) expl.innerHTML = 'Click "Run Comparison" to watch the race! CPU does one at a time. GPU does a whole row at once!';
        this.drawParallelViz();
    },

    startParallelAnim() {
        if (this.gpuAnimating) return;
        if (this.parallelAnimDone) {
            this.resetParallelAnim();
            return;
        }
        this.gpuAnimating = true;
        const btn = document.getElementById('gpuAnimBtn');
        if (btn) btn.textContent = '\u23F8 Running...';
        this.animateParallel();
    },

    animateParallel() {
        if (!this.gpuAnimating) return;

        // CPU processes one cell at a time, GPU processes a whole row at a time
        const gridSize = 8;
        const totalCells = gridSize * gridSize;

        // CPU advances 1 cell per frame
        if (this.cpuProgress < totalCells) {
            this.cpuProgress += 1;
        }

        // GPU advances 1 full row (gridSize cells) per frame
        if (this.gpuProgress < totalCells) {
            this.gpuProgress = Math.min(totalCells, this.gpuProgress + gridSize);
        }

        this.drawParallelViz();

        // Update explanation based on progress
        const expl = document.getElementById('gpuParallelExplanation');
        if (expl) {
            const cpuPercent = Math.round((this.cpuProgress / totalCells) * 100);
            const gpuPercent = Math.round((this.gpuProgress / totalCells) * 100);
            expl.innerHTML = `<strong>CPU:</strong> ${cpuPercent}% complete (${this.cpuProgress}/${totalCells} cells, one at a time) &nbsp; | &nbsp; <strong>GPU:</strong> ${gpuPercent}% complete (${this.gpuProgress}/${totalCells} cells, ${gridSize} at a time)`;
        }

        if (this.cpuProgress >= totalCells && this.gpuProgress >= totalCells) {
            this.gpuAnimating = false;
            this.parallelAnimDone = true;
            const btn = document.getElementById('gpuAnimBtn');
            if (btn) btn.textContent = '\u21BB Reset';
            if (expl) {
                expl.innerHTML = `<strong>Done!</strong> The GPU finished in <strong>${gridSize} steps</strong> while the CPU needed <strong>${totalCells} steps</strong>. That's a <strong>${gridSize}x speedup</strong> -- and real GPUs have thousands of cores, not just ${gridSize}!`;
            }
            return;
        }

        this.gpuAnimFrame = requestAnimationFrame(() => this.animateParallel());
    },

    drawParallelViz() {
        const canvas = document.getElementById('gpuParallelCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const gridSize = 8;
        const cellSize = 28;
        const gridPad = 4;
        const totalGridW = gridSize * (cellSize + gridPad);
        const totalGridH = gridSize * (cellSize + gridPad);

        // CPU section (left half)
        const cpuOffsetX = (W / 4) - totalGridW / 2;
        const cpuOffsetY = 55;

        // GPU section (right half)
        const gpuOffsetX = (3 * W / 4) - totalGridW / 2;
        const gpuOffsetY = 55;

        // Title labels
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('CPU (Sequential)', W / 4, 30);

        ctx.fillStyle = '#10b981';
        ctx.fillText('GPU (Parallel)', 3 * W / 4, 30);

        // Divider
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 10);
        ctx.lineTo(W / 2, H - 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw CPU grid
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const idx = row * gridSize + col;
                const x = cpuOffsetX + col * (cellSize + gridPad);
                const y = cpuOffsetY + row * (cellSize + gridPad);

                if (idx < this.cpuProgress) {
                    // Completed - red/orange gradient
                    ctx.fillStyle = '#ef4444';
                    ctx.globalAlpha = 0.85;
                } else if (idx === this.cpuProgress) {
                    // Currently processing - bright
                    ctx.fillStyle = '#fbbf24';
                    ctx.globalAlpha = 1.0;
                } else {
                    // Not yet processed
                    ctx.fillStyle = 'rgba(255,255,255,0.06)';
                    ctx.globalAlpha = 1.0;
                }

                ctx.beginPath();
                ctx.roundRect(x, y, cellSize, cellSize, 4);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }

        // Draw GPU grid
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const idx = row * gridSize + col;
                const x = gpuOffsetX + col * (cellSize + gridPad);
                const y = gpuOffsetY + row * (cellSize + gridPad);

                if (idx < this.gpuProgress) {
                    // Completed - green
                    ctx.fillStyle = '#10b981';
                    ctx.globalAlpha = 0.85;
                } else if (idx >= this.gpuProgress && idx < this.gpuProgress + gridSize) {
                    // Currently processing row - bright
                    ctx.fillStyle = '#34d399';
                    ctx.globalAlpha = 1.0;
                } else {
                    // Not yet processed
                    ctx.fillStyle = 'rgba(255,255,255,0.06)';
                    ctx.globalAlpha = 1.0;
                }

                ctx.beginPath();
                ctx.roundRect(x, y, cellSize, cellSize, 4);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }

        // Progress bars at bottom
        const barY = cpuOffsetY + totalGridH + 20;
        const barW = totalGridW;
        const barH = 12;
        const totalCells = gridSize * gridSize;

        // CPU progress bar
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.roundRect(cpuOffsetX, barY, barW, barH, 6);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(cpuOffsetX, barY, barW * (this.cpuProgress / totalCells), barH, 6);
        ctx.fill();

        ctx.fillStyle = '#8b95a8';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round((this.cpuProgress / totalCells) * 100)}%`, cpuOffsetX + barW / 2, barY + barH + 16);

        // GPU progress bar
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.roundRect(gpuOffsetX, barY, barW, barH, 6);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(gpuOffsetX, barY, barW * (this.gpuProgress / totalCells), barH, 6);
        ctx.fill();

        ctx.fillStyle = '#8b95a8';
        ctx.fillText(`${Math.round((this.gpuProgress / totalCells) * 100)}%`, gpuOffsetX + barW / 2, barY + barH + 16);
    },

    startQuiz4_2() {
        Quiz.start({
            title: 'Chapter 4.2: GPU Speed Boost',
            chapterId: '4-2',
            questions: [
                {
                    question: 'Why are GPUs so much faster than CPUs for AI?',
                    options: [
                        'GPUs think faster',
                        'GPUs have thousands of tiny workers that do math at the same time',
                        'GPUs use less memory',
                        'GPUs are better at running Python'
                    ],
                    correct: 1,
                    explanation: 'GPUs have thousands of tiny workers (CUDA cores) that all do math at the same time. Since AI training is mostly math, having thousands of helpers is way faster than having just a few!'
                },
                {
                    question: 'What is the biggest problem when using a GPU?',
                    options: [
                        'The CPU is too slow',
                        'The internet connection',
                        'The GPU\'s desk (memory) can fill up with importance scores, mistake info, and scratch paper',
                        'Reading files from the hard drive'
                    ],
                    correct: 2,
                    explanation: 'The GPU has its own memory (VRAM) -- think of it like a desk. Big AI brains need space for importance scores, mistake info, and scratch paper. If the desk fills up, training stops!'
                },
                {
                    question: 'Why does practicing with more examples at once help the GPU?',
                    options: [
                        'It uses more hard drive space',
                        'With too few examples, most tiny workers sit around doing nothing',
                        'The GPU can only handle one example at a time',
                        'The number of examples does not matter'
                    ],
                    correct: 1,
                    explanation: 'GPUs have thousands of tiny workers. If you only give them 1 example, most workers have nothing to do! Giving them 32 to 256 examples at once keeps everyone busy and working.'
                },
                {
                    question: 'In PyTorch, how do you send your AI brain to the GPU?',
                    options: [
                        'model.gpu()',
                        'model.to("cuda")',
                        'model.accelerate()',
                        'torch.gpu(model)'
                    ],
                    correct: 1,
                    explanation: 'You type model.to("cuda") to move the AI brain to the GPU. You also need to send the data there too. It is like moving your homework to a faster desk!'
                }
            ]
        });
    }
};
