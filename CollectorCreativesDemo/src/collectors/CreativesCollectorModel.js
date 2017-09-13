import React from 'react';
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import ReducerOperatorFactory from '../ReducerOperatorFactory'
import CollectorFactory from '../CollectorFactory'
import InputCollectorModel from './InputCollectorModel'
import CheckboxCollectorModel from './CheckboxCollectorModel'
import CarouselCollectorModel from './CarouselCollectorModel'
import _ from 'lodash'

const Creatives = ({childs, label}) => {
    return (
        <div>
            <div>{label}</div>
            <br/>
            {Object.keys(childs).map((key) => {
                let child = childs[key]
                return (
                    <div key={child.actionTypePrefix} style={{'marginLeft': '50px', 'borderBottom': '1px solid blue'}}>
                        <child.view />
                        <br/>
                    </div>
                )
            })}
            <br/>
        </div>
    )
}

const childsReducer = (collector) => {
    return ReducerOperatorFactory(collector.actionTypes.setChilds, {}, {})
}

const valueReducer = (collector) => (state = {}, action) => {
    return collector.dataReducer(state, action)
}

const CreativesCollectorModel = {
    _view: Creatives,
    mapStateToProps: undefined,
    _mapDispatchToProps: (dispatch, collector) => {
        return {
            label: collector.options.label
        }
    },
    mergeProps: undefined,
    connectOptions: undefined,
    _options: {
        label: '个人电话',
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
    dataReducer: state => state, // 动态reducer
    _services: {
        updateRedcuer: () => (dispatch$, getState$, collector) => {
            // 设置获取value的Reducer，由子reducer组成 这个函数会成为reducer，每一次action都会调用一次噢
            collector.dataReducer = (state = {}, action) => {
                let childs = getState$().childs,
                    newState = {}
                _.forEach(childs, (child, key) => {
                    newState[key] = child.reducers.root(state[key], action)
                })
                return newState
            }
            // 为了让reducer生成默认值，所以触发一次空action, 效果和redux自带的 {type:@@INIT} 一样
            dispatch$({
                type: collector.actionTypes.emptyAction
            })
        },
        init: (config) => (dispatch$, getState$, collector) => {
            // 映射
            const typeModelMap = {
                string: InputCollectorModel,
                checkbox: CheckboxCollectorModel,
                carousel: CarouselCollectorModel
            }

            const generateCollector = (key, subConfig) => {
                const childModel = {
                    mapStateToProps: (state) => {
                        let carouselState = getState$().value[key] || {}
                        return carouselState
                    }
                }
                switch(subConfig.type) {
                    case 'string': {
                        childModel.options = {
                            label: subConfig.title,
                            min: subConfig.min,
                            max: subConfig.max,
                            key: key
                        }
                        break
                    }
                    case 'checkbox': {
                        childModel.options = {
                            label: subConfig.title,
                            min: subConfig.min,
                            max: subConfig.max,
                            list: subConfig.list,
                            key: key
                        }
                        break
                    }
                    case 'carousel': {
                        childModel.options = {
                            label: subConfig.title,
                            min: subConfig.min,
                            max: subConfig.max,
                            key: key,
                            type: subConfig.dimension.type,
                            childModel: {
                                options: {
                                    max: subConfig.dimension.max,
                                    min: subConfig.dimension.min,
                                    label: subConfig.dimension.title
                                }
                            }
                        }
                        break
                    }
                }

                return CollectorFactory(typeModelMap[subConfig.type], childModel)
            }

            const childs = {}
            // 根据配置设置 生成childs collector实例 同时根据情况设置mapStateToProps
            _.forEach(config, (ele, key) => {
                childs[key] = generateCollector(key, ele)
            })

            //设置默认值
            // 设置childs
            dispatch$(collector.actions.setChilds(childs))
            // 更新reducer
            dispatch$(collector, 'updateRedcuer')

            _.forEach(config, (ele, key) => {
                if (ele.type == 'carousel') {
                    dispatch$(childs[key], 'init')
                }
            })
        },
        validate: (value) => (dispatch$, getState$, collector) => {
            return new Promise((resolve, reject) => {
                const {childs} = getState$()
                Promise.all(Object.keys(childs).map((key) => {
                    return dispatch$(childs[key], 'validate')
                })).then((args) => {
                    let value = {}
                    Object.keys(childs).forEach((key, index) => {
                        value[key] = args[index]
                    })
                    resolve(value)
                }, (msg) => {
                    reject(msg)
                })
            })
        }
    }
}

export default CreativesCollectorModel