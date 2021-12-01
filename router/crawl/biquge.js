const fs = require("fs");
const path = require("path");
class BQGXS {
    constructor(browser, props) {
        const { name, catalogUrl } = props;
        this.name = name;
        this.catalogUrl = catalogUrl;
        this.browser = browser;
        this.searchAddress = "https://www.vipxs.la/";
        this.crawlMaxTask = 4;
        this.currentTask = 0;
        this.chapters = [];
    }

    // 打开一个新选项卡并返回选项卡的实例page
    createPageObject = async () => {
        const page = await this.browser.newPage();
        return page;
    };

    // 访问一个页面
    openPage = async (page, address) => {
        await page.goto(address);
    };

    // 搜索小说
    searchNovel = async (page) => {
        // input 表单输入数据
        await page.type("#searchkey", this.name, { delay: 100 });
        await page.$eval("#searchkey", (el) => el.value);
        // 点击搜索并等待跳转页面加载完成
        await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click("#sss")]);
    };

    // 在搜索结果页面爬取信息
    crawlNovelInfoInPage = async (page) => {
        try {
            const info = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const items = $(".ll .item");
                    if (items.length > 0) {
                        var findResult = [].slice.call(items).map((item) => {
                            const post = $(item).find(".image img").attr("src");
                            const author = $(item).find("dl dt span").text();
                            const name = $(item).find("dl dt a").text();
                            const link = $(item).find("dl dt a").attr("href");
                            return { post, name, author, link, origin: "笔趣阁" };
                        });
                        resolve(findResult);
                    } else {
                        reject([]);
                    }
                });
            });
            return info;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    // 爬取搜索页面入口
    crawlSearchPage = async () => {
        try {
            const page = await this.createPageObject();
            await this.openPage(page, this.searchAddress);
            await this.searchNovel(page);
            return this.crawlNovelInfoInPage(page);
        } catch (error) {
            console.log(error);
            return [];
        }
    };

    // 检查目录是否存在，弱不存在则创建
    validateDir = (name) => {
        const dir = path.resolve(__dirname, `../../novel/${name}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }, (err) => {
                if (err) throw err;
                this.dir = dir;
            });
        }
        this.dir = dir;
    };

    saveCatalog = async (catalog) => {
        this.validateDir(this.name);
        const writeStream = fs.createWriteStream(path.resolve(this.dir, `catalog.json`));
        writeStream.write(JSON.stringify(catalog));
        console.log("写入完毕");
    };

    // 爬取小说目录
    crawlCatalog = async (page) => {
        await this.openPage(page, this.catalogUrl);
        const catalog = await page.evaluate(() => {
            return new Promise((resolve) => {
                const items = $("#list dd a");
                const baseUrl = "https://www.vipxs.la";
                if (items.length > 0) {
                    const catalogJson = { read: 0, chapters: [] };
                    const map = new Map();
                    [].slice.call(items).forEach((item) => {
                        const link = baseUrl + $(item).attr("href");
                        const chapter = $(item).text();
                        if (!map.get(chapter) && /^第/.test(chapter)) {
                            map.set(chapter, link);
                            catalogJson.chapters.push({ chapter, link });
                        }
                    });
                    resolve(catalogJson);
                } else {
                    reject({});
                }
            });
        });
        await this.saveCatalog(catalog);
        await page.close();
        return catalog;
    };

    // 爬取章节内容
    crawlChapter = async (chapter) => {
        await this.openPage(page, this.catalogUrl);
        await page.close();
    };

    crawlChapterTask = async (chapters) => {
        const catalogPath = path.resolve(this.dir, `catalog.json`);
        const catalogStr = fs.readFileSync(catalogPath);

        const catalog = JSON.parse(catalogStr);
        const { read } = catalog;
        const chapter = catalog["chapters"][read];
        catalog.read++;
        const writeStream = fs.createWriteStream(catalogPath);
        writeStream.write(JSON.stringify(catalog));
        return chapter;
        while (this.currentTask < this.crawlMaxTask && chapters.length) {
            const task = chapters.shift();
            this.crawlChapter(task);
        }
    };

    // 爬取小说
    crawlNovel = async (url) => {
        try {
            const page = await this.createPageObject();
            const catalog = await this.crawlCatalog(page, url);
            this.crawlChapterTask(catalog);
        } catch (error) {
            console.log(error);
            return [];
        }
    };
}

// var crawl = new BQGXS();

module.exports = BQGXS;
