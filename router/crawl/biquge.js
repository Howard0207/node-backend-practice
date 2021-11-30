class BQGXS {
    constructor(browser, name) {
        this.name = name;
        this.browser = browser;
    }

    // 打开一个新选项卡并返回选项卡的实例page
    createPageObject = async () => {
        const page = await this.browser.newPage();
        return page;
    };

    // 访问一个页面
    openPage = async (page) => {
        await page.goto("https://www.vipxs.la/");
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
    novelInfoInPage = async (page) => {
        try {
            const info = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const items = $(".ll .item");
                    if (items.length > 0) {
                        var findResult = [].slice.call(items).map((item) => {
                            const post = $(item).find(".image img").attr("src");
                            const name = $(item).find("dl dt span").text();
                            const author = $(item).find("dl dt a").text();
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

    // 爬取流程入口
    crawl = async () => {
        try {
            const page = await this.createPageObject();
            await this.openPage(page);
            await this.searchNovel(page);
            return this.novelInfoInPage(page);
        } catch (error) {
            console.log(error);
            return [];
        }
    };
}
module.exports = BQGXS;
