import _ from 'lodash';
console.log(_.join(['1', '2', '3!'], ' '));

document.addEventListener('click', async (e)=>{
    const { default: func } = await import(/*webpackChunkName:"click", webpackPrefetch: true */'./click');
    func();
});