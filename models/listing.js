let mongoose =require("mongoose");
const Schema = mongoose.Schema;
 let Review=require("../models/review.js");

const listSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
        minlength:10   // ~10 words minimum 60 are character make approx 10 words
       
    }, 
    // shrada di used set() using ternary opeartor instead if default 
    image :{
    filename: String,
    url: {
      type: String,
      default:
        "https://plus.unsplash.com/premium_photo-1724818361335-291394c25925"
         ,set: v => v === "" ? undefined : v
    }
  },
    // type:String,
    //     default:"https://plus.unsplash.com/premium_photo-1724818361335-291394c25925?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    //     set:function(v){
    //         v===""
    //         ?"https://plus.unsplash.com/premium_photo-1724818361335-291394c25925?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    //         :v
    //     }
    price:{
        type:Number,
        min:1,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
})

listSchema.post("findOneAndDelete",async function(listing){
    if(listing){
       await Review.deleteMany(
            {_id:{$in:listing.reviews}}
        );
    }
})

const Listing=mongoose.model("Listing",listSchema);
module.exports = Listing;
