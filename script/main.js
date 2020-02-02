window.onload = function () {
	setSubmitListener();
}

function setSubmitListener() {
	document.getElementById('form').addEventListener("submit", function(e) {
		e.preventDefault();
		var title = prepareParam(document.getElementById('title').value);
		var lang = document.getElementById('lang').value;
		const toc = getTableOfContents(title, lang);
	});
}


async function getTableOfContents(title, language) {
	var url = 'https://' + language + '.wikipedia.org/api/rest_v1/page/metadata/' + title;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'User-Agent': 'toomas.oosalu@gmail.com'
		}
	});
	switch(response.status) {
		case 200:
			const responseJson = await response.json();
			return prepareToc(responseJson, getArticleUrl(title, language));
		case 404:
			//show not found error
			break;
		default:
			//show generic error
			break;
	}
}

function prepareToc(data, articleUrl) {
	if (!data.hasOwnProperty('toc')) {
		return null;
	}

	var toc,
	level = 0,
	parents = [];

	data.toc.entries.forEach(function(entry, idx) {
		if (level > entry.level) {
			//create new sublist
		} else if (level === entry.level) {
			//create same level element
		} else {
			//close current sublist && add to previous list
		}
	});

	return toc;
}

function getArticleUrl(title, language) {
	return 'https://' + language + '.wikipedia.org/wiki/' + title;
}

function prepareParam(param) {
	if (typeof param !== 'string') {
		return param;
	}
	return param.trim().replace(/ /g, '_');
}