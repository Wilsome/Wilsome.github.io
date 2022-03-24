
/** represents the possible game states */
const gameStates = {
    notStarted: -1,
    paused: 0,
    running: 1
};

const gameOutcomes = {
    alive: 0,
    died: 1,
    win: 2,
    gameOver: 3
}

const rowTypes = {
    safe: 0,
    road: 1,
    river: 2,
    end: 3
};

const speedModifierOptions = [1.0, 0.75, 1.0, 1.25];


const defaultLevelTime = 30;
const squareSize = 100;
const halfSquareSize = squareSize / 2;
const gridColumns = 9;
const gridRows = 6;
const imageLoadPromises = [];
const roadLimits = { min: -2 * squareSize, max: (gridColumns + 2) * squareSize, total: (gridColumns + 4) * squareSize };
const riverLimits  = { min: -3 * squareSize, max: (gridColumns + 3) * squareSize, total: (gridColumns + 6) * squareSize };
let timeRemaining = defaultLevelTime;
let currentModifierIndex = 0;
let gameState = gameStates.notStarted;
let gameOutcome = gameOutcomes.alive;
let gameRows = [];

class Obstacle {
    constructor(image, size, isSafe) {
        this.image = image;
        this.size = size * squareSize;
        this.isSafe = isSafe;
    }
}

const frogObstacle = new Obstacle(loadImage('./images/frog.png'), 1, true);
let frogger;

const backgroundImages = {
    [rowTypes.safe]: loadImage('./images/grass.png'),
    [rowTypes.road]: loadImage('./images/road.png'),
    [rowTypes.river]: loadImage('./images/river.png'),
    [rowTypes.end]: loadImage('./images/lake.png'),
};

const carLeftOptions = [
    new Obstacle(loadImage('./images/car1_left.png'), 1, false),
    new Obstacle(loadImage('./images/car2_left.png'), 1, false),
    new Obstacle(loadImage('./images/car3_left.png'), 1, false),
    new Obstacle(loadImage('./images/truck_left.png'), 2, false)
];

const carRightOptions = [
    new Obstacle(loadImage('./images/car1_right.png'), 1, false),
    new Obstacle(loadImage('./images/car2_right.png'), 1, false),
    new Obstacle(loadImage('./images/car3_right.png'), 1, false),
    new Obstacle(loadImage('./images/truck_right.png'), 2, false)
];

const log = new Obstacle(loadImage('./images/log.png'), 3, true);

const lilyPadObstacle = new Obstacle(loadImage('./images/LilyPad.png'), 1, true);

function loadImage(imgUrl) {
    let img = new Image();
    imageLoadPromises.push(new Promise(resolve => {
        img.onload = function() {
            resolve();
        };

        img.src = imgUrl;
    }));

    return img;
}

class GameRow {
    constructor(rowIndex, rowType, direction, numbOfObstacles) {
        this.rowIndex = rowIndex;
        this.rowType = rowType;
        this.direction = direction;
        this.isSafe = rowType === rowTypes.road || rowType === rowTypes.safe;
        this.speedModifier = speedModifierOptions[currentModifierIndex++];
        currentModifierIndex = currentModifierIndex % speedModifierOptions.length;
        this.obstacles = [];

        for (let i = 0; i < numbOfObstacles; i++) {
            let movingObj;
            if (this.rowType === rowTypes.road) {
                let randOption = Math.floor(Math.random() * carLeftOptions.length);
                let randomCar = this.direction == 1 ? carRightOptions[randOption] : carLeftOptions[randOption];
                movingObj = new MovingObject(randomCar);
                movingObj.position = {
                    x: i * (roadLimits.total / numbOfObstacles),
                    y: this.rowIndex * squareSize
                };
            }
            else if (this.rowType === rowTypes.river) {
                movingObj = new MovingObject(log);
                movingObj.position = {
                    x: i * (riverLimits.total / numbOfObstacles),
                    y: this.rowIndex * squareSize
                };
            }

            this.obstacles.push(movingObj);
        }
    }

    updateObstacles(moveDelta, froggerInRow) {
        let isFroggerSafe = !froggerInRow || this.isSafe;
        this.obstacles.forEach(item => {
            item.moveByPosition(this.direction * moveDelta * this.speedModifier, 0);
            if (froggerInRow) {
                if (frogger.position.x >= item.position.x - halfSquareSize && frogger.position.x < item.position.x - halfSquareSize + item.obstacle.size) {
                    if (item.obstacle.isSafe) {
                        isFroggerSafe = true;
                        frogger.moveByPosition(this.direction * moveDelta * this.speedModifier, 0);
                    }
                    else
                    {
                        gameOutcome = gameOutcomes.died;
                    }
                }
            }

            if (this.rowType === rowTypes.road) {
                item.wrapXPosition(roadLimits.min, roadLimits.max);
            }
            else if (this.rowType === rowTypes.river) {
                item.wrapXPosition(riverLimits.min, riverLimits.max);
            }
        });

        return isFroggerSafe;
    }

    updateRowIndex(rowIndex) {
        this.rowIndex = rowIndex;
        this.obstacles.forEach(item => {
            item.position.y = this.rowIndex * squareSize;
        });
    }
}

class MovingObject {
    /**
     * Create a moving object that represents the frog, cars, logs, etc.
     */
    constructor(obstacle) {
        this.obstacle = obstacle;
        this.position = { x: 0, y: 0 };
    }

    /**
     * Move the object by a number of squares, this will set the object to the closest square.
     * @param rowDelta Number of rows to move the object
     * @param colDelta Number of columns to move the object
     */
    moveBySquare(rowDelta, colDelta) {
        this.position.x = Math.round((this.position.x + colDelta * squareSize) / squareSize) * squareSize;
        this.position.y = Math.round((this.position.y + rowDelta * squareSize) / squareSize) * squareSize;
    }

    /**
     * Move the object by a delta amount on the x,y coordinates
     * @param xDelta The amount to move on the x axis (within a row)
     * @param yDelta The amount to move on the y axis (within a col)
     */
    moveByPosition(xDelta, yDelta) {
        this.position.x += xDelta;
        this.position.y += yDelta;
    }

    wrapXPosition(minX, maxX) {
        if (this.position.x > maxX) {
            this.position.x = minX;
        }
        else if (this.position.x < minX) {
            this.position.x = maxX;
        }
    }

    setGridPosition(row, col) {
        this.position.x = col * squareSize;
        this.position.y = row * squareSize;
    }

    getRow() {
        return Math.round(this.position.y / squareSize);
    }

    getCol() {
        return Math.round(this.position.x / squareSize);
    }
}