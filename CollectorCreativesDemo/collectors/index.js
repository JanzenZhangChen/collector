import CollectorFactory from '../CollectorFactory'
import CreativesCollectorModel from './CreativesCollectorModel'

const customCreativesCollectorModel = {
    mapStateToProps: (state) => {
        return {
            childs: state.creativesChilds,
            value: state.creativesValue
        }
    }
}

export const CreativesCollector = CollectorFactory(CreativesCollectorModel, customCreativesCollectorModel)
