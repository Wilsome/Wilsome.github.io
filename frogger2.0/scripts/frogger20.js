

const levelDisplay = document.getElementById('level');
const speedDisplay = document.getElementById('speed');
const livesDisplay = document.getElementById('lives');
const timerDisplay = document.getElementById('timer');
const highestLevelDisplay = document.getElementById('previous-best-level');
const bestTimeDisplay = document.getElementById('previous-best-time');
const actionButton = document.getElementById('actionButton');
const canvas = document.getElementById('gameBoard');


let prevTimestamp = 0;
let cWidth = canvas.width;
let cHeight = canvas.height;
let context = canvas.getContext('2d');

let gameSpeed;
let level;
let lives;
let totalRoundTime;

function updateDisplayInformation() {
    speedDisplay.textContent = gameSpeed.toFixed(1);
    timerDisplay.textContent = timeRemaining;
    levelDisplay.textContent = level;
    livesDisplay.textContent = lives;
}

function updatePreviousBestDisplay() {
    let highestLevelRaw = localStorage.getItem('frogger_highest_level');
    let bestTimeRaw = localStorage.getItem('frogger_best_time');

    if (highestLevelRaw != null) {
        highestLevelDisplay.textContent = highestLevelRaw;
        bestTimeDisplay.textContent = `${bestTimeRaw} seconds`;
    }
    else {
        localStorage.setItem('frogger_highest_level', 0);
        localStorage.setItem('frogger_best_time', 1000000000);
        highestLevelDisplay.textContent = 'No record set yet.';
        bestTimeDisplay.textContent = '';
    }
}

function startNewGame() {
    totalRoundTime = 0;
    gameSpeed = 1;
    level = 1;
    lives = 3;
    timeRemaining = 30;
    frogger = new MovingObject(frogObstacle);
    lilyPad = new MovingObject(lilyPadObstacle);

    buildGameGrid();

    gameState = gameStates.running;
    gameOutcome = gameOutcomes.alive;
    updateDisplayInformation();
    updatePreviousBestDisplay();
}

function startNextLevel() {
    level++;
    gameSpeed += 0.1;
    timeRemaining = 29 + level;

    // add more row(s) to increase difficulty.
    let decision = level % 5;
    let randDirection = Math.random() >= 0.5 ? 1 : -1;
    let obstacleCount = Math.floor(Math.random() * 3) + 2; // rand 2-4

    if (decision <= 1) {
        gameRows.splice(1, 0, new GameRow(0, rowTypes.safe));
        gameRows.splice(1, 0, new GameRow(0, Math.random() >= 0.5 ? rowTypes.river : rowTypes.road, randDirection, obstacleCount));
        gameRows.splice(1, 0, new GameRow(0, gameRows[1].rowType, gameRows[1].direction, Math.floor(Math.random() * 3) + 2));
    }
    else if (decision === 3) {
        gameRows.splice(1, 0, new GameRow(0, rowTypes.safe));
        gameRows.splice(1, 0, new GameRow(0, Math.random() >= 0.5 ? rowTypes.river : rowTypes.road, randDirection, obstacleCount));
    }
    else {
        gameRows.splice(1, 0, new GameRow(0, gameRows[1].rowType, gameRows[1].direction, obstacleCount));
    }

    for(let i = 0; i < gameRows.length; i++) {
        gameRows[i].updateRowIndex(i);
    }

    resetFroggerAndLilyPad();
    gameState = gameStates.running;
    gameOutcome = gameOutcomes.alive;
    updateDisplayInformation();
}

function buildGameGrid() {

    let rowCount = 0;
    gameRows = [];
    gameRows.push(new GameRow(rowCount++, rowTypes.end));
    gameRows.push(new GameRow(rowCount++, rowTypes.road, -1, 2));
    gameRows.push(new GameRow(rowCount++, rowTypes.safe));
    gameRows.push(new GameRow(rowCount++, rowTypes.river, -1, 4));
    gameRows.push(new GameRow(rowCount++, rowTypes.safe));
    gameRows.push(new GameRow(rowCount++, rowTypes.road, 1, 2));
    gameRows.push(new GameRow(rowCount++, rowTypes.safe));

    resetFroggerAndLilyPad();
}

function resetFroggerAndLilyPad(){
    frogger.setGridPosition(gameRows.length - 1, Math.floor(gridColumns / 2));
    lilyPad.setGridPosition(0, Math.floor(Math.random() * 3) + 3);
}

/**
 * Update function that is called each animation frame to move objects or calculate game state.
 */
function update(deltaTime) {
    timeRemaining -= deltaTime;
    totalRoundTime += deltaTime;
    let froggerIsSafe = true;
    gameRows.forEach(row => {
        froggerIsSafe = froggerIsSafe && row.updateObstacles(gameSpeed, frogger.getRow() === row.rowIndex);
    })

    if (frogger.getRow() === lilyPad.getRow() && frogger.getCol() === lilyPad.getCol()) {
        gameOutcome = gameOutcomes.win;
    }
    else if (!froggerIsSafe) {
        gameOutcome = gameOutcomes.died;
    }

    switch (gameOutcome) {
        case gameOutcomes.died:
            gameState = gameStates.paused;
            if (lives <= 1) {
                gameOutcome = gameOutcomes.gameOver;
                actionButton.textContent = 'Start New Game';
                updateBestScore();
            }
            else {
                actionButton.textContent = 'Retry';
            }

            break;

        case gameOutcomes.win:
            gameState = gameStates.paused;
            actionButton.textContent = 'Next Level';
            // go to next level
            break;
    }
}

/**
 * The draw function that will re-draw the canvas based on calulcations done in the update method.
 */
function draw() {

    timerDisplay.textContent = Math.floor(timeRemaining);

    context.clearRect(0,0, cWidth, cHeight);

    // Draw the background
    let rowOffset = getBoardDrawLimit();
    for (let row=0; row < gridRows; row++) {
        for (let col=0; col < gridColumns; col++) {
            context.drawImage(
                backgroundImages[gameRows[row + rowOffset].rowType],
                col * squareSize, 
                row * squareSize, 
                squareSize, 
                squareSize);
        }

        gameRows[row + rowOffset].obstacles.forEach(item => {
            context.drawImage(
                item.obstacle.image,
                item.position.x,
                item.position.y - rowOffset * squareSize,
                item.obstacle.size,
                squareSize
            )
        });
    }

    // Draw lily pad
    context.drawImage(
        lilyPad.obstacle.image,
        lilyPad.position.x,
        lilyPad.position.y - rowOffset * squareSize,
        squareSize, 
        squareSize);
    
    // Draw the frog
    context.drawImage(
        frogger.obstacle.image,
        frogger.position.x,
        frogger.position.y - rowOffset * squareSize,
        squareSize, 
        squareSize);

    // Draw outcome if needed:
    if (gameOutcome !== gameOutcomes.alive) {
        context.font = 'bold 100px san-serif';
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle'
        switch(gameOutcome)
        {
            case gameOutcomes.died:
                context.fillText('You Died', 455, 305);
                context.fillStyle = 'red';
                context.fillText('You Died', 450, 300);
                break;

            case gameOutcomes.win:
                context.fillText('You Win!', 455, 305);
                context.fillStyle = 'lime';
                context.fillText('You Win!', 450, 300);
                break;

            case gameOutcomes.gameOver:
                context.fillText('Game Over', 455, 305);
                context.fillStyle = 'orange';
                context.fillText('Game Over', 450, 300);
                break;
        }

    }
}

function updateBestScore() {
    let highestLevel = Number(localStorage.getItem('frogger_highest_level'));
    let bestTime = Number(localStorage.getItem('frogger_best_time'));

    if (level > highestLevel || ( level == highestLevel && totalRoundTime < bestTime)) {
        localStorage.setItem('frogger_highest_level', level);
        localStorage.setItem('frogger_best_time', totalRoundTime.toFixed(2));
    }

    updatePreviousBestDisplay();
}

function getBoardDrawLimit() {
    let topVisibleRow = frogger.getRow() - 3;
    if (topVisibleRow < 0) {
        return 0;
    }
    else if (topVisibleRow > gameRows.length - gridRows) {
        return gameRows.length - gridRows;
    }
    
    return topVisibleRow;
}

/**
 * The game loop that runs with each animation frame to call update/draw along with time delta between each frame.
 * @param timestamp The time when the request frame was triggered.
 */
function gameLoop(timestamp) {
    if (gameState === gameStates.running) {
        update((timestamp - prevTimestamp) / 1000);
        draw();
    }
    
    prevTimestamp = timestamp;
    window.requestAnimationFrame(gameLoop);
}

function startStopGame() {
    if (gameState === gameStates.running) {
        gameState = gameStates.paused;
        actionButton.textContent = 'Continue';
    }
    else if (gameState === gameStates.paused) {
        switch (gameOutcome) {
            case gameOutcomes.died:
                lives--;
                timeRemaining = 29 + level;
                updateDisplayInformation();
                resetFroggerAndLilyPad();
                break;
            
            case gameOutcomes.win:
                startNextLevel();
                break;
            
            case gameOutcomes.gameOver:
                startNewGame();
                buildGameGrid();
                resetFroggerAndLilyPad();
                break;
        }

        gameOutcome = gameOutcomes.alive;
        gameState = gameStates.running;
        actionButton.textContent = 'Pause';
    }
    else {
        gameState = gameStates.running;
        actionButton.textContent = 'Pause';
    }
}

function keyUpEvent(event) {
    if (event.key === 'p') {
        startStopGame();
    }

    if (gameState !== gameStates.running) {
        // quick processing key events if game is not running.
        return;
    }

    if (event.key === 'ArrowUp') {
        frogger.moveBySquare(-1, 0);
        if (frogger.getRow() < 0) {
            frogger.setGridPosition(0, frogger.getCol());
        }
    }
    else if (event.key === 'ArrowDown') {
        frogger.moveBySquare(1, 0);
        if (frogger.getRow() >= gameRows.length) {
            frogger.setGridPosition(gameRows.length - 1, frogger.getCol());
        }
    }
    else if (event.key === 'ArrowLeft') {
        if (gameRows[frogger.getRow()].rowType === rowTypes.river) {
            // while on river, move left/right by distance vs squares as you will be on a log
            frogger.moveByPosition(-squareSize, 0);
        }
        else {
            frogger.moveBySquare(0, -1);
        }

        if (frogger.getCol() < 0) {
            frogger.setGridPosition(frogger.getRow(), 0);
        }
    }
    else if (event.key === 'ArrowRight') {
        if (gameRows[frogger.getRow()].rowType === rowTypes.river) {
            // while on river, move left/right by distance vs squares as you will be on a log
            frogger.moveByPosition(squareSize, 0);
        }
        else {
            frogger.moveBySquare(0, 1);
        }
        if (frogger.getCol() >= gridColumns) {
            frogger.setGridPosition(frogger.getRow(), gridColumns - 1);
        }
    }
}

window.addEventListener('keyup', keyUpEvent, false);
actionButton.onclick = startStopGame;

Promise.all(imageLoadPromises).then(() => {
    startNewGame();
    update(0);
    draw();

    gameState = gameStates.paused;
    window.requestAnimationFrame(gameLoop);
});



/** Refrences used for building game loop/engin to work with Canvas.
 * 
 * Game Loop Mechanics:
 * https://www.sitepoint.com/quick-tip-game-loop-in-javascript/#:~:text=1%20Quick%20Tip%3A%20How%20to%20Make%20a%20Game,...%205%20Asteroids.%20...%206%20Level%20Up.%20
 * 
 * Tutorial on Game Development
 * https://spicyyoghurt.com/tutorials/html5-javascript-game-development/develop-a-html5-javascript-game
 */