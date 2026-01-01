// ==============================================
// HACKER SIMULATION GAME - CORE LOGIC
// ==============================================

// Game State
const GameState = {
    detection: 0,
    population: 8000000000,
    points: 0,
    hackedCountries: new Set(),
    selectedCountry: null,
    difficulty: 'medium',
    upgrades: new Set(),
    minigameActive: false,
    detectionRate: 0.1,
    gameActive: true
};

// Country Data (Real-world inspired)
const Countries = {
    "US": { name: "United States", population: 331002651, difficulty: "Hard", nuclear: "Strong", color: "#ff0000" },
    "CN": { name: "China", population: 1439323776, difficulty: "Hard", nuclear: "Strong", color: "#ff0000" },
    "IN": { name: "India", population: 1380004385, difficulty: "Hard", nuclear: "Strong", color: "#ff0000" },
    "RU": { name: "Russia", population: 145934462, difficulty: "Hard", nuclear: "Strong", color: "#ff0000" },
    "BR": { name: "Brazil", population: 212559417, difficulty: "Medium", nuclear: "Moderate", color: "#ff9900" },
    "JP": { name: "Japan", population: 126476461, difficulty: "Medium", nuclear: "Strong", color: "#ff0000" },
    "DE": { name: "Germany", population: 83783942, difficulty: "Medium", nuclear: "Moderate", color: "#ff9900" },
    "FR": { name: "France", population: 65273511, difficulty: "Medium", nuclear: "Strong", color: "#ff0000" },
    "GB": { name: "United Kingdom", population: 67886011, difficulty: "Medium", nuclear: "Strong", color: "#ff0000" },
    "IT": { name: "Italy", population: 60461826, difficulty: "Medium", nuclear: "Moderate", color: "#ff9900" },
    "CA": { name: "Canada", population: 37742154, difficulty: "Easy", nuclear: "Weak", color: "#00ff00" },
    "AU": { name: "Australia", population: 25499884, difficulty: "Easy", nuclear: "Weak", color: "#00ff00" },
    "MX": { name: "Mexico", population: 128932753, difficulty: "Medium", nuclear: "Weak", color: "#00ff00" },
    "KR": { name: "South Korea", population: 51269185, difficulty: "Medium", nuclear: "Moderate", color: "#ff9900" },
    "ZA": { name: "South Africa", population: 59308690, difficulty: "Easy", nuclear: "Weak", color: "#00ff00" },
    "EG": { name: "Egypt", population: 102334404, difficulty: "Medium", nuclear: "Weak", color: "#00ff00" },
    "NG": { name: "Nigeria", population: 206139589, difficulty: "Medium", nuclear: "Weak", color: "#00ff00" },
    "PK": { name: "Pakistan", population: 220892340, difficulty: "Hard", nuclear: "Strong", color: "#ff0000" },
    "BD": { name: "Bangladesh", population: 164689383, difficulty: "Medium", nuclear: "Weak", color: "#00ff00" },
    "TR": { name: "Turkey", population: 84339067, difficulty: "Medium", nuclear: "Moderate", color: "#ff9900" }
};

// Available Upgrades
const Upgrades = [
    { id: "stealth", name: "Stealth Protocol", description: "Reduces detection rate by 25%", cost: 1000, effect: "detection", value: -25 },
    { id: "firewall", name: "Firewall Bypass", description: "Hacking success rate increased", cost: 500, effect: "hacking", value: 20 },
    { id: "botnet", name: "Botnet Expansion", description: "Increases minigame balls by 1", cost: 800, effect: "minigame", value: 1 },
    { id: "encrypt", name: "Quantum Encryption", description: "Detection decreases faster", cost: 1500, effect: "recovery", value: 30 },
    { id: "payload", name: "Enhanced Payload", description: "Nuclear attacks 50% stronger", cost: 2000, effect: "attack", value: 50 },
    { id: "ai", name: "AI Assistant", description: "Auto-completes easy minigames", cost: 3000, effect: "auto", value: true }
];

// Minigame Variables
let minigame = {
    canvas: null,
    ctx: null,
    blocks: [],
    balls: [],
    ballCount: 3,
    score: 0,
    active: false,
    perks: {
        clear: false,
        extraBall: false,
        explosive: false,
        slow: false
    }
};

// ==============================================
// INITIALIZATION
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    // Initialize elements
    initMap();
    initDetectionSystem();
    initMinigame();
    initEventListeners();
    initUpgrades();
    
    // Start game loop
    setInterval(gameLoop, 1000);
    
    // Add initial log
    addLog("System initialized. Select a country to begin.", "success");
    
    // Update country count
    document.getElementById('total-countries').textContent = Object.keys(Countries).length;
}

// ==============================================
// WORLD MAP SYSTEM
// ==============================================

function initMap() {
    const svg = document.getElementById('world-map');
    
    // Simplified world map paths (in a real implementation, you would use a proper SVG map)
    Object.keys(Countries).forEach(code => {
        const country = Countries[code];
        // Create a simplified representation (circles for demo)
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        
        // Assign random positions for demo (in real map, these would be actual coordinates)
        const x = 100 + Math.random() * 1800;
        const y = 100 + Math.random() * 800;
        
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 15 + (country.population / 100000000));
        circle.setAttribute("id", `country-${code}`);
        circle.setAttribute("class", "country");
        circle.setAttribute("data-code", code);
        circle.setAttribute("fill", getDifficultyColor(country.difficulty));
        circle.setAttribute("opacity", "0.7");
        circle.setAttribute("stroke", "#00ff00");
        circle.setAttribute("stroke-width", "1");
        
        // Add hover effects
        circle.addEventListener('mouseenter', (e) => handleCountryHover(e, code));
        circle.addEventListener('mouseleave', handleCountryLeave);
        circle.addEventListener('click', (e) => handleCountryClick(e, code));
        
        svg.appendChild(circle);
        
        // Add country label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#00ff00");
        text.setAttribute("font-size", "12");
        text.textContent = code;
        svg.appendChild(text);
    });
}

function getDifficultyColor(difficulty) {
    switch(difficulty) {
        case "Easy": return "#00ff00";
        case "Medium": return "#ff9900";
        case "Hard": return "#ff0000";
        default: return "#666666";
    }
}

function handleCountryHover(event, code) {
    const country = Countries[code];
    const element = event.target;
    
    // Highlight country
    element.setAttribute("stroke-width", "3");
    element.setAttribute("opacity", "1");
    
    // Update terminal info
    document.getElementById('info-country').textContent = country.name;
    document.getElementById('info-population').textContent = country.population.toLocaleString();
    document.getElementById('info-difficulty').textContent = country.difficulty;
    document.getElementById('info-nuclear').textContent = country.nuclear;
    
    // Update status
    const status = GameState.hackedCountries.has(code) ? "COMPROMISED" : "VULNERABLE";
    document.getElementById('info-status').textContent = status;
    document.getElementById('info-status').className = status === "COMPROMISED" ? "success" : "warning";
    
    // Enable/disable hack button
    const hackBtn = document.getElementById('btn-hack');
    hackBtn.disabled = GameState.hackedCountries.has(code);
    
    // Enable attack button if country is hacked
    const attackBtn = document.getElementById('btn-attack');
    attackBtn.disabled = !GameState.hackedCountries.has(code);
    
    // Enable upgrade button
    const upgradeBtn = document.getElementById('btn-upgrade');
    upgradeBtn.disabled = false;
    
    // Store selected country
    GameState.selectedCountry = code;
    
    addLog(`Scanning ${country.name}... Population: ${country.population.toLocaleString()}`, "info");
}

function handleCountryLeave(event) {
    const element = event.target;
    element.setAttribute("stroke-width", "1");
    element.setAttribute("opacity", "0.7");
}

function handleCountryClick(event, code) {
    if (GameState.minigameActive) return;
    
    const country = Countries[code];
    GameState.selectedCountry = code;
    
    // Update terminal title
    document.getElementById('terminal-title').textContent = `TARGET: ${country.name.toUpperCase()}`;
    document.getElementById('terminal-status').innerHTML = `<span class="${GameState.hackedCountries.has(code) ? 'success' : 'warning'}">${GameState.hackedCountries.has(code) ? 'COMPROMISED' : 'VULNERABLE'}</span>`;
    
    addLog(`Selected target: ${country.name}`, "success");
    
    // Play click sound
    playSound('click');
}

// ==============================================
// DETECTION SYSTEM
// ==============================================

function initDetectionSystem() {
    // Set initial detection rate based on difficulty
    updateDifficulty();
    
    // Start detection increase interval
    setInterval(() => {
        if (GameState.gameActive && !GameState.minigameActive) {
            increaseDetection(0.1);
        }
    }, 5000);
}

function increaseDetection(amount) {
    if (!GameState.gameActive) return;
    
    // Apply difficulty multiplier
    let multiplier = 1;
    switch(GameState.difficulty) {
        case 'easy': multiplier = 0.5; break;
        case 'medium': multiplier = 1; break;
        case 'hard': multiplier = 1.5; break;
        case 'extreme': multiplier = 2; break;
    }
    
    // Apply stealth upgrade
    if (GameState.upgrades.has('stealth')) {
        multiplier *= 0.75;
    }
    
    const increase = amount * multiplier;
    GameState.detection = Math.min(100, GameState.detection + increase);
    
    // Update UI
    updateDetectionUI();
    
    // Check for detection threshold
    if (GameState.detection >= 100) {
        triggerFinalPhase();
    }
}

function decreaseDetection(amount) {
    GameState.detection = Math.max(0, GameState.detection - amount);
    updateDetectionUI();
}

function updateDetectionUI() {
    const fill = document.getElementById('detection-fill');
    const text = document.getElementById('detection-text');
    
    fill.style.width = `${GameState.detection}%`;
    text.textContent = `${GameState.detection.toFixed(1)}%`;
    
    // Update color based on level
    if (GameState.detection < 30) {
        fill.style.background = "linear-gradient(90deg, #00ff00, #00cc00)";
    } else if (GameState.detection < 70) {
        fill.style.background = "linear-gradient(90deg, #ffff00, #ff9900)";
    } else {
        fill.style.background = "linear-gradient(90deg, #ff0000, #990000)";
        // Add glitch effect at high detection
        if (GameState.detection > 90) {
            text.classList.add('glitch');
        }
    }
}

// ==============================================
// TERMINAL & HACKING SYSTEM
// ==============================================

document.getElementById('btn-hack').addEventListener('click', () => {
    if (!GameState.selectedCountry || GameState.hackedCountries.has(GameState.selectedCountry)) return;
    
    const country = Countries[GameState.selectedCountry];
    
    // Increase detection based on difficulty
    let detectionIncrease = 5;
    switch(country.difficulty) {
        case "Easy": detectionIncrease = 3; break;
        case "Medium": detectionIncrease = 7; break;
        case "Hard": detectionIncrease = 15; break;
    }
    
    increaseDetection(detectionIncrease);
    
    // Show hacking sequence
    showHackingSequence(country);
    
    // Play hack sound
    playSound('hack');
});

function showHackingSequence(country) {
    const output = document.getElementById('terminal-output');
    
    // Clear terminal
    output.innerHTML = '';
    
    const messages = [
        `Initiating hack on ${country.name}...`,
        "Establishing connection...",
        "Bypassing firewall...",
        "Decrypting security protocols...",
        "Gaining root access...",
        "Extracting classified data..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        if (i < messages.length) {
            addTerminalLine(messages[i]);
            i++;
        } else {
            clearInterval(interval);
            completeHack(country);
        }
    }, 800);
}

function completeHack(country) {
    // Add hacked country
    GameState.hackedCountries.add(GameState.selectedCountry);
    
    // Update UI
    const countryElement = document.getElementById(`country-${GameState.selectedCountry}`);
    countryElement.setAttribute("stroke", "#ff0000");
    countryElement.setAttribute("stroke-width", "3");
    countryElement.style.animation = "pulse 1s infinite";
    
    // Update counters
    document.getElementById('hacked-count').textContent = GameState.hackedCountries.size;
    document.getElementById('info-status').textContent = "COMPROMISED";
    document.getElementById('info-status').className = "success";
    
    // Disable hack button, enable attack button
    document.getElementById('btn-hack').disabled = true;
    document.getElementById('btn-attack').disabled = false;
    
    // Award points based on difficulty
    let points = 0;
    switch(country.difficulty) {
        case "Easy": points = 100; break;
        case "Medium": points = 250; break;
        case "Hard": points = 500; break;
    }
    
    GameState.points += points;
    updatePoints();
    
    // Add success message
    addTerminalLine(`SUCCESS! ${country.name} compromised. Nuclear access: ${country.nuclear}`);
    addTerminalLine(`Points awarded: ${points}`);
    addTerminalLine(`Detection increased by ${country.difficulty === "Hard" ? "15%" : country.difficulty === "Medium" ? "7%" : "3%"}`);
    
    // Launch minigame
    setTimeout(() => {
        startMinigame(country.difficulty);
    }, 1500);
    
    addLog(`Successfully hacked ${country.name}`, "success");
}

// ==============================================
// MINIGAME SYSTEM
// ==============================================

function initMinigame() {
    minigame.canvas = document.getElementById('minigame-canvas');
    minigame.ctx = minigame.canvas.getContext('2d');
    
    // Set canvas size
    minigame.canvas.width = 600;
    minigame.canvas.height = 400;
    
    // Event listeners for minigame controls
    document.getElementById('shoot-ball').addEventListener('click', shootBall);
    document.getElementById('pause-game').addEventListener('click', togglePause);
    document.getElementById('quit-game').addEventListener('click', quitMinigame);
    
    // Perk buttons
    document.querySelectorAll('.perk-btn').forEach(btn => {
        btn.addEventListener('click', () => activatePerk(btn.dataset.perk));
    });
}

function startMinigame(difficulty) {
    GameState.minigameActive = true;
    
    // Reset minigame state
    minigame.blocks = [];
    minigame.balls = [];
    minigame.score = 0;
    minigame.ballCount = 3;
    
    // Set ball count based on upgrades
    if (GameState.upgrades.has('botnet')) {
        minigame.ballCount++;
    }
    
    // Generate blocks based on difficulty
    let blockCount, blockHealth;
    switch(difficulty) {
        case "Easy":
            blockCount = 8;
            blockHealth = 2;
            break;
        case "Medium":
            blockCount = 12;
            blockHealth = 3;
            break;
        case "Hard":
            blockCount = 16;
            blockHealth = 5;
            break;
    }
    
    for (let i = 0; i < blockCount; i++) {
        minigame.blocks.push({
            x: 50 + (i % 8) * 65,
            y: 30 + Math.floor(i / 8) * 50,
            width: 60,
            height: 30,
            health: blockHealth,
            maxHealth: blockHealth,
            speed: difficulty === "Hard" ? 0.5 : 0.3
        });
    }
    
    // Show minigame container
    document.getElementById('minigame-container').style.display = 'flex';
    
    // Update UI
    updateMinigameUI();
    
    // Start game loop
    minigame.active = true;
    gameLoop();
    
    addLog("Firewall bypass minigame initiated", "warning");
}

function gameLoop() {
    if (!minigame.active) return;
    
    // Clear canvas
    minigame.ctx.fillStyle = '#000';
    minigame.ctx.fillRect(0, 0, minigame.canvas.width, minigame.canvas.height);
    
    // Draw grid background
    drawGrid();
    
    // Update and draw blocks
    minigame.blocks.forEach(block => {
        // Move block down
        block.y += block.speed;
        
        // Draw block
        const healthPercent = block.health / block.maxHealth;
        minigame.ctx.fillStyle = `rgb(${255 * (1 - healthPercent)}, ${255 * healthPercent}, 0)`;
        minigame.ctx.fillRect(block.x, block.y, block.width, block.height);
        
        // Draw block border
        minigame.ctx.strokeStyle = '#00ff00';
        minigame.ctx.lineWidth = 2;
        minigame.ctx.strokeRect(block.x, block.y, block.width, block.height);
        
        // Draw health number
        minigame.ctx.fillStyle = '#fff';
        minigame.ctx.font = '16px JetBrains Mono';
        minigame.ctx.textAlign = 'center';
        minigame.ctx.fillText(block.health, block.x + block.width/2, block.y + 20);
        
        // Check if block reached bottom
        if (block.y + block.height > minigame.canvas.height - 50) {
            endMinigame(false);
            return;
        }
    });
    
    // Update and draw balls
    minigame.balls.forEach((ball, index) => {
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Bounce off walls
        if (ball.x <= 10 || ball.x >= minigame.canvas.width - 10) {
            ball.vx = -ball.vx;
        }
        if (ball.y <= 10) {
            ball.vy = -ball.vy;
        }
        
        // Check if ball fell off bottom
        if (ball.y > minigame.canvas.height) {
            minigame.balls.splice(index, 1);
            return;
        }
        
        // Draw ball
        minigame.ctx.beginPath();
        minigame.ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
        minigame.ctx.fillStyle = '#00ff00';
        minigame.ctx.fill();
        minigame.ctx.strokeStyle = '#fff';
        minigame.ctx.lineWidth = 2;
        minigame.ctx.stroke();
        
        // Check collision with blocks
        minigame.blocks.forEach((block, blockIndex) => {
            if (ball.x > block.x && ball.x < block.x + block.width &&
                ball.y > block.y && ball.y < block.y + block.height) {
                
                // Hit block
                block.health--;
                ball.vy = -Math.abs(ball.vy);
                
                // Add score
                minigame.score += 10;
                updateMinigameUI();
                
                // Check if block destroyed
                if (block.health <= 0) {
                    minigame.blocks.splice(blockIndex, 1);
                    
                    // Random chance for extra ball
                    if (Math.random() < 0.2) {
                        spawnExtraBall(block.x + block.width/2, block.y + block.height/2);
                    }
                    
                    // Check win condition
                    if (minigame.blocks.length === 0) {
                        endMinigame(true);
                    }
                }
            }
        });
    });
    
    // Draw paddle
    const paddleWidth = 100;
    const paddleX = minigame.canvas.width/2 - paddleWidth/2;
    const paddleY = minigame.canvas.height - 30;
    
    minigame.ctx.fillStyle = '#00ff00';
    minigame.ctx.fillRect(paddleX, paddleY, paddleWidth, 15);
    
    // Draw ball count
    minigame.ctx.fillStyle = '#fff';
    minigame.ctx.font = '14px JetBrains Mono';
    minigame.ctx.fillText(`Balls: ${minigame.ballCount}`, 20, minigame.canvas.height - 10);
    minigame.ctx.fillText(`Score: ${minigame.score}`, minigame.canvas.width - 100, minigame.canvas.height - 10);
    
    // Request next frame
    if (minigame.active) {
        requestAnimationFrame(gameLoop);
    }
}

function drawGrid() {
    minigame.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
    minigame.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < minigame.canvas.width; x += 20) {
        minigame.ctx.beginPath();
        minigame.ctx.moveTo(x, 0);
        minigame.ctx.lineTo(x, minigame.canvas.height);
        minigame.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < minigame.canvas.height; y += 20) {
        minigame.ctx.beginPath();
        minigame.ctx.moveTo(0, y);
        minigame.ctx.lineTo(minigame.canvas.width, y);
        minigame.ctx.stroke();
    }
}

function shootBall() {
    if (minigame.ballCount <= 0) return;
    
    minigame.ballCount--;
    minigame.balls.push({
        x: minigame.canvas.width/2,
        y: minigame.canvas.height - 50,
        vx: (Math.random() - 0.5) * 8,
        vy: -8
    });
    
    updateMinigameUI();
    playSound('click');
}

function spawnExtraBall(x, y) {
    minigame.ballCount++;
    minigame.balls.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: -6
    });
    
    updateMinigameUI();
}

function activatePerk(perk) {
    const btn = document.querySelector(`[data-perk="${perk}"]`);
    if (btn.disabled) return;
    
    switch(perk) {
        case 'clear':
            minigame.blocks = [];
            endMinigame(true);
            break;
        case 'extra-ball':
            minigame.ballCount += 2;
            break;
        case 'explosive':
            minigame.blocks.forEach(block => {
                block.health -= 2;
            });
            break;
        case 'slow':
            minigame.blocks.forEach(block => {
                block.speed *= 0.5;
            });
            break;
    }
    
    btn.disabled = true;
    minigame.perks[perk] = true;
    
    addLog(`Perk activated: ${perk}`, "success");
}

function endMinigame(success) {
    minigame.active = false;
    
    // Hide minigame container
    setTimeout(() => {
        document.getElementById('minigame-container').style.display = 'none';
        GameState.minigameActive = false;
    }, 2000);
    
    // Update detection based on result
    if (success) {
        decreaseDetection(10);
        addTerminalLine("Firewall bypass successful!");
        addLog("Minigame completed successfully", "success");
    } else {
        increaseDetection(20);
        addTerminalLine("Firewall bypass failed! Detection increased.");
        addLog("Minigame failed", "error");
    }
}

function togglePause() {
    minigame.active = !minigame.active;
    if (minigame.active) {
        gameLoop();
    }
}

function quitMinigame() {
    minigame.active = false;
    document.getElementById('minigame-container').style.display = 'none';
    GameState.minigameActive = false;
    increaseDetection(15);
    addLog("Minigame aborted", "warning");
}

function updateMinigameUI() {
    document.getElementById('block-count').textContent = minigame.blocks.length;
    document.getElementById('ball-count').textContent = minigame.ballCount;
    document.getElementById('minigame-score').textContent = minigame.score;
}

// ==============================================
// ATTACK SYSTEM
// ==============================================

document.getElementById('btn-attack').addEventListener('click', () => {
    if (!GameState.selectedCountry || !GameState.hackedCountries.has(GameState.selectedCountry)) return;
    
    const country = Countries[GameState.selectedCountry];
    
    // Show attack interface
    showAttackInterface(country);
});

function showAttackInterface(country) {
    addTerminalLine("Initializing attack protocol...");
    addTerminalLine(`Target: ${country.name}`);
    addTerminalLine(`Nuclear strength: ${country.nuclear}`);
    addTerminalLine("Select target countries from the map...");
    
    // Highlight all unhacked countries as potential targets
    document.querySelectorAll('.country').forEach(el => {
        const code = el.dataset.code;
        if (!GameState.hackedCountries.has(code) && code !== GameState.selectedCountry) {
            el.setAttribute('stroke', '#ff0000');
            el.setAttribute('stroke-width', '2');
            el.style.cursor = 'crosshair';
            
            // Add click listener for targeting
            el.addEventListener('click', (e) => executeAttack(e, code, country));
        }
    });
    
    addLog("Attack mode activated. Select target country.", "warning");
}

function executeAttack(event, targetCode, sourceCountry) {
    const targetCountry = Countries[targetCode];
    
    // Calculate damage based on nuclear strength
    let damageMultiplier = 1;
    switch(sourceCountry.nuclear) {
        case "Weak": damageMultiplier = 0.5; break;
        case "Moderate": damageMultiplier = 1; break;
        case "Strong": damageMultiplier = 2; break;
    }
    
    // Apply upgrade bonus
    if (GameState.upgrades.has('payload')) {
        damageMultiplier *= 1.5;
    }
    
    const damage = Math.floor(targetCountry.population * 0.1 * damageMultiplier);
    GameState.population -= damage;
    
    // Update population display
    updatePopulation();
    
    // Increase detection
    increaseDetection(25);
    
    // Visual feedback
    const targetElement = document.getElementById(`country-${targetCode}`);
    targetElement.style.fill = '#ff0000';
    targetElement.style.opacity = '0.5';
    
    // Create explosion animation
    createExplosion(targetElement);
    
    // Add log
    addTerminalLine(`Attack launched from ${sourceCountry.name} to ${targetCountry.name}`);
    addTerminalLine(`Casualties: ${damage.toLocaleString()}`);
    addTerminalLine(`Global population reduced.`);
    
    addLog(`Attack executed: ${damage.toLocaleString()} casualties`, "error");
    
    // Reset highlighting
    setTimeout(() => {
        document.querySelectorAll('.country').forEach(el => {
            el.setAttribute('stroke', '#00ff00');
            el.setAttribute('stroke-width', '1');
            el.style.cursor = 'pointer';
            el.removeEventListener('click', executeAttack);
        });
    }, 3000);
}

function createExplosion(element) {
    const rect = element.getBoundingClientRect();
    const explosion = document.createElement('div');
    
    explosion.style.position = 'fixed';
    explosion.style.left = `${rect.left + rect.width/2}px`;
    explosion.style.top = `${rect.top + rect.height/2}px`;
    explosion.style.width = '0px';
    explosion.style.height = '0px';
    explosion.style.background = 'radial-gradient(circle, #ff0000, #ff9900, #ffff00)';
    explosion.style.borderRadius = '50%';
    explosion.style.transform = 'translate(-50%, -50%)';
    explosion.style.zIndex = '1000';
    
    document.body.appendChild(explosion);
    
    // Animate explosion
    let size = 0;
    const interval = setInterval(() => {
        size += 10;
        explosion.style.width = `${size}px`;
        explosion.style.height = `${size}px`;
        explosion.style.opacity = `${1 - size/100}`;
        
        if (size >= 100) {
            clearInterval(interval);
            explosion.remove();
        }
    }, 30);
    
    // Play explosion sound
    playSound('explosion');
}

// ==============================================
// UPGRADES SYSTEM
// ==============================================

function initUpgrades() {
    const grid = document.getElementById('upgrades-grid');
    
    Upgrades.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.dataset.id = upgrade.id;
        
        const purchased = GameState.upgrades.has(upgrade.id);
        if (purchased) {
            card.classList.add('purchased');
        }
        
        if (GameState.points < upgrade.cost && !purchased) {
            card.classList.add('unavailable');
        }
        
        card.innerHTML = `
            <div class="upgrade-title">${upgrade.name}</div>
            <div class="upgrade-desc">${upgrade.description}</div>
            <div class="upgrade-cost">
                <span>${upgrade.cost} PTS</span>
                <button class="btn" ${purchased || GameState.points < upgrade.cost ? 'disabled' : ''}>
                    ${purchased ? 'PURCHASED' : 'PURCHASE'}
                </button>
            </div>
        `;
        
        const purchaseBtn = card.querySelector('button');
        purchaseBtn.addEventListener('click', () => purchaseUpgrade(upgrade));
        
        grid.appendChild(card);
    });
    
    // Open upgrades panel
    document.getElementById('btn-upgrade').addEventListener('click', () => {
        document.getElementById('upgrades-panel').style.display = 'flex';
    });
    
    // Close upgrades panel
    document.getElementById('close-upgrades').addEventListener('click', () => {
        document.getElementById('upgrades-panel').style.display = 'none';
    });
}

function purchaseUpgrade(upgrade) {
    if (GameState.upgrades.has(upgrade.id)) return;
    if (GameState.points < upgrade.cost) return;
    
    GameState.points -= upgrade.cost;
    GameState.upgrades.add(upgrade.id);
    
    // Apply upgrade effect
    switch(upgrade.effect) {
        case 'detection':
            GameState.detectionRate *= (1 + upgrade.value/100);
            break;
    }
    
    // Update UI
    updatePoints();
    
    // Update upgrade card
    const card = document.querySelector(`[data-id="${upgrade.id}"]`);
    card.classList.add('purchased');
    card.classList.remove('unavailable');
    card.querySelector('button').textContent = 'PURCHASED';
    card.querySelector('button').disabled = true;
    
    addTerminalLine(`Upgrade purchased: ${upgrade.name}`);
    addLog(`Upgrade activated: ${upgrade.name}`, "success");
    
    // Play sound
    playSound('hack');
}

// ==============================================
// FINAL PHASE
// ==============================================

function triggerFinalPhase() {
    GameState.gameActive = false;
    
    // Show final modal
    const modal = document.getElementById('final-modal');
    modal.style.display = 'flex';
    
    // Play alert sound
    playSound('alert');
    
    // Launch button
    document.getElementById('final-launch-btn').addEventListener('click', launchAllMissiles);
    
    addLog("CRITICAL: Detection reached 100%", "error");
}

function launchAllMissiles() {
    // Hide modal
    document.getElementById('final-modal').style.display = 'none';
    
    // Show cinematic overlay
    const overlay = document.getElementById('cinematic-overlay');
    overlay.style.display = 'block';
    
    // Start missile strikes
    const strike = document.getElementById('missile-strike');
    strike.style.animation = 'missile-explosion 5s forwards';
    
    // Animate population counter to zero
    const populationElement = document.getElementById('final-population');
    let population = GameState.population;
    const interval = setInterval(() => {
        population = Math.max(0, population - 100000000);
        populationElement.textContent = population.toLocaleString();
        
        if (population <= 0) {
            clearInterval(interval);
            showSimulationComplete();
        }
    }, 50);
    
    // Play explosion sounds
    const explosionInterval = setInterval(() => {
        playSound('explosion');
    }, 800);
    
    setTimeout(() => {
        clearInterval(explosionInterval);
    }, 5000);
}

function showSimulationComplete() {
    const completeScreen = document.getElementById('simulation-complete');
    completeScreen.style.display = 'block';
    
    // Update final stats
    document.getElementById('final-population-result').textContent = GameState.population.toLocaleString();
    document.getElementById('final-hacked-result').textContent = GameState.hackedCountries.size;
    document.getElementById('final-points-result').textContent = GameState.points;
    
    // Restart button
    document.getElementById('restart-game').addEventListener('click', restartGame);
    
    // Change difficulty button
    document.getElementById('change-difficulty').addEventListener('click', () => {
        location.reload();
    });
}

function restartGame() {
    location.reload();
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

function addTerminalLine(text, className = 'output') {
    const output = document.getElementById('terminal-output');
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = `<span class="${className}">${text}</span>`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function addLog(message, type = 'info') {
    const log = document.getElementById('system-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function updatePoints() {
    document.getElementById('points-counter').textContent = GameState.points.toLocaleString();
}

function updatePopulation() {
    const popElement = document.getElementById('global-population');
    popElement.textContent = GameState.population.toLocaleString();
    
    // Format with animation
    popElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        popElement.style.transform = 'scale(1)';
    }, 300);
}

function updateDifficulty() {
    GameState.difficulty = document.getElementById('difficulty-select').value;
    
    // Update detection rate based on difficulty
    switch(GameState.difficulty) {
        case 'easy':
            GameState.detectionRate = 0.05;
            break;
        case 'medium':
            GameState.detectionRate = 0.1;
            break;
        case 'hard':
            GameState.detectionRate = 0.2;
            break;
        case 'extreme':
            GameState.detectionRate = 0.3;
            break;
    }
    
    addLog(`Difficulty set to: ${GameState.difficulty.toUpperCase()}`, "info");
}

function playSound(type) {
    const audio = document.getElementById(`${type}-sound`);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio play failed:", e));
    }
}

function initEventListeners() {
    // Difficulty selector
    document.getElementById('difficulty-select').addEventListener('change', updateDifficulty);
    
    // Map controls
    document.getElementById('reset-game').addEventListener('click', restartGame);
    document.getElementById('center-map').addEventListener('click', () => {
        addLog("Map centered", "info");
    });
    
    // Attack button
    document.getElementById('btn-attack').addEventListener('click', () => {
        if (GameState.selectedCountry && GameState.hackedCountries.has(GameState.selectedCountry)) {
            addTerminalLine("Attack protocol initialized. Select target country.");
        }
    });
}

// ==============================================
// INITIALIZATION COMPLETE
// ==============================================

console.log(`
╔══════════════════════════════════════════╗
║   HACKER SIMULATION v2.0 INITIALIZED    ║
║   Status: OPERATIONAL                   ║
║   Detection: ${GameState.detection}%                   ║
║   Countries Loaded: ${Object.keys(Countries).length}              ║
╚══════════════════════════════════════════╝
`);
