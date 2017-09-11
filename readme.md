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

## Next

 1. 收集意见与改进
 3. 定向包需求上线该功能
 4. 重构phoenix的定向
...