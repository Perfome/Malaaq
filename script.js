// ===========================================
// COLT 1V1 AIMBOT LAB - JavaScript
// Version: 2.0 | 5600HP Colt
// ===========================================

'use strict';

class ColtAimbotLab {
    constructor() {
        this.gameState = 'menu'; // menu, playing, ended
        this.difficulty = 'easy'; // easy, medium, hard
        this.gameStarted = false;
        this.gameTime = 0;
        this.gameScore = 0;
        
        // Player stats
        this.playerHealth = 5600;
        this.playerMaxHealth = 5600;
        this.botHealth = 4200;
        this.botMaxHealth = 4200;
        
        // Bot stats based on difficulty
        this.botStats = {
            easy: {
                health: 4200,
                accuracy: 0.6,
                reactionTime: 300,
                dodgeChance: 0.5,
                moveSpeed: 2,
                fireRate: 800,
                superChance: 0.1
            },
            medium: {
                health: 5600,
                accuracy: 0.8,
                reactionTime: 180,
                dodgeChance: 0.7,
                moveSpeed: 3,
                fireRate: 600,
                superChance: 0.3
            },
            hard: {
                health: 6160,
                accuracy: 0.95,
                reactionTime: 120,
                dodgeChance: 0.9,
                moveSpeed: 4,
                fireRate: 400,
                superChance: 0.6
            }
        };
        
        // Aim settings
        this.aimbotEnabled = false;
        this.dodgeEnabled = false;
        this.aimSensitivity = 50;
        this.dodgeAggressiveness = 50;
        
        // Game stats
        this.stats = {
            shotsFired: 0,
            shotsHit: 0,
            headshots: 0,
            bulletsDodged: 0,
            bulletsIncoming: 0,
            damageTaken: 0,
            damageDealt: 0,
            supersUsed: 0,
            reactionTimes: []
        };
        
        // DOM Elements
        this.dom = {
            gameArea: document.getElementById('gameArea'),
            currentDifficulty: document.getElementById('currentDifficulty'),
            gameTime: document.getElementById('gameTime'),
            gameScore: document.getElementById('gameScore'),
            playerHealth: document.getElementById('playerHealth'),
            playerHealthText: document.getElementById('playerHealthText'),
            botHealth: document.getElementById('botHealth'),
            botHealthText: document.getElementById('botHealthText'),
            aimbotStatus: document.getElementById('aimbotStatus'),
            dodgeStatus: document.getElementById('dodgeStatus'),
            aimSensitivity: document.getElementById('aimSensitivity'),
            dodgeAggressiveness: document.getElementById('dodgeAggressiveness'),
            aimValue: document.getElementById('aimValue'),
            dodgeValue: document.getElementById('dodgeValue'),
            accuracyStat: document.getElementById('accuracyStat'),
            headshotsStat: document.getElementById('headshotsStat'),
            reactionStat: document.getElementById('reactionStat'),
            dodgeRateStat: document.getElementById('dodgeRateStat'),
            dodgedStat: document.getElementById('dodgedStat'),
            damageStat: document.getElementById('damageStat'),
            backgroundCanvas: document.getElementById('backgroundCanvas'),
            gameCanvas: document.getElementById('gameCanvas')
        };
        
        // Canvas contexts
        this.bgCtx = this.dom.backgroundCanvas.getContext('2d');
        this.gameCtx = this.dom.gameCanvas.getContext('2d');
        
        // Game objects
        this.player = {
            x: 200,
            y: 300,
            width: 40,
            height: 60,
            color: '#00bfff',
            isMoving: false,
            moveDirection: { x: 0, y: 0 },
            bullets: [],
            superReady: false,
            superCharge: 0
        };
        
        this.bot = {
            x: 800,
            y: 300,
            width: 40,
            height: 60,
            color: '#ff3366',
            movePattern: 'circle',
            moveCounter: 0,
            bullets: [],
            superReady: false,
            superCharge: 0,
            nextShotTime: 0,
            moveTarget: { x: 800, y: 300 }
        };
        
        // Initialize
        this.init();
    }
    
    // ==================== INITIALIZATION ====================
    init() {
        // Set canvas dimensions
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Event listeners
        this.dom.aimSensitivity.addEventListener('input', (e) => this.updateAimSensitivity(e));
        this.dom.dodgeAggressiveness.addEventListener('input', (e) => this.updateDodgeAggressiveness(e));
        
        // Start background animation
        this.initBackground();
        
        // Start game loop
        this.gameLoop();
        
        console.log('🎮 Colt Aimbot Lab Initialized!');
    }
    
    // ==================== CANVAS SETUP ====================
    resizeCanvas() {
        // Background canvas
        this.dom.backgroundCanvas.width = window.innerWidth;
        this.dom.backgroundCanvas.height = window.innerHeight;
        
        // Game canvas
        const container = this.dom.gameCanvas.parentElement;
        this.dom.gameCanvas.width = container.clientWidth;
        this.dom.gameCanvas.height = parseInt(getComputedStyle(this.dom.gameCanvas.parentElement).height);
    }
    
    // ==================== BACKGROUND ANIMATION ====================
    initBackground() {
        const canvas = this.dom.backgroundCanvas;
        const ctx = this.bgCtx;
        
        // Create particles for background
        this.bgParticles = [];
        const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 20000));
        
        for (let i = 0; i < particleCount; i++) {
            this.bgParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: `rgba(0, 191, 255, ${Math.random() * 0.3 + 0.1})`
            });
        }
        
        // Animate background
        const animateBackground = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#0a1a2a');
            gradient.addColorStop(1, '#142e48');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw particles
            this.bgParticles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
            });
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.05)';
            ctx.lineWidth = 1;
            
            // Vertical lines
            for (let x = 0; x < canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // Horizontal lines
            for (let y = 0; y < canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            requestAnimationFrame(animateBackground);
        };
        
        animateBackground();
    }
    
    // ==================== DIFFICULTY SELECTION ====================
    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.gameState = 'playing';
        this.gameStarted = true;
        this.gameTime = 0;
        this.gameScore = 0;
        
        // Set bot stats based on difficulty
        const stats = this.botStats[difficulty];
        this.botHealth = stats.health;
        this.botMaxHealth = stats.health;
        
        // Reset player
        this.playerHealth = 5600;
        this.playerMaxHealth = 5600;
        
        // Reset stats
        this.resetStats();
        
        // Update UI
        this.dom.gameArea.style.display = 'block';
        this.dom.currentDifficulty.textContent = `${difficulty.toUpperCase()} MOD`;
        
        // Initialize bot position based on difficulty
        this.bot.x = 800;
        this.bot.y = 300;
        
        // Start game timer
        this.startGameTimer();
        
        console.log(`🚀 ${difficulty.toUpperCase()} mode started!`);
    }
    
    resetStats() {
        this.stats = {
            shotsFired: 0,
            shotsHit: 0,
            headshots: 0,
            bulletsDodged: 0,
            bulletsIncoming: 0,
            damageTaken: 0,
            damageDealt: 0,
            supersUsed: 0,
            reactionTimes: []
        };
        
        this.player.bullets = [];
        this.bot.bullets = [];
        this.player.superCharge = 0;
        this.bot.superCharge = 0;
        this.player.superReady = false;
        this.bot.superReady = false;
    }
    
    // ==================== GAME TIMER ====================
    startGameTimer() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        
        this.gameTimer = setInterval(() => {
            this.gameTime++;
            this.updateGameTime();
            
            // Update bot every second
            if (this.gameTime % 60 === 0) {
                this.updateBotBehavior();
            }
        }, 1000);
    }
    
    updateGameTime() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        this.dom.gameTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.dom.gameScore.textContent = this.gameScore;
    }
    
    // ==================== CONTROLS ====================
    toggleAimbot() {
        this.aimbotEnabled = !this.aimbotEnabled;
        this.dom.aimbotStatus.textContent = `Aimbot: ${this.aimbotEnabled ? 'AÇIK' : 'KAPALI'}`;
        
        if (this.aimbotEnabled) {
            this.activateAimbot();
        }
    }
    
    toggleDodge() {
        this.dodgeEnabled = !this.dodgeEnabled;
        this.dom.dodgeStatus.textContent = `Dodge: ${this.dodgeEnabled ? 'AÇIK' : 'KAPALI'}`;
    }
    
    updateAimSensitivity(e) {
        this.aimSensitivity = parseInt(e.target.value);
        this.dom.aimValue.textContent = `%${this.aimSensitivity}`;
    }
    
    updateDodgeAggressiveness(e) {
        this.dodgeAggressiveness = parseInt(e.target.value);
        this.dom.dodgeValue.textContent = `%${this.dodgeAggressiveness}`;
    }
    
    // ==================== AIMBOT SYSTEM ====================
    activateAimbot() {
        if (!this.aimbotEnabled || this.gameState !== 'playing') return;
        
        // Calculate target position with prediction
        const predictedPos = this.predictBotPosition();
        
        // Move player crosshair to target
        this.moveCrosshairToTarget(predictedPos.x, predictedPos.y);
        
        // Auto-fire based on sensitivity
        if (Math.random() * 100 < this.aimSensitivity) {
            this.playerShoot(predictedPos.x, predictedPos.y);
        }
    }
    
    predictBotPosition() {
        // Simple prediction based on bot movement
        const stats = this.botStats[this.difficulty];
        const predictionDistance = stats.moveSpeed * (this.aimSensitivity / 50);
        
        return {
            x: this.bot.x + (Math.cos(this.bot.moveCounter * 0.1) * predictionDistance),
            y: this.bot.y + (Math.sin(this.bot.moveCounter * 0.1) * predictionDistance)
        };
    }
    
    moveCrosshairToTarget(targetX, targetY) {
        // Simulate mouse movement to target
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
            const speed = this.aimSensitivity / 100;
            this.player.x += dx * speed * 0.1;
            this.player.y += dy * speed * 0.1;
        }
    }
    
    // ==================== DODGE SYSTEM ====================
    performDodge() {
        if (!this.dodgeEnabled || this.gameState !== 'playing') return;
        
        const incomingBullets = this.bot.bullets.filter(b => 
            this.checkBulletCollision(b, this.player)
        );
        
        if (incomingBullets.length > 0) {
            // Calculate dodge direction
            const dodgeDir = this.calculateDodgeDirection(incomingBullets[0]);
            
            // Move player
            const dodgePower = this.dodgeAggressiveness / 100;
            this.player.x += dodgeDir.x * dodgePower * 10;
            this.player.y += dodgeDir.y * dodgePower * 10;
            
            // Record dodge
            this.stats.bulletsDodged++;
            this.updateDodgeStats();
        }
    }
    
    calculateDodgeDirection(bullet) {
        // Calculate perpendicular direction to bullet trajectory
        const dx = bullet.speedX;
        const dy = bullet.speedY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return { x: 0, y: 0 };
        
        // Normalize
        const nx = dx / length;
        const ny = dy / length;
        
        // Get perpendicular (rotate 90 degrees)
        const perpX = -ny;
        const perpY = nx;
        
        // Randomize direction sometimes
        if (Math.random() > 0.7) {
            return { x: -perpX, y: -perpY };
        }
        
        return { x: perpX, y: perpY };
    }
    
    // ==================== SHOOTING MECHANICS ====================
    playerShoot(targetX, targetY) {
        if (this.gameState !== 'playing') return;
        
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create bullet
        this.player.bullets.push({
            x: this.player.x,
            y: this.player.y,
            speedX: Math.cos(angle) * 15,
            speedY: Math.sin(angle) * 15,
            damage: 420, // Colt bullet damage
            isSuper: false,
            lifetime: 120
        });
        
        this.stats.shotsFired++;
        
        // Check hit
        if (this.checkHit(targetX, targetY)) {
            this.stats.shotsHit++;
            
            // Calculate damage with distance falloff
            const damage = this.calculateDamage(distance);
            this.botHealth -= damage;
            this.stats.damageDealt += damage;
            
            // Check for headshot
            if (Math.random() < 0.3) { // 30% headshot chance
                this.stats.headshots++;
                this.botHealth -= 100; // Extra headshot damage
            }
            
            // Update bot health
            this.updateHealthBars();
            
            // Add to score
            this.gameScore += Math.floor(damage / 10);
            
            // Charge super
            this.player.superCharge += damage;
            if (this.player.superCharge >= 3000) {
                this.player.superReady = true;
                this.player.superCharge = 3000;
            }
        }
        
        // Update stats
        this.updateStats();
    }
    
    botShoot() {
        if (this.gameState !== 'playing') return;
        
        const stats = this.botStats[this.difficulty];
        const now = Date.now();
        
        if (now < this.bot.nextShotTime) return;
        
        // Calculate accuracy based on difficulty
        const accuracy = stats.accuracy;
        const missChance = 1 - accuracy;
        
        // Target player with some inaccuracy
        let targetX = this.player.x;
        let targetY = this.player.y;
        
        if (Math.random() < missChance) {
            // Miss slightly
            targetX += (Math.random() - 0.5) * 100;
            targetY += (Math.random() - 0.5) * 100;
        }
        
        const dx = targetX - this.bot.x;
        const dy = targetY - this.bot.y;
        const angle = Math.atan2(dy, dx);
        
        // Create bullet
        this.bot.bullets.push({
            x: this.bot.x,
            y: this.bot.y,
            speedX: Math.cos(angle) * 12,
            speedY: Math.sin(angle) * 12,
            damage: 420,
            isSuper: false,
            lifetime: 120
        });
        
        this.stats.bulletsIncoming++;
        
        // Set next shot time
        this.bot.nextShotTime = now + stats.fireRate;
        
        // Charge bot super
        this.bot.superCharge += 420;
        if (this.bot.superCharge >= 3000) {
            this.bot.superReady = true;
            this.bot.superCharge = 3000;
            
            // Bot might use super
            if (Math.random() < stats.superChance) {
                this.botUseSuper();
            }
        }
    }
    
    botUseSuper() {
        if (!this.bot.superReady) return;
        
        // Colt super: 12 bullets spread
        for (let i = 0; i < 12; i++) {
            const angle = Math.atan2(this.player.y - this.bot.y, this.player.x - this.bot.x);
            const spread = (Math.random() - 0.5) * 0.5; // ±0.25 radian spread
            
            this.bot.bullets.push({
                x: this.bot.x,
                y: this.bot.y,
                speedX: Math.cos(angle + spread) * 15,
                speedY: Math.sin(angle + spread) * 15,
                damage: 300, // Super bullet damage
                isSuper: true,
                lifetime: 100
            });
        }
        
        this.bot.superReady = false;
        this.bot.superCharge = 0;
        this.stats.bulletsIncoming += 12;
    }
    
    // ==================== COLLISION DETECTION ====================
    checkHit(targetX, targetY) {
        // Check if bullet would hit bot
        const distance = Math.sqrt(
            Math.pow(targetX - this.bot.x, 2) + 
            Math.pow(targetY - this.bot.y, 2)
        );
        
        const hitRadius = this.bot.width / 2;
        
        // Add some randomness based on difficulty
        const stats = this.botStats[this.difficulty];
        const dodgeRoll = Math.random();
        
        if (dodgeRoll < stats.dodgeChance && distance < hitRadius * 1.5) {
            // Bot dodged!
            return false;
        }
        
        return distance < hitRadius;
    }
    
    checkBulletCollision(bullet, target) {
        const distance = Math.sqrt(
            Math.pow(bullet.x - target.x, 2) + 
            Math.pow(bullet.y - target.y, 2)
        );
        
        return distance < target.width / 2;
    }
    
    calculateDamage(distance) {
        // Damage falloff based on distance
        let damage = 420; // Base damage
        
        if (distance > 500) {
            damage *= 0.8; // 20% reduction at long range
        } else if (distance > 300) {
            da
