$(document).ready(function(){
    var letters_picked = 0;
    var available_letters = [];
    var chosen_letters = [];
    var words_submitted = [];
    $('.letters_available').on('click', 'button', function(){
        char = $(this).text();
        $('.letters_chosen').append("<button class='chosen_letter "+char+"'>" + char + "</button>")
        chosen_letters.push(char);
        available_letters.splice(available_letters.indexOf(char), 1);
        $(this).remove();
    })
    $('.letters_chosen').on('click', 'button', function(){
        char = $(this).text();
        $('.letters_available').append("<button class='available_letter "+char+"'>" + char + "</button>")
        available_letters.push(char);
        chosen_letters.splice(chosen_letters.indexOf(char), 1);
        $(this).remove();
    })
    $('#add_word').click(function(){
        var word = ""
        $('.chosen_letter').each(function(index){
            char = $(this).text();
            word += char;
            available_letters.push(char);
            chosen_letters.splice(chosen_letters.indexOf(char), 1);
            $('.letters_available').append("<button class='available_letter "+char+"'>" + char + "</button>");
            $(this).remove();
        })
        if(word.length>0){
            $('.words_submitted').append("<button class='submitted_word'>" + word + "</button>")
            words_submitted.push(word);
        }
    })
    $('.add_letter').click(function(){
        letters_picked++;
        if(letters_picked == 9){
            $('.start_game').click();
            $('.add_letter').off();
        }
    })
    // letter distribution determined by https://en.wikipedia.org/wiki/Letter_frequency#Relative_frequencies_of_letters_in_the_English_language
    var vowels = ['a','a','a','a','a','a','a','a',
        'e','e','e','e','e','e','e','e','e','e','e','e',
        'i','i','i','i','i','i','i',
        'o','o','o','o','o','o','o',
        'u','u','u','u'];
    var consonants = ['b',
        'c','c','c',
        'd','d','d','d',
        'f','f',
        'g','g',
        'h','h','h','h','h','h',
        'j',
        'k',
        'l','l','l','l',
        'm','m','m',
        'n','n','n','n','n','n',
        'p','p',
        'q',
        'r','r','r','r','r','r',
        's','s','s','s','s','s','s',
        't','t','t','t','t','t','t','t',
        'v',
        'w','w',
        'x',
        'y','y',
        'z']
    $('.add_vowel').click(function(){
        var index = Math.floor(Math.random() * vowels.length);
        $('.letters_available').append("<button class='available_letter "+vowels[index]+"'>" + vowels[index] + "</button>")
        available_letters.push(vowels[index]);
    })
    $('.add_consonant').click(function(){
        var index = Math.floor(Math.random() * consonants.length)
        $('.letters_available').append("<button class='available_letter "+consonants[index]+"'>" + consonants[index] + "</button>")
        available_letters.push(consonants[index]);
    })
    $('.start_game').click(function(){
        $('.start_game').hide();
        $('.add_vowel').hide();
        $('.add_consonant').hide();
        $('#add_word').toggle();
        var end = new Date().getTime() + 30000;
        var x = setInterval(function(){
            var now = new Date().getTime();
            var distance = end - now;
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if(distance <= 0) { //END GAME PROTOCOL
                clearInterval(x);
                $('#add_word').hide();
                $('.letters_available').off();
                $('body').off('keypress');
                $('.words_submitted').prepend('<h3>Choose your best word</h3>');
                $('.submitted_word').click(function(){
                    $('.submitted_word').off();
                    var best_word = $(this).text();
                    $.ajax({ //If this weren't a free, harmless Webster's dictionary API, I'd be more secure with the key
                        url: 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/'+best_word+'?key=a5d56432-f973-42ac-bb09-76d4a22cc31d',
                        dataType: "xml",
                        success: function(result, status, jqXHR){
                            var definitions = $(result).find("entry").length;
                            if(definitions > 0){
                                console.log('ITS A WORD ALRIGHT')
                            } else {
                                console.log('AINT NO WORD I EVER HEARD OF')
                            }

                        }
                    })
                    for (var i = 0; i < chosen_letters.length; i++) {
                        available_letters.push(chosen_letters[i]);
                    }
                    $.post('/best_word',
                        {'letters':available_letters},
                        function(data, status, jqXHR){
                            $('.words_submitted').after("<div class='row best_words'><h5>Could you have done better?<h5><p>The best words were:</p></div>")
                            for (var i = 0; i < data.length; i++) {
                                $('.best_words').append("<p class='best_word'>"+data[i]+"</p>")
                                if(i>6){
                                    break;
                                }
                            }
                    })
                })
                return $('.letters_chosen').off();
            }
            $('.seconds_left').text(seconds);
        }, 100)
        $('body').on('keypress', function(event){
            if(available_letters.length > 0){
                for(letter in available_letters){
                    if(available_letters[letter].charCodeAt(0) == event.which){
                        grabbed_letter = available_letters.splice(letter, 1)[0];
                        chosen_letters.push(grabbed_letter);
                        $('.letters_chosen').append("<button class='chosen_letter "+grabbed_letter+"'>" + grabbed_letter + "</button>")
                        $('.letters_available '+'.'+grabbed_letter+':first').remove();
                        break;
                    }
                }
            }
        })
        $('body').on('keyup', function(event){
            if(event.which == 8 && chosen_letters.length > 0){ //delete key function removes the last letter added and puts it back in the availble pool
                $('.chosen_letter').last().remove();
                var popped_letter = chosen_letters.pop();
                available_letters.push(popped_letter);
                $('.letters_available').append("<button class='available_letter "+popped_letter+"'>" + popped_letter + "</button>")
            } else if(event.which == 13) { //enter key function triggers the add_word protocol
                $('#add_word').click();
            }
        })
    })
})
