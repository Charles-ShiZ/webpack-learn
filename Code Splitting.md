# 代码分离
> 以前我们为了尽量减少HTTP请求而会将所有代码打包成一个单独js文件，但是如果js文件体积过大，就会降低首屏加载效率，浪费内存资源。

利用webpack可以实现代码分离，三种方式：

1. 配置 入口起点
2. 配置 dependOn
3. 动态导入
4. preload与prefetch
(大部分场景下无需特意使用preload
类似字体文件这种隐藏在脚本、样式中的首屏关键资源，建议使用preload
异步加载的模块（典型的如单页系统中的非首页）建议使用prefetch
大概率即将被访问到的资源可以使用prefetch提升性能和体验)

### 目录结构
```js
webpack-demo
|- package.json
|- webpack.config.js
|- /dist
|- /src
  |- index.js
 |- another-module.js
|- /node_modules
```

### 方法一：配置入口起点
#### 如何实现：
index.js
```js
import _ from 'lodash';
console.log(_.join(['1', '2', '3!'], ' '));
```

another-module.js
```js
import _ from 'lodash';
console.log(_.join(['Another', 'module', 'loaded!'], ' '));
```

webpack.config.js
```js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
    another: './src/another-module.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}
```
npm run build 打包生成 index.bundle.js 和 another.bundle.js，会发现两个文件都包含了lodash代码，明显的代码冗余。

修改webpack.config.js，添加上splitChunks，可以去除重复模块的代码
```js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
    another: './src/another-module.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  }
};
```
npm run build 之后查看dist文件夹，发现webpack为lodash模块单独生成一个文件，并从index.bundle.js和another.bundle.js中剔除了lodash模块。这就是通过配置入口起点来实现代码分离的方法。

#### 缺点：
不够灵活，不能动态地将核心应用程序逻辑中的代码拆分出来。
