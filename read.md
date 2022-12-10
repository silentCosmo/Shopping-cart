npm init

npm install express
npx express-generator --view=hbs

apm audit fix --force

npm install express-handlebars

  remember--
    hbs function in app.js is changed to:
    app.engine('hbs', hbs.engine({extname.....