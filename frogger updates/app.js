const theGrid = document.querySelector('#grid');
const timeLeftDisplay = document.querySelector('#time-left');
const resultDisplay = document.querySelector('#result');
const startPauseButton = document.querySelector('#start-pause-button');
const levelDisplay = document.querySelector('#level');
let squares = document.querySelectorAll('.grid div');
const logsLeft = document.querySelectorAll('.log-left');
const logsRight = document.querySelectorAll('.log-right');
const carsLeft = document.querySelectorAll('.car-left');
const carsRight = document.querySelectorAll('.car-right');
let additionalCars = [];


//sets current starting place for frog
let currentIndex = 76; 
let curLevelIndex = -1;

//board width
const width = 9;

let timerId;

let outcomeTimerId;
let currentTime = 20;

function resetFrogPosition()
{
    squares[currentIndex].classList.remove('frog');
    currentIndex = squares.length - 5;
    squares[currentIndex].classList.add('frog');
}

//function to move the frog. will update the current index to move the frog
function moveFrog(e) {

    //will remove the frog from the previous location
    squares[currentIndex].classList.remove('frog');
    
    if (e.key === 'a' || e.key == 'ArrowLeft') {
        //checks to see if frog is at the left most boarder
        if(currentIndex % width !==0){
            currentIndex -=1;
        }
    }
    else if (e.key === 'w' || e.key == 'ArrowUp') {
        //check to see if frog can move up
        if(currentIndex - width >=0){
            currentIndex -= width;
        }
    }
    else if (e.key === 'd' || e.key == 'ArrowRight') {
        //check to see if frog is at the right most boarder
        if(currentIndex % width < width-1){
            currentIndex += 1;
        }
    }
    else if (e.key === 's' || e.key == 'ArrowDown') {
        //checks to see if the frog can move down
        if(currentIndex + width < width*width){
            currentIndex += width;
        }
    }

    squares[currentIndex].classList.add('frog');
}

//function that takes each element that has been selected, and passes it into its specific move function. 
function autoMoveElements() {
    currentTime--;
    timeLeftDisplay.textContent = currentTime;
    logsLeft.forEach(logLeft => moveLogLeft(logLeft));
    logsRight.forEach(logRight => moveLogRight(logRight));
    carsLeft.forEach(carLeft => moveCarLeft(carLeft));
    carsRight.forEach(carRight => moveCarRight(carRight));
    additionalCars.forEach(newRow => newRow.forEach(car => moveCarLeft(car)));
}

function newLevel() {
    additionalCars.push([]);
    let dir = Math.floor(Math.random()*2) == 1;
    carsLeft.forEach(spot => {
        let node = spot.cloneNode();
        if (dir) {
            moveCarLeft(node);
        }
        else {
            moveCarRight(node);
        }
        carsLeft[0].parentNode.insertBefore(node, carsLeft[0]);
        additionalCars[curLevelIndex].push(node);
    });

    curLevelIndex++;
    levelDisplay.textContent = curLevelIndex + 1;
    squares = document.querySelectorAll('.grid div');
}

//check win, loss condition
function checkOutComes() {
    lose();
    win();
}

/*moves logs to left*/ 
function moveLogLeft(logLeft) {
    switch(true) {
        case logLeft.classList.contains('l1') :
            logLeft.classList.remove('l1')
            logLeft.classList.add('l2');
            break
        case logLeft.classList.contains('l2') :
            logLeft.classList.remove('l2')
            logLeft.classList.add('l3');
            break
        case logLeft.classList.contains('l3') :
            logLeft.classList.remove('l3')
            logLeft.classList.add('l4');
            break
        case logLeft.classList.contains('l4') :
            logLeft.classList.remove('l4')
            logLeft.classList.add('l5');
            break
        case logLeft.classList.contains('l5') :
            logLeft.classList.remove('l5')
            logLeft.classList.add('l1');
            break
    }
}

/*moves logs to right */
function moveLogRight(logRight) {
    switch(true) {
        case logRight.classList.contains('l1') :
            logRight.classList.remove('l1')
            logRight.classList.add('l5')
            break
        case logRight.classList.contains('l2') :
            logRight.classList.remove('l2')
            logRight.classList.add('l1')
            break
        case logRight.classList.contains('l3') :
            logRight.classList.remove('l3')
            logRight.classList.add('l2')
            break
        case logRight.classList.contains('l4') :
            logRight.classList.remove('l4')
            logRight.classList.add('l3')
            break
        case logRight.classList.contains('l5') :
            logRight.classList.remove('l5')
            logRight.classList.add('l4')
            break
    }
}

/*moves cars to left*/
function moveCarLeft(carLeft) {
    switch(true) {
        case carLeft.classList.contains('c1') :
            carLeft.classList.remove('c1')
            carLeft.classList.add('c2')
            break
        case carLeft.classList.contains('c2') :
            carLeft.classList.remove('c2')
            carLeft.classList.add('c3')
            break
        case carLeft.classList.contains('c3') :
            carLeft.classList.remove('c3')
            carLeft.classList.add('c1')
            break
    }
}

/*moves cars to right */
function moveCarRight(carRight) {
    switch(true) {
        case carRight.classList.contains('c1') :
            carRight.classList.remove('c1')
            carRight.classList.add('c3')
            break
        case carRight.classList.contains('c2') :
            carRight.classList.remove('c2')
            carRight.classList.add('c1')
            break
        case carRight.classList.contains('c3') :
            carRight.classList.remove('c3')
            carRight.classList.add('c2')
            break
    }
}

//conditions to win
function lose() {

    //checks if current location is car or water
    if (
        squares[currentIndex].classList.contains('c1') ||
        squares[currentIndex].classList.contains('l4') ||
        squares[currentIndex].classList.contains('l5') ||
        currentTime <= 0
    ) {
        resultDisplay.textContent = 'You lose!';
        startPauseButton.textContent = 'Restart';
        clearInterval(timerId);
        clearInterval(outcomeTimerId);
        document.removeEventListener('keyup', moveFrog);
        curLevelIndex = -2;
    }
}

//checks if frog has reached ending block
function win() {
    if (squares[currentIndex].classList.contains('ending-block')) {
        resultDisplay.textContent = 'You Win!';
        startPauseButton.textContent = 'Go';
        clearInterval(timerId);
        clearInterval(outcomeTimerId);
        timerId = null;
        outcomeTimerId = null;
        document.removeEventListener('keyup', moveFrog);
        newLevel();
        resetFrogPosition();
        currentTime = 20;
    }
}

//on button click will start game. 
startPauseButton.addEventListener('click', () => {
    if (curLevelIndex == -2) {
        window.location.reload();
    }

    if (timerId) {
        clearInterval(timerId);
        clearInterval(outcomeTimerId);
        outcomeTimerId = null;
        timerId = null;
        resultDisplay.textContent = 'Paused';
        startPauseButton.textContent = 'Go';
        document.removeEventListener('keyup', moveFrog);        
    } else {
        if (curLevelIndex == -1) {
            curLevelIndex = 0;
        }

        timerId = setInterval(autoMoveElements, 1000);
        outcomeTimerId = setInterval(checkOutComes, 50);
        resultDisplay.textContent = 'Go';
        startPauseButton.textContent = 'Pause';

        //listens for a keyup that will call the moveFrog function
        document.addEventListener('keyup', moveFrog);
    }
})
