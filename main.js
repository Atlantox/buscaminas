const body = document.getElementById('body');
body.addEventListener('keypress', (e) => {
    if(e.key === 'Enter')
        InitGame();
})

const board = document.getElementsByClassName('board')[0]
const boardResult = document.getElementById('result')

const audio = new Audio('desert.wav');
audio.loop = true

const cellSize = 27; // 20px height and weight and 2px border in all sides
let gameBeginning = true
let gameFinished = false
let revealedCells = 0
let cellsQuantity = 0
let minesQuantity = 0
let width = 0
let height = 0
let minesLeft = 0
const minePercent = 25; // X% of all cells will be mines
let cellsGrid = []

function ResetVars(){
    boardResult.innerHTML = ''
    boardResult.classList = []
    gameFinished = false
    board.innerHTML = ''
    revealedCells = 0
    minesQuantity = 0
    audio.play()
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
    GenerateBoard()
    //GenerateMines(minesQuantity)

    const beginButton = document.getElementById('btn');
    beginButton.innerHTML = 'Reiniciar'    
}

// Create the empty cells without mines
function GenerateBoard(){
    let counter = 0;

    for(let x = 0; x < width; x++){
        cellsGrid[x] = []
        for(let y = 0; y < height; y++){
            counter ++;
            const htmlCell = document.createElement('span')
            htmlCell.classList.add('cell')
            htmlCell.id = counter
            htmlCell.setAttribute('x', x)
            htmlCell.setAttribute('y', y)
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
            // The first move will be always mineless, generating a number of mines depending of the cell location
            // To see the probabilities watch the first_move_mines_generation.txt.txt file            
            const nearMines = logicCell.GetNearMinesFirstClick()

            for(let i = 0; i < nearMines; i ++){
                // Creating the near mines
                // TODO: choose the places randomly and mark the cell.ready = true, then at the moment of generation of the other mines, ignore the cell.ready cells
            }
            

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
                result.nearCells.forEach((c) => {
                    const cProximity = GetProximity(c)
    
                    if(c.revealed === false && cProximity.proximity === 0)
                        DiscoverCell(c, true)
                })
                logicCell.htmlCell.innerHTML = result.proximity
            }
        }
    }
}


function GetProximity(logicCell){
    let prox = 0
    let xLimitLeft = logicCell.x - 1
    let xLimitRight = logicCell.x + 1
    let yLimitUp = logicCell.y - 1
    let yLimitDown = logicCell.y + 1
    const nearCells = []

    for(let x = xLimitLeft; x <= xLimitRight; x++){
        for(let y = yLimitUp; y <= yLimitDown; y++){
            if(cellsGrid[x] === undefined)
                continue;

            if(cellsGrid[x][y] === undefined)
                continue;

            if(x === logicCell.x && y === logicCell.y)
                continue;

            const foundedCell = cellsGrid[x][y]
            nearCells.push(foundedCell)
            
            if(foundedCell.isMine)
                prox++
            else{
                /*
                const proximity = GetProximity(foundedCell)
                if(proximity === 0)
                    DiscoverCell(document.getElementById(foundedCell))
                */
            }
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
    if(htmlCell.classList.contains('revealed'))
        return

    if(htmlCell.classList.contains('blocked')){
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
function GenerateMines(mineQuantity){
    for(let i = 0; i < minesQuantity; i++){
        const randomX = Math.floor(Math.random() * width)
        const randomY = Math.floor(Math.random() * height)
        cellsGrid[randomX][randomY].isMine = true        
    } 
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