var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var Users=require('../model/user')
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

module.exports=passport=>{
    passport.use(new JwtStrategy(opts, async (jwt_payload, done) =>{
        try {
            let user=await Users.findOne({id:jwt_payload.id})
            if(!user){
                return done(null,false)
            }
            return done(null,user)
        }catch(err){
            console.log(err)
        }
        
    }));
}