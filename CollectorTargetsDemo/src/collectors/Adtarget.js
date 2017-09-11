import React from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import ReducerOperatorFactory from '../ReducerOperatorFactory'
import CollectorFactory from '../CollectorFactory'
import TargetItemModel from './TargetItem'


const Adtargets = ({childs}) => {
    return (
        <div>
            {Object.keys(childs).map((key) => {
                let child = childs[key]
                return <child.view key={child.key}/>
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

const rootReducer = (collector) => {
    return combineReducers({
        childs: childsReducer(collector),
        data: dataReducer(collector)
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
        childs: childsReducer
    },
    _actionTypes: [
        'setChilds',
        'emptyAction'
    ],
    _actions: {
        setChilds: (value) => (collector) => {
            return {
                type: collector.actionTypes.setChilds,
                value: value
            }
        }
    },
    dataReducer: (state = {}) => state,
    _services: {
        updateRedcuer: () => (dispatch, getState$, collector) => {
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
            dispatch({
                type: collector.actionTypes.emptyAction
            })
        },
        init: (config) => (dispatch, getState$, collector) => {
            const collectorObj = {}
            Object.keys(config).map((key) => {
                collectorObj[key] = CollectorFactory(TargetItemModel, {
                    options: {
                        label: config[key].title,
                        config: config[key],
                        onChange: () => {
                            collector._services.validate([key])(dispatch, getState$, collector).then(() => {}, () => {})
                        },
                        onSwitch: () => {
                            collector._services.validate([key])(dispatch, getState$, collector).then(() => {}, () => {})
                        }
                    },
                    key: key,
                    mapStateToProps: (state) => {
                        const { data } = getState$()
                        return data[key] || {}
                    }
                })
            })
            // 设置childs
            dispatch(collector.actions.setChilds(collectorObj))
            // 更新
            dispatch(collector.services.updateRedcuer())
        },
        validate: (except = []) => (dispatch, getState$, collector) => {
            const { childs, data } = getState$()
            return Promise.all(Object.keys(childs).map((key) => {
                let child = childs[key]
                let subData = data[key]
                if (!except.includes(child.key) && subData.status.checked) {
                    return child._services.validate()(dispatch, () => {
                        return child.mapStateToProps(getState$())
                    }, child)
                }
            }))
        }
    }
}

export default AdtargetsModel