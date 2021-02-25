# 代码分离
> 以前我们为了尽量减少HTTP请求而会将所有代码打包成一个单独js文件，但是如果js文件体积过大，就会降低首屏加载效率，浪费内存资源。

利用webpack可以实现代码分离，三种方式：

1. 配置 入口起点
2. 配置 dependOn
3. 动态导入
4. preload与prefetch

### 目录和代码-预知
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

### 方法一：配置入口起点
#### 如何实现：

配置webpack.config.js
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

修改下webpack.config.js，添加上splitChunks，可以去除重复模块的代码
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


### 方法二：配置dependOn
#### 如何实现：
配置webpack.config.js
```js
 const path = require('path');

 module.exports = {
   mode: 'development',
   entry: {
    index: {
      import: './src/index.js',
      dependOn: 'shared',
    },
    another: {
      import: './src/another-module.js',
      dependOn: 'shared',
    },
    shared: 'lodash',
   },
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
   },
   optimization: {
     runtimeChunk: 'single',
   }
 };
```

### 方法三：动态导入
#### 如何实现：
配置webpack.config.js
```js
const path = require('path');

module.exports = {
   mode: 'development',
   entry: {
     index: './src/index.js'
   },
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
   }
}
```
src/index.js
```js
document.addEventListener('click', async (e)=>{
    const { default: func } = await import(/* webpackPrefetch: true */'./click');
    func();
})
```
src/click.js
```js
export default () => {
    const ele = document.createElement('div');
    ele.innerText = 'Meskjei';
    document.body.appendChild(ele);
}
```
这样，webpack会将./click.js单独分离为一个文件，便可以实现懒加载

### 方法四：prefetch
在“方法三：动态导入”的基础上修改src/index.js，添加prefetch标记：（注意：如果打开了浏览器的“检查”，要将 NetWork 中的 Disable cache 关闭）
```js
document.addEventListener('click', async (e)=>{
    const { default: func } = await import(/* webpackPrefetch: true */'./click');
    func();
})
```
npm start 之后，打开浏览器检查工具的 NetWork ，点击页面，NetWork会出现一个标识为“prefetch cache”的文件，这就表明成功实现了prefetch功能。

#### preload
准备index.css
```css
@font-face
{
  font-family: HYQiHeiY1;
  src: url('./AgencyFB-Bold.ttf');
}
body{
    font-family: HYQiHeiY1;
}
```
然后手动在 index.html 上添加:（"as"指文件类型，如果引入.css则as="style"，引入.js则as="script"。）
```html
<link rel="preload" as="font" href="./AgencyFB-Bold.ttf" crossorigin>
<link type="text/css" rel="styleSheet"  href="./index.css" />
```
当通过preload引入字体，点开检查工具NetWork，会发现./AgencyFB-Bold.ttf比./index.css要优先加载了。

#### 对比
1. 大部分场景下无需特意使用preload
2. 类似字体文件这种隐藏在脚本、样式中的首屏关键资源，建议使用preload
3. 异步加载的模块（如单页系统中的非首页模块）建议使用prefetch
4. 大概率即将被访问到的资源也可以使用prefetch，提升用户体验
