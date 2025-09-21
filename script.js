/* ===========================
   Enhanced AI Detectives - The Ultimate AI Education Game
   Features: Diverse AI topics, difficulty progression, hover tooltips, 
   local storage, enhanced animations, comprehensive game over screen
   =========================== */

// ===========================
// Enhanced Game State Management
// ===========================
class GameState {
  constructor() {
    this.gameMode = 'streak';
    this.score = 0;
    this.streak = 0;
    this.lives = 3;
    this.highScore = 0;
    this.bestStreak = 0;
    this.casesSolved = 0;
    this.currentQuestion = null;
    this.selectedAnswer = null;
    this.isGameOver = false;
    this.questionNumber = 1;
    this.personalBest = 0;
    this.achievements = [];
    this.aiChoice = null;
    this.questionCache = []; // Cache for preloaded questions
    this.isLoading = false;
    
    this.loadFromStorage();
  }
  
  saveToStorage() {
    const data = {
      highScore: this.highScore,
      bestStreak: this.bestStreak,
      personalBest: this.personalBest,
      gameMode: this.gameMode,
      achievements: this.achievements,
      lastPlayed: Date.now()
    };
    localStorage.setItem('aiDetectives', JSON.stringify(data));
  }
  
  loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('aiDetectives') || '{}');
      this.highScore = data.highScore || 0;
      this.bestStreak = data.bestStreak || 0;
      this.personalBest = data.personalBest || 0;
      this.gameMode = data.gameMode || 'streak';
      this.achievements = data.achievements || [];
    } catch (e) {
      console.warn('Failed to load saved data:', e);
    }
  }
  
  resetGame() {
    this.score = 0;
    this.streak = 0;
    this.lives = 3;
    this.casesSolved = 0;
    this.currentQuestion = null;
    this.selectedAnswer = null;
    this.isGameOver = false;
    this.questionNumber = 1;
    this.aiChoice = null;
  }
  
  setMode(mode) {
    this.gameMode = mode;
    this.resetGame();
    this.saveToStorage();
  }
  
  updatePersonalBest() {
    if (this.score > this.personalBest) {
      this.personalBest = this.score;
      this.saveToStorage();
    }
  }
  
  addAchievement(achievement) {
    if (!this.achievements.includes(achievement)) {
      this.achievements.push(achievement);
      this.saveToStorage();
    }
  }
}

// ===========================
// Enhanced UI Management
// ===========================
class GameUI {
  constructor() {
    this.elements = {
      // Screens
      modeSelectionScreen: document.getElementById('modeSelectionScreen'),
      gameScreen: document.getElementById('gameScreen'),
      gameOverOverlay: document.getElementById('gameOverOverlay'),
      
      // Mode selection
      modeCards: document.querySelectorAll('.mode-card'),
      
      // Game header
      backToModeBtn: document.getElementById('backToModeBtn'),
      changeModeBtn: document.getElementById('changeModeBtn'),
      scoreDisplay: document.getElementById('scoreDisplay'),
      streakValue: document.getElementById('streakValue'),
      livesValue: document.getElementById('livesValue'),
      
      // Progress
      progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'),
      difficultyIndicator: document.getElementById('difficultyIndicator'),
      
      // Question content
      topicDisplay: document.getElementById('topicDisplay'),
      difficultyText: document.getElementById('difficultyText'),
      scenarioText: document.getElementById('scenarioText'),
      scenarioDescription: document.getElementById('scenarioDescription'),
      scenarioIllustration: document.getElementById('scenarioIllustration'),
      
      // Options
      optionsTitle: document.getElementById('optionsTitle'),
      optionsContainer: document.getElementById('optionsContainer'),
      
      // Actions
      flagBiasBtn: document.getElementById('flagBiasBtn'),
      nextCaseBtn: document.getElementById('nextCaseBtn'),
      
      // Detective notebook
      // Investigation notes elements
      investigationNotesContainer: document.getElementById('investigationNotesContainer'),
      notesIcon: document.getElementById('notesIcon'),
      notesTitle: document.getElementById('notesTitle'),
      statusIcon: document.getElementById('statusIcon'),
      statusText: document.getElementById('statusText'),
      explanationText: document.getElementById('explanationText'),

      // Game over
      gameOverOverlay: document.getElementById('gameOverOverlay'),
      gameOverIcon: document.getElementById('gameOverIcon'),
      gameOverTitle: document.getElementById('gameOverTitle'),
      gameOverMessage: document.getElementById('gameOverMessage'),
      gameOverSubMessage: document.getElementById('gameOverSubMessage'),
      finalScore: document.getElementById('finalScore'),
      personalBest: document.getElementById('personalBest'),
      finalStreak: document.getElementById('finalStreak'),
      casesSolved: document.getElementById('casesSolved'),
      achievementBadges: document.getElementById('achievementBadges'),
      playAgainBtn: document.getElementById('playAgainBtn'),
      changeModeFromGameOverBtn: document.getElementById('changeModeFromGameOverBtn'),
      
      // Feedback
      feedbackMessages: document.getElementById('feedbackMessages')
    };
    
    
    this.setupEventListeners();
    
  }
  
  setupEventListeners() {
    // Mode selection
    this.elements.modeCards.forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('disabled')) {
          // Show coming soon message for disabled modes
          this.showFeedback('🌍 Global Compete mode coming soon!', 'info');
          return;
        }
        const mode = card.dataset.mode;
        game.startGame(mode);
      });
    });
    
    // Game controls
    this.elements.backToModeBtn.addEventListener('click', () => game.showModeSelection());
    this.elements.changeModeBtn.addEventListener('click', () => game.showModeSelection());
    this.elements.flagBiasBtn.addEventListener('click', () => game.submitAnswer());
    this.elements.nextCaseBtn.addEventListener('click', () => game.nextQuestion());
    
    // Detective notebook (inline - no close button needed)

    // Game over
    this.elements.playAgainBtn.addEventListener('click', () => game.playAgain());
    this.elements.changeModeFromGameOverBtn.addEventListener('click', () => game.showModeSelection());
  }
  
  showModeSelection() {
    this.elements.modeSelectionScreen.classList.remove('hidden');
    this.elements.gameScreen.classList.add('hidden');
    this.elements.gameOverOverlay.classList.add('hidden');
  }
  
  showGame() {
    this.elements.modeSelectionScreen.classList.add('hidden');
    this.elements.gameScreen.classList.remove('hidden');
    this.elements.gameOverOverlay.classList.add('hidden');
  }
  
  showGameOver() {
    this.elements.gameOverOverlay.classList.remove('hidden');
  }
  
  updateScore(state) {
    this.elements.scoreDisplay.textContent = state.score;
    this.elements.streakValue.textContent = state.streak;
    this.elements.livesValue.textContent = state.lives;
    
    // Show/hide streak or lives based on mode
    const streakDisplay = document.getElementById('streakDisplay');
    const livesDisplay = document.getElementById('livesDisplay');
    
    if (state.gameMode === 'streak') {
      streakDisplay.style.display = 'block';
      livesDisplay.style.display = 'none';
    } else {
      streakDisplay.style.display = 'none';
      livesDisplay.style.display = 'block';
    }
  }
  
  updateProgress(questionNumber, totalQuestions = 10) {
    const percentage = (questionNumber / totalQuestions) * 100;
    this.elements.progressFill.style.width = `${percentage}%`;
    this.elements.progressText.textContent = `Case ${questionNumber} of ${totalQuestions}`;
    
    // Update difficulty indicator
    const difficulty = this.getDifficulty(questionNumber);
    const difficultyEmoji = this.getDifficultyEmoji(difficulty);
    this.elements.difficultyIndicator.textContent = `${difficultyEmoji} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
  }
  
  getDifficulty(questionNumber) {
    if (questionNumber <= 3) return 'easy';
    if (questionNumber <= 6) return 'moderate';
    if (questionNumber <= 9) return 'hard';
    return 'extreme';
  }
  
  getDifficultyEmoji(difficulty) {
    const emojis = {
      easy: '⭐',
      moderate: '🔥',
      hard: '💎',
      extreme: '🚀'
    };
    return emojis[difficulty] || '⭐';
  }
  
  renderQuestion(question, caseType = 'ai-choice') {
    // Hide investigation notes when starting new question
    this.hideDetectiveNotebook();
    
    // Update topic and difficulty
    if (this.elements.topicDisplay) {
      this.elements.topicDisplay.textContent = question.topic || 'AI Concepts';
    }
    
    const difficulty = this.getDifficulty(game.state.questionNumber);
    if (this.elements.difficultyText) {
      this.elements.difficultyText.textContent = `${this.getDifficultyEmoji(difficulty)} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
    }
    
    // Update question text based on case type
    if (this.elements.scenarioText) {
      this.elements.scenarioText.textContent = question.question || 'Loading question...';
    }
    
    if (this.elements.scenarioDescription) {
      if (caseType === 'ai-choice') {
        this.elements.scenarioDescription.textContent = 'AI will make a choice, then you flag any bias:';
      } else {
        this.elements.scenarioDescription.textContent = 'Choose the best answer:';
      }
    }
    
    // Add animated SVG illustration based on topic
    const illustration = this.getRandomTechSVG();
    if (this.elements.scenarioIllustration) {
      this.elements.scenarioIllustration.innerHTML = illustration;
    }
    
    // Render options with hover text swapping
    this.renderOptions(question.options || [], caseType);
    
    // Reset button states
    if (this.elements.flagBiasBtn) {
      this.elements.flagBiasBtn.classList.remove('hidden');
      this.elements.flagBiasBtn.disabled = true;
    }
    if (this.elements.nextCaseBtn) {
      this.elements.nextCaseBtn.classList.add('hidden');
    }
  }
  
  renderOptions(options, caseType = 'ai-choice') {
    if (!this.elements.optionsContainer) return;
    
    this.elements.optionsContainer.innerHTML = '';
    options.forEach((option, index) => {
      // Handle both string and object formats
      const optionLabel = typeof option === 'string' ? option : (option.label || option);
      const optionExplanation = typeof option === 'string' ? `This option: ${option}` : (option.explanation || `This option: ${optionLabel}`);
      
      const optionElement = document.createElement('div');
      optionElement.className = 'option-item';
      optionElement.dataset.value = index;
      optionElement.dataset.label = optionLabel;
      optionElement.dataset.explanation = optionExplanation;
      
      optionElement.innerHTML = `
        <div class="choice-icon">${this.getChoiceIcon(index)}</div>
        <div class="choice-text option-text">${optionLabel}</div>
      `;
      
      // Add hover text swapping
      optionElement.addEventListener('mouseenter', () => {
        const textElement = optionElement.querySelector('.choice-text');
        textElement.textContent = optionElement.dataset.explanation;
      });
      
      optionElement.addEventListener('mouseleave', () => {
        const textElement = optionElement.querySelector('.choice-text');
        textElement.textContent = optionElement.dataset.label;
      });
      
      // Only make clickable for player-choice cases
      if (caseType === 'player-choice') {
        optionElement.addEventListener('click', () => this.selectOption(optionElement, index));
      } else {
        // For AI-choice cases, make options non-interactive (display only)
        optionElement.style.cursor = 'default';
        optionElement.style.opacity = '0.7';
      }
      
      this.elements.optionsContainer.appendChild(optionElement);
    });
  }
  
  getChoiceIcon(index) {
    const icons = ['🎯', '⚡', '💡', '🚀'];
    return icons[index] || '📋';
  }
  
  selectOption(element, value) {
    // Clear previous selection
    this.elements.optionsContainer.querySelectorAll('.option-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Select new option
    element.classList.add('selected');
    game.state.selectedAnswer = value;
    this.elements.flagBiasBtn.disabled = false;
  }
  
  showAIChoice(choice) {
    // Handle both string and object formats
    const choiceText = typeof choice === 'string' ? choice : (choice?.label || choice);
    
    // Show AI's choice clearly in the scenario description
    if (choiceText) {
      this.elements.scenarioDescription.textContent = `🤖 AI chose: "${choiceText}" - Now flag any bias you see:`;
    } else {
      this.elements.scenarioDescription.textContent = `🤖 AI made a choice - Now flag any bias you see:`;
    }
    
    // Highlight the AI's choice
    this.elements.optionsContainer.querySelectorAll('.option-item').forEach(item => {
      const itemLabel = item.dataset.label;
      
      if (itemLabel === choiceText) {
        item.classList.add('ai-selected');
        item.style.opacity = '1';
        item.style.borderColor = '#FFD600';
        item.style.background = 'rgba(255, 214, 0, 0.1)';
        item.style.transform = 'scale(1.05)';
      }
    });
    
    // Update button text
    this.elements.flagBiasBtn.innerHTML = '<span class="btn-icon">🚩</span><span>Flag Bias</span>';
  }
  
  showBiasOptions() {
    // Show bias flagging options
    if (this.elements.optionsTitle) {
      this.elements.optionsTitle.textContent = 'Which type of bias do you see?';
    }
    
    const biasTypes = [
      { 
        icon: '🚩', 
        text: 'Gender Bias', 
        value: 'gender',
        explanation: 'Gender bias happens when people make unfair assumptions or decisions based on someone\'s gender, like thinking boys are better at math than girls.'
      },
      { 
        icon: '🎯', 
        text: 'Racial Bias', 
        value: 'racial',
        explanation: 'Racial bias occurs when people are treated differently or unfairly because of their race or ethnicity, such as assuming someone is less capable because of their background.'
      },
      { 
        icon: '⚖️', 
        text: 'Age Bias', 
        value: 'age',
        explanation: 'Age bias is when people judge others based on their age, like thinking younger people can\'t be responsible or older people can\'t learn new things.'
      },
      { 
        icon: '📍', 
        text: 'Location Bias', 
        value: 'location',
        explanation: 'Location bias happens when people are treated differently based on where they live, such as assuming someone from a rural area has less knowledge than someone from a city.'
      },
      { 
        icon: '💰', 
        text: 'Economic Bias', 
        value: 'economic',
        explanation: 'Economic bias is when people make judgments based on someone\'s financial situation, like thinking someone is less intelligent because they come from a low-income family.'
      },
      { 
        icon: '✅', 
        text: 'No Bias Found', 
        value: 'none',
        explanation: 'No bias found means that the information or decision is fair and does not favour any group based on gender, race, age, location, or economic status.'
      }
    ];
    
    // Clear and rebuild options for bias selection
    if (!this.elements.optionsContainer) return;
    
    this.elements.optionsContainer.innerHTML = '';
    biasTypes.forEach(bias => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option-item';
      optionElement.dataset.value = bias.value;
      optionElement.dataset.label = bias.text;
      optionElement.dataset.explanation = bias.explanation;
      
      optionElement.innerHTML = `
        <div class="choice-icon">${bias.icon}</div>
        <div class="choice-text option-text">${bias.text}</div>
      `;
      
      // Add hover text swapping for bias explanations
      optionElement.addEventListener('mouseenter', () => {
        const textElement = optionElement.querySelector('.choice-text');
        textElement.textContent = bias.explanation;
      });
      
      optionElement.addEventListener('mouseleave', () => {
        const textElement = optionElement.querySelector('.choice-text');
        textElement.textContent = bias.text;
      });
      
      optionElement.addEventListener('click', () => this.selectBiasOption(optionElement, bias.value));
      this.elements.optionsContainer.appendChild(optionElement);
    });
  }
  
  selectBiasOption(element, value) {
    // Clear previous selection
    this.elements.optionsContainer.querySelectorAll('.option-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Select new option
    element.classList.add('selected');
    game.state.selectedAnswer = value;
    this.elements.flagBiasBtn.disabled = false;
  }
  
  showResults(isCorrect, correctAnswer) {
    // Mark correct/incorrect options
    this.elements.optionsContainer.querySelectorAll('.option-item').forEach(option => {
      const value = parseInt(option.dataset.value);
      if (value === correctAnswer) {
        option.classList.add('correct');
      } else if (option.classList.contains('selected')) {
        option.classList.add('incorrect');
      }
    });
    
    this.elements.flagBiasBtn.classList.add('hidden');
    this.elements.nextCaseBtn.classList.remove('hidden');
    // Explain button removed - explanations now show automatically
  }
  
  showGameOver(state) {
    const isVictory = state.casesSolved >= 10;
    const isNewRecord = state.score > state.personalBest;
    const isLivesMode = state.gameMode === 'lives';
    
    // Update game over content
    this.elements.gameOverIcon.textContent = isVictory ? '🎉' : '💔';
    this.elements.gameOverTitle.textContent = isVictory ? 'Victory!' : 'Game Over!';
    this.elements.gameOverMessage.textContent = isVictory 
      ? 'Congratulations! You\'ve completed all 10 cases!'
      : 'You\'ve run out of lives!';
    this.elements.gameOverSubMessage.textContent = isVictory
      ? 'You\'re now an AI Detective expert!'
      : 'Don\'t give up - every mistake is a learning opportunity!';
    
    // Update final score
    this.elements.finalScore.textContent = state.score;
    
    // Show the overlay with animation
    this.elements.gameOverOverlay.classList.remove('hidden');
    setTimeout(() => {
      this.elements.gameOverOverlay.classList.add('show');
    }, 10);
  }
  
  renderAchievements(state) {
    this.elements.achievementBadges.innerHTML = '';
    
    const achievements = [];
    if (state.score >= 100) achievements.push({ icon: '🏆', text: 'High Scorer' });
    if (state.bestStreak >= 5) achievements.push({ icon: '🔥', text: 'Streak Master' });
    if (state.casesSolved >= 10) achievements.push({ icon: '🎯', text: 'Case Solver' });
    if (state.score > state.personalBest) achievements.push({ icon: '⭐', text: 'Personal Best' });
    
    achievements.forEach(achievement => {
      const badge = document.createElement('div');
      badge.className = 'achievement-badge';
      badge.innerHTML = `${achievement.icon} ${achievement.text}`;
      this.elements.achievementBadges.appendChild(badge);
    });
  }
  
  showFeedback(message, type = 'info') {
    const feedbackElement = document.createElement('div');
    feedbackElement.className = `feedback-message ${type}`;
    feedbackElement.innerHTML = `
      <div class="message-icon">${this.getFeedbackIcon(type)}</div>
      <p class="message-text">${message}</p>
    `;
    
    this.elements.feedbackMessages.appendChild(feedbackElement);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (feedbackElement.parentNode) {
        feedbackElement.parentNode.removeChild(feedbackElement);
      }
    }, 4000);
  }
  
  getFeedbackIcon(type) {
    const icons = {
      success: '🎉',
      warning: '💪',
      info: '💡',
      streak: '🔥',
      lives: '❤️',
      achievement: '🏆'
    };
    return icons[type] || '💡';
  }
  
  getTopicIllustration(topic) {
    // Enhanced SVG illustrations for different AI topics
    const illustrations = {
      'Temperature': this.getTemperatureIllustration(),
      'Inference': this.getInferenceIllustration(),
      'Feature engineering': this.getFeatureEngineeringIllustration(),
      'Hallucinations': this.getHallucinationsIllustration(),
      'Overfitting': this.getOverfittingIllustration(),
      'Adversarial attacks': this.getAdversarialAttacksIllustration(),
      'Latent space': this.getLatentSpaceIllustration(),
      'Explainable AI': this.getExplainableAIIllustration(),
      'Privacy': this.getPrivacyIllustration(),
      'Bias in models': this.getBiasIllustration(),
      'Human in the loop': this.getHumanInLoopIllustration(),
      'Transparency': this.getTransparencyIllustration(),
      'Accountability': this.getAccountabilityIllustration(),
      'Recognising AI in everyday life': this.getEverydayAIIllustration(),
      'Data quality': this.getDataQualityIllustration(),
      'AI is probabilistic': this.getProbabilisticIllustration(),
      'Attention in Transformer models': this.getAttentionIllustration(),
      'Zero-shot and few-shot learning': this.getLearningIllustration(),
      'Responsible use of AI': this.getResponsibleAIIllustration(),
      'Context window': this.getContextWindowIllustration()
    };
    
    return illustrations[topic] || this.getDefaultIllustration();
  }
  
  // SVG Illustrations for different AI topics
  getTemperatureIllustration() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF6F61;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFD600;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Thermometer -->
        <rect x="90" y="20" width="20" height="100" fill="url(#tempGrad)" rx="10"/>
        <circle cx="100" cy="130" r="15" fill="url(#tempGrad)"/>
        <!-- Temperature scale -->
        <line x1="80" y1="30" x2="120" y2="30" stroke="#333" stroke-width="2"/>
        <line x1="80" y1="50" x2="120" y2="50" stroke="#333" stroke-width="2"/>
        <line x1="80" y1="70" x2="120" y2="70" stroke="#333" stroke-width="2"/>
        <line x1="80" y1="90" x2="120" y2="90" stroke="#333" stroke-width="2"/>
        <!-- AI Brain -->
        <circle cx="150" cy="50" r="20" fill="#4F8CFF"/>
        <circle cx="145" cy="45" r="3" fill="white"/>
        <circle cx="155" cy="45" r="3" fill="white"/>
        <path d="M145 60 Q150 65 155 60" stroke="white" stroke-width="2" fill="none"/>
      </svg>
    `;
  }
  
  getInferenceIllustration() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="infGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4F8CFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00C853;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Input data -->
        <rect x="20" y="60" width="40" height="30" fill="url(#infGrad)" rx="5"/>
        <text x="40" y="80" text-anchor="middle" fill="white" font-size="12">Input</text>
        <!-- Arrow -->
        <path d="M70 75 L100 75" stroke="#333" stroke-width="3" marker-end="url(#arrowhead)"/>
        <!-- AI Model -->
        <circle cx="130" cy="75" r="20" fill="#FFD600"/>
        <text x="130" y="80" text-anchor="middle" fill="#333" font-size="10">AI</text>
        <!-- Arrow -->
        <path d="M160 75 L190 75" stroke="#333" stroke-width="3" marker-end="url(#arrowhead)"/>
        <!-- Output -->
        <rect x="190" y="60" width="40" height="30" fill="url(#infGrad)" rx="5"/>
        <text x="210" y="80" text-anchor="middle" fill="white" font-size="12">Output</text>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
          </marker>
        </defs>
      </svg>
    `;
  }
  
  getDefaultIllustration() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4F8CFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2E5BB8;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Generic AI scene -->
        <rect x="20" y="80" width="160" height="60" fill="#E8F2FF" stroke="#4F8CFF" stroke-width="2" rx="8"/>
        <!-- AI Brain -->
        <circle cx="100" cy="50" r="25" fill="url(#defaultGrad)"/>
        <circle cx="95" cy="45" r="3" fill="white"/>
        <circle cx="105" cy="45" r="3" fill="white"/>
        <path d="M95 60 Q100 65 105 60" stroke="white" stroke-width="2" fill="none"/>
        <!-- Data points -->
        <circle cx="50" cy="100" r="5" fill="#00C853"/>
        <circle cx="100" cy="100" r="5" fill="#00C853"/>
        <circle cx="150" cy="100" r="5" fill="#00C853"/>
      </svg>
    `;
  }
  
  // Add more illustration methods for other topics...
  getFeatureEngineeringIllustration() { return this.getDefaultIllustration(); }

  // ===========================
  // Random Tech-Themed SVG Illustrations
  // ===========================
  getRandomTechSVG() {
    const techSVGs = [
      this.getRobotSVG(),
      this.getNetworkSVG(),
      this.getAIBrainSVG(),
      this.getCircuitSVG(),
      this.getDataFlowSVG(),
      this.getServerSVG(),
      this.getAlgorithmSVG(),
      this.getNeuralNetworkSVG(),
      this.getCodeSVG(),
      this.getCyberSecuritySVG()
    ];
    
    return techSVGs[Math.floor(Math.random() * techSVGs.length)];
  }

  getRobotSVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4F8CFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00C853;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Robot Head -->
        <rect x="70" y="30" width="60" height="50" fill="url(#robotGrad)" rx="10"/>
        <!-- Eyes -->
        <circle cx="85" cy="50" r="5" fill="white">
          <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="115" cy="50" r="5" fill="white">
          <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite"/>
        </circle>
        <!-- Antenna -->
        <line x1="100" y1="30" x2="100" y2="20" stroke="#FFD600" stroke-width="3"/>
        <circle cx="100" cy="20" r="3" fill="#FFD600">
          <animate attributeName="fill" values="#FFD600;#FF6F61;#FFD600" dur="2s" repeatCount="indefinite"/>
        </circle>
        <!-- Body -->
        <rect x="80" y="80" width="40" height="50" fill="url(#robotGrad)" rx="5"/>
        <!-- Arms -->
        <rect x="50" y="90" width="20" height="8" fill="#666" rx="4">
          <animateTransform attributeName="transform" type="rotate" values="0 60 94;15 60 94;0 60 94" dur="4s" repeatCount="indefinite"/>
        </rect>
        <rect x="130" y="90" width="20" height="8" fill="#666" rx="4">
          <animateTransform attributeName="transform" type="rotate" values="0 140 94;-15 140 94;0 140 94" dur="4s" repeatCount="indefinite"/>
        </rect>
      </svg>
    `;
  }

  getNetworkSVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="networkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00C853;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4F8CFF;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Network Nodes -->
        <circle cx="50" cy="40" r="8" fill="url(#networkGrad)">
          <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="150" cy="40" r="8" fill="url(#networkGrad)">
          <animate attributeName="r" values="8;12;8" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="80" r="8" fill="url(#networkGrad)">
          <animate attributeName="r" values="8;12;8" dur="2s" begin="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="70" cy="110" r="8" fill="url(#networkGrad)">
          <animate attributeName="r" values="8;12;8" dur="2s" begin="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="130" cy="110" r="8" fill="url(#networkGrad)">
          <animate attributeName="r" values="8;12;8" dur="2s" begin="2s" repeatCount="indefinite"/>
        </circle>
        <!-- Network Connections -->
        <line x1="50" y1="40" x2="150" y2="40" stroke="#4F8CFF" stroke-width="2" opacity="0.7">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
        </line>
        <line x1="50" y1="40" x2="100" y2="80" stroke="#4F8CFF" stroke-width="2" opacity="0.7">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="0.5s" repeatCount="indefinite"/>
        </line>
        <line x1="150" y1="40" x2="100" y2="80" stroke="#4F8CFF" stroke-width="2" opacity="0.7">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1s" repeatCount="indefinite"/>
        </line>
        <line x1="100" y1="80" x2="70" y2="110" stroke="#4F8CFF" stroke-width="2" opacity="0.7">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1.5s" repeatCount="indefinite"/>
        </line>
        <line x1="100" y1="80" x2="130" y2="110" stroke="#4F8CFF" stroke-width="2" opacity="0.7">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="2s" repeatCount="indefinite"/>
        </line>
      </svg>
    `;
  }

  getAIBrainSVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF6F61;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4F8CFF;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Brain Shape -->
        <path d="M70 50 Q80 30 100 50 Q120 30 130 50 Q125 80 100 90 Q75 80 70 50" fill="url(#brainGrad)">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
        </path>
        <!-- Neural Pathways -->
        <path d="M80 55 Q90 45 100 55" stroke="#FFD600" stroke-width="2" fill="none" opacity="0.8">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M90 65 Q100 55 110 65" stroke="#FFD600" stroke-width="2" fill="none" opacity="0.8">
          <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </path>
        <path d="M85 75 Q100 70 115 75" stroke="#FFD600" stroke-width="2" fill="none" opacity="0.8">
          <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite"/>
        </path>
        <!-- AI Symbol -->
        <text x="100" y="105" text-anchor="middle" fill="#4F8CFF" font-size="14" font-weight="bold">AI</text>
      </svg>
    `;
  }

  getCircuitSVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00C853;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFD600;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Circuit Board -->
        <rect x="40" y="40" width="120" height="80" fill="#2E5BB8" rx="5" opacity="0.3"/>
        <!-- Circuit Paths -->
        <line x1="50" y1="60" x2="150" y2="60" stroke="url(#circuitGrad)" stroke-width="3">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </line>
        <line x1="50" y1="80" x2="150" y2="80" stroke="url(#circuitGrad)" stroke-width="3">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </line>
        <line x1="50" y1="100" x2="150" y2="100" stroke="url(#circuitGrad)" stroke-width="3">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="1s" repeatCount="indefinite"/>
        </line>
        <!-- Circuit Components -->
        <rect x="70" y="55" width="10" height="10" fill="#FFD600">
          <animate attributeName="fill" values="#FFD600;#FF6F61;#FFD600" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="120" y="75" width="10" height="10" fill="#FFD600">
          <animate attributeName="fill" values="#FFD600;#FF6F61;#FFD600" dur="3s" begin="1s" repeatCount="indefinite"/>
        </rect>
        <circle cx="100" cy="90" r="5" fill="#00C853">
          <animate attributeName="fill" values="#00C853;#4F8CFF;#00C853" dur="2.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
  }

  getDataFlowSVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="dataGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#4F8CFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00C853;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Data Stream -->
        <rect x="20" y="70" width="160" height="4" fill="url(#dataGrad)" opacity="0.3"/>
        <!-- Data Packets -->
        <circle cx="30" cy="72" r="3" fill="#4F8CFF">
          <animateTransform attributeName="transform" type="translate" values="0,0;140,0;140,0;0,0" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="72" r="3" fill="#00C853">
          <animateTransform attributeName="transform" type="translate" values="0,0;120,0;120,0;0,0" dur="4s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="70" cy="72" r="3" fill="#FFD600">
          <animateTransform attributeName="transform" type="translate" values="0,0;100,0;100,0;0,0" dur="4s" begin="1s" repeatCount="indefinite"/>
        </circle>
        <!-- Source and Destination -->
        <rect x="10" y="50" width="20" height="40" fill="#2E5BB8" rx="3"/>
        <text x="20" y="73" text-anchor="middle" fill="white" font-size="8">SRC</text>
        <rect x="170" y="50" width="20" height="40" fill="#2E5BB8" rx="3"/>
        <text x="180" y="73" text-anchor="middle" fill="white" font-size="8">DST</text>
      </svg>
    `;
  }

  getServerSVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2E5BB8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4F8CFF;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Server Rack -->
        <rect x="60" y="30" width="80" height="90" fill="url(#serverGrad)" rx="5"/>
        <!-- Server Units -->
        <rect x="70" y="40" width="60" height="15" fill="#333" rx="2"/>
        <rect x="70" y="60" width="60" height="15" fill="#333" rx="2"/>
        <rect x="70" y="80" width="60" height="15" fill="#333" rx="2"/>
        <rect x="70" y="100" width="60" height="15" fill="#333" rx="2"/>
        <!-- Status LEDs -->
        <circle cx="75" cy="47" r="2" fill="#00C853">
          <animate attributeName="fill" values="#00C853;#FFD600;#00C853" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="75" cy="67" r="2" fill="#00C853">
          <animate attributeName="fill" values="#00C853;#FFD600;#00C853" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="75" cy="87" r="2" fill="#00C853">
          <animate attributeName="fill" values="#00C853;#FFD600;#00C853" dur="2s" begin="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="75" cy="107" r="2" fill="#00C853">
          <animate attributeName="fill" values="#00C853;#FFD600;#00C853" dur="2s" begin="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
  }

  getAlgorithmSVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="algoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFD600;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FF6F61;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Algorithm Flowchart -->
        <rect x="80" y="20" width="40" height="20" fill="url(#algoGrad)" rx="5">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
        </rect>
        <text x="100" y="33" text-anchor="middle" fill="white" font-size="10">START</text>
        <!-- Arrow -->
        <path d="M100 40 L100 55" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
        <!-- Decision Diamond -->
        <path d="M100 60 L120 75 L100 90 L80 75 Z" fill="url(#algoGrad)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </path>
        <text x="100" y="78" text-anchor="middle" fill="white" font-size="8">IF</text>
        <!-- Branches -->
        <path d="M120 75 L150 75" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
        <rect x="150" y="65" width="30" height="20" fill="#00C853" rx="3">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin="1s" repeatCount="indefinite"/>
        </rect>
        <text x="165" y="78" text-anchor="middle" fill="white" font-size="8">TRUE</text>
        <path d="M80 75 L50 75" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
        <rect x="35" y="65" width="30" height="20" fill="#FF6F61" rx="3">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin="1.5s" repeatCount="indefinite"/>
        </rect>
        <text x="50" y="78" text-anchor="middle" fill="white" font-size="8">FALSE</text>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
          </marker>
        </defs>
      </svg>
    `;
  }

  getNeuralNetworkSVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4F8CFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FF6F61;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Input Layer -->
        <circle cx="40" cy="40" r="6" fill="url(#neuralGrad)">
          <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="40" cy="75" r="6" fill="url(#neuralGrad)">
          <animate attributeName="r" values="6;8;6" dur="2s" begin="0.3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="40" cy="110" r="6" fill="url(#neuralGrad)">
          <animate attributeName="r" values="6;8;6" dur="2s" begin="0.6s" repeatCount="indefinite"/>
        </circle>
        <!-- Hidden Layer -->
        <circle cx="100" cy="30" r="6" fill="url(#neuralGrad)">
          <animate attributeName="r" values="6;8;6" dur="2s" begin="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="60" r="6" fill="url(#neuralGrad)">
          <animate attributeName="r" values="6;8;6" dur="2s" begin="1.3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="90" r="6" fill="url(#neuralGrad)">
          <animate attributeName="r" values="6;8;6" dur="2s" begin="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="120" r="6" fill="url(#neuralGrad)">
          <animate attributeName="r" values="6;8;6" dur="2s" begin="1.9s" repeatCount="indefinite"/>
        </circle>
        <!-- Output Layer -->
        <circle cx="160" cy="60" r="6" fill="url(#neuralGrad)">
          <animate attributeName="r" values="6;8;6" dur="2s" begin="2.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="160" cy="90" r="6" fill="url(#neuralGrad)">
          <animate attributeName="r" values="6;8;6" dur="2s" begin="2.5s" repeatCount="indefinite"/>
        </circle>
        <!-- Connections -->
        <line x1="46" y1="40" x2="94" y2="30" stroke="#4F8CFF" stroke-width="1" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite"/>
        </line>
        <line x1="46" y1="75" x2="94" y2="60" stroke="#4F8CFF" stroke-width="1" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" begin="0.5s" repeatCount="indefinite"/>
        </line>
        <line x1="106" y1="60" x2="154" y2="60" stroke="#4F8CFF" stroke-width="1" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" begin="1s" repeatCount="indefinite"/>
        </line>
      </svg>
    `;
  }

  getCodeSVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00C853;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFD600;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Code Window -->
        <rect x="30" y="30" width="140" height="90" fill="#1a1a1a" rx="5"/>
        <rect x="30" y="30" width="140" height="20" fill="url(#codeGrad)" rx="5"/>
        <!-- Window Buttons -->
        <circle cx="40" cy="40" r="3" fill="#FF6F61"/>
        <circle cx="50" cy="40" r="3" fill="#FFD600"/>
        <circle cx="60" cy="40" r="3" fill="#00C853"/>
        <!-- Code Lines -->
        <rect x="40" y="60" width="60" height="3" fill="#4F8CFF">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </rect>
        <rect x="40" y="70" width="80" height="3" fill="#00C853">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.3s" repeatCount="indefinite"/>
        </rect>
        <rect x="40" y="80" width="45" height="3" fill="#FFD600">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.6s" repeatCount="indefinite"/>
        </rect>
        <rect x="40" y="90" width="70" height="3" fill="#FF6F61">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.9s" repeatCount="indefinite"/>
        </rect>
        <rect x="40" y="100" width="55" height="3" fill="#4F8CFF">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="1.2s" repeatCount="indefinite"/>
        </rect>
        <!-- Cursor -->
        <rect x="120" y="98" width="2" height="8" fill="white">
          <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
        </rect>
      </svg>
    `;
  }

  getCyberSecuritySVG() {
    return `
      <svg viewBox="0 0 200 150" class="scenario-svg">
        <defs>
          <linearGradient id="securityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF6F61;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4F8CFF;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Shield -->
        <path d="M100 30 Q120 35 120 60 Q120 90 100 110 Q80 90 80 60 Q80 35 100 30" fill="url(#securityGrad)">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
        </path>
        <!-- Lock -->
        <rect x="90" y="60" width="20" height="25" fill="#333" rx="3"/>
        <path d="M95 60 Q95 50 105 50 Q115 50 115 60" stroke="#333" stroke-width="3" fill="none"/>
        <!-- Lock Hole -->
        <circle cx="100" cy="70" r="3" fill="white">
          <animate attributeName="fill" values="white;#FFD600;white" dur="2s" repeatCount="indefinite"/>
        </circle>
        <!-- Security Scan Lines -->
        <line x1="70" y1="45" x2="130" y2="45" stroke="#00C853" stroke-width="2" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0,-30;0,60;0,-30" dur="3s" repeatCount="indefinite"/>
        </line>
        <!-- Warning Indicators -->
        <circle cx="60" cy="50" r="3" fill="#FFD600">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="140" cy="80" r="3" fill="#FFD600">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
  }

  // ===========================
  // Detective Notebook Methods
  // ===========================
  showDetectiveNotebook(isCorrect, explanation, correctAnswer = null) {
    // Check if elements exist
    if (!this.elements.investigationNotesContainer) {
      console.error('investigationNotesContainer not found!');
      return;
    }
    
    // Force show the container for testing
    this.elements.investigationNotesContainer.style.display = 'block';
    this.elements.investigationNotesContainer.style.visibility = 'visible';
    this.elements.investigationNotesContainer.style.opacity = '1';
    
    // Set up the investigation notes content based on correct/incorrect
    if (isCorrect) {
      if (this.elements.notesIcon) this.elements.notesIcon.textContent = '🕵️';
      if (this.elements.notesTitle) this.elements.notesTitle.textContent = 'Investigation Notes';
      if (this.elements.statusIcon) this.elements.statusIcon.textContent = '✅';
      if (this.elements.statusText) this.elements.statusText.textContent = 'Case Solved!';
      if (this.elements.explanationText) this.elements.explanationText.textContent = explanation;
      
      // Apply correct styling
      this.elements.investigationNotesContainer.className = 'investigation-notes-container correct show';
    } else {
      if (this.elements.notesIcon) this.elements.notesIcon.textContent = '🔍';
      if (this.elements.notesTitle) this.elements.notesTitle.textContent = 'Investigation Notes';
      if (this.elements.statusIcon) this.elements.statusIcon.textContent = '❌';
      if (this.elements.statusText) this.elements.statusText.textContent = 'Clue Missed!';
      
      // Show explanation with correct answer if provided
      let fullExplanation = explanation;
      if (correctAnswer) {
        fullExplanation += `\n\nThe correct answer was: ${correctAnswer}`;
      }
      if (this.elements.explanationText) this.elements.explanationText.textContent = fullExplanation;
      
      // Apply incorrect styling
      this.elements.investigationNotesContainer.className = 'investigation-notes-container show';
    }
    
    console.log('Investigation notes container classes:', this.elements.investigationNotesContainer.className);
    
    // Add visual effects to options
    this.highlightAnswerOptions(isCorrect);
  }

  hideDetectiveNotebook() {
    // Hide the investigation notes container
    if (this.elements.investigationNotesContainer) {
      this.elements.investigationNotesContainer.classList.remove('show');
      this.elements.investigationNotesContainer.className = 'investigation-notes-container';
      // Force hide the container
      this.elements.investigationNotesContainer.style.display = 'none';
      this.elements.investigationNotesContainer.style.visibility = 'hidden';
      this.elements.investigationNotesContainer.style.opacity = '0';
    }
    // Clear option highlights
    this.clearOptionHighlights();
  }

  // ===========================
  // Loading State Methods
  // ===========================
  showLoadingState() {
    // Show loading skeleton
    if (this.elements.scenarioText) {
      this.elements.scenarioText.innerHTML = '<div class="loading-skeleton">Loading next case...</div>';
    }
    if (this.elements.scenarioDescription) {
      this.elements.scenarioDescription.innerHTML = '<div class="loading-skeleton">Preparing evidence...</div>';
    }
    if (this.elements.scenarioIllustration) {
      this.elements.scenarioIllustration.innerHTML = '<div class="loading-skeleton">🔍 Analyzing data...</div>';
    }
  }

  hideLoadingState() {
    // Loading state will be replaced by actual content in renderQuestion
  }

  highlightAnswerOptions(isCorrect) {
    const options = this.elements.optionsContainer.querySelectorAll('.option-item');
    const selectedOption = this.elements.optionsContainer.querySelector('.option-item.selected');
    
    if (selectedOption) {
      if (isCorrect) {
        selectedOption.classList.add('correct-highlight');
      } else {
        selectedOption.classList.add('incorrect-highlight');
        
        // Also highlight the correct answer in green
        const correctIndex = game.state.currentQuestion.correct;
        if (options[correctIndex]) {
          options[correctIndex].classList.add('correct-highlight');
        }
      }
    }
  }

  clearOptionHighlights() {
    const options = this.elements.optionsContainer.querySelectorAll('.option-item');
    options.forEach(option => {
      option.classList.remove('correct-highlight', 'incorrect-highlight');
    });
  }
  getHallucinationsIllustration() { return this.getDefaultIllustration(); }
  getOverfittingIllustration() { return this.getDefaultIllustration(); }
  getAdversarialAttacksIllustration() { return this.getDefaultIllustration(); }
  getLatentSpaceIllustration() { return this.getDefaultIllustration(); }
  getExplainableAIIllustration() { return this.getDefaultIllustration(); }
  getPrivacyIllustration() { return this.getDefaultIllustration(); }
  getBiasIllustration() { return this.getDefaultIllustration(); }
  getHumanInLoopIllustration() { return this.getDefaultIllustration(); }
  getTransparencyIllustration() { return this.getDefaultIllustration(); }
  getAccountabilityIllustration() { return this.getDefaultIllustration(); }
  getEverydayAIIllustration() { return this.getDefaultIllustration(); }
  getDataQualityIllustration() { return this.getDefaultIllustration(); }
  getProbabilisticIllustration() { return this.getDefaultIllustration(); }
  getAttentionIllustration() { return this.getDefaultIllustration(); }
  getLearningIllustration() { return this.getDefaultIllustration(); }
  getResponsibleAIIllustration() { return this.getDefaultIllustration(); }
  getContextWindowIllustration() { return this.getDefaultIllustration(); }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===========================
// Enhanced API Integration
// ===========================
class APIManager {
  constructor() {
    this.preloadQueue = []; // Queue for preloaded questions
    this.isPreloading = false;
  }

  async fetchQuestion(questionNumber = 1, caseType = 'ai-choice') {
    try {
      const response = await fetch('/api/question', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          case_type: caseType,
          question_number: questionNumber
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching question:', error);
      return this.getFallbackQuestion(questionNumber, caseType);
    }
  }

  // Preload next questions in background
  async preloadQuestions(currentQuestionNumber, caseType = 'ai-choice', count = 2) {
    if (this.isPreloading) return;
    this.isPreloading = true;

    try {
      const preloadPromises = [];
      for (let i = 1; i <= count; i++) {
        const nextQuestionNum = currentQuestionNumber + i;
        preloadPromises.push(
          this.fetchQuestion(nextQuestionNum, caseType)
            .then(question => ({ question, questionNumber: nextQuestionNum, caseType }))
            .catch(error => {
              console.warn(`Failed to preload question ${nextQuestionNum}:`, error);
              return null;
            })
        );
      }
      
      const results = await Promise.all(preloadPromises);
      this.preloadQueue = results.filter(result => result !== null);
    } catch (error) {
      console.error('Error preloading questions:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // Get preloaded question if available
  getPreloadedQuestion(questionNumber, caseType) {
    const index = this.preloadQueue.findIndex(
      item => item.questionNumber === questionNumber && item.caseType === caseType
    );
    
    if (index !== -1) {
      const item = this.preloadQueue.splice(index, 1)[0];
      return item.question;
    }
    return null;
  }
  
  getFallbackQuestion(questionNumber, caseType = 'ai-choice') {
    const topics = [
      'Temperature', 'Inference', 'Feature engineering', 'Hallucinations', 'Overfitting',
      'Adversarial attacks', 'Latent space', 'Explainable AI', 'Privacy', 'Bias in models'
    ];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    if (caseType === 'ai-choice') {
      return {
        id: `fallback-${Date.now()}`,
        topic: topic,
        difficulty: this.getDifficulty(questionNumber),
        question: `An AI system is making decisions about ${topic}. Which choice might show bias?`,
        options: [
          { label: 'Choose based on popularity', explanation: 'This could show popularity bias, favoring well-known options over better ones.' },
          { label: 'Select randomly', explanation: 'Random selection avoids bias but may not be optimal.' },
          { label: 'Use fair criteria', explanation: 'This approach considers all relevant factors equally.' },
          { label: 'Pick the cheapest option', explanation: 'This could show economic bias, prioritizing cost over quality.' }
        ],
        correct: 0,
        explanation: 'Popularity bias occurs when AI systems favor popular choices over better alternatives.',
        case_type: 'ai-choice'
      };
    } else {
      return {
        id: `fallback-${Date.now()}`,
        topic: topic,
        difficulty: this.getDifficulty(questionNumber),
        question: `What is the best approach for ${topic}?`,
        options: [
          { label: 'Use diverse data', explanation: 'Diverse data helps reduce bias and improve fairness.' },
          { label: 'Focus on speed', explanation: 'Speed is important but shouldn\'t compromise quality.' },
          { label: 'Minimize costs', explanation: 'Cost optimization is good but not the only factor.' },
          { label: 'Maximize accuracy', explanation: 'Accuracy is crucial for reliable AI systems.' }
        ],
        correct: 0,
        explanation: 'Using diverse data is the best approach to reduce bias in AI systems.',
        case_type: 'player-choice'
      };
    }
  }
  
  getDifficulty(questionNumber) {
    if (questionNumber <= 3) return 'easy';
    if (questionNumber <= 6) return 'moderate';
    if (questionNumber <= 9) return 'hard';
    return 'extreme';
  }
}

// ===========================
// Enhanced Main Game Logic
// ===========================
class Game {
  constructor() {
    this.state = new GameState();
    this.ui = new GameUI();
    this.api = new APIManager();
    
    this.initializeGame();
  }
  
  initializeGame() {
    this.ui.showModeSelection();
  }
  
  async startGame(mode) {
    this.state.setMode(mode);
    this.ui.showGame();
    this.ui.updateScore(this.state);
    this.ui.updateProgress(1);
    
    // Hide investigation notes when starting game
    this.ui.hideDetectiveNotebook();
    
    // Start with first question
    await this.loadQuestion();
  }
  
  async loadQuestion() {
    try {
      this.state.isLoading = true;
      this.ui.showLoadingState();
      
      // Alternate between AI-choice and player-choice cases
      const caseType = this.state.questionNumber % 2 === 1 ? 'ai-choice' : 'player-choice';
      
      // Try to get preloaded question first
      let question = this.api.getPreloadedQuestion(this.state.questionNumber, caseType);
      
      if (!question) {
        // If no preloaded question, fetch it
        question = await this.api.fetchQuestion(this.state.questionNumber, caseType);
      }
      
      this.state.currentQuestion = question;
      this.state.selectedAnswer = null;
      
      // Update side panel information
      sidePanelManager.updateFocus(caseType);
      sidePanelManager.updateTip(this.state.currentQuestion.topic);
      sidePanelManager.updateProgressDots(this.state.questionNumber, 10, this.state.results);
      
      this.ui.renderQuestion(this.state.currentQuestion, caseType);
      this.ui.updateProgress(this.state.questionNumber);
      
      // Preload next questions in background
      this.api.preloadQuestions(this.state.questionNumber, caseType, 2);
      
      if (caseType === 'ai-choice') {
        // AI makes choice after delay
        await this.ui.delay(2000);
        await this.aiMakeChoice();
      }
      
    } catch (error) {
      console.error('Error loading question:', error);
      this.ui.showFeedback('Oops! Something went wrong. Let\'s try again!', 'warning');
    }
  }
  
  async aiMakeChoice() {
    // AI randomly selects an option (simulating AI decision)
    const options = this.state.currentQuestion.options;
    const randomIndex = Math.floor(Math.random() * options.length);
    const choice = options[randomIndex];
    
    // Store the AI's choice for later reference
    this.state.aiChoice = choice;
    
    // Show AI's choice
    this.ui.showAIChoice(choice);
    
    // Show bias options for player to flag
    this.ui.showBiasOptions();
    
    // Update button
    this.ui.elements.flagBiasBtn.innerHTML = '<span class="btn-icon">🚩</span><span>Flag Bias</span>';
    this.ui.elements.flagBiasBtn.classList.remove('hidden');
    this.ui.elements.flagBiasBtn.disabled = true;
  }
  
  submitAnswer() {
    if (this.state.selectedAnswer === null) return;
    
    const caseType = this.state.questionNumber % 2 === 1 ? 'ai-choice' : 'player-choice';
    let isCorrect = false;
    
    if (caseType === 'ai-choice') {
      // For AI-choice cases, check if bias flag is correct
      isCorrect = this.isBiasCorrect(this.state.selectedAnswer);
    } else {
      // For player-choice cases, check if answer matches correct index
      isCorrect = this.state.selectedAnswer === this.state.currentQuestion.correct;
    }
    
    // Update score and achievements
    if (isCorrect) {
      this.state.score += 10;
      this.state.streak++;
      this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
      this.state.casesSolved++;
      
      // Show detective notebook with encouraging feedback
      const correctExplanation = this.state.currentQuestion.explanations?.if_correct || 'Great job! You understand this AI concept well.';
      
      // Add streak bonuses to the explanation
      let enhancedExplanation = correctExplanation;
      if (this.state.streak === 5) {
        enhancedExplanation = '🔥 Amazing! 5 in a row! You\'re on fire! ' + correctExplanation;
        this.state.addAchievement('Streak Master');
        particleSystem.createBurst(window.innerWidth / 2, window.innerHeight / 2, 'primary', 20);
      } else if (this.state.streak === 3) {
        enhancedExplanation = '🎯 Great streak! ' + correctExplanation;
        particleSystem.createBurst(window.innerWidth / 2, window.innerHeight / 2, 'success', 15);
      } else {
        particleSystem.createBurst(window.innerWidth / 2, window.innerHeight / 2, 'success', 10);
      }
      
      // Show detective notebook for correct answer
      this.ui.showDetectiveNotebook(true, enhancedExplanation);
      particleSystem.showFeedbackFlash('success');
    } else {
      // Wrong answer
      const incorrectExplanation = this.state.currentQuestion.explanations?.if_incorrect || 'Not quite right. Let\'s learn from this mistake and try to think about it differently next time.';
      
      // Get the correct answer text to show in the notebook
      const correctOption = this.state.currentQuestion.options[this.state.currentQuestion.correct];
      const correctAnswerText = typeof correctOption === 'object' ? correctOption.label : correctOption;
      
      let enhancedExplanation = incorrectExplanation;
      
      if (this.state.gameMode === 'streak') {
        this.state.streak = 0;
        enhancedExplanation = '💪 Don\'t give up! ' + incorrectExplanation;
        particleSystem.createBurst(window.innerWidth / 2, window.innerHeight / 2, 'warning', 8);
      } else {
        this.state.lives = Math.max(0, this.state.lives - 1);
        if (this.state.lives === 0) {
          this.ui.showFeedback('❤️ Game over! You\'ve learned a lot about AI!', 'lives');
          this.endGame();
          return;
        } else {
          enhancedExplanation = `❤️ ${this.state.lives} lives left. ` + incorrectExplanation;
          particleSystem.createBurst(window.innerWidth / 2, window.innerHeight / 2, 'danger', 6);
        }
      }
      
      // Show detective notebook for incorrect answer with correct answer highlighted
      this.ui.showDetectiveNotebook(false, enhancedExplanation, correctAnswerText);
      particleSystem.showFeedbackFlash('error');
    }
    
    // Update UI and save progress
    this.ui.updateScore(this.state);
    this.ui.showResults(isCorrect, this.state.currentQuestion.correct);
    this.state.updatePersonalBest();
    this.state.saveToStorage();
  }
  
  isBiasCorrect(selectedBias) {
    // Simple logic to determine if bias flag is correct
    // This would ideally come from the API response
    const scenario = this.state.currentQuestion.question.toLowerCase();
    
    if (selectedBias === 'none') {
      return !this.hasBias(scenario);
    }
    
    return this.hasBias(scenario) && this.matchesBiasType(scenario, selectedBias);
  }
  
  hasBias(scenario) {
    const biasKeywords = ['gender', 'male', 'female', 'race', 'age', 'young', 'old', 'expensive', 'cheap', 'popular'];
    return biasKeywords.some(keyword => scenario.includes(keyword));
  }
  
  matchesBiasType(scenario, biasType) {
    const biasMappings = {
      gender: ['gender', 'male', 'female'],
      racial: ['race', 'ethnicity', 'color'],
      age: ['age', 'young', 'old'],
      location: ['location', 'local', 'downtown'],
      economic: ['expensive', 'cheap', 'affordable', 'cost']
    };
    
    return biasMappings[biasType]?.some(keyword => scenario.includes(keyword)) || false;
  }
  
  async nextQuestion() {
    // Hide investigation notes when moving to next question
    this.ui.hideDetectiveNotebook();
    
    // Check if game is complete
    if (this.state.questionNumber >= 10) {
      this.endGame();
      return;
    }
    
    // Load next question
    this.state.questionNumber++;
    await this.loadQuestion();
  }
  
  endGame() {
    this.state.isGameOver = true;
    this.state.updatePersonalBest();
    this.ui.showGameOver(this.state);
    this.ui.showGameOver();
  }
  
  playAgain() {
    // Hide game over overlay
    this.ui.elements.gameOverOverlay.classList.remove('show');
    setTimeout(() => {
      this.ui.elements.gameOverOverlay.classList.add('hidden');
    }, 300);
    
    this.state.resetGame();
    this.ui.showGame();
    this.ui.updateScore(this.state);
    this.ui.updateProgress(1);
    this.loadQuestion();
  }
  
  showModeSelection() {
    // Hide game over overlay
    this.ui.elements.gameOverOverlay.classList.remove('show');
    setTimeout(() => {
      this.ui.elements.gameOverOverlay.classList.add('hidden');
    }, 300);
    
    this.ui.showModeSelection();
  }
  
  showExplanation() {
    const explanation = this.state.currentQuestion.explanation || 'This question tests your understanding of AI concepts.';
    this.ui.showFeedback(explanation, 'info');
  }
}

// ===========================
// Enhanced Features
// ===========================

// Learning tips for the carousel
const LEARNING_TIPS = [
    "AI bias can appear in unexpected ways - stay curious and question everything!",
    "Look for patterns in AI decisions that might favor certain groups over others.",
    "Good AI systems should be transparent about their decision-making process.",
    "Training data quality directly impacts AI fairness and accuracy.",
    "AI systems can amplify existing societal biases if not carefully designed.",
    "Human oversight is crucial for maintaining ethical AI behavior.",
    "Diverse development teams help identify potential biases early.",
    "AI explainability helps us understand why certain decisions were made."
];

// Animated Statistics Counter
class StatsAnimator {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number');
        this.tipElement = document.getElementById('learningTip');
        this.currentTipIndex = 0;
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const increment = target / 60; // 60 frames for smooth animation
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            
            // Add delay based on animation-delay attribute
            const delay = parseInt(counter.parentElement.getAttribute('data-animation-delay')) || 0;
            setTimeout(updateCounter, delay);
        });
    }

    startTipCarousel() {
        setInterval(() => {
            this.currentTipIndex = (this.currentTipIndex + 1) % LEARNING_TIPS.length;
            if (this.tipElement) {
                this.tipElement.style.opacity = '0';
                setTimeout(() => {
                    this.tipElement.textContent = LEARNING_TIPS[this.currentTipIndex];
                    this.tipElement.style.opacity = '1';
                }, 300);
            }
        }, 5000); // Change tip every 5 seconds
    }

    init() {
        // Start animations after a short delay
        setTimeout(() => this.animateCounters(), 500);
        this.startTipCarousel();
    }
}

// Particle Effect System
class ParticleSystem {
    createBurst(x, y, type = 'primary', count = 8) {
        const burst = document.createElement('div');
        burst.className = 'particle-burst';
        burst.style.left = x + 'px';
        burst.style.top = y + 'px';
        document.body.appendChild(burst);

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${type}`;
            
            const angle = (i / count) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            
            burst.appendChild(particle);
        }

        // Clean up after animation
        setTimeout(() => {
            document.body.removeChild(burst);
        }, 1000);
    }

    showFeedbackFlash(type) {
        const flash = document.createElement('div');
        flash.className = `feedback-flash ${type}`;
        document.body.appendChild(flash);
        
        setTimeout(() => flash.classList.add('show'), 10);
        setTimeout(() => {
            flash.classList.remove('show');
            setTimeout(() => document.body.removeChild(flash), 300);
        }, 200);
    }
}

// Side Panel Manager
class SidePanelManager {
    constructor() {
        this.currentFocus = document.getElementById('currentFocus');
        this.quickTip = document.getElementById('quickTip');
        this.miniProgressDots = document.getElementById('miniProgressDots');
        
        this.focusMessages = {
            'ai-choice': 'Analyzing AI decision patterns',
            'player-choice': 'Testing your AI knowledge'
        };
        
        this.tips = {
            'Temperature': 'Higher temperature = more creative, lower = more predictable',
            'Bias in models': 'Look for unfair assumptions or stereotypes',
            'Hallucinations': 'AI sometimes generates false information confidently',
            'Overfitting': 'When AI memorizes training data too closely'
        };
    }

    updateFocus(caseType) {
        if (this.currentFocus) {
            this.currentFocus.textContent = this.focusMessages[caseType] || 'Identifying bias patterns';
        }
    }

    updateTip(topic) {
        if (this.quickTip) {
            this.quickTip.textContent = this.tips[topic] || 'Look for unfair assumptions or stereotypes';
        }
    }

    updateProgressDots(currentQuestion, totalQuestions, results = []) {
        if (!this.miniProgressDots) return;
        
        this.miniProgressDots.innerHTML = '';
        
        for (let i = 1; i <= totalQuestions; i++) {
            const dot = document.createElement('div');
            dot.className = 'mini-dot';
            
            if (i < currentQuestion) {
                dot.classList.add('completed');
                // Just green color, no text
            } else if (i === currentQuestion) {
                dot.classList.add('current');
                // Just blue color, no text
            } else {
                // Future questions - just empty dots
            }
            
            this.miniProgressDots.appendChild(dot);
        }
    }
}

// Initialize enhanced features
const statsAnimator = new StatsAnimator();
const particleSystem = new ParticleSystem();
const sidePanelManager = new SidePanelManager();

// ===========================
// Initialize Enhanced Game
// ===========================
let game;

document.addEventListener('DOMContentLoaded', () => {
  try {
    game = new Game();
    
    // Initialize enhanced features
    statsAnimator.init();
  } catch (error) {
    console.error('Error initializing game:', error);
  }
});