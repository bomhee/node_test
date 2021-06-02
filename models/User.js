const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
        maxlength: 50
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

// 유저 정보를 저장하기 전에 
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
                if(err) return next(err)
                user.password = hash // 암호화된 비밀번호로 치환
                next() // index.js로 돌아감
            })
        })
    }
})

const User = mongoose.model('User', userSchema);

module.exports = { User }