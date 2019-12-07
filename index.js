
// Server = DB

const path = require('path');

const express = require('express');
app = express();
const cors = require('cors');

const MongoClient = require('mongodb').MongoClient;
let mongoURL = 'mongodb://localhost:27017/';

// 3rd party
// const youtube = require('random-youtube-video-by-keyword');

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(cors());

app.get('/categories', async (request, response) => {

    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

    try {

        await client.connect();
        const db = client.db('tastebuds');

        const categories = await db.collection('categories').find({}).sort('name', 1).toArray();

        client.close();
        response.json(categories);

    } catch (err) {

        client.close();
        response.status(500).send(err);

    }

});

// Get videos
app.get('/video/:category', async (request, response) => {

    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

    try {

        await client.connect();
        const db = client.db('tastebuds');

        const videos = await db.collection('videos').find({ category: request.params.category }).toArray();

        client.close();
        response.json(videos);

    } catch (err) {

        client.close();
        response.status(500).send(err);

    }

    // const apiKey = 'AIzaSyC8A6IaJtSNONCap5CjqIzfColz32HcvZk';
    // const keyword = request.params.category;

    // youtube.getRandomVid(apiKey, keyword, (err, data) => {

    //     if (!err) {

    //         response.json(data);
    //         return;

    //     }

    //     console.log(err);

    //     response.status(500).send(err);

    // });

});

// Add video
app.post('/video', async (request, response) => {

    if (!request.body || Object.keys(request.body).length === 0) {

        response.sendStatus(500);
        return;

    }

    const username = request.body.username;
    const category = request.body.category;
    const videoId = request.body.url.split('=')[1];

    console.log(username);
    console.log(category);
    console.log(videoId);

    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

    try {

        await client.connect();
        const db = client.db('tastebuds');

        // await db.collection('videos').updateOne(

        //     { username: username },
        //     {
        //         $push: {
        //             videos: {

        //                 category: category,
        //                 videoId: videoId

        //             }
        //         }
        //     }

        // );

        await db.collection('videos').insertOne({

            user: username,
            category: category,
            videoId: videoId,
            votes: 0

        });

        client.close();
        response.end();

    } catch (err) {

        client.close();
        response.status(500).send(err);

    }

});

// Vote
app.post('/taste/vote/:videoId', async (request, response) => {

    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

    try {

        await client.connect();
        const db = client.db('tastebuds');

        await db.collection('videos').updateOne(

            { videoId: request.params.videoId },
            { $inc: { votes: 1 } }

        );

        client.close();
        response.end();

    } catch (err) {

        client.close();
        response.status(500).send(err);

    }


});

app.get('/stats/', async (request, response) => {

    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

    try {

        await client.connect();
        const db = client.db('tastebuds');

        const points = await db.collection('videos').aggregate([

            // { $match: { user: request.params.username } },
            { $group: { _id: '$user', points: { $sum: '$votes' } } }

        ]).sort({ points: -1 }).toArray();

        // console.log(points);

        client.close();
        response.json(points);

    } catch (err) {

        client.close();
        response.status(500).send(err);

    }


});

// Get videos of user
app.get('/videos/:username', async (request, response) => {

    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

    try {

        await client.connect();
        const db = client.db('tastebuds');

        const videos = await db.collection('videos').find({ user: request.params.username }).toArray();

        client.close();
        response.json(videos);

    } catch (err) {

        client.close();
        response.status(500).send(err);

    }

});

app.post('/login', async (request, response) => {

    if (!request.body || Object.keys(request.body).length === 0) {

        response.sendStatus(500);
        return;

    }

    const username = request.body.username;
    const password = request.body.password;

    console.log(username);
    console.log(password);


    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

    try {

        await client.connect();
        const db = client.db('tastebuds');

        const user = await db.collection('users').find({

            username: username,
            password: password

        }).toArray();

        if (user.length === 0) {

            client.close();
            response.sendStatus(403);
            return;

        }

        client.close();
        response.end();

    } catch (err) {

        console.log(err);
        client.close();
        response.status(500).send(err);

    }


});

app.post('/signup', async (request, response) => {


    if (!request.body || Object.keys(request.body).length === 0) {

        response.sendStatus(500);
        return;

    }

    const username = request.body.username;
    const password = request.body.password;

    console.log(username);
    console.log(password);


    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

    try {

        await client.connect();
        const db = client.db('tastebuds');

        await db.collection('users').insertOne({

            username: username,
            password: password

        });

        client.close();
        response.end();

    } catch (err) {

        console.log(err);
        client.close();
        response.status(500).send(err);

    }


});

app.listen(5000);
