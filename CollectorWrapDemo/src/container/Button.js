import React from 'react';
import { connect } from 'react-redux'
import { TapCollector } from '../collectors'

const onButtonClick = () => (dispatch, getState) => {
    Promise.all([
        TapCollector.services.validate()(dispatch, getState),
    ]).then((args) => {
        console.log(`value: ${args[0]}`)
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