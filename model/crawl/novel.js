const { Model, Datatypes } = require("sequelize");
const sequelize = require("../../sequelize");

class NovelCraw extends Model {}

NovelCraw.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        name: Datatypes.STRING(30),
        author: Datatypes.STRING(10),
        origin: Datatypes.STRING(10),
        post: Datatypes.STRING(255),
        finished: Datatypes.TINYINT,
        chapter: DataTypes.INTEGER,
        total: DataTypes.INTEGER
    },
    {
        modelName: "novel-crawl",
        sequelize
    }
);

module.exports = NovelCraw;
