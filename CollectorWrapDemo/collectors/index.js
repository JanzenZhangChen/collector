import CollectorFactory from '../CollectorFactory'
import InputCollectorModel from './InputCollectorModel'
import CheckboxCollectorModel from './CheckboxCollectorModel'
import TapCollectorModel from './TapCollectorModel'

const customNameCollectorModel = {
    options: {
        max_length: 10,
        min_length: 5,
        label: '姓名(实时监测，5~10长度)'
    },
    actionTypePrefix: 'name_input',
    mapStateToProps: (state) => {
        return {
            data: state.taps.value.name.data,
            error: state.taps.value.name.error
        }
    }
}

const customSexCollectorModel = {
    options: {
        max_length: 2,
        min_length: 1,
        label: '性别(实时监测，最少选1个，最多2个)',
        list: [{label: '男',value: 1}, {label: '女',value: 2}, {label: '不确定', value: 3}],
    },
    actionTypePrefix: 'sex_input',
    mapStateToProps: (state) => {
        return {
            data: state.taps.value.sex.data,
            error: state.taps.value.sex.error
        }
    }
}

const customTapCollectorModel = {
    options: {
        taps: [{
            name: 'name',
            label: '姓名',
            child: CollectorFactory(InputCollectorModel, customNameCollectorModel)
        }, {
            name: 'sex',
            label: '性别',
            child: CollectorFactory(CheckboxCollectorModel, customSexCollectorModel)
        }]
    },
    mapStateToProps: (state) => {
        return {
            selectedTapName: state.taps.selectedTapName,
            value: state.taps.value
        }
    }
}

// 自定报错输入框
export const NameInputCollector = CollectorFactory(InputCollectorModel, customNameCollectorModel)

export const SexInputCollector = CollectorFactory(CheckboxCollectorModel, customSexCollectorModel)

export const TapCollector = CollectorFactory(TapCollectorModel, customTapCollectorModel)
