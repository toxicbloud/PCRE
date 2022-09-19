// import lexer interpreter parser
import { Lexer } from '../index.js'
import { Parser } from '../index.js'
import { Interpreter } from '../index.js'
import { assert } from 'chai'
describe('Interpreter', () => {
    it('should interpet 50', () => {
        const text = '(7 + 3) * (10 / (12 / (3 + 1) - 1))'
        const lexer = new Lexer(text)
        const parser = new Parser(lexer)
        const interpreter = new Interpreter(parser)
        const result = interpreter.interpret()
        assert.equal(result, 50)
    })
})
