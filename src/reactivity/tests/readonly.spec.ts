import { readonly } from "../reactive"


describe('readonly', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = readonly(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)
    })

    it('warn on readonly is set', () => {
        console.warn = jest.fn()
        const user = readonly({
            age: 11
        })
        user.age = 12
        expect(console.warn).toBeCalled()
    })
})