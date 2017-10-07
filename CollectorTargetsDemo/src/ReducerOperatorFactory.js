/**
 * 通用reducer处理函数的工厂函数
 * @author janzenzhang
 */

import _ from 'lodash'
import { Map } from 'immutable'

/**
 * config: {
 *     'setDataActionType': 'data',
 * }
 *
 * 1.
 * action.type为setDataActionType的，将会把action.value赋值给state[valueName]
 * 2.
 * 但是action.act == 'modify'的情况下，会把action.value赋值给state[valueName][action.key]
 * 3.
 * 如果是action.act == 'delete'的情况下，会 delete state[valueName][action.key]
 * 4.
 * 如果是action.type == reducerName，且没有action.actions。会把action.value赋值给整个state
 * 5.
 * 如果是action.type == reducerName，且有action.actions。会把action.actions分别递归执行一次然后再merge成一个state输出
 */

const subFactory = (reducerName = '', config, initialState, state, action) => {
    /**
     * 初始状态下的action.type字符串，在页面初始化的时候需要dispatch({type: '@@INITOPERATOR'})
     * 从而reducerOperator才能生效
     */
    let actionValidate = false // action有没有对state进行过修改
    let newState = (typeof state == 'object' && !Array.isArray(state)) ? Map(state) : state

    // 初始值
    if (typeof state == 'undefined') {
        actionValidate = true
        newState = initialState
    } else if (reducerName && action.type == reducerName) {
        actionValidate = true
        newState = action.value
    } else {
        // 将action.value 直接赋值给valueName的值。
        _.forEach(config, function(valueName, actionType) {
            if (action.type == actionType) {
                switch (action.act) {
                    case 'modify': {
                        // 把二级的数据结构也变成immutable类型
                        newState = newState.set(valueName, Map(newState.get(valueName)))
                        newState = newState.setIn([valueName, action.key.toString()], action.value)
                        break
                    }
                    case 'delete': {
                        newState = newState.set(valueName, Map(newState.get(valueName)))
                        newState = newState.deleteIn([valueName, action.key.toString()])
                        break
                    }
                    default: {
                        newState = newState.set(valueName, action.value)
                    }
                }
                actionValidate = true
                return false
            }
        })
    }
    // 如果没有进行过修改 直接返回原始值
    if (!actionValidate) {
        return state
    } else {
        return newState && newState.toJS ? newState.toJS() : newState
    }
}

const ReducerOperatorFactory = (reducerName = '', config, initialState) => (state, action) => {
    let newState
    let filterActions
    if (Array.isArray(action.actions) && action.actions.length > 0) {
        filterActions = action.actions.filter((value) => {
            return !!value
        })
    }

    // 如果数据不存在，也赋值一个初始值
    if (typeof state == 'undefined') {
        state = initialState
    }

    if (action.type == reducerName && filterActions) {
        _.forEach(filterActions, (subAction, idx) => {
            newState = subFactory(reducerName, config, initialState, idx == 0 ? state : newState, subAction)
        })
    } else {
        newState = subFactory(reducerName, config, initialState, state, action)
    }

    return newState
}

export default ReducerOperatorFactory
