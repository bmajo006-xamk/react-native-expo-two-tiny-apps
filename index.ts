import express from 'express';
import path from 'path';

const app : express.Application = express();

const portti : number = 3003;

app.use(express.static(path.resolve(__dirname, "public")));


app.get("/", (req: express.Request, res: express.Response) => {

    const data = require('./public/tmp/automaatit.json');
    const datat = JSON.stringify(data);

    res.send(datat);
});
app.listen(portti, () => {

    console.log(`Palvelin käynnistyi osoitteeseen : http://localhost:${portti}`);
})