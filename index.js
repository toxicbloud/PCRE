class Operator {
    static INTEGER = 'INTEGER'
    static PLUS = 'PLUS'
    static MINUS = 'MINUS'
    static EOF = 'EOF'
    static MUL = 'MUL'
    static DIV = 'DIV'
    static LPAREN = 'LPAREN'
    static RPAREN = 'RPAREN'
}
class AST {
    constructor() {}
}
class BinOp extends AST {
    constructor(left, op, right) {
        super()
        this.left = left
        this.token = this.op = op
        this.right = right
    }
}
class Num extends AST {
    constructor(token) {
        super()
        this.token = token
        this.value = token.value
    }
}
class UnaryOp extends AST {
    constructor(op, expr) {
        super()
        this.token = this.op = op
        this.expr = expr
    }
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
class Lexer {
    constructor(text) {
        this.text = text
        this.pos = 0
        this.current_char = this.text[this.pos]
    }
    error() {
        throw new Error('Invalid character')
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
            if (this.current_char === '*') {
                this.advance()
                return new Token(Operator.MUL, '*')
            }
            if (this.current_char === '/') {
                this.advance()
                return new Token(Operator.DIV, '/')
            }
            if (this.current_char === '(') {
                this.advance()
                return new Token(Operator.LPAREN, '(')
            }
            if (this.current_char === ')') {
                this.advance()
                return new Token(Operator.RPAREN, ')')
            }
            this.error()
        }
        return new Token(Operator.EOF, null)
    }
}
class Parser {
    constructor(lexer) {
        this.lexer = lexer
        this.current_token = this.lexer.get_next_token()
    }
    error() {
        throw new Error('Invalid syntax')
    }

    eat(token_type) {
        if (this.current_token.type === token_type) {
            this.current_token = this.lexer.get_next_token()
        } else {
            this.error()
        }
    }
    factor() {
        const token = this.current_token
        if (token.type === Operator.INTEGER) {
            this.eat(Operator.INTEGER)
            return new Num(token)
        }
        if (token.type === Operator.LPAREN) {
            this.eat(Operator.LPAREN)
            const node = this.expr()
            this.eat(Operator.RPAREN)
            return node
        }
    }
    term() {
        let result = this.factor()
        while (
            this.current_token.type === Operator.MUL ||
            this.current_token.type === Operator.DIV
        ) {
            let token = this.current_token
            if (token.type === Operator.MUL) {
                this.eat(Operator.MUL)
            } else if (token.type === Operator.DIV) {
                this.eat(Operator.DIV)
            }
            result = new BinOp(result, token, this.factor())
        }
        return result
    }
    expr() {
        let node = this.term()
        while (
            this.current_token.type === Operator.PLUS ||
            this.current_token.type === Operator.MINUS
        ) {
            let token = this.current_token
            if (token.type === Operator.PLUS) {
                this.eat(Operator.PLUS)
            } else if (token.type === Operator.MINUS) {
                this.eat(Operator.MINUS)
            }
            node = new BinOp(node, token, this.term())
        }
        return node
    }
    parse() {
        return this.expr()
    }
}
class NodeVisitor {
    constructor() {}
    visit(node) {
        const method_name = `visit_${node.constructor.name}`
        const visitor = this[method_name]
        if (visitor) {
            return visitor(node)
        } else {
            return this.generic_visit(node)
        }
    }
    generic_visit(node) {
        throw new Error(`No visit_${node.constructor.name} method`)
    }
}

class Interpreter extends NodeVisitor {
    constructor(parser) {
        super()
        this.parser = parser
    }
    visit_BinOp(node) {
        if (node.op.type === Operator.PLUS) {
            return this.visit(node.left) + this.visit(node.right)
        } else if (node.op.type === Operator.MINUS) {
            return this.visit(node.left) - this.visit(node.right)
        } else if (node.op.type === Operator.MUL) {
            return this.visit(node.left) * this.visit(node.right)
        } else if (node.op.type === Operator.DIV) {
            return this.visit(node.left) / this.visit(node.right)
        }
    }
    visit_Num(node) {
        return node.value
    }
    visit(node) {
        // refaire ça proprement le mec connait rien aux patterns
        if (node instanceof BinOp) return this.visit_BinOp(node)
        if (node instanceof Num) return this.visit_Num(node)
    }
    interpret() {
        const tree = this.parser.parse()
        return this.visit(tree)
    }
}

// export lexer, parser, interpreter
export { Lexer, Parser, Interpreter }
