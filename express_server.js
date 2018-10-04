let express = require("express");
let cookieParser = require('cookie-parser');
let app = express();
let PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString(){
  return "12345".split('').map(function()
    {return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt
    (Math.floor(62*Math.random()));}).join('') + Math.floor(9*Math.random());
  //random link generator found online at stack overflow "https://stackoverflow.com/questions/1349404
  ///generate-random-string-characters-in-javascript/26682781"
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", ())

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();

  let newlongURL = req.body.longURL;
  urlDatabase[shortURL] = newlongURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");

})

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }

  res.render("urls_new",templateVars);
});


app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id] = req.body.newURL

  res.redirect("/urls");

});

app.post("/login", (req, res) => {

  res.cookie('username', req.body.username);
  res.redirect("/urls");

})


app.post("/urls/:id/delete", (req, res) =>{

  delete urlDatabase[req.params.id];

  res.redirect("/urls")

})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Wow! ${PORT} is such a nice port!`);
});