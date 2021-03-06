import { isProxy, isReactive, reactive } from '../reactive'

describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)

        expect(isReactive(original)).toBe(false)
        expect(isReactive(observed)).toBe(true)
        expect(isProxy(observed)).toBe(true)
    })

    it('deep proxy', () => {
        const original = { foo: { bar: [{ biz: 1 }] } }
        const observed = reactive(original)

        expect(isReactive(observed.foo)).toBe(true)
        expect(isReactive(observed.foo.bar[0])).toBe(true)
    })
})
