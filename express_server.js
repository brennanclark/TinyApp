let express = require("express");
let app = express();
let PORT = 8080;

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://wwww.lighthouselabs.ca",
  "9sm5xK": "http://wwww.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
})

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) =>{
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Wow! ${PORT} is such a nice port!`);
});