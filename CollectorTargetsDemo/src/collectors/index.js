import CollectorFactory from '../CollectorFactory'
import InputCollectorModel from './InputCollectorModel'
import CheckboxCollectorModel from './CheckboxCollectorModel'
import AdtargetsCollectorModel from './Adtarget'
import { combineReducers } from 'redux'

const customAdtargetsCollectorModel = {
    mapStateToProps: (state) => {
        return state.adtargets
    },
    options: {
        label: '定向'
    }
}

export const AdtargetsCollector = CollectorFactory(AdtargetsCollectorModel, customAdtargetsCollectorModel)
