const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', async (req, res) => {
    var misdatosP =  await pool.query('SELECT * FROM Personas WHERE personas.rut = ?',[req.session.passport.user]);
    console.log('vamos a ver donde entro');
    if(misdatosP[0] != null)
    {
        console.log('ya tengo datos');
        res.redirect('/profile');
    }
    else{
        console.log('no tengo datos');
        res.render('links/add');
    }
});

router.post('/add', async (req, res) => {
    rutt1 =  req.session.passport.user;
    const { nombre, apellido, sexo, poblacion, calle, numero_c, ciudad, fecha_nac, lugar_nac, unidad, grupo, ciudad_grupo, distrito, rut_dirigente1, rut_dirigente2, rut_dirigente3 } = req.body;
    const newDatos = {
        rut: rutt1,
        nombre,
        apellido,
        sexo,
        poblacion,
        calle,
        numero_c,
        ciudad,
        fecha_nac,
        lugar_nac,
        unidad,
        grupo, 
        ciudad_grupo,
        distrito,
        rut_dirigente1,
        rut_dirigente2,
        rut_dirigente3
    };
    console.log(newDatos);
    await pool.query('INSERT INTO personas set ?', [newDatos]);
    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});

router.get('/addMedica', async (req, res) => {
    var misdatosF =  await pool.query('SELECT * FROM ficha WHERE ficha.rut = ?',[req.session.passport.user]);
    console.log(misdatosF);
    if(misdatosF[0] == null){
        console.log('No hay datos, a rellenar');
        res.render('links/addMedica');
    }
    else{
        console.log('hay datos, asi que añadir detalles')
        var misdatosEx = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ?',[req.session.passport.user]);
        res.render('links/extra', { misdatosEx });
    }
});

router.post('/addMedica', async (req, res) => {
    rutt1 =  req.session.passport.user;
    const { sangre, telefono_eme, nombre_tel_eme, estatura, peso, prevision, seguro, institucion, fecha_u_cd, contacto_medi, nombre_medi, consultorio } = req.body;
    const newDatosficha = {
        rut: rutt1,
        sangre,
        telefono_eme,
        nombre_tel_eme,
        estatura,
        peso,
        prevision,
        seguro,
        institucion,
        fecha_u_cd,
        contacto_medi,
        nombre_medi,
        consultorio
    };
    await pool.query('INSERT INTO ficha set ?', [newDatosficha]);
    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});


// para mostrar las personas de mi unidad
router.get('/miunidad', isLoggedIn, async (req, res) => {
    console.log(req.session.passport.user);
    const links = await pool.query('SELECT * FROM Personas WHERE personas.rut_dirigente1 = ?',[req.session.passport.user]);
    console.log(links);
    res.render('links/miunidad', { links });
});
// despues para mirar su ficha
router.get('/ficha/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log('La persona que se quiere visitar es....');
    console.log(id);
    var rutDirigente = req.session.passport.user;
    console.log('La persona que Tiene la Secion abierta es....');
    console.log(rutDirigente);
    console.log('Comprobando si Tienes Acceso')
    var dir1 = await pool.query('SELECT personas.rut_dirigente1 FROM personas WHERE personas.rut = ?', [id]);
    console.log(dir1);
    var dir2 = await pool.query('SELECT personas.rut_dirigente2 FROM personas WHERE personas.rut = ?', [id]);
    console.log(dir2);
    var dir3 = await pool.query('SELECT personas.rut_dirigente3 FROM personas WHERE personas.rut = ?', [id]);
    console.log(dir3);
    if(rutDirigente== id|| dir1||dir2||dir3){
        var links = await pool.query('SELECT * FROM personas, ficha WHERE personas.rut = ficha.rut AND personas.rut = ?', [id]);
        var medi = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Medicamentos"', [id]);
        var ale = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Alergias"', [id]);
        var int = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Intolerancia"', [id]);
        var enf = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Enfermedad"', [id]);
        var tra = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Traumatico"', [id]);
        var psi = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Psicologico"', [id]);
    }
    else{
        console.log('no tengo derechos de entrar');
        var links = null;
    }
    console.log('holi voy a ver la ficha de mis scouts');
    console.log(links);
    if(links[0]== null)
    {
        console.log('Te redireccionamos ya que no tienes gente a cargo');
        res.redirect('/profile')
    }
    else{
        console.log('Los datos de Tu Scout Son');
        res.render('links/ficha', { links, medi, ale, int, enf, tra, psi });
    }
});


router.get('/', isLoggedIn, async (req, res) => {
    console.log(req.session.passport.user);
    const links = await pool.query('SELECT * FROM Personas WHERE personas.rut = ?',[req.session.passport.user]);
    console.log(links);
    res.render('links/list', { links });
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM personas WHERE personas.rut = ?', [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const rutedit = req.session.passport.user;
    const rutdir1 = await pool.query('SELECT personas.rut_dirigente1 FROM personas WHERE personas.rut = ?', [id]);
    const rutdir2 = await pool.query('SELECT personas.rut_dirigente2 FROM personas WHERE personas.rut = ?', [id]);
    const rutdir3 = await pool.query('SELECT personas.rut_dirigente3 FROM personas WHERE personas.rut = ?', [id]);
    if(id==rutedit || rutedit==rutdir1 || rutedit==rutdir2 || rutedit==rutdir3)
    {
        console.log('entre en el IF y soy dirigente o yo mismo....')
        const editando = await pool.query('SELECT * FROM personas WHERE personas.rut = ?', [rutedit]);
        console.log('holi');
        console.log(editando);
        res.render('links/edit', { editando });
    }
    else{
        res.redirect('/profile');
    }
});

router.post('/edit/:rut', async (req, res) => {
    const { rut } = req.params;
    var rutt = rut;
    console.log(rutt);
    const { nombre, apellido, sexo, poblacion, calle, numero_c, ciudad, fecha_nac, lugar_nac, unidad, grupo, ciudad_grupo, distrito,rut_dirigente1,rut_dirigente2,rut_dirigente3 } = req.body;
    const newLink = {
        rut: rutt,
        nombre,
        apellido,
        sexo,
        poblacion,
        calle,
        numero_c,
        ciudad,
        fecha_nac,
        lugar_nac,
        unidad,
        grupo, 
        ciudad_grupo,
        distrito,
        rut_dirigente1,
        rut_dirigente2,
        rut_dirigente3
    };
    console.log('los datos recibidos son.......');
    console.log(newLink);
    await pool.query('UPDATE personas set ? WHERE personas.rut = ?', [newLink, rutt]);
    req.flash('success', 'Datos Personales Actualizados');
    res.redirect('/links');
});

router.get('/editMedica/:rut', async (req, res) => {
    const { rut } = req.params;
    console.log('hola llamaron a Editar Ficha medica....');
    console.log(rut);
    const rutedit = req.session.passport.user;
    const rutdir1 = await pool.query('SELECT personas.rut_dirigente1 FROM personas WHERE personas.rut = ?', [rut]);
    const rutdir2 = await pool.query('SELECT personas.rut_dirigente2 FROM personas WHERE personas.rut = ?', [rut]);
    const rutdir3 = await pool.query('SELECT personas.rut_dirigente3 FROM personas WHERE personas.rut = ?', [rut]);
    if( rut==rutedit || rutedit == rutdir1 || rutedit == rutdir2 || rutedit == rutdir3 ){
        console.log('entre en el IF y soy dirigente o yo mismo....')
        const editandoM = await pool.query('SELECT * FROM ficha WHERE ficha.rut = ?', [rutedit]);
        console.log('holi');
        console.log(editandoM);
        res.render('links/editMedica', { editandoM });
    }
    else{
        res.redirect('/profile');
    }
});

router.post('/editMedica/:rut', async (req, res) => {
    var { rut } = req.params;
    console.log('Actualizando DATOS.....');
    console.log(rut);
    var rutt = rut;
    console.log(rutt);
    const { sangre, telefono_eme, nombre_tel_eme, estatura, peso, prevision, seguro, institucion, fecha_u_cd, contacto_medi, nombre_medi, consultorio } = req.body;
    const newDatosfichaE = {
        rut: rutt,
        sangre,
        telefono_eme,
        nombre_tel_eme,
        estatura,
        peso,
        prevision,
        seguro,
        institucion,
        fecha_u_cd,
        contacto_medi,
        nombre_medi,
        consultorio
    };
    console.log('los datos recibidos son.......');
    console.log(newDatosfichaE);
    await pool.query('DELETE FROM ficha WHERE ficha.rut= ?', [rutt]);
    await pool.query('INSERT INTO ficha set ?', [newDatosfichaE]);
    req.flash('success', 'Ficha Medica Actualizada');
    res.redirect('/links');
});

router.get('/beneficiariosunidad', isLoggedIn, async (req, res) => {
    var yo = req.session.passport.user;
    var misdatos = await pool.query('SELECT * FROM personas WHERE personas.rut = ?', [yo]);
    console.log(misdatos);
    console.log('ahora mi ciudad es');
    console.log(misdatos[0].ciudad);
    const links = await pool.query('SELECT * FROM Personas WHERE personas.ciudad_grupo = ? AND personas.grupo = ? AND personas.unidad = ?',[misdatos[0].ciudad_grupo, misdatos[0].grupo, misdatos[0].unidad]);
    console.log(links);
    res.render('links/beneficiariosunidad', { links });
});

router.get('/addExtra', async (req, res) => {
    console.log('render ADD EXTRA');
    res.render('links/addExtra');
});

router.post('/addExtra', async (req, res) => {
    rutt1 =  req.session.passport.user;
    const { opcion , especifique } = req.body;
    var tipoo='';
    console.log('Opcion Vale:');
    console.log(opcion);
    if(opcion == 'Medicamentos')
    {
        console.log('estoy en Medicamentos');
        tipoo= "Medicamentos";
    }
    if(opcion == 'MedicamentosAlergia' || 'Plantas' || 'Alimentos' || 'Otra Alergia')
    {
        console.log('estoy en Alergias');
        console.log(opcion);
        tipoo= "Alergias";
    }
    if(opcion == 'Lactosa' || 'Gluten' || 'Otra Intolerancia')
    {
        console.log('estoy en Intolerancia');
        tipoo= "Intolerancia";
    }
    if(opcion == 'Litiasis' || 'Tiroides' || 'Epilepcia' || 'Diabetes1' || 'Diabetes2' || 'Asma' || 'Hipertension' || 'Cardiaca' || 'Otra Enfermedad')
    {
        console.log('estoy en Enfermedad');
        tipoo= "Enfermedad";
    }
    if(opcion == 'Fractura' || 'Esguinse' || 'Luxacion' || 'Otra Traumatico')
    {
        console.log('estoy en Traumatico');
        tipoo= "Traumatico";
    }
    if(opcion == 'Psicologico')
    {
        console.log('estoy en Psicologico');
        tipoo= "Psicologico";
    }
    if (opcion == undefined)
    {
        console.log('estoy en Undefined');
        console.log('Opcion no me llega valor')
    }
    const newEsp = {
        rut: rutt1,
        tipo : tipoo,
        opcion,
        especifique
    };
    console.log(newEsp);
    await pool.query('INSERT INTO especifique set ?', [newEsp]);
    req.flash('success', 'Datos Guardados Correctamente');
    res.redirect('/links');
});
// Vamos a crear el filtrador en base a "miunidad"
router.get('/filtrador', isLoggedIn, async (req, res) => {
    console.log(req.session.passport.user);
    const links = await pool.query('SELECT * FROM Personas WHERE personas.rut_dirigente1 = ?', [req.session.passport.user]);
    console.log(links);
    res.render('links/filtrador', { links });
});

router.get('/filtrador',isLoggedIn , async(req,res) => {
    console.log(req.session.passport.user);
    const links = await pool.query('SELECT especifique.tipo from especifique, ficha where especifique.rut = ficha.rut');
    console.log(links[0].tipo);
    const linksa = links[0]
    res.render('links/filtrador', { linksa });
    
});

//Para ver los medicamentos
router.get('/medicamentos', isLoggedIn, async(req,res) =>{
    var rutDirigente = req.session.passport.user;
    console.log('La persona que Tiene la Secion abierta es....');
    console.log(rutDirigente);
    var medi = await pool.query('SELECT * FROM especifique,personas WHERE personas.rut_dirigente1 =? AND personas.rut=especifique.rut AND Especifique.tipo="Medicamentos"',[rutDirigente]);
    res.render('links/medicamentos', {medi});
});

module.exports = router;
