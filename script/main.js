const maxRequests = 200;
const REQUEST_COUNT = 'req_count';

window.onload = function () {
	setSubmitListener();
}

function setSubmitListener() {
	document.getElementById('toc-fetch').addEventListener("submit", async function(e) {
		e.preventDefault();
		var containerEl = document.getElementById('table-of-contents');
		if (isRequestAllowed()) {
			var title = prepareParam(document.getElementById('title').value);
			var lang = document.getElementById('lang').value;
			const toc = await getTableOfContents(title, lang);
			containerEl.innerHTML = '';
			if (toc) {
				containerEl.appendChild(toc);
			}
		} else {
			containerEl.innerHTML = '';
			containerEl.appendChild(createErrorMessage('You have exceeded the request limit!'));
		}
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
	var count = sessionStorage.getItem(REQUEST_COUNT);
	sessionStorage.setItem(REQUEST_COUNT, count + 1);
	switch(response.status) {
		case 200:
			const responseJson = await response.json();
			return prepareToc(responseJson, getArticleUrl(title, language));
		case 404:
			return createErrorMessage('Could not find any articles with that title!');
		default:
			return createErrorMessage('Something went wrong, please try again.');
	}
}

function prepareToc(data, articleUrl) {
	if (!data.hasOwnProperty('toc')) {
		return null;
	}

	var toc = document.createElement('div'),
	level = 0,
	parents = [];
	data.toc.entries.forEach(function(entry, idx) {
		var listItem = createListItem(entry.html, entry.number, entry.anchor, articleUrl);
		if (level < entry.level) {
			//create new sublist
			var list = document.createElement('ul');
			list.appendChild(listItem);
			parents[entry.level] = list;
		} else if (level === entry.level) {
			//create same level element
			parents[level].appendChild(listItem);
		} else {
			//close current sublist && add to previous list
			parents[level - 1].lastChild.appendChild(parents[level]);
			parents.splice(level, 1);
			parents[entry.level].appendChild(listItem);
		}
		level = entry.level;
	});
	toc.appendChild(parents[1]);
	return toc;
}

function createListItem(name, number, anchor, articleUrl)
{
	name = strip(name);
	number = strip(number);
	anchor = strip(anchor);
	var listItem = document.createElement('li');
	var link = document.createElement('a');
	var text = document.createTextNode(number + ' ' + name);
	link.appendChild(text);
	link.href = articleUrl + '#' + anchor;
	link.target = '_blank';
	listItem.appendChild(link);
	return listItem;
}

function createErrorMessage(msg) {
	var error = document.createElement('p');
	error.classList.add('error');
	error.appendChild(document.createTextNode(msg));
	return error;
}

function getArticleUrl(title, language) {
	return 'https://' + language + '.wikipedia.org/wiki/' + title;
}

function prepareParam(param) {
	if (typeof param !== 'string') {
		return '';
	}
	param = strip(param);
	return param.trim().replace(/ /g, '_');
}

function strip(html) {
	var doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.textContent || '';
}

function isRequestAllowed() {
	var requests = sessionStorage.getItem(REQUEST_COUNT);
	return requests ? (requests < maxRequests) : true;
}