class Cell{
    constructor(x, y, isMine, id, htmlCell){
        this.x = x
        this.y = y
        this.isMine = false
        this.id = id
        this.revealed = false
        this.isBlocked = false
        this.htmlCell = htmlCell
    }

    GetNearMinesFirstClick(){
        let clickedCellType = 'inside'

        if(
            (logicCell.x === 0 || logicCell.x === width - 1) ||
            (logicCell.y === 0 || logicCell.y === height - 1)
        )
            clickedCellType = 'border'

        if(
            (logicCell.x === 0 && logicCell.y === 0) || // superior left corner
            (logicCell.x === width - 1 && logicCell.y === 0) || // superior right
            (logicCell.x === 0 && logicCell.y === height - 1) ||  // inferior left corner
            (logicCell.x === width - 1 && logicCell.y === height - 1)  // inferior right corner
        )
            clickedCellType = 'corner'


        const randomNumber = Math.floor(Math.random() * 100) + 1 // Between 1 and 100
        let nearMines = undefined
        // Verify first_move_mines_generation.txt.txt to understand this module
        if(clickedCellType === 'inside'){
            if(randomNumber <= 10)
                nearMines = 0
            else if(randomNumber <= 20)
                blankSapces = 1
            else if(randomNumber <= 45)
                blankSapces = 2
            else if(randomNumber <= 55)
                blankSapces = 3
            else if(randomNumber <= 80)
                blankSapces = 4
            else if(randomNumber <= 90)
                blankSapces = 5
            else if(randomNumber <= 100)
                blankSapces = 6
        }
        else if(clickedCellType === 'border'){
            if(randomNumber <= 25)
                nearMines = 0
            else if(randomNumber <= 50)
                nearMines = 1
            else if(randomNumber <= 75)
                nearMines = 2
            else if(randomNumber <= 100)
                nearMines = 3
        }
        else if(clickedCellType === 'corner'){
            if(randomNumber <= 33)
                nearMines = 0
            else if(randomNumber <= 66)
                nearMines = 1
            else
                nearMines = 2
        }

        return nearMines
    }
}