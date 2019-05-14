const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const {dbKeys,privateKey} = require('./constant/const')
const index = require('./routes/index')
const users = require('./routes/users')
const mongoose = require('mongoose')
const jwt=require('koa-jwt')
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))


// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
//passport
// app.use(passport.initialize());
// require('./config/passport')(passport)

//mongoose
mongoose.connect(dbKeys.mongodbUrl,{ useNewUrlParser: true })
    .then(()=>
      console.log("successful") )
    .catch((err)=>console.log(err))

//jwt
app.use(function(ctx, next){
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = 'Protected resource, use Authorization header to get access\n';
    } else {
      throw err;
    }
  });
});
app.use(jwt({ secret: privateKey })).unless({path:[/^\/login/]});

//environment
if(process.env.NODE_ENV=='dev'){
  console.log(process.env.NODE_ENV)
}else{
  console.log(process.env.NODE_ENV)
}

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
