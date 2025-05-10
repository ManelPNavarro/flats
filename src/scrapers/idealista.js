const axios = require('axios');
const cheerio = require('cheerio');
const DistrictMapper = require('../valueObjects/districtMapper');


const baseUrl = 'https://www.idealista.com';
const searchPath = '/venta-viviendas/barcelona-barcelona/con-precio-hasta_320000,metros-cuadrados-mas-de_60,de-tres-dormitorios,de-cuatro-cinco-habitaciones-o-mas,ascensor,sin-inquilinos?ordenado-por=fecha-publicacion-desc';
const numberOfPages = 50; // Number of pages to scrape

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'es-ES,es;q=0.9',
};

async function fetchPage(page) {
    const url = `${baseUrl}${searchPath}&pag=${page}`;
    const res = await axios.get(url, {headers});
    const $ = cheerio.load(res.data);
    const listings = [];

    $('.item-info-container').each((listingNumber, listingElement) => {
        const container = $(listingElement).closest('.item');
        const listingId = container.attr('data-element-id')?.trim() || '';

        const link = $(listingElement).find('.item-link');
        const title = link.attr('title')?.trim() || '';
        const href = link.attr('href')?.trim() || '';
        const url = href ? `${baseUrl}${href}` : '';

        const mainImageUrl = container.find('.item-multimedia img').attr('src') || '';

        const price = getPrice($, listingElement);
        const location = getLocation(link);
        const flatDetails = getFlatDetails($, listingElement);

        listings.push({
            id: listingId,
            title,
            url,
            price,
            location,
            flatDetails,
            mainImageUrl,
        });
    });

    return listings;
}

function getPrice($, listingElement) {
    const priceText = $(listingElement).find('.item-price').text().trim();

    return parseInt(priceText.replace(/\./g, '').replace('€', '').trim(), 10);
}

function getLocation(link) {
    let street = '', neighborhood = '', district = '';

    const fullTitle = link.text().trim();
    const titleParts = fullTitle.split(',');

    if (titleParts.length >= 3) {
        street = titleParts[0].replace(/^Piso en\s*/i, '').trim();
        neighborhood = titleParts[1].trim();
        district = titleParts[2].trim();
    } else if (titleParts.length === 2) {
        street = titleParts[0].replace(/^Piso en\s*/i, '').trim();
        neighborhood = titleParts[1].trim();
    } else {
        street = fullTitle.replace(/^Piso en\s*/i, '').trim();
    }

    // Remove numbers, spaces and "s/n"
    neighborhood = neighborhood.replace(/\d+/g, '').replace(/\bs\/n\b/i, '').trim();
    district = district.replace(/\d+/g, '').replace(/\bs\/n\b/i, '').trim();

    let normalizedDistrict = DistrictMapper.normalizeDistrict(neighborhood);

    if (normalizedDistrict === null) {
        normalizedDistrict = DistrictMapper.normalizeDistrict(district);
    }

    const allowedUnmappedDistricts = new Set([
        'barcelona'
    ]);

    if (normalizedDistrict === null) {
        const neighborhoodLower = neighborhood.toLowerCase();
        const districtLower = district.toLowerCase();

        if (
            allowedUnmappedDistricts.has(neighborhoodLower) ||
            allowedUnmappedDistricts.has(districtLower)
        ) {
            return { street, district: null };
        }

        throw new Error(`Couldn't map district from: "${neighborhood}", "${district}"`);
    }

    return {
        street,
        district: normalizedDistrict
    };
}

function getFlatDetails($, listingElement) {
    const details = $(listingElement).find('.item-detail-char .item-detail');
    const numberOfBedroomsText = $(details[0])?.text()?.trim() || '';
    const numberOfBedrooms = parseInt(numberOfBedroomsText, 10) || null;

    const squareMetersText = $(details[1])?.text()?.trim() || '';
    const squareMeters = parseInt(squareMetersText.replace(/\D/g, ''), 10) || null;

    const floorAndFeatures = $(details[2])?.text()?.trim() || '';

    return {
        squareMeters,
        numberOfBedrooms,
        floorAndFeatures,
    };
}

async function scrapeAllPages() {
    const allListings = [];
    let page = 1;

    while (page <= numberOfPages) {
        console.log(`Scraping page ${page}...`);
        const listings = await fetchPage(page);
        if (listings.length === 0) break;
        allListings.push(...listings);
        page++;
        await new Promise(r => setTimeout(r, 1000));
    }

    return allListings;
}

module.exports = {scrapeIdealista: scrapeAllPages};
