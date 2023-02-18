const express = require('express');
const client = require('./db');
const router = express.Router();

// Passwort für Login Admin-Page:

const password = process.env.ADMINPW;

/* Prüfen, ob das Passwort für den Login, das mit dem header durch den Interceptor gesendet wurde, korrekt ist. Sollte dies nicht der Fall sein, 
sendet der Server die Fehlermeldung "401-Unauthorized": */

router.get('/checkpassword', async (req, res) => {
    if (req.headers.authorization !== password) {
        res.sendStatus(401);
    } else {
        res.send({});
    }
});

/* Alle Daten aus der Tabelle "kundendaten" laden. Um diesen und auch die weiteren Endpoints zu sichern, wird jeweils auch noch einmal das Passwort 
überprüft: */

router.get('/kundendaten', async (req, res) => {
    if (req.headers.authorization !== password) {
        res.sendStatus(401);
        return;
    }
    const query = `SELECT *, k.kunden_id as kunden_id FROM kundendaten k LEFT JOIN hunde h on k.kunden_id=h.kunden_id ORDER BY nachname ASC`;
    try {
        const result = await client.query(query)
        res.send(result.rows);
    } catch (err) {
        console.log(err.stack)
    }
});

// Der Tabelle "kundendaten" einen Datensatz hinzufügen:

router.post('/kundendaten', async (req, res) => {
    let vorname = (req.body.vorname) ? req.body.vorname : null;
    let nachname = (req.body.nachname) ? req.body.nachname : null;
    let strasse = (req.body.strasse) ? req.body.strasse : null;
    let hausnummer = (req.body.hausnummer) ? req.body.hausnummer : null;
    let plz = (req.body.plz) ? req.body.plz : null;
    let telefon = (req.body.telefon) ? req.body.telefon : null;
    let email = (req.body.email) ? req.body.email : null;

    const query = `INSERT INTO kundendaten(vorname, nachname, strasse, hausnummer, plz, telefon, email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

    try {
        const result = await client.query(query, [vorname, nachname, strasse, hausnummer, plz, telefon, email])
        console.log(res)
        res.send(result.rows[0]);
    } catch (err) {
        console.log(err.stack)
    }
});

// Einen Datensatz aus der Tabelle "kundendaten" anzeigen:

router.get('/kundendaten/:id', async (req, res) => {
    if (req.headers.authorization !== password) {
        res.sendStatus(401);
        return;
    }
    const query = `SELECT * FROM kundendaten WHERE id=$1`;

    try {
        const id = req.params.id;
        const result = await client.query(query, [id])
        console.log(result)
        if (result.rowCount == 1)
            res.send(result.rows[0]);
        else
            res.send({ message: "No client found with id=" + id });
    } catch (err) {
        console.log("error", err.stack)
    }
});

// Einen Datensatz aus der Tabelle "kundendaten" ändern:

router.put('/kundendaten/:id', async (req, res) => {
    if (req.headers.authorization !== password) {
        res.sendStatus(401);
        return;
    }
    const query = `SELECT * FROM kundendaten WHERE kunden_id=$1`;

    try {
        let kunden_id = req.params.id;
        const result = await client.query(query, [kunden_id])
        console.log("Kunde", kunden_id)
        let kunde = result.rows[0];

        let vorname = (req.body.vorname) ? req.body.vorname : kunde.vorname;
        let nachname = (req.body.nachname) ? req.body.nachname : kunde.nachname;
        let strasse = (req.body.strasse) ? req.body.strasse : kunde.strasse;
        let hausnummer = (req.body.hausnummer) ? req.body.hausnummer : kunde.hausnummer;
        let plz = (req.body.plz) ? req.body.plz : kunde.plz;
        let telefon = (req.body.telefon) ? req.body.telefon : kunde.telefon;
        let email = (req.body.email) ? req.body.email : kunde.email;

        const updatequery = `UPDATE kundendaten SET 
            vorname = $1, 
            nachname = $2,
            strasse = $3,
            hausnummer = $4,
            plz = $5,
            telefon = $6,
            email = $7
            WHERE kunden_id=$8;`;
        const updateresult = await client.query(updatequery, [vorname, nachname, strasse, hausnummer, plz, telefon, email, kunden_id]);
        console.log(updateresult)
        res.send({ kunden_id, vorname, nachname, strasse, hausnummer, plz, telefon, email });
    } catch (err) {
        res.status(404)
        res.send({
            error: err
        })
    }
});


// Einen Datensatz aus der Tabelle "kundendaten" löschen:

router.delete('/kundendaten/:id', async (req, res) => {
    if (req.headers.authorization !== password) {
        res.sendStatus(401);
        return;
    }
    const query = `DELETE FROM kundendaten WHERE kunden_id=$1`;

    try {
        const kunden_id = req.params.id;
        const result = await client.query(query, [kunden_id])
        console.log(result)
        if (result.rowCount == 1)
            res.send({ message: "Client with id=" + kunden_id + " deleted" });
        else
            res.send({ message: "No client found with id=" + kunden_id });
    } catch (err) {
        console.log(err.stack)
    }
});

// Alle Datensätze aus der Tabelle "hunde" laden:

router.get('/hunde', async (req, res) => {
    if (req.headers.authorization !== password) {
        res.sendStatus(401);
        return;
    }
    const query = `SELECT * FROM hunde `;

    try {
        const result = await client.query(query)
        console.log(res)
        res.send(result.rows);
    } catch (err) {
        console.log(err.stack)
    }
});

// Einen Datensatz in der Tabelle "hunde" hinzufügen:

router.post('/hunde', async (req, res) => {
    let name = (req.body.name) ? req.body.name : null;
    let geburtsdatum = (req.body.geburtsdatum) ? req.body.geburtsdatum : null;
    let rasse = (req.body.rasse) ? req.body.rasse : null;
    let chipnummer = (req.body.chipnummer) ? req.body.chipnummer : null;
    let geschlecht = (req.body.geschlecht) ? req.body.geschlecht : null;
    let kastriert = (req.body.kastriert) ? req.body.kastriert : null;
    let vertraeglich_mit_rueden = (req.body.vertraeglich_mit_rueden) ? req.body.vertraeglich_mit_rueden : null;
    let vertraeglich_mit_huendinnen = (req.body.vertraeglich_mit_huendinnen) ? req.body.vertraeglich_mit_huendinnen : null;
    let kunden_id = (req.body.kunden_id) ? req.body.kunden_id : null;

    const query = `INSERT INTO hunde(name, geburtsdatum, rasse, chipnummer, geschlecht, kastriert, vertraeglich_mit_rueden, vertraeglich_mit_huendinnen, kunden_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;

    try {
        const result = await client.query(query, [name, geburtsdatum, rasse, chipnummer, geschlecht, kastriert, vertraeglich_mit_rueden, vertraeglich_mit_huendinnen, kunden_id])
        console.log(res)
        res.send(result.rows[0]);
    } catch (err) {
        console.log(err.stack)
    }
});

// Einen Datensatz in der Tabelle "hunde" ändern:

router.put('/hunde/:id', async (req, res) => {
    if (req.headers.authorization !== password) {
        res.sendStatus(401);
        return;
    }
    const query = `SELECT * FROM hunde WHERE hunde_id=$1`;

    try {
        let hunde_id = req.params.id;
        const result = await client.query(query, [hunde_id])
        let hund = result.rows[0];

        let name = (req.body.name) ? req.body.name : hund.name;
        let geburtsdatum = (req.body.geburtsdatum) ? req.body.geburtsdatum : hund.geburtsdatum;
        let rasse = (req.body.rasse) ? req.body.rasse : hund.rasse;
        let chipnummer = (req.body.chipnummer) ? req.body.chipnummer : hund.chipnummer;
        let geschlecht = (req.body.geschlecht) ? req.body.geschlecht : hund.geschlecht;
        let kastriert = (req.body.kastriert) ? req.body.kastriert : hund.kastriert;
        let vertraeglich_mit_rueden = (req.body.vertraeglich_mit_rueden) ? req.body.vertraeglich_mit_rueden : hund.vertraeglich_mit_rueden;
        let vertraeglich_mit_huendinnen = (req.body.vertraeglich_mit_huendinnen) ? req.body.vertraeglich_mit_huendinnen : hund.vertraeglich_mit_huendinnen;

        const updatequery = `UPDATE hunde SET 
            name = $1, 
            geburtsdatum = $2,
            rasse = $3,
            chipnummer = $4,
            geschlecht = $5,
            kastriert = $6,
            vertraeglich_mit_rueden = $7,
            vertraeglich_mit_huendinnen = $8
            WHERE hunde_id=$9;`;
        const updateresult = await client.query(updatequery, [name, geburtsdatum, rasse, chipnummer, geschlecht, kastriert, vertraeglich_mit_rueden, vertraeglich_mit_huendinnen, hunde_id]);
        console.log(updateresult)
        res.send({ hunde_id, name, geburtsdatum, rasse, chipnummer, geschlecht, kastriert, vertraeglich_mit_rueden, vertraeglich_mit_huendinnen });
    } catch (err) {
        console.log(err)
        res.status(404)
        res.send({
            error: "Dog does not exist!"
        })
    }
});

// Einen Datensatz aus der Tabelle "hunde" löschen:

router.delete('/hunde/:id', async (req, res) => {
    if (req.headers.authorization !== password) {
        res.sendStatus(401);
        return;
    }
    const query = `DELETE FROM hunde WHERE kunden_id=$1`;

    try {
        const hunde_id = req.params.id;
        const result = await client.query(query, [hunde_id])
        console.log(result)
        if (result.rowCount == 1)
            res.send({ message: "Dog with id=" + hunde_id + " deleted" });
        else
            res.send({ message: "No dog found with id=" + hunde_id });
    } catch (err) {
        console.log(err.stack)
    }
});

module.exports = router;

