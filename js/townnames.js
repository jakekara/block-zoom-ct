/*
 * functions for handling, cleaning town names
 */

var display_name = function(town)
{
    return town.replace("_"," ")
}


exports.display_name = display_name;

var match = function(a, b)
{
    return display_name(a) == display_name(b);
}

exports.match = match;
