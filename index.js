
class Operator {
    static INTEGER = 'INTEGER';
    static PLUS = 'PLUS';
    static MINUS = 'MINUS';
    static EOF = 'EOF';
    static MUL = 'MUL';
    static DIV = 'DIV';
}

class Token {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
    str() {
        return `Token(${this.type}, ${this.value})`
    }
    repr() {
        return this.str()
    }
}

class Interpreter {
    constructor(text) {
        this.text = text
        this.pos = 0
        this.current_token = null
        this.current_char = this.text[this.pos]
    }
    error() {
        throw new Error('Error parsing input')
    }
    advance() {
        this.pos += 1
        if (this.pos > this.text.length - 1) {
            this.current_char = null
        } else {
            this.current_char = this.text[this.pos]
        }
    }
    skip_whitespace() {
        while (this.current_char !== null && this.current_char === ' ') {
            this.advance()
        }
    }
    integer() {
        let result = ''
        while (this.current_char !== null && !isNaN(this.current_char)) {
            result += this.current_char
            this.advance()
        }
        return parseInt(result)
    }
    get_next_token() {
        while (this.current_char !== null) {
            if (this.current_char === ' ') {
                this.skip_whitespace()
                continue
            }

            if (!isNaN(this.current_char)) {
                return new Token(Operator.INTEGER, this.integer())
            }
            if (this.current_char === '+') {
                this.advance()
                return new Token(Operator.PLUS, '+')
            }
            if (this.current_char === '-') {
                this.advance()
                return new Token(Operator.MINUS, '-')
            }
            this.error()
        }
        return new Token(Operator.EOF, null)
    }
    eat(token_type) {
        if (this.current_token.type === token_type) {
            this.current_token = this.get_next_token()
        } else {
            this.error()
        }
    }
    term() {
        let token = this.current_token
        this.eat(Operator.INTEGER)
        return token.value
    }
    expr() {
        this.current_token = this.get_next_token()
        let result = this.term()
        while (
            this.current_token.type === Operator.PLUS ||
            this.current_token.type === Operator.MINUS
        ) {
            let token = this.current_token
            if (token.type === Operator.PLUS) {
                this.eat(Operator.PLUS)
                result += this.term()
            } else if (token.type === Operator.MINUS) {
                this.eat(Operator.MINUS)
                result -= this.term()
            }
        }
        return result
    }
}

function main() {
    let interpreter = new Interpreter('10 + 5 + 96854654 -5')
    let result = interpreter.expr()
    console.log(result)
}
main()
