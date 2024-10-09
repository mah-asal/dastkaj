require('dotenv/config');

const express = require('express');

const database = require('./core/database');
const middleware = require('./core/middleware');
const ip = require('./core/ip');
const health = require('./core/health');

const PORT = process.env.PORT ?? 3000;

const app = express();

app.use(require('cors')());
app.use(express.json());

let iranIsOnline = false;

app.get('/api/v1/handshake', async (req, res) => {
    // 1. get user ip
    const userIP = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // 2. check it is in iran or not
    const resultOfUserIP = await ip(userIP);
    let server = resultOfUserIP == 'IR' ? 'iran' : 'france';

    // 3. find links by store
    const store = (req.query['store'] ?? 'direct').toLowerCase();

    const data = database.load();

    let one = data[`${server}:${store}`];

    if (server == 'iran' && iranIsOnline == false) {
        server = 'france'
        one = data[`france:${store}`];
    }

    return one ? res.json({ server, store, ...one }) : res.status(404).send('Bad handshake');
});

app.use(middleware.auth);

app.get('/api/v1/config', (req, res) => {
    const data = database.load();

    return res.json({
        status: true,
        code: 200,
        i18n: 'OK',
        data: data
    });
});

app.post('/api/v1/config', middleware.form, (req, res) => {
    const { server, store, cdn, edge } = req.body;

    const key = `${server}:${store}`;
    const value = { cdn, edge };

    const data = database.load();

    data[key] = value;

    database.save(data);

    return res.json({
        status: true,
        code: 200,
        i18n: 'OK',
        data: {
            key,
            value
        }
    });
});

const checkIranIsOnline = async () => {
    const data = database.load();

    const edge = data['iran:cafebazaar']['edge'];

    const result = await health.iran(edge);

    iranIsOnline = result;
}

app.listen(PORT, () => {
    console.log(`Angor started on port ${PORT}`);

    checkIranIsOnline();
    setInterval(checkIranIsOnline, 1000 * 60 * 5);
});