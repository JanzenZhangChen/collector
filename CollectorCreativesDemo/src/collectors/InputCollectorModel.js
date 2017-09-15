import React,{ PureComponent } from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'

class InputReact extends PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        const { data = '', error, label, onChange, onBlur } = this.props
        return (
            <div>
                <div>{label}</div>
                <input value={data} onChange={onChange} onBlur={onBlur}/>
                {error ? <div style={{ color: 'red' }}>{error}</div> : null}
            </div>
        )
    }
}

const dataReducer = (collector) => (state = '', action) => {
    let newState
    switch (action.type) {
        case collector.actionTypes.setValue:
            newState = action.value
            break
        default:
            newState = state
    }
    return newState
}

const errorReducer = (collector) => (state = false, action) => {
    let newState
    switch (action.type) {
        case collector.actionTypes.setErrorMsg:
            newState = action.value
            break
        default:
            newState = state
    }
    return newState
}

const rootReducer = (collector) => {
    return combineReducers({
        data: dataReducer(collector),
        error: errorReducer(collector)
    })   
}

const InputCollectorModel = {
    _view: InputReact,
    mapStateToProps: undefined,
    _mapDispatchToProps: (dispatch, collector) => {
        return {
            onChange: (e) => {
                const value = e.target.value
                dispatch(collector.services.onChange(value))
            },
            onBlur: (e) => {},
            label: collector.options.label
        }
    },
    mergeProps: undefined,
    connectOptions: undefined,
    _options: {
        max_length: 10,
        min_length: 3,
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
        onChange: (value) => (dispatch$, getState$, collector) => {
            // 设置数据
            dispatch$(collector.actions.setValue(value))
            // 检验数据是否正确
            dispatch$(collector, 'validate', value).then(() => {}, () => {})
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
                if (!value) {
                    msg = '请输入数据'
                    ret = false
                } else if (value.length > MAX_LENGTH) {
                    msg = '字符串过长'
                    ret = false
                } else if (value.length < MIN_LENGTH) {
                    msg = '字符串过短'
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

export default InputCollectorModel