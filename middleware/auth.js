const { User } = require('../models/User');

let auth = (req, res, next) => {

    // 인증 처리를 하는 곳
    // 클라이언트 쿠키에서 토큰을 가져온다
    // index.js에서 const cookieParser = require('cookie-parser'); 해왔기 때문에
    // 따로 import없이도 cookie.x_auth를 가져올 수 있음
    let token = req.cookie.x_auth;

    // 가져온 토큰을 복호화(Decode) 한 후 유저를 찾는다
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: true }) // 유저가 없으니 클라이언트에게 내용 전달
        else req.token = token;
             req.user = user;
             next(); // next가 없으면 미들웨어에 갖혀있으니 index.js로 넘어갈 수 있도록 넣어줌
    })

    // 유저가 있으면 인증O
    // 유저가 없으면 인증X
}

module.exports = { auth };