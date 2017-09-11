import React from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import ReducerOperatorFactory from '../ReducerOperatorFactory'

const CheckboxReact = ({ targets }) => {
    return (
        <div>
            {targets.map((target) => {
                return (
                    <span key={target}>
                        {item.label}
                        <item.child.view />
                    </span>
                )
            })}
        </div>
    )
}

const dataReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setValue, {}, [])
}

const errorReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setErrorMsg, {}, '')
}

const rootReducer = (collector) => {
    return combineReducers({
        data: dataReducer(collector),
        error: errorReducer(collector)
    })   
}

const CheckCollectorModel = {
    _view: CheckboxReact,
    mapStateToProps: undefined,
    _mapDispatchToProps: (dispatch, collector) => {
        return {
            onChange: (item) => {
                dispatch(collector.services.onChange(item))
            },
            label: collector.options.label
        }
    },
    mergeProps: undefined,
    connectOptions: undefined,
    _options: {
        max: 3,
        min: 1,
        label: '输入框'
    },
    _reducers: {
        root: rootReducer,
        data: dataReducer,
        error: errorReducer
    },
    _actionTypes: [
        'setValue',
        'setErrorMsg'
    ],
    _actions: {
        setValue: (value) => (collector) => {
            return {
                type: collector.actionTypes.setValue,
                value: value
            }
        },
        setErrorMsg: (errorMsg) => (collector) => {
            return {
                type: collector.actionTypes.setErrorMsg,
                value: errorMsg
            }
        }
    },
    _services: {
        onChange: (item) => (dispatch, getState$, collector) => {
            let { data } = getState$()
            let newDatas

            // 设置数据 (immutable 不改变原来的数据)
            if (data.includes(item.value)) {
                newDatas = data.filter((data) => {
                    return data != item.value
                })
            } else {
                newDatas = data.concat([item.value])
            }
            dispatch(collector.actions.setValue(newDatas))
            // 检验数据是否正确
            collector._services.validate(newDatas)(dispatch, getState$, collector).then(() => {}, () => {})
        },
        validate: (value) => (dispatch, getState$, collector) => {
            if (!value) {
                let { data } = getState$()
                value = data
            }
            const MAX_LENGTH = collector.options.max_length
            const MIN_LENGTH = collector.options.min_length

            return new Promise((resolve, reject) => {
                let ret = true
                let msg = ''
                if (value.length == 0) {
                    msg = '请选择数据'
                    ret = false
                } else if (value.length > MAX_LENGTH) {
                    msg = '选择过多'
                    ret = false
                } else if (value.length < MIN_LENGTH) {
                    msg = '选择过少'
                    ret = false
                } else {
                    msg = false
                }
                dispatch(collector.actions.setErrorMsg(msg))
                ret ? resolve(value) : reject(msg)
            })
        }
    }
}

export default CheckCollectorModel