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

connection.connect(function (err) {

  if (err) throw err;
  initApp()
});

function initApp() {

  console.log("Welcome to the Employee Manager! This app allows you to easily manage employee information.")
  inquirer
    .prompt({

      type: "list",
      name: "itemToManage",
      message: "What would you like to manage?",
      choices: ["roles", "employees", "departments"]
    }).then((itemChoice) => {

      switch (itemChoice.itemToManage) {

        case "roles":
          manageRoles()
          break;

        case "employees":
          console.log("here are some employees");
          break;

        case "departments":
          console.log("here are some departments");
          break;
      }
    })
}

function viewAllData(column, tableName) {

  connection.query("SELECT " + column + " FROM " + tableName, function (err, results) {

    if (err) throw err;
    console.table(results)
  })
}

function viewDataWhere(column, tableName, whereClause) {

  connection.query("SELECT " + column + " FROM " + tableName + " WHERE ?", whereClause, function (err, results) {

    if (err) throw err;

    console.table(results)
  })
}

function otherAction() {

  inquirer.prompt({
    type: "list",
    name: "moreActions",
    message: "Would you like to do something else?",
    choices: ["Yes", "No"]
  }).then(function (response) {

    if (response.moreActions === "Yes") {

      initApp()
    } else {

      console.log("Goodbye!")
      connection.end()
    }
  })
}

function manageRoles() {

  inquirer
    .prompt([

      {
        type: "list",
        name: "roleChoice",
        message: "Would you would you like to do with roles?",
        choices: ["View existing roles", "Update an existing role(s)", "Add a role", "Delete a role"]
      }
    ]).then(function (roleAction) {

      switch (roleAction.roleChoice) {

        case "View existing roles":

          connection.query(
            "SELECT title, salary, name FROM roles INNER JOIN departments ON roles.department_id = departments.id", function (err, results) {

              if (err) throw err;

              console.table(results)
              otherAction()
            })
          break;

        case "Update an existing role(s)":

          connection.query("SELECT * FROM roles", function (err, results) {

            if (err) throw err

            inquirer
              .prompt({

                type: "list",
                name: "roleToUpdate",
                message: "Which role would you like to update?",
                choices: function () {

                  let choiceArr = []

                  for (i = 0; i < results.length; i++) {

                    choiceArr.push(results[i].title)
                  }

                  return choiceArr
                }
              }).then(function (chosenRole) {

                inquirer.prompt({
                  type: "input",
                  name: "salaryEdit",
                  message: "Please enter a salary for this role.",
                  validate: function (value) {
                    if (isNaN(value) === false) {
                      return true;
                    }
                    return false;
                  }
                }).then(function (givenSalary) {

                  connection.query("UPDATE roles SET ? WHERE ?", [{ salary: parseInt(givenSalary.salaryEdit) }, { title: chosenRole.roleToUpdate }], function (err, results) {

                    if (err) throw err;

                    console.log(chosenRole.roleToUpdate + " updated!")
                    otherAction()
                  })
                })
              })
          })
          break;

        case "Add a role":
          let departmentArr = []
          connection.query("SELECT * FROM departments", function (err, results) {

            if (err) throw err;

            for (i = 0; i < results.length; i++) {

              departmentArr.push(results[i].name)
            }

          })
          inquirer
            .prompt([
              {
                type: "input",
                name: "roleName",
                message: "What would you like to call this role?"
              },
              {
                type: "input",
                name: "roleSalary",
                message: "What should the salary for this role be?",
                validate: function (value) {
                  if (isNaN(value) === false) {
                    return true;
                  }
                  return false;
                }
              },
              {
                type: "list",
                name: "roleDepName",
                choices: departmentArr
              }
            ]).then(function (response) {

              connection.query("SELECT id FROM departments WHERE name = ?", [response.roleDepName], function (err, depId) {

                if (err) throw err;

                connection.query("INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)",
                  [response.roleName, response.roleSalary, depId[0].id], function (err) {

                    if (err) throw err;
                    console.log(response.roleName + " was added successfully!")
                    otherAction()
                  })
              })
            })
          break;

        case "Delete a role":

          inquirer.prompt({

            type: "list",
            name: "deleteChoice",
            message: "Which role would you like to delete?",
            choices: function () {

              let roleArr = []

              connection.query("SELECT title FROM roles", function (err, results) {

                if (err) throw err;

                for (i = 0; i < results.length; i++) {

                  roleArr.push(results[i].title)
                }
                return roleArr
              })
            }.then(function (choice) {

              connection.query("DELETE from roles WHERE title = ?", [choice.deleteChoice], function (err) {

                if (err) throw err;
                console.log(choice.deleteChoice + " has been deleted!")
                otherAction()
              })
            })
          })
          break;
      }
    })
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