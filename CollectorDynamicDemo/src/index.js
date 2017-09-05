import React from "react"
import { render } from "react-dom"
import { createStore, applyMiddleware, compose as redux_compose, combineReducers } from 'redux'
import { connect } from 'react-redux'
import { Provider } from 'react-redux'
import ReduxThunk from 'redux-thunk'
import { NameInputCollector, LocationInputCollector, SexInputCollector, PhoneCarouselCollector } from './collectors'
import ButtonContainer from './container/Button'

// dev的情况下，使用redux devtools
let compose = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    maxAge: 100, // 最大保存的action数量
    shouldRecordChanges: true, // 是否默认开启record
    shouldCatchErrors: false
}) : redux_compose;

//------------------------

const store = createStore(combineReducers({
    phoneChilds: PhoneCarouselCollector.reducers.childs,
    phoneValue: PhoneCarouselCollector.reducers.value
}), compose(applyMiddleware(ReduxThunk)))

render(
  <Provider store={store}>
    <div>
        <PhoneCarouselCollector.view />
        <br/>
        <ButtonContainer />
    </div>
  </Provider>,
  document.getElementById("root")
)

// 需要初始化
store.dispatch(PhoneCarouselCollector.services.init())