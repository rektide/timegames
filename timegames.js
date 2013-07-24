var sax= require("sax"),
  isodate= require("isodate"),
  http= require("http"),
  Q= require("q")

if(process.argv.length != 3){
	console.error("Incorrect arguments")
}

var name= process.argv[2]

function getLastPublished(){
	var sax= sax.parser(true),
	  publishedDefer= Q.defer()
	sax.onopentag= function(node){
		if(node == "published"){
			sax.ontext= function(t){
				sax.close()
				try{
					var time= isodate(t)
					httpDefer.resolve(t)
				}catch(ex){
					httpDefer.reject(ex)
				}
			}
		}
	}
	var req= http.request("https://github.com/"+name+".atom",function(res){
		res.setEncoding("utf8")
		res.on("data",function(chunk){
			sax.write(chunk)
		})
	})
	return publishDefer.promise
}

function getTimestamp(){
}

function writeTimestamp(){
}

function commit(){
}
