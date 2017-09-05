import { connect } from 'react-redux'
import _ from 'lodash'

const CollectorFactory = (collector, customeCollector) => {
    let newCollector = _.cloneDeep(collector)

    const generateRamdomTypePrefix = () => {
        return new Date().getTime() + parseInt(Math.random() * 100000000, 10)
    }

    // 自定义前缀
    newCollector.actionTypePrefix = generateRamdomTypePrefix()

    // 自定义化
    newCollector = Object.assign({}, newCollector, customeCollector)

    // options
    newCollector.options = Object.assign(newCollector._options, newCollector.options || {})

    // action types
    newCollector.actionTypes = {}
    newCollector._actionTypes.forEach((actionType) => {
        newCollector.actionTypes[actionType] = `${actionType}_${newCollector.actionTypePrefix}`
    })

    // action
    newCollector.actions = {}
    Object.keys(newCollector._actions).forEach((key) => {
        newCollector.actions[key] = (...args) => {
            return newCollector._actions[key](...args)(newCollector)
        }
    })

    // reducers
    newCollector.reducers = {}
    Object.keys(newCollector._reducers).forEach((key) => {
        newCollector.reducers[key] = newCollector._reducers[key](newCollector)
    })

    // service
    newCollector.services = {}
    Object.keys(newCollector._services).forEach((key) => {
        newCollector.services[key] = (...args) => (dispatch, getState) => {
            return newCollector._services[key](...args)(dispatch, () => {
                return newCollector.mapStateToProps(getState())
            }, newCollector)
        }
    })

    // view
    newCollector.view = connect(newCollector.mapStateToProps, (dispatch) => {
        return newCollector._mapDispatchToProps(dispatch, newCollector)
    }, newCollector.mergeProps, newCollector.connectOptions)(newCollector._view)

    return newCollector
}

export default CollectorFactory