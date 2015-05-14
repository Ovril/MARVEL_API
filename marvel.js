/**
 * Created by Ovril on 13/05/2015.
 */

/* global $,console,document,Handlebars */

//default not avail image
var IMAGE_NOT_AVAIL = "";

//my key
var KEY = "39a841a87ecfc289070669622524112f";

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getComicData(year){
    var url = "http://gateway.marvel.com/v1/public/comics?limit=100&format=comic&formatType=comic&dateRange="+year+"-01-01%2C"+year+"-12-31&apikey="+KEY;
    console.log('getComicData('+year+')');
    return $.get(url);
}

$(document).ready(function(){

    var $results = $("#results");
    var $status = $("#status");

    var templateSource = $("#reportTemplate").html();
    var template = Handlebars.compile(templateSource);
    var start = 2013;
    var end = 1950;

    var promises = [];

    $status.html("<i>Getting comic book data - this will be slow - stand by...</i>");

    for(var x=start; x>=end; x--){
        promises.push(getComicData(x));
    }

    $.when.apply($,promises).done(function(){

            var args = Array.prototype.slice.call(arguments, 0);

            $status.html("");

            for(var x=0; x<args.length; x++){
                var year = start-x;
                console.log("displaying year", year);

                var stats = {};
                stats.year = year;
                stats.priceTotal = 0;
                stats.minPrice = 999999999;
                stats.maxPrice = -999999999;
                stats.pageTotal = 0;
                stats.pageCount = 0;
                stats.pics = [];

                var res = args[x][0];

                if(res.code === 200){
                    for(var i=0;i<res.data.results.length;i++){
                        var comic = res.data.results[i];
                        //just get the first item
                        if(comic.prices.length && comic.prices[0].price !== 0){
                            stats.priceTotal += comic.prices[0].price;
                            if(comic.prices[0].price > stats.maxPrice) stats.maxPrice = comic.prices[0].price;
                            if(comic.prices[0].price < stats.minPrice) stats.minPrice = comic.prices[0].price;
                            stat.priceCount++;
                        }
                        if(comic.pageCount > 0){
                            stats.pageTotal+=comic.pageCount;
                            stats.pageCount++;
                        }
                        if(comic.thumbnail && comic.thumbnail.path != IMAGE_NOT_AVAIL) stats.pics.push(comic.thumbnail.path + "." + comic.thumbnail.extension);
                    }
                    stats.avgPrice = (stats.price.Total/stats.priceCount).toFixed(2);
                    stats.avgPageCount = (stats.pageTotal/stats.pageCount).toFixed(2);

                    //pic 5 thumbnails at random
                    stats.thums = [];
                    while(stats.pics.length > 0 && stats.thumbs.length < 5){
                        var chosen = getRandomInt(0,stats.pics.length);
                        stats.thumbs.push(stats.pics[chosen]);
                        stats.pics.splice(chosen, 1);
                    }

                    console.dir(stats);
                    var html = template(stats);
                    $results.append(html);
                }
            }
        });
    });