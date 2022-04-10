import { reactive } from "../reactive"
import { effect } from "../effect"


describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        })

        let nextAge
        effect(() => {
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11)
        user.age++
        expect(nextAge).toBe(12)
    })

    it('effect should return a runner', () => {
        let foo = 10;
        const runner = effect(() => {
            foo++
            return 'foo'
        })
        expect(foo).toBe(11)
        const res = runner()
        expect(foo).toBe(12)
        expect(res).toBe('foo')
    })

    it('scheduler', () => {
        // effect第一次会执行传入的第一个参数 fn
        // 当响应式对象更新的时候，不会执行fn，而是会执行scheduler
        // 当执行runner的时候，会再次执行fn
        let dummy;
        let run: any;
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler }
        )
        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1)
        // should be called on first trigger
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        // should not run yet
        expect(dummy).toBe(1)
        // manually run
        run()
        // should have run 
        expect(dummy).toBe(2)

    })

})