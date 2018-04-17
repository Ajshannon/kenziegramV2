const express = require('express');
const multer = require('multer');
const path = require('path');
const port = 3000;
const uploaded_files = [];
const fs = require('file-system');

// Set Storage Engine

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        //myname 
        //path.extname(file.originalname) - this will give the file its own original file ext.s AKA. a png will get a .png ext. yada yada
        //Date.now() will add the date and time to the name of the file, this will prevent an error if two of the same image is uploaded
    }
  });


//Init upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
        //this is going to take the file from the request and filter it
        checkFileType(file, cb);
    }
}).single('myImage');


//check file type
function checkFileType(file, cb){
    //Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    //check ext
    //will pass in the file extension name and match it to those below
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //check mime
    const mimetype = filetypes.test(file.mimetype);
    //now we need to check if both mimetype and extname are true

    if(mimetype && extname){
        return cb(null, true);
    } else {
        cb('Error: Images Only!');

    }
}
//init app
const app = express();


//EJS
app.set('view engine', 'ejs');

//Public Folder
app.use(express.static('public'));

// app.get('/', (req, res) => res.render('index'));

app.get('/', function (req, res) {
  const path = './public/uploads';
  fs.readdir(path, function (err, items) {
      console.log(items);
      let itemsImages = "";
      for (let i = 1; i < items.length; i++) {
          itemsImages += ("<img src='"+ "uploads/" + items[i] + "'>")
      }
      res.send(`
      <link rel="stylesheet" href="style.css">
      <h1>Welcome to Kenziegram!</h1>
      <form action="http://localhost:3000/upload" method="post" enctype="multipart/form-data">
          <input type="file" id="file" name="myFile">
          <input type="submit" id="submit" value="Upload">
      </form>
      <div id="images">${itemsImages}</div>`
      );
      // uploadMessage = "";
  });
})

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if(err){
        res.render('index', {
          msg: err
        });
      } else {
        if(req.file == undefined){
          res.render('index', {
            msg: 'Error: No File Selected!'
          });
        } else {
            console.log(req.file);
          res.render('index', {
            msg: 'File Uploaded!',
            file: `uploads/${req.file.filename}`
          });
        }
      }
    });
  });
  

app.listen(port, () => console.log(`Server started on port ${port}`));