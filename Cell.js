class Cell{
    constructor(x, y, id, htmlCell){
        this.x = x
        this.y = y
        this.id = id
        this.htmlCell = htmlCell

        this.isMine = false
        this.ready = false
        this.revealed = false
        this.isBlocked = false
    }

    GetNearMinesFirstClick(){
        return 0
        let clickedCellType = 'inside'

        if(
            (this.x === 0 || this.x === width - 1) ||
            (this.y === 0 || this.y === height - 1)
        )
            clickedCellType = 'border'

        if(
            (this.x === 0 && this.y === 0) || // superior left corner
            (this.x === width - 1 && this.y === 0) || // superior right
            (this.x === 0 && this.y === height - 1) ||  // inferior left corner
            (this.x === width - 1 && this.y === height - 1)  // inferior right corner
        )
            clickedCellType = 'corner'


        const randomNumber = Math.floor(Math.random() * 100) + 1 // Between 1 and 100
        let nearMines = undefined
        // Verify first_move_mines_generation.txt.txt to understand this module
        if(clickedCellType === 'inside'){
            if(randomNumber <= 10)
                nearMines = 0
            else if(randomNumber <= 20)
                nearMines = 1
            else if(randomNumber <= 45)
                nearMines = 2
            else if(randomNumber <= 55)
                nearMines = 3
            else if(randomNumber <= 80)
                nearMines = 4
            else if(randomNumber <= 90)
                nearMines = 5
            else if(randomNumber <= 100)
                nearMines = 6
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