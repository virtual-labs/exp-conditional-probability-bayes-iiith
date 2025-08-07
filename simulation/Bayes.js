class BayesTreeGame {
    constructor() {
        this.canvas = document.getElementById('bayesCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.scenario = null;
        this.currentQuestion = null;
        this.correctAnswer = 0;
        this.userAnswer = null;
        this.streak = 0;
        this.selectedLeaf = null;
        this.showingSolution = false;
        
        // Visual settings
        this.treeWidth = 600;
        this.treeHeight = 500;
        this.clickableLeaves = [];
        
        this.setupCanvas();
        this.generateScenario();
        this.drawTree();
        
        // Setup answer input
        document.getElementById('answerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        
        // Setup canvas click handler
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = Math.min(800, container.clientWidth - 20);
        const containerHeight = 600; // Increased height for vertical tree
        
        this.canvas.style.width = containerWidth + 'px';
        this.canvas.style.height = containerHeight + 'px';
        
        const scale = window.devicePixelRatio || 1;
        this.canvas.width = containerWidth * scale;
        this.canvas.height = containerHeight * scale;
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(scale, scale);
        
        this.drawTree();
    }
    
    generateScenario() {
        const scenarios = [
            {
                name: "Medical Test",
                event: "Has Disease",
                test: "Tests Positive",
                baseRate: 0.01, // 1% have disease
                sensitivity: 0.95, // 95% test positive if have disease
                specificity: 0.98, // 98% test negative if no disease
                emoji: "🏥",
                color1: "#ff6b6b",
                color2: "#4ecdc4"
            },
            {
                name: "Email Spam",
                event: "Is Spam",
                test: "Contains 'Free'",
                baseRate: 0.3, // 30% are spam
                sensitivity: 0.8, // 80% of spam contains "free"
                specificity: 0.95, // 95% of non-spam don't contain "free"
                emoji: "📧",
                color1: "#ff9ff3",
                color2: "#54a0ff"
            },
            {
                name: "Weather Prediction",
                event: "Will Rain",
                test: "Cloudy Morning",
                baseRate: 0.2, // 20% chance of rain
                sensitivity: 0.9, // 90% of rainy days start cloudy
                specificity: 0.7, // 70% of non-rainy days don't start cloudy
                emoji: "🌧️",
                color1: "#5f27cd",
                color2: "#00d2d3"
            }
        ];
        
        this.scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        // Calculate all probabilities
        const P_A = this.scenario.baseRate;
        const P_not_A = 1 - P_A;
        const P_B_given_A = this.scenario.sensitivity;
        const P_B_given_not_A = 1 - this.scenario.specificity;
        const P_not_B_given_A = 1 - P_B_given_A;
        const P_not_B_given_not_A = this.scenario.specificity;
        
        // Calculate joint probabilities
        const P_A_and_B = P_A * P_B_given_A;
        const P_A_and_not_B = P_A * P_not_B_given_A;
        const P_not_A_and_B = P_not_A * P_B_given_not_A;
        const P_not_A_and_not_B = P_not_A * P_not_B_given_not_A;
        
        // Calculate P(B)
        const P_B = P_A_and_B + P_not_A_and_B;
        
        // Calculate Bayes' theorem result: P(A|B)
        const P_A_given_B = P_A_and_B / P_B;
        
        this.scenario.probabilities = {
            P_A, P_not_A, P_B_given_A, P_B_given_not_A,
            P_not_B_given_A, P_not_B_given_not_A,
            P_A_and_B, P_A_and_not_B, P_not_A_and_B, P_not_A_and_not_B,
            P_B, P_A_given_B
        };
        
        this.generateQuestion();
    }
    
    generateQuestion() {
        // Only Bayes' theorem questions (P(A|B) and P(not A|B))
        const probs = this.scenario.probabilities;
        const event = this.scenario.event;
        const test = this.scenario.test;
        const questions = [
            {
                text: `What's the probability of having ${event.toLowerCase()} given ${test.toLowerCase()}?`,
                answer: probs.P_A_given_B,
                type: "bayes",
                formula: `P(${event}|${test}) = P(${test}|${event}) × P(${event}) / P(${test})`
            },
            {
                text: `What's the probability of not having ${event.toLowerCase()} given ${test.toLowerCase()}?`,
                answer: 1 - probs.P_A_given_B,
                type: "bayes_not",
                formula: `P(not ${event}|${test}) = 1 - P(${event}|${test})`
            }
        ];

        this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        this.correctAnswer = this.currentQuestion.answer;

        document.getElementById('scenarioTitle').textContent = `${this.scenario.emoji} ${this.scenario.name}`;
        document.getElementById('questionText').textContent = this.currentQuestion.text;
        document.getElementById('answerInput').value = '';
        document.getElementById('feedback').classList.add('hidden');
        document.getElementById('answerInput').focus();
    }
    
    drawTree() {
        if (!this.scenario) return;
        const ctx = this.ctx;
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        this.clickableLeaves = [];

        // --- Dynamic radius calculation for each level ---
        // Root
        ctx.font = 'bold 14px Arial';
        let rootText = 'Population';
        let rootRadius = Math.ceil(ctx.measureText(rootText).width / 2) + 10;


        // Level 1 (minimal padding)
        ctx.font = 'bold 12px Arial';
        let l1Texts = [this.scenario.event, `No ${this.scenario.event}`];
        let l1Radius = Math.max(...l1Texts.map(t => Math.ceil(ctx.measureText(t).width / 2) - 5));

        // Level 2 (minimal padding)
        ctx.font = 'bold 11px Arial';
        let l2Texts = [this.scenario.test, `No ${this.scenario.test}`];
        let l2Radius = Math.max(...l2Texts.map(t => Math.ceil(ctx.measureText(t).width / 2) - 15));

        // Leaves (numbers only)
        ctx.font = 'bold 12px Arial';
        let leafTexts = [
            (this.scenario.probabilities.P_A_and_B * 100).toFixed(3) + "%",
            (this.scenario.probabilities.P_A_and_not_B * 100).toFixed(3) + "%",
            (this.scenario.probabilities.P_not_A_and_B * 100).toFixed(3) + "%",
            (this.scenario.probabilities.P_not_A_and_not_B * 100).toFixed(3) + "%"
        ];
        let leafRadius = Math.max(...leafTexts.map(t => Math.ceil(ctx.measureText(t).width / 2) + 8));

        // --- Node positions ---
        const centerX = canvasWidth / 2;
        const startY = 50;
        const level1Y = 150;
        const level2Y = 300;
        const leafY = 450;

        // Root node
        this.drawNode(centerX, startY, rootText, "#333", 14, rootRadius);

        // Level 1: Disease status (wider spacing)
        const diseaseX = centerX - 120;
        const noDiseaseX = centerX + 120;
        this.drawNode(diseaseX, level1Y, this.scenario.event, this.scenario.color1, 12, l1Radius);
        this.drawNode(noDiseaseX, level1Y, `No ${this.scenario.event}`, this.scenario.color1, 12, l1Radius);

        // Draw branches to level 1
        this.drawVerticalBranch(centerX, startY + rootRadius, diseaseX, level1Y - l1Radius, 
                               (this.scenario.probabilities.P_A * 100).toFixed(1) + "%", this.scenario.color1);
        this.drawVerticalBranch(centerX, startY + rootRadius, noDiseaseX, level1Y - l1Radius, 
                               (this.scenario.probabilities.P_not_A * 100).toFixed(1) + "%", this.scenario.color1);

        // Level 2: Test results (even wider spacing)
        const testPositive1X = diseaseX - 80;
        const testNegative1X = diseaseX + 80;
        const testPositive2X = noDiseaseX - 80;
        const testNegative2X = noDiseaseX + 80;
        this.drawNode(testPositive1X, level2Y, this.scenario.test, this.scenario.color2, 11, l2Radius);
        this.drawNode(testNegative1X, level2Y, `No ${this.scenario.test}`, this.scenario.color2, 11, l2Radius);
        this.drawNode(testPositive2X, level2Y, this.scenario.test, this.scenario.color2, 11, l2Radius);
        this.drawNode(testNegative2X, level2Y, `No ${this.scenario.test}`, this.scenario.color2, 11, l2Radius);

        // Draw branches to level 2
        this.drawVerticalBranch(diseaseX, level1Y + l1Radius, testPositive1X, level2Y - l2Radius,
                               (this.scenario.probabilities.P_B_given_A * 100).toFixed(1) + "%", this.scenario.color2);
        this.drawVerticalBranch(diseaseX, level1Y + l1Radius, testNegative1X, level2Y - l2Radius,
                               (this.scenario.probabilities.P_not_B_given_A * 100).toFixed(1) + "%", this.scenario.color2);
        this.drawVerticalBranch(noDiseaseX, level1Y + l1Radius, testPositive2X, level2Y - l2Radius,
                               (this.scenario.probabilities.P_B_given_not_A * 100).toFixed(1) + "%", this.scenario.color2);
        this.drawVerticalBranch(noDiseaseX, level1Y + l1Radius, testNegative2X, level2Y - l2Radius,
                               (this.scenario.probabilities.P_not_B_given_not_A * 100).toFixed(1) + "%", this.scenario.color2);

        // Draw clickable leaves with joint probabilities
        const leaf1 = this.drawClickableLeaf(testPositive1X, leafY, leafTexts[0], "#e74c3c", "has_disease_and_positive", leafRadius);
        const leaf2 = this.drawClickableLeaf(testNegative1X, leafY, leafTexts[1], "#95a5a6", "has_disease_and_negative", leafRadius);
        const leaf3 = this.drawClickableLeaf(testPositive2X, leafY, leafTexts[2], "#f39c12", "no_disease_and_positive", leafRadius);
        const leaf4 = this.drawClickableLeaf(testNegative2X, leafY, leafTexts[3], "#27ae60", "no_disease_and_negative", leafRadius);

        // Draw lines to leaves
        this.drawVerticalBranch(testPositive1X, level2Y + l2Radius, testPositive1X, leafY - leafRadius, "", "#666");
        this.drawVerticalBranch(testNegative1X, level2Y + l2Radius, testNegative1X, leafY - leafRadius, "", "#666");
        this.drawVerticalBranch(testPositive2X, level2Y + l2Radius, testPositive2X, leafY - leafRadius, "", "#666");
        this.drawVerticalBranch(testNegative2X, level2Y + l2Radius, testNegative2X, leafY - leafRadius, "", "#666");

        this.clickableLeaves = [leaf1, leaf2, leaf3, leaf4];

        // Highlight solution if showing
        if (this.showingSolution) {
            this.highlightSolution();
        }

        // (Removed: Show marginal probability calculation in canvas)
    }
    
    drawNode(x, y, text, color, fontSize, radius) {
        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = "#333";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw text
        this.ctx.fillStyle = "white";
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        
        const words = text.split(' ');
        if (words.length > 2) {
            this.ctx.fillText(words.slice(0, 2).join(' '), x, y - 6);
            this.ctx.fillText(words.slice(2).join(' '), x, y + 6);
        } else if (words.length > 1) {
            this.ctx.fillText(words[0], x, y - 6);
            this.ctx.fillText(words.slice(1).join(' '), x, y + 6);
        } else {
            this.ctx.fillText(text, x, y);
        }
    }
    
    drawVerticalBranch(x1, y1, x2, y2, label, color) {
        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Draw label if provided
        if (label) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(midX - 25, midY - 8, 50, 16);
            this.ctx.strokeStyle = color;
            this.ctx.strokeRect(midX - 25, midY - 8, 50, 16);
            
            this.ctx.fillStyle = "#333";
            this.ctx.font = "bold 11px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(label, midX, midY);
        }
    }
    
    drawClickableLeaf(x, y, text, color, id, radius) {
        const leaf = { x, y, radius, text, color, id };
        // Highlight if selected
        const isSelected = this.selectedLeaf === id;
        this.ctx.beginPath();
        this.ctx.arc(x, y, leaf.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = isSelected ? "#ffff00" : color;
        this.ctx.fill();
        this.ctx.strokeStyle = isSelected ? "#ff6600" : "#333";
        this.ctx.lineWidth = isSelected ? 4 : 2;
        this.ctx.stroke();
        // Draw text
        this.ctx.fillStyle = isSelected ? "#333" : "white";
        this.ctx.font = "bold 12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, x, y);
        // Add click hint
        if (!isSelected) {
            this.ctx.fillStyle = "#666";
            this.ctx.font = "10px Arial";
            this.ctx.fillText("click", x, y + radius + 15);
        }
        return leaf;
    }
    
    drawMarginalInfo(x, y) {
        // Show P(Test Positive) calculation
        this.ctx.fillStyle = "#333";
        this.ctx.font = "bold 14px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`P(${this.scenario.test}):`, x, y);
        
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`${(this.scenario.probabilities.P_A_and_B * 100).toFixed(3)}% + ${(this.scenario.probabilities.P_not_A_and_B * 100).toFixed(3)}%`, x, y + 20);
        this.ctx.fillText(`= ${(this.scenario.probabilities.P_B * 100).toFixed(1)}%`, x, y + 35);
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX / (window.devicePixelRatio || 1);
        const y = (e.clientY - rect.top) * scaleY / (window.devicePixelRatio || 1);
        
        // Check if click is on any leaf
        for (const leaf of this.clickableLeaves) {
            const distance = Math.sqrt((x - leaf.x) ** 2 + (y - leaf.y) ** 2);
            if (distance <= leaf.radius) {
                this.selectedLeaf = this.selectedLeaf === leaf.id ? null : leaf.id;
                this.drawTree();
                this.showLeafInfo(leaf);
                break;
            }
        }
    }
    
    showLeafInfo(leaf) {
        // Show what the node means in probability terms
        let info = "";
        const scenario = this.scenario;
        switch (leaf.id) {
            case "has_disease_and_positive":
                info = `Path: ${scenario.event} → ${scenario.test}<br><em>This node represents P(${scenario.event} AND ${scenario.test}) = P(${scenario.event}) × P(${scenario.test}|${scenario.event})</em>`;
                break;
            case "has_disease_and_negative":
                info = `Path: ${scenario.event} → No ${scenario.test}<br><em>This node represents P(${scenario.event} AND not ${scenario.test}) = P(${scenario.event}) × P(not ${scenario.test}|${scenario.event})</em>`;
                break;
            case "no_disease_and_positive":
                info = `Path: No ${scenario.event} → ${scenario.test}<br><em>This node represents P(not ${scenario.event} AND ${scenario.test}) = P(not ${scenario.event}) × P(${scenario.test}|not ${scenario.event})</em>`;
                break;
            case "no_disease_and_negative":
                info = `Path: No ${scenario.event} → No ${scenario.test}<br><em>This node represents P(not ${scenario.event} AND not ${scenario.test}) = P(not ${scenario.event}) × P(not ${scenario.test}|not ${scenario.event})</em>`;
                break;
        }
        this.showFeedback(info, 'info');
    }
    
    highlightSolution() {
        if (!this.currentQuestion) return;
        
        // Set up highlighting style
        this.ctx.strokeStyle = "#ffff00";
        this.ctx.lineWidth = 6;
        this.ctx.globalAlpha = 0.8;
        
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const centerX = canvasWidth / 2;
        const startY = 50;
        const level1Y = 150;
        const level2Y = 300;
        const leafY = 450;
        
        const diseaseX = centerX - 120;
        const noDiseaseX = centerX + 120;
        const testPositive1X = diseaseX - 80;
        const testPositive2X = noDiseaseX - 80;
        const testNegative1X = diseaseX + 80;
        const testNegative2X = noDiseaseX + 80;
        
        if (this.currentQuestion.type === "bayes") {
            // Highlight paths that lead to positive test (relevant for Bayes calculation)
            this.ctx.beginPath();
            this.ctx.moveTo(diseaseX, level1Y + 30);
            this.ctx.lineTo(testPositive1X, level2Y - 25);
            this.ctx.lineTo(testPositive1X, leafY - 20);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(noDiseaseX, level1Y + 30);
            this.ctx.lineTo(testPositive2X, level2Y - 25);
            this.ctx.lineTo(testPositive2X, leafY - 20);
            this.ctx.stroke();
        } else if (this.currentQuestion.type === "marginal") {
            // Highlight all paths that lead to the test being positive (for marginal probability)
            this.ctx.beginPath();
            this.ctx.moveTo(diseaseX, level1Y + 30);
            this.ctx.lineTo(testPositive1X, level2Y - 25);
            this.ctx.lineTo(testPositive1X, leafY - 20);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(noDiseaseX, level1Y + 30);
            this.ctx.lineTo(testPositive2X, level2Y - 25);
            this.ctx.lineTo(testPositive2X, leafY - 20);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1.0;
        
        // (Removed: Draw solution explanation box in canvas)
    }
    
    // (Removed: drawSolutionExplanation method and all related code)
    
    checkAnswer() {
        const userInput = document.getElementById('answerInput').value.trim();
        // Accept up to 3 decimal places, ignore extra
        let userAnswer;
        if (userInput.includes('%')) {
            userAnswer = parseFloat(userInput.replace('%', '')) / 100;
        } else {
            userAnswer = parseFloat(userInput);
        }
        // Round to 3 decimal places for comparison
        if (!isNaN(userAnswer)) {
            userAnswer = Math.round(userAnswer * 1000) / 1000;
        }
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a valid number or percentage', 'error');
            return;
        }
        const correctRounded = Math.round(this.correctAnswer * 1000) / 1000;
        const tolerance = 0.01; // 1% tolerance
        const isCorrect = Math.abs(userAnswer - correctRounded) < tolerance;
        if (isCorrect) {
            this.streak++;
            this.showFeedback(`🎉 Correct! The answer is ${(correctRounded * 100).toFixed(3)}%`, 'success');
            setTimeout(() => this.newScenario(), 2000);
        } else {
            this.streak = 0;
            let explanation = `❌ Incorrect. Your answer: ${(userAnswer * 100).toFixed(3)}%\n\n`;
            explanation += `The correct answer is ${(correctRounded * 100).toFixed(3)}%\n\n`;
            if (this.currentQuestion.type === "bayes") {
                explanation += `Using Bayes' Theorem:\n`;
                explanation += `P(${this.scenario.event}|${this.scenario.test}) = `;
                explanation += `P(${this.scenario.test}|${this.scenario.event}) × P(${this.scenario.event}) / P(${this.scenario.test})\n`;
                explanation += `= ${(this.scenario.probabilities.P_B_given_A * 100).toFixed(3)}% × ${(this.scenario.probabilities.P_A * 100).toFixed(3)}% / ${(this.scenario.probabilities.P_B * 100).toFixed(3)}%\n`;
                explanation += `= ${(correctRounded * 100).toFixed(3)}%`;
            } else {
                explanation += `P(${this.scenario.test}) = P(${this.scenario.test}|${this.scenario.event}) × P(${this.scenario.event}) + P(${this.scenario.test}|No ${this.scenario.event}) × P(No ${this.scenario.event})\n`;
                explanation += `= ${(this.scenario.probabilities.P_B_given_A * 100).toFixed(3)}% × ${(this.scenario.probabilities.P_A * 100).toFixed(3)}% + ${(this.scenario.probabilities.P_B_given_not_A * 100).toFixed(3)}% × ${(this.scenario.probabilities.P_not_A * 100).toFixed(3)}%\n`;
                explanation += `= ${(correctRounded * 100).toFixed(3)}%`;
            }
            this.showFeedback(explanation, 'error');
            setTimeout(() => this.newScenario(), 5000);
        }
        this.updateStats();
    }
    
    showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedback');
        feedbackElement.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-blue-100', 'text-green-800', 'text-red-800', 'text-blue-800');
        
        if (type === 'success') {
            feedbackElement.classList.add('bg-green-100', 'text-green-800');
        } else if (type === 'error') {
            feedbackElement.classList.add('bg-red-100', 'text-red-800');
        } else if (type === 'info') {
            feedbackElement.classList.add('bg-blue-100', 'text-blue-800');
        }
        
        feedbackElement.innerHTML = message.replace(/\n/g, '<br>');
    }
    
    showSolution() {
        this.showingSolution = !this.showingSolution;
        this.drawTree();
        const btn = document.getElementById('solutionBtnText');
        if (btn) btn.textContent = this.showingSolution ? 'Hide Solution' : 'Show Solution';
        // Hide any probability values in the UI (if present)
        const probHints = document.querySelectorAll('.prob-hint');
        probHints.forEach(el => el.classList.add('hidden'));

        // Use a modal popup for the solution
        let modal = document.getElementById('solutionModal');
        let modalContent = document.getElementById('solutionModalContent');
        if (!modal) {
            // Create modal HTML if not present
            modal = document.createElement('div');
            modal.id = 'solutionModal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
            modal.innerHTML = `
                <div id="solutionModalContent" class="bg-white max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
                    <button id="closeSolutionModal" class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold">&times;</button>
                    <div id="solutionModalBody"></div>
                </div>
            `;
            document.body.appendChild(modal);
            modalContent = document.getElementById('solutionModalContent');
            // Close on X button
            document.getElementById('closeSolutionModal').onclick = () => {
                modal.style.display = 'none';
                this.showingSolution = false;
                const btn = document.getElementById('solutionBtnText');
                if (btn) btn.textContent = 'Show Solution';
            };
            // Close on clicking outside modal content
            modal.addEventListener('mousedown', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    this.showingSolution = false;
                    const btn = document.getElementById('solutionBtnText');
                    if (btn) btn.textContent = 'Show Solution';
                }
            });
        }

        if (this.showingSolution) {
            // Prepare the step-by-step solution for each question type
            const problemStatement = document.getElementById('questionText').textContent;
            const probs = this.scenario.probabilities;
            const event = this.scenario.event;
            const test = this.scenario.test;
            let formula = "";
            let substitution = "";
            let calculation = "";
            let answer = "";
            let showSteps = true;

            // Helper for 3 decimal rounding
            const r3 = v => (typeof v === 'number' ? (Math.round(v * 1000) / 1000) : v);
            const r3s = v => (typeof v === 'number' ? r3(v).toFixed(3) : v);

            switch (this.currentQuestion.type) {
                case "bayes": {
                    formula = `P(${event}|${test}) = P(${test}|${event}) × P(${event}) / P(${test})`;
                    // Denominator step
                    const denomExplain = `<span class='font-semibold text-indigo-700'>Step 1: Calculate the Denominator (Total Probability of ${test})</span><br>
                        <span class='text-gray-700'>We need the probability of observing <b>${test}</b> in general, regardless of whether <b>${event}</b> happens or not. This is called the marginal probability.</span><br><br>
                        <span class='font-mono bg-gray-100 px-2 py-1 rounded'>P(${test}) = P(${test}|${event}) × P(${event}) + P(${test}|not ${event}) × P(not ${event})</span>`;
                    const denomSub = `<span class='text-gray-700'>Substitute the values:</span><br>
                        <span class='font-mono bg-gray-50 px-2 py-1 rounded'>= (${r3s(probs.P_B_given_A)} × ${r3s(probs.P_A)}) + (${r3s(probs.P_B_given_not_A)} × ${r3s(probs.P_not_A)})</span>`;
                    const denomCalc = `<span class='text-gray-700'>Calculate each part:</span><br>
                        <span class='font-mono bg-gray-50 px-2 py-1 rounded'>= ${r3s(probs.P_B_given_A * probs.P_A)} + ${r3s(probs.P_B_given_not_A * probs.P_not_A)}</span>`;
                    const denomFinal = `<span class='text-gray-700'>Add them up:</span><br>
                        <span class='font-mono bg-gray-50 px-2 py-1 rounded'>= ${r3s(probs.P_B)}</span>`;
                    // Numerator step
                    const numExplain = `<span class='font-semibold text-indigo-700'>Step 2: Calculate the Numerator (Joint Probability)</span><br>
                        <span class='text-gray-700'>This is the probability that both <b>${event}</b> and <b>${test}</b> occur together.</span><br><br>
                        <span class='font-mono bg-gray-100 px-2 py-1 rounded'>P(${test}|${event}) × P(${event}) = ${r3s(probs.P_B_given_A)} × ${r3s(probs.P_A)} = ${r3s(probs.P_B_given_A * probs.P_A)}</span>`;
                    // Bayes' calculation
                    const bayesCalc = `<span class='font-semibold text-indigo-700'>Step 3: Apply Bayes' Theorem</span><br>
                        <span class='text-gray-700'>Divide the numerator by the denominator to get the conditional probability:</span><br><br>
                        <span class='font-mono bg-green-100 px-2 py-1 rounded'>${r3s(probs.P_B_given_A * probs.P_A)} / ${r3s(probs.P_B)} = ${r3s(probs.P_A_given_B)}</span>`;
                    substitution = `<span class='font-mono bg-blue-50 px-2 py-1 rounded'>P(${event}|${test}) = (${r3s(probs.P_B_given_A)} × ${r3s(probs.P_A)}) / ${r3s(probs.P_B)}</span>`;
                    calculation = `<div class='mb-6 p-4 bg-white rounded-lg shadow space-y-6'>
                        <div>${denomExplain}</div>
                        <div class='ml-6'>${denomSub}</div>
                        <div class='ml-6'>${denomCalc}</div>
                        <div class='ml-6 mb-4'>${denomFinal}</div>
                        <div>${numExplain}</div>
                        <div class='mt-4'>${bayesCalc}</div>
                    </div>`;
                    answer = `<span class='font-bold text-green-700 text-lg'>P(${event}|${test}) = ${r3s(probs.P_A_given_B)}</span>`;
                    break;
                }
                case "bayes_not": {
                    formula = `P(not ${event}|${test}) = 1 - P(${event}|${test})`;
                    substitution = `P(not ${event}|${test}) = 1 - ${r3s(probs.P_A_given_B)}`;
                    calculation = `P(not ${event}|${test}) = ${r3s(1 - probs.P_A_given_B)}`;
                    answer = `P(not ${event}|${test}) = ${r3s(1 - probs.P_A_given_B)}`;
                    break;
                }
                default:
                    formula = "";
                    substitution = "";
                    calculation = "";
                    answer = r3s(this.correctAnswer);
            }

            let solutionHTML = `<div class="text-left space-y-3">
                <div><strong>Problem:</strong> ${problemStatement}</div>
                <div><strong>Formula:</strong> ${formula}</div>
                <div><strong>Substitute:</strong> ${substitution}</div>`;
            if (showSteps && calculation) {
                solutionHTML += `<div><strong>Calculate:</strong> ${calculation}</div>`;
            }
            solutionHTML += `<div><strong>Final Answer:</strong> <span class=\"text-indigo-700 font-bold\">${answer}</span></div></div>`;

            document.getElementById('solutionModalBody').innerHTML = solutionHTML;
            modal.style.display = 'flex';
        } else {
            if (modal) modal.style.display = 'none';
        }
    }
    
    updateStats() {
        document.getElementById('streakCount').textContent = this.streak;
    }
    
    newScenario() {
        this.selectedLeaf = null;
        this.showingSolution = false;
        this.generateScenario();
        this.drawTree();
        document.getElementById('feedback').classList.add('hidden');
        // Always reset the solution button text
        const btn = document.getElementById('solutionBtnText');
        if (btn) btn.textContent = 'Show Solution';
    }
}

// Global instance
let bayesApp;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    bayesApp = new BayesTreeGame();
});

// Control functions
function checkAnswer() {
    if (bayesApp) bayesApp.checkAnswer();
}

function newScenario() {
    if (bayesApp) bayesApp.newScenario();
}

function showSolution() {
    if (bayesApp) bayesApp.showSolution();
}