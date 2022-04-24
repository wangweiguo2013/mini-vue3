import { camelize, capitalize } from '../shared/index'

export const emit = (instance, eventName, ...args) => {
    const { props } = instance

    const eventKey = 'on' + capitalize(eventName)

    const handler = props[camelize(eventKey)]

    handler && handler(...args)
}
