// 환경변수가 서버에 배포한 후라면 prod.js에서 db정보를 가져옴
if(process.env.NODE_ENV === 'production'){
    module.exports = require('./prod');
}else{ // 로컬환경이라면 dev.js에서 db정보를 가져옴
    module.exports = require('./dev');
}