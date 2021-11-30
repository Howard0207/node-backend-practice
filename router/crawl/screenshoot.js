const imgBuffer = await page.screenshot({ path: "example.png", clip: { x: 470, y: 165, width: 980, height: 1960 } });
const base64 = imgBuffer.toString("base64");

class BaseScreenShoot {
    constructor(browser, url) {
        this.url = url;
        this.browser = browser;
    }
    // 打开一个新选项卡并返回选项卡的实例page
    createPageObject = async () => {
        const page = await this.browser.newPage();
        return page;
    };

    // 访问一个页面
    openPage = async (page) => {
        await page.goto(this.url);
    };

    // 爬取流程入口
    crawl = async () => {
        try {
            const page = await this.createPageObject();
            await this.openPage(page);
            return this.novelInfoInPage(page);
        } catch (error) {
            return [];
        }
    };
}
