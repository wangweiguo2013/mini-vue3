import { isProxy, isReadOnly, readonly, shallowReadonly } from '../reactive'

describe('readonly', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = readonly(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)

        expect(isReadOnly(observed)).toBe(true)
        expect(isReadOnly(original)).toBe(false)
        expect(isProxy(observed)).toBe(true)
    })

    it('warn on readonly is set', () => {
        console.warn = jest.fn()
        const user = readonly({
            age: 11
        })
        user.age = 12
        expect(console.warn).toBeCalled()
    })
    it('deep proxy', () => {
        const original = { foo: { bar: [{ biz: 1 }] } }
        const observed = readonly(original)

        expect(isReadOnly(observed.foo)).toBe(true)
        expect(isReadOnly(observed.foo.bar[0])).toBe(true)
    })
    it('shallow readonly', () => {
        const original = { foo: { bar: 1 } }
        const observed = shallowReadonly(original)

        expect(isReadOnly(observed)).toBe(true)
        expect(isReadOnly(observed.foo)).toBe(false)
    })
})
