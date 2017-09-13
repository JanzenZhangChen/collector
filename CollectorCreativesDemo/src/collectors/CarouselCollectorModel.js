import React from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import ReducerOperatorFactory from '../ReducerOperatorFactory'
import CollectorFactory from '../CollectorFactory'
import InputCollectorModel from './InputCollectorModel'
import _ from 'lodash'

const Carousel = ({childs = [], onAdd, onDelete, label, min, max}) => {
    return (
        <div>
            <div>{label}</div>
            <br/>
            {childs.map((child, i) => {
                return (
                    <div key={child.actionTypePrefix} style={{'marginLeft': '50px'}}>
                        <child.view />
                        {childs.length == min ? null : <button onClick={() => {onDelete(i, child)}}>删除</button>}
                        <br/>
                    </div>
                )
            })}
            <br/>
            {childs.length == max ? null : <button onClick={onAdd}>添加</button>}
        </div>
    )
}

const childsReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setChilds, {}, [])
}

const valueReducer = (collector) => (state = [], action) => {
    return collector.dataReducer(state, action)
}

const CarouselCollectorModel = {
    _view: Carousel,
    mapStateToProps: undefined,
    _mapDispatchToProps: (dispatch, collector) => {
        return {
            onAdd: () => {
                dispatch(collector.services.onAdd())
            },
            onDelete: (i, child) => {
                dispatch(collector.services.onDelete(i, child))
            },
            label: collector.options.label,
            min: collector.options.min,
            max: collector.options.max
        }
    },
    mergeProps: undefined,
    connectOptions: undefined,
    _options: {
        max: 3,
        min: 1,
        label: '个人电话',
        childModel: {
            options: {
                max_length: 10,
                min_length: 5,
                label: '号码(实时监测，5~10长度)'
            },
            mapStateToProps: (state) => {
                return {
                    data: state.name.data,
                    error: state.name.error
                }
            }
        }
    },
    _reducers: {
        root: (collector) => combineReducers({
            childs: childsReducer(collector),
            value: valueReducer(collector)
        }),
        childs: childsReducer,
        value: valueReducer
    },
    _actionTypes: [
        'setChilds',
        'setValue',
        'emptyAction'
    ],
    _actions: {
        setChilds: (value) => (collector) => {
            return {
                type: collector.actionTypes.setChilds,
                value: value
            }
        },
        setValue: (value) => (collector) => {
            return {
                type: collector.actionTypes.setValue,
                value: value
            }
        }
    },
    dataReducer: state => state, // 动态reducer
    _services: {
        updateRedcuer: () => (dispatch$, getState$, collector) => {
            // 设置获取value的Reducer，由子reducer组成 这个函数会成为reducer，每一次action都会调用一次噢
            collector.dataReducer = (state = [], action) => {
                // 设置的逻辑
                if (action.type == collector.actionTypes.setValue) {
                    return action.value
                }

                let childs = getState$().childs

                const subReducerArray = childs.map((child) => {
                    return child.reducers.root
                })

                state = subReducerArray.map((reducer, index) => {
                    return reducer(state[index], action)
                })

                return state
            }
            // 为了让reducer生成默认值
            dispatch$({
                type: collector.actionTypes.emptyAction
            })
        },
        init: () => (dispatch$, getState$, collector) => {
            const childs = []
            // 生成childs collector实例 同时根据情况设置mapStateToProps
            for(let i = 0; i < collector.options.min; i++) {
                let newChildModel = Object.assign({}, collector.options.childModel)
                newChildModel.mapStateToProps = (state) => {
                    let carouselState = getState$()
                    return carouselState.value[i] || {}
                }
                childs.push(CollectorFactory(InputCollectorModel, newChildModel));
            }
            // 设置childs
            dispatch$(collector.actions.setChilds(childs))
            // 更新reducer
            dispatch$(collector, 'updateRedcuer')
        },
        onAdd: () => (dispatch$, getState$, collector) => {
            let {childs} = getState$()
            let childsLength = childs.length
            let newChildModel = Object.assign({}, collector.options.childModel)
            newChildModel.mapStateToProps = (state) => {
                let carouselState = getState$()
                return carouselState.value[childsLength] || {}
            }
            let newChilds = childs.concat([CollectorFactory(InputCollectorModel, newChildModel)])
            // 设置childs
            dispatch$(collector.actions.setChilds(newChilds))
            // 更新reducer
            dispatch$(collector, 'updateRedcuer')
        },
        onDelete: (deleteIndex, child) => (dispatch$, getState$, collector) => {
            let {value, childs} = getState$()
            let rightChilds = childs.filter((child, index) => {
                return index != deleteIndex
            })
            // 重新生成collector, 因为原本的mapStateToProps是
            let newChilds = rightChilds.map((child, index) => {
                let newChildModel = Object.assign({}, collector.options.childModel)
                newChildModel.mapStateToProps = (state) => {
                    let carouselState = getState$()
                    return carouselState.value[index] || {}
                }
                return CollectorFactory(InputCollectorModel, newChildModel);
            })
            // 设置新的值
            let newValue = value.filter((data, idx) => {
                return idx != deleteIndex
            })
            // 先将值设置正确
            dispatch$(collector.actions.setValue(newValue))
            // 设置childs
            dispatch$(collector.actions.setChilds(newChilds))
            // 更新reducer
            dispatch$(collector, 'updateRedcuer')
        },
        validate: (value) => (dispatch$, getState$, collector) => {
            return new Promise((resolve, reject) => {
                let {childs} = getState$()
                Promise.all(childs.map((child, index) => {
                    return dispatch$(child, 'validate')
                })).then((args) => {
                    resolve(args)
                }, (msg) => {
                    reject(msg)
                })
            })
        }
    }
}

export default CarouselCollectorModel