const router = require('koa-router')()
const Users=require('../model/user')
const bcrypt = require('bcrypt');
var gravatar = require('gravatar');
const {privateKey} = require('../constant/const')
const jwt=require('jsonwebtoken')
const passport=require('passport')
router.prefix('/users')
router.post('/register', async (ctx, next) =>{
  const {name,password,email}=ctx.request.body
  var data=await Users.findOne({email})
    if(data){
      ctx.status=404;
      ctx.body={
        code:404,
        msg:"error",
        content:"已注册，请登录~"
      }
    }else{
      var avatar = gravatar.url(email, {s: '200', r: 'pg', d: 'mm'});
      let users=new Users({
        name,
        email,
        password,
        avatar,
      })
      try{
        let salt=await bcrypt.genSalt(10)
        let hash=await bcrypt.hash(password, salt);
         users.password=hash
      }catch(err){
        console.log(err)
      }
      let result=await users.save()
      console.log(result)
      ctx.body={
        code:200,
        msg:"success",
        content:result
      }
      
  }
})


router.post('/login', async (ctx, next) =>{
  let {email,password}=ctx.request.body;
  let user=await Users.findOne({email});
  if(user){
    let res=await bcrypt.compare(password, user.password)
    if(!res){
      ctx.body={
        code:200,
        msg:"error",
        data:"用户名或密码错误"
      }
    }
    const token = await jwt.sign({user}, privateKey,{expiresIn:3600});
    ctx.body={
      code:200,
      msg:"successs",
      token
    }
  }else{
      ctx.body={
        code:200,
        msg:"error",
        data:"用户名不存在"
      }
  }

})
router.get('current',passport.authenticate('jwt',{session:false}),async (ctx,next)=>{
  ctx.body={
    code:200,
    msg:"error",
    data:ctx.request.body.name
  }
})

module.exports = router
