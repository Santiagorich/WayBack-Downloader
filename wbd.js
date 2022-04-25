const axios = require('axios');
const fs = require("fs");
axios.defaults.withCredentials = true
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const SEARCH_DIR = 'Search_Results';
const FILES_DIR = 'Files';
const WAIT = 500;

if (fs.existsSync(SEARCH_DIR)) {
    fs.readdirSync(SEARCH_DIR).forEach(f => fs.rmSync(`${SEARCH_DIR}/${f}`));
} else {
    fs.mkdirSync(SEARCH_DIR);
}
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR);
}

async function checkForQuery(data, timestamp) {
    let filedata = fs.readFileSync(`${FILES_DIR}/${timestamp}.html`)
    if (process.argv[3] && filedata.includes(process.argv[3])) {
        console.log(`Query ${process.argv[3]} found in ${timestamp}'.html`);
        if (!fs.existsSync(`${SEARCH_DIR}/${timestamp}.html`)) {
            fs.copyFile(`${FILES_DIR}/${timestamp}.html`, `${SEARCH_DIR}/${timestamp}.html`, (err) => {
                if (err) throw err;
            })
        }
    }
}

async function downloadHtml(url, timestamp) {

    let file = fs.createWriteStream(`${FILES_DIR}/${timestamp}.html`);
    axios.get(`https://web.archive.org/web/${timestamp}/${url}`, {
        responseType: 'stream',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
        }
    }).then(res => {
        res.data.pipe(file);


        file.on("finish", () => {
            file.close();
            console.log(`Download Completed: ${timestamp}.html`);
            checkForQuery(`${FILES_DIR}/${timestamp}.html`, timestamp);
        });
    })
}

async function getAll() {
    console.log(`https://web.archive.org/cdx/search/cdx?url=${process.argv[2]}*&output=json&collapse=urlkey`)
    return await axios.get(`https://web.archive.org/cdx/search/cdx?url=${process.argv[2]}*&output=json&collapse=urlkey`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
        }
    }).then(res => {

        return res.data;
    }).catch(err => {
        console.log("Error fetching data, re run the script");
    })

}

async function parseAll() {
    for (item of await getAll()) {
        console.log(`Processing: ${item[1]}`);
        if (!fs.existsSync(`${FILES_DIR}/${item[1]}.html`)) {
            await downloadHtml(item[2], item[1]);
            await sleep(WAIT);
        } else {
            checkForQuery(`${FILES_DIR}/${item[1]}.html`, item[1]);

        }
    }

}

parseAll();