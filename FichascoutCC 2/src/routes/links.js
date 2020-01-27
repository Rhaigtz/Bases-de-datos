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
    console.log('probando');
    console.log(misdatosF);
    if(misdatosF[0] == null){
        console.log('No hay datos, a rellenar');
        res.render('links/addMedica');
    }
    else{
        console.log('hay datos, asi que añadir detalles')
        res.redirect('/profile');
    }
});

router.post('/addMedica', async (req, res) => {
    rutt1 =  req.session.passport.user;
    const { sangre, sangregrupo, telefono_eme, nombre_tel_eme, estatura, peso, prevision, grupo_prevision, seguro, institucion, fecha_u_cd, contacto_medi, nombre_medi, consultorio, embarazada, embarazo_ant, fur } = req.body;
    const newDatosficha = {
        rut: rutt1,
        sangre,
        sangregrupo,
        telefono_eme,
        nombre_tel_eme,
        estatura,
        peso,
        prevision,
        grupo_prevision,
        seguro,
        institucion,
        fecha_u_cd,
        contacto_medi,
        nombre_medi,
        consultorio,
        embarazada,
        embarazo_ant, 
        fur
    };
    await pool.query('INSERT INTO ficha set ?', [newDatosficha]);
    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});


// para mostrar las personas de mi unidad
router.get('/miunidad', isLoggedIn, async (req, res) => {
    console.log('buenas');
    var yo = req.session.passport.user;
    console.log(yo);
    const links = await pool.query('SELECT * FROM Personas WHERE personas.rut_dirigente1 = ? OR personas.rut_dirigente2 = ? OR personas.rut_dirigente3 = ?', [yo, yo, yo]);
    const gruposki = await pool.query('SELECT grupo from personas where personas.rut = ?', [yo]);
    console.log(gruposki);
    console.log(links);
    if (links[0] !== undefined && gruposki[0] !== undefined ) {
        var unidadP = await pool.query('SELECT * FROM Personas, region WHERE personas.distrito = region.distrito_nombre AND personas.rut = ?',[yo]);
        var cantidadClan = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Clan" AND personas.grupo = ?  AND (personas.rut_dirigente1 = ? OR personas.rut_dirigente2 = ? OR personas.rut_dirigente3 = ?)', [gruposki[0].grupo, yo, yo, yo]);
        console.log(cantidadClan);
        var cantidadAvanzada = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Avanzada" AND personas.grupo = ?  AND (personas.rut_dirigente1 = ? OR personas.rut_dirigente2 = ? OR personas.rut_dirigente3 = ?)', [gruposki[0].grupo, yo, yo, yo]);
        console.log(cantidadAvanzada);
        var cantidadCompañia = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Compañia" AND personas.grupo = ?  AND (personas.rut_dirigente1 = ? OR personas.rut_dirigente2 = ? OR personas.rut_dirigente3 = ?)', [gruposki[0].grupo, yo, yo, yo]);
        console.log(cantidadCompañia);
        var cantidadTropa = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Tropa" AND personas.grupo = ?  AND (personas.rut_dirigente1 = ? OR personas.rut_dirigente2 = ? OR personas.rut_dirigente3 = ?)', [gruposki[0].grupo, yo, yo, yo]);
        console.log(cantidadTropa);
        var cantidadLobatos = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Lobatos" AND personas.grupo = ?  AND (personas.rut_dirigente1 = ? OR personas.rut_dirigente2 = ? OR personas.rut_dirigente3 = ?)', [gruposki[0].grupo, yo, yo, yo]);
        console.log(cantidadLobatos);
        var cantidadGolondrinas = await pool.query('SELECT count(*) as total from personas where personas.unidad = "Golondrinas" AND personas.grupo = ?  AND (personas.rut_dirigente1 = ? OR personas.rut_dirigente2 = ? OR personas.rut_dirigente3 = ?)', [gruposki[0].grupo, yo, yo, yo]);
        console.log(cantidadGolondrinas);
        res.render('links/miunidad', { links, unidadP, cantidadClan, cantidadAvanzada, cantidadCompañia, cantidadTropa, cantidadLobatos,cantidadGolondrinas});
    }
    else {
        res.redirect('/profile');
    }
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
    if (rutDirigente == id || dir1 || dir2 || dir3) {
        console.log('Si tienes Acceso a esta persona....');
        var links = await pool.query('SELECT * FROM personas, ficha WHERE personas.rut = ficha.rut AND personas.rut = ?', [id]);
        var medi = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Medicamentos"', [id]);
        var ale = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Alergias"', [id]);
        var int = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Intolerancia"', [id]);
        var enf = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Enfermedad"', [id]);
        var tra = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Lesion"', [id]);
        var psi = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Psicologico"', [id]);
        var ope = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Operacion/Cirugia"', [id]);
        var con = await pool.query('SELECT * FROM especifique WHERE especifique.rut = ? AND especifique.tipo="Habito/Consumo"', [id]);
    }
    else{
        console.log('no tengo derechos de entrar');
        var links = null;
    }
    console.log('holi voy a ver la ficha de mis scouts');
    console.log(links);
    if(links == null)
    {
        console.log('Te redireccionamos ya que no tienes gente a cargo');
        res.redirect('/profile');
        req.flash('success', 'La persona aun no a creado su ficha');
    }
    else{
        console.log('Los datos de Tu Scout Son');
        res.render('links/ficha', { links, medi, ale, int, enf, tra, psi, ope, con });
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
    const rutedit = req.session.passport.user;
    const rutdir1 = await pool.query('SELECT personas.rut_dirigente1 FROM personas WHERE personas.rut = ?', [id]);
    const rutdir2 = await pool.query('SELECT personas.rut_dirigente2 FROM personas WHERE personas.rut = ?', [id]);
    const rutdir3 = await pool.query('SELECT personas.rut_dirigente3 FROM personas WHERE personas.rut = ?', [id]);
    if(id==rutedit || rutedit == rutdir1 || rutedit == rutdir2 || rutedit == rutdir3)
    {
        console.log('tienes lo permisos');
        console.log('procederemos a borrar');
        await pool.query('DELETE FROM personas WHERE personas.rut = ?', [id]);
        req.flash('success', 'Link Removed Successfully');
        res.redirect('/links');
    }
    else{
        console.log('NOOO tienes lo permisos');
        res.redirect('/profile');
    }
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const rutedit = req.session.passport.user;
    const rutdir1 = await pool.query('SELECT personas.rut_dirigente1 FROM personas WHERE personas.rut = ?', [id]);
    const rutdir2 = await pool.query('SELECT personas.rut_dirigente2 FROM personas WHERE personas.rut = ?', [id]);
    const rutdir3 = await pool.query('SELECT personas.rut_dirigente3 FROM personas WHERE personas.rut = ?', [id]);
    if( rutedit == id || rutedit == rutdir1 || rutedit == rutdir2 || rutedit == rutdir3)
    {
        console.log('entre en el IF y soy dirigente o yo mismo....')
        const editando = await pool.query('SELECT * FROM personas WHERE personas.rut = ?', [rutedit]);
        console.log('holi');
        console.log(editando);
        res.render('links/edit', { editando });
    }
    else{
        console.log('No tienes los Permisos Necesarios.....')
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
    console.log(rutedit);
    const rutdir1 = await pool.query('SELECT personas.rut_dirigente1 FROM personas WHERE personas.rut = ?', [rut]);
    const rutdir2 = await pool.query('SELECT personas.rut_dirigente2 FROM personas WHERE personas.rut = ?', [rut]);
    const rutdir3 = await pool.query('SELECT personas.rut_dirigente3 FROM personas WHERE personas.rut = ?', [rut]);
    if( rutedit == rut || rutdir1 || rutdir2 || rutdir3 ){
        console.log('entre en el IF y soy dirigente o yo mismo....')
        const editandoM = await pool.query('SELECT * FROM ficha WHERE ficha.rut = ?', [rut]);
        console.log('holi');
        console.log(editandoM);
        res.render('links/editMedica', { editandoM });
    }
    else{
        console.log('shao lo vimo');
        res.redirect('/profile');
    }
});

router.post('/editMedica/:rut', async (req, res) => {
    var { rut } = req.params;
    console.log('Actualizando DATOS.....');
    console.log(rut);
    var rutt = rut;
    console.log(rutt);
    const { sangre, sangregrupo, telefono_eme, nombre_tel_eme, estatura, peso, prevision, grupo_prevision, seguro, institucion, fecha_u_cd, contacto_medi, nombre_medi, consultorio, embarazada, embarazo_ant, fur } = req.body;
    const newDatosfichaE = {
        rut: rutt,
        sangre,
        sangregrupo,
        telefono_eme,
        nombre_tel_eme,
        estatura,
        peso,
        prevision,
        grupo_prevision,
        seguro,
        institucion,
        fecha_u_cd,
        contacto_medi,
        nombre_medi,
        consultorio,
        embarazada,
        embarazo_ant, 
        fur
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
    if(misdatos[0] == null)
    {
        res.redirect('/profile');
    }
    else{
        var miregion = await pool.query('SELECT region.region FROM personas, region WHERE personas.rut = ? AND personas.distrito = region.distrito_nombre', [yo]);
        console.log('Mi region es....');
        console.log(miregion);
        console.log('Mis Datos son....');
        console.log(misdatos);
        console.log('ahora mi ciudad es');
        console.log(misdatos[0].ciudad);
        const links = await pool.query('SELECT * FROM Personas WHERE personas.ciudad_grupo = ? AND personas.grupo = ? AND personas.unidad = ?',[misdatos[0].ciudad_grupo, misdatos[0].grupo, misdatos[0].unidad]);
        console.log(links);
        var unidadP = await pool.query('SELECT * FROM Personas, region WHERE personas.distrito = region.distrito_nombre AND personas.rut = ?',[yo]);
        console.log(unidadP);
        const cantidadUnidad = await pool.query('SELECT count(*) as total from personas where personas.unidad = ? AND personas.grupo = ?', [misdatos[0].unidad, misdatos[0].grupo]);
        const cantidadDistrito = await pool.query('SELECT count(*) as total from personas where personas.unidad = ? AND personas.distrito = ?', [misdatos[0].unidad, misdatos[0].distrito]);
        const cantidadRegion = await pool.query('SELECT count(*) as total from personas, region where personas.distrito = region.distrito_nombre AND personas.unidad = ? AND region.region = ?', [misdatos[0].unidad, miregion[0].region]);
        res.render('links/beneficiariosunidad', { links, unidadP, cantidadDistrito, cantidadUnidad, cantidadRegion });
    }
    
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
    if (opcion == 'MedicamentosAlergia' || opcion == 'Plantas' || opcion == 'Alimentos' || opcion == 'Otra Alergia')
    {
        console.log('estoy en Alergias');
        console.log(opcion);
        tipoo= "Alergias";
    }
    if (opcion == 'Lactosa' || opcion == 'Gluten' || opcion == 'Otra Intolerancia')
    {
        console.log('estoy en Intolerancia');
        tipoo= "Intolerancia";
    }
    if (opcion == 'Litiasis' || opcion == 'Tiroides' || opcion == 'Epilepcia' || opcion == 'Diabetes1' || opcion == 'Diabetes2' || opcion == 'Asma' || opcion == 'Hipertension' || opcion == 'Cardiaca' || opcion == 'Otra Enfermedad')
    {
        console.log('estoy en Enfermedad');
        tipoo= "Enfermedad";
    }
    if (opcion == 'Fractura' || opcion == 'Esguinse' || opcion == 'Luxacion' || opcion == 'Otra Traumatico')
    {
        console.log('estoy en Lesion');
        tipoo= "Lesion";
    }
    if(opcion == 'Psicologico')
    {
        console.log('estoy en Psicologico');
        tipoo= "Psicologico";
    }
    if(opcion == 'Cirugia' || opcion == 'Operacion')
    {
        console.log('estoy en Operacion/Cirugia');
        tipoo= "Operacion/Cirugia";
    }
    if(opcion == 'Alcohol' || opcion == 'Drogas' || opcion == 'OtroHabitoConsumo')
    {
        console.log('estoy en Habito/Consumo');
        tipoo= "Habito/Consumo";
    }
    if (opcion == undefined)
    {
        console.log('estoy en Undefined');
        console.log('Opcion no me llega valor');
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
    var yo = req.session.passport.user;
    console.log(req.session.passport.user);
    const links = await pool.query('SELECT * FROM Personas WHERE personas.rut_dirigente1 = ? OR personas.rut_dirigente2 = ? OR personas.rut_dirigente3 = ?', [yo, yo , yo]);
    console.log(links);
    res.render('links/filtrador', { links });
});

//Para ver los medicamentos
router.get('/medicamentos', isLoggedIn, async(req,res) =>{
    const rutDirigente = req.session.passport.user;
    var medi = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Medicamentos" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
    if (medi[0] !== null) {
        console.log('La persona que Tiene la Secion abierta es....');
        console.log(rutDirigente);
        var medi = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Medicamentos" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
        console.log('mostrando medicamentos')
        res.render('links/medicamentos', { medi });
    }
    else {
        console.log('Te redireciono');
        res.redirect('/profile');
    }
});

//Para ver las alergias
router.get('/alergias', isLoggedIn, async (req, res) => {
    const rutDirigente = req.session.passport.user;
    var ale = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Alergias" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
    if (ale[0] !== null) {
        console.log('La persona que Tiene la Secion abierta es....');
        console.log(rutDirigente);
        var ale = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Alergias" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
        console.log('mostrando alergias')
        res.render('links/alergias', { ale });
    }
    else {
        console.log('Te redireciono');
        res.redirect('/profile');
    }
});

//Para ver las intolerancias
router.get('/intolerancias', isLoggedIn, async (req, res) => {
    const rutDirigente = req.session.passport.user;
    var int = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Intolerancia" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
    if (int[0] !== null) {
        console.log('La persona que Tiene la Secion abierta es....');
        console.log(rutDirigente);
        var int = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Intolerancia" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
        console.log('mostrando alergias')
        res.render('links/intolerancias', { int });
    }
    else {
        console.log('Te redireciono');
        res.redirect('/profile');
    }
});
   
//Para ver las Enfermedades
router.get('/enfermedades', isLoggedIn, async (req, res) => {
    const rutDirigente = req.session.passport.user;
    var enf = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Enfermedad" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
    if (enf[0] !== null) {
        console.log('La persona que Tiene la Secion abierta es....');
        console.log(rutDirigente);
        var enf = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Enfermedad" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
        console.log('mostrando enfermedades')
        res.render('links/enfermedades', { enf });
    }
    else {
        console.log('Te redireciono');
        res.redirect('/profile');
    }
});

//Para ver los traumaticos
router.get('/traumaticos', isLoggedIn, async (req, res) => {
    const rutDirigente = req.session.passport.user;
    var tra = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Lesion" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
    if (tra[0] !== null) {
        console.log('La persona que Tiene la Secion abierta es....');
        console.log(rutDirigente);
        var tra = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Traumatico" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
        console.log('mostrando traumatismos')
        res.render('links/traumaticos', { tra });
    }
    else {
        console.log('Te redireciono');
        res.redirect('/profile');
    }
});

//Para ver problemas psicologicos
router.get('/psicologicos', isLoggedIn, async (req, res) => {
    const rutDirigente = req.session.passport.user;
    var psi = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Psicologico" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
    if (psi[0] !== null) {
        console.log('La persona que Tiene la Secion abierta es....');
        console.log(rutDirigente);
        var psi = await pool.query('Select * From Especifique,Personas Where Personas.rut=Especifique.rut AND Especifique.tipo="Psicologico" AND (Personas.rut_dirigente1=? OR Personas.rut_dirigente2=? OR Personas.rut_dirigente3=?)', [rutDirigente, rutDirigente, rutDirigente]);
        console.log('mostrando patologias psicologicas')
        res.render('links/psicologicos', { psi });
    }
    else {
        console.log('Te redireciono');
        res.redirect('/profile');
    }
});

module.exports = router;
