let express = require("express");
let cookieParser = require('cookie-parser');
let app = express();
let PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-mokey-dinosaur"
  },
  "user2RandomID": {
    id: "user2randomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString(){
  return "12345".split('').map(function()
    {return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt
    (Math.floor(62*Math.random()));}).join('') + Math.floor(9*Math.random());
  //random link generator found online at stackoverflow "https://stackoverflow.com/questions/1349404
  ///generate-random-string-characters-in-javascript/26682781"
};

function getUserByEmail (email) {
  for (let userID in users) {
    let user = users[userID];
    console.log("one suer", user, email, user.email === email);
    let existingEmail = user.email;
    if (email === existingEmail){
      return user;
    }
  }
  return undefined;
};


//the root should eventually be the home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }

  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  res.render("registration_new");
});

app.get("/login", (req, res) =>{

  res.render("reg_login");

})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});





//adds a new object to the global users object
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Email or password empty');
    return
  }
  if (getUserByEmail(req.body.email))  {
    res.status(400).send('Email already exists');
    return
  }
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", randomID);
  res.redirect("/urls");
  console.log(users);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let newlongURL = req.body.longURL;
  urlDatabase[shortURL] = newlongURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL
  res.redirect("/urls");
});

app.post("/login", (req, res) => {

  const user = getUserByEmail(req.body.email);


  if (!user){
    res.status(403).send('Email not registered');
    return
  }

  //if the password that is given does not equal the password stored
  if (user.password !== req.body.password){
    res.status(403).send('Incorrect password');
    return
  }

  res.cookie('user_id', user.id);
  res.redirect("/");
});

app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
});








app.listen(PORT, () => {
  console.log(`Wow! ${PORT} is such a nice port!`);
});