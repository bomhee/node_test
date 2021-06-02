const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        maxlength: 100
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// 유저 정보를 저장하기 전에 비밀번호 암호화
userSchema.pre('save', function( next ){
    var user = this;

    // 비밀번호가 변경될때에만 암호화가 진행되어야 하기 때문에 조건문 추가
    if(user.isModified('password')){

        // bcrypt 라이브러리로 비밀번호를 암호화 시킨다
        // genSalt : salt 생성
        // saltRounds : 10자리인 salt를 이용하여 비밀번호를 암호화
        bcrypt.genSalt(saltRounds, function(err, salt){

            if(err) return next(err) // 에러발생하면 next로에러메세지 보냄
            // user.password : 사용자가 입력한 순수한 비밀번호 원본
            // hash : 암호화된 비밀번호
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash // 암호화된 비밀번호로 치환
                next() // index.js로 돌아감
            })
        })
    } else {
        next()
    }
})

// 비밀번호 유효성 검사
userSchema.methods.comparePassword = function(plainPassword, cb){

    // plainPassword 1234와 db에 저장된 암호화된 비밀번호 비교
    // bcrypt를 이용해 사용자가 입력한 plainPassword를 암호화하여 저장된 비밀번호와 비교함
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err) // 만약 같지 않다면 err를 보내고
        else cb(null, isMatch)   // 비밀번호가 같다면 그냥 콜백을 index.js로 리턴함 (isMatch == true)
    })
}

// 토큰 생성
userSchema.methods.generateToken = function(cb){

    var user = this;

    // jsonwebtoken을 이용해서 token을 생성하기
    // _id는 db에 저장된 식별자 _id
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    // user._id + 'secretToken' = token
    // -> 'secretToken' -> user._id

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        else cb(null, user) // 성공했다면 전달할것 없이(null) user정보만 index.js로 리턴
    })   

}


userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // 토큰을 decode 한다
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({ "_id" : decoded, "token": token }, function(err, user){
            if(err) return cb(err)
            else cb(null, user)
        })
    })
}


const User = mongoose.model('User', userSchema);

module.exports = { User }