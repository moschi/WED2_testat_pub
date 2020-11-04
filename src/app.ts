import createError = require('http-errors');
import express = require('express');
import path = require('path');
import cookieParser = require('cookie-parser');
import logger = require('morgan');
import sassMiddleware = require('node-sass-middleware');
import indexRouter = require('./routes/index');
import tasksRouter = require('./routes/tasks');
import hbs from 'hbs';
import { builtinModules } from 'module';

const app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper('times', function (n, block) {
  let accum = '';
  for (let i = 0; i < n; ++i) accum += block.fn(i);
  return accum;
});
hbs.registerHelper('iflistempty', function (list) {
  return list.lenght == 0;
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true,
  }),
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter as express.Application);
app.use('/tasks', tasksRouter as express.Application);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(() => (err: any, req: express.Request, res: express.Response) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export = app;
