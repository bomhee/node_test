const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require('./models/User');
const config = require('./config/key')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
// db의 비밀번호 등이 노출될 수 있기 때문에 따로 분리한 다음 gitgnore에 추가함(지금은 귀찮아서 안함)
mongoose.connect(config.mongoURI , {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('몽고디비 커넥트!'))
  .catch(err => console.log('err'));

app.get('/', (req, res) => res.send('Hello World!!!!!'))

// 회원가입 기능
app.post('/register', (req, res) => {
    
    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다
    const user = new User(req.body)
  
    user.save((err, userInfo) => {
      if(err) return res.json({ success: false, err})
      return res.status(200).json({
        success: true
      })
    }) // 몽고db에 데이터 저장
})

// 로그인 기능
app.post('/login', (req, res) => {

    // 요청된 이메일을 데이터베이스에서 있는지 찾는다
    // findOne : 몽고db에서 제공하는 메소드
    User.findOne({ email: req.body.email }, (err, user) => {
      if(!user) { // User에 담긴 user에 이메일이 없다면
        return res.json({
          loginSuccess: false,
          message: "제공된 이메일에 해당하는 유저가 없습니다."
        })
      }
      
      // 요청한 이메일이 있다면 비밀번호가 일치한지 확인
      // comparePassword와 같은 메소드 이름은 임의로 지정 가능
      user.comparePassword(req.body.password, (err, isMatch) => {
        // User.js에서 리턴받은 isMatch가 없다면 (일치X)
        if(!isMatch)
          return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})

        // 비밀번호까지 일치하다면 토큰을 생성
        // npm install jsonwebtoken --save
        user.generateToken((err, user) => {
          if(err) return res.status(400).send(err);

          // 토큰을 저장한다. 어디에? 쿠키 or 로컬스토리지 or 세션
          // 쿠키에 토큰을 저장하기 위해 npm install cookie-parser --save
          res.cookie("x_auth", user.token) 
          .status(200)
          .json({ loginSuccess: true, userId: user._id})
        })
        
      })

    })
  
    

    
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))