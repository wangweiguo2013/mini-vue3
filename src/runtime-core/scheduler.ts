const queue: any[] = []

const p = Promise.resolve()
let isFlushPending = false

export const nextTick = (fn) => {
    return fn ? p.then(fn) : p
}

export const queueJobs = (job) => {
    isFlushPending = true
    if (!queue.includes(job)) {
        queue.push(job)
    }
    isFlushPending = false
    queueFlush()
}

function queueFlush() {
    // 第一次开始时，关闭开关
    if (isFlushPending) return
    isFlushPending = true

    nextTick(flushJobs)
}
function flushJobs() {
    isFlushPending = false
    let job
    while ((job = queue.shift())) {
        job && job()
    }
}
