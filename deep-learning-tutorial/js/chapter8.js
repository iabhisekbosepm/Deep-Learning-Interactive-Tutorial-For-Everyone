/* ============================================
   Chapter 8: Advanced Topics
   ============================================ */

const Chapter8 = {
    init() {
        App.registerChapter('8-1', () => this.loadChapter8_1());
        App.registerChapter('8-2', () => this.loadChapter8_2());
        App.registerChapter('8-3', () => this.loadChapter8_3());
        App.registerChapter('8-4', () => this.loadChapter8_4());
        App.registerChapter('8-5', () => this.loadChapter8_5());
    },

    // ============================================
    // 8.1: Distributed Training
    // ============================================
    gpuCount: 4,

    loadChapter8_1() {
        const container = document.getElementById('chapter-8-1');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 8 \u2022 Chapter 8.1</span>
                <h1>Distributed Training</h1>
                <p>Training a big AI brain on one computer can take forever!
                   Distributed training is like a group project -- you split the work
                   across many computers so it gets done way faster. This is how
                   super-smart AIs like GPT and BERT are built!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDE80</span> Why Distributed Training?</h2>
                <p>Today's AI models are HUGE with billions of tiny settings to adjust.
                   One computer alone would take way too long. So we team up many
                   computers to work together!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Imagine building a giant LEGO castle. One kid alone takes forever,
                    but 8 friends working together can finish way faster! They just need to talk
                    to each other so nobody builds the same part twice.</span>
                </div>

                <h3>Two Main Strategies</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;">
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-size:24px;margin-bottom:8px;">\uD83D\uDCCA</div>
                        <div style="font-weight:700;margin-bottom:6px;color:#6366f1;">Data Parallelism</div>
                        <div style="font-size:13px;color:var(--text-secondary);">Everyone gets the same recipe but different
                        ingredients to practice with. Each computer learns from its own batch, then they
                        share what they learned. Best when the model fits on one computer.</div>
                    </div>
                    <div class="feature-card" style="padding:20px;">
                        <div style="font-size:24px;margin-bottom:8px;">\uD83E\uDDE9</div>
                        <div style="font-weight:700;margin-bottom:6px;color:#8b5cf6;">Model Parallelism</div>
                        <div style="font-size:13px;color:var(--text-secondary);">Split one big recipe across different cooks.
                        Each computer handles part of the model. Data flows through them one after another.
                        Needed when the model is too big for one computer!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCCA</span> Data Parallelism</h2>
                <p>In data parallelism, every computer gets a copy of the AI brain. Each one practices
                   on different examples. Then they share what they learned so everyone improves together.
                   This is the most popular way to team up!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="network-viz">
                    <canvas id="dataParallelCanvas" width="800" height="300"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE9</span> Model Parallelism</h2>
                <p>In model parallelism, the AI brain itself is split into pieces. One computer handles
                   the first layers, another handles the next layers, and so on. This is needed when
                   the brain is too big for one computer!</p>

                <div class="network-viz">
                    <canvas id="modelParallelCanvas" width="800" height="260"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2699\uFE0F</span> GPU Speedup Calculator</h2>
                <p>How much faster can you go with more computers? Move the slider to find out!
                   Notice: adding more helpers does not always double the speed because they
                   spend time talking to each other!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Number of GPUs</label>
                        <input type="range" id="gpuSlider" min="1" max="8" value="4" step="1"
                               oninput="Chapter8.updateGPUCalc()">
                        <span class="slider-value" id="gpuSliderVal">4</span>
                    </div>
                </div>

                <div class="gd-stats" id="gpuStats">
                    <div class="gd-stat">
                        <div class="stat-label">GPUs</div>
                        <div class="stat-value" id="gpuCountStat" style="color:#6366f1;">4</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Theoretical Speedup</div>
                        <div class="stat-value" id="gpuSpeedup" style="color:#10b981;">3.20x</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Efficiency</div>
                        <div class="stat-value" id="gpuEfficiency" style="color:#f59e0b;">80.0%</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Comm. Overhead</div>
                        <div class="stat-value" id="gpuOverhead" style="color:#ef4444;">20.0%</div>
                    </div>
                </div>

                <div class="graph-container">
                    <canvas id="gpuBarChart" width="750" height="300"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Code Example</h2>
                <p>Here is how you tell your computers to team up in PyTorch and TensorFlow:</p>

                <div class="code-block">
<span class="comment"># PyTorch: Team up multiple GPUs!</span>
<span class="keyword">import</span> torch
<span class="keyword">import</span> torch.distributed <span class="keyword">as</span> dist
<span class="keyword">from</span> torch.nn.parallel <span class="keyword">import</span> DistributedDataParallel

<span class="comment"># Get all the computers ready to work together</span>
dist.<span class="function">init_process_group</span>(backend=<span class="string">'nccl'</span>)
local_rank = dist.<span class="function">get_rank</span>()
torch.cuda.<span class="function">set_device</span>(local_rank)

<span class="comment"># Give each GPU its own copy of the model</span>
model = <span class="function">MyModel</span>().<span class="function">to</span>(local_rank)
model = <span class="function">DistributedDataParallel</span>(model, device_ids=[local_rank])

<span class="comment"># Training works the same way as before!</span>
<span class="keyword">for</span> batch <span class="keyword">in</span> dataloader:
    loss = model(batch)
    loss.<span class="function">backward</span>()    <span class="comment"># Learning is shared automatically!</span>
    optimizer.<span class="function">step</span>()

<span class="comment"># -------------------------------------------</span>
<span class="comment"># TensorFlow: Mirror the model to all GPUs</span>
<span class="keyword">import</span> tensorflow <span class="keyword">as</span> tf

strategy = tf.distribute.<span class="function">MirroredStrategy</span>()
<span class="keyword">with</span> strategy.<span class="function">scope</span>():
    model = <span class="function">build_model</span>()
    model.<span class="function">compile</span>(optimizer=<span class="string">'adam'</span>, loss=<span class="string">'sparse_categorical_crossentropy'</span>)

model.<span class="function">fit</span>(train_dataset, epochs=<span class="number">10</span>)
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter8.startQuiz8_1()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('7-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('8-2')">Next: Data Pipelines \u2192</button>
            </div>
        `;

        this.drawDataParallel();
        this.drawModelParallel();
        this.updateGPUCalc();
    },

    drawDataParallel() {
        const canvas = document.getElementById('dataParallelCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Data Parallelism', W / 2, 22);

        // Data source
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(30, 60, 120, 50, 8);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Full Dataset', 90, 88);

        // Arrow from data to batches
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(150, 85);
        ctx.lineTo(190, 85);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(185, 80);
        ctx.lineTo(195, 85);
        ctx.lineTo(185, 90);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();

        // GPU rows
        const gpus = ['GPU 0', 'GPU 1', 'GPU 2', 'GPU 3'];
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6'];
        const startY = 40;
        const rowH = 55;

        gpus.forEach((gpu, i) => {
            const y = startY + i * rowH;

            // Batch
            ctx.fillStyle = colors[i];
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.roundRect(200, y, 80, 40, 6);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#e8eaf0';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Batch ' + i, 240, y + 24);

            // Arrow
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            ctx.moveTo(285, y + 20);
            ctx.lineTo(320, y + 20);
            ctx.stroke();

            // Model copy
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.roundRect(325, y, 110, 40, 6);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Inter';
            ctx.fillText(gpu + ' Model', 380, y + 24);

            // Arrow
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            ctx.moveTo(440, y + 20);
            ctx.lineTo(475, y + 20);
            ctx.stroke();

            // Gradients
            ctx.fillStyle = '#10b981';
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.roundRect(480, y, 90, 40, 6);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#10b981';
            ctx.font = '11px Inter';
            ctx.fillText('Gradients', 525, y + 24);
        });

        // All-Reduce box
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(575, startY + 20);
        ctx.lineTo(620, H / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(575, startY + rowH + 20);
        ctx.lineTo(620, H / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(575, startY + 2 * rowH + 20);
        ctx.lineTo(620, H / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(575, startY + 3 * rowH + 20);
        ctx.lineTo(620, H / 2);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(620, H / 2 - 25, 120, 50, 8);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('All-Reduce', 680, H / 2 - 2);
        ctx.fillText('Avg Gradients', 680, H / 2 + 14);
    },

    drawModelParallel() {
        const canvas = document.getElementById('modelParallelCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Model Parallelism', W / 2, 22);

        // Input
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(20, H / 2 - 25, 80, 50, 8);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('Input', 60, H / 2 + 5);

        const gpuParts = [
            { label: 'GPU 0', sub: 'Layers 1-3', color: '#6366f1', x: 150 },
            { label: 'GPU 1', sub: 'Layers 4-6', color: '#8b5cf6', x: 310 },
            { label: 'GPU 2', sub: 'Layers 7-9', color: '#a855f7', x: 470 },
            { label: 'GPU 3', sub: 'Layers 10-12', color: '#10b981', x: 630 }
        ];

        gpuParts.forEach((part, i) => {
            // Arrow
            const arrowStartX = i === 0 ? 105 : part.x - 30;
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(arrowStartX, H / 2);
            ctx.lineTo(part.x, H / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(part.x - 5, H / 2 - 5);
            ctx.lineTo(part.x + 2, H / 2);
            ctx.lineTo(part.x - 5, H / 2 + 5);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fill();

            // GPU block
            ctx.fillStyle = part.color;
            ctx.beginPath();
            ctx.roundRect(part.x, H / 2 - 40, 130, 80, 8);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(part.label, part.x + 65, H / 2 - 5);
            ctx.font = '11px Inter';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillText(part.sub, part.x + 65, H / 2 + 15);
        });

        // Data flow label
        ctx.fillStyle = '#f59e0b';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Data flows through GPUs sequentially \u2192', W / 2, H - 15);
    },

    updateGPUCalc() {
        const gpus = parseInt(document.getElementById('gpuSlider')?.value || 4);
        this.gpuCount = gpus;
        document.getElementById('gpuSliderVal').textContent = gpus;

        // Amdahl's law approximation with communication overhead
        const parallelFraction = 0.92;
        const commOverhead = 0.05 * Math.log2(gpus);
        const efficiency = (1 / (1 - parallelFraction + parallelFraction / gpus)) / gpus;
        const actualEfficiency = Math.max(0.3, 1 - commOverhead - (1 - parallelFraction));
        const speedup = gpus * actualEfficiency;

        document.getElementById('gpuCountStat').textContent = gpus;
        document.getElementById('gpuSpeedup').textContent = speedup.toFixed(2) + 'x';
        document.getElementById('gpuEfficiency').textContent = (actualEfficiency * 100).toFixed(1) + '%';
        document.getElementById('gpuOverhead').textContent = (commOverhead * 100).toFixed(1) + '%';

        this.drawGPUBarChart(gpus);
    },

    drawGPUBarChart(currentGpus) {
        const canvas = document.getElementById('gpuBarChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 30, right: 30, bottom: 50, left: 70 };
        ctx.clearRect(0, 0, W, H);

        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        // Title
        ctx.fillStyle = '#8b95a8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Training Time vs Number of GPUs', W / 2, 18);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + plotH * (i / 4);
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();
            ctx.fillStyle = '#5a6478';
            ctx.font = '11px JetBrains Mono';
            ctx.textAlign = 'right';
            ctx.fillText(((4 - i) * 25) + 'h', pad.left - 8, y + 4);
        }

        const barW = plotW / 10;
        const baseTime = 100;

        for (let g = 1; g <= 8; g++) {
            const commOH = 0.05 * Math.log2(g);
            const eff = Math.max(0.3, 1 - commOH - 0.08);
            const time = baseTime / (g * eff);
            const barH = (time / baseTime) * plotH;
            const x = pad.left + (g - 0.5) * (plotW / 8) - barW / 2;
            const y = pad.top + plotH - barH;

            const isActive = g === currentGpus;

            ctx.fillStyle = isActive ? '#6366f1' : 'rgba(99,102,241,0.3)';
            ctx.beginPath();
            ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
            ctx.fill();

            if (isActive) {
                ctx.strokeStyle = '#818cf8';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Time label on bar
            ctx.fillStyle = isActive ? '#fff' : '#8b95a8';
            ctx.font = isActive ? 'bold 11px Inter' : '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(time.toFixed(0) + 'h', x + barW / 2, y - 6);

            // GPU label
            ctx.fillStyle = '#8b95a8';
            ctx.font = '11px Inter';
            ctx.fillText(g + ' GPU' + (g > 1 ? 's' : ''), x + barW / 2, pad.top + plotH + 20);
        }
    },

    startQuiz8_1() {
        Quiz.start({
            title: 'Chapter 8.1: Distributed Training',
            chapterId: '8-1',
            questions: [
                {
                    question: 'What is the difference between data parallelism and model parallelism?',
                    options: [
                        'Data parallelism is faster, model parallelism is slower',
                        'Data parallelism gives everyone the same model with different data; model parallelism splits the model into pieces',
                        'Data parallelism uses CPUs, model parallelism uses GPUs',
                        'There is no difference'
                    ],
                    correct: 1,
                    explanation: 'Data parallelism is like giving every friend the same recipe but different ingredients. Model parallelism is like splitting one big recipe so each friend does a different step.'
                },
                {
                    question: 'Why does adding more computers NOT always make things twice as fast?',
                    options: [
                        'Computers get slower when there are more',
                        'They spend more time talking to each other to share what they learned',
                        'The model gets bigger with more computers',
                        'The data gets smaller with more computers'
                    ],
                    correct: 1,
                    explanation: 'Just like a group project at school -- more friends help, but they also spend more time talking and sharing notes. That chatting time slows things down a little!'
                },
                {
                    question: 'What is "All-Reduce" in distributed training?',
                    options: [
                        'A way to remove extra layers',
                        'Mixing everyone\'s answers together to get the best one and sharing it back',
                        'A way to shrink the data',
                        'A way to squish the model smaller'
                    ],
                    correct: 1,
                    explanation: 'All-Reduce is like everyone in a group sharing their test answers, averaging them to find the best answer, and then everyone getting a copy. Teamwork!'
                },
                {
                    question: 'When do you need model parallelism instead of data parallelism?',
                    options: [
                        'When you have tons of data',
                        'When you need to train super fast',
                        'When the AI brain is too big to fit on one computer',
                        'When you only have CPUs'
                    ],
                    correct: 2,
                    explanation: 'Model parallelism is needed when the AI brain is so enormous that one computer cannot hold it all. So you split the brain across multiple computers!'
                }
            ]
        });
    },

    // ============================================
    // 8.2: Data Pipelines
    // ============================================
    prefetchEnabled: false,
    pipelineAnimating: false,

    loadChapter8_2() {
        const container = document.getElementById('chapter-8-2');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 8 \u2022 Chapter 8.2</span>
                <h1>Data Pipelines</h1>
                <p>A data pipeline is like an assembly line in a factory! It gets data ready
                   for the AI to learn from. If the GPU has to wait for data, it is bored and wasting time.
                   A good pipeline keeps it busy and happy!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD04</span> The Pipeline Stages</h2>
                <p>Every assembly line follows the same steps. Raw data goes through
                   several stations before it is ready for the AI to eat up!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Think of it like a pizza shop! The dough (data) gets rolled out (decoded),
                    toppings are added (augmented), pizzas are grouped into boxes (batched),
                    and the next order is already being prepared while you eat (prefetched)!</span>
                </div>

                <div class="network-viz">
                    <canvas id="pipelineCanvas" width="800" height="160"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u26A1</span> Prefetch: The Key Optimization</h2>
                <p>Toggle prefetching to see the amazing difference! Without prefetch, the GPU
                   just sits and waits (boring!). With prefetch, the CPU gets the next batch ready
                   while the GPU is still learning -- like a waiter bringing your next dish while you eat!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Prefetch</label>
                        <button class="btn-small" id="prefetchToggle"
                                onclick="Chapter8.togglePrefetch()"
                                style="background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid rgba(239,68,68,0.3);">
                            OFF
                        </button>
                    </div>
                    <div class="control-group">
                        <button class="btn-primary btn-small" onclick="Chapter8.animatePipeline()">
                            \u25B6 Animate Timeline
                        </button>
                        <button class="btn-secondary btn-small" onclick="Chapter8.resetPipeline()">
                            Reset
                        </button>
                    </div>
                </div>

                <div class="graph-container">
                    <canvas id="timelineCanvas" width="750" height="280"></canvas>
                </div>

                <div class="gd-stats" id="pipelineStats">
                    <div class="gd-stat">
                        <div class="stat-label">Throughput</div>
                        <div class="stat-value" id="pipelineThroughput" style="color:#6366f1;">850 samples/sec</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">GPU Utilization</div>
                        <div class="stat-value" id="pipelineGPUUtil" style="color:#10b981;">52%</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">CPU Idle Time</div>
                        <div class="stat-value" id="pipelineCPUIdle" style="color:#f59e0b;">0%</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Mode</div>
                        <div class="stat-value" id="pipelineMode" style="color:#ef4444;">Sequential</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Code Example</h2>
                <p>Here is how to build a super fast data assembly line:</p>

                <div class="code-block">
<span class="keyword">import</span> tensorflow <span class="keyword">as</span> tf

<span class="keyword">def</span> <span class="function">build_pipeline</span>(file_pattern, batch_size=<span class="number">64</span>):
    dataset = tf.data.Dataset.<span class="function">list_files</span>(file_pattern)

    <span class="comment"># Read many files at the same time (faster!)</span>
    dataset = dataset.<span class="function">interleave</span>(
        <span class="keyword">lambda</span> f: tf.data.<span class="function">TFRecordDataset</span>(f),
        num_parallel_calls=tf.data.AUTOTUNE
    )

    <span class="comment"># Open images and add fun changes at the same time</span>
    dataset = dataset.<span class="function">map</span>(
        <span class="function">decode_and_augment</span>,
        num_parallel_calls=tf.data.AUTOTUNE
    )

    <span class="comment"># Group data, mix it up, and get the next batch ready early</span>
    dataset = dataset.<span class="function">shuffle</span>(<span class="number">10000</span>)
    dataset = dataset.<span class="function">batch</span>(batch_size)
    dataset = dataset.<span class="function">prefetch</span>(tf.data.AUTOTUNE)  <span class="comment"># The magic trick!</span>

    <span class="keyword">return</span> dataset

<span class="keyword">def</span> <span class="function">decode_and_augment</span>(raw_record):
    features = tf.io.<span class="function">parse_single_example</span>(raw_record, schema)
    image = tf.io.<span class="function">decode_jpeg</span>(features[<span class="string">'image'</span>])
    image = tf.image.<span class="function">random_flip_left_right</span>(image)
    image = tf.image.<span class="function">random_brightness</span>(image, <span class="number">0.1</span>)
    <span class="keyword">return</span> image, features[<span class="string">'label'</span>]
                </div>

                <div class="info-box success">
                    <span class="info-box-icon">\u2705</span>
                    <span class="info-box-text">The <code>prefetch(AUTOTUNE)</code> trick is the most important one!
                    It tells the computer to automatically figure out how many batches to prepare
                    ahead of time so the GPU never has to wait. Amazing, right?</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter8.startQuiz8_2()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('8-1')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('8-3')">Next: BERT & Transformers \u2192</button>
            </div>
        `;

        this.drawPipelineStages();
        this.resetPipeline();
    },

    drawPipelineStages() {
        const canvas = document.getElementById('pipelineCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const stages = [
            { label: 'Read', icon: '\uD83D\uDCC1', color: '#3b82f6' },
            { label: 'Decode', icon: '\uD83D\uDDBC\uFE0F', color: '#8b5cf6' },
            { label: 'Augment', icon: '\uD83D\uDD00', color: '#a855f7' },
            { label: 'Batch', icon: '\uD83D\uDCE6', color: '#f59e0b' },
            { label: 'Prefetch', icon: '\u26A1', color: '#10b981' }
        ];

        const stageW = 120;
        const gap = (W - stages.length * stageW) / (stages.length + 1);

        stages.forEach((stage, i) => {
            const x = gap + i * (stageW + gap);
            const y = H / 2 - 30;

            ctx.fillStyle = stage.color;
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.roundRect(x, y, stageW, 60, 8);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = stage.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 13px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(stage.label, x + stageW / 2, y + 28);
            ctx.font = '11px Inter';
            ctx.fillStyle = '#8b95a8';
            ctx.fillText('Stage ' + (i + 1), x + stageW / 2, y + 48);

            // Arrow between stages
            if (i < stages.length - 1) {
                const arrowX = x + stageW + gap / 2;
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.moveTo(arrowX - 8, H / 2 - 6);
                ctx.lineTo(arrowX + 4, H / 2);
                ctx.lineTo(arrowX - 8, H / 2 + 6);
                ctx.fill();
            }
        });
    },

    togglePrefetch() {
        this.prefetchEnabled = !this.prefetchEnabled;
        const btn = document.getElementById('prefetchToggle');
        if (this.prefetchEnabled) {
            btn.textContent = 'ON';
            btn.style.background = 'rgba(16,185,129,0.2)';
            btn.style.color = '#10b981';
            btn.style.borderColor = 'rgba(16,185,129,0.3)';
        } else {
            btn.textContent = 'OFF';
            btn.style.background = 'rgba(239,68,68,0.2)';
            btn.style.color = '#ef4444';
            btn.style.borderColor = 'rgba(239,68,68,0.3)';
        }
        this.resetPipeline();
    },

    pipelineProgress: 0,

    resetPipeline() {
        this.pipelineAnimating = false;
        this.pipelineProgress = 0;
        this.drawTimeline(0);
        this.updatePipelineStats();
    },

    animatePipeline() {
        if (this.pipelineAnimating) return;
        this.pipelineAnimating = true;
        this.pipelineProgress = 0;

        const animate = () => {
            if (!this.pipelineAnimating || this.pipelineProgress >= 100) {
                this.pipelineAnimating = false;
                return;
            }
            this.pipelineProgress += 1.5;
            this.drawTimeline(this.pipelineProgress);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    },

    drawTimeline(progress) {
        const canvas = document.getElementById('timelineCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 40, right: 20, bottom: 30, left: 90 };
        ctx.clearRect(0, 0, W, H);

        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;
        const prefetch = this.prefetchEnabled;

        // Title
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(prefetch ? 'With Prefetch (Overlapped)' : 'Without Prefetch (Sequential)', W / 2, 20);

        // Row labels
        ctx.fillStyle = '#8b95a8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('CPU (Prep)', pad.left - 10, pad.top + plotH * 0.2 + 4);
        ctx.fillText('GPU (Train)', pad.left - 10, pad.top + plotH * 0.6 + 4);
        ctx.fillText('Time \u2192', pad.left + plotW / 2, H - 8);

        // Divider
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top + plotH * 0.4);
        ctx.lineTo(W - pad.right, pad.top + plotH * 0.4);
        ctx.stroke();

        const batches = 5;
        const cpuColor = '#3b82f6';
        const gpuColor = '#10b981';
        const idleColor = 'rgba(255,255,255,0.05)';

        const unitW = plotW / (prefetch ? (batches + 1) : (batches * 2));
        const rowH = plotH * 0.25;

        const animFraction = Math.min(progress / 100, 1);

        if (!prefetch) {
            // Sequential: CPU then GPU, CPU then GPU...
            for (let i = 0; i < batches; i++) {
                const cpuX = pad.left + i * 2 * unitW;
                const gpuX = pad.left + (i * 2 + 1) * unitW;
                const timePos = (i * 2 + 1) / (batches * 2);

                // CPU block
                if (animFraction >= (i * 2) / (batches * 2)) {
                    const blockProgress = Math.min(1, (animFraction - (i * 2) / (batches * 2)) * batches * 2);
                    ctx.fillStyle = cpuColor;
                    ctx.globalAlpha = 0.7;
                    ctx.beginPath();
                    ctx.roundRect(cpuX, pad.top + plotH * 0.08, unitW * blockProgress - 2, rowH, 4);
                    ctx.fill();
                    ctx.globalAlpha = 1;

                    // GPU idle
                    ctx.fillStyle = idleColor;
                    ctx.beginPath();
                    ctx.roundRect(cpuX, pad.top + plotH * 0.48, unitW - 2, rowH, 4);
                    ctx.fill();

                    ctx.fillStyle = '#ef4444';
                    ctx.font = '9px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText('idle', cpuX + unitW / 2, pad.top + plotH * 0.62);
                }

                // GPU block
                if (animFraction >= (i * 2 + 1) / (batches * 2)) {
                    const blockProgress = Math.min(1, (animFraction - (i * 2 + 1) / (batches * 2)) * batches * 2);
                    ctx.fillStyle = gpuColor;
                    ctx.globalAlpha = 0.7;
                    ctx.beginPath();
                    ctx.roundRect(gpuX, pad.top + plotH * 0.48, unitW * blockProgress - 2, rowH, 4);
                    ctx.fill();
                    ctx.globalAlpha = 1;

                    // CPU idle
                    ctx.fillStyle = idleColor;
                    ctx.beginPath();
                    ctx.roundRect(gpuX, pad.top + plotH * 0.08, unitW - 2, rowH, 4);
                    ctx.fill();

                    ctx.fillStyle = '#ef4444';
                    ctx.font = '9px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText('idle', gpuX + unitW / 2, pad.top + plotH * 0.22);
                }

                // Batch labels
                ctx.fillStyle = '#fff';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                if (animFraction >= (i * 2) / (batches * 2)) {
                    ctx.fillText('B' + i, cpuX + unitW / 2, pad.top + plotH * 0.22);
                }
                if (animFraction >= (i * 2 + 1) / (batches * 2)) {
                    ctx.fillText('B' + i, gpuX + unitW / 2, pad.top + plotH * 0.62);
                }
            }
        } else {
            // Overlapped: CPU and GPU work simultaneously
            for (let i = 0; i < batches; i++) {
                const cpuX = pad.left + i * unitW;
                const gpuX = pad.left + (i + 1) * unitW;

                // CPU block
                if (animFraction >= i / (batches + 1)) {
                    const blockProgress = Math.min(1, (animFraction - i / (batches + 1)) * (batches + 1));
                    ctx.fillStyle = cpuColor;
                    ctx.globalAlpha = 0.7;
                    ctx.beginPath();
                    ctx.roundRect(cpuX, pad.top + plotH * 0.08, unitW * blockProgress - 2, rowH, 4);
                    ctx.fill();
                    ctx.globalAlpha = 1;

                    ctx.fillStyle = '#fff';
                    ctx.font = '10px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText('B' + i, cpuX + unitW / 2, pad.top + plotH * 0.22);
                }

                // GPU block (starts one unit later)
                if (animFraction >= (i + 1) / (batches + 1)) {
                    const blockProgress = Math.min(1, (animFraction - (i + 1) / (batches + 1)) * (batches + 1));
                    ctx.fillStyle = gpuColor;
                    ctx.globalAlpha = 0.7;
                    ctx.beginPath();
                    ctx.roundRect(gpuX, pad.top + plotH * 0.48, unitW * blockProgress - 2, rowH, 4);
                    ctx.fill();
                    ctx.globalAlpha = 1;

                    ctx.fillStyle = '#fff';
                    ctx.font = '10px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText('B' + i, gpuX + unitW / 2, pad.top + plotH * 0.62);
                }
            }

            // Overlap arrows
            ctx.fillStyle = '#f59e0b';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('\u2B06 CPU and GPU work at the same time!', W / 2, pad.top + plotH * 0.42);
        }

        // Bottom time axis
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top + plotH + 5);
        ctx.lineTo(W - pad.right, pad.top + plotH + 5);
        ctx.stroke();
    },

    updatePipelineStats() {
        const prefetch = this.prefetchEnabled;
        document.getElementById('pipelineThroughput').textContent = prefetch ? '1,620 samples/sec' : '850 samples/sec';
        document.getElementById('pipelineGPUUtil').textContent = prefetch ? '95%' : '52%';
        document.getElementById('pipelineCPUIdle').textContent = prefetch ? '5%' : '48%';
        document.getElementById('pipelineMode').textContent = prefetch ? 'Overlapped' : 'Sequential';
        document.getElementById('pipelineMode').style.color = prefetch ? '#10b981' : '#ef4444';
    },

    startQuiz8_2() {
        Quiz.start({
            title: 'Chapter 8.2: Data Pipelines',
            chapterId: '8-2',
            questions: [
                {
                    question: 'What does prefetching do in a data pipeline?',
                    options: [
                        'Squishes the data smaller',
                        'Gets the next batch ready while the GPU is still learning from the current one',
                        'Puts the data in order',
                        'Makes the model smaller'
                    ],
                    correct: 1,
                    explanation: 'Prefetching is like a waiter bringing your next plate while you are still eating. The GPU never has to wait around doing nothing!'
                },
                {
                    question: 'What does tf.data.AUTOTUNE do?',
                    options: [
                        'Picks the best model for you',
                        'Automatically figures out the best speed for loading data',
                        'Automatically finds the best settings for learning',
                        'Stops training at the perfect time'
                    ],
                    correct: 1,
                    explanation: 'AUTOTUNE is like a smart helper that figures out the fastest way to load and prepare data. It adjusts itself to keep everything running smoothly!'
                },
                {
                    question: 'What happens when there is NO prefetching?',
                    options: [
                        'The GPU goes faster',
                        'The CPU and GPU work at the same time',
                        'The GPU just sits there bored, waiting for data to arrive',
                        'The AI learns better'
                    ],
                    correct: 2,
                    explanation: 'Without prefetching, everything happens one step at a time. The GPU has to wait for the CPU to prepare data first. It is like waiting in a long lunch line!'
                },
                {
                    question: 'Which of these is NOT a step in the data assembly line?',
                    options: [
                        'Read files from the disk',
                        'Open and decode images',
                        'Add fun changes to images',
                        'Build the model'
                    ],
                    correct: 3,
                    explanation: 'Building the model happens once before training starts. The assembly line steps are: Read, Decode, Augment (add changes), Batch (group up), and Prefetch (get the next one ready).'
                }
            ]
        });
    },

    // ============================================
    // 8.3: BERT & Transformers
    // ============================================
    selectedWord: 4,
    maskGuess: null,

    loadChapter8_3() {
        const container = document.getElementById('chapter-8-3');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 8 \u2022 Chapter 8.3</span>
                <h1>BERT & Transformers</h1>
                <p>Transformers changed everything in 2017! They are the super-brains behind AI like ChatGPT.
                   BERT is a special Transformer that learned language by reading millions of books first,
                   then you can teach it your own task. It reads sentences both forward AND backward!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83E\uDDE0</span> The Transformer Architecture</h2>
                <p>The Transformer uses a cool trick called <strong>self-attention</strong>.
                   Instead of reading words one by one (like RNNs), every word looks at every
                   other word at the same time to understand the full sentence!</p>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Imagine a classroom where the teacher asks a question. An RNN is like asking
                    one student at a time. A Transformer is like everyone raising their hand at once and
                    talking to each other. Every word checks in with every other word. That is super fast!</span>
                </div>

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">\uD83D\uDC41\uFE0F</div>
                        <div style="font-weight:600;font-size:13px;">Self-Attention</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Every word looks at every other word to understand the sentence</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">\uD83D\uDD17</div>
                        <div style="font-weight:600;font-size:13px;">Multi-Head</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Many attention lookups at once, each finding different patterns</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">\uD83D\uDCCD</div>
                        <div style="font-weight:600;font-size:13px;">Positional Encoding</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Tells the model where each word sits in the sentence</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">\u2B06\uFE0F</div>
                        <div style="font-weight:600;font-size:13px;">Feed-Forward</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Extra thinking layers after attention</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC41\uFE0F</span> Self-Attention Visualizer</h2>
                <p>Click on a word to see which other words it pays attention to. Thicker lines
                   mean stronger attention. Cool discovery: "it" pays lots of attention to "cat" because
                   the AI figured out "it" is talking about the cat!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="network-viz">
                    <canvas id="attentionCanvas" width="800" height="320"></canvas>
                </div>

                <div id="attentionWords" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px;">
                </div>

                <div class="step-explanation" id="attentionExplanation">
                    Click a word above or on the picture to see which words it is looking at!
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAD</span> Masked Language Model Demo</h2>
                <p>BERT learns by playing a fill-in-the-blank game! It hides random words
                   and tries to guess them. Can you guess the hidden word too?</p>
                <span class="tag tag-interactive">Interactive</span>

                <div style="text-align:center;margin:20px 0;">
                    <div style="font-size:18px;font-weight:600;line-height:2;color:#e8eaf0;">
                        "The cat sat on the mat because <span style="background:#6366f1;padding:4px 12px;border-radius:6px;color:#fff;">[MASK]</span> was tired"
                    </div>
                </div>

                <div id="maskOptions" style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:16px 0;">
                    <button class="btn-secondary btn-small" onclick="Chapter8.guessMask('he')" style="min-width:70px;">he</button>
                    <button class="btn-secondary btn-small" onclick="Chapter8.guessMask('it')" style="min-width:70px;">it</button>
                    <button class="btn-secondary btn-small" onclick="Chapter8.guessMask('she')" style="min-width:70px;">she</button>
                    <button class="btn-secondary btn-small" onclick="Chapter8.guessMask('they')" style="min-width:70px;">they</button>
                    <button class="btn-secondary btn-small" onclick="Chapter8.guessMask('cat')" style="min-width:70px;">cat</button>
                </div>

                <div id="maskResult" class="step-explanation">
                    Pick the word you think fills in the blank! Can you beat BERT?
                </div>

                <div class="info-box warning" style="margin-top:16px;">
                    <span class="info-box-icon">\u2B50</span>
                    <span class="info-box-text">BERT reads both left-to-right AND right-to-left at the same time!
                    It looks at words before AND after the blank to guess. GPT is different -- it only
                    reads left-to-right, like reading a book normally. BERT cheats by peeking both ways!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Code Example: BERT Fine-Tuning</h2>
                <p>Teaching BERT your specific task after it already knows language (this is called fine-tuning):</p>

                <div class="code-block">
<span class="keyword">from</span> transformers <span class="keyword">import</span> BertTokenizer, BertForSequenceClassification
<span class="keyword">from</span> transformers <span class="keyword">import</span> Trainer, TrainingArguments

<span class="comment"># Load BERT (it already read millions of books!)</span>
tokenizer = BertTokenizer.<span class="function">from_pretrained</span>(<span class="string">'bert-base-uncased'</span>)
model = BertForSequenceClassification.<span class="function">from_pretrained</span>(
    <span class="string">'bert-base-uncased'</span>,
    num_labels=<span class="number">2</span>  <span class="comment"># Two choices (like yes or no)</span>
)

<span class="comment"># Turn your sentences into numbers BERT can understand</span>
<span class="keyword">def</span> <span class="function">tokenize</span>(examples):
    <span class="keyword">return</span> tokenizer(
        examples[<span class="string">'text'</span>],
        padding=<span class="string">'max_length'</span>,
        truncation=<span class="keyword">True</span>,
        max_length=<span class="number">128</span>
    )

dataset = dataset.<span class="function">map</span>(tokenize, batched=<span class="keyword">True</span>)

<span class="comment"># Teach BERT your specific task</span>
args = <span class="function">TrainingArguments</span>(
    output_dir=<span class="string">'./results'</span>,
    num_train_epochs=<span class="number">3</span>,
    per_device_train_batch_size=<span class="number">16</span>,
    learning_rate=<span class="number">2e-5</span>,        <span class="comment"># Learn slowly so we don't break what BERT already knows</span>
    weight_decay=<span class="number">0.01</span>,
)

trainer = <span class="function">Trainer</span>(model=model, args=args, train_dataset=dataset)
trainer.<span class="function">train</span>()
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 5 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter8.startQuiz8_3()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('8-2')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('8-4')">Next: Model Deployment \u2192</button>
            </div>
        `;

        this.drawAttention();
        this.renderAttentionWords();
    },

    attentionSentence: ['The', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'tired'],

    // Predefined attention weights: attentionWeights[sourceWord][targetWord]
    attentionWeights: [
        [0.1, 0.3, 0.1, 0.05, 0.1, 0.2, 0.05, 0.05, 0.02, 0.03],  // The
        [0.15, 0.2, 0.15, 0.05, 0.05, 0.1, 0.05, 0.2, 0.02, 0.03], // cat
        [0.05, 0.15, 0.15, 0.2, 0.05, 0.25, 0.05, 0.03, 0.03, 0.04],// sat
        [0.05, 0.05, 0.15, 0.1, 0.15, 0.35, 0.05, 0.03, 0.03, 0.04],// on
        [0.1, 0.05, 0.05, 0.1, 0.1, 0.45, 0.05, 0.03, 0.03, 0.04], // the
        [0.08, 0.1, 0.15, 0.2, 0.25, 0.1, 0.04, 0.03, 0.02, 0.03], // mat
        [0.02, 0.1, 0.1, 0.05, 0.02, 0.05, 0.1, 0.3, 0.12, 0.14],  // because
        [0.05, 0.45, 0.05, 0.02, 0.02, 0.05, 0.15, 0.1, 0.05, 0.06],// it -> cat!
        [0.02, 0.1, 0.05, 0.02, 0.02, 0.03, 0.1, 0.2, 0.16, 0.3],  // was
        [0.02, 0.2, 0.03, 0.02, 0.02, 0.03, 0.1, 0.15, 0.18, 0.25] // tired
    ],

    renderAttentionWords() {
        const container = document.getElementById('attentionWords');
        if (!container) return;
        container.innerHTML = this.attentionSentence.map((word, i) =>
            `<button class="btn-small ${i === this.selectedWord ? 'btn-primary' : 'btn-secondary'}"
                     onclick="Chapter8.selectWord(${i})"
                     style="min-width:60px;">${word}</button>`
        ).join('');
    },

    selectWord(index) {
        this.selectedWord = index;
        this.drawAttention();
        this.renderAttentionWords();

        const word = this.attentionSentence[index];
        const weights = this.attentionWeights[index];
        const topIdx = weights.indexOf(Math.max(...weights));
        const topWord = this.attentionSentence[topIdx];

        const el = document.getElementById('attentionExplanation');
        if (el) {
            el.innerHTML = `<strong>"${word}"</strong> attends most strongly to <strong>"${topWord}"</strong> ` +
                `(weight: ${(weights[topIdx] * 100).toFixed(0)}%). ` +
                (index === 7 ? 'Cool! "it" pays lots of attention to "cat" because the AI figured out "it" is talking about the cat!' :
                 index === 1 ? '"cat" looks at "it" and "sat" -- the AI found that these words are connected!' :
                 `Self-attention shows how "${word}" is connected to all the other words in the sentence.`);
        }
    },

    drawAttention() {
        const canvas = document.getElementById('attentionCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const words = this.attentionSentence;
        const sel = this.selectedWord;
        const weights = this.attentionWeights[sel];

        // Word positions
        const wordW = W / (words.length + 1);
        const topY = 60;
        const botY = H - 60;

        // Draw attention lines from selected word to all others
        words.forEach((word, i) => {
            const x = wordW * (i + 0.5);
            const weight = weights[i];

            if (i !== sel) {
                const selX = wordW * (sel + 0.5);
                const lineWidth = 1 + weight * 12;
                const alpha = 0.1 + weight * 0.9;

                // Curved attention line
                ctx.beginPath();
                ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                ctx.lineWidth = lineWidth;

                const midY = topY + (botY - topY) * 0.5;
                const cpY = midY - Math.abs(i - sel) * 15;

                ctx.moveTo(selX, topY + 20);
                ctx.quadraticCurveTo((selX + x) / 2, cpY, x, topY + 20);
                ctx.stroke();
            }
        });

        // Draw words
        words.forEach((word, i) => {
            const x = wordW * (i + 0.5);
            const isSelected = i === sel;
            const weight = weights[i];

            // Word background
            ctx.fillStyle = isSelected ? '#6366f1' : `rgba(99, 102, 241, ${0.05 + weight * 0.4})`;
            ctx.beginPath();
            ctx.roundRect(x - 30, topY - 8, 60, 32, 6);
            ctx.fill();

            if (isSelected) {
                ctx.strokeStyle = '#818cf8';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Word text
            ctx.fillStyle = isSelected ? '#fff' : '#e8eaf0';
            ctx.font = isSelected ? 'bold 14px Inter' : '13px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(word, x, topY + 12);

            // Weight label below
            if (!isSelected && weight > 0.05) {
                ctx.fillStyle = '#8b95a8';
                ctx.font = '10px JetBrains Mono';
                ctx.fillText((weight * 100).toFixed(0) + '%', x, topY + 45);
            }
        });

        // Legend
        ctx.fillStyle = '#8b95a8';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Line thickness = attention weight. Click a word to change the source.', W / 2, H - 15);

        // Make canvas clickable
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (W / rect.width);
            words.forEach((word, i) => {
                const x = wordW * (i + 0.5);
                if (Math.abs(mx - x) < 35) {
                    this.selectWord(i);
                }
            });
        };
    },

    guessMask(word) {
        const resultEl = document.getElementById('maskResult');
        const optionsEl = document.getElementById('maskOptions');
        if (!resultEl) return;

        // Highlight all buttons
        const buttons = optionsEl.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.opacity = '0.5';
            btn.disabled = true;
            if (btn.textContent.trim() === 'it') {
                btn.style.background = 'rgba(16,185,129,0.3)';
                btn.style.color = '#10b981';
                btn.style.borderColor = '#10b981';
                btn.style.opacity = '1';
            }
            if (btn.textContent.trim() === word && word !== 'it') {
                btn.style.background = 'rgba(239,68,68,0.3)';
                btn.style.color = '#ef4444';
                btn.style.borderColor = '#ef4444';
                btn.style.opacity = '1';
            }
        });

        if (word === 'it') {
            resultEl.innerHTML = '<strong style="color:#10b981;">You got it!</strong> BERT would also pick "it"! ' +
                'The word "it" is talking about "the cat." BERT figured this out by reading both ' +
                'forward (seeing "cat") AND backward (seeing "was tired"). Smart, right?';
        } else {
            resultEl.innerHTML = `<strong style="color:#ef4444;">Not quite!</strong> You picked "${word}", but BERT ` +
                'would pick <strong>"it"</strong> because "it" is talking about "the cat" and goes with ' +
                '"was tired." BERT figures this out by reading the sentence both forward and backward!';
        }
    },

    startQuiz8_3() {
        Quiz.start({
            title: 'Chapter 8.3: BERT & Transformers',
            chapterId: '8-3',
            questions: [
                {
                    question: 'What cool trick did Transformers use instead of RNNs?',
                    options: [
                        'Convolution',
                        'Self-attention (every word looks at every other word!)',
                        'Recurrence (memory passing)',
                        'Pooling'
                    ],
                    correct: 1,
                    explanation: 'Self-attention lets every word look at every other word at the same time. No more reading one word at a time like RNNs!'
                },
                {
                    question: 'What does "bidirectional" mean in BERT?',
                    options: [
                        'It reads forward and backward at the same time',
                        'It looks at words on BOTH sides (left and right) of each word',
                        'It has two sets of brain layers',
                        'It can translate in two languages'
                    ],
                    correct: 1,
                    explanation: 'BERT is bidirectional because it looks at words both before AND after each word. It sees the whole sentence from both directions!'
                },
                {
                    question: 'Why do Transformers need something called "positional encoding"?',
                    options: [
                        'To train faster',
                        'To make the model smaller',
                        'Because self-attention does not know the order of words without help',
                        'To speak multiple languages'
                    ],
                    correct: 2,
                    explanation: 'Since self-attention looks at all words at once, it does not know which word comes first! Positional encoding tells the model "this word is 1st, this is 2nd," and so on.'
                },
                {
                    question: 'What is multi-head attention?',
                    options: [
                        'Paying attention to many sentences at once',
                        'Running many attention lookups at the same time, each finding different patterns',
                        'Paying attention across many layers',
                        'A trick to make one attention lookup faster'
                    ],
                    correct: 1,
                    explanation: 'Multi-head attention is like having many pairs of eyes! Each pair looks for different things: one finds grammar patterns, another finds word meanings, and so on.'
                },
                {
                    question: 'How does BERT first learn about language (pre-training)?',
                    options: [
                        'By guessing if sentences are happy or sad',
                        'By translating between languages',
                        'By playing fill-in-the-blank (guessing hidden words) and guessing if sentences go together',
                        'By writing stories from left to right'
                    ],
                    correct: 2,
                    explanation: 'BERT plays two games: (1) fill-in-the-blank where it guesses hidden words, and (2) guessing if two sentences belong together. It practices on millions of sentences!'
                }
            ]
        });
    },

    // ============================================
    // 8.4: Model Deployment (TF Serving)
    // ============================================
    requestSending: false,

    loadChapter8_4() {
        const container = document.getElementById('chapter-8-4');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 8 \u2022 Chapter 8.4</span>
                <h1>Model Deployment</h1>
                <p>Training a great AI is only half the job! Putting it online so anyone
                   can use it is called deployment. It is like building a cool app and then
                   putting it in the app store for everyone to download!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFD7\uFE0F</span> Serving Architecture</h2>
                <p>When an AI goes live, other programs can ask it questions over the internet.
                   Think of it like ordering food through an app -- you send a request and get
                   an answer back!</p>

                <div class="network-viz">
                    <canvas id="servingArchCanvas" width="800" height="200"></canvas>
                </div>

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-weight:600;font-size:13px;color:#3b82f6;">REST API</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">A way for programs to ask your AI questions over the internet. Simple and easy!</div>
                    </div>
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-weight:600;font-size:13px;color:#8b5cf6;">gRPC</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">A faster way to talk to the AI. Like using a walkie-talkie instead of writing letters!</div>
                    </div>
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-weight:600;font-size:13px;color:#f59e0b;">Versioning</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Keep different versions, like saving game progress at different levels.</div>
                    </div>
                    <div class="feature-card" style="padding:14px;text-align:center;">
                        <div style="font-weight:600;font-size:13px;color:#10b981;">A/B Testing</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Let two versions compete to see which one does better!</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDE80</span> Simulated API Request</h2>
                <p>Click "Send Request" to pretend you are sending a picture to the AI
                   and asking "What is this?" Watch the message travel and come back with an answer!</p>
                <span class="tag tag-interactive">Interactive</span>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
                    <div>
                        <h3 style="color:#3b82f6;font-size:14px;margin-bottom:8px;">Request</h3>
                        <div class="code-block" id="apiRequest" style="font-size:12px;">
<span class="function">POST</span> <span class="string">/v1/models/image_classifier:predict</span>

{
  <span class="string">"instances"</span>: [{
    <span class="string">"image"</span>: [<span class="number">0.23</span>, <span class="number">0.87</span>, <span class="number">0.45</span>, <span class="string">...</span>],
    <span class="string">"image_size"</span>: [<span class="number">224</span>, <span class="number">224</span>, <span class="number">3</span>]
  }]
}
                        </div>
                    </div>
                    <div>
                        <h3 style="color:#10b981;font-size:14px;margin-bottom:8px;">Response</h3>
                        <div class="code-block" id="apiResponse" style="font-size:12px;min-height:140px;">
<span class="comment">// Waiting for request...</span>
                        </div>
                    </div>
                </div>

                <div style="text-align:center;">
                    <button class="btn-primary" id="sendRequestBtn" onclick="Chapter8.sendRequest()">
                        \uD83D\uDE80 Send Request
                    </button>
                </div>

                <div class="gd-stats" style="margin-top:16px;" id="servingStats">
                    <div class="gd-stat">
                        <div class="stat-label">Latency</div>
                        <div class="stat-value" id="servingLatency" style="color:#6366f1;">--</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Throughput</div>
                        <div class="stat-value" id="servingThroughput" style="color:#10b981;">--</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Model Version</div>
                        <div class="stat-value" id="servingVersion" style="color:#f59e0b;">v3</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Status</div>
                        <div class="stat-value" id="servingStatus" style="color:#8b95a8;">Ready</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCE6</span> Deployment Strategies</h2>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text"><strong>Canary Deployment:</strong> Let just a few people try the new AI version first
                    (like 5 out of 100). If everything works great, slowly let more people use it.
                    It is like taste-testing a new recipe before serving it at a big party!</span>
                </div>

                <div class="info-box warning" style="margin-top:12px;">
                    <span class="info-box-icon">\u26A0\uFE0F</span>
                    <span class="info-box-text"><strong>A/B Testing:</strong> Run two AI versions at the same time and see which one
                    does better! Version A might get more answers right but be slower.
                    Version B might be faster but less accurate. You pick the winner based on results!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Code Example</h2>
                <p>Here is how you save your AI and put it online for everyone to use:</p>

                <div class="code-block">
<span class="comment"># Step 1: Save the trained AI brain</span>
<span class="keyword">import</span> tensorflow <span class="keyword">as</span> tf

model = <span class="function">build_and_train_model</span>()
model.<span class="function">save</span>(<span class="string">'/models/image_classifier/3'</span>)  <span class="comment"># Save as version 3</span>

<span class="comment"># Step 2: Put the AI online with Docker</span>
<span class="comment"># docker run -p 8501:8501 \\</span>
<span class="comment">#   --mount type=bind,source=/models,target=/models \\</span>
<span class="comment">#   -e MODEL_NAME=image_classifier \\</span>
<span class="comment">#   tensorflow/serving</span>

<span class="comment"># Step 3: Ask the AI a question!</span>
<span class="keyword">import</span> requests
<span class="keyword">import</span> json

url = <span class="string">'http://localhost:8501/v1/models/image_classifier:predict'</span>
data = {<span class="string">'instances'</span>: [image_array.<span class="function">tolist</span>()]}
response = requests.<span class="function">post</span>(url, json=data)
predictions = response.<span class="function">json</span>()[<span class="string">'predictions'</span>]

<span class="comment"># Step 4: Check if the AI is working</span>
status_url = <span class="string">'http://localhost:8501/v1/models/image_classifier'</span>
status = requests.<span class="function">get</span>(status_url).<span class="function">json</span>()
<span class="function">print</span>(status)  <span class="comment"># Shows which versions are running</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Test Your Knowledge</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter8.startQuiz8_4()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('8-3')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('8-5')">Next: Model Optimization \u2192</button>
            </div>
        `;

        this.drawServingArchitecture();
    },

    drawServingArchitecture() {
        const canvas = document.getElementById('servingArchCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const boxes = [
            { label: 'Client', sub: '(Browser/App)', x: 40, color: '#3b82f6' },
            { label: 'REST API', sub: '(Load Balancer)', x: 220, color: '#8b5cf6' },
            { label: 'TF Serving', sub: '(Model Server)', x: 420, color: '#f59e0b' },
            { label: 'Model v3', sub: '(SavedModel)', x: 620, color: '#10b981' }
        ];

        boxes.forEach((box, i) => {
            // Box
            ctx.fillStyle = box.color;
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.roundRect(box.x, H / 2 - 35, 140, 70, 10);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = box.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Text
            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(box.label, box.x + 70, H / 2 - 5);
            ctx.fillStyle = '#8b95a8';
            ctx.font = '11px Inter';
            ctx.fillText(box.sub, box.x + 70, H / 2 + 15);

            // Arrow
            if (i < boxes.length - 1) {
                const nextX = boxes[i + 1].x;
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(box.x + 145, H / 2);
                ctx.lineTo(nextX - 5, H / 2);
                ctx.stroke();

                // Arrowhead
                ctx.beginPath();
                ctx.moveTo(nextX - 10, H / 2 - 6);
                ctx.lineTo(nextX - 2, H / 2);
                ctx.lineTo(nextX - 10, H / 2 + 6);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fill();

                // Arrow label
                ctx.fillStyle = '#5a6478';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                const midX = (box.x + 140 + nextX) / 2;
                ctx.fillText(i === 0 ? 'HTTP/gRPC' : i === 1 ? 'Route' : 'Predict', midX, H / 2 - 18);
            }
        });
    },

    sendRequest() {
        if (this.requestSending) return;
        this.requestSending = true;

        const btn = document.getElementById('sendRequestBtn');
        const responseEl = document.getElementById('apiResponse');
        const statusEl = document.getElementById('servingStatus');
        const latencyEl = document.getElementById('servingLatency');
        const throughputEl = document.getElementById('servingThroughput');

        btn.disabled = true;
        btn.textContent = 'Sending...';
        statusEl.textContent = 'Processing';
        statusEl.style.color = '#f59e0b';

        responseEl.innerHTML = '<span class="comment">// Sending request...</span>\n<span class="comment">// Processing on GPU...</span>';

        // Simulate network delay
        const latency = 45 + Math.floor(Math.random() * 30);

        setTimeout(() => {
            responseEl.innerHTML = '<span class="comment">// Decoding input...</span>\n<span class="comment">// Running inference...</span>\n<span class="comment">// Encoding response...</span>';
        }, 400);

        setTimeout(() => {
            const cats = (0.89 + Math.random() * 0.08).toFixed(4);
            const dogs = (0.05 + Math.random() * 0.04).toFixed(4);
            const birds = (1 - parseFloat(cats) - parseFloat(dogs)).toFixed(4);

            responseEl.innerHTML =
`{
  <span class="string">"predictions"</span>: [{
    <span class="string">"class"</span>: <span class="string">"cat"</span>,
    <span class="string">"confidence"</span>: <span class="number">${cats}</span>,
    <span class="string">"all_classes"</span>: {
      <span class="string">"cat"</span>: <span class="number">${cats}</span>,
      <span class="string">"dog"</span>: <span class="number">${dogs}</span>,
      <span class="string">"bird"</span>: <span class="number">${birds}</span>
    }
  }],
  <span class="string">"model_version"</span>: <span class="string">"3"</span>
}`;

            latencyEl.textContent = latency + ' ms';
            throughputEl.textContent = Math.floor(1000 / latency * 100) + ' req/s';
            statusEl.textContent = '200 OK';
            statusEl.style.color = '#10b981';
            btn.disabled = false;
            btn.textContent = '\uD83D\uDE80 Send Request';
            this.requestSending = false;
        }, 800 + latency);
    },

    startQuiz8_4() {
        Quiz.start({
            title: 'Chapter 8.4: Model Deployment',
            chapterId: '8-4',
            questions: [
                {
                    question: 'What file format does TF Serving need?',
                    options: [
                        'HDF5 (.h5)',
                        'SavedModel format (a special folder with all the brain parts)',
                        'Pickle (.pkl)',
                        'ONNX (.onnx)'
                    ],
                    correct: 1,
                    explanation: 'TF Serving needs the SavedModel format. Think of it like saving your game in a special folder that has everything needed to load it back up!'
                },
                {
                    question: 'Why is gRPC faster than REST for talking to the AI?',
                    options: [
                        'It is simpler to set up',
                        'It works in web browsers',
                        'It sends data in a compact code that is faster to read, like shorthand notes',
                        'It needs no settings'
                    ],
                    correct: 2,
                    explanation: 'gRPC packs data into a tiny compact format that is super fast to send and read. REST uses text which is easier to understand but a bit slower, like the difference between texting and calling!'
                },
                {
                    question: 'What is a canary deployment?',
                    options: [
                        'Giving the new AI to everyone at the same time',
                        'Letting only a few people try the new AI first to make sure it works',
                        'Only launching during quiet hours',
                        'Running many AI models at once'
                    ],
                    correct: 1,
                    explanation: 'A canary deployment lets just a few people test the new version first. If everything is good, more people get to use it. It is like taste-testing before the big dinner!'
                },
                {
                    question: 'Why do we keep different versions of the AI model?',
                    options: [
                        'To fill up the hard drive',
                        'So we can go back to an old version if something breaks, and test which one is better',
                        'To make the AI learn faster',
                        'To make the AI smaller'
                    ],
                    correct: 1,
                    explanation: 'Keeping versions is like saving your game at different points. If something goes wrong, you can load an older save! You can also compare versions to pick the best one.'
                }
            ]
        });
    },

    // ============================================
    // 8.5: Model Optimization (Quantization)
    // ============================================
    quantLevel: 0,

    loadChapter8_5() {
        const container = document.getElementById('chapter-8-5');
        container.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-badge">Module 8 \u2022 Chapter 8.5</span>
                <h1>Model Optimization</h1>
                <p>Real-world AI models need to be fast, small, and not waste energy!
                   There are cool tricks to make models smaller and faster without making them
                   much worse at their job. Let's learn about them!</p>
            </div>

            <div class="section">
                <h2><span class="section-icon">\u2699\uFE0F</span> Optimization Techniques</h2>

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">\uD83D\uDD22</div>
                        <div style="font-weight:600;font-size:13px;color:#6366f1;">Quantization</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Use simpler numbers, like rounding 3.14159 to just 3. Smaller and faster!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">\u2702\uFE0F</div>
                        <div style="font-weight:600;font-size:13px;color:#10b981;">Pruning</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Cut away parts that are not doing much, like trimming dead branches off a tree</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">\uD83C\uDF93</div>
                        <div style="font-weight:600;font-size:13px;color:#f59e0b;">Distillation</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">A small student AI learns from a big teacher AI to become almost as smart!</div>
                    </div>
                    <div class="feature-card" style="padding:16px;text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">\uD83D\uDD04</div>
                        <div style="font-weight:600;font-size:13px;color:#8b5cf6;">ONNX</div>
                        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">A universal format so any AI tool can read the model, like a universal charger</div>
                    </div>
                </div>

                <div class="info-box">
                    <span class="info-box-icon">\uD83D\uDCA1</span>
                    <span class="info-box-text">Think of quantization like this: instead of measuring with a super precise ruler
                    (3.14159265...), you just say "about 3." You lose a tiny bit of exactness, but
                    everything gets WAY smaller and faster. Most of the time nobody can tell the difference!</span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDD22</span> Quantization Explorer</h2>
                <p>Move the slider to use simpler numbers and see what happens!
                   Watch how the AI gets smaller and faster, but might lose a tiny bit of accuracy.</p>
                <span class="tag tag-interactive">Interactive</span>

                <div class="controls">
                    <div class="control-group">
                        <label>Quantization Level</label>
                        <input type="range" id="quantSlider" min="0" max="3" value="0" step="1"
                               oninput="Chapter8.updateQuantization()">
                        <span class="slider-value" id="quantLevelLabel">FP32</span>
                    </div>
                </div>

                <div class="gd-stats" id="quantStats">
                    <div class="gd-stat">
                        <div class="stat-label">Precision</div>
                        <div class="stat-value" id="quantPrecision" style="color:#6366f1;">FP32</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Model Size</div>
                        <div class="stat-value" id="quantSize" style="color:#10b981;">400 MB</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Inference Speed</div>
                        <div class="stat-value" id="quantSpeed" style="color:#f59e0b;">1.0x</div>
                    </div>
                    <div class="gd-stat">
                        <div class="stat-label">Accuracy</div>
                        <div class="stat-value" id="quantAccuracy" style="color:#8b5cf6;">92.4%</div>
                    </div>
                </div>

                <div class="graph-container">
                    <canvas id="quantBarCanvas" width="750" height="280"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDCC9</span> Accuracy vs Size Tradeoff</h2>
                <p>This graph shows the big tradeoff. Making the model smaller and faster can
                   make it a little less accurate. The goal is to find the "sweet spot" where
                   it is small AND still smart enough!</p>

                <div class="graph-container">
                    <canvas id="tradeoffCanvas" width="750" height="280"></canvas>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83D\uDC0D</span> Code Example</h2>
                <p>Here is how to make a TensorFlow model smaller using simpler numbers:</p>

                <div class="code-block">
<span class="keyword">import</span> tensorflow <span class="keyword">as</span> tf

<span class="comment"># Load the AI brain we already trained</span>
model = tf.keras.models.<span class="function">load_model</span>(<span class="string">'my_model.h5'</span>)

<span class="comment"># Make it smaller by using simpler numbers</span>
converter = tf.lite.<span class="function">TFLiteConverter</span>.<span class="function">from_keras_model</span>(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]

<span class="comment"># For even simpler numbers (whole numbers only!):</span>
<span class="keyword">def</span> <span class="function">representative_dataset</span>():
    <span class="keyword">for</span> data <span class="keyword">in</span> calibration_data.<span class="function">take</span>(<span class="number">100</span>):
        <span class="keyword">yield</span> [tf.<span class="function">cast</span>(data, tf.float32)]

converter.representative_dataset = representative_dataset
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS_INT8
]
converter.inference_input_type = tf.int8
converter.inference_output_type = tf.int8

<span class="comment"># Shrink it and save the smaller version</span>
tflite_model = converter.<span class="function">convert</span>()
<span class="keyword">with</span> <span class="function">open</span>(<span class="string">'model_quantized.tflite'</span>, <span class="string">'wb'</span>) <span class="keyword">as</span> f:
    f.<span class="function">write</span>(tflite_model)

<span class="comment"># Look how much smaller it got!</span>
<span class="function">print</span>(<span class="string">f"Original: {os.path.getsize('my_model.h5') / 1e6:.1f} MB"</span>)
<span class="function">print</span>(<span class="string">f"Quantized: {len(tflite_model) / 1e6:.1f} MB"</span>)
                </div>
            </div>

            <!-- Module 8 Complete -->
            <div class="section" style="text-align:center;padding:40px 20px;">
                <div style="font-size:48px;margin-bottom:16px;">\uD83C\uDF1F</div>
                <h2 style="color:#10b981;font-size:28px;margin-bottom:12px;">Module 8 Complete!</h2>
                <p style="font-size:18px;max-width:600px;margin:0 auto 20px;line-height:1.6;">
                    Amazing job! You learned about teamwork training, data assembly lines,
                    the super-smart BERT, putting AI online, and making models smaller and faster.
                    Ready for the next adventure?
                </p>
                <div class="info-box success" style="max-width:500px;margin:20px auto;justify-content:center;">
                    <span class="info-box-icon">\uD83D\uDE80</span>
                    <span class="info-box-text">
                        <strong>Coming up next:</strong> Module 9 dives deep into how Transformers work --
                        the super-brain behind modern AI like GPT and image-understanding models!
                    </span>
                </div>
            </div>

            <div class="section">
                <h2><span class="section-icon">\uD83C\uDFAF</span> Final Quiz</h2>
                <span class="tag tag-quiz">Quiz \u2022 4 Questions</span>
                <div class="mt-16">
                    <button class="btn-primary" onclick="Chapter8.startQuiz8_5()">Start Quiz \u2192</button>
                </div>
            </div>

            <div class="chapter-nav">
                <button class="btn-secondary" onclick="App.navigateTo('8-4')">\u2190 Previous</button>
                <button class="btn-primary" onclick="App.navigateTo('9-1')">Next: Transformer Architecture \u2192</button>
            </div>
        `;

        this.updateQuantization();
        this.drawTradeoffCurve();
    },

    quantLevels: [
        { label: 'FP32', size: 400, speed: 1.0, accuracy: 92.4, bits: 32 },
        { label: 'FP16', size: 200, speed: 1.8, accuracy: 92.3, bits: 16 },
        { label: 'INT8', size: 100, speed: 3.2, accuracy: 91.8, bits: 8 },
        { label: 'INT4', size: 50, speed: 4.5, accuracy: 90.1, bits: 4 }
    ],

    updateQuantization() {
        const level = parseInt(document.getElementById('quantSlider')?.value || 0);
        this.quantLevel = level;
        const q = this.quantLevels[level];

        document.getElementById('quantLevelLabel').textContent = q.label;
        document.getElementById('quantPrecision').textContent = q.label;
        document.getElementById('quantSize').textContent = q.size + ' MB';
        document.getElementById('quantSpeed').textContent = q.speed.toFixed(1) + 'x';
        document.getElementById('quantAccuracy').textContent = q.accuracy.toFixed(1) + '%';

        this.drawQuantBars(level);
    },

    drawQuantBars(activeLevel) {
        const canvas = document.getElementById('quantBarCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 30, right: 30, bottom: 50, left: 60 };
        ctx.clearRect(0, 0, W, H);

        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;
        const levels = this.quantLevels;
        const groupW = plotW / levels.length;
        const barW = groupW * 0.3;

        // Title
        ctx.fillStyle = '#8b95a8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Model Size (MB) and Inference Speed (x) by Quantization Level', W / 2, 18);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + plotH * (i / 4);
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();
        }

        // Y axis label
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + plotH * (i / 4);
            ctx.fillText(((4 - i) * 100) + '', pad.left - 8, y + 4);
        }

        levels.forEach((q, i) => {
            const cx = pad.left + groupW * i + groupW / 2;
            const isActive = i === activeLevel;

            // Size bar
            const sizeH = (q.size / 400) * plotH;
            const sizeX = cx - barW - 4;
            const sizeY = pad.top + plotH - sizeH;

            ctx.fillStyle = isActive ? '#6366f1' : 'rgba(99,102,241,0.3)';
            ctx.beginPath();
            ctx.roundRect(sizeX, sizeY, barW, sizeH, [4, 4, 0, 0]);
            ctx.fill();

            // Size label
            ctx.fillStyle = isActive ? '#e8eaf0' : '#8b95a8';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(q.size + 'MB', sizeX + barW / 2, sizeY - 6);

            // Speed bar (scaled: max speed 4.5 -> 450 for chart)
            const speedH = (q.speed / 5.0) * plotH;
            const speedX = cx + 4;
            const speedY = pad.top + plotH - speedH;

            ctx.fillStyle = isActive ? '#10b981' : 'rgba(16,185,129,0.3)';
            ctx.beginPath();
            ctx.roundRect(speedX, speedY, barW, speedH, [4, 4, 0, 0]);
            ctx.fill();

            // Speed label
            ctx.fillStyle = isActive ? '#e8eaf0' : '#8b95a8';
            ctx.fillText(q.speed.toFixed(1) + 'x', speedX + barW / 2, speedY - 6);

            // X axis label
            ctx.fillStyle = isActive ? '#e8eaf0' : '#8b95a8';
            ctx.font = isActive ? 'bold 12px Inter' : '12px Inter';
            ctx.fillText(q.label, cx, pad.top + plotH + 20);
            ctx.font = '10px Inter';
            ctx.fillStyle = '#5a6478';
            ctx.fillText(q.bits + '-bit', cx, pad.top + plotH + 36);
        });

        // Legend
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(W - 160, pad.top + 5, 12, 12);
        ctx.fillStyle = '#8b95a8';
        ctx.fillText('Model Size', W - 142, pad.top + 15);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(W - 160, pad.top + 25, 12, 12);
        ctx.fillStyle = '#8b95a8';
        ctx.fillText('Inference Speed', W - 142, pad.top + 35);
    },

    drawTradeoffCurve() {
        const canvas = document.getElementById('tradeoffCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const pad = { top: 30, right: 40, bottom: 50, left: 70 };
        ctx.clearRect(0, 0, W, H);

        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        // Title
        ctx.fillStyle = '#8b95a8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Accuracy vs Model Size Tradeoff', W / 2, 18);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + plotH * (i / 5);
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();
        }
        for (let i = 0; i <= 5; i++) {
            const x = pad.left + plotW * (i / 5);
            ctx.beginPath();
            ctx.moveTo(x, pad.top);
            ctx.lineTo(x, pad.top + plotH);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top);
        ctx.lineTo(pad.left, pad.top + plotH);
        ctx.lineTo(W - pad.right, pad.top + plotH);
        ctx.stroke();

        // Y axis labels (accuracy)
        ctx.fillStyle = '#5a6478';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + plotH * (i / 5);
            const val = 93 - i * 1;
            ctx.fillText(val.toFixed(0) + '%', pad.left - 8, y + 4);
        }

        // X axis labels (size)
        ctx.textAlign = 'center';
        for (let i = 0; i <= 5; i++) {
            const x = pad.left + plotW * (i / 5);
            const val = i * 100;
            ctx.fillText(val + 'MB', x, pad.top + plotH + 20);
        }

        ctx.fillStyle = '#5a6478';
        ctx.font = '11px Inter';
        ctx.fillText('Model Size', W / 2, pad.top + plotH + 40);

        ctx.save();
        ctx.translate(15, pad.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Accuracy', 0, 0);
        ctx.restore();

        // Tradeoff curve (Pareto front)
        const points = [
            { size: 50, acc: 90.1 },
            { size: 80, acc: 91.2 },
            { size: 100, acc: 91.8 },
            { size: 150, acc: 92.0 },
            { size: 200, acc: 92.3 },
            { size: 300, acc: 92.35 },
            { size: 400, acc: 92.4 },
            { size: 500, acc: 92.42 }
        ];

        const toX = (size) => pad.left + (size / 500) * plotW;
        const toY = (acc) => pad.top + plotH * (1 - (acc - 88) / 5);

        // Curve
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        points.forEach((p, i) => {
            const x = toX(p.size);
            const y = toY(p.acc);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Points for our quantization levels
        const qPoints = this.quantLevels;
        const qColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

        qPoints.forEach((q, i) => {
            const x = toX(q.size);
            const y = toY(q.accuracy);

            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = qColors[i];
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#e8eaf0';
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(q.label, x + 12, y + 4);
        });

        // Sweet spot annotation
        ctx.fillStyle = '#f59e0b';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        const sweetX = toX(100);
        const sweetY = toY(91.8);
        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.moveTo(sweetX, sweetY + 12);
        ctx.lineTo(sweetX, sweetY + 40);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText('Sweet Spot', sweetX, sweetY + 55);
    },

    startQuiz8_5() {
        Quiz.start({
            title: 'Chapter 8.5: Model Optimization',
            chapterId: '8-5',
            questions: [
                {
                    question: 'What does quantization do to a model?',
                    options: [
                        'Adds more layers',
                        'Uses simpler, rounded numbers to make the model smaller and faster',
                        'Gives it more training data',
                        'Changes the shape of the model'
                    ],
                    correct: 1,
                    explanation: 'Quantization rounds the numbers in the model to simpler ones. Like rounding 3.14159 to 3 -- the model gets smaller and faster with only a tiny change in accuracy!'
                },
                {
                    question: 'What is knowledge distillation?',
                    options: [
                        'Cutting away unused parts of the model',
                        'Changing the model to a different file type',
                        'A small student AI learning from a big teacher AI to become almost as smart',
                        'Making the training data smaller'
                    ],
                    correct: 2,
                    explanation: 'Knowledge distillation is like a student learning from a wise teacher. The small student AI watches the big teacher AI and copies its answers until it becomes almost as smart!'
                },
                {
                    question: 'What is the tradeoff when you make numbers really simple (like INT4)?',
                    options: [
                        'It takes longer to train',
                        'The model gets smaller and faster, but might get a few more answers wrong',
                        'It uses more memory',
                        'It gets slower'
                    ],
                    correct: 1,
                    explanation: 'Using really simple numbers makes the model tiny and super fast, but it might make a few more mistakes. It is like writing with a thick marker instead of a fine pen -- faster but less detailed!'
                },
                {
                    question: 'What is ONNX used for?',
                    options: [
                        'Making models learn faster',
                        'A universal format so any AI tool can read the model, like a universal phone charger',
                        'Storing training data',
                        'Drawing pictures of how models look'
                    ],
                    correct: 1,
                    explanation: 'ONNX is like a universal file format for AI models. No matter which tool built the model (PyTorch, TensorFlow, etc.), ONNX lets any other tool open and run it!'
                }
            ]
        });
    }
};
