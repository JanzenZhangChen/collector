import React from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import ReducerOperatorFactory from '../ReducerOperatorFactory'
import CollectorFactory from '../CollectorFactory'
import TargetItemModel from './TargetItem'
import _ from 'lodash'

const Adtargets = ({childs, status}) => {
    return (
        <div>
            {Object.keys(childs).map((key) => {
                let child = childs[key]
                if (status.displayFields.includes(key)) {
                    return <child.view key={child.key}/>
                } else {
                    return null
                }
            })}
        </div>
    )
}

const childsReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setChilds, {}, {})
}

const dataReducer = (collector) => (state = {}, action) => {
    return collector.dataReducer(state, action)
}

const statusReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setStatus, {
        [collector.actionTypes.setLastTarget]: 'lastTarget',
        [collector.actionTypes.setDisplayFields]: 'displayFields',
    }, {
        lastTarget: false,
        displayFields: []
    })
}

const rootReducer = (collector) => {
    return combineReducers({
        childs: childsReducer(collector),
        data: dataReducer(collector),
        status: statusReducer(collector)
    })
}

const AdtargetsModel = {
    _view: Adtargets,
    mapStateToProps: undefined,
    _mapDispatchToProps: (dispatch, collector) => {
        return {

        }
    },
    mergeProps: undefined,
    connectOptions: undefined,
    _options: {
        label: '定向'
    },
    _reducers: {
        root: rootReducer,
        data: dataReducer,
        status: statusReducer,
        childs: childsReducer
    },
    _actionTypes: [
        'setChilds',
        'emptyAction',
        'setLastTarget',
        'setDisplayFields'
    ],
    _actions: {
        setChilds: (value) => (collector) => {
            return {
                type: collector.actionTypes.setChilds,
                value: value
            }
        },
        setDisplayFields: (value) => (collector) => {
            return {
                type: collector.actionTypes.setDisplayFields,
                value: value
            }
        },
        setLastTarget: (value) => (collector) => {
            return {
                type: collector.actionTypes.setLastTarget,
                value: value
            }
        }
    },
    dataReducer: (state = {}) => state,
    _services: {
        updateRedcuer: () => (dispatch$, getState$, collector) => {
            const { childs } = getState$()

            if (Object.keys(childs).length > 0) {
                const reducerObj = {}
                // 设置获取value的Reducer，由子reducer组成 这个函数会成为reducer，每一次action都会调用一次噢
                Object.keys(childs).map((key) => {
                    const child = childs[key]
                    reducerObj[child.key] = child.reducers.root
                })
                collector.dataReducer = combineReducers(reducerObj)
            } else {
                collector.dataReducer = (state = {}) => state
            }
            // 为了让reducer生成默认值
            dispatch$({
                type: collector.actionTypes.emptyAction
            })
        },
        init: (config, displayFields) => (dispatch$, getState$, collector) => {
            collector.config = config

            dispatch$(collector.actions.setDisplayFields(displayFields))

            dispatch$(collector, 'generateChilds', config, displayFields)
        },
        generateChilds: (config, displayFields) => (dispatch$, getState$, collector) => {
            const collectorObj = getState$().childs

            displayFields.map((key) => {
                if (config[key] && !collectorObj[key]) {
                    collectorObj[key] = CollectorFactory(TargetItemModel, {
                        options: {
                            label: config[key].title,
                            config: config[key],
                            onChange: () => {
                                const { status } = getState$()
                                if (status.lastTarget != key) {
                                    dispatch$(collector.actions.setLastTarget(key))
                                    if (status.lastTarget) {
                                        dispatch$(collector, 'validateSingle', status.lastTarget).then(() => {}, () => {})
                                    } else {
                                        dispatch$(collector, 'validateAll', [key]).then(() => {}, () => {})
                                    }
                                }
                            },
                            onSwitch: () => {
                                const { status } = getState$()
                                if (status.lastTarget != key) {
                                    dispatch$(collector.actions.setLastTarget(key))
                                    if (status.lastTarget) {
                                        dispatch$(collector, 'validateSingle', status.lastTarget).then(() => {}, () => {})
                                    } else {
                                        dispatch$(collector, 'validateAll', [key]).then(() => {}, () => {})
                                    }
                                }
                            }
                        },
                        key: key,
                        mapStateToProps: (state) => {
                            const { data } = getState$()
                            return data[key] || {}
                        }
                    })
                }
            })
            // 设置childs
            dispatch$(collector.actions.setChilds(collectorObj))
            // 更新
            dispatch$(collector, 'updateRedcuer')
        },
        setValue: (initValue = {}) => (dispatch$, getState$, collector) => {
            let {status, childs} = getState$()
            const newDisplayFields = status.displayFields.concat([])
            const config = collector.config

            Object.keys(initValue).forEach((key) => {
                if (!childs[key] && config[key]) {
                    newDisplayFields.push(key)
                }
            })

            dispatch$(collector.actions.setDisplayFields(newDisplayFields))
            dispatch$(collector, 'generateChilds', config, newDisplayFields)
            // 更新childs之后再获取
            childs = getState$().childs

            Object.keys(childs).forEach((key) => {
                dispatch$(childs[key], 'setValue', initValue[key])
            })

            dispatch$(collector, 'validateAll', []).then(() => {}, () => {})
        },
        getAllState: () => (dispatch$, getState$, collector) => {
            const state = {}
            const {childs} = getState$()

            Object.keys(childs).forEach((key) => {
                let childState = dispatch$(childs[key], 'getState')
                if (childState) {
                    state[key] = childState
                }
            })
            return state
        },
        setAllState: (allState) => (dispatch$, getState$, collector) => {
            const { childs } = getState$()
            Object.keys(childs).forEach((key) => {
                dispatch$(childs[key], 'setState', allState[key])
            })
        },
        validateAll: (except = []) => (dispatch$, getState$, collector) => {
            const { childs, data } = getState$()
            return Promise.all(Object.keys(childs).map((key) => {
                let child = childs[key]
                let subData = data[key]
                if (!except.includes(child.key) && subData.status.checked) {
                    return dispatch$(child, 'validate')
                }
            }).filter((promise) => {
                return !!promise
            }))
        },
        validateSingle: (target = '') => (dispatch$, getState$, collector) => {
            const { childs, data } = getState$()
            let ret = new Promise((resolve) => {resolve()})
            for (let i in childs) {
                if (childs[i].key == target && data[i].status.checked) {
                    ret = dispatch$(childs[i], 'validate')
                }
            }
            return ret
        }
    }
}

export default AdtargetsModel