import React from 'react';
import { connect } from 'react-redux'
import { CreativesCollector } from '../collectors'

const onButtonClick = () => (dispatch, getState) => {
    Promise.all([
        CreativesCollector.services.validate()(dispatch, getState)
    ]).then((args) => {
        console.log(`phone numbers: ${JSON.stringify(args[0])}`)
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