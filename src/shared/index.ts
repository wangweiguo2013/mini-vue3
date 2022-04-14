export const extend = Object.assign

export const isObject = (raw) => {
    return raw !== undefined && raw !== null && typeof raw === 'object'
}

export const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue)
}
