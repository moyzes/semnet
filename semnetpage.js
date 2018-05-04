
window.onload = function() {
	
	// Search
	var search = this.document.getElementById("search");
	search.onclick = function() {
		queryBuilder();
	}

	var textarea = document.getElementById("queries");
	textarea.onclick = function() {
		textarea.value = "";
	}

}

function queryBuilder(){
	
	//Get the full text
	var text = document.getElementById("queries").value;
	
	//Split the queries
	var queries = text.split(/\se\s/gm);
	console.log(queries);
	var stringQuery = "db.q()";

	//For every word in every query, add the single quotes around them.
	queries.forEach(query => {

		var words = query.split(' ');
		words.forEach(word => {
			query = query.replace(word, "'"+word+"'");
		});

		stringQuery += ".filter(";
		query = query.replace("é", "is");
		query = query.replace(" ", ",");
		stringQuery += query + ")";

	});

	console.log(stringQuery+".all();");
	var db = new Semnet();
	
	db.add('animal');
	db.add('mamífero');
	db.add('cachorro');
	db.add('gato');
	db.add('pássaro');
	db.add('peixe');
	db.add('morcego');
	db.add('minhoca');
	db.add('asas');
	db.add('pelos');

	db.add('persegue', {opposite: 'não persegue', transitive: false});
	db.add('come', {opposite: 'não come', transitive: false});
	db.add('tem', {opposite: 'não tem', transitive: false});

	db.fact('mamífero', 'is', 'animal');
	db.fact('gato', 'is', 'animal');
	db.fact('pássaro', 'is', 'animal');
	db.fact('peixe', 'is', 'animal');
	db.fact('cachorro', 'is', 'mamífero');
	db.fact('morcego', 'is', 'mamífero');
	
	// attributes
	db.fact('cachorro', 'tem', 'pelos');
	db.fact('gato', 'tem', 'pelos');
	db.fact('pássaro', 'tem', 'asas');
	db.fact('morcego', 'tem', 'asas');
	db.fact('cachorro', 'persegue', 'gato');
	db.fact('gato', 'come', 'peixe');
	db.fact('peixe', 'come', 'minhoca');
	db.fact('pássaro', 'come', 'minhoca');
	
	var results = "";
	eval("var results =" + stringQuery+".all()");
	
	var result_area = document.getElementById("results");
	result_area.innerHTML = "";

	results.forEach(result => {
		
		var p = document.createElement("p");
		var res = document.createTextNode(result);
		p.appendChild(res);
		result_area.appendChild(p);

	});
}

function proceder(el, e) {
	if (e.keyCode == 13) {
		queryBuilder();
		e.preventDefault();
	}
}