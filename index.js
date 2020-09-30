var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "company_db"
});

connection.connect(function(err) {
    
  if (err) throw err;
  initApp()
});

function initApp() {

    inquirer
        .prompt ({

          type: "list",
          name: "userAction",
          choices:["Manage Roles", "Manage Employees", "Manage Departments"]
        }).then((response) => {

          switch (response.userAction) {

            case "Manage Roles":
              manageRoles();
            
            case "Manage Employees":
              manageEmployees();

            case "Manage Departments":
              manageDepartments();
          } 
        })
}