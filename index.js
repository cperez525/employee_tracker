var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Pookie_25?!",
  database: "company_db"
});

connection.connect(function (err) {

  if (err) throw err;
  initApp()
});

function initApp() {

  inquirer
    .prompt({

      type: "list",
      name: "userAction",
      message: "What would you like to do?",
      choices: ["Manage roles", "Manage employees", "Manage departments"]
    }).then((response) => {

      switch (response.userAction) {

        case "Manage roles":
          viewData(`roles`)
          break;

        case "Manage employees":
          console.log("here are some employees");
          break;

        case "Manage departments":
          console.log("here are some departments");
          break;
      }
    })
}

function viewData(tableName) {

  connection.query("SELECT * from " + tableName, function(err,result) {

    if(err) throw err;

    console.table(result);
  })
}


function manageRoles() {

  inquirer
    .prompt([

      {
        type: "list",
        name: ""
      }
    ])
}

function manageEmployees() {

  inquirer
    .prompt([

      {
        type: "list",
        name: ""
      }
    ])
}

function manageDepartments() {

  inquirer
    .prompt([

      {
        type: "list",
        name: ""
      }
    ])

}