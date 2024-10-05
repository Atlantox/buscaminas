const body = document.getElementById('body');
body.addEventListener('keypress', (e) => {
    if(e.key === 'Enter')
        InitGame();
})

const board = document.getElementsByClassName('board')[0]
const boardResult = document.getElementById('result')
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');

widthInput.value = 10
heightInput.value = 10

const backgroundMusic = new Audio('desert.wav');
const loseSound = new Audio('lose.wav')
const winSound = new Audio('win.wav')

const revealSoundName = 'reveal.wav'
const blockSoundName = 'block.wav'
const unblockSoundName = 'unblock.wav'
backgroundMusic.loop = true

const cellSize = 27; // 25px height and weight and 2px border in all sides
let gameBeginning = true
let gameFinished = false
let gameMuted = false

let revealedCells = 0
let cellsQuantity = 0
let minesQuantity = 0
let width = 10
let height = 10
let minesLeft = 0
const minePercent = 20; // X% of all cells will be mines

let cellsGrid = []

function ResetVars(){
    boardResult.innerHTML = ''
    boardResult.classList = []
    gameFinished = false
    gameBeginning = true
    board.innerHTML = ''
    revealedCells = 0
    minesQuantity = 0

    if(!gameMuted)
        backgroundMusic.play()

    cellsGrid = []
    board.innerHTML = ''
}


function InitGame(){
    ResetVars()
    width = document.getElementById('width').value
    height = document.getElementById('height').value
    userMines = document.getElementById('mines').value    

    cellsQuantity = width * height;    

    if(userMines === '')
        minesQuantity = Math.floor(cellsQuantity * (minePercent) / 100)
    else
        minesQuantity = userMines

    if(minesQuantity >= cellsQuantity / 2){
        alert('Hay demasiadas minas, combinación injugable')
        return
    }

    minesLeft = minesQuantity

    UpdateMinesLeft()
    UpdateMinesQuantity()
    StyleBoard()
    DisplayBoard()

    const beginButton = document.getElementById('btn');
    beginButton.innerHTML = 'Reiniciar'    
}

// Create the empty cells without mines
function DisplayBoard(){
    let counter = 0;
    let odd = false;
    for(let y = 0; y < height; y++){
        odd = !odd
        for(let x = 0; x < width; x++){
            counter ++;

            if(cellsGrid[x] === undefined)
                cellsGrid[x] = []

            const htmlCell = document.createElement('span')
            htmlCell.classList.add('cell')
            htmlCell.classList.add(odd ? 'odd' : 'even')
            htmlCell.classList.add('hidden')
            htmlCell.id = counter
            htmlCell.setAttribute('x', x)
            htmlCell.setAttribute('y', y)
            board.appendChild(htmlCell)

            const logicCell = new Cell(x, y, counter, htmlCell)            
            cellsGrid[x][y] = logicCell
            
            htmlCell.addEventListener('click', (e) => { DiscoverCell(logicCell); })
            htmlCell.addEventListener('contextmenu', function(e) {
                e.preventDefault(); 
                BlockCell(logicCell); 
                return false 
            }, false)            

            odd = !odd
        } 
    }    
}


// Clicking a cell or discovering surrounding cells with 0 mines-proximity
function DiscoverCell(logicCell, automatic = false){
    if(gameFinished)
        return

    if(logicCell.isBlocked)
        return
        
    if(automatic === false && logicCell.revealed === false && gameMuted === false){
        const revealSound = new Audio(revealSoundName);
        revealSound .play() 
    }

    if(logicCell.isMine){
        if(automatic === false)
            GameOver()
    }
    else{
        if(gameBeginning){
            gameBeginning = false

            // The first move will be always mineless and the 8 circundant cells will be not mines
            logicCell.ready = true
            logicCell.isMine = false
            let surroundingCells = GetSurroundingCells(logicCell)   
            const surroundingCellsCoords = [] 
            
            // We will take a extra random surrounding cell of the knowed surrounding cells
            // And make it and the surrounding cells of that cell non-mines
            // This is to prevent perfect-square blank spaces generation
            while(true){
                let randomCell = Math.floor(Math.random() * surroundingCells.length)
                randomCell = surroundingCells[randomCell]
                
                // These random modifier will add or substract 1 to a coord to obtain a random surrounding cell and make it mineless
                let randomXModifier = Math.floor(Math.random() * 2) === 0 ? 1 : -1
                let randomYModifier = Math.floor(Math.random() * 2) === 0 ? 1 : -1

                if(cellsGrid[randomCell.x + randomXModifier] === undefined)
                    continue

                const extraCell = cellsGrid[randomCell.x + randomXModifier][randomCell.y + randomYModifier]                

                if(extraCell === undefined)
                    continue
                
                if(extraCell.ready)
                    continue

                const extraCellSurroundingCells = GetSurroundingCells(extraCell)
                surroundingCells = surroundingCells.concat(extraCellSurroundingCells)  // Combining all surrounding cells to set them as mineless
                break
            }
            
            surroundingCells.forEach((cell) => {
                cell.ready = true
                cell.isMine = false
                surroundingCellsCoords.push(cell.x + '-' + cell.y)
            })

            // Then, let's generate the mines ignoring the surrounding cells setted
            const minesGenerated = GenerateMines(surroundingCellsCoords)
            DiscoverCell(logicCell)
        }
        else{
            const result = GetProximity(logicCell)    
            RevealCell(logicCell)
            
            if(revealedCells >= (cellsQuantity - minesQuantity)){
                WinGame()
            }    
            
            if(result.proximity === 0){ // If it have no mines near, Discover the surrounding cells
                result.nearCells.forEach((c) => {
                    if(c.revealed === false)
                        DiscoverCell(c, true)
                })
            }else{
                logicCell.htmlCell.innerHTML = result.proximity
            }
        }
    }
}


// Return the 8 surrounding cells (4 if it's a corner, 5 if t's a border)
function GetSurroundingCells(logicCell){
    const xLimitLeft = logicCell.x - 1
    const xLimitRight = logicCell.x + 1
    const yLimitUp = logicCell.y - 1
    const yLimitDown = logicCell.y + 1
    const surroundingCells = []

    for(let x = xLimitLeft; x <= xLimitRight; x++){
        if(cellsGrid[x] === undefined)
            continue;
        for(let y = yLimitUp; y <= yLimitDown; y++){
            
            if(cellsGrid[x][y] === undefined)
                continue;

            if(x === logicCell.x && y === logicCell.y)
                continue;

            const foundedCell = cellsGrid[x][y]
            surroundingCells.push(foundedCell)
        }   
    }

    return surroundingCells
}


// Return the number of mines nearby of a cell
function GetProximity(logicCell){
    let prox = 0
    const xLimitLeft = logicCell.x - 1
    const xLimitRight = logicCell.x + 1
    const yLimitUp = logicCell.y - 1
    const yLimitDown = logicCell.y + 1

    const nearCells = []

    for(let x = xLimitLeft; x <= xLimitRight; x++){
        if(cellsGrid[x] === undefined)
            continue;
        for(let y = yLimitUp; y <= yLimitDown; y++){

            if(cellsGrid[x][y] === undefined)
                continue;

            const foundedCell = cellsGrid[x][y]

            if(foundedCell.id === logicCell.id)
                continue;

            nearCells.push(foundedCell)
            
            if(foundedCell.isMine)
                prox++
        }   
    }

    return {
        nearCells: nearCells,
        proximity: prox
    };
}


// Shows a cell, change the background color and +1 to revealed cells number
function RevealCell(logicCell){
    logicCell.htmlCell.classList.remove('hidden')
    if(logicCell.isMine)
        logicCell.htmlCell.classList.add('red')
    else{
        logicCell.htmlCell.classList.add('discovered')
        if(logicCell.revealed === false){
            logicCell.revealed = true
            revealedCells++
        }
    }
}


// Blocks a cell as a tentative mine
function BlockCell(logicCell){
    htmlCell = logicCell.htmlCell
    if(logicCell.revealed || gameFinished)
        return

    if(logicCell.blocked){
        if(!gameMuted){
            const blockSound = new Audio(blockSoundName)
            blockSound.play()
        }

        logicCell.blocked = false
        htmlCell.classList.remove('blocked')
        htmlCell.classList.add('hidden')
        minesLeft++
    }
    else{
        if(!gameMuted){
            const unblockSound = new Audio(unblockSoundName)
            unblockSound.play()
        }

        logicCell.blocked = true    
        htmlCell.classList.add('blocked')
        htmlCell.classList.remove('hidden')
        minesLeft--
    }
    UpdateMinesLeft()
}


// The mine generation will prevent 6 or more mines in the subcorners
// Recieve an array of ignored cell coords
function GenerateMines(coordsException){
    let minesGenerated = 0
    while(minesGenerated < minesQuantity){
        const randomX = Math.floor(Math.random() * width)
        const randomY = Math.floor(Math.random() * height)

        const randomCell = cellsGrid[randomX][randomY]
        if(randomCell.ready)
            continue

        randomCell.isMine = true
        randomCell.ready = true
        //randomCell.htmlCell.innerHTML = 'M'  // Mark mines
        minesGenerated++
    } 

    // Once generated, we have to check if a subcorner has 6 or more mines
    const subcorners = [
        {x: 1, y: 1},  // Up-Left subcorner
        {x: 1, y: height - 2},  // Down-Left subcorner
        {x: width - 2, y: 1},  // Up-Right subcorner
        {x: width - 2, y: height - 2},  // Down-Right subcorner
    ]

    let generationOK = true
    for(let i = 0; i < subcorners.length; i++){
        const sc = subcorners[i]
        if(GetProximity(cellsGrid[sc.x][sc.y]).proximity >= 6){ // A subcorner has 6 or more mines nearby, then generate the mines again
            generationOK = false
            break
        }
    }

    let result = undefined
    if(generationOK){
        result = true
    }
    else{
        // We have to revert all mines and generate them again
        for(let x = 0; x < width; x ++){
            for(let y = 0; y < height; y++){
                if(coordsException.includes(x + '-' + y))
                    continue

                cellsGrid[x][y].isMine = false
                cellsGrid[x][y].ready = false
                //cellsGrid[x][y].htmlCell.innerHTML = ''  // Unmark mines
            }
        }
        result = GenerateMines()
    }
    return result
}


function GameOver(){
    backgroundMusic.pause()
    backgroundMusic.currentTime = 0
    if(!gameMuted)
        loseSound.play()

    gameFinished = true
    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            const currentCell = cellsGrid[x][y]
            if(currentCell.blocked){
                if(currentCell.isMine){
                    currentCell.htmlCell.innerHTML = 'O';
                    currentCell.htmlCell.classList.add('red')
                    currentCell.htmlCell.classList.remove('blocked')
                }
                else{
                    currentCell.htmlCell.innerHTML = 'X';
                }
            }
            else{
                if(cellsGrid[x][y].isMine){
                    RevealCell(cellsGrid[x][y])
                }
            }

        }
    }
    boardResult.innerHTML = "PERDISTE"
    boardResult.classList.add('lose')
}

function WinGame(){
    backgroundMusic.pause()
    backgroundMusic.currentTime = 0
    if(!gameMuted)
        winSound.play()

    gameFinished = true
    revealedCells = 0
    boardResult.innerHTML = "GANASTE"
    boardResult.classList.add('win')
}


function UpdateMinesLeft(){
    document.getElementById('minesLeft').innerHTML = minesLeft
}


function UpdateMinesQuantity(){
    const mineInput = document.getElementById('mines')
    mineInput.value = minesQuantity
}


function StyleBoard(){
    const widthStyle = 'width:' + (cellSize * width) + 'px;'
    const heightStyle = 'height:' + (cellSize * height) + 'px;'
    board.setAttribute('style', widthStyle + heightStyle )
}


function ToggleMute(){
    const muteIcon = document.getElementById('mute')
    if(gameMuted){
        muteIcon.src = 'icons/volumen.png'
        backgroundMusic.volume = 1;
        winSound.volume = 1;
        loseSound.volume = 1;
        backgroundMusic.play()
    }
    else{
        muteIcon.src = 'icons/silencio.png'
        backgroundMusic.volume = 0;
        winSound.volume = 0;
        loseSound.volume = 0;
    }
    gameMuted = !gameMuted
}