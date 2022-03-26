import { load } from 'cheerio';
import { get } from 'axios';
const url = 'https://www.30secondsofcode.org';
// decode HTML entities to a regular text
var decodeEntities = (function () {
	// this prevents any overhead from creating the object each time
	var element = document.createElement('div');

	function decodeHTMLEntities(str) {
		if (str && typeof str === 'string') {
			// strip script/html tags
			str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, '');
			str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, '');
			element.innerHTML = str;
			str = element.textContent;
			element.textContent = '';
		}

		return str;
	}

	return decodeHTMLEntities;
})();
// copy HTML tag text content function
function copyFunction() {
	console.log(this);
	const copyText = this.previousElementSibling.textContent;
	const textArea = document.createElement('textarea');
	textArea.textContent = copyText;
	document.body.append(textArea);
	textArea.select();
	document.execCommand('copy');
}

// get Random collection from site collections to choose a snippet from it
async function getRandomCollection() {
	try {
		const { data } = await get(url);
		const $ = load(data);
		const collections = $(
			'#__next > div > div > ul.list-section.collections-shelf-list'
		).children();
		const collection =
			collections[Math.floor(Math.random() * collections.length)];
		const href = $(collection.children).attr('href');
		return url + href;
	} catch (err) {
		console.log(err);
	}
}
// get random page number from the colection url
async function getRandomPage(collectionURL) {
	try {
		const { data } = await get(collectionURL);
		const $ = load(data);
		const totalPages = $(
			'#__next > div > div > div.paginator.mt-7.mx-5.mb-6.a-center.flex.j-center > a:nth-child(3)'
		).text();
		const randomPage = Math.floor(Math.random() * totalPages) + 1;
		return collectionURL.slice(0, -1) + randomPage;
	} catch (err) {
		console.log(err);
	}
}
// get random snippet url
async function getRandomSnippet(randomPageURL) {
	try {
		const { data } = await get(randomPageURL);
		const $ = load(data);
		const snippets = $('#__next > div > div > ul > li.card.list-card');
		const snippet = snippets[Math.floor(Math.random() * snippets.length)];
		const snippetURL = $(snippet)
			.find('> div.card-data.mx-2.my-0 > h3 > a')
			.attr('href');
		return url + snippetURL;
	} catch (error) {
		console.log(error);
	}
}
// render the snippet into the DOM
async function renderSnippet(snippetURL) {
	try {
		const { data } = await get(snippetURL);
		const $ = load(data);
		const pageContent = document.querySelector('.page-content');
		const cardSnippet = $('#__next > div > div > div.card.snippet-card');
		$('picture').remove();
		decodeEntities('hello &quot;');
		const cardSnippetHTML = cardSnippet.html();
		let reg = /(?<=<style>)([\s\S]*?)(?=<\/style>)/gim;
		if (cardSnippetHTML.includes('<style>')) {
			console.log(cardSnippetHTML.includes('<style>'));
			pageContent.innerHTML = cardSnippetHTML.replace(
				reg,
				decodeEntities(cardSnippetHTML.match(reg)[0])
			);
		} else {
			pageContent.innerHTML = cardSnippetHTML;
		}
		return true;
	} catch (error) {
		console.log(error);
	}
}
// main function
async function main() {
	try {
		const collectionURL = await getRandomCollection();
		const randomPageURL = await getRandomPage(collectionURL);
		const snippetURL = await getRandomSnippet(randomPageURL);
		console.log(snippetURL);
		await renderSnippet(snippetURL).then(res => {
			document
				.querySelectorAll('.action-btn.icon-clipboard')
				.forEach(actionBtn =>
					actionBtn.addEventListener('click', copyFunction)
				);
		});
	} catch (error) {
		main();
	}
}
main();
