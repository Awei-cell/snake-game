// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// 设置画布尺寸
canvas.width = 400;
canvas.height = 400;

// 游戏变量
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed = 150; // 初始速度
let gameInterval = null;
let gameRunning = false;

// 初始化游戏
function initGame() {
    // 重置蛇的位置和长度
    snake = [
        { x: 10, y: 10, direction: 'right' },
        { x: 9, y: 10, direction: 'right' },
        { x: 8, y: 10, direction: 'right' }
    ];
    
    // 初始化方向
    direction = 'right';
    nextDirection = 'right';
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    
    // 生成食物
    generateFood();
    
    // 显示最高分
    highScoreElement.textContent = highScore;
    
    // 更新速度显示
    speedValue.textContent = `${gameSpeed}ms`;
    speedSlider.value = gameSpeed;
    
    // 绘制初始游戏状态
    draw();
}

// 生成食物
function generateFood() {
    let newFood;
    let onSnake;
    
    do {
        onSnake = false;
        newFood = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
            type: Math.random() > 0.7 ? 'special' : 'normal' // 30%几率生成特殊食物
        };
        
        // 检查食物是否生成在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);
    
    food = newFood;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * 20, 0);
        ctx.lineTo(i * 20, canvas.height);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * 20);
        ctx.lineTo(canvas.width, i * 20);
        ctx.stroke();
    }
    
    // 绘制蛇身
    for (let i = 1; i < snake.length; i++) {
        // 为蛇身创建渐变效果
        const gradient = ctx.createLinearGradient(
            snake[i].x * 20, 
            snake[i].y * 20, 
            snake[i].x * 20 + 20, 
            snake[i].y * 20 + 20
        );
        gradient.addColorStop(0, '#45a049');
        gradient.addColorStop(1, '#8bc34a');
        
        ctx.fillStyle = gradient;
        
        // 根据方向绘制不同形状的蛇身
        if (snake[i].direction === 'right' || snake[i].direction === 'left') {
            ctx.fillRect(snake[i].x * 20 + 2, snake[i].y * 20 + 5, 16, 10);
        } else {
            ctx.fillRect(snake[i].x * 20 + 5, snake[i].y * 20 + 2, 10, 16);
        }
    }
    
    // 绘制蛇头
    ctx.save();
    ctx.translate(snake[0].x * 20 + 10, snake[0].y * 20 + 10);
    
    // 根据方向旋转蛇头
    switch (direction) {
        case 'up':
            ctx.rotate(-Math.PI / 2);
            break;
        case 'down':
            ctx.rotate(Math.PI / 2);
            break;
        case 'left':
            ctx.rotate(Math.PI);
            break;
        // 'right' 不需要旋转
    }
    
    // 绘制蛇头三角形
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();
    
    // 绘制蛇眼睛
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-3, -5, 2, 0, Math.PI * 2);
    ctx.arc(-3, 5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-4, -5, 1, 0, Math.PI * 2);
    ctx.arc(-4, 5, 1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // 绘制食物
    if (food.type === 'special') {
        // 特殊食物（金色，带光环）
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 12, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // 普通食物
        ctx.fillStyle = '#f44336';
        ctx.beginPath();
        ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 更新游戏状态
function update() {
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头位置
    let head = { x: snake[0].x, y: snake[0].y, direction: direction };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 检查游戏结束条件
    // 撞到墙壁
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        gameOver();
        return;
    }
    
    // 撞到自己
    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            gameOver();
            return;
        }
    }
    
    // 将新的头部添加到蛇的前面
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数（特殊食物加分更多）
        score += food.type === 'special' ? 20 : 10;
        scoreElement.textContent = score;
        
        // 检查是否更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 生成新食物
        generateFood();
    } else {
        // 如果没吃到食物，移除尾部
        snake.pop();
    }
    
    // 绘制更新后的游戏状态
    draw();
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    restartBtn.disabled = false;
    
    // 显示游戏结束消息
    alert(`游戏结束！您的分数是：${score}`);
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        restartBtn.disabled = false;
        speedSlider.disabled = true; // 游戏运行时禁用速度滑块
        
        // 如果是新游戏，初始化游戏状态
        if (snake.length === 0) {
            initGame();
        }
        
        gameInterval = setInterval(update, gameSpeed);
    }
}

// 暂停游戏
function pauseGame() {
    if (gameRunning) {
        clearInterval(gameInterval);
        gameRunning = false;
        startBtn.textContent = '继续游戏';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        speedSlider.disabled = false; // 暂停时启用速度滑块
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    gameRunning = false;
    startBtn.textContent = '开始游戏';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    restartBtn.disabled = false;
    speedSlider.disabled = false; // 重新开始时启用速度滑块
    initGame();
}

// 更新游戏速度
function updateGameSpeed() {
    gameSpeed = parseInt(speedSlider.value);
    speedValue.textContent = `${gameSpeed}ms`;
    
    // 如果游戏正在运行，更新间隔
    if (gameRunning) {
        clearInterval(gameInterval);
        gameInterval = setInterval(update, gameSpeed);
    }
}

// 处理键盘输入
function handleKeyDown(e) {
    // 防止页面滚动
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // 根据按键设置下一个方向
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
        case ' ': // 空格键暂停/继续
            if (gameRunning) {
                pauseGame();
            } else if (snake.length > 0) {
                startGame();
            }
            break;
    }
}

// 添加事件监听器
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
speedSlider.addEventListener('input', updateGameSpeed);
window.addEventListener('keydown', handleKeyDown);

// 初始化游戏
initGame();