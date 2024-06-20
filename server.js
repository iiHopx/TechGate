const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
var sessions = require('express-session');
app.use(sessions({ secret: "thisismysecrctekeyfhrgfgrfrty84fwir767", saveUninitialized: true, resave: false }));

app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static('images'));
    const bodyParser = require('body-parser');
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "techgate"
});


app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/buy', function (req, res) {
    var rol= req.session.userrole;
    if (rol == 'customer')
    res.sendFile(path.join(__dirname, 'buy.html'));
    else
    res. redirect ('login'); 
});
app.get('/registration', function (req, res) {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

app.get('/search', function (req, res) {
    res.sendFile(path.join(__dirname, 'search.html'));
});
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, 'login.html'));
});
app.get('/ourproduct', function (req, res) {
    res.sendFile(path.join(__dirname, 'ourproduct.html'));
});
app.get('/manage', function (req, res) {
    var rol= req.session.userrole;
    if (rol == 'admin')
    res.sendFile(path.join(__dirname, 'manage.html'));
    else
    res. redirect ('login'); 
});



app.get('/cart', function (req, res) {
    var rol= req.session.userrole;
    if (rol == 'customer')
    res.sendFile(path.join(__dirname, 'cart.html'));
    else
    res. redirect ('login'); 
});


app.post('/process_registration', function (req, res) {
    var nn = req.body.na;
    var pp = req.body.pa;
    var ee = req.body.em;

    var sql = "INSERT INTO users(username, password, role, email) VALUES ('" + nn + "','" + pp + "','customer','" + ee + "')";
    con.query(sql, function () {
        req.session.username = nn;
        req.session.userrole = 'customer';
        res.redirect('home');
    });
});
app.get('/home', function (req, res) {
    session = req.session;
    var na = session.username;

    res.render('home', { name: na });
});


app.post('/loginprocess', function (req, res) {
    var nn = req.body.name;
    var pp = req.body.pass;
    var sql = "select * from users where username = '" + nn + "' and  password = '" + pp + "' ";
    con.query(sql, function (err, rows) {
        if (rows.length > 0) {
            req.session.username = rows[0].username;
            req.session.userrole = rows[0].role;
            res.redirect('home');
        }
        else
            res.end("wrong username or password");
    });
})


app.post('/process_insert', function (req, res) {
    var title = req.body.title;
    var price = req.body.price;
    var cata = req.body.cata;
    var description = req.body.description;


    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    var sampleFile = req.files.upfile;
    var uploadPath;
    uploadPath = process.cwd() + '/images/' + sampleFile.name;
    sampleFile.mv(uploadPath, function (err) {
        if (err)
            return res.status(500).send(err);
    });
    var sql = "INSERT INTO items( title, description, price, cata,image) VALUES ('" + title + "','" + description + "','" + price + "' ,'" + cata + "','" + sampleFile.name + "')";
    con.query(sql, function (err, result) {
        if (result.affectedRows > 0) res.send(" successfully inserted ");
        else res.send(" item not insert ");
    })
})
app.get('/index', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
 })
 app.get('/process_index', function (req, res) {
    var sql = "select * from items";
    con.query(sql,function (err, rows, fields) {    
     res.end(JSON.stringify(rows))
     });
 })
 app.get('/delete', function (req, res) {
    res.sendFile(__dirname + "/" + "delete.html");
})

app.delete('/process_delete', function (req, res) {
    var tt = req.query.title;
    let message = "";
    var sql = "delete from items where title= '" + tt + "' ";
    con.query(sql, function (err, result) {
        if (result.affectedRows > 0) res.send(" sucessfully deleted ");
        else res.end(" item not deleted ");
    });
})
app.get('/detail', function (req, res) {
    res.sendFile(__dirname + "/" + "detail.html");
})

    app.get('/process_detail', function (req, res) {

    var tt = req.query.id;
    var sql = "Select * from items where id= '" + tt + "' ";
    con.query(sql, function (err, rows, fields) {
        res.end(JSON.stringify(rows[0]))
    });        
    })
    app.get('/process_search', function (req, res) {
        var title = req.query.title; 
        
        var sql = "SELECT * FROM items WHERE title = '" + title + "'";
        con.query(sql, function (err, rows, fields) {
            if (rows.length > 0) {
                res.json(rows[0]);
            } else {
                res.status(404).send("No information found for the specified title.");
            }
        });
    });
    
    
    app.post('/process_buy', function (req, res) {
        var nn = req.body.custName; 
        var totals = req.body.total;
        var currentDate = req.body.ordate;
    
        var sql = "INSERT INTO ordr (custname, total, ordate) VALUES ('" + nn + "', '" + totals + "', '" + currentDate + "')";
        con.query(sql, function (err, result) {
            if (result.affectedRows > 0) {
                res.redirect('/home');
            } else {
                res.status(500).send("Failed to insert order.");
            }
  
        });
    });
    
    app.put('/process_update', function (req, res) {
        var id = req.body.id;
        var ti = req.body.title;
        var pr = req.body.price;
        var ca = req.body.cata;
        var de = req.body.description;

        var sql = "update  items  set title = '" + ti + "', description = '" + de + "', price = '" + pr + "' , cata = '" + ca + "' where  id ='" + id + "'";
        con.query(sql, function (err, result) {
        if (result.affectedRows > 0) res.send(" sucessfully updated ");
        else res.end(" items not updated ");
    });        
    })
   
app.listen(5000, function () {
});
