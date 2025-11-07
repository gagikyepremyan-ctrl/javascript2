const API_BASE = 'https://api.openbrewerydb.org/v1/breweries';

const listEl = document.getElementById('list');
const detailEl = document.getElementById('detail');
const detailContent = document.getElementById('detailContent');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('typeFilter');
const refreshBtn = document.getElementById('refresh');
const closeDetailBtn = document.getElementById('closeDetail');

let breweries = [];

async function fetchBreweries(query = '') {
	const url = `${API_BASE}?per_page=50${query}`;
	try {
		const res = await fetch(url);
		const data = await res.json();
		breweries = data;
		renderList(breweries);
		populateTypeFilter(breweries);
	} catch (err) {
		listEl.innerHTML = `<div class="error">Failed to load breweries: ${err.message}</div>`;
	}
}

function renderList(items) {
	if (!items || items.length === 0) {
		listEl.innerHTML = '<div class="empty">No breweries found.</div>';
		return;
	}

	listEl.innerHTML = items
		.map(
			(b) => `
		<article class="card" data-id="${b.id}">
			<h3 class="card-title">${escapeHtml(b.name)}</h3>
			<div class="meta">${escapeHtml(b.city || '')}, ${escapeHtml(b.state || '')}</div>
			<div class="type">${escapeHtml(b.brewery_type || '')}</div>
		</article>`
		)
		.join('');

	document.querySelectorAll('.card').forEach((el) => {
		el.addEventListener('click', () => showDetail(el.dataset.id));
	});
}

function escapeHtml(str) {
	if (!str) return '';
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showDetail(id) {
	const brewery = breweries.find((b) => String(b.id) === String(id));
	if (!brewery) return;
	detailContent.innerHTML = `
		<h2>${escapeHtml(brewery.name)}</h2>
		<p class="muted">${escapeHtml(brewery.brewery_type)} — ${escapeHtml(brewery.city)}, ${escapeHtml(
		brewery.state
	)}</p>
		<p>${escapeHtml(brewery.street || '')}</p>
		<p><strong>Phone:</strong> ${escapeHtml(brewery.phone || 'N/A')}</p>
		<p><strong>Website:</strong> ${brewery.website_url ? `<a href="${brewery.website_url}" target="_blank" rel="noopener">${escapeHtml(brewery.website_url)}</a>` : 'N/A'}</p>
	`;
	detailEl.classList.remove('hidden');
}

function hideDetail() {
	detailEl.classList.add('hidden');
}

function populateTypeFilter(items) {
	const types = Array.from(new Set(items.map((b) => b.brewery_type).filter(Boolean)));
	// Clear except first option
	typeFilter.innerHTML = '<option value="">All types</option>' + types.map(t => `<option value="${t}">${t}</option>`).join('');
}

function applyFilters() {
	const q = searchInput.value.trim().toLowerCase();
	const type = typeFilter.value;

	const filtered = breweries.filter((b) => {
		const matchType = !type || b.brewery_type === type;
		if (!q) return matchType;
		const hay = `${b.name} ${b.city} ${b.state}`.toLowerCase();
		return matchType && hay.includes(q);
	});

	renderList(filtered);
}

searchInput.addEventListener('input', debounce(applyFilters, 250));
typeFilter.addEventListener('change', applyFilters);
refreshBtn.addEventListener('click', () => fetchBreweries());
closeDetailBtn.addEventListener('click', hideDetail);

// Utils
function debounce(fn, wait) {
	let t;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn(...args), wait);
	};
}

// initial load
fetchBreweries();

