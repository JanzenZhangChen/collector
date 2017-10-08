import React, { PureComponent } from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import ReducerOperatorFactory from '../ReducerOperatorFactory'
import CollectorFactory from '../CollectorFactory'
import InputCollectorModel from './InputCollectorModel'
import CheckboxCollectorModel from './CheckboxCollectorModel'
import AsyncCheckboxCollectorModel from './AsyncCheckboxCollectorModel'
import _ from 'lodash'

const TargetItem = ({childData = {}, status = {}, child, label, onSwitch = () => {}}) => {
    return (
        <div style={{marginBottom: '30px'}}>
            <div>
                {label}
                {childData.error && status.checked ? <span style={{ color: 'red' }}>{childData.error}</span> : null}
                <input onChange={onSwitch} type="checkbox" checked={status.checked}/>
            </div>
            <div>
                {status.checked && child ? <child.view /> : null}
            </div>
        </div>
    )
}

const childDataReducer = (collector) => (state = {}, action) => {
    return collector.childDataReducer(state, action)
}

const childReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setChild, {}, false)
}

const statusReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setStatus, {
        [collector.actionTypes.setChecked]: 'checked'
    }, {
        checked: false
    })
}

const rootReducer = (collector) => {
    return combineReducers({
        childData: childDataReducer(collector),
        child: childReducer(collector),
        status: statusReducer(collector)
    })
}

const TargetItemModel = {
    _view: TargetItem,
    mapStateToProps: undefined,
    _mapDispatchToProps: (dispatch, collector) => {
        return {
            onSwitch: () => {
                dispatch(collector.services.onSwitch())
            },
            label: collector.options.label
        }
    },
    mergeProps: undefined,
    connectOptions: undefined,
    _options: {
        label: '单独定向'
    },
    _reducers: {
        root: rootReducer,
        childData: childDataReducer,
        child: childReducer,
        status: statusReducer
    },
    _actionTypes: [
        'setStatus',
        'setChecked',
        'setChild',
        'emptyAction'
    ],
    _actions: {
        setChecked: (value) => (collector) => {
            return {
                type: collector.actionTypes.setChecked,
                value: value
            }
        },
        setChild: (child) => (collector) => {
            return {
                type: collector.actionTypes.setChild,
                value: child
            }
        }
    },
    childDataReducer: (state = {}) => state,
    _services: {
        updateRedcuer: () => (dispatch$, getState$, collector) => {
            const { child } = getState$()
            if (child) {
                // 设置获取value的Reducer，由子reducer组成 这个函数会成为reducer，每一次action都会调用一次噢
                collector.childDataReducer = child.reducers.root
            } else {
                collector.childDataReducer = (state = false) => state
            }
            // 为了让reducer生成默认值
            dispatch$({
                type: collector.actionTypes.emptyAction
            })
        },
        onSwitch: () => (dispatch$, getState$, collector) => {
            let { status, child } = getState$()
            // 第一次打开
            if (!child) {
                dispatch$(collector, 'generateCollector')
            }
            // 设置开关
            if (collector.options.onSwitch) {
                collector.options.onSwitch(collector)
            }
            dispatch$(collector.actions.setChecked(!status.checked))
        },
        generateCollector: () => (dispatch$, getState$, collector) => {
            const generateCollector = (subConfig) => {
                // 映射
                const typeModelMap = {
                    string: InputCollectorModel,
                    checkbox: CheckboxCollectorModel,
                    asyncCheckbox: AsyncCheckboxCollectorModel
                }
                const childModel = {}
                switch(subConfig.type) {
                    case 'string': {
                        childModel.options = {
                            label: subConfig.title,
                            min: subConfig.min,
                            max: subConfig.max
                        }
                        break
                    }
                    case 'checkbox': {
                        childModel.options = {
                            label: subConfig.title,
                            min: subConfig.min,
                            max: subConfig.max,
                            list: subConfig.list
                        }
                        break
                    }
                    case 'asyncCheckbox': {
                        childModel.options = {
                            label: subConfig.title,
                            min: subConfig.min,
                            max: subConfig.max
                        }
                        break
                    }
                }
                childModel.mapStateToProps = (state) => {
                    return getState$().childData || {}
                }
                childModel.options.onChange = (value, child) => {
                    let { childData } = getState$()
                    if (childData.error) {
                        dispatch$(child.actions.setErrorMsg(''))
                    }
                    collector.options.onChange && collector.options.onChange()
                }
                return CollectorFactory(typeModelMap[subConfig.type], childModel)
            }
            
            let child = generateCollector(collector.options.config) 
            dispatch$(collector.actions.setChild(child))
            dispatch$(collector, 'updateRedcuer')
            dispatch$(child, 'init')
        },
        validate: () => (dispatch$, getState$, collector) => {
            let { child} = getState$()
            return dispatch$(child, 'validate')
        },
        setValue: (value) => (dispatch$, getState$, collector) => {
            let { child, status} = getState$()
            if (typeof value != 'undefined') {
                if (!child) {
                    dispatch$(collector, 'generateCollector')
                    child = getState$().child
                }
                if (!status.checked) {
                    dispatch$(collector.actions.setChecked(true))
                }
                dispatch$(child, 'setValue', value)
            } else {
                dispatch$(collector.actions.setChecked(false))
            }
        }
    }
}

export default TargetItemModel