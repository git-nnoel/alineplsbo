String.prototype.contains = function(toSearch, Sense){

    const getAllIndexes = (arr, val) => {
        // retirar o next
        var indexes = [];
        var next = 0;

        if (Sense == false){
        arr = arr.toLowerCase();
        val = val.toLowerCase();
        }
        
        while(arr.indexOf(val, next) !== -1){

            let index = arr.indexOf(val, next);
            indexes.push(index);
            next = index + 1;

        }

        return indexes;

    };

    var indexes = getAllIndexes(this, toSearch);
    return indexes.each(index => {

        if(

            (index !== -1) &&
            (!this[index - 1] || this[index - 1] === " ") &&
            (!this[index + toSearch.length] || this[index + toSearch.length] === " ")

        ){

            return true;

        }

    });

};
String.prototype.replaceAll = function(search, replace, caseSensitive){

    if(caseSensitive){
        return this.split(search).join(replace);

    }else{
        return this.split(search.toLowerCase()).join(replace).split(search.toUpperCase()).join(replace);

    }

};
String.prototype.removeAccents = function(){
    return (
        this
            .replace(/[ÁÀÂÃ]/g, 'A')
            .replace(/[ÉÈÊẼ]/g, 'E')
            .replace(/[ÍÌÎĨ]/g, 'I')
            .replace(/[ÓÒÔÕ]/g, 'O')
            .replace(/[ÚÙÛŨ]/g, 'U')
            .replace(/[áàãâ]/g, 'a')
            .replace(/[éèẽê]/g, 'e')
            .replace(/[íìĩî]/g, 'i')
            .replace(/[óòõô]/g, 'o')
            .replace(/[úùũû]/g, 'u')
            .replace(/[Ç]/g, 'C')
            .replace(/[ç]/g, 'c')
    );

};
String.prototype.removeSpecialChars = function(whiteList){

    return this.removeAccents().replace(new RegExp(`[^a-z0-9 ${whiteList}]`, "gi"), "");

};
String.prototype.removeRepeats = function(){

	let last = null;
	let out = [];
	this.each((char) => {

		if(last !== char){

			out.push(char);
			last = char;

		}

	});

    return out.join("");

};
String.prototype.deepTrim = function(){

    return this.split(" ").filter((val) => (val !== "")).join(" ");

};

Object.prototype.each = function(cb){

    var breaked = false;
    for(var index in this) {

        var value = this[index];
        if(typeof value !== "function"){
            breaked = cb(value, index);
            if(breaked){
                break
            }
        }

    }
    return breaked;

};
