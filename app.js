const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash")
const date = require(__dirname + "/date.js");

const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.locals._ = _;

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser:true});
connectionPromise = mongoose.connection.asPromise();
connectionPromise.then(()=>{
    console.log("connected successfully to DB");
});

//creating items schema
const itemSchema = new mongoose.Schema({
    itemName : {
        type : String,
        required : [true, "Where item foofoo?"]
    }
});

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
});

const List = mongoose.model("List", listSchema);

const ListItem = mongoose.model("listItem", itemSchema);
const item1 = new ListItem({
    itemName : "Press the + button to add to the list"
});
const item2 = new ListItem({
    itemName:"<--- Press to delete Item"
});
const defaultItems = [item1, item2];

//--------------------------------------------------GETS
let day = date(1);
app.get("/", function(req, res){
    
     //comes from date.js

    //getting items from list items DB
    ListItem.find({})
    .then(foundItems => {
        if (foundItems.length === 0){
            ListItem.insertMany(defaultItems).then(()=>{
                console.log("Default items inserted");
            })
            res.redirect("/");
        } else {
            res.render("list", {
            listTitle : "Today",
            listItem_EJS : foundItems,
            //listType : "Normal"
        });
        }
    }, (err) => {console.log("Nothing found")});
});

app.get("/:listParam", function(req, res){
    const paramName = req.params.listParam
    console.log("paramName : " + paramName);
    const normalListName = _.capitalize(_.lowerCase(paramName));
    const newlistname = _.camelCase(paramName);
    console.log("newlistname : " + newlistname);
    List.find({name : newlistname})
        .then(foundItems => {
            if (foundItems.length === 0){
                const list = new List({
                    name : newlistname,
                    items : defaultItems
                });
                list.save();
                res.redirect("/" + paramName);
            } else {
                console.log("a List with that name already exists");
                // console.log(foundItems[0].name);
                res.render("list", {
                    listTitle : _.capitalize(_.lowerCase(foundItems[0].name)),
                    listItem_EJS : foundItems[0].items,
                    //listType : normalListName
                });
            }
        });
});

//--------------------------------------------------------POSTS 
app.post("/", function(req, res){

    const listItem = req.body.listItem_input;
    const listName = req.body.list;
    const newDoc = new ListItem({
        itemName : listItem
    });
    console.log("console logging listName : "+listName);
    if (listName == "Today" || listName == "today"){
        newDoc.save();
        res.redirect("/");
    } else {
        findingOneDoc(listName);
    }

    async function findingOneDoc(listName){
        const receivedDoc = await List.findOne({name : listName});
        // console.log(receivedDoc);
        receivedDoc.items.push(newDoc);
        receivedDoc.save();
        res.redirect("/"+listName);
    }
    
});

app.post("/delete", function(req, res){
    const checkedbox = req.body.checkbox;
    const listTitle = req.body.listTitle;
    console.log(listTitle);
    if (listTitle === "Today" || listTitle === "today"){
        deleteDefaultListItem(checkedbox);
        res.redirect("/");
    } else {
        deleteCustomListItem(checkedbox, listTitle);
        res.redirect("/" + listTitle);
    }
    
});

async function deleteDefaultListItem(checkString){
    console.log("\n\n\nInside deleteDefaultListItem function\n\n\n");
    await ListItem.deleteOne({_id:checkString});
}

async function deleteCustomListItem(checkedbox, listTitle){
    console.log("\n\n\nInside deleteCustomListItem function\n\n\n");
    await List.findOneAndUpdate({name : listTitle}, {$pull : {items : {_id : checkedbox}}});
}



// app.post("/work", function(req, res){
//     var workListItem = req.body.listItem_input;
//     workListItems.push(workListItem);
//     res.redirect("/work");
// });

app.listen(port, function(){
    console.log("Listening on port : " + port);
});