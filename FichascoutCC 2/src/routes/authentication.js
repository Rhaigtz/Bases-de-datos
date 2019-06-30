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
  console.log(req.session.passport.user);
  const datosProfile = await pool.query('SELECT * FROM Personas WHERE personas.rut = ?',[req.session.passport.user]);
  const cantidadG = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Golondrinas"');
  const cantidadL = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Lobatos"');
  const cantidadC = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Lobatos"');
  const cantidadT = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Lobatos"');
  const cantidadA = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Lobatos"');
  const cantidadCL = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Lobatos"');

  console.log(datosProfile);
  res.render('profile', {datosProfile, cantidadG, cantidadL,cantidadC,cantidadT,cantidadA,cantidadCL});
});

module.exports = router;
