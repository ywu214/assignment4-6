const express= require("express");
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const p_routes = require('./public/js/script');

//添加run文件
const app = express();
app.use(express.static('public'))

//引擎模板handlebars
app.engine('handlebars', exphbs());
app.use(express.static('public'))
app.engine("handlebars",exphbs());
app.set('view engine', 'handlebars');

//开始编码
app.use(bodyParser.urlencoded({ extended: false }))

//开始执行那几个路由器
app.use("/", p_routes);
app.use("/",(req,res)=>{
    res.render("home");
});//加载

//链接mongoose
const DBURL= "mongodb+srv:";
mongoose.connect(DBURL, {useNewUrlParser: true})
.then(()=>{
    console.log(`Successfully connected to mongoDB database`);
})
.catch((err)=>{
    console.log(`Sorry, something occured :${err}`);
});

app.get("/",(req,res)=>{
    res.render("home")//加载
});

app.get("/add",(req,res)=>{
    res.render("add")//加载
});
//路由器处理界面
app.post("/add",(req,res)=>{
    const errors =[];
    if(req.body.title=="")
    {
        errors.push("Please enter Product yitle")
    }
    if(req.body.price=="")
    {
        errors.push("Please enter Product price")
    }
    if(req.body.quantitly=="")
    {
        errors.push("Please enter Product quantitly")
    }
    if(req.body.description=="")
    {
        errors.push("Please enter Product description")
    }
    //run结束，有问题join errors界面
      if(errors.length > 0)
      {

          res.render("add",
          {
             add:errors 
          })
      }
      //如果正确
      else
      {
          /*开始添加
         const accountSid = '添加SID';
         const authToken = '添加TOKEN';
         const client = require('twilio')(accountSid, authToken);
         
         client.addproduct
           .create({
              body: `${req.body.title}`,
              from: '',
              to: `${req.body.title}`
            })
           .then(add => console.log(message.sid))
           .catch(error => console.log(`${error}`));
        //
         const nodemailer = require('nodemailer');
         const sgTransport = require('nodemailer-sendgrid-transport');

         const options = {
            auth: {
                api_key: '添加API'
            }
        }

        const mailer = nodemailer.createTransport(sgTransport(options));

        const price = {
            to: `${req.body.price}`,
            from: '??',
            subject: 'Testing',
            text: `${req.body.add}`,
            html: `${req.body.add}`
        };
         
        mailer.sendMail(email, (err, res)=> {
            if (err) { 
                console.log(err) 
            }
            console.log(res);
        });*/
        //重新加载到路由页面（主页面）
           res.redirect("/home");
      }

});

//加载到主页面
app.get("/home",(req,res)=>
{
    res.render("userDashboard");
});

//设置监控路径3000
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Your Web Server has been connected`);
});