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
          manageEmployees()
          break;

        case "departments":
          manageDepartments()
          break;
      }
    })
}

function viewAllData(column, tableName) {

  connection.query("SELECT " + column + " FROM " + tableName, function (err, results) {

    if (err) throw err;

    console.table(results)
    otherAction()
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
            "SELECT title, salary, department_name FROM roles INNER JOIN departments ON roles.department_id = departments.id", function (err, results) {

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

              departmentArr.push(results[i].department_name)
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

              connection.query("SELECT id FROM departments WHERE department_name = ?", [response.roleDepName], function (err, depId) {

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

          connection.query("SELECT title FROM roles", function (err, results) {

            if (err) throw err;

            inquirer.prompt({

              type: "list",
              name: "deleteChoice",
              message: "Which role would you like to delete?",
              choices: function () {

                let roleArr = []

                for (i = 0; i < results.length; i++) {

                  roleArr.push(results[i].title)
                }
                return roleArr
              }
            }).then(function (choice) {

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
    .prompt({

      type: "list",
      name: "employeeAction",
      message: "What would you like to do in the employees section?",
      choices: ["View employees", "Update an existing employee", "Add a new employee", "Delete an employee"]
    }).then(function (userChoice) {

      switch (userChoice.employeeAction) {

        case "View employees":

          inquirer
            .prompt({

              type: "list",
              name: "viewChoice",
              message: "Which employees would you like to view?",
              choices: ["All employees", "Employees under a specific manager"]
            }).then(function (viewOption) {

              switch (viewOption.viewChoice) {

                case "All employees":

                  connection.query("SELECT first_name, last_name, salary, title, department_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id", function (err, results) {

                    if (err) throw err;

                    console.table(results)
                    otherAction()
                  })

                  break;

                case "Employees under a specific manager":

                  connection.query("SELECT employees.id, first_name, last_name, salary, title, department_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id WHERE title = 'Manager' OR title = 'Developer Manager' OR title = 'Director of Marketing' OR title = 'HR Manager'", function (err, managersReturned) {

                    if (err) throw err;

                    inquirer.prompt({

                      type: "list",
                      name: "managerTeam",
                      message: "Which manager's team would you like to view?",
                      choices: function () {

                        let managerArr = []

                        for (i = 0; i < managersReturned.length; i++) {

                          managerArr.push(managersReturned[i].first_name + " " + managersReturned[i].last_name);
                        }
                        return managerArr
                      }
                    }).then(function (managerChoice) {

                      let nameArr = managerChoice.managerTeam.split(" ")
                      connection.query("SELECT id from employees WHERE first_name = ? AND last_name = ?", nameArr, function (err, data) {

                        if (err) throw err;

                        connection.query("SELECT first_name, last_name, salary, title, department_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id WHERE employees.manager_id = ?", data[0].id, function (err, employeeList) {

                          if (err) throw err;

                          console.table(employeeList)
                          otherAction()
                        })
                      })
                    })
                  })

                  break;
              }
            })

          break;

        case "Update an existing employee":

          connection.query("SELECT first_name, last_name FROM employees", function (err, results) {

            if (err) throw err;

            inquirer.prompt({

              type: "list",
              name: "chosenEmployee",
              message: "Which employee would you like to update?",
              choices: function () {

                let nameArr = []
                for (i = 0; i < results.length; i++) {

                  nameArr.push(results[i].first_name + " " + results[i].last_name)
                }

                return nameArr
              }
            }).then(function (chosenName) {

              inquirer.prompt({
                type: "list",
                name: "fieldToEdit",
                message: "What would you like to edit?",
                choices: ["first name", "last name", "role", "manager"]
              }).then(function (editChoice) {

                let chosenNameArr = chosenName.chosenEmployee.split(" ")
                switch (editChoice.fieldToEdit) {

                  case "first name":

                    inquirer.prompt({

                      type: "input",
                      name: "fNameEdit",
                      message: "What should the name be?",
                    }).then(function (givenFName) {

                      connection.query("UPDATE employees SET ? WHERE ? and ?", [{ first_name: givenFName.fNameEdit }, { first_name: chosenNameArr[0] }, { last_name: chosenNameArr[1] }], function (err) {

                        if (err) throw err;

                        console.log("The employee's last name has been updated!")
                        otherAction()
                      })
                    })

                    break;

                  case "last name":

                    inquirer.prompt({

                      type: "input",
                      name: "lNameEdit",
                      message: "What should the name be?",
                    }).then(function (givenLName) {

                      connection.query("UPDATE employees SET ? WHERE ? and ?", [{ last_name: givenLName.lNameEdit }, { first_name: chosenNameArr[0] }, { last_name: chosenNameArr[1] }], function (err) {

                        if (err) throw err;

                        console.log("The employee's last name has been updated!")
                        otherAction()
                      })
                    })

                    break;

                  case "role":

                    connection.query("SELECT first_name, last_name, title, department_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id WHERE ? and ?", [{ first_name: chosenNameArr[0] }, { last_name: chosenNameArr[1] }], function (err, allData) {


                      if (err) throw err;

                      connection.query("SELECT title FROM roles WHERE title != ?", [allData[0].title], function (err, remainingTitles) {

                        if (err) throw err;

                        inquirer.prompt({
                          type: "list",
                          name: "changedRole",
                          message: "What role should this employee now have?",
                          choices: function () {

                            let newRoleArr = []

                            for (i = 0; i < remainingTitles.length; i++) {

                              newRoleArr.push(remainingTitles[i].title)
                            }
                            return newRoleArr
                          }
                        }).then(function (roleChoice) {

                          connection.query("SELECT id FROM roles WHERE title = ?", [roleChoice.changedRole], function (err, newRoleId) {

                            if (err) throw err;

                            connection.query("UPDATE employees SET ? WHERE ? AND ?", [{ role_id: newRoleId[0].id }, { first_name: chosenNameArr[0] }, { last_name: chosenNameArr[1] }], function (err) {

                              if (err) throw err;

                              console.log(chosenNameArr[0] + " " + chosenNameArr[1] + "'s role has been changed!")
                              otherAction()
                            })
                          })
                        })
                      })
                    })

                    break;

                  case "manager":

                    connection.query("SELECT manager_id FROM employees WHERE ? AND ?", [{ first_name: chosenNameArr[0] }, { last_name: chosenNameArr[1] }], function (err, currentManager) {

                      if (err) throw err;
                      console.log(currentManager[0].manager_id)

                      connection.query("SELECT employees.id, first_name, last_name, salary, title, department_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id WHERE employees.id != ? AND title = 'Manager' OR employees.id != ? AND title = 'Developer Manager' OR employees.id != ? AND title = 'Director of Marketing' OR employees.id != ? AND title = 'HR Manager'", [parseInt(currentManager[0].manager_id), parseInt(currentManager[0].manager_id), parseInt(currentManager[0].manager_id), parseInt(currentManager[0].manager_id)], function (err, remainingManagers) {

                        if (err) throw err;
                        console.log(remainingManagers)

                        inquirer.prompt({
                          type: "list",
                          name: "newManager",
                          message: "Who should this employee's new manager be?",
                          choices: function () {

                            let newManagerArr = [];

                            for (i = 0; i < remainingManagers.length; i++) {

                              newManagerArr.push(remainingManagers[i].first_name + " " + remainingManagers[i].last_name)
                            }

                            return newManagerArr
                          }
                        }).then(function (response) {

                          let newManagerName = response.newManager.split(" ")

                          connection.query("SELECT id, first_name, last_name FROM employees WHERE ? AND ?", [{ first_name: newManagerName[0] }, { last_name: newManagerName[1] }], function (err, newManagerInfo) {

                            if (err) throw err;

                            connection.query("UPDATE employees SET manager_id = ? WHERE first_name = ? AND last_name = ?", [parseInt(newManagerInfo[0].id), chosenNameArr[0], chosenNameArr[1]], function (err) {

                              if (err) throw err;

                              console.log(chosenNameArr[0] + " " + chosenNameArr[1] + "'s manager has been changed!")
                              otherAction()
                            })
                          })
                        })
                      })
                    })

                    break;
                }
              })
            })
          })

          break;

        case "Add a new employee":

          inquirer
            .prompt([

              {
                type: "input",
                name: "fName",
                message: "What is this employee's first name?"
              },
              {
                type: "input",
                name: "lName",
                message: "What is this employee's last name?"
              }
            ]).then(function (names) {

              connection.query("SELECT title FROM roles", function (err, potentialRoles) {

                if (err) throw err;

                inquirer.prompt({

                  type: "list",
                  name: "chosenRole",
                  message: "What is this employee's role?",
                  choices: function () {

                    let possRolesArr = []

                    for (i = 0; i < potentialRoles.length; i++) {

                      possRolesArr.push(potentialRoles[i].title)
                    }

                    return possRolesArr
                  }
                }).then(function (roleDecision) {

                  connection.query("SELECT id FROM roles WHERE title = ?", [roleDecision.chosenRole], function (err, roleId) {

                    if (err) throw err;

                    console.log(roleId.id)
                    connection.query("SELECT employees.id, first_name, last_name, salary, title, department_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id WHERE title = 'Manager' OR title = 'Developer Manager' OR title = 'Director of Marketing' OR title = 'HR Manager'", function (err, managerList) {

                      if (err) throw err;

                      inquirer.prompt({

                        type: "list",
                        name: "assignedManager",
                        message: "Who is this employee's manager?",
                        choices: function () {

                          let assignedManagerArr = ["none"]

                          for (i = 0; i < managerList.length; i++) {

                            assignedManagerArr.push(managerList[i].first_name + " " + managerList[i].last_name)
                          }

                          return assignedManagerArr
                        }
                      }).then(function (givenManager) {

                        if (givenManager.assignedManager === "none") {

                          givenManager.assignedManager = null

                          connection.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)", [names.fName, names.lName, roleId[0].id, givenManager.assignedManager], function (err) {

                            if (err) throw err;

                            console.log("New employee added!")
                            otherAction()
                          })
                        } else {

                          let assignedManagerName = givenManager.assignedManager.split(" ")

                          connection.query("SELECT employees.id, first_name, last_name department_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id WHERE title = 'Manager' OR title = 'Developer Manager' OR title = 'Director of Marketing' OR title = 'HR Manager' AND first_name = ? AND last_name = ?", [assignedManagerName[0], assignedManagerName[1]], function (err, assignedManagerId) {

                            if (err) throw err;

                            connection.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)", [names.fName, names.lName, roleId[0].id, assignedManagerId[0].id], function (err) {

                              if (err) throw err;

                              console.log("New employee added!")
                              otherAction()
                            })
                          })
                        }
                      })
                    })
                  })
                })
              })
            })

          break;

        case "Delete an employee":

          connection.query("SELECT first_name, last_name FROM employees", function(err, employeeList){

            if(err) throw err 

            inquirer.prompt({

              type: "list",
              name: "employeeToDelete",
              message: "Which employee would you like to delete?",
              choices: function () {

                let employeesArr = []

                for(i = 0; i < employeeList.length; i++) {

                  employeesArr.push(employeeList[i].first_name + " " + employeeList[i].last_name)
                }

                return employeesArr
              }
            }).then(function(employeeChosen) {

              let employeeName = employeeChosen.employeeToDelete.split(" ")

              connection.query("DELETE FROM employees WHERE ? AND ?", [{first_name: employeeName[0]}, {last_name: employeeName[1]}], function(err) {

                if(err) throw err;

                console.log (employeeName[0] + " " + employeeName[1] + " has been deleted!")
                otherAction()
              })
            })
          })
      }
    })
}

function manageDepartments() {

  inquirer
    .prompt([

      {
        type: "list",
        name: "departmentAction",
        message: "Would you like to view, add, or delete departments?",
        choices: ["View departments", "Add departments", "Delete departments"]
      }
    ]).then(function(actionChoice){

      switch (actionChoice.departmentAction) {

        case "View departments":

          viewAllData("department_name", "departments");
          break;
        
        case "Add departments":

          inquirer.prompt({

            type: "input",
            name: "departmentName",
            message: "What should this department be called?"
          }).then(function(assignedName){

            connection.query("INSERT INTO departments (department_name) VALUE (?)", [assignedName.departmentName], function(err){

              if(err) throw err;

              console.log("The " + assignedName.departmentName + " department has been added!")
              otherAction()
            })
          })

          break;

        case "Delete departments":

          connection.query("SELECT department_name from departments", function(err, allDepartments) {

            if(err) throw err;

            inquirer.prompt({

              type: "list",
              name: "departmentName",
              message: "Which department should be deleted?",
              choices: function () {

                let departmentArr = []

                for (i = 0; i < allDepartments.length; i++) {

                  departmentArr.push(allDepartments[i].department_name)
                }

                return departmentArr
              }
            }).then(function(departmentToDelete){

              connection.query("DELETE FROM departments WHERE department_name = ?", [departmentToDelete.departmentName], function(err) {

                if(err) throw err;

                console.log("The " + departmentToDelete.departmentName + " department has been deleted!")
                otherAction()
              })
            })
          })

          break;
      }
    })

}