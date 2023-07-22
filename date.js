//jshint esversion:6

//1 for day and date
//2 for only day
module.exports = function (choice){
    var today = new Date();

    if (choice === 1){
        var dayOptions = {
            weekday: "long",
            day: "numeric",
            month: "long"
        };
    } else if (choice === 2) {
        var dayOptions = {
            weekday: "long",
        };
    } else {
        console.log("Invalid choice");
    }
    
    var day = today.toLocaleDateString("en-US", dayOptions);
    return day;
}

