/* ============================================
   Chapter 11: Generative AI & Multimodal
   ============================================ */

const Chapter11 = {
    // State variables for all 5 chapters
    diffusionStep: 0,
    diffusionPlaying: false,
    diffusionAnimFrame: null,
    diffusionNoiseLevel: 100,
    textToImgPromptIdx: 0,
    textToImgAnimFrame: null,
    textToImgStep: 0,
    textToImgGuidance: 7,
    clipMatchScore: [],
    clipAnimFrame: null,
    clipSelected: -1,
    clipMatched: [],
    clipFirstPick: -1,
    clipPickType: null,
    videoKeyframe: 0,
    videoAnimFrame: null,
    videoPlaying: false,
    multimodalInputs: [],
    multimodalAnimFrame: null,
    multimodalStep: 0,

    init() {
        App.registerChapter('11-1', () => this.loadChapter11_1());
        App.registerChapter('11-2', () => this.loadChapter11_2());
        App.registerChapter('11-3', () => this.loadChapter11_3());
        App.registerChapter('11-4', () => this.loadChapter11_4());
        App.registerChapter('11-5', () => this.loadChapter11_5());
    },

    // ============================================
    // 11.1: Diffusion Models
    // ============================================
    loadChapter11_1() {
        const container = document.getElementById('chapter-11-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 11 &bull; Chapter 11.1</span>
                <h1>Diffusion Models: Pictures from Noise!</h1>
                <p>What if you could start with pure TV static and slowly clean it up until a beautiful picture appears? That's exactly how diffusion models work!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4D8}</span> What Is a Diffusion Model?</h2>
                <p>A <strong>diffusion model</strong> learns to reverse noise. During training it sees clean images gradually corrupted,
                   then learns how to remove that corruption step by step.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AF}</span> Why Do We Care?</h2>
                <p>This lets the model create brand-new images instead of copying stored ones. It starts from random pixels and shapes them into a meaningful picture.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9EA}</span> Prompt-to-Output Example</h2>
                <div class="code-block">Prompt idea: "a blue star and a green square"
Start: random static
Middle steps: rough shapes appear
Final steps: edges sharpen and colors settle
Output: a clean image matching the description</div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4FA}</span> What Is Noise?</h2>
                <p>Have you ever seen an old TV that shows nothing but fuzzy, sparkly static? That's what we call <strong>noise</strong> - it's completely random dots with no picture at all!</p>
                <p>Diffusion models are like magic erasers that can take that fuzzy static and slowly, step by step, clean it up to reveal an amazing picture underneath. It's like using a magic cloth to wipe away the fuzziness!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Think of it this way:</strong> Imagine you have a beautiful chalk drawing on a sidewalk. If it rains a little bit, the drawing gets slightly blurry. More rain makes it blurrier. A LOT of rain washes it away completely. Diffusion models learn to REVERSE the rain - turning a puddle back into a beautiful drawing!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{27A1}\u{FE0F}</span> The Forward Process: Adding Noise</h2>
                <p>First, the AI watches what happens when we slowly add noise to pictures:</p>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:16px 0;">
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">\u{1F3A8}</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Step 0</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Perfect picture! Crystal clear!</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">\u{1F324}\u{FE0F}</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Step 250</div>
                        <div style="font-size:10px;color:var(--text-secondary);">A little fuzzy, like light fog</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">\u{1F32B}\u{FE0F}</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Step 500</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Pretty blurry now, hard to see</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">\u{1F301}</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Step 750</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Mostly noise, barely any picture</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:24px;">\u{1F4FA}</div>
                        <div style="font-weight:600;font-size:11px;margin:4px 0;">Step 1000</div>
                        <div style="font-size:10px;color:var(--text-secondary);">Pure TV static! All noise!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{2B05}\u{FE0F}</span> The Reverse Process: Removing Noise</h2>
                <p>Now here's the magic part! The AI learns to do everything <strong>backwards</strong> - it learns to remove a tiny bit of noise at each step. After many small cleaning steps, pure static becomes a beautiful picture!</p>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>The Secret Trick:</strong> The AI doesn't try to clean up the whole picture at once! Instead, it takes tiny baby steps. At each step, it asks: "What tiny bit of noise should I remove right now?" After hundreds of tiny steps, the picture appears like magic!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Watch Diffusion in Action!</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Use the buttons and slider to add noise or remove noise from a picture. Watch how the shapes go from clear to fuzzy and back again!</p>
                <div class="network-viz">
                    <canvas id="diffusionCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <label>\u{1F50A} Noise Level: <span id="noiseLevelLabel">100%</span></label>
                        <input type="range" id="noiseSlider" min="0" max="100" value="100" oninput="Chapter11.setNoiseLevel(parseInt(this.value))">
                    </div>
                    <div class="control-group" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-primary btn-small" onclick="Chapter11.addNoiseFull()">\u{1F4FA} Full Noise</button>
                        <button class="btn-primary btn-small" onclick="Chapter11.removeNoiseStep()">\u{1F9F9} Remove Noise Step</button>
                        <button class="btn-secondary btn-small" onclick="Chapter11.clearNoise()">\u{2728} Clear Picture</button>
                        <button class="btn-secondary btn-small" onclick="Chapter11.autoDenoisePlay()">\u{25B6}\u{FE0F} Auto Denoise</button>
                    </div>
                </div>
                <div id="diffusionStepInfo" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Click "Full Noise" to start with pure static, then watch the magic as you remove noise!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9E0}</span> The U-Net: The Noise-Cleaning Brain</h2>
                <p>The AI uses a special brain called a <strong>U-Net</strong> to figure out what noise to remove. It's called "U-Net" because the way it processes information looks like the letter U!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F3F7}\uFE0F</span>
                    <span class="info-box-text"><strong>Real term to remember:</strong> U-Net is the denoiser network. It predicts the noise residual to remove at each step.</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F50D}</div>
                        <div style="font-weight:600;margin:6px 0;">Squeeze Down</div>
                        <div style="font-size:12px;color:var(--text-secondary);">First, the U-Net looks at the big picture and squishes it smaller and smaller to understand what's going on</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4A1}</div>
                        <div style="font-weight:600;margin:6px 0;">Think Hard</div>
                        <div style="font-size:12px;color:var(--text-secondary);">At the bottom of the U, it thinks really hard about what the picture should look like</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F3A8}</div>
                        <div style="font-weight:600;margin:6px 0;">Expand Up</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Then it expands back up to full size, painting in the clean details as it grows!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Skip Connections:</strong> The U-Net has special shortcuts (like secret tunnels) that connect the squeeze-down side to the expand-up side. This helps it remember the fine details while thinking about the big picture!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> Diffusion Process in Code</h2>
                <div class="code-block"><div class="code-header"><span>Python</span></div><pre><code><span class="comment"># Diffusion Model - How it makes pictures from noise!</span>

<span class="keyword">import</span> torch

<span class="comment"># Step 1: Start with pure random noise (TV static!)</span>
noise = torch.randn(1, 3, 256, 256)  <span class="comment"># Random pixels</span>

<span class="comment"># Step 2: The U-Net brain that cleans up noise</span>
unet = UNet(in_channels=3, out_channels=3)

<span class="comment"># Step 3: Remove noise step by step (the magic part!)</span>
image = noise  <span class="comment"># Start with pure static</span>
<span class="keyword">for</span> step <span class="keyword">in</span> range(1000, 0, -1):  <span class="comment"># Count down from 1000</span>
    <span class="comment"># Ask U-Net: "What noise should I remove?"</span>
    predicted_noise = unet(image, step)

    <span class="comment"># Remove a tiny bit of noise</span>
    image = remove_noise(image, predicted_noise, step)

<span class="comment"># After 1000 tiny steps... a beautiful picture!</span>
show_image(image)  <span class="comment"># WOW! \u{1F3A8}</span></code></pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\u{FE0F}\u{20E3}</span>
                        <span class="info-box-text"><strong>Forward Process:</strong> Slowly add noise to a picture over many steps until it becomes pure random static.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#10b981;">
                        <span class="info-box-icon">2\u{FE0F}\u{20E3}</span>
                        <span class="info-box-text"><strong>Reverse Process:</strong> The AI learns to remove noise step by step, turning static back into a picture.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">3\u{FE0F}\u{20E3}</span>
                        <span class="info-box-text"><strong>U-Net:</strong> The special brain that predicts what noise to remove at each step, using a squeeze-down-then-expand-up architecture.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\u{FE0F}\u{20E3}</span>
                        <span class="info-box-text"><strong>Tiny Steps:</strong> The key is taking many small steps (usually 1000!) instead of trying to clean everything at once.</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AF}</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter11.startQuiz11_1()">Start Quiz \u{2192}</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('10-5')">\u{2190} Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('11-2')">Next: Text-to-Image \u{2192}</button>
            </div>
        `;

        this.diffusionNoiseLevel = 100;
        this.drawDiffusionCanvas();
    },

    setNoiseLevel(val) {
        this.diffusionNoiseLevel = val;
        const label = document.getElementById('noiseLevelLabel');
        if (label) label.textContent = val + '%';
        const slider = document.getElementById('noiseSlider');
        if (slider) slider.value = val;
        this.drawDiffusionCanvas();
        const info = document.getElementById('diffusionStepInfo');
        if (info) {
            if (val === 0) info.textContent = 'Crystal clear! The picture is perfectly clean!';
            else if (val < 25) info.textContent = 'Almost there! Just a tiny bit of fuzz left.';
            else if (val < 50) info.textContent = 'Getting clearer! You can start to see the shapes.';
            else if (val < 75) info.textContent = 'Still pretty noisy, but some shapes are peeking through...';
            else info.textContent = 'Lots of noise! The picture is hidden under all that static.';
        }
    },

    addNoiseFull() {
        this.setNoiseLevel(100);
    },

    removeNoiseStep() {
        const newLevel = Math.max(0, this.diffusionNoiseLevel - 5);
        this.setNoiseLevel(newLevel);
    },

    clearNoise() {
        this.setNoiseLevel(0);
    },

    autoDenoisePlay() {
        if (this.diffusionPlaying) {
            this.diffusionPlaying = false;
            if (this.diffusionAnimFrame) cancelAnimationFrame(this.diffusionAnimFrame);
            return;
        }
        this.diffusionNoiseLevel = 100;
        this.diffusionPlaying = true;
        const animate = () => {
            if (!this.diffusionPlaying) return;
            this.diffusionNoiseLevel = Math.max(0, this.diffusionNoiseLevel - 1);
            this.setNoiseLevel(this.diffusionNoiseLevel);
            if (this.diffusionNoiseLevel <= 0) {
                this.diffusionPlaying = false;
                const info = document.getElementById('diffusionStepInfo');
                if (info) info.textContent = 'Ta-da! The AI cleaned up all the noise and revealed the picture!';
                return;
            }
            this.diffusionAnimFrame = requestAnimationFrame(animate);
        };
        animate();
    },

    drawDiffusionCanvas() {
        const canvas = document.getElementById('diffusionCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const noise = this.diffusionNoiseLevel / 100;
        const clarity = 1 - noise;

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 15px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Diffusion: Noise Level ' + this.diffusionNoiseLevel + '%', W / 2, 24);

        // Draw three shapes that become clearer as noise decreases
        const shapes = [
            { type: 'circle', x: 200, y: 210, r: 70, color: '#6366f1', label: 'Circle' },
            { type: 'square', x: 400, y: 210, size: 120, color: '#10b981', label: 'Square' },
            { type: 'star', x: 600, y: 210, r: 65, color: '#f59e0b', label: 'Star' }
        ];

        // Draw shapes with clarity
        shapes.forEach(s => {
            ctx.globalAlpha = clarity;
            ctx.fillStyle = s.color;

            if (s.type === 'circle') {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
                // Inner highlight
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.beginPath();
                ctx.arc(s.x - 15, s.y - 15, s.r * 0.4, 0, Math.PI * 2);
                ctx.fill();
            } else if (s.type === 'square') {
                const half = s.size / 2;
                ctx.beginPath();
                ctx.roundRect(s.x - half, s.y - half, s.size, s.size, 12);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.beginPath();
                ctx.roundRect(s.x - half + 15, s.y - half + 15, s.size * 0.35, s.size * 0.35, 6);
                ctx.fill();
            } else if (s.type === 'star') {
                this.drawStar(ctx, s.x, s.y, 5, s.r, s.r * 0.45);
                ctx.fill();
            }

            // Label
            ctx.globalAlpha = clarity;
            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 13px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(s.label, s.x, s.y + s.r + 30);
        });

        ctx.globalAlpha = 1;

        // Draw noise overlay
        if (noise > 0) {
            const imageData = ctx.getImageData(0, 0, W, H);
            const data = imageData.data;
            const noiseStrength = noise;
            for (let i = 0; i < data.length; i += 4) {
                if (Math.random() < noiseStrength * 0.7) {
                    const v = Math.floor(Math.random() * 256);
                    const blend = noiseStrength * 0.85;
                    data[i] = data[i] * (1 - blend) + v * blend;
                    data[i + 1] = data[i + 1] * (1 - blend) + v * blend;
                    data[i + 2] = data[i + 2] * (1 - blend) + v * blend;
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // Progress bar at bottom
        const barY = H - 30;
        const barW = W - 100;
        const barH = 12;
        const barX = 50;
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 6);
        ctx.fill();

        const progressGrad = ctx.createLinearGradient(barX, 0, barX + barW * clarity, 0);
        progressGrad.addColorStop(0, '#6366f1');
        progressGrad.addColorStop(1, '#10b981');
        ctx.fillStyle = progressGrad;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * clarity, barH, 6);
        ctx.fill();

        ctx.fillStyle = '#8b95a8';
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Noisy', barX, barY - 5);
        ctx.textAlign = 'right';
        ctx.fillText('Clean', barX + barW, barY - 5);
    },

    drawStar(ctx, cx, cy, spikes, outerR, innerR) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerR);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerR;
            y = cy + Math.sin(rot) * outerR;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerR;
            y = cy + Math.sin(rot) * innerR;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerR);
        ctx.closePath();
    },

    startQuiz11_1() {
        Quiz.start({
            title: 'Chapter 11.1: Diffusion Models',
            chapterId: '11-1',
            questions: [
                {
                    question: 'What does a diffusion model start with to create a picture?',
                    options: ['A blank white canvas', 'Pure random noise (TV static)', 'A rough sketch drawing', 'A photograph from a camera'],
                    correct: 1,
                    explanation: 'Diffusion models start with pure random noise - like TV static! Then they remove the noise step by step until a picture appears.'
                },
                {
                    question: 'What is the "forward process" in diffusion?',
                    options: ['Removing noise from a picture', 'Slowly adding noise to a picture until it becomes static', 'Drawing a picture from scratch', 'Copying a picture from the internet'],
                    correct: 1,
                    explanation: 'The forward process slowly adds more and more noise to a clean picture, like rain washing away a chalk drawing bit by bit!'
                },
                {
                    question: 'How many steps does a typical diffusion model use to clean up noise?',
                    options: ['Just 1 big step', 'About 10 steps', 'Around 1000 tiny steps', 'Exactly 1 million steps'],
                    correct: 2,
                    explanation: 'Diffusion models typically use around 1000 tiny denoising steps! Taking many small steps works much better than trying to clean everything at once.'
                },
                {
                    question: 'What is the U-Net in a diffusion model?',
                    options: ['The internet connection it uses', 'The special brain that predicts what noise to remove', 'The screen that shows the picture', 'A type of USB cable'],
                    correct: 1,
                    explanation: 'The U-Net is the neural network brain that looks at the noisy picture and figures out what noise should be removed at each step!'
                },
                {
                    question: 'Why is it called a "U-Net"?',
                    options: ['Because it was made at a university', 'Because its architecture looks like the letter U - squeeze down then expand up', 'Because it uses USB connections', 'Because it can only draw U-shapes'],
                    correct: 1,
                    explanation: 'The U-Net gets its name because the information flows down (squeezing smaller) then back up (expanding bigger), making a U shape!'
                }
            ]
        });
    },

    // ============================================
    // 11.2: Text-to-Image (DALL-E, Stable Diffusion)
    // ============================================
    loadChapter11_2() {
        const container = document.getElementById('chapter-11-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 11 &bull; Chapter 11.2</span>
                <h1>Text-to-Image: Words Become Pictures!</h1>
                <p>Imagine having a magic artist who can paint ANYTHING you describe with words. That's what text-to-image AI does!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4D8}</span> What Is Text-to-Image?</h2>
                <p>A <strong>text-to-image model</strong> combines a text encoder with a diffusion model so the denoising process follows the meaning of your prompt.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9EA}</span> One Worked Example</h2>
                <p>If the prompt is <strong>"a red robot in a sunny park"</strong>, the text encoder turns that sentence into guidance.
                   During denoising, the model keeps boosting shapes and colors that match <strong>robot</strong>, <strong>red</strong>, and <strong>sunny park</strong>.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9D9}</span> The Magic Artist</h2>
                <p>Remember how diffusion models can turn noise into pictures? Well, <strong>text-to-image models</strong> like DALL-E and Stable Diffusion add a superpower: they listen to your WORDS to decide what picture to make!</p>
                <p>It's like having a magic artist friend. You say "paint me a sunset over the ocean" and they start with a blank canvas (noise) and paint exactly what you described!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>How does the text guide the picture?</strong> The AI converts your words into a special "guide signal" that steers the denoising process. At each of those 1000 cleaning steps, the AI checks: "Does this look like what the person asked for?" and adjusts accordingly!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AF}</span> Classifier-Free Guidance: Clearer Instructions!</h2>
                <p>Imagine you tell your artist friend: "Paint a castle." They might make a basic castle. But what if you say "Paint a castle" with MORE enthusiasm and detail? They'll make a MUCH more castle-like castle!</p>
                <p><strong>Guidance strength</strong> works the same way. A low guidance is like whispering your request. A high guidance is like excitedly describing EXACTLY what you want!</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F92B}</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Low Guidance (1-3)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like whispering. The artist is creative but might not match your description well.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F60A}</div>
                        <div style="font-weight:600;margin:6px 0;color:#10b981;">Medium Guidance (7-8)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like talking normally. A nice balance of creativity and following your description!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4E3}</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">High Guidance (15-20)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Like shouting! Matches your words exactly but might look a bit too intense.</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3A8}</span> Interactive: Prompt Art Workshop</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Pick a prompt and adjust the guidance strength to see how the AI turns words into art! Watch how different guidance levels change the result.</p>
                <div class="controls" style="margin-bottom:12px;">
                    <div class="control-group" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-secondary btn-small" onclick="Chapter11.selectPrompt(0)" id="promptBtn0">\u{1F305} Sunset</button>
                        <button class="btn-secondary btn-small" onclick="Chapter11.selectPrompt(1)" id="promptBtn1">\u{1F3F0} Castle</button>
                        <button class="btn-secondary btn-small" onclick="Chapter11.selectPrompt(2)" id="promptBtn2">\u{1F916} Robot</button>
                        <button class="btn-secondary btn-small" onclick="Chapter11.selectPrompt(3)" id="promptBtn3">\u{1F33B} Garden</button>
                    </div>
                    <div class="control-group">
                        <label>\u{1F4CF} Guidance Strength: <span id="guidanceLabel">7</span></label>
                        <input type="range" id="guidanceSlider" min="1" max="20" value="7" oninput="Chapter11.setGuidance(parseInt(this.value))">
                    </div>
                </div>
                <div class="network-viz">
                    <canvas id="textToImgCanvas" width="800" height="400"></canvas>
                </div>
                <div id="promptDescription" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Pick a prompt above to start painting!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F6AB}</span> Negative Prompts: What NOT to Draw</h2>
                <p>Here's a cool trick! You can also tell the AI what you do NOT want in the picture. These are called <strong>negative prompts</strong>!</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#10b981;">\u{2705} Positive Prompt</div>
                        <div style="font-size:13px;color:var(--text-secondary);">"A beautiful sunny garden with colorful flowers and butterflies"</div>
                    </div>
                    <div class="feature-card" style="padding:16px;">
                        <div style="font-weight:600;margin-bottom:8px;color:#ef4444;">\u{274C} Negative Prompt</div>
                        <div style="font-size:13px;color:var(--text-secondary);">"ugly, blurry, dark, rainy, dead plants, insects"</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>How it works:</strong> The AI makes two predictions at each denoising step - one guided by your prompt, and one guided by the negative prompt. Then it moves TOWARD the positive and AWAY from the negative! It's like saying "go toward the ice cream shop" AND "walk away from the broccoli stand!"</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F5BC}\u{FE0F}</span> Famous Text-to-Image Models</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F308}</div>
                        <div style="font-weight:600;margin:6px 0;color:#818cf8;">DALL-E</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Made by OpenAI. Named after artist Salvador Dali + the robot WALL-E! Great at creative and unusual images.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F3A8}</div>
                        <div style="font-weight:600;margin:6px 0;color:#10b981;">Stable Diffusion</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Open source! Anyone can use it and improve it. Works on regular computers, not just supercomputers!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{2728}</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">Midjourney</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Known for making SUPER beautiful artistic images. Popular with artists and designers!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> Stable Diffusion Pipeline</h2>
                <div class="code-block"><div class="code-header"><span>Python</span></div><pre><code><span class="comment"># Text-to-Image with Stable Diffusion!</span>
<span class="keyword">from</span> diffusers <span class="keyword">import</span> StableDiffusionPipeline

<span class="comment"># Load the magic artist model</span>
pipe = StableDiffusionPipeline.from_pretrained(
    <span class="string">"stabilityai/stable-diffusion-2"</span>
)

<span class="comment"># Tell it what to paint!</span>
prompt = <span class="string">"a magical castle on a floating island, sunset, fantasy art"</span>

<span class="comment"># Tell it what NOT to paint</span>
negative = <span class="string">"ugly, blurry, dark, scary"</span>

<span class="comment"># Create the image! (guidance_scale = how closely to follow prompt)</span>
image = pipe(
    prompt=prompt,
    negative_prompt=negative,
    guidance_scale=<span class="number">7.5</span>,     <span class="comment"># Medium guidance - nice balance!</span>
    num_inference_steps=<span class="number">50</span>  <span class="comment"># 50 denoising steps</span>
).images[0]

image.save(<span class="string">"my_castle.png"</span>)  <span class="comment"># Save the masterpiece! \u{1F3F0}</span></code></pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AF}</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter11.startQuiz11_2()">Start Quiz \u{2192}</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('11-1')">\u{2190} Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('11-3')">Next: Vision-Language Models \u{2192}</button>
            </div>
        `;

        this.textToImgPromptIdx = -1;
        this.textToImgGuidance = 7;
        this.drawTextToImgCanvas();
    },

    selectPrompt(idx) {
        this.textToImgPromptIdx = idx;
        // Update button styles
        for (let i = 0; i < 4; i++) {
            const btn = document.getElementById('promptBtn' + i);
            if (btn) {
                btn.className = i === idx ? 'btn-primary btn-small' : 'btn-secondary btn-small';
            }
        }
        const desc = document.getElementById('promptDescription');
        const prompts = [
            '"A beautiful sunset over a calm ocean with orange and purple clouds"',
            '"A magical fairy-tale castle on a mountain with towers and flags"',
            '"A friendly robot playing in a park with flowers and butterflies"',
            '"A colorful garden with sunflowers, roses, and a little stone path"'
        ];
        if (desc && prompts[idx]) desc.textContent = 'Prompt: ' + prompts[idx];
        this.drawTextToImgCanvas();
    },

    setGuidance(val) {
        this.textToImgGuidance = val;
        const label = document.getElementById('guidanceLabel');
        if (label) label.textContent = val;
        this.drawTextToImgCanvas();
    },

    drawTextToImgCanvas() {
        const canvas = document.getElementById('textToImgCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        const idx = this.textToImgPromptIdx;
        const guidance = this.textToImgGuidance;
        const gNorm = guidance / 20; // 0 to 1

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 15px Inter';
        ctx.textAlign = 'center';
        const titles = ['Sunset Scene', 'Castle Scene', 'Robot Scene', 'Garden Scene'];
        ctx.fillText(idx >= 0 ? titles[idx] + ' (Guidance: ' + guidance + ')' : 'Pick a prompt to start!', W / 2, 24);

        if (idx < 0) {
            ctx.fillStyle = '#8b95a8';
            ctx.font = '16px Inter';
            ctx.fillText('Select a prompt above to generate art!', W / 2, H / 2);
            return;
        }

        // Draw scene based on prompt and guidance
        // Higher guidance = more saturated, more shapes, more defined
        const satFactor = 0.3 + 0.7 * gNorm;
        const detailCount = Math.floor(3 + 12 * gNorm);

        if (idx === 0) {
            // Sunset scene
            this.drawSunsetScene(ctx, W, H, satFactor, detailCount, gNorm);
        } else if (idx === 1) {
            // Castle scene
            this.drawCastleScene(ctx, W, H, satFactor, detailCount, gNorm);
        } else if (idx === 2) {
            // Robot scene
            this.drawRobotScene(ctx, W, H, satFactor, detailCount, gNorm);
        } else if (idx === 3) {
            // Garden scene
            this.drawGardenScene(ctx, W, H, satFactor, detailCount, gNorm);
        }

        // Low guidance noise overlay
        if (gNorm < 0.4) {
            const noiseAmt = (0.4 - gNorm) / 0.4;
            const imageData = ctx.getImageData(0, 0, W, H);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (Math.random() < noiseAmt * 0.3) {
                    const v = Math.floor(Math.random() * 200);
                    const blend = noiseAmt * 0.4;
                    data[i] = data[i] * (1 - blend) + v * blend;
                    data[i + 1] = data[i + 1] * (1 - blend) + v * blend;
                    data[i + 2] = data[i + 2] * (1 - blend) + v * blend;
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // Guidance label bar
        ctx.fillStyle = gNorm < 0.25 ? '#ef4444' : gNorm < 0.5 ? '#f59e0b' : gNorm < 0.75 ? '#10b981' : '#6366f1';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'right';
        const gLabel = guidance <= 3 ? 'Whisper' : guidance <= 8 ? 'Normal' : guidance <= 14 ? 'Strong' : 'Shouting!';
        ctx.fillText('Guidance: ' + gLabel, W - 20, H - 12);
    },

    drawSunsetScene(ctx, W, H, sat, detail, g) {
        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 40, 0, H * 0.6);
        skyGrad.addColorStop(0, this.lerpColor('#1a0a2e', '#ff6b35', sat));
        skyGrad.addColorStop(0.4, this.lerpColor('#2d1b4e', '#ff8c42', sat));
        skyGrad.addColorStop(0.7, this.lerpColor('#4a2c6e', '#ffa62b', sat));
        skyGrad.addColorStop(1, this.lerpColor('#6b3a8e', '#ffd166', sat));
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 40, W, H * 0.6 - 40);

        // Sun
        const sunR = 30 + 20 * g;
        ctx.fillStyle = this.lerpColor('#aa8844', '#ffd700', sat);
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.35, sunR, 0, Math.PI * 2);
        ctx.fill();
        // Sun glow
        const sunGlow = ctx.createRadialGradient(W / 2, H * 0.35, sunR, W / 2, H * 0.35, sunR * 3);
        sunGlow.addColorStop(0, 'rgba(255,215,0,' + (0.3 * sat) + ')');
        sunGlow.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.35, sunR * 3, 0, Math.PI * 2);
        ctx.fill();

        // Ocean
        const oceanGrad = ctx.createLinearGradient(0, H * 0.6, 0, H - 30);
        oceanGrad.addColorStop(0, this.lerpColor('#1a2a4a', '#1e6091', sat));
        oceanGrad.addColorStop(1, this.lerpColor('#0d1220', '#14213d', sat));
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, H * 0.6, W, H * 0.4 - 30);

        // Sun reflection on water
        ctx.fillStyle = 'rgba(255, 200, 50, ' + (0.15 * sat) + ')';
        for (let i = 0; i < detail; i++) {
            const rx = W / 2 + (Math.random() - 0.5) * 100;
            const ry = H * 0.62 + Math.random() * (H * 0.3);
            ctx.fillRect(rx, ry, 20 + Math.random() * 30, 2);
        }

        // Clouds
        ctx.fillStyle = 'rgba(255, 180, 100, ' + (0.3 * sat) + ')';
        for (let i = 0; i < Math.floor(detail / 2); i++) {
            const cx = 80 + (i / detail) * (W - 160);
            const cy = 60 + Math.random() * 60;
            this.drawCloud(ctx, cx, cy, 30 + Math.random() * 30);
        }
    },

    drawCastleScene(ctx, W, H, sat, detail, g) {
        // Sky
        const skyGrad = ctx.createLinearGradient(0, 40, 0, H * 0.55);
        skyGrad.addColorStop(0, this.lerpColor('#1a1a3e', '#4a3f8a', sat));
        skyGrad.addColorStop(1, this.lerpColor('#2d2b5e', '#7c6ccc', sat));
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 40, W, H * 0.55 - 40);

        // Stars if high guidance
        ctx.fillStyle = 'rgba(255,255,255,' + (0.4 * sat) + ')';
        for (let i = 0; i < detail; i++) {
            const sx = Math.random() * W;
            const sy = 45 + Math.random() * (H * 0.35);
            ctx.beginPath();
            ctx.arc(sx, sy, 1 + Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }

        // Mountain
        ctx.fillStyle = this.lerpColor('#2a2a4a', '#5a4a8a', sat);
        ctx.beginPath();
        ctx.moveTo(0, H * 0.55);
        ctx.lineTo(W * 0.25, H * 0.3);
        ctx.lineTo(W * 0.5, H * 0.2);
        ctx.lineTo(W * 0.75, H * 0.3);
        ctx.lineTo(W, H * 0.55);
        ctx.closePath();
        ctx.fill();

        // Castle body
        const castleX = W * 0.35;
        const castleW = W * 0.3;
        const castleH = H * 0.3 * (0.6 + 0.4 * g);
        const castleY = H * 0.22 - castleH * 0.3;
        ctx.fillStyle = this.lerpColor('#4a4a6a', '#8a7ab0', sat);
        ctx.fillRect(castleX, castleY, castleW, castleH);

        // Towers
        const towerW = castleW * 0.15;
        ctx.fillRect(castleX - towerW / 2, castleY - castleH * 0.3, towerW, castleH * 0.3 + castleH);
        ctx.fillRect(castleX + castleW - towerW / 2, castleY - castleH * 0.3, towerW, castleH * 0.3 + castleH);

        // Tower tops (triangle)
        ctx.fillStyle = this.lerpColor('#6a4a5a', '#cc6677', sat);
        [castleX, castleX + castleW].forEach(tx => {
            ctx.beginPath();
            ctx.moveTo(tx - towerW / 2, castleY - castleH * 0.3);
            ctx.lineTo(tx + towerW / 2, castleY - castleH * 0.3);
            ctx.lineTo(tx, castleY - castleH * 0.5);
            ctx.closePath();
            ctx.fill();
        });

        // Windows
        if (g > 0.3) {
            ctx.fillStyle = this.lerpColor('#aaaacc', '#ffd700', sat);
            const winCount = Math.floor(2 + detail / 3);
            for (let i = 0; i < winCount; i++) {
                const wx = castleX + 20 + (i / winCount) * (castleW - 40);
                const wy = castleY + castleH * 0.3;
                ctx.fillRect(wx, wy, 8, 12);
            }
        }

        // Ground
        ctx.fillStyle = this.lerpColor('#1a2a1a', '#2d5a3d', sat);
        ctx.fillRect(0, H * 0.55, W, H * 0.45 - 30);

        // Flags on towers if high guidance
        if (g > 0.5) {
            ctx.fillStyle = this.lerpColor('#884444', '#ff4466', sat);
            [castleX, castleX + castleW].forEach(tx => {
                ctx.fillRect(tx - 1, castleY - castleH * 0.55, 2, 15);
                ctx.beginPath();
                ctx.moveTo(tx + 1, castleY - castleH * 0.55);
                ctx.lineTo(tx + 14, castleY - castleH * 0.50);
                ctx.lineTo(tx + 1, castleY - castleH * 0.45);
                ctx.closePath();
                ctx.fill();
            });
        }
    },

    drawRobotScene(ctx, W, H, sat, detail, g) {
        // Sky / park background
        const skyGrad = ctx.createLinearGradient(0, 40, 0, H * 0.55);
        skyGrad.addColorStop(0, this.lerpColor('#1a2a3e', '#4a90d9', sat));
        skyGrad.addColorStop(1, this.lerpColor('#2a3a4e', '#87ceeb', sat));
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 40, W, H * 0.55 - 40);

        // Grass
        ctx.fillStyle = this.lerpColor('#1a3a1a', '#3cb371', sat);
        ctx.fillRect(0, H * 0.55, W, H * 0.45 - 30);

        // Robot body
        const rx = W / 2, ry = H * 0.42;
        const bodyW = 80 + 20 * g, bodyH = 90 + 20 * g;
        ctx.fillStyle = this.lerpColor('#5a5a7a', '#a0a0d0', sat);
        ctx.beginPath();
        ctx.roundRect(rx - bodyW / 2, ry - bodyH / 2, bodyW, bodyH, 12);
        ctx.fill();

        // Robot head
        const headW = bodyW * 0.7, headH = bodyH * 0.5;
        ctx.fillStyle = this.lerpColor('#6a6a8a', '#b0b0e0', sat);
        ctx.beginPath();
        ctx.roundRect(rx - headW / 2, ry - bodyH / 2 - headH - 5, headW, headH, 10);
        ctx.fill();

        // Eyes
        ctx.fillStyle = this.lerpColor('#44aa44', '#00ff88', sat);
        ctx.beginPath();
        ctx.arc(rx - headW * 0.2, ry - bodyH / 2 - headH * 0.5, 8 * g + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rx + headW * 0.2, ry - bodyH / 2 - headH * 0.5, 8 * g + 4, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        if (g > 0.3) {
            ctx.strokeStyle = this.lerpColor('#44aa44', '#00ff88', sat);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(rx, ry - bodyH / 2 - headH * 0.25, 12, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
        }

        // Antenna
        ctx.strokeStyle = this.lerpColor('#6a6a8a', '#b0b0e0', sat);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rx, ry - bodyH / 2 - headH - 5);
        ctx.lineTo(rx, ry - bodyH / 2 - headH - 25);
        ctx.stroke();
        ctx.fillStyle = this.lerpColor('#aa4444', '#ff4444', sat);
        ctx.beginPath();
        ctx.arc(rx, ry - bodyH / 2 - headH - 28, 5, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.strokeStyle = this.lerpColor('#5a5a7a', '#a0a0d0', sat);
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(rx - bodyW / 2, ry - 10);
        ctx.lineTo(rx - bodyW / 2 - 30, ry + 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rx + bodyW / 2, ry - 10);
        ctx.lineTo(rx + bodyW / 2 + 30, ry - 30);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(rx - 15, ry + bodyH / 2);
        ctx.lineTo(rx - 15, ry + bodyH / 2 + 35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rx + 15, ry + bodyH / 2);
        ctx.lineTo(rx + 15, ry + bodyH / 2 + 35);
        ctx.stroke();

        // Flowers in park
        const flowerColors = ['#ff6b8a', '#ffd700', '#ff69b4', '#ff4500', '#da70d6'];
        for (let i = 0; i < detail; i++) {
            const fx = 50 + Math.random() * (W - 100);
            const fy = H * 0.6 + Math.random() * (H * 0.25);
            if (Math.abs(fx - rx) < bodyW) continue;
            ctx.fillStyle = flowerColors[i % flowerColors.length];
            ctx.globalAlpha = sat;
            this.drawFlower(ctx, fx, fy, 6 + Math.random() * 6);
            ctx.globalAlpha = 1;
        }

        // Butterflies if high guidance
        if (g > 0.5) {
            for (let i = 0; i < Math.floor(detail / 3); i++) {
                const bx = 100 + Math.random() * (W - 200);
                const by = 80 + Math.random() * (H * 0.4);
                ctx.fillStyle = this.lerpColor('#8844aa', '#ff88ff', sat);
                ctx.beginPath();
                ctx.ellipse(bx - 5, by, 6, 4, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(bx + 5, by, 6, 4, 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    drawGardenScene(ctx, W, H, sat, detail, g) {
        // Sky
        const skyGrad = ctx.createLinearGradient(0, 40, 0, H * 0.45);
        skyGrad.addColorStop(0, this.lerpColor('#1a2a3e', '#5ab0f0', sat));
        skyGrad.addColorStop(1, this.lerpColor('#2a3a4e', '#a0d8f0', sat));
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 40, W, H * 0.45 - 40);

        // Grass
        ctx.fillStyle = this.lerpColor('#1a3a1a', '#3cb371', sat);
        ctx.fillRect(0, H * 0.45, W, H * 0.55 - 30);

        // Stone path
        ctx.fillStyle = this.lerpColor('#4a4a4a', '#a0a0a0', sat);
        for (let i = 0; i < 8; i++) {
            const px = W * 0.45 + (Math.random() - 0.5) * 20;
            const py = H * 0.5 + i * 35;
            ctx.beginPath();
            ctx.ellipse(px, py, 18 + Math.random() * 8, 10 + Math.random() * 4, Math.random() * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sunflowers (left side)
        for (let i = 0; i < Math.floor(detail / 2); i++) {
            const fx = 40 + Math.random() * (W * 0.35);
            const fy = H * 0.42 + Math.random() * (H * 0.3);
            // Stem
            ctx.strokeStyle = this.lerpColor('#2a5a2a', '#228B22', sat);
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx, fy + 30 + Math.random() * 20);
            ctx.stroke();
            // Sunflower head
            const petalR = 8 + 4 * g;
            ctx.fillStyle = this.lerpColor('#aa8800', '#ffd700', sat);
            for (let p = 0; p < 8; p++) {
                const angle = (p / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.ellipse(fx + Math.cos(angle) * petalR * 0.7, fy + Math.sin(angle) * petalR * 0.7, petalR * 0.5, petalR * 0.25, angle, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = this.lerpColor('#5a3a00', '#8B4513', sat);
            ctx.beginPath();
            ctx.arc(fx, fy, petalR * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }

        // Roses (right side)
        const roseColors = ['#ff4466', '#ff6688', '#cc3355', '#ff2244'];
        for (let i = 0; i < Math.floor(detail / 2); i++) {
            const fx = W * 0.6 + Math.random() * (W * 0.35);
            const fy = H * 0.45 + Math.random() * (H * 0.3);
            ctx.fillStyle = this.lerpColor('#882244', roseColors[i % roseColors.length], sat);
            this.drawFlower(ctx, fx, fy, 7 + 4 * g);
        }

        // Clouds
        ctx.fillStyle = 'rgba(255,255,255,' + (0.4 * sat) + ')';
        for (let i = 0; i < Math.floor(detail / 4); i++) {
            this.drawCloud(ctx, 80 + Math.random() * (W - 160), 55 + Math.random() * 40, 25 + Math.random() * 20);
        }

        // Fence if high guidance
        if (g > 0.4) {
            ctx.strokeStyle = this.lerpColor('#5a4a3a', '#8B7355', sat);
            ctx.lineWidth = 2;
            const fenceY = H * 0.44;
            ctx.beginPath();
            ctx.moveTo(0, fenceY);
            ctx.lineTo(W, fenceY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, fenceY + 15);
            ctx.lineTo(W, fenceY + 15);
            ctx.stroke();
            for (let i = 0; i < W; i += 30) {
                ctx.beginPath();
                ctx.moveTo(i, fenceY - 8);
                ctx.lineTo(i, fenceY + 22);
                ctx.stroke();
            }
        }
    },

    drawFlower(ctx, x, y, r) {
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(x + Math.cos(angle) * r * 0.5, y + Math.sin(angle) * r * 0.5, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
    },

    drawCloud(ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.arc(x + r * 0.8, y - r * 0.2, r * 0.7, 0, Math.PI * 2);
        ctx.arc(x - r * 0.6, y + r * 0.1, r * 0.6, 0, Math.PI * 2);
        ctx.arc(x + r * 0.3, y + r * 0.2, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
    },

    lerpColor(c1, c2, t) {
        const hex = s => parseInt(s, 16);
        const r1 = hex(c1.slice(1, 3)), g1 = hex(c1.slice(3, 5)), b1 = hex(c1.slice(5, 7));
        const r2 = hex(c2.slice(1, 3)), g2 = hex(c2.slice(3, 5)), b2 = hex(c2.slice(5, 7));
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
    },

    startQuiz11_2() {
        Quiz.start({
            title: 'Chapter 11.2: Text-to-Image',
            chapterId: '11-2',
            questions: [
                {
                    question: 'How do text-to-image models create pictures from words?',
                    options: ['They search the internet for existing photos', 'They use words to guide the denoising process, steering noise into a matching picture', 'They take a screenshot of a video', 'They use a camera to take a photo'],
                    correct: 1,
                    explanation: 'Text-to-image models convert your words into a guide signal that steers the denoising process at each step, making the random noise turn into a picture that matches your description!'
                },
                {
                    question: 'What does "guidance strength" control?',
                    options: ['How big the picture is', 'How closely the image follows your text description', 'How long it takes to generate', 'The color of the background'],
                    correct: 1,
                    explanation: 'Guidance strength controls how strongly the AI follows your text prompt. Low guidance = more creative but less matching. High guidance = closely follows your description!'
                },
                {
                    question: 'What is a "negative prompt"?',
                    options: ['A sad message you type', 'Words telling the AI what NOT to include in the picture', 'A prompt that makes ugly pictures', 'A prompt typed backwards'],
                    correct: 1,
                    explanation: 'A negative prompt tells the AI what you do NOT want in the picture. The AI moves away from the negative prompt while moving toward the positive prompt!'
                },
                {
                    question: 'Which of these is an open-source text-to-image model?',
                    options: ['DALL-E', 'Stable Diffusion', 'Midjourney', 'Photoshop'],
                    correct: 1,
                    explanation: 'Stable Diffusion is open source, meaning anyone can download it, use it, and even improve it! It can even run on regular home computers.'
                },
                {
                    question: 'What happens if you set guidance strength TOO high?',
                    options: ['The image disappears', 'The image closely matches the prompt but might look too intense or oversaturated', 'The computer catches fire', 'Nothing changes at all'],
                    correct: 1,
                    explanation: 'Very high guidance makes the AI follow your words VERY intensely, which can lead to oversaturated, oversharpened images. A medium value (around 7-8) usually gives the best balance!'
                }
            ]
        });
    },

    // ============================================
    // 11.3: Vision-Language Models (CLIP, GPT-4V)
    // ============================================
    loadChapter11_3() {
        const container = document.getElementById('chapter-11-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 11 &bull; Chapter 11.3</span>
                <h1>Vision-Language Models: AI That Sees AND Reads!</h1>
                <p>What if an AI could look at a picture AND understand words at the same time? Meet the models that bridge the gap between seeing and reading!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4D8}</span> What Is a Vision-Language Model?</h2>
                <p>A <strong>vision-language model</strong> learns a shared representation for images and text so it can match them, describe them, or answer questions about them together.</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F9EA}</span> One Worked Example</h2>
                <p>Given a photo of a dog catching a frisbee and the question <strong>"What is the animal doing?"</strong>,
                   the model combines visual features with the question text and can answer <strong>"The dog is jumping to catch a frisbee."</strong></p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F440}</span> Two Superpowers Combined</h2>
                <p>Until now, most AIs were specialists - some were great at reading text, others at looking at images. But <strong>Vision-Language Models</strong> can do BOTH at the same time!</p>
                <p>Imagine you have a friend who is blind but amazing at reading, and another friend who can see perfectly but can't read. Vision-Language Models are like a superhero who has BOTH powers!</p>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Key idea:</strong> These models learn to understand that the WORD "cat" and a PICTURE of a cat mean the same thing! They build a shared "understanding space" where images and text live together.</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CE}</span> CLIP: The Matching Master</h2>
                <p><strong>CLIP</strong> (Contrastive Language-Image Pre-training) is like a kid who learned by looking at millions of pictures with captions. It learned that:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F431}</div>
                        <div style="font-weight:600;margin:6px 0;">Image Encoder</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Looks at a picture and turns it into a list of numbers (like a secret code for images)</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4DD}</div>
                        <div style="font-weight:600;margin:6px 0;">Text Encoder</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Reads text and turns it into a list of numbers (like a secret code for words)</div>
                    </div>
                </div>
                <p>When the image and text describe the SAME thing, their secret codes become very similar! When they're different, the codes are far apart. It's like a matching game!</p>
                <div class="info-box success">
                    <span class="info-box-icon">\u{2B50}</span>
                    <span class="info-box-text"><strong>Fun fact:</strong> CLIP was trained on 400 million image-text pairs from the internet! That's like looking at 400 million pictures with their captions. No wonder it's so good at matching!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AE}</span> Interactive: Image-Text Matching Game</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Play a matching game just like CLIP! Click on an image, then click on its matching text label. Try to match all 4 pairs! The heatmap on the right shows how similar each image-text pair is.</p>
                <div class="network-viz">
                    <canvas id="clipCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls" style="margin-top:8px;">
                    <button class="btn-secondary btn-small" onclick="Chapter11.resetClipGame()">\u{1F504} Reset Game</button>
                </div>
                <div id="clipGameStatus" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);">
                    Click on an image on the left, then click on its matching label on the right!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F916}</span> GPT-4V: The AI That Answers Questions About Pictures</h2>
                <p>While CLIP is great at matching, <strong>GPT-4V</strong> (GPT-4 with Vision) can do even more - it can answer QUESTIONS about pictures!</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{2753}</div>
                        <div style="font-weight:600;margin:6px 0;">Ask Anything</div>
                        <div style="font-size:12px;color:var(--text-secondary);">"What's happening in this picture?" - It can describe scenes in detail!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F9EE}</div>
                        <div style="font-weight:600;margin:6px 0;">Count & Reason</div>
                        <div style="font-size:12px;color:var(--text-secondary);">"How many dogs are in this photo?" - It can count objects and think about them!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\u{1F4D6}</div>
                        <div style="font-weight:600;margin:6px 0;">Read Text in Images</div>
                        <div style="font-size:12px;color:var(--text-secondary);">"What does the sign say?" - It can read text inside photos!</div>
                    </div>
                </div>
                <div class="info-box">
                    <span class="info-box-icon">\u{1F4A1}</span>
                    <span class="info-box-text"><strong>Visual Question Answering (VQA)</strong> is when you show the AI a picture and ask it a question. The AI needs to BOTH understand the picture AND understand your question to give a good answer. It's like a quiz about pictures!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4BB}</span> Using CLIP in Code</h2>
                <div class="code-block"><div class="code-header"><span>Python</span></div><pre><code><span class="comment"># CLIP: Match images with text descriptions!</span>
<span class="keyword">import</span> clip
<span class="keyword">import</span> torch
<span class="keyword">from</span> PIL <span class="keyword">import</span> Image

<span class="comment"># Load CLIP - the matching master!</span>
model, preprocess = clip.load(<span class="string">"ViT-B/32"</span>)

<span class="comment"># Prepare an image</span>
image = preprocess(Image.open(<span class="string">"photo.jpg"</span>))

<span class="comment"># Prepare some text descriptions to match against</span>
texts = clip.tokenize([
    <span class="string">"a photo of a cat"</span>,
    <span class="string">"a photo of a dog"</span>,
    <span class="string">"a photo of a car"</span>,
    <span class="string">"a photo of a tree"</span>
])

<span class="comment"># Get similarity scores - which text matches best?</span>
<span class="keyword">with</span> torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(texts)
    similarity = (image_features @ text_features.T)

<span class="comment"># The highest score wins the matching game!</span>
best_match = similarity.argmax()
<span class="keyword">print</span>(<span class="string">f"Best match: {texts[best_match]}"</span>)  <span class="comment"># \u{1F3AF}</span></code></pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F4CB}</span> Chapter Summary</h2>
                <div style="display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0;">
                    <div class="info-box" style="border-left-color:#6366f1;">
                        <span class="info-box-icon">1\u{FE0F}\u{20E3}</span>
                        <span class="info-box-text"><strong>Vision-Language Models</strong> combine image understanding and text understanding into one AI that can do both!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#10b981;">
                        <span class="info-box-icon">2\u{FE0F}\u{20E3}</span>
                        <span class="info-box-text"><strong>CLIP</strong> learns to match images with text by training on 400 million image-caption pairs from the internet.</span>
                    </div>
                    <div class="info-box" style="border-left-color:#a855f7;">
                        <span class="info-box-icon">3\u{FE0F}\u{20E3}</span>
                        <span class="info-box-text"><strong>Shared Space:</strong> Both images and text are converted to "secret codes" (vectors). Similar things get similar codes!</span>
                    </div>
                    <div class="info-box" style="border-left-color:#f59e0b;">
                        <span class="info-box-icon">4\u{FE0F}\u{20E3}</span>
                        <span class="info-box-text"><strong>GPT-4V</strong> goes further - it can answer questions about images, count objects, read text in photos, and describe scenes!</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u{1F3AF}</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter11.startQuiz11_3()">Start Quiz \u{2192}</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('11-2')">\u{2190} Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('11-4')">Next: Video Generation \u{2192}</button>
            </div>
        `;

        this.clipMatched = [];
        this.clipFirstPick = -1;
        this.clipPickType = null;
        this.setupClipCanvas();
        this.drawClipCanvas();
    },

    setupClipCanvas() {
        const canvas = document.getElementById('clipCanvas');
        if (!canvas) return;

        // Precompute similarity scores (like CLIP would produce)
        // Rows: images (sun, cat, car, tree), Cols: texts (sun, cat, car, tree)
        this.clipMatchScore = [
            [0.95, 0.08, 0.12, 0.15],  // sun image
            [0.10, 0.93, 0.07, 0.11],  // cat image
            [0.14, 0.05, 0.96, 0.09],  // car image
            [0.18, 0.12, 0.06, 0.94],  // tree image
        ];

        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            this.handleClipClick(mx, my);
        };
    },

    handleClipClick(mx, my) {
        // Image positions (left column): 4 images stacked vertically
        const imgStartY = 60;
        const imgSpacing = 80;
        const imgX = 60;
        const imgR = 30;

        // Text positions (middle column)
        const txtX = 320;
        const txtStartY = 60;
        const txtSpacing = 80;
        const txtW = 160;
        const txtH = 40;

        // Check if clicked on an image
        for (let i = 0; i < 4; i++) {
            if (this.clipMatched.includes(i)) continue;
            const iy = imgStartY + i * imgSpacing;
            const dist = Math.sqrt((mx - imgX) ** 2 + (my - iy) ** 2);
            if (dist < imgR + 5) {
                if (this.clipPickType === 'text') {
                    // We already picked a text, now match with image
                    this.tryClipMatch(i, this.clipFirstPick);
                } else {
                    this.clipFirstPick = i;
                    this.clipPickType = 'image';
                    this.drawClipCanvas();
                    const status = document.getElementById('clipGameStatus');
                    const labels = ['Sun', 'Cat', 'Car', 'Tree'];
                    if (status) status.textContent = 'Selected image: ' + labels[i] + '. Now click on its matching text label!';
                }
                return;
            }
        }

        // Check if clicked on a text label
        for (let i = 0; i < 4; i++) {
            if (this.clipMatched.includes(i)) continue;
            const ty = txtStartY + i * txtSpacing;
            if (mx >= txtX - txtW / 2 && mx <= txtX + txtW / 2 && my >= ty - txtH / 2 && my <= ty + txtH / 2) {
                if (this.clipPickType === 'image') {
                    // We already picked an image, now match with text
                    this.tryClipMatch(this.clipFirstPick, i);
                } else {
                    this.clipFirstPick = i;
                    this.clipPickType = 'text';
                    this.drawClipCanvas();
                    const status = document.getElementById('clipGameStatus');
                    const labels = ['A bright sun', 'A cute cat', 'A red car', 'A green tree'];
                    if (status) status.textContent = 'Selected text: "' + labels[i] + '". Now click on its matching image!';
                }
                return;
            }
        }
    },

    tryClipMatch(imgIdx, txtIdx) {
        const status = document.getElementById('clipGameStatus');
        if (imgIdx === txtIdx) {
            // Correct match!
            this.clipMatched.push(imgIdx);
            this.clipFirstPick = -1;
            this.clipPickType = null;
            if (this.clipMatched.length === 4) {
                if (status) status.textContent = 'Amazing! You matched all 4 pairs! You think just like CLIP! The heatmap shows the similarity scores.';
            } else {
                if (status) status.textContent = 'Correct match! CLIP score: ' + (this.clipMatchScore[imgIdx][txtIdx] * 100).toFixed(0) + '% similarity! Keep going!';
            }
        } else {
            this.clipFirstPick = -1;
            this.clipPickType = null;
            if (status) status.textContent = 'Not quite! CLIP score for that pair: ' + (this.clipMatchScore[imgIdx][txtIdx] * 100).toFixed(0) + '% (too low). Try again!';
        }
        this.drawClipCanvas();
    },

    resetClipGame() {
        this.clipMatched = [];
        this.clipFirstPick = -1;
        this.clipPickType = null;
        const status = document.getElementById('clipGameStatus');
        if (status) status.textContent = 'Click on an image on the left, then click on its matching label on the right!';
        this.drawClipCanvas();
    },

    drawClipCanvas() {
        const canvas = document.getElementById('clipCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, W, H);

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 15px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('CLIP Image-Text Matching Game', W / 2, 24);

        const imgLabels = ['Sun', 'Cat', 'Car', 'Tree'];
        const txtLabels = ['A bright sun', 'A cute cat', 'A red car', 'A green tree'];
        const imgColors = ['#ffd700', '#ff8c42', '#ef4444', '#10b981'];

        const imgX = 60;
        const txtX = 320;
        const heatX = 530;
        const startY = 70;
        const spacing = 80;
        const imgR = 28;

        // Column headers
        ctx.fillStyle = '#8b95a8';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('IMAGES', imgX, 46);
        ctx.fillText('TEXT LABELS', txtX, 46);
        ctx.fillText('SIMILARITY HEATMAP', heatX + 55, 46);

        // Draw images
        for (let i = 0; i < 4; i++) {
            const y = startY + i * spacing;
            const matched = this.clipMatched.includes(i);
            const selected = this.clipPickType === 'image' && this.clipFirstPick === i;

            // Selection highlight
            if (selected) {
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(imgX, y, imgR + 6, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Matched glow
            if (matched) {
                ctx.fillStyle = 'rgba(16,185,129,0.15)';
                ctx.beginPath();
                ctx.arc(imgX, y, imgR + 8, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw the image icon
            ctx.fillStyle = matched ? 'rgba(16,185,129,0.3)' : '#1e293b';
            ctx.beginPath();
            ctx.arc(imgX, y, imgR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = imgColors[i];
            if (i === 0) {
                // Sun
                ctx.beginPath();
                ctx.arc(imgX, y, 14, 0, Math.PI * 2);
                ctx.fill();
                for (let r = 0; r < 8; r++) {
                    const angle = (r / 8) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(imgX + Math.cos(angle) * 16, y + Math.sin(angle) * 16);
                    ctx.lineTo(imgX + Math.cos(angle) * 22, y + Math.sin(angle) * 22);
                    ctx.strokeStyle = imgColors[i];
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            } else if (i === 1) {
                // Cat face
                ctx.beginPath();
                ctx.arc(imgX, y + 3, 12, 0, Math.PI * 2);
                ctx.fill();
                // Ears
                ctx.beginPath();
                ctx.moveTo(imgX - 10, y - 5);
                ctx.lineTo(imgX - 6, y - 16);
                ctx.lineTo(imgX - 2, y - 5);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(imgX + 2, y - 5);
                ctx.lineTo(imgX + 6, y - 16);
                ctx.lineTo(imgX + 10, y - 5);
                ctx.fill();
                // Eyes
                ctx.fillStyle = '#1a1a2e';
                ctx.beginPath();
                ctx.arc(imgX - 5, y + 1, 2, 0, Math.PI * 2);
                ctx.arc(imgX + 5, y + 1, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (i === 2) {
                // Car
                ctx.fillRect(imgX - 16, y - 4, 32, 14);
                ctx.fillRect(imgX - 10, y - 12, 20, 10);
                ctx.fillStyle = '#1a1a2e';
                ctx.beginPath();
                ctx.arc(imgX - 8, y + 12, 4, 0, Math.PI * 2);
                ctx.arc(imgX + 8, y + 12, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (i === 3) {
                // Tree
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(imgX - 3, y + 2, 6, 16);
                ctx.fillStyle = imgColors[i];
                ctx.beginPath();
                ctx.arc(imgX, y - 6, 16, 0, Math.PI * 2);
                ctx.fill();
            }

            // Image label
            ctx.fillStyle = matched ? '#10b981' : '#e8eaf0';
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(imgLabels[i], imgX + imgR + 10, y + 4);
        }

        // Draw text labels
        for (let i = 0; i < 4; i++) {
            const y = startY + i * spacing;
            const matched = this.clipMatched.includes(i);
            const selected = this.clipPickType === 'text' && this.clipFirstPick === i;

            const boxW = 150, boxH = 36;

            // Selection highlight
            if (selected) {
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(txtX - boxW / 2 - 4, y - boxH / 2 - 4, boxW + 8, boxH + 8, 10);
                ctx.stroke();
            }

            // Matched glow
            if (matched) {
                ctx.fillStyle = 'rgba(16,185,129,0.15)';
                ctx.beginPath();
                ctx.roundRect(txtX - boxW / 2 - 4, y - boxH / 2 - 4, boxW + 8, boxH + 8, 10);
                ctx.fill();
            }

            ctx.fillStyle = matched ? 'rgba(16,185,129,0.2)' : '#1e293b';
            ctx.beginPath();
            ctx.roundRect(txtX - boxW / 2, y - boxH / 2, boxW, boxH, 8);
            ctx.fill();
            ctx.strokeStyle = matched ? '#10b981' : '#334155';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(txtX - boxW / 2, y - boxH / 2, boxW, boxH, 8);
            ctx.stroke();

            ctx.fillStyle = matched ? '#10b981' : '#e8eaf0';
            ctx.font = '13px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('"' + txtLabels[i] + '"', txtX, y + 5);
        }

        // Draw match lines for matched pairs
        this.clipMatched.forEach(idx => {
            const iy = startY + idx * spacing;
            const ty = startY + idx * spacing;
            ctx.strokeStyle = 'rgba(16,185,129,0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(imgX + imgR + 50, iy);
            ctx.lineTo(txtX - 80, ty);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Draw heatmap
        const cellSize = 55;
        const heatStartY = startY - 20;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const score = this.clipMatchScore[r][c];
                const x = heatX + c * cellSize;
                const y = heatStartY + r * cellSize;

                // Color based on score
                const red = Math.round(255 * (1 - score));
                const green = Math.round(255 * score);
                ctx.fillStyle = `rgba(${red}, ${green}, 80, 0.7)`;
                ctx.beginPath();
                ctx.roundRect(x, y, cellSize - 4, cellSize - 4, 4);
                ctx.fill();

                // Score text
                ctx.fillStyle = score > 0.5 ? '#ffffff' : '#cccccc';
                ctx.font = 'bold 13px Inter';
                ctx.textAlign = 'center';
                ctx.fillText((score * 100).toFixed(0) + '%', x + cellSize / 2 - 2, y + cellSize / 2 + 1);
            }
        }

        // Heatmap row labels (images)
        ctx.fillStyle = '#8b95a8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        for (let r = 0; r < 4; r++) {
            ctx.fillText(imgLabels[r], heatX - 6, heatStartY + r * cellSize + cellSize / 2 + 1);
        }

        // Heatmap column labels (texts)
        ctx.textAlign = 'center';
        for (let c = 0; c < 4; c++) {
            ctx.fillText(txtLabels[c].split(' ').pop(), heatX + c * cellSize + cellSize / 2 - 2, heatStartY + 4 * cellSize + 14);
        }

        // Legend
        ctx.fillStyle = '#8b95a8';
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('High = good match', heatX, H - 20);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(heatX + 120, H - 28, 12, 12);
        ctx.fillStyle = '#8b95a8';
        ctx.fillText('Low = bad match', heatX + 140, H - 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(heatX + 250, H - 28, 12, 12);
    },

    startQuiz11_3() {
        Quiz.start({
            title: 'Chapter 11.3: Vision-Language Models',
            chapterId: '11-3',
            questions: [
                {
                    question: 'What special ability do Vision-Language Models have?',
                    options: ['They can only read text really fast', 'They can understand both images AND text at the same time', 'They can only recognize faces', 'They can only draw pictures'],
                    correct: 1,
                    explanation: 'Vision-Language Models combine image understanding and text understanding into one model, so they can see AND read at the same time!'
                },
                {
                    question: 'How does CLIP match images with text?',
                    options: ['It searches Google for matching images', 'It converts both images and text into similar number codes in a shared space', 'It asks a human to match them', 'It uses color matching only'],
                    correct: 1,
                    explanation: 'CLIP converts both images and text into vectors (number codes). When an image and text describe the same thing, their vectors end up very close together in the shared space!'
                },
                {
                    question: 'How many image-text pairs was CLIP trained on?',
                    options: ['100 pairs', '10,000 pairs', '1 million pairs', '400 million pairs'],
                    correct: 3,
                    explanation: 'CLIP was trained on a massive 400 million image-text pairs from the internet! That huge amount of data is what makes it so good at matching images with descriptions.'
                },
                {
                    question: 'What is Visual Question Answering (VQA)?',
                    options: ['A quiz about video games', 'Showing AI a picture and asking it questions about what it sees', 'Teaching AI to draw answers', 'A type of TV show'],
                    correct: 1,
                    explanation: 'VQA is when you show an AI a picture and ask questions about it. The AI needs to understand both the image and the question to give a good answer!'
                },
                {
                    question: 'What can GPT-4V do that basic CLIP cannot?',
                    options: ['See in color', 'Answer detailed questions about images and describe scenes', 'Run faster', 'Work without electricity'],
                    correct: 1,
                    explanation: 'While CLIP is great at matching images with text descriptions, GPT-4V can have full conversations about images - answering questions, describing scenes in detail, counting objects, and reading text within images!'
                }
            ]
        });
    },

    // ============================================
    // 11.4: Text-to-Video & Audio Generation
    // ============================================
    loadChapter11_4() {
        const container = document.getElementById('chapter-11-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 11 &bull; Chapter 11.4</span>
                <h1>\uD83C\uDFAC Text-to-Video & Audio Generation</h1>
                <p>What if you could type a sentence and a computer would make a whole MOVIE or even MUSIC from it? Let's learn how AI creates videos and sounds from words!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAC</span> Making Movies from Words!</h2>
                <p>You already know AI can make pictures from words (like DALL-E!). But what if we want a whole <strong>movie</strong>? A video is just a bunch of pictures shown really fast \u2014 like a <strong>flipbook!</strong></p>
                <p>When you draw a flipbook, each page needs to connect smoothly to the next one. If page 1 shows a ball on the left and page 2 shows it on the right, it looks like it jumped! But if each page moves the ball just a teeny bit, it looks like smooth motion.</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Temporal Consistency</strong> is the fancy name for making sure video frames connect smoothly. "Temporal" means "related to time." It's like making sure your flipbook pages flow together so the animation looks real and not jerky!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDDBC\uFE0F</span> How Video Generation Works</h2>
                <p>Making a video from text takes a few clever steps:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCDD</div>
                        <div style="font-weight:600;margin:6px 0;">Step 1: Understand</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The AI reads your text and figures out what scenes, objects, and actions you want.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFA8</div>
                        <div style="font-weight:600;margin:6px 0;">Step 2: Keyframes</div>
                        <div style="font-size:12px;color:var(--text-secondary);">It creates important "keyframe" pictures \u2014 the big moments in the story, like scene changes.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFAC</div>
                        <div style="font-weight:600;margin:6px 0;">Step 3: Fill In</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Then it fills in all the frames BETWEEN the keyframes so everything moves smoothly!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAC</span> Storyboard Builder</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Click each scene box to change its setting! Then press <strong>Play</strong> to watch the AI smoothly transition between your chosen scenes!</p>
                <div class="network-viz">
                    <canvas id="videoCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <button class="btn-primary btn-small" onclick="Chapter11.playVideoStoryboard()">\u25B6 Play Transitions</button>
                    <button class="btn-secondary btn-small" onclick="Chapter11.resetVideoStoryboard()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD0A</span> Text-to-Speech: Words Become Voice!</h2>
                <p><strong>Text-to-speech (TTS)</strong> is when the AI reads text out loud, like a super smart robot narrator! Here's how it works:</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCDD\u2192\uD83C\uDFB5</div>
                        <div style="font-weight:600;margin:6px 0;">Text \u2192 Sound Waves</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The AI learns how letters and words should SOUND, then creates audio waves that match real human speech patterns!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFA4</div>
                        <div style="font-weight:600;margin:6px 0;">Clone a Voice!</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Modern TTS can even copy someone's voice from a short sample! It learns the unique patterns that make each person's voice special.</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF1F</span> Sora & Other Video AI Models</h2>
                <p>Several amazing AI models can now create videos from text!</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFAC</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Sora (OpenAI)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Can make realistic minute-long videos from text! It understands physics and how objects move in the real world.</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83C\uDFB6</div>
                        <div style="font-weight:600;margin:6px 0;color:#10b981;">MusicGen (Meta)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Creates original music from text descriptions! Say "happy guitar song" and it composes one!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDDE3\uFE0F</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">Bark (Suno)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Generates realistic speech with emotion, laughter, and even singing from text!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Video Generation Pipeline</h2>
                <div class="code-block"><div class="code-header"><span>Python</span></div><pre><code><span class="comment"># Text-to-Video generation pipeline (simplified!)</span>
<span class="comment"># This shows how AI turns your words into a movie</span>

<span class="keyword">from</span> video_ai <span class="keyword">import</span> TextEncoder, KeyframeGenerator, FrameInterpolator

<span class="comment"># Step 1: Turn your text into numbers the AI understands</span>
text = <span class="string">"A puppy playing in the snow"</span>
text_embedding = TextEncoder.<span class="function">encode</span>(text)

<span class="comment"># Step 2: Generate keyframes (the important snapshots)</span>
keyframes = KeyframeGenerator.<span class="function">generate</span>(
    prompt=text_embedding,
    num_keyframes=<span class="number">8</span>,        <span class="comment"># 8 big moments</span>
    resolution=(<span class="number">512</span>, <span class="number">512</span>)  <span class="comment"># size of each frame</span>
)

<span class="comment"># Step 3: Fill in smooth frames between keyframes</span>
video_frames = FrameInterpolator.<span class="function">interpolate</span>(
    keyframes=keyframes,
    fps=<span class="number">24</span>,                  <span class="comment"># 24 frames per second (like real movies!)</span>
    temporal_consistency=<span class="number">0.95</span> <span class="comment"># keep frames smooth (0 to 1)</span>
)

<span class="comment"># Step 4: Save the video!</span>
video_frames.<span class="function">save</span>(<span class="string">"puppy_in_snow.mp4"</span>)
<span class="function">print</span>(<span class="string">f"Created video with {len(video_frames)} frames!"</span>)</code></pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter11.startQuiz11_4()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('11-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('11-5')">Next: Multimodal Foundation Models \u2192</button>
            </div>
        `;

        this.videoKeyframe = [0, 1, 2];
        this.videoPlaying = false;
        this.drawVideoStoryboard();
    },

    drawVideoStoryboard() {
        const canvas = document.getElementById('videoCanvas');
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
        ctx.fillText('Storyboard Builder \u2014 Click Scenes to Change!', W / 2, 28);

        const scenes = [
            { name: 'Beach', color: '#f59e0b', sky: '#87CEEB', ground: '#f4d03f', elements: 'waves' },
            { name: 'Forest', color: '#10b981', sky: '#4a7c59', ground: '#2d5a27', elements: 'trees' },
            { name: 'City', color: '#6366f1', sky: '#1e1b4b', ground: '#374151', elements: 'buildings' }
        ];

        const sceneW = 180;
        const sceneH = 220;
        const startX = 65;
        const sceneY = 70;
        const gap = 130;

        for (let i = 0; i < 3; i++) {
            const x = startX + i * (sceneW + gap);
            const sceneIdx = this.videoKeyframe[i] % 3;
            const scene = scenes[sceneIdx];

            // Scene frame border
            const borderGrad = ctx.createLinearGradient(x, sceneY, x + sceneW, sceneY + sceneH);
            borderGrad.addColorStop(0, scene.color);
            borderGrad.addColorStop(1, scene.color + '88');
            ctx.strokeStyle = borderGrad;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(x, sceneY, sceneW, sceneH, 10);
            ctx.stroke();

            // Sky
            ctx.fillStyle = scene.sky;
            ctx.beginPath();
            ctx.roundRect(x + 2, sceneY + 2, sceneW - 4, sceneH / 2 - 2, [8, 8, 0, 0]);
            ctx.fill();

            // Ground
            ctx.fillStyle = scene.ground;
            ctx.fillRect(x + 2, sceneY + sceneH / 2, sceneW - 4, sceneH / 2 - 2);

            // Clip for scene elements
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x + 2, sceneY + 2, sceneW - 4, sceneH - 4, 8);
            ctx.clip();
            ctx.fillStyle = scene.ground;
            ctx.fillRect(x + 2, sceneY + sceneH / 2, sceneW - 4, sceneH / 2);
            this.drawSceneElements(ctx, x, sceneY, sceneW, sceneH, scene);
            ctx.restore();

            // Scene label
            ctx.font = 'bold 14px Inter';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(scene.name, x + sceneW / 2, sceneY + sceneH + 22);

            // Keyframe number badge
            ctx.fillStyle = scene.color;
            ctx.beginPath();
            ctx.arc(x + sceneW - 12, sceneY + 16, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = 'bold 12px Inter';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(String(i + 1), x + sceneW - 12, sceneY + 20);

            // Click to change label
            ctx.font = '11px Inter';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Click to change', x + sceneW / 2, sceneY + sceneH + 40);

            // Arrow to next scene
            if (i < 2) {
                const arrowStartX = x + sceneW + 10;
                const arrowEndX = x + sceneW + gap - 10;
                const arrowY = sceneY + sceneH / 2;

                ctx.strokeStyle = '#818cf8';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(arrowStartX, arrowY);
                ctx.lineTo(arrowEndX - 10, arrowY);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#818cf8';
                ctx.beginPath();
                ctx.moveTo(arrowEndX, arrowY);
                ctx.lineTo(arrowEndX - 12, arrowY - 6);
                ctx.lineTo(arrowEndX - 12, arrowY + 6);
                ctx.closePath();
                ctx.fill();

                ctx.font = '10px Inter';
                ctx.fillStyle = '#a5b4fc';
                ctx.textAlign = 'center';
                ctx.fillText('temporal', arrowStartX + (arrowEndX - arrowStartX) / 2, arrowY - 12);
                ctx.fillText('flow \u2192', arrowStartX + (arrowEndX - arrowStartX) / 2, arrowY + 20);
            }
        }

        // Animated transition indicator when playing
        if (this.videoPlaying) {
            const progress = (Date.now() % 3000) / 3000;
            const totalW = 2 * (sceneW + gap) + sceneW;
            const dotX = startX + progress * totalW;
            const dotY = sceneY + sceneH / 2;

            const glowGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 20);
            glowGrad.addColorStop(0, 'rgba(129, 140, 248, 0.8)');
            glowGrad.addColorStop(1, 'rgba(129, 140, 248, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#c7d2fe';
            ctx.beginPath();
            ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 13px Inter';
            ctx.fillStyle = '#a5b4fc';
            ctx.textAlign = 'center';
            ctx.fillText('\u25B6 Playing smooth transitions...', W / 2, H - 15);

            this.videoAnimFrame = requestAnimationFrame(() => this.drawVideoStoryboard());
        } else {
            ctx.font = '13px Inter';
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText('Click any scene to cycle through Beach \u2192 Forest \u2192 City, then press Play!', W / 2, H - 15);
        }

        // Click handler (once)
        if (!canvas._clickHandlerSet) {
            canvas.addEventListener('click', (e) => {
                const rect = canvas.getBoundingClientRect();
                const mx = (e.clientX - rect.left) * (W / rect.width);
                const my = (e.clientY - rect.top) * (H / rect.height);

                for (let i = 0; i < 3; i++) {
                    const x = startX + i * (sceneW + gap);
                    if (mx >= x && mx <= x + sceneW && my >= sceneY && my <= sceneY + sceneH) {
                        Chapter11.videoKeyframe[i] = (Chapter11.videoKeyframe[i] + 1) % 3;
                        Chapter11.drawVideoStoryboard();
                        break;
                    }
                }
            });
            canvas._clickHandlerSet = true;
        }
    },

    drawSceneElements(ctx, x, y, w, h, scene) {
        if (scene.elements === 'waves') {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(x + w - 30, y + 30, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                for (let px = 0; px < w; px += 2) {
                    const wy = y + h / 2 + 15 + i * 18 + Math.sin(px / 20) * 6;
                    if (px === 0) ctx.moveTo(x + px, wy);
                    else ctx.lineTo(x + px, wy);
                }
                ctx.stroke();
            }
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x + 25, y + h / 2 - 40, 6, 50);
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.ellipse(x + 28, y + h / 2 - 45, 22, 10, -0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (scene.elements === 'trees') {
            for (let t = 0; t < 4; t++) {
                const tx = x + 20 + t * 42;
                const th = 35 + (t % 2) * 15;
                ctx.fillStyle = '#5c3a1e';
                ctx.fillRect(tx + 8, y + h / 2 - 5, 6, 30);
                ctx.fillStyle = '#16a34a';
                ctx.beginPath();
                ctx.moveTo(tx, y + h / 2 - 5);
                ctx.lineTo(tx + 11, y + h / 2 - 5 - th);
                ctx.lineTo(tx + 22, y + h / 2 - 5);
                ctx.closePath();
                ctx.fill();
            }
        } else if (scene.elements === 'buildings') {
            const bColors = ['#4b5563', '#374151', '#6b7280', '#4b5563'];
            for (let b = 0; b < 4; b++) {
                const bx = x + 12 + b * 40;
                const bh = 50 + (b % 3) * 25;
                ctx.fillStyle = bColors[b];
                ctx.fillRect(bx, y + h / 2 - bh + 20, 32, bh + 10);
                ctx.fillStyle = '#fbbf24';
                for (let wy = 0; wy < 3; wy++) {
                    for (let wx = 0; wx < 2; wx++) {
                        ctx.fillRect(bx + 6 + wx * 14, y + h / 2 - bh + 28 + wy * 16, 8, 8);
                    }
                }
            }
            ctx.fillStyle = '#fbbf24';
            for (let s = 0; s < 5; s++) {
                ctx.beginPath();
                ctx.arc(x + 15 + s * 35, y + 15 + (s % 3) * 12, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    playVideoStoryboard() {
        if (this.videoPlaying) return;
        this.videoPlaying = true;
        setTimeout(() => {
            this.videoPlaying = false;
            if (this.videoAnimFrame) {
                cancelAnimationFrame(this.videoAnimFrame);
                this.videoAnimFrame = null;
            }
            this.drawVideoStoryboard();
        }, 6000);
        this.drawVideoStoryboard();
    },

    resetVideoStoryboard() {
        this.videoPlaying = false;
        if (this.videoAnimFrame) {
            cancelAnimationFrame(this.videoAnimFrame);
            this.videoAnimFrame = null;
        }
        this.videoKeyframe = [0, 1, 2];
        this.drawVideoStoryboard();
    },

    startQuiz11_4() {
        Quiz.start({
            title: 'Chapter 11.4: Text-to-Video & Audio Generation',
            chapterId: '11-4',
            questions: [
                {
                    question: 'What is "temporal consistency" in video generation?',
                    options: ['Making sure the video plays at the right speed', 'Making sure each frame connects smoothly to the next one', 'Making sure the colors are consistent', 'Making sure the audio matches the video'],
                    correct: 1,
                    explanation: 'Temporal consistency means frames flow smoothly together over time \u2014 like a flipbook where each page connects to the next so the animation looks natural!'
                },
                {
                    question: 'What are "keyframes" in video generation?',
                    options: ['The password to unlock the video', 'The important snapshot frames that show the big moments', 'The first and last frame only', 'Frames that have been locked and cannot be changed'],
                    correct: 1,
                    explanation: 'Keyframes are the important "milestone" pictures in a video. The AI generates these first, then fills in smooth frames between them!'
                },
                {
                    question: 'What does text-to-speech (TTS) do?',
                    options: ['Turns spoken words into written text', 'Turns written text into spoken voice audio', 'Translates text between languages', 'Makes text appear bigger on screen'],
                    correct: 1,
                    explanation: 'Text-to-speech (TTS) takes written words and converts them into spoken audio \u2014 like giving the computer a voice to read out loud!'
                },
                {
                    question: 'What is special about OpenAI\'s Sora model?',
                    options: ['It can only make 1-second clips', 'It generates realistic videos from text and understands physics', 'It only works with cartoon styles', 'It generates only audio, not video'],
                    correct: 1,
                    explanation: 'Sora can create realistic videos up to a minute long from text descriptions! It even understands how objects move and interact in the real world.'
                },
                {
                    question: 'A video is basically a series of _____ shown very fast.',
                    options: ['Songs', 'Words', 'Pictures (frames)', 'Paragraphs'],
                    correct: 2,
                    explanation: 'A video is just a bunch of still pictures (called frames) played really fast \u2014 usually 24 to 30 per second \u2014 so your eyes see smooth motion, like a flipbook!'
                }
            ]
        });
    },

    // ============================================
    // 11.5: Multimodal Foundation Models
    // ============================================
    loadChapter11_5() {
        const container = document.getElementById('chapter-11-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 11 &bull; Chapter 11.5</span>
                <h1>\uD83E\uDDE0 Multimodal Foundation Models</h1>
                <p>What if one super-brain could handle text, images, audio, AND video all at once? Meet the amazing multimodal models that can see, hear, read, and talk!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE0</span> One Brain to Rule Them All!</h2>
                <p>Imagine you had <strong>separate brains</strong> for reading, seeing, and hearing. Every time you wanted to understand a movie, you'd need all three brains to talk to each other \u2014 and they might get confused!</p>
                <p>Now imagine having <strong>ONE super brain</strong> that can read text, look at pictures, listen to audio, and watch videos \u2014 all at the same time! That's what <strong>multimodal foundation models</strong> are!</p>
                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>"Multimodal"</strong> means "many modes." A "mode" is a way of getting information \u2014 like reading (text mode), seeing (image mode), or hearing (audio mode). A multimodal model handles ALL these modes in one place!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCC5</span> The Evolution: Getting Smarter Over Time</h2>
                <p>AI didn't always handle everything at once. Here's how we got here:</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;border-left:3px solid #ef4444;">
                        <div style="font-size:28px;">\uD83E\uDDE9</div>
                        <div style="font-weight:600;margin:6px 0;color:#ef4444;">Era 1: Separate Models</div>
                        <div style="font-size:12px;color:var(--text-secondary);">One model for text, another for images, another for audio. They couldn't talk to each other at all!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;border-left:3px solid #f59e0b;">
                        <div style="font-size:28px;">\uD83D\uDD17</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">Era 2: Pipeline</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Chain models together \u2014 one converts images to text, then a text model reads it. Like passing notes between friends!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;border-left:3px solid #10b981;">
                        <div style="font-size:28px;">\uD83E\uDDE0</div>
                        <div style="font-weight:600;margin:6px 0;color:#10b981;">Era 3: Native Multimodal</div>
                        <div style="font-size:12px;color:var(--text-secondary);">ONE model that natively understands text, images, audio, and video all at once. No translation needed!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAE</span> Modality Mixer</h2>
                <span class="tag tag-interactive">Interactive</span>
                <p>Click the input buttons to activate different modes! Watch how they all flow into the <strong>Unified Brain</strong>, which can produce any type of output!</p>
                <div class="network-viz">
                    <canvas id="multimodalCanvas" width="800" height="400"></canvas>
                </div>
                <div class="controls">
                    <button class="btn-primary btn-small" onclick="Chapter11.toggleMultimodalInput(0)">\uD83D\uDCDD Text</button>
                    <button class="btn-primary btn-small" onclick="Chapter11.toggleMultimodalInput(1)">\uD83D\uDDBC\uFE0F Image</button>
                    <button class="btn-primary btn-small" onclick="Chapter11.toggleMultimodalInput(2)">\uD83D\uDD0A Audio</button>
                    <button class="btn-primary btn-small" onclick="Chapter11.toggleMultimodalInput(3)">\uD83C\uDFAC Video</button>
                    <button class="btn-secondary btn-small" onclick="Chapter11.resetMultimodal()">Reset</button>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDF1F</span> Meet the Multimodal Stars!</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83E\uDDE0</div>
                        <div style="font-weight:600;margin:6px 0;color:#10b981;">GPT-4o (OpenAI)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">The "o" stands for "omni" (meaning all). It can read text, see images, hear audio, and respond in any of those modes!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDC8E</div>
                        <div style="font-weight:600;margin:6px 0;color:#6366f1;">Gemini (Google)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Built from the ground up to be multimodal! It can understand text, images, audio, video, and even code natively!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:28px;">\uD83D\uDCAC</div>
                        <div style="font-weight:600;margin:6px 0;color:#f59e0b;">Claude (Anthropic)</div>
                        <div style="font-size:12px;color:var(--text-secondary);">Can understand text and images, with a focus on being helpful, honest, and harmless. Built with safety in mind!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD0D</span> How Does It Work Inside?</h2>
                <p>The secret sauce is the <strong>shared embedding space</strong>! All types of input get converted into the same kind of numbers:</p>
                <div class="info-box success">
                    <span class="info-box-icon">\u2B50</span>
                    <span class="info-box-text"><strong>Embedding Space:</strong> Imagine a huge room where every idea has a location. The word "dog," a photo of a dog, and a bark sound all end up in the SAME spot in this room! That's how the model understands they're all about the same thing!</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:22px;">\uD83D\uDCDD</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Text: "cat"</div>
                        <div style="font-size:10px;color:#818cf8;margin-top:4px;">\u2192 [0.8, 0.2, ...]</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:22px;">\uD83D\uDDBC\uFE0F</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Photo of cat</div>
                        <div style="font-size:10px;color:#818cf8;margin-top:4px;">\u2192 [0.79, 0.21, ...]</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:22px;">\uD83D\uDD0A</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Meow sound</div>
                        <div style="font-size:10px;color:#818cf8;margin-top:4px;">\u2192 [0.81, 0.19, ...]</div>
                    </div>
                    <div class="feature-card" style="padding:12px;text-align:center;">
                        <div style="font-size:22px;">\uD83C\uDFAC</div>
                        <div style="font-size:11px;color:var(--text-secondary);">Cat video</div>
                        <div style="font-size:10px;color:#818cf8;margin-top:4px;">\u2192 [0.8, 0.2, ...]</div>
                    </div>
                </div>
                <p>See how all those different inputs end up with nearly the SAME numbers? That's the magic \u2014 the model learns that they all mean "cat!"</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCBB</span> Multimodal API Example</h2>
                <div class="code-block"><div class="code-header"><span>Python</span></div><pre><code><span class="comment"># Using a multimodal model - it understands EVERYTHING!</span>
<span class="keyword">from</span> multimodal_ai <span class="keyword">import</span> MultimodalModel

<span class="comment"># Load the super-brain</span>
model = MultimodalModel(<span class="string">"gpt-4o"</span>)

<span class="comment"># Send it text + an image at the same time!</span>
response = model.<span class="function">generate</span>(
    inputs=[
        {<span class="string">"type"</span>: <span class="string">"text"</span>, <span class="string">"content"</span>: <span class="string">"What's happening in this photo?"</span>},
        {<span class="string">"type"</span>: <span class="string">"image"</span>, <span class="string">"content"</span>: <span class="string">"birthday_party.jpg"</span>}
    ],
    output_type=<span class="string">"text"</span>  <span class="comment"># get a text description back</span>
)
<span class="function">print</span>(response)
<span class="comment"># "A group of kids are celebrating a birthday</span>
<span class="comment">#  with cake, balloons, and party hats!"</span>

<span class="comment"># It can also turn text into speech!</span>
audio = model.<span class="function">generate</span>(
    inputs=[{<span class="string">"type"</span>: <span class="string">"text"</span>, <span class="string">"content"</span>: <span class="string">"Hello, world!"</span>}],
    output_type=<span class="string">"audio"</span>  <span class="comment"># get spoken audio back</span>
)
audio.<span class="function">save</span>(<span class="string">"greeting.mp3"</span>)</code></pre></div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Quiz</h2>
                <span class="tag tag-quiz">Quiz &bull; 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter11.startQuiz11_5()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="info-box" style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(99,102,241,0.1));border-left-color:#10b981;">
                <span class="info-box-icon">\uD83C\uDF89</span>
                <span class="info-box-text"><strong>Module 11 Complete!</strong> You've learned all about generative AI and multimodal models! Next up: Frontier & Emerging Techniques!</span>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('11-4')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('12-1')">Next: Module 12 \u2192</button>
            </div>
        `;

        this.multimodalInputs = [false, false, false, false];
        this.multimodalStep = 0;
        this.drawMultimodalMixer();
    },

    toggleMultimodalInput(idx) {
        this.multimodalInputs[idx] = !this.multimodalInputs[idx];
        this.multimodalStep = 0;
        this.animateMultimodal();
    },

    resetMultimodal() {
        this.multimodalInputs = [false, false, false, false];
        this.multimodalStep = 0;
        if (this.multimodalAnimFrame) {
            cancelAnimationFrame(this.multimodalAnimFrame);
            this.multimodalAnimFrame = null;
        }
        this.drawMultimodalMixer();
    },

    animateMultimodal() {
        if (this.multimodalAnimFrame) {
            cancelAnimationFrame(this.multimodalAnimFrame);
        }
        this.multimodalStep = 0;
        const animate = () => {
            this.multimodalStep += 0.02;
            this.drawMultimodalMixer();
            if (this.multimodalStep < 1) {
                this.multimodalAnimFrame = requestAnimationFrame(animate);
            } else {
                this.multimodalStep = 1;
                this.drawMultimodalMixer();
            }
        };
        animate();
    },

    drawMultimodalMixer() {
        const canvas = document.getElementById('multimodalCanvas');
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
        ctx.fillText('Modality Mixer \u2014 Click Inputs to Activate!', W / 2, 28);

        const modalities = [
            { name: 'Text', icon: '\uD83D\uDCDD', color: '#6366f1', activeColor: '#818cf8' },
            { name: 'Image', icon: '\uD83D\uDDBC\uFE0F', color: '#10b981', activeColor: '#34d399' },
            { name: 'Audio', icon: '\uD83D\uDD0A', color: '#f59e0b', activeColor: '#fbbf24' },
            { name: 'Video', icon: '\uD83C\uDFAC', color: '#ef4444', activeColor: '#f87171' }
        ];

        const inputX = 80;
        const brainX = W / 2;
        const brainY = H / 2 + 10;
        const brainR = 55;
        const outputX = W - 80;

        // Draw input nodes
        for (let i = 0; i < 4; i++) {
            const nodeY = 80 + i * 80;
            const mod = modalities[i];
            const active = this.multimodalInputs[i];
            const nodeR = 32;

            if (active) {
                const glow = ctx.createRadialGradient(inputX, nodeY, nodeR, inputX, nodeY, nodeR + 18);
                glow.addColorStop(0, mod.activeColor + '44');
                glow.addColorStop(1, mod.activeColor + '00');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(inputX, nodeY, nodeR + 18, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = active ? mod.color : '#1e293b';
            ctx.beginPath();
            ctx.arc(inputX, nodeY, nodeR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = active ? mod.activeColor : '#334155';
            ctx.lineWidth = active ? 3 : 1.5;
            ctx.beginPath();
            ctx.arc(inputX, nodeY, nodeR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = '20px serif';
            ctx.textAlign = 'center';
            ctx.fillText(mod.icon, inputX, nodeY + 2);
            ctx.font = 'bold 10px Inter';
            ctx.fillStyle = active ? '#ffffff' : '#64748b';
            ctx.fillText(mod.name, inputX, nodeY + nodeR + 14);

            if (active) {
                ctx.font = '10px Inter';
                ctx.fillStyle = mod.activeColor;
                ctx.fillText('ON', inputX, nodeY - nodeR - 6);

                // Flowing dots to brain
                const startAX = inputX + nodeR + 5;
                const endAX = brainX - brainR - 5;
                const progress = Math.min(this.multimodalStep, 1);

                for (let d = 0; d < 5; d++) {
                    const t = ((Date.now() / 800 + d / 5) % 1);
                    if (t <= progress) {
                        const dx = startAX + t * (endAX - startAX);
                        const dy = nodeY + (brainY - nodeY) * t;
                        ctx.fillStyle = mod.activeColor;
                        ctx.globalAlpha = 0.4 + 0.6 * (1 - t);
                        ctx.beginPath();
                        ctx.arc(dx, dy, 4, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }
                }

                ctx.strokeStyle = mod.color + '88';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(startAX, nodeY);
                ctx.lineTo(endAX, brainY);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Central brain
        const activeCount = this.multimodalInputs.filter(v => v).length;
        const brainPulse = activeCount > 0 ? 0.1 * Math.sin(Date.now() / 300) : 0;

        if (activeCount > 0) {
            const brainGlow = ctx.createRadialGradient(brainX, brainY, brainR, brainX, brainY, brainR + 30);
            brainGlow.addColorStop(0, 'rgba(129, 140, 248, 0.25)');
            brainGlow.addColorStop(1, 'rgba(129, 140, 248, 0)');
            ctx.fillStyle = brainGlow;
            ctx.beginPath();
            ctx.arc(brainX, brainY, brainR + 30, 0, Math.PI * 2);
            ctx.fill();
        }

        const brainGrad = ctx.createRadialGradient(brainX - 15, brainY - 15, 5, brainX, brainY, brainR);
        brainGrad.addColorStop(0, activeCount > 0 ? '#6366f1' : '#1e293b');
        brainGrad.addColorStop(1, activeCount > 0 ? '#4338ca' : '#0f172a');
        ctx.fillStyle = brainGrad;
        ctx.beginPath();
        ctx.arc(brainX, brainY, brainR + brainPulse * 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = activeCount > 0 ? '#818cf8' : '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(brainX, brainY, brainR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.fillText('\uD83E\uDDE0', brainX, brainY - 2);
        ctx.font = 'bold 11px Inter';
        ctx.fillStyle = activeCount > 0 ? '#e8eaf0' : '#64748b';
        ctx.fillText('Unified', brainX, brainY + 20);
        ctx.fillText('Brain', brainX, brainY + 33);

        if (activeCount > 0) {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(brainX + brainR - 5, brainY - brainR + 10, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = 'bold 12px Inter';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(activeCount + '/4', brainX + brainR - 5, brainY - brainR + 14);
        }

        // Output nodes
        const outputs = [
            { name: 'Text', icon: '\uD83D\uDCDD', color: '#6366f1' },
            { name: 'Image', icon: '\uD83D\uDDBC\uFE0F', color: '#10b981' },
            { name: 'Audio', icon: '\uD83D\uDD0A', color: '#f59e0b' },
            { name: 'Video', icon: '\uD83C\uDFAC', color: '#ef4444' }
        ];

        for (let i = 0; i < 4; i++) {
            const nodeY = 80 + i * 80;
            const out = outputs[i];
            const outputActive = activeCount > 0;
            const outR = 26;

            ctx.fillStyle = outputActive ? out.color + '33' : '#0f172a';
            ctx.beginPath();
            ctx.arc(outputX, nodeY, outR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = outputActive ? out.color : '#1e293b';
            ctx.lineWidth = outputActive ? 2 : 1;
            ctx.beginPath();
            ctx.arc(outputX, nodeY, outR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = '16px serif';
            ctx.textAlign = 'center';
            ctx.fillText(out.icon, outputX, nodeY + 2);

            ctx.font = '10px Inter';
            ctx.fillStyle = outputActive ? out.color : '#475569';
            ctx.fillText(out.name, outputX, nodeY + outR + 12);

            if (outputActive) {
                const startOX = brainX + brainR + 5;
                const endOX = outputX - outR - 5;

                ctx.strokeStyle = out.color + '55';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(startOX, brainY);
                ctx.lineTo(endOX, nodeY);
                ctx.stroke();
                ctx.setLineDash([]);

                if (this.multimodalStep >= 0.5) {
                    for (let d = 0; d < 3; d++) {
                        const t = ((Date.now() / 1000 + d / 3 + i * 0.15) % 1);
                        const dx = startOX + t * (endOX - startOX);
                        const dy = brainY + t * (nodeY - brainY);
                        ctx.fillStyle = out.color;
                        ctx.globalAlpha = 0.3 + 0.5 * t;
                        ctx.beginPath();
                        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }

        // Labels
        ctx.font = 'bold 12px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('INPUTS', inputX, H - 12);
        ctx.fillText('MODEL', brainX, H - 12);
        ctx.fillText('OUTPUTS', outputX, H - 12);

        // Continuous animation when inputs are active
        if (activeCount > 0) {
            this.multimodalAnimFrame = requestAnimationFrame(() => this.drawMultimodalMixer());
        }
    },

    startQuiz11_5() {
        Quiz.start({
            title: 'Chapter 11.5: Multimodal Foundation Models',
            chapterId: '11-5',
            questions: [
                {
                    question: 'What does "multimodal" mean?',
                    options: ['A model that can only handle text', 'A model that handles many types of input like text, images, and audio', 'A model that runs on multiple computers', 'A model that speaks multiple languages'],
                    correct: 1,
                    explanation: '"Multimodal" means "many modes" \u2014 the model can understand and produce different types of information like text, images, audio, and video all in one brain!'
                },
                {
                    question: 'What is a "shared embedding space"?',
                    options: ['A shared office where AI engineers work', 'A place where different types of inputs get converted into the same kind of numbers', 'A type of storage drive for saving models', 'A social media platform for AI models'],
                    correct: 1,
                    explanation: 'A shared embedding space converts all input types \u2014 text, images, audio \u2014 into similar number patterns. The word "dog," a dog photo, and a bark sound all end up at the same spot!'
                },
                {
                    question: 'What was the evolution of multimodal AI?',
                    options: ['Native multimodal \u2192 Pipeline \u2192 Separate models', 'Separate models \u2192 Pipeline \u2192 Native multimodal', 'All approaches were invented at the same time', 'Pipeline \u2192 Separate models \u2192 Native multimodal'],
                    correct: 1,
                    explanation: 'First we had separate models for each type, then we chained them together in pipelines, and now we have native multimodal models that handle everything in one brain!'
                },
                {
                    question: 'What does the "o" in GPT-4o stand for?',
                    options: ['Original', 'Omni (meaning all)', 'Optimal', 'Online'],
                    correct: 1,
                    explanation: 'The "o" stands for "omni" which means "all" \u2014 because GPT-4o can handle ALL types of input and output: text, images, and audio!'
                },
                {
                    question: 'Why is native multimodal better than a pipeline of separate models?',
                    options: ['It uses more electricity', 'It only works with text', 'It understands connections between different types of information directly, without translation errors', 'It is always smaller and cheaper to run'],
                    correct: 2,
                    explanation: 'A native multimodal model understands all types of information directly. A pipeline can lose meaning when translating between separate models \u2014 like a game of telephone!'
                }
            ]
        });
    }
};
