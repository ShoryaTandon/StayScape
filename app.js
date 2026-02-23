if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
}    // loads safely and protect secret

// Conncting To database
let mongoose=require("mongoose");
const dbUrl=process.env.ATLASDB_URL;
 main()
 .then(function(){console.log("connection sucessfull")})
 .catch(function(err){console.log(err)})

 async function main(){
    // await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    await mongoose.connect(dbUrl);
 }
// Till here 
const multer  = require('multer'); // for file type od data save for img in new.ejs
const {storage}=require("./cloudConfig.js");

const upload = multer({ storage })  // bydefault created upload folder and save fil in that

const express=require("express");


let app=express();


const path =require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const methodOverride = require("method-override");//used to convert put patch delet
app.use(methodOverride("_method"));
 

// for authentication and user model
const passport=require("passport");
const LocalStrategy = require("passport-local");

//till here


 let Listing =require("./models/listing.js");//it requires schema model
 let Review=require("./models/review.js");
 let User=require("./models/user.js");
 let {listingSchema, reviewSchema} =require("./schema.js");// it rquires joi validation

  
 let wrapAsync=require("./utils/wrapAsync.js");//requiring asynWrap 
let ExpressError=require("./utils/ExpressError.js");// Handling Custom Error

const session=require("express-session");

const MongoStore = require("connect-mongo").default;
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET || "fallbacksecret",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("SESSION STORE ERROR:", err);
});


app.use(session({
  store:store,
  // secret:"mysecretkey",
   secret: process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  },
})); //keep this cookie alive for 7 days from now 


// midddleware for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
let {isLoggedIn} =require("./middlewar.js");
let {isOwner} =require("./middlewar.js");
let {saveRedirectUrl}=require("./middlewar.js");
let {isReviewAuthor}=require("./middlewar.js")


const flash = require("connect-flash");// to flash a message
app.use(flash());

app.use(function(req,res,next){
  res.locals.success=req.flash("success");
  // console.log(res.locals.success);
  res.locals.failure=req.flash("failure");
  res.locals.error = req.flash("error");
  res.locals.currentUser=req.user;
  next();
})



let ejsMate =require("ejs-mate");// used to common code in each ex navbar on each web page,avoid reduncy
app.engine("ejs",ejsMate);

// // Conncting To database
// let mongoose=require("mongoose");
// const dbUrl=process.env.ATLASDB_URL;
//  main()
//  .then(function(){console.log("connection sucessfull")})
//  .catch(function(err){console.log(err)})

//  async function main(){
//     // await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
//     await mongoose.connect(dbUrl);
//  }
// // Till here 

 
// Rest Api


//index route
app.get("/listings", wrapAsync (async function(req,res){
   const allListings=  await Listing.find({});
   res.render("./listings/index.ejs",{allListings});
//    console.log(AllListings);
    
})
)




//Add New

app.get("/listings/new" ,isLoggedIn,wrapAsync(async function(req,res){
  
   res.render("./listings/new.ejs");
})
)


app.post("/listings/new",

  isLoggedIn, 
  upload.single("image"),
  wrapAsync(async (req, res) => {
  const { error } = listingSchema.validate(req.body);   // joi validation for new
  if (error) {         
    throw new ExpressError(400, error.details[0].message);
  }
  //  File check
    if (!req.file) {
      throw new ExpressError(400, "Image is required");
    }

  const { listing } = req.body;
  const newListing = new Listing(listing);

  newListing.owner=req.user._id; // it stores current looged user in seesion in owner
   newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
   await newListing.save();
   req.flash("success","New Listing Added Successfully!");
   res.redirect("/listings");
}));



 
//show each route
app.get("/listings/:_id", wrapAsync(async function(req,res){
    const {_id}= req.params;
       const listing = await Listing.findById(_id)
        .populate("owner")   
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        });
    if(!listing){
      req.flash("failure","Requested Listing Does Not Exist!");
      return res.redirect("/listings");
    }
    else{
        //  console.log(listing);
        res.render("./listings/show.ejs",{listing});
    }
    
})
)


//update


// EDIT FORM
app.get("/listings/:id/edit",isLoggedIn,isOwner, wrapAsync (async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if(!listing){
      req.flash("failure","Requested Listing Does Not Exist!");
      return res.redirect(req.session.redirectUrl);
  }
  else{
      res.render("listings/edit.ejs", { listing });
  }
    
})
);

app.put(
  "/listings/:id",isLoggedIn,isOwner,
  upload.single("image"),
  wrapAsync(async (req, res) => {

    // Joi validation (text fields)
    const { error } = listingSchema.validate(req.body);
    if (error) {
      throw new ExpressError(400, error.details[0].message);
    }
    const { id } = req.params;
    const { listing } = req.body;

    // Get listing from DB
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        country: listing.country,
      },
       { new: true }
    );

    //  If image uploaded → update image
    if (req.file) {
      updatedListing.image = {
        url: req.file.path,       // Cloudinary URL
        filename: req.file.filename,
      };
      await updatedListing.save();
    }

    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
  })
);



//delete
app.delete("/listings/:id",isLoggedIn,isOwner,wrapAsync(async function(req,res){
    const {id}= req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings")
})
)
//review route




// review add

app.post("/listings/:id/reviews",isLoggedIn, wrapAsync(async function(req,res,next){

   const { error } = reviewSchema.validate(req.body);           //joi validation for edit
    if (error) {
        throw new ExpressError(400, error.details[0].message);
     }
   const { id } = req.params;
    const { review } = req.body;
   const listing = await Listing.findById(id);

   const newReview = new Review(review);


   newReview.author=req.user._id;
    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();
    console.log(listing);
    req.flash("success","Review Added Successfully!");
   
    res.redirect(`/listings/${req.params.id}`);
  

})
);

//delete review
app.delete("/listings/:id/reviews/:reviewid", isLoggedIn,isReviewAuthor, wrapAsync( async function(req,res){
              const {id,reviewid} = req.params;
              await Review.findByIdAndDelete(reviewid);
              await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
            req.flash("success","Review Deleted Successfully!");
             res.redirect(`/listings/${req.params.id}`);

})
);

//USER MODEL REQS

//signup
app.get("/signup",wrapAsync( async function(req,res){
  res.render("./users/signup.ejs");

})
);
app.post("/signup" ,wrapAsync(async function(req,res){
  try{
       let {email,username ,password}=req.body;
  const newUser =new User({email,username});
  await User.register(newUser,password);
  req.login(newUser,function(err){
    if(err){
      next(err);
    }

      req.flash("success","Welcome To StayScape");
       res.redirect("/listings")
  })
 
  }
  catch(e){
    req.flash("failure",e.message);
    res.redirect("/signup");

  }
 

}))


//login
app.get("/login",wrapAsync( async function(req,res){
  res.render("./users/login.ejs");

}))
app.post('/login', 
  saveRedirectUrl,
  passport.authenticate('local', { failureRedirect: '/login',failureFlash:true }),
  function(req, res) {
    req.flash("success","Welcome again!!");
    let redirectUrl=res.locals.redirectUrl||"/listings"
    res.redirect(redirectUrl);
  });
  //logout 

app.get("/logout",function(req,res,next){
    req.logout(function(err){
      if(err){
        next(err);
      }
      req.flash("success","Logged Out Successfully");
      res.redirect("/listings");
    });
    
});

//Passport-local sends flash messages to the error key by default.






//Error Handling Middleware

app.use(function(req,res,next){
    next(new ExpressError(404,"Page Not Found"));
})



app.use(function(err, req, res, next){
    let {status = 500, message = "Something went wrong"} = err;
    res.status(status).render("listings/error.ejs", { err });
});


 port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is ready on port ${port}`);
});