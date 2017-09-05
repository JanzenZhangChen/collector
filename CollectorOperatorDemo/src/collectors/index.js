import CollectorFactory from '../CollectorFactory'
import InputCollectorModel from './InputCollectorModel'
import CheckboxCollectorModel from './CheckboxCollectorModel'

const customNameCollectorModel = {
    options: {
        max_length: 10,
        min_length: 5,
        label: '姓名(实时监测，5~10长度)'
    },
    actionTypePrefix: 'name_input',
    mapStateToProps: (state) => {
        return {
            data: state.name.data,
            error: state.name.error
        }
    }
}

const customLocationCollectorModel = {
    options: {
        max_length: 15,
        min_length: 10,
        label: '住处(失焦检测，10~15长度)'
    },
    actionTypePrefix: 'location_input',
    mapStateToProps: (state) => {
        return {
            data: state.location.data,
            error: state.location.error
        }
    },
    _mapDispatchToProps: (dispatch, collector) => {
        return {
            onChange: (e) => {
                const value = e.target.value
                dispatch(collector.actions.setValue(value))
                dispatch(collector.actions.setErrorMsg(''))
            },
            onBlur: () => {
                dispatch((dispatch, getState) => {
                    collector.services.validate()(dispatch, getState).then(() => {}, () => {})
                })
            },
            label: collector.options.label
        }
    },
}

const customSexCollectorModel = {
    options: {
        max_length: 2,
        min_length: 1,
        label: '性别(实时监测，最少选1个，最多2个)'
    },
    actionTypePrefix: 'sex_input',
    mapStateToProps: (state) => {
        return {
            datas: state.sex.data,
            error: state.sex.error
        }
    }
}

// 自定报错输入框
export const NameInputCollector = CollectorFactory(InputCollectorModel, customNameCollectorModel)

export const LocationInputCollector = CollectorFactory(InputCollectorModel, customLocationCollectorModel)

export const SexInputCollector = CollectorFactory(CheckboxCollectorModel, customSexCollectorModel)
