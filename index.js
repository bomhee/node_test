const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const { User } = require('./models/User');
const config = require('./config/key')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const mongoose = require('mongoose');
// db의 비밀번호 등이 노출될 수 있기 때문에 따로 분리한 다음 gitgnore에 추가함(지금은 귀찮아서 안함)
mongoose.connect(config.mongoURI , {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('몽고디비 커넥트!'))
  .catch(err => console.log('err'));

app.get('/', (req, res) => res.send('Hello World!!!!!'))

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))