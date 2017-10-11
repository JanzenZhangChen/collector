import React from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import ReducerOperatorFactory from '../ReducerOperatorFactory'

const CheckboxReact = ({assist, data = [], onChange = () => {}, error, label}) => {
    return (
        <div>
            {assist.loading ? <div>loading...</div> : 
                assist.list.map((item) => {
                    return (
                        <span key={item.value}>
                            {item.label}
                            <input onChange={(e) => {onChange(item)}} type="checkbox" checked={data.includes(item.value)}/>
                        </span>
                    )
                })
            }
        </div>
    )
}

const assistReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setAssist, {
        [collector.actionTypes.setList]: 'list',
        [collector.actionTypes.setLoading]: 'loading'
    }, {
        list: [],
        loading: true
    })
}

const dataReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setValue, {}, [])
}

const errorReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setErrorMsg, {}, '')
}

const rootReducer = (collector) => {
    return combineReducers({
        assist: assistReducer(collector),
        data: dataReducer(collector),
        error: errorReducer(collector)
    })   
}

const AsyncCheckCollectorModel = {
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
        error: errorReducer,
        assist: assistReducer
    },
    _actionTypes: [
        'setList',
        'setLoading',
        'setValue',
        'setAssist',
        'setErrorMsg'
    ],
    _actions: {
        setAssist: (value) => (collector) => {
            return {
                type: collector.actionTypes.setAssist,
                value: value
            }
        },
        setList: (value) => (collector) => {
            return {
                type: collector.actionTypes.setList,
                value: value
            }
        },
        setLoading: (value) => (collector) => {
            return {
                type: collector.actionTypes.setLoading,
                value: value
            }
        },
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
        init: () => (dispatch$, getState$, collector) => {
            dispatch$(collector, 'getAsyncData')
        },
        getAsyncData: () => (dispatch$, getState$, collector) => {
            // 获取异步数据
            dispatch$(collector.actions.setLoading(true))
            setTimeout(() => {
                dispatch$(collector.actions.setList([
                    {label: '左边',value: 1},
                    {label: '右边',value: 2},
                    {label: '中间', value: 3}
                ]))
                dispatch$(collector.actions.setLoading(false))
            }, 2000)
        },
        setValue: (value) => (dispatch$, getState$, collector) => {
            dispatch$(collector.actions.setValue(value))
        },
        getValue: () => (dispatch$, getState$, collector) => {
            return getState$().data
        },
        getState: () => (dispatch$, getState$, collector) => {
            const state = getState$()
            if (state.assist.loading) {
                return null
            } else {
                return state
            }
        },
        setState: (state) => (dispatch$, getState$, collector) => {
            dispatch$(collector.actions.setAssist(state.assist))
            dispatch$(collector.actions.setValue(state.data))
            dispatch$(collector.actions.setErrorMsg(state.error))
        },
        setAssistState: (state) => (dispatch$, getState$, collector) => {
            dispatch$(collector.actions.setAssist(state.assist))
        },
        onChange: (item) => (dispatch$, getState$, collector) => {
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

            if (collector.options.onChange) {
                collector.options.onChange(newDatas, collector)
            }

            dispatch$(collector.actions.setValue(newDatas))
        },
        validate: (value) => (dispatch$, getState$, collector) => {
            if (!value) {
                value = dispatch$(collector, 'getValue')
            }
            const MAX_LENGTH = collector.options.max
            const MIN_LENGTH = collector.options.min

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
                dispatch$(collector.actions.setErrorMsg(msg))
                ret ? resolve(value) : reject(msg)
            })
        }
    }
}

export default AsyncCheckCollectorModel