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
    //GenerateMines(minesQuantity)

    const beginButton = document.getElementById('btn');
    beginButton.innerHTML = 'Reiniciar'    
}

// Create the empty cells without mines
function DisplayBoard(){
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
            console.log('Detectado primer click')
            gameBeginning = false
            // The first move will be always mineless, generating a number of mines depending of the cell location
            // To see the probabilities watch the first_move_mines_generation.txt.txt file      

            //const cellMinesCoords = GenerateFirstsMines(logicCell) // Generate the firsts mines and return an array with the coords
            //console.log('Primeras minas creadas')
            //console.log(cellMinesCoords)
            // Then, let's generate the rest of the mines
            // The procedural logic is: A sub cornar can't be have 6 or more mines nearby
            logicCell.ready = true
            logicCell.isMine = false
            const surroundingCells = GetSurroundingCells(logicCell)            
            surroundingCells.forEach((cell) => {
                cell.ready = true
                cell.isMine = false
            })
            const minesGenerated = GenerateMines()
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


function GenerateFirstsMines(logicCell){
    const nearMines = logicCell.GetNearMinesFirstClick()
    const surroundingCells = GetSurroundingCells(logicCell)
    const cellMines = []
    
    // Generating the near mines
    let generatedMines = 0
    while(generatedMines <= nearMines){
        const randomCell = surroundingCells[Math.floor(Math.random() * surroundingCells.length)]
        const stringCoords = randomCell.x + '-' + randomCell.y

        if(cellMines.includes(stringCoords))
            continue;
        
        cellMines.push(stringCoords)
        generatedMines++
    }

    for(let i = 0; i < surroundingCells.length; i++){
        const currentCell = surroundingCells[i]
        const stringCoords = currentCell.x + '-' + currentCell.y
        if(cellMines.includes(stringCoords))
            currentCell.isMine = true

        currentCell.ready = true
    }

    return cellMines
}


function GetSurroundingCells(logicCell){
    const xLimitLeft = logicCell.x - 1
    const xLimitRight = logicCell.x + 1
    const yLimitUp = logicCell.y - 1
    const yLimitDown = logicCell.y + 1
    const surroundingCells = []

    for(let x = xLimitLeft; x <= xLimitRight; x++){
        for(let y = yLimitUp; y <= yLimitDown; y++){
            if(cellsGrid[x] === undefined)
                continue;

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
// Recieve an array of cells that are already mines
function GenerateMines(){
    let minesGenerated = 0
    while(minesGenerated <= minesQuantity){
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
                if(cellCoordsExceptions.includes(x + '-' + y))
                    continue

                cellsGrid[x][y].isMine = false
                cellsGrid[x][y].ready = false
            }
        }
        result = GenerateMines(cellCoordsExceptions)
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