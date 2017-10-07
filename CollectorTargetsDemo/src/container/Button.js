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
        sex: [1,2,3]
    }
    dispatch(AdtargetsCollector.services.setValue(initValue))
}

const Button = ({onClick, dispatch}) => {
    return (
        <div>
            <button style={{marginRight: '10px'}} onClick={() => {
                dispatch(onSetValueClick())
            }}>设置数据</button>
            <button onClick={() => {
                dispatch(onSubmitClick())
            }}>提交</button>
        </div>
    )
}

export default connect()(Button)