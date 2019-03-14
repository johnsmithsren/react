## 技术栈

react@16.0 + redux@3.7.2 + react-router@3.2.0 + webpack@3.10.0 + axios@0.18.0 + less@2.7.1 + antd@3.1.3

## 项目运行

```
git clone https://github.com/duxianwei520/react.git  

cd react （进入当前的项目）

npm install  (安装依赖包)

npm start (运行本地开发环境)

npm run mock (对，就是传说中的 mockjs http://highsea90.com/t/mock/)

#### 注意

如果不启动mock服务，那么登录不进去内页

想要体验聊天室功能  先开启socket服务 运行命令

npm run chat

npm run build (打包，部署)

```

对了，服务端返回的格式我们是这样子一个数据结构

```
{
  data: {
    totalCount: 100,
    currentPage: 1,
    pageSize: 10,
    'list': [
    ],
  },
  msg: '',
  status: 1,
}

```

所有异步请求返回都会经过 configs 里面的 ajax.js 做处理，如果请求没有任何问题，那 status 返回值是 1；
如果请求错误，比如说参数错误或者其他报错之类的，那 status 返回值就是 0；
如果 status 值是-1，表示登录超时，那么就会跳出登录。
这些参数都可以根据实际情况进行调整，报错或者成功的提示信息放在 msg 里面返回。
当前项目集成了完整的用户管理、角色管理、模块管理等基本的权限管理功能，小伙伴们一定要同时启动 npm run mock 才可以看到噢

这个 react 的项目我有在跟 nodejs 的 express 框架配合做接口的开发，可以不靠后端输出数据库真实的数据，仓库地址在

```
https://github.com/duxianwei520/express

```

还有一个原生的 nodejs 版本的，仓库库地址是

```
https://github.com/duxianwei520/node

```

基本功能差不多，目前实现了注册登录以及获取用户信息等 3 个接口的真实 api

#### 注意：如果你更新代码发现登录界面进不去，而且没有用到真实的 api，那就进入 login.js 里直接在 handleSubmit 方法里面把 sessionStorage.setItem('token', 'dupi');hashHistory.push('/');这两行的注释打开，用户名密码界面不报错就可以登录跳转到内页

## 说明

> 喜欢的别忘记了可以 star 一下的噢！

> 开发环境 win10 Chrome 63.0.3239.132（正式版本） （32 位） nodejs 8.7.0

> 如果 npm install 太慢导致有些 npm 依赖包下载失败 你可以看控制台的报错信息，再手动 npm install 具体的开发包，推荐使用淘宝的注册源，直接运行，

```
npm install -g cnpm --registry=https://registry.npm.taobao.org

```

> 如有问题请直接在 Issues 中提，或者您发现问题并有非常好的解决方案，欢迎 PR 👍

### 取消 http 请求示例：

```
import axios from 'axios'
const axiosHandle = axios.CancelToken.source()

login(){
  this.props.dispatch(fetchLogin(values, (res) => {},(error)=>{},axiosHandle)
  取消请求的操作
  setTimeout(() => {
    axiosHandle.cancel('手动取消。')
  }, 3000)
}

```

## 功能一览

- [√] 项目按路由模块加载
- [√] 登录，以及登录权限控制
- [√] 退出
- [√] 欢迎主页
- [√] 左侧菜单，正常 mini 切换
- [√] redux 完整示范
- [√] mockjs 模拟后端返回接口
- [√] 页面高度 flex 自适应
- [√] fetch 数据跨域的设置
- [√] 实时的 webpack 包大小预览,方便优化
- [√] draftjs 编辑器
- [√] 聊天室

### 登陆

<img src="https://github.com/duxianwei520/resource/blob/master/react/screenshots/login.gif" width="973" height="557"/>

### echart

<img src="https://github.com/duxianwei520/resource/blob/master/react/screenshots/echart.gif" width="973" height="557"/>

### 聊天室

<img src="https://github.com/duxianwei520/resource/blob/master/react/screenshots/chat.gif" width="973" height="557"/>

### 设置中心

<img src="https://github.com/duxianwei520/resource/blob/master/react/screenshots/set.gif" width="973" height="557"/>

### 构建完成的包的分析截图

<img src="https://github.com/duxianwei520/resource/blob/master/react/screenshots/analysis.gif" width="973" height="557"/>

### 生成的 dist 文件夹

<img src="https://github.com/duxianwei520/resource/blob/master/react/screenshots/dist.gif" width="973" height="557"/>

## 项目结构

```tree


```

## License

[MIT](https://github.com/duxianwei520/react/blob/master/LICENSE)
