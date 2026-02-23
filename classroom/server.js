const express =require("express");
let app= express();
let port =3000;
const session =require("express-session");
const flash = require("connect-flash");
app.use(session({secret:"myKey"}));
app.use(flash());

const path =require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.get("/test",function(req,res){
//     res.send("Its working");
// })

// app.get("/reqcount",function(req,res){
//     if(req.session.count){
//         req.session.count++;
//     }
//     else{
//         req.session.count=1;
//     }
//     res.send(`req sent ${req.session.count} times`);
// })

app.get("/register",function(req,res){
    let{name="anonymous"}=req.query;
    req.session.name=name;
    if(req.session.name==="anonymous"){
           req.flash("failure", "Registered Not successfully!");
    }
    else{
            req.flash("success", "Registered successfully!");
    }
    res.redirect("/hello");
})
app.get("/hello",function(req,res){
    res.locals.Smessages=req.flash("success");
    res.locals.Fmessages=req.flash("failure");
    res.render("page.ejs",{name:req.session.name});
})

app.listen(port,function(req,res){
    console.log("server is ready");

})