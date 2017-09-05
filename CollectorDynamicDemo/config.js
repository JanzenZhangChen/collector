// const config = {
//     name: {
//         type: 'string'
//     },
//     sex: {
//         type: 'checkbox'
//     },
//     elements: {
//         type: 'carousel',
//         min: 2,
//         max: 3,
//         dimension: {
//             location: {
//                 type: 'string'
//             }
//         }
//     }
// }

// const getPathValue = (state = {}, paths = [], key) => {
//     let temp
//     paths.forEach((path) => {
//         if (!temp) {
//             temp = state[path]
//         } else {
//             temp = temp[path]
//         }
//     })
//     return temp[key]
// }

// const dynamicCreativesCollectorGenerator = (config, dataPaths, errorPaths) => {
//     const CollectorObject = {}

//     Object.keys(config).forEach((key) => {
//         if (config[key].type == 'string') {
//             CollectorObject[key] = CollectorFactory(InputCollectorModel, {
//                 mapStateToProps: (state) => {
//                     return {
//                         data: getPathValue(state, dataPaths, key)
//                         error: getPathValue(state, errorPaths, key)
//                     }
//                 }
//             })
//         }
//         if (config[key].type == 'checkbox') {
//             CollectorObject[key] = CollectorFactory(CheckboxCollectorModel, {
//                 mapStateToProps: (state) => {
//                     return {
//                         data: getPathValue(state, dataPaths, key)
//                         error: getPathValue(state, errorPaths, key)
//                     }
//                 }
//             })
//         }
//         if (config[key].type == 'carousel') {
//             CollectorFactory[key] = []
//             for (let i = 0; i < config[key].max; i++) {
//                 CollectorFactory[key].push(collectorGenerator(config[key].dimension, dataPaths.concat([key]), errorPaths.concat([key])))
//             }
//         }
//     })
// }

// const Collectors = dynamicCreativesCollectorGenerator(config, ['dynamic'], ['dynamicError'])

// const reducer = (Collectors) => (state = {}, action) => {

//     _.each(Collectors, (collectorOrArray, key) => {
//         if (Array.isArray(collectorOrArray == '')) {
            
//         }
//     })

//     return state
// }