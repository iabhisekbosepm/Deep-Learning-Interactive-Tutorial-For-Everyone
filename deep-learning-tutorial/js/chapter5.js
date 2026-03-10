/* ============================================
   Chapter 5: Evaluation & Metrics
   ============================================ */

const Chapter5 = {
    init() {
        App.registerChapter('5-1', () => this.loadChapter5_1());
        App.registerChapter('5-2', () => this.loadChapter5_2());
        App.registerChapter('5-3', () => this.loadChapter5_3());
        App.registerChapter('5-4', () => this.loadChapter5_4());
    },

    // ============================================
    // 5.1: Precision & Recall
    // ============================================
    confusionMatrix: { tp: 45, fp: 10, fn: 5, tn: 40 },
    prThreshold: 0.5,

    loadChapter5_1() {
        const container = document.getElementById('chapter-5-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 5 \u2022 Chapter 5.1</span>
                <h1>Precision & Recall</h1>
                <p>Just getting the right answer most of the time is not enough! Imagine a robot that always says "You're fine!" -- it would be right 99 times out of 100, but it would miss the 1 person who really needs help. We need better ways to check how smart our AI really is!</p>
            </div>

            <!-- Why Accuracy Isn't Enough -->
            <div class="section">
                <h2><span class="section-icon">\u26A0\uFE0F</span> Why Accuracy Isn't Enough</h2>
                <p>Think of it like this: if only 1 kid in your whole school is sick, and you just say "everyone is fine!" you would be right about almost everyone -- but you missed the one kid who needs help! That is why we need two special scores called precision and recall.</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Imagine you are picking apples from a tree. <strong>Precision</strong> means: "Out of everything I picked, how many are actually good apples?" (Being careful!) <strong>Recall</strong> means: "Out of all the good apples on the tree, how many did I find?" (Not missing any!)</span>
                </div>

                <h3>The Four Outcomes</h3>
                <p>Every guess the AI makes falls into one of four boxes on its scorecard:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:16px 0;">
                    <div class="info-box success">
                        <span class="info-box-text"><strong style="color:#10b981;">True Positive (TP)</strong><br>
                        You said YES and it WAS yes! Great job!<br>
                        "You found a real gold coin!"</span>
                    </div>
                    <div class="info-box" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.2);">
                        <span class="info-box-text"><strong style="color:#ef4444;">False Positive (FP)</strong><br>
                        You said YES but it was actually NO. Oops, false alarm!<br>
                        "You thought it was gold, but it was just a rock!"</span>
                    </div>
                    <div class="info-box" style="background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.2);">
                        <span class="info-box-text"><strong style="color:#f59e0b;">False Negative (FN)</strong><br>
                        You said NO but it was actually YES. Oh no, you missed one!<br>
                        "You walked right past a gold coin!"</span>
                    </div>
                    <div class="info-box success">
                        <span class="info-box-text"><strong style="color:#10b981;">True Negative (TN)</strong><br>
                        You said NO and it WAS no. Correct!<br>
                        "You knew it was just a regular rock. Smart!"</span>
                    </div>
                </div>
            </div>

            <!-- Interactive Confusion Matrix -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Interactive Confusion Matrix</h2>
                <p>This is a scorecard that shows what you got right and wrong! Use the + and - buttons to change the numbers and watch how the scores change.</p>
                <span class="tag tag-interactive">Interactive</span>

                <div style="display:flex;flex-wrap:wrap;gap:32px;justify-content:center;align-items:flex-start;margin:20px 0;">
                    <div>
                        <div style="text-align:center;margin-bottom:12px;font-weight:600;color:var(--text-secondary);">
                            Confusion Matrix
                        </div>
                        <div style="display:grid;grid-template-columns:auto auto auto;gap:0;text-align:center;">
                            <div style="padding:8px;"></div>
                            <div style="padding:8px;font-weight:600;color:#10b981;font-size:12px;">Predicted +</div>
                            <div style="padding:8px;font-weight:600;color:#ef4444;font-size:12px;">Predicted -</div>

                            <div style="padding:8px;font-weight:600;color:#10b981;font-size:12px;writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);">Actual +</div>
                            <div class="matrix-display" style="padding:0;">
                                <div class="matrix-cell highlight" style="min-width:100px;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:default;">
                                    <div style="font-size:10px;font-weight:600;color:#10b981;">TP</div>
                                    <div style="font-size:22px;font-weight:700;" id="cmTP">45</div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="btn-small btn-secondary" style="padding:2px 8px;font-size:12px;" onclick="Chapter5.adjustCM('tp',-1)">-</button>
                                        <button class="btn-small btn-primary" style="padding:2px 8px;font-size:12px;" onclick="Chapter5.adjustCM('tp',1)">+</button>
                                    </div>
                                </div>
                            </div>
                            <div class="matrix-display" style="padding:0;">
                                <div class="matrix-cell" style="min-width:100px;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:default;background:rgba(245,158,11,0.1);">
                                    <div style="font-size:10px;font-weight:600;color:#f59e0b;">FN</div>
                                    <div style="font-size:22px;font-weight:700;" id="cmFN">5</div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="btn-small btn-secondary" style="padding:2px 8px;font-size:12px;" onclick="Chapter5.adjustCM('fn',-1)">-</button>
                                        <button class="btn-small btn-primary" style="padding:2px 8px;font-size:12px;" onclick="Chapter5.adjustCM('fn',1)">+</button>
                                    </div>
                                </div>
                            </div>

                            <div style="padding:8px;font-weight:600;color:#ef4444;font-size:12px;writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);">Actual -</div>
                            <div class="matrix-display" style="padding:0;">
                                <div class="matrix-cell" style="min-width:100px;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:default;background:rgba(239,68,68,0.1);">
                                    <div style="font-size:10px;font-weight:600;color:#ef4444;">FP</div>
                                    <div style="font-size:22px;font-weight:700;" id="cmFP">10</div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="btn-small btn-secondary" style="padding:2px 8px;font-size:12px;" onclick="Chapter5.adjustCM('fp',-1)">-</button>
                                        <button class="btn-small btn-primary" style="padding:2px 8px;font-size:12px;" onclick="Chapter5.adjustCM('fp',1)">+</button>
                                    </div>
                                </div>
                            </div>
                            <div class="matrix-display" style="padding:0;">
                                <div class="matrix-cell highlight" style="min-width:100px;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:default;">
                                    <div style="font-size:10px;font-weight:600;color:#10b981;">TN</div>
                                    <div style="font-size:22px;font-weight:700;" id="cmTN">40</div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="btn-small btn-secondary" style="padding:2px 8px;font-size:12px;" onclick="Chapter5.adjustCM('tn',-1)">-</button>
                                        <button class="btn-small btn-primary" style="padding:2px 8px;font-size:12px;" onclick="Chapter5.adjustCM('tn',1)">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="min-width:260px;">
                        <div class="gd-stats" style="flex-direction:column;gap:12px;">
                            <div class="gd-stat">
                                <div class="stat-label">Precision (How careful? TP / (TP+FP))</div>
                                <div class="stat-value" id="cmPrecision" style="color:#6366f1;">0.818</div>
                            </div>
                            <div class="gd-stat">
                                <div class="stat-label">Recall (How many found? TP / (TP+FN))</div>
                                <div class="stat-value" id="cmRecall" style="color:#10b981;">0.900</div>
                            </div>
                            <div class="gd-stat">
                                <div class="stat-label">F1 Score (One grade for both!)</div>
                                <div class="stat-value" id="cmF1" style="color:#f59e0b;">0.857</div>
                            </div>
                            <div class="gd-stat">
                                <div class="stat-label">Accuracy (Right answers / Total)</div>
                                <div class="stat-value" id="cmAccuracy" style="color:#8b5cf6;">0.850</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="step-explanation" id="cmExplanation">
                    Total samples: 100 | Positive predictions: 55 | Actual positives: 50
                </div>
            </div>

            <!-- Threshold Slider -->
            <div class="section">
                <h2><span class="section-icon">\u2696\uFE0F</span> Precision-Recall Tradeoff</h2>
                <p>The AI gives each answer a score, like "I am 78% sure this is a YES." The <strong>threshold</strong> is how sure the AI needs to be before it says YES. Move the slider to see what happens!</p>

                <div class="controls">
                    <div class="control-group">
                        <label>Classification Threshold (<span id="thresholdVal">0.50</span>)</label>
                        <input type="range" id="thresholdSlider" min="0.05" max="0.95" value="0.50" step="0.05"
                               oninput="Chapter5.updateThreshold()">
                    </div>
                </div>

                <div class="gd-stats" id="thresholdStats">
                    <div class="gd-stat">
                        <div class="stat-label">Precision</div>
                        <div class="stat-value" id="thrPrecision" style="color:#6366f1;">0.818</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Recall</div>
                        <div class="stat-value" id="thrRecall" style="color:#10b981;">0.900</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">F1 Score</div>
                        <div class="stat-value" id="thrF1" style="color:#f59e0b;">0.857</div>
                    </div>
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A1</span>
                    <span class="info-box-text"><strong>Low threshold (0.1):</strong> The AI says YES to almost everything. It finds all the good stuff, but makes a lot of wrong guesses too!<br>
                    <strong>High threshold (0.9):</strong> The AI is super picky. When it says YES, it is usually right, but it misses a lot!<br>
                    It is like a game -- you have to choose: catch everything or be super careful!</span>
                </div>

                <h3>PR Curve Visualization</h3>
                <div class="graph-container">
                    <canvas id="prCurveCanvas" width="750" height="350"></canvas>
                    <div class="graph-legend">
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #6366f1;"></span>
                            Precision-Recall Curve
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #fbbf24;"></span>
                            Current Threshold
                        </div>
                    </div>
                </div>
            </div>

            <!-- Real-World Scenarios -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFE5</span> Real-World Scenarios</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:20px;">
                        <h3 style="color:#ef4444;margin-bottom:8px;">\uD83C\uDFE5 Medical Diagnosis</h3>
                        <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">
                            Think of it like a lifeguard at a pool. It is better to blow the whistle too many times (false alarm) than to miss someone who needs help! We want to <strong>find everyone who is sick</strong>, even if we sometimes worry about people who are fine.
                        </p>
                        <div style="margin-top:10px;padding:8px 12px;background:rgba(239,68,68,0.1);border-radius:8px;font-size:12px;color:#ef4444;">
                            Priority: Recall > Precision | Use low threshold
                        </div>
                    </div>
                    <div class="feature-card" style="padding:20px;">
                        <h3 style="color:#6366f1;margin-bottom:8px;">\uD83D\uDCE7 Spam Detection</h3>
                        <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">
                            Imagine your friend sends you an important party invite, but the mail sorter throws it in the trash! That would be terrible! We want to be <strong>super careful</strong> about what we call junk mail, even if some junk sneaks through.
                        </p>
                        <div style="margin-top:10px;padding:8px 12px;background:rgba(99,102,241,0.1);border-radius:8px;font-size:12px;color:#6366f1;">
                            Priority: Precision > Recall | Use high threshold
                        </div>
                    </div>
                </div>
            </div>

            <!-- Code Example -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Computing Metrics in Python</h2>
                <div class="code-block">
<span class="keyword">from</span> sklearn.metrics <span class="keyword">import</span> (
    precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

<span class="comment"># The real answers and what our AI guessed</span>
y_true = [<span class="number">1</span>, <span class="number">1</span>, <span class="number">0</span>, <span class="number">1</span>, <span class="number">0</span>, <span class="number">0</span>, <span class="number">1</span>, <span class="number">1</span>, <span class="number">0</span>, <span class="number">0</span>]
y_pred = [<span class="number">1</span>, <span class="number">0</span>, <span class="number">0</span>, <span class="number">1</span>, <span class="number">1</span>, <span class="number">0</span>, <span class="number">1</span>, <span class="number">1</span>, <span class="number">0</span>, <span class="number">0</span>]

<span class="comment"># Check each score one by one</span>
precision = <span class="function">precision_score</span>(y_true, y_pred)   <span class="comment"># 0.80</span>
recall    = <span class="function">recall_score</span>(y_true, y_pred)      <span class="comment"># 0.80</span>
f1        = <span class="function">f1_score</span>(y_true, y_pred)          <span class="comment"># 0.80</span>

<span class="comment"># Print the full report card</span>
<span class="function">print</span>(<span class="function">classification_report</span>(y_true, y_pred))

<span class="comment"># The scorecard showing rights and wrongs</span>
cm = <span class="function">confusion_matrix</span>(y_true, y_pred)
<span class="comment"># [[TN, FP], [FN, TP]] = [[4, 1], [1, 4]]</span>
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <p>Let's see what you learned about being careful and not missing things!</p>
                <span class="tag tag-quiz">Quiz \u2022 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter5.startQuiz5_1()">Start Quiz \u2192</button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('4-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('5-2')">Next: Dropout & Regularization \u2192</button>
            </div>
        `;

        this.updateCMStats();
        this.updateThreshold();
    },

    adjustCM(key, delta) {
        const newVal = this.confusionMatrix[key] + delta;
        if (newVal < 0) return;
        this.confusionMatrix[key] = newVal;
        document.getElementById('cmTP').textContent = this.confusionMatrix.tp;
        document.getElementById('cmFP').textContent = this.confusionMatrix.fp;
        document.getElementById('cmFN').textContent = this.confusionMatrix.fn;
        document.getElementById('cmTN').textContent = this.confusionMatrix.tn;
        this.updateCMStats();
    },

    updateCMStats() {
        const { tp, fp, fn, tn } = this.confusionMatrix;
        const total = tp + fp + fn + tn;
        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
        const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
        const accuracy = total > 0 ? (tp + tn) / total : 0;

        const el = id => document.getElementById(id);
        if (el('cmPrecision')) el('cmPrecision').textContent = precision.toFixed(3);
        if (el('cmRecall')) el('cmRecall').textContent = recall.toFixed(3);
        if (el('cmF1')) el('cmF1').textContent = f1.toFixed(3);
        if (el('cmAccuracy')) el('cmAccuracy').textContent = accuracy.toFixed(3);
        if (el('cmExplanation')) {
            el('cmExplanation').innerHTML =
                `Total samples: ${total} | Positive predictions: ${tp + fp} | Actual positives: ${tp + fn}`;
        }
    },

    updateThreshold() {
        const thr = parseFloat(document.getElementById('thresholdSlider')?.value || 0.5);
        this.prThreshold = thr;
        document.getElementById('thresholdVal').textContent = thr.toFixed(2);

        // Simulate threshold effect on a fixed set of 100 "model outputs"
        // As threshold increases: fewer positives, higher precision, lower recall
        const baseTp = 50;
        const baseFp = 15;
        const totalPositive = 50;

        const factor = 1 - thr;
        const tp = Math.round(baseTp * Math.pow(factor, 0.5));
        const fp = Math.round(baseFp * Math.pow(factor, 1.5));
        const fn = totalPositive - tp;

        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        const recall = totalPositive > 0 ? tp / totalPositive : 0;
        const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

        const el = id => document.getElementById(id);
        if (el('thrPrecision')) el('thrPrecision').textContent = precision.toFixed(3);
        if (el('thrRecall')) el('thrRecall').textContent = recall.toFixed(3);
        if (el('thrF1')) el('thrF1').textContent = f1.toFixed(3);

        this.drawPRCurve(thr);
    },

    drawPRCurve(currentThreshold) {
        const canvas = document.getElementById('prCurveCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 40, left: 60 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + plotH * (i / 5);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
            const x = pad.left + plotW * (i / 5);
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
        }

        // Axis labels
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 5; i++) {
            ctx.fillText((i * 0.2).toFixed(1), pad.left + plotW * (i / 5), H - 10);
        }
        ctx.fillText('Recall', W / 2, H - 0);

        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            ctx.fillText((1 - i * 0.2).toFixed(1), pad.left - 8, pad.top + plotH * (i / 5) + 4);
        }
        ctx.save();
        ctx.translate(12, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Precision', 0, 0);
        ctx.restore();

        // Generate PR curve points
        const prPoints = [];
        for (let t = 0.01; t <= 0.99; t += 0.01) {
            const baseTp = 50;
            const baseFp = 15;
            const totalPositive = 50;
            const factor = 1 - t;
            const tp = baseTp * Math.pow(factor, 0.5);
            const fp = baseFp * Math.pow(factor, 1.5);
            const prec = tp + fp > 0 ? tp / (tp + fp) : 1;
            const rec = tp / totalPositive;
            prPoints.push({ recall: rec, precision: prec, threshold: t });
        }

        // Draw the PR curve
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        prPoints.forEach((pt, i) => {
            const x = pad.left + pt.recall * plotW;
            const y = pad.top + (1 - pt.precision) * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Fill area under curve
        ctx.beginPath();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
        prPoints.forEach((pt, i) => {
            const x = pad.left + pt.recall * plotW;
            const y = pad.top + (1 - pt.precision) * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        const lastPt = prPoints[prPoints.length - 1];
        ctx.lineTo(pad.left + lastPt.recall * plotW, pad.top + plotH);
        ctx.lineTo(pad.left + prPoints[0].recall * plotW, pad.top + plotH);
        ctx.closePath();
        ctx.fill();

        // Current threshold marker
        const baseTp = 50;
        const baseFp = 15;
        const totalPositive = 50;
        const factor = 1 - currentThreshold;
        const curTp = baseTp * Math.pow(factor, 0.5);
        const curFp = baseFp * Math.pow(factor, 1.5);
        const curPrec = curTp + curFp > 0 ? curTp / (curTp + curFp) : 1;
        const curRec = curTp / totalPositive;

        const markerX = pad.left + curRec * plotW;
        const markerY = pad.top + (1 - curPrec) * plotH;

        ctx.beginPath();
        ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`t=${currentThreshold.toFixed(2)}`, markerX + 14, markerY - 4);
        ctx.font = '11px JetBrains Mono';
        ctx.fillStyle = '#8b95a8';
        ctx.fillText(`P=${curPrec.toFixed(2)}, R=${curRec.toFixed(2)}`, markerX + 14, markerY + 12);
    },

    startQuiz5_1() {
        Quiz.start({
            title: 'Chapter 5.1: Precision & Recall',
            chapterId: '5-1',
            questions: [
                {
                    question: 'The AI said YES 100 times. 80 were right (TP=80) and 20 were wrong (FP=20). What is its precision (how careful it was)?',
                    options: ['0.80', '0.89', '0.85', '0.90'],
                    correct: 0,
                    explanation: 'Precision = Right YESes / All YESes = 80 / (80 + 20) = 80 out of 100 = 0.80. It was right 80% of the time when it said YES!'
                },
                {
                    question: 'When checking if someone is sick, which score matters most?',
                    options: ['Precision (being careful)', 'Recall (not missing anyone)', 'Accuracy (right answers)', 'Specificity'],
                    correct: 1,
                    explanation: 'Recall is the most important here! It is like being a lifeguard -- you do NOT want to miss someone who needs help. Finding everyone who is sick is more important than being perfect.'
                },
                {
                    question: 'What is the F1 score?',
                    options: [
                        'Just adding precision and recall together and dividing by 2',
                        'A single grade that combines being careful AND not missing things',
                        'Precision times recall',
                        'Whichever is bigger, precision or recall'
                    ],
                    correct: 1,
                    explanation: 'The F1 score is a single grade that mixes both scores together in a special way. If one score is really bad, the F1 score will be bad too -- you need both to be good!'
                },
                {
                    question: 'When you make the AI more picky (higher threshold) before saying YES, what happens?',
                    options: [
                        'Both being careful and finding things get better',
                        'It gets more careful but misses more things',
                        'Both get worse',
                        'It finds more things but is less careful'
                    ],
                    correct: 1,
                    explanation: 'When the AI is more picky, it only says YES when it is really sure. So when it does say YES, it is usually right (more careful). But it skips some real YES answers (misses more).'
                },
                {
                    question: 'A junk mail sorter is 95% careful (precision) and finds 60% of junk (recall). What does this mean?',
                    options: [
                        '95% of what it calls junk really IS junk, but 40% of junk sneaks through',
                        '95% of all junk is caught, and 60% of what it calls junk is really junk',
                        'The sorter is 95% correct overall',
                        '60% of all mail is junk'
                    ],
                    correct: 0,
                    explanation: 'When the sorter says "this is junk," it is right 95% of the time (very careful!). But it only catches 60% of ALL the junk, so 40% of junk mail sneaks into your inbox.'
                }
            ]
        });
    },

    // ============================================
    // 5.2: Dropout & Regularization
    // ============================================
    dropoutRate: 0.3,
    dropoutActive: true,
    droppedNeurons: [],
    dropoutAnimFrame: null,
    overfitAnimFrame: null,

    loadChapter5_2() {
        const container = document.getElementById('chapter-5-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 5 \u2022 Chapter 5.2</span>
                <h1>Dropout & Regularization</h1>
                <p>Here is the fun part: sometimes an AI cheats by memorizing all the answers instead of actually learning! That is called overfitting. We have cool tricks like dropout to stop it from being lazy!</p>
            </div>

            <!-- What is Overfitting -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCC9</span> The Overfitting Problem</h2>
                <p>Imagine a student who memorizes every answer for the practice test. They get 100% on practice! But on the real test with different questions, they fail. That is overfitting -- memorizing instead of understanding.</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Think of it like learning to cook. If you only memorize one recipe word-for-word, you can make that ONE dish. But if you understand HOW cooking works (heat, mixing, timing), you can make ANYTHING! We want our AI to understand, not just memorize.</span>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="info-box" style="flex-direction:column;text-align:center;">
                        <strong style="color:#ef4444;">Underfitting</strong>
                        <span class="info-box-text" style="font-size:13px;">The AI did not try hard enough. It is bad at practice AND the real test.</span>
                    </div>
                    <div class="info-box success" style="flex-direction:column;text-align:center;">
                        <strong style="color:#10b981;">Just Right</strong>
                        <span class="info-box-text" style="font-size:13px;">The AI really learned the lesson! It does great on practice AND the real test!</span>
                    </div>
                    <div class="info-box warning" style="flex-direction:column;text-align:center;">
                        <strong style="color:#f59e0b;">Overfitting</strong>
                        <span class="info-box-text" style="font-size:13px;">The AI memorized the answers instead of learning! Great at practice, terrible on the real test.</span>
                    </div>
                </div>
            </div>

            <!-- Dropout Visualization -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFB2</span> Dropout Visualization</h2>
                <p>Dropout is like randomly turning off some brain cells during practice! This way, the AI cannot be lazy and depend on just a few neurons. Every neuron has to learn to be useful! Click the button to see which brain cells get turned off!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Dropout Rate (<span id="dropoutRateVal">0.30</span>)</label>
                        <input type="range" id="dropoutRateSlider" min="0" max="0.8" value="0.3" step="0.05"
                               oninput="Chapter5.updateDropoutRate()">
                    </div>
                    <div class="control-group">
                        <button class="btn-primary btn-small" onclick="Chapter5.toggleDropout()">
                            \uD83C\uDFB2 Re-roll Dropout
                        </button>
                        <button class="btn-secondary btn-small" onclick="Chapter5.toggleDropoutOnOff()" id="dropoutToggleBtn">
                            Disable Dropout
                        </button>
                    </div>
                </div>

                <div class="network-viz">
                    <canvas id="dropoutCanvas" width="800" height="300"></canvas>
                </div>

                <div class="step-explanation" id="dropoutExplanation">
                    Dropout rate: 0.30 | Active neurons: computing... | Dropped neurons shown in gray
                </div>
            </div>

            <!-- Overfitting Comparison -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Training With vs Without Dropout</h2>
                <p>Watch what happens! Without dropout, the AI gets better and better at practice but worse on the real test (cheating!). With dropout, it learns for real and does well on both!</p>

                <div class="controls">
                    <button class="btn-primary btn-small" id="overfitBtn" onclick="Chapter5.simulateOverfitting()">
                        \u25B6 Simulate Training
                    </button>
                    <button class="btn-secondary btn-small" onclick="Chapter5.resetOverfitting()">
                        Reset
                    </button>
                </div>

                <div class="graph-container">
                    <canvas id="overfitCanvas" width="750" height="350"></canvas>
                    <div class="graph-legend">
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #6366f1;"></span>
                            Train Loss (No Dropout)
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #ef4444;"></span>
                            Val Loss (No Dropout)
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #10b981;"></span>
                            Train Loss (With Dropout)
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #f59e0b;"></span>
                            Val Loss (With Dropout)
                        </div>
                    </div>
                </div>
            </div>

            <!-- L1, L2 Regularization -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD17</span> L1 & L2 Regularization</h2>
                <p>Dropout is not the only way to stop cheating! L1 and L2 are like rules that give a penalty if the AI makes its numbers too big. Think of it like a teacher saying "keep your answers simple!"</p>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="info-box">
                        <span class="info-box-text">
                            <strong style="color:#6366f1;">L1 Regularization (Lasso)</strong><br>
                            This penalty can shrink some numbers all the way to zero! It is like cleaning your room by throwing away things you do not need. Only the important stuff stays.<br>
                            <code>Loss = Original_Loss + \u03BB \u00D7 \u2211|w\u1D62|</code>
                        </span>
                    </div>
                    <div class="info-box">
                        <span class="info-box-text">
                            <strong style="color:#10b981;">L2 Regularization (Ridge)</strong><br>
                            This penalty makes big numbers smaller, but does not erase them completely. It is like telling everyone on the team to share the work -- no one player can hog the ball!<br>
                            <code>Loss = Original_Loss + \u03BB \u00D7 \u2211w\u1D62\u00B2</code>
                        </span>
                    </div>
                </div>

                <div class="info-box warning">
                    <span class="info-box-icon">\u26A1</span>
                    <span class="info-box-text">The \u03BB (lambda) number controls how strict the rule is.
                    Too gentle = the AI still cheats. Too strict = the AI cannot learn anything at all!
                    You have to find the sweet spot, just like Goldilocks!</span>
                </div>
            </div>

            <!-- Keras Code -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Dropout in Keras</h2>
                <div class="code-block">
<span class="keyword">from</span> tensorflow.keras.models <span class="keyword">import</span> Sequential
<span class="keyword">from</span> tensorflow.keras.layers <span class="keyword">import</span> Dense, Dropout
<span class="keyword">from</span> tensorflow.keras <span class="keyword">import</span> regularizers

<span class="comment"># Model with NO rules (might cheat and memorize!)</span>
model_overfit = <span class="function">Sequential</span>([
    <span class="function">Dense</span>(<span class="number">256</span>, activation=<span class="string">'relu'</span>, input_shape=(<span class="number">784</span>,)),
    <span class="function">Dense</span>(<span class="number">256</span>, activation=<span class="string">'relu'</span>),
    <span class="function">Dense</span>(<span class="number">10</span>, activation=<span class="string">'softmax'</span>)
])

<span class="comment"># Model WITH dropout + L2 rules (no cheating allowed!)</span>
model_regular = <span class="function">Sequential</span>([
    <span class="function">Dense</span>(<span class="number">256</span>, activation=<span class="string">'relu'</span>, input_shape=(<span class="number">784</span>,),
          kernel_regularizer=regularizers.<span class="function">l2</span>(<span class="number">0.01</span>)),
    <span class="function">Dropout</span>(<span class="number">0.3</span>),              <span class="comment"># Turn off 30% of brain cells during practice</span>
    <span class="function">Dense</span>(<span class="number">256</span>, activation=<span class="string">'relu'</span>,
          kernel_regularizer=regularizers.<span class="function">l2</span>(<span class="number">0.01</span>)),
    <span class="function">Dropout</span>(<span class="number">0.3</span>),
    <span class="function">Dense</span>(<span class="number">10</span>, activation=<span class="string">'softmax'</span>)
])

<span class="comment"># Cool fact: Dropout only happens during practice!</span>
<span class="comment"># On test day, all brain cells are turned ON</span>
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter5.startQuiz5_2()">Start Quiz \u2192</button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('5-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('5-3')">Next: Imbalanced Data \u2192</button>
            </div>
        `;

        this.generateDroppedNeurons();
        this.drawDropoutNetwork();
        this.resetOverfitting();
    },

    updateDropoutRate() {
        this.dropoutRate = parseFloat(document.getElementById('dropoutRateSlider')?.value || 0.3);
        document.getElementById('dropoutRateVal').textContent = this.dropoutRate.toFixed(2);
        this.generateDroppedNeurons();
        this.drawDropoutNetwork();
    },

    toggleDropout() {
        this.generateDroppedNeurons();
        this.drawDropoutNetwork();
    },

    toggleDropoutOnOff() {
        this.dropoutActive = !this.dropoutActive;
        const btn = document.getElementById('dropoutToggleBtn');
        if (btn) btn.textContent = this.dropoutActive ? 'Disable Dropout' : 'Enable Dropout';
        this.drawDropoutNetwork();
    },

    dropoutLayers: [
        { name: 'Input', nodes: 6, color: '#3b82f6', x: 80 },
        { name: 'Hidden 1', nodes: 8, color: '#8b5cf6', x: 250 },
        { name: 'Hidden 2', nodes: 8, color: '#a855f7', x: 420 },
        { name: 'Hidden 3', nodes: 6, color: '#8b5cf6', x: 590 },
        { name: 'Output', nodes: 3, color: '#10b981', x: 740 }
    ],

    generateDroppedNeurons() {
        this.droppedNeurons = [];
        this.dropoutLayers.forEach((layer, lIdx) => {
            const dropped = [];
            // Don't drop input or output neurons
            if (lIdx > 0 && lIdx < this.dropoutLayers.length - 1) {
                for (let i = 0; i < layer.nodes; i++) {
                    dropped.push(Math.random() < this.dropoutRate);
                }
            } else {
                for (let i = 0; i < layer.nodes; i++) {
                    dropped.push(false);
                }
            }
            this.droppedNeurons.push(dropped);
        });
    },

    drawDropoutNetwork() {
        const canvas = document.getElementById('dropoutCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const layers = this.dropoutLayers;
        const dropped = this.droppedNeurons;

        // Draw connections
        for (let l = 0; l < layers.length - 1; l++) {
            const from = layers[l], to = layers[l + 1];
            for (let i = 0; i < from.nodes; i++) {
                for (let j = 0; j < to.nodes; j++) {
                    const fromDropped = this.dropoutActive && dropped[l] && dropped[l][i];
                    const toDropped = this.dropoutActive && dropped[l + 1] && dropped[l + 1][j];
                    const y1 = (H / (from.nodes + 1)) * (i + 1);
                    const y2 = (H / (to.nodes + 1)) * (j + 1);
                    ctx.beginPath();
                    ctx.moveTo(from.x, y1);
                    ctx.lineTo(to.x, y2);
                    if (fromDropped || toDropped) {
                        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
                        ctx.lineWidth = 0.5;
                    } else {
                        ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
                        ctx.lineWidth = 1;
                    }
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        let totalNeurons = 0;
        let activeNeurons = 0;

        layers.forEach((layer, lIdx) => {
            for (let i = 0; i < layer.nodes; i++) {
                totalNeurons++;
                const isDropped = this.dropoutActive && dropped[lIdx] && dropped[lIdx][i];
                const y = (H / (layer.nodes + 1)) * (i + 1);

                if (isDropped) {
                    // Dropped neuron - gray, dashed outline, X mark
                    ctx.beginPath();
                    ctx.arc(layer.x, y, 14, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,0.05)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([3, 3]);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // X mark
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
                    ctx.lineWidth = 2;
                    ctx.moveTo(layer.x - 6, y - 6);
                    ctx.lineTo(layer.x + 6, y + 6);
                    ctx.moveTo(layer.x + 6, y - 6);
                    ctx.lineTo(layer.x - 6, y + 6);
                    ctx.stroke();
                } else {
                    activeNeurons++;
                    // Active neuron
                    ctx.beginPath();
                    ctx.arc(layer.x, y, 14, 0, Math.PI * 2);
                    ctx.fillStyle = layer.color;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            // Label
            ctx.fillStyle = '#8b95a8';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(layer.name, layer.x, H - 8);
        });

        // Update explanation
        const expl = document.getElementById('dropoutExplanation');
        if (expl) {
            if (this.dropoutActive) {
                expl.innerHTML = `Dropout rate: ${this.dropoutRate.toFixed(2)} | Active neurons: ${activeNeurons}/${totalNeurons} | Dropped neurons shown with X`;
            } else {
                expl.innerHTML = `Dropout <strong>disabled</strong> | All ${totalNeurons} neurons active (inference mode)`;
            }
        }
    },

    overfitData: { noDropTrain: [], noDropVal: [], dropTrain: [], dropVal: [], epoch: 0 },
    overfitRunning: false,

    resetOverfitting() {
        this.overfitRunning = false;
        if (this.overfitAnimFrame) cancelAnimationFrame(this.overfitAnimFrame);
        this.overfitData = { noDropTrain: [], noDropVal: [], dropTrain: [], dropVal: [], epoch: 0 };
        const btn = document.getElementById('overfitBtn');
        if (btn) { btn.disabled = false; btn.textContent = '\u25B6 Simulate Training'; }
        this.drawOverfitGraph();
    },

    simulateOverfitting() {
        if (this.overfitRunning) return;
        this.overfitRunning = true;
        const btn = document.getElementById('overfitBtn');
        if (btn) { btn.disabled = true; btn.textContent = 'Training...'; }

        const totalEpochs = 50;
        const d = this.overfitData;

        // Pre-generate data
        for (let i = 0; i < totalEpochs; i++) {
            const t = i / totalEpochs;

            // No dropout: train loss keeps going down, val loss starts rising
            const ndTrain = 1.8 * Math.exp(-4 * t) + 0.05 + Math.random() * 0.02;
            const ndVal = 1.8 * Math.exp(-2 * t) + 0.15 * t * t + 0.2 + Math.random() * 0.04;

            // With dropout: both go down and stay close
            const dTrain = 1.8 * Math.exp(-3 * t) + 0.15 + Math.random() * 0.03;
            const dVal = 1.8 * Math.exp(-2.5 * t) + 0.18 + Math.random() * 0.04;

            d.noDropTrain.push(ndTrain);
            d.noDropVal.push(ndVal);
            d.dropTrain.push(dTrain);
            d.dropVal.push(dVal);
        }

        let frame = 0;
        const animate = () => {
            if (frame >= totalEpochs) {
                this.overfitRunning = false;
                if (btn) { btn.disabled = false; btn.textContent = '\u25B6 Simulate Training'; }
                return;
            }
            d.epoch = frame + 1;
            frame++;
            this.drawOverfitGraph(frame);
            setTimeout(animate, 100);
        };
        animate();
    },

    drawOverfitGraph(currentEpoch) {
        const canvas = document.getElementById('overfitCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 40, left: 60 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;
        const epoch = currentEpoch || 0;

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + plotH * (i / 5);
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
            ctx.fillStyle = '#5a6478';
            ctx.font = '11px JetBrains Mono';
            ctx.textAlign = 'right';
            ctx.fillText((2.0 - i * 0.4).toFixed(1), pad.left - 8, y + 4);
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#5a6478';
        ctx.fillText('Epochs', W / 2, H - 5);
        ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText('Loss', 0, 0); ctx.restore();

        const maxEpochs = 50;
        const maxLoss = 2.0;

        const drawLine = (data, color, dashPattern) => {
            if (data.length < 1 || epoch < 1) return;
            const n = Math.min(epoch, data.length);
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            if (dashPattern) ctx.setLineDash(dashPattern);
            for (let i = 0; i < n; i++) {
                const x = pad.left + (i / (maxEpochs - 1)) * plotW;
                const y = pad.top + (1 - Math.min(data[i], maxLoss) / maxLoss) * plotH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        };

        const d = this.overfitData;
        drawLine(d.noDropTrain, '#6366f1', null);
        drawLine(d.noDropVal, '#ef4444', [6, 4]);
        drawLine(d.dropTrain, '#10b981', null);
        drawLine(d.dropVal, '#f59e0b', [6, 4]);

        // Overfitting annotation
        if (epoch > 25) {
            const annotX = pad.left + (30 / (maxEpochs - 1)) * plotW;
            const annotY = pad.top + 20;
            ctx.fillStyle = 'rgba(239,68,68,0.8)';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('\u2191 Overfitting!', annotX, annotY);
            ctx.font = '10px Inter';
            ctx.fillText('Val loss rising', annotX, annotY + 14);
        }
    },

    startQuiz5_2() {
        Quiz.start({
            title: 'Chapter 5.2: Dropout & Regularization',
            chapterId: '5-2',
            questions: [
                {
                    question: 'What does dropout do during practice (training)?',
                    options: [
                        'Removes whole layers from the brain',
                        'Randomly turns off some brain cells so the AI cannot be lazy',
                        'Makes the AI learn slower',
                        'Throws away some practice questions'
                    ],
                    correct: 1,
                    explanation: 'Dropout randomly turns off some brain cells during each practice round. This forces every brain cell to learn to be useful, so the AI really understands the lesson!'
                },
                {
                    question: 'Is dropout still on during the real test (making predictions)?',
                    options: [
                        'Yes, always',
                        'No, all brain cells are turned ON for the real test',
                        'Only for the first layer',
                        'Only if the AI was cheating'
                    ],
                    correct: 1,
                    explanation: 'On test day, ALL brain cells are turned back on! Dropout only happens during practice. The AI uses its full brain power when it really counts.'
                },
                {
                    question: 'What is the difference between L1 and L2 rules?',
                    options: [
                        'L1 is faster than L2',
                        'L1 can erase numbers completely (throw away junk), L2 just makes numbers smaller (share the work)',
                        'L1 is for inputs, L2 is for outputs',
                        'They are exactly the same'
                    ],
                    correct: 1,
                    explanation: 'L1 is like cleaning your room -- it throws away stuff you do not need (sets numbers to zero). L2 is like sharing -- it makes everyone smaller but keeps everything.'
                },
                {
                    question: 'Which is a sign the AI is memorizing instead of learning (overfitting)?',
                    options: [
                        'It gets better at both practice and the real test',
                        'It gets better at practice but WORSE on the real test',
                        'It gets worse at everything',
                        'It gets worse at practice but better on the real test'
                    ],
                    correct: 1,
                    explanation: 'If the AI keeps getting better at practice but worse on new questions, it is just memorizing answers! That is the biggest clue that overfitting is happening.'
                }
            ]
        });
    },

    // ============================================
    // 5.3: Imbalanced Data
    // ============================================
    imbalanceStrategy: 'none',
    imbalanceOriginal: { positive: 50, negative: 950 },

    loadChapter5_3() {
        const container = document.getElementById('chapter-5-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 5 \u2022 Chapter 5.3</span>
                <h1>Imbalanced Data</h1>
                <p>Imagine you have a bag with 99 blue marbles and just 1 red marble. That is what imbalanced data looks like -- one group has WAY more examples than the other! The tricky part is that the rare group is usually the one we care about most!</p>
            </div>

            <!-- The Problem -->
            <div class="section">
                <h2><span class="section-icon">\u26A0\uFE0F</span> Why Imbalance Matters</h2>
                <p>Think of it like this: if there are 999 good cookies and only 1 bad cookie, an AI that says "all cookies are good!" would be right 999 times out of 1000. Sounds amazing, right? But it missed the bad cookie! The numbers look great but the AI is useless at its real job!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">When one group is way bigger, just counting "right answers" does not work!
                    Use the special scores we learned in Chapter 5.1 (precision, recall, F1) to check if the AI is really doing a good job.</span>
                </div>
            </div>

            <!-- Visual Dataset -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Visualizing Class Imbalance</h2>
                <p>Look at this! We have 1000 dots: 950 blue ones and only 50 red ones. The red ones are super rare -- like finding a four-leaf clover in a huge field!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="network-viz">
                    <canvas id="imbalanceDotsCanvas" width="800" height="200"></canvas>
                </div>

                <div class="step-explanation" id="imbalanceInfo">
                    Original: 950 negative (95%) vs 50 positive (5%) -- Highly imbalanced!
                </div>
            </div>

            <!-- Strategies -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD27</span> Balancing Strategies</h2>
                <p>Here are some cool tricks to fix the imbalance! Click each one to see how it works:</p>

                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:16px 0;">
                    <button class="btn-secondary" style="padding:12px;text-align:left;" onclick="Chapter5.applyImbalanceStrategy('none')">
                        <strong>\uD83D\uDCE6 Original (No Fix)</strong><br>
                        <span style="font-size:12px;color:var(--text-secondary);">Keep things as they are. No fix yet!</span>
                    </button>
                    <button class="btn-secondary" style="padding:12px;text-align:left;" onclick="Chapter5.applyImbalanceStrategy('oversample')">
                        <strong>\u2B06\uFE0F Oversampling</strong><br>
                        <span style="font-size:12px;color:var(--text-secondary);">Make copies of the rare group to even things out!</span>
                    </button>
                    <button class="btn-secondary" style="padding:12px;text-align:left;" onclick="Chapter5.applyImbalanceStrategy('undersample')">
                        <strong>\u2B07\uFE0F Undersampling</strong><br>
                        <span style="font-size:12px;color:var(--text-secondary);">Use fewer from the big group so both groups are equal.</span>
                    </button>
                    <button class="btn-secondary" style="padding:12px;text-align:left;" onclick="Chapter5.applyImbalanceStrategy('smote')">
                        <strong>\u2728 SMOTE</strong><br>
                        <span style="font-size:12px;color:var(--text-secondary);">Create new fake examples that look like the rare group. Like drawing new pictures based on the ones you have!</span>
                    </button>
                    <button class="btn-secondary" style="padding:12px;text-align:left;grid-column:1/-1;" onclick="Chapter5.applyImbalanceStrategy('weights')">
                        <strong>\u2696\uFE0F Class Weights</strong><br>
                        <span style="font-size:12px;color:var(--text-secondary);">Tell the AI to pay EXTRA attention to the rare group. Missing a rare one costs more points!</span>
                    </button>
                </div>

                <h3>Class Distribution</h3>
                <div class="graph-container">
                    <canvas id="imbalanceBarCanvas" width="750" height="300"></canvas>
                    <div class="graph-legend">
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #3b82f6;"></span>
                            Negative Class
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #ef4444;"></span>
                            Positive Class
                        </div>
                    </div>
                </div>

                <div class="gd-stats" id="imbalanceStats">
                    <div class="gd-stat">
                        <div class="stat-label">Strategy</div>
                        <div class="stat-value" id="imbStrategy" style="font-size:14px;">None</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Negative Samples</div>
                        <div class="stat-value" id="imbNeg" style="color:#3b82f6;">950</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Positive Samples</div>
                        <div class="stat-value" id="imbPos" style="color:#ef4444;">50</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Accuracy vs Balanced Acc</div>
                        <div class="stat-value" id="imbAccuracy" style="font-size:14px;">95.0% vs 50.0%</div>
                    </div>
                </div>
            </div>

            <!-- Code Example -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Handling Imbalance in Python</h2>
                <div class="code-block">
<span class="keyword">from</span> sklearn.utils <span class="keyword">import</span> class_weight
<span class="keyword">from</span> imblearn.over_sampling <span class="keyword">import</span> SMOTE
<span class="keyword">from</span> imblearn.under_sampling <span class="keyword">import</span> RandomUnderSampler

<span class="comment"># Method 1: Tell AI to pay extra attention to the rare group</span>
weights = class_weight.<span class="function">compute_class_weight</span>(
    <span class="string">'balanced'</span>, classes=[<span class="number">0</span>, <span class="number">1</span>], y=y_train
)
model.<span class="function">fit</span>(X_train, y_train,
         class_weight={<span class="number">0</span>: weights[<span class="number">0</span>], <span class="number">1</span>: weights[<span class="number">1</span>]})

<span class="comment"># Method 2: SMOTE (create new fake examples of the rare group)</span>
smote = <span class="function">SMOTE</span>(random_state=<span class="number">42</span>)
X_resampled, y_resampled = smote.<span class="function">fit_resample</span>(X_train, y_train)

<span class="comment"># Method 3: Use fewer from the big group</span>
rus = <span class="function">RandomUnderSampler</span>(random_state=<span class="number">42</span>)
X_under, y_under = rus.<span class="function">fit_resample</span>(X_train, y_train)
                </div>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter5.startQuiz5_3()">Start Quiz \u2192</button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('5-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('5-4')">Next: Churn Prediction \u2192</button>
            </div>
        `;

        this.applyImbalanceStrategy('none');
    },

    applyImbalanceStrategy(strategy) {
        this.imbalanceStrategy = strategy;
        let neg, pos, stratLabel, simAccuracy, simBalancedAcc;

        switch (strategy) {
            case 'oversample':
                neg = 950; pos = 950;
                stratLabel = 'Oversampling';
                simAccuracy = 88.5; simBalancedAcc = 87.0;
                break;
            case 'undersample':
                neg = 50; pos = 50;
                stratLabel = 'Undersampling';
                simAccuracy = 82.0; simBalancedAcc = 81.5;
                break;
            case 'smote':
                neg = 950; pos = 950;
                stratLabel = 'SMOTE';
                simAccuracy = 91.0; simBalancedAcc = 90.5;
                break;
            case 'weights':
                neg = 950; pos = 50;
                stratLabel = 'Class Weights';
                simAccuracy = 89.0; simBalancedAcc = 88.0;
                break;
            default:
                neg = 950; pos = 50;
                stratLabel = 'None (Original)';
                simAccuracy = 95.0; simBalancedAcc = 50.0;
        }

        const el = id => document.getElementById(id);
        if (el('imbStrategy')) el('imbStrategy').textContent = stratLabel;
        if (el('imbNeg')) el('imbNeg').textContent = neg;
        if (el('imbPos')) el('imbPos').textContent = pos;
        if (el('imbAccuracy')) el('imbAccuracy').textContent = `${simAccuracy.toFixed(1)}% vs ${simBalancedAcc.toFixed(1)}%`;

        this.drawImbalanceDots(neg, pos, strategy);
        this.drawImbalanceBars(neg, pos, strategy);
    },

    drawImbalanceDots(neg, pos, strategy) {
        const canvas = document.getElementById('imbalanceDotsCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const total = Math.min(neg + pos, 500); // Cap at 500 dots for readability
        const scale = total / (neg + pos);
        const negDots = Math.round(neg * scale);
        const posDots = Math.round(pos * scale);

        // Draw dots in a grid-like arrangement
        const dotRadius = 3;
        const cols = Math.ceil(Math.sqrt(total * (W / H)));
        const rows = Math.ceil(total / cols);
        const spacingX = W / (cols + 1);
        const spacingY = H / (rows + 1);

        let idx = 0;
        const allDots = [];
        for (let i = 0; i < negDots; i++) allDots.push('neg');
        for (let i = 0; i < posDots; i++) allDots.push('pos');
        // Shuffle for SMOTE/oversample visualization
        if (strategy !== 'none') {
            for (let i = allDots.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allDots[i], allDots[j]] = [allDots[j], allDots[i]];
            }
        }

        for (let r = 0; r < rows && idx < allDots.length; r++) {
            for (let c = 0; c < cols && idx < allDots.length; c++) {
                const x = spacingX * (c + 1);
                const y = spacingY * (r + 1);
                const isPos = allDots[idx] === 'pos';

                ctx.beginPath();
                ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                ctx.fillStyle = isPos ? '#ef4444' : '#3b82f6';
                ctx.globalAlpha = isPos ? 1.0 : 0.4;
                ctx.fill();
                ctx.globalAlpha = 1.0;
                idx++;
            }
        }

        // Info label
        const info = document.getElementById('imbalanceInfo');
        if (info) {
            const pct = ((pos / (neg + pos)) * 100).toFixed(1);
            if (strategy === 'weights') {
                info.innerHTML = `Class Weights: Negative weight = ${(1000 / (2 * 950)).toFixed(2)}, Positive weight = ${(1000 / (2 * 50)).toFixed(2)} -- Same data, different penalties!`;
            } else if (strategy === 'smote') {
                info.innerHTML = `SMOTE: Synthesized ${pos - 50} new minority samples by interpolating between existing ones. Now balanced at 50/50.`;
            } else if (strategy === 'oversample') {
                info.innerHTML = `Oversampling: Duplicated minority samples from 50 to 950. Risk: model may memorize duplicated samples.`;
            } else if (strategy === 'undersample') {
                info.innerHTML = `Undersampling: Reduced majority from 950 to 50. Risk: losing valuable training data!`;
            } else {
                info.innerHTML = `Original: ${neg} negative (${(100 - parseFloat(pct)).toFixed(1)}%) vs ${pos} positive (${pct}%) -- Highly imbalanced!`;
            }
        }
    },

    drawImbalanceBars(neg, pos, strategy) {
        const canvas = document.getElementById('imbalanceBarCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 30, right: 40, bottom: 60, left: 80 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        const origNeg = 950, origPos = 50;
        const maxVal = Math.max(neg, pos, origNeg, origPos);

        // Draw "Before" and "After" bar groups
        const groupWidth = plotW / 2;
        const barWidth = 60;
        const gap = 20;

        const drawBarGroup = (label, negVal, posVal, xCenter) => {
            // Negative bar
            const negHeight = (negVal / maxVal) * plotH;
            const negX = xCenter - barWidth - gap / 2;
            const negY = pad.top + plotH - negHeight;

            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.roundRect(negX, negY, barWidth, negHeight, [4, 4, 0, 0]);
            ctx.fill();

            // Positive bar
            const posHeight = (posVal / maxVal) * plotH;
            const posX = xCenter + gap / 2;
            const posY = pad.top + plotH - posHeight;

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.roundRect(posX, posY, barWidth, posHeight, [4, 4, 0, 0]);
            ctx.fill();

            // Values on bars
            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(negVal.toString(), negX + barWidth / 2, negY - 8);
            ctx.fillText(posVal.toString(), posX + barWidth / 2, posY - 8);

            // Group label
            ctx.fillStyle = '#8b95a8';
            ctx.font = '13px Inter';
            ctx.fillText(label, xCenter, pad.top + plotH + 25);

            // Percentage labels
            const total = negVal + posVal;
            ctx.font = '10px JetBrains Mono';
            ctx.fillStyle = '#3b82f6';
            ctx.fillText(`${((negVal / total) * 100).toFixed(0)}%`, negX + barWidth / 2, pad.top + plotH + 42);
            ctx.fillStyle = '#ef4444';
            ctx.fillText(`${((posVal / total) * 100).toFixed(0)}%`, posX + barWidth / 2, pad.top + plotH + 42);
        };

        drawBarGroup('Before', origNeg, origPos, pad.left + groupWidth / 2);
        drawBarGroup('After: ' + (strategy === 'none' ? 'No Change' : strategy.charAt(0).toUpperCase() + strategy.slice(1)),
                     neg, pos, pad.left + groupWidth + groupWidth / 2);

        // Arrow between groups
        const arrowY = pad.top + plotH / 2;
        const arrowX1 = pad.left + groupWidth / 2 + 80;
        const arrowX2 = pad.left + groupWidth + groupWidth / 2 - 80;
        ctx.beginPath();
        ctx.moveTo(arrowX1, arrowY);
        ctx.lineTo(arrowX2, arrowY);
        ctx.strokeStyle = '#8b95a8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(arrowX2, arrowY);
        ctx.lineTo(arrowX2 - 10, arrowY - 6);
        ctx.lineTo(arrowX2 - 10, arrowY + 6);
        ctx.closePath();
        ctx.fillStyle = '#8b95a8';
        ctx.fill();

        // Y-axis label
        ctx.save();
        ctx.translate(15, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Sample Count', 0, 0);
        ctx.restore();
    },

    startQuiz5_3() {
        Quiz.start({
            title: 'Chapter 5.3: Imbalanced Data',
            chapterId: '5-3',
            questions: [
                {
                    question: 'If 999 out of 1000 cookies are good, and an AI always says "good cookie!" -- what percent does it get right?',
                    options: ['50%', '99.9%', '0.1%', '100%'],
                    correct: 1,
                    explanation: 'It gets 99.9% right because almost all cookies ARE good! But it never finds the bad cookie -- that is the whole point of checking! Totally useless!'
                },
                {
                    question: 'What is the problem with just making copies of the rare group (oversampling)?',
                    options: [
                        'You lose some data',
                        'The AI might just memorize those copies instead of really learning',
                        'It makes the data look different',
                        'It takes too long'
                    ],
                    correct: 1,
                    explanation: 'If you just copy the same examples over and over, the AI might memorize those exact copies instead of learning what makes the rare group special. It is like studying only one flashcard!'
                },
                {
                    question: 'How is SMOTE different from just copying?',
                    options: [
                        'It removes examples from the big group',
                        'It makes totally random new examples',
                        'It creates brand new examples that LOOK LIKE the rare group but are not exact copies',
                        'It changes how the AI counts mistakes'
                    ],
                    correct: 2,
                    explanation: 'SMOTE is super clever! Instead of just copying, it creates NEW examples by mixing together existing rare ones. It is like mixing two paint colors to get a new shade!'
                },
                {
                    question: 'Why is using class weights (paying extra attention) a nice trick?',
                    options: [
                        'It always gets the best score',
                        'You keep all your data the same -- you just tell the AI that missing a rare one costs more points',
                        'It stops all cheating',
                        'It makes learning faster'
                    ],
                    correct: 1,
                    explanation: 'With class weights, you do not add or remove any data. You just change the rules: messing up on the rare group costs MORE points. So the AI tries harder to get those right!'
                }
            ]
        });
    },

    // ============================================
    // 5.4: Churn Prediction (Capstone)
    // ============================================
    selectedFeature: null,
    rocAnimFrame: null,

    churnFeatures: [
        { name: 'Contract Type', importance: 0.23, detail: 'Month-to-month contracts have 42% churn rate vs 11% for yearly and 3% for two-year contracts. This is the strongest predictor because short-term customers have less commitment.' },
        { name: 'Tenure (months)', importance: 0.19, detail: 'Customers with < 6 months tenure churn at 47%. After 2 years, churn drops to 6%. New customers need extra attention and onboarding support.' },
        { name: 'Monthly Charges', importance: 0.15, detail: 'Customers paying > $70/month churn at 33% vs 15% for those under $40. High charges without perceived value drive customers away.' },
        { name: 'Tech Support', importance: 0.12, detail: 'Customers without tech support churn at 41% vs 15% with support. Unresolved technical issues are a major pain point.' },
        { name: 'Internet Service', importance: 0.10, detail: 'Fiber optic customers churn at 30% vs 19% for DSL. This may reflect higher expectations and available alternatives for fiber users.' },
        { name: 'Payment Method', importance: 0.08, detail: 'Electronic check users churn at 45% vs 15% for auto-pay methods. Automatic payments create inertia that reduces churn.' },
        { name: 'Online Security', importance: 0.07, detail: 'Customers without online security features churn at 36% vs 14% with it. Bundled security adds perceived value.' },
        { name: 'Total Charges', importance: 0.06, detail: 'Total lifetime spending correlates with loyalty. Customers who have invested more are less likely to leave (sunk cost effect).' }
    ],

    loadChapter5_4() {
        const container = document.getElementById('chapter-5-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 5 \u2022 Chapter 5.4</span>
                <h1>Churn Prediction (Capstone)</h1>
                <p>Time to use everything we learned! We will build a step-by-step recipe for the AI to predict churn -- that means figuring out which customers are about to leave and stop using a service. It is like predicting which friends might quit the soccer team!</p>
            </div>

            <!-- Pipeline Overview -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD04</span> ML Pipeline Overview</h2>
                <p>Every AI project follows a step-by-step recipe (called a pipeline). Here is ours:</p>

                <div class="network-viz">
                    <canvas id="pipelineCanvas" width="800" height="160"></canvas>
                </div>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">A real phone company uses this exact recipe! They have info about 7,043 customers. About 27% of them left. Our goal: figure out which customers might leave BEFORE they actually go, so we can try to keep them!</span>
                </div>
            </div>

            <!-- Feature Importance -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Feature Importance</h2>
                <p>Not all clues are equal! Some things help the AI guess better than others. Click on any bar to learn why that clue matters. It is like being a detective!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="graph-container">
                    <canvas id="featureCanvas" width="750" height="380"></canvas>
                </div>

                <div class="step-explanation" id="featureDetail">
                    Click on a feature bar above to see details about its impact on churn prediction.
                </div>
            </div>

            <!-- ROC Curve -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCC8</span> ROC Curve & AUC</h2>
                <p>The ROC curve is a special graph that shows how good the AI is at telling groups apart. The AUC-ROC is a single score -- the closer to 1.0, the better! Think of it like a report card grade for the AI.</p>

                <div class="graph-container">
                    <canvas id="rocCanvas" width="750" height="380"></canvas>
                    <div class="graph-legend">
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #6366f1;"></span>
                            Our Model (AUC = 0.86)
                        </div>
                        <div class="legend-item active">
                            <span class="legend-dot" style="background: #8b95a8;"></span>
                            Random Classifier (AUC = 0.50)
                        </div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="info-box" style="flex-direction:column;text-align:center;">
                        <strong style="color:#ef4444;">AUC < 0.60</strong>
                        <span class="info-box-text" style="font-size:13px;">Bad -- almost like guessing with your eyes closed!</span>
                    </div>
                    <div class="info-box warning" style="flex-direction:column;text-align:center;">
                        <strong style="color:#f59e0b;">AUC 0.60-0.80</strong>
                        <span class="info-box-text" style="font-size:13px;">OK -- getting the hang of it, but can do better!</span>
                    </div>
                    <div class="info-box success" style="flex-direction:column;text-align:center;">
                        <strong style="color:#10b981;">AUC 0.80-1.00</strong>
                        <span class="info-box-text" style="font-size:13px;">Amazing -- the AI really knows its stuff!</span>
                    </div>
                </div>
            </div>

            <!-- Complete Pipeline Code -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Complete Pipeline</h2>
                <p>Here's the full code for building a churn prediction model:</p>

                <div class="code-block">
<span class="keyword">import</span> pandas <span class="keyword">as</span> pd
<span class="keyword">from</span> sklearn.model_selection <span class="keyword">import</span> train_test_split
<span class="keyword">from</span> sklearn.preprocessing <span class="keyword">import</span> StandardScaler, LabelEncoder
<span class="keyword">from</span> sklearn.metrics <span class="keyword">import</span> (
    roc_auc_score, classification_report, roc_curve
)
<span class="keyword">from</span> tensorflow.keras.models <span class="keyword">import</span> Sequential
<span class="keyword">from</span> tensorflow.keras.layers <span class="keyword">import</span> Dense, Dropout

<span class="comment"># 1. Open the data file and look around</span>
df = pd.<span class="function">read_csv</span>(<span class="string">'telco_churn.csv'</span>)
<span class="function">print</span>(df[<span class="string">'Churn'</span>].<span class="function">value_counts</span>(normalize=<span class="keyword">True</span>))

<span class="comment"># 2. Clean up the data so the AI can read it</span>
le = <span class="function">LabelEncoder</span>()
<span class="keyword">for</span> col <span class="keyword">in</span> df.<span class="function">select_dtypes</span>(<span class="string">'object'</span>).columns:
    df[col] = le.<span class="function">fit_transform</span>(df[col])

X = df.<span class="function">drop</span>(<span class="string">'Churn'</span>, axis=<span class="number">1</span>)
y = df[<span class="string">'Churn'</span>]

<span class="comment"># 3. Split into practice questions and real test</span>
X_train, X_test, y_train, y_test = <span class="function">train_test_split</span>(
    X, y, test_size=<span class="number">0.2</span>, stratify=y, random_state=<span class="number">42</span>
)

scaler = <span class="function">StandardScaler</span>()
X_train = scaler.<span class="function">fit_transform</span>(X_train)
X_test = scaler.<span class="function">transform</span>(X_test)

<span class="comment"># 4. Build the AI brain with anti-cheating rules</span>
model = <span class="function">Sequential</span>([
    <span class="function">Dense</span>(<span class="number">64</span>, activation=<span class="string">'relu'</span>, input_shape=(X_train.shape[<span class="number">1</span>],)),
    <span class="function">Dropout</span>(<span class="number">0.3</span>),
    <span class="function">Dense</span>(<span class="number">32</span>, activation=<span class="string">'relu'</span>),
    <span class="function">Dropout</span>(<span class="number">0.2</span>),
    <span class="function">Dense</span>(<span class="number">1</span>, activation=<span class="string">'sigmoid'</span>)
])

model.<span class="function">compile</span>(optimizer=<span class="string">'adam'</span>,
              loss=<span class="string">'binary_crossentropy'</span>,
              metrics=[<span class="string">'accuracy'</span>])

<span class="comment"># 5. Train the AI, paying extra attention to the rare group</span>
<span class="keyword">from</span> sklearn.utils <span class="keyword">import</span> class_weight
weights = class_weight.<span class="function">compute_class_weight</span>(
    <span class="string">'balanced'</span>, classes=[<span class="number">0</span>,<span class="number">1</span>], y=y_train
)
model.<span class="function">fit</span>(X_train, y_train, epochs=<span class="number">50</span>,
         validation_split=<span class="number">0.2</span>, batch_size=<span class="number">32</span>,
         class_weight={<span class="number">0</span>: weights[<span class="number">0</span>], <span class="number">1</span>: weights[<span class="number">1</span>]})

<span class="comment"># 6. Check how well the AI did on the real test</span>
y_prob = model.<span class="function">predict</span>(X_test)
auc = <span class="function">roc_auc_score</span>(y_test, y_prob)
<span class="function">print</span>(<span class="string">f"AUC-ROC: </span>{auc:<span class="number">.3f</span>}<span class="string">"</span>)  <span class="comment"># ~0.86</span>
                </div>
            </div>

            <!-- Key Takeaways -->
            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCDD</span> Module 5 Key Takeaways</h2>
                <ul style="color: var(--text-secondary); padding-left: 20px; line-height: 2;">
                    <li>Just counting right answers is not enough -- use precision, recall, F1, and AUC-ROC for the real picture</li>
                    <li>The threshold slider controls whether the AI is super picky or catches everything</li>
                    <li>Dropout and rules stop the AI from cheating by memorizing</li>
                    <li>When one group is way smaller, use tricks like copying, SMOTE, or extra attention</li>
                    <li>A step-by-step recipe: Get Data, Clean It Up, Train, Check Results!</li>
                    <li>Finding the best clues helps you understand WHY the AI makes its choices</li>
                </ul>
            </div>

            <!-- Quiz -->
            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter5.startQuiz5_4()">Start Quiz \u2192</button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('5-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('6-1')">Next: Convolutional Networks \u2192</button>
            </div>
        `;

        this.drawPipeline();
        this.drawFeatureImportance();
        this.drawROCCurve();
        this.initFeatureClickHandler();
    },

    drawPipeline() {
        const canvas = document.getElementById('pipelineCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const steps = [
            { label: 'Raw Data', sublabel: '7,043 customers', icon: '\uD83D\uDCE6', color: '#3b82f6' },
            { label: 'Preprocess', sublabel: 'Encode & Scale', icon: '\uD83D\uDD27', color: '#8b5cf6' },
            { label: 'Train', sublabel: 'Neural Network', icon: '\uD83E\uDDE0', color: '#6366f1' },
            { label: 'Evaluate', sublabel: 'AUC = 0.86', icon: '\uD83C\uDFAF', color: '#10b981' }
        ];

        const stepW = W / steps.length;
        const centerY = H / 2;

        steps.forEach((step, i) => {
            const cx = stepW * i + stepW / 2;

            // Box
            const boxW = 140;
            const boxH = 80;
            ctx.beginPath();
            ctx.roundRect(cx - boxW / 2, centerY - boxH / 2, boxW, boxH, 12);
            ctx.fillStyle = step.color;
            ctx.globalAlpha = 0.15;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = step.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Icon
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(step.icon, cx, centerY - 10);

            // Label
            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 12px Inter';
            ctx.fillText(step.label, cx, centerY + 14);

            // Sublabel
            ctx.fillStyle = '#8b95a8';
            ctx.font = '10px Inter';
            ctx.fillText(step.sublabel, cx, centerY + 28);

            // Arrow to next
            if (i < steps.length - 1) {
                const arrowX = cx + boxW / 2 + 5;
                const arrowEndX = cx + stepW - boxW / 2 - 5;
                ctx.beginPath();
                ctx.moveTo(arrowX, centerY);
                ctx.lineTo(arrowEndX, centerY);
                ctx.strokeStyle = '#8b95a8';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Arrowhead
                ctx.beginPath();
                ctx.moveTo(arrowEndX, centerY);
                ctx.lineTo(arrowEndX - 8, centerY - 5);
                ctx.lineTo(arrowEndX - 8, centerY + 5);
                ctx.closePath();
                ctx.fillStyle = '#8b95a8';
                ctx.fill();
            }
        });
    },

    drawFeatureImportance() {
        const canvas = document.getElementById('featureCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 20, right: 60, bottom: 30, left: 160 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        const features = this.churnFeatures;
        const barHeight = plotH / features.length - 6;
        const maxImp = Math.max(...features.map(f => f.importance));

        features.forEach((feat, i) => {
            const y = pad.top + i * (plotH / features.length) + 3;
            const barW = (feat.importance / maxImp) * plotW;

            // Determine color based on importance
            const gradient = ctx.createLinearGradient(pad.left, 0, pad.left + barW, 0);
            if (feat.importance > 0.15) {
                gradient.addColorStop(0, '#6366f1');
                gradient.addColorStop(1, '#8b5cf6');
            } else if (feat.importance > 0.08) {
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#6366f1');
            } else {
                gradient.addColorStop(0, '#64748b');
                gradient.addColorStop(1, '#3b82f6');
            }

            // Highlight selected
            if (this.selectedFeature === i) {
                ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
                ctx.fillRect(0, y - 2, W, barHeight + 4);
            }

            // Bar
            ctx.beginPath();
            ctx.roundRect(pad.left, y, barW, barHeight, [0, 4, 4, 0]);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Feature name
            ctx.fillStyle = this.selectedFeature === i ? '#e8eaf0' : '#8b95a8';
            ctx.font = this.selectedFeature === i ? 'bold 12px Inter' : '12px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(feat.name, pad.left - 10, y + barHeight / 2 + 4);

            // Value
            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText((feat.importance * 100).toFixed(0) + '%', pad.left + barW + 8, y + barHeight / 2 + 4);
        });
    },

    initFeatureClickHandler() {
        const canvas = document.getElementById('featureCanvas');
        if (!canvas) return;

        canvas.style.cursor = 'pointer';
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleY = canvas.height / rect.height;
            const y = (e.clientY - rect.top) * scaleY;

            const pad = { top: 20, bottom: 30 };
            const plotH = canvas.height - pad.top - pad.bottom;
            const features = this.churnFeatures;
            const slotH = plotH / features.length;

            const idx = Math.floor((y - pad.top) / slotH);
            if (idx >= 0 && idx < features.length) {
                this.selectedFeature = idx;
                this.drawFeatureImportance();

                const detail = document.getElementById('featureDetail');
                if (detail) {
                    detail.innerHTML = `<strong>${features[idx].name}</strong> (Importance: ${(features[idx].importance * 100).toFixed(0)}%)<br>${features[idx].detail}`;
                }
            }
        });
    },

    drawROCCurve() {
        const canvas = document.getElementById('rocCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 50, left: 60 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const x = pad.left + plotW * (i / 5);
            const y = pad.top + plotH * (i / 5);
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
        }

        // Axis labels
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 5; i++) {
            ctx.fillText((i * 0.2).toFixed(1), pad.left + plotW * (i / 5), H - 15);
        }
        ctx.fillText('False Positive Rate', W / 2, H - 2);

        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            ctx.fillText((1 - i * 0.2).toFixed(1), pad.left - 8, pad.top + plotH * (i / 5) + 4);
        }
        ctx.save();
        ctx.translate(12, H / 2 - 15);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('True Positive Rate', 0, 0);
        ctx.restore();

        // Random classifier diagonal
        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#8b95a8';
        ctx.lineWidth = 1.5;
        ctx.moveTo(pad.left, pad.top + plotH);
        ctx.lineTo(pad.left + plotW, pad.top);
        ctx.stroke();
        ctx.setLineDash([]);

        // Generate realistic ROC curve (AUC ~ 0.86)
        const rocPoints = [];
        rocPoints.push({ fpr: 0, tpr: 0 });
        const steps = 100;
        for (let i = 1; i <= steps; i++) {
            const fpr = i / steps;
            // A realistic ROC curve for AUC ~ 0.86
            const tpr = 1 - Math.pow(1 - fpr, 0.3);
            rocPoints.push({ fpr, tpr: Math.min(tpr, 1) });
        }

        // Fill area under ROC
        ctx.beginPath();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.moveTo(pad.left, pad.top + plotH);
        rocPoints.forEach(pt => {
            const x = pad.left + pt.fpr * plotW;
            const y = pad.top + (1 - pt.tpr) * plotH;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(pad.left + plotW, pad.top + plotH);
        ctx.closePath();
        ctx.fill();

        // ROC curve
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        rocPoints.forEach((pt, i) => {
            const x = pad.left + pt.fpr * plotW;
            const y = pad.top + (1 - pt.tpr) * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // AUC label
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('AUC = 0.86', pad.left + plotW * 0.65, pad.top + plotH * 0.55);

        // Operating point marker
        const opFpr = 0.15;
        const opTpr = 1 - Math.pow(1 - opFpr, 0.3);
        const opX = pad.left + opFpr * plotW;
        const opY = pad.top + (1 - opTpr) * plotH;

        ctx.beginPath();
        ctx.arc(opX, opY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#e8eaf0';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`Operating Point`, opX + 12, opY - 4);
        ctx.fillStyle = '#8b95a8';
        ctx.fillText(`FPR=${opFpr.toFixed(2)}, TPR=${opTpr.toFixed(2)}`, opX + 12, opY + 12);
    },

    startQuiz5_4() {
        Quiz.start({
            title: 'Chapter 5.4: Churn Prediction',
            chapterId: '5-4',
            questions: [
                {
                    question: 'What does the AUC-ROC score tell us?',
                    options: [
                        'How fast the AI runs',
                        'How good the AI is at telling the two groups apart -- like sorting apples from oranges',
                        'How many right answers the AI got',
                        'How many clues the AI used'
                    ],
                    correct: 1,
                    explanation: 'The AUC-ROC score tells us how well the AI can tell the difference between the two groups. A score of 1.0 means it is perfect at sorting them, and 0.5 means it is just guessing!'
                },
                {
                    question: 'Why do we split the data carefully so both practice and test have the same mix of leavers and stayers?',
                    options: [
                        'To make it faster',
                        'So the practice set and test set both have a fair mix of people who left and people who stayed',
                        'To get a higher score',
                        'To have less data'
                    ],
                    correct: 1,
                    explanation: 'We split carefully so both the practice pile and the test pile have the same mix. If the test pile had no leavers, we could not check if the AI can find them!'
                },
                {
                    question: 'Which clue was the MOST helpful for guessing who would leave?',
                    options: [
                        'How much they pay each month',
                        'How much they have paid in total',
                        'What kind of contract they have (short or long)',
                        'What type of internet they have'
                    ],
                    correct: 2,
                    explanation: 'The type of contract was the biggest clue! People who signed up month-to-month leave much more often than people who signed up for a long time. Makes sense -- short plans are easier to quit!'
                },
                {
                    question: 'Why do we make all the numbers a similar size before training?',
                    options: [
                        'To remove weird numbers',
                        'So no one clue seems more important just because its numbers are bigger -- it helps the AI learn better',
                        'To add more clues',
                        'To turn words into numbers'
                    ],
                    correct: 1,
                    explanation: 'Imagine comparing age (like 25) to salary (like 50,000). The big salary number would confuse the AI! We shrink everything to a similar size so the AI can focus on what really matters.'
                }
            ]
        });
    }
};
