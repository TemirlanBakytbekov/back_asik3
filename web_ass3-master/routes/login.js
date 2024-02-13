const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://mustiksarva:table1234554321@mailing.qungyk9.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect();

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  try {
    const db = client.db("openWeather");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(400).send("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send("Invalid username or password");
    }

    req.session.username = user.username;

    if (user.isAdmin) {
      req.session.isAdmin = true;
    } else {
      req.session.isAdmin = false; 
    }

    if (req.session.isAdmin) {
      res.redirect("/admin");
    } else {
      res.redirect("/"); 
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
