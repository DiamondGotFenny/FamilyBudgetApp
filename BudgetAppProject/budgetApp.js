//The Budget Control Module****************************************************************************************
var BudgetController = (function () {
  
    var Income = function (des,val,id) {
        this.description = des;
        this.value = val;
        this.id = id;
    }

    var Expense = function (des, val, id) {
        this.description = des;
        this.value = val;
        this.id = id;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome) {
            this.percentage =Math.round( this.value / totalIncome * 100) ;
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        })
        data.totals[type] = sum;
    };

    //data structure that store items and values
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc:0
        },
        budget: 0,
        Budgetpercentage:-1 
    }


    return {
        addItem: function (type, description,value) {
             var newItem, ID;
             //if it is the very first item, its ID is 0; if it is sencond item, its ID=0+1;
            if (data.allItems[type].length > 0) {
                 ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //create new item base on type
            if (type === 'inc') {
                newItem = new Income(description, value, ID);
            } else if (type === 'exp') {
                newItem = new Expense(description, value, ID);
            }
             //push it to our data structure
             data.allItems[type].push(newItem);
            console.log(data.allItems[type]);
             //return the new element 
             return newItem;
        },

        calculateBudget: function () {           
           //calculate total
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate budget(surplus)
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if (data.totals.inc>0) {
                data.Budgetpercentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.Budgetpercentage = -1;
            }
        },

        getBudget: function () {
            return {
               totalIncome: data.totals.inc,
               totalExpense: data.totals.exp,
               Budget: data.budget,
               Percentage: data.Budgetpercentage
            }
        },

         deleteItem : function (type, id) {
             var ids, idIndex;
             ids = data.allItems[type].map(function (current) {
                 return current.id;
             });
             idIndex = ids.indexOf(id);
             if (idIndex !== -1) {
                 data.allItems[type].splice(idIndex, 1);
             }
             console.log(data.allItems[type]);
        },

        CalculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calculatePercentage(data.totals.inc);
            });           
        },

        getPercentages: function () {
            var allPec = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            })
            return allPec;
        }

    }
})();


//The UI Control Module****************************************************************************************
var UIController = (function () {
    var html, newHtml, element;   

   var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
       addButton: ".add__btn",
       incomeContainer: ".income__list",
       expenseContainer: ".expenses__list",
       budgetValue: ".budget__value",
       budgetIncValue: '.budget__income--value',
       budgetExpValue: '.budget__expenses--value',
       budgetPercetage: '.budget__expenses--percentage',
       container: '.container',
       incomeList: '.income__list',
       expenseList: '.expenses__list',
       itemDeleteBtn: '.item__delete--btn',
       item: '.item',
       itemPercentage: '.item__percentage',
       dateLabel: '.budget__title--month',
       inputType:'.add__type'
    };

    var formatNumber = function (nnum, type) {
        var numSplit;
        nnum = Math.abs(nnum);        
        nnum = nnum.toFixed(2);
        numSplit = nnum.split('.');
        var newInt = numSplit[0];
        if (newInt.length > 3) {
            newInt = newInt.substr(0, newInt.length - 3) + ',' + newInt.substr(newInt.length - 3, 3);
        }
        var newDec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + newInt + '.' + newDec;
    };

    var nodesForeach = function (list, callBack) {
        for (var i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    }

    return {
        getDOMStrings: function () {
            return DOMstrings;
        },

        getInput: function () {
            //code for test
            //var des, val, ty;
            //var num = Math.floor(Math.random() * 3) + 0;
            //if (num === 0) {
            //    des = 'a';
            //    val = 200.3;
            //    ty = 'inc';
            //} else if (num === 1) {
            //    des = 'b';
            //    val = 100.6;
            //    ty = 'inc';
            //} else if (num === 2) {
            //    des = 'c';
            //    val = 200.2;
            //    ty = 'exp';
            //}
            //code for test

            return {
                
                 //the actual input code
                description : document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat( document.querySelector(DOMstrings.inputValue).value),
                type: document.querySelector(DOMstrings.inputType).value
               

                //the code for test
                //description: des,
                //value: val,
                //type: ty
                //code for test

            }
        },

        //add item to the item list conlumn base on tyep
        addListItem: function (obj, type) {
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%0%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">%value%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn">' +
                    '<i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>'
            } else {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%0%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">%value%</div>' +
                    '<div class="item__percentage">21%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>'
            }

            //replace the html placeholder text with some actual data
            newHtml = html.replace('%0%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            //insert the new html to the inc or exp container beforeend;
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearField: function () {
            var field, fieldArr;

            field = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //we don't have to turn the field into fieldArr here, we can still use forEach with field;
            //just for demostration purpose here.
            fieldArr = Array.prototype.slice.call(field);
            fieldArr.forEach(function (current) {
                current.value = '';
            });

            fieldArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.Budget > 0 ? type = 'inc' : type = 'exp'; 
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.Budget, type);
            document.querySelector(DOMstrings.budgetIncValue).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.budgetExpValue).textContent = formatNumber(obj.totalExpense, 'exp');

            if (obj.Percentage > 0) {
                document.querySelector(DOMstrings.budgetPercetage).textContent = obj.Percentage + ' %';
            } else {
                document.querySelector(DOMstrings.budgetPercetage).textContent = '';
            }
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayPercentages: function (percentages) {
            var itemNodes = document.querySelectorAll(DOMstrings.itemPercentage);
            
            nodesForeach(itemNodes, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, months, month, year;
             now= new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            var fields = document.querySelectorAll(DOMstrings.inputType + ','
                + DOMstrings.inputValue + ',' + DOMstrings.inputDescription);

            nodesForeach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.addButton).classList.toggle('red')          

        },

        getDOMStrings: function () {
            return DOMstrings;
        }

    }
})();


//The Controller Module****************************************************************************************
var Controller = (function (budgetCtrl, UIctrl) {
    
    //1. add event listeners
    var setupEventListenser = function () {

        var DOM = UIctrl.getDOMStrings();

        //event listner for confirm input button
        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })

        //event listener for delete item button
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
    }

    var ctrlAddItem = function () {
        var inputValues, newItem;
        //2. get input values from UI Controller
         inputValues = UIctrl.getInput();

        if (inputValues.description!==""&&inputValues.value>0) {
            //3. send the input value object to budget controller
            newItem = budgetCtrl.addItem(inputValues.type, inputValues.description, inputValues.value);

        //4. add new item to the list
           UIctrl.addListItem(newItem, inputValues.type);

         //5. clear the input field after value is entered
            UIctrl.clearField();

        //6. calculate and display budget
            updateBudget();

            //calculate item percentage
            updatePercentages();
        }

       
    }
    
    var updateBudget = function () {
        var budget;
        //1. calculate budget
        budgetCtrl.calculateBudget();
        //2. return the budget
        budget = budgetCtrl.getBudget();
        //3. display the budget on UI
        UIctrl.displayBudget(budget);
    }

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID =parseInt (splitID[1]);

             //1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            //2.delete item from item list and update UI
            UIctrl.deleteListItem(itemID)
            //3. update budget
            updateBudget();

            //update percentage
            updatePercentages();
        }       
    }

    var updatePercentages = function () {
        //1. calculate percentage
        budgetCtrl.CalculatePercentages();
        //2. get percentages
        var percentages = budgetCtrl.getPercentages();
        //3. display percentages
        UIctrl.displayPercentages(percentages);
    }

    return {
        //initialize the app when the page loaded.
        init: function () {
            console.log("app start");
            UIctrl.displayMonth();
            UIctrl.displayBudget({
                totalIncome: 0,
                totalExpense: 0,
                Budget: 0,
                Percentage: 0
            })
            setupEventListenser();
        }
    }
})(BudgetController, UIController);

Controller.init();