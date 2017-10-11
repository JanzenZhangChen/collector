import React from 'react';
import { connect } from 'react-redux'
import { AdtargetsCollector } from '../collectors'

const onSubmitClick = () => (dispatch, getState) => {
    Promise.all([
        AdtargetsCollector.services.validateAll()(dispatch, getState)
    ]).then((args) => {
        console.log(`adtargets: ${args}`)
    }, (msg) => {
        console.log(`wrong: ${msg}`)
    })
}

const onSetValueClick = () => (dispatch, getState) => {
    const initValue = {
        name: 'janzenzhang',
        location: 'guangzhou,China',
        sex: [1,2,3],
        direction: [2]
    }
    dispatch(AdtargetsCollector.services.setValue(initValue))
}

const onGetAllStateClick = () => (dispatch, getState) => {
    const allState = AdtargetsCollector.services.getAllState()(dispatch, getState)
    window.allState = allState
    console.log(JSON.stringify(allState))
}

const onSetAllStateClick = () => (dispatch, getState) => {
    const allState = window.allState
    if (allState) {
        AdtargetsCollector.services.setAllState(allState)(dispatch, getState)
    } else {
        let defaultState = {"name":{"state":{"data":"1241231","error":false},"status":{"checked":true}},"sex":{"state":{"data":[1,2],"error":false},"status":{"checked":true}},"direction":{"state":{"assist":{"list":[{"label":"左边","value":1},{"label":"右边","value":2},{"label":"中间","value":3}],"loading":false},"data":[3,2],"error":""},"status":{"checked":true}}}
        AdtargetsCollector.services.setAllState(defaultState)(dispatch, getState)
    }
}

const onSetAssistStateClick = () => (dispatch, getState) => {
    const allState = window.allState
    if (allState) {
        AdtargetsCollector.services.setAssistState(allState)(dispatch, getState)
    } else {
        let defaultState = {"name":{"state":{"data":"1241231","error":false},"status":{"checked":true}},"sex":{"state":{"data":[1,2],"error":false},"status":{"checked":true}},"direction":{"state":{"assist":{"list":[{"label":"左边","value":1},{"label":"右边","value":2},{"label":"中间","value":3}],"loading":false},"data":[3,2],"error":""},"status":{"checked":true}}}
        AdtargetsCollector.services.setAssistState(defaultState)(dispatch, getState)
    }
}

const Button = ({onClick, dispatch}) => {
    return (
        <div>
            <button style={{marginBottom: '10px'}} onClick={() => {
                dispatch(onGetAllStateClick())
            }}>复制所有状态（用于提取定向的全部数据，包括辅助数据）</button>
            <br/>
            <button style={{marginBottom: '10px'}} onClick={() => {
                dispatch(onSetAllStateClick(window.allState))
            }}>黏贴所有状态（全部定向弹窗点击确定，用于把所有数据赋值到定向上，包括辅助数据）</button>
            <br/>
            <button style={{marginBottom: '10px'}} onClick={() => {
                dispatch(onSetAssistStateClick(window.allState))
            }}>黏贴辅助状态（全部定向弹窗点击取消，把加载过的异步辅助数据添加到默认定向上）</button>
            <br/>
            <button style={{marginBottom: '10px'}} onClick={() => {
                dispatch(onSetValueClick())
            }}>设置默认数据（编辑广告的时候的回填，辅助数据需要重新生成）</button>
            <br/>
            <button onClick={() => {
                dispatch(onSubmitClick())
            }}>提交</button>
        </div>
    )
}

export default connect()(Button)