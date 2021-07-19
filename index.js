const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key')
const {auth} = require('./middleware/auth')
const {User} = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}))
//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
const { json } = require('body-parser');

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))




app.get('/', (req, res) => res.send('Hello World! my test...'))

app.post('/api/usr/register', (req, res) =>{
    //회원가입 할때 필요한 필요한 정보들을 Client 에서 가져오면
    //그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body)
    console.log(req.body)
    user.save((err, userInfo) => {
        if(err) return res.json({success:false, err})
        return  res.status(200).json({
            success:true
        })
    })
})

app.post('/api/user/login', (req, res) => {
    //요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({email:req.body.email}, (err, user) => {
        if(!user){
            return res.json({
                loginSuccess : false,
                message : "no user"
            })
        }
    })
    //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
        if(!isMatch)
            return res.json({loginSuccess : false, message:"no match password"})
        //비밀번호까지 맞다면 Token 을 생성하기.
        user.generateToken((err, user) => {
            if(err) return res.status(400).send(err);
            //토큰을 저장한다. 쿠키 .
            res.cookie("x_auth", user.token)
            .status(200)
            .json({loginSuccess : true, userID : user._id})
        })
    })
})

app.get('/api/users/auth', auth, (req, res) => {
    //middleware 를 통과, auth 를 true
    res.status(200).json({
        _id: req.user.id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email : req.user.email,
        lastname: req.user.lastname,
        role : req.user.role,
        image:req.user.image
    })
})

app.listen(port, () => console.log('Example app listening on port ${5000}!'))