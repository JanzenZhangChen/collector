import React from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import ReducerOperatorFactory from '../ReducerOperatorFactory'
import _ from 'lodash'

const TapComponent = ({taps, selectedTapName, onChange}) => {
    return (
        <div>
            {taps.map(tap => {
                return <span 
                    key={tap.name}
                    onClick={() => {onChange(tap)}}
                    style={{'cursor': 'pointer', marginRight: '30px', 'color': tap.name == selectedTapName ? 'blue' : 'gray'}}
                >
                    {tap.label}
                </span>
            })}
            <br/>
            <div style={{'border': '1px blue solid'}}>
                {taps.map(tap => {
                    return tap.name == selectedTapName ? <tap.child.view key={tap.name} /> : null
                })}
            </div>
        </div>
    )
}

const selectedTapNameReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setSelectedTap, {}, collector.options.taps[0].name)
}

const valueReducer = (collector) => {
    const reducerObj = {}
    collector.options.taps.forEach((tap) => {
        reducerObj[tap.name] = tap.child.reducers.root
    })
    return combineReducers(reducerObj)
}

const TapCollectorModel = {
    _view: TapComponent,
    mapStateToProps: undefined,
    _mapDispatchToProps: (dispatch, collector) => {
        return {
            onChange: (tap) => {
                dispatch(collector.services.onChange(tap))
            },
            taps: collector.options.taps
        }
    },
    mergeProps: undefined,
    connectOptions: undefined,
    _options: {
        taps: [{}]
    },
    _reducers: {
        root: (collector) => {
            return combineReducers({
                selectedTapName: selectedTapNameReducer(collector),
                value: valueReducer(collector)
            })  
        },
        selectedTapName: selectedTapNameReducer,
        value: valueReducer 
    },
    _actionTypes: [
        'setSelectedTap'
    ],
    _actions: {
        setSelectedTap: (value) => (collector) => {
            return {
                type: collector.actionTypes.setSelectedTap,
                value: value
            }
        }
    },
    _services: {
        onChange: (tap) => (dispatch, getState$, collector) => {
            dispatch(collector.actions.setSelectedTap(tap.name))
        },
        validate: () => (dispatch, getState$, collector) => {
            return new Promise((resolve, reject) => {
                let {selectedTapName, value} = getState$()
                if (selectedTapName) {
                    collector.options.taps.forEach((tap) => {
                        if (tap.name == selectedTapName) {
                            tap.child._services.validate()(dispatch, () => {
                                return {
                                    data: value[tap.name].data,
                                    error: value[tap.name].error
                                }
                            }, tap.child).then(resolve, reject)
                        }
                    })
                } else {
                    reject('没有选中tap')
                }
            })
        }
    }
}

export default TapCollectorModel