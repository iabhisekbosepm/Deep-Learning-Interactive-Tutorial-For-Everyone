/* ============================================
   Chapter 14: Reasoning Architecture & Training
   PART 1: Chapters 14.1, 14.2, 14.3
   ============================================ */

const Chapter14 = {
    // State variables for all chapters
    thinkAnimFrame: null,
    thinkStep: 0,
    thinkShowTokens: true,
    thinkBubbleRadius: 0,
    thinkProblem: null,
    thinkAnimating: false,

    grpoAnimFrame: null,
    grpoGroupSize: 5,
    grpoSolutions: [],
    grpoAnimating: false,
    grpoStep: 0,
    grpoShowPRM: true,

    totAnimFrame: null,
    totDepth: 3,
    totTree: null,
    totExploring: false,
    totSelectedNode: null,
    totAnimStep: 0,
    totAutoExploring: false,

    // State for 14.4 Synthetic Data
    selfPlayAnimFrame: null,
    selfPlayStep: 0,
    selfPlayCycle: 0,
    selfPlayQuality: 30,
    selfPlayAnimating: false,
    selfPlaySamples: [],

    // State for 14.5 DeepSeek & RAGEN
    deepseekAnimFrame: null,
    deepseekShowMoE: true,
    deepseekShowMLA: true,
    deepseekShowDSA: true,
    deepseekAnimStep: 0,
    deepseekAnimating: false,
    deepseekDataFlow: [],

    init() {
        App.registerChapter('14-1', () => this.loadChapter14_1());
        App.registerChapter('14-2', () => this.loadChapter14_2());
        App.registerChapter('14-3', () => this.loadChapter14_3());
        App.registerChapter('14-4', () => this.loadChapter14_4());
        App.registerChapter('14-5', () => this.loadChapter14_5());
    },

    // ============================================
    // 14.1: Reasoning Models & Thinking Tokens
    // ============================================
    loadChapter14_1() {
        const container = document.getElementById('chapter-14-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 14 &bull; Chapter 14.1</span>
                <h1>Reasoning Models & Thinking Tokens</h1>
                <p class="chapter-subtitle">Teaching AI to Show Its Work - Just Like on a Math Test!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F914}</span> What If AI Could Think Step by Step?</h2>
                <p>When your teacher gives you a hard math problem, do you just blurt out an answer? No way! You <strong>think step by step</strong>, write down your work, and THEN give your answer. Guess what? AI can do the same thing!</p>
                <p>Modern AI models like DeepSeek-R1 and OpenAI's o1 have a special power: they can <strong>think before they answer</strong>. They use special hidden notes called <strong>thinking tokens</strong> to work through problems step by step, just like you show your work on a math test!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Big Idea:</strong> A "reasoning model" is an AI that thinks step by step before giving its final answer. The thinking happens inside special <code>&lt;think&gt;</code> tags that are usually hidden from the user. It's like showing your work on a math test - you get better answers when you think step by step!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9E0}</span> Two Brains Are Better Than One!</h2>
                <p>Reasoning models actually have <strong>two special heads</strong> (like having two brains working together):</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4AD}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">Reasoning Head</div>
                        <div style="font-size:12px;color:var(--text-secondary);">This brain does all the thinking! It breaks the problem into small steps, checks each step, and figures out the best path to the answer. Its thoughts go inside <code>&lt;think&gt;</code> tags.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{2705}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Answer Head</div>
                        <div style="font-size:12px;color:var(--text-secondary);">This brain takes all that thinking and turns it into a clear, clean final answer. It reads the reasoning steps and picks the best conclusion to share.</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Fun Analogy:</strong> Think of it like a detective show! The Reasoning Head is the detective scribbling clues on a whiteboard, connecting dots, and saying "Aha!" The Answer Head is the detective standing in front of everyone and confidently saying "The butler did it!" One thinks, the other presents!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Watch AI Think!</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Watch what happens when AI tries to solve a math problem with and without thinking tokens. Toggle the thinking tokens to see the hidden reasoning!</p>
                <div class="network-viz">
                    <canvas id="thinkCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-primary btn-small" onclick="Chapter14.toggleThinkTokens()">Show/Hide Thinking</button>
                        <button class="btn-secondary btn-small" onclick="Chapter14.newThinkProblem()">New Problem</button>
                        <button class="btn-primary btn-small" onclick="Chapter14.animateThinking()">Animate Thinking</button>
                    </div>
                </div>
                <div id="thinkInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Left: Direct answer (no thinking). Right: Step-by-step reasoning with thinking tokens. Click "Animate Thinking" to watch the thought bubble grow!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F50D}</span> What Are Thinking Tokens?</h2>
                <p>Thinking tokens are <strong>special hidden words</strong> that the AI generates while working through a problem. You usually don't see them - they happen behind the scenes!</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DD}</div>
                        <div style="font-weight:600;margin:6px 0;">Scratch Paper</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Thinking tokens are like scratch paper. The AI writes down its rough work, tries different ideas, and erases mistakes.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F6AB}</div>
                        <div style="font-weight:600;margin:6px 0;">Hidden from You</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Normally you only see the final answer. The thinking tokens are wrapped in <code>&lt;think&gt;...&lt;/think&gt;</code> tags and hidden.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4B0}</div>
                        <div style="font-weight:600;margin:6px 0;">They Cost Extra</div>
                        <div style="font-size:12px;color:var(--text-secondary);">More thinking = more tokens = more compute time. But the answers are much better! It's a trade-off.</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Why hidden?</strong> The AI's thinking can be messy, just like your scratch paper! It might try wrong ideas first, cross them out, and try again. We hide this so users just see the clean final answer.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> Thinking Tokens in Code</h2>
                <p>Here's what happens inside a reasoning model when you ask it a question:</p>
                <div class="code-block"><pre>
<span class="comment"># You ask: "What is 17 x 24?"</span>

<span class="comment"># The model generates THINKING tokens (hidden):</span>
<span class="keyword">&lt;think&gt;</span>
  Let me break this down step by step.
  17 x 24 = 17 x 20 + 17 x 4
  17 x 20 = 340
  17 x 4 = 68
  340 + 68 = 408
  Let me double-check: 408 / 17 = 24. Yes!
<span class="keyword">&lt;/think&gt;</span>

<span class="comment"># The model generates ANSWER tokens (visible):</span>
17 x 24 = <span class="number">408</span>
                </pre></div>
                <p>See how the <code>&lt;think&gt;</code> section breaks the problem into easy pieces? Without it, the model might just guess "400" or "420" and be wrong!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CA}</span> Why Thinking Makes AI Smarter</h2>
                <p>Research shows that models with thinking tokens are <strong>way better</strong> at hard problems:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#ef4444;">Without Thinking Tokens</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            &bull; Math: Gets about 50% right<br>
                            &bull; Logic puzzles: Often wrong<br>
                            &bull; Coding: Makes lots of mistakes<br>
                            &bull; Fast but inaccurate
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#22c55e;">With Thinking Tokens</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                            &bull; Math: Gets about 90% right!<br>
                            &bull; Logic puzzles: Usually correct<br>
                            &bull; Coding: Fewer bugs<br>
                            &bull; Slower but much more accurate
                        </div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F3C6}</span>
                    <span class="info-box-text"><strong>Real World:</strong> DeepSeek-R1 uses thinking tokens and scored higher on math competitions than many college students! OpenAI's o1 model can solve PhD-level science questions by "thinking" for several minutes.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Thinking tokens</strong> are hidden reasoning steps inside <code>&lt;think&gt;</code> tags that help AI work through problems step by step.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Two-head architecture:</strong> The reasoning head does the thinking, and the answer head presents the final result.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Step-by-step reasoning</strong> dramatically improves accuracy on math, logic, and coding tasks.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Trade-off:</strong> Thinking tokens use more compute time and cost more, but the answers are much better!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter14.startQuiz14_1()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('13-5')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('14-2')">Next: Process Rewards & GRPO \u2192</button>
            </div>
        `;

        this.initThinkCanvas();
    },

    // --- 14.1 Canvas & Interaction Methods ---

    thinkProblems: [
        {
            question: 'What is 17 x 24?',
            directAnswer: '400',
            directCorrect: false,
            steps: [
                'Break it down: 17 x 24',
                '= 17 x 20 + 17 x 4',
                '= 340 + 68',
                '= 408',
                'Check: 408 / 17 = 24 \u2713'
            ],
            correctAnswer: '408'
        },
        {
            question: 'If 3 cats eat 3 fish in 3 minutes,\nhow many cats eat 100 fish in 100 min?',
            directAnswer: '100 cats',
            directCorrect: false,
            steps: [
                '3 cats eat 3 fish in 3 min',
                'So 1 cat eats 1 fish in 3 min',
                'In 100 min, 1 cat eats 33 fish',
                'For 100 fish: 100/33 \u2248 3 cats',
                'Answer: 3 cats! \u2713'
            ],
            correctAnswer: '3 cats'
        },
        {
            question: 'A ball costs $1 more than a bat.\nBoth together cost $1.10.\nWhat does the ball cost?',
            directAnswer: '$1.00',
            directCorrect: false,
            steps: [
                'Let bat = x dollars',
                'Ball = x + 1 dollars',
                'x + (x + 1) = 1.10',
                '2x + 1 = 1.10, so 2x = 0.10',
                'x = 0.05, ball = $1.05 \u2713'
            ],
            correctAnswer: '$1.05'
        },
        {
            question: 'What is 156 + 278 + 49?',
            directAnswer: '473',
            directCorrect: false,
            steps: [
                'Start with 156 + 278',
                '156 + 278 = 434',
                'Now add 49',
                '434 + 49 = 483',
                'Check: 483 - 49 = 434 \u2713'
            ],
            correctAnswer: '483'
        }
    ],

    initThinkCanvas() {
        this.thinkProblem = this.thinkProblems[0];
        this.thinkStep = 0;
        this.thinkBubbleRadius = 0;
        this.thinkShowTokens = true;
        this.thinkAnimating = false;
        if (this.thinkAnimFrame) cancelAnimationFrame(this.thinkAnimFrame);
        this.drawThinkCanvas();
    },

    drawThinkCanvas() {
        const canvas = document.getElementById('thinkCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const problem = this.thinkProblem;
        if (!problem) return;

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Divider line
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 50);
        ctx.lineTo(W / 2, H - 20);
        ctx.stroke();
        ctx.setLineDash([]);

        // Title
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('WITHOUT Thinking', W / 4, 30);
        ctx.fillText('WITH Thinking Tokens', 3 * W / 4, 30);

        // Question
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = '#f59e0b';
        const lines = problem.question.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText('Q: ' + line, W / 2, 60 + i * 16);
        });

        const questionOffset = 60 + lines.length * 16 + 10;

        // LEFT SIDE: Direct answer (no thinking)
        // Draw a simple robot head
        const leftCx = W / 4;
        const robotY = questionOffset + 30;

        ctx.fillStyle = '#1e293b';
        this.drawRoundedRect(ctx, leftCx - 50, robotY, 100, 70, 12);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, leftCx - 50, robotY, 100, 70, 12);
        ctx.stroke();

        // Robot eyes
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(leftCx - 18, robotY + 28, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(leftCx + 18, robotY + 28, 8, 0, Math.PI * 2);
        ctx.fill();

        // Robot mouth (X shape for wrong)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(leftCx - 10, robotY + 48);
        ctx.lineTo(leftCx + 10, robotY + 58);
        ctx.moveTo(leftCx + 10, robotY + 48);
        ctx.lineTo(leftCx - 10, robotY + 58);
        ctx.stroke();

        // Speech bubble with wrong answer
        const bubbleY = robotY + 90;
        ctx.fillStyle = '#1e1e2e';
        this.drawRoundedRect(ctx, leftCx - 70, bubbleY, 140, 50, 10);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        this.drawRoundedRect(ctx, leftCx - 70, bubbleY, 140, 50, 10);
        ctx.stroke();

        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText(problem.directAnswer, leftCx, bubbleY + 28);

        // Wrong X
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('\u2717 WRONG', leftCx, bubbleY + 70);

        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Guessed without thinking!', leftCx, bubbleY + 88);

        // RIGHT SIDE: Step-by-step thinking
        const rightCx = 3 * W / 4;

        // Draw thinking robot head
        ctx.fillStyle = '#1e293b';
        this.drawRoundedRect(ctx, rightCx - 50, robotY, 100, 70, 12);
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, rightCx - 50, robotY, 100, 70, 12);
        ctx.stroke();

        // Robot eyes (happy)
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(rightCx - 18, robotY + 28, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightCx + 18, robotY + 28, 8, 0, Math.PI * 2);
        ctx.fill();

        // Robot mouth (smile)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(rightCx, robotY + 48, 12, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Thinking bubble - expands with steps
        if (this.thinkShowTokens) {
            const maxSteps = problem.steps.length;
            const stepsToShow = Math.min(this.thinkStep, maxSteps);

            // Think tag header
            if (stepsToShow > 0) {
                const thinkY = robotY + 85;
                const bubbleH = 20 + stepsToShow * 22;

                // Expanding thought bubble
                ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
                this.drawRoundedRect(ctx, rightCx - 140, thinkY, 280, bubbleH, 10);
                ctx.fill();
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 3]);
                this.drawRoundedRect(ctx, rightCx - 140, thinkY, 280, bubbleH, 10);
                ctx.stroke();
                ctx.setLineDash([]);

                // <think> tag
                ctx.font = 'bold 10px monospace';
                ctx.fillStyle = '#a855f7';
                ctx.textAlign = 'left';
                ctx.fillText('<think>', rightCx - 130, thinkY + 14);

                // Steps
                ctx.font = '11px Inter, sans-serif';
                ctx.fillStyle = '#c4b5fd';
                for (let i = 0; i < stepsToShow; i++) {
                    ctx.fillText(problem.steps[i], rightCx - 120, thinkY + 32 + i * 22);
                }

                if (stepsToShow === maxSteps) {
                    ctx.font = 'bold 10px monospace';
                    ctx.fillStyle = '#a855f7';
                    ctx.fillText('</think>', rightCx - 130, thinkY + bubbleH - 4);
                }

                // Final answer below thinking
                if (stepsToShow === maxSteps) {
                    const answerY = thinkY + bubbleH + 15;
                    ctx.fillStyle = '#1e1e2e';
                    this.drawRoundedRect(ctx, rightCx - 70, answerY, 140, 40, 10);
                    ctx.fill();
                    ctx.strokeStyle = '#22c55e';
                    ctx.lineWidth = 1.5;
                    this.drawRoundedRect(ctx, rightCx - 70, answerY, 140, 40, 10);
                    ctx.stroke();

                    ctx.font = 'bold 16px Inter, sans-serif';
                    ctx.fillStyle = '#22c55e';
                    ctx.textAlign = 'center';
                    ctx.fillText(problem.correctAnswer, rightCx, answerY + 25);

                    ctx.font = 'bold 18px Inter, sans-serif';
                    ctx.fillText('\u2713 CORRECT!', rightCx, answerY + 55);
                }
            } else {
                // Show waiting state
                ctx.font = '12px Inter, sans-serif';
                ctx.fillStyle = '#64748b';
                ctx.textAlign = 'center';
                ctx.fillText('Click "Animate Thinking" to watch!', rightCx, robotY + 100);
            }
        } else {
            // Tokens hidden - show just the answer
            const answerY = robotY + 90;
            ctx.fillStyle = '#1e1e2e';
            this.drawRoundedRect(ctx, rightCx - 70, answerY, 140, 50, 10);
            ctx.fill();
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1.5;
            this.drawRoundedRect(ctx, rightCx - 70, answerY, 140, 50, 10);
            ctx.stroke();

            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.fillStyle = '#22c55e';
            ctx.textAlign = 'center';
            ctx.fillText(problem.correctAnswer, rightCx, answerY + 28);

            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.fillText('\u2713 CORRECT!', rightCx, answerY + 70);

            ctx.font = '11px Inter, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText('(Thinking tokens hidden)', rightCx, answerY + 88);
        }
    },

    toggleThinkTokens() {
        this.thinkShowTokens = !this.thinkShowTokens;
        if (this.thinkShowTokens && this.thinkStep === 0) {
            this.thinkStep = this.thinkProblem.steps.length;
        }
        this.drawThinkCanvas();
        const info = document.getElementById('thinkInfo');
        if (info) {
            info.textContent = this.thinkShowTokens
                ? 'Thinking tokens visible! You can see the AI\'s step-by-step reasoning inside the purple box.'
                : 'Thinking tokens hidden! The AI still thinks, but you only see the final answer.';
        }
    },

    newThinkProblem() {
        const currentIdx = this.thinkProblems.indexOf(this.thinkProblem);
        const nextIdx = (currentIdx + 1) % this.thinkProblems.length;
        this.thinkProblem = this.thinkProblems[nextIdx];
        this.thinkStep = 0;
        this.thinkAnimating = false;
        if (this.thinkAnimFrame) cancelAnimationFrame(this.thinkAnimFrame);
        this.drawThinkCanvas();
    },

    animateThinking() {
        if (this.thinkAnimating) return;
        this.thinkAnimating = true;
        this.thinkStep = 0;
        this.thinkShowTokens = true;

        const maxSteps = this.thinkProblem.steps.length;
        let frame = 0;
        const framesPerStep = 40;

        const animate = () => {
            frame++;
            if (frame % framesPerStep === 0) {
                this.thinkStep++;
            }
            this.drawThinkCanvas();

            if (this.thinkStep <= maxSteps) {
                this.thinkAnimFrame = requestAnimationFrame(animate);
            } else {
                this.thinkAnimating = false;
            }
        };

        this.thinkAnimFrame = requestAnimationFrame(animate);
    },

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

    startQuiz14_1() {
        Quiz.start({
            title: 'Reasoning Models & Thinking Tokens',
            chapterId: '14-1',
            questions: [
                {
                    question: 'What are thinking tokens?',
                    options: [
                        'Regular output words the user sees',
                        'Hidden reasoning steps the model uses to work through a problem',
                        'Special input tokens from the user',
                        'Error messages the AI produces'
                    ],
                    correct: 1,
                    explanation: 'Thinking tokens are hidden reasoning steps the model uses to work through a problem before giving the final answer! They live inside <think> tags and are usually hidden from users.'
                },
                {
                    question: 'What are the two "heads" in a reasoning model?',
                    options: [
                        'Input head and output head',
                        'Fast head and slow head',
                        'Reasoning head and answer head',
                        'Text head and image head'
                    ],
                    correct: 2,
                    explanation: 'Reasoning models have a reasoning head (that does the step-by-step thinking) and an answer head (that presents the final clean answer). Two brains working together!'
                },
                {
                    question: 'Why do reasoning models give better answers on math problems?',
                    options: [
                        'They have a bigger vocabulary',
                        'They are connected to a calculator',
                        'They break problems into small steps and check each one',
                        'They memorize all the answers'
                    ],
                    correct: 2,
                    explanation: 'By breaking problems into small steps and checking each one, reasoning models avoid silly mistakes. It is like showing your work on a math test!'
                },
                {
                    question: 'What is the downside of using thinking tokens?',
                    options: [
                        'The answers are always wrong',
                        'It takes more time and compute power',
                        'The model forgets the question',
                        'It only works for English'
                    ],
                    correct: 1,
                    explanation: 'More thinking means more tokens to generate, which takes more time and compute power. But the trade-off is worth it because the answers are much more accurate!'
                },
                {
                    question: 'Which HTML-like tags wrap the AI\'s hidden reasoning?',
                    options: [
                        '<hidden>...</hidden>',
                        '<brain>...</brain>',
                        '<think>...</think>',
                        '<secret>...</secret>'
                    ],
                    correct: 2,
                    explanation: 'The <think>...</think> tags wrap the AI\'s hidden reasoning steps. Everything between these tags is the AI\'s scratch work that gets hidden from the final output!'
                }
            ]
        });
    },

    // ============================================
    // 14.2: Process Reward Models & GRPO
    // ============================================
    loadChapter14_2() {
        const container = document.getElementById('chapter-14-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 14 &bull; Chapter 14.2</span>
                <h1>Process Reward Models & GRPO</h1>
                <p class="chapter-subtitle">Grading Each Step, Not Just the Final Answer!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4DD}</span> Grading Homework: Two Ways</h2>
                <p>Imagine your teacher is grading your math homework. There are two ways to do it:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F534}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">ORM: Just Check the Answer</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The teacher ONLY looks at the final answer. Got 42? Right or wrong? That's it! But what if you got the right answer by accident? Or what if your steps were great but you made a tiny mistake at the end?</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F7E2}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">PRM: Check Every Step</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The teacher checks EACH step of your work! Step 1: correct! Step 2: correct! Step 3: oops, mistake! This way, the teacher knows exactly where things went wrong.</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Key Insight:</strong> ORM = Outcome Reward Model (checks only the final answer). PRM = Process Reward Model (checks every step). PRM is much better for training reasoning models because it tells the AI exactly WHERE it went wrong!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3C6}</span> GRPO: Ranking Students Against Each Other</h2>
                <p>Now here's the really clever part! <strong>GRPO</strong> stands for <strong>Group Relative Policy Optimization</strong>. It's the training method used by DeepSeek-R1, one of the smartest reasoning models!</p>
                <p>Instead of having a separate "teacher AI" (called a critic network), GRPO does something simpler:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">1\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;">Generate a Group</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Ask the AI to solve the same problem multiple times. Each attempt might be different! Like asking 5 students to solve the same homework.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">2\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;">Score Each Step</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The PRM checks every step of every attempt. Green for good steps, red for bad steps. Like grading each line of homework.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">3\uFE0F\u20E3</div>
                        <div style="font-weight:600;margin:6px 0;">Rank Relatively</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Compare all attempts against each other. The best ones get rewarded, worst ones get penalized. No separate "teacher" needed!</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Why "No Critic"?</strong> Older methods like PPO needed a separate "critic" neural network to judge how good solutions were. GRPO skips this by just comparing solutions in the group against EACH OTHER. It's like students grading each other's papers instead of hiring a separate teacher! This makes training simpler and faster.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Watch PRM + GRPO in Action!</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>See a group of solutions being scored step by step by the PRM, then ranked by GRPO. Adjust the group size to see how more solutions help!</p>
                <div class="network-viz">
                    <canvas id="grpoCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <label>Group Size: <span id="grpoGroupLabel">5</span> solutions</label>
                        <input type="range" id="grpoGroupSlider" min="3" max="8" value="5" oninput="Chapter14.updateGRPOGroupSize(parseInt(this.value))">
                    </div>
                    <div class="control-group" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-primary btn-small" onclick="Chapter14.animateGRPO()">Score & Rank</button>
                        <button class="btn-secondary btn-small" onclick="Chapter14.resetGRPO()">New Problem</button>
                    </div>
                </div>
                <div id="grpoInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Click "Score & Rank" to watch the PRM grade each step, then GRPO rank the solutions!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F50D}</span> PRM vs ORM: A Closer Look</h2>
                <p>Let's see exactly why checking each step is better than just checking the answer:</p>
                <div style="margin:16px 0;padding:16px;background:rgba(99,102,241,0.08);border-radius:12px;border:1px solid rgba(99,102,241,0.2);">
                    <p style="font-weight:600;color:#6366f1;margin-bottom:12px;">Example: What is 23 + 45 + 12?</p>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div>
                            <p style="font-weight:600;color:#ef4444;font-size:13px;">Student A (gets lucky):</p>
                            <p style="font-size:12px;color:var(--text-secondary);line-height:1.8;">
                                Step 1: 23 + 45 = 70 <span style="color:#ef4444;">\u2717</span><br>
                                Step 2: 70 + 12 = 80 <span style="color:#22c55e;">\u2713</span><br>
                                Answer: 80 <span style="color:#22c55e;">\u2713</span><br>
                                <em>ORM says: Correct! PRM says: Step 1 wrong!</em>
                            </p>
                        </div>
                        <div>
                            <p style="font-weight:600;color:#22c55e;font-size:13px;">Student B (careful work):</p>
                            <p style="font-size:12px;color:var(--text-secondary);line-height:1.8;">
                                Step 1: 23 + 45 = 68 <span style="color:#22c55e;">\u2713</span><br>
                                Step 2: 68 + 12 = 80 <span style="color:#22c55e;">\u2713</span><br>
                                Answer: 80 <span style="color:#22c55e;">\u2713</span><br>
                                <em>ORM says: Correct! PRM says: All steps right!</em>
                            </p>
                        </div>
                    </div>
                </div>
                <p>See? ORM thinks both students are equally good, but PRM knows Student B is better because every step is correct. This helps the AI learn the RIGHT way to solve problems, not just get lucky!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Real World:</strong> DeepSeek-R1 used GRPO with process rewards during training. This is how it learned to reason so well - by getting detailed feedback on every single step, not just the final answer!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> GRPO in Code</h2>
                <p>Here's a simplified view of how GRPO works:</p>
                <div class="code-block"><pre>
<span class="comment"># GRPO: Group Relative Policy Optimization</span>
<span class="comment"># Step 1: Generate a GROUP of solutions</span>
question = <span class="string">"What is 17 x 24?"</span>
group_size = <span class="number">5</span>

solutions = []
<span class="keyword">for</span> i <span class="keyword">in</span> range(group_size):
    solution = model.generate(question)  <span class="comment"># Each may differ!</span>
    solutions.append(solution)

<span class="comment"># Step 2: Score EACH STEP with PRM</span>
<span class="keyword">for</span> solution <span class="keyword">in</span> solutions:
    <span class="keyword">for</span> step <span class="keyword">in</span> solution.steps:
        step.score = prm.evaluate(step)  <span class="comment"># Good step? Bad step?</span>

<span class="comment"># Step 3: Rank solutions RELATIVE to each other</span>
scores = [sum(s.step_scores) <span class="keyword">for</span> s <span class="keyword">in</span> solutions]
mean_score = average(scores)

<span class="comment"># Better-than-average solutions get rewarded!</span>
<span class="comment"># Worse-than-average solutions get penalized!</span>
<span class="keyword">for</span> s, score <span class="keyword">in</span> zip(solutions, scores):
    advantage = score - mean_score  <span class="comment"># Relative ranking!</span>
    update_model(s, advantage)      <span class="comment"># No critic needed!</span>
                </pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#ef4444;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>ORM (Outcome Reward Model)</strong> only checks the final answer. Simple but misses important details about the reasoning process.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>PRM (Process Reward Model)</strong> checks every single step. This teaches the AI WHERE mistakes happen, not just THAT they happened.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>GRPO</strong> generates a group of solutions, scores them, and ranks them against each other. No separate critic network needed!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>DeepSeek-R1</strong> used GRPO as its training method, proving that relative ranking within a group is a powerful way to train reasoning models.</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter14.startQuiz14_2()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('14-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('14-3')">Next: Tree of Thought \u2192</button>
            </div>
        `;

        this.initGRPOCanvas();
    },

    // --- 14.2 Canvas & Interaction Methods ---

    generateGRPOSolutions(groupSize) {
        const solutions = [];
        const stepLabels = [
            'Read the problem',
            'Identify what to find',
            'Choose a method',
            'Do the calculation',
            'Check the answer'
        ];

        for (let i = 0; i < groupSize; i++) {
            const steps = [];
            let totalScore = 0;
            for (let s = 0; s < 5; s++) {
                // Random correctness - some solutions are better than others
                const quality = Math.random();
                const correct = quality > (0.2 + i * 0.05);
                const score = correct ? Math.random() * 0.4 + 0.6 : Math.random() * 0.3;
                steps.push({
                    label: stepLabels[s],
                    correct: correct,
                    score: score
                });
                totalScore += score;
            }
            solutions.push({
                id: i + 1,
                steps: steps,
                totalScore: totalScore,
                rank: 0,
                revealed: false
            });
        }

        // Assign ranks
        const sorted = [...solutions].sort((a, b) => b.totalScore - a.totalScore);
        sorted.forEach((sol, idx) => {
            sol.rank = idx + 1;
        });

        return solutions;
    },

    initGRPOCanvas() {
        this.grpoGroupSize = 5;
        this.grpoSolutions = this.generateGRPOSolutions(5);
        this.grpoStep = 0;
        this.grpoAnimating = false;
        if (this.grpoAnimFrame) cancelAnimationFrame(this.grpoAnimFrame);
        this.drawGRPOCanvas();
    },

    updateGRPOGroupSize(size) {
        this.grpoGroupSize = size;
        const label = document.getElementById('grpoGroupLabel');
        if (label) label.textContent = size;
        this.grpoSolutions = this.generateGRPOSolutions(size);
        this.grpoStep = 0;
        this.drawGRPOCanvas();
    },

    drawGRPOCanvas() {
        const canvas = document.getElementById('grpoCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const solutions = this.grpoSolutions;
        const groupSize = solutions.length;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Title
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('PRM Step Scoring + GRPO Ranking', W / 2, 25);

        // Problem label
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('Problem: "What is 156 + 278 + 49?"', W / 2, 45);

        const leftPanelW = W * 0.6;
        const rightPanelX = leftPanelW + 20;
        const rightPanelW = W - rightPanelX - 20;

        // LEFT: Solution cards with step scores
        const cardW = (leftPanelW - 30) / Math.min(groupSize, 5);
        const startX = 15;
        const cardTopY = 60;
        const cardH = H - cardTopY - 30;
        const stepH = (cardH - 40) / 5;

        // Determine how many steps have been revealed in animation
        const stepsRevealed = Math.min(this.grpoStep, 5);
        const rankingRevealed = this.grpoStep > 5;

        for (let i = 0; i < Math.min(groupSize, 5); i++) {
            const sol = solutions[i];
            const cx = startX + i * cardW + cardW / 2;
            const cardX = startX + i * cardW + 3;
            const cw = cardW - 6;

            // Card background
            ctx.fillStyle = '#141b2d';
            this.drawRoundedRect(ctx, cardX, cardTopY, cw, cardH, 8);
            ctx.fill();
            ctx.strokeStyle = rankingRevealed && sol.rank === 1 ? '#22c55e' : '#1e293b';
            ctx.lineWidth = rankingRevealed && sol.rank === 1 ? 2 : 1;
            this.drawRoundedRect(ctx, cardX, cardTopY, cw, cardH, 8);
            ctx.stroke();

            // Solution label
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = rankingRevealed && sol.rank === 1 ? '#22c55e' : '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText('Sol #' + sol.id, cx, cardTopY + 18);

            // Steps
            for (let s = 0; s < 5; s++) {
                const step = sol.steps[s];
                const sy = cardTopY + 28 + s * stepH;
                const sw = cw - 12;
                const sx = cardX + 6;

                if (s < stepsRevealed) {
                    // Revealed step
                    const color = step.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
                    const borderColor = step.correct ? '#22c55e' : '#ef4444';
                    ctx.fillStyle = color;
                    this.drawRoundedRect(ctx, sx, sy, sw, stepH - 4, 4);
                    ctx.fill();
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = 1;
                    this.drawRoundedRect(ctx, sx, sy, sw, stepH - 4, 4);
                    ctx.stroke();

                    // Step label
                    ctx.font = '9px Inter, sans-serif';
                    ctx.fillStyle = step.correct ? '#22c55e' : '#ef4444';
                    ctx.textAlign = 'center';
                    const shortLabel = 'S' + (s + 1) + (step.correct ? ' \u2713' : ' \u2717');
                    ctx.fillText(shortLabel, cx, sy + stepH / 2);

                    // Score bar
                    const barMaxW = sw - 8;
                    const barH = 4;
                    const barY = sy + stepH / 2 + 6;
                    ctx.fillStyle = '#0d1220';
                    this.drawRoundedRect(ctx, sx + 4, barY, barMaxW, barH, 2);
                    ctx.fill();
                    ctx.fillStyle = step.correct ? '#22c55e' : '#ef4444';
                    this.drawRoundedRect(ctx, sx + 4, barY, barMaxW * step.score, barH, 2);
                    ctx.fill();
                } else {
                    // Unrevealed step
                    ctx.fillStyle = '#1e293b';
                    this.drawRoundedRect(ctx, sx, sy, sw, stepH - 4, 4);
                    ctx.fill();
                    ctx.font = '9px Inter, sans-serif';
                    ctx.fillStyle = '#475569';
                    ctx.textAlign = 'center';
                    ctx.fillText('Step ' + (s + 1), cx, sy + stepH / 2 + 2);
                }
            }

            // Total score at bottom
            if (stepsRevealed === 5) {
                const scoreY = cardTopY + cardH - 18;
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.fillStyle = '#f59e0b';
                ctx.textAlign = 'center';
                ctx.fillText('Score: ' + sol.totalScore.toFixed(1), cx, scoreY);
            }
        }

        // Handle overflow for groups > 5
        if (groupSize > 5) {
            ctx.font = '11px Inter, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText('+ ' + (groupSize - 5) + ' more solutions...', leftPanelW / 2, H - 10);
        }

        // RIGHT: GRPO Ranking bars
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = '#a855f7';
        ctx.textAlign = 'center';
        ctx.fillText('GRPO Ranking', rightPanelX + rightPanelW / 2, 68);

        if (rankingRevealed) {
            const sortedSols = [...solutions].sort((a, b) => a.rank - b.rank);
            const barMaxW = rightPanelW - 60;
            const barH = Math.min(28, (H - 120) / groupSize - 6);
            const maxScore = Math.max(...solutions.map(s => s.totalScore));
            const meanScore = solutions.reduce((a, b) => a + b.totalScore, 0) / groupSize;

            for (let i = 0; i < groupSize; i++) {
                const sol = sortedSols[i];
                const by = 85 + i * (barH + 6);

                // Label
                ctx.font = '10px Inter, sans-serif';
                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'right';
                ctx.fillText('#' + sol.id, rightPanelX + 24, by + barH / 2 + 3);

                // Bar background
                ctx.fillStyle = '#1e293b';
                this.drawRoundedRect(ctx, rightPanelX + 30, by, barMaxW, barH, 4);
                ctx.fill();

                // Bar fill
                const ratio = sol.totalScore / maxScore;
                const aboveMean = sol.totalScore >= meanScore;
                const barColor = aboveMean ? '#22c55e' : '#ef4444';
                ctx.fillStyle = barColor;
                this.drawRoundedRect(ctx, rightPanelX + 30, by, barMaxW * ratio, barH, 4);
                ctx.fill();

                // Rank badge
                const badgeX = rightPanelX + 32 + barMaxW * ratio + 4;
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.fillStyle = aboveMean ? '#22c55e' : '#ef4444';
                ctx.textAlign = 'left';
                ctx.fillText(aboveMean ? '\u2191' : '\u2193', badgeX, by + barH / 2 + 3);
            }

            // Mean line
            const meanRatio = meanScore / maxScore;
            const meanX = rightPanelX + 30 + barMaxW * meanRatio;
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(meanX, 80);
            ctx.lineTo(meanX, 85 + groupSize * (barH + 6));
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = '#f59e0b';
            ctx.textAlign = 'center';
            ctx.fillText('Mean', meanX, 85 + groupSize * (barH + 6) + 14);

            // Legend
            const legendY = H - 40;
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#22c55e';
            ctx.textAlign = 'center';
            ctx.fillText('\u2191 Above mean = Rewarded', rightPanelX + rightPanelW / 2, legendY);
            ctx.fillStyle = '#ef4444';
            ctx.fillText('\u2193 Below mean = Penalized', rightPanelX + rightPanelW / 2, legendY + 16);
        } else {
            ctx.font = '11px Inter, sans-serif';
            ctx.fillStyle = '#475569';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Score & Rank"', rightPanelX + rightPanelW / 2, H / 2 - 10);
            ctx.fillText('to see the ranking!', rightPanelX + rightPanelW / 2, H / 2 + 8);
        }
    },

    animateGRPO() {
        if (this.grpoAnimating) return;
        this.grpoAnimating = true;
        this.grpoStep = 0;
        this.grpoSolutions = this.generateGRPOSolutions(this.grpoGroupSize);

        let frame = 0;
        const framesPerStep = 30;
        const totalSteps = 6; // 5 steps + ranking reveal

        const animate = () => {
            frame++;
            if (frame % framesPerStep === 0) {
                this.grpoStep++;
            }
            this.drawGRPOCanvas();

            if (this.grpoStep <= totalSteps) {
                this.grpoAnimFrame = requestAnimationFrame(animate);
            } else {
                this.grpoAnimating = false;
                const info = document.getElementById('grpoInfo');
                if (info) info.textContent = 'Solutions above the yellow mean line get rewarded. Solutions below get penalized. This is relative ranking - no critic network needed!';
            }
        };

        this.grpoAnimFrame = requestAnimationFrame(animate);
    },

    resetGRPO() {
        this.grpoAnimating = false;
        if (this.grpoAnimFrame) cancelAnimationFrame(this.grpoAnimFrame);
        this.grpoSolutions = this.generateGRPOSolutions(this.grpoGroupSize);
        this.grpoStep = 0;
        this.drawGRPOCanvas();
        const info = document.getElementById('grpoInfo');
        if (info) info.textContent = 'Click "Score & Rank" to watch the PRM grade each step, then GRPO rank the solutions!';
    },

    startQuiz14_2() {
        Quiz.start({
            title: 'Process Reward Models & GRPO',
            chapterId: '14-2',
            questions: [
                {
                    question: 'What does PRM stand for?',
                    options: [
                        'Pretty Reliable Machine',
                        'Process Reward Model',
                        'Partial Random Method',
                        'Progressive Ranking Metric'
                    ],
                    correct: 1,
                    explanation: 'PRM stands for Process Reward Model. It checks EVERY STEP of the AI\'s reasoning, not just the final answer. Like a teacher who grades your work, not just your answer!'
                },
                {
                    question: 'What is the main difference between ORM and PRM?',
                    options: [
                        'ORM is faster than PRM',
                        'ORM checks every step, PRM checks only the answer',
                        'ORM checks only the final answer, PRM checks every step',
                        'They are exactly the same'
                    ],
                    correct: 2,
                    explanation: 'ORM (Outcome Reward Model) only checks the final answer, while PRM (Process Reward Model) checks every step. PRM gives much more detailed feedback!'
                },
                {
                    question: 'What does GRPO stand for?',
                    options: [
                        'General Reasoning Power Output',
                        'Group Relative Policy Optimization',
                        'Gradual Reward Processing Order',
                        'Generative Ranking and Policy Ordering'
                    ],
                    correct: 1,
                    explanation: 'GRPO stands for Group Relative Policy Optimization. It generates a GROUP of solutions and ranks them RELATIVELY against each other!'
                },
                {
                    question: 'Why doesn\'t GRPO need a separate critic network?',
                    options: [
                        'Because it uses a calculator instead',
                        'Because it compares solutions against each other within the group',
                        'Because it never makes mistakes',
                        'Because the user provides the scores'
                    ],
                    correct: 1,
                    explanation: 'GRPO compares solutions within the same group against each other. Solutions better than average get rewarded, worse ones get penalized. No separate critic needed - the group IS the reference!'
                },
                {
                    question: 'Which famous reasoning model uses GRPO for training?',
                    options: [
                        'GPT-2',
                        'BERT',
                        'DeepSeek-R1',
                        'AlexNet'
                    ],
                    correct: 2,
                    explanation: 'DeepSeek-R1 uses GRPO (Group Relative Policy Optimization) as its training method. This helped it become one of the best reasoning models!'
                }
            ]
        });
    },

    // ============================================
    // 14.3: Tree of Thought & Self-Verification
    // ============================================
    loadChapter14_3() {
        const container = document.getElementById('chapter-14-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 14 &bull; Chapter 14.3</span>
                <h1>Tree of Thought & Self-Verification</h1>
                <p class="chapter-subtitle">Thinking Many Moves Ahead - Like a Chess Grandmaster!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{265F}\u{FE0F}</span> Thinking Like a Chess Player</h2>
                <p>Have you ever played chess? The best chess players don't just think about their next move - they think <strong>5, 10, even 20 moves ahead</strong>! They imagine different possibilities, follow each one, and pick the path that leads to winning.</p>
                <p>AI can do the same thing with <strong>Tree of Thought</strong> (ToT)! Instead of just reasoning in one straight line, the AI explores MANY different reasoning paths, like branches on a tree, and picks the best one!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Big Idea:</strong> Tree of Thought lets the AI explore multiple reasoning paths at once, like a chess player thinking "If I do this, then they might do that, and then I could do THIS..." It tries many paths and picks the best! Just like a chess player thinking 5 moves ahead!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F333}</span> What is a Thinking Tree?</h2>
                <p>Imagine a big tree growing upside down from a question:</p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-size:24px;">\u{1F3AF}</div>
                        <div style="font-weight:600;font-size:12px;margin:4px 0;">Root</div>
                        <div style="font-size:11px;color:var(--text-secondary);">The question or problem. Everything starts here!</div>
                    </div>
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-size:24px;">\u{1F33F}</div>
                        <div style="font-weight:600;font-size:12px;margin:4px 0;">Branches</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Different reasoning approaches. "What if I try it THIS way?"</div>
                    </div>
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-size:24px;">\u{1F343}</div>
                        <div style="font-weight:600;font-size:12px;margin:4px 0;">Leaves</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Final answers at the end of each path. Some are good, some are bad!</div>
                    </div>
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-size:24px;">\u{2B05}\u{FE0F}</div>
                        <div style="font-weight:600;font-size:12px;margin:4px 0;">Backtrack</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Oops, dead end! Go back and try a different branch.</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Branching Factor:</strong> At each step, the AI considers several options (usually 2-5). If the AI considers 3 options at each of 4 steps, that's 3 x 3 x 3 x 3 = 81 possible paths! That's a lot of thinking!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3B2}</span> MCTS: The Smart Explorer</h2>
                <p><strong>MCTS</strong> stands for <strong>Monte Carlo Tree Search</strong>. It's a clever way to explore the tree without checking EVERY single branch (that would take forever!).</p>
                <p>MCTS balances two important things:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F50D}</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Explore</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Try branches you haven't visited yet! Maybe there's a great answer hiding in an unexplored path. Be adventurous!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4AA}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Exploit</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Go deeper into branches that look promising! If a path scored well before, keep exploring it. Be smart!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Ice Cream Analogy:</strong> Explore is like trying a new ice cream flavor you've never had. Exploit is like ordering your favorite flavor because you know it's good. The best strategy? Try some new ones, but mostly go with what works! MCTS does exactly this balance.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Explore the Thinking Tree!</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Watch the AI explore different reasoning paths! Green paths are promising, red are dead ends, and yellow are being explored. Adjust the tree depth and click "Auto-explore" to watch MCTS in action!</p>
                <div class="network-viz">
                    <canvas id="totCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <label>Tree Depth: <span id="totDepthLabel">3</span></label>
                        <input type="range" id="totDepthSlider" min="2" max="5" value="3" oninput="Chapter14.updateToTDepth(parseInt(this.value))">
                    </div>
                    <div class="control-group" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-primary btn-small" onclick="Chapter14.autoExploreToT()">Auto-explore</button>
                        <button class="btn-secondary btn-small" onclick="Chapter14.resetToT()">Reset Tree</button>
                    </div>
                </div>
                <div id="totInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Click "Auto-explore" to watch MCTS explore the tree! Green = promising, Red = dead end, Yellow = exploring.
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{2705}</span> Self-Verification: Checking Your Own Work</h2>
                <p>Here's something really cool: reasoning models can <strong>check their own work</strong>! After finding an answer, the AI asks itself: "Wait, is this actually right?"</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DD}</div>
                        <div style="font-weight:600;margin:6px 0;">Solve It</div>
                        <div style="font-size:12px;color:var(--text-secondary);">First, work through the problem and get an answer.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F50D}</div>
                        <div style="font-weight:600;margin:6px 0;">Check It</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Then, look at the answer and ask "Does this make sense? Can I verify it?"</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F504}</div>
                        <div style="font-weight:600;margin:6px 0;">Fix It</div>
                        <div style="font-size:12px;color:var(--text-secondary);">If something is wrong, backtrack and try a different path!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Real Example:</strong> If the AI calculates "17 x 24 = 408", it can verify by checking "408 / 24 = 17" and "408 / 17 = 24". If those check out, the answer is correct! This is exactly what humans do when they double-check their work.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> Tree of Thought in Code</h2>
                <p>Here's how Tree of Thought works step by step:</p>
                <div class="code-block"><pre>
<span class="comment"># Tree of Thought with MCTS</span>
<span class="keyword">def</span> tree_of_thought(question, max_depth=<span class="number">3</span>):
    root = Node(question)  <span class="comment"># Start with the question</span>

    <span class="keyword">for</span> i <span class="keyword">in</span> range(<span class="number">100</span>):  <span class="comment"># Explore 100 times</span>
        <span class="comment"># Step 1: SELECT - pick a promising node</span>
        node = select_best_node(root)  <span class="comment"># Explore vs Exploit!</span>

        <span class="comment"># Step 2: EXPAND - try a new reasoning step</span>
        child = node.add_child(generate_next_step())

        <span class="comment"># Step 3: SIMULATE - play out this path</span>
        result = simulate_to_end(child)

        <span class="comment"># Step 4: BACKPROPAGATE - update scores</span>
        update_scores(child, result)  <span class="comment"># Good path? Bad path?</span>

    <span class="comment"># Pick the path with the highest score!</span>
    best_path = root.get_best_path()

    <span class="comment"># Self-Verification: Check the answer!</span>
    answer = best_path.final_answer
    <span class="keyword">if</span> verify(answer):
        <span class="keyword">return</span> answer  <span class="comment"># Checks out!</span>
    <span class="keyword">else</span>:
        <span class="keyword">return</span> tree_of_thought(question)  <span class="comment"># Try again!</span>
                </pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3C6}</span> When to Use Tree of Thought</h2>
                <p>Tree of Thought is amazing for problems that need deep thinking:</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#22c55e;">Great For:</div>
                        <div style="font-size:12px;color:var(--text-secondary);line-height:1.8;">
                            &bull; Hard math problems<br>
                            &bull; Logic puzzles and riddles<br>
                            &bull; Planning and strategy<br>
                            &bull; Coding challenges<br>
                            &bull; Scientific reasoning
                        </div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#ef4444;">Not Needed For:</div>
                        <div style="font-size:12px;color:var(--text-secondary);line-height:1.8;">
                            &bull; Simple questions ("What color is the sky?")<br>
                            &bull; Translation<br>
                            &bull; Summarization<br>
                            &bull; Casual conversation<br>
                            &bull; Tasks with obvious answers
                        </div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F3AF}</span>
                    <span class="info-box-text"><strong>Fun fact:</strong> Google DeepMind's AlphaGo used MCTS to beat the world champion at Go in 2016! The same tree search strategy that helps AI play board games now helps AI reason through hard problems!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Tree of Thought</strong> explores multiple reasoning paths like branches on a tree, instead of just one straight line of thinking.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>MCTS (Monte Carlo Tree Search)</strong> balances exploring new paths and exploiting promising ones. Like trying new ice cream flavors vs ordering your favorite!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Branching factor</strong> is how many options the AI considers at each step. More branches = more paths to explore!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Self-verification</strong> means the model checks its own work. If something doesn't add up, it backtracks and tries a different path!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter14.startQuiz14_3()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('14-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('14-4')">Next: Chapter 14.4 \u2192</button>
            </div>
        `;

        this.initToTCanvas();
    },

    // --- 14.3 Canvas & Interaction Methods ---

    buildToTTree(depth, branchFactor) {
        let nodeId = 0;
        const buildNode = (level, label) => {
            const node = {
                id: nodeId++,
                label: label,
                level: level,
                children: [],
                score: 0,
                visits: 0,
                status: 'unexplored', // 'unexplored', 'exploring', 'good', 'bad'
                x: 0,
                y: 0
            };
            if (level < depth) {
                const numChildren = Math.max(2, Math.min(branchFactor, 2 + Math.floor(Math.random() * 2)));
                const stepLabels = [
                    ['Try algebra', 'Try guessing', 'Draw a picture', 'Use a formula', 'Work backwards'],
                    ['Simplify', 'Substitute', 'Factor', 'Expand', 'Rewrite'],
                    ['Calculate', 'Estimate', 'Check units', 'Round first', 'Use ratio'],
                    ['Verify', 'Double-check', 'Test edge', 'Compare', 'Prove it'],
                    ['Finalize', 'Summarize', 'Confirm', 'Conclude', 'Answer']
                ];
                for (let i = 0; i < numChildren; i++) {
                    const childLabel = stepLabels[Math.min(level, stepLabels.length - 1)][i % 5];
                    node.children.push(buildNode(level + 1, childLabel));
                }
            }
            return node;
        };

        return buildNode(0, 'Question');
    },

    layoutToTTree(node, x, y, widthAlloc, levelH) {
        node.x = x;
        node.y = y;
        if (node.children.length > 0) {
            const childWidth = widthAlloc / node.children.length;
            const startX = x - widthAlloc / 2 + childWidth / 2;
            for (let i = 0; i < node.children.length; i++) {
                this.layoutToTTree(
                    node.children[i],
                    startX + i * childWidth,
                    y + levelH,
                    childWidth * 0.9,
                    levelH
                );
            }
        }
    },

    initToTCanvas() {
        this.totDepth = 3;
        this.totAutoExploring = false;
        this.totAnimStep = 0;
        if (this.totAnimFrame) cancelAnimationFrame(this.totAnimFrame);
        this.totTree = this.buildToTTree(this.totDepth, 3);
        const canvas = document.getElementById('totCanvas');
        if (canvas) {
            const levelH = (canvas.height - 60) / this.totDepth;
            this.layoutToTTree(this.totTree, canvas.width / 2, 40, canvas.width - 80, levelH);
        }
        this.drawToTCanvas();
    },

    updateToTDepth(depth) {
        this.totDepth = depth;
        const label = document.getElementById('totDepthLabel');
        if (label) label.textContent = depth;
        this.totAutoExploring = false;
        if (this.totAnimFrame) cancelAnimationFrame(this.totAnimFrame);
        this.totTree = this.buildToTTree(depth, 3);
        const canvas = document.getElementById('totCanvas');
        if (canvas) {
            const levelH = (canvas.height - 60) / depth;
            this.layoutToTTree(this.totTree, canvas.width / 2, 40, canvas.width - 80, levelH);
        }
        this.drawToTCanvas();
    },

    drawToTCanvas() {
        const canvas = document.getElementById('totCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Title
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Tree of Thought - MCTS Exploration', W / 2, 20);

        if (!this.totTree) return;

        // Draw tree
        this.drawToTNode(ctx, this.totTree);

        // Legend
        const legendY = H - 18;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';

        ctx.fillStyle = '#22c55e';
        ctx.fillText('\u25CF Promising', W / 2 - 160, legendY);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('\u25CF Dead End', W / 2 - 60, legendY);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('\u25CF Exploring', W / 2 + 40, legendY);
        ctx.fillStyle = '#475569';
        ctx.fillText('\u25CF Unexplored', W / 2 + 140, legendY);
    },

    drawToTNode(ctx, node) {
        const statusColors = {
            'unexplored': '#475569',
            'exploring': '#f59e0b',
            'good': '#22c55e',
            'bad': '#ef4444'
        };

        const color = statusColors[node.status] || '#475569';

        // Draw edges to children first
        for (const child of node.children) {
            ctx.strokeStyle = statusColors[child.status] || '#1e293b';
            ctx.lineWidth = child.status === 'unexplored' ? 1 : 2;
            ctx.globalAlpha = child.status === 'unexplored' ? 0.3 : 0.8;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(child.x, child.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Draw children recursively
        for (const child of node.children) {
            this.drawToTNode(ctx, child);
        }

        // Draw node circle
        const radius = node.level === 0 ? 18 : (node.children.length === 0 ? 10 : 13);

        // Glow for non-unexplored
        if (node.status !== 'unexplored') {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
        }

        ctx.fillStyle = '#0d1220';
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = node.status === 'exploring' ? 3 : 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Fill with slight color
        ctx.fillStyle = color + '33';
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius - 2, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = node.level === 0 ? 'bold 9px Inter, sans-serif' : '8px Inter, sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (radius >= 13) {
            ctx.fillText(node.label.substring(0, 8), node.x, node.y);
        }

        // Visit count if visited
        if (node.visits > 0) {
            ctx.font = 'bold 7px Inter, sans-serif';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(node.visits + 'v', node.x, node.y + radius + 8);
        }

        ctx.textBaseline = 'alphabetic';
    },

    collectAllNodes(node, list) {
        list.push(node);
        for (const child of node.children) {
            this.collectAllNodes(child, list);
        }
        return list;
    },

    autoExploreToT() {
        if (this.totAutoExploring) return;
        this.totAutoExploring = true;

        // Reset tree
        this.totTree = this.buildToTTree(this.totDepth, 3);
        const canvas = document.getElementById('totCanvas');
        if (canvas) {
            const levelH = (canvas.height - 60) / this.totDepth;
            this.layoutToTTree(this.totTree, canvas.width / 2, 40, canvas.width - 80, levelH);
        }

        const allNodes = this.collectAllNodes(this.totTree, []);
        const leafNodes = allNodes.filter(n => n.children.length === 0);
        const nonRootNodes = allNodes.filter(n => n.level > 0);

        let explorationIndex = 0;
        const totalExplorations = Math.min(nonRootNodes.length, 20);

        // Mark root as exploring
        this.totTree.status = 'exploring';
        this.totTree.visits = 1;

        const step = () => {
            if (explorationIndex >= totalExplorations || !this.totAutoExploring) {
                this.totAutoExploring = false;
                // Final pass: mark root as good
                this.totTree.status = 'good';
                this.drawToTCanvas();
                const info = document.getElementById('totInfo');
                if (info) info.textContent = 'Exploration complete! Green paths lead to good answers. The AI would pick the best green path as its final answer.';
                return;
            }

            // Pick a node to explore (prioritize unexplored, then simulate MCTS-like behavior)
            const unexplored = nonRootNodes.filter(n => n.status === 'unexplored');
            let target;

            if (unexplored.length > 0 && Math.random() > 0.3) {
                // Explore: pick a random unexplored node
                target = unexplored[Math.floor(Math.random() * unexplored.length)];
            } else {
                // Exploit: revisit a promising node
                const explored = nonRootNodes.filter(n => n.status === 'good' || n.status === 'exploring');
                if (explored.length > 0) {
                    target = explored[Math.floor(Math.random() * explored.length)];
                } else {
                    target = nonRootNodes[Math.floor(Math.random() * nonRootNodes.length)];
                }
            }

            // Animate: first mark as exploring
            target.status = 'exploring';
            target.visits++;
            this.drawToTCanvas();

            setTimeout(() => {
                // Then resolve: good or bad?
                const isGood = Math.random() > 0.35;
                target.status = isGood ? 'good' : 'bad';
                target.score = isGood ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3;

                // Also mark parent path
                let parent = this.findParent(this.totTree, target);
                if (parent && parent.status === 'unexplored') {
                    parent.status = isGood ? 'good' : 'exploring';
                    parent.visits++;
                }

                this.drawToTCanvas();
                explorationIndex++;

                setTimeout(step, 200);
            }, 300);
        };

        this.drawToTCanvas();
        setTimeout(step, 500);
    },

    findParent(root, target) {
        for (const child of root.children) {
            if (child.id === target.id) return root;
            const found = this.findParent(child, target);
            if (found) return found;
        }
        return null;
    },

    resetToT() {
        this.totAutoExploring = false;
        if (this.totAnimFrame) cancelAnimationFrame(this.totAnimFrame);
        this.initToTCanvas();
        const info = document.getElementById('totInfo');
        if (info) info.textContent = 'Click "Auto-explore" to watch MCTS explore the tree! Green = promising, Red = dead end, Yellow = exploring.';
    },

    startQuiz14_3() {
        Quiz.start({
            title: 'Tree of Thought & Self-Verification',
            chapterId: '14-3',
            questions: [
                {
                    question: 'What is Tree of Thought?',
                    options: [
                        'A way to plant digital trees',
                        'Exploring multiple reasoning paths like branches on a tree',
                        'A type of neural network shaped like a tree',
                        'A database structure for storing thoughts'
                    ],
                    correct: 1,
                    explanation: 'Tree of Thought explores multiple reasoning paths at once, like branches on a tree. Each branch is a different approach to solving the problem!'
                },
                {
                    question: 'What does MCTS stand for?',
                    options: [
                        'Maximum Capacity Tree System',
                        'Multi-Channel Token Sampler',
                        'Monte Carlo Tree Search',
                        'Modular Control and Training Strategy'
                    ],
                    correct: 2,
                    explanation: 'MCTS stands for Monte Carlo Tree Search. It is a clever algorithm that balances exploring new paths and exploiting promising ones!'
                },
                {
                    question: 'In MCTS, what is the difference between "explore" and "exploit"?',
                    options: [
                        'Explore means searching files, exploit means running code',
                        'Explore means trying new untested paths, exploit means going deeper into promising paths',
                        'They mean the same thing',
                        'Explore is fast, exploit is slow'
                    ],
                    correct: 1,
                    explanation: 'Explore means trying new untested paths (maybe something great is hiding there!), while exploit means going deeper into paths that already look promising. A good balance of both is key!'
                },
                {
                    question: 'What is self-verification in reasoning?',
                    options: [
                        'When the user checks the AI\'s work',
                        'When another AI checks the first AI\'s work',
                        'When the model checks its own answer to make sure it is correct',
                        'When the training data is verified'
                    ],
                    correct: 2,
                    explanation: 'Self-verification means the model checks its own work! For example, if it calculates 17 x 24 = 408, it can verify by checking 408 / 24 = 17. Smart!'
                },
                {
                    question: 'What happens when the AI hits a "dead end" in Tree of Thought?',
                    options: [
                        'It crashes and stops',
                        'It gives up and returns no answer',
                        'It backtracks and tries a different branch',
                        'It asks the user for help'
                    ],
                    correct: 2,
                    explanation: 'When the AI hits a dead end (a bad reasoning path), it backtracks - goes back up the tree and tries a different branch. Just like when you take a wrong turn, you go back and try another road!'
                }
            ]
        });
    },

    // ============================================
    // 14.4: Synthetic Data & Self-Play
    // ============================================
    loadChapter14_4() {
        const container = document.getElementById('chapter-14-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 14 &bull; Chapter 14.4</span>
                <h1>Synthetic Data & Self-Play</h1>
                <p class="chapter-subtitle">Making Your Own Practice Tests - And Grading Yourself!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4DD}</span> What If You Could Make Your Own Homework?</h2>
                <p>Imagine you're studying for a big test, but you've already done ALL the practice problems in your textbook. What do you do? You <strong>make up your own practice problems</strong>, solve them, and check your answers!</p>
                <p>That's exactly what <strong>synthetic data</strong> is! Instead of needing humans to write millions of training examples, the AI <strong>generates its own training data</strong>. It writes questions, solves them, checks if the answers are good, and learns from the best ones!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Big Idea:</strong> Synthetic data is training data created by AI instead of humans. The model generates examples, scores them for quality (using rejection sampling), and only trains on the good ones. It's like a student who makes up practice tests and only studies the ones that are actually helpful!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AF}</span> Rejection Sampling: Keeping Only the Good Stuff</h2>
                <p>Not everything the AI generates is good! Some answers are wrong, some are sloppy, and some are amazing. <strong>Rejection sampling</strong> is like a quality filter:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4E6}</div>
                        <div style="font-weight:600;margin:6px 0;">Generate a Batch</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The AI creates a big pile of solutions. Some are great, some are okay, some are terrible.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{2B50}</div>
                        <div style="font-weight:600;margin:6px 0;">Score Each One</div>
                        <div style="font-size:12px;color:var(--text-secondary);">A reward model (like PRM from Chapter 14.2) grades each solution. High score? Keep it! Low score? Toss it!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DA}</div>
                        <div style="font-weight:600;margin:6px 0;">Train on the Best</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Only the highest-quality examples become training data. The model learns from its own best work!</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Analogy:</strong> Think of panning for gold! You scoop up a bunch of sand and rocks (generate data), then shake the pan so only the heavy gold nuggets stay (rejection sampling). You throw away the sand and keep the gold!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{265F}\u{FE0F}</span> Self-Play: Playing Chess Against Yourself</h2>
                <p>Have you ever played chess against yourself? You make a move for white, then spin the board and play for black. Each time you play, you get a little better because you're learning from BOTH sides!</p>
                <p><strong>Self-play</strong> works the same way for AI. The model plays against itself, or generates problems and solves them, getting better with each round. It's a loop:</p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-size:24px;">\u{270D}\u{FE0F}</div>
                        <div style="font-weight:600;font-size:12px;margin:4px 0;color:#a855f7;">Generate</div>
                        <div style="font-size:11px;color:var(--text-secondary);">The model creates new problems and solutions.</div>
                    </div>
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-size:24px;">\u{1F4CA}</div>
                        <div style="font-weight:600;font-size:12px;margin:4px 0;color:#f59e0b;">Score</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Rate each solution for quality and correctness.</div>
                    </div>
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-size:24px;">\u{1F5D1}\u{FE0F}</div>
                        <div style="font-weight:600;font-size:12px;margin:4px 0;color:#ef4444;">Filter</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Throw away bad samples, keep only the best.</div>
                    </div>
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-size:24px;">\u{1F4AA}</div>
                        <div style="font-weight:600;font-size:12px;margin:4px 0;color:#22c55e;">Train</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Learn from the best samples and get smarter!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Real World:</strong> AlphaGo Zero learned to play Go at a superhuman level using ONLY self-play - no human games needed! DeepSeek-R1 uses a similar idea: the model generates its own reasoning examples and trains on the best ones.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Watch the Self-Play Loop!</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Watch the AI improve through self-play! Each cycle: generate samples, score them, filter the bad ones, and train on the good ones. Watch the quality meter climb!</p>
                <div class="network-viz">
                    <canvas id="selfPlayCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-primary btn-small" onclick="Chapter14.animateSelfPlay()">Start Self-Play Loop</button>
                        <button class="btn-secondary btn-small" onclick="Chapter14.resetSelfPlay()">Reset</button>
                    </div>
                </div>
                <div id="selfPlayInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Click "Start Self-Play Loop" to watch the AI generate data, filter it, and improve each cycle!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F393}</span> Distillation: Learning from a Tutor</h2>
                <p>There's another awesome trick called <strong>distillation</strong>. Imagine you have a super-smart tutor (a big expensive model) who writes out detailed, perfect solutions. Then a smaller student model reads those solutions and learns from them!</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F9D1}\u200D\u{1F3EB}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">Teacher Model (Big)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">A huge, powerful model (like GPT-4 or DeepSeek-V3) generates high-quality detailed solutions. It's smart but slow and expensive.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F9D1}\u200D\u{1F393}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">Student Model (Small)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">A smaller, faster model learns by studying the teacher's examples. It gets almost as smart but runs much faster and cheaper!</div>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Analogy:</strong> It's like getting a tutor's detailed solution manual! The tutor (teacher model) writes out perfect step-by-step solutions, and you (student model) study them. You learn the tutor's tricks without being as big or expensive as the tutor!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> Self-Play in Code</h2>
                <p>Here's a simplified view of the self-play training loop:</p>
                <div class="code-block"><pre>
<span class="comment"># Self-Play Training Loop</span>
model = initial_model()
quality = <span class="number">30</span>  <span class="comment"># Starting quality score</span>

<span class="keyword">for</span> cycle <span class="keyword">in</span> range(<span class="number">10</span>):
    <span class="comment"># Step 1: GENERATE - make synthetic data</span>
    samples = model.generate(num_samples=<span class="number">1000</span>)

    <span class="comment"># Step 2: SCORE - rate each sample</span>
    <span class="keyword">for</span> sample <span class="keyword">in</span> samples:
        sample.score = reward_model.evaluate(sample)

    <span class="comment"># Step 3: FILTER - keep only the best (rejection sampling)</span>
    threshold = percentile(scores, <span class="number">70</span>)  <span class="comment"># Top 30%</span>
    good_samples = [s <span class="keyword">for</span> s <span class="keyword">in</span> samples <span class="keyword">if</span> s.score >= threshold]

    <span class="comment"># Step 4: TRAIN - learn from the good stuff</span>
    model.train(good_samples)
    quality += <span class="number">5</span>  <span class="comment"># Model gets better each cycle!</span>

    print(f<span class="string">"Cycle {cycle}: Quality={quality}, Kept={len(good_samples)}"</span>)
                </pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Synthetic data</strong> is training data generated by the AI itself, instead of being written by humans. It's like making your own practice tests!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Rejection sampling</strong> filters out bad synthetic data and keeps only the best. Like panning for gold - throw away the sand, keep the nuggets!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Self-play</strong> is a training loop where the model generates data, filters it, trains on the best, and repeats. Each cycle makes the model smarter!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Distillation</strong> transfers knowledge from a big teacher model to a smaller student model. The student learns the teacher's tricks without being as big!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter14.startQuiz14_4()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('14-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('14-5')">Next: DeepSeek & RAGEN \u2192</button>
            </div>
        `;

        this.initSelfPlayCanvas();
    },

    // --- 14.4 Canvas & Interaction Methods ---

    initSelfPlayCanvas() {
        this.selfPlayStep = 0;
        this.selfPlayCycle = 0;
        this.selfPlayQuality = 30;
        this.selfPlayAnimating = false;
        this.selfPlaySamples = [];
        if (this.selfPlayAnimFrame) cancelAnimationFrame(this.selfPlayAnimFrame);
        this.drawSelfPlayCanvas();
    },

    generateSelfPlaySamples() {
        const samples = [];
        for (let i = 0; i < 12; i++) {
            const quality = Math.random() * 100;
            const threshold = 40 + this.selfPlayCycle * 5;
            samples.push({
                id: i,
                quality: quality,
                accepted: quality >= threshold,
                x: 0,
                y: 0,
                angle: 0
            });
        }
        return samples;
    },

    drawSelfPlayCanvas() {
        const canvas = document.getElementById('selfPlayCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Title
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Self-Play Training Loop', W / 2, 22);

        // Draw circular loop with 4 nodes
        const centerX = W * 0.4;
        const centerY = H / 2 + 10;
        const radiusX = 140;
        const radiusY = 120;

        const nodes = [
            { label: 'Generate', color: '#a855f7', angle: -Math.PI / 2 },
            { label: 'Score', color: '#f59e0b', angle: 0 },
            { label: 'Filter', color: '#ef4444', angle: Math.PI / 2 },
            { label: 'Train', color: '#22c55e', angle: Math.PI }
        ];

        // Draw loop path (ellipse)
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Draw arrows along the path
        for (let i = 0; i < nodes.length; i++) {
            const from = nodes[i];
            const to = nodes[(i + 1) % nodes.length];
            const midAngle = (from.angle + to.angle) / 2;
            // Adjust for wrap-around
            const adjustedMid = i === 3 ? (from.angle + to.angle + Math.PI * 2) / 2 : midAngle;
            const ax = centerX + Math.cos(adjustedMid) * (radiusX + 2);
            const ay = centerY + Math.sin(adjustedMid) * (radiusY + 2);

            // Arrow direction
            const dx = -Math.sin(adjustedMid);
            const dy = Math.cos(adjustedMid);
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.moveTo(ax + dy * 6, ay - dx * 6);
            ctx.lineTo(ax - dy * 6, ay + dx * 6);
            ctx.lineTo(ax + dx * 10, ay + dy * 10);
            ctx.closePath();
            ctx.fill();
        }

        // Draw animated data dots flowing around the loop
        if (this.selfPlayAnimating) {
            const time = Date.now() / 1000;
            for (let i = 0; i < 8; i++) {
                const dotAngle = -Math.PI / 2 + (time * 1.5 + i * Math.PI / 4) % (Math.PI * 2);
                const dx = centerX + Math.cos(dotAngle) * radiusX;
                const dy = centerY + Math.sin(dotAngle) * radiusY;

                ctx.fillStyle = i % 2 === 0 ? '#a855f7' : '#22c55e';
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(dx, dy, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // Draw the 4 nodes
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const nx = centerX + Math.cos(node.angle) * radiusX;
            const ny = centerY + Math.sin(node.angle) * radiusY;

            // Highlight active step
            const isActive = this.selfPlayAnimating && (this.selfPlayStep % 4) === i;

            // Node circle
            ctx.fillStyle = isActive ? node.color + '44' : '#141b2d';
            ctx.beginPath();
            ctx.arc(nx, ny, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = node.color;
            ctx.lineWidth = isActive ? 3 : 2;
            ctx.beginPath();
            ctx.arc(nx, ny, 30, 0, Math.PI * 2);
            ctx.stroke();

            // Glow if active
            if (isActive) {
                ctx.shadowColor = node.color;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(nx, ny, 30, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            // Label
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = node.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label, nx, ny);
            ctx.textBaseline = 'alphabetic';
        }

        // Right side: Quality meter and stats
        const meterX = W * 0.72;
        const meterY = 50;
        const meterW = 40;
        const meterH = 260;

        // Quality meter background
        ctx.fillStyle = '#141b2d';
        this.drawRoundedRect(ctx, meterX, meterY, meterW, meterH, 8);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, meterX, meterY, meterW, meterH, 8);
        ctx.stroke();

        // Quality meter fill
        const qualityRatio = Math.min(this.selfPlayQuality / 100, 1);
        const fillH = meterH * qualityRatio;
        const gradient = ctx.createLinearGradient(meterX, meterY + meterH - fillH, meterX, meterY + meterH);
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(1, '#15803d');
        ctx.fillStyle = gradient;
        this.drawRoundedRect(ctx, meterX + 3, meterY + meterH - fillH + 3, meterW - 6, fillH - 6, 5);
        ctx.fill();

        // Quality label
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('Quality', meterX + meterW / 2, meterY - 10);

        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillStyle = '#22c55e';
        ctx.fillText(Math.round(this.selfPlayQuality) + '%', meterX + meterW / 2, meterY + meterH + 25);

        // Stats panel
        const statsX = W * 0.72 + 60;
        const statsY = 60;

        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('Stats', statsX, statsY);

        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Cycle: ' + this.selfPlayCycle, statsX, statsY + 24);
        ctx.fillText('Generated: ' + (this.selfPlayCycle * 12), statsX, statsY + 44);

        const acceptRate = this.selfPlayCycle > 0 ? Math.round(30 + this.selfPlayCycle * 4) : 0;
        ctx.fillText('Accept Rate: ' + acceptRate + '%', statsX, statsY + 64);

        // Sample display
        if (this.selfPlaySamples.length > 0) {
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Samples:', statsX, statsY + 96);

            for (let i = 0; i < Math.min(this.selfPlaySamples.length, 8); i++) {
                const s = this.selfPlaySamples[i];
                const sx = statsX + (i % 4) * 28;
                const sy = statsY + 110 + Math.floor(i / 4) * 28;

                ctx.fillStyle = s.accepted ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)';
                ctx.beginPath();
                ctx.arc(sx + 10, sy + 10, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = s.accepted ? '#22c55e' : '#ef4444';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(sx + 10, sy + 10, 10, 0, Math.PI * 2);
                ctx.stroke();

                ctx.font = '8px Inter, sans-serif';
                ctx.fillStyle = s.accepted ? '#22c55e' : '#ef4444';
                ctx.textAlign = 'center';
                ctx.fillText(s.accepted ? '\u2713' : '\u2717', sx + 10, sy + 13);
                ctx.textAlign = 'left';
            }
        }

        // Cycle progression at bottom
        if (this.selfPlayCycle > 0) {
            const progY = H - 30;
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText('Quality Progression:', W / 2, progY);

            const barStartX = W / 2 - 100;
            const barW = 200;
            for (let c = 0; c < Math.min(this.selfPlayCycle, 8); c++) {
                const bx = barStartX + c * 25;
                const bh = 8 + c * 3;
                ctx.fillStyle = '#22c55e';
                ctx.globalAlpha = 0.4 + c * 0.08;
                this.drawRoundedRect(ctx, bx, progY + 6 - bh / 2, 20, bh, 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
    },

    animateSelfPlay() {
        if (this.selfPlayAnimating) return;
        this.selfPlayAnimating = true;
        this.selfPlayStep = 0;
        this.selfPlayCycle = 0;
        this.selfPlayQuality = 30;
        this.selfPlaySamples = [];

        const maxCycles = 6;
        let frame = 0;
        const framesPerStep = 25;

        const animate = () => {
            frame++;
            if (frame % framesPerStep === 0) {
                this.selfPlayStep++;
                const currentStepInCycle = this.selfPlayStep % 4;

                if (currentStepInCycle === 0 && this.selfPlayStep > 0) {
                    // New cycle
                    this.selfPlayCycle++;
                    this.selfPlayQuality = Math.min(95, 30 + this.selfPlayCycle * 10 + Math.random() * 5);
                    this.selfPlaySamples = this.generateSelfPlaySamples();
                }

                if (currentStepInCycle === 0) {
                    this.selfPlaySamples = this.generateSelfPlaySamples();
                }
            }

            this.drawSelfPlayCanvas();

            if (this.selfPlayCycle < maxCycles) {
                this.selfPlayAnimFrame = requestAnimationFrame(animate);
            } else {
                this.selfPlayAnimating = false;
                const info = document.getElementById('selfPlayInfo');
                if (info) info.textContent = 'Self-play complete! Quality improved from 30% to ' + Math.round(this.selfPlayQuality) + '% over ' + this.selfPlayCycle + ' cycles. Each cycle, the model generated data, filtered the best, and trained on it!';
            }
        };

        this.selfPlayAnimFrame = requestAnimationFrame(animate);
    },

    resetSelfPlay() {
        this.selfPlayAnimating = false;
        if (this.selfPlayAnimFrame) cancelAnimationFrame(this.selfPlayAnimFrame);
        this.initSelfPlayCanvas();
        const info = document.getElementById('selfPlayInfo');
        if (info) info.textContent = 'Click "Start Self-Play Loop" to watch the AI generate data, filter it, and improve each cycle!';
    },

    startQuiz14_4() {
        Quiz.start({
            title: 'Synthetic Data & Self-Play',
            chapterId: '14-4',
            questions: [
                {
                    question: 'What is synthetic data?',
                    options: [
                        'Data collected from real users',
                        'Training data generated by the AI itself',
                        'Data stored in a synthetic material',
                        'Data that has been compressed'
                    ],
                    correct: 1,
                    explanation: 'Synthetic data is training data generated by the AI itself, instead of being collected from humans. The model creates its own practice problems and learns from the best ones!'
                },
                {
                    question: 'What does rejection sampling do?',
                    options: [
                        'Rejects all the data and starts over',
                        'Filters out low-quality generated samples and keeps only the best',
                        'Randomly picks samples without checking quality',
                        'Sends bad data to another model'
                    ],
                    correct: 1,
                    explanation: 'Rejection sampling filters out low-quality data and keeps only the best samples. Like panning for gold - throw away the sand, keep the gold nuggets!'
                },
                {
                    question: 'How is self-play like playing chess against yourself?',
                    options: [
                        'The AI uses a chess engine',
                        'The AI takes turns being two different models',
                        'The model generates its own training data and improves each cycle, learning from itself',
                        'The AI only learns chess moves'
                    ],
                    correct: 2,
                    explanation: 'In self-play, the model generates its own training data, scores it, trains on the best parts, and repeats. Each cycle it gets better, just like playing chess against yourself makes you improve!'
                },
                {
                    question: 'What is distillation in AI?',
                    options: [
                        'Removing water from the training data',
                        'A big teacher model generates examples that a smaller student model learns from',
                        'Making the model smaller by deleting layers',
                        'Converting text data into numbers'
                    ],
                    correct: 1,
                    explanation: 'Distillation is when a big, smart teacher model generates high-quality examples, and a smaller student model learns from them. The student gets almost as smart while being much faster and cheaper!'
                },
                {
                    question: 'Why is the self-play loop so powerful?',
                    options: [
                        'Because it uses the most expensive hardware',
                        'Because it only needs one training cycle',
                        'Because the model keeps improving each cycle by learning from its own best work',
                        'Because it does not need any data at all'
                    ],
                    correct: 2,
                    explanation: 'The self-play loop is powerful because it creates a virtuous cycle: generate, score, filter, train, repeat. Each cycle, the model gets better at generating AND evaluating data, leading to continuous improvement!'
                }
            ]
        });
    },

    // ============================================
    // 14.5: DeepSeek & RAGEN
    // ============================================
    loadChapter14_5() {
        const container = document.getElementById('chapter-14-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 14 &bull; Chapter 14.5</span>
                <h1>DeepSeek & RAGEN</h1>
                <p class="chapter-subtitle">Building a Super-Brain from LEGO Blocks!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9E9}</span> DeepSeek: The LEGO Super-Brain</h2>
                <p>Imagine you're building the coolest LEGO robot ever. You don't just use one type of block - you use <strong>wheels</strong> for moving, <strong>arms</strong> for grabbing, <strong>eyes</strong> for seeing, and a <strong>brain</strong> for thinking. Each piece does something special!</p>
                <p>That's exactly how <strong>DeepSeek</strong> works! It combines multiple clever innovations, each one like a special LEGO block:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F3E5}</div>
                        <div style="font-weight:600;margin:6px 0;color:#a855f7;">MoE - Mixture of Experts</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like a hospital with specialist doctors! For a heart problem, only the heart doctor works (not the eye doctor). MoE activates only the right "expert" networks for each task, saving compute power.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F5DC}\u{FE0F}</div>
                        <div style="font-weight:600;margin:6px 0;color:#22c55e;">MLA - Multi-head Latent Attention</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Compressed attention from Chapter 13.3! Instead of storing every detail, MLA compresses the key information into a smaller space. Like writing summary notes instead of copying the whole textbook.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{26A1}</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">DSA - Dynamic Sparse Attention</div>
                        <div style="font-size:12px;color:var(--text-secondary);">From Chapter 13.2! Instead of looking at everything, DSA decides which parts are important and focuses only on those. Like speed-reading a book by only reading the highlighted parts.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F3C6}</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">GRPO - Group Training</div>
                        <div style="font-size:12px;color:var(--text-secondary);">From Chapter 14.2! Trains by comparing groups of solutions against each other. No separate critic needed. This is how DeepSeek-R1 learned to reason so well!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Big Idea:</strong> DeepSeek's genius is combining all these innovations together! MoE for efficiency, MLA for compressed memory, DSA for focused attention, and GRPO for training. Each piece makes the whole system better, like LEGO blocks that snap together perfectly!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3E5}</span> MoE: The Hospital of Specialists</h2>
                <p>In a regular AI model, ALL neurons work on EVERY problem. That's wasteful! Imagine if every doctor in a hospital examined every patient - the eye doctor checking your broken arm!</p>
                <p><strong>Mixture of Experts (MoE)</strong> is smarter. It has many specialist "experts" but only activates a few for each task:</p>
                <div style="margin:16px 0;padding:16px;background:rgba(168,85,247,0.08);border-radius:12px;border:1px solid rgba(168,85,247,0.2);">
                    <p style="font-weight:600;color:#a855f7;margin-bottom:12px;">How MoE Routes Tasks to Experts:</p>
                    <div style="font-size:12px;color:var(--text-secondary);line-height:1.8;">
                        &bull; Math question \u2192 Activates: Math Expert + Logic Expert (2 of 64 experts)<br>
                        &bull; Poetry request \u2192 Activates: Language Expert + Creative Expert<br>
                        &bull; Code problem \u2192 Activates: Code Expert + Reasoning Expert<br>
                        &bull; <em>Result: 256B total parameters, but only ~21B active at once! Super efficient!</em>
                    </div>
                </div>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Why this matters:</strong> DeepSeek-V3 has 671 billion parameters but only activates about 37 billion at a time. That's like having the knowledge of a giant library but only reading the one book you need! This makes it fast AND smart.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: DeepSeek Architecture Explorer</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Toggle each component ON/OFF to see how DeepSeek combines MoE, MLA, and DSA. Watch data flow through the active modules!</p>
                <div class="network-viz">
                    <canvas id="deepseekCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-primary btn-small" onclick="Chapter14.toggleDeepseekMoE()" id="btnMoE">MoE: ON</button>
                        <button class="btn-primary btn-small" onclick="Chapter14.toggleDeepseekMLA()" id="btnMLA">MLA: ON</button>
                        <button class="btn-primary btn-small" onclick="Chapter14.toggleDeepseekDSA()" id="btnDSA">DSA: ON</button>
                        <button class="btn-secondary btn-small" onclick="Chapter14.animateDeepseek()">Animate Data Flow</button>
                    </div>
                </div>
                <div id="deepseekInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Toggle MoE, MLA, and DSA on/off to see how DeepSeek's architecture changes. Click "Animate Data Flow" to watch!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F916}</span> RAGEN: Training AI Agents with Tools</h2>
                <p>What if AI could not just think, but also <strong>DO things</strong>? Like searching the web, writing code, or using a calculator? That's what <strong>RAGEN</strong> is all about!</p>
                <p>RAGEN stands for <strong>Reinforcement learning for AGENts</strong>. It's a framework for training AI agents that can use tools:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F50D}</div>
                        <div style="font-weight:600;margin:6px 0;">Search the Web</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The agent can look things up online to find information it doesn't know. Like having an encyclopedia at your fingertips!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4BB}</div>
                        <div style="font-weight:600;margin:6px 0;">Write Code</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The agent can write and run Python code to solve math problems, analyze data, or create things programmatically.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F9EE}</div>
                        <div style="font-weight:600;margin:6px 0;">Use Tools</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Calculators, databases, APIs - the agent learns WHEN and HOW to use each tool, just like learning which utensil to use for each food!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Analogy:</strong> Think of RAGEN like training a robot that has hands (tools) and can look things up in an encyclopedia (web search). The robot learns through practice: "When should I use my calculator hand? When should I search? When should I just think?" Reinforcement learning teaches it to pick the right action!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> DeepSeek Architecture in Code</h2>
                <p>Here's a simplified view of how DeepSeek's components work together:</p>
                <div class="code-block"><pre>
<span class="comment"># DeepSeek: Combining Multiple Innovations</span>
<span class="keyword">class</span> DeepSeek:
    <span class="keyword">def</span> __init__(self):
        self.experts = [Expert() <span class="keyword">for</span> _ <span class="keyword">in</span> range(<span class="number">64</span>)]  <span class="comment"># MoE</span>
        self.router = Router()  <span class="comment"># Picks which experts to use</span>
        self.mla = MultiheadLatentAttention()  <span class="comment"># Compressed attention</span>
        self.dsa = DynamicSparseAttention()   <span class="comment"># Focus on key parts</span>

    <span class="keyword">def</span> forward(self, input):
        <span class="comment"># Step 1: MLA compresses the attention keys/values</span>
        compressed = self.mla.compress(input)

        <span class="comment"># Step 2: DSA focuses on the important parts</span>
        focused = self.dsa.attend(compressed)

        <span class="comment"># Step 3: MoE routes to the right experts</span>
        top_experts = self.router.pick_top_k(focused, k=<span class="number">2</span>)
        output = sum(e.process(focused) <span class="keyword">for</span> e <span class="keyword">in</span> top_experts)

        <span class="keyword">return</span> output  <span class="comment"># Fast AND smart!</span>

<span class="comment"># RAGEN: Training an Agent with Tools</span>
<span class="keyword">class</span> RAGENAgent:
    tools = [WebSearch(), CodeRunner(), Calculator()]

    <span class="keyword">def</span> act(self, task):
        plan = self.think(task)       <span class="comment"># Reason about what to do</span>
        tool = self.pick_tool(plan)   <span class="comment"># Choose the right tool</span>
        result = tool.execute(plan)   <span class="comment"># Use the tool!</span>
        <span class="keyword">return</span> self.answer(result)     <span class="comment"># Give the final answer</span>
                </pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary: Key Takeaways</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">1\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>DeepSeek</strong> combines MoE, MLA, DSA, and GRPO like LEGO blocks. Each innovation handles a different challenge (efficiency, memory, focus, training).</span>
                    </div>
                    <div class="info-box" style="border-left-color:#22c55e;">
                        <span class="info-box-icon">2\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>Mixture of Experts (MoE)</strong> activates only the right specialist experts for each task. 671B parameters but only 37B active at a time!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">3\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>MLA + DSA</strong> compress attention and focus on important parts. This makes long-context processing efficient and fast.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">4\uFE0F\u20E3</span>
                        <span class="info-box-text"><strong>RAGEN</strong> trains AI agents to use tools (search, code, calculators) through reinforcement learning. It's like teaching a robot which tool to grab for each job!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <button class="btn-primary btn-small" onclick="Chapter14.startQuiz14_5()" style="margin-left:12px;">Start Quiz</button>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('14-4')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('15-1')">Next: Quantization Deep Dive \u2192</button>
            </div>
        `;

        this.initDeepseekCanvas();
    },

    // --- 14.5 Canvas & Interaction Methods ---

    initDeepseekCanvas() {
        this.deepseekShowMoE = true;
        this.deepseekShowMLA = true;
        this.deepseekShowDSA = true;
        this.deepseekAnimStep = 0;
        this.deepseekAnimating = false;
        this.deepseekDataFlow = [];
        if (this.deepseekAnimFrame) cancelAnimationFrame(this.deepseekAnimFrame);
        this.drawDeepseekCanvas();
    },

    drawDeepseekCanvas() {
        const canvas = document.getElementById('deepseekCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Title
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('DeepSeek Architecture', W / 2, 22);

        // Central brain
        const brainX = W / 2;
        const brainY = 150;
        const brainR = 45;

        // Glow
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#141b2d';
        ctx.beginPath();
        ctx.arc(brainX, brainY, brainR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(brainX, brainY, brainR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#c7d2fe';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DeepSeek', brainX, brainY - 6);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#818cf8';
        ctx.fillText('Core Brain', brainX, brainY + 10);
        ctx.textBaseline = 'alphabetic';

        // Module positions
        const modules = [
            { key: 'MoE', label: 'MoE', sublabel: 'Mixture of Experts', x: brainX, y: brainY - 115, color: '#a855f7', active: this.deepseekShowMoE },
            { key: 'MLA', label: 'MLA', sublabel: 'Latent Attention', x: brainX - 160, y: brainY + 20, color: '#22c55e', active: this.deepseekShowMLA },
            { key: 'DSA', label: 'DSA', sublabel: 'Sparse Attention', x: brainX + 160, y: brainY + 20, color: '#f59e0b', active: this.deepseekShowDSA }
        ];

        // Draw connections from modules to brain
        for (const mod of modules) {
            if (mod.active) {
                ctx.strokeStyle = mod.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(mod.x, mod.y);
                ctx.lineTo(brainX, brainY);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.globalAlpha = 1;
            }
        }

        // Draw animated data flow dots
        if (this.deepseekAnimating) {
            const time = Date.now() / 800;
            for (const mod of modules) {
                if (!mod.active) continue;
                for (let i = 0; i < 3; i++) {
                    const t = ((time + i * 0.33) % 1);
                    const dx = mod.x + (brainX - mod.x) * t;
                    const dy = mod.y + (brainY - mod.y) * t;
                    ctx.fillStyle = mod.color;
                    ctx.globalAlpha = 1 - t * 0.5;
                    ctx.beginPath();
                    ctx.arc(dx, dy, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }
        }

        // Draw modules
        for (const mod of modules) {
            const r = 35;

            // Module circle
            ctx.fillStyle = mod.active ? mod.color + '22' : '#0d1220';
            ctx.beginPath();
            ctx.arc(mod.x, mod.y, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = mod.active ? mod.color : '#334155';
            ctx.lineWidth = mod.active ? 2.5 : 1.5;
            ctx.beginPath();
            ctx.arc(mod.x, mod.y, r, 0, Math.PI * 2);
            ctx.stroke();

            if (mod.active) {
                ctx.shadowColor = mod.color;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(mod.x, mod.y, r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            // Label
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.fillStyle = mod.active ? mod.color : '#475569';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mod.label, mod.x, mod.y - 5);
            ctx.font = '8px Inter, sans-serif';
            ctx.fillText(mod.sublabel, mod.x, mod.y + 10);
            ctx.textBaseline = 'alphabetic';

            // OFF indicator
            if (!mod.active) {
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.fillStyle = '#ef4444';
                ctx.fillText('OFF', mod.x, mod.y + r + 14);
            }
        }

        // Input arrow (left side)
        const inputX = 60;
        const inputY = brainY;
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Input', inputX, inputY - 18);

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(inputX + 20, inputY);
        ctx.lineTo(brainX - brainR - 10, inputY);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(brainX - brainR - 10, inputY - 6);
        ctx.lineTo(brainX - brainR - 10, inputY + 6);
        ctx.lineTo(brainX - brainR, inputY);
        ctx.closePath();
        ctx.fill();

        // Output arrow (right side)
        const outputX = W - 60;
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Output', outputX, inputY - 18);

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(brainX + brainR + 10, inputY);
        ctx.lineTo(outputX - 20, inputY);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(outputX - 20, inputY - 6);
        ctx.lineTo(outputX - 20, inputY + 6);
        ctx.lineTo(outputX - 10, inputY);
        ctx.closePath();
        ctx.fill();

        // Efficiency stats
        let activeCount = 0;
        if (this.deepseekShowMoE) activeCount++;
        if (this.deepseekShowMLA) activeCount++;
        if (this.deepseekShowDSA) activeCount++;

        const statsY = 240;
        ctx.fillStyle = '#141b2d';
        this.drawRoundedRect(ctx, W / 2 - 180, statsY, 360, 50, 10);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, W / 2 - 180, statsY, 360, 50, 10);
        ctx.stroke();

        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';

        const efficiency = activeCount === 3 ? 'Maximum' : activeCount === 2 ? 'High' : activeCount === 1 ? 'Medium' : 'Low';
        const effColor = activeCount === 3 ? '#22c55e' : activeCount === 2 ? '#f59e0b' : activeCount === 1 ? '#ef4444' : '#475569';
        ctx.fillText('Active Modules: ' + activeCount + '/3', W / 2 - 80, statsY + 22);
        ctx.fillText('|', W / 2, statsY + 22);
        ctx.fillStyle = effColor;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('Efficiency: ' + efficiency, W / 2 + 80, statsY + 22);

        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Toggle components above to see how architecture changes', W / 2, statsY + 40);

        // RAGEN agent diagram at bottom
        const ragenY = 320;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.fillText('RAGEN: AI Agent with Tools', W / 2, ragenY);

        // Agent brain (center)
        const agentX = W / 2;
        const agentY = ragenY + 40;

        ctx.fillStyle = '#141b2d';
        this.drawRoundedRect(ctx, agentX - 40, agentY - 15, 80, 30, 8);
        ctx.fill();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, agentX - 40, agentY - 15, 80, 30, 8);
        ctx.stroke();

        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = '#c7d2fe';
        ctx.fillText('Agent Brain', agentX, agentY + 3);

        // Tool nodes
        const tools = [
            { label: 'Web Search', icon: '\u{1F50D}', x: agentX - 200, color: '#22c55e' },
            { label: 'Code Runner', icon: '\u{1F4BB}', x: agentX - 80, color: '#a855f7' },
            { label: 'Calculator', icon: '\u{1F9EE}', x: agentX + 80, color: '#f59e0b' },
            { label: 'Database', icon: '\u{1F4BE}', x: agentX + 200, color: '#ef4444' }
        ];

        for (const tool of tools) {
            const ty = agentY + 50;

            // Connection line
            ctx.strokeStyle = tool.color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(agentX, agentY + 15);
            ctx.lineTo(tool.x, ty - 12);
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Tool box
            ctx.fillStyle = '#141b2d';
            this.drawRoundedRect(ctx, tool.x - 35, ty - 12, 70, 26, 6);
            ctx.fill();
            ctx.strokeStyle = tool.color;
            ctx.lineWidth = 1.5;
            this.drawRoundedRect(ctx, tool.x - 35, ty - 12, 70, 26, 6);
            ctx.stroke();

            ctx.font = '9px Inter, sans-serif';
            ctx.fillStyle = tool.color;
            ctx.textAlign = 'center';
            ctx.fillText(tool.label, tool.x, ty + 5);
        }
    },

    toggleDeepseekMoE() {
        this.deepseekShowMoE = !this.deepseekShowMoE;
        const btn = document.getElementById('btnMoE');
        if (btn) btn.textContent = 'MoE: ' + (this.deepseekShowMoE ? 'ON' : 'OFF');
        this.drawDeepseekCanvas();
    },

    toggleDeepseekMLA() {
        this.deepseekShowMLA = !this.deepseekShowMLA;
        const btn = document.getElementById('btnMLA');
        if (btn) btn.textContent = 'MLA: ' + (this.deepseekShowMLA ? 'ON' : 'OFF');
        this.drawDeepseekCanvas();
    },

    toggleDeepseekDSA() {
        this.deepseekShowDSA = !this.deepseekShowDSA;
        const btn = document.getElementById('btnDSA');
        if (btn) btn.textContent = 'DSA: ' + (this.deepseekShowDSA ? 'ON' : 'OFF');
        this.drawDeepseekCanvas();
    },

    animateDeepseek() {
        if (this.deepseekAnimating) {
            this.deepseekAnimating = false;
            if (this.deepseekAnimFrame) cancelAnimationFrame(this.deepseekAnimFrame);
            this.drawDeepseekCanvas();
            return;
        }

        this.deepseekAnimating = true;
        this.deepseekAnimStep = 0;

        const animate = () => {
            this.deepseekAnimStep++;
            this.drawDeepseekCanvas();

            if (this.deepseekAnimating) {
                this.deepseekAnimFrame = requestAnimationFrame(animate);
            }
        };

        this.deepseekAnimFrame = requestAnimationFrame(animate);

        const info = document.getElementById('deepseekInfo');
        if (info) info.textContent = 'Data flowing through active modules! Toggle components to see the effect. Click "Animate Data Flow" again to stop.';
    },

    startQuiz14_5() {
        Quiz.start({
            title: 'DeepSeek & RAGEN',
            chapterId: '14-5',
            questions: [
                {
                    question: 'What is Mixture of Experts (MoE)?',
                    options: [
                        'Training many separate AI models',
                        'A system that activates only the right specialist networks for each task',
                        'Mixing different programming languages',
                        'A voting system where all networks contribute equally'
                    ],
                    correct: 1,
                    explanation: 'MoE activates only the right specialist "expert" networks for each task. Like a hospital where only the right specialist doctor sees each patient - efficient and effective!'
                },
                {
                    question: 'Why is MoE efficient for DeepSeek-V3?',
                    options: [
                        'It uses smaller GPUs',
                        'It has fewer total parameters',
                        'It has 671B total parameters but only activates ~37B at a time',
                        'It processes data in batches of 1000'
                    ],
                    correct: 2,
                    explanation: 'DeepSeek-V3 has 671 billion total parameters but only activates about 37 billion at a time using MoE routing. This gives it the knowledge of a huge model with the speed of a smaller one!'
                },
                {
                    question: 'What does RAGEN train AI agents to do?',
                    options: [
                        'Only answer text questions',
                        'Use tools like web search, code execution, and calculators',
                        'Play video games',
                        'Generate images only'
                    ],
                    correct: 1,
                    explanation: 'RAGEN (Reinforcement learning for AGENts) trains AI agents to use tools like web search, code runners, and calculators. The agent learns when and how to use each tool through practice!'
                },
                {
                    question: 'Which innovations does DeepSeek combine?',
                    options: [
                        'Only MoE and nothing else',
                        'MoE, MLA, DSA, and GRPO',
                        'Just attention and feedforward layers',
                        'CNN, RNN, and LSTM'
                    ],
                    correct: 1,
                    explanation: 'DeepSeek combines MoE (routing to experts), MLA (compressed attention), DSA (dynamic sparse attention), and GRPO (group training). Each innovation is like a LEGO block that makes the whole system better!'
                },
                {
                    question: 'How is MoE like a hospital?',
                    options: [
                        'It heals sick data',
                        'It has waiting rooms for data',
                        'Only the right specialist doctors (experts) work on each patient (task)',
                        'It charges expensive fees for processing'
                    ],
                    correct: 2,
                    explanation: 'MoE is like a hospital with specialist doctors. For a heart problem, only the heart doctor works (not the eye doctor). Similarly, MoE routes each task to only the relevant expert networks!'
                }
            ]
        });
    }
};
