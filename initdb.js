const express = require('express');
const client = require('./db');
const initdb = express.Router();
var format = require('pg-format');


initdb.get('/', async(req, res) => {
    console.log("Creating Table ...")

    /* Anlegen der Tabelle "kundendaten". Da "kunden_id" in der Tabelle "hunde" als Fremdschlüssel auf die gleichnamige Variable aus "kundendaten"
    referenziert und bei Löschen eines Datensatzes aus "kundendaten" automatisch auch der zugehörige Datensatz aus "hunde" gelöscht wird, kann es 
    in der DB keinen Hund ohne Halter, bzw. zugehörigen Kunden geben, wohl aber Kunden, die aktuell keinen Hund mehr haben. */

    let query_tables = `
            DROP TABLE IF EXISTS hunde, kundendaten;
            CREATE TABLE kundendaten(kunden_id serial PRIMARY KEY, vorname VARCHAR(50), nachname VARCHAR(50), STRASSE VARCHAR(50), HAUSNUMMER VARCHAR(50), PLZ VARCHAR(50), TELEFON VARCHAR(50), EMAIL VARCHAR(50));
            CREATE TABLE hunde(hunde_id serial PRIMARY KEY, name VARCHAR(50), geburtsdatum DATE, rasse VARCHAR(50), chipnummer VARCHAR(50), geschlecht VARCHAR(50), kastriert BOOLEAN, vertraeglich_mit_rueden BOOLEAN, vertraeglich_mit_huendinnen BOOLEAN, kunden_id BIGINT, FOREIGN KEY(kunden_id) REFERENCES kundendaten ON DELETE CASCADE);
            `;

    try {
        await client.query(query_tables)
        console.log("Table created successfully ...")
    } catch (err) {
        console.log(err)
    }

    // Befüllen der Tabelle "kundendaten" mit Einträgen:

    const values_kundendaten = [
        ["Catherine", "Williams", "Musterstr.", "45", "10117", "12345678", "cwilliamsl@360.cn"],
        ["Adam", "Anderson", "Koloniestr.", "10", "10114", "378439089", "anderson@t-online.de"],
        ["Susan", "Andrews", "Wegstr.", "83", "10315", "789909009", "sandrews@gmail.com"],
        ["Maria", "Meyer", "Rosenallee", "12", "10317", "23234878", "m.meyer@gmx.de"]
    ];
    const paramquery_kundendaten = format('INSERT INTO kundendaten(Vorname, Nachname, Strasse, Hausnummer, PLZ, Telefon, EMail) VALUES %L RETURNING *', values_kundendaten);

    // Befüllen der Tabelle "hunde" mit Einträgen:

    const values_hunde = [
        ["Pixel", '2020-08-18', "Labrador Retriever", "12345678", "männlich", true, true, true, 1],
        ["Shirley", '2013-05-15', "Altdeutscher Hütehund", "12345677", "weiblich", true, true, true, 2],
        ["Loki", '2019-11-03', "Jack Russell Terrier", "12345676", "weiblich", true, false, true, 3]
    ];
    const paramquery_hunde = format('INSERT INTO hunde(Name, Geburtsdatum, Rasse, Chipnummer, Geschlecht, kastriert, vertraeglich_mit_rueden, vertraeglich_mit_huendinnen, kunden_id) VALUES %L RETURNING *', values_hunde);


    try {
        const result_kundendaten = await client.query(paramquery_kundendaten)
        const result_hunde = await client.query(paramquery_hunde)
        console.log("data inserted ...")
        res.status(200)
        res.send([result_hunde.rows, result_kundendaten.rows])
    } catch (err) {
        console.log(err)
    }

    


});

module.exports = initdb;
