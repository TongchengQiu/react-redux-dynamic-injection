# Redux store 的动态注入

---

# 前言

在 React + Redux + React-Router 的单页应用架构中，我们将 UI 层（ React 组件）和数据层（ Redux store ）分离开来，以做到更好地管理应用的。
Redux store 既是存储整个应用的数据状态，它的 state 是一个树的数据结构，可以看到如图的例子：

![state tree](./pictures/section-redux-async-1.png)

而随着应用和业务逻辑的增大，项目中的业务组件和数据状态也会越来越多；在 Router 层面可以使用 React-Router 结合 webpack [做按需加载](https://reacttraining.com/react-router/web/guides/static-routes) 以减少单个 js 包的大小。
而在 store 层面，随着应用增大，整个结构可能会变的非常的大，应用加载初始化的时候就会去初始化定义整个应用的 store state 和 actions ，这对与内存和资源的大小都是一个比较大的占用和消耗。

因此如何做到像 Router 一样地在需要某一块业务组件的时候再去添加这部分的 Redux 相关的数据呢？

**Redux store 动态注入** 的方案则是用以解决以上的问题。

在阅读本文的时候建议了解以下一些概念：
- [Redux 的数据流概念与文档](http://redux.js.org/)
- [React-Router v4 文档](https://reacttraining.com/react-router/web/guides/philosophy)
- [redux 大法好 —— 入门实例 TodoList
](https://qiutc.me/post/redux-%E5%A4%A7%E6%B3%95%E5%A5%BD-%E2%80%94%E2%80%94-%E5%85%A5%E9%97%A8%E5%AE%9E%E4%BE%8B-TodoList.html)

---

# 方案实践

## 原理

在 Redux 中，对于 store state 的定义是通过组合 reducer 函数来得到的，也就是说 reducer 决定了最后的整个状态的数据结构。在生成的 store 中有一个 [replaceReducer(nextReducer)](http://redux.js.org/docs/api/Store.html#replaceReducer) 方法，它是 Redux 中的一个高阶 API ，该函数接收一个 `nextReducer` 参数，用于替换 store 中原原有的 reducer ，以此可以改变 store 中原有的状态的数据结构。

因此，在初始化 store 的时候，我们可以只定义一些默认公用 reducer（登录状态、全局信息等等），也就是在 `createStore` 函数中只传入这部分相关的 reducer ，这时候其状态的数据结构如下：

![state tree](./pictures/section-redux-async-4.png)

当我们加载到某一个业务逻辑对应的页面时，比如 `/home`，这部分的业务代码经过 Router 中的处理是按需加载的，在其初始化该部分的组件之前，我们可以在 store 中注入该模块对应的 reducer ，这时候其整体状态的数据结构应该如下：

![state tree](./pictures/section-redux-async-5.png)

在这里需要做的就是将新增的 reducer 与原有的 reducer 组合，然后通过 `store.replaceReducer` 函数更新其 reducer 来做到在 store 中的动态注入。

## 代码

话不多说，直接上代码 [https://github.com/TongchengQiu/react-redux-dynamic-injection](https://github.com/TongchengQiu/react-redux-dynamic-injection) ，示例项目的目录结构如下：

```
.
├── src
|   ├── pages
|   |   ├── Detail
|   |   |   ├── index.js
|   |   |   ├── index.jsx
|   |   |   └── reducer.jsx
|   |   ├── Home
|   |   |   ├── index.js
|   |   |   ├── index.jsx
|   |   |   └── reducer.jsx
|   |   ├── List
|   |   |   ├── index.js
|   |   |   ├── index.jsx
|   |   |   └── reducer.jsx
|   |   ├── Root.js
|   |   └── rootReducer.js
|   ├── store
|   |   ├── createStore.js
|   |   ├── location.js
|   |   └── reducerUtil.js
|   └── index.js
└── package.json
```

### 入口

首先来看整个应用的入口文件 `./src/index.js` ：

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Root from './pages/Root';

ReactDOM.render(<Root />, document.getElementById('root'));
```

这里所做的就是在 `#root` DOM 元素上挂载渲染 `Root` 组件；

### Root 根组件

在 `./src/pages/Root.jsx` 中：

```js
import React, { Component} from 'react';
import { Provider } from 'react-redux';
import { Link, Switch, Route, Router as BrowserRouter } from 'react-router';

import createStore from '../store/createStore';
import { injectReducer } from '../store/reducerUtils';
import reducer, { key } from './rootReducer';

export const store  = createStore({} , {
  [key]: reducer
});

const lazyLoader = (importComponent) => (
  class AsyncComponent extends Component {
    state = { C: null }

    async componentDidMount () {
      const { default: C } = await importComponent();
      this.setState({ C });
    }

    render () {
      const { C } = this.state;
      return C ? <C {...this.props} /> : null;
    }
  }
);

export default class Root extends Component {
  render () {
    return (
      <div className='root__container'>
        <Provider store={store}>
          <Router>
            <div className='root__content'>
              <Link to='/'>Home</Link>
              <br />
              <Link to='/list'>List</Link>
              <br />
              <Link to='/detail'>Detail</Link>
              <Switch>
                <Route exact path='/'
                  component={lazyLoader(() => import('./Home'))}
                />
                <Route path='/list'
                  component={lazyLoader(() => import('./List'))}
                />
                <Route path='/detail'
                  component={lazyLoader(() => import('./Detail'))}
                />
              </Switch>
            </div>
          </Router>
        </Provider>
      </div>
    );
  }
}
```

首先是创建了一个 Redux 的 store ，这里的 `createStore` 函数并并没有用 Redux 中原生提供的，而是重新封装了一层来改造它；
它接收两个参数，第一个是初始化的状态数据，第二个是初始化的 reducer，这里传入的是一个名称为 `key` 的 reducer ，这里的 `key` 和 `reducer` 是在 `./src/pages/rootReducer.js` 中定义的，它用来存储一些通用和全局的状态数据和处理函数的；
`lazyLoader` 函数是用来异步加载组件的，也就是通过不同的 route 来分割代码做按需加载，具体可参考  [code-splitting](https://reacttraining.com/react-router/web/guides/code-splitting) ；
他的用法就是在 `Route` 组件中传入的 `component` 使用 `lazyLoader(() => import('./List'))` 的方式来导入；
接下来就是定义了一个 `Root` 组件并暴露，其中 `Provider` 是用来连接 Redux store 和 React 组件，这里需要传入 `store` 对象。

### 创建 STORE

前面提到，创建 store 的函数是重新封装 Redux 提供的 `createStore` 函数，那么这里面做了什么处理的？
看 `./src/store/createStore.js` 文件：

```js
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';

import { makeAllReducer } from './reducerUtils';

export default (initialState = {}, initialReducer = {}) => {
  const middlewares = [thunk];

  const enhancers = [];

  if (process.env.NODE_ENV === 'development') {
    const devToolsExtension = window.devToolsExtension;
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension());
    }
  }

  const store = createStore(
    makeAllReducer(initialReducer),
    initialState,
    compose(
      applyMiddleware(...middlewares),
      ...enhancers
    )
  );

  store.asyncReducers = {
    ...initialReducer
  };

  return store;
}
```

首先在暴露出的 `createStore` 函数中，先是定义了 Redux 中我们需要的一些 `middlewares` 和 `enhancers` ：
- [`redux-thunk`](https://github.com/gaearon/redux-thunk) 是用来在 Redux 中更好的处理异步操作的；
- `devToolsExtension` 是在开发环境下可以在 chrome 的 redux devtool 中观察数据变化；

之后就是生成了 store ，其中传入的 reducer 是由 `makeAllReducer` 函数生成的；
最后返回 store ，在这之前给 `store` 增加了一个 `asyncReducers` 的属性对象，它的作用就是用来缓存旧的 reducers 然后与新的 reducer 合并，其具体的操作是在 `injectReducer` 中；

### 生成 REDUCER

在 `./src/store/reducerUtils.js` 中：

```js
import { combineReducers } from 'redux';

export const makeAllReducer = (asyncReducers) => combineReducers({
  ...asyncReducers
});

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return;

  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeAllReducer(store.asyncReducers));
}

export const createReducer = (initialState, ACTION_HANDLES) => (
  (state = initialState, action) => {
    const handler = ACTION_HANDLES[action.type];
    return handler ? handler(state, action) : state;
  }
);
```

在初始化创建 store 的时候，其中的 reducer 是由 `makeAllReducer` 函数来生成的，这里接收一个 `asyncReducers` 参数，它是一个包含 `key` 和 `reducer` 函数的对象；

`injectReducer` 函数是用来在 store 中动态注入 reducer 的，首先判断当前 store 中的 `asyncReducers` 是否存在该 reducer ，如果存在则不需要做处理，而这里的 `asyncReducers` 则是存储当前已有的 reducers ；
如果需要新增 reducer ，则在 `asyncReducers` 对象中加入新增的 reducer ，然后通过 `makeAllReducer` 函数返回原有的 reducer 和新的 reducer 的合并，并通过 `store.replaceReducer` 函数替换 `store` 中的 reducer。

`createReducer` 函数则是用来生成一个新的 reducer 。

### 定义 ACTION 与 REDUCER

关于如何定义一个 action 与 reducer 这里以 rootReducer 的定义来示例 `./src/pages/rootReducer.js` ：

```js
import { createReducer } from '../store/reducerUtils';

export const key = 'root';

export const ROOT_AUTH = `${key}/ROOT_AUTH`;

export const auth = () => (
  (dispatch, getState) => (
    new Promise((resolve) => {
      setTimeout(() => {
        dispatch({
          type: ROOT_AUTH,
          payload: true
        });
        resolve();
      }, 300);
    })
  )
);

export const actions = {
  auth
};

const ACTION_HANLDERS = {
  [ROOT_AUTH]: (state, action) => ({
    ...state,
    auth: action.payload
  })
};

const initalState = {
  auth: false
};

export default createReducer(initalState, ACTION_HANLDERS);
```

这一步其实比较简单，主要是结合 `redux-thunk` 的异步操作做了一个模拟 auth 验证的函数；

首先是定义了这个 reducer 对应的 state 在根节点中的 key ;
然后定义了 actions ；
之后定义了操作函数 auth ，其实就是触发一个 `ROOT_AUTH` 的 action；
之后定义 actions 对应的处理函数，存储在 `ACTION_HANLDERS` 对象中；
最后通过 `createReducer` 函数生成一个 reducer 并暴露出去；

对于在业务组件中需要动态注入的 reducer 的定义也是按照这套模式，具体可以观察每个业务组件中的 `reducer.js` 文件；

### 动态注入 REDUCER

在前面，我们生成了一个 store 并赋予其初始化的 state 和 reducer ，当我们加载到某一块业务组件的时候，则需要动态注入该组件对应的一些 state 和 reducer。

以 Home 组件为示例，当加载到该组件的时候，首先执行 `index.js` 文件：

```js
import { injectReducer } from '../../store/reducerUtils';
import { store } from '../Root';
import Home from './index.jsx';
import reducer, { key } from './reducer';

injectReducer(store, { key, reducer });

export default Home;
```

首先是在 store 中插入其业务模块对于的 reducer： `injectReducer(store, { key, reducer })` ，之后直接暴露该组件；
因此在该组件初始化之前，在 store 中就注入了其对应的 state 和 reducer；

而在 `index.jsx` 中对于 Redux 的使用和其标准的用法并无区别；感兴趣可以阅读该部分的代码。

### 运行示例

clone 仓库：

```bash
git clone https://github.com/TongchengQiu/react-redux-dynamic-injection.git
```

初始化：

```bash
npm i -d
```

运行：

```bash
npm start
```

可以看到启动了项目 `http://localhost:3000/`；

通过 Redux Devtool ，可以看到这里的初始状态为：

![state tree](./pictures/section-redux-async-2.png)

点击 **List** 到 List 对应的页面，可以看到原来的状态变为了：

![state tree](./pictures/section-redux-async-3.png)

也就是说在加载到 List 组件的时候，动态插入了这部分对应的 state 和 reducer。
