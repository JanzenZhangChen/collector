import React from "react"
import { render } from "react-dom"
import { createStore, applyMiddleware, compose as redux_compose, combineReducers } from 'redux'
import { connect } from 'react-redux'
import { Provider } from 'react-redux'
import ReduxThunk from 'redux-thunk'
import { CreativesCollector } from './collectors'
import ButtonContainer from './container/Button'

// dev的情况下，使用redux devtools
let compose = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    maxAge: 100, // 最大保存的action数量
    shouldRecordChanges: true, // 是否默认开启record
    shouldCatchErrors: false
}) : redux_compose;

//------------------------

const store = createStore(combineReducers({
    creativesChilds: CreativesCollector.reducers.childs,
    creativesValue: CreativesCollector.reducers.value
}), compose(applyMiddleware(ReduxThunk)))

render(
  <Provider store={store}>
    <div>
        <CreativesCollector.view />
        <br/>
        <ButtonContainer />
    </div>
  </Provider>,
  document.getElementById("root")
)

const config = {
    name: {
        type: 'string',
        title: '姓名',
        min: 5,
        max: 10
    },
    sex: {
        type: 'checkbox',
        list: [{label: '男',value: 1}, {label: '女',value: 2}, {label: '未知', value: 3}],
        title: '性别',
        min: 1,
        max: 2
    },
    elements: {
        type: 'carousel',
        title: '住处',
        min: 2,
        max: 4,
        dimension: {
            type: 'string',
            title: '住处',
            min: 5,
            max: 10
        }
    }
}

// 需要初始化
store.dispatch(CreativesCollector.services.init(config))