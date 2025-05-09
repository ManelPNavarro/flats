const { scrapeIdealista } = require('../src/scrapers/idealista');
const Portals = require('../src/valueObjects/portals');
const fs = require('fs');
const path = require('path');

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    red: "\x1b[31m"
};

const args = process.argv.slice(2);
const target = args[0];

(async () => {
    try {
        console.log(`${colors.cyan}🔍 Starting scrape for target: ${target}...${colors.reset}`);
        let data;

        switch (target) {
            case Portals.IDEALISTA:
                console.log(`${colors.yellow}🏠 Scraping Idealista listings...${colors.reset}`);
                data = await scrapeIdealista();
                console.log(`${colors.green}✅ ${data.length} listings found.${colors.reset}`);
                break;
            default:
                console.error(`${colors.red}❌ Scraper not found for target: ${target}${colors.reset}`);
                return;
        }

        const outputPath = path.join(__dirname, `../data/${target}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`${colors.green}💾 Data saved to: ${outputPath}${colors.reset}`);
    } catch (err) {
        console.error(`${colors.red}⚠️ Scraping error: ${err.message}${colors.reset}`);
    }
})();
