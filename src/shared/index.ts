export const extend = Object.assign

export const isObject = (raw) => {
    return raw !== undefined && raw !== null && typeof raw === 'object'
}

export const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue)
}

export const capitalize = (str: string) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

export const camelize = (str: string) => {
    return str.replace(/-\w?/g, (_, c: string) => {
        return _.slice(1).toUpperCase()
    })
}
