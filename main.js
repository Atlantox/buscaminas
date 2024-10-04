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

const audio = new Audio('desert.wav');
audio.loop = true

const cellSize = 27; // 20px height and weight and 2px border in all sides
let gameBeginning = true
let gameFinished = false
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
    audio.play()

    cellsGrid = []
    board.innerHTML = ''
}


function InitGame(){
    ResetVars()
    width = document.getElementById('width').value;
    height = document.getElementById('height').value;
    cellsQuantity = width * height;    
    minesQuantity = Math.floor(cellsQuantity * (minePercent) / 100)
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

    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){

            if(cellsGrid[x] === undefined)
                cellsGrid[x] = []

            counter ++;
            const htmlCell = document.createElement('span')
            htmlCell.classList.add('cell')
            htmlCell.id = counter
            htmlCell.setAttribute('x', x)
            htmlCell.setAttribute('y', y)
            //htmlCell.innerHTML = counter
            board.appendChild(htmlCell)
            const logicCell = new Cell(x, y, counter, htmlCell)            
            cellsGrid[x][y] = logicCell

            htmlCell.addEventListener('click', (e) => { DiscoverCell(logicCell);})
            htmlCell.addEventListener('contextmenu', function(e) {
                e.preventDefault(); 
                BlockCell(logicCell); 
                return false 
            }, false)            
        } 
    }    
}


function DiscoverCell(logicCell, automatic = false){
    if(gameFinished)
        return

    if(logicCell.isBlocked)
        return

    if(logicCell.isMine){
        if(automatic === false)
            GameOver()
    }
    else{
        if(gameBeginning){
            gameBeginning = false
            // The first move will be always mineless and the 8 circundant cells will be not mines
            // To see the probabilities watch the first_move_mines_generation.txt.txt file      
            logicCell.ready = true
            logicCell.isMine = false
            const surroundingCells = GetSurroundingCells(logicCell)        
            const surroundingCellsCoords = []
            surroundingCells.forEach((cell) => {
                cell.ready = true
                cell.isMine = false
                surroundingCellsCoords.push(cell.x + '-' + cell.y)
            })

            // Then, let's generate the rest of the mines
            const minesGenerated = GenerateMines(surroundingCellsCoords)
            DiscoverCell(logicCell)
        }
        else{
            const result = GetProximity(logicCell)
    
            RevealCell(logicCell)
            
            if(revealedCells >= (cellsQuantity - minesQuantity)){
                WinGame()
            }
    
            
            if(result.proximity === 0){
                result.nearCells.forEach((c) => {
                    if(c.revealed === false)
                        DiscoverCell(c, true)
                })
            }else{
                /*
                result.nearCells.forEach((c) => {
                    const cProximity = GetProximity(c)
    
                    if(c.revealed === false && cProximity.proximity === 0)
                        DiscoverCell(c, true)
                })
                */
                logicCell.htmlCell.innerHTML = result.proximity
            }
        }
    }
}


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


function RevealCell(logicCell){
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

function BlockCell(logicCell){
    htmlCell = logicCell.htmlCell
    if(logicCell.revealed)
        return

    if(logicCell.blocked){
        logicCell.blocked = false
        htmlCell.classList.remove('blocked')
        minesLeft++
    }
    else{
        logicCell.blocked = true    
        htmlCell.classList.add('blocked')
        minesLeft--
    }
    UpdateMinesLeft()
}


// The mine generation will prevent 6 or more mines in the subcorners
// Recieve an array of cell coords that aren't mines
function GenerateMines(coordsException){
    let minesGenerated = 0
    while(minesGenerated < minesQuantity){
        const randomX = Math.floor(Math.random() * width)
        const randomY = Math.floor(Math.random() * height)
        if(cellsGrid[randomX][randomY].ready)
            continue

        cellsGrid[randomX][randomY].isMine = true
        cellsGrid[randomX][randomY].ready = true
        minesGenerated++
    } 

    // Once generated, we have to check is a subcorner has 6 or more mines
    const subcorners = [
        {x: 1, y: 1},
        {x: 1, y: height - 2},
        {x: width - 2, y: 1},
        {x: width - 2, y: height - 2},
    ]

    let generationOK = true
    for(let i = 0; i < subcorners.length; i++){
        const sc = subcorners[i]
        if(GetProximity(cellsGrid[sc.x][sc.y]).proximity >= 6){
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
            }
        }
        result = GenerateMines()
    }

    return result
}


function GameOver(){
    gameFinished = true
    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            if(cellsGrid[x][y].isMine){
                RevealCell(cellsGrid[x][y])
            }
        }
    }
    boardResult.innerHTML = "PERDISTE"
    boardResult.classList.add('lose')
}

function WinGame(){
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