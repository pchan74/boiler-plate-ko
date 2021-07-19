const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const usrSchema = mongoose.Schema({
    name: {
        type: String,
        maxLength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        maxLength: 50
    },
    lastname: {
        type: String,
        maxLength: 50
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


usrSchema.pre('save', function(next) {
    var user = this;
    if(user.isModified('password')) {
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) {
                // Store hash in your password DB.
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else{
        next()
    }
})

usrSchema.methods.comparePassword = function(plainPassword, cb){
    //plainPassword, 암호화된 비밀번호
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

usrSchema.methods.generateToken = function(cb) {
    var user = this
    //jsonwebtoken 을 이용해서 token 을 생성하기.
    var token = jwt.sign(user._id.toHexString(), 'secret token');
    //user._id + 'secret token' = token
    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}

usrSchema.statics.findByToken = function(token, cb) {
    var user = this;
    //토큰을 decode
    jwt.verify(token, 'secretToken', function(err, decoded){
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token 과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id": decoded, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', usrSchema)

module.exports = {User}