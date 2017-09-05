import React from 'react';
import { connect } from 'react-redux'
import { PhoneCarouselCollector } from '../collectors'

const onButtonClick = () => (dispatch, getState) => {
    Promise.all([
        PhoneCarouselCollector.services.validate()(dispatch, getState)
    ]).then((args) => {
        console.log(`phone numbers: ${args}`)
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