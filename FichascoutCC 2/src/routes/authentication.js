const express = require('express');
const router = express.Router();

const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const pool = require('../database');

// SIGNUP
router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', isNotLoggedIn , passport.authenticate('local.signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

// SINGIN
router.get('/signin', isNotLoggedIn, (req, res) => {
  res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn ,(req, res, next) => {
  req.check('username', 'Username is Required').notEmpty();
  req.check('password', 'Password is Required').notEmpty();
  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash('message', errors[0].msg);
    res.redirect('/signin');
  }
  passport.authenticate('local.signin', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', isLoggedIn,(req, res) => {
  req.logOut();
  res.redirect('/');
});

router.get('/profile', isLoggedIn, async (req, res) => {
  console.log(req.session.passport);
  const datosProfile = await pool.query('SELECT * FROM Personas WHERE personas.rut = ?',[req.session.passport.user]);
  console.log('estoy aquiiii');
  const gruposki = await pool.query('SELECT grupo from personas where personas.rut = ?', [req.session.passport.user]);
  console.log('esta persona pertenece al grupo....')
  console.log(gruposki);
  if(gruposki[0]==undefined)
  {
    res.redirect('/links');
  }
  else{
    console.log(gruposki[0].grupo);
    const cantidadG = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Golondrinas" AND personas.grupo = ?', [gruposki[0].grupo]);
    const cantidadL = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Lobatos" AND personas.grupo = ?', [gruposki[0].grupo]);
    const cantidadC = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Compañia" AND personas.grupo = ?', [gruposki[0].grupo]);
    const cantidadT = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Tropa" AND personas.grupo = ?', [gruposki[0].grupo]);
    const cantidadA = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Avanzada" AND personas.grupo = ?', [gruposki[0].grupo]);
    const cantidadCL = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Clan" AND personas.grupo = ?', [gruposki[0].grupo]);
    console.log(cantidadG);
    console.log(cantidadL);
    console.log(cantidadC);
    console.log(cantidadT);
    console.log(cantidadA);
    console.log(cantidadCL);
    console.log(datosProfile);
    res.render('profile', {datosProfile, cantidadG, cantidadL,cantidadC,cantidadT,cantidadA,cantidadCL});
  }
  
});

module.exports = router;
