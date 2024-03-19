const bcrypt =require("bcrypt");
const express=require('express');
const app=express();
const mysql=require('mysql');
const cors=require('cors');
const jwt = require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const multer =require('multer')

app.use(cors());
app.use(cookieParser());
app.use(express.json());

const db=mysql.createConnection({
    user:'root',
    host:'localhost',
    password:'123',
    database:'book',
})
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../client/public/upload')
    },
    filename: function (req, file, cb) {
      
      cb(null,Date.now() +file.originalname)
    }
  })
const upload =multer({storage})

app.post('/upload', upload.single('file'), function (req, res, ) {
    const file=req.file;
    res.status(200).json(file.filename)
   
  })

app.post('/server/upload', upload.single('file'), function (req, res, ) {
    const file=req.file;
    res.status(200).json(file.filename)
   
  })

app.post("/register",(req,res)=>{
    const q="SELECT * from user WHERE email=? OR username=?"
    db.query(q,[req.body.email,req.body.username],(err,data)=>{
       if (err) return res.status(500).json({ error: "Internal Server Error" });
       if (data.length) return res.status(409).json("User already exists");



       const salt=bcrypt.genSaltSync(10);
       const hash=bcrypt.hashSync(req.body.password,salt);
       const insertQuery="INSERT INTO user(`username`,`email`,`password`) VALUES (?, ?, ?)";
       const values=[
           req.body.username,
           req.body.email,
           hash,
       ];
       db.query(insertQuery, values, (err, data) => {
           if (err) return res.status(500).json({ error: "Internal Server Error" });
           return res.status(200).json("User has been created");
       });
    });
   });


   app.post('/login', (req, res) => {
    const q = "SELECT * FROM user WHERE username=?"
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.json(err);
        if (data.length === 0) return res.status(404).json("User not found!")

        const token = jwt.sign({ id: data[0].iduser }, "jwtkey")
        const { password, ...other } = data[0]
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }).status(200).json(other);
    })
});


app.post('/logout',(req,res)=>{
    res.clearCookie("access_token",{
    sameSite:"none",
    secure:true
 }).status(200).json("user has been logged out.")

    
})


app.post("/home",(req,res)=>{
    console.log(req.body);
    const q="Update home SET heading =? ,description=? Where idhome=?"
    const val=[req.body.heading,req.body.paragraph,1]
    db.query(q, val, (err, data) => {
      if (err){
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
      } 
      return res.status(200).json("User has been created");
  });
  
  })


  
  app.post("/feature", (req, res) => {
    console.log(req.body);
    const { heading, actualPrice, presentPrice, quantity, img, description } = req.body;
    
    // Insert into the `features` table
    const featureQuery = "INSERT INTO feature (heading, actual_price, present_price, quantity, img, description) VALUES (?, ?, ?, ?, ?, ?)";
    const featureValues = [heading, actualPrice, presentPrice, quantity, img, description];
    db.query(featureQuery, featureValues, (err, featureResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      // Insert into the `all_books` table
      const allBooksQuery = "INSERT INTO all_book (heading, actual_price, present_price, quantity, img, description) VALUES (?, ?, ?, ?, ?, ?)";
      const allBooksValues = [heading, actualPrice, presentPrice, quantity, img, description];
      db.query(allBooksQuery, allBooksValues, (err, allBooksResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        
        return res.status(200).json("Data inserted successfully");
      });
    });
  });
  app.post("/arrival", (req, res) => {
    const { heading, actualPrice, presentPrice, quantity, img, description } = req.body;
    
    // Insert into the `features` table
    const featureQuery = "INSERT INTO arrival (heading, actual_price, present_price, quantity, img, description) VALUES (?, ?, ?, ?, ?, ?)";
    const featureValues = [heading, actualPrice, presentPrice, quantity, img, description];
    db.query(featureQuery, featureValues, (err, featureResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      
      // Insert into the `all_books` table
      const allBooksQuery = "INSERT INTO all_book (heading, actual_price, present_price, quantity, img, description) VALUES (?, ?, ?, ?, ?, ?)";
      const allBooksValues = [heading, actualPrice, presentPrice, quantity, img, description];
      db.query(allBooksQuery, allBooksValues, (err, allBooksResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        
        return res.status(200).json("Data inserted successfully");
      });
    });
  });
  app.get('/getfeature', (req, res) => {
    const query = 'SELECT * FROM feature';
    db.query(query, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json(result);
    });
  });
  app.get('/getarrival', (req, res) => {
    const query = 'SELECT * FROM arrival';
    db.query(query, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json(result);
    });
  });
  

  app.delete('/deleteFeature/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM feature WHERE idfeature = ?';
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Row deleted successfully' });
    });
  });

  app.delete('/deletearrival/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM arrival WHERE idarrival = ?';
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Row deleted successfully' });
    });
  });
  

app.listen(3001,()=>{
    console.log("hey,running");
})