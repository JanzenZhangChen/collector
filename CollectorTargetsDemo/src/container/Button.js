import React from 'react';
import { connect } from 'react-redux'
import { AdtargetsCollector } from '../collectors'

const onButtonClick = () => (dispatch, getState) => {
    Promise.all([
        AdtargetsCollector.services.validateAll()(dispatch, getState)
    ]).then((args) => {
        console.log(`adtargets: ${args}`)
    }, (msg) => {
        console.log(`wrong: ${msg}`)
    })
}

const Button = ({onClick, dispatch}) => {
    return <button onClick={() => {
        dispatch(onButtonClick())
    }}>提交</button>
}

export default connect()(Button)