class Cell{
    constructor(x, y, isMine, id, htmlCell){
        this.x = x
        this.y = y
        this.isMine = isMine
        this.id = id
        this.revealed = false
        this.isBlocked = false
        this.htmlCell = htmlCell
    }
}