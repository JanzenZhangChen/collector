import React,{ PureComponent } from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import ReducerOperatorFactory from '../ReducerOperatorFactory'

class CheckboxReact extends PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        const {list = [], data = [], onChange = () => {}, error, label} = this.props
        return (
            <div>
                <div>{label}</div>
                {list.map((item) => {
                    return (
                        <span key={item.value}>
                            {item.label}
                            <input onChange={(e) => {onChange(item)}} type="checkbox" checked={data.includes(item.value)}/>
                        </span>
                    )
                })}
                {error ? <div style={{ color: 'red' }}>{error}</div> : null}
            </div>
        )
    }
}

const dataReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setValue, {}, [])
}

const errorReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setErrorMsg, {}, false)
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
            label: collector.options.label,
            list: collector.options.list
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
            dispatch$(collector.actions.setValue(newDatas))
            // 检验数据是否正确
            dispatch$(collector, 'validate', newDatas).then(() => {}, () => {})
        },
        validate: (value) => (dispatch$, getState$, collector) => {
            if (!value) {
                let { data } = getState$()
                value = data
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

export default CheckCollectorModel