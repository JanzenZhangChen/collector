import React from 'react';
import { connect } from 'react-redux'
import { NameInputCollector, LocationInputCollector } from '../collectors'

const onButtonClick = () => (dispatch, getState) => {
    Promise.all([
        NameInputCollector.services.validate()(dispatch, getState),
        LocationInputCollector.services.validate()(dispatch, getState)
    ]).then((args) => {
        console.log(`name: ${args[0]}; location: ${args[1]}`)
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