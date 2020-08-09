const fs = require('fs');
const DBService = require('./DBService.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonBodyParser = bodyParser('json');
app.use(jsonBodyParser);
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const jwt = require('jsonwebtoken');
const SECRET = 't5ry5r546lmklbvhohjip@r';
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Cookie = require('cookie');

var path = require('path');
app.use('/public/img', express.static(path.join(__dirname, '/public/img')));
app.use('/public/css', express.static(path.join(__dirname, '/public/css')));
/*app.use('/public/img/favicon.ico', express.static(path.join(__dirname, '/public/img/favicon.ico')));*/

app.listen(8000, function () {
  console.log('Сервер начал прослушивание запросов ');
});

app.get('/', function (request, response) {
  serveSPA(request, response, 'public/spa.html', 'text/html');
});
app.get('/panel', function (request, response) {
  serveSPA(request, response, 'public/spa.html', 'text/html');
});
app.get('/api/product', async function (request, response) {
  await serveOneProduct(request, response);
});
app.get('/product/:key_and_slug', function (request, response) {
  serveSPA(request, response, 'public/spa.html', 'text/html');
});
app.get('/api/login2', function (request, response) {
  response.cookie('user', 'spa@gmail.con', {
    path: '/',
    encode: String
  });
  response.sendStatus(200);
  response.end;
});
app.get('/api/bcrypt', async function (request, response) {
  const query = request.query;
  if (Object.keys(query).length > 0 && query.email !== undefined && query.password !== undefined) {
    const user = await DBService.getUserByEmail(query.email);
    user.passwordHash = await bcrypt.hash(query.password, saltRounds);
    response.sendStatus(200);
    await DBService.updateUser(user._id, user);
  } else {
    response.sendStatus(403);
  }
  response.end;
});
app.post('/api/login', async function (request, response) {
  let result = await getToken(response, request);
  response.json(result);
});
app.get('/api/me', verifyToken);
app.get('/api/me', async function (request, response) {
  response.send(request.email);
});
app.get('/public/bundle.js', function (request, response) {
  serveSPA(request, response, 'public/bundle.js', 'text/javascript');
});
app.put("/api/product/:id", verifyToken);
app.put('/api/product/:id', async function (request, response) {
  let result = await DBService.updateProduct(request.params.id, request.body);
  response.json(result);
});
app.post('/api/product',verifyToken);
app.post('/api/product', async function (request, response) {
  let result = await DBService.createProduct(request.body);
  response.json(result.ops[0]);

});
app.get('/api/products', async function (request, response) {
  await serveProducts(request, response);
});
app.use(serveNotFound);

async function getToken (response, request) {
  let users = await DBService.getUsers();
  response.status(200);
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    const payload = {
      email: user.email
    };
    const token = jwt.sign(payload, SECRET, {
      expiresIn: '5m'
    });
    const query = request.body;
    if (Object.keys(query).length > 0
      && query.login !== undefined
      && query.password !== undefined
      && query.login === user.email) {
      const result = await bcrypt.compare(query.password, user.passwordHash);
      if (result) {
        response.cookie('token', token, {
          path: '/',
          encode: String
        });
       // response.send('Токен авторизации создан для пользователя ' + user.name);
        return user;
      }
    } else {
      response.status(403);
      response.send('Неправильные данные для авторизации');
    }
  }
  response.end();
}

async function verifyToken (request, response, next) {
// const cookies = Cookie.parse(document.cookie);
  for (const [key, value] of Object.entries(request.cookies)) {
    if (key === 'token') {
      try {
       const payload = jwt.verify(value, SECRET);
      //  const payload = jwt.decode(cookies.token);
        if (payload.email !== null || payload.email !== undefined) {
          const user = await DBService.getUserByEmail(payload.email);
          if (user != null || user !== undefined) {
            request.email = user.email;
            next();
          } else {
            Error('Нет такого пользователя');
          }
        } else {
          Error('Нет e-mail');
        }
      } catch (err) {
        response.status(403).send({ err });
      }
    }
  }
  response.end;
}

function serveSPA (req, res, path, type) {
  console.log('serveSpa');
  res.setHeader('Content-Type', type);
  try {
    fs.readFile(path, function (err, data) {
      if (err) {
        console.log(err);
        throw new Error(err);
      }
      res.write(data);
      res.end(data, 'binary');
    });
  } catch (e) {
    console.log(e);
    serveNotFound(req, res, 404, 'Не найден файл' + type);
  }
}

function serveNotFound (req, res, code, message) {
  if (!message) {
    message = 'Not found ' + code;
  }
  console.log(message + code);
  res.send(message);
}

async function serveProducts (req, res) {
  let products;
  try {
    products = await DBService.getProducts();
    res.json(products);
  } catch (e) {
    serveNotFound(req, res, 500, 'Ошибка сервера');
  }
}

async function serveOneProduct (req, res/*, params*/) {
  let product;
  const parsed = req.query;
  let key = Object.getOwnPropertyNames(parsed)[0];
  try {
    let id = parsed[key];
    if (key === 'id') {
      if ((parseInt(id, 16) >= 0 || parseInt(id, 16) < 0) && unescape(encodeURIComponent(id)).length === 24) {
        product = await DBService.getProductById(id);
      } else {
        serveNotFound(req, res, 500, 'Ошибка сервера');
        return;
      }
    } else {
      product = await DBService.getProductByWhere(parsed);
    }
    res.json(product);
  } catch (e) {
    serveNotFound(req, res, 500, 'Ошибка сервера');
  }

}


