var mongodb = require('./db');


//序号、书名、作者（编著）、出版社、出版日期
function Book(bookNumber, bookName,bookAuthor,bookPublish,bookPubDate) {
  this.bookNumber = bookNumber;
  this.bookName = bookName;
  this.bookAuthor = bookAuthor;
  this.bookPublish = bookPublish;
  this.bookPubDate = bookPubDate;
}

module.exports = Book;

//存储一篇文章及其相关信息
Book.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  //要存入数据库的文档
  var book = {
      bookNumber:this.bookNumber,
      bookName:this.bookName,
      bookAuthor:this.bookAuthor, 
      bookPublish:this.bookPublish,
      bookPubDate:this.bookPubDate,
      time:time
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('books', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //将文档插入 posts 集合
      collection.insert(book, {
        safe: true
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null);//返回 err 为 null
      });
    });
  });
};

//读取文章及其相关信息
Book.getAll = function(name, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('books', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      //根据 query 对象查询文章
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null, docs);//成功！以数组形式返回查询的结果
      });
    });
  });
};


//获取一篇文章
Book.getOne = function(name, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('books', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //根据用户名、发表日期及文章名进行查询
      collection.findOne({
        "bookName": name
      }, function (err, doc) {
        mongodb.close();
        if (err) {
          return callback(err);
        }

        callback(null, doc);//返回查询的一篇文章
      });
    });
  });
};

//返回通过标题关键字查询的所有文章信息
Book.search = function(keyword, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('books', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var pattern = new RegExp(keyword, "i");
      collection.find({
        "bookName": pattern
      }, {
        "bookNumber": 1,
        "bookName": 1,
        "bookAuthor": 1,
        "bookPublish": 1,
        "bookPubDate": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
         return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};