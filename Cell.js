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
}