# collector

用于帮助redux进行组件化的轻量级工具，依赖于[redux](https://github.com/reactjs/redux)和[redux-thunk](https://github.com/gaearon/redux-thunk)。(Inspired by [dva](https://github.com/dvajs/dva) and  [redux-form](https://github.com/erikras/redux-form))

## 特性
 - **组件化：** 将redux的多个部件组合成一个有机的整体。可以一次定义，生成多个不会互相影响的组件实例。
 - **解耦：** 将redux-thunk返回的getState进行解耦，让redux的部件变成与全局store没有耦合的函数。
 - **开发方式类似dva：** 参考dva的集成思路，将多个redux部件集合到一个对象上，方便开发与管理。
 - **使用方式类似redux-form**：参考redux-form的实例化使用思路。通过构造函数生成组件实例，绑定实例的reducer与view到redux中即可使用。
 
## 为什么使用collector?

- [React-Redux架构与性能优化详谈](http://km.oa.com/group/29108/articles/show/317042)

## Demo

 1. [Input组件，自带实时监测功能，同时可以自定义化他的组件](https://codesandbox.io/s/github/JanzenZhangChen/collector/tree/master/CollectorDemo)
 2. [checkbox组件，自带监测功能，并且reducer使用了ReducerOperator](https://codesandbox.io/s/github/JanzenZhangChen/collector/tree/master/CollectorOperatorDemo)
 3. [Tap组件，实现组件嵌套逻辑](https://codesandbox.io/s/github/JanzenZhangChen/collector/tree/master/CollectorWrapDemo)
 4. [集装箱表单，实现动态的reducer](https://codesandbox.io/s/github/JanzenZhangChen/collector/tree/master/CollectorDynamicDemo)
 5. [创意模块，实现根据配置生成的表单，包括集装箱](https://codesandbox.io/s/github/JanzenZhangChen/collector/tree/master/CollectorCreativesDemo)
 6. [模拟定向模块，实现根据配置生成可选择的表单](https://codesandbox.io/s/github/JanzenZhangChen/collector/tree/master/CollectorTargetsDemo)

## 如何创建Collector

 - **collector模型**
 
```javascript
const InputCollectorModel = {
    // 纯的react类
    _view: () => {},
    // redux/connect的mapDispatchToProps
    _mapDispatchToProps: () => {},
    // redux/connect的mapStateToProps
    mapStateToProps: undefined,
    // redux/connect的mergeProps
    mergeProps: undefined,
    // redux/connect的connectOptions
    connectOptions: undefined,
    // 默认配置数据
    _options: {},
    // reducer的构造函数
    _reducers: {
        root: rootReducer,
    },
    // actionTypes的名称
    _actionTypes: [],
    // action的构造函数
    _actions: {},
    // service的构造函数
    _services: {}
}
```
 - **创造实例**
```javascript
const NameInputCollector = CollectorFactory(InputCollectorModel, {
    // 自定义配置（选填）
    options: {
        max_length: 10,
        min_length: 5,
        label: '姓名(实时监测，5~10长度)'
    },
    // 自定义后缀 （选填）
    actionTypePrefix: 'name_input',
    // 将state的数据映射到组件上（必填）
    mapStateToProps: (state) => {
        return {
            data: state.name.data,
            error: state.name.error
        }
    }
})
```
 - **_view**
 纯粹的react组件，不做任何数据操作的逻辑
 - **mapStateToProps**
 redux/connect的mapStateToProps。用于把state的数据映射到view上，同时也用来把getState()的数据映射到getState$()上
 - **_mapDispatchToProps**
 redux/connect对应的mapDispatchToProps，但是多了collector的参数，用来把声明的services等方法绑定到view上。
 - **mergeProps与connectOptions**
 redux/connect的mergeProps与connectOptions参数。
 - **_options**
 默认的options声明，用于做一些配置化的功能实现。在构造collector的时候会merge用户的options到_options上。
 - **_reducers** 
 reducer构造函数的对象集合。库会加工为reducers，可以直接被部署到任意store或其他reducer上

```javascript
const _reducers = {
    root: (collector) => (state = '', action) => {
        let newState
        switch (action.type) {
            case collector.actionTypes.setValue:
                newState = action.value
                break
            default:
                newState = state
        }
        return newState
    }
}
```
 
 - **_actionTypes**
 数组。库会对_actionTypes进行加工，生成actionTypes，添加上唯一后缀，防止实例实例之间的互相影响
 - **_actions**
 库会对_actions进行加工，生成actions，最终返回action的函数的构造函数
```javascript
const _actions = {
    setValue: (value) => (collector) => {
        return {
            type: collector.actionTypes.setValue,
            value: value
        }
    }
}
```
 - **_services**
 解耦的actionCreator等于service。因为actionCreator的参数getState获得的是全局的store，与项目强耦合。所以我们用mapStateToProps来将store的数据映射到数据层级。让service书写的时候对store无感知。库会对_services进行加工，生成services，可以直接被外部dispatch(services.onChange())
```javascript
_services: {
    /**
     * service
     * @param  {any} value 设值
     * @param {function} dispatch$ 用于dispatch一个service。
     * @param {function} getState$ 用于获取解耦的数据
     * @param {object} collector collector实例
     */
    onChange: (value) => (dispatch$, getState$, collector) => {
        // 设置数据
        dispatch$(collector.actions.setValue(value))
        // 调用检验数据是否正确
        dispatch$(collector, 'validate', value).then(() => {}, () => {})
    },
    validate: (value) => (dispatch$, getState$, collector) => {
        return new Promise()
    }
}
```

## 如何使用Collector

 - **将reducer还有view部署到现有项目中**
```javascript
const store = createStore(combineReducers({
    name: NameInputCollector.reducers.root
}), applyMiddleware(ReduxThunk))

render(
  <Provider store={store}>
    <NameInputCollector.view />
  </Provider>,
  document.getElementById("root")
)
```

 - **Collector之间互相调用action与service**
```javascript
const _services = {
    validate: (value) => (dispatch$, getState$, collector) => {
        const otherCollector = options.otherCollector
        // 获取别的人actionTypes来dispatch$
        dispatch$({
            type: otherCollector.actionTypes.setValue,
            value: value
        })
        // 或调用actions来dispatch$
        dispatch$(otherCollector.actions.setValue(value))
        // 或通过第二个参数dispatch$别人的service。从第三个参数开始为service的参数
        dispatch$(otherCollector, 'validate', value).then(resolve, reject)   
    }
}
```

## Next

 1. 收集意见与改进
 3. 定向包需求上线该功能
 4. 重构phoenix的定向
...