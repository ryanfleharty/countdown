const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 6789;
const path = require("path");
const dictionary = require("./static/word_trie")

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve('static')));
app.set('views', path.resolve("views"));
app.set('view engine', 'ejs');


app.get('/', function(req, res){
    res.render('game');
})
app.post('/best_word', function(req, res){
    var best_words = dictionary.rBestWord(req.body.letters);
    res.json(best_words);
})
app.post('/check_word', function(req, res){
    var word_exists = dictionary.search(req.body.word);
    res.json(word_exists);
})
app.listen(port, function(){
    console.log(`connected on port ${port}`);
})
