let mongoose=require("mongoose");
let Listing =require("../models/listing.js");
let initData=require("./data.js");

 main()
 .then(function(){console.log("connection sucessfull")})
 .catch(function(err){console.log(err)})

 async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
 }

 //here we will insert data but before inserting we will clear all ,
 // random data present and then freshly intilaze new one

 async function initDb(){
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:'697bb7bd93bddb1b7a028efc'}))
    await Listing.insertMany(initData.data);
 }

 initDb();