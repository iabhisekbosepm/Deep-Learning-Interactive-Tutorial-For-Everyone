window.GLOSSARY_MARKDOWN = String.raw`# Deep Learning Tutorial Glossary

This glossary groups the main definitions by chapter so learners can quickly review terms after finishing a lesson.

## Chapter 1: Foundations

### 1.1 Hello Neural Networks
- **Neural network**: A mathematical model made of layers of neurons that learns patterns from examples by adjusting weights and biases.
- **Neuron**: A small computation unit that combines inputs, weights, and a bias to produce an output.
- **Input layer**: The first layer that receives raw data.
- **Hidden layer**: An internal layer that transforms data to detect patterns.
- **Output layer**: The final layer that produces the prediction.
- **Weight**: A learned number that controls how strongly one input influences the next neuron.
- **Bias**: A learned offset added before activation.
- **Softmax**: A function that turns raw output scores into probabilities.

### 1.2 Fashion Detective
- **Dataset**: A collection of examples used to train or test a model.
- **MNIST / Fashion-MNIST style dataset**: A labeled image dataset used for image classification practice.
- **Classification**: Predicting which category an input belongs to.

## Chapter 2: Math Behind the Magic

### 2.1 Activation Functions
- **Activation function**: The formula that turns a neuron's weighted sum into its output.
- **ReLU**: An activation function that keeps positive values and turns negative values into zero.
- **Sigmoid**: An activation function that squashes values into the range 0 to 1.
- **Tanh**: An activation function that squashes values into the range -1 to 1.
- **Leaky ReLU**: A ReLU variant that keeps a small slope for negative inputs.

### 2.2 Derivatives
- **Derivative**: The rate at which one value changes with respect to another.
- **Chain rule**: A derivative rule for combining gradients through multiple functions.

### 2.3 Matrix Math
- **Matrix**: A rectangular grid of numbers used for efficient neural network computation.
- **Matrix multiplication**: The operation used to combine inputs with learned weights across many neurons at once.

### 2.4 Loss Functions
- **Loss**: A number measuring how wrong the model's prediction is.
- **Mean Squared Error (MSE)**: A loss function that averages squared prediction errors.
- **Cross-entropy**: A loss function commonly used for classification.

### 2.5 Gradient Descent
- **Gradient descent**: An optimization method that moves weights in the direction that reduces loss.
- **Learning rate**: The step size used when updating weights.
- **Batch gradient descent**: Uses the full dataset before each update.
- **Stochastic gradient descent (SGD)**: Uses one random example per update.
- **Mini-batch gradient descent**: Uses a small batch of examples per update.

## Chapter 3: Building From Scratch

### 3.1 Neural Network From Scratch
- **Forward pass**: Sending input through the network to get a prediction.
- **Backpropagation**: Sending prediction error backward to compute weight updates.
- **Gradient**: A value that tells a parameter which direction to move and how strongly.

### 3.2 SGD vs GD
- **Optimization strategy**: The rule for how training data is grouped while learning.

## Chapter 4: Training Infrastructure

### 4.1 TensorBoard Dashboard
- **TensorBoard**: A visualization tool for training metrics, graphs, and model internals.
- **Scalar**: A single tracked value, such as loss or accuracy.
- **Histogram**: A plot showing how model values are distributed.

### 4.2 GPU Speed Boost
- **GPU**: A processor optimized for parallel numerical computation.
- **CPU**: A general-purpose processor optimized for flexible sequential work.
- **CUDA core**: A small GPU compute unit used for parallel math.

## Chapter 5: Evaluation and Regularization

### 5.1 Precision & Recall
- **Precision**: The fraction of predicted positives that are truly positive.
- **Recall**: The fraction of actual positives that the model finds.
- **True Positive (TP)**: A correct positive prediction.
- **False Positive (FP)**: An incorrect positive prediction.
- **False Negative (FN)**: A missed positive case.
- **True Negative (TN)**: A correct negative prediction.
- **F1 score**: The harmonic mean of precision and recall.

### 5.2 Dropout & Regularization
- **Overfitting**: When a model memorizes training data and performs poorly on new data.
- **Dropout**: A training technique that randomly disables neurons to reduce overfitting.
- **Regularization**: Any method that discourages overly complex or overly large weights.
- **L1 regularization**: Regularization that encourages weights to become sparse.
- **L2 regularization**: Regularization that discourages large weights smoothly.

### 5.3 Imbalanced Data
- **Imbalanced data**: A dataset where some classes appear much more often than others.
- **Oversampling**: Increasing the number of minority-class examples.
- **Undersampling**: Reducing the number of majority-class examples.
- **SMOTE**: A method that creates synthetic minority examples.
- **Class weights**: Extra loss weight assigned to underrepresented classes.

### 5.4 Churn Prediction
- **Churn prediction**: Predicting which customers are likely to leave a product or service.
- **ROC curve**: A curve showing the tradeoff between true positive rate and false positive rate.
- **AUC**: The area under the ROC curve, used as a ranking-quality metric.

## Chapter 6: Computer Vision

### 6.1 Convolutional Neural Networks
- **CNN**: A network that applies filters across images to detect local patterns.
- **Convolution**: Sliding a filter across an image and computing feature responses.
- **Kernel / Filter**: A small learned weight matrix used in convolution.
- **Feature map**: The output image produced by a convolution filter.
- **Stride**: How far the filter moves at each step.
- **Padding**: Extra border pixels added around an image before convolution.
- **Pooling**: Downsampling an activation map to keep important features while reducing size.

### 6.2 Data Augmentation
- **Data augmentation**: Creating new training examples through transformations of existing data.

### 6.3 Transfer Learning
- **Transfer learning**: Reusing a pretrained model for a new task.
- **Feature extraction**: Freezing most pretrained layers and training only the new head.
- **Fine-tuning**: Unfreezing some pretrained layers and training them gently on the new task.

## Chapter 7: Natural Language Processing

### 7.1 Word Embeddings
- **Embedding**: A learned vector that represents the meaning of a word or token.
- **One-hot encoding**: A sparse vector representation with one active position per word.
- **Dense embedding**: A compact vector representation where meaning is distributed across dimensions.
- **Cosine similarity**: A measure of how closely two vectors point in the same direction.

### 7.2 Word2Vec
- **Word2Vec**: A method for learning word embeddings by predicting nearby words.
- **Context window**: The neighboring tokens around a center token used for training.
- **Skip-gram**: Predicting context words from a center word.
- **CBOW**: Predicting the center word from surrounding context words.

### 7.3 RNN Text Classification
- **RNN**: A recurrent neural network that processes sequences one step at a time.
- **Hidden state**: The running memory carried from one token to the next.
- **Vanishing gradient**: A training problem where old information fades as gradients shrink.
- **LSTM**: A recurrent network with gates that help preserve useful long-range information.
- **GRU**: A simpler gated recurrent unit related to the LSTM.
- **Sentiment analysis**: Predicting whether text expresses positive, negative, or neutral sentiment.

## Chapter 8: Scaling Up NLP Systems

### 8.1 Distributed Training
- **Distributed training**: Training one model across multiple devices.
- **Data parallelism**: Replicating the model across devices while splitting the data.
- **Model parallelism**: Splitting the model itself across devices.
- **All-reduce**: A communication operation used to aggregate gradients across workers.

### 8.2 Data Pipelines
- **Data pipeline**: The system that loads, transforms, batches, and feeds data to the model.
- **Prefetch**: Preparing future batches while the current batch is training.

### 8.3 BERT & Transformers
- **Transformer**: A sequence model built around attention instead of recurrence.
- **Self-attention**: The mechanism that lets each token weigh all other tokens.
- **BERT**: An encoder-only Transformer pretrained to understand bidirectional context.
- **Masked language modeling**: Hiding words and training the model to predict them.
- **Fine-tuning**: Adapting a pretrained model to a specific downstream task.

### 8.4 Model Deployment
- **Deployment**: Turning a trained model into a service used by applications or users.
- **Latency**: The time taken to serve one request.
- **Throughput**: The number of requests served in a period of time.
- **REST API**: A common HTTP interface for serving predictions.
- **gRPC**: A more compact and high-performance RPC interface.
- **Canary deployment**: Releasing a new model version to a small fraction of users first.

### 8.5 Model Optimization
- **Model optimization**: Reducing model size, latency, or cost while keeping useful quality.
- **Quantization**: Storing model values with lower precision.
- **Pruning**: Removing less important parameters.
- **Distillation**: Training a smaller student model to imitate a larger teacher model.
- **ONNX**: A portable model format used across frameworks.

## Chapter 9: Transformer Internals

### 9.1 Transformer Architecture
- **Encoder**: The Transformer stack that reads and contextualizes input.
- **Decoder**: The Transformer stack that generates output autoregressively.
- **Residual connection**: A skip path that adds a layer's input back to its output.
- **Layer normalization**: A normalization step that stabilizes training.

### 9.2 Tokenization & Positional Encoding
- **Tokenization**: Splitting text into subwords, words, or other units the model can process.
- **Positional encoding**: A signal that tells the model where each token appears in the sequence.

### 9.3 Self-Attention Deep Dive
- **Query (Q)**: A learned vector used to ask what information a token wants.
- **Key (K)**: A learned vector describing what information a token offers.
- **Value (V)**: A learned vector carrying the information to be combined.
- **Multi-head attention**: Running multiple attention mechanisms in parallel to capture different relationships.

### 9.4 GPT & Text Generation
- **GPT**: A decoder-only autoregressive Transformer that predicts the next token.
- **Autoregressive generation**: Generating text one token at a time using previous tokens as context.
- **Causal masking**: Preventing the model from looking at future tokens during generation.
- **Temperature**: A sampling control that changes output randomness.

### 9.5 Vision Transformers
- **Vision Transformer (ViT)**: A Transformer that processes image patches as tokens.
- **Patch embedding**: Converting each image patch into a vector token.
- **[CLS] token**: A special token used to summarize the whole image for classification.

## Chapter 10: Large Language Models & Alignment

### 10.1 GPT Revolution & Scaling Laws
- **Scaling laws**: Patterns that relate model quality to model size, data size, and compute.
- **Parameter**: A learned adjustable value inside the model.
- **Emergent abilities**: Skills that appear as models grow in scale and training quality.

### 10.2 In-Context Learning
- **In-context learning**: Learning a pattern from examples in the prompt without changing weights.
- **Zero-shot prompting**: Giving no examples.
- **One-shot prompting**: Giving one example.
- **Few-shot prompting**: Giving a small number of examples.
- **Context window**: The amount of text the model can consider at once.

### 10.3 Chain-of-Thought Reasoning
- **Chain-of-Thought (CoT)**: Prompting the model to show intermediate reasoning steps.
- **Self-consistency**: Sampling multiple reasoning paths and choosing the most common result.
- **Tree of Thought**: Exploring multiple branching reasoning paths before selecting an answer.

### 10.4 RLHF & Instruction Tuning
- **Instruction tuning**: Training a model on prompt-response examples so it follows instructions better.
- **RLHF**: Reinforcement Learning from Human Feedback.
- **Reward model**: A model trained to score outputs based on human preferences.
- **PPO**: A reinforcement learning algorithm commonly used in RLHF pipelines.

### 10.5 Advanced Alignment
- **Constitutional AI**: Alignment by having the model critique and revise its own responses using a rule set.
- **DPO**: Direct Preference Optimization, which learns from preferred vs rejected outputs directly.

## Chapter 11: Generative AI & Multimodal

### 11.1 Diffusion Models
- **Diffusion model**: A generative model that learns to reverse gradually added noise.
- **Noise**: Random corruption added to data during diffusion training.
- **U-Net**: The denoiser network commonly used in diffusion models.

### 11.2 Text-to-Image
- **Text-to-image model**: A generative model guided by text prompts to produce images.
- **Guidance**: The strength of prompt conditioning during denoising.
- **Negative prompt**: Text specifying what should be avoided in the generated image.

### 11.3 Vision-Language Models
- **Vision-language model**: A model that understands both image and text inputs in a shared space.
- **CLIP**: A contrastive image-text model used for matching images and captions.
- **VQA**: Visual Question Answering, where the model answers questions about an image.

### 11.4 Text-to-Video & Audio
- **Keyframe**: An important anchor frame used to guide video generation.
- **Frame interpolation**: Filling in frames between keyframes to create smooth motion.

### 11.5 Multimodal Foundation Models
- **Multimodal model**: A foundation model trained across multiple data types such as text, image, audio, or video.

## Chapter 12: Frontier Model Architectures

### 12.1 State Space Models & Mamba
- **State space model**: A sequence model that keeps a running state instead of full pairwise attention.
- **Mamba**: A selective state space model optimized for long-context efficiency.

### 12.2 Mixture of Experts
- **Mixture of Experts (MoE)**: A model with many expert subnetworks where only a few activate per token.
- **Router**: The mechanism that decides which experts each token should use.
- **Load balancing**: Encouraging traffic to spread across experts instead of overusing a few.

### 12.3 LoRA & QLoRA
- **LoRA**: Low-Rank Adaptation, a parameter-efficient fine-tuning method.
- **Rank**: The small dimensionality used in LoRA adapters.
- **QLoRA**: Running LoRA on top of a quantized base model.
- **Adapter**: A small trainable component inserted into a frozen model.

### 12.4 RAG
- **Retrieval-Augmented Generation (RAG)**: Generating answers using retrieved external knowledge.
- **Vector embedding**: A dense numeric representation used for similarity search.
- **Vector database**: A database optimized for searching embeddings.
- **Cosine similarity**: A standard retrieval similarity measure for embeddings.

### 12.5 AI Agents
- **Agent**: A multi-step AI system that can reason, use tools, and act.
- **ReAct**: A loop where the model alternates reasoning and acting with tools.
- **Tool**: An external function or system an agent can call.
- **Multi-agent system**: Several specialized agents collaborating on one task.

## Chapter 13: Efficient Attention & Inference

### 13.1 FlashAttention
- **FlashAttention**: An attention algorithm that avoids materializing the full attention matrix in memory.
- **HBM**: High-bandwidth memory on GPUs, large but slower than on-chip memory.
- **SRAM**: Small fast on-chip memory used for temporary computation.
- **Online softmax**: A softmax computation trick used while processing attention in blocks.

### 13.2 Sparse Attention
- **Sparse attention**: Attention that considers only a selected subset of tokens instead of all pairs.
- **DSA**: DeepSeek Sparse Attention, a data-dependent sparse attention strategy.

### 13.3 MLA
- **MLA**: Multi-Head Latent Attention, which compresses attention state into a latent representation.
- **KV cache**: Stored keys and values reused during autoregressive decoding.
- **Latent vector**: A compressed intermediate representation.

### 13.4 KV Cache & Paged Attention
- **Paged Attention**: Managing KV cache in memory pages rather than large fixed blocks.
- **Virtual-memory-style paging**: Allocating memory chunks on demand to reduce waste.

### 13.5 Speculative Decoding & Continuous Batching
- **Speculative decoding**: Using a small draft model to propose tokens that a larger model verifies.
- **Continuous batching**: Dynamically refilling batch slots as requests finish.

## Chapter 14: Reasoning Systems

### 14.1 Reasoning Models & Thinking Tokens
- **Reasoning model**: A model designed to generate useful intermediate reasoning before answering.
- **Thinking token**: An internal reasoning token used during hidden scratch-work.

### 14.2 Process Reward Models & GRPO
- **Process Reward Model (PRM)**: A reward model that scores intermediate reasoning steps.
- **Outcome Reward Model (ORM)**: A reward model that scores only the final answer.
- **GRPO**: Group Relative Policy Optimization, a preference optimization method comparing outputs within a sampled group.

### 14.3 Tree of Thought & Self-Verification
- **Tree of Thought**: Exploring multiple branches of reasoning instead of one straight chain.
- **Self-verification**: Checking whether an answer is consistent with evidence or a reverse calculation.
- **MCTS**: Monte Carlo Tree Search, a search method for exploring decision trees.

### 14.4 Synthetic Data & Self-Play
- **Synthetic data**: Training data generated by models instead of humans.
- **Rejection sampling**: Keeping only the best generated samples.
- **Self-play**: Learning by competing against copies of oneself.
- **Distillation**: Teaching a smaller student model using a stronger teacher model.

### 14.5 DeepSeek & RAGEN
- **RAGEN**: A framework or pattern for training tool-using reasoning agents.
- **MLA / MoE / DSA combination**: A set of efficiency techniques combined in advanced reasoning systems.

## Chapter 15: Production LLM Systems

### 15.1 Quantization
- **Quantization**: Reducing the numeric precision used to store model weights.
- **FP16 / INT8 / INT4**: Different numeric precisions used for model storage and inference.
- **GPTQ**: A post-training quantization approach that quantizes layer by layer.
- **AWQ**: Activation-Aware Quantization, which protects important weights more carefully.
- **GGUF**: A model format used for efficient local inference, often with \`llama.cpp\`.

### 15.2 Distributed Training
- **Tensor parallelism**: Splitting computations inside a layer across devices.
- **Pipeline parallelism**: Splitting model layers across devices in sequence.
- **ZeRO**: Zero Redundancy Optimizer, which partitions optimizer states, gradients, and parameters.

### 15.3 Inference Engines
- **Inference engine**: The runtime that serves a trained model to users.
- **Prefill**: Processing the full prompt before generation begins.
- **Decode**: Generating new tokens one at a time.
- **Throughput**: Requests or tokens served per unit time.
- **Latency**: Time to complete one request.
- **vLLM**: A high-performance LLM serving engine using paged attention and continuous batching.

### 15.4 External Memory
- **External memory**: Information stored outside model weights that the model can look up later.
- **Episodic memory**: Stored records of past interactions or events.
- **Working memory**: Temporary task state used during reasoning.
- **Knowledge graph**: A structured graph of entities and relationships.

### 15.5 Frontier Research & Completion
- **Frontier research**: Work on the newest and most capable model architectures, training methods, and deployment systems.
`;
