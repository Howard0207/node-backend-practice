const NovelCraw = require("../../model/crawl/novel");

class Novel {
    constructor(props) {
        const { id, name, author, origin, post, finished, chapter, total } = props;
        this.id = id;
        this.name = name;
        this.author = author;
        this.origin = origin;
        this.post = post;
        this.finished = finished;
        this.chapter = chapter;
        this.total = total;
    }

    create = () => {
        NovelCraw.create(this);
    };
}

module.exports = Novel;
