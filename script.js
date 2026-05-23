const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis do jogo
let frames = 0;
let score = 0;
let gameState = 'START'; 

// Carrega o recorde salvo no navegador (se não existir, começa em 0)
let highScore = localStorage.getItem('flappyHighScore') || 0;

// Objeto do Pássaro Melhorado
const bird = {
    x: 60,
    y: 150,
    radius: 12,
    gravity: 0.25,
    velocity: 0,
    jump: -5.5,
    
    draw() {
        // Corpo do passarinho
        ctx.fillStyle = '#f1c40f'; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#d35400';
        ctx.stroke();

        // Branco do olho
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + 5, this.y - 4, 5, 0, Math.PI * 2);
        ctx.fill();

        // Pupila
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 7, this.y - 4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Bico
        ctx.fillStyle = '#e67e22'; 
        ctx.beginPath();
        ctx.moveTo(this.x + 8, this.y + 2);
        ctx.lineTo(this.x + 22, this.y + 4); 
        ctx.lineTo(this.x + 8, this.y + 8);
        ctx.fill();
    },
    
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        
        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius;
            gameState = 'GAME_OVER';
        }
        
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocity = 0;
        }
    },
    
    flap() {
        this.velocity = this.jump;
    }
};

// Objeto dos Canos
const pipes = {
    items: [],
    width: 50,
    gap: 130, 
    dx: 2.5,  
    
    draw() {
        for (let i = 0; i < this.items.length; i++) {
            let p = this.items[i];
            
            ctx.fillStyle = '#2ecc71'; 
            ctx.strokeStyle = '#27ae60'; 
            ctx.lineWidth = 3;
            
            // Cano de Cima
            ctx.fillRect(p.x, 0, this.width, p.top);
            ctx.strokeRect(p.x, 0, this.width, p.top);
            ctx.fillRect(p.x - 4, p.top - 20, this.width + 8, 20);
            ctx.strokeRect(p.x - 4, p.top - 20, this.width + 8, 20);
            
            // Cano de Baixo
            ctx.fillRect(p.x, canvas.height - p.bottom, this.width, p.bottom);
            ctx.strokeRect(p.x, canvas.height - p.bottom, this.width, p.bottom);
            ctx.fillRect(p.x - 4, canvas.height - p.bottom, this.width + 8, 20);
            ctx.strokeRect(p.x - 4, canvas.height - p.bottom, this.width + 8, 20);
        }
    },
    
    update() {
        if (frames % 90 === 0) {
            let topHeight = Math.random() * (canvas.height - this.gap - 100) + 50;
            let bottomHeight = canvas.height - topHeight - this.gap;
            
            this.items.push({
                x: canvas.width,
                top: topHeight,
                bottom: bottomHeight,
                passed: false
            });
        }
        
        for (let i = 0; i < this.items.length; i++) {
            let p = this.items[i];
            p.x -= this.dx;

            // Colisão
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.width) {
                if (bird.y - bird.radius < p.top || bird.y + bird.radius > canvas.height - p.bottom) {
                    gameState = 'GAME_OVER';
                }
            }

            // Pontuação e atualização do Recorde
            if (p.x + this.width < bird.x - bird.radius && !p.passed) {
                score++;
                p.passed = true;
                
                // Se a pontuação atual for maior que o recorde, atualiza o recorde
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('flappyHighScore', highScore); // Salva no navegador
                }
            }

            if (p.x + this.width < -10) {
                this.items.shift();
                i--;
            }
        }
    },
    
    reset() {
        this.items = [];
    }
};

// Controles
function handleInput() {
    if (gameState === 'START') {
        gameState = 'PLAYING';
    } else if (gameState === 'PLAYING') {
        bird.flap();
    } else if (gameState === 'GAME_OVER') {
        resetGame();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') handleInput();
});
canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput();
});

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.reset();
    score = 0;
    frames = 0;
    gameState = 'PLAYING';
}

// Função de texto atualizada para permitir alinhamento (centro, direita, esquerda)
function drawText(text, x, y, size, color, align = 'center') {
    ctx.font = `bold ${size}px 'Segoe UI', Arial`;
    ctx.textAlign = align;
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    // Ajuste da sombra baseado no alinhamento para não ficar estranho
    let shadowOffsetX = align === 'right' ? -2 : 2; 
    ctx.fillText(text, x + shadowOffsetX, y + 2);
    
    // Texto principal
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

// Loop Principal
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'START') {
        bird.draw();
        drawText('FLAPPY BIRD', canvas.width / 2, 200, 40, '#f1c40f');
        drawText('Clique ou Espaço para voar', canvas.width / 2, 250, 20, 'white');
        
        // Mostra o recorde na tela inicial
        drawText('Recorde Atual: ' + highScore, canvas.width / 2, 300, 20, '#f1c40f');
        
    } else if (gameState === 'PLAYING') {
        pipes.update();
        pipes.draw();
        bird.update();
        bird.draw();
        
        // Pontuação atual no centro
        drawText(score, canvas.width / 2, 60, 50, 'white');
        
        // Recorde no canto superior direito
        drawText('Recorde: ' + highScore, canvas.width - 15, 30, 18, '#f1c40f', 'right');
        
    } else if (gameState === 'GAME_OVER') {
        pipes.draw();
        bird.draw();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawText('FIM DE JOGO', canvas.width / 2, 180, 40, '#e74c3c');
        drawText('Pontos: ' + score, canvas.width / 2, 240, 30, 'white');
        drawText('Recorde: ' + highScore, canvas.width / 2, 280, 25, '#f1c40f');
        drawText('Clique para tentar de novo', canvas.width / 2, 340, 18, 'white');
    }

    frames++;
    requestAnimationFrame(loop);
}

// Inicia o jogo
loop();