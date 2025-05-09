const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeIdealista() {
    const url = 'https://www.idealista.com/venta-viviendas/barcelona-barcelona/con-precio-hasta_320000,metros-cuadrados-mas-de_60,de-tres-dormitorios,de-cuatro-cinco-habitaciones-o-mas,ascensor,sin-inquilinos/';

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
    };

    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);

    const listings = [];

    $('.item-info-container').each((i, el) => {
        const link = $(el).find('.item-link');
        const title = link.attr('title')?.trim() || '';
        const href = link.attr('href')?.trim() || '';
        const url = href ? `https://www.idealista.com${href}` : '';

        const price = $(el).find('.item-price').text().trim();
        const location = $(el).find('.item-location').text().trim();

        listings.push({ title, url, price, location });
    });

    return listings;
}

module.exports = { scrapeIdealista };
