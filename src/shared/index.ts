export const extend = Object.assign

export const isObject = (raw) => {
    return raw !== undefined && raw !== null && typeof raw === 'object'
}