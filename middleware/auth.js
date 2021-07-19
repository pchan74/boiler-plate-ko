const {User} = require('../models/User')
let auth = (req, res, next) => {
    //인증처리를 하는곳

    //클라인언트 cookie 에서 token 을 가져온다.
    let token = req.cookies.x_auth;
    //토큰을 복호화 한 후에 찾는다.
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.status(400).json({isAuth:false, error:true})

        req.token = token;
        req.user = user;
        next();
    })
    //유저가 있으면 인증 okay
}

module.exports = {auth}